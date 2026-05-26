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
  <section id="skills" class="section">
    <div class="max-w-6xl mx-auto">
      <UiSectionHeading
        label="Tech Stack"
        title="Skills & Tools"
        description="Technologies and tools I reach for day-to-day to design and ship products."
      />

      <div class="reveal grid md:grid-cols-2 gap-x-16 gap-y-12">
        <div
          v-for="group in skillGroups"
          :key="group.label"
          class="flex flex-col gap-4"
        >
          <p class="text-sm text-accent font-medium">{{ group.label }}</p>
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
