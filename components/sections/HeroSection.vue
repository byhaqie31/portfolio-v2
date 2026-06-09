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
const leadIdx = 0 // the portrait is the first card AND the lead (on top)
const cur = ref(leadIdx) // index into `photos` shown on the lead card
const interactiveOn = ref(false)
// Whether the lead card is currently flipped to show its story.
const flipped = ref(false)
// Desktop "expand" → full-screen photo gallery lightbox.
const expanded = ref(false)

// Lead slot shows photos[cur]; the other (peek) slots show the following photos
// in order. `k` is the peek's position among non-lead slots, so this works for
// any leadIdx (here the lead is slot 0).
const slotMedia = computed(() =>
  Array.from({ length: N }, (_, s) => {
    if (s === leadIdx) return photos[cur.value]
    const k = s < leadIdx ? s : s - 1
    return photos[(cur.value + 1 + k) % N]
  }),
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
const greetingInner = ref<HTMLElement | null>(null)

// Resolved on mount (DOM order is the source of truth for geometry).
let cards: HTMLElement[] = []
let leadEl: HTMLElement | null = null
let stagger: HTMLElement[] = []
let isMobile = false

/* ── Geometry (count-driven; mirrors the handoff) ───────────── */
const baseScale = () => (isMobile ? 1.04 : 1.1)
const MID = () => (N - 1) / 2

// Cards fan out left → right in array order. The lead (index 0, the portrait)
// sits at the front-left and on top; each following card tucks behind it to the
// right — so the z-cascade DECREASES with index (otherwise the far-right card
// would pop forward and the fan looks lopsided).
function restOf(i: number) {
  if (i === leadIdx) return { x: 0, y: 0, rotate: 0 }
  const d = i - MID()
  return { x: d * 11, y: Math.abs(d) * 7 + 3, rotate: d * 5 }
}
function zOf(i: number) {
  return i === leadIdx ? 60 : 10 + (N - 1 - i)
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
// Single column (mobile/tablet): how far to shift the stage DOWN so the deck
// sits vertically centred during the intro. Desktop keeps its grid row (0).
function centreDy() {
  if (!stageEl.value || window.innerWidth >= 1024) return 0
  const prev = stageEl.value.style.transform
  stageEl.value.style.transform = 'none'
  const r = stageEl.value.getBoundingClientRect()
  stageEl.value.style.transform = prev
  return window.innerHeight / 2 - (r.top + r.height / 2)
}

/* ── Carousel ───────────────────────────────────────────────── */
function enableInteractive(on: boolean) {
  interactiveOn.value = on
  // Scrolling back out of the composed state drops any open story.
  if (!on && flipped.value) {
    flipCard(leadIdx, false)
    flipped.value = false
  }
}

// Flip the lead card's inner (front photo ↔ back story) in 3D.
function flipCard(i: number, on: boolean) {
  const inner = cards[i]?.querySelector('.deck-card-inner')
  if (inner) gsap.to(inner, { rotateY: on ? 180 : 0, duration: 0.6, ease: 'power3.inOut', overwrite: 'auto' })
}
// Tap the lead photo to flip its story (and back). Swipe/arrows/keys browse.
function onCardClick(_i: number) {
  if (!interactiveOn.value) return
  // Ignore the click that a swipe/drag spawns.
  if (didSwipe) { didSwipe = false; return }
  flipped.value = !flipped.value
  flipCard(leadIdx, flipped.value)
}

function leadInner(): HTMLElement | null {
  return (cards[leadIdx]?.querySelector('.deck-card-inner') as HTMLElement | null) ?? null
}

// Advance the carousel CONTENT by `dir` (wraps), snapping any open flip shut so
// the new photo shows front-facing and can be flipped again.
function advance(dir: number) {
  if (!N) return
  if (flipped.value) {
    const inner = leadInner()
    // duration:0 + overwrite kills any in-flight flip tween and snaps to front.
    if (inner) gsap.to(inner, { rotateY: 0, duration: 0, overwrite: true })
    flipped.value = false
  }
  cur.value = (cur.value + dir + N) % N
}

// Arrow / keyboard browse: advance, then swipe the new photo in.
function go(dir: number) {
  if (!interactiveOn.value || !N) return
  advance(dir)
  nextTick(() => {
    // Swipe the new lead PHOTO in (the front face's img), not the card itself.
    const child = leadEl?.querySelector('.deck-face--front img') as HTMLElement | null
    if (child) {
      gsap.fromTo(
        child,
        { xPercent: dir > 0 ? 26 : -26, opacity: 0.25 },
        { xPercent: 0, opacity: 1, duration: 0.46, ease: 'power3.out', overwrite: 'auto' },
      )
    }
    if (cards[0]) gsap.fromTo(cards[0], { scale: 0.97 }, { scale: 1, duration: 0.3, ease: 'power2.out', overwrite: 'auto' })
  })
}

// Tinder fling: send the dragged lead card off-screen, then advance content and
// bring the fresh card in from slightly behind. `sign` is the fling direction.
function flingAndAdvance(dir: number, sign: number, inner: HTMLElement | null) {
  if (!inner) { advance(dir); return }
  gsap.to(inner, {
    x: window.innerWidth * 1.1 * sign,
    rotate: sign * 16,
    opacity: 0,
    duration: 0.32,
    ease: 'power2.in',
    overwrite: true,
    onComplete: () => {
      advance(dir)
      gsap.set(inner, { x: 0, rotate: 0, opacity: 0, scale: 0.96 })
      gsap.to(inner, { opacity: 1, scale: 1, duration: 0.34, ease: 'power3.out' })
    },
  })
}

// Pointer (swipe/drag) + keyboard browsing. Active in both motion modes once
// the deck is composed.
let downX: number | null = null
let downY: number | null = null
// True when the last pointer gesture was a drag/swipe, so the click it spawns
// is ignored (otherwise a swipe would also toggle the flip).
let didSwipe = false
// Mobile "Tinder" drag: the lead card follows the finger and flings on release.
let dragging = false
const DRAG_THRESHOLD = 60

function onPointerDown(e: PointerEvent) {
  didSwipe = false
  if (!interactiveOn.value) return
  downX = e.clientX
  downY = e.clientY
  // Drag-to-fling on any device (mouse or touch), only on the photo side.
  dragging = !flipped.value
}
function onPointerMove(e: PointerEvent) {
  if (!dragging || downX == null || downY == null) return
  const dx = e.clientX - downX
  const dy = e.clientY - downY
  if (Math.abs(dx) < Math.abs(dy)) return // vertical → let the page scroll
  const inner = leadInner()
  if (inner) gsap.set(inner, { x: dx, rotate: dx * 0.05 })
}
function onPointerUp(e: PointerEvent) {
  if (!interactiveOn.value || downX == null || downY == null) return
  const dx = e.clientX - downX
  const dy = e.clientY - downY
  if (Math.max(Math.abs(dx), Math.abs(dy)) > 10) didSwipe = true // moved → not a tap
  const horizontal = Math.abs(dx) > Math.abs(dy)
  if (dragging && horizontal) {
    const inner = leadInner()
    if (Math.abs(dx) > DRAG_THRESHOLD) {
      flingAndAdvance(dx < 0 ? 1 : -1, dx < 0 ? -1 : 1, inner)
    } else if (inner) {
      gsap.to(inner, { x: 0, rotate: 0, duration: 0.4, ease: 'power3.out', overwrite: true })
    }
  } else if (horizontal && Math.abs(dx) > 42) {
    go(dx < 0 ? 1 : -1) // non-touch fallback: simple swipe
  }
  dragging = false
  downX = downY = null
}
function onPointerCancel() {
  if (dragging) {
    const inner = leadInner()
    if (inner) gsap.to(inner, { x: 0, rotate: 0, duration: 0.3, ease: 'power3.out', overwrite: true })
  }
  dragging = false
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
  if (stageEl.value) gsap.set(stageEl.value, { x: 0, y: 0, scale: 1 })
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
    },
  })

  // The deck is already a centred Tinder stack (collapsed at the end of the
  // autoplay). Scrolling just slides that whole stack from screen-centre to its
  // resting spot (right on desktop, top on mobile) and unscales it — the cards
  // ride along inside, no re-fanning. The name rises into the freed space.
  revealTl.fromTo(stageEl.value, { x: () => centreDx(), y: () => centreDy(), scale: baseScale() }, { x: 0, y: 0, scale: 1, duration: 1 }, 0)

  if (scrollCueEl.value) revealTl.fromTo(scrollCueEl.value, { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0)
  revealTl.fromTo(stagger, { opacity: 0, y: 96 }, { opacity: 1, y: 0, duration: 0.62, stagger: 0.07, ease: 'power3.out' }, 0.34)
  if (badgeEl.value) revealTl.fromTo(badgeEl.value, { opacity: 0, y: 16, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.34, ease: 'power2.out' }, 0.78)

  // Hold the composed hero for a generous scroll band so it's a comfortable
  // place to stop, read, and browse the photos.
  revealTl.to({}, { duration: 1.15 })

  ScrollTrigger.refresh()
}

