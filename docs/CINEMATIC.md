# Cinematic Standards — `/experience`

The design and engineering contract for the second surface at `baihaqie.com/experience`. Companion to [UI-STANDARDS.md](UI-STANDARDS.md), which governs `/`, admin, and feedback in the Apple-faithful Restrained vocabulary.

`/experience` does **not** invent its own design language. It inherits the [Anatomy of Thrust](https://anatomy-of-thrust.netlify.app) vocabulary verbatim — see [jet-engine-infographic/docs/DESIGN-SYSTEM.md](../../jet-engine-infographic/docs/DESIGN-SYSTEM.md). When AoT's spec and this doc disagree, AoT wins; update this file in the same PR.

> **Two surfaces, one author.** `/` is the fast, professional handshake. `/experience` is the cinematic frame for the work the handshake hints at. They share *nothing* visually — different tokens, different fonts, different motion register — and that contrast is the point. Do not bleed cinematic patterns onto `/` or restrained patterns into `/experience`.

---

## 1. Scope

This document covers the cinematic surface only:

- The route `/experience` (and any future `/experience/[slug]` case studies)
- The `cinematic` layout — sets `data-layout="cinematic"` on `<html>`, paints body bg from cinematic tokens
- All components under `components/cinematic/`
- All composables prefixed `useFlight*` plus `useLenis`, `usePhaseState`
- The `assets/css/cinematic.css` token sheet
- Static assets used only by this surface: `public/fonts/geist/`, `public/images/A350_summary.png`, `public/models/a350.glb`
- The hero CTA on `/` — a single `.btn-primary` labeled **"Experience my journey"** that `NuxtLink`s to `/experience`. The button keeps the restrained surface's button vocabulary (`.btn-primary` from [main.css](../assets/css/main.css), SF Blue) — it does not borrow cinematic tokens. The register switch happens at the route boundary.

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
| `--color-ink-primary` | `#F5F5F0` | Warm white. Most headlines. Most data values. |
| `--color-ink-secondary` | `#B8BAC3` | Subline / body. |
| `--color-ink-muted` | `#8B8D98` | Labels. Meta. |
| `--color-ink-faint` | `#5A5C66` | Tertiary, edges. |
| `--color-cool` | `#4FC3F7` | Cool accent. Phases 0–2 lead. Active HUD phase underline. |
| `--color-cool-soft` | `#8FB4C8` | Cruise — calm sustained cool. |
| `--color-hot-soft` | `#FF8C42` | FL380 — the work. |
| `--color-hot` | `#FF6B35` | Descent. |
| `--color-amber` | `#FFB07A` | Arrival warm finish. |
| `--color-hairline` | `rgba(255,255,255,0.08)` | 1px borders. HUD edges. Project tile borders. |
| `--color-divider` | `rgba(255,255,255,0.12)` | The 56px hairline `<hr class="phase__rule">` between name and meta in each phase. |
| `--color-focus-ring` | `rgba(79,195,247,0.5)` | All focus outlines on this surface. |

**80/15/5 colour rule.** ~80% bg + warm-white ink, ~15% one accent (cool early, hot late), ~5% the opposing accent for contrast. **Never put cool and hot at full saturation side-by-side.** One leads, the other supports as rim/hairline.

**Hero title exception.** The Phase 00 hero display headline (`.phase--hero .phase__display`) uses a deep warm near-black (`#14110D`) instead of `--color-ink-primary` — reads as an editorial magazine masthead against the cinematic-twilight sky.

**Phase masthead panel exception.** Phases 01–08 invert the cinematic register *inside* the masthead block — `<CinematicPhaseSection>`'s `.phase__masthead` is a warm-white panel (`var(--color-ink-primary)` background) with deep warm near-black (`#14110D`) ink for headline, subline, meta, and body. The dataline above the panel (`.phase__label`) and everything outside the panel (HUD, the dark sky itself, the phase-label mono dataline) stay in their original warm-white-on-dark register. The mixed register is intentional: cinematic register for the world the viewer is *in*, editorial print register for the words they are *reading*. FL380 project tiles invert their own surface to match the warm-white panel context (light surface, warm near-black ink).

### 2.2 Typography

| Family | CSS var | Source | Role |
|---|---|---|---|
| Playfair Display Variable | `--font-display` | `@fontsource-variable/playfair-display` | All headlines. Weight 400. Letter-spacing `-0.02em`. Line-height `1.05`. |
| Geist | `--font-body` | Self-hosted woff2 from `/public/fonts/geist/` | All body, subline, UI copy. Line-height `1.6`. |
| JetBrains Mono Variable | `--font-mono` | `@fontsource-variable/jetbrains-mono` | All labels, meta, data values, HUD copy, project stack lines. |

**Headlines are always warm white** (`var(--color-ink-primary)`) — with the deliberate exception of the hero display (see §2.1). Never tinted with cool or hot. **Ever.**

**Data values are always warm white. Labels are always muted gray.** Never tint either.

**Numbers always use `tabular-nums`** — without it, animated counters jitter as digits change width. The HUD enforces this on every numeric readout.

**Labels are always uppercase, `0.2em` letter-spacing** (or `0.3em` for very small contexts like the scroll hint). Gives them the architectural / schematic feel.

Font scale tokens (`--font-display-hero`, `--font-display-large`, `--font-body-large`, `--font-label`, etc.) live in cinematic.css §Typography. Use the tokens; don't write raw `clamp()` values inline.

### 2.3 Motion

- **Easings:** `--ease-out`, `--ease-in-out`, `--ease-precise`, `--ease-cinematic` (the slow cinematic reveal). No bouncy / elastic easings. **Ever.**
- **Durations:** `--duration-quick` (0.3s) for hovers, `--duration-cinematic` (1.2s) for entrance choreography, `--duration-counter` (1.5s) for data count-ups.
- **No purple, no pink, no glassmorphism, no glow on text** (per AoT §2.3). Glow may be applied to 3D elements (engine bloom in AoT, hot-pixel rim in FL380 tiles) — never on type.
- **Border radii:** `--radius-sharp` (2px) for buttons (architectural), `--radius-card` (4px) for cards, `--radius-surface` (12px) only on the outermost wrapper.
- **Reduced motion:** all GSAP timelines must short-circuit under `prefers-reduced-motion: reduce`. Use `gsap.matchMedia` (see [Welcome.vue](../components/cinematic/Welcome.vue) and [pages/experience/index.vue](../pages/experience/index.vue) for the pattern). The CSS chevron-bounce in the scroll hint is disabled via `@media (prefers-reduced-motion: reduce)`. The Three.js scene's perpetual cloud drift still runs (it's barely perceptible); the OrbitControls damping stays enabled either way.

