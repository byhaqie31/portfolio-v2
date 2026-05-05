# UI Standards — portfolio-v2

The design and engineering guideline for `qie.dev` / `baihaqie.com`. This file is the source of truth for the **Axelnova Cyberpunk** visual language and the conventions used across the public site, the feedback flow, and the admin dashboard.

When adding a new section, page, or component, conform to this document. If a rule here gets in the way, update this document in the same PR — don't let the codebase and the standards drift.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Nuxt 4** (`^4.4.2`) | App router via `pages/`, layouts via `layouts/`, server via `server/api/` (Nitro). |
| View | **Vue 3.5** (`<script setup lang="ts">`) | Composition API only. No Options API. |
| UI kit | **@nuxt/ui v3** | Used selectively. Always prefer the project's own design tokens & component classes (`.btn`, `.card`, etc.) over raw `UButton`/`UCard` so the cyberpunk look stays consistent. |
| Styling | **Tailwind CSS v4** (via Nuxt UI) | Single entry: [assets/css/main.css](assets/css/main.css). Theme tokens live in `@theme {}`. No `tailwind.config.ts` — this project is fully on the v4 CSS-first config. |
| Icons | **@nuxt/icon** with **`@iconify-json/fluent`** | Use `<Icon name="fluent:..." size="14" />`. Keep sizes 12/14/16 — bigger icons break visual rhythm with the mono labels. `serverBundle: 'local'` is set; do not disable it (offline + faster cold start). |
| Fonts | **@nuxtjs/google-fonts** | Three families, fixed roles — see §3. `display: 'swap'`, `preload: true`. |
| Composables | **@vueuse/core** | Use `@vueuse/core` first before writing a new composable. |
| Class merging | **clsx** | For conditional classes in `<script>`. In templates prefer `:class` arrays / object syntax. |
| Server / API | **Nitro** (`server/api/**`) + **mysql2/promise** | Single shared pool in [server/utils/db.ts](server/utils/db.ts). |
| Database | **MySQL 8** | Schema in [migrations/0001_create_all_tables.sql](migrations/0001_create_all_tables.sql) — InnoDB, `utf8mb4_unicode_ci`, snake_case columns. |
| Container | **Docker** (`Dockerfile`, `Dockerfile.dev`, `docker-compose*.yml`) | dev + prod compose files at the root. |

**Don't add to the stack without a reason.** Specifically: no Pinia (composables are enough at this size), no axios (use `$fetch` / `useFetch`), no separate icon set (Fluent only), no other CSS framework.

---

## 2. Theme — Axelnova Cyberpunk

Two modes, both defined as raw RGB triplets in `:root` and `.dark`. The `--color-*-raw` form is the contract — every component reads through `rgb(var(--color-*-raw))` or `rgb(var(--color-*-raw) / <alpha>)` so opacity is composable.

### 2.1 Palette

| Token | Dark (default) | Light | Role |
|---|---|---|---|
| `--color-bg-raw` | `2 4 8` | `232 237 242` | Page background |
| `--color-bg-secondary-raw` | `8 15 24` | `222 228 235` | Subtle banding |
| `--color-bg-tertiary-raw` | `14 22 34` | `212 220 230` | Tag/pill backgrounds |
| `--color-surface-raw` | `8 15 24` | `240 244 248` | Cards, panels |
| `--color-surface-raised-raw` | `14 22 34` | `232 237 242` | Modals, popovers |
| `--color-surface-overlay-raw` | `20 30 45` | `220 226 234` | Floating overlays |
| `--color-accent-raw` | `0 200 255` (cyan) | same | Primary action / focus / glow |
| `--color-accent-secondary-raw` | `255 77 109` (rose) | same | Secondary accent (sparingly) |
| `--color-accent-tertiary-raw` | `57 255 122` (green) | same | Status / "online" / success |
| `--color-border-raw` | `0 200 255` | `195 208 222` | Default border (always used at low alpha) |
| `--color-text-primary-raw` | `208 232 245` | `10 20 35` | Body |
| `--color-text-secondary-raw` | `140 170 195` | `60 75 95` | Supporting copy |
| `--color-text-muted-raw` | `80 110 140` | `110 125 145` | Eyebrows, meta |

