<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  personal as staticPersonal,
  heroBadge,
  heroTaglines,
  heroPhotos,
} from '~/data/index'

if (import.meta.client) gsap.registerPlugin(ScrollTrigger)

// `reveal` scales the pinned scroll-reveal length (0.6–2). Carried as a prop
// so the band can be tuned per-placement without editing the timeline.
const props = withDefaults(defineProps<{ reveal?: number }>(), { reveal: 1 })

const { data: personalData } = await usePersonal()

const personal = computed(() => {
  const d = personalData.value as any
  return {
    shortName: d?.short_name || staticPersonal.shortName,
    location: d?.location || staticPersonal.location,
    availableFor: d?.available_for || staticPersonal.availableFor,
  }
})

// Stacked headline — first word on its own line, the rest (with the accent
// period) beneath it: "Ahmad / Baihaqie."
const nameParts = computed(() => {
  const parts = personal.value.shortName.trim().split(' ')
  return { first: parts[0], rest: parts.slice(1).join(' ') || parts[0] }
})

// Rotating subtitle: parse a `**bold**`-marked line into styled segments.
const taglineIndex = ref(0)
const segments = computed(() =>
  (heroTaglines[taglineIndex.value] ?? '')
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^\*\*([^*]+)\*\*$/)
      return m ? { text: m[1], em: true } : { text: part, em: false }
    }),
)

/* ── Photo carousel state ───────────────────────────────────
   Card POSITIONS are owned by GSAP (the autoplay + scroll-reveal animate
   each figure's x/y/rotate). Vue owns only which photo each card SHOWS, so
   cycling content can never fight the scrubbed transforms. */
const photos = heroPhotos
const N = photos.length
const leadIdx = N - 1 // the portrait card sits last / on top
const cur = ref(leadIdx) // index into `photos` shown on the lead card
const interactiveOn = ref(false)
// Fanned pre-scroll state: while the hand is spread (reveal progress ~0) the
// user can click a card to pop it forward for a look. Scrolling resets it.
const fannedActive = ref(false)
const featured = ref<number | null>(null)

// Lead shows photos[cur]; each peek card shows the following photos in order,
// so the deck always looks full as you browse.
const slotMedia = computed(() =>
  Array.from({ length: N }, (_, s) =>
    s === leadIdx ? photos[cur.value] : photos[(cur.value + 1 + s) % N],
  ),
)
const counter = computed(
  () => `${String(((cur.value % N) + N) % N + 1).padStart(2, '0')} / ${String(N).padStart(2, '0')}`,
)

/* ── Refs ───────────────────────────────────────────────────── */
const heroRoot = ref<HTMLElement | null>(null)
const stageEl = ref<HTMLElement | null>(null)
const deckEl = ref<HTMLElement | null>(null)
const badgeEl = ref<HTMLElement | null>(null)
const scrollCueEl = ref<HTMLElement | null>(null)
const subInner = ref<HTMLElement | null>(null)
const greetingEl = ref<HTMLElement | null>(null)

// Resolved on mount (DOM order is the source of truth for geometry).
let cards: HTMLElement[] = []
let leadEl: HTMLElement | null = null
let stagger: HTMLElement[] = []
let isMobile = false

/* ── Geometry (count-driven; mirrors the handoff) ───────────── */
const baseScale = () => (isMobile ? 1.04 : 1.1)
const MID = () => (N - 1) / 2

// Resting layout: lead flat on top, the others peek symmetrically behind it.
function restOf(i: number) {
  if (i === leadIdx) return { x: 0, y: 0, rotate: 0 }
  const d = i - MID()
  return { x: d * 11, y: Math.abs(d) * 7 + 3, rotate: d * 5 }
}
function zOf(i: number) {
  return i === leadIdx ? 60 : 10 + i
}
// Fanned "hand" layout the autoplay ends on / the reveal starts from.
function fanOf(i: number) {
  const t = N > 1 ? (i / (N - 1)) * 2 - 1 : 0
  const w = cards[0]?.offsetWidth || 360
  const spread = Math.min(w * 0.7, isMobile ? 66 : 230)
  return { x: t * spread, y: -Math.abs(t) * 22 - 6, rotate: t * 13 }
}
// How far to shift the stage so the deck centres in the viewport.
function centreDx() {
  if (!stageEl.value) return 0
  const prev = stageEl.value.style.transform
  stageEl.value.style.transform = 'none'
  const r = stageEl.value.getBoundingClientRect()
  stageEl.value.style.transform = prev
  return window.innerWidth / 2 - (r.left + r.width / 2)
}

