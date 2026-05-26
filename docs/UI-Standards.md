# UI Standards — portfolio-v2

The design and engineering guideline for `qie.dev` / `baihaqie.com`. This file is the source of truth for the **Apple-faithful Restrained** visual language used across the public landing page.

When adding a new section, page, or component on the public site, conform to this document. If a rule here gets in the way, update this document in the same PR — don't let the codebase and the standards drift.

> **Scope note.** The public site (`pages/index.vue` + `components/sections/*` + `components/ui/*` + `components/layout/*`) has migrated to the Apple-faithful system described below. The **admin dashboard** (`pages/admin/*`) and **feedback flow** (`pages/feedback/[token].vue`) still use the legacy **Axelnova Cyberpunk** vocabulary (`font-display`/`font-tech` utilities, accent-tinted side borders, all-caps eyebrows). Those utilities are kept as backward-compat shims pointing at the new system stack, so they compile fine, but they visually clash with the public site. They will be migrated in their own redesign pass — when touching them, prefer the patterns documented here.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Nuxt 4** (`^4.4.2`) | App router via `pages/`, layouts via `layouts/`, server via `server/api/` (Nitro). |
| View | **Vue 3.5** (`<script setup lang="ts">`) | Composition API only. No Options API. |
| UI kit | **@nuxt/ui v3** | Used selectively. Always prefer the project's own design tokens & component classes (`.btn`, `.card`, etc.) over raw `UButton`/`UCard`. |
| Styling | **Tailwind CSS v4** (via Nuxt UI) | Single entry: [assets/css/main.css](../assets/css/main.css). Theme tokens live in `@theme {}`. No `tailwind.config.ts` — this project is fully on the v4 CSS-first config. |
| Icons | **@nuxt/icon** with **`@iconify-json/fluent`** | Use `<Icon name="fluent:..." size="14" />`. Keep sizes 12/14/16 to match the typography scale. `serverBundle: 'local'` is set; do not disable it. |
| Fonts | **System stack** (no Google Fonts loaded for the public site) | `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, Roboto, sans-serif`. Mac/iOS visitors get the real SF Pro Display; Windows gets Segoe UI; Android gets Roboto. Zero font load, no FOIT/FOUT. |
| Motion | **GSAP 3.15** + **ScrollTrigger** | Public site's reveal + hero entrance are GSAP-orchestrated. `prefers-reduced-motion` honored via `gsap.matchMedia`. Pre-bundled in `vite.optimizeDeps`. |
| Composables | **@vueuse/core** | Use `@vueuse/core` first before writing a new composable. `onClickOutside`, `useIntersectionObserver`, etc. |
| Class merging | **clsx** | For conditional classes in `<script>`. In templates prefer `:class` arrays / object syntax. |
| Server / API | **Nitro** (`server/api/**`) + **mysql2/promise** | Single shared pool in [server/utils/db.ts](../server/utils/db.ts). |
| Database | **MySQL 8** | Schema in [migrations/0001_create_all_tables.sql](../migrations/0001_create_all_tables.sql) — InnoDB, `utf8mb4_unicode_ci`, snake_case columns. |
| Container | **Docker** (`Dockerfile`, `Dockerfile.dev`, `docker-compose*.yml`) | dev + prod compose files at the root. |

**Don't add to the stack without a reason.** Specifically: no Pinia (composables are enough at this size), no axios (use `$fetch` / `useFetch`), no separate icon set, no other CSS framework, no additional motion library.

---

## 2. Theme — Apple-faithful Restrained

Light-first. Two modes. Tokens are raw RGB triplets in `:root` and `.dark` so every component can read through `rgb(var(--color-*-raw) / <alpha>)` for composable opacity.

Values are OKLCH-derived (chroma ≤ 0.008 on neutrals tinted toward hue 240, accent 0.15–0.18 @ hue 250 — Apple SF Blue lineage). Stored as RGB so `rgb(... / alpha)` keeps working.

### 2.1 Palette

