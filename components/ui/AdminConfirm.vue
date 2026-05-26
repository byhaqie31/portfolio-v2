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
      <div v-if="visible" class="fixed inset-0 z-100 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-bg/60 backdrop-blur-sm" @click="resolve(false)" />
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
            class="relative bg-surface rounded-2xl border border-border w-full max-w-sm p-6"
            style="box-shadow: 0 20px 60px -10px rgba(0,0,0,0.18);"
          >
            <div class="flex items-start gap-4">
              <div
                class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                :class="state.variant === 'success'
                  ? 'bg-accent-tertiary/10 text-accent-tertiary'
                  : state.variant === 'danger'
                    ? 'bg-red-500/10 text-red-500'
                    : 'bg-accent/10 text-accent'"
              >
                <Icon
                  :name="state.variant === 'success' ? 'fluent:checkmark-circle-24-filled' : state.variant === 'danger' ? 'fluent:warning-24-regular' : 'fluent:question-circle-24-regular'"
                  class="w-5 h-5"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="text-base font-semibold text-text-primary mb-1">
                  {{ state.title }}
                </h3>
                <p class="text-sm text-text-secondary leading-relaxed">{{ state.message }}</p>
              </div>
            </div>

            <!-- Success: OK button only -->
            <div v-if="state.variant === 'success'" class="flex justify-end mt-6">
              <button @click="resolve(false)" class="btn-primary text-sm">
                OK
              </button>
            </div>

            <!-- Confirm/Danger: Cancel + Confirm buttons -->
            <div v-else class="flex justify-end gap-3 mt-6">
              <button @click="resolve(false)" class="btn-ghost text-sm">
                {{ state.cancelLabel || 'Cancel' }}
              </button>
              <button
                @click="resolve(true)"
                class="text-sm font-medium px-5 py-2.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                :class="state.variant === 'danger'
                  ? 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500'
                  : 'bg-accent text-text-inverse hover:opacity-90 focus-visible:ring-accent'"
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
