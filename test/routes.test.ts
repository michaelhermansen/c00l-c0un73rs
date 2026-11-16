import { beforeEach, describe, expect, it } from 'bun:test'
import { createApp } from '../src/routes'
import { createMemoryStore } from '../src/store'
import { themeList } from '../src/themes'
import { MAX_CSS_LENGTH } from '../src/validate'

let app: ReturnType<typeof createApp>

const json = (method: string, body: unknown, headers: Record<string, string> = {}) => ({
  method,
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body),
})

async function createCounter(body: unknown = {}) {
  const response = await app.request('/api/counters', json('POST', body))
  return { response, ...((await response.json()) as { id: string; token: string }) }
}

beforeEach(() => {
  const store = createMemoryStore()
  app = createApp(() => store)
})

describe('counting', () => {
  it('increments by one on every load', async () => {
    const { id } = await createCounter({ minDigits: 4 })
    const first = await app.request(`/c/${id}.svg`)
    const second = await app.request(`/c/${id}.svg`)
    expect(await first.text()).toContain('aria-label="0001"')
    expect(await second.text()).toContain('aria-label="0002"')
  })

  it('starts from the chosen start value', async () => {
    const { id } = await createCounter({ count: 41, minDigits: 4 })
    expect(await (await app.request(`/c/${id}.svg`)).text()).toContain('aria-label="0042"')
  })

  it('serves an uncacheable svg', async () => {
    const { id } = await createCounter()
    const response = await app.request(`/c/${id}.svg`)
    expect(response.headers.get('Content-Type')).toContain('image/svg+xml')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('Content-Security-Policy')).toContain("default-src 'none'")
  })

  it('returns 404 for unknown counters', async () => {
    expect((await app.request('/c/nope.svg')).status).toBe(404)
  })

  it('does not count previews', async () => {
    const { id } = await createCounter({ minDigits: 4 })
    await app.request('/preview.svg?theme=lcd')
    await app.request('/api/preview', json('POST', { theme: 'neon', css: '.frame{fill:red}' }))
    expect(await (await app.request(`/c/${id}.svg`)).text()).toContain('aria-label="0001"')
  })
})

describe('domain lock', () => {
  const load = async (id: string, referer?: string) =>
    (await app.request(`/c/${id}.svg`, referer ? { headers: { Referer: referer } } : {})).text()

  it('counts on the allowed domain and its subdomains', async () => {
    const { id } = await createCounter({ minDigits: 4, allowedDomains: 'example.com' })
    expect(await load(id, 'https://example.com/')).toContain('aria-label="0001"')
    expect(await load(id, 'https://www.example.com/page')).toContain('aria-label="0002"')
  })

  it.each(['https://thief.test/', 'https://notexample.com/', 'https://example.com.thief.test/'])(
    'shows a locked image without counting on %s',
    async (referer) => {
      const { id } = await createCounter({ minDigits: 4, allowedDomains: 'example.com' })
      const svg = await load(id, referer)
      expect(svg).toContain('counter locked')
      expect(svg).not.toContain('aria-label="0001"')
      expect(await load(id, 'https://example.com/')).toContain('aria-label="0001"')
    },
  )

  it('shows the count without counting when the referrer is missing', async () => {
    const { id } = await createCounter({ minDigits: 4, count: 7, allowedDomains: 'example.com' })
    expect(await load(id)).toContain('aria-label="0007"')
    expect(await load(id, 'not a url')).toContain('aria-label="0007"')
    expect(await load(id, 'https://example.com/')).toContain('aria-label="0008"')
  })

  it('counts everywhere when no domains are set', async () => {
    const { id } = await createCounter({ minDigits: 4 })
    expect(await load(id, 'https://anywhere.test/')).toContain('aria-label="0001"')
    expect(await load(id)).toContain('aria-label="0002"')
  })

  it('stores pasted addresses as plain domains and shows them only to the owner', async () => {
    const { id, token } = await createCounter({ allowedDomains: 'https://www.Example.com/page, blog.example.org:8080\n*.example.net' })
    const state = async (headers: Record<string, string> = {}) =>
      (await (await app.request(`/api/counters/${id}`, { headers })).json()) as Record<string, unknown>
    expect((await state({ Authorization: `Bearer ${token}` })).allowedDomains).toBe('example.com blog.example.org example.net')
    expect(await state()).not.toHaveProperty('allowedDomains')
  })

  it('can be unlocked again', async () => {
    const { id, token } = await createCounter({ minDigits: 4, allowedDomains: 'example.com' })
    await app.request(`/api/counters/${id}`, json('PUT', { allowedDomains: '' }, { Authorization: `Bearer ${token}` }))
    expect(await load(id, 'https://thief.test/')).toContain('aria-label="0001"')
  })
})