/* ── Act 1 — autoplay entrance: rise → shuffle → fan → collapse ── */
// Ends as a centred, collapsed Tinder stack (name still hidden); the hand-off
// then makes it interactive, and the reveal slides it into its resting spot.
let introTl: gsap.core.Timeline | null = null

function buildAutoplay() {
  if (!heroRoot.value || !stageEl.value || !deckEl.value) return
  introTl = gsap.timeline({ defaults: { ease: 'expo.out' } })
  const dx = centreDx()
  const dy = centreDy()
  const veil = { v: 0 }

  gsap.set(deckEl.value, { opacity: 1 })
  gsap.set(stageEl.value, { x: dx, y: dy, scale: baseScale() })
  cards.forEach((c, i) => {
    gsap.set(c, { opacity: 0, x: 0, y: 132, yPercent: 0, rotate: 0, rotateY: 0, scale: 0.92, transformPerspective: 1400, zIndex: zOf(i) })
  })

  const lead = cards[leadIdx]
  const nonLead = cards.filter((_, i) => i !== leadIdx)
  if (!lead) return

  // 1. RISE — a SINGLE photo (the portrait) lifts in with a settling wiggle.
  // The other cards stay hidden behind it, so the entrance reads as one clean
  // image — not a flash of overlapping photos (which janks badly on Safari).
  introTl.to(lead, { opacity: 1, y: 0, scale: 1, duration: 1.0, ease: 'back.out(1.5)' }, 0.1)
  introTl.to(nonLead, { y: 0, scale: 1, duration: 1.0, ease: 'back.out(1.5)' }, 0.1) // move into place, still invisible
  introTl.to(
    lead,
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

  // 2. FAN OUT — the hidden cards FADE IN as they spread out from behind the
  // portrait, so each only ever appears in its clean, separated position. The
  // portrait fans out alongside them.
  const FAN_AT = 1.45
  cards.forEach((c, i) => {
    const f = fanOf(i)
    introTl!.to(c, { x: f.x, y: f.y, scale: 1, opacity: 1, duration: 0.72, ease: 'expo.out' }, FAN_AT + i * 0.03)
    introTl!.to(c, { rotate: f.rotate, duration: 0.9, ease: 'elastic.out(1, 0.45)' }, FAN_AT + i * 0.03)
  })

  // 4. COLLAPSE — the fanned hand deals into a centred Tinder stack, so the
  // hero lands swipe/flip-ready without needing a scroll first.
  cards.forEach((c, i) => {
    const r = restOf(i)
    introTl!.to(c, { x: r.x, y: r.y, rotate: r.rotate, duration: 0.55, ease: 'power3.inOut' }, 2.5 + i * 0.02)
  })

  // Greeting beside (desktop) / below (mobile) the deck while it performs:
  // fades up as the cards rise, with a one-shot wave, holds, then lifts away.
  // The outer element carries the mobile vertical offset so it tracks the
  // centred deck; the inner element runs the fade/wave.
  if (greetingEl.value && greetingInner.value) {
    // Outer is made visible (clears the FOUC guard) + carries the mobile
    // vertical offset; the inner does the actual fade-in.
    gsap.set(greetingEl.value, { opacity: 1, y: dy })
    gsap.set(greetingInner.value, { opacity: 0, y: 20 })
    introTl.to(greetingInner.value, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.35)
    const wave = greetingInner.value.querySelector('.wave')
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
    introTl.to(greetingInner.value, { opacity: 0, y: -24, duration: 0.45, ease: 'power2.in' }, 1.5)
  }

  if (scrollCueEl.value) introTl.fromTo(scrollCueEl.value, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.8)
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
  buildReveal() // pin built now, at the centred-stack end state — seamless
  enableInteractive(true) // the collapsed stack is immediately swipeable + flippable
}

function startSequence() {
  handedOff = false
  flipped.value = false
  enableInteractive(false)
  cards.forEach((c) => {
    const inner = c.querySelector('.deck-card-inner')
    if (inner) gsap.set(inner, { rotateY: 0 })
  })
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

  // Browsing listeners — live in both motion modes. Move/up/cancel sit on
  // window so a drag keeps tracking even if the finger leaves the card.
  deckEl.value.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerCancel)
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
  deckEl.value?.removeEventListener('pointerdown', onPointerDown)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerCancel)
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
          <span ref="greetingInner" class="hero-greeting-inner">
            <span class="hi-text">Hi</span>
            <span class="wave">👋🏻</span>
          </span>
        </div>

        <span
          data-hero-stagger
          class="hero-eyebrow inline-flex items-center gap-2.5 rounded-full border border-border-subtle bg-bg-secondary px-3 py-1.5 text-sm font-medium text-text-secondary mb-7"
        >
          <span class="dot-available" />
          Available for {{ personal.availableFor }}
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
        >
          <figure
            v-for="(media, i) in slotMedia"
            :key="i"
            class="deck-card"
            :class="{ 'deck-card--lead': i === leadIdx, 'is-flipped': i === leadIdx && flipped }"
            @click="onCardClick(i)"
          >
            <div class="deck-card-inner">
              <!-- Front: the photo -->
              <div class="deck-face deck-face--front">
                <img v-if="media?.img" :src="media.img" :alt="media.alt || ''" draggable="false" decoding="async" @load="refreshTriggers" />
                <div v-else class="deck-ph"><span>{{ media?.label }}</span></div>
              </div>
              <!-- Back: a short story (flip to reveal). Only the lead flips,
                   so only it carries a back face — keeps the peek cards cheap. -->
              <div v-if="i === leadIdx" class="deck-face deck-face--back">
                <div v-if="media?.story" class="deck-story">
                  <span class="deck-story-kicker">{{ media.story.kicker }}</span>
                  <h3 class="deck-story-title">{{ media.story.title }}</h3>
                  <p class="deck-story-body">{{ media.story.body }}</p>
                </div>
              </div>
            </div>
          </figure>
        </div>

        <!-- Mobile-only hint above the deck, shown only once composed (the
             fanned cards arc upward, so a hint there would collide). -->
        <div class="deck-hint-top" :style="{ opacity: interactiveOn ? 1 : 0 }">
          Tap to flip · swipe to browse
        </div>

        <!-- Desktop-only: expand into a full-screen photo gallery. -->
        <button
          class="deck-expand"
          aria-label="Expand photo gallery"
          :style="{ opacity: interactiveOn ? 1 : 0, pointerEvents: interactiveOn ? 'auto' : 'none' }"
          @click.stop="expanded = true"
        >
          <Icon name="fluent:arrow-expand-16-filled" size="15" />
        </button>

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
          Tap a photo to flip · swipe or ← → to browse
        </div>
      </div>
    </div>

    <!-- Scroll cue -->
    <div ref="scrollCueEl" class="scroll-cue">
      <span class="mouse" />
      Scroll
    </div>

    <!-- Expanded photo gallery (teleports to body) -->
    <UiPhotoLightbox v-model:open="expanded" :photos="photos" :start-index="cur" />
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
  font-size: clamp(3.2rem, 9vw, 8rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 0.92;
  color: var(--color-text-primary);
  pointer-events: none;
  z-index: 2;
}
/* Inner row carries the fade/wave animation; the outer carries placement
   (and, on mobile, the vertical offset that keeps it under the centred deck). */
