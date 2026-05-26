<script setup lang="ts">
import { useFlightScroll } from '~/composables/useFlightScroll'
import { useFlightAircraft } from '~/composables/useFlightAircraft'

definePageMeta({
  layout: 'cinematic',
})

useSeoMeta({
  title: 'Ahmad Baihaqie — Flight',
  description:
    'A cinematic walkthrough of the work — gate to arrival, in eight phases.',
  ogTitle: 'Ahmad Baihaqie — Flight',
  ogDescription:
    'A cinematic walkthrough of the work — gate to arrival, in eight phases.',
})

/*
 * Two-phase intro choreography:
 *
 *   Phase A — auto-play (sits at top of page, Lenis paused):
 *     1. <CinematicIntro>   plane silhouette flies up through black
 *     2. <CinematicWelcome> "Welcome aboard / to my journey!" fades in,
 *        holds. Emits `complete` when the user is meant to take over.
 *
 *   Phase B — scroll-driven (Lenis resumed, ScrollTrigger pinned):
 *     The hero section pins for 150vh of scroll. As the user scrolls:
 *       • <CinematicOverlay> radial-mask hole grows 0 → 150vw — the
 *         iris reveal, sky + aircraft pop out from the centre of the
 *         wording (Apple-style mask reveal)
 *       • Welcome text scales 1 → 0.5, opacity 1 → 0
 *       • Aircraft materials opacity 0 → 1
 *       • Hero copy (.hero-reveal) opacity 0 → 1, y 24 → 0, staggered
 *     After the pin ends, the hero is fully assembled and the user
 *     continues scrolling to subsequent phases.
 */

const introDone = ref(false)
const welcomeDone = ref(false)

const flightScroll = useFlightScroll()
const aircraft = useFlightAircraft()

watch(welcomeDone, (done) => {
  if (!done) return
  // Welcome fade-in + hold has completed; Lenis is back on. Arm the
  // scroll reveal.
  //
  // IMPORTANT: pin the hero section, NOT .experience-root. Pinning the
  // root would make it a containing block for position:fixed descendants
  // (CinematicOverlay, CinematicWelcome, CinematicFlightScene), so the
  // welcome text would "stick" to wherever the pin's transform put the
  // root instead of staying glued to the viewport. .phase--hero is a
  // sibling of those overlays — pinning it doesn't affect their layout.
  flightScroll.init({
    trigger: '.phase--hero',
    end: '+=150%',
    aircraftMaterials: () => aircraft.getMaterials(),
  })
})

onBeforeUnmount(() => {
  flightScroll.destroy()
})
</script>

<template>
  <div class="experience-root">
    <!-- Background: Three.js sky + aircraft, hidden behind <CinematicOverlay>
         until the iris reveal scrubs it away. -->
    <CinematicFlightScene />
    <CinematicAircraft v-if="welcomeDone" />

    <!-- Persistent black overlay with radial-mask iris. Sits at z=20,
         covers the sky/aircraft. useFlightScroll grows --hole-r 0 → 150vw. -->
    <CinematicOverlay />

    <!-- Auto-play acts. Intro's own overlay (z-modal) plays on top of
         <CinematicOverlay>; both are the same black so the handoff is
         invisible. Welcome stays mounted after fade-in — scroll dismisses it. -->
    <CinematicIntro @complete="introDone = true" />
    <CinematicWelcome v-if="introDone" @complete="welcomeDone = true" />

    <main class="cinematic-page">
      <!-- Phase 00 — Pre-flight. Lower-third composition: small mono dataline
           pinned to the upper-left like a film slate, masthead anchored to
           the bottom-left, sky dominates the middle. -->
      <section class="phase phase--hero">
        <p class="phase__label hero-reveal">FLIGHT AB · 2026</p>

        <div class="phase__masthead">
          <h1 class="phase__display hero-reveal">Ahmad Baihaqie.</h1>
          <p class="phase__subline hero-reveal">Software engineer. UI/UX. Fintech.</p>

          <hr class="phase__rule hero-reveal" />

          <p class="phase__meta hero-reveal">KUL · PRE-FLIGHT</p>
          <p class="phase__body hero-reveal">
            The next eight sections are a flight through what I've built
            and where I'm going. Scroll to depart.
          </p>
        </div>
      </section>

      <!-- Scroll spacer so the page has somewhere to go after the pin ends. -->
      <section class="phase phase--placeholder">
        <p class="phase__label">SCAFFOLD · WEEKEND 2</p>
        <p class="phase__body">
          Iris reveal complete. The plane returns via scroll choreography
          in weekend 3 (takeoff / climb / cruise / FL380 / descent / arrival).
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
.experience-root {
  position: relative;
}

.cinematic-page {
  position: relative;
  z-index: var(--z-content);
  min-height: 100vh;
}

.phase {
  min-height: 100vh;
  padding: var(--space-24) var(--space-8);
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.phase--hero {
  justify-content: space-between;
  align-items: flex-start;
  padding-top: var(--space-12);
  padding-bottom: var(--space-16);
}

.phase__masthead {
  max-width: 680px;
}

.phase__label {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 0 0 var(--space-6);
}

.phase__display {
  font-family: var(--font-display);
  font-size: var(--font-display-hero);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--color-ink-primary);
  margin: 0 0 var(--space-4);
}

.phase__subline {
  font-family: var(--font-body);
  font-size: var(--font-body-large);
  color: var(--color-ink-secondary);
  margin: 0 0 var(--space-8);
}

.phase__rule {
  width: 56px;
  height: 1px;
  background: var(--color-divider);
  border: 0;
  margin: 0 0 var(--space-6);
}

.phase__meta {
  font-family: var(--font-mono);
  font-size: var(--font-ui);
  letter-spacing: 0.1em;
  color: var(--color-ink-muted);
  margin: 0 0 var(--space-4);
}

.phase__body {
  font-family: var(--font-body);
  font-size: var(--font-body-large);
  color: var(--color-ink-secondary);
  line-height: 1.6;
  max-width: 60ch;
  margin: 0;
}

/* Hero copy is invisible until the master scroll choreography fades it
 * up. Scoped here so it can't collide with HeroSection's own
 * .hero-reveal pattern on /. */
.hero-reveal {
  opacity: 0;
}
</style>
