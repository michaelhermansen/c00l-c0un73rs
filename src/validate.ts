import { MAX_ALLOWED_DOMAINS, parseAllowedDomains } from './domain-lock'
import { MAX_MIN_DIGITS, MIN_MIN_DIGITS } from './render'
import type { CounterState } from './store'
import { themes } from './themes'

export const MAX_CSS_LENGTH = 10_000
export const MAX_COUNT = 999_999_999_999
export const MAX_ALLOWED_DOMAINS_LENGTH = 1000

type Validation = { ok: true; changes: Partial<CounterState> } | { ok: false; error: string }

function isIntegerBetween(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}

export function validateCounterInput(input: unknown): Validation {
  if (typeof input !== 'object' || input === null) return { ok: false, error: 'body must be a json object' }
  const { theme, css, minDigits, count, allowedDomains } = input as Record<string, unknown>
  const changes: Partial<CounterState> = {}

  if (theme !== undefined) {
    if (typeof theme !== 'string' || !Object.hasOwn(themes, theme)) return { ok: false, error: 'unknown theme' }
    changes.theme = theme
  }
  if (css !== undefined) {
    if (typeof css !== 'string' || css.length > MAX_CSS_LENGTH) {
      return { ok: false, error: `css must be a string of at most ${MAX_CSS_LENGTH} characters` }
    }
    changes.css = css
  }
  if (minDigits !== undefined) {
    if (!isIntegerBetween(minDigits, MIN_MIN_DIGITS, MAX_MIN_DIGITS)) {
      return { ok: false, error: `minDigits must be an integer from ${MIN_MIN_DIGITS} to ${MAX_MIN_DIGITS}` }
    }
    changes.minDigits = minDigits
  }
  if (count !== undefined) {
    if (!isIntegerBetween(count, 0, MAX_COUNT)) return { ok: false, error: 'count must be a non-negative integer' }
    changes.count = count
  }
  if (allowedDomains !== undefined) {
    const parsed =
      typeof allowedDomains === 'string' && allowedDomains.length <= MAX_ALLOWED_DOMAINS_LENGTH ? parseAllowedDomains(allowedDomains) : null
    if (parsed === null) return { ok: false, error: `allowedDomains must be at most ${MAX_ALLOWED_DOMAINS} domain names like example.com` }
    changes.allowedDomains = parsed
  }

  return { ok: true, changes }
}