/* ── Carousel ───────────────────────────────────────────────── */
function enableInteractive(on: boolean) {
  interactiveOn.value = on
}

/* ── Fanned-state "pop a card forward" toggle ───────────────────
   Only `scale` / `zIndex` / `yPercent` are touched here — the scroll-reveal
   owns x/y/rotate, so featuring never fights the scrub and a scroll cleanly
   collapses everything back. */
function featureCard(i: number) {
  if (!cards[i]) return
  gsap.set(cards[i], { zIndex: 200 })
  gsap.to(cards[i], { scale: 1.09, yPercent: -6, duration: 0.45, ease: 'power3.out', overwrite: 'auto' })
}
function unfeatureCard(i: number) {
  if (!cards[i]) return
  gsap.to(cards[i], {
    scale: 1,
    yPercent: 0,
    duration: 0.4,
    ease: 'power3.out',
    overwrite: 'auto',
    onComplete: () => { if (cards[i]) gsap.set(cards[i], { zIndex: zOf(i) }) },
  })
}
function onCardClick(i: number) {
  if (!fannedActive.value || !cards[i]) return
  if (featured.value === i) {
    unfeatureCard(i)
    featured.value = null
  } else {
    if (featured.value != null) unfeatureCard(featured.value)
    featureCard(i)
    featured.value = i
  }
}
// Toggle whether the fanned hand accepts clicks. Leaving the fanned state
// (the user has started scrolling) drops any popped card back into place.
function setFanned(on: boolean) {
  if (fannedActive.value === on) return
  fannedActive.value = on
  if (!on && featured.value != null) {
    unfeatureCard(featured.value)
    featured.value = null
  }
}