describe('site counter', () => {
  const loadSiteCounter = async (referer?: string) =>
    (await app.request('http://site.test/c/site.svg', referer ? { headers: { Referer: referer } } : {})).text()

  it('starts itself on the first visit and counts from there', async () => {
    expect(await loadSiteCounter('http://site.test/')).toContain('aria-label="000000000001"')
    expect(await loadSiteCounter('http://site.test/no')).toContain('aria-label="000000000002"')
  })

  it('is locked to the site itself', async () => {
    expect(await loadSiteCounter('https://thief.test/')).toContain('counter locked')
    expect(await loadSiteCounter()).toContain('aria-label="000000000000"')
    await loadSiteCounter('http://site.test/')
    expect(await loadSiteCounter('https://thief.test/')).toContain('counter locked')
    expect(await loadSiteCounter()).toContain('aria-label="000000000001"')
  })

  it('shows a different theme from one load to the next', async () => {
    const stylesheets = new Set<string>()
    for (let load = 0; load < 60; load++) {
      const svg = await loadSiteCounter('http://site.test/')
      stylesheets.add(svg.slice(svg.indexOf('<style>'), svg.indexOf('</style>')))
    }
    expect(stylesheets.size).toBeGreaterThan(1)
  })

  it('is embedded on the front page with the theme it is named by', async () => {
    const html = await (await app.request('/no')).text()
    const themeName = html.match(/src="\/c\/site\.svg\?theme=([a-z0-9]+)"/)?.[1]
    const theme = themeList.find((candidate) => candidate.name === themeName)
    expect(theme).toBeDefined()
    expect(html).toContain(`Tema: ${theme!.label}`)
  })

  const stylesheetOf = (svg: string) => svg.slice(svg.indexOf('<style>'), svg.indexOf('</style>'))

  it('renders the theme the front page asks for', async () => {
    const graffiti = stylesheetOf(await (await app.request('/preview.svg?theme=graffiti')).text())
    const response = await app.request('http://site.test/c/site.svg?theme=graffiti', { headers: { Referer: 'http://site.test/' } })
    expect(stylesheetOf(await response.text())).toBe(graffiti)
  })

  it('ignores a theme in the url of other counters', async () => {
    const { id } = await createCounter({ theme: 'lcd' })
    const plain = stylesheetOf(await (await app.request(`/c/${id}.svg`)).text())
    expect(stylesheetOf(await (await app.request(`/c/${id}.svg?theme=graffiti`)).text())).toBe(plain)
  })
})

describe('creating', () => {
  it('defaults to nine digits', async () => {
    const { id } = await createCounter()
    expect(await (await app.request(`/c/${id}.svg`)).text()).toContain('aria-label="000000001"')
  })

  it('returns an id and a secret token', async () => {
    const { response, id, token } = await createCounter({ theme: 'neon' })
    expect(response.status).toBe(201)
    expect(id).toMatch(/^[a-z0-9]{8}$/)
    expect(token).toMatch(/^[0-9a-f]{32}$/)
  })

  it.each([
    ['unknown theme', { theme: 'does-not-exist' }],
    ['inherited object key as theme', { theme: 'constructor' }],
    ['too much css', { css: 'a'.repeat(MAX_CSS_LENGTH + 1) }],
    ['too many digits', { minDigits: 99 }],
    ['too few digits', { minDigits: 3 }],
    ['negative count', { count: -1 }],
    ['invalid domain', { allowedDomains: 'exa_mple.com' }],
    ['domains that are not text', { allowedDomains: ['example.com'] }],
    ['too many domains', { allowedDomains: Array.from({ length: 11 }, (_, i) => `site${i}.test`).join(' ') }],
  ])('rejects %s', async (_name, body) => {
    expect((await createCounter(body)).response.status).toBe(400)
  })
})

describe('editing', () => {
  it('requires the edit token', async () => {
    const { id } = await createCounter()
    const withoutToken = await app.request(`/api/counters/${id}`, json('PUT', { theme: 'neon' }))
    const wrongToken = await app.request(`/api/counters/${id}`, json('PUT', { theme: 'neon' }, { Authorization: 'Bearer wrong' }))
    expect(withoutToken.status).toBe(401)
    expect(wrongToken.status).toBe(401)
  })

  it('updates the counter with the right token', async () => {
    const { id, token } = await createCounter({ theme: 'lcd' })
    const response = await app.request(
      `/api/counters/${id}`,
      json('PUT', { theme: 'neon', css: '.frame { fill: hotpink; }' }, { Authorization: `Bearer ${token}` }),
    )
    expect(response.status).toBe(200)

    const state = (await (await app.request(`/api/counters/${id}`)).json()) as Record<string, unknown>
    expect(state).toMatchObject({ theme: 'neon', css: '.frame { fill: hotpink; }' })
    expect(await (await app.request(`/c/${id}.svg`)).text()).toContain('hotpink')
  })

  it('never exposes the token hash', async () => {
    const { id } = await createCounter()
    const state = (await (await app.request(`/api/counters/${id}`)).json()) as Record<string, unknown>
    expect(state).not.toHaveProperty('tokenHash')
  })
})