.hero-greeting-inner {
  display: inline-flex;
  align-items: center;
  gap: 0.22em;
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
  /* Mouse-drag the cards without selecting text or starting a native
     image-drag (which would hijack the swipe gesture on desktop). */
  user-select: none;
  -webkit-user-select: none;
}
.deck-face--front img {
  -webkit-user-drag: none;
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

/* The card is a 3D container; the visual surfaces live on the two faces so the
   inner can flip between them. No overflow/backface here — that would flatten
   the 3D context. */
.deck-card {
  position: absolute;
  inset: 0;
  margin: 0;
  transform-style: preserve-3d;
  transform-origin: 50% 100%;
  will-change: transform, opacity;
}
.deck-card-inner {
  position: absolute;
  inset: 0;
  will-change: transform;
}
/* Only the lead flips, so only it needs the 3D context + a back face. Keeping
   the 5 peek cards flat (no preserve-3d / no backface layer) is much cheaper to
   composite — the difference between smooth and stuttering on Safari / mobile. */
.deck-card--lead .deck-card-inner {
  transform-style: preserve-3d;
}
.deck-face {
  position: absolute;
  inset: 0;
  border-radius: 26px;
  overflow: hidden;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-subtle);
  /* Tighter blur — big-radius shadows on many animating cards are a top GPU
     cost on weaker devices. */
  box-shadow:
    0 2px 6px rgb(var(--color-text-primary-raw) / 0.06),
    0 14px 30px -20px rgb(var(--color-text-primary-raw) / 0.36);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.deck-face--front img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}
