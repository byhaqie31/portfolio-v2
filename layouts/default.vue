<script setup lang="ts">
import { useScrollProgress } from '~/composables/useScrollProgress'
import { useReveal } from '~/composables/useReveal'
import { useTheme } from '~/composables/useTheme'

const { progress } = useScrollProgress()
useReveal()

const { init } = useTheme()
onMounted(() => init())
</script>

<template>
  <div class="min-h-screen bg-bg scanlines">
    <!-- Scroll progress bar -->
    <div
      class="scroll-progress"
      :style="{ transform: `scaleX(${progress})`, width: '100%' }"
    />

    <!-- Noise texture overlay -->
    <svg class="fixed inset-0 w-full h-full pointer-events-none z-[98] opacity-[0.03]">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>

    <LayoutNavbar />
    <UiCommandPalette />

    <main>
      <slot />
    </main>

    <LayoutFooter />
  </div>
</template>
