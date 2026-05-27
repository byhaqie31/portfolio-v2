<script setup lang="ts">
import { gsap } from 'gsap'
import { usePhaseState } from '~/composables/usePhaseState'

/*
 * Cinematic HUD — page-corner spec sheet that floats at top-right of
 * the viewport. Reads like a wartime film slate or aviation magazine
 * sidebar (not a cockpit display). No blinking lights, no glow, no
 * backdrop-filter — flat against the scene, 1px hairline border.
 *
 * Layout:
 *   PHASE    CRUISE
 *   ALT      32,000 FT
 *   STAGE    CURRENT WORK
 *   ─────────────────
 *   00 01 02 03 04 05 06 07     ← each is a click-to-jump button
 *
 * Mounts after the welcome has cleared (parent controls v-if), then
 * fades in. usePhaseState tracks which phase the viewer is reading
 * and which button is highlighted.
 */

const { active, phases, current, jumpTo } = usePhaseState()

const root = ref<HTMLElement | null>(null)

onMounted(() => {
  if (!root.value) return
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    gsap.set(root.value, { opacity: 1 })
    return
  }
  gsap.fromTo(
    root.value,
    { opacity: 0, y: -8 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', delay: 0.2 },
  )
})
</script>

<template>
  <aside ref="root" class="hud" aria-label="Flight status">
    <dl class="hud__readout">
      <div class="hud__row">
        <dt class="hud__label">PHASE</dt>
        <dd class="hud__value">{{ current.label }}</dd>
      </div>
      <div class="hud__row">
        <dt class="hud__label">ALT</dt>
        <dd class="hud__value">{{ current.alt }}</dd>
      </div>
      <div class="hud__row">
        <dt class="hud__label">STAGE</dt>
        <dd class="hud__value">{{ current.stage }}</dd>
      </div>
    </dl>

    <div class="hud__divider" />

    <nav class="hud__progress" aria-label="Phase navigation">
      <button
        v-for="p in phases"
        :key="p.index"
        type="button"
        class="hud__dot"
        :class="{ 'hud__dot--active': p.index === active }"
        :aria-label="`Jump to phase ${p.pad} — ${p.label}`"
        :aria-current="p.index === active ? 'true' : undefined"
        @click="jumpTo(p.index)"
      >
        {{ p.pad }}
      </button>
    </nav>
  </aside>
</template>

<style scoped>
.hud {
  position: fixed;
  top: var(--space-8);
  right: var(--space-8);
  z-index: var(--z-controls);
  padding: var(--space-5) var(--space-6);
  min-width: 220px;
  border: 1px solid var(--color-hairline);
  background: rgba(10, 11, 15, 0.55);
  opacity: 0;
  /* Flat against the scene — no backdrop-filter, no glow per
   * CINEMATIC.md §6.5 (HUD is meant to read as editorial print, not
   * frosted-glass dashboard). */
  pointer-events: auto;
}

.hud__readout {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin: 0;
}

.hud__row {
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
}

.hud__label {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 0;
  flex-basis: 60px;
  flex-shrink: 0;
}

.hud__value {
  font-family: var(--font-mono);
  font-size: var(--font-ui);
  letter-spacing: 0.08em;
  color: var(--color-ink-primary);
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.hud__divider {
  margin: var(--space-5) 0;
  height: 1px;
  background: var(--color-hairline);
}

.hud__progress {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.hud__dot {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.15em;
  color: var(--color-ink-faint);
  background: transparent;
  border: 0;
  padding: var(--space-1) var(--space-2);
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: color var(--duration-quick) var(--ease-out);
}

.hud__dot:hover,
.hud__dot:focus-visible {
  color: var(--color-ink-secondary);
  outline: none;
}

.hud__dot--active {
  color: var(--color-ink-primary);
}

.hud__dot--active::after {
  content: '';
  display: block;
  width: 100%;
  height: 1px;
  background: var(--color-cool);
  margin-top: 2px;
}

/* Hide HUD on narrow screens — proper mobile treatment lands later. */
@media (max-width: 640px) {
  .hud {
    display: none;
  }
}
</style>
