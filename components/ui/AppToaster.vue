<script setup lang="ts">
const { toasts, remove } = useAppToast()
</script>

<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none">
      <TransitionGroup
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border border-border bg-surface min-w-70 max-w-sm"
          style="box-shadow: 0 12px 32px -8px rgba(0,0,0,0.12);"
        >
          <Icon
            :name="t.color === 'error' ? 'fluent:error-circle-24-regular' : 'fluent:checkmark-circle-24-filled'"
            class="w-5 h-5 shrink-0"
            :class="t.color === 'error' ? 'text-red-500' : 'text-accent-tertiary'"
          />
          <span class="text-sm font-medium text-text-primary flex-1">{{ t.title }}</span>
          <button
            @click="remove(t.id)"
            class="text-text-muted hover:text-text-primary transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <Icon name="fluent:dismiss-16-regular" class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
