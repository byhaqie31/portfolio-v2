# Cinematic Standards — `/experience`

The design and engineering contract for the second surface at `baihaqie.com/experience`. Companion to [UI-STANDARDS.md](UI-STANDARDS.md), which governs `/`, admin, and feedback in the Apple-faithful Restrained vocabulary.

`/experience` does **not** invent its own design language. It inherits the [Anatomy of Thrust](https://anatomy-of-thrust.netlify.app) vocabulary verbatim — see [jet-engine-infographic/docs/DESIGN-SYSTEM.md](../../jet-engine-infographic/docs/DESIGN-SYSTEM.md). When AoT's spec and this doc disagree, AoT wins; update this file in the same PR.

> **Two surfaces, one author.** `/` is the fast, professional handshake. `/experience` is the cinematic frame for the work the handshake hints at. They share *nothing* visually — different tokens, different fonts, different motion register — and that contrast is the point. Do not bleed cinematic patterns onto `/` or restrained patterns into `/experience`.

> **Current state.** This file documents what `/experience` actually is **today**: an intro splash → welcome card → iris reveal → autoRotating A350 + two CTAs (Play with Aircraft → Pilot Mode; View my journey → unwired, TBD). A 9-phase biographical flow was built and deliberately torn back out in favour of designing the journey content fresh on top of this minimum. See §9 for what's currently unwired.

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

`/experience` plays in three auto-played movements (intro → welcome → iris reveal) followed by two user-driven modes (post-reveal CTAs + Pilot Mode).

### Movement 1 — Intro splash (~3.7s, auto-play)

Fires on page mount before the user can interact.

| Component | Role |
|---|---|
| `<CinematicIntro>` | Black overlay with white-inverted A350 silhouette (`/images/A350_summary.png`) rising from `y: 100vh` to `y: -100vh` over 3s linear. Overlay then fades to reveal the scene behind. Emits `complete`. |

Lenis is paused throughout Movement 1 so a stray scroll input can't interrupt the reveal.

### Movement 2 — Welcome card (~2.3s, then holds)

Mounts only after `<CinematicIntro>` emits `complete`.

| Component | Role |
|---|---|
| `<CinematicWelcome>` | "Welcome aboard / to my journey!" in Playfair, fades in over 0.8s, holds. After 1.0s, a **"SCROLL TO EXPLORE MORE"** mono cue fades in below with a perpetual chevron bounce. Emits `complete` at the end of the hold; **does not auto fade out** — the user dismisses it by scrolling. |

Lenis stays paused through Movement 2's fade-in + hold. On `complete`, Lenis resumes and Movement 3 arms.

### Movement 3 — Iris reveal (scroll-driven)

User scrolls. ScrollTrigger pins `.phase--hero` (an empty placeholder section, 100vh tall) for `+=150%` of scroll distance. During the pin, a single `gsap.timeline({ scrub: 1 })` scrubs four reveals from the centre of the welcome text outward:

| Tween | Duration (timeline fraction) | What |
|---|---|---|
| `.cinematic-overlay { --hole-r: 0 → 150vw }` | 0.0 → 1.0 | Radial-mask hole grows from the centre, dissolving the black overlay outward. Sky + clouds + aircraft pop out from the wording. |
| `.welcome__text { scale: 1 → 0.5, opacity: 1 → 0 }` | 0.0 → 0.6 | Welcome text shrinks and fades as the world appears. |
| `.welcome__hint { opacity: 1 → 0 }` | 0.90 → 0.98 | Scroll hint stays visible for almost the entire reveal so the viewer knows to keep scrolling, then fades out just before the post-reveal CTAs slide in at progress 0.98. |
| Aircraft materials `opacity: 0 → 1` | 0.0 → 0.4 | The 3D A350 becomes visible during the iris reveal. |

`useFlightScroll.init` accepts an **`onScrollProgress`** callback so the page can read the masterTl's authoritative scrub progress — sibling ScrollTriggers on a pinned trigger calculate against a stationary element and stay at 0, so this callback is the only reliable read of where in the reveal the user is. The page flips `revealComplete = true` when progress crosses `0.98`, which gates the post-reveal CTAs.

### Movement 4 — Post-reveal CTAs (idle, user-driven)

Once `revealComplete` is true, two CTAs slide up from bottom-centre via a `<Transition name="ctas-fade">`:

| CTA | Style | Behaviour |
|---|---|---|
| **Play with Aircraft** | `.cta--ghost` — hairline border, `rgba(10,11,15,0.55)` panel | Calls `flightScene.setInspectMode(true)` + pauses Lenis. Enters Pilot Mode (§4). |
| **View my journey** | `.cta--solid` — warm-white panel, near-black text | **Currently unwired** (`onViewJourney` is a no-op). This is where the journey content flow will eventually attach. See §9. |

The two CTAs disappear in Pilot Mode (`v-if="revealComplete && !inspectMode"`) so they don't compete with the inspect UI.

### Camera by default

Outside Pilot Mode, `OrbitControls` runs a continuous **autoRotate** orbit around the aircraft target — `autoRotateSpeed = 0.6`, matching the jet-engine-infographic Scene 0 / finale pattern. **`enableRotate` and `enableZoom` both start `false`**, so the plane is untouchable until the user explicitly enters Pilot Mode. Mouse-wheel reaches Lenis (page scroll); drag does nothing. This is intentional: the post-reveal idle state is a film shot, not a free orbit.

---

## 4. Pilot Mode

The "Play with Aircraft" affordance. While in Pilot Mode the camera is fully the user's. The page swaps the CTA strip for an inspection UI (compass + controls hint + exit).

### 4.1 Lifecycle

Enter (page calls `flightScene.setInspectMode(true)`):
- Snapshot `camera.position` + `controls.target` into `inspectEntryPose` so we can animate back to this exact pose on exit.
- `controls.autoRotate = false`
- `controls.enableRotate = true`
- `controls.enableZoom = true`
- Page calls `lenis.instance?.stop()` so mouse-wheel reaches OrbitControls (zooms the camera) instead of scrolling the page back into the iris reveal.

Exit (page calls `flightScene.setInspectMode(false)`):
- `controls.enableRotate = false` immediately (user can't keep dragging once they've chosen to leave)
- `controls.enableZoom = false`
- GSAP timeline tweens `camera.position` + `controls.target` back to `inspectEntryPose` over **0.7s `power2.inOut`**, calling `controls.update()` on every tween frame so OrbitControls re-derives its internal spherical state and keeps the camera oriented as it slides back.
- On tween `onComplete`: `controls.autoRotate = true`. Plane resumes its idle orbit from the restored pose.
- Page calls `lenis.instance?.start()` to resume page scroll.
- If the user re-enters Pilot Mode mid-tween, the in-flight tween is `.kill()`-ed before the new entry snapshot is taken — otherwise it would keep writing to `camera.position` on top of fresh drag input.

### 4.2 Inspect UI

Three fixed-position chrome elements, all gated by `v-if="inspectMode"` inside a single `<Transition name="inspect-fade">` so they fade in/out together:

| Element | Position | Content |
|---|---|---|
| `.inspect-ui__indicator` | top-centre | Two mono chips: **Drag to rotate** + **Scroll to zoom**, hairline-separated. |
| `.compass` | top-right | 90px ring with N/E/S/W marks (N emphasised warm-white). Red `#E11D2A` needle pointing in the camera's heading direction. Two readouts below: `HDG 087° E` (`tabular-nums`) and `PITCH +05°` with sign prefix. See §4.3. |
| `.inspect-ui__exit` | bottom-centre | `Exit Pilot Mode` button (same `.cta--ghost` style as Play with Aircraft). |

Mobile (`< 640px`) collapses the indicator chips to a vertical stack below the back-link, shrinks the compass to 56px, and stretches the exit button to full width.

### 4.3 Compass — heading + pitch

`useFlightScene` exposes two reactive refs that update on every `OrbitControls` `change` event:

- **`cameraHeading`** — the camera's forward azimuth in degrees. **Intentionally NOT wrapped to `[0, 360)`**. Wrapping would make the CSS `rotate()` transition take the long way around at the 0°/360° boundary (e.g. `359° → 1°` would animate `-358°`, snapping the needle counter-clockwise across the whole dial). Instead, the ref tracks a continuous accumulated value — every update computes the shortest-path delta and adds it. The needle's CSS rotation stays monotonic. The page wraps to `[0, 360)` via a `headingWrapped` computed for the textual readout.
- **`cameraPitch`** — `asin(dir.y)` in degrees. Positive = looking up, negative = looking down. Range is naturally `[-90°, +90°]`; no wrapping issue.

Cardinal convention:
- **N (0°)** = looking toward `-Z`
- **E (90°)** = looking toward `+X` (the direction the parked plane is pointing — `rotation.y = π/2` puts its nose along `+X`)
- **S (180°)** = looking toward `+Z`
- **W (270°)** = looking toward `-X`

The cardinal label cycles N → NE → E → SE → S → SW → W → NW with 45°-wide buckets centred on each direction.

---

## 5. Always-present chrome

### 5.1 Back to Reality link

Top-left, fixed, mono uppercase, hairline-bordered translucent panel. Always rendered (no `v-if`) so the viewer can leave at any moment — including during the intro splash, welcome card, and iris reveal — without waiting for the cinematic flow to clear. Points to `/` via `<NuxtLink>`.

### 5.2 HUD (currently NOT rendered)

`<CinematicHUD>` exists in the repo but is not mounted on the page. It was a page-corner spec-sheet readout (PHASE / ALT / STAGE + phase-jump dots) tied to the 9-phase bio flow that was torn back out. The component is kept for future re-use if the View my journey design wants a similar HUD pattern. Don't render it as-is — `usePhaseState`'s per-phase ScrollTriggers reference `.phase--takeoff`, `.phase--cruise` etc. that no longer exist.

---

## 6. File layout

```
pages/experience/index.vue              # entrypoint — composes the four movements + Pilot Mode wiring
layouts/cinematic.vue                   # dark shell + html[data-layout=cinematic] + Lenis init

components/cinematic/
├── Intro.vue                           # Movement 1 — plane silhouette rises through black              [RENDERED]
├── Welcome.vue                         # Movement 2 — welcome card + scroll hint                        [RENDERED]
├── Overlay.vue                         # persistent black with radial-mask iris (--hole-r)              [RENDERED]
├── FlightScene.vue                     # Three.js canvas mount (host + lifecycle)                      [RENDERED]
├── Aircraft.vue                        # trigger for the GLB A350 (no DOM output)                      [RENDERED]
├── HUD.vue                             # page-corner spec sheet + phase nav                            [unused, kept for §5.2]
└── PhaseSection.vue                    # generic lower-third phase layout                              [unused, kept for §9]

composables/
├── useLenis.ts                         # smooth-scroll lifecycle + ScrollTrigger.update binding         [USED]
├── useFlightScene.ts                   # renderer + camera + sky shader + clouds + OrbitControls       [USED]
│                                       # + cameraHeading/cameraPitch refs + setInspectMode lifecycle
├── useFlightAircraft.ts                # GLB load + normalize + cruise pose                            [USED]
├── useFlightScroll.ts                  # iris reveal masterTl (+ unused aircraftModel/flightStart      [USED — only iris reveal]
│                                       # pose choreography params still in the interface)
└── usePhaseState.ts                    # active phase tracking + click-to-jump (PHASES manifest)        [unused, kept for §9]

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
4. **`<UiSectionHeading>`, `.btn`, `.card`, `.skill-tag`** and other primitives from `/` do not exist on `/experience`. Use cinematic equivalents. New cinematic primitives go in `components/cinematic/`, not `components/ui/`.
5. **Geist must be served from `/public/fonts/geist/`**, not from `node_modules`. The `geist` npm package is a next/font helper and ships no plain CSS; we copy the variable woff2 into `/public` at install time.
6. **No backdrop-filter on any cinematic panel.** Editorial print register, not frosted-glass dashboard.
7. **Pin trigger must not be an ancestor of position:fixed overlays.** ScrollTrigger's pin can convert the pinned element into a containing block for fixed descendants, which makes them follow the pin instead of the viewport. We pin `.phase--hero` (a sibling of the fixed overlays), never `.experience-root`.
8. **Pause the render loop on `visibilitychange`** when the page is hidden. Cap `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`. Both live in `useFlightScene.ts`.
9. **OrbitControls stays disabled until `welcomeDone`.** Page calls `flightScene.setControlsEnabled(true)` after welcome clears. Even then, `enableRotate` and `enableZoom` start `false` — only Pilot Mode (`setInspectMode(true)`) flips them on. The plane is untouchable in idle. There is no `start`-event listener that disables autoRotate on first user drag (the previous "drag anytime" pattern is gone — autoRotate-on/off is now strictly a Pilot Mode concern).
10. **`.cinematic-page` has `pointer-events: none`** so the empty `.phase--hero` placeholder doesn't intercept pointer events that should reach OrbitControls on the canvas behind. When the View my journey flow adds interactive children inside `.cinematic-page`, they must opt back in with `pointer-events: auto` on their own selectors.
11. **`.experience-root` has `overflow-x: hidden`** to suppress phantom horizontal scrollbars from descendant transforms (fixed-positioned chrome with `translateX(-50%)`, Vue Transitions mid-animation, etc.).
12. **No emoji** in copy. Aviation editorial register, not chat register. The one exception is the welcome card's `!` exclamation (the single moment of warmth in an otherwise restrained voice — don't extend it).

---

## 8. Voice

Per AoT §12 (verbatim):

- **Precise, not chatty.** "Twin-spool architecture" beats "the engine has two parts."
- **Active, not passive.** "Cool the blades" beats "the blades are cooled."
- **No exclamation marks.** Headlines and meta lines are period-terminated. *(Note: the welcome card "Welcome aboard / to my journey!" intentionally breaks this rule — see Hard rule 12.)*
- Headlines lean poetic; data leans technical. The contrast is the voice.

---

## 9. Currently unwired: View my journey

The **View my journey** CTA (`.cta--solid` in `pages/experience/index.vue`) is rendered and clickable but its handler `onViewJourney` is a `TODO` no-op. This is intentional — the bio flow that previously lived behind it (9 phase sections, masthead cards, telemetry-led editorial layout) was deliberately stripped because the layout iterations couldn't land cleanly without breaking the cinematic register.

Components and composables kept in the repo for the eventual re-design:

- `<CinematicPhaseSection>` — generic flight-strip card (warm-white panel, mono telemetry header, hairline rule, Playfair headline, optional subline/meta, slotted body)
- `<CinematicHUD>` — page-corner spec-sheet readout + clickable phase dots
- `usePhaseState` — per-phase ScrollTrigger setup + jump-to-phase via Lenis
- `useFlightScroll`'s `aircraftModel` / `flightStart` / `flightEnd` params on the init interface — drove per-phase pitch/landing pose during the bio flow

When you re-wire View my journey, **don't** rebuild the same 8-stacked-sections pattern (Qie disliked it visually), **don't** try the sticky two-column scrollytelling pattern (was attempted + reverted), and **don't** strip the intro/welcome/iris reveal (Qie wants them preserved as the dramatic opener). Open question: where does the journey content live spatially — continued scroll past the iris reveal? a separate route? a modal/overlay? Needs design conversation, not just implementation.

When (and only when) a journey design is ready:
1. Wire `onViewJourney` to navigate into / scroll into / open the chosen container.
2. Re-render `<CinematicHUD>` if it fits the new design, OR delete `HUD.vue` + `usePhaseState.ts` from the repo.
3. Same for `<CinematicPhaseSection>` — re-render if its flight-strip layout still serves the new design, or delete.
4. Update this §9 to describe the actual journey behaviour.

---

## 10. Tunable knobs — quick reference

| What | Where | Default |
|---|---|---|
| Sky brightness | `useFlightScene.ts` `toneMappingExposure` | `0.18` |
| Sky atmosphere | `useFlightScene.ts` `buildSky()` (turbidity, rayleigh, sun phi/theta) | turbidity 8, rayleigh 1.2, sun 12° low / 200° behind |
| Cloud density | `useFlightScene.ts` `buildClouds(16)` count + `baseOpacity` range | 16 clouds, `0.25 + 0.25` random opacity |
| Aircraft size | `useFlightAircraft.ts` `TARGET_FUSELAGE_LENGTH` | `30` scene units |
| Aircraft initial pose | `useFlightAircraft.ts` `startCruise()` rotation/position | rotation.y=π/2 (nose +X = East), position (0, 2, -45) |
| Intro plane duration | `Intro.vue` GSAP `duration: 3` | 3s linear |
| Welcome timings | `Welcome.vue` timeline (fade-in `0.8`, hint fade-in `1.0`, hold `1.5`) | — |
| Iris reveal pin distance | `pages/experience/index.vue` `flightScroll.init({ end: '+=150%' })` | 150% of viewport |
| Scroll hint fade window | `useFlightScroll.ts` `.welcome__hint` tween position + duration | `0.90 → 0.98` of masterTl progress |
| Post-reveal CTA threshold | `pages/experience/index.vue` `onScrollProgress` callback | `revealComplete = p >= 0.98` |
| Camera autoRotate speed | `useFlightScene.ts` `controls.autoRotateSpeed` | `0.6` (matches jet-engine-infographic) |
| Pilot Mode exit tween | `useFlightScene.ts` `setInspectMode(false)` GSAP timeline | `0.7s` `power2.inOut` on camera.position + controls.target |
| Compass needle colour | `pages/experience/index.vue` `.compass__needle { background }` | `#E11D2A` (intentionally outside palette — see §2.1) |
| Compass ring size | `pages/experience/index.vue` `.compass__ring { width, height }` | `90px` desktop, `56px` mobile |

---

## 11. The one question that settles every decision

Borrowed verbatim from [jet-engine-infographic/docs/DESIGN-SYSTEM.md §15](../../jet-engine-infographic/docs/DESIGN-SYSTEM.md):

> *"Would this appear in a 3DS or Rolls-Royce brand film?"*
>
> If yes → ship it. If no → cut it.

When in doubt, ask this. It's the whole system in one sentence.
