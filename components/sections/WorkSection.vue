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

// First featured project leads visually; everything else (including
// remaining featured) becomes a compact list — no more identical card grids.
const lead = computed(() => projects.value.find((p) => p.featured))
const rest = computed(() => projects.value.filter((p) => p.id !== lead.value?.id))
</script>

<template>
  <section id="projects" class="section">
    <div class="max-w-6xl mx-auto">
      <UiSectionHeading
        label="Selected Work"
        title="Things I've built"
        description="A selection of projects I've shipped, from fintech portals to full-stack web apps."
      />

      <!-- Lead project — enlarged editorial card -->
      <article v-if="lead" class="reveal group mb-12">
        <p class="text-sm text-accent font-medium mb-3">{{ lead.tag }}</p>
        <h3 class="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary mb-4 leading-tight">
          {{ lead.name }}
        </h3>
        <p class="text-lg text-text-secondary leading-relaxed max-w-3xl mb-6 line-clamp-4">
          {{ lead.description }}
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex flex-wrap gap-1.5">
            <span v-for="s in lead.stack" :key="s" class="stack-pill">{{ s }}</span>
          </div>
          <div class="flex items-center gap-1">
            <a
              v-if="lead.github"
              :href="lead.github"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-icon"
              aria-label="View on GitHub"
            >
              <UiIconGithub class="w-3.5 h-3.5" />
            </a>
            <a
              v-if="lead.href && lead.href !== '#'"
              :href="lead.href"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-icon"
              aria-label="Open project"
            >
              <Icon name="fluent:arrow-up-right-16-filled" size="14" />
            </a>
          </div>
        </div>
      </article>

      <!-- Other projects — editorial list, no card chrome -->
      <div v-if="rest.length" class="reveal">
        <p class="text-sm text-text-muted font-medium mb-6">More projects</p>
        <ul class="divide-y divide-border-subtle border-y border-border-subtle">
          <li
            v-for="project in rest"
            :key="project.id"
            class="group flex items-center justify-between gap-4 py-5"
          >
            <div class="min-w-0 flex-1">
              <div class="flex items-baseline gap-3 mb-1 flex-wrap">
                <h4 class="text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                  {{ project.name }}
                </h4>
                <span class="text-sm text-accent shrink-0">{{ project.tag }}</span>
              </div>
              <p class="text-sm text-text-secondary line-clamp-2">{{ project.description }}</p>
              <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                <span v-for="s in project.stack.slice(0, 4)" :key="s">{{ s }}</span>
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
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
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
