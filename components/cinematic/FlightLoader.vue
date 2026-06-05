<script setup lang="ts">
import { useLenis } from '~/composables/useLenis'

/*
 * Pre-flight loading screen — the first thing on /experience. The
 * silhouette A350 IS the loading animation: it climbs the screen as the
 * real asset load progresses (the ~808KB GLB), with a progress bar +
 * rotating status alongside. When everything is ready it flies off the top
 * and the screen fades, handing straight off to the welcome / flight.
 *
 * `progress` is the live GLB byte fraction (0 → 1); `ready` flips true once
 * the GLB has parsed and fonts are loaded. The bar (and the plane's climb)
 * ease toward `progress`, capped at 92% until `ready` so they don't finish
 * during the DRACO decode, then complete, hold a minimum beat, and exit.
 */

const props = defineProps<{
  /** Real asset load fraction, 0 → 1 (GLB bytes). */
  progress: number
  /** True once all assets (GLB parsed + fonts) are ready. */
  ready: boolean
}>()

const emit = defineEmits<{ complete: [] }>()

const lenis = useLenis()
const REDUCED =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

const MIN_MS = 1100 // minimum on-screen time so the climb always reads

const displayed = ref(0) // eased 0 → 1 (drives both the bar and the climb)
const hiding = ref(false)
const exiting = ref(false)
let raf: number | null = null
let startT = 0
let done = false

const pct = computed(() => Math.round(displayed.value * 100))
const status = computed(() => {
  if (props.ready && displayed.value > 0.99) return 'Ready for takeoff'
  if (displayed.value < 0.34) return 'Initialising systems'
  if (displayed.value < 0.7) return 'Loading aircraft'
  return 'Clearing for departure'
})

// Plane climbs from low (62% down) to high (24% down) as it loads. On exit
// the transform carries it off the top (see CSS); `top` is the climb.
const planeStyle = computed(() => ({
  top: `${62 - displayed.value * 38}%`,
}))

function finish() {
  if (done) return
  done = true
  exiting.value = true // plane flies off the top
  // Resume scroll — the welcome / flight beyond the loader is scroll-driven.
  lenis.instance?.start()
  window.setTimeout(() => {
    hiding.value = true // fade the screen as the plane clears
  }, 220)
  window.setTimeout(() => emit('complete'), 780)
}

function tick(now: number) {
  raf = requestAnimationFrame(tick)
  // Cap below 100% until ready (the DRACO decode runs after the bytes land).
  const target = props.ready ? 1 : Math.min(props.progress, 0.92)
  displayed.value += (target - displayed.value) * (REDUCED ? 1 : 0.09)
  if (displayed.value > 0.999) displayed.value = 1
  if (props.ready && displayed.value >= 0.999 && now - startT >= MIN_MS) {
    if (raf) cancelAnimationFrame(raf)
    raf = null
    finish()
  }
}

onMounted(() => {
  // Hold scroll across the whole loader → welcome → flight pacing.
  lenis.instance?.stop()
  startT = performance.now()
  raf = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  if (raf) cancelAnimationFrame(raf)
  raf = null
})
</script>

<template>
  <div
    class="flight-loader"
    :class="{ 'flight-loader--hiding': hiding }"
    role="status"
    aria-live="polite"
  >
    <div class="flight-loader__sky">
      <div
        class="flight-loader__plane-pos"
        :class="{ 'flight-loader__plane-pos--exit': exiting }"
        :style="planeStyle"
      >
        <img
          class="flight-loader__plane"
          :class="{ 'flight-loader__plane--still': REDUCED || exiting }"
          src="/images/A350_summary.png"
          alt=""
        />
      </div>
    </div>

    <div class="flight-loader__panel">
      <span class="flight-loader__eyebrow">Pre-flight · {{ status }}</span>
      <div class="flight-loader__bar">
        <div class="flight-loader__fill" :style="{ width: `${pct}%` }" />
      </div>
      <div class="flight-loader__meta">
        <span class="flight-loader__label">Flight Log</span>
        <span class="flight-loader__pct tnum">{{ String(pct).padStart(2, '0') }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flight-loader {
  position: fixed;
  inset: 0;
  z-index: var(--z-loading);
  background: var(--color-bg-base);
  transition: opacity 0.55s var(--ease-out);
}

.flight-loader--hiding {
  opacity: 0;
  pointer-events: none;
}

/* ── Climbing plane ──────────────────────────────────────────── */
.flight-loader__sky {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.flight-loader__plane-pos {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  /* Only the exit (transform) transitions; `top` is updated per-frame for
   * the climb and is already smoothed by the eased progress. */
  transition: transform 0.85s cubic-bezier(0.4, 0, 1, 1);
}

.flight-loader__plane-pos--exit {
  transform: translate(-50%, -150vh);
}

.flight-loader__plane {
  display: block;
  width: clamp(180px, 30vw, 380px);
  height: auto;
  /* Source is a black top-down silhouette on transparent — invert to white. */
  filter: invert(1);
  user-select: none;
  animation: flight-loader-bob 3.4s ease-in-out infinite;
}

.flight-loader__plane--still {
  animation: none;
}

@keyframes flight-loader-bob {
  0%,
  100% {
    transform: translateY(0) rotate(-0.4deg);
  }
  50% {
    transform: translateY(-8px) rotate(0.4deg);
  }
}

/* ── Bottom panel: bar + status ──────────────────────────────── */
.flight-loader__panel {
  position: absolute;
  left: 50%;
  bottom: 12vh;
  transform: translateX(-50%);
  width: min(340px, 78vw);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.flight-loader__eyebrow {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--color-cool-soft);
  margin-bottom: var(--space-4);
}

.flight-loader__bar {
  position: relative;
  width: 100%;
  height: 1px;
  background: var(--color-hairline);
  overflow: hidden;
}

.flight-loader__fill {
  position: absolute;
  inset: 0 auto 0 0;
  height: 100%;
  background: var(--color-cool);
  box-shadow: 0 0 10px var(--color-cool);
  transition: width 0.18s var(--ease-out);
}

.flight-loader__meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  width: 100%;
  margin-top: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.flight-loader__label {
  color: var(--color-ink-muted);
}

.flight-loader__pct {
  color: var(--color-ink-primary);
}

.tnum {
  font-variant-numeric: tabular-nums;
}
</style>
