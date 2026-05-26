<script setup lang="ts">
import { experiences as staticExperiences } from '~/data/index'

const { data: experiencesData } = await usePreviewableFetch<any[]>('experiences', '/api/experiences', {
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
      <div class="divide-y divide-border-subtle rounded-2xl border border-border/60 bg-surface overflow-hidden mb-16">
        <div
          v-for="job in experiences"
          :key="job.id"
          class="reveal group flex flex-col md:flex-row gap-6 px-6 py-7 hover:bg-surface-raised transition-colors"
        >
          <!-- Left -->
          <div class="md:w-44 shrink-0">
            <p class="text-sm text-text-muted">{{ job.period }}</p>
            <span
              v-if="job.current"
              class="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-accent-tertiary/10 text-accent-tertiary"
            >
              Current
            </span>
          </div>

          <!-- Right -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-text-primary mb-0.5 leading-snug">
              {{ job.role }}
            </h3>
            <p class="text-base text-text-secondary mb-1">{{ job.company }}</p>
            <p class="flex items-center gap-1.5 text-sm text-text-muted mb-4">
              <Icon name="fluent:location-16-filled" size="12" />{{ job.location }}
            </p>

            <!-- Bullets -->
            <ul class="space-y-2 mb-4">
              <li
                v-for="bullet in job.bullets"
                :key="bullet"
                class="text-base text-text-secondary leading-relaxed pl-4 relative before:absolute before:left-0 before:top-[0.7em] before:w-1.5 before:h-px before:bg-text-muted/40"
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
