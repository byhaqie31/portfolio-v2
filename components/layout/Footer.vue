<script setup lang="ts">
import { Github, Linkedin, Mail } from 'lucide-vue-next'
import { personal } from '~/data/index'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border px-6 py-12">
    <div class="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
      <!-- Left -->
      <div>
        <p class="font-mono text-sm text-text-primary mb-1">
          {{ personal.name.split(' ')[0].toLowerCase() }}<span class="text-accent">.</span>
        </p>
        <p class="text-xs text-text-muted">
          © {{ year }} — Built with Nuxt & Tailwind CSS
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
          <Github :size="15" />
        </a>
        <a
          :href="personal.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-icon"
          aria-label="LinkedIn"
        >
          <Linkedin :size="15" />
        </a>
        <a
          :href="`mailto:${personal.email}`"
          class="btn-icon"
          aria-label="Email"
        >
          <Mail :size="15" />
        </a>
      </div>
    </div>
  </footer>
</template>
