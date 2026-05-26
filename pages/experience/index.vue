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
 * Hero entrance choreography. The hero copy stays hidden (opacity 0,
 * y-offset 24px) until <CinematicIntro> emits `complete` after its 8s
 * timeline. Then the .hero-reveal elements fade up in sequence — slow
 * (1.4s) and well-staggered (0.18s) so the entrance reads cinematic,
 * not snappy. Under reduced motion the elements snap straight to their
 * resting state.
 */

const introDone = ref(false)
const heroRoot = ref<HTMLElement | null>(null)
let mm: ReturnType<typeof gsap.matchMedia> | null = null

watch(introDone, (done) => {
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

    <!-- One-shot cinematic intro: black overlay + plane flies up through the
         viewport, then unmounts. The plane returns later via scroll choreography
         (weekend 3). When the intro finishes, the hero copy below fades up. -->
    <CinematicIntro @complete="introDone = true" />

    <main class="cinematic-page">
      <!-- Phase 00 — Pre-flight (placeholder; HUD lands in weekend 4) -->
      <section ref="heroRoot" class="phase phase--hero">
        <p class="phase__label hero-reveal">FLIGHT AB · 2026</p>
        <h1 class="phase__display hero-reveal">Ahmad Baihaqie.</h1>
        <p class="phase__subline hero-reveal">Software engineer. UI/UX. Fintech.</p>
        <p class="phase__meta hero-reveal">KUL · PRE-FLIGHT</p>
        <p class="phase__body hero-reveal">
          The next eight sections are a flight through what I've built
          and where I'm going. Scroll to depart.
        </p>
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

.phase__meta {
  font-family: var(--font-mono);
  font-size: var(--font-ui);
  letter-spacing: 0.1em;
  color: var(--color-ink-muted);
  margin: 0 0 var(--space-6);
}

.phase__body {
  font-family: var(--font-body);
  font-size: var(--font-body-large);
  color: var(--color-ink-secondary);
  line-height: 1.6;
  max-width: 60ch;
}

/* Hero copy is hidden until the intro completes; GSAP fades it up.
 * Scoped to this page, so it can't collide with HeroSection's own
 * .hero-reveal pattern on /. */
.hero-reveal {
  opacity: 0;
}
</style>
