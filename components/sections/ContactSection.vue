<script setup lang="ts">
import { personal as staticPersonal } from '~/data/index'

const { data: personalData } = await usePersonal()

const personal = computed(() => {
  const d = personalData.value as any
  return {
    email: d?.email || staticPersonal.email,
    github: d?.github || staticPersonal.github,
    linkedin: d?.linkedin || staticPersonal.linkedin,
  }
})
</script>

<template>
  <section id="contact" class="section">
    <hr class="section-divider mb-24 md:mb-32" />
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

        <!-- Primary CTA -->
        <a
          :href="`mailto:${personal.email}`"
          class="btn-primary inline-flex group mb-8"
        >
          <Icon name="fluent:mail-16-filled" size="15" />
          {{ personal.email }}
          <Icon name="fluent:arrow-right-16-filled" size="14" class="ml-1 group-hover:translate-x-0.5 transition-transform" />
        </a>

        <!-- Secondary links -->
        <div class="flex flex-wrap items-center gap-4">
          <a
            :href="personal.github"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-ghost inline-flex items-center gap-2 text-sm"
          >
            <UiIconGithub :size="14" />
            GitHub
          </a>
          <a
            :href="personal.linkedin"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-ghost inline-flex items-center gap-2 text-sm"
          >
            <UiIconLinkedin :size="14" />
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
