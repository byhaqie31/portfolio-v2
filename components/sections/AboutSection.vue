<script setup lang="ts">
import { personal as staticPersonal, education as staticEducation } from '~/data/index'

const { data: personalData } = await usePersonal()

const { data: educationData } = await usePreviewableFetch<any[]>('education', '/api/education', {
  key: 'education',
  default: () => staticEducation as any[],
})

const bio = computed(() => {
  const d = personalData.value as any
  if (d?.bio_1) return [d.bio_1, d.bio_2].filter(Boolean)
  return staticPersonal.bio
})

const education = computed(() => {
  const data = educationData.value as any[]
  if (!data?.length) return staticEducation
  return data.map((e: any) => ({
    id: e.slug || e.id,
    period: e.period,
    institution: e.institution,
    location: e.location,
    degree: e.degree,
    cgpa: e.cgpa,
  }))
})
</script>

<template>
  <section id="about" class="section">
    <hr class="section-divider mb-24 md:mb-32" />
    <div class="max-w-5xl mx-auto">
      <div class="grid md:grid-cols-2 gap-16 items-start">
        <!-- Left: bio -->
        <div>
          <UiSectionHeading label="About" title="A bit about me" />

          <div class="space-y-4 text-text-secondary leading-relaxed reveal">
            <p v-for="(paragraph, i) in bio" :key="i">{{ paragraph }}</p>
          </div>
        </div>

        <!-- Right: academic background -->
        <div class="reveal reveal-delay-2">
          <UiSectionHeading label="Academic" title="Where I study" />
          <div class="divide-y divide-accent/10 rounded border border-accent/10 bg-surface overflow-hidden">
            <div
              v-for="edu in education"
              :key="edu.id"
              class="flex flex-col gap-3 px-5 py-5 hover:bg-surface-raised transition-colors"
            >
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-sm font-semibold text-text-primary leading-snug">{{ edu.degree }}</h3>
                <span
                  class="font-mono text-2xs px-2 py-0.5 rounded border shrink-0 uppercase tracking-wider"
                  :class="edu.cgpa === 'In Progress'
                    ? 'border-emerald-600/20 bg-emerald-600/5 text-emerald-600 dark:border-accent-tertiary/20 dark:bg-accent-tertiary/5 dark:text-accent-tertiary'
                    : 'border-accent/20 bg-accent/5 text-accent'"
                >
                  {{ edu.cgpa === 'In Progress' ? 'In Progress' : `CGPA ${edu.cgpa}` }}
                </span>
              </div>
              <p class="text-sm text-text-secondary">{{ edu.institution }}</p>
              <p class="flex items-center gap-1 font-mono text-2xs text-text-muted uppercase tracking-wider">
                <Icon name="fluent:location-16-filled" size="10" />{{ edu.location }} · {{ edu.period }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
