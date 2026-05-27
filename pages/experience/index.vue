<script setup lang="ts">
import { education, experiences, projects, personal } from '~/data/index'
import { useFlightScene } from '~/composables/useFlightScene'
import { useFlightScroll } from '~/composables/useFlightScroll'
import { useFlightAircraft } from '~/composables/useFlightAircraft'
import { usePhaseState } from '~/composables/usePhaseState'

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
 * The flight is an eight-act sequence:
 *
 *   Auto-play before scroll                  Scroll-driven after
 *   ───────────────────────                  ───────────────────
 *   • <CinematicIntro>      plane crosses     Phase 01  Takeoff (Education)
 *   • <CinematicWelcome>    "Welcome aboard"  Phase 02  Climb (Faztech)
 *                                             Phase 03  Cruise (Fiuu / Razer)
 *                                             Phase 04  FL380 (Selected work)
 *                                             Phase 05  FL380 (Other altitudes)
 *                                             Phase 06  Descent (Axel Nova)
 *                                             Phase 07  Arrival (Contact)
 *
 * Aircraft pose (pitch + height) is scrubbed across the post-pin scroll
 * distance by useFlightScroll — pitch up for takeoff, level for cruise,
 * pitch down + drop for descent + landing.
 */

const introDone = ref(false)
const welcomeDone = ref(false)

const flightScene = useFlightScene()
const flightScroll = useFlightScroll()
const aircraft = useFlightAircraft()
const phaseState = usePhaseState()

// Curated splits of data/index.ts content for the FL380 phases.
const featuredProjects = computed(() => projects.filter((p) => p.featured))
const otherProjects = computed(() => projects.filter((p) => !p.featured))

watch(welcomeDone, (done) => {
  if (!done) return
  flightScroll.init({
    trigger: '.phase--hero',
    end: '+=150%',
    aircraftMaterials: () => aircraft.getMaterials(),
    // THREE.Group's rotation/position are Euler/Vector3 instances, which
    // are structurally assignable to the {x,y,z} shape useFlightScroll
    // expects. The cast keeps Three.js types out of the scroll composable.
    aircraftModel: () => aircraft.getModel() as unknown as {
      rotation: { x: number; y: number; z: number }
      position: { x: number; y: number; z: number }
    } | null,
    flightStart: '.phase--takeoff',
    flightEnd: '.phase--arrival',
  })
  // Arm per-phase ScrollTriggers so the HUD knows which phase is in view.
  phaseState.init()
  // Welcome has cleared — enable drag-to-orbit on the camera.
  flightScene.setControlsEnabled(true)
})

onBeforeUnmount(() => {
  flightScroll.destroy()
  phaseState.destroy()
})
</script>

