<script setup lang="ts">
import { gsap } from 'gsap'
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

const heroRoot = ref<HTMLElement | null>(null)

let mm: ReturnType<typeof gsap.matchMedia> | null = null

onMounted(() => {
  if (!heroRoot.value) return

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ctx = gsap.context(() => {
      gsap.set('.hero-reveal', { opacity: 0, y: 24 })
      gsap.set('.hero-photo', { opacity: 0, scale: 0.96 })

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.to('.hero-photo', { opacity: 1, scale: 1, duration: 1.6 }, 0)
        .to('.hero-reveal', { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.15)
    }, heroRoot.value!)

    return () => ctx.revert()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('.hero-reveal', { opacity: 1, y: 0 })
    gsap.set('.hero-photo', { opacity: 1, scale: 1 })
  })
})

onUnmounted(() => mm?.revert())
</script>

<template>
  <section ref="heroRoot" class="relative min-h-screen flex items-center px-6 pt-14">
    <div class="relative max-w-6xl mx-auto w-full py-28 md:py-40 flex flex-col md:flex-row items-center lg:items-start gap-12 md:gap-12 lg:gap-20">
      <div class="flex-1 min-w-0">
        <div class="hero-reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface text-sm text-text-secondary mb-8">
          <span class="w-1.5 h-1.5 rounded-full bg-accent-tertiary animate-pulse" />
          Available for {{ personal.availableFor }}
        </div>

        <p class="hero-reveal text-sm text-text-muted font-medium mb-3">
          {{ personal.name }}
        </p>

        <h1 class="hero-reveal text-[clamp(3rem,7vw,5.5rem)] font-semibold tracking-tight leading-[1.02] text-text-primary mb-5">
          {{ personal.role }}
        </h1>

        <p class="hero-reveal text-xl md:text-2xl text-text-secondary leading-snug mb-8 max-w-xl">
          Focused on <span class="text-text-primary font-medium">{{ personal.focus }}</span>
        </p>

        <p class="hero-reveal max-w-xl text-base text-text-secondary leading-relaxed mb-10">
          {{ personal.summary }}
        </p>

        <div class="hero-reveal flex flex-wrap items-center gap-6 mb-14">
          <NuxtLink to="/experience" class="btn-primary group">
            Experience my journey
            <Icon name="fluent:arrow-right-16-filled" size="14" class="group-hover:translate-x-0.5 transition-transform" />
          </NuxtLink>
          <a
            href="#projects"
            class="text-sm text-text-secondary hover:text-text-primary transition-colors inline-flex items-center gap-1 py-2"
          >
            View my work
            <Icon name="fluent:arrow-right-16-filled" size="13" class="opacity-60" />
          </a>
        </div>

        <div class="hero-reveal flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-muted">
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

      <div class="shrink-0">
        <div class="hero-photo group relative w-64 h-72 sm:w-72 sm:h-80 md:w-80 md:h-96 lg:w-104 lg:h-128">
          <div
            class="relative w-full h-full rounded-3xl overflow-hidden transition-transform duration-1000 ease-out group-hover:scale-[1.02]"
            style="box-shadow: 0 40px 90px -25px rgba(0,0,0,0.18), 0 0 0 1px rgb(var(--color-border-raw) / 0.5);"
          >
            <img
              src="/images/ProfilePicture.png"
              alt="Ahmad Baihaqie"
              class="w-full h-full object-cover object-top"
            />
            <!-- Subtle bottom gradient for visual weight without imposing on the face -->
            <div
              class="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
              style="background: linear-gradient(to top, rgb(var(--color-bg-raw) / 0.15), transparent);"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* FOUC guard for the GSAP entrance — only applies when JS is enabled,
 * so JS-disabled readers still see the hero content rendered by SSR. */
@media (scripting: enabled) {
  .hero-reveal,
  .hero-photo {
    opacity: 0;
  }
}
</style>
