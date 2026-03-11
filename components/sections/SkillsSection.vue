<script setup lang="ts">
import { skillGroups } from '~/data/index'
</script>

<template>
  <section id="experience" class="section border-t border-border">
    <div class="max-w-5xl mx-auto">
      <UiSectionHeading
        label="Experience"
        title="Skills & Tools"
        description="Technologies and tools I use day-to-day to design and ship products."
      />

      <div class="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div
          v-for="group in skillGroups"
          :key="group.label"
          class="reveal card"
        >
          <p class="font-mono text-2xs text-accent uppercase tracking-widest mb-4">{{ group.label }}</p>
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
