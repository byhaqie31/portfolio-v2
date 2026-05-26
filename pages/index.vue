<script setup lang="ts">
import { personal as staticPersonal } from '~/data/index'

const { data: personalData } = await usePersonal()

const p = computed(() => personalData.value as any)

const siteUrl = 'https://baihaqie.com'
const ogImage = `${siteUrl}/images/og-image.png`

const seoTitle = computed(
  () => `${p.value?.short_name || staticPersonal.shortName} — ${p.value?.role || staticPersonal.role}`,
)
const seoDescription = computed(() => p.value?.summary || staticPersonal.summary)

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage,
  ogUrl: siteUrl,
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: ogImage,
  twitterCard: 'summary_large_image',
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: staticPersonal.name,
        alternateName: staticPersonal.shortName,
        url: siteUrl,
        image: `${siteUrl}/images/ProfilePicture.png`,
        jobTitle: staticPersonal.role,
        email: `mailto:${staticPersonal.email}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: staticPersonal.location,
          addressCountry: 'MY',
        },
        sameAs: [staticPersonal.github, staticPersonal.linkedin],
        knowsAbout: ['Vue.js', 'Nuxt', 'Tailwind CSS', 'UI/UX', 'Fintech', 'SaaS'],
      }),
    },
  ],
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
