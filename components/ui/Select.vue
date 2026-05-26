<script setup lang="ts">
defineProps<{
  id?: string
  required?: boolean
  disabled?: boolean
  placeholder?: string
}>()

const model = defineModel<string>()
</script>

<template>
  <div class="relative">
    <select
      :id="id"
      v-model="model"
      :required="required"
      :disabled="disabled"
      class="w-full rounded-lg border border-border bg-bg-secondary text-text-primary pl-4 pr-10 py-2.5 text-sm transition-colors focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <slot />
    </select>
    <Icon
      name="fluent:chevron-down-16-filled"
      size="14"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
    />
  </div>
</template>
