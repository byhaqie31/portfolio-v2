<script setup lang="ts">
import { personal as staticPersonal } from '~/data/index'

const { data: personalData } = await useFetch<any>('/api/personal', {
  key: 'personal',
  default: () => ({
    ...staticPersonal,
    bio_1: staticPersonal.bio[0],
    bio_2: staticPersonal.bio[1],
    short_name: staticPersonal.shortName,
    available_for: staticPersonal.availableFor,
  } as any),
})

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