---

## 3. The three-act flight

`/experience` plays in three acts, each with its own runtime.

### Act 1 — Auto-play intro (~3.7s)

Fires on page mount before the user can interact.

| Component | Role |
|---|---|
| `<CinematicIntro>` | Black overlay with white-inverted A350 silhouette (`/images/A350_summary.png`) rising from `y: 100vh` to `y: -100vh` over 3s linear. Overlay then fades to reveal the sky behind. Emits `complete`. |

Lenis is paused throughout Act 1 so a stray scroll input can't interrupt the reveal.

### Act 2 — Welcome card (~2.3s, then holds)

Mounts only after `<CinematicIntro>` emits `complete`.

| Component | Role |
|---|---|
| `<CinematicWelcome>` | "Welcome aboard / to my journey!" in Playfair, fades in over 0.8s, holds. After 1.5s hold, a `SCROLL ↓` cue fades in below with a perpetual chevron bounce. Emits `complete` at the end of the hold; **does not auto fade out** — the user dismisses it by scrolling. |

Lenis stays paused through Act 2's fade-in + hold. On `complete`, Lenis resumes and Act 3 arms.

### Act 3 — Scroll-driven reveal (Apple-style radial mask iris)

User scrolls. ScrollTrigger pins `.phase--hero` for `+=150%` of scroll distance. During the pin, a single `gsap.timeline({ scrub: 1 })` scrubs three independent reveals from the centre of the welcome text outward:

| Tween | Duration (timeline fraction) | What |
|---|---|---|
| `.cinematic-overlay { --hole-r: 0 → 150vw }` | 0.0 → 1.0 | Radial-mask hole grows from the centre, dissolving the black overlay outward. Sky + clouds + aircraft pop out from the wording. |
| `.welcome__text { scale: 1 → 0.5, opacity: 1 → 0 }` | 0.0 → 0.6 | Welcome text shrinks and fades as the world appears. |
| `.welcome__hint { opacity: 1 → 0 }` | 0.0 → 0.15 | Scroll hint exits fast — it's a doorway, not a passenger. |
| Aircraft materials `opacity: 0 → 1` | 0.0 → 0.4 | The 3D A350 becomes visible during the iris reveal. |
| `.hero-reveal { opacity: 0 → 1, y: 24 → 0 }` (staggered 0.05) | 0.5 → 1.0 | Hero copy (dataline + lower-third masthead) assembles after the sky is visible. |

After the pin releases, the user scrolls naturally through phases 01–08. A **second** ScrollTrigger spans from `.phase--takeoff` (Phase 02) to `.phase--arrival` (Phase 08) and scrubs the aircraft's pose:

| Scroll fraction | Aircraft pose |
|---|---|
| 0.00 → 0.10 | `rotation.x: 0 → -0.16` rad (nose up — takeoff climb) |
| 0.25 → 0.40 | `rotation.x: -0.16 → 0` (level off into cruise) |
| 0.40 → 0.70 | hold level (FL380) |
| 0.70 → 0.85 | `rotation.x: 0 → 0.10` (nose down — descent) |
| 0.85 → 0.95 | `rotation.x: 0.10 → 0.18` + `position.y: 2 → 0` (landing pose + drop in frame) |

The camera itself is not scroll-driven. Instead, `OrbitControls` runs a continuous **autoRotate** orbit around the aircraft target — `autoRotateSpeed = 0.6`, matching the jet-engine-infographic Scene 0 / finale pattern. AutoRotate stays armed throughout the experience but only animates while `controls.enabled` is true (after welcome clears). The OrbitControls `start` event listener flips `autoRotate = false` immediately on the first user drag, so the page never fights the user; from that point on, the camera is fully theirs to position.

Damped, pan disabled, zoom disabled (mouse-wheel stays free for page scroll), disabled until welcome clears.

---

## 4. Phase manifest

Nine phases. The canonical list lives in [composables/usePhaseState.ts](../composables/usePhaseState.ts)'s `PHASES` constant — the HUD reads from it and the section selectors below match what the ScrollTriggers expect.

Each non-hero phase renders as a **flight-strip card** through `<CinematicPhaseSection>`: warm-white panel, mono **telemetry row leading** with real-ish A350-1000 ops data, full-width hairline, then Playfair headline + optional subline + optional meta + slotted body. The `phaseLabel` prop is the telemetry string — `phase-label="CRUISE · FL380 · M.85 · 478 KT GS"` — replacing the old `PHASE NN · LABEL` dataline format. Phase 00 (hero) is inline because of its pin behaviour and the `.hero-reveal` class names the master scroll choreography targets.

