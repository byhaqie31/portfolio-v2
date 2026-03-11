<script setup lang="ts">
import { ArrowUpRight, Github } from 'lucide-vue-next'
import type { Project } from '~/data/index'

defineProps<{ project: Project }>()

const statusColor: Record<string, string> = {
  live: 'bg-green-500',
  wip: 'bg-yellow-500',
  archived: 'bg-text-muted',
}
</script>

<template>
  <article class="group card-hover reveal flex flex-col h-full">
    <!-- Header -->
    <div class="flex items-start justify-between mb-5">
      <div class="flex items-center gap-2">
        <span
          v-if="project.status"
          class="w-1.5 h-1.5 rounded-full"
          :class="statusColor[project.status] ?? 'bg-text-muted'"
        />
        <span class="font-mono text-2xs text-text-muted">{{ project.year }}</span>
      </div>
      <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <a
          v-if="project.github"
          :href="project.github"
          target="_blank"
          rel="noopener noreferrer"
          class="btn-icon"
          aria-label="Source code"
        >
          <Github :size="14" />
        </a>
        <a
          v-if="project.href"
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

    <!-- Content -->
    <h3 class="text-base font-semibold text-text-primary group-hover:text-white transition-colors mb-2">
      {{ project.title }}
    </h3>
    <p class="text-sm text-text-secondary leading-relaxed flex-1 mb-5">
      {{ project.description }}
    </p>

    <!-- Stack -->
    <div class="flex flex-wrap gap-1.5">
      <span v-for="s in project.stack" :key="s" class="stack-pill">
        {{ s }}
      </span>
    </div>
  </article>
</template>