function go(dir: number) {
  if (!interactiveOn.value || !N) return
  cur.value = (cur.value + dir + N) % N
  // Animate the IMG inside the lead card (never the card transform the scroll
  // timeline owns). nextTick so the swapped media is in the DOM first.
  nextTick(() => {
    const child = leadEl?.firstElementChild as HTMLElement | null
    if (child) {
      gsap.fromTo(
        child,
        { xPercent: dir > 0 ? 26 : -26, opacity: 0.25 },
        { xPercent: 0, opacity: 1, duration: 0.46, ease: 'power3.out', overwrite: 'auto' },
      )
    }
    // Tiny settle on the top peek card so the deck feels alive.
    if (cards[0]) gsap.fromTo(cards[0], { scale: 0.97 }, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
  })
}

// Pointer (swipe/drag) + keyboard browsing. Active in both motion modes once
// the deck is composed.
let downX: number | null = null
let downY: number | null = null
function onPointerDown(e: PointerEvent) {
  if (!interactiveOn.value) return
  downX = e.clientX
  downY = e.clientY
}
function onPointerUp(e: PointerEvent) {
  if (!interactiveOn.value || downX == null || downY == null) return
  const dx = e.clientX - downX
  const dy = e.clientY - downY
  if (Math.abs(dx) > 42 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1)
  downX = downY = null
}
function onPointerCancel() {
  downX = downY = null
}
function onKey(e: KeyboardEvent) {
  if (!interactiveOn.value) return
  if (e.key === 'ArrowLeft') go(-1)
  else if (e.key === 'ArrowRight') go(1)
}

/* ── Composed (resting) state — used by reduced-motion ──────── */
function settleComposed() {
  heroRoot.value?.style.setProperty('--veil', '1')
  if (stageEl.value) gsap.set(stageEl.value, { x: 0, scale: 1 })
  if (deckEl.value) gsap.set(deckEl.value, { opacity: 1 })
  cards.forEach((c, i) => {
    const r = restOf(i)
    gsap.set(c, { opacity: 1, x: r.x, y: r.y, rotate: r.rotate, scale: 1, zIndex: zOf(i) })
  })
  if (badgeEl.value) gsap.set(badgeEl.value, { opacity: 1, y: 0, scale: 1 })
  stagger.forEach((el) => gsap.set(el, { opacity: 1, y: 0 }))
  if (scrollCueEl.value) gsap.set(scrollCueEl.value, { opacity: 0 })
  if (greetingEl.value) gsap.set(greetingEl.value, { opacity: 0 })
  enableInteractive(true)
}

/* ── Act 2 — scroll-driven reveal (pinned, scrubbed) ────────── */
let revealTl: gsap.core.Timeline | null = null
const REVEAL_DONE = 0.55 // past this scroll progress the hero is composed
const FANNED_MAX = 0.03 // below this the hand is still fanned & click-to-feature

function killReveal() {
  if (!revealTl) return
  revealTl.scrollTrigger?.kill()
  revealTl.kill()
  revealTl = null
}

function buildReveal() {
  killReveal()
  if (!heroRoot.value || !stageEl.value || !deckEl.value) return
  gsap.set(deckEl.value, { opacity: 1 })

  revealTl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: heroRoot.value,
      start: 'top top',
      end: () => '+=' + Math.round(window.innerHeight * 2.1 * props.reveal),
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // This pin sits at the very top of the page but is built late (after the
      // autoplay hands off), so it's created AFTER the triggers below it
      // (Statement scrub, section .reveal). A higher refreshPriority forces it
      // to re-measure FIRST, so its pin-spacer height is known before those
      // recompute their start/end — otherwise they cache offsets that ignore
      // the pinned scroll band and scrub at the wrong position.
      refreshPriority: 1,
      onUpdate: (self) => {
        enableInteractive(self.progress > REVEAL_DONE)
        setFanned(self.progress < FANNED_MAX)
      },
    },
  })
  // The hand starts fanned (progress 0) → clickable straight away.
  featured.value = null
  fannedActive.value = true

  // Stage sweeps from screen-centre (scaled up) to its resting spot.
  revealTl.fromTo(stageEl.value, { x: () => centreDx(), scale: baseScale() }, { x: 0, scale: 1, duration: 1 }, 0)

  // Each photo travels from the fanned hand to the resting cascade.
  cards.forEach((c, i) => {
    const f = fanOf(i)
    const r = restOf(i)
    revealTl!.fromTo(c, { x: f.x, y: f.y, rotate: f.rotate }, { x: r.x, y: r.y, rotate: r.rotate, duration: 0.82 }, i * 0.025)
  })

  if (scrollCueEl.value) revealTl.fromTo(scrollCueEl.value, { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0)
  revealTl.fromTo(stagger, { opacity: 0, y: 96 }, { opacity: 1, y: 0, duration: 0.62, stagger: 0.07, ease: 'power3.out' }, 0.34)
  if (badgeEl.value) revealTl.fromTo(badgeEl.value, { opacity: 0, y: 16, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: 'power2.out' }, 0.78)

  // Hold the composed hero for a generous scroll band so it's a comfortable
  // place to stop, read, and browse the photos.
  revealTl.to({}, { duration: 1.15 })

  ScrollTrigger.refresh()
}

/* ── Act 1 — autoplay entrance: rise → shuffle → fan out ────── */
// Ends exactly at the reveal's start state (fanned hand, name hidden) so the
// hand-off is seamless.
let introTl: gsap.core.Timeline | null = null

