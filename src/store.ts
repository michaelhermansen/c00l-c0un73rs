export type CounterConfig = {
  theme: string
  css: string
  minDigits: number
}

export type CounterState = CounterConfig & { count: number }

export type StoredCounter = CounterState & { tokenHash: string }

export interface CounterStore {
  create(id: string, counter: StoredCounter): Promise<boolean>
  hit(id: string): Promise<CounterState | null>
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
    async hit(id) {
      const counter = counters.get(id)
      if (!counter) return null
      counter.count += 1
      const { tokenHash, ...state } = counter
      return state
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