| # | Phase | Selector | HUD label | HUD alt | HUD stage | Telemetry on card | Source |
|---|---|---|---|---|---|---|---|
| 00 | Pre-flight | `.phase--hero` | PRE-FLIGHT | GATE | FLIGHT AB | `PRE-FLIGHT · GATE A12 · FLIGHT AB` | inline in `pages/experience/index.vue` |
| 01 | Taxi | `.phase--ascent` | TAXI | RWY 36L | ABOUT | `TAXI · RWY 36L · GROUND SPEED 14 KT` | `personal.bio[0]` via `usePersonal` |
| 02 | Takeoff | `.phase--takeoff` | TAKEOFF | V_R | EDUCATION | `TAKEOFF · V_R 165 KT · 1,800 FPM CLIMB` | `data.education` (UM undergrad only) |
| 03 | Climb | `.phase--climb` | CLIMB | FL180 | EARLY WORK | `CLIMB · 18,000 FT · 280 KT · 1,500 FPM` | `data.experiences[id=faztech]` |
| 04 | Cruise | `.phase--cruise` | CRUISE | FL320 | CURRENT WORK | `CRUISE · FL320 · M.82 · 462 KT GS` | `data.experiences[id=razer]` |
| 05 | Step climb | `.phase--fl380-selected` | CRUISE | FL380 | SELECTED WORK | `STEP CLIMB · FL380 · M.85` | `data.projects.filter(p => p.featured)` |
| 06 | Cruise | `.phase--fl380-other` | CRUISE | FL380 | OTHER ALTITUDES | `CRUISE · FL380 · M.85 · 478 KT GS` | `data.projects.filter(p => !p.featured)` |
| 07 | Top of descent | `.phase--descent` | DESCENT | TOD | BUILDING | `TOP OF DESCENT · FL120 · -2,000 FPM` | inline (Axel Nova Ventures) |
| 08 | Touchdown | `.phase--arrival` | TOUCHDOWN | V_REF | CONTACT | `TOUCHDOWN · V_REF 138 KT · TAXI-IN` | `data.personal` |

The aviation status leads each card; the bio chapter sits beneath the hairline as the editorial content. Real A350-1000 ops numbers throughout — anyone who flies will recognise the telemetry as legitimate (V_R is the rotation speed, M.85 is the typical Mach number at cruise, V_REF is the touchdown reference speed). HUD's `alt` column carries the most evocative datum per phase, not always literal altitude (e.g. `RWY 36L` for taxi, `V_R` for takeoff).

---

## 5. The HUD

A single overlay on the canvas. Reads like a page-corner spec sheet in an aviation magazine, not a cockpit display.

```
PHASE    CRUISE
ALT      32,000 FT
STAGE    CURRENT WORK
─────────────────
00 01 02 03 04 05 06 07
```

- Top-right of the viewport (`position: fixed; top: var(--space-8); right: var(--space-8)`), z-index `var(--z-controls)` (10)
- All mono (`var(--font-mono)`), `0.2em` letter-spacing, uppercase labels
- Labels in `var(--color-ink-muted)`, values in `var(--color-ink-primary)` with `tabular-nums`
- 1px hairline border (`var(--color-hairline)`), `rgba(10,11,15,0.55)` tinted surface — **no `backdrop-filter`, no glow, no soft shadow**. Flat against the scene.
- Active phase number in warm white with a 1px cool-blue underline; inactive in `--color-ink-faint`
- Every phase number is a `<button>` — click teleports via `lenis.scrollTo(el, { offset: 0 })`
- Hidden below 640px viewport width (proper mobile treatment is a follow-up)
- Mounts after `welcomeDone` becomes true. Fades in with a small slide-down (0.8s expo.out, 0.2s delay).

`usePhaseState` tracks which phase the viewer is reading via one `ScrollTrigger` per phase (`onToggle` sets the `active` ref). Phase 00's trigger uses `start: 'top top'; end: '+=150%'` to cover the entire pin span; others use `start: 'top center'; end: 'bottom center'` so the readout switches as each phase's centre crosses the viewport centre.

---

## 6. File layout

