<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
import { personal, education } from '~/data/index'
</script>

<template>
  <section id="about" class="section border-t border-border">
    <div class="max-w-5xl mx-auto">
      <div class="grid md:grid-cols-2 gap-16 items-start">
        <!-- Left: bio -->
        <div>
          <UiSectionHeading label="About" title="A bit about me" />

          <div class="space-y-4 text-text-secondary leading-relaxed reveal">
            <p v-for="(paragraph, i) in personal.bio" :key="i">{{ paragraph }}</p>
          </div>
        </div>

        <!-- Right: academic background -->
        <div class="reveal reveal-delay-2">
          <UiSectionHeading label="Academic Background" title="Where I study" />
          <div class="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
            <div
              v-for="edu in education"
              :key="edu.id"
              class="flex flex-col gap-3 px-5 py-5 hover:bg-surface-raised transition-colors"
            >
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-sm font-semibold text-text-primary leading-snug">{{ edu.degree }}</h3>
                <span
                  class="font-mono text-2xs px-2 py-0.5 rounded border shrink-0"
                  :class="edu.cgpa === 'In Progress'
                    ? 'border-green-400/20 bg-green-400/5 text-green-400'
                    : 'border-accent/20 bg-accent/5 text-accent'"
                >
                  {{ edu.cgpa === 'In Progress' ? 'In Progress' : `CGPA ${edu.cgpa}` }}
                </span>
              </div>
              <p class="text-sm text-text-secondary">{{ edu.institution }}</p>
              <p class="flex items-center gap-1 font-mono text-2xs text-text-muted">
                <MapPin :size="10" />{{ edu.location }} · {{ edu.period }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
