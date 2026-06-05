<script setup lang="ts">
import { useFlightScene } from '~/composables/useFlightScene'
import { useFlightPath, FLIGHT_WAYPOINTS } from '~/composables/useFlightPath'
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
  description:
    'A career told as a single cinematic flight — welcome aboard, then a scroll-driven journey past four career waypoints with live telemetry.',
  ogTitle: 'Ahmad Baihaqie — Flight',
  ogDescription:
    'A career told as a single cinematic flight — welcome aboard, then a scroll-driven journey past four career waypoints with live telemetry.',
})

/*
 * /experience — two regions sharing one URL.
 *
 *   .flight-runway   ~820vh scroll spacer. The fixed Three.js canvas
 *                    renders behind it; one smoothed `progress` (read from
 *                    this runway's scroll position) drives the whole
 *                    cinematic flight: welcome greeting → word-highlight
 *                    tagline → dark-overlay reveal → A350 flying a 3D
 *                    spline past four career waypoints with a live
 *                    telemetry HUD. All flight chrome is fixed overlay.
 *
 *   .experience-body Editorial portfolio (About, Education, Experience,
 *                    Projects, Contact). No Three.js — typography,
 *                    whitespace, horizontal-scroll tracks. Opaque bg, so
 *                    it covers the fixed canvas as it scrolls up.
 *
 * An IntersectionObserver on `.experience-body` pauses the render loop and
 * hides the flight chrome once the editorial body covers the canvas, and
 * restores both on scroll-back. The camera is fully scripted by the chase
 * rig in useFlightPath — there is no OrbitControls / Pilot Mode here.
 */

// Silhouette intro complete (Lenis resumes inside <CinematicIntro>).
const introDone = ref(false)
// Flight chrome (HUD, rail, waypoints, intro, overlays) is shown while the
// flight runway is in view, hidden once the editorial body covers it.
const flightChromeVisible = ref(true)

const flightScene = useFlightScene()
const flightPath = useFlightPath()
const aircraft = useFlightAircraft()
const lenis = useLenis()

// Flight telemetry + intro choreography refs, driven by the per-frame
// flight loop. Bound straight into the chrome components below.
const {
  introT,
  flightT,
  litCount,
  overlayOpacity,
  introOpacity,
  hintOpacity,
  activeWp,
  needleDeg,
  alt,
  hdg,
  gs,
  vs,
} = flightPath

const { perfFps, perfCalls, perfTris, perfDpr } = flightScene

/* Experiences come from the same /api/experiences endpoint the public
 * portfolio's <SectionsExperienceSection> uses — so the cinematic page
 * sees the DB overlay + admin preview edits, with `data/index.ts` as the
 * static fallback when the API returns empty. */
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
 * — Faztech first, Razer second (current). */
const workExperiences = computed<Experience[]>(() => {
  const wanted = ['faztech', 'razer'] as const
  return wanted
    .map((id) => allExperiences.value.find((e) => e.id === id))
    .filter((e): e is Experience => e != null)
})

/* Projects — same overlay-aware fetch pattern as the public site's
 * <SectionsWorkSection>. */
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

const showcaseProjects = computed<Project[]>(() => {
  const featured = allProjects.value.filter((p) => p.featured)
  const others = allProjects.value.filter((p) => !p.featured)
  return [...featured, ...others]
})

const activeProjectIndex = ref(0)
const activeStackIndex = ref(0)

const experiencePinHeight = computed(
  () => `${Math.max(2, workExperiences.value.length) * 100}vh`,
)
const projectsPinHeight = computed(
  () => `${Math.max(2, showcaseProjects.value.length) * 100}vh`,
)

/* ── Waypoint cards ───────────────────────────────────────────────────
 *
 * The four in-flight cards. Factual fields (company, role, location, tool
 * tags, contact links, CGPA) bind to data/index.ts so DB overlay + admin
 * edits flow through; the narrative copy + stat framing is the curated
 * flight-log voice (it isn't in the schema). Paired to the spline by
 * index against FLIGHT_WAYPOINTS. */
