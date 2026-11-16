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

describe('site counter', () => {
  it('starts itself on the first visit and counts from there', async () => {
    expect(await (await app.request('/c/site.svg')).text()).toContain('aria-label="000000000001"')
    expect(await (await app.request('/c/site.svg')).text()).toContain('aria-label="000000000002"')
  })

  it('is embedded on the front page', async () => {
    expect(await (await app.request('/')).text()).toContain('src="/c/site.svg"')
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

  it.each(['/edit/doesnotexist/abc', '/edit', '/nope'])('returns a 404 page for %s', async (path) => {
    const response = await app.request(path)
    expect(response.status).toBe(404)
    expect(await response.text()).toContain('Nothing here')
  })
})
