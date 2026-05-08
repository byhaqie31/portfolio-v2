# Structure — portfolio-v2

Folder layout of `qie.dev` / `baihaqie.com`. Companion to [STACK.md](STACK.md) and [UI-Standards.md](UI-Standards.md).

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
│   └── UI-Standards.md           # Visual / design contract
│
├── assets/css/main.css           # Single Tailwind v4 entry, @theme tokens
├── public/                       # Static assets (favicon, /images/*)
│
├── pages/                        # File-system routing
├── layouts/                      # default.vue (public) + dashboard.vue (admin)
├── components/                   # sections / ui / layout / admin
├── composables/                  # useTheme, usePersonal, useReveal, …
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

File-system routing. Two layouts: `default` (public) and `dashboard` (admin).

```
pages/
├── index.vue                     # Public landing — composes all sections in scroll order
├── admin/
│   ├── index.vue                 # Admin home / editor entry
│   ├── preview.vue               # Client-only preview route (ssr:false in nuxt.config)
│   └── feedback.vue              # Feedback inbox
└── feedback/
    └── [token].vue               # One-shot tokenized feedback form
```

Section anchors on `pages/index.vue` are driven by `navLinks` in `data/index.ts`. Each section root must carry `id="<anchor>"` matching `navLinks[i].href`.

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
└── admin/                        # Editor panels (dashboard only)
    ├── AdminPersonal.vue
    ├── AdminProjects.vue
    ├── AdminExperiences.vue
    ├── AdminEducation.vue
    ├── AdminSkills.vue
    ├── AdminActivities.vue
    ├── AdminReferences.vue
    └── PreviewButton.vue
```

Rules from [UI-Standards.md](UI-Standards.md): `components/ui/` must be stateless, `components/sections/` are page-level only, `components/admin/` is never used on public-facing routes.

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
└── useFormPreview.ts             # Preview helper for form-driven editors
```

Section composables (`use<Resource>`) follow the static-first pattern in [STACK.md §5](STACK.md).

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
assets/css/main.css   # Single Tailwind v4 entry. Theme tokens in @theme {}.
public/               # Served at site root — favicons, /images/ABIcon.svg, etc.
```

No other CSS files. No tailwind.config.ts. See [UI-Standards.md §2](UI-Standards.md) for the token contract.

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
