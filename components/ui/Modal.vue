<script setup lang="ts">
const props = defineProps<{
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}>()

const open = defineModel<boolean>('open', { default: false })

const sizeClass = computed(() => ({
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
}[props.size || 'lg']))

function close() {
  open.value = false
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
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
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-bg/60 backdrop-blur-sm" @click="close" />

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="scale-95 opacity-0"
          enter-to-class="scale-100 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="scale-100 opacity-100"
          leave-to-class="scale-95 opacity-0"
        >
          <div
            v-if="open"
            role="dialog"
            aria-modal="true"
            :aria-label="title"
            class="relative w-full bg-surface rounded-2xl border border-border max-h-[90vh] overflow-hidden flex flex-col"
            :class="sizeClass"
            style="box-shadow: 0 20px 60px -10px rgba(0,0,0,0.18);"
          >
            <header v-if="title || $slots.header" class="px-6 py-5 border-b border-border-subtle flex items-center justify-between shrink-0">
              <slot name="header">
                <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
              </slot>
              <button class="btn-icon" aria-label="Close" @click="close">
                <Icon name="fluent:dismiss-16-filled" size="14" />
              </button>
            </header>

            <div class="overflow-y-auto p-6 flex-1">
              <slot />
            </div>

            <footer v-if="$slots.actions" class="px-6 py-4 border-t border-border-subtle flex items-center justify-end gap-3 shrink-0">
              <slot name="actions" />
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