<template>
  <div class="experience-root">
    <CinematicFlightScene />
    <CinematicAircraft v-if="welcomeDone" />
    <CinematicOverlay />
    <CinematicIntro @complete="introDone = true" />
    <CinematicWelcome v-if="introDone" @complete="welcomeDone = true" />

    <!-- HUD — appears once welcome clears, reads PHASE / ALT / STAGE from
         usePhaseState and lets the viewer click-to-jump between phases. -->
    <CinematicHUD v-if="welcomeDone" />

    <main class="cinematic-page">
      <!-- Phase 00 — Pre-flight. Pinned for the iris reveal. -->
      <section class="phase phase--hero">
        <p class="phase__label hero-reveal">FLIGHT AB · 2026</p>

        <div class="phase__masthead">
          <h1 class="phase__display hero-reveal">Ahmad Baihaqie.</h1>
          <p class="phase__subline hero-reveal">Software engineer. UI/UX. Fintech.</p>

          <hr class="phase__rule hero-reveal" />

          <p class="phase__meta hero-reveal">KUL · PRE-FLIGHT</p>
          <p class="phase__body hero-reveal">
            The next seven sections are a flight through what I've built
            and where I'm going. Scroll to depart.
          </p>
        </div>
      </section>

      <!-- Phase 01 — Takeoff. Education. -->
      <CinematicPhaseSection
        class="phase--takeoff"
        phase-label="PHASE 01 · TAKEOFF"
        headline="Universiti Malaya."
        subline="Where it started."
        meta="2019 — 2023 · KUALA LUMPUR"
      >
        <p>
          Bachelor of Islamic Studies and Information Technology — First
          Class Honours, CGPA {{ education.find((e) => e.id === 'um-degree')?.cgpa }}.
          The years that taught me to think before I type.
        </p>
        <p>
          Currently pursuing a Master of Science in Human Resource Development
          at Universiti Putra Malaysia. Research focus: AI adoption, digital
          transformation, and intergenerational dynamics in tech-led organisations.
        </p>
      </CinematicPhaseSection>

      <!-- Phase 02 — Climb. Faztech. -->
      <CinematicPhaseSection
        class="phase--climb"
        phase-label="PHASE 02 · CLIMB"
        :headline="`${experiences.find((e) => e.id === 'faztech')?.company}.`"
        subline="First job — design and tech."
        :meta="`${experiences.find((e) => e.id === 'faztech')?.period?.toUpperCase()} · ${experiences.find((e) => e.id === 'faztech')?.location?.toUpperCase()}`"
      >
        <p>{{ experiences.find((e) => e.id === 'faztech')?.description }}</p>
        <p>Where I learned that craft and reliability are the same skill.</p>
      </CinematicPhaseSection>

      <!-- Phase 03 — Cruise. Fiuu / Razer Merchant Services. -->
      <CinematicPhaseSection
        class="phase--cruise"
        phase-label="PHASE 03 · CRUISE"
        headline="Fiuu Group."
        subline="Where I am now."
        :meta="`${experiences.find((e) => e.id === 'razer')?.period?.toUpperCase()} · ${experiences.find((e) => e.id === 'razer')?.location?.toUpperCase()}`"
      >
        <p>{{ experiences.find((e) => e.id === 'razer')?.description }}</p>
        <p>
          Vue, Nuxt, Tailwind — making money move through interfaces
          that respect the people using them.
        </p>
      </CinematicPhaseSection>

      <!-- Phase 04 — FL380. Selected work. -->
      <CinematicPhaseSection
        class="phase--fl380-selected"
        phase-label="PHASE 04 · ALTITUDE 38,000 FT"
        headline="Selected work."
        subline="The pieces that prove the rest."
      >
        <div class="project-grid">
          <article v-for="p in featuredProjects" :key="p.id" class="project-tile">
            <p class="project-tile__tag">{{ p.tag }}</p>
            <h3 class="project-tile__name">{{ p.name }}</h3>
            <p class="project-tile__description">{{ p.description }}</p>
            <p class="project-tile__stack">{{ p.stack.join(' · ') }}</p>
            <a
              v-if="p.href && p.href !== '#'"
              :href="p.href"
              target="_blank"
              rel="noopener noreferrer"
              class="project-tile__link"
            >
              View case study →
            </a>
          </article>
        </div>
      </CinematicPhaseSection>

      <!-- Phase 05 — FL380. Other altitudes. -->
      <CinematicPhaseSection
        class="phase--fl380-other"
        phase-label="PHASE 05 · ALTITUDE 38,000 FT"
        headline="Other altitudes."
        subline="Smaller pieces, same eye."
      >
        <div class="project-grid">
          <article v-for="p in otherProjects" :key="p.id" class="project-tile">
            <p class="project-tile__tag">{{ p.tag }}</p>
            <h3 class="project-tile__name">{{ p.name }}</h3>
            <p class="project-tile__description">{{ p.description }}</p>
            <p class="project-tile__stack">{{ p.stack.join(' · ') }}</p>
          </article>
        </div>
      </CinematicPhaseSection>

      <!-- Phase 06 — Descent. Axel Nova Ventures. -->
      <CinematicPhaseSection
        class="phase--descent"
        phase-label="PHASE 06 · DESCENT"
        headline="Axel Nova Ventures."
        subline="What I'm building outside the job."
        meta="ONGOING · KUALA LUMPUR"
      >
        <p>
          A personal brand and vision — where the design language lives
          outside fintech. Aviation, luxury, restraint, future.
        </p>
        <p>
          <a href="https://axelnovaventures.com" target="_blank" rel="noopener noreferrer">
            Visit axelnovaventures.com →
          </a>
        </p>
      </CinematicPhaseSection>

      <!-- Phase 07 — Arrival. Contact. -->
      <CinematicPhaseSection
        class="phase--arrival"
        phase-label="PHASE 07 · ARRIVAL"
        headline="Now arriving."
        subline="Let's talk."
        meta="DESTINATION REACHED"
      >
        <p>
          <a :href="`mailto:${personal.email}`">{{ personal.email }}</a>
        </p>
        <p>
          Currently in {{ personal.location }}, available for {{ personal.availableFor }}.
        </p>
      </CinematicPhaseSection>
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

