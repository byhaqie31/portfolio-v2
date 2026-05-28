<script setup lang="ts">
import { useFlightScene } from '~/composables/useFlightScene'
import { useFlightScroll } from '~/composables/useFlightScroll'
import { useFlightAircraft } from '~/composables/useFlightAircraft'
import { useLenis } from '~/composables/useLenis'
import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import {
  personal,
  education,
  experiences as staticExperiences,
  projects as staticProjects,
  type Experience,
  type Project,
} from '~/data'

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
 * /experience — two regions sharing one URL.
 *
 *   .experience-hero   100vh cinematic frame: intro splash → welcome card
 *                      → iris reveal → 3D A350 + sky + clouds + CTAs.
 *                      The only place WebGL ever renders on this page.
 *
 *   .experience-body   Editorial portfolio. No Three.js — just typography,
 *                      whitespace, and aviation-themed SVG flourishes.
 *                      Currently a placeholder; content lands in the next
 *                      review-point PR.
 *
 * `VIEW MY JOURNEY` is the threshold — it Lenis-scrolls from hero to
 * body. The 3D scene's render loop pauses when `.experience-hero` is
 * offscreen (see FlightScene.vue's IntersectionObserver) and resumes on
 * re-entry, so scrolling back up restores the cinematic frame.
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

/* Experiences come from the same /api/experiences endpoint the public
 * portfolio's <SectionsExperienceSection> uses — so the cinematic page
 * sees the DB overlay + admin preview edits, with `data/index.ts` as
 * the static fallback when the API returns empty. Same composable, same
 * row→Experience mapping (DB uses `is_current` / `slug`, static uses
 * `current` / `id`). */
const { data: experiencesData } = await usePreviewableFetch<Experience[]>(
  'experiences',
  '/api/experiences',
  {
    key: 'experiences',
    default: () => staticExperiences,
  },
)

const allExperiences = computed<Experience[]>(() => {
  const data = experiencesData.value as any[] | null
  if (!data?.length) return staticExperiences
  return data.map((e: any) => ({
    id: e.slug || e.id,
    period: e.period,
    company: e.company,
    location: e.location,
    role: e.role,
    current: e.is_current || e.current,
    description: e.description,
    bullets: e.bullets || [],
    tags: e.tags || [],
  }))
})

/* Cinematic /experience features only two roles, ordered chronologically
 * — Faztech first (the first job), Razer second (current). Forward order
 * drives the side-by-side flex crossfade. Filtered + ordered by id
 * rather than relying on the API's sort_order so the cinematic narrative
 * stays intentional even if the admin reorders. */
const workExperiences = computed<Experience[]>(() => {
  const wanted = ['faztech', 'razer'] as const
  return wanted
    .map((id) => allExperiences.value.find((e) => e.id === id))
    .filter((e): e is Experience => e != null)
})

/* Projects — same overlay-aware fetch pattern as the public site's
 * <SectionsWorkSection>. Maps DB row shape (slug, github_url, etc.)
 * to the Project type. Static fallback covers dev / empty-DB cases. */
const { data: projectsData } = await usePreviewableFetch<Project[]>(
  'projects',
  '/api/projects',
  {
    key: 'projects',
    default: () => staticProjects,
  },
)

const allProjects = computed<Project[]>(() => {
  const data = projectsData.value as any[] | null
  if (!data?.length) return staticProjects
  return data.map((p: any) => ({
    id: p.slug || p.id,
    tag: p.tag,
    featured: !!p.featured,
    name: p.name,
    description: p.description,
    stack: p.stack || [],
    metrics: p.metrics,
    href: p.href,
    github: p.github_url || p.github,
  }))
})

/* Featured first so the horizontal scroll opens with the strongest
 * work, then the rest in source order. */
const showcaseProjects = computed<Project[]>(() => {
  const featured = allProjects.value.filter((p) => p.featured)
  const others = allProjects.value.filter((p) => !p.featured)
  return [...featured, ...others]
})

/* Active card index in the projects horizontal track. Updated by the
 * scrub onUpdate — drives the `XX / 04` counter and the active-card
 * border highlight. */
const activeProjectIndex = ref(0)

/* Active card index for the pinned Experience track. Updated by the
 * horizontal-scroll scrub via onUpdate. Drives the `XX / NN` counter
 * below the cards. */
const activeStackIndex = ref(0)

/* Runway heights scale with API card count so the pin distance always
 * matches the number of cards to slide through (one viewport per
 * card transition). The `max(2, ...)` clamps tiny edge cases so the
 * runway is always at least 200vh even if the API returns 1 card. */
const experiencePinHeight = computed(
  () => `${Math.max(2, workExperiences.value.length) * 100}vh`,
)
const projectsPinHeight = computed(
  () => `${Math.max(2, showcaseProjects.value.length) * 100}vh`,
)


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
  // handles motion). The pin trigger is `.experience-hero` — the hero
  // region wrapper that holds the iris-reveal placeholder. onScrollProgress
  // is the masterTl's own scrub progress — the only reliable read on
  // this pinned timeline (sibling ScrollTriggers on a pinned element
  // calculate against a stationary trigger and stay at 0).
  flightScroll.init({
    trigger: '.experience-hero',
    end: '+=150%',
    aircraftMaterials: () => aircraft.getMaterials(),
    onScrollProgress: (p) => {
      // Threshold matches the welcome text's fade-out window
      // (0.0 → 0.6 in useFlightScroll's masterTl). The moment the
      // welcome text is gone the CTAs slide in above the still-visible
      // scroll hint, so the viewer has a clear next action without
      // waiting for the iris reveal to fully finish at 0.98.
      revealComplete.value = p >= 0.6
    },
  })
  flightScene.setControlsEnabled(true)
})