function buildAutoplay() {
  if (!heroRoot.value || !stageEl.value || !deckEl.value) return
  introTl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  const dx = centreDx()
  const veil = { v: 0 }

  gsap.set(deckEl.value, { opacity: 1 })
  gsap.set(stageEl.value, { x: dx, scale: baseScale() })
  cards.forEach((c, i) => {
    gsap.set(c, { opacity: 0, x: 0, y: 132, yPercent: 0, rotate: 0, rotateY: 0, scale: 0.92, transformPerspective: 1400, zIndex: zOf(i) })
  })

  // 1. RISE — lifts in as one photo, with a settling wiggle.
  introTl.to(cards, { opacity: 1, duration: 0.5, stagger: 0.04 }, 0.1)
  introTl.to(cards, { y: 0, scale: 1, duration: 1.0, ease: 'back.out(1.5)', stagger: 0.04 }, 0.1)
  introTl.to(
    cards,
    {
      keyframes: [
        { rotate: -4, duration: 0.16, ease: 'sine.inOut' },
        { rotate: 3.5, duration: 0.18, ease: 'sine.inOut' },
        { rotate: -1.5, duration: 0.16, ease: 'sine.inOut' },
        { rotate: 0, duration: 0.2, ease: 'sine.out' },
      ],
    },
    0.66,
  )
  introTl.to(veil, { v: 1, duration: 1.2, ease: 'sine.out', onUpdate: () => heroRoot.value?.style.setProperty('--veil', String(veil.v)) }, 0)

  // 2. SHUFFLE — riffle in place.
  cards.forEach((c, i) => {
    introTl!.to(
      c,
      {
        keyframes: [
          { y: '-=42', duration: 0.16, ease: 'power2.out' },
          { y: '+=42', duration: 0.2, ease: 'power2.in' },
        ],
        rotateY: i % 2 ? 20 : -20,
      },
      1.2 + i * 0.05,
    )
    introTl!.to(c, { rotateY: 0, duration: 0.3, ease: 'power2.out' }, 1.4 + i * 0.05)
  })

  // 3. FAN OUT — spreads into the hand, each card wiggling into place via an
  // elastic settle on its rotation.
  cards.forEach((c, i) => {
    const f = fanOf(i)
    introTl!.to(c, { x: f.x, y: f.y, scale: 1, rotateY: 0, duration: 0.72, ease: 'expo.out' }, 1.98 + i * 0.03)
    introTl!.to(c, { rotate: f.rotate, duration: 0.95, ease: 'elastic.out(1, 0.45)' }, 1.98 + i * 0.03)
  })

  // Greeting on the (otherwise empty) left while the deck performs: fades up
  // as the cards rise, with a one-shot wave, and holds until the reveal.
  if (greetingEl.value) {
    gsap.set(greetingEl.value, { opacity: 0, y: 20 })
    introTl.to(greetingEl.value, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.35)
    const wave = greetingEl.value.querySelector('.wave')
    if (wave) {
      introTl.to(
        wave,
        {
          keyframes: [
            { rotate: 16, duration: 0.18 },
            { rotate: -8, duration: 0.16 },
            { rotate: 14, duration: 0.16 },
            { rotate: 0, duration: 0.22 },
          ],
          ease: 'sine.inOut',
        },
        0.72,
      )
    }
    // A one-time greeting: it lifts away as the photos fan out, so the intro
    // ends on the composed deck alone — no lingering "Hi" waiting for a scroll.
    introTl.to(greetingEl.value, { opacity: 0, y: -24, duration: 0.45, ease: 'power2.in' }, 2.0)
  }

  if (scrollCueEl.value) introTl.fromTo(scrollCueEl.value, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.55)
}

/* ── Hand-off control ───────────────────────────────────────── */
// The autoplay plays FIRST with no pin. We hold the viewport by absorbing the
// user's scroll INTENT (not overflow:hidden, which corrupts ScrollTrigger pin
// measurements). On the intro finishing — naturally or because the user tried
// to scroll — we build the pin from the exact fanned end state.
let handedOff = false

function onWheelIntent(e: Event) {
  e.preventDefault()
  skipIntro()
}
function onKeyIntent(e: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar'].includes(e.key)) {
    e.preventDefault()
    skipIntro()
  }
}
function blockScroll(on: boolean) {
  const m = on ? 'addEventListener' : 'removeEventListener'
  window[m]('wheel', onWheelIntent as EventListener, { passive: false } as AddEventListenerOptions)
  window[m]('touchmove', onWheelIntent as EventListener, { passive: false } as AddEventListenerOptions)
  window[m]('keydown', onKeyIntent as EventListener, true)
}
function skipIntro() {
  if (introTl && introTl.isActive()) introTl.progress(1) // fires onComplete → handoff
  else handoff()
}
function handoff() {
  if (handedOff) return
  handedOff = true
  blockScroll(false)
  window.scrollTo(0, 0)
  buildReveal() // pin created now, at the fanned end state — seamless
}

