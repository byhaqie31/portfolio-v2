<script setup lang="ts">
import { useScrollProgress } from '~/composables/useScrollProgress'
import { useReveal } from '~/composables/useReveal'
import { useTheme } from '~/composables/useTheme'

const { progress } = useScrollProgress()
useReveal()

const { init } = useTheme()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="min-h-screen bg-bg">
    <div
      class="scroll-progress"
      :style="{ transform: `scaleX(${progress})`, width: '100%' }"
    />

    <div class="relative">
      <LayoutNavbar />
      <UiCommandPalette />

      <main>
        <slot />
      </main>

      <LayoutFooter />
    </div>
  </div>
</template>