function onPlayWithAircraft() {
  // The CTA appears at iris-reveal progress 0.6 but the reveal runs
  // to 1.0 — so the scene may only be partially revealed when the
  // user clicks. Smooth-scroll forward to the end of the iris-reveal
  // pin first so the iris opens fully, then hand the camera over.
  // GSAP scrub is bound to scroll so the iris animates open during
  // the scrollTo automatically.
  const enterInspect = () => {
    inspectMode.value = true
    flightScene.setInspectMode(true)
    lenis.instance?.stop()
  }

  // The iris-reveal pin extends `+=150%` of viewport-height from the
  // hero's top, so the reveal completes at scroll position 150vh.
  const target = window.innerHeight * 1.5
  if (lenis.instance && window.scrollY < target - 4) {
    lenis.instance.scrollTo(target, {
      duration: 0.8,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      onComplete: enterInspect,
    })
  } else {
    enterInspect()
  }
}

function onExitInspect() {
  inspectMode.value = false
  flightScene.setInspectMode(false)
  lenis.instance?.start()
}

function onViewJourney() {
  // The threshold from hero to editorial body. Lenis-scrolls so the
  // motion matches the rest of the cinematic register (smooth, decisive,
  // no jump-cut). Falls back to native scrollIntoView if Lenis isn't
  // available — e.g. under prefers-reduced-motion when the OS-level
  // setting collapses smooth scroll, or during HMR before Lenis remounts.
  const target = document.querySelector('.experience-body')
  if (!target) return
  if (lenis.instance) {
    lenis.instance.scrollTo(target as HTMLElement, {
      duration: 1.8,
      // expo.out approximation — matches the cinematic easing register
      // without pulling GSAP's parseEase into this file.
      easing: (t: number) => 1 - Math.pow(1 - t, 5),
    })
  } else {
    (target as HTMLElement).scrollIntoView({ behavior: 'smooth' })
  }
}

/* Hero visibility observer. Owned by the page (not FlightScene) because
 * the page's onMounted is the first lifecycle hook that runs after the
 * full template — including `.experience-hero` — is in the DOM. Child
 * component onMounted hooks fire before their sibling vnodes are
 * flushed, so observing from FlightScene.vue silently misses the
 * element on first mount and the gate stays at its initial `true`.
 *
 * Single observer drives two consumers:
 *   - flightScene.setActive() pauses the render loop when the hero
 *     scrolls offscreen (no point drawing pixels the body covers).
 *   - The CTAs' v-if uses the same heroVisible state to hide the
 *     post-reveal CTAs once the user has left the hero. */
let heroObserver: IntersectionObserver | null = null
/* gsap.matchMedia handle for the editorial body's scroll-triggered
 * reveals. Owned by the page so we can revert() it on unmount, which
 * kills every ScrollTrigger registered inside its callback. */
let bodyReveals: gsap.MatchMedia | null = null