.deck-face--back {
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  padding: clamp(20px, 7%, 34px);
  background: var(--color-surface);
}

/* Lead card (the active photo on top of the stack) — accent-lit glow on both
   faces so it reads whether showing the photo or the flipped story. */
.deck-card--lead .deck-face {
  box-shadow:
    0 6px 18px rgb(var(--color-text-primary-raw) / 0.10),
    0 24px 50px -30px rgb(var(--color-accent-raw) / 0.5);
}

/* ── Card-back story ────────────────────────────────────────── */
.deck-story-kicker {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent);
}
.deck-story-title {
  font-size: clamp(1.05rem, 2.4vw, 1.6rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--color-text-primary);
}
.deck-story-body {
  font-size: clamp(0.8rem, 1.5vw, 0.98rem);
  line-height: 1.5;
  color: var(--color-text-secondary);
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
/* Mobile-only hint above the deck (desktop uses the bottom hint instead).
   Centered single line so it never wraps down into the photo. */
.deck-hint-top {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 14px);
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  transition: opacity 0.45s var(--ease-apple);
  pointer-events: none;
  display: none;
}

/* Desktop-only "expand to gallery" affordance, top-right of the deck. */
.deck-expand {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 7;
  width: 38px;
  height: 38px;
  display: none;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: rgb(var(--color-surface-raw) / 0.82);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--color-border-subtle);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 10px 26px -14px rgb(var(--color-text-primary-raw) / 0.4);
  transition: opacity 0.45s var(--ease-apple), transform 0.18s var(--ease-apple), color 0.18s, border-color 0.18s;
}
.deck-expand:hover {
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
  transform: translateY(-1px);
}
.deck-expand:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
@media (min-width: 1024px) {
  .deck-expand {
    display: inline-flex;
  }
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
  /* Single column: drop the floating credential badge — on the centred,
     shrunken deck it overlaps the photo. Desktop keeps it. */
  .hero-photo-badge {
    display: none;
  }
  /* Move the interaction hint above the deck (and out from under the copy). */
  .deck-hint-top {
    display: block;
  }
  .deck-hint {
    display: none;
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
  /* Stack the CTAs: "Get in touch" drops below "Experience my journey". */
  .hero-cta {
    flex-direction: column;
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
