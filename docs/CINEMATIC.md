# Cinematic Standards — `/experience`

The design and engineering contract for the second surface at `baihaqie.com/experience`. Companion to [UI-STANDARDS.md](UI-STANDARDS.md), which governs `/`, admin, and feedback in the Apple-faithful Restrained vocabulary.

`/experience` does **not** invent its own design language. It inherits the [Anatomy of Thrust](https://anatomy-of-thrust.netlify.app) vocabulary verbatim — see [jet-engine-infographic/docs/DESIGN-SYSTEM.md](../../jet-engine-infographic/docs/DESIGN-SYSTEM.md). When AoT's spec and this doc disagree, AoT wins; update this file in the same PR.

> **Two surfaces, one author.** `/` is the fast, professional handshake. `/experience` is the cinematic frame for the work the handshake hints at. They share *nothing* visually — different tokens, different fonts, different motion register — and that contrast is the point. Do not bleed cinematic patterns onto `/` or restrained patterns into `/experience`.

> **Current state.** `/experience` is a single **scroll-driven cinematic flight, full stop** — no editorial body. A silhouette splash → a "Welcome aboard." greeting that highlights a tagline word-by-word and zooms out → a dark-overlay reveal of the **A350 already aloft** → the aircraft flying a scroll-driven 3D spline past **four career waypoints** (which climb to a cruise peak then **descend into a contact-finale arrival**) while a **live telemetry HUD** reads its altitude, heading and speed, over a sun-lit sky with drifting clouds, a star field at altitude, and wingtip contrails. The camera is fully scripted by a chase rig — there is **no OrbitControls / Pilot Mode** (replaced 2026-06; see §4). About / Education / Projects / Contact deliberately live only on `/` — repeating them here was redundant; the four waypoints carry the journey. Built from the approved prototype in `design_handoff_experience_flight/`.

---

## 1. Scope

This document covers the cinematic surface only:

- The route `/experience` (and any future `/experience/[slug]` case studies)
- The `cinematic` layout — sets `data-layout="cinematic"` on `<html>`, paints body bg from cinematic tokens
- All components under `components/cinematic/` (whether currently rendered or kept-for-future, see §6)
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
| `--color-ink-primary` | `#F5F5F0` | Warm white. All headlines. All data values. |
| `--color-ink-secondary` | `#B8BAC3` | Subline / body. Default button label colour. |
| `--color-ink-muted` | `#8B8D98` | Labels. Meta. |
| `--color-ink-faint` | `#5A5C66` | Tertiary, edges. |
| `--color-cool` | `#4FC3F7` | Cool accent. Hover-up colour on links. |
| `--color-cool-soft` | `#8FB4C8` | Calm sustained cool — link hover ramp. |
| `--color-hot-soft` | `#FF8C42` | (reserved — used in stripped FL380 phase) |
| `--color-hot` | `#FF6B35` | (reserved — used in stripped descent phase) |
| `--color-amber` | `#FFB07A` | (reserved — used in stripped arrival phase) |
| `--color-hairline` | `rgba(255,255,255,0.08)` | 1px borders. HUD edges. Panel borders. CTA borders. |
| `--color-divider` | `rgba(255,255,255,0.12)` | (reserved — used in stripped phase mastheads) |
| `--color-focus-ring` | `rgba(79,195,247,0.5)` | All focus outlines on this surface. |

**80/15/5 colour rule.** ~80% bg + warm-white ink, ~15% one accent (cool early, hot late), ~5% the opposing accent for contrast. **Never put cool and hot at full saturation side-by-side.** One leads, the other supports as rim/hairline.

**Compass needle exception.** The Pilot Mode compass needle uses `#E11D2A` — a clean compass-red intentionally outside the cinematic palette. The cinematic cool/hot tokens are too blue / too orange-toned for the universal red-needle convention readers recognise at a glance. This is the **only** hardcoded colour on this surface; if any other red surfaces, ask before adding.

### 2.2 Typography

| Family | CSS var | Source | Role |
|---|---|---|---|
| Playfair Display Variable | `--font-display` | `@fontsource-variable/playfair-display` | All headlines. Weight 400. Letter-spacing `-0.02em`. Line-height `1.05`. Currently only the welcome card uses this. |
| Geist | `--font-body` | Self-hosted woff2 from `/public/fonts/geist/` | All body, subline, UI copy. Line-height `1.6`. |
| JetBrains Mono Variable | `--font-mono` | `@fontsource-variable/jetbrains-mono` | All labels, meta, data values, CTA labels, compass readouts. |

**Headlines are always warm white** (`var(--color-ink-primary)`). Never tinted with cool or hot.

**Data values are always warm white. Labels are always muted gray.** Never tint either.

**Numbers always use `tabular-nums`** — without it, animated counters jitter as digits change width. The compass readouts (`HDG 087° E`, `PITCH +05°`) enforce this.

**Labels are always uppercase, `0.2em` letter-spacing** (or `0.18em` for slightly tighter contexts like CTAs and compass readouts). Gives them the architectural / schematic feel.

Font scale tokens (`--font-display-hero`, `--font-display-large`, `--font-body-large`, `--font-label`, `--font-ui`, etc.) live in cinematic.css §Typography. Use the tokens; don't write raw `clamp()` values inline.

### 2.3 Motion

- **Easings:** `--ease-out`, `--ease-in-out`, `--ease-precise`, `--ease-cinematic`. No bouncy / elastic easings. **Ever.** GSAP-named easings (`expo.out`, `power2.inOut`, `sine.inOut`) are also used where GSAP-native makes sense — they all land in the same restrained register.
- **Durations:** `--duration-quick` (0.3s) for hovers + small state changes, `--duration-cinematic` (1.2s) for entrance choreography + CTA crossfades. The Pilot Mode exit tween uses an explicit 0.7s for the camera reset — long enough to read as deliberate, short enough not to feel like the page is holding the user hostage.
- **No purple, no pink, no glassmorphism, no glow on text** (per AoT §2.3). Glow may be applied to 3D elements (engine bloom in AoT, hot-pixel rim on tiles) — never on type.
- **Border radii:** `--radius-sharp` (2px) for buttons (architectural), `--radius-card` (4px) for cards, `--radius-surface` (12px) only on the outermost wrapper. CTAs use `--radius-sharp`.
- **Reduced motion:** all GSAP timelines must short-circuit under `prefers-reduced-motion: reduce`. Use `gsap.matchMedia` (see [Welcome.vue](../components/cinematic/Welcome.vue) and [pages/experience/index.vue](../pages/experience/index.vue) for the pattern). The CSS chevron-bounce in the scroll hint is disabled via `@media (prefers-reduced-motion: reduce)`. The Three.js scene's perpetual cloud drift still runs (it's barely perceptible); the OrbitControls damping stays enabled either way.

