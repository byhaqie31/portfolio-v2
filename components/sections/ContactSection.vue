<script setup lang="ts">
import { personal as staticPersonal } from '~/data/index'

const { data: personalData } = await usePersonal()

const personal = computed(() => {
  const d = personalData.value as any
  return {
    email: d?.email || staticPersonal.email,
    mobile: d?.mobile || staticPersonal.mobile,
    website: d?.website || staticPersonal.website,
    github: d?.github || staticPersonal.github,
    linkedin: d?.linkedin || staticPersonal.linkedin,
  }
})

// tel: needs a punctuation-free number.
const telHref = computed(() => `tel:${personal.value.mobile.replace(/[^\d+]/g, '')}`)

// Channel labels: show the bare domain + path, derived from the URL.
const stripUrl = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '')
const githubLabel = computed(() => stripUrl(personal.value.github))
const linkedinLabel = computed(() => stripUrl(personal.value.linkedin))
const websiteLabel = computed(() => stripUrl(personal.value.website))

function scrollToTop() {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
}
</script>

<template>
  <!-- Extra py beyond the default .section padding grows the dark-chapter band.
       The fade edges are a fixed 22vh, so this padding adds solid navy. Dial the
       numbers up/down to taste (py-32 ≈ 8rem · py-48 ≈ 12rem · py-64 ≈ 16rem). -->
  <section id="contact" class="section text-center py-40 md:py-56">
    <div class="max-w-2xl mx-auto">
      <p class="reveal text-sm text-accent font-medium mb-4">Contact</p>

      <h2 class="reveal text-[clamp(2.25rem,6vw,4rem)] font-semibold tracking-tight leading-[1.02] text-text-primary">
        Let's build something worth using.
      </h2>

      <p class="reveal mx-auto mt-6 max-w-xl text-lg text-text-secondary leading-relaxed">
        Open to full-time and contract roles in fintech and SaaS. Hit me up!
      </p>

      <!-- Primary actions: email + phone -->
      <div class="reveal mt-10 flex flex-wrap items-center justify-center gap-4">
        <a :href="`mailto:${personal.email}`" class="btn-primary group">
          <Icon name="fluent:mail-16-filled" size="15" />
          {{ personal.email }}
          <Icon name="fluent:arrow-right-16-filled" size="14" class="ml-1 group-hover:translate-x-0.5 transition-transform" />
        </a>
        <a :href="telHref" class="btn-ghost">
          <Icon name="fluent:call-16-filled" size="15" />
          {{ personal.mobile }}
        </a>
      </div>

      <!-- Channels -->
      <div class="reveal mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[0.9375rem]">
        <a
          :href="personal.github"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
        >
          <UiIconGithub :size="15" />
          {{ githubLabel }}
        </a>
        <a
          :href="personal.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
        >
          <UiIconLinkedin :size="15" />
          {{ linkedinLabel }}
        </a>
        <a
          :href="personal.website"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
        >
          <Icon name="fluent:globe-16-filled" size="15" />
          {{ websiteLabel }}
        </a>
      </div>

      <!-- Back to top -->
      <div class="reveal mt-14">
        <button type="button" class="btn-ghost group" @click="scrollToTop">
          Back to top
          <Icon name="fluent:arrow-up-16-filled" size="14" class="group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  </section>
</template>
