# Stack — portfolio-v2

The technical stack of `qie.dev` / `baihaqie.com`. For the *visual / design* contract see [UI-STANDARDS.md](UI-STANDARDS.md) (governs `/`, admin, feedback) and [CINEMATIC.md](CINEMATIC.md) (governs `/experience`). For folder layout see [STRUCTURE.md](STRUCTURE.md).

---

## 1. Runtime

| Layer | Choice | Version |
|---|---|---|
| Node | `node:20-alpine` (Docker) | 20.x |
| Framework | **Nuxt** | `^4.4.2` |
| View | **Vue 3** | `^3.5.30` |
| Server | **Nitro** (bundled with Nuxt) | — |
| Database | **MySQL 8** (InnoDB, `utf8mb4_unicode_ci`) | 8.x |
| Driver | **mysql2/promise** | `^3.19.1` |
| Container | **Docker** + **docker-compose** | — |

The site is a single deployable Nuxt app. SSR is on for the public landing; **two routes are forced to client-only** via `routeRules` in [../nuxt.config.ts](../nuxt.config.ts):

- `/admin/preview` — reads a `localStorage`-backed preview store that doesn't exist on the server.
- `/experience` — the cinematic surface reads `window`/`document` (Three.js renderer, Lenis, GSAP ScrollTrigger) and DRACO loads from a CDN at runtime. Pre-rendering would error during SSR.

---

## 2. Dependencies (from [../package.json](../package.json))

| Package | Why |
|---|---|
| `nuxt` `^4.4.2` | App framework. |
| `vue` `^3.5.30` | View layer. Composition API only. |
| `vue-router` `^5.0.3` | Provided by Nuxt's router; pinned via the workspace. |
| `@nuxt/ui` `^3.3.7` | Base component primitives. Used selectively — design-system classes (`.btn`, `.card`) win over raw `UButton`/`UCard`. |
| `@nuxt/icon` `^2.2.1` | Icon component. `serverBundle: 'local'` in nuxt.config — keeps cold start fast and works offline. |
| `@iconify-json/fluent` `^1.2.40` | The **only** icon set. No other Iconify packs. |
| `@nuxtjs/google-fonts` `^3.2.0` | Loads Orbitron / DM Mono / Syne with `display: swap`. |
| `@vueuse/core` `^14.2.1` | Composables. Reach for these before writing custom ones. |
| `clsx` `^2.1.1` | Conditional class merge in `<script>`. In templates prefer `:class` arrays. |
| `mysql2` `^3.19.1` | DB driver, promise API, single shared pool. |
| `gsap` `^3.15.0` | Motion engine. Used by both surfaces: orchestrates the hero entrance on `/` and the entire scroll choreography on `/experience` (via `ScrollTrigger`). Pre-bundled in `vite.optimizeDeps`. |

**Cinematic surface (`/experience`) deps** — loaded only on that route:

| Package | Why |
|---|---|
| `three` `^0.184.0` | 3D scene runtime for the cinematic flight. Used directly (no TresJS wrapper) to match the Anatomy of Thrust patterns. |
| `@types/three` `^0.184.1` | Type definitions for `three`. |
| `lenis` `^1.3.23` | Smooth scroll. Driven by GSAP's ticker and synced to `ScrollTrigger.update` so the scrub stays frame-accurate. Pattern from AoT's `host-animations.js`. |
| `@fontsource-variable/playfair-display` `^5.2.8` | Headline serif. Loaded only by `cinematic.css`. |
| `@fontsource-variable/jetbrains-mono` `^5.2.8` | Mono labels, HUD readouts, data values. Loaded only by `cinematic.css`. |
| `geist` `^1.7.1` | Body font (Vercel's Geist Sans). The npm package is a `next/font` helper with no plain CSS, so we copy `Geist-Variable.woff2` to `public/fonts/geist/` and `@font-face` it manually. |

Three.js sub-imports used inside the scene composables (also pre-bundled): `Sky.js` (atmospheric scattering shader), `GLTFLoader.js` + `DRACOLoader.js` (DRACO-compressed `a350.glb`), `OrbitControls.js` (drag-to-rotate camera on `/experience`).

**Stack rules** (do not violate without a reason in the same PR):
- No Pinia — composables are sufficient at this size.
- No axios — use Nuxt's `$fetch` / `useFetch`.
- No second icon set.
- No second CSS framework. Tailwind v4 only (on `/`); `/experience` is plain CSS variables in `assets/css/cinematic.css`, kept scoped under `:root[data-layout='cinematic']` so its tokens cannot leak onto `/`.
- No second motion library — GSAP only.

---

## 3. Styling

- **Tailwind CSS v4** delivered through `@nuxt/ui` for the restrained surfaces (`/`, admin, feedback). There is **no** `tailwind.config.ts` — this project uses the v4 CSS-first configuration.
- Restrained CSS entry: [../assets/css/main.css](../assets/css/main.css). All theme tokens live in `@theme {}` there.
- Color tokens are stored as **raw RGB triplets** (`--color-*-raw`). Components consume them as `rgb(var(--color-*-raw) / <alpha>)` so opacity is composable.
- **Cinematic CSS entry**: [../assets/css/cinematic.css](../assets/css/cinematic.css) — independent token sheet for `/experience`, scoped under `:root[data-layout='cinematic']`. Imported only by `layouts/cinematic.vue` so its tokens never resolve on other routes. Uses raw hex colors (not Tailwind), matching the Anatomy of Thrust vocabulary.

For the full visual contracts see [UI-STANDARDS.md](UI-STANDARDS.md) (restrained surfaces) and [CINEMATIC.md](CINEMATIC.md) (`/experience`).

---

## 4. Server / API

- Nitro routes under [../server/api/](../server/api/). File-name convention is verb-suffix:
  - `index.get.ts`, `index.post.ts`
  - `[id].get.ts`, `[id].put.ts`, `[id].delete.ts`
- A **single shared MySQL pool** lives in [../server/utils/db.ts](../server/utils/db.ts) (connection limit 10). Never instantiate a per-handler connection.
- Auth: bearer-token via [../server/utils/auth.ts](../server/utils/auth.ts). Mutations require it; public GETs do not.
- DB credentials come from env (defaults are localhost-only for dev):
  - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - `ADMIN_SECRET` for the bearer-token check
  - `BASE_URL` for canonical links / feedback emails

Existing API resources: `personal`, `projects`, `experiences`, `education`, `skills`, `activities`, `languages`, `feedback`, `auth`.

---

## 5. Data flow — static-first

Every section in `pages/index.vue` reads **static data first, dynamic overlay second**:

```ts
import { personal as staticPersonal } from '~/data/index'
const { data } = await usePersonal()
const p = computed(() => data.value as any)
// Render: p.value?.field || staticPersonal.field
```

The site must render correctly with the DB disconnected (offline portfolio review, mid-migration). Treat [../data/index.ts](../data/index.ts) as canonical; the database is an editable overlay. **New fields must land in both places in the same PR.**

---

## 6. Database

- Schema: [../migrations/0001_create_all_tables.sql](../migrations/0001_create_all_tables.sql). InnoDB, `utf8mb4_unicode_ci`, snake_case columns.
- A bootstrap dump lives at [../init.sql](../init.sql).
- MySQL is **not** in this repo's compose file — it's provided by the shared `axelnova-infra` stack (network: `axelnova-shared`, service: `mysql`). DNS resolution makes `DB_HOST=mysql` work both locally and in prod.

---

## 7. Containers

| File | Purpose |
|---|---|
| [../Dockerfile](../Dockerfile) | Multi-stage prod build. `npm run build` → `node .output/server/index.mjs`. |
| [../Dockerfile.dev](../Dockerfile.dev) | Dev image. Volume-mounted source + hot reload. |
| [../docker-compose.yml](../docker-compose.yml) | Prod. Joins external `axelnova-shared` network for MySQL. |
| [../docker-compose.dev.yml](../docker-compose.dev.yml) | Dev. Binds to `127.0.0.1:3000` only. |

The `axelnova-shared` network is external — it must already exist (managed by the `axelnova-infra` repo). See user memory for that repo.

---

## 8. Local dev

```bash
npm install        # also runs `nuxt prepare`
npm run dev        # http://localhost:3000
npm run build      # produces .output
npm run preview    # serves the built bundle
```

The `.env` file is git-ignored. Copy `.env.example` and fill in `DB_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `ADMIN_SECRET`, `BASE_URL`.

---

## 9. Code style — quick reference

- `<script setup lang="ts">` only. Never `defineComponent`.
- `defineProps<{...}>()` with a TS type, not the runtime object form.
- Composables: `useThing.ts` in [../composables/](../composables/). Reach for `@vueuse/core` first.
- Server handlers: `verb.ts` or `[param].verb.ts`.
- Components: `PascalCase.vue`, auto-imported with path-prefix (`components/ui/Foo.vue` → `<UiFoo />`).
- No `any` in component public APIs. Internal `as any` casts on DB rows are tolerated.
- Never commit secrets.

For deeper visual / component rules see [UI-STANDARDS.md](UI-STANDARDS.md) (restrained surfaces) or [CINEMATIC.md](CINEMATIC.md) (`/experience`).