**Alpha rule.** Borders are almost never opaque. Default to `border-accent/10` to `border-accent/30`. Borders at full opacity look harsh and break the depth illusion.

**Accent rule.** Cyan is the only "loud" colour. Rose is reserved for one secondary glow and the gradient text utility. Green is reserved for status indicators. Don't introduce a fourth hue.

### 2.2 Mode toggle

- Default is **dark**. The `dark` class is set on `<html>` by [composables/useTheme.ts](composables/useTheme.ts), persisted in `localStorage` under the key `theme`.
- Every layout must call `useTheme().init()` in `onMounted`. Skipping this causes a mode flash on reload.
- Never read `isDark` server-side — the value is only correct after hydration.

### 2.3 Background layers

The dark aesthetic depends on stacking these — don't ship a section with a flat background:

1. **Starfield canvas** (`fixed inset-0 z-0`, 350 stars, sin-wave twinkle) — defined in both layouts. Cyan-tinted in dark, washed blue at 0.2 alpha in light.
2. **Noise SVG** (`feTurbulence baseFrequency="0.8"`, opacity 0.03, `z-98`) — film-grain texture, both modes.
3. **Scanlines** (`.scanlines::after`, `z-99`) — applied to the layout root `<div>`.
4. **Hex/dot grid** (radial-gradient, `28px 28px`, opacity 0.04) — used inside hero-style sections only.
5. **Ambient glows** — `radial-gradient` blurs in `--color-accent-raw` and `--color-accent-secondary-raw`. Use 1–2 per section, never more.

---

## 3. Typography

Three families, **fixed roles** — do not mix them.

| Family | Tailwind utility | Role |
|---|---|---|
| **Orbitron** (700/900) | `font-display` | Display headings, logo, hero `<h1>`, big numerics. Set `tracking-[0.02em]`–`[0.05em]`, often `uppercase`. Pair with `.neon-glow` on hero. |
| **DM Mono** (300/400/500) | `font-mono` / `font-tech` | Eyebrow labels, nav, buttons, meta rows, tags, KPIs. Always `uppercase` with `tracking-[0.1em]`–`[0.35em]`. Body text should never be mono. |
| **Syne** (400/600/800) | `font-sans` / `font-body` | All body copy, descriptions, paragraphs. Default — set on `html` so most content inherits it. |

### Type scale (suggested)

- **Hero `<h1>`**: `text-4xl sm:text-5xl md:text-[3.25rem]`, `font-display`, `font-bold`, `tracking-[0.02em]`, `leading-[1.1]`, `.neon-glow`.
- **Section `<h2>`** (use `<UiSectionHeading>` — see §5.4): `text-2xl md:text-3xl`, `font-display`, `font-bold`, `tracking-[0.05em]`, `uppercase`.
- **Card title `<h3>`**: `text-sm font-bold uppercase tracking-[0.05em]`, `font-display`.
- **Body**: `text-base text-text-secondary leading-relaxed` (descriptions: `max-w-xl`).
- **Eyebrow**: `font-mono text-2xs text-text-muted uppercase tracking-[0.3em]` — often prefixed with `// ` to match the dev-console feel.
- **Stat / metric**: `font-display text-base font-bold text-accent neon-glow`, label below in `font-mono text-2xs text-text-muted`.

`text-2xs` (`0.65rem`) is a custom step — use it for any tag/pill/eyebrow.

---

## 4. Spacing, layout, motion

### 4.1 Layout

- **Container**: `max-w-5xl mx-auto px-6`. Don't widen sections beyond this — long lines hurt readability and break the "terminal" feel.
- **Section padding**: use `.section` (`px-6 py-24 md:py-32`) on every public section.
- **Grid**: 12-col is unnecessary at this scale. Use flex + `gap-*`. Card grids: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.

### 4.2 Z-index

Reserved layers. Don't invent new ones:

| Layer | z | Use |
|---|---|---|
| Starfield canvas | `0` | Background. |
| Content | `1` | Anything that should sit above the canvas. |
| Scroll progress bar | `100` | Top-of-page progress (`.scroll-progress`). |
| Scanlines | `99` | Pseudo-overlay. |
| Noise | `98` | Pseudo-overlay. |
| Navbar | `50` | Sticky header. |

