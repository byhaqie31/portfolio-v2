<script setup lang="ts">
import { references } from '~/data/index'
</script>

<template>
  <section id="references" class="section border-t border-border">
    <div class="max-w-5xl mx-auto">
      <UiSectionHeading
        label="References"
        title="What people say"
        description="Feedback and references from those I've worked with."
      />

      <div class="grid md:grid-cols-2 gap-4">
        <div
          v-for="ref in references"
          :key="ref.name"
          class="reveal card-hover"
        >
          <!-- Quote placeholder — replace with actual testimonial text -->
          <div class="mb-5">
            <p class="font-serif italic text-text-secondary leading-relaxed text-sm">
              "Reference quote or feedback from {{ ref.name }} will appear here."
            </p>
          </div>

          <div class="pt-4 border-t border-border flex items-start gap-3">
            <!-- Avatar initial -->
            <div class="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <span class="font-mono text-xs text-accent font-semibold">
                {{ ref.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium text-text-primary">{{ ref.name }}</p>
              <p class="text-xs text-text-muted">{{ ref.title }}</p>
              <p class="text-xs text-text-muted">{{ ref.company }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
