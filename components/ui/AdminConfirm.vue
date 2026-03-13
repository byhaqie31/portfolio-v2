<script setup lang="ts">
const { visible, state, resolve } = useConfirm()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="visible" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60" @click="resolve(false)" />
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            v-if="visible"
            class="relative bg-bg-secondary rounded-lg border w-full max-w-sm p-6"
            style="border-color: rgb(var(--color-border-raw) / 0.2)"
          >
            <div class="flex items-start gap-4">
              <div
                class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                :class="state.variant === 'danger' ? 'bg-red-500/10' : 'bg-accent/10'"
              >
                <Icon
                  :name="state.variant === 'danger' ? 'fluent:warning-24-regular' : 'fluent:question-circle-24-regular'"
                  class="w-5 h-5"
                  :class="state.variant === 'danger' ? 'text-red-400' : 'text-accent'"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-display text-text-primary uppercase tracking-wider mb-1">
                  {{ state.title }}
                </h3>
                <p class="text-sm text-text-secondary font-tech">{{ state.message }}</p>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button @click="resolve(false)" class="btn-ghost text-xs">
                {{ state.cancelLabel || 'Cancel' }}
              </button>
              <button
                @click="resolve(true)"
                class="btn-ghost text-xs"
                :class="state.variant === 'danger'
                  ? 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/50'
                  : 'border-accent/30 bg-accent/10 text-accent hover:bg-accent/20'"
              >
                {{ state.confirmLabel || 'Confirm' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
