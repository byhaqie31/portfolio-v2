<script setup lang="ts">
defineProps<{
  label: string
  for?: string
  required?: boolean
  hint?: string
  error?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="$props.for" class="text-sm font-medium text-text-secondary">
      {{ label }}
      <span v-if="required" class="text-red-500" aria-label="required">*</span>
    </label>
    <slot />
    <p v-if="hint && !error" class="text-xs text-text-muted">{{ hint }}</p>
    <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
  </div>
</template>
