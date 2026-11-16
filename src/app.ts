import { Hono } from 'hono'
import { servePublicFiles } from './public-files'
import { createApp } from './routes'
import type { CounterStore } from './store'
import { createUpstashStore } from './upstash-store'

let store: CounterStore | undefined

const app = new Hono()
app.use('/*', servePublicFiles())
app.route('/', createApp(() => (store ??= createUpstashStore())))

export default app
