<script setup lang="ts">
defineProps<{
  label: string      // small eyebrow label e.g. "Selected Work"
  title: string      // main heading
  description?: string
}>()
</script>

<template>
  <div class="reveal mb-16">
    <p class="font-mono text-2xs text-accent uppercase tracking-[0.15em] mb-3">
      {{ label }}
    </p>
    <h2 class="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
      {{ title }}
    </h2>
    <p v-if="description" class="max-w-xl text-text-secondary leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>
