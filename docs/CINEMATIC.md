# Cinematic Standards — `/experience`

The design and engineering contract for the second surface at `baihaqie.com/experience`. Companion to [UI-Standards.md](UI-Standards.md), which governs `/` and stays the source of truth for the Apple-faithful Restrained vocabulary.

`/experience` does **not** invent its own design language. It uses the [Anatomy of Thrust](https://anatomy-of-thrust.netlify.app) design system verbatim — see [jet-engine-infographic/docs/DESIGN-SYSTEM.md](../../jet-engine-infographic/docs/DESIGN-SYSTEM.md). When AoT's spec and this doc disagree, AoT wins; update this file in the same PR.

> **Two surfaces, one author.** `/` is the fast, professional handshake. `/experience` is the cinematic frame for the work the handshake hints at. They share *nothing* visually — different tokens, different fonts, different motion register — and that contrast is the point. Do not bleed cinematic patterns onto `/` or restrained patterns into `/experience`.

---

## 1. Scope

This document covers the cinematic surface only:

- The route `/experience` (and any future `/experience/[slug]` case studies)
- The `cinematic` layout
- All components under `components/cinematic/`
- The `assets/css/cinematic.css` token sheet
- The hero CTA on `/` — a single `.btn-primary` labeled **"Experience my journey"** that `NuxtLink`s to `/experience`. This is the only piece of `/experience` that touches the restrained surface, and the choice to make it a primary button (instead of the quieter text link the original handoff brief proposed) is deliberate: `/experience` is the headline destination from `/`, not a footnote. The button keeps the restrained surface's own button vocabulary (`.btn-primary` from [main.css](../assets/css/main.css), SF Blue) — it does not borrow cinematic tokens. The register switch happens at the route boundary, not at the CTA.

Nothing else on `/` may pull from `cinematic.css` tokens. Conversely, nothing in the cinematic layout may import from `main.css` tokens (`--color-bg-raw`, `.btn-primary`, `<UiSectionHeading>`, etc.).

---

## 2. Vocabulary

All tokens live in [../assets/css/cinematic.css](../assets/css/cinematic.css), scoped under `:root[data-layout='cinematic']`. The scope is what keeps `/` clean: the cinematic stylesheet is loaded by `layouts/cinematic.vue` and its tokens only resolve on the route that sets the `data-layout` attribute on `<html>`.

### 2.1 Palette

| Token | Hex | Role |
|---|---|---|
| `--color-bg-base` | `#0A0B0F` | True near-black canvas. Never `#000`. |
| `--color-bg-surface` | `#13151C` | Card / panel surface. |
| `--color-bg-elevated` | `#1C1F28` | Hover / elevated surface. |
| `--color-ink-primary` | `#F5F5F0` | Warm white. All headlines. All data values. |
| `--color-ink-secondary` | `#B8BAC3` | Subline / body. |
| `--color-ink-muted` | `#8B8D98` | Labels. Meta. |
| `--color-ink-faint` | `#5A5C66` | Tertiary, edges. |
| `--color-cool` | `#4FC3F7` | Cool accent. Phases 0–2 lead. Phase 3 supports. |
| `--color-cool-soft` | `#8FB4C8` | Cruise — calm sustained cool. |
| `--color-hot-soft` | `#FF8C42` | FL380 — the work. |
| `--color-hot` | `#FF6B35` | Descent. |
| `--color-amber` | `#FFB07A` | Arrival warm finish. |
| `--color-hairline` | `rgba(255,255,255,0.08)` | 1px borders. HUD edges. |
| `--color-focus-ring` | `rgba(79,195,247,0.5)` | All focus outlines on this surface. |

**80/15/5 color rule.** ~80% bg + warm-white ink, ~15% one accent (cool early, hot late), ~5% the opposing accent for contrast. **Never put cool and hot at full saturation side-by-side.** One leads, the other supports as rim/hairline.

### 2.2 Typography

| Family | CSS var | Role |
|---|---|---|
| Playfair Display Variable | `--font-display` | All headlines. Weight 400. Letter-spacing `-0.02em`. Line-height `1.05`. |
| Geist | `--font-body` | All body, subline, UI copy. Line-height `1.6`. |
| JetBrains Mono Variable | `--font-mono` | All labels, meta, data values, HUD copy. |

**Headlines are always warm white** (`var(--color-ink-primary)`). Never tinted with cool or hot. **Ever.**

**Data values are always warm white. Labels are always muted gray.** Never tint either.

**Numbers always use `tabular-nums`** — without it, animated counters jitter as digits change width.

**Labels are always uppercase, `0.2em` letter-spacing.** Gives them the architectural / schematic feel.

Font scale tokens (`--font-display-hero`, `--font-display-large`, `--font-body-large`, `--font-label`, etc.) live in cinematic.css §Typography. Use the tokens; don't write raw `clamp()` values inline.

### 2.3 Motion

- **Easings:** `--ease-out`, `--ease-in-out`, `--ease-precise`, `--ease-cinematic` (the slow cinematic reveal). No bouncy / elastic easings. **Ever.**
- **Durations:** `--duration-quick` (0.3s) for hovers, `--duration-cinematic` (1.2s) for entrance choreography, `--duration-counter` (1.5s) for data count-ups.
- **No purple, no pink, no glassmorphism, no glow on text** (per AoT §2.3). Glow shadows may rim hot pixels at the engine / FL380 work tiles only — never on type.
- **Border radii:** `--radius-sharp` (2px) for buttons (architectural), `--radius-card` (4px) for cards, `--radius-surface` (12px) only on the outermost wrapper.
- **Reduced motion:** all GSAP timelines must short-circuit under `prefers-reduced-motion: reduce` (use `gsap.matchMedia` per HeroSection.vue's pattern). The Three.js scene halts its render loop and snaps the camera to each phase's final pose.

---

## 3. Section structure — the flight

A single continuous flight, scrolled top-to-bottom. Each phase is one section with one anchor.

| # | Phase | Section component | Accent | Anchor |
|---|---|---|---|---|
| 00 | Pre-flight | `<CinematicHeroPhase />` | cool | `#preflight` |
| 01 | Takeoff (Education — UM) | `<CinematicEducationPhase />` | cool | `#takeoff` |
| 02 | Climb (Faztech) | `<CinematicEarlyWorkPhase />` | cool-soft | `#climb` |
| 03 | Cruise (Razer) | `<CinematicRazerPhase />` | cool-soft | `#cruise` |
| 04 | FL380 — Selected work (AoT) | `<CinematicWorkGalleryPhase />` | hot-soft | `#fl380` |
| 05 | FL380 — Other work | (part of `<CinematicWorkGalleryPhase />`) | hot-soft | `#fl380-other` |
| 06 | Descent (Axel Nova) | `<CinematicAxelNovaPhase />` | hot | `#descent` |
| 07 | Arrival (Contact) | `<CinematicContactPhase />` | amber | `#arrival` |

Phase order is fixed by the flight metaphor. Do not reorder. Do not skip phases. Do not add a ninth phase without a flight-stage to map it to.

---

## 4. The HUD

A single overlay on the canvas. Reads like a page-corner spec sheet in an aviation magazine, not a cockpit display.

```
PHASE    CRUISE
ALT      32,000 ft
STAGE    CURRENT WORK
──────────────────
04 / 08
```

- All mono (`var(--font-mono)`), `0.2em` letter-spacing, uppercase labels
- Labels in `var(--color-ink-muted)`, values in `var(--color-ink-primary)`
- 1px hairline border (`var(--color-hairline)`)
- **No `backdrop-filter`, no glow, no soft shadow.** Sit flat against the scene.
- No blinking nav lights, no flight callsigns, no decorative cockpit chrome

Progress bar at the bottom of the viewport, also mono. Click any phase number to teleport — implemented as a Lenis `scrollTo(target)` to the section anchor.

---

## 5. File layout

```
pages/experience/index.vue              # the cinematic page
layouts/cinematic.vue                   # dark shell + html[data-layout=cinematic]

components/cinematic/                   # one component per phase + the scene + the HUD
├── CinematicIntro.vue                  # ~3s portal moment (weekend 8)
├── CinematicFlightScene.vue            # Three.js scene wrapper (weekends 2–3)
├── CinematicPhaseHud.vue               # the overlay (weekend 4)
├── CinematicHeroPhase.vue
├── CinematicEducationPhase.vue
├── CinematicEarlyWorkPhase.vue
├── CinematicRazerPhase.vue
├── CinematicWorkGalleryPhase.vue
├── CinematicAxelNovaPhase.vue
└── CinematicContactPhase.vue

                                        # (no separate doorway component — the
                                        # primary button on / lives inline in
                                        # components/sections/HeroSection.vue)

composables/
├── useLenis.ts                         # smooth-scroll lifecycle
├── useFlightScroll.ts                  # weekend 3: ScrollTrigger → camera/bank/exposure
└── usePhaseState.ts                    # weekend 4: current phase + click-to-teleport

assets/css/cinematic.css                # the tokens (this file)
public/fonts/geist/Geist-Variable.woff2 # self-hosted Geist (npm geist package is next/font-flavored, ships no plain CSS)
```

Auto-import path-prefix means `components/cinematic/FlightScene.vue` resolves to `<CinematicFlightScene />`.

---

## 6. Hard rules

These are non-negotiable. If a rule gets in the way, update this file in the same PR.

1. **The cinematic stylesheet must never be imported into `/`.** It is loaded by `layouts/cinematic.vue` via `import '~/assets/css/cinematic.css'` and nowhere else. Do not add it to `nuxt.config.ts`'s global `css:` array.
2. **`/experience` is `ssr: false`** — Lenis, GSAP ScrollTrigger and Three.js all read `window` / `document` / `requestAnimationFrame`. The route rule is in `nuxt.config.ts` and must stay.
3. **`<UiSectionHeading>`, `.btn`, `.card`, `.skill-tag`** and other primitives from `/` do not exist on `/experience`. Use cinematic equivalents from `components/cinematic/`. If a new primitive is needed, add it there, not in `components/ui/`.
4. **Geist must be served from `/public/fonts/geist/`**, not from `node_modules`. The `geist` npm package is a next/font helper and ships no plain CSS; we copy the variable woff2 into `/public` at install time. If `npm install` ever re-fetches a newer Geist, mirror the file by hand.
5. **No backdrop-filter on the HUD or any panel.** The cinematic register reads as flat editorial print, not frosted-glass dashboard.
6. **Pause the render loop on `visibilitychange`** when the page is hidden. Cap `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`. Both land in weekend 7's performance pass.
7. **No emoji** in copy. Aviation editorial register, not chat register.

---

## 7. Voice

Per AoT §12 (verbatim):

- **Precise, not chatty.** "Twin-spool architecture" beats "the engine has two parts."
- **Active, not passive.** "Cool the blades" beats "the blades are cooled."
- **No exclamation marks.** Ever.
- Headlines lean poetic; data leans technical. The contrast is the voice.

---

## 8. Adding a new phase — checklist

(For when the flight ever extends beyond eight.)

1. File: `components/cinematic/<Name>Phase.vue`.
2. Root: `<section id="<anchor>" class="phase">`. Add `{ phase: NN, label: '...', anchor: '<anchor>', accent: 'cool|cool-soft|hot-soft|hot|amber' }` to the phase manifest in `composables/usePhaseState.ts`.
3. Headline: Playfair `var(--font-display-large)`, sentence case with trailing `.`.
4. Label: JetBrains Mono `var(--font-label)`, uppercase, `0.2em` letter-spacing, `var(--color-ink-muted)`.
5. Body: Geist `var(--font-body-large)`, `var(--color-ink-secondary)`, max `60ch` measure.
6. Mount inside `pages/experience/index.vue` between adjacent phases.
7. Add a camera pose and sky exposure preset for this phase to `composables/useFlightScroll.ts` (weekend 3 deliverable).
8. Verify reduced-motion (camera snaps to pose), 375×667 mobile (per Q3 outcome: same scene scaled down — flag perf if poor), and keyboard navigation.

---

## 9. The one question that settles every decision

Borrowed verbatim from [jet-engine-infographic/docs/DESIGN-SYSTEM.md §15](../../jet-engine-infographic/docs/DESIGN-SYSTEM.md):

> *"Would this appear in a 3DS or Rolls-Royce brand film?"*
>
> If yes → ship it. If no → cut it.

When in doubt, ask this. It's the whole system in one sentence.