function startSequence() {
  handedOff = false
  fannedActive.value = false
  featured.value = null
  killReveal()
  window.scrollTo(0, 0)
  buildAutoplay()
  introTl?.eventCallback('onComplete', handoff)
  blockScroll(true)
  introTl?.play(0)
}

/* ── Rotating tagline cross-fade ────────────────────────────── */
let rotTimer: ReturnType<typeof gsap.delayedCall> | null = null
function startTaglineCycle() {
  function cycle() {
    if (heroTaglines.length < 2 || !subInner.value) return
    gsap
      .timeline({ onComplete: () => { rotTimer = gsap.delayedCall(2.8, cycle) } })
      .to(subInner.value, { opacity: 0, y: -8, duration: 0.4, ease: 'power2.in' })
      .add(() => { taglineIndex.value = (taglineIndex.value + 1) % heroTaglines.length })
      .fromTo(subInner.value, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, '+=0.06')
  }
  // Start once the hero has had time to compose; cross-fading hidden copy
  // before then is harmless.
  rotTimer = gsap.delayedCall(6, cycle)
}
function stopTaglineCycle() {
  rotTimer?.kill()
  rotTimer = null
  if (subInner.value) gsap.killTweensOf(subInner.value)
  taglineIndex.value = 0
}

/* ── Lifecycle ──────────────────────────────────────────────── */
let mm: ReturnType<typeof gsap.matchMedia> | null = null

// After media load, re-measure pinned-section heights so downstream triggers
// (the Statement / Contact scrubbed reveals) start from the correct offsets.
function refreshTriggers() {
  if (import.meta.client) ScrollTrigger.refresh()
}

onMounted(() => {
  if (!heroRoot.value || !deckEl.value || !stageEl.value) return

  cards = Array.from(deckEl.value.querySelectorAll<HTMLElement>('.deck-card'))
  leadEl = deckEl.value.querySelector<HTMLElement>('.deck-card--lead')
  stagger = Array.from(heroRoot.value.querySelectorAll<HTMLElement>('[data-hero-stagger]'))
  isMobile = window.matchMedia('(max-width: 880px)').matches

  // Browsing listeners — live in both motion modes.
  deckEl.value.addEventListener('pointerdown', onPointerDown)
  deckEl.value.addEventListener('pointerup', onPointerUp)
  deckEl.value.addEventListener('pointercancel', onPointerCancel)
  window.addEventListener('keydown', onKey)
  enableInteractive(false)

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: reduce)', () => {
    settleComposed()
  })

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    startSequence()
    startTaglineCycle()
    return () => {
      blockScroll(false)
      stopTaglineCycle()
      introTl?.kill()
      introTl = null
      killReveal()
    }
  })
})

onUnmounted(() => {
  blockScroll(false)
  const d = deckEl.value
  if (d) {
    d.removeEventListener('pointerdown', onPointerDown)
    d.removeEventListener('pointerup', onPointerUp)
    d.removeEventListener('pointercancel', onPointerCancel)
  }
  window.removeEventListener('keydown', onKey)
  mm?.revert()
})
</script>

