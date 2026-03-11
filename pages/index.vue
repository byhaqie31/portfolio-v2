<script setup lang="ts">
import { personal } from '~/data/index'

useSeoMeta({
  title: `${personal.name} — ${personal.title}`,
  description: personal.description,
  ogTitle: `${personal.name} — ${personal.title}`,
  ogDescription: personal.description,
})

definePageMeta({ layout: 'default' })
</script>

<template>
  <div>
    <SectionsHeroSection />
    <SectionsWorkSection />
    <SectionsAboutSection />
    <SectionsExperienceSection />
    <SectionsContactSection />
  </div>
</template>