onMounted(() => {
  const heroEl = document.querySelector('.experience-hero')
  if (heroEl) {
    heroObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry) flightScene.setActive(entry.isIntersecting)
      },
      { threshold: 0 },
    )
    heroObserver.observe(heroEl)
  }

  gsap.registerPlugin(ScrollTrigger)

  /* Refresh ScrollTrigger once fonts have loaded — Geist / Playfair /
   * JetBrains Mono shift line heights when they swap in from fallback
   * fonts, which moves every editorial section's measured position.
   * Without this, the Projects horizontal scrub's `distance()` may
   * have measured against the fallback layout and the slide range
   * stays wrong. */
  if (typeof document !== 'undefined' && 'fonts' in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }

  bodyReveals = gsap.matchMedia()
  bodyReveals.add('(prefers-reduced-motion: no-preference)', () => {
    /* Education timeline — staggered fade-up of each entry as the
     * section enters the viewport. Fires once (no scrub), so it reads
     * as a deliberate reveal not a parallax effect. */
    gsap.from('.edu-timeline__entry', {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power2.out',
      stagger: 0.15,
      scrollTrigger: {
        trigger: '.edu-timeline',
        start: 'top 80%',
        once: true,
      },
    })

    /* Experience horizontal scrub — identical pattern to Projects
     * below. The editorial section pins via CSS sticky inside its
     * runway; GSAP scrubs the cards container's translateX so each
     * work experience slides into the centred position as the user
     * scrolls. activeStackIndex tracks the card closest to viewport
     * centre for the counter. */
    const expCardsContainer = document.querySelector<HTMLElement>('.experience-track__cards')
    const expViewport = document.querySelector<HTMLElement>('.experience-track__viewport')
    const expCards = gsap.utils.toArray<HTMLElement>('.experience-card')

    if (expCardsContainer && expViewport && expCards.length > 1) {
      const expDistance = () => expCardsContainer.scrollWidth - expViewport.clientWidth

      gsap.set(expCardsContainer, { x: 0 })

      gsap.to(expCardsContainer, {
        x: () => -expDistance(),
        ease: 'none',
        scrollTrigger: {
          /* CSS sticky (on .editorial-section--pinned) owns the
           * lock. GSAP just scrubs translateX across the runway's
           * scroll range. start=top top aligns scrub progress 0
           * with the moment sticky engages, so card 01 stays
           * centred at the lock moment. */
          id: 'experience-pin',
          trigger: '.editorial-section--experience',
          start: 'top top',
          endTrigger: '.editorial-section__runway--experience',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.round(self.progress * (expCards.length - 1))
            if (activeStackIndex.value !== idx) {
              activeStackIndex.value = idx
            }
          },
        },
      })
    }

    /* Projects pinned section. Same pattern as Experience — pin the
     * whole editorial section, then animate inner content during the
     * pin window. Here the inner content is the cards translating
     * horizontally so the user's vertical scroll becomes horizontal
     * card movement. Each card transition costs one viewport-height
     * of scroll input. */
    const projectsCards = document.querySelector<HTMLElement>('.projects-track__cards')
    const projectsViewport = document.querySelector<HTMLElement>('.projects-track__viewport')
    const projectCards = gsap.utils.toArray<HTMLElement>('.project-card')

    if (projectsCards && projectsViewport && projectCards.length > 1) {
      const distance = () => projectsCards.scrollWidth - projectsViewport.clientWidth

      /* Pin the initial state explicitly — first card centred at
       * the moment sticky engages. The lead-in padding on
       * .projects-track__cards already centers it geometrically;
       * this gsap.set just guarantees no transient transform from
       * any earlier code touching the element. */
      gsap.set(projectsCards, { x: 0 })

      gsap.to(projectsCards, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          /* Same sticky+scrub pattern as Experience above. */
          id: 'projects-pin',
          trigger: '.editorial-section--projects',
          start: 'top top-=80%',
          endTrigger: '.editorial-section__runway--projects',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.round(self.progress * (projectCards.length - 1))
            if (activeProjectIndex.value !== idx) {
              activeProjectIndex.value = idx
            }
          },
        },
      })
    }
  })
})

onBeforeUnmount(() => {
  heroObserver?.disconnect()
  heroObserver = null
  bodyReveals?.revert()
  bodyReveals = null
  flightScroll.destroy()
})
</script>

