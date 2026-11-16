import { Redis } from '@upstash/redis'
import type { Access } from './domain-lock'
import type { CounterState, CounterStore, StoredCounter } from './store'

// counters nobody loads for this long are dropped by redis
const INACTIVE_TTL_SECONDS = 365 * 24 * 60 * 60

// one round trip per visit, and unknown ids never create keys
// the access rules mirror accessFor in domain-lock.ts
const VISIT_SCRIPT = `
if redis.call('EXISTS', KEYS[1]) == 0 then return false end
local allowed = redis.call('HGET', KEYS[1], 'allowedDomains') or ''
local host = ARGV[2]
local access = 'counted'
if allowed ~= '' then
  access = host == '' and 'shown' or 'locked'
  for domain in string.gmatch(allowed, '%S+') do
    if host == domain or string.sub(host, -(#domain + 1)) == '.' .. domain then access = 'counted' end
  end
end
local count
if access == 'counted' then
  count = redis.call('HINCRBY', KEYS[1], 'count', 1)
else
  count = tonumber(redis.call('HGET', KEYS[1], 'count'))
end
if access ~= 'locked' then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local config = redis.call('HMGET', KEYS[1], 'theme', 'css', 'minDigits')
return { count, config[1], config[2], config[3], access }
`

const keyFor = (id: string) => `counter:${id}`

function toFields(changes: Partial<StoredCounter>): Record<string, string> {
  return Object.fromEntries(Object.entries(changes).map(([field, value]) => [field, String(value)]))
}

// with automaticDeserialization off, hgetall replies as [field, value, field, value, ...]
function toRecord(flatFields: string[]): Record<string, string> {
  const record: Record<string, string> = {}
  for (let i = 0; i < flatFields.length; i += 2) record[flatFields[i]] = flatFields[i + 1]
  return record
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
      await Promise.all([redis.hset(keyFor(id), toFields(counter)), redis.expire(keyFor(id), INACTIVE_TTL_SECONDS)])
      return true
    },
    async visit(id, visitorHost) {
      const result = (await redis.eval(VISIT_SCRIPT, [keyFor(id)], [String(INACTIVE_TTL_SECONDS), visitorHost ?? ''])) as
        | [number, string, string, string, Access]
        | null
      if (!result) return null
      const [count, theme, css, minDigits, access] = result
      return { counter: { count: Number(count), theme, css: css ?? '', minDigits: Number(minDigits) }, access }
    },
    async get(id) {
      const fields = toRecord(((await redis.hgetall(keyFor(id))) as unknown as string[] | null) ?? [])
      if (!fields.tokenHash) return null
      return {
        count: Number(fields.count),
        theme: fields.theme,
        css: fields.css ?? '',
        minDigits: Number(fields.minDigits),
        allowedDomains: fields.allowedDomains ?? '',
        tokenHash: fields.tokenHash,
      }
    },
    async update(id, changes: Partial<CounterState>) {
      const fields = toFields(changes)
      if (Object.keys(fields).length === 0) return
      await Promise.all([redis.hset(keyFor(id), fields), redis.expire(keyFor(id), INACTIVE_TTL_SECONDS)])
    },
  }
}
