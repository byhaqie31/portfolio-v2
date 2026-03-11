<script setup lang="ts">
import { ArrowUpRight, Github } from 'lucide-vue-next'
import { projects } from '~/data/index'

const featured = computed(() => projects.filter((p) => p.featured))
const others = computed(() => projects.filter((p) => !p.featured))

const statusLabel: Record<string, string> = {
  live: 'Live',
  wip: 'In progress',
  archived: 'Archived',
}

const statusColor: Record<string, string> = {
  live: 'text-green-400',
  wip: 'text-yellow-400',
  archived: 'text-text-muted',
}
</script>

<template>
  <section id="work" class="section">
    <div class="max-w-5xl mx-auto">
      <UiSectionHeading
        label="Selected Work"
        title="Things I've built"
        description="A selection of projects I've shipped — from SaaS products to developer tools."
      />

      <!-- Featured grid -->
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <UiProjectCard
          v-for="project in featured"
          :key="project.title"
          :project="project"
          class="reveal"
        />
      </div>

      <!-- Other projects — compact list -->
      <div v-if="others.length" class="mt-8 reveal">
        <p class="font-mono text-2xs text-text-muted uppercase tracking-widest mb-4">More projects</p>
        <div class="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
          <div
            v-for="project in others"
            :key="project.title"
            class="group flex items-center justify-between px-5 py-4 hover:bg-surface-raised transition-colors"
          >
            <div>
              <span class="text-sm font-medium text-text-primary group-hover:text-white transition-colors">
                {{ project.title }}
              </span>
              <div class="flex items-center gap-3 mt-0.5">
                <span
                  v-if="project.status"
                  class="font-mono text-2xs"
                  :class="statusColor[project.status]"
                >
                  {{ statusLabel[project.status] }}
                </span>
                <div class="flex gap-1.5">
                  <span v-for="s in project.stack" :key="s" class="font-mono text-2xs text-text-muted">
                    {{ s }}
                  </span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <a
                v-if="project.github"
                :href="project.github"
                target="_blank"
                class="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Github :size="13" />
              </a>
              <a
                v-if="project.href"
                :href="project.href"
                target="_blank"
                class="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowUpRight :size="13" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
