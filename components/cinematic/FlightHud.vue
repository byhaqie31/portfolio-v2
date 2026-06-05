<script setup lang="ts">
/*
 * Telemetry HUD for the cinematic flight. A top-right gauge cluster
 * (ALT / HDG / G-S / V-S) plus a compass whose needle tracks the
 * aircraft's heading, and a bottom-left perf readout. Every value is
 * derived from the scene by useFlightPath / useFlightScene and passed in
 * as a prop — this component is pure chrome. All numbers tabular-nums.
 *
 * The compass needle is the one allowed off-palette colour (#E11D2A) per
 * CINEMATIC §2.1 — the universal red-needle convention.
 */

const props = defineProps<{
  alt: string
  hdg: string
  gs: string
  vs: string
  /** Heading in degrees — drives the compass needle rotation. */
  needleDeg: number
  /** Show the bottom-left engineering perf readout. */
  showPerf?: boolean
  fps: number
  calls: number
  tris: number
  dpr: number
}>()

const trisLabel = computed(() => (props.tris / 1000).toFixed(1) + 'k')
const dprLabel = computed(() => props.dpr.toFixed(1) + '×')
</script>

<template>
  <div class="flight-hud" aria-hidden="true">
    <div class="flight-hud__telemetry">
      <div class="flight-hud__gauges">
        <div class="flight-hud__gauge">
          <div class="flight-hud__label">ALT</div>
          <div class="flight-hud__value tnum">{{ alt }}<span class="flight-hud__unit">FT</span></div>
        </div>
        <div class="flight-hud__gauge">
          <div class="flight-hud__label">HDG</div>
          <div class="flight-hud__value tnum">{{ hdg }}<span class="flight-hud__unit">°</span></div>
        </div>
        <div class="flight-hud__gauge">
          <div class="flight-hud__label">G/S</div>
          <div class="flight-hud__value tnum">{{ gs }}<span class="flight-hud__unit">KT</span></div>
        </div>
        <div class="flight-hud__gauge">
          <div class="flight-hud__label">V/S</div>
          <div class="flight-hud__value tnum">{{ vs }}<span class="flight-hud__unit">FPM</span></div>
        </div>
      </div>

      <div class="flight-hud__compass">
        <span class="flight-hud__cmark flight-hud__cmark--n">N</span>
        <span class="flight-hud__cmark flight-hud__cmark--e">E</span>
        <span class="flight-hud__cmark flight-hud__cmark--s">S</span>
        <span class="flight-hud__cmark flight-hud__cmark--w">W</span>
        <div class="flight-hud__needle-wrap" :style="{ transform: `rotate(${needleDeg}deg)` }">
          <div class="flight-hud__needle" />
        </div>
      </div>
    </div>

    <div v-if="showPerf" class="flight-hud__perf">
      <span class="flight-hud__perf-dot" />
      <span><b>{{ fps }}</b> FPS</span>
      <span><b>{{ calls }}</b> CALLS</span>
      <span><b>{{ trisLabel }}</b> TRIS</span>
      <span>DPR <b>{{ dprLabel }}</b></span>
      <span>DRACO 808KB</span>
    </div>
  </div>
</template>

<style scoped>
.flight-hud {
  position: fixed;
  inset: 0;
  z-index: var(--z-controls);
  pointer-events: none;
}

.tnum {
  font-variant-numeric: tabular-nums;
}

.flight-hud__label {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

/* ── Top-right telemetry cluster ─────────────────────────────── */
.flight-hud__telemetry {
  position: fixed;
  top: var(--space-5);
  right: var(--space-6);
  display: flex;
  align-items: flex-start;
  gap: var(--space-5);
}

.flight-hud__gauges {
  display: grid;
  grid-template-columns: repeat(2, auto);
  gap: var(--space-3) var(--space-6);
}

.flight-hud__gauge {
  text-align: right;
}

.flight-hud__value {
  font-family: var(--font-mono);
  font-size: var(--font-data);
  font-weight: 500;
  line-height: 1.1;
  margin-top: 3px;
  color: var(--color-ink-primary);
}

.flight-hud__unit {
  font-size: var(--font-label);
  color: var(--color-ink-muted);
  margin-left: 3px;
}

/* ── Compass ─────────────────────────────────────────────────── */
.flight-hud__compass {
  position: relative;
  flex: none;
  width: 78px;
  height: 78px;
  border: 1px solid var(--color-hairline);
  border-radius: 50%;
  background: rgba(19, 21, 28, 0.4);
}

.flight-hud__cmark {
  position: absolute;
  left: 50%;
  top: 50%;
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--color-ink-faint);
}

.flight-hud__cmark--n {
  transform: translate(-50%, -36px);
  color: var(--color-ink-secondary);
}
.flight-hud__cmark--e {
  transform: translate(28px, -50%);
}
.flight-hud__cmark--s {
  transform: translate(-50%, 28px);
}
.flight-hud__cmark--w {
  transform: translate(-38px, -50%);
}

.flight-hud__needle-wrap {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  transition: transform 0.12s linear;
}

.flight-hud__needle {
  position: relative;
  top: -15px;
  width: 2px;
  height: 30px;
  transform-origin: 50% 100%;
  /* Universal compass red — the one allowed off-palette colour. */
  background: linear-gradient(to top, transparent, #e11d2a 40%, #e11d2a);
}

/* ── Bottom-left perf readout ────────────────────────────────── */
.flight-hud__perf {
  position: fixed;
  bottom: var(--space-5);
  left: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  letter-spacing: 0.12em;
  color: var(--color-ink-faint);
}

.flight-hud__perf b {
  color: var(--color-ink-muted);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.flight-hud__perf-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #2bd17e;
  box-shadow: 0 0 8px #2bd17e;
}

@media (max-width: 760px) {
  .flight-hud__compass {
    display: none;
  }
  .flight-hud__telemetry {
    gap: 0;
    top: var(--space-4);
    right: var(--space-4);
  }
  .flight-hud__gauges {
    gap: var(--space-2) var(--space-4);
  }
  .flight-hud__value {
    font-size: var(--font-body-small);
  }
  .flight-hud__perf {
    bottom: var(--space-4);
    left: var(--space-4);
    gap: var(--space-3);
    font-size: 9px;
  }
}
</style>
