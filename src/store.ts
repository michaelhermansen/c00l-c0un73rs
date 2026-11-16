import { accessFor, type Access } from './domain-lock'

export type CounterConfig = {
  theme: string
  css: string
  minDigits: number
  // space separated, empty when the counter works on every site
  allowedDomains: string
}

export type CounterState = CounterConfig & { count: number }

export type StoredCounter = CounterState & { tokenHash: string }

export type Visit = { counter: Omit<CounterState, 'allowedDomains'>; access: Access }

export interface CounterStore {
  create(id: string, counter: StoredCounter): Promise<boolean>
  visit(id: string, visitorHost: string | null): Promise<Visit | null>
  get(id: string): Promise<StoredCounter | null>
  update(id: string, changes: Partial<CounterState>): Promise<void>
}

export function createMemoryStore(): CounterStore {
  const counters = new Map<string, StoredCounter>()

  return {
    async create(id, counter) {
      if (counters.has(id)) return false
      counters.set(id, { ...counter })
      return true
    },
    async visit(id, visitorHost) {
      const counter = counters.get(id)
      if (!counter) return null
      const access = accessFor(counter.allowedDomains, visitorHost)
      if (access === 'counted') counter.count += 1
      const { tokenHash, allowedDomains, ...state } = counter
      return { counter: state, access }
    },
    async get(id) {
      const counter = counters.get(id)
      return counter ? { ...counter } : null
    },
    async update(id, changes) {
      const counter = counters.get(id)
      if (counter) Object.assign(counter, changes)
    },
  }
}
