<script setup lang="ts">
import { references } from '~/data/index'
</script>

<template>
  <section id="references" class="section">
    <hr class="section-divider mb-24 md:mb-32" />
    <div class="max-w-5xl mx-auto">
      <UiSectionHeading
        label="Transmissions"
        title="What people say"
        description="Feedback and references from those I've worked with."
      />

      <div class="grid md:grid-cols-2 gap-4">
        <div
          v-for="ref in references"
          :key="ref.name"
          class="reveal card-hover relative overflow-hidden"
        >
          <!-- Corner accent -->
          <div class="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent/20" />

          <!-- Quote -->
          <div class="mb-5">
            <p class="text-text-secondary leading-relaxed text-sm italic">
              "Reference quote or feedback from {{ ref.name }} will appear here."
            </p>
          </div>

          <div class="pt-4 border-t border-accent/10 flex items-start gap-3">
            <!-- Avatar initial -->
            <div class="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <span class="font-mono text-xs text-accent font-semibold">
                {{ ref.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium text-text-primary">{{ ref.name }}</p>
              <p class="font-mono text-2xs text-text-muted uppercase tracking-wider">{{ ref.title }}</p>
              <p class="font-mono text-2xs text-text-muted uppercase tracking-wider">{{ ref.company }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
