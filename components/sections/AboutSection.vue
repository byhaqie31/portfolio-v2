<script setup lang="ts">
import { personal as staticPersonal } from '~/data/index'

const { data: personalData } = await usePersonal()

const bio = computed(() => {
  const d = personalData.value as any
  if (d?.bio_1) return [d.bio_1, d.bio_2].filter(Boolean)
  return staticPersonal.bio
})

const meta = computed(() => {
  const d = personalData.value as any
  return {
    location: d?.location || staticPersonal.location,
    focus: d?.focus || staticPersonal.focus,
    availableFor: d?.available_for || staticPersonal.availableFor,
    languages: staticPersonal.languages,
  }
})
</script>

<template>
  <section id="about" class="section">
    <div class="max-w-6xl mx-auto">
      <UiSectionHeading label="About" title="Engineering with a human lens." />

      <div class="grid md:grid-cols-[1fr_0.8fr] gap-12 md:gap-20 items-start">
        <!-- Left: bio -->
        <div class="space-y-5 text-[1.0625rem] text-text-secondary leading-[1.7] reveal">
          <p v-for="(paragraph, i) in bio" :key="i" class="max-w-[56ch]">{{ paragraph }}</p>
        </div>

        <!-- Right: at-a-glance meta rows -->
        <dl class="reveal flex flex-col">
          <div class="flex items-baseline justify-between gap-5 py-4 border-t border-border-subtle">
            <dt class="text-sm text-text-muted">Based in</dt>
            <dd class="text-[0.9375rem] font-medium text-text-primary text-right">{{ meta.location }}</dd>
          </div>
          <div class="flex items-baseline justify-between gap-5 py-4 border-t border-border-subtle">
            <dt class="text-sm text-text-muted">Focus</dt>
            <dd class="text-[0.9375rem] font-medium text-text-primary text-right">{{ meta.focus }}</dd>
          </div>
          <div class="flex items-baseline justify-between gap-5 py-4 border-t border-border-subtle">
            <dt class="text-sm text-text-muted">Open to</dt>
            <dd class="text-[0.9375rem] font-medium text-text-primary text-right">{{ meta.availableFor }}</dd>
          </div>
          <div class="flex items-baseline justify-between gap-5 py-4 border-t border-b border-border-subtle">
            <dt class="text-sm text-text-muted">Languages</dt>
            <dd class="flex flex-col gap-1 text-[0.9375rem] font-medium text-text-primary text-right">
              <span v-for="l in meta.languages" :key="l.lang">{{ l.lang }}</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>
