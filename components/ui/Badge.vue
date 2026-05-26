<script setup lang="ts">
const props = defineProps<{
  variant?: 'accent' | 'success' | 'warning' | 'danger' | 'neutral'
}>()

const variants = {
  accent: 'bg-accent/10 text-accent',
  success: 'bg-accent-tertiary/10 text-accent-tertiary',
  warning: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-500',
  danger: 'bg-red-500/10 text-red-600 dark:text-red-400',
  neutral: 'bg-bg-tertiary text-text-secondary',
}
</script>

<template>
  <span
    class="inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap"
    :class="variants[props.variant || 'neutral']"
  >
    <slot />
  </span>
</template>
