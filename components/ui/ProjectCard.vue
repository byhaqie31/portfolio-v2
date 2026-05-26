<script setup lang="ts">
import type { Project } from '~/data/index'

defineProps<{ project: Project }>()
</script>

<template>
  <article class="group card-hover reveal flex flex-col h-full">
    <div class="flex items-center justify-between mb-5">
      <span class="font-mono text-2xs text-accent uppercase tracking-[0.2em]">{{ project.tag }}</span>
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
          <Icon name="fluent:arrow-up-right-16-filled" size="14" />
        </a>
      </div>
    </div>

    <h3 class="font-display text-sm font-bold uppercase tracking-[0.05em] text-text-primary group-hover:text-accent transition-colors mb-2 leading-snug">
      {{ project.name }}
    </h3>

    <p class="text-sm text-text-secondary leading-relaxed flex-1 mb-5">
      {{ project.description }}
    </p>

    <div class="flex flex-wrap gap-1.5">
      <span v-for="s in project.stack" :key="s" class="stack-pill">{{ s }}</span>
    </div>
  </article>
</template>