<template>
  <section
    id="top"
    ref="heroRoot"
    class="hero relative min-h-svh flex items-center overflow-hidden px-6 pt-20"
  >
    <div class="hero-grid max-w-6xl mx-auto w-full grid lg:grid-cols-[1.1fr_0.9fr] gap-11 lg:gap-16 items-center">
      <!-- Left: copy -->
      <div class="hero-copy order-2 lg:order-1 relative">
        <!-- Intro greeting — a one-time flash while the deck performs, then it
             lifts away. Desktop: beside the deck (left column, vertically
             centred). Mobile: centred just below the deck. Decorative: the real
             name follows, so it's hidden from assistive tech. -->
        <div ref="greetingEl" class="hero-greeting" aria-hidden="true">
          <span class="hi-text">Hi</span>
          <span class="wave">👋🏻</span>
        </div>

        <span
          data-hero-stagger
          class="hero-eyebrow inline-flex items-center gap-2.5 rounded-full border border-border-subtle bg-bg-secondary px-3 py-1.5 text-sm font-medium text-text-secondary mb-7"
        >
          <span class="dot-available" />
          Available for {{ personal.availableFor }} · {{ personal.location }}
        </span>

        <h1 class="hero-headline font-semibold text-text-primary">
          <span data-hero-stagger class="block">{{ nameParts.first }}</span>
          <span data-hero-stagger class="block">{{ nameParts.rest }}<span class="text-accent">.</span></span>
        </h1>

        <p data-hero-stagger class="hero-sub mt-7 max-w-[36ch] text-[clamp(1.0625rem,2.2vw,1.5rem)] text-text-secondary leading-snug min-h-[2.9em] sm:min-h-[2.8em]">
          <span ref="subInner" class="inline-block">
            <template v-for="(seg, i) in segments" :key="i"><span
              v-if="seg.em"
              class="text-text-primary font-medium"
            >{{ seg.text }}</span><template v-else>{{ seg.text }}</template></template>
          </span>
        </p>

        <div data-hero-stagger class="hero-cta mt-10 flex flex-wrap items-center gap-5">
          <!-- `external` forces a full document load into /experience rather
               than an SPA transition. The cinematic surface is `ssr: false`
               with its own layout, Lenis scroll engine and a singleton
               Three.js scene; client-side navigating into it can race the
               layout/scroll/WebGL hand-off. A clean load is the right
               boundary — the two surfaces share no scroll engine by design. -->
          <NuxtLink to="/experience" external class="btn-primary group">
            Experience my journey
            <Icon name="fluent:arrow-right-16-filled" size="14" class="group-hover:translate-x-0.5 transition-transform" />
          </NuxtLink>
          <a href="#contact" class="link-quiet">
            Get in touch <span class="arrow">→</span>
          </a>
        </div>
      </div>

      <!-- Right: photo stage (deck → carousel) -->
      <div ref="stageEl" class="hero-stage order-1 lg:order-2">
        <div
          ref="deckEl"
          class="hero-deck"
          :data-interactive="interactiveOn ? '1' : '0'"
          :data-fanned="fannedActive ? '1' : '0'"
        >
          <figure
            v-for="(media, i) in slotMedia"
            :key="i"
            class="deck-card"
            :class="{ 'deck-card--lead': i === leadIdx, 'is-featured': featured === i }"
            @click="onCardClick(i)"
          >
            <img v-if="media?.img" :src="media.img" :alt="media.alt || ''" @load="refreshTriggers" />
            <div v-else class="deck-ph"><span>{{ media?.label }}</span></div>
          </figure>
        </div>

        <!-- Floating credential badge -->
        <div ref="badgeEl" class="hero-photo-badge">
          <div class="k">{{ heroBadge.key }}</div>
          <div class="l">{{ heroBadge.label }}</div>
        </div>

        <!-- Carousel nav — appears once the deck is composed/interactive -->
        <div class="deck-nav" :style="{ opacity: interactiveOn ? 1 : 0, pointerEvents: interactiveOn ? 'auto' : 'none' }">
          <button class="deck-arrow" aria-label="Previous photo" @click.stop="go(-1)">←</button>
          <span class="deck-counter">{{ counter }}</span>
          <button class="deck-arrow" aria-label="Next photo" @click.stop="go(1)">→</button>
        </div>
        <div class="deck-hint" :style="{ opacity: interactiveOn ? 1 : 0 }">
          Swipe or use ← → to browse
        </div>
      </div>
    </div>

    <!-- Scroll cue -->
    <div ref="scrollCueEl" class="scroll-cue">
      <span class="mouse" />
      Scroll
    </div>
  </section>
</template>

<style scoped>
.hero {
  --ease-apple: cubic-bezier(0.16, 1, 0.3, 1);
}

/* Cinematic vignette behind the deck — dims the edges so the rising photo
   reads as lit on a stage. Opacity (`--veil`) is animated in during the intro. */
