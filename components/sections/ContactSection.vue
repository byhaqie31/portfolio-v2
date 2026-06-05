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
const websiteLabel = computed(() => personal.value.website.replace(/^https?:\/\//, '').replace(/\/$/, ''))
</script>

<template>
  <section id="contact" class="section">
    <div class="max-w-6xl mx-auto">
      <div class="max-w-2xl reveal">
        <p class="text-sm text-accent font-medium mb-3">Contact</p>

        <h2 class="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.1] text-text-primary mb-4">
          Let's build something
          <span class="text-accent">together.</span>
        </h2>

        <p class="text-lg text-text-secondary leading-relaxed mb-10">
          I'm always open to interesting projects, collaborations, or just a good conversation.
          Reach out, I usually respond within a day.
        </p>

        <!-- Primary actions: email + phone -->
        <div class="flex flex-wrap items-center gap-4 mb-10">
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
        <div class="flex flex-wrap items-center gap-x-7 gap-y-3 text-[0.9375rem]">
          <a
            :href="personal.github"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
          >
            <UiIconGithub :size="15" />
            GitHub
          </a>
          <a
            :href="personal.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-text-secondary hover:text-accent transition-colors"
          >
            <UiIconLinkedin :size="15" />
            LinkedIn
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
      </div>
    </div>
  </section>
</template>