<template>
  <div class="experience-root" :class="{ 'experience-root--inspect': inspectMode }">
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
      <!-- Hero region. 100vh, pinned by useFlightScroll for the iris
           reveal's +=150% scroll distance. The 3D scene + sky + clouds
           render behind this (via the fixed <CinematicFlightScene />
           sibling above); the page's IntersectionObserver watches this
           element to pause the render loop when it scrolls out of view.
           The post-reveal CTAs live INSIDE this section so they scroll
           out with the plane — they're part of the hero, not a
           viewport-fixed overlay. (Hard rule 7 still holds: the CTAs
           are position:absolute, not position:fixed, so the pin doesn't
           re-parent their containing block in a problematic way.) -->
      <section class="experience-hero" aria-hidden="false">
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
      </section>

      <!-- Editorial body. Lives at z-content, opaque bg, so it covers
           the fixed 3D canvas when scrolled into view. Composed entirely
           of <CinematicEditorialSection> blocks — one editorial voice,
           not a stack of bespoke compositions. Sections land one at a
           time per review-point. -->
      <section class="experience-body">
        <CinematicEditorialSection
          id="about"
          label="About"
          headline="A bit about me."
          :subline="personal.summary"
          heading="045°"
          flourish="none"
        >
          <p v-for="(para, i) in personal.bio" :key="i">{{ para }}</p>
        </CinematicEditorialSection>

        <CinematicEditorialSection
          id="education"
          label="Education"
          headline="Where I learned."
          heading="023°"
        >
          <!-- Vertical-rail timeline. Reverse chronological — most recent
               (Masters, in progress) at the top, oldest (Foundation) at
               the bottom. The rail is a 1px hairline running through the
               dots; the first entry's dot is filled to read as "current".
               <ul> over <ol> because chronology is conveyed visually by
               position on the rail, not by list semantics. -->
          <ul class="edu-timeline">
            <li
              v-for="(entry, i) in education"
              :key="entry.id"
              class="edu-timeline__entry"
              :class="{ 'edu-timeline__entry--current': i === 0 }"
            >
              <span class="edu-timeline__dot" aria-hidden="true" />
              <p class="edu-timeline__period">{{ entry.period }}</p>
              <h3 class="edu-timeline__institution">{{ entry.institution }}</h3>
              <p class="edu-timeline__degree">{{ entry.degree }}</p>
              <p class="edu-timeline__meta">
                <span>CGPA · {{ entry.cgpa }}</span>
                <span class="edu-timeline__sep" aria-hidden="true">/</span>
                <span>{{ entry.location }}</span>
              </p>
            </li>
          </ul>
        </CinematicEditorialSection>

        <CinematicEditorialSection
          id="experience"
          label="Experience"
          headline="Where I've worked."
          subline="Two roles, one trajectory — from the technician bench in Tangkak to fintech UI in Shah Alam."
          heading="100°"
          pin
          :pin-height="experiencePinHeight"
        >
          <!-- Horizontal-scroll track. Identical pattern to Projects:
               the editorial section pins, and scrolling through the
               runway scrubs the cards container's translateX so each
               experience card slides into the centered position one
               at a time. -->
          <div class="experience-track">
            <div class="experience-track__viewport">
              <div class="experience-track__cards">
                <article
                  v-for="(role, i) in workExperiences"
                  :key="role.id"
                  class="experience-card"
                  :class="{ 'experience-card--active': activeStackIndex === i }"
                  :data-card-index="i"
                >
                  <header class="experience-card__header">
                    <span class="experience-card__index">
                      {{ String(i + 1).padStart(2, '0') }}
                    </span>
                    <span v-if="role.current" class="experience-card__tag">
                      Current
                    </span>
                  </header>

                  <p class="experience-card__meta">
                    <span>{{ role.period }}</span>
                    <span class="experience-card__sep" aria-hidden="true">/</span>
                    <span>{{ role.location }}</span>
                  </p>

                  <h3 class="experience-card__company">{{ role.company }}</h3>
                  <p class="experience-card__role">{{ role.role }}</p>

                  <p class="experience-card__description">{{ role.description }}</p>

                  <ul class="experience-card__bullets">
                    <li v-for="(bullet, j) in role.bullets" :key="j">{{ bullet }}</li>
                  </ul>

                  <ul class="experience-card__tags" aria-label="Tools used">
                    <li v-for="tag in role.tags" :key="tag">{{ tag }}</li>
                  </ul>
                </article>
              </div>
            </div>

            <div class="experience-track__counter" aria-hidden="true">
              <span class="experience-track__counter-active">
                {{ String(activeStackIndex + 1).padStart(2, '0') }}
              </span>
              <span class="experience-track__counter-sep">/</span>
              <span>{{ String(workExperiences.length).padStart(2, '0') }}</span>
            </div>
          </div>
        </CinematicEditorialSection>

        <CinematicEditorialSection
          id="projects"
          label="Projects"
          headline="My projects."
          subline="A horizontal sweep through what I've built — from cyberpunk dashboards to fintech portals."
          heading="072°"
          pin
          :pin-height="projectsPinHeight"
        >
          <!-- Horizontal-scroll track. The whole editorial section is
               pinned via ScrollTrigger pin:true (in onMounted); inside
               the pinned section, .projects-track__cards translates
               horizontally as GSAP scrubs. The track breaks out of
               the editorial column via negative margins so it spans
               full viewport width. -->
          <div class="projects-track">
            <div class="projects-track__viewport">
              <div class="projects-track__cards">
                <article
                  v-for="(project, i) in showcaseProjects"
                  :key="project.id"
                  class="project-card"
                  :class="{ 'project-card--active': activeProjectIndex === i }"
                  :data-project-index="i"
                >
                  <header class="project-card__header">
                    <span class="project-card__index">
                      {{ String(i + 1).padStart(2, '0') }}
                    </span>
                    <span v-if="project.featured" class="project-card__tag">
                      Featured
                    </span>
                  </header>

                  <h3 class="project-card__name">{{ project.name }}</h3>
                  <p class="project-card__description">{{ project.description }}</p>

                  <ul class="project-card__stack" aria-label="Tech stack">
                    <li v-for="tech in project.stack" :key="tech">{{ tech }}</li>
                  </ul>

                  <footer v-if="project.href || project.github" class="project-card__footer">
                    <a
                      v-if="project.href"
                      :href="project.href"
                      target="_blank"
                      rel="noopener"
                      class="project-card__link"
                    >
                      <Icon name="fluent:open-16-filled" size="14" />
                      <span>Visit site</span>
                    </a>
                    <a
                      v-if="project.github"
                      :href="project.github"
                      target="_blank"
                      rel="noopener"
                      class="project-card__link"
                    >
                      <Icon name="fluent:code-16-filled" size="14" />
                      <span>Source</span>
                    </a>
                  </footer>
                </article>
              </div>
            </div>

            <div class="projects-track__counter" aria-hidden="true">
              <span class="projects-track__counter-active">
                {{ String(activeProjectIndex + 1).padStart(2, '0') }}
              </span>
              <span class="projects-track__counter-sep">/</span>
              <span>{{ String(showcaseProjects.length).padStart(2, '0') }}</span>
            </div>
          </div>
        </CinematicEditorialSection>

        <CinematicEditorialSection
          id="contact"
          label="Contact"
          headline="Let's talk."
          subline="If something here sparked an idea, a project, or a question — I'd love to hear from you. Available for full-time roles or contract work."
          heading="360°"
        >
          <div class="contact-body">
            <a
              :href="`mailto:${personal.email}`"
              class="contact-primary"
            >
              <Icon name="fluent:mail-16-filled" size="20" />
              <span>{{ personal.email }}</span>
            </a>

            <div class="contact-secondary">
              <a
                :href="personal.linkedin"
                target="_blank"
                rel="noopener"
                class="contact-link"
              >
                <Icon name="fluent:open-16-filled" size="14" />
                <span>LinkedIn</span>
              </a>
              <a
                :href="personal.github"
                target="_blank"
                rel="noopener"
                class="contact-link"
              >
                <Icon name="fluent:code-16-filled" size="14" />
                <span>GitHub</span>
              </a>
              <a
                :href="`tel:${personal.mobile.replace(/\s/g, '')}`"
                class="contact-link"
              >
                <Icon name="fluent:call-16-filled" size="14" />
                <span>{{ personal.mobile }}</span>
              </a>
            </div>

            <p class="contact-meta">
              <span>Based in {{ personal.location }}</span>
              <span class="contact-meta__sep" aria-hidden="true">·</span>
              <span>{{ personal.availableFor }}</span>
              <span class="contact-meta__sep" aria-hidden="true">·</span>
              <span>{{ personal.focus }}</span>
            </p>
          </div>
        </CinematicEditorialSection>
      </section>
    </main>

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
/* Hide the welcome card's "SCROLL TO EXPLORE MORE" hint while the user
 * is in Pilot Mode — the hint becomes misleading (page scroll is paused;
 * the only way to leave is the Exit button). Targets the hint inside
 * <CinematicWelcome> via :deep because it's a child component. */
