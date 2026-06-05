<script setup lang="ts">
import { useFlightScene } from '~/composables/useFlightScene'
import { useFlightPath, FLIGHT_WAYPOINTS } from '~/composables/useFlightPath'
import { useFlightAircraft } from '~/composables/useFlightAircraft'
import {
  personal,
  education,
  experiences as staticExperiences,
  type Experience,
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
 * /experience — one continuous scroll-driven cinematic flight, full stop.
 *
 * The fixed Three.js canvas renders behind a tall `.flight-runway` spacer;
 * one smoothed `progress` (read from how far the user has scrolled through
 * the runway) drives the whole flight: welcome greeting → word-highlight
 * tagline → dark-overlay reveal → A350 flying a 3D spline past four career
 * waypoints with a live telemetry HUD. The fourth waypoint is the contact
 * finale. There is deliberately no editorial body here — About / Education
 * / Projects / Contact live on the main site (`/`); repeating them on the
 * cinematic surface was redundant. The four waypoints carry the journey.
 *
 * The camera is fully scripted by the chase rig in useFlightPath — no
 * OrbitControls / Pilot Mode.
 */

const flightScene = useFlightScene()
const flightPath = useFlightPath()
const aircraft = useFlightAircraft()

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
 * portfolio uses — so the waypoint cards see the DB overlay + admin
 * preview edits, with `data/index.ts` as the static fallback. */
/* `lazy: true` so the flight paints immediately with the static fallback
 * and the DB overlay fills in when the fetch resolves — a slow or down
 * `/api/experiences` can never block the cinematic page from loading. The
 * waypoint cards are reactive, so they update in place once data arrives. */
const { data: experiencesData } = await usePreviewableFetch<Experience[]>(
  'experiences',
  '/api/experiences',
  {
    key: 'experiences',
    lazy: true,
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

const workExperiences = computed<Experience[]>(() => {
  const wanted = ['faztech', 'razer'] as const
  return wanted
    .map((id) => allExperiences.value.find((e) => e.id === id))
    .filter((e): e is Experience => e != null)
})

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
      highlights: [
        'Client artwork across brochures, cards & flyers',
        '8/10 recurring support cases closed weekly',
      ],
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
      highlights: [
        'Information technology with a human, organisational lens',
        'Faculty leadership — treasurer & head of multimedia',
      ],
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
      highlights: [
        'Merchant + Admin portals & payment modules',
        'Sharper validations, fewer support escalations',
      ],
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
      signoff: 'Thanks for flying along.',
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
 * each frame so it stays correct across resize / font-swap reflow. */
const runwayEl = ref<HTMLElement | null>(null)
function flightProgress(): number {
  const el = runwayEl.value
  if (!el || typeof window === 'undefined') return 0
  const total = el.offsetHeight - window.innerHeight
  if (total <= 0) return 0
  const scrolled = -el.getBoundingClientRect().top
  return Math.min(1, Math.max(0, scrolled / total))
}

onMounted(() => {
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
})

onBeforeUnmount(() => {
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

    <!-- Cinematic framing + intro + telemetry + waypoints. -->
    <div class="flight-chrome">
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
    <CinematicIntro />

    <!-- Back to the restrained surface. Always visible so the viewer can
         leave at any moment. `external` does a full document load (mirrors
         the entry from /) so the cinematic surface tears down cleanly and
         the restrained landing re-initialises fresh — the two surfaces
         share no scroll engine or layout, so crossing is a clean reload. -->
    <NuxtLink to="/" external class="back-link" aria-label="Back to baihaqie.com">
      <Icon name="fluent:arrow-left-16-filled" size="14" />
      <span>Back to Reality</span>
    </NuxtLink>

    <!-- Flight runway. Tall transparent spacer that gives the flight its
         scroll length; the fixed canvas + chrome render against it. -->
    <div ref="runwayEl" class="flight-runway" aria-hidden="true" />
  </div>
</template>

<style scoped>
.experience-root {
  position: relative;
  /* overflow-x: clip (not `hidden`) — suppresses phantom horizontal
   * scrollbars from descendant transforms (fixed chrome with
   * translateX(-50%), etc.) without creating a scrolling context. */
  overflow-x: clip;
}

/* Wrapper exists only to group the fixed flight chrome; display:contents
 * so it introduces no positioning/containing-block of its own. */
.flight-chrome {
  display: contents;
}

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
</style>
