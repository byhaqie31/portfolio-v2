<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import type { Project } from '~/data/index'

defineProps<{ project: Project }>()
</script>

<template>
  <article class="group card-hover reveal flex flex-col h-full">
    <!-- Tag + links -->
    <div class="flex items-center justify-between mb-5">
      <span class="font-mono text-2xs text-accent uppercase tracking-wider">{{ project.tag }}</span>
      <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          v-if="project.github"
          :href="project.github"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-icon"
          aria-label="View on GitHub"
        >
          <UiIconGithub class="w-3.5 h-3.5" />
        </a>
        <a
          v-if="project.href && project.href !== '#'"
          :href="project.href"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-icon"
          aria-label="Open project"
        >
          <ArrowUpRight :size="14" />
        </a>
      </div>
    </div>

    <!-- Name -->
    <h3 class="text-base font-semibold text-text-primary group-hover:text-white transition-colors mb-2 leading-snug">
      {{ project.name }}
    </h3>

    <!-- Description -->
    <p class="text-sm text-text-secondary leading-relaxed flex-1 mb-5">
      {{ project.description }}
    </p>

    <!-- Metrics (if any) -->
    <div v-if="project.metrics?.length" class="flex gap-4 mb-5 py-3 border-t border-border">
      <div v-for="m in project.metrics" :key="m.label" class="text-center">
        <p class="font-mono text-base font-semibold text-accent">{{ m.value }}</p>
        <p class="font-mono text-2xs text-text-muted mt-0.5">{{ m.label }}</p>
      </div>
    </div>

    <!-- Stack -->
    <div class="flex flex-wrap gap-1.5">
      <span v-for="s in project.stack" :key="s" class="stack-pill">{{ s }}</span>
    </div>
  </article>
</template>
