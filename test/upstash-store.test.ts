import { afterEach, expect, it } from 'bun:test'
import { createUpstashStore } from '../src/upstash-store'

const realFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = realFetch
})

function stubRedisResult(result: unknown) {
  process.env.UPSTASH_REDIS_REST_URL = 'https://redis.invalid'
  process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token'
  globalThis.fetch = (async () => Response.json({ result })) as unknown as typeof fetch
}

it('reads a stored counter from the flat field list redis returns', async () => {
  stubRedisResult(['tokenHash', 'abc', 'theme', 'lcd', 'css', '{"not":"json"}', 'minDigits', '6', 'count', '42'])

  const counter = await createUpstashStore().get('some-id')

  expect(counter).toEqual({ tokenHash: 'abc', theme: 'lcd', css: '{"not":"json"}', minDigits: 6, count: 42 })
})

it('returns null for a counter that does not exist', async () => {
  stubRedisResult([])

  expect(await createUpstashStore().get('missing')).toBeNull()
})
