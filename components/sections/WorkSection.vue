<script setup lang="ts">
import { ArrowUpRight } from 'lucide-vue-next'
import { projects } from '~/data/index'

const featured = computed(() => projects.filter((p) => p.featured))
const others = computed(() => projects.filter((p) => !p.featured))
</script>

<template>
  <section id="projects" class="section">
    <div class="max-w-5xl mx-auto">
      <UiSectionHeading
        label="Project Registry"
        title="Things I've built"
        description="A selection of projects I've shipped — from fintech portals to full-stack web apps."
      />

      <!-- Featured grid -->
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <UiProjectCard
          v-for="project in featured"
          :key="project.id"
          :project="project"
          class="reveal"
        />
      </div>

      <!-- Other projects — compact list -->
      <div v-if="others.length" class="mt-8 reveal">
        <div class="flex items-center gap-3 mb-4">
          <span class="font-mono text-2xs text-text-muted uppercase tracking-[0.25em]">More projects</span>
          <div class="flex-1 h-px" style="background: linear-gradient(to right, rgb(var(--color-border) / 0.2), transparent);" />
        </div>
        <div class="divide-y divide-accent/10 rounded border border-accent/10 bg-surface overflow-hidden">
          <div
            v-for="project in others"
            :key="project.id"
            class="group flex items-center justify-between px-5 py-4 hover:bg-surface-raised transition-colors"
          >
            <div>
              <span class="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                {{ project.name }}
              </span>
              <div class="flex items-center gap-3 mt-0.5">
                <span class="font-mono text-2xs text-accent uppercase tracking-wider">{{ project.tag }}</span>
                <div class="flex gap-2">
                  <span v-for="s in project.stack.slice(0, 3)" :key="s" class="font-mono text-2xs text-text-muted">
                    {{ s }}
                  </span>
                </div>
              </div>
            </div>
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
  </section>
</template>
