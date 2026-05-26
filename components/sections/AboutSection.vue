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
    <div class="max-w-6xl mx-auto">
      <div class="grid md:grid-cols-2 gap-16 items-start">
        <!-- Left: bio -->
        <div>
          <UiSectionHeading label="About" title="A bit about me" />

          <div class="space-y-4 text-text-secondary leading-relaxed reveal">
            <p v-for="(paragraph, i) in bio" :key="i">{{ paragraph }}</p>
          </div>
        </div>

        <!-- Right: academic background -->
        <div class="reveal">
          <UiSectionHeading label="Academic" title="Education" />
          <div class="divide-y divide-border-subtle rounded-2xl border border-border/60 bg-surface overflow-hidden">
            <div
              v-for="edu in education"
              :key="edu.id"
              class="flex flex-col gap-3 px-6 py-5 hover:bg-surface-raised transition-colors"
            >
              <div class="flex items-start justify-between gap-2">
                <h3 class="text-base font-semibold text-text-primary leading-snug">{{ edu.degree }}</h3>
                <span
                  class="text-xs px-2.5 py-1 rounded-full shrink-0"
                  :class="edu.cgpa === 'In Progress'
                    ? 'bg-accent-tertiary/10 text-accent-tertiary'
                    : 'bg-accent/10 text-accent'"
                >
                  {{ edu.cgpa === 'In Progress' ? 'In progress' : `CGPA ${edu.cgpa}` }}
                </span>
              </div>
              <p class="text-sm text-text-secondary">{{ edu.institution }}</p>
              <p class="flex items-center gap-1.5 text-sm text-text-muted">
                <Icon name="fluent:location-16-filled" size="12" />{{ edu.location }} · {{ edu.period }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