---

## 3. The flight runtime

`/experience` plays one continuous scroll-driven flight. A single smoothed `progress` (0 → 1), read from how far the user has scrolled through the **`.flight-runway`** spacer (~820vh), drives everything via `useFlightPath`:

```
introT  = clamp(progress / INTRO_END, 0, 1)            // INTRO_END = 0.14
flightT = clamp((progress - INTRO_END) / (1 - INTRO_END), 0, 1)
```

The first `INTRO_END` of scroll is the intro; the rest flies the spline.

### Movement 0 — Silhouette splash (~3.7s, auto-play)

`<CinematicIntro>` still fires on mount: a white-inverted A350 silhouette rises through a black overlay, which then fades. Lenis is paused throughout so a stray scroll can't interrupt it; on `complete` Lenis resumes and the scroll-driven flight takes over. The flight is already at `progress = 0` behind the splash (welcome card composed, reveal overlay dark), so the handoff is a seamless dark cross-fade.

### Movement 1 — Welcome (introT 0 → ~0.42)

`<CinematicFlightIntro>` (driven by `introT`): centre eyebrow `Pre-flight · 2020 — Present`, Playfair **"Welcome aboard."** (period cool `#4FC3F7`), subline. As scroll begins the card **fades + scales up** (`1 → 1.6`, opacity `1 → 0`) — a zoom *through* the greeting. The bottom **"Scroll to fly"** hint fades over the first ~22% of introT.

### Movement 2 — Word highlight (introT ~0.22 → ~0.8)

