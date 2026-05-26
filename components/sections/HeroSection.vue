<script setup lang="ts">
import { personal as staticPersonal } from '~/data/index'

const { data: personalData } = await usePersonal()

const personal = computed(() => {
  const d = personalData.value as any
  return {
    name: d?.name || staticPersonal.name,
    shortName: d?.short_name || staticPersonal.shortName,
    role: d?.role || staticPersonal.role,
    summary: d?.summary || staticPersonal.summary,
    location: d?.location || staticPersonal.location,
    email: d?.email || staticPersonal.email,
    website: d?.website || staticPersonal.website,
    github: d?.github || staticPersonal.github,
    linkedin: d?.linkedin || staticPersonal.linkedin,
    availableFor: d?.available_for || staticPersonal.availableFor,
    focus: d?.focus || staticPersonal.focus,
  }
})
</script>

<template>
  <section class="relative min-h-screen flex items-center px-6 pt-14">
    <div class="relative max-w-6xl mx-auto w-full py-28 md:py-40 flex flex-col md:flex-row items-center gap-14 md:gap-20">
      <div class="flex-1 min-w-0">
        <div class="animate-reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-sm text-text-secondary mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-accent-tertiary animate-pulse" />
          Available for {{ personal.availableFor }}
        </div>

        <p class="animate-reveal text-sm text-text-muted font-medium mb-3" style="animation-delay:0.05s">
          {{ personal.name }}
        </p>

        <h1
          class="animate-reveal text-[clamp(2.75rem,6vw,4.75rem)] font-semibold tracking-tight leading-[1.02] text-text-primary mb-5"
          style="animation-delay:0.1s"
        >
          {{ personal.role }}.
        </h1>

        <p class="animate-reveal text-xl md:text-2xl text-text-secondary leading-snug mb-8 max-w-xl" style="animation-delay:0.15s">
          Focused on <span class="text-text-primary font-medium">{{ personal.focus }}</span>.
        </p>

        <p
          class="animate-reveal max-w-xl text-base text-text-secondary leading-relaxed mb-10"
          style="animation-delay:0.2s"
        >
          {{ personal.summary }}
        </p>

        <div class="animate-reveal flex flex-wrap items-center gap-6 mb-14" style="animation-delay:0.25s">
          <a href="#projects" class="btn-primary group">
            View my work
            <Icon name="fluent:arrow-right-16-filled" size="14" class="group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            :href="`mailto:${personal.email}`"
            class="text-sm text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1"
          >
            Get in touch
            <Icon name="fluent:arrow-right-16-filled" size="13" class="opacity-60" />
          </a>
        </div>

        <div class="animate-reveal flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted" style="animation-delay:0.3s">
          <span class="flex items-center gap-1.5">
            <Icon name="fluent:location-16-filled" size="14" />
            {{ personal.location }}
          </span>
          <span class="w-px h-3 bg-border hidden sm:inline-block" />
          <a
            href="https://axelnovaventures.com"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 hover:text-text-primary transition-colors"
          >
            <Icon name="fluent:globe-16-filled" size="14" />
            axelnovaventures.com
          </a>
        </div>
      </div>

      <div class="animate-reveal shrink-0" style="animation-delay:0.15s">
        <div class="group relative w-64 h-64 md:w-96 md:h-96">
          <div
            class="relative w-full h-full rounded-full overflow-hidden transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
            style="box-shadow: 0 30px 80px -20px rgba(0,0,0,0.12), 0 0 0 1px rgb(var(--color-border-raw) / 0.5);"
          >
            <img
              src="/images/ProfilePicture.png"
              alt="Ahmad Baihaqie"
              class="w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
