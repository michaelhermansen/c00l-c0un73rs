import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { serveStatic } from 'hono/serve-static'

// node:fs instead of a runtime adapter so the same entry runs on bun, node and deno
export const servePublicFiles = () =>
  serveStatic({
    root: './public',
    join,
    getContent: async (path) => {
      try {
        return await readFile(path)
      } catch {
        return null
      }
    },
  })