.experience-root--inspect :deep(.welcome__hint) {
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--duration-quick) var(--ease-out);
}

.experience-root {
  position: relative;
  /* overflow-x: clip (not `hidden`) — both prevent the phantom
   * horizontal scrollbar from transforming children (back-link
   * translateX, project-track full-viewport breakout, etc.), but
   * `clip` does NOT create a scrolling context. That matters for
   * descendant `position: sticky` elements — `overflow-x: hidden`
   * would silently break the pinned editorial sections; `clip`
   * leaves their sticky behavior intact. */
  overflow-x: clip;
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

.experience-hero {
  /* The pin trigger. 100vh so the iris reveal has a viewport-height
   * placeholder to pin against. No overflow:hidden — ScrollTrigger's
   * pin uses transforms during the pinned window, and clipping the
   * parent of the pin can interact badly with that. */
  position: relative;
  min-height: 100vh;
  width: 100%;
}

.experience-body {
  /* Opt back in to pointer events (parent .cinematic-page disables them
   * so the empty pinned hero doesn't intercept drags meant for
   * OrbitControls on the canvas behind). Once we're on the body, the
   * canvas is hidden behind this opaque bg and pointer events should
   * land on body content.
   *
   * No padding here — <CinematicEditorialSection> owns its own internal
   * top/bottom padding so the wing-divider flourishes between sections
   * land in the right gap. Sections compose vertically with their own
   * rhythm; the body just provides the dark canvas and bounds. */
  position: relative;
  background: var(--color-bg-base);
  color: var(--color-ink-secondary);
  font-family: var(--font-body);
  pointer-events: auto;
}

/* ── Education timeline (vertical rail with date stops) ──────── */

.edu-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}

