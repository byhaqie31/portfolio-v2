<script setup lang="ts">
import { useScrollProgress } from '~/composables/useScrollProgress'
import { useReveal } from '~/composables/useReveal'

const { progress } = useScrollProgress()
useReveal()
</script>

<template>
  <div class="min-h-screen bg-bg">
    <!-- Scroll progress bar -->
    <div
      class="scroll-progress"
      :style="{ transform: `scaleX(${progress})`, width: '100%' }"
    />

    <LayoutNavbar />
    <UiCommandPalette />

    <main>
      <slot />
    </main>

    <LayoutFooter />
  </div>
</template>
