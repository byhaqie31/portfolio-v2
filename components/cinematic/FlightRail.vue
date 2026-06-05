<script setup lang="ts">
/*
 * Right-edge progress rail for the cinematic flight. A vertical hairline
 * with a cool fill that climbs with flight progress, and four labelled
 * stops (one per waypoint) whose dot lights cool when active. Pure chrome
 * — driven entirely by props from useFlightPath.
 */

defineProps<{
  /** Flight progress 0 → 1 (drives the fill height). */
  progress: number
  /** Active waypoint index, or -1. */
  active: number
  /** Short stop labels, one per waypoint, top → bottom. */
  stops: readonly string[]
}>()
</script>

<template>
  <div class="flight-rail" aria-hidden="true">
    <div class="flight-rail__line" />
    <div class="flight-rail__fill" :style="{ height: `${progress * 100}%` }" />
    <div
      v-for="(label, i) in stops"
      :key="i"
      class="flight-rail__stop"
      :class="{ 'flight-rail__stop--active': active === i }"
    >
      <span class="flight-rail__name">{{ label }}</span>
      <span class="flight-rail__dot" />
    </div>

    <!-- The aircraft riding the timeline at the current progress, nose
         down the route. The cool fill trails behind it. -->
    <Icon
      name="fluent:airplane-16-filled"
      size="16"
      class="flight-rail__plane"
      :style="{ top: `${progress * 100}%` }"
    />
  </div>
</template>

<style scoped>
.flight-rail {
  position: fixed;
  top: 50%;
  right: var(--space-8);
  transform: translateY(-50%);
  z-index: var(--z-controls);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  pointer-events: none;
}

.flight-rail__line {
  position: absolute;
  right: 4px;
  top: 6px;
  bottom: 6px;
  width: 1px;
  background: var(--color-hairline);
}

.flight-rail__fill {
  position: absolute;
  right: 4px;
  top: 6px;
  width: 1px;
  background: var(--color-cool);
  box-shadow: 0 0 8px var(--color-cool);
  transition: height 0.15s linear;
}

.flight-rail__stop {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: 64px;
}

.flight-rail__name {
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  opacity: 0.5;
  white-space: nowrap;
  transition: color 0.4s var(--ease-out), opacity 0.4s var(--ease-out);
}

.flight-rail__dot {
  flex: none;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-bg-base);
  border: 1px solid var(--color-ink-faint);
  transition: border-color 0.4s var(--ease-out), background 0.4s var(--ease-out),
    box-shadow 0.4s var(--ease-out);
}

.flight-rail__stop--active .flight-rail__dot {
  border-color: var(--color-cool);
  background: var(--color-cool);
  box-shadow: 0 0 10px var(--color-cool);
}

.flight-rail__stop--active .flight-rail__name {
  color: var(--color-ink-secondary);
  opacity: 1;
}

.flight-rail__plane {
  position: absolute;
  right: 4px;
  /* Centre the icon on the rail line and point its nose down the route
   * (the Fluent airplane points up, so 180°). Warm-white with a cool glow
   * so it reads as the live position ahead of the cool trail. */
  transform: translate(50%, -50%) rotate(90deg);
  color: var(--color-ink-primary);
  filter: drop-shadow(0 0 6px rgba(79, 195, 247, 0.7));
  transition: top 0.15s linear;
  z-index: 1;
}

@media (max-width: 760px) {
  .flight-rail {
    right: var(--space-4);
  }
  .flight-rail__name {
    display: none;
  }
}
</style>