The tagline **"I turn complex workflows into journeys that feel effortless."** fades in and lights **word-by-word** muted → warm white (`litCount = round(smoothstep(0.3, 0.8, introT) · 9)`); the final word **"effortless."** lights cool. The line scales gently (`0.86 → 1.36`), sharing the zoom gesture.

### Movement 3 — Reveal → flight (introT ~0.8 → 1, then flightT)

`.flight-reveal-overlay` (a dark radial layer over the canvas) clears its **opacity** `~1 → ~0.06` via `smoothstep(0.12, 0.92, introT)` — the world (skydome + clouds + A350) is revealed as if zooming out of the text. The whole intro layer fades by introT 1. Aircraft materials fade `0 → 1` across introT `0 → 0.4`. From here `flightT` flies the spline.

### The flight (Movement 3 continued)

- **Spline + aircraft** — `CatmullRomCurve3` through 7 climbing/weaving control points. `getPointAt(flightT)` positions the GLB pivot; `getTangentAt(flightT)` orients it (`pivot.lookAt(point + tangent)`, nose along the pivot's +Z). **Banking:** heading delta over a `+0.012` lookahead, rolled about the nose axis (`pivot.rotateZ`), clamped ±0.6 rad.
- **Camera chase rig** — `eye = point − tangent·back + up·12 + side·16`, `lookAt = point + tangent·20`; position lerped at `0.06` (snapped under reduced motion). An `introBias` (`max(0, 1 − flightT/0.06)`) adds distance/height while flightT is near 0, easing a wide establishing frame into the chase.
- **GLSL contrails** — two wingtip ribbons (`useFlightPath`'s `Contrail` class): additive, `depthWrite:false`, cool-white `#cfe6ff`, per-vertex life fading head→tail. Emit points are the GLB's measured wingtip offsets, transformed to world via the pivot. Disabled under reduced motion.
- **Telemetry** (`<CinematicFlightHud>`, throttled ~90ms, `tabular-nums`): **ALT** `round(point.y·600 + 8200)` ft; **HDG** `atan2(tan.x, −tan.z)` → 0–360°, also rotating the compass needle (red `#E11D2A`); **G/S** cruise ~430 kt modulated by scroll velocity; **V/S** smoothed Δaltitude → fpm, signed. A bottom-left **perf readout** (`FPS · CALLS · TRIS · DPR · DRACO 808KB`) reads `renderer.info.render.*`.
- **Waypoints + rail** — four `<CinematicFlightWaypoints>` cards at flightT ≈ `0.18 / 0.43 / 0.68 / 0.9` (`FLIGHT_WAYPOINTS`), fading in when `|flightT − w.t| < 0.13` (only one active; the 4th is the centred contact variant). `<CinematicFlightRail>` is the right-edge progress rail — cool fill at `flightT·100%`, four labelled stops, active dot lit cool. Card content binds to `data/index.ts`; the spline `t`s + rail labels live in `FLIGHT_WAYPOINTS`.

### Atmosphere

- **Sun** — a low warm sun (`SUN_DIR` in `useFlightScene`) the aircraft heads toward: a directional glow baked into the skydome shader (broad halo + tight core) plus a sun disc/halo sprite that follows the camera so it reads as infinitely distant. The warm key light is aligned to it; it's the 80/15/5 warm 5% against the cool twilight.
- **Clouds** — two layers (`useFlightPath.buildClouds`): a low/mid cumulus field (a third warm-edged) drifting along the route, plus a high faint cirrus layer for sky depth.
- **Stars** — a camera-following `THREE.Points` dome whose opacity is driven by altitude in `update()`; stars emerge at cruise and recede on the descent.

### Arrival finale

The route climbs through the career to a cruise peak around the Fiuu waypoint, then **descends** into the final "On approach" waypoint — so the telemetry reads a genuine descent (ALT dropping, V/S negative) over the finale. As `flightT → 1` the chase camera **settles**: it levels behind the aircraft, pulls its side-offset toward centre, shortens its look-ahead and slows its lerp, like rolling up to a gate. The fourth waypoint is the centred contact close (signoff + large email CTA + links). Nothing follows — the page ends at the runway's bottom.

There is no editorial body and no `setActive(false)` hand-off anymore; the scene runs the whole runway (only `visibilitychange` pauses it). The flight chrome is always mounted (no `flightChromeVisible` gate).

---

## 4. Camera (no Pilot Mode)

The camera is **fully scripted** by the chase rig in `useFlightPath` — it follows the aircraft down the spline every frame. There is **no `OrbitControls`, no autoRotate, and no Pilot Mode** (the "Play with Aircraft" / inspect flow was removed 2026-06 when the parked-plane idle state was replaced by the continuous flight — there is no longer a stationary aircraft to orbit).

The HUD **compass needle** therefore reads heading from the **spline tangent**, not from camera orientation: `heading = atan2(tan.x, −tan.z)` wrapped to `[0, 360)`, written to the needle's CSS `rotate()` each frame. The needle is the one allowed off-palette colour (`#E11D2A`, §2.1). There is no pitch readout.

---

## 5. Always-present chrome

### 5.1 Back to Reality link

Top-left, fixed, mono uppercase, hairline-bordered translucent panel. Always rendered (no `v-if`) so the viewer can leave at any moment — during the splash, welcome, or flight — without waiting for the cinematic flow to clear. Points to `/` via `<NuxtLink>`.

### 5.2 Telemetry HUD

`<CinematicFlightHud>` is the live telemetry cluster rendered during the flight (top-right gauges + compass, bottom-left perf readout) — see §3. Always mounted (the whole page is the flight).

The legacy `<CinematicHUD>` (`HUD.vue`, page-corner spec-sheet + phase-jump dots) and `usePhaseState` remain in the repo from the torn-out 9-phase bio flow but are **not** mounted. They reference `.phase--takeoff` / `.phase--cruise` triggers that no longer exist; don't render as-is. Kept only as reference — safe to delete if no future surface needs them.

---

## 6. File layout

```
pages/experience/index.vue              # entrypoint — flight runway + chrome + orchestration
layouts/cinematic.vue                   # dark shell + html[data-layout=cinematic] + Lenis init

components/cinematic/
├── Intro.vue                           # Movement 0 — plane silhouette rises through black              [RENDERED]
├── FlightScene.vue                     # Three.js canvas mount (host + lifecycle)                      [RENDERED]
├── FlightIntro.vue                     # welcome greeting + word-highlight tagline (introT-driven)     [RENDERED]
├── FlightHud.vue                       # telemetry gauges + compass needle + perf readout              [RENDERED]
├── FlightRail.vue                      # right-edge progress rail + 4 stops                            [RENDERED]
├── FlightWaypoints.vue                 # 4 in-flight waypoint cards (final = contact finale)           [RENDERED]
├── HUD.vue                             # legacy page-corner spec sheet + phase nav                     [unused, kept — see §5.2]
└── PhaseSection.vue                    # legacy lower-third phase layout                               [unused, kept]

composables/
├── useLenis.ts                         # smooth-scroll lifecycle + ScrollTrigger.update binding         [USED]
├── useFlightScene.ts                   # renderer + gradient skydome + fog + lighting + RAF loop        [USED]
│                                       # + per-frame hook + perf refs (no OrbitControls)
├── useFlightAircraft.ts                # GLB load + normalize + pivot flight rig + wingtip offsets      [USED]
├── useFlightPath.ts                    # spline + clouds + contrails + chase camera + telemetry         [USED]
│                                       # (registers useFlightScene's frame hook; exposes introT/flightT…)
└── usePhaseState.ts                    # legacy active-phase tracking + click-to-jump                   [unused, kept]

assets/css/cinematic.css                # the token sheet (this contract)
public/fonts/geist/Geist-Variable.woff2 # self-hosted Geist
public/images/A350_summary.png          # splash silhouette (top-down)
public/models/a350.glb                  # 3D aircraft (DRACO-compressed, ~808KB)
```

Auto-import path-prefix means `components/cinematic/FlightScene.vue` resolves to `<CinematicFlightScene />`. There is **no separate doorway component** on `/` — the primary CTA lives inline in `components/sections/HeroSection.vue`.

---

## 7. Hard rules

These are non-negotiable. If a rule gets in the way, update this file in the same PR.

1. **The cinematic stylesheet must never be imported into `/`.** It is loaded by `layouts/cinematic.vue` via `import '~/assets/css/cinematic.css'` and nowhere else. Do not add it to `nuxt.config.ts`'s global `css:` array.
2. **`/experience` is `ssr: false`** — Lenis, GSAP ScrollTrigger, Three.js, and the DRACO CDN all need `window` / `document`. The route rule is in `nuxt.config.ts` and must stay.
3. **Three.js sub-imports must be pre-bundled** in `vite.optimizeDeps.include`: `GLTFLoader.js`, `DRACOLoader.js`. Without this, dev triggers a page reload the first time the scene mounts. (The flight uses a hand-written gradient skydome + a scripted chase camera, so `Sky.js` and `OrbitControls.js` are no longer imported — don't re-add them to optimizeDeps unless something imports them again.)
4. **`<UiSectionHeading>`, `.btn`, `.card`, `.skill-tag`** and other primitives from `/` do not exist on `/experience`. Use cinematic equivalents. New cinematic primitives go in `components/cinematic/`, not `components/ui/`.
5. **Geist must be served from `/public/fonts/geist/`**, not from `node_modules`. The `geist` npm package is a next/font helper and ships no plain CSS; we copy the variable woff2 into `/public` at install time.
6. **No backdrop-filter on any cinematic panel.** Editorial print register, not frosted-glass dashboard.
7. **The flight uses no ScrollTrigger pin — it's a tall `.flight-runway` spacer + a fixed canvas.** Progress is read from the runway's scroll position each frame (`useFlightPath`'s `progress` source), so the fixed flight chrome is never a pin descendant. There is no longer any pinned editorial content on this surface at all.
8. **Pause the render loop on `visibilitychange`** when the page is hidden. Cap `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`. Both live in `useFlightScene.ts`. (`setActive()` still exists for future use but isn't wired now — the whole runway is flight, so the scene runs throughout.)
9. **No OrbitControls / Pilot Mode.** The camera is fully scripted by the chase rig in `useFlightPath` (see §4). Don't reintroduce OrbitControls, autoRotate, or a free-orbit mode without a design conversation — the continuous flight has no stationary aircraft to orbit.
10. **`.experience-root` flight chrome is mostly `pointer-events: none`** (the runway spacer + decorative overlays). Only the final waypoint's CTA + links opt back in with `pointer-events: auto`.
11. **`.experience-root` has `overflow-x: clip`** to suppress phantom horizontal scrollbars from descendant transforms (full-viewport track breakouts, fixed chrome with `translateX(-50%)`, etc.) — `clip` rather than `hidden` so descendant `position: sticky` (the pinned editorial tracks) keeps working.
12. **No emoji** in copy. Aviation editorial register, not chat register. Typographic glyphs (`→`, `↓`, `↑`, `·`) are fine; the welcome `.` accent and the final waypoint's `→` arrow are intentional. (The previous "Welcome aboard / to my journey!" exclamation is gone with the prototype's period-terminated "Welcome aboard." — the surface now keeps the no-exclamation voice throughout.)

---

## 8. Voice

Per AoT §12 (verbatim):

- **Precise, not chatty.** "Twin-spool architecture" beats "the engine has two parts."
- **Active, not passive.** "Cool the blades" beats "the blades are cooled."
- **No exclamation marks.** Headlines and meta lines are period-terminated — including the welcome card's "Welcome aboard." (the cool period *is* the warmth).
- Headlines lean poetic; data leans technical. The contrast is the voice.

---

## 9. The journey (wired)

The journey is no longer a "View my journey" CTA into separate content — **the scroll-driven flight _is_ the journey** (§3). The four waypoints (Faztech → Universiti Malaya → Fiuu → On approach) tell the career as a single continuous flight; the fourth is the contact finale. About / Education / Projects / Contact deliberately live only on `/` — repeating them on the cinematic surface was redundant, so the editorial body that briefly lived here was removed (2026-06).

This replaced the previous intro-splash → welcome → iris-reveal → autoRotate-+-CTAs flow (and the earlier 9-phase bio flow before it). Decisions baked in here, so future redesigns don't relitigate them:

- **Keep the splash + welcome + reveal** as the dramatic opener (Qie wants them preserved). They're now scroll-driven (one `progress`), not auto-timeline'd.
- **The aircraft is the real `a350.glb`** flown along the spline — never a procedural placeholder.
- **One continuous fixed-canvas flight** is the whole surface — not 8 stacked phase sections (disliked), not sticky two-column scrollytelling (reverted), and not the flight-plus-editorial-body hybrid (built, then cut as redundant with `/`).

Legacy components kept but **not** mounted (`HUD.vue`, `PhaseSection.vue`, `usePhaseState.ts`) are safe to delete whenever a cleanup PR wants to; nothing renders them.

---

## 10. Tunable knobs — quick reference

| What | Where | Default |
|---|---|---|
| Sky brightness | `useFlightScene.ts` `toneMappingExposure` | `0.92` |
| Sky gradient colours | `useFlightScene.ts` `buildSky()` (`uTop` / `uHorizon` / `uGlow`) | `#06070b` / `#1b2433` / `#2c3a4f` |
| Sun direction + colour | `useFlightScene.ts` `SUN_DIR` / `SUN_COLOR` | `(1, 0.1, -0.15)` norm., `#ffb27a` |
| Sun glow / disc | `useFlightScene.ts` sky fragment (`pow` terms) + `buildSun()` sprite scales | halo 300 / core 95, glow 0.45 + 0.7 |
| Star field | `useFlightPath.ts` `buildStars()` + altitude fade in `update()` | 600 pts, opacity `(y−8)/44 · 0.9` |
| Fog range | `useFlightScene.ts` `scene.fog` | `0x11151f`, near 120 / far 620 |
| Camera lens / far plane | `useFlightScene.ts` `PerspectiveCamera` | FOV 48°, far 2000 |
| Cloud density | `useFlightPath.ts` `buildClouds()` count + `opacity` | 18 clouds, `0.1 + 0.22` random opacity |
| Scroll runway length | `pages/experience/index.vue` `.flight-runway { height }` | `820vh` |
| Intro fraction | `useFlightPath.ts` `INTRO_END` | `0.14` of total progress |
| Waypoint positions | `useFlightPath.ts` `FLIGHT_WAYPOINTS[].t` | `0.18 / 0.43 / 0.68 / 0.9` |
| Aircraft size | `useFlightAircraft.ts` `TARGET_FUSELAGE_LENGTH` | `30` scene units |
| Aircraft nose axis | `useFlightAircraft.ts` `NOSE_ALIGN_Y` | `0` (GLB noses +Z; flip if it flies sideways/backwards) |
| Splash duration | `Intro.vue` GSAP `duration: 3` | 3s linear |
| Camera chase rig | `useFlightPath.ts` `update()` (`back`/`up`/`side`, lerp `0.06`) | back 34, up 12, side 16; lerp 0.06 |
| Waypoint linger | `useFlightPath.ts` `update()` `focus` (closer + slower near a waypoint) | `1 − smoothstep(0, 0.09, dist)` |
| Arrival settle | `useFlightPath.ts` `update()` `arrival` (level + slow over final approach) | `smoothstep(0.9, 1.0, flightT)` |
| Banking amount | `useFlightPath.ts` `pivot.rotateZ(clamp(-dh*9, ±0.6))` | gain 9, clamp ±0.6 rad |
| Contrail look | `useFlightPath.ts` `Contrail` (width, colour, history) | width 0.55, `#cfe6ff`, 56 points, opacity 0.5 |
| Telemetry tuning | `useFlightPath.ts` `update()` (G/S base, V/S gain, throttle) | G/S 430+scrollV, V/S ×0.12, HUD 90ms |
| Compass needle colour | `FlightHud.vue` `.flight-hud__needle` | `#E11D2A` (intentionally outside palette — see §2.1) |
| Perf readout | `pages/experience/index.vue` `<CinematicFlightHud show-perf>` | shown |

---

## 11. The one question that settles every decision

Borrowed verbatim from [jet-engine-infographic/docs/DESIGN-SYSTEM.md §15](../../jet-engine-infographic/docs/DESIGN-SYSTEM.md):

> *"Would this appear in a 3DS or Rolls-Royce brand film?"*
>
> If yes → ship it. If no → cut it.

When in doubt, ask this. It's the whole system in one sentence.
