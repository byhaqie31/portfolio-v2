# Structure — portfolio-v2

Folder layout of `qie.dev` / `baihaqie.com`. Companion to [STACK.md](STACK.md), [UI-STANDARDS.md](UI-STANDARDS.md) (restrained surfaces), and [CINEMATIC.md](CINEMATIC.md) (`/experience`).

---

## 1. Top level

```
portfolio-v2/
├── app.vue                       # Root wrapper — just <NuxtLayout><NuxtPage/></NuxtLayout>
├── nuxt.config.ts                # Modules, fonts, head meta, route rules
├── package.json                  # Deps + scripts (dev/build/preview/generate)
├── tsconfig.json
├── .npmrc
├── .env / .env.example           # DB creds, ADMIN_SECRET, BASE_URL
├── Dockerfile                    # Prod build (multi-stage, node:20-alpine)
├── Dockerfile.dev                # Dev image (volume-mounted)
├── docker-compose.yml            # Prod — joins external axelnova-shared network
├── docker-compose.dev.yml        # Dev — bound to 127.0.0.1:3000
├── init.sql                      # DB bootstrap dump
│
├── docs/                         # Project docs (this folder)
│   ├── STACK.md                  # Tech stack
│   ├── STRUCTURE.md              # ← you are here
│   ├── UI-STANDARDS.md           # Restrained visual / design contract (/, admin, feedback)
│   └── CINEMATIC.md              # Cinematic visual / engineering contract (/experience)
│
├── assets/css/
│   ├── main.css                  # Tailwind v4 entry — restrained surfaces
│   └── cinematic.css             # AoT token sheet — /experience only
├── public/                       # Static assets (favicon, fonts, images, models)
│
├── pages/                        # File-system routing — /, /experience/, /admin/, /feedback/
├── layouts/                      # default.vue + dashboard.vue + cinematic.vue
├── components/                   # sections / ui / layout / admin / cinematic
├── composables/                  # useTheme, usePersonal, useReveal, useFlight*, useLenis, usePhaseState, …
├── data/index.ts                 # Static fallback content (canonical)
│
├── server/api/                   # Nitro routes
├── server/utils/                 # db.ts (shared pool), auth.ts (bearer)
├── server/plugins/
├── server/tsconfig.json
│
├── migrations/                   # 0001_create_all_tables.sql
├── .github/                      # CI / PR templates
├── CLAUDE.md                     # Claude context entrypoint (loads docs/)
└── README.md
```

---

## 2. `pages/`

File-system routing. Three layouts: `default` (public), `dashboard` (admin), `cinematic` (`/experience`).

```
pages/
├── index.vue                     # Public landing — composes all sections in scroll order
├── experience/
│   └── index.vue                 # Cinematic flight surface — ssr:false (window-bound runtime)
├── admin/
│   ├── index.vue                 # Admin home / editor entry
│   ├── preview.vue               # Client-only preview route (ssr:false in nuxt.config)
│   └── feedback.vue              # Feedback inbox
└── feedback/
    └── [token].vue               # One-shot tokenized feedback form
```

Section anchors on `pages/index.vue` are driven by `navLinks` in `data/index.ts`. Each section root must carry `id="<anchor>"` matching `navLinks[i].href`.

`pages/experience/index.vue` composes the auto-play intro acts (`<CinematicIntro>`, `<CinematicWelcome>`), the persistent black overlay (`<CinematicOverlay>`), the Three.js scene (`<CinematicFlightScene>`), the 3D aircraft trigger (`<CinematicAircraft>`), the HUD (`<CinematicHUD>`), and seven `<CinematicPhaseSection>` instances driven by `data/index.ts`. The page reads as pre-flight → takeoff → climb → cruise → FL380 → descent → arrival.

---

## 3. `components/`

Auto-imported with **path-prefixed** names. `components/ui/Foo.vue` becomes `<UiFoo />`.