.edu-timeline::before {
  /* The rail — a 1px hairline running through every dot's centre.
   * Insets top/bottom so it terminates at the first and last dots
   * rather than running off the edges. */
  content: '';
  position: absolute;
  top: 8px;
  bottom: 8px;
  left: 5px;
  width: 1px;
  background: var(--color-hairline);
}

.edu-timeline__entry {
  position: relative;
  padding-left: var(--space-8);
  padding-bottom: var(--space-12);
}

.edu-timeline__entry:last-child {
  padding-bottom: 0;
}

.edu-timeline__dot {
  /* Sits on top of the rail so the hairline reads as passing through
   * the entry. Bg fills with body bg so the rail doesn't show inside
   * the hollow dot; current-entry variant fills with ink instead. */
  position: absolute;
  top: 6px;
  left: 0;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--color-bg-base);
  border: 1px solid var(--color-ink-muted);
}

.edu-timeline__entry--current .edu-timeline__dot {
  /* Most recent entry — filled, slightly brighter ring. Reads as
   * "the now stop". */
  background: var(--color-ink-secondary);
  border-color: var(--color-ink-secondary);
}

.edu-timeline__period {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 0 0 var(--space-2);
}

.edu-timeline__institution {
  font-family: var(--font-display);
  font-size: var(--font-display-medium);
  font-weight: 400;
  line-height: 1.15;
  letter-spacing: -0.01em;
  color: var(--color-ink-primary);
  margin: 0 0 var(--space-2);
}

.edu-timeline__degree {
  font-family: var(--font-body);
  font-size: var(--font-body);
  line-height: 1.5;
  color: var(--color-ink-secondary);
  margin: 0 0 var(--space-3);
}

.edu-timeline__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--font-caption);
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 0;
}

.edu-timeline__sep {
  color: var(--color-ink-faint);
}

@media (max-width: 640px) {
  .edu-timeline__meta {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }
  .edu-timeline__sep {
    display: none;
  }
}

/* ── Experience horizontal-scroll track ───────────────────────
 *
 * Identical pattern to Projects below. The Experience section
 * locks on entry, then scrolling through its runway scrubs the
 * cards' translateX so each work experience slides into view
 * one at a time. Same breakout, same viewport clipping, same
 * card visual register. */

:deep(.editorial-section--experience .editorial-section__body) {
  max-width: none;
}

:deep(.editorial-section--experience.editorial-section--pinned) {
  overflow: visible;
}

.experience-track {
  position: relative;
  left: 50%;
  margin-left: -50vw;
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-5);
}

.experience-track__viewport {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  max-height: 68vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.experience-track__cards {
  display: flex;
  gap: var(--space-6);
  padding: 0 calc(50vw - min(320px, 37.5vw));
  height: 100%;
  will-change: transform;
}

.experience-card {
  flex: 0 0 min(640px, 75vw);
  height: 100%;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-card);
  padding: var(--space-8);
  display: grid;
  /* header · meta · company · role · description (1fr fills) · bullets · tags */
  grid-template-rows: auto auto auto auto 1fr auto auto;
  gap: var(--space-4);
  transition: border-color var(--duration-quick) var(--ease-out);
  overflow: hidden;
}

.experience-card--active {
  border-color: rgba(255, 255, 255, 0.18);
}

.experience-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.experience-card__index {
  color: var(--color-ink-faint);
  font-variant-numeric: tabular-nums;
}

.experience-card--active .experience-card__index {
  color: var(--color-ink-secondary);
}

.experience-card__tag {
  color: var(--color-ink-primary);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sharp);
}

.experience-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--font-caption);
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.experience-card__sep {
  color: var(--color-ink-faint);
}

.experience-card__company {
  font-family: var(--font-display);
  font-size: var(--font-display-medium);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--color-ink-primary);
  margin: 0;
}

.experience-card__role {
  font-family: var(--font-mono);
  font-size: var(--font-ui);
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--color-ink-secondary);
  margin: 0;
}

.experience-card__description {
  font-family: var(--font-body);
  font-size: var(--font-body-small);
  line-height: 1.55;
  color: var(--color-ink-secondary);
  margin: 0;
}

.experience-card__bullets {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--space-2);
  font-size: var(--font-body-small);
}

.experience-card__bullets li {
  position: relative;
  padding-left: var(--space-4);
  font-family: var(--font-body);
  line-height: 1.55;
  color: var(--color-ink-secondary);
}

.experience-card__bullets li::before {
  content: '›';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--color-ink-faint);
  font-family: var(--font-mono);
}

.experience-card__tags {
  list-style: none;
  margin: 0;
  padding-top: var(--space-3);
  border-top: 1px solid var(--color-hairline-soft);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.experience-card__tags li {
  font-family: var(--font-mono);
  font-size: var(--font-caption);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sharp);
}

.experience-track__counter {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  color: var(--color-ink-muted);
  font-variant-numeric: tabular-nums;
}