.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: var(--veil, 0);
  background:
    radial-gradient(120% 90% at 72% 42%,
      rgb(var(--color-accent-raw) / 0.10) 0%,
      rgb(var(--color-accent-raw) / 0.04) 26%,
      transparent 58%),
    radial-gradient(140% 120% at 50% 50%,
      transparent 38%,
      rgb(var(--color-text-primary-raw) / 0.05) 78%,
      rgb(var(--color-text-primary-raw) / 0.12) 100%);
}
:global(.dark) .hero::before {
  background:
    radial-gradient(120% 90% at 72% 42%,
      rgb(var(--color-accent-raw) / 0.22) 0%,
      rgb(var(--color-accent-raw) / 0.08) 28%,
      transparent 60%),
    radial-gradient(140% 120% at 50% 50%,
      transparent 30%,
      rgb(0 0 0 / 0.28) 80%,
      rgb(0 0 0 / 0.55) 100%);
}

.hero-grid {
  position: relative;
  z-index: 1;
}

.hero-headline {
  font-size: clamp(3.2rem, 9vw, 6.5rem);
  letter-spacing: -0.04em;
  line-height: 0.92;
}

/* Intro greeting — headline-scale, vertically centred over the (hidden) copy
   so it occupies the spot the name will rise into. */
.hero-greeting {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  gap: 0.22em;
  font-size: clamp(3.2rem, 9vw, 8rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 0.92;
  color: var(--color-text-primary);
  pointer-events: none;
  z-index: 2;
}
/* "Hi" in the AxelNova brand gradient (blue → violet, from the logo mark). */
.hero-greeting .hi-text {
  background: linear-gradient(115deg, #4f7cff 0%, #6c63ff 48%, #a487ff 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}
.hero-greeting .wave {
  display: inline-block;
  transform-origin: 75% 80%;
  will-change: transform;
}

/* ── Deck stage ─────────────────────────────────────────────── */
.hero-stage {
  position: relative;
  justify-self: center;
  width: clamp(280px, 34vw, 440px);
  aspect-ratio: 4 / 5;
}
@media (min-width: 1024px) {
  .hero-stage {
    justify-self: end;
  }
}
/* Phones: shrink the deck so the fanned hand (and the expanded portrait)
   fits within the viewport instead of bleeding off the left edge. */
@media (max-width: 640px) {
  .hero-stage {
    width: clamp(180px, 52vw, 215px);
  }
}

.hero-deck {
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  perspective: 1400px;
  will-change: transform, opacity;
  pointer-events: none;
}
.hero-deck[data-interactive="1"] {
  pointer-events: auto;
  cursor: grab;
  touch-action: pan-y;
}
.hero-deck[data-interactive="1"]:active {
  cursor: grabbing;
}
.hero-deck .deck-card {
  cursor: inherit;
}
/* Fanned hand: cards are individually clickable to pop forward. */
.hero-deck[data-fanned="1"] {
  pointer-events: auto;
}
.hero-deck[data-fanned="1"] .deck-card {
  cursor: pointer;
}

.deck-card {
  position: absolute;
  inset: 0;
  margin: 0;
  border-radius: 26px;
  overflow: hidden;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-subtle);
  box-shadow:
    0 2px 6px rgb(var(--color-text-primary-raw) / 0.06),
    0 30px 70px -34px rgb(var(--color-text-primary-raw) / 0.40);
  will-change: transform, opacity, filter;
  backface-visibility: hidden;
  transform-origin: 50% 100%;
}
.deck-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}

/* Lead card = the real portrait; gets the accent-lit glow. */
.deck-card--lead {
  box-shadow:
    0 2px 8px rgb(var(--color-text-primary-raw) / 0.08),
    0 44px 90px -40px rgb(var(--color-accent-raw) / 0.55);
}

/* A card popped forward in the fanned hand — stronger accent halo so it
   reads as lifted out of the deck. */
.deck-card.is-featured {
  box-shadow:
    0 4px 14px rgb(var(--color-text-primary-raw) / 0.12),
    0 40px 90px -30px rgb(var(--color-accent-raw) / 0.6);
}

/* Placeholder cards — striped, monospace label. Swap each for a real photo
   by giving its data entry `img` + `alt` (see data/index.ts heroPhotos). */
.deck-ph {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background:
    repeating-linear-gradient(135deg,
      rgb(var(--color-text-primary-raw) / 0.045) 0 11px,
      rgb(var(--color-text-primary-raw) / 0.015) 11px 22px),
    var(--color-bg-secondary);
}
.deck-ph span {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding: 6px 11px;
  border: 1px solid var(--color-border-subtle);
  border-radius: 999px;
  background: rgb(var(--color-surface-raw) / 0.7);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ── Floating badge ─────────────────────────────────────────── */
.hero-photo-badge {
  position: absolute;
  left: -22px;
  bottom: 24px;
  z-index: 6;
  background: rgb(var(--color-surface-raw) / 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border-subtle);
  border-radius: 16px;
  padding: 14px 18px;
  box-shadow: 0 20px 50px -24px rgb(var(--color-text-primary-raw) / 0.4);
  will-change: transform, opacity;
}
.hero-photo-badge .k {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text-primary);
}
.hero-photo-badge .l {
  font-size: 0.74rem;
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* ── Carousel nav + hint ────────────────────────────────────── */
.deck-nav {
  position: absolute;
  left: 50%;
  bottom: -54px;
  transform: translateX(-50%);
  z-index: 7;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: opacity 0.45s var(--ease-apple);
}
.deck-arrow {
  appearance: none;
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  background: rgb(var(--color-surface-raw) / 0.82);
  -webkit-backdrop-filter: blur(14px);
  backdrop-filter: blur(14px);
  border: 1px solid var(--color-border-subtle);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 10px 26px -14px rgb(var(--color-text-primary-raw) / 0.4);
  transition: transform 0.18s var(--ease-apple), color 0.18s, border-color 0.18s;
}
.deck-arrow:hover {
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
}
.deck-arrow:active {
  transform: translateY(0) scale(0.94);
}
.deck-arrow:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.deck-counter {
  min-width: 64px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.deck-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -88px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  transition: opacity 0.45s var(--ease-apple);
  pointer-events: none;
}

/* ── Scroll cue ─────────────────────────────────────────────── */
.scroll-cue {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
.scroll-cue .mouse {
  width: 22px;
  height: 34px;
  border: 1.5px solid var(--color-border-strong);
  border-radius: 12px;
  position: relative;
}
.scroll-cue .mouse::after {
  content: "";
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 6px;
  border-radius: 2px;
  background: var(--color-text-muted);
  animation: scroll-wheel 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}
@keyframes scroll-wheel {
  0% { opacity: 0; transform: translate(-50%, 0); }
  40% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, 10px); }
}

/* ── Mobile / tablet ────────────────────────────────────────── */
@media (max-width: 1023px) {
  .hero-photo-badge {
    left: auto;
    right: -6px;
  }
  /* Single-column layout: the greeting sits centred just below the deck
     (top of the copy column) rather than beside it. */
  .hero-greeting {
    inset: 0 0 auto 0;
    align-items: flex-start;
    justify-content: center;
    font-size: clamp(2rem, 8vw, 3rem);
  }
  /* Single column → centre the copy under the centred deck. */
  .hero-copy {
    text-align: center;
  }
  .hero-sub {
    margin-inline: auto;
  }
  .hero-cta {
    justify-content: center;
  }
  /* Clear the carousel nav + hint that hang below the deck (bottom: -54/-88px)
     so the status pill doesn't collide with them. Applied to the pill (a flow
     element) so the absolutely-positioned greeting isn't dragged down too. */
  .hero-eyebrow {
    margin-top: 4.5rem;
  }
}

/* ── FOUC guard — hide JS-composed bits until the timeline runs.
   SSR / no-JS visitors (no `scripting: enabled`) see the static content. */
@media (scripting: enabled) {
  [data-hero-stagger],
  .hero-deck,
  .hero-photo-badge,
  .hero-greeting,
  .scroll-cue {
    opacity: 0;
  }
}

/* ── Reduced motion — settle everything, no shuffle / no cue. ── */
@media (prefers-reduced-motion: reduce) {
  [data-hero-stagger],
  .hero-deck,
  .hero-photo-badge {
    opacity: 1 !important;
  }
  .hero::before {
    opacity: 1 !important;
  }
  .scroll-cue {
    display: none;
  }
}
</style>
