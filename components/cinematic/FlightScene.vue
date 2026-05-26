<script setup lang="ts">
import { useFlightScene } from '~/composables/useFlightScene'

/*
 * Mounts the Three.js sky shader at z-canvas, fixed to the viewport.
 * No props yet — scroll-driven camera + sun position changes land in
 * weekend 3 via composables/useFlightScroll.ts.
 */

const host = ref<HTMLDivElement | null>(null)
const { init, destroy } = useFlightScene()

onMounted(() => {
  if (host.value) init(host.value)
})

onBeforeUnmount(() => {
  destroy()
})
</script>

<template>
  <div ref="host" class="flight-scene" aria-hidden="true" />
</template>

<style scoped>
.flight-scene {
  position: fixed;
  inset: 0;
  z-index: var(--z-canvas);
  pointer-events: none;
  overflow: hidden;
}

.flight-scene :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
</style>
