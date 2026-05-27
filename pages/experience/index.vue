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

    <!-- Inspect mode UI — top indicator strip showing the controls,
         bottom exit button to return to the post-reveal CTAs. Both
         fade together when inspect mode toggles. -->
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
        <button type="button" class="cta cta--ghost inspect-ui__exit" @click="onExitInspect">
          <Icon name="fluent:arrow-left-16-filled" size="14" />
          <span>Exit Inspect</span>
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
    top: var(--space-4);
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
}
</style>
