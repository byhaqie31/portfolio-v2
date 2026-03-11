<script setup lang="ts">
import { personal } from '~/data/index'

useSeoMeta({
  title: `${personal.shortName} — ${personal.role}`,
  description: personal.summary,
  ogTitle: `${personal.shortName} — ${personal.role}`,
  ogDescription: personal.summary,
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