```
pages/experience/index.vue              # composes all acts + phases + scene + HUD
layouts/cinematic.vue                   # dark shell + html[data-layout=cinematic] + Lenis init

components/cinematic/
├── Intro.vue                           # Act 1 — plane silhouette rises through black
├── Welcome.vue                         # Act 2 — "Welcome aboard / to my journey!" + scroll hint
├── Overlay.vue                         # persistent black with radial-mask iris (--hole-r)
├── FlightScene.vue                     # Three.js canvas mount (host + lifecycle)
├── Aircraft.vue                        # trigger for the GLB A350 (no DOM output)
├── HUD.vue                             # top-right page-corner spec sheet + phase nav
└── PhaseSection.vue                    # generic lower-third phase layout

composables/
├── useLenis.ts                         # smooth-scroll lifecycle + ScrollTrigger.update binding
├── useFlightScene.ts                   # renderer + camera + sky shader + clouds + lighting + OrbitControls
├── useFlightAircraft.ts                # GLB load + normalize + cruise pose lifecycle
├── useFlightScroll.ts                  # master scroll choreography (iris reveal + aircraft pitch/landing)
└── usePhaseState.ts                    # active phase tracking + click-to-jump (PHASES manifest)

assets/css/cinematic.css                # the token sheet (this contract)
public/fonts/geist/Geist-Variable.woff2 # self-hosted Geist
public/images/A350_summary.png          # intro silhouette (top-down)
public/models/a350.glb                  # 3D aircraft (DRACO-compressed, ~808KB)
```

Auto-import path-prefix means `components/cinematic/FlightScene.vue` resolves to `<CinematicFlightScene />`. There is **no separate doorway component** on `/` — the primary CTA lives inline in `components/sections/HeroSection.vue`.

---

## 7. Hard rules

These are non-negotiable. If a rule gets in the way, update this file in the same PR.

1. **The cinematic stylesheet must never be imported into `/`.** It is loaded by `layouts/cinematic.vue` via `import '~/assets/css/cinematic.css'` and nowhere else. Do not add it to `nuxt.config.ts`'s global `css:` array.
2. **`/experience` is `ssr: false`** — Lenis, GSAP ScrollTrigger, Three.js, and the DRACO CDN all need `window` / `document`. The route rule is in `nuxt.config.ts` and must stay.
3. **Three.js sub-imports must be pre-bundled** in `vite.optimizeDeps.include`: `Sky.js`, `GLTFLoader.js`, `DRACOLoader.js`, `OrbitControls.js`. Without this, dev triggers a page reload the first time the scene mounts.
4. **`<UiSectionHeading>`, `.btn`, `.card`, `.skill-tag`** and other primitives from `/` do not exist on `/experience`. Use cinematic equivalents (`<CinematicPhaseSection>`, etc.). New cinematic primitives go in `components/cinematic/`, not `components/ui/`.
5. **Geist must be served from `/public/fonts/geist/`**, not from `node_modules`. The `geist` npm package is a next/font helper and ships no plain CSS; we copy the variable woff2 into `/public` at install time. If `npm install` ever re-fetches a newer Geist, mirror the file by hand.
6. **No backdrop-filter on the HUD or any panel.** The cinematic register reads as flat editorial print, not frosted-glass dashboard.
7. **Pin trigger must not be an ancestor of position:fixed overlays.** ScrollTrigger's pin can convert the pinned element into a containing block for fixed descendants, which makes them follow the pin instead of the viewport. We pin `.phase--hero` (a sibling of the fixed overlays), never `.experience-root`.
8. **Pause the render loop on `visibilitychange`** when the page is hidden. Cap `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`. Both live in `useFlightScene.ts`.
9. **OrbitControls stays disabled until `welcomeDone`.** Dragging on the overlay-covered area would silently rotate the camera. The page calls `flightScene.setControlsEnabled(true)` after welcome clears.
10. **No emoji** in copy. Aviation editorial register, not chat register.

---

## 8. Voice

Per AoT §12 (verbatim):

