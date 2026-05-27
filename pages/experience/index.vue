<script setup lang="ts">
import { useFlightScene } from '~/composables/useFlightScene'
import { useFlightScroll } from '~/composables/useFlightScroll'
import { useFlightAircraft } from '~/composables/useFlightAircraft'
import { useLenis } from '~/composables/useLenis'

definePageMeta({
  layout: 'cinematic',
})

useSeoMeta({
  title: 'Ahmad Baihaqie — Flight',
  description: 'A cinematic walkthrough — work in progress.',
  ogTitle: 'Ahmad Baihaqie — Flight',
  ogDescription: 'A cinematic walkthrough — work in progress.',
})

/*
 * /experience — clean slate.
 *
 *   Intro splash → welcome card → iris reveal → 3D plane on full screen.
 *
 * All bio / phase content stripped. AutoRotate keeps the plane in motion
 * once the user can see the scene. New narrative content lands in
 * subsequent iterations on top of this minimum.
 */

const introDone = ref(false)
const welcomeDone = ref(false)
// Flips true the moment the hero pin releases (iris fully open). Gates
// the two CTAs that should only appear once the viewer has finished
// the scroll-driven reveal.
const revealComplete = ref(false)
// Inspect mode — true while the user is "playing" with the aircraft.
// AutoRotate pauses, zoom enables, Lenis pauses so wheel zooms instead
// of scrolling, and the post-reveal CTAs are swapped for an indicator
// strip + exit button.
const inspectMode = ref(false)

const flightScene = useFlightScene()
const flightScroll = useFlightScroll()
const aircraft = useFlightAircraft()
const lenis = useLenis()

// Compass readouts — pulled from useFlightScene's reactive refs,
// updated whenever OrbitControls fires `change`. By default the plane
// is parked facing East (+X), so a fresh-load camera at z=0 looking
// at the plane reads as roughly heading 90° (looking East), pitch 0°.
const cameraHeading = flightScene.cameraHeading
const cameraPitch = flightScene.cameraPitch

// cameraHeading is continuous (no wrap at 0/360) so the CSS rotation
// stays monotonic; for the readout we wrap to [0, 360).
const headingWrapped = computed(() => ((cameraHeading.value % 360) + 360) % 360)

const headingLabel = computed(() => {
  const h = headingWrapped.value
  if (h < 22.5 || h >= 337.5) return 'N'
  if (h < 67.5) return 'NE'
  if (h < 112.5) return 'E'
  if (h < 157.5) return 'SE'
  if (h < 202.5) return 'S'
  if (h < 247.5) return 'SW'
  if (h < 292.5) return 'W'
  return 'NW'
})

const headingDeg = computed(() => Math.round(headingWrapped.value).toString().padStart(3, '0'))
const pitchDeg = computed(() => {
  const p = Math.round(cameraPitch.value)
  const sign = p >= 0 ? '+' : '-'
  return sign + Math.abs(p).toString().padStart(2, '0')
})

watch(welcomeDone, (done) => {
  if (!done) return
  // Iris reveal pin only. No aircraft pose choreography (autoRotate
  // handles motion). No per-phase ScrollTriggers (no phase content yet).
  // onScrollProgress is the masterTl's own scrub progress — the only
  // reliable read on this pinned timeline (sibling ScrollTriggers on a
  // pinned element calculate against a stationary trigger and stay at 0).
  flightScroll.init({
    trigger: '.phase--hero',
    end: '+=150%',
    aircraftMaterials: () => aircraft.getMaterials(),
    onScrollProgress: (p) => {
      revealComplete.value = p >= 0.98
    },
  })
  flightScene.setControlsEnabled(true)
})

function onPlayWithAircraft() {
  // Hand the camera over to the user: pause autoRotate, enable zoom,
  // and stop Lenis so the mouse wheel reaches OrbitControls (zooms the
  // camera) instead of scrolling the page back into the iris reveal.
  inspectMode.value = true
  flightScene.setInspectMode(true)
  lenis.instance?.stop()
}

function onExitInspect() {
  inspectMode.value = false
  flightScene.setInspectMode(false)
  lenis.instance?.start()
}

function onViewJourney() {
  // TODO: wire to whatever the next iteration adds beneath the hero
  // (sticky scrollytelling, stacked phases, etc.). For now, no-op.
}

onBeforeUnmount(() => {
  flightScroll.destroy()
})
</script>

