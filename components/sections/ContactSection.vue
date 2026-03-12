<script setup lang="ts">
import { Mail, ArrowRight } from 'lucide-vue-next'
import { personal } from '~/data/index'
</script>

<template>
  <section id="contact" class="section">
    <hr class="section-divider mb-24 md:mb-32" />
    <div class="max-w-5xl mx-auto">
      <div class="max-w-2xl reveal">
        <div class="flex items-center gap-3 mb-4">
          <span class="font-mono text-2xs text-accent uppercase tracking-[0.3em] border border-accent/20 px-2.5 py-1 rounded">
            Contact
          </span>
          <div class="flex-1 h-px" style="background: linear-gradient(to right, rgb(var(--color-accent) / 0.3), transparent);" />
        </div>

        <h2 class="font-display text-2xl md:text-3xl font-bold tracking-[0.05em] uppercase text-text-primary mb-4">
          Let's build something
          <span class="text-accent neon-glow">together.</span>
        </h2>

        <p class="text-text-secondary leading-relaxed mb-10">
          I'm always open to interesting projects, collaborations, or just a good conversation.
          Reach out — I usually respond within a day.
        </p>

        <!-- Primary CTA -->
        <a
          :href="`mailto:${personal.email}`"
          class="btn-primary inline-flex group mb-8"
        >
          <Mail :size="15" />
          {{ personal.email }}
          <ArrowRight :size="14" class="ml-1 group-hover:translate-x-0.5 transition-transform" />
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
