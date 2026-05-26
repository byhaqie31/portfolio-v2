<script setup lang="ts">
definePageMeta({ layout: 'default', ssr: false })

useSeoMeta({ robots: 'noindex, nofollow' })

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
      class="fixed top-3 left-1/2 -translate-x-1/2 z-60 flex items-center gap-3 px-4 py-2 rounded-full border border-border bg-surface/95 backdrop-blur-md text-sm text-text-secondary shadow-sm"
    >
      <span class="w-1.5 h-1.5 rounded-full bg-accent-tertiary animate-pulse" />
      <span>Preview mode, not published</span>
      <button
        class="text-text-muted hover:text-text-primary transition-colors"
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