<template>
  <div class="experience-root">
    <CinematicFlightScene />
    <CinematicAircraft v-if="welcomeDone" />
    <CinematicOverlay />

    <CinematicIntro @complete="introDone = true" />
    <CinematicWelcome v-if="introDone" @complete="welcomeDone = true" />

    <!-- Back to the restrained surface. Mono uppercase, top-left, always
         visible so the viewer can leave at any moment without waiting for
         the intro to clear. -->
    <NuxtLink to="/" class="back-link" aria-label="Back to baihaqie.com">
      <Icon name="fluent:arrow-left-16-filled" size="14" />
      <span>Back to Reality</span>
    </NuxtLink>

    <main class="cinematic-page">
      <!-- Empty hero placeholder — pinned by useFlightScroll for the
           iris reveal's +=150% scroll distance. No copy here; that's
           what the next iteration adds. -->
      <section class="phase phase--hero" aria-hidden="true" />
    </main>

    <!-- Post-reveal CTAs — appear once the hero pin releases and the
         iris is fully open. Hidden during inspect mode so they don't
         compete with the inspect UI. -->
    <Transition name="ctas-fade">
      <div v-if="revealComplete && !inspectMode" class="ctas">
        <button type="button" class="cta cta--ghost" @click="onPlayWithAircraft">
          <Icon name="fluent:cursor-hover-16-filled" size="14" />
          <span>Play with Aircraft</span>
        </button>
        <button type="button" class="cta cta--solid" @click="onViewJourney">
          <span>View my journey</span>
          <Icon name="fluent:arrow-right-16-filled" size="14" />
        </button>
      </div>
    </Transition>

    <!-- Inspect mode UI — top-centre controls hint, top-right compass
         with live heading + pitch readouts, bottom-centre exit button.
         All fade together when inspect mode toggles. -->
    <Transition name="inspect-fade">
      <div v-if="inspectMode" class="inspect-ui">
        <div class="inspect-ui__indicator">
          <span class="inspect-ui__chip">
            <Icon name="fluent:cursor-hover-16-filled" size="14" />
            Drag to rotate
          </span>
          <span class="inspect-ui__chip">
            <Icon name="fluent:zoom-in-16-filled" size="14" />
            Scroll to zoom
          </span>
        </div>

        <div class="compass" aria-label="Camera heading and pitch">
          <div class="compass__ring">
            <span class="compass__mark compass__mark--n">N</span>
            <span class="compass__mark compass__mark--e">E</span>
            <span class="compass__mark compass__mark--s">S</span>
            <span class="compass__mark compass__mark--w">W</span>
            <div class="compass__needle-wrap" :style="`transform: rotate(${cameraHeading}deg)`">
              <div class="compass__needle" />
            </div>
          </div>
          <div class="compass__readouts">
            <span class="compass__readout">HDG {{ headingDeg }}° {{ headingLabel }}</span>
            <span class="compass__readout">PITCH {{ pitchDeg }}°</span>
          </div>
        </div>

        <button type="button" class="cta cta--ghost inspect-ui__exit" @click="onExitInspect">
          <Icon name="fluent:arrow-left-16-filled" size="14" />
          <span>Exit Pilot Mode</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.experience-root {
  position: relative;
  /* Belt-and-braces against any descendant overflowing 100vw — the
   * sticky/fixed children (back-link, ctas, welcome hint) all use
   * transforms that GSAP/Vue may momentarily push past the edge
   * during animation, which on some browsers produces a phantom
   * horizontal scrollbar. */
  overflow-x: hidden;
}

.cinematic-page {
  position: relative;
  z-index: var(--z-content);
  min-height: 100vh;
  /* The hero pin section sits at z-content (5) on top of the canvas
   * (z-canvas, 0). With nothing interactive inside it, we let pointer
   * events pass straight through to OrbitControls on the canvas behind.
   * Future interactive children inside this region must opt back in
   * with `pointer-events: auto`. */
  pointer-events: none;
}

.phase--hero {
  min-height: 100vh;
}

.back-link {
  position: fixed;
  top: var(--space-8);
  left: var(--space-8);
  z-index: var(--z-controls);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-secondary);
  background: rgba(10, 11, 15, 0.55);
  border: 1px solid var(--color-hairline);
  text-decoration: none;
  transition: color var(--duration-quick) var(--ease-out),
              background var(--duration-quick) var(--ease-out);
}

.back-link:hover,
.back-link:focus-visible {
  color: var(--color-ink-primary);
  background: rgba(10, 11, 15, 0.75);
  outline: none;
}

@media (max-width: 640px) {
  .back-link {
    top: var(--space-4);
    left: var(--space-4);
    font-size: 10px;
  }
}

/* ── Post-reveal CTAs ─────────────────────────────────────────── */

.ctas {
  position: fixed;
  bottom: var(--space-12);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-controls);
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  font-family: var(--font-mono);
  font-size: var(--font-ui);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  border-radius: var(--radius-sharp);
  cursor: pointer;
  text-decoration: none;
  transition: color var(--duration-quick) var(--ease-out),
              background var(--duration-quick) var(--ease-out),
              border-color var(--duration-quick) var(--ease-out);
}

.cta--ghost {
  color: var(--color-ink-secondary);
  background: rgba(10, 11, 15, 0.55);
  border: 1px solid var(--color-hairline);
}

