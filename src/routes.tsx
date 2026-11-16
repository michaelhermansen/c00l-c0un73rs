import { Hono } from 'hono'
import type { Context } from 'hono'
import { EditorPage } from './pages/editor-page.tsx'
import { HomePage } from './pages/home-page.tsx'
import { NotFoundPage } from './pages/not-found-page.tsx'
import { DEFAULT_MIN_DIGITS, MAX_MIN_DIGITS, renderCounter } from './render.ts'
import { SITE_COUNTER_ID } from './site-counter.ts'
import type { CounterStore } from './store.ts'
import { defaultTheme, themes } from './themes/index.ts'
import { generateId, generateToken, hashToken } from './token.ts'
import { validateCounterInput } from './validate.ts'

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

async function readJson(c: Context): Promise<unknown> {
  return c.req.json().catch(() => null)
}

async function isValidToken(c: Context, tokenHash: string): Promise<boolean> {
  const token = c.req.header('Authorization')?.replace(/^Bearer /, '')
  if (!token) return false
  return (await hashToken(token)) === tokenHash
}

async function startSiteCounter(store: CounterStore) {
  // the token is thrown away, so nobody can edit the site's own counter
  const tokenHash = await hashToken(generateToken())
  await store.create(SITE_COUNTER_ID, { theme: defaultTheme.name, css: '', minDigits: MAX_MIN_DIGITS, count: 0, tokenHash })
  return store.hit(SITE_COUNTER_ID)
}

export function createApp(getStore: () => CounterStore) {
  const app = new Hono()

  app.notFound((c) => c.html(<NotFoundPage />, 404))

  app.get('/', (c) => c.html(<HomePage />))

  app.get('/edit/:id/:token', async (c) => {
    const { id, token } = c.req.param()
    const counter = await getStore().get(id)
    if (!counter || (await hashToken(token)) !== counter.tokenHash) return c.html(<NotFoundPage />, 404)
    return c.html(<EditorPage counterId={id} />)
  })

  app.get('/c/:file', async (c) => {
    const id = c.req.param('file').replace(/\.svg$/, '')
    const counter = (await getStore().hit(id)) ?? (id === SITE_COUNTER_ID ? await startSiteCounter(getStore()) : null)
    if (!counter) return c.text('counter not found', 404)
    const theme = themes[counter.theme] ?? defaultTheme
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
    const { tokenHash, ...publicState } = counter
    return c.json(publicState)
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
