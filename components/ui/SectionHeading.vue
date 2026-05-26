<script setup lang="ts">
defineProps<{
  label: string
  title: string
  description?: string
}>()
</script>

<template>
  <div class="reveal mb-16 max-w-3xl">
    <p class="text-sm text-accent font-medium mb-3">{{ label }}</p>
    <h2 class="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.1] text-text-primary mb-4">
      {{ title }}
    </h2>
    <p v-if="description" class="text-lg text-text-secondary leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>
