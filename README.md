# c00l c0un73rz

Visitor counters for web sites. Create a counter and embed it with an `<img>` tag that links back to the home page. It goes up by 1 on every page load. No accounts: each counter gets a secret edit link.

```html
<a href="https://<your-domain>/"
    ><img src="https://<your-domain>/c/<id>.svg" alt="visitor counter"
/></a>
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
