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
    <div class="relative max-w-5xl mx-auto w-full py-24 md:py-36 flex flex-col md:flex-row items-center gap-12 md:gap-16">
      <div class="flex-1 min-w-0">
        <div
          class="animate-reveal inline-flex items-center gap-2 px-3 py-1.5 rounded border border-accent/20 bg-accent/5 font-mono text-xs text-accent mb-10 uppercase tracking-wider"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-accent-tertiary animate-pulse" />
          Available for {{ personal.availableFor }}
        </div>

        <p class="animate-reveal font-mono text-2xs text-text-muted uppercase tracking-[0.35em] mb-3" style="animation-delay:0.05s">
          // {{ personal.name }}
        </p>

        <h1
          class="animate-reveal font-display text-4xl sm:text-5xl md:text-[3.25rem] font-bold tracking-[0.02em] leading-[1.1] text-text-primary mb-2"
          style="animation-delay:0.1s"
        >
          {{ personal.role }}
        </h1>

        <p class="animate-reveal text-lg text-text-secondary mt-3 mb-8" style="animation-delay:0.15s">
          Focused on <span class="text-accent font-medium">{{ personal.focus }}</span>
        </p>

        <p
          class="animate-reveal max-w-xl text-base text-text-secondary leading-relaxed mb-10"
          style="animation-delay:0.2s"
        >
          {{ personal.summary }}
        </p>

        <div class="animate-reveal flex flex-wrap items-center gap-3 mb-12" style="animation-delay:0.25s">
          <a href="#projects" class="btn-primary group">
            View my work
            <Icon name="fluent:arrow-right-16-filled" size="14" class="group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a :href="`mailto:${personal.email}`" class="btn-ghost">
            Get in touch
          </a>
        </div>

        <div class="animate-reveal flex flex-wrap items-center gap-5" style="animation-delay:0.3s">
          <span class="flex items-center gap-1.5 font-mono text-2xs text-text-muted uppercase tracking-wider">
            <Icon name="fluent:location-16-filled" size="12" />
            {{ personal.location }}
          </span>
          <span class="w-px h-3 bg-accent/20" />
          <a
            :href="personal.website"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-1.5 font-mono text-2xs text-text-muted hover:text-accent transition-colors uppercase tracking-wider"
          >
            <Icon name="fluent:globe-16-filled" size="12" />
            baihaqie.com
          </a>
        </div>
      </div>

      <div class="animate-reveal shrink-0" style="animation-delay:0.2s">
        <div class="group relative w-56 h-56 md:w-72 md:h-72">
          <div
            class="relative w-full h-full rounded-full overflow-hidden transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            style="box-shadow: 0 20px 60px rgba(0,0,0,0.15);"
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
