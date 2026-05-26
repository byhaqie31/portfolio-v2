<script setup lang="ts">
defineProps<{
  rows?: number
  placeholder?: string
  required?: boolean
  id?: string
  disabled?: boolean
  maxlength?: number
}>()

const model = defineModel<string>()
</script>

<template>
  <textarea
    :id="id"
    v-model="model"
    :rows="rows || 3"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :maxlength="maxlength"
    class="w-full rounded-lg border border-border bg-bg-secondary text-text-primary placeholder:text-text-muted px-4 py-2.5 text-sm leading-relaxed transition-colors focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
  />
</template>