.experience-track__counter-active {
  color: var(--color-ink-primary);
  font-size: var(--font-ui);
}

.experience-track__counter-sep {
  color: var(--color-ink-faint);
}

@media (max-width: 768px) {
  /* Mobile: drop the horizontal scroll, stack cards vertically. */
  .experience-track {
    left: auto;
    margin-left: 0;
    width: auto;
    height: auto;
    justify-content: flex-start;
  }
  .experience-track__viewport {
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
  }
  .experience-track__cards {
    flex-direction: column;
    padding: 0;
    gap: var(--space-5);
  }
  .experience-card {
    flex: 1 1 auto;
    height: auto;
    padding: var(--space-6) var(--space-5);
  }
  .experience-track__counter {
    display: none;
  }
}

/* ── Projects horizontal-scroll track ────────────────────────── */

/* Header (label + headline + subline) stays in the section's editorial
 * column (same 880px max-width as other sections — visual consistency).
 * The track inside breaks out full-viewport-width for the cinematic
 * horizontal sweep, so the section MUST allow overflow (otherwise the
 * pinned section's overflow:hidden would clip the 100vw breakout back
 * to the 880px section bounds and the cards wouldn't visibly slide). */
:deep(.editorial-section--projects .editorial-section__body) {
  max-width: none;
}

:deep(.editorial-section--projects.editorial-section--pinned) {
  overflow: visible;
}

.projects-track {
  /* Full-viewport breakout — the editorial column is centred and
   * width-limited, but the horizontal-scroll track needs every
   * pixel. The 50%/-50vw trick pulls the element out of its column
   * and centres it at full viewport width.
   *
   * No runway height needed — the parent EditorialSection is pinned
   * (pin prop + ScrollTrigger pin:true on the section element), so
   * the track is held in viewport by the section pin itself. */
  position: relative;
  left: 50%;
  margin-left: -50vw;
  width: 100vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-5);
}

.projects-track__viewport {
  position: relative;
  width: 100%;
  /* Cards size their height to this viewport. flex-grow:1 fills
   * remaining vertical space inside the pinned section after the
   * header + counter; min-height:0 lets the flex child actually
   * shrink. */
  flex: 1 1 auto;
  min-height: 0;
  max-height: 60vh;
  display: flex;
  align-items: center;
  /* Clip horizontally so cards translating offscreen stay hidden —
   * the viewport is the only window the user sees through. */
  overflow: hidden;
}

.projects-track__cards {
  display: flex;
  gap: var(--space-6);
  /* Lead-in padding so the first card lands centred when sticky
   * engages (50vw from container start, minus half a card width, =
   * card center at viewport center). Trailing padding mirrors so
   * the last card also rests centred at progress 1. */
  padding: 0 calc(50vw - min(320px, 37.5vw));
  height: 100%;
  will-change: transform;
  /* No width:max-content here on purpose. As a flex item inside the
   * viewport (also display:flex), this container shrinks to the
   * viewport's width while its flex children (cards with flex-
   * shrink:0) overflow. That's exactly what we want: the container
   * stays centred under the viewport (so the padding correctly
   * positions the first card at center), and scrollWidth still
   * reports the full content extent including the overflow — which
   * is what GSAP's distance() reads for the slide range. */
}

.project-card {
  /* Each card claims a fixed flex basis — that's what makes the
   * total track wider than the viewport, which is what GSAP scrubs
   * across via translateX. */
  flex: 0 0 min(640px, 75vw);
  height: 100%;
  background: var(--color-bg-surface);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-card);
  padding: var(--space-8);
  display: grid;
  grid-template-rows: auto auto 1fr auto auto;
  gap: var(--space-5);
  transition: border-color var(--duration-quick) var(--ease-out),
              transform var(--duration-quick) var(--ease-out);
}

.project-card--active {
  border-color: rgba(255, 255, 255, 0.18);
}

.project-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.project-card__index {
  color: var(--color-ink-faint);
  font-variant-numeric: tabular-nums;
}

.project-card--active .project-card__index {
  color: var(--color-ink-secondary);
}

.project-card__tag {
  color: var(--color-ink-primary);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sharp);
}

.project-card__name {
  font-family: var(--font-display);
  font-size: var(--font-display-medium);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--color-ink-primary);
  margin: 0;
}

.project-card__description {
  font-family: var(--font-body);
  font-size: var(--font-body);
  line-height: 1.55;
  color: var(--color-ink-secondary);
  margin: 0;
}

.project-card__stack {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.project-card__stack li {
  font-family: var(--font-mono);
  font-size: var(--font-caption);
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  padding: var(--space-1) var(--space-3);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sharp);
}

.project-card__footer {
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-hairline-soft);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.project-card__link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-secondary);
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sharp);
  text-decoration: none;
  transition: color var(--duration-quick) var(--ease-out),
              border-color var(--duration-quick) var(--ease-out),
              background var(--duration-quick) var(--ease-out);
}

