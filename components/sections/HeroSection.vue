<script setup lang="ts">
import { ArrowRight, Globe, MapPin } from 'lucide-vue-next'
import { personal } from '~/data/index'

// Typewriter for the role
const displayed = ref('')
const target = personal.role
let i = 0

onMounted(() => {
  const timer = setInterval(() => {
    displayed.value += target[i]
    i++
    if (i >= target.length) clearInterval(timer)
  }, 50)
})
</script>

<template>
  <section class="relative min-h-screen flex items-center px-6 pt-14 overflow-hidden">
    <!-- Dot grid -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 28px 28px;"
    />
    <!-- Gold glow -->
    <div
      class="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(200,169,126,0.05) 0%, transparent 70%); filter: blur(60px);"
    />

    <div class="relative max-w-5xl mx-auto w-full py-24 md:py-36">
      <!-- Availability badge -->
      <div
        class="animate-reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-xs text-accent mb-10"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Available for {{ personal.availableFor }}
      </div>

      <!-- Name -->
      <p class="animate-reveal font-mono text-sm text-text-muted mb-3" style="animation-delay:0.05s">
        {{ personal.name }}
      </p>

      <!-- Role — typewriter -->
      <h1
        class="animate-reveal text-4xl sm:text-5xl md:text-[3.25rem] font-semibold tracking-tight leading-[1.1] text-text-primary mb-2"
        style="animation-delay:0.1s"
      >
        {{ displayed }}<span class="animate-blink text-accent ml-0.5">|</span>
      </h1>

      <!-- Focus area -->
      <p class="animate-reveal font-serif text-lg text-text-secondary italic mt-3 mb-8" style="animation-delay:0.15s">
        Focused on {{ personal.focus }}
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
        <a href="#work" class="btn-primary group">
          View my work
          <ArrowRight :size="14" class="group-hover:translate-x-0.5 transition-transform" />
        </a>
        <a :href="`mailto:${personal.email}`" class="btn-ghost">
          Get in touch
        </a>
      </div>

      <!-- Meta row -->
      <div class="animate-reveal flex flex-wrap items-center gap-5" style="animation-delay:0.3s">
        <span class="flex items-center gap-1.5 text-xs text-text-muted">
          <MapPin :size="12" />
          {{ personal.location }}
        </span>
        <span class="w-px h-3 bg-border" />
        <a
          :href="personal.website"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <Globe :size="12" />
          baihaqie.com
        </a>
      </div>
    </div>

    <!-- Scroll cue -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
      <div class="w-px h-10 bg-gradient-to-b from-border/0 to-border/60 mx-auto animate-pulse" />
    </div>
  </section>
</template>
