<script setup lang="ts">
import { education as staticEducation } from '~/data/index'

const { data: educationData } = await usePreviewableFetch<any[]>('education', '/api/education', {
  key: 'education',
  default: () => staticEducation as any[],
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
  <section id="education" class="section">
    <div class="max-w-6xl mx-auto">
      <UiSectionHeading label="Education" title="Academic background." />

      <!-- Timeline list — mirrors the experience layout -->
      <div class="divide-y divide-border-subtle border-y border-border-subtle">
        <div
          v-for="edu in education"
          :key="edu.id"
          class="reveal grid md:grid-cols-[220px_1fr] gap-4 md:gap-12 py-7"
        >
          <!-- Left: period + status -->
          <div>
            <p class="text-sm text-text-muted">{{ edu.period }}</p>
            <span
              v-if="edu.cgpa === 'In Progress'"
              class="inline-flex items-center gap-2 mt-2 text-xs font-medium text-accent-tertiary"
            >
              <span class="dot-available" />
              In progress
            </span>
            <span
              v-else
              class="inline-block mt-2 text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent"
            >
              CGPA {{ edu.cgpa }}
            </span>
          </div>

          <!-- Right: degree + institution -->
          <div>
            <h3 class="text-lg font-semibold text-text-primary leading-snug mb-1">{{ edu.degree }}</h3>
            <p class="text-base text-accent font-medium mb-1">{{ edu.institution }}</p>
            <p class="flex items-center gap-1.5 text-sm text-text-muted">
              <Icon name="fluent:location-16-filled" size="12" />{{ edu.location }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
