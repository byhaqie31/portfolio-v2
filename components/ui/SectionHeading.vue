<script setup lang="ts">
defineProps<{
  label: string      // small eyebrow label e.g. "Selected Work"
  title: string      // main heading
  description?: string
}>()
</script>

<template>
  <div class="reveal mb-16">
    <!-- Eyebrow with divider line (Axelnova pattern) -->
    <div class="flex items-center gap-3 mb-4">
      <span class="font-mono text-2xs text-accent uppercase tracking-[0.3em] border border-accent/20 px-2.5 py-1 rounded">
        {{ label }}
      </span>
      <div class="flex-1 h-px" style="background: linear-gradient(to right, rgb(var(--color-accent-raw) / 0.3), transparent);" />
    </div>
    <h2 class="font-display text-2xl md:text-3xl font-bold tracking-[0.05em] uppercase text-text-primary mb-4">
      {{ title }}
    </h2>
    <p v-if="description" class="max-w-xl text-text-secondary leading-relaxed">
      {{ description }}
    </p>
  </div>
</template>
