<script setup lang="ts">
defineProps<{
  type?: string
  placeholder?: string
  required?: boolean
  id?: string
  disabled?: boolean
  autocomplete?: string
}>()

const model = defineModel<string | number>()
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :type="type || 'text'"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :autocomplete="autocomplete"
    class="w-full rounded-lg border border-border bg-bg-secondary text-text-primary placeholder:text-text-muted px-4 py-2.5 text-sm transition-colors focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
  />
</template>
