<script setup lang="ts">
import { personal as staticPersonal } from '~/data/index'

const { data: personalData } = await useFetch<any>('/api/personal', {
  key: 'personal',
  default: () => ({
    ...staticPersonal,
    bio_1: staticPersonal.bio[0],
    bio_2: staticPersonal.bio[1],
    short_name: staticPersonal.shortName,
    available_for: staticPersonal.availableFor,
  } as any),
})

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

// Typewriter for the role
const displayed = ref('')
let i = 0

// Cursor spotlight
const cursor = reactive({ x: 0, y: 0 })
const smoothCursor = reactive({ x: 0, y: 0 })
let raf: number

function onMouseMove(e: MouseEvent) {
  cursor.x = e.clientX
  cursor.y = e.clientY
}

function animateCursor() {
  smoothCursor.x += (cursor.x - smoothCursor.x) * 0.08
  smoothCursor.y += (cursor.y - smoothCursor.y) * 0.08
  raf = requestAnimationFrame(animateCursor)
}

onMounted(() => {
  const target = personal.value.role
  const timer = setInterval(() => {
    displayed.value += target[i]
    i++
    if (i >= target.length) clearInterval(timer)
  }, 50)

  smoothCursor.x = window.innerWidth / 2
  smoothCursor.y = window.innerHeight / 2
  cursor.x = smoothCursor.x
  cursor.y = smoothCursor.y
  animateCursor()
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <section class="relative min-h-screen flex items-center px-6 pt-14 overflow-hidden" @mousemove="onMouseMove">
    <!-- Cursor spotlight — cyan glow -->
    <div
      class="absolute pointer-events-none rounded-full transition-opacity duration-300"
      :style="{
        width: '600px',
        height: '600px',
        left: `${smoothCursor.x}px`,
        top: `${smoothCursor.y}px`,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgb(var(--color-accent) / 0.08) 0%, transparent 65%)',
        filter: 'blur(8px)',
      }"
    />

    <!-- Hex grid pattern -->
    <div
      class="absolute inset-0 pointer-events-none opacity-[0.04]"
      style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 28px 28px;"
    />

    <!-- Cyan ambient glow -->
    <div
      class="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgb(var(--color-accent) / 0.06) 0%, transparent 70%); filter: blur(60px);"
    />

    <!-- Rose secondary glow -->
    <div
      class="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgb(var(--color-accent-secondary) / 0.04) 0%, transparent 70%); filter: blur(60px);"
    />

    <div class="relative max-w-5xl mx-auto w-full py-24 md:py-36 flex flex-col md:flex-row items-center gap-12 md:gap-16">
      <!-- Left: text content -->
      <div class="flex-1 min-w-0">
      <!-- Availability badge -->
      <div
        class="animate-reveal inline-flex items-center gap-2 px-3 py-1.5 rounded border border-accent/20 bg-accent/5 font-mono text-xs text-accent mb-10 uppercase tracking-wider"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-accent-tertiary animate-pulse" />
        Available for {{ personal.availableFor }}
      </div>

      <!-- Eyebrow label -->
      <p class="animate-reveal font-mono text-2xs text-text-muted uppercase tracking-[0.35em] mb-3" style="animation-delay:0.05s">
        // {{ personal.name }}
      </p>

      <!-- Role — typewriter with Orbitron -->
      <h1
        class="animate-reveal font-display text-4xl sm:text-5xl md:text-[3.25rem] font-bold tracking-[0.02em] leading-[1.1] text-text-primary mb-2 neon-glow"
        style="animation-delay:0.1s"
      >
        {{ displayed }}<span class="animate-blink text-accent ml-0.5">_</span>
      </h1>

      <!-- Focus area -->
      <p class="animate-reveal text-lg text-text-secondary mt-3 mb-8" style="animation-delay:0.15s">
        Focused on <span class="text-accent font-medium">{{ personal.focus }}</span>
      </p>

      <!-- Summary -->
      <p
        class="animate-reveal max-w-xl text-base text-text-secondary leading-relaxed mb-10"
        style="animation-delay:0.2s"
      >
        {{ personal.summary }}
      </p>

      <!-- CTAs -->
      <div class="animate-reveal flex flex-wrap items-center gap-3 mb-12" style="animation-delay:0.25s">
        <a href="#projects" class="btn-primary group">
          View my work
          <Icon name="fluent:arrow-right-16-filled" size="14" class="group-hover:translate-x-0.5 transition-transform" />
        </a>
        <a :href="`mailto:${personal.email}`" class="btn-ghost">
          Get in touch
        </a>
      </div>

      <!-- Meta row -->
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

      <!-- Right: profile picture -->
      <div class="animate-reveal shrink-0 flex items-center justify-center" style="animation-delay:0.2s">
        <div class="group relative w-56 h-56 md:w-72 md:h-72">
          <!-- Ripple waves (visible on hover) -->
          <div class="absolute inset-0 rounded-full border border-accent/20 scale-100 opacity-0 group-hover:scale-125 group-hover:opacity-0 transition-all duration-700 ease-out" style="transition-delay: 0ms;" />
          <div class="absolute inset-0 rounded-full border border-accent/15 scale-100 opacity-0 group-hover:scale-150 group-hover:opacity-0 transition-all duration-700 ease-out" style="transition-delay: 150ms;" />
          <div class="absolute inset-0 rounded-full border border-accent/10 scale-100 opacity-0 group-hover:scale-[1.75] group-hover:opacity-0 transition-all duration-700 ease-out" style="transition-delay: 300ms;" />

          <!-- Outer cyan glow -->
          <div
            class="absolute -inset-6 rounded-full pointer-events-none transition-opacity duration-500 opacity-100 group-hover:opacity-60"
            style="background: radial-gradient(circle, rgb(var(--color-accent) / 0.2) 0%, transparent 70%); filter: blur(20px);"
          />
          <!-- Rotating dashed ring -->
          <div
            class="absolute -inset-3 rounded-full border border-dashed border-accent/20 animate-spin group-hover:border-accent/40 transition-colors duration-300"
            style="animation-duration: 18s;"
          />
          <!-- Static outer ring -->
          <div class="absolute -inset-1.5 rounded-full border border-accent/30 group-hover:border-accent/60 transition-colors duration-300" />
          <!-- Inner frame with shadow + zoom -->
          <div
            class="relative w-full h-full rounded-full overflow-hidden border-2 border-accent/50 group-hover:border-accent/80 transition-all duration-500"
            style="box-shadow: 0 0 0 4px rgb(var(--color-accent) / 0.08), 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgb(var(--color-accent) / 0.15);"
          >
            <img
              src="/images/ProfilePicture.png"
              alt="Ahmad Baihaqie"
              class="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
            />
            <!-- Vignette overlay -->
            <div
              class="absolute inset-0 rounded-full pointer-events-none"
              style="background: radial-gradient(circle at 50% 110%, rgba(0,0,0,0.35) 0%, transparent 65%);"
            />
          </div>
          <!-- Corner accent dots -->
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent/60 group-hover:bg-accent transition-colors duration-300" />
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent/60 group-hover:bg-accent transition-colors duration-300" />
        </div>
      </div>
    </div>

    <!-- Scroll cue -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
      <div
        class="w-px h-10 mx-auto animate-pulse"
        style="background: linear-gradient(to bottom, transparent, rgb(var(--color-accent) / 0.6));"
      />
    </div>
  </section>
</template>
