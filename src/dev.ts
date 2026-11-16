import { Hono } from 'hono'
import { servePublicFiles } from './public-files'
import { createApp } from './routes'
import { createMemoryStore } from './store'

const store = createMemoryStore()

const app = new Hono()
app.use('/*', servePublicFiles())
app.route('/', createApp(() => store))

export default {
  port: Number(process.env.PORT ?? 3000),
  fetch: app.fetch,
}
