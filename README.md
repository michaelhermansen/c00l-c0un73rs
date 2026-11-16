# c00l c0un73rz

Old-school visitor counters for web sites. Create a counter, pick a theme (or write your own CSS), and embed it with an `<img>` tag that links back to the home page. It goes up by 1 on every page load. No accounts: each counter gets a secret edit link.

```html
<a href="https://<your-domain>/"><img src="https://<your-domain>/c/<id>.svg" alt="visitor counter" /></a>
```

## Run locally

Requires [Bun](https://bun.sh).

```bash
bun install
bun dev
```

Opens on http://localhost:3000 with an in-memory store, so counters reset when the server restarts.

```bash
bun test
bun run typecheck
```

## Add a theme

1. Copy a file in `src/themes/`, for example `lcd.ts`, and change the name, label, sizes and CSS.
2. Add it to `themeList` in `src/themes/index.ts`.

Themes and custom CSS style the same fixed SVG structure:

| Class                  | What it is                                         |
| ---------------------- | -------------------------------------------------- |
| `.frame`               | the outer box                                      |
| `.digit`               | one group per digit, with `data-value="0".."9"`    |
| `.digit-bg`            | box behind each digit                              |
| `.digit-text`          | the digit as text                                  |
| `.segments`            | 7-segment display, hidden unless shown             |
| `.seg.on` / `.seg.off` | lit and unlit segments (also `.seg-a` to `.seg-g`) |
| `.digit-shade`         | odometer-style shading, hidden unless shown        |

## Deploy

Can be deployed anywhere [Hono](https://hono.dev) runs: Vercel, Bun, Node, Deno, Cloudflare Workers, a container, and so on. Nothing in the code is tied to one host.

`src/app.ts` is the entry point. It stores counters in [Upstash Redis](https://upstash.com) over HTTPS and reads `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` (or `KV_REST_API_URL` / `KV_REST_API_TOKEN`, the names the Vercel Marketplace sets).

Depending on the host you may need to:

- wrap the app in a server adapter, for example `@hono/node-server` on Node.
- on Cloudflare Workers, turn on `nodejs_compat` so `process.env` works, and serve `public/` as static assets, since Workers have no disk to read it from.

`src/app.ts` serves `public/` itself, reading from `./public` relative to where the server starts. Hosts that serve static files on their own, like Vercel, keep doing so.

To use another database, implement the `CounterStore` interface in `src/store.ts`.

Not deployed yet, and the Upstash store is untested.

## Layout

```
src/app.ts            production entry (upstash store)
src/dev.ts            local entry (in-memory store)
src/public-files.ts   serves public/
src/routes.tsx        pages and api
src/render.ts         count + theme -> svg
src/store.ts          store interface + in-memory store
src/upstash-store.ts  redis store
src/themes/           one file per theme
public/               client script and styles
```