.project-card__link:hover,
.project-card__link:focus-visible {
  color: var(--color-ink-primary);
  background: var(--color-bg-elevated);
  border-color: rgba(255, 255, 255, 0.18);
  outline: none;
}

.projects-track__counter {
  /* Match Experience's counter — centred mono fraction, active-large.
   * In the pinned-section layout the counter is a flex sibling of the
   * viewport (not absolute) so it lands naturally below the cards. */
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: var(--space-2);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  color: var(--color-ink-muted);
  font-variant-numeric: tabular-nums;
}

.projects-track__counter-active {
  color: var(--color-ink-primary);
  font-size: var(--font-ui);
}

.projects-track__counter-sep {
  color: var(--color-ink-faint);
}

@media (max-width: 768px) {
  /* Mobile: drop the horizontal scroll, fall back to a vertical
   * stack of cards. Horizontal-pin on touch devices fights the
   * native momentum scroll and feels broken. The parent
   * EditorialSection's pin mode also drops to auto-height on
   * mobile, so this slots in naturally. */
  .projects-track {
    left: auto;
    margin-left: 0;
    width: auto;
    height: auto;
    justify-content: flex-start;
  }
  .projects-track__viewport {
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
    overflow: visible;
  }
  .projects-track__cards {
    flex-direction: column;
    padding: 0;
    gap: var(--space-5);
  }
  .project-card {
    flex: 1 1 auto;
    height: auto;
    padding: var(--space-6) var(--space-5);
  }
  .projects-track__counter {
    display: none;
  }
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
  /* Absolute, not fixed — the CTAs are part of the hero's content and
   * scroll out with it when the user moves into the editorial body.
   * Anchored to .experience-hero (its nearest positioned ancestor) at
   * 20% from the bottom — which clears the "SCROLL TO EXPLORE MORE"
   * hint (sits at var(--space-12)) with breathing room and lifts the
   * CTAs into the lower-third visual zone where they read as a
   * deliberate call-to-action, not a viewport-bottom UI strip.
   *
   * % rather than vh so the value scales with the hero's actual height
   * if it ever changes; the token scale tops out at var(--space-24)
   * (96px ≈ 9% of viewport) which isn't enough lift for this register.
   *
   * pointer-events: auto opts back in from .cinematic-page's `none`
   * (which exists so the empty pinned hero doesn't intercept drags
   * meant for OrbitControls on the canvas behind). */
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-controls);
  display: flex;
  gap: var(--space-4);
  align-items: center;
  pointer-events: auto;
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
    /* Match desktop's 20%-from-bottom anchor — on a ~700px mobile
     * viewport that's ~140px, well clear of the welcome hint at
     * var(--space-12) plus its label + chevron. */
    bottom: 20%;
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

/* ── Contact finale section ──────────────────────────────────── */

.contact-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  align-items: flex-start;
  margin-top: var(--space-6);
}

.contact-primary {
  /* The hero CTA — large mono email button. Bigger padding +
   * brighter border so it reads as the primary action distinct
   * from the secondary links below. */
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--font-ui);
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: lowercase;
  color: var(--color-ink-primary);
  background: var(--color-bg-surface);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--radius-sharp);
  text-decoration: none;
  transition: background var(--duration-quick) var(--ease-out),
              border-color var(--duration-quick) var(--ease-out);
}

.contact-primary:hover,
.contact-primary:focus-visible {
  background: var(--color-bg-elevated);
  border-color: var(--color-cool);
  outline: none;
}

.contact-secondary {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.contact-link {
  /* Matches the project-card__link visual register so the contact
   * section feels consistent with the rest of the editorial body. */
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-secondary);
  background: transparent;
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sharp);
  text-decoration: none;
  transition: color var(--duration-quick) var(--ease-out),
              border-color var(--duration-quick) var(--ease-out),
              background var(--duration-quick) var(--ease-out);
}

.contact-link:hover,
.contact-link:focus-visible {
  color: var(--color-ink-primary);
  background: var(--color-bg-elevated);
  border-color: rgba(255, 255, 255, 0.18);
  outline: none;
}

.contact-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-3);
  margin: var(--space-4) 0 0;
  font-family: var(--font-mono);
  font-size: var(--font-caption);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.contact-meta__sep {
  color: var(--color-ink-faint);
}

@media (max-width: 640px) {
  .contact-primary {
    /* On mobile the email address would overflow the screen edge —
     * let the button fill the available width and wrap if needed. */
    width: 100%;
    justify-content: center;
    font-size: var(--font-label);
    letter-spacing: 0.12em;
  }

  .contact-secondary {
    width: 100%;
  }

  .contact-link {
    flex: 1 1 auto;
    justify-content: center;
  }
}
</style>