- **Precise, not chatty.** "Twin-spool architecture" beats "the engine has two parts."
- **Active, not passive.** "Cool the blades" beats "the blades are cooled."
- **No exclamation marks.** Headlines and meta lines are period-terminated. *(Note: the welcome card "Welcome aboard / to my journey!" intentionally breaks this rule — it's the one moment of warmth in an otherwise restrained voice. Don't extend the exception to other copy.)*
- Headlines lean poetic; data leans technical. The contrast is the voice.

---

## 9. Adding a new phase — checklist

1. Add a new `<CinematicPhaseSection>` invocation to `pages/experience/index.vue` between adjacent phases. Use a unique `class="phase--<name>"` for selector targeting.
2. Add a `Phase` entry to `PHASES` in [`composables/usePhaseState.ts`](../composables/usePhaseState.ts) with the matching `selector`, `label`, `alt`, and `stage`.
3. If the new phase warrants a pose change, extend the aircraft choreography keyframes in [`composables/useFlightScroll.ts`](../composables/useFlightScroll.ts) (the inner `flightTl` timeline).
4. Headlines: Playfair `var(--font-display-large)`, sentence case with trailing `.`.
5. Datelines: JetBrains Mono `var(--font-label)`, uppercase, `0.2em` letter-spacing, `var(--color-ink-muted)`.
6. Body: Geist `var(--font-body)`, `var(--color-ink-secondary)`. Default body styling caps `<p>` measure at `60ch`.
7. Verify reduced-motion (intro skips, aircraft pose snaps), 375×667 mobile (Q3: same scene scaled down — flag perf if poor), and keyboard navigation (each HUD phase number is focusable).

---

## 10. Tunable knobs — quick reference

| What | Where | Default |
|---|---|---|
| Sky brightness | `useFlightScene.ts` `toneMappingExposure` | `0.18` |
| Sky atmosphere | `useFlightScene.ts` `buildSky()` (turbidity, rayleigh, sun phi/theta) | turbidity 8, rayleigh 1.2, sun 12° low / 200° behind |
| Cloud density | `useFlightScene.ts` `buildClouds(16)` count + `baseOpacity` range | 16 clouds, `0.25 + 0.25` random opacity |
| Airport ground colour | `useFlightScene.ts` `buildAirport()` ground material | `0x1A1F1A` (dark night-green) at `y = -15` |
| Runway colour + size | `useFlightScene.ts` `buildAirport()` runway material + `PlaneGeometry` | `0x282C32` (dark asphalt), `1500 × 60` along `+X` |
| Aircraft size | `useFlightAircraft.ts` `TARGET_FUSELAGE_LENGTH` | `30` scene units |
| Aircraft initial pose | `useFlightAircraft.ts` `startCruise()` rotation/position | rotation.y=π/2, position (0, 2, -45) |
| Intro plane duration | `Intro.vue` GSAP `duration: 3` | 3s linear |
| Welcome timings | `Welcome.vue` timeline (fade-in `0.8`, hold `1.5`) | — |
| Iris reveal pin distance | `pages/experience/index.vue` `flightScroll.init({ end: '+=150%' })` | 150% of viewport |
| Aircraft choreography keyframes | `useFlightScroll.ts` inner `flightTl` | see §3 table |
| Camera autoRotate speed | `useFlightScene.ts` `controls.autoRotateSpeed` | `0.6` (matches jet-engine-infographic) |
| Masthead panel background | `components/cinematic/PhaseSection.vue` `.phase__masthead` `background` | `var(--color-ink-primary)` — solid warm-white panel |
| HUD position | `HUD.vue` `.hud { top, right }` | `var(--space-8)` from top + right |

---

## 11. The one question that settles every decision

Borrowed verbatim from [jet-engine-infographic/docs/DESIGN-SYSTEM.md §15](../../jet-engine-infographic/docs/DESIGN-SYSTEM.md):

> *"Would this appear in a 3DS or Rolls-Royce brand film?"*
>
> If yes → ship it. If no → cut it.

When in doubt, ask this. It's the whole system in one sentence.