/* ── Phase 00 hero (kept inline; uses the same composition tokens as
 * <CinematicPhaseSection> but lives outside the component because of
 * its pin + hero-reveal class names). */
.phase--hero {
  min-height: 100vh;
  padding: var(--space-12) var(--space-8) var(--space-16);
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.phase--hero .phase__label {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 0 0 var(--space-6);
}

.phase--hero .phase__masthead {
  max-width: 680px;
}

.phase--hero .phase__display {
  font-family: var(--font-display);
  font-size: var(--font-display-hero);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  /* Deep warm near-black — the title reads as a dark editorial headline
   * against the sky, like a magazine masthead. Keeps warmth via the
   * slight green/red lift over pure black. */
  color: #14110D;
  margin: 0 0 var(--space-4);
}

.phase--hero .phase__subline {
  font-family: var(--font-body);
  font-size: var(--font-body-large);
  color: var(--color-ink-secondary);
  margin: 0 0 var(--space-8);
}

.phase--hero .phase__rule {
  width: 56px;
  height: 1px;
  background: var(--color-divider);
  border: 0;
  margin: 0 0 var(--space-6);
}

.phase--hero .phase__meta {
  font-family: var(--font-mono);
  font-size: var(--font-ui);
  letter-spacing: 0.1em;
  color: var(--color-ink-muted);
  margin: 0 0 var(--space-4);
}

.phase--hero .phase__body {
  font-family: var(--font-body);
  font-size: var(--font-body-large);
  color: var(--color-ink-secondary);
  line-height: 1.6;
  max-width: 60ch;
  margin: 0;
}

.hero-reveal {
  opacity: 0;
}

/* ── FL380 project tiles ─────────────────────────────────────────── */

.project-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  margin-top: var(--space-4);
}

.project-tile {
  padding: var(--space-6);
  background: rgba(19, 21, 28, 0.55);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-card);
  backdrop-filter: blur(4px);
}

.project-tile__tag {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-cool);
  margin: 0 0 var(--space-3);
}

.project-tile__name {
  font-family: var(--font-display);
  font-size: var(--font-display-medium);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-ink-primary);
  margin: 0 0 var(--space-3);
}

.project-tile__description {
  font-family: var(--font-body);
  font-size: var(--font-body);
  color: var(--color-ink-secondary);
  line-height: 1.6;
  margin: 0 0 var(--space-4);
}

.project-tile__stack {
  font-family: var(--font-mono);
  font-size: var(--font-body-small);
  letter-spacing: 0.05em;
  color: var(--color-ink-muted);
  margin: 0 0 var(--space-3);
}

.project-tile__link {
  font-family: var(--font-mono);
  font-size: var(--font-ui);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-cool);
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  transition: color var(--duration-quick) var(--ease-out);
}

.project-tile__link:hover {
  color: var(--color-cool-soft);
}
</style>