describe('access check', () => {
  it('tells whether a token can edit', async () => {
    const { id, token } = await createCounter()
    const check = async (headers: Record<string, string>) =>
      (await (await app.request(`/api/counters/${id}/access`, { headers })).json()) as { canEdit: boolean }
    expect((await check({ Authorization: `Bearer ${token}` })).canEdit).toBe(true)
    expect((await check({ Authorization: 'Bearer wrong' })).canEdit).toBe(false)
    expect((await check({})).canEdit).toBe(false)
  })

  it('returns 404 for unknown counters', async () => {
    expect((await app.request('/api/counters/nope/access')).status).toBe(404)
  })
})

describe('pages', () => {
  it('serves the front page with create and edit entry points', async () => {
    const html = await (await app.request('/')).text()
    expect(html).toContain('id="create-counter"')
    expect(html).toContain('id="open-counter-form"')
  })

  it('serves the edit page for a valid edit link', async () => {
    const { id, token } = await createCounter()
    const response = await app.request(`/edit/${id}/${token}`)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain(`data-counter-id="${id}"`)
  })

  it('gives the edit page every theme stylesheet', async () => {
    const { id, token } = await createCounter()
    const html = await (await app.request(`/edit/${id}/${token}`)).text()
    expect([...html.matchAll(/ data-css="/g)].length).toBe(themeList.length)
  })

  it('returns 404 for an edit link without the right key', async () => {
    const { id } = await createCounter()
    expect((await app.request(`/edit/${id}`)).status).toBe(404)
    expect((await app.request(`/edit/${id}/wrong`)).status).toBe(404)
  })

  it('serves norwegian to norwegian ip addresses and english to others', async () => {
    const page = async (country: string) =>
      (await app.request('/', { headers: { 'x-vercel-ip-country': country } })).text()
    expect(await page('NO')).toContain('<html lang="nb">')
    expect(await page('NO')).toContain('Lag en ny besøksteller')
    expect(await page('DE')).toContain('<html lang="en">')
    expect(await page('DE')).toContain('Create a new hit counter')
  })

  it('lets a language in the url win over the ip address', async () => {
    const html = await (await app.request('/en', { headers: { 'x-vercel-ip-country': 'NO' } })).text()
    expect(html).toContain('Create a new hit counter')
    expect(await (await app.request('/no')).text()).toContain('Lag en ny besøksteller')
  })

  it('links to the same page in the other language', async () => {
    const { id, token } = await createCounter()
    const html = await (await app.request(`/no/edit/${id}/${token}`)).text()
    expect(html).toContain('Lagre endringer')
    expect(html).toContain(`href="/en/edit/${id}/${token}"`)
    expect(html).toContain('data-lang-prefix="/no"')
  })

  it.each(['en', 'no'])('serves the edit page under /%s', async (lang) => {
    const { id, token } = await createCounter()
    const response = await app.request(`/${lang}/edit/${id}/${token}`)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('data-page="edit"')
  })

  it('points search engines to each language of a page', async () => {
    const html = await (await app.request('http://site.test/no')).text()
    expect(html).toContain('<link rel="alternate" hreflang="nb" href="http://site.test/no"/>')
    expect(html).toContain('<link rel="alternate" hreflang="en" href="http://site.test/en"/>')
    expect(html).toContain('<link rel="alternate" hreflang="x-default" href="http://site.test/"/>')
    expect(await (await app.request('/nope')).text()).not.toContain('hreflang="x-default"')
  })

  it('keeps edit pages out of search engines', async () => {
    const { id, token } = await createCounter()
    const editHtml = await (await app.request(`/edit/${id}/${token}`)).text()
    expect(editHtml).toContain('<meta name="robots" content="noindex"/>')
    expect(editHtml).not.toContain('rel="alternate"')
    expect(await (await app.request('/')).text()).not.toContain('noindex')
  })

  it('answers 404 pages in the language of the url', async () => {
    const response = await app.request('/no/nope')
    expect(response.status).toBe(404)
    expect(await response.text()).toContain('Ingenting her')
  })

  it.each(['/edit/doesnotexist/abc', '/edit', '/nope'])('returns a 404 page for %s', async (path) => {
    const response = await app.request(path)
    expect(response.status).toBe(404)
    expect(await response.text()).toContain('Nothing here')
  })
})
