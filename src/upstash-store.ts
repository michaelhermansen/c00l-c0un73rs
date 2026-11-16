import { Redis } from '@upstash/redis'
import type { CounterState, CounterStore, StoredCounter } from './store'

// one round trip per hit, and unknown ids never create keys
const HIT_SCRIPT = `
if redis.call('EXISTS', KEYS[1]) == 0 then return false end
local count = redis.call('HINCRBY', KEYS[1], 'count', 1)
local config = redis.call('HMGET', KEYS[1], 'theme', 'css', 'minDigits')
return { count, config[1], config[2], config[3] }
`

const keyFor = (id: string) => `counter:${id}`

function toFields(changes: Partial<StoredCounter>): Record<string, string> {
  return Object.fromEntries(Object.entries(changes).map(([field, value]) => [field, String(value)]))
}

export function createUpstashStore(): CounterStore {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN
  if (!url || !token) throw new Error('missing upstash redis credentials in environment')

  // css is free text and must not be parsed as json
  const redis = new Redis({ url, token, automaticDeserialization: false })

  return {
    async create(id, counter) {
      const claimed = await redis.hsetnx(keyFor(id), 'tokenHash', counter.tokenHash)
      if (!claimed) return false
      await redis.hset(keyFor(id), toFields(counter))
      return true
    },
    async hit(id) {
      const result = (await redis.eval(HIT_SCRIPT, [keyFor(id)], [])) as [number, string, string, string] | null
      if (!result) return null
      const [count, theme, css, minDigits] = result
      return { count: Number(count), theme, css: css ?? '', minDigits: Number(minDigits) }
    },
    async get(id) {
      const fields = await redis.hgetall<Record<string, string>>(keyFor(id))
      if (!fields || !fields.tokenHash) return null
      return {
        count: Number(fields.count),
        theme: fields.theme,
        css: fields.css ?? '',
        minDigits: Number(fields.minDigits),
        tokenHash: fields.tokenHash,
      }
    },
    async update(id, changes: Partial<CounterState>) {
      const fields = toFields(changes)
      if (Object.keys(fields).length > 0) await redis.hset(keyFor(id), fields)
    },
  }
}
