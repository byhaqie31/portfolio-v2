<script setup lang="ts">
/*
 * Flight intro — the welcome greeting that zooms through into a tagline
 * that lights word-by-word, then clears to reveal the flight. Purely
 * scroll-driven: every transform is derived from `introT` (0 → 1), the
 * intro slice of the master scroll progress owned by useFlightPath.
 *
 * Movement 1 (introT 0 → ~0.42): "Welcome aboard." holds, then the card
 *   fades + scales up — a zoom THROUGH the greeting.
 * Movement 2 (introT ~0.22 → ~0.8): the tagline fades in and lights
 *   muted → warm white word-by-word (`litCount` words lit; final word
 *   "effortless." lights cool).
 * Movement 3 (introT ~0.8 → 1): handled by the page (overlay clears,
 *   whole layer fades via `layerOpacity`).
 */

const props = defineProps<{
  /** Intro progress 0 → 1. */
  introT: number
  /** How many tagline words are currently lit. */
  litCount: number
  /** Opacity of the whole intro layer (fades the intro out near introT 1). */
  layerOpacity: number
  /** Opacity of the bottom "scroll to fly" hint. */
  hintOpacity: number
}>()

// Brand tagline — the approved copy from the prototype. Last word is the
// cool accent. Nine words; useFlightPath lights up to this count.
const WORDS = [
  'I', 'turn', 'complex', 'workflows', 'into',
  'journeys', 'that', 'feel', 'effortless.',
]

function smoothstep(a: number, b: number, x: number) {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

// Welcome card — fades + scales up as the greeting is zoomed through.
const welcomeStyle = computed(() => {
  const wOut = smoothstep(0, 0.42, props.introT)
  return {
    opacity: String(1 - wOut),
    transform: `translate(-50%, -50%) scale(${1 + wOut * 0.6})`,
  }
})

// Tagline — fades in mid-intro, scales gently with the zoom, fades back
// out as the reveal completes.
const lineStyle = computed(() => {
  const lIn = smoothstep(0.22, 0.4, props.introT)
  const lOut = smoothstep(0.72, 0.96, props.introT)
  return {
    opacity: String(Math.max(0, Math.min(lIn, 1 - lOut))),
    transform: `translate(-50%, -50%) scale(${0.86 + props.introT * 0.5})`,
  }
})
</script>

<template>
  <div class="flight-intro" :style="{ opacity: String(layerOpacity) }" aria-hidden="true">
    <div class="flight-intro__welcome" :style="welcomeStyle">
      <span class="flight-intro__eyebrow">Pre-flight · 2020 — Present</span>
      <h1 class="flight-intro__title">Welcome aboard<span class="flight-intro__accent">.</span></h1>
      <p class="flight-intro__sub">A career told as a single flight. Scroll to begin the journey.</p>
    </div>

    <p class="flight-intro__line" :style="lineStyle">
      <span
        v-for="(word, i) in WORDS"
        :key="i"
        class="flight-intro__word"
        :class="{
          'flight-intro__word--lit': i < litCount,
          'flight-intro__word--accent': i === WORDS.length - 1,
        }"
        >{{ i < WORDS.length - 1 ? word + ' ' : word }}</span>
    </p>

    <div class="flight-intro__hint" :style="{ opacity: String(hintOpacity) }">
      <span>Scroll to fly</span>
      <span class="flight-intro__chev" />
    </div>
  </div>
</template>

<style scoped>
.flight-intro {
  position: fixed;
  inset: 0;
  z-index: var(--z-tooltip);
  pointer-events: none;
  will-change: opacity;
}

.flight-intro__welcome,
.flight-intro__line {
  position: absolute;
  top: 50%;
  left: 50%;
  width: min(900px, 90vw);
  text-align: center;
  transform: translate(-50%, -50%);
  transform-origin: center;
  will-change: transform, opacity;
}

.flight-intro__eyebrow {
  display: block;
  margin-bottom: var(--space-5);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--color-cool-soft);
}

.flight-intro__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: var(--font-display-hero);
  line-height: 1.02;
  letter-spacing: -0.02em;
  color: var(--color-ink-primary);
  margin: 0;
}

.flight-intro__accent {
  color: var(--color-cool);
}

.flight-intro__sub {
  margin: var(--space-5) auto 0;
  max-width: 40ch;
  font-family: var(--font-body);
  font-size: var(--font-body-large);
  line-height: 1.6;
  color: var(--color-ink-muted);
}

.flight-intro__line {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: var(--font-display-large);
  line-height: 1.18;
  letter-spacing: -0.015em;
  opacity: 0;
  margin: 0;
}

.flight-intro__word {
  color: var(--color-ink-faint);
  transition: color 0.12s linear;
}

.flight-intro__word--lit {
  color: var(--color-ink-primary);
}

.flight-intro__word--accent.flight-intro__word--lit {
  color: var(--color-cool);
}

/* ── Bottom scroll hint ──────────────────────────────────────── */
.flight-intro__hint {
  position: absolute;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.flight-intro__chev {
  width: 16px;
  height: 16px;
  border-right: 1.5px solid var(--color-ink-muted);
  border-bottom: 1.5px solid var(--color-ink-muted);
  transform: rotate(45deg);
  animation: flight-chev 1.8s var(--ease-out) infinite;
}

@keyframes flight-chev {
  0%,
  100% {
    transform: rotate(45deg) translate(0, 0);
    opacity: 0.4;
  }
  50% {
    transform: rotate(45deg) translate(3px, 3px);
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .flight-intro__chev {
    animation: none;
  }
}
</style>