interface WaypointStat {
  value: string
  accent?: string
  label: string
}
interface WaypointCard {
  idx: string
  year: string
  org: string
  role?: string
  desc: string
  stats?: WaypointStat[]
  meta?: string[]
  final?: boolean
  cta?: { label: string; href: string }
  links?: { label: string; href: string }[]
}

const railStops = FLIGHT_WAYPOINTS.map((w) => w.rail)

const waypointCards = computed<WaypointCard[]>(() => {
  const faztech = workExperiences.value.find((e) => e.id === 'faztech')
  const razer = workExperiences.value.find((e) => e.id === 'razer')
  const umDegree = education.find((e) => e.id === 'um-degree')

  return [
    {
      idx: 'WP·01',
      year: '2020',
      org: faztech?.company ?? 'Faztech Services',
      role: `${faztech?.role ?? 'Graphic Designer & Technician'} · ${faztech?.location ?? 'Tangkak, Johor'}`,
      desc: 'Where it started — designing client artwork across the Adobe suite while coordinating an 8-person technician team through OS maintenance and support.',
      stats: [
        { value: '8', label: 'Technicians coordinated' },
        { value: '0', accent: '%', label: 'Callback rate' },
      ],
      meta: faztech?.tags?.slice(0, 4) ?? [
        'Illustrator',
        'After Effects',
        'Photoshop',
        'Premiere Pro',
      ],
    },
    {
      idx: 'WP·02',
      year: '2023',
      org: 'Universiti Malaya',
      role: 'BSc Islamic Studies & Information Technology',
      desc: 'Graduated First Class Honours — bridging information technology with a human, organisational lens. Student leadership across faculty programmes along the way.',
      stats: [
        { value: '3.', accent: '77', label: `CGPA / ${(umDegree?.cgpa ?? '3.77 / 4.00').split('/')[1]?.trim() ?? '4.00'}` },
      ],
      meta: ['First Class Honours', 'Multimedia Lead', 'Treasurer'],
    },
    {
      idx: 'WP·03',
      year: '2025 · Current',
      org: 'Fiuu — Razer MS',
      role: `${razer?.role ?? 'Software Engineer — UI/UX'} · ${razer?.location ?? 'Shah Alam'}`,
      desc: 'Cruise altitude. Building high-quality fintech UIs across Merchant and Admin portals — streamlining flows, sharpening validations, lowering escalations, lifting adoption.',
      stats: [
        { value: '3', accent: '+', label: 'Portals & modules shipped' },
        { value: '', accent: '↓', label: 'Support escalations' },
      ],
      meta: razer?.tags?.slice(0, 4) ?? ['Vue.js', 'Tailwind CSS', 'REST API', 'Figma'],
    },
    {
      idx: 'WP·04',
      year: 'Now',
      final: true,
      org: 'On approach.',
      desc: 'Open to full-time and contract roles in fintech and SaaS. Currently also reading an MSc in Human Resource Development at UPM.',
      cta: { label: 'Begin descent → say hello', href: `mailto:${personal.email}` },
      links: [
        { label: 'GitHub', href: personal.github },
        { label: 'LinkedIn', href: personal.linkedin },
        { label: 'baihaqie.com', href: personal.website },
      ],
    },
  ]
})

/* ── Flight progress source ───────────────────────────────────────────
 *
 * The flight loop reads progress (0 → 1) from how far the user has
 * scrolled through the runway spacer. Computed from the runway's position
 * each frame so it stays correct across resize / font-swap reflow without
 * a ScrollTrigger. */
const runwayEl = ref<HTMLElement | null>(null)
function flightProgress(): number {
  const el = runwayEl.value
  if (!el || typeof window === 'undefined') return 0
  const total = el.offsetHeight - window.innerHeight
  if (total <= 0) return 0
  const scrolled = -el.getBoundingClientRect().top
  return Math.min(1, Math.max(0, scrolled / total))
}

function onIntroComplete() {
  introDone.value = true
}

/* IntersectionObserver toggling flight chrome + render loop when the
 * editorial body covers the canvas. gsap.matchMedia handle for the
 * editorial body's scroll-triggered reveals. */
let flightObserver: IntersectionObserver | null = null
let bodyReveals: gsap.MatchMedia | null = null

