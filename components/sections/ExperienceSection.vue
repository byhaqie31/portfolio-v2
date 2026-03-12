<script setup lang="ts">
import { MapPin } from 'lucide-vue-next'
import { experiences as staticExperiences } from '~/data/index'

const { data: experiencesData } = await useFetch<any[]>('/api/experiences', {
  key: 'experiences',
  default: () => staticExperiences as any[],
})

const experiences = computed(() => {
  const data = experiencesData.value as any[]
  if (!data?.length) return staticExperiences
  return data.map((e: any) => ({
    id: e.slug || e.id,
    period: e.period,
    company: e.company,
    location: e.location,
    role: e.role,
    current: e.is_current || e.current,
    description: e.description,
    bullets: e.bullets || [],
    tags: e.tags || [],
  }))
})
</script>

<template>
  <section id="work" class="section">
    <hr class="section-divider mb-24 md:mb-32" />
    <div class="max-w-5xl mx-auto">
      <UiSectionHeading label="Experience" title="Where I've worked" />

      <!-- Work experience -->
      <div class="divide-y divide-accent/10 rounded border border-accent/10 bg-surface overflow-hidden mb-16">
        <div
          v-for="job in experiences"
          :key="job.id"
          class="reveal group flex flex-col md:flex-row gap-6 px-6 py-7 hover:bg-surface-raised transition-colors"
        >
          <!-- Left -->
          <div class="md:w-44 shrink-0">
            <p class="font-mono text-xs text-text-muted uppercase tracking-wider">{{ job.period }}</p>
            <span
              v-if="job.current"
              class="inline-block mt-1 font-mono text-2xs px-2 py-0.5 rounded border border-accent-tertiary/20 bg-accent-tertiary/5 text-accent-tertiary uppercase tracking-wider"
            >
              Current
            </span>
          </div>

          <!-- Right -->
          <div class="flex-1">
            <h3 class="font-display text-sm font-bold uppercase tracking-[0.05em] text-text-primary group-hover:text-accent transition-colors mb-0.5">
              {{ job.role }}
            </h3>
            <p class="text-sm text-text-secondary mb-1">{{ job.company }}</p>
            <p class="flex items-center gap-1 font-mono text-2xs text-text-muted mb-4 uppercase tracking-wider">
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

    </div>
  </section>
</template>
