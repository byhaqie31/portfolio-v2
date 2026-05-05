<script setup lang="ts">
import { skillGroups as staticSkillGroups } from '~/data/index'

const { data: skillsData } = await usePreviewableFetch<any[]>('skills', '/api/skills', {
  key: 'skills',
  default: () => staticSkillGroups as any[],
})

const skillGroups = computed(() => {
  const data = skillsData.value as any[]
  if (!data?.length) return staticSkillGroups
  return data.map((g: any) => ({
    label: g.label,
    items: g.items || [],
  }))
})
</script>

<template>
  <section id="experience" class="section">
    <hr class="section-divider mb-24 md:mb-32" />
    <div class="max-w-5xl mx-auto">
      <UiSectionHeading
        label="Tech Stack"
        title="Skills & Tools"
        description="Technologies and tools I use day-to-day to design and ship products."
      />

      <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="group in skillGroups"
          :key="group.label"
          class="reveal card relative overflow-hidden"
        >
          <!-- Corner accent -->
          <div class="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent/20" />
          <p class="font-mono text-2xs text-accent uppercase tracking-[0.25em] mb-4">{{ group.label }}</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="item in group.items" :key="item" class="skill-tag">
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