### 4.3 Motion

- **Spring easing** is the project's signature: `cubic-bezier(0.16, 1, 0.3, 1)`. Tailwind utility: `ease-spring`. CSS variable: `--ease-spring`. Use it on every interactive transition.
- **Durations**: `200ms` for hovers, `300ms` for layout shifts, `500–700ms` for entrance/zoom.
- **Reveal pattern**: add `class="reveal"` to elements inside a `<main>` that uses `useReveal()`. The composable adds `is-visible` via `IntersectionObserver`. Stagger with `reveal-delay-1`..`reveal-delay-5`.
- **Named keyframes** (declared in `@theme`): `reveal`, `fadeIn`, `slideDown`, `slideUp`, `blink`, `shimmer`, `glowPulse`, `float`. Don't redefine these locally.
- **Hover lift**: `transform: translateY(-2px)` for buttons, `-4px` for cards, paired with a glow. Reset on `:active`.

---

## 5. Components

Components live under `components/` and resolve via Nuxt's auto-import with the **path-prefixed** name:

- `components/sections/HeroSection.vue` → `<SectionsHeroSection />`
- `components/ui/ProjectCard.vue` → `<UiProjectCard />`
- `components/layout/Navbar.vue` → `<LayoutNavbar />`
- `components/admin/AdminPersonal.vue` → `<AdminAdminPersonal />` (legacy — new admin components should drop the second `Admin` prefix in the file name).

### 5.1 Folder conventions

| Folder | Purpose |
|---|---|
| `components/sections/` | Top-level page sections, one per scroll anchor. Composed inside `pages/index.vue`. |
| `components/ui/` | Reusable presentational components — cards, headings, palettes, icons. Must be stateless or self-contained. |
| `components/layout/` | Navbar, Footer, scaffolding pieces consumed by `layouts/`. |
| `components/admin/` | Editor panels for the dashboard. Not for public-facing UI. |

### 5.2 Buttons (`@layer components`)

Always use the design-system classes — do not hand-roll button styling.

| Class | When |
|---|---|
| `.btn` | Base — rarely used directly; prefer a variant. |
| `.btn-primary` | The single primary CTA per section/screen. Cyan fill + glow halo. |
| `.btn-ghost` | Secondary actions. Bordered, transparent, hover → cyan border. |
| `.btn-icon` | 36×36 square for icon-only triggers (theme toggle, search, GitHub). |

All three are mono, uppercase, `tracking-[0.05em]`. Never override `font-family` or `text-transform` on buttons — that breaks the system.

### 5.3 Cards (`@layer components`)

| Class | When |
|---|---|
| `.card` | Static content panel. |
| `.card-hover` | Interactive card — adds border-glow, lift, drop shadow on hover. Use for any clickable card (project, reference). |
| `.corner-accent` | Adds a 20×20 cyan L-bracket in the top-right. Combine with `.card-hover` on featured items. |
| `.skill-tag` | Small grey pill for non-clickable labels. |
| `.stack-pill` | Cyan-tinted pill for tech stack chips. |

### 5.4 Section heading

Every public section starts with `<UiSectionHeading :label="..." :title="..." :description="..." />` — see [components/ui/SectionHeading.vue](components/ui/SectionHeading.vue). It enforces the eyebrow + gradient divider + display title pattern. Do not roll a custom heading.

### 5.5 Icons

- Always Fluent (`fluent:*-16-filled` is the default size). Avoid mixing filled + regular weights in the same row.
- Inline icons next to text: `size="12"` or `"14"`. Standalone icon buttons: `"14"` inside `.btn-icon`.
- Add `aria-label` to any icon-only `<a>` or `<button>`.

### 5.6 Effects you can opt into

| Class | Effect |
|---|---|
| `.neon-glow` | Cyan text-shadow halo. Use on hero `<h1>`, KPI numbers, the logo. |
| `.text-gradient` | Subtle primary→secondary text gradient. |
| `.text-gradient-cyan` | Cyan→rose diagonal text gradient. Use sparingly — one per section max. |
| `.section-divider` | Horizontal cyan-fade rule. |
| `.scanlines` | CRT scanlines overlay (already on layout root). |

