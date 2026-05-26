<script setup lang="ts">
import { useFlightScene } from '~/composables/useFlightScene'
import { useFlightAircraft } from '~/composables/useFlightAircraft'

/*
 * Trigger component for the 3D A350. Renders nothing in the DOM — the
 * aircraft lives entirely inside the Three.js scene managed by
 * useFlightScene. On mount we load the GLB into that scene and kick off
 * the cruise (fade in + subtle perpetual bob + wing rock). On unmount we
 * kill the timelines and dispose geometry + materials.
 *
 * Weekend 2 + intro polish: aircraft is at altitude, parked centre-frame.
 *   Continuity with the intro: silhouette took off, now we're alongside it.
 * Weekend 3: scroll choreography will take this over — per-phase position,
 *   scale, and camera moves.
 */

const flightScene = useFlightScene()
const aircraft = useFlightAircraft()

onMounted(async () => {
  const scene = flightScene.getScene()
  if (!scene) return
  try {
    await aircraft.load(scene)
    aircraft.startCruise()
  } catch {
    // Load failure already logged inside useFlightAircraft. The sky + hero
    // copy still appear normally; the cruising plane just doesn't.
  }
})

onBeforeUnmount(() => {
  aircraft.destroy()
})
</script>

<template>
  <!-- Aircraft lives in the Three.js scene — no DOM output. -->
  <div hidden />
</template>