.cta--ghost:hover,
.cta--ghost:focus-visible {
  color: var(--color-ink-primary);
  background: rgba(10, 11, 15, 0.75);
  border-color: rgba(255, 255, 255, 0.18);
  outline: none;
}

.cta--solid {
  color: var(--color-bg-base);
  background: var(--color-ink-primary);
  border: 1px solid var(--color-ink-primary);
}

.cta--solid:hover,
.cta--solid:focus-visible {
  background: #ffffff;
  border-color: #ffffff;
  outline: none;
}

.ctas-fade-enter-active,
.ctas-fade-leave-active {
  transition: opacity var(--duration-cinematic) var(--ease-out),
              transform var(--duration-cinematic) var(--ease-out);
}

.ctas-fade-enter-from,
.ctas-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 16px);
}

.ctas-fade-enter-to,
.ctas-fade-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}

@media (max-width: 640px) {
  .ctas {
    bottom: var(--space-6);
    flex-direction: column-reverse;
    gap: var(--space-3);
    width: calc(100% - var(--space-8));
  }

  .cta {
    justify-content: center;
    width: 100%;
    font-size: var(--font-label);
  }
}

/* ── Inspect-mode UI ─────────────────────────────────────────── */

.inspect-ui__indicator {
  position: fixed;
  top: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-controls);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(10, 11, 15, 0.55);
  border: 1px solid var(--color-hairline);
}

.inspect-ui__chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-secondary);
}

.inspect-ui__chip + .inspect-ui__chip {
  border-left: 1px solid var(--color-hairline);
}

.inspect-ui__exit {
  position: fixed;
  bottom: var(--space-12);
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-controls);
}

/* ── Compass widget ──────────────────────────────────────────── */

.compass {
  position: fixed;
  top: var(--space-8);
  right: var(--space-8);
  z-index: var(--z-controls);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(10, 11, 15, 0.55);
  border: 1px solid var(--color-hairline);
}

.compass__ring {
  position: relative;
  width: 90px;
  height: 90px;
  border: 1px solid var(--color-hairline);
  border-radius: 50%;
}

.compass__mark {
  position: absolute;
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.1em;
  color: var(--color-ink-secondary);
}

/* N gets the warm-white emphasis — it's the "fixed north" reference
 * the user reads everything else relative to. */
.compass__mark--n {
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--color-ink-primary);
}

.compass__mark--e {
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
}

.compass__mark--s {
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
}

.compass__mark--w {
  left: 6px;
  top: 50%;
  transform: translateY(-50%);
}

/* The needle-wrap fills the ring and rotates around its centre. The
 * needle inside is positioned near the top of the wrap, so rotating
 * the wrap by `heading deg` sweeps the needle from N (0°) through E
 * (90°) and back. */
.compass__needle-wrap {
  position: absolute;
  inset: 0;
  transform-origin: 50% 50%;
  transition: transform var(--duration-quick) var(--ease-out);
}

.compass__needle {
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 36px;
  /* Classic compass red — intentionally outside the cinematic palette
   * (cool/hot accents are too orange-toned for the universal red-needle
   * convention readers expect). */
  background: #E11D2A;
}

.compass__needle::before {
  /* A small head at the needle's tip so it reads as an arrow, not a line. */
  content: '';
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background: #E11D2A;
  border-radius: 50%;
}

.compass__readouts {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
}

.compass__readout {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-primary);
  font-variant-numeric: tabular-nums;
}

.inspect-fade-enter-active,
.inspect-fade-leave-active {
  transition: opacity var(--duration-cinematic) var(--ease-out);
}

.inspect-fade-enter-from,
.inspect-fade-leave-to {
  opacity: 0;
}

.inspect-fade-enter-to,
.inspect-fade-leave-from {
  opacity: 1;
}

@media (max-width: 640px) {
  .inspect-ui__indicator {
    /* On mobile, slide the controls hint below the back-link so it
     * doesn't compete for the top edge with the compass. */
    top: calc(var(--space-4) + 48px);
    flex-direction: column;
    gap: 0;
    width: calc(100% - var(--space-8));
  }

  .inspect-ui__chip {
    width: 100%;
    justify-content: center;
    font-size: 10px;
  }

  .inspect-ui__chip + .inspect-ui__chip {
    border-left: 0;
    border-top: 1px solid var(--color-hairline);
  }

  .inspect-ui__exit {
    bottom: var(--space-6);
    width: calc(100% - var(--space-8));
    justify-content: center;
  }

  .compass {
    top: var(--space-4);
    right: var(--space-4);
    padding: var(--space-2) var(--space-3);
    gap: var(--space-2);
  }

  .compass__ring {
    width: 56px;
    height: 56px;
  }

  .compass__needle {
    top: 4px;
    height: 24px;
  }

  .compass__readout {
    font-size: 9px;
    letter-spacing: 0.15em;
  }
}
</style>