---

## 6. Pages, routing, data

### 6.1 Page structure

- Public landing is a single `pages/index.vue` composing all sections. Section anchors come from `data/index.ts`'s `navLinks`. The navbar's active state uses `IntersectionObserver` — every section root must have `id="<anchor>"` matching `navLinks[i].href`.
- Admin lives under `pages/admin/`. Uses `layout: 'dashboard'`.
- Feedback collection: `pages/feedback/[token].vue`. Token is generated server-side and one-shot.

### 6.2 Data flow

**Static fallback first, dynamic second.** Every section reads:

```ts
import { personal as staticPersonal } from '~/data/index'
const { data } = await usePersonal()
const p = computed(() => data.value as any)
// Always render: p.value?.field || staticPersonal.field
```

This is intentional — the site must render correctly with the database disconnected (e.g. portfolio reviewed offline, DB migration in flight). Treat `data/index.ts` as the canonical content source; the DB is an editable overlay. New fields must land in both places in the same PR.

### 6.3 Server API

- Layout: `server/api/<resource>/index.get.ts`, `index.post.ts`, `[id].get.ts`, `[id].put.ts`, `[id].delete.ts`. Follow this verb-suffix convention — Nitro routes off it.
- Use the shared pool from `server/utils/db.ts`. Never instantiate a new connection per handler.
- Auth is bearer-token style via `server/utils/auth.ts`; mutations require it, GETs of public data don't.

### 6.4 SEO

Every page sets `useSeoMeta({ title, description, ogTitle, ogDescription })`. Default head config (favicon, theme-color, viewport) lives in `nuxt.config.ts` — don't duplicate it per page.

---

## 7. Accessibility

- **Contrast**: the muted palette can drift below WCAG AA. Body text is `text-secondary` on `bg`; do not push to `text-muted` for paragraph copy.
- **Focus rings**: don't disable them. Where Tailwind's default ring clashes with the dark theme, override to `focus-visible:ring-1 ring-accent` rather than removing it.
- **Animations**: respect `prefers-reduced-motion` — the starfield, typewriter, and reveal effects should be wrapped to skip when reduced motion is requested. (Open improvement — add when touching motion code.)
- **Keyboard**: command palette must be reachable via `⌘K` / `Ctrl+K` (already wired in `useCommandPalette`). All icon-only buttons must have `aria-label`.

---

## 8. Code style

- `<script setup lang="ts">` only. Never `defineComponent`.
- Use `defineProps<{...}>()` with a TS type, not the runtime object form.
- Reach for `@vueuse/core` before writing a new composable.
- No `any` in component public APIs (props/emits). Internal `as any` casts on DB rows are tolerated until a typed schema layer exists.
- Tailwind classes order: layout → spacing → sizing → typography → colour → border → effects → state. Don't fight Prettier on class order.
- File names: components are `PascalCase.vue`, composables are `useThing.ts`, server handlers are `verb.ts` / `[param].verb.ts`.
- Never commit secrets. DB creds are env-driven (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) with localhost defaults for dev only.

---

## 9. Adding a new section — checklist

1. File: `components/sections/<Name>Section.vue`.
2. Root: `<section id="<anchor>" class="section">`. Add `{ label, href: '#<anchor>' }` to `navLinks` in `data/index.ts`.
3. Heading: `<UiSectionHeading label="..." title="..." description="..." />`.
4. Static data shape declared in `data/index.ts` with a TypeScript `interface` exported alongside.
5. If dynamic: add a `composables/use<Name>.ts` wrapping `useFetch('/api/<name>')` with the static fallback as `default`, and a matching `server/api/<name>/index.get.ts`.
6. Mount in `pages/index.vue` between existing sections.
7. Verify dark + light, mobile + desktop, reduced-motion.

---

## 10. What this document is not

- **Not a content guide.** Tone, voice, and copy direction live elsewhere (or in your head — for now). This document covers visual + structural rules only.
- **Not a comprehensive component library reference.** The components exist; read them. This document captures only the rules that aren't obvious from the code.
- **Not frozen.** When the design system grows, update the relevant section in the same PR that introduces the change. A standards doc that lags the codebase is worse than no standards doc.