| Token | Light (default) | Dark | Role |
|---|---|---|---|
| `--color-bg-raw` | `251 251 252` (#fbfbfc) | `20 22 26` (#14161a) | Page background. Never `#fff` / `#000` — always tinted. |
| `--color-bg-secondary-raw` | `244 245 247` | `28 30 35` | Subtle banding, mobile menu open state, tag backgrounds. |
| `--color-bg-tertiary-raw` | `236 238 241` | `38 40 46` | Deepest neutral tint. |
| `--color-surface-raw` | `253 253 254` | `28 30 35` | Cards, panels, command palette. |
| `--color-surface-raised-raw` | `246 247 249` | `38 40 46` | Hover state for cards / list rows. |
| `--color-surface-overlay-raw` | `239 240 243` | `50 53 60` | Floating overlays. |
| `--color-accent-raw` | `0 102 204` (#0066cc) | `41 151 255` (#2997ff) | Apple SF Blue. Primary action, links, focus rings, active states. |
| `--color-accent-muted-raw` | `0 82 170` | `30 120 200` | Accent at darker intensity. |
| `--color-accent-subtle-raw` | `224 234 247` | `30 50 80` | Accent at washed background intensity. |
| `--color-accent-secondary-raw` | `230 90 110` | `240 110 125` | Warm rose. Kept for admin/feedback compatibility. **Do not use on the public site.** |
| `--color-accent-tertiary-raw` | `50 175 95` | `80 200 130` | Status green — "Available" / "Online" dot. Semantic only. |
| `--color-border-raw` | `224 226 230` | `60 64 72` | Default border (neutral, not accent-tinted). |
| `--color-border-subtle-raw` | `234 236 239` | `36 40 46` | Soft dividers (between list rows, footer separators). |
| `--color-border-strong-raw` | `204 207 212` | `95 100 110` | Hover state for ghost / icon buttons. |
| `--color-text-primary-raw` | `29 29 31` (#1d1d1f) | `244 245 247` (#f5f5f7) | Body. Apple's exact text-color lineage. |
| `--color-text-secondary-raw` | `100 105 112` | `170 173 180` | Supporting copy. WCAG AA on bg. |
| `--color-text-muted-raw` | `110 115 122` | `140 144 150` | Eyebrows, meta. Bumped to hit WCAG AA at body sizes. |
| `--color-text-inverse-raw` | `251 251 252` | `251 251 252` | White text on accent (blue) button — same in both modes. |

**Color strategy: Restrained.** Tinted neutrals + one accent ≤10% coverage. Don't introduce a fourth public-site hue. If you need a status color, use the existing `accent-tertiary` (green) for success/available; warm rose (`accent-secondary`) is reserved for admin/feedback.

**Border alpha.** Borders default to `border-border-subtle` (essentially `rgb(var(--color-border-subtle-raw))` at full opacity, which is already a very light value). For visible-but-quiet dividers use `border-border`. The cyberpunk-era pattern of `border-accent/X` is **gone from the public site** — replace with neutral borders if you find any.

### 2.2 Mode toggle

- Default is **light** (Apple-faithful). The `dark` class is set on `<html>` by [composables/useTheme.ts](../composables/useTheme.ts), persisted in `localStorage` under the key `theme`.
- Visitors with no saved preference get light. Visitors with `theme=dark` keep dark.
- Every layout must call `useTheme().init()` in `onMounted`. Skipping this causes a mode flash on reload.
- Never read `isDark` server-side — the value is only correct after hydration.
- Browser chrome (`theme-color` meta) is scheme-aware: `#fbfbfc` light, `#14161a` dark.

### 2.3 Background layers

**There are no decorative background layers on the public site.** No starfield. No noise. No scanlines. No hex grid. No cursor spotlight. No ambient glows. The background is the bg token; that's it.

If a section needs visual distinction, lean on whitespace and type, not a layer. Drift back into chrome only with a real product reason.

---

## 3. Typography

**One font family** (the system stack), used for everything except the rare actual code string. No display vs body distinction. Hierarchy comes from size + weight, not family.

| Family | Tailwind utility | Role |
|---|---|---|
| **System sans** | `font-sans` (default) | All public-site text. The CSS var `--font-sans` resolves to `-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, Roboto, sans-serif`. Mac users see SF Pro Display, Windows users see Segoe UI, Android users see Roboto — all crisp at native rendering. |
| **System mono** | `font-mono` | Reserved for actual code strings (none on the public site currently). `ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace`. |
| Backward-compat | `font-display`, `font-tech`, `font-body` | These admin/feedback utilities map to the same system stack (Orbitron/DM Mono/Syne are no longer loaded). Public-site code should use `font-sans` only. |

### Type scale (public site)

Sentence case throughout. No `uppercase`. No `tracking-[...]`. Hierarchy is **scale + weight + color**, never letter-spacing gymnastics.

- **Hero `<h1>`** (role): `text-[clamp(2.75rem,6vw,4.75rem)]`, `font-semibold`, `tracking-tight`, `leading-[1.02]`, trailing `.` for confidence.
- **Hero subtitle** (focus): `text-xl md:text-2xl`, `text-text-secondary`, `leading-snug`, inline emphasis via `font-medium` on the focus phrase (not color).
- **Section `<h2>`** (use `<UiSectionHeading>` — see §5.4): `text-3xl md:text-4xl lg:text-[2.75rem]`, `font-semibold`, `tracking-tight`, `leading-[1.1]`.
- **Card / job title `<h3>`**: `text-lg` or `text-xl`, `font-semibold`, `tracking-tight`, `leading-tight`.
- **Body**: `text-base`, `text-text-secondary`, `leading-relaxed`. Descriptions cap at `max-w-xl`.
- **Eyebrow**: `text-sm`, `text-accent` or `text-text-muted`, `font-medium`. Sentence case. No `//` prefix, no all-caps.
- **Meta row**: `text-sm`, `text-text-muted`. Inline with icons at `size="14"`.

`text-2xs` is `0.75rem` (12px). Use it only for `<kbd>` chips and very small affordances. Body text never goes below `text-sm` (14px).

---

## 4. Spacing, layout, motion

### 4.1 Layout

- **Container**: `max-w-6xl mx-auto px-6` (1152px desktop cap). Used consistently across sections, navbar, and footer.
- **Section padding**: use `.section` (`px-6 py-24 md:py-32`) on every public section.
- **Grid**: 12-col is unnecessary at this scale. Use flex + `gap-*`. Card grids: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6` (avoid jumping straight from 1→4 at md — the columns get too cramped between 768–1024px).
- **Hero gap ramp**: `gap-12 md:gap-12 lg:gap-20` — text + photo columns need tighter spacing at tablet, generous at desktop.
- **Hero photo size ramp**: `w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-96 lg:h-96`. Calmer at tablet, full presence at desktop.

### 4.2 Z-index

| Layer | z | Use |
|---|---|---|
| Content | `1` | Default content. |
| Navbar | `50` | Sticky header. |
| Scroll progress bar | `100` | Top-of-page progress hairline. |
| Command palette | `200` | Modal overlay (via `<Teleport to="body">`). |

### 4.3 Motion

The public site's motion system is **GSAP-orchestrated**, not CSS-driven.

- **Reveals on scroll**: `class="reveal"` marker — picked up by [composables/useReveal.ts](../composables/useReveal.ts) which animates each element with `expo.out`, 1.1s duration, 16px y-translate, `once: true` at `top 85%` viewport. Initial `opacity: 0` is in CSS to prevent FOUC and gated behind `@media (scripting: enabled)` so JS-disabled readers see SSR content.
- **Hero entrance**: a single `gsap.timeline` scoped via `gsap.context(..., heroRoot.value)` orchestrates the photo (1.6s scale+fade, starting at t=0) and the staggered text reveal (1.1s per element, 0.08s stagger, starting at t=0.15). All on `expo.out`.
- **Easing**: `expo.out` (GSAP) or `cubic-bezier(0.16, 1, 0.3, 1)` (CSS). Never bounce, never elastic.
- **Durations**: 150–200ms for hovers, 1.0–1.6s for entrance choreography. Apple-faithful: slow, confident reveals.
- **Hover lift**: `translateY(-1px)` for primary buttons (Apple-quiet), `translateY(-2px)` for cards.
- **Reduced motion**: `prefers-reduced-motion: reduce` is honored two ways — `gsap.matchMedia` short-circuits all GSAP animations (sets final state immediately), and a global `@media (prefers-reduced-motion: reduce)` rule in [main.css](../assets/css/main.css) flattens any CSS animations/transitions/`animate-pulse` to ~instant. Always test both.
- **The kept CSS keyframe** is `slideDown` — used by the command palette enter animation. All other public-facing keyframes (`reveal`, `fadeIn`, `slideUp`, `shimmer`, `blink`, `glowPulse`, `float`) were removed when GSAP took over.

---

## 5. Components

Components live under `components/` and resolve via Nuxt's auto-import with the **path-prefixed** name:

- `components/sections/HeroSection.vue` → `<SectionsHeroSection />`
- `components/ui/ProjectCard.vue` → `<UiProjectCard />`
- `components/layout/Navbar.vue` → `<LayoutNavbar />`

### 5.1 Folder conventions

| Folder | Purpose |
|---|---|
| `components/sections/` | Top-level page sections, one per scroll anchor. Composed inside `pages/index.vue`. |
| `components/ui/` | Reusable presentational components — cards, headings, palettes, icons. Must be stateless or self-contained. |
| `components/layout/` | Navbar, Footer, scaffolding pieces consumed by `layouts/`. |
| `components/admin/` | Editor panels for the dashboard. Not for public-facing UI. Still on the legacy cyberpunk vocabulary pending its own pass. |

### 5.2 Buttons (`@layer components`)

Always use the design-system classes — do not hand-roll button styling.

| Class | When |
|---|---|
| `.btn` | Base — rarely used directly; prefer a variant. |
| `.btn-primary` | The single primary CTA per section/screen. Apple SF Blue fill, white text, `rounded-full`, `translateY(-1px)` hover. |
| `.btn-ghost` | Secondary actions. Bordered, transparent, hover bumps border. |
| `.btn-icon` | 36×36 round for icon-only triggers (theme toggle, search, GitHub). |

All four have **focus-visible rings** built in (`focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg`). Sentence case. No mono, no uppercase, no letter-spacing — those were removed in the Apple migration.

**Secondary CTA in the hero** (`Get in touch`) is intentionally a quiet text link, not a button — gives the primary CTA single visual focus while keeping the email actionable.

### 5.3 Cards (`@layer components`)

| Class | When |
|---|---|
| `.card` | Static content panel. `rounded-2xl` (16px Apple radius), neutral border, `bg-surface`. |
| `.card-hover` | Interactive card — bumps border + adds `translateY(-2px)` + soft drop shadow on hover. Use for any clickable card (project, reference). |
| `.skill-tag` | Small grey pill for non-clickable labels. Sentence case, `bg-bg-secondary text-text-secondary`. |
| `.stack-pill` | Same as skill-tag in the new system. Was previously cyan-tinted; now neutral. |

The `.corner-accent` utility was **removed** in the Apple migration (was a side-stripe / L-bracket on cards — one of the absolute bans).

### 5.4 Section heading

Every public section starts with `<UiSectionHeading :label="..." :title="..." :description="..." />` — see [components/ui/SectionHeading.vue](../components/ui/SectionHeading.vue). It enforces the eyebrow + sentence-case headline pattern: small `text-accent font-medium` eyebrow, large `text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight` headline, optional `text-lg text-text-secondary` description. Capped at `max-w-3xl`. **Do not roll a custom heading.**

### 5.5 Icons

- Always Fluent (`fluent:*-16-filled` is the default style). Avoid mixing filled + regular weights in the same row.
- Inline icons next to text: `size="14"`. Standalone icon buttons: `size="14"` inside `.btn-icon`.
- Add `aria-label` to any icon-only `<a>` or `<button>`.

### 5.6 Removed utilities

The following utility classes existed in the cyberpunk era and were **removed** during the Apple migration. Do not reintroduce on the public site:

- `.neon-glow` — text-shadow cyan halo
- `.text-gradient` / `.text-gradient-cyan` — gradient-clipped text (one of the absolute bans)
- `.corner-accent` — L-bracket card decoration (side-stripe absolute ban)
- `.scanlines` — CRT overlay pseudo-element
- `.section-divider` (cyan gradient variant) — replaced with a flat low-alpha hairline

The keyframes `reveal`, `fadeIn`, `slideUp`, `shimmer`, `blink`, `glowPulse`, `float` were also dropped.

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

- **Contrast**: the palette is calibrated for WCAG AA at body text sizes in both modes. `text-text-secondary` and `text-text-muted` both pass on the bg token. **Do not use `text-text-muted` for paragraph-length copy** — it passes AA at sm size but is intentionally close to the floor.
- **Focus rings**: all `.btn*` classes include `focus-visible:ring-2 ring-accent ring-offset-2` baked in. Don't remove. For new custom interactive elements, match the pattern.
- **Reduced motion**: respected via `gsap.matchMedia` for all GSAP animations and via a global `@media (prefers-reduced-motion: reduce)` rule in main.css for any leftover CSS animations/transitions/`animate-pulse`.
- **JS-disabled fallback**: hero's `opacity: 0` baseline is wrapped in `@media (scripting: enabled)` so visitors without JS see the SSR-rendered content.
- **Keyboard**: command palette is reachable via `⌘K` / `Ctrl+K` (wired in `useCommandPalette`). All icon-only buttons must have `aria-label`. Mobile menu toggle has `aria-expanded`.
- **Touch targets**: 44px minimum on touch devices. The hero's "Get in touch" text link has `py-2` added for this reason.
- **Click outside**: modals and menus must dismiss on outside click (use `@vueuse/core`'s `onClickOutside`, with the trigger button in the `ignore` array).

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

## 9. Adding a new public section — checklist

1. File: `components/sections/<Name>Section.vue`.
2. Root: `<section id="<anchor>" class="section">`. Add `{ label, href: '#<anchor>' }` to `navLinks` in `data/index.ts`.
3. Heading: `<UiSectionHeading label="..." title="..." description="..." />`.
4. Container width: `max-w-6xl mx-auto`.
5. Static data shape declared in `data/index.ts` with a TypeScript `interface` exported alongside.
6. If dynamic: add a `composables/use<Name>.ts` wrapping `useFetch('/api/<name>')` with the static fallback as `default`, and a matching `server/api/<name>/index.get.ts`.
7. Mount in `pages/index.vue` between existing sections.
8. Sweep for any `font-mono` / `uppercase` / `tracking-[...]` / `border-accent/X` / `font-display` patterns — those are cyberpunk-era and don't belong on the public site.
9. Add `class="reveal"` to elements you want scroll-revealed. GSAP picks them up automatically.
10. Verify dark + light, mobile + tablet + desktop, reduced-motion, and keyboard-only navigation.

---

## 10. What this document is not

- **Not a content guide.** Tone, voice, and copy direction live in the writing itself.
- **Not a comprehensive component library reference.** The components exist; read them. This document captures only the rules that aren't obvious from the code.
- **Not frozen.** When the design system grows, update the relevant section in the same PR that introduces the change. A standards doc that lags the codebase is worse than no standards doc.
- **Not the admin/feedback guide.** Those surfaces still use the legacy cyberpunk vocabulary. When they get their own redesign pass, this section will be extended (or a sibling doc added) to document their target system.
