<script setup lang="ts">
import { experience } from '~/data/index'
</script>

<template>
  <section id="experience" class="section border-t border-border">
    <div class="max-w-5xl mx-auto">
      <UiSectionHeading
        label="Experience"
        title="Where I've worked"
      />

      <div class="space-y-0 divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
        <div
          v-for="job in experience"
          :key="job.company"
          class="reveal group flex flex-col md:flex-row gap-6 px-6 py-6 hover:bg-surface-raised transition-colors"
        >
          <!-- Left: period -->
          <div class="md:w-40 shrink-0">
            <p class="font-mono text-xs text-text-muted">{{ job.period }}</p>
            <span
              v-if="job.current"
              class="inline-block mt-1 font-mono text-2xs px-2 py-0.5 rounded border border-green-400/20 bg-green-400/5 text-green-400"
            >
              Current
            </span>
          </div>

          <!-- Right: details -->
          <div class="flex-1">
            <div class="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 class="text-sm font-semibold text-text-primary group-hover:text-white transition-colors">
                  {{ job.role }}
                </h3>
                <p class="text-sm text-text-secondary">{{ job.company }}</p>
              </div>
            </div>
            <p class="text-sm text-text-secondary leading-relaxed mb-4">
              {{ job.description }}
            </p>
            <div class="flex flex-wrap gap-1.5">
              <span v-for="s in job.stack" :key="s" class="stack-pill">{{ s }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
