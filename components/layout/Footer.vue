<script setup lang="ts">
import { personal } from '~/data/index'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="px-6 py-12">
    <hr class="section-divider mb-12" />
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <!-- Left -->
      <div>
        <p class="font-display text-sm font-bold tracking-[0.15em] uppercase text-text-primary mb-1">
          ahmad<span class="text-accent">.baihaqie</span>
        </p>
        <p class="font-mono text-2xs text-text-muted uppercase tracking-wider">
          &copy; {{ year }} &mdash; Built with Nuxt & Tailwind CSS
        </p>
      </div>

      <!-- Links -->
      <div class="flex items-center gap-3">
        <a
          :href="personal.github"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-icon"
          aria-label="GitHub"
        >
          <UiIconGithub :size="15" />
        </a>
        <a
          :href="personal.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-icon"
          aria-label="LinkedIn"
        >
          <UiIconLinkedin :size="15" />
        </a>
        <a
          :href="`mailto:${personal.email}`"
          class="btn-icon"
          aria-label="Email"
        >
          <Icon name="fluent:mail-16-filled" size="15" />
        </a>
      </div>
    </div>
  </footer>
</template>
