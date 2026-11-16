import { Hono } from 'hono'
import type { Context } from 'hono'
import { EditorPage } from './pages/editor-page'
import { LANGS, readLocale } from './i18n'
import { HomePage } from './pages/home-page'
import { NotFoundPage } from './pages/not-found-page'
import { accessFor, hostOf } from './domain-lock'
import { DEFAULT_MIN_DIGITS, MAX_MIN_DIGITS, renderCounter, renderLockedCounter } from './render'
import { SITE_COUNTER_ID } from './site-counter'
import type { CounterStore, Visit } from './store'
import { defaultTheme, themeList, themes } from './themes'
import { generateId, generateToken, hashToken } from './token'
import { validateCounterInput } from './validate'

const PREVIEW_COUNT = 1234567

const SVG_HEADERS = {
  'Content-Type': 'image/svg+xml; charset=utf-8',
  'Cache-Control': 'no-store',
  // only matters when the svg is opened directly instead of through <img>
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:",
  'X-Content-Type-Options': 'nosniff',
  'Cross-Origin-Resource-Policy': 'cross-origin',
}

function svgResponse(c: Context, svg: string) {
  return c.body(svg, 200, SVG_HEADERS)
}

function localeOf(c: Context) {
  return readLocale(c.req.url, c.req.header('x-vercel-ip-country'), c.req.header('accept-language'))
}

async function readJson(c: Context): Promise<unknown> {
  return c.req.json().catch(() => null)
}

async function isValidToken(c: Context, tokenHash: string): Promise<boolean> {
  const token = c.req.header('Authorization')?.replace(/^Bearer /, '')
  if (!token) return false
  return (await hashToken(token)) === tokenHash
}

function randomTheme() {
  return themeList[Math.floor(Math.random() * themeList.length)]
}

const NEW_SITE_COUNTER = { theme: defaultTheme.name, css: '', minDigits: MAX_MIN_DIGITS, allowedDomains: '', count: 0 }

async function startSiteCounter(store: CounterStore) {
  // the token is thrown away, so nobody can edit the site's own counter
  const tokenHash = await hashToken(generateToken())
  await store.create(SITE_COUNTER_ID, { ...NEW_SITE_COUNTER, tokenHash })
  return store.visit(SITE_COUNTER_ID, null)
}

// locked to whatever host serves it, so local, preview and production need no setup
async function visitSiteCounter(store: CounterStore, siteHost: string, visitorHost: string | null): Promise<Visit | null> {
  const access = accessFor(siteHost, visitorHost)
  if (access === 'counted') return (await store.visit(SITE_COUNTER_ID, null)) ?? startSiteCounter(store)
  return { counter: (await store.get(SITE_COUNTER_ID)) ?? NEW_SITE_COUNTER, access }
}

export function createApp(getStore: () => CounterStore) {
  const app = new Hono({ strict: false })

  app.notFound((c) => c.html(<NotFoundPage locale={localeOf(c)} />, 404))

  const langPrefixes = ['', ...LANGS.map((lang) => `/${lang}`)]

  app.on('GET', langPrefixes.map((prefix) => prefix || '/'), (c) =>
    c.html(<HomePage locale={localeOf(c)} siteCounterTheme={randomTheme()} />),
  )

  app.on('GET', langPrefixes.map((prefix) => `${prefix}/edit/:id/:token`), async (c) => {
    // paths built at runtime lose their param types
    const { id, token } = c.req.param() as { id: string; token: string }
    const locale = localeOf(c)
    const counter = await getStore().get(id)
    if (!counter || (await hashToken(token)) !== counter.tokenHash) return c.html(<NotFoundPage locale={locale} />, 404)
    return c.html(<EditorPage locale={locale} counterId={id} />)
  })

  app.get('/c/:file', async (c) => {
    const id = c.req.param('file').replace(/\.svg$/, '')
    const visitorHost = hostOf(c.req.header('Referer'))
    const visit =
      id === SITE_COUNTER_ID
        ? await visitSiteCounter(getStore(), new URL(c.req.url).hostname, visitorHost)
        : await getStore().visit(id, visitorHost)
    if (!visit) return c.text('counter not found', 404)
    if (visit.access === 'locked') return svgResponse(c, renderLockedCounter())
    const { counter } = visit
    // the front page picks the theme, so it can name the one it shows
    const theme =
      id === SITE_COUNTER_ID
        ? (themes[c.req.query('theme') ?? ''] ?? randomTheme())
        : (themes[counter.theme] ?? defaultTheme)
    return svgResponse(c, renderCounter(counter.count, theme, counter))
  })

  app.get('/preview.svg', (c) => {
    const theme = themes[c.req.query('theme') ?? ''] ?? defaultTheme
    return svgResponse(c, renderCounter(PREVIEW_COUNT, theme))
  })

  app.post('/api/preview', async (c) => {
    const validation = validateCounterInput(await readJson(c))
    if (!validation.ok) return c.json({ error: validation.error }, 400)
    const { theme, css, minDigits, count } = validation.changes
    return svgResponse(c, renderCounter(count ?? PREVIEW_COUNT, themes[theme ?? ''] ?? defaultTheme, { css, minDigits }))
  })

  app.post('/api/counters', async (c) => {
    const validation = validateCounterInput(await readJson(c))
    if (!validation.ok) return c.json({ error: validation.error }, 400)

    const token = generateToken()
    const counter = {
      theme: defaultTheme.name,
      css: '',
      minDigits: DEFAULT_MIN_DIGITS,
      allowedDomains: '',
      count: 0,
      ...validation.changes,
      tokenHash: await hashToken(token),
    }

    const id = generateId()
    const created = await getStore().create(id, counter)
    if (!created) return c.json({ error: 'id collision, try again' }, 503)
    return c.json({ id, token }, 201)
  })

  app.get('/api/counters/:id', async (c) => {
    const counter = await getStore().get(c.req.param('id'))
    if (!counter) return c.json({ error: 'counter not found' }, 404)
    const { tokenHash, allowedDomains, ...publicState } = counter
    // the domains tell where else the owner publishes, so only the owner gets them
    return c.json((await isValidToken(c, tokenHash)) ? { ...publicState, allowedDomains } : publicState)
  })

  app.get('/api/counters/:id/access', async (c) => {
    const counter = await getStore().get(c.req.param('id'))
    if (!counter) return c.json({ error: 'counter not found' }, 404)
    return c.json({ canEdit: await isValidToken(c, counter.tokenHash) })
  })

  app.put('/api/counters/:id', async (c) => {
    const id = c.req.param('id')
    const counter = await getStore().get(id)
    if (!counter) return c.json({ error: 'counter not found' }, 404)
    if (!(await isValidToken(c, counter.tokenHash))) return c.json({ error: 'invalid edit token' }, 401)

    const validation = validateCounterInput(await readJson(c))
    if (!validation.ok) return c.json({ error: validation.error }, 400)
    await getStore().update(id, validation.changes)
    return c.json({ ok: true })
  })

  return app
}
