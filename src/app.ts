import { Hono } from 'hono'
import { servePublicFiles } from './public-files.ts'
import { createApp } from './routes.tsx'
import type { CounterStore } from './store.ts'
import { createUpstashStore } from './upstash-store.ts'

let store: CounterStore | undefined

const app = new Hono()
app.use('/*', servePublicFiles())
app.route('/', createApp(() => (store ??= createUpstashStore())))

export default app
