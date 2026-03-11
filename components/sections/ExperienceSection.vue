<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
import { experiences, education } from '~/data/index'
</script>

<template>
  <section id="experience" class="section border-t border-border">
    <div class="max-w-5xl mx-auto">
      <UiSectionHeading label="Experience" title="Where I've worked" />

      <!-- Work experience -->
      <div class="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden mb-16">
        <div
          v-for="job in experiences"
          :key="job.id"
          class="reveal group flex flex-col md:flex-row gap-6 px-6 py-7 hover:bg-surface-raised transition-colors"
        >
          <!-- Left -->
          <div class="md:w-44 shrink-0">
            <p class="font-mono text-xs text-text-muted">{{ job.period }}</p>
            <span
              v-if="job.current"
              class="inline-block mt-1 font-mono text-2xs px-2 py-0.5 rounded border border-green-400/20 bg-green-400/5 text-green-400"
            >
              Current
            </span>
          </div>

          <!-- Right -->
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-text-primary group-hover:text-white transition-colors mb-0.5">
              {{ job.role }}
            </h3>
            <p class="text-sm text-text-secondary mb-1">{{ job.company }}</p>
            <p class="flex items-center gap-1 font-mono text-2xs text-text-muted mb-4">
              <MapPin :size="10" />{{ job.location }}
            </p>

            <!-- Bullets -->
            <ul class="space-y-2 mb-4">
              <li
                v-for="bullet in job.bullets"
                :key="bullet"
                class="text-sm text-text-secondary leading-relaxed pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-px before:bg-accent/40"
              >
                {{ bullet }}
              </li>
            </ul>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1.5">
              <span v-for="tag in job.tags" :key="tag" class="stack-pill">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Education -->
      <UiSectionHeading label="Education" title="Academic background" />
      <div class="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
        <div
          v-for="edu in education"
          :key="edu.id"
          class="reveal flex flex-col md:flex-row gap-6 px-6 py-6 hover:bg-surface-raised transition-colors"
        >
          <div class="md:w-44 shrink-0">
            <p class="font-mono text-xs text-text-muted">{{ edu.period }}</p>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-text-primary mb-0.5">{{ edu.degree }}</h3>
            <p class="text-sm text-text-secondary mb-1">{{ edu.institution }}</p>
            <p class="flex items-center gap-1 font-mono text-2xs text-text-muted mb-2">
              <MapPin :size="10" />{{ edu.location }}
            </p>
            <span class="font-mono text-2xs px-2 py-0.5 rounded border border-accent/20 bg-accent/5 text-accent">
              CGPA {{ edu.cgpa }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
