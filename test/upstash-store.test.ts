import { afterEach, expect, it } from 'bun:test'
import { createUpstashStore } from '../src/upstash-store'

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

function stubRedisResult(result: unknown) {
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.invalid'
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
  const commands: unknown[][] = []
  globalThis.fetch = (async (url: unknown, init: { body: string }) => {
    const body = JSON.parse(init.body)
    // the client batches some commands into one pipeline request
    if (String(url).endsWith('/pipeline')) {
      commands.push(...body)
      return Response.json(body.map(() => ({ result })))
    }
    commands.push(body)
    return Response.json({ result })
  }) as unknown as typeof fetch
  return commands
}

const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60

it('reads a stored counter from the flat field list redis returns', async () => {
  stubRedisResult(['tokenHash', 'abc', 'theme', 'lcd', 'css', '{"not":"json"}', 'minDigits', '6', 'count', '42'])

  const counter = await createUpstashStore().get('some-id')

  expect(counter).toEqual({ tokenHash: 'abc', theme: 'lcd', css: '{"not":"json"}', minDigits: 6, count: 42, allowedDomains: '' })
})

it('returns null for a counter that does not exist', async () => {
  stubRedisResult([])

  expect(await createUpstashStore().get('missing')).toBeNull()
})

it('gives a new counter a year to live', async () => {
  const commands = stubRedisResult(1)

  await createUpstashStore().create('some-id', { tokenHash: 'abc', theme: 'lcd', css: '', minDigits: 6, count: 0, allowedDomains: '' })

  expect(commands).toContainEqual(['expire', 'counter:some-id', ONE_YEAR_IN_SECONDS])
})

it('renews the year to live on every visit and passes the visiting host along', async () => {
  const commands = stubRedisResult([1, 'lcd', '', '6', 'counted'])

  const visit = await createUpstashStore().visit('some-id', 'example.com')

  const [command, script, keyCount, key, ttl, visitorHost] = commands[0]
  expect(command).toBe('eval')
  expect(script).toContain("redis.call('EXPIRE', KEYS[1], ARGV[1])")
  expect([keyCount, key, ttl, visitorHost]).toEqual([1, 'counter:some-id', String(ONE_YEAR_IN_SECONDS), 'example.com'])
  expect(visit).toEqual({ counter: { count: 1, theme: 'lcd', css: '', minDigits: 6 }, access: 'counted' })
})

it('renews the year to live when a counter is edited', async () => {
  const commands = stubRedisResult(1)

  await createUpstashStore().update('some-id', { theme: 'neon' })

  expect(commands).toContainEqual(['expire', 'counter:some-id', ONE_YEAR_IN_SECONDS])
})
