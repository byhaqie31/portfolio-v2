<script setup lang="ts">
import { ArrowRight, Github, Linkedin } from 'lucide-vue-next'
import { personal } from '~/data/portfolio'
</script>

<template>
  <section class="relative min-h-screen flex items-center px-6 pt-14 overflow-hidden">
    <!-- Subtle grid background -->
    <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

    <!-- Radial glow -->
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />

    <div class="relative max-w-5xl mx-auto w-full py-24 md:py-32">
      <!-- Status badge -->
      <div class="animate-fade-in inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface-2 text-xs text-text-secondary mb-8">
        <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Open to opportunities
      </div>

      <!-- Headline -->
      <h1 class="animate-fade-up text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.1] text-gradient mb-6" style="animation-delay: 0.05s">
        {{ personal.tagline }}
      </h1>

      <!-- Sub-headline -->
      <p class="animate-fade-up max-w-xl text-base md:text-lg text-text-secondary leading-relaxed mb-10" style="animation-delay: 0.1s">
        {{ personal.description }}
      </p>

      <!-- CTAs -->
      <div class="animate-fade-up flex flex-wrap items-center gap-3" style="animation-delay: 0.15s">
        <a
          href="#projects"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-white text-black text-sm font-medium hover:bg-white/90 transition-all group"
        >
          View my work
          <ArrowRight :size="14" class="group-hover:translate-x-0.5 transition-transform" />
        </a>

        <a
          href="#contact"
          class="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border text-text-secondary text-sm hover:text-text-primary hover:border-white/20 transition-all"
        >
          Get in touch
        </a>
      </div>

      <!-- Social links -->
      <div class="animate-fade-up flex items-center gap-4 mt-12" style="animation-delay: 0.2s">
        <a
          :href="personal.github"
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-muted hover:text-text-secondary transition-colors"
          aria-label="GitHub"
        >
          <Github :size="18" />
        </a>
        <a
          :href="personal.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="text-text-muted hover:text-text-secondary transition-colors"
          aria-label="LinkedIn"
        >
          <Linkedin :size="18" />
        </a>
        <span class="w-px h-4 bg-border" />
        <span class="font-mono text-xs text-text-muted">{{ personal.location }}</span>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-text-muted animate-bounce">
      <div class="w-px h-8 bg-gradient-to-b from-transparent to-border" />
    </div>
  </section>
</template>
