<script setup lang="ts">
import { useFlightScene } from '~/composables/useFlightScene'
import { useFlightScroll } from '~/composables/useFlightScroll'
import { useFlightAircraft } from '~/composables/useFlightAircraft'

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

const flightScene = useFlightScene()
const flightScroll = useFlightScroll()
const aircraft = useFlightAircraft()

watch(welcomeDone, (done) => {
  if (!done) return
  // Iris reveal pin only. No aircraft pose choreography (autoRotate
  // handles motion). No per-phase ScrollTriggers (no phase content yet).
  flightScroll.init({
    trigger: '.phase--hero',
    end: '+=150%',
    aircraftMaterials: () => aircraft.getMaterials(),
  })
  flightScene.setControlsEnabled(true)
})

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
</style>
