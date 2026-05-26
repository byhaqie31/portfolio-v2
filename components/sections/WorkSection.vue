<script setup lang="ts">
import { projects as staticProjects } from '~/data/index'

const { data: projectsData } = await usePreviewableFetch<any[]>('projects', '/api/projects', {
  key: 'projects',
  default: () => staticProjects as any[],
})

const projects = computed(() => {
  const data = projectsData.value as any[]
  if (!data?.length) return staticProjects
  return data.map((p: any) => ({
    id: p.slug || p.id,
    tag: p.tag,
    featured: !!p.featured,
    name: p.name,
    description: p.description,
    stack: p.stack || [],
    metrics: p.metrics,
    href: p.href,
    github: p.github_url || p.github,
  }))
})

const featured = computed(() => projects.value.filter((p) => p.featured))
const others = computed(() => projects.value.filter((p) => !p.featured))
</script>

<template>
  <section id="projects" class="section">
    <div class="max-w-6xl mx-auto">
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
      <div v-if="others.length" class="mt-12 reveal">
        <p class="text-sm text-text-muted font-medium mb-4">More projects</p>
        <div class="divide-y divide-border-subtle rounded-2xl border border-border/60 bg-surface overflow-hidden">
          <div
            v-for="project in others"
            :key="project.id"
            class="group flex items-center justify-between px-6 py-4 hover:bg-surface-raised transition-colors"
          >
            <div>
              <span class="text-base font-medium text-text-primary group-hover:text-accent transition-colors">
                {{ project.name }}
              </span>
              <div class="flex items-center gap-3 mt-1 text-sm text-text-muted">
                <span class="text-accent">{{ project.tag }}</span>
                <span v-for="s in project.stack.slice(0, 3)" :key="s">
                  {{ s }}
                </span>
              </div>
            </div>
            <a
              v-if="project.href"
              :href="project.href"
              target="_blank"
              class="btn-icon opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon name="fluent:arrow-up-right-16-filled" size="13" />
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