```
components/
├── sections/                     # One per scroll anchor on the public landing
│   ├── HeroSection.vue
│   ├── AboutSection.vue
│   ├── WorkSection.vue
│   ├── ExperienceSection.vue
│   ├── SkillsSection.vue
│   ├── ReferencesSection.vue
│   └── ContactSection.vue
│
├── ui/                           # Stateless, reusable primitives
│   ├── SectionHeading.vue        # Required heading wrapper for every section
│   ├── ProjectCard.vue
│   ├── CommandPalette.vue        # ⌘K palette
│   ├── AppToaster.vue
│   ├── AdminConfirm.vue
│   ├── IconGithub.vue
│   └── IconLinkedin.vue
│
├── layout/                       # Pieces consumed by layouts/
│   ├── Navbar.vue
│   └── Footer.vue
│
├── admin/                        # Editor panels (dashboard only)
│   ├── AdminPersonal.vue
│   ├── AdminProjects.vue
│   ├── AdminExperiences.vue
│   ├── AdminEducation.vue
│   ├── AdminSkills.vue
│   ├── AdminActivities.vue
│   ├── AdminReferences.vue
│   └── PreviewButton.vue
│
└── cinematic/                    # All /experience-only components
    ├── Intro.vue                 # Act 1 — plane silhouette flies up through black
    ├── Welcome.vue               # Act 2 — "Welcome aboard / to my journey!" + scroll hint
    ├── Overlay.vue               # Persistent black with radial-mask iris (--hole-r)
    ├── FlightScene.vue           # Three.js canvas mount (sky shader + clouds + lighting)
    ├── Aircraft.vue              # Trigger for the GLB A350 (no DOM output)
    ├── HUD.vue                   # Top-right page-corner spec sheet + click-to-jump phases
    └── PhaseSection.vue          # Generic lower-third phase layout (data-driven)
```

Rules from [UI-STANDARDS.md](UI-STANDARDS.md): `components/ui/` must be stateless, `components/sections/` are page-level only, `components/admin/` is never used on public-facing routes.

Rules from [CINEMATIC.md](CINEMATIC.md): `components/cinematic/` is never used on the restrained surfaces. The cinematic tokens (`assets/css/cinematic.css`) must never be imported by anything except `layouts/cinematic.vue`.

---

## 4. `composables/`

```
composables/
├── useTheme.ts                   # Dark/light, persists to localStorage["theme"]
├── useReveal.ts                  # IntersectionObserver-driven .reveal → .is-visible
├── useScrollProgress.ts          # Top-of-page progress bar
├── useCommandPalette.ts          # ⌘K state
├── useConfirm.ts                 # Imperative confirm() dialog
├── useAdmin.ts                   # Admin auth / session helpers
├── usePersonal.ts                # GET /api/personal with static fallback
├── usePreview.ts                 # localStorage-backed preview overlay store
├── useListPreview.ts             # Preview helper for list resources
├── useFormPreview.ts             # Preview helper for form-driven editors
│
├── useLenis.ts                   # Smooth scroll — singleton, GSAP ticker-driven, ScrollTrigger.update bound
├── useFlightScene.ts             # Three.js scene lifecycle — renderer, camera, sky shader, clouds, lighting, OrbitControls
├── useFlightAircraft.ts          # GLB A350 load + normalize + cruise pose lifecycle (DRACO via CDN)
├── useFlightScroll.ts            # Master scroll choreography — pinned iris reveal + post-pin aircraft pitch/landing
└── usePhaseState.ts              # Active phase tracking via per-phase ScrollTriggers + click-to-jump
```

Section composables (`use<Resource>`) follow the static-first pattern in [STACK.md §5](STACK.md). The cinematic composables (`useLenis`, `useFlight*`, `usePhaseState`) are loaded only by `pages/experience/index.vue` and its child components.

---

## 5. `server/`

Nitro routes. File-name convention is verb-suffix.

```
server/
├── api/
│   ├── personal/
│   │   ├── index.get.ts          # Public read
│   │   └── index.put.ts          # Auth'd update
│   ├── projects/
│   │   ├── index.get.ts          # List
│   │   ├── index.post.ts         # Create (auth)
│   │   ├── [id].get.ts
│   │   ├── [id].put.ts           # (auth)
│   │   ├── [id].delete.ts        # (auth)
│   │   └── [id]/                 # Nested sub-routes if needed
│   ├── experiences/              # same shape as projects
│   ├── education/                # same shape
│   ├── skills/                   # same shape
│   ├── activities/               # same shape
│   ├── languages/                # same shape
│   ├── feedback/
│   │   ├── generate.post.ts      # Mint a one-shot token (auth)
│   │   ├── list.get.ts           # Inbox (auth)
│   │   ├── public.get.ts         # Public-facing summary
│   │   ├── [token].get.ts        # Tokenized read
│   │   ├── [token].post.ts       # Tokenized submit
│   │   └── [id]/                 # Per-record actions
│   └── auth/
│       └── verify.get.ts         # Bearer-token verify
│
├── utils/
│   ├── db.ts                     # Shared mysql2/promise pool (limit 10)
│   └── auth.ts                   # Bearer extract + ADMIN_SECRET compare
│
├── plugins/
└── tsconfig.json
```

