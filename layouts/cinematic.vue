<script setup lang="ts">
import '~/assets/css/cinematic.css'
import { useLenis } from '~/composables/useLenis'

useHead({
  htmlAttrs: { 'data-layout': 'cinematic' },
  meta: [
    { name: 'theme-color', content: '#0A0B0F' },
  ],
})

const { init, destroy } = useLenis()

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  destroy()
})
</script>

<template>
  <div class="cinematic-shell">
    <slot />
  </div>
</template>

<style scoped>
/* Bg + ink are painted on <html>/<body> by cinematic.css so the fixed
 * Three.js canvas can sit cleanly behind the shell with no double-paint. */
.cinematic-shell {
  min-height: 100vh;
}
</style>
