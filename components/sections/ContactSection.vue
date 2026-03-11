<script setup lang="ts">
import { Mail, ArrowRight } from 'lucide-vue-next'
import { personal } from '~/data/index'
</script>

<template>
  <section id="contact" class="section border-t border-border">
    <div class="max-w-5xl mx-auto">
      <div class="max-w-2xl reveal">
        <p class="font-mono text-2xs text-accent uppercase tracking-widest mb-4">Contact</p>

        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
          Let's build something
          <span class="font-serif italic text-text-secondary">together.</span>
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
