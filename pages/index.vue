<script setup lang="ts">
import { personal as staticPersonal } from '~/data/index'

const { data: personalData } = await usePersonal()

const p = computed(() => personalData.value as any)

useSeoMeta({
  title: `${p.value?.short_name || staticPersonal.shortName} — ${p.value?.role || staticPersonal.role}`,
  description: p.value?.summary || staticPersonal.summary,
  ogTitle: `${p.value?.short_name || staticPersonal.shortName} — ${p.value?.role || staticPersonal.role}`,
  ogDescription: p.value?.summary || staticPersonal.summary,
})

definePageMeta({ layout: 'default' })
</script>

<template>
  <div>
    <SectionsHeroSection />
    <SectionsAboutSection />
    <SectionsExperienceSection />
    <SectionsSkillsSection />
    <SectionsWorkSection />
    <SectionsReferencesSection />
    <SectionsContactSection />
  </div>
</template>