onMounted(() => {
  // Pause + hide the flight once the editorial body scrolls up over the
  // fixed canvas; restore on scroll-back.
  const bodyEl = document.querySelector('.experience-body')
  if (bodyEl) {
    flightObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        const editorialInView = entry.isIntersecting
        flightChromeVisible.value = !editorialInView
        flightScene.setActive(!editorialInView)
      },
      { threshold: 0 },
    )
    flightObserver.observe(bodyEl)
  }

  // Boot the flight. The scene is already initialised by
  // <CinematicFlightScene>'s own onMounted (child hooks run before this
  // parent hook), so the path can register its frame hook and start
  // flying the camera immediately. The GLB loads async and fades in with
  // the reveal once ready.
  flightPath.init({
    scene: flightScene,
    aircraft,
    progress: flightProgress,
  })
  const scene = flightScene.getScene()
  if (scene) {
    aircraft
      .load(scene)
      .then(() => flightPath.setRevealMaterials(aircraft.getMaterials()))
      .catch(() => {
        /* Load failure already logged in useFlightAircraft — the sky +
         * intro still play; only the aircraft is missing. */
      })
  }

  gsap.registerPlugin(ScrollTrigger)

  /* Refresh ScrollTrigger once fonts have loaded — Geist / Playfair /
   * JetBrains Mono shift line heights when they swap in, which moves
   * every editorial section's measured position. */
  if (typeof document !== 'undefined' && 'fonts' in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh())
  }

  bodyReveals = gsap.matchMedia()
  bodyReveals.add('(prefers-reduced-motion: no-preference)', () => {
    /* Education timeline — staggered fade-up as the section enters. */
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

    /* Experience horizontal scrub. */
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

    /* Projects horizontal scrub. */
    const projectsCards = document.querySelector<HTMLElement>('.projects-track__cards')
    const projectsViewport = document.querySelector<HTMLElement>('.projects-track__viewport')
    const projectCards = gsap.utils.toArray<HTMLElement>('.project-card')

    if (projectsCards && projectsViewport && projectCards.length > 1) {
      const distance = () => projectsCards.scrollWidth - projectsViewport.clientWidth

      gsap.set(projectsCards, { x: 0 })

      gsap.to(projectsCards, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
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
  flightObserver?.disconnect()
  flightObserver = null
  bodyReveals?.revert()
  bodyReveals = null
  // Remove the aircraft + flight objects before <CinematicFlightScene>'s
  // own onBeforeUnmount disposes the scene/renderer (child hooks run
  // after this parent hook).
  flightPath.destroy()
  aircraft.destroy()
})
</script>

<template>
  <div class="experience-root">
    <!-- Fixed Three.js canvas — the only place WebGL renders on this page. -->
    <CinematicFlightScene />

    <!-- Flight chrome: cinematic framing + intro + telemetry + waypoints.
         Shown while the flight runway is in view, hidden once the editorial
         body covers the canvas. display:contents wrapper so each child keeps
         its own fixed positioning. -->
    <div v-show="flightChromeVisible" class="flight-chrome">
      <div class="stage-vignette" aria-hidden="true" />
      <div
        class="flight-reveal-overlay"
        :style="{ opacity: String(overlayOpacity) }"
        aria-hidden="true"
      />

      <CinematicFlightIntro
        :intro-t="introT"
        :lit-count="litCount"
        :layer-opacity="introOpacity"
        :hint-opacity="hintOpacity"
      />

      <CinematicFlightHud
        :alt="alt"
        :hdg="hdg"
        :gs="gs"
        :vs="vs"
        :needle-deg="needleDeg"
        show-perf
        :fps="perfFps"
        :calls="perfCalls"
        :tris="perfTris"
        :dpr="perfDpr"
      />

      <CinematicFlightRail :progress="flightT" :active="activeWp" :stops="railStops" />

      <CinematicFlightWaypoints :cards="waypointCards" :active="activeWp" />
    </div>

    <!-- Auto-played silhouette splash. Pauses Lenis, plays ~3.7s, then
         resumes scroll and hands off to the scroll-driven flight. -->
    <CinematicIntro @complete="onIntroComplete" />

    <!-- Back to the restrained surface. Always visible so the viewer can
         leave at any moment. -->
    <NuxtLink to="/" class="back-link" aria-label="Back to baihaqie.com">
      <Icon name="fluent:arrow-left-16-filled" size="14" />
      <span>Back to Reality</span>
    </NuxtLink>

    <main class="cinematic-page">
      <!-- Flight runway. Tall transparent spacer that gives the flight its
           scroll length; the fixed canvas + chrome render against it. -->
      <div ref="runwayEl" class="flight-runway" aria-hidden="true" />

      <!-- Editorial body. Opaque bg, so it covers the fixed canvas when
           scrolled into view. -->
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
            <a :href="`mailto:${personal.email}`" class="contact-primary">
              <Icon name="fluent:mail-16-filled" size="20" />
              <span>{{ personal.email }}</span>
            </a>

            <div class="contact-secondary">
              <a :href="personal.linkedin" target="_blank" rel="noopener" class="contact-link">
                <Icon name="fluent:open-16-filled" size="14" />
                <span>LinkedIn</span>
              </a>
              <a :href="personal.github" target="_blank" rel="noopener" class="contact-link">
                <Icon name="fluent:code-16-filled" size="14" />
                <span>GitHub</span>
              </a>
              <a :href="`tel:${personal.mobile.replace(/\s/g, '')}`" class="contact-link">
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
  </div>
</template>

<style scoped>
.experience-root {
  position: relative;
  /* overflow-x: clip (not `hidden`) — both suppress the phantom
   * horizontal scrollbar from descendant transforms, but `clip` does NOT
   * create a scrolling context, so descendant `position: sticky` (the
   * pinned editorial sections) keeps working. */
  overflow-x: clip;
}

.cinematic-page {
  position: relative;
  z-index: var(--z-content);
  min-height: 100vh;
  /* The runway spacer is transparent and non-interactive so the flight
   * chrome's own links handle pointer events. The editorial body opts
   * back in below. */
  pointer-events: none;
}

/* display:contents so toggling v-show hides every fixed child at once
 * without introducing a positioning/containing-block wrapper. */
.flight-chrome {
  display: contents;
}

/* ── Flight runway + cinematic framing ───────────────────────── */

.flight-runway {
  /* Tall transparent spacer — gives the flight its scroll length. The
   * fixed canvas + chrome render against it; one smoothed progress is
   * read from how far this has scrolled. */
  position: relative;
  height: 820vh;
  pointer-events: none;
}

.stage-vignette {
  position: fixed;
  inset: 0;
  z-index: var(--z-particles);
  pointer-events: none;
  background:
    radial-gradient(120% 80% at 50% 38%, transparent 55%, rgba(5, 6, 9, 0.55) 100%),
    linear-gradient(
      to bottom,
      rgba(5, 6, 9, 0.35) 0%,
      transparent 22%,
      transparent 72%,
      rgba(5, 6, 9, 0.75) 100%
    );
}

.flight-reveal-overlay {
  /* Dark radial layer over the canvas; its opacity is scrubbed from ~1 to
   * ~0.06 by the intro choreography, so the world is revealed as if
   * zooming out of the welcome text. Sits above the vignette, below the
   * intro text + telemetry. */
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: radial-gradient(
    120% 90% at 50% 46%,
    rgba(10, 11, 15, 0.55) 0%,
    rgba(8, 9, 13, 0.92) 70%,
    #06070b 100%
  );
  will-change: opacity;
}

/* ── Editorial body ──────────────────────────────────────────── */

.experience-body {
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

/* ── Experience horizontal-scroll track ──────────────────────── */

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

:deep(.editorial-section--projects .editorial-section__body) {
  max-width: none;
}

:deep(.editorial-section--projects.editorial-section--pinned) {
  overflow: visible;
}

.projects-track {
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
  flex: 1 1 auto;
  min-height: 0;
  max-height: 60vh;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.projects-track__cards {
  display: flex;
  gap: var(--space-6);
  padding: 0 calc(50vw - min(320px, 37.5vw));
  height: 100%;
  will-change: transform;
}

.project-card {
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

/* ── Back to Reality link ─────────────────────────────────────── */

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

/* ── Contact finale section ──────────────────────────────────── */

.contact-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  align-items: flex-start;
  margin-top: var(--space-6);
}

.contact-primary {
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
