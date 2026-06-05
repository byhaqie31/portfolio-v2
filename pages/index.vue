<script setup lang="ts">
import { personal as staticPersonal } from '~/data/index'

const { data: personalData } = await usePersonal()

const p = computed(() => personalData.value as any)

const siteUrl = 'https://baihaqie.com'
// TODO: swap for a dedicated 1200×630 share card at /images/og-image.png.
// Falls back to the portrait so social/SEO previews aren't broken meanwhile.
const ogImage = `${siteUrl}/images/ProfilePicture.png`

// Browser tab + search result title — clean personal brand.
const pageTitle = 'Ahmad Baihaqie'
// Richer title for social cards / search snippets (keyword-led, name first).
const socialTitle = 'Ahmad Baihaqie — Software Engineer (UI/UX)'
// Keyword-dense meta description, falling back to the editable summary.
const seoDescription = computed(
  () =>
    p.value?.summary ||
    'Ahmad Baihaqie is a Software Engineer (UI/UX) in Malaysia building clean, scalable interfaces for fintech & SaaS with Vue.js, Nuxt and Tailwind CSS.',
)

useSeoMeta({
  title: pageTitle,
  description: seoDescription,
  ogTitle: socialTitle,
  ogDescription: seoDescription,
  ogType: 'website',
  ogUrl: siteUrl,
  ogSiteName: 'Ahmad Baihaqie',
  ogImage,
  ogImageAlt: socialTitle,
  twitterCard: 'summary_large_image',
  twitterTitle: socialTitle,
  twitterDescription: seoDescription,
  twitterImage: ogImage,
  twitterImageAlt: socialTitle,
})

useHead({
  link: [{ rel: 'canonical', href: siteUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': `${siteUrl}/#website`,
            url: siteUrl,
            name: 'Ahmad Baihaqie',
            inLanguage: 'en',
            publisher: { '@id': `${siteUrl}/#person` },
          },
          {
            '@type': 'Person',
            '@id': `${siteUrl}/#person`,
            name: staticPersonal.name,
            alternateName: staticPersonal.shortName,
            url: siteUrl,
            image: `${siteUrl}/images/ProfilePicture.png`,
            jobTitle: staticPersonal.role,
            description: staticPersonal.summary,
            email: `mailto:${staticPersonal.email}`,
            telephone: staticPersonal.mobile,
            worksFor: {
              '@type': 'Organization',
              name: 'Fiuu (Razer Merchant Services)',
              url: 'https://fiuu.com',
            },
            alumniOf: [
              { '@type': 'CollegeOrUniversity', name: 'Universiti Malaya' },
              { '@type': 'CollegeOrUniversity', name: 'Universiti Putra Malaysia' },
            ],
            address: {
              '@type': 'PostalAddress',
              addressLocality: staticPersonal.location,
              addressCountry: 'MY',
            },
            nationality: { '@type': 'Country', name: 'Malaysia' },
            sameAs: [staticPersonal.github, staticPersonal.linkedin, staticPersonal.website],
            knowsAbout: [
              'Vue.js',
              'Nuxt',
              'Tailwind CSS',
              'JavaScript',
              'TypeScript',
              'UI Design',
              'UX Research',
              'Design Systems',
              'Frontend Development',
              'REST API Integration',
              'Fintech',
              'SaaS',
            ],
          },
        ],
      }),
    },
  ],
})

definePageMeta({ layout: 'default' })
</script>

<template>
  <div>
    <SectionsHeroSection />
    <SectionsStatementSection />
    <SectionsAboutSection />
    <SectionsExperienceSection />
    <SectionsImpactSection />
    <SectionsEducationSection />
    <SectionsSkillsSection />
    <SectionsWorkSection />
    <SectionsReferencesSection />
    <SectionsContactSection />
  </div>
</template>
