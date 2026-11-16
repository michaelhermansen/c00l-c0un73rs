export type Access = 'counted' | 'shown' | 'locked'

export const MAX_ALLOWED_DOMAINS = 10

export function hostOf(url: string | undefined): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname || null
  } catch {
    return null
  }
}

// keep in step with the lua copy in upstash-store.ts
export function accessFor(allowedDomains: string, visitorHost: string | null): Access {
  if (!allowedDomains) return 'counted'
  if (!visitorHost) return 'shown'
  const isAllowed = allowedDomains.split(' ').some((domain) => visitorHost === domain || visitorHost.endsWith(`.${domain}`))
  return isAllowed ? 'counted' : 'locked'
}

function normalizeDomain(entry: string): string | null {
  const withoutScheme = entry.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/^\*\./, '')
  const host = hostOf(`http://${withoutScheme}`)
  if (!host || !/^[a-z0-9-]+(\.[a-z0-9-]+)*$/.test(host)) return null
  // the bare domain already covers www
  return host.replace(/^www\./, '')
}

export function parseAllowedDomains(text: string): string | null {
  const entries = text.split(/[\s,]+/).filter(Boolean)
  if (entries.length > MAX_ALLOWED_DOMAINS) return null
  const domains = entries.map(normalizeDomain)
  if (domains.some((domain) => domain === null)) return null
  return [...new Set(domains)].join(' ')
}
