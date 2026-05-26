<script setup lang="ts">
import { gsap } from 'gsap'

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
 * The intro is a three-act sequence:
 *   Act 1 — <CinematicIntro>:    plane crosses, sky reveals (~3.7s)
 *   Act 2 — <CinematicWelcome>:  "Welcome aboard to my journey!" (~3.1s)
 *   Act 3 — <CinematicAircraft> + hero copy: assemble in parallel
 *
 * Each act mounts conditionally based on the previous act's `complete`
 * event, so the timeline can't be raced or skipped accidentally. Hero
 * copy stays hidden (opacity 0, y +24) until Act 2 finishes; then GSAP
 * fades it up at the same time the static aircraft fades in, so the
 * main view assembles in one coordinated beat rather than dribbling on.
 */

const introDone = ref(false)
const welcomeDone = ref(false)
const heroRoot = ref<HTMLElement | null>(null)
let mm: ReturnType<typeof gsap.matchMedia> | null = null

watch(welcomeDone, (done) => {
  if (!done || !heroRoot.value) return

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-reveal',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out', stagger: 0.18 },
      )
    }, heroRoot.value!)
    return () => ctx.revert()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('.hero-reveal', { opacity: 1, y: 0 })
  })
})

onBeforeUnmount(() => {
  mm?.revert()
})
</script>

<template>
  <div class="experience-root">
    <!-- Background layer: the Three.js sky shader, painting behind everything.
         It boots immediately but is hidden by the intro's black overlay until
         the reveal moment. -->
    <CinematicFlightScene />

    <!-- Act 1 — black overlay + plane flies up through the viewport. -->
    <CinematicIntro @complete="introDone = true" />

    <!-- Act 2 — welcome card; mounts only after Act 1 completes. -->
    <CinematicWelcome v-if="introDone" @complete="welcomeDone = true" />

    <!-- Act 3 — static A350 parked in the upper-right of the hero,
         fades in alongside the hero copy below. Mounts only after Act 2. -->
    <CinematicAircraft v-if="welcomeDone" />

    <main class="cinematic-page">
      <!-- Phase 00 — Pre-flight. Lower-third composition: small mono dataline
           pinned to the upper-left like a film slate, masthead anchored to
           the bottom-left, sky dominates the middle. HUD lands in weekend 4. -->
      <section ref="heroRoot" class="phase phase--hero">
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

      <!-- Scroll spacer so Lenis has something to do during the smoke test -->
      <section class="phase phase--placeholder">
        <p class="phase__label">SCAFFOLD · WEEKEND 2</p>
        <p class="phase__body">
          Intro reveal complete. The plane returns via scroll choreography
          in weekend 3 (takeoff / climb / cruise / FL380 / descent / arrival).
        </p>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* The content layer sits above the fixed canvas + aircraft via z-content. */
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

/* Phase 00 — Pre-flight. Lower-third composition.
 * Dataline pinned to the top, masthead anchored to the bottom, sky
 * fills the middle. Other phases (placeholder for now) keep the base
 * centered composition. */
.phase--hero {
  justify-content: space-between;
  align-items: flex-start;
  padding-top: var(--space-12);
  padding-bottom: var(--space-16);
}

.phase__masthead {
  /* Bottom-anchored content block. Narrower than the section so the
   * body wraps to a comfortable reading measure even on wide viewports. */
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
  /* Hairline divider between name+role above and meta+body below.
   * Short and architectural, never spans full width. */
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

/* Hero copy is hidden until the intro completes; GSAP fades it up.
 * Scoped to this page, so it can't collide with HeroSection's own
 * .hero-reveal pattern on /. */
.hero-reveal {
  opacity: 0;
}
</style>