---

## 6. `data/`

```
data/
└── index.ts        # Static fallback for personal / navLinks / projects / etc.
                    # Treat as canonical — DB is an editable overlay.
                    # New fields land here AND in migrations in the same PR.
```

---

## 7. `assets/` and `public/`

```
assets/css/
├── main.css                      # Tailwind v4 entry — restrained surfaces (theme tokens in @theme {})
└── cinematic.css                 # AoT token sheet — /experience only, scoped under [data-layout='cinematic']

public/
├── favicon/                      # Favicon set (.ico/.svg/.png + site.webmanifest) — linked in nuxt.config head
├── images/
│   ├── ProfilePicture.png        # Restrained hero photo
│   └── A350_summary.png          # Cinematic intro plane silhouette (top-down)
├── fonts/
│   └── geist/
│       └── Geist-Variable.woff2  # Self-hosted Geist (the `geist` npm package is next/font-flavoured, ships no plain CSS)
└── models/
    └── a350.glb                  # A350-1000 GLB for the cinematic 3D aircraft (DRACO-compressed, ~808KB)
```

No tailwind.config.ts. See [UI-STANDARDS.md §2](UI-STANDARDS.md) and [CINEMATIC.md](CINEMATIC.md) for the two token contracts.

---

## 8. `migrations/`

```
migrations/
└── 0001_create_all_tables.sql   # Single migration so far. InnoDB, utf8mb4_unicode_ci, snake_case.
```

When the schema changes, add `0002_*.sql` — don't edit `0001`.

---

## 9. Generated / ignored

- `.nuxt/` — Nuxt build cache. Don't commit.
- `.output/` — production bundle. Don't commit.
- `node_modules/` — git-ignored.
- `.env` — git-ignored, copy from `.env.example`.

---

## 10. Where things live — quick lookup

| You want to… | Touch |
|---|---|
| Add a new public section | `components/sections/` + `data/index.ts` (`navLinks` + interface) + `pages/index.vue` |
| Add a new admin editor | `components/admin/` + matching `pages/admin/*.vue` route |
| Add a new resource API | `server/api/<name>/index.{get,post}.ts` + `[id].{get,put,delete}.ts`, then a `composables/use<Name>.ts` and a `migrations/000N_*.sql` |
| Tweak the dark/light theme | `assets/css/main.css` (`@theme` block) — never per-component |
| Add a button / card variant | `assets/css/main.css` `@layer components` — never inline a one-off button |
| Change the feedback flow | `pages/feedback/[token].vue` + `server/api/feedback/*` |
| Change navbar / footer | `components/layout/` |
| Change global head / SEO defaults | `nuxt.config.ts` (don't duplicate per page) |
| Add a new cinematic phase | `pages/experience/index.vue` (new `<CinematicPhaseSection>`) + add a phase entry to `composables/usePhaseState.ts`'s `PHASES` manifest + extend the aircraft choreography keyframes in `useFlightScroll.ts` if the new phase warrants a pose change |
| Tweak cinematic timings (intro, welcome, iris reveal, aircraft pose) | `components/cinematic/Intro.vue` + `Welcome.vue` for the auto acts; `composables/useFlightScroll.ts` for the scroll-driven scrub; `composables/useFlightAircraft.ts` for aircraft scale + cruise pose |
| Tweak cinematic tokens (palette, type, motion) | `assets/css/cinematic.css` (`:root[data-layout='cinematic']` block) — never per-component |
| Swap or recolour the 3D aircraft | `public/models/a350.glb` + `composables/useFlightAircraft.ts` (`normalizeModel`'s rotation/scale, optional livery patch) |
