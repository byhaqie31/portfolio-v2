<script setup lang="ts">
definePageMeta({ layout: 'default', ssr: false })

const { init, clear } = usePreview()

const route = useRoute()
const isEmbedded = computed(() => route.query.embed === '1')

onMounted(() => {
  init()

  if (import.meta.client) {
    window.addEventListener('message', (e) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type === 'preview:scroll-to' && typeof e.data.id === 'string') {
        const el = document.getElementById(e.data.id)
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }
})

function exitPreview() {
  clear()
  if (import.meta.client) window.close()
}
</script>

<template>
  <div>
    <!-- Floating banner — hidden when embedded, since the parent already labels it -->
    <div
      v-if="!isEmbedded"
      class="fixed top-3 left-1/2 -translate-x-1/2 z-60 flex items-center gap-3 px-4 py-2 rounded-full border border-accent-secondary/40 bg-bg/85 backdrop-blur-md"
      style="box-shadow: 0 0 24px rgb(var(--color-accent-secondary-raw) / 0.25);"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse" />
      <span class="font-mono text-2xs text-accent-secondary uppercase tracking-[0.2em]">
        Preview Mode — not published
      </span>
      <button
        class="font-mono text-2xs text-text-muted hover:text-accent-secondary uppercase tracking-wider transition-colors"
        @click="exitPreview"
      >
        Close
      </button>
    </div>

    <SectionsHeroSection />
    <SectionsAboutSection />
    <SectionsExperienceSection />
    <SectionsSkillsSection />
    <SectionsWorkSection />
    <SectionsReferencesSection />
    <SectionsContactSection />
  </div>
</template>
