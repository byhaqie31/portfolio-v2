<script setup lang="ts">
import { ArrowUpRight, Github } from 'lucide-vue-next'
import { projects } from '~/data/portfolio'

const featured = computed(() => projects.filter((p) => p.featured))
const others = computed(() => projects.filter((p) => !p.featured))
</script>

<template>
  <section id="projects" class="px-6 py-24 md:py-32">
    <div class="max-w-5xl mx-auto">
      <!-- Section header -->
      <div class="mb-16">
        <p class="font-mono text-xs text-text-muted uppercase tracking-widest mb-3">Selected Work</p>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
          Things I've built
        </h2>
      </div>

      <!-- Featured projects -->
      <div class="grid md:grid-cols-2 gap-4 mb-4">
        <article
          v-for="project in featured"
          :key="project.title"
          class="group relative p-6 rounded-xl border border-border bg-surface-1 hover:border-white/15 hover:bg-surface-2 transition-all duration-300"
        >
          <!-- Top row -->
          <div class="flex items-start justify-between mb-4">
            <div class="w-8 h-8 rounded-md border border-border bg-surface-2 flex items-center justify-center">
              <div class="w-3 h-3 rounded-sm bg-text-muted group-hover:bg-text-secondary transition-colors" />
            </div>
            <div class="flex items-center gap-2">
              <a
                v-if="project.github"
                :href="project.github"
                target="_blank"
                rel="noopener noreferrer"
                class="text-text-muted hover:text-text-secondary transition-colors"
                aria-label="View source"
              >
                <Github :size="16" />
              </a>
              <a
                v-if="project.href"
                :href="project.href"
                target="_blank"
                rel="noopener noreferrer"
                class="text-text-muted hover:text-text-secondary transition-colors"
                aria-label="Open project"
              >
                <ArrowUpRight :size="16" />
              </a>
            </div>
          </div>

          <!-- Content -->
          <h3 class="text-base font-medium text-text-primary mb-2 group-hover:text-white transition-colors">
            {{ project.title }}
          </h3>
          <p class="text-sm text-text-secondary leading-relaxed mb-5">
            {{ project.description }}
          </p>

          <!-- Tags -->
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in project.tags"
              :key="tag"
              class="font-mono text-xs px-2 py-0.5 rounded border border-border text-text-muted bg-surface"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </div>

      <!-- Other projects (compact list) -->
      <div v-if="others.length" class="mt-8">
        <p class="text-xs text-text-muted mb-4 uppercase tracking-widest font-mono">More projects</p>
        <div class="divide-y divide-border rounded-xl border border-border bg-surface-1 overflow-hidden">
          <div
            v-for="project in others"
            :key="project.title"
            class="group flex items-center justify-between px-5 py-4 hover:bg-surface-2 transition-colors"
          >
            <div>
              <span class="text-sm font-medium text-text-primary group-hover:text-white transition-colors">
                {{ project.title }}
              </span>
              <div class="flex gap-2 mt-1">
                <span
                  v-for="tag in project.tags"
                  :key="tag"
                  class="font-mono text-xs text-text-muted"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <a
                v-if="project.github"
                :href="project.github"
                target="_blank"
                class="text-text-muted hover:text-text-secondary transition-colors"
              >
                <Github :size="15" />
              </a>
              <a
                v-if="project.href"
                :href="project.href"
                target="_blank"
                class="text-text-muted hover:text-text-secondary transition-colors"
              >
                <ArrowUpRight :size="15" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
