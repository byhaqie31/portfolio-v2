<script setup lang="ts">
import { useCommandPalette } from '~/composables/useCommandPalette'
import { navLinks, personal } from '~/data/index'

const { isOpen, query, close } = useCommandPalette()

const allCommands = [
  ...navLinks.map((l) => ({
    id: l.href,
    label: l.label,
    description: `Jump to ${l.label} section`,
    action: () => {
      const el = document.querySelector(l.href)
      el?.scrollIntoView({ behavior: 'smooth' })
      close()
    },
  })),
  {
    id: 'github',
    label: 'GitHub',
    description: 'Open GitHub profile',
    action: () => { window.open(personal.github, '_blank'); close() },
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    description: 'Open LinkedIn profile',
    action: () => { window.open(personal.linkedin, '_blank'); close() },
  },
  {
    id: 'email',
    label: 'Send Email',
    description: personal.email,
    action: () => { window.location.href = `mailto:${personal.email}`; close() },
  },
]

const filtered = computed(() =>
  query.value
    ? allCommands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.value.toLowerCase()) ||
          c.description?.toLowerCase().includes(query.value.toLowerCase())
      )
    : allCommands
)

const selected = ref(0)

watch(filtered, () => { selected.value = 0 })
watch(isOpen, (v) => { if (v) nextTick(() => { selected.value = 0 }) })

function handleKey(e: KeyboardEvent) {
  if (!isOpen.value) return
  if (e.key === 'ArrowDown') { e.preventDefault(); selected.value = (selected.value + 1) % filtered.value.length }
  if (e.key === 'ArrowUp') { e.preventDefault(); selected.value = (selected.value - 1 + filtered.value.length) % filtered.value.length }
  if (e.key === 'Enter') { e.preventDefault(); filtered.value[selected.value]?.action() }
}

onMounted(() => window.addEventListener('keydown', handleKey))
onUnmounted(() => window.removeEventListener('keydown', handleKey))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-200 flex items-start justify-center pt-[20vh] px-4"
        @click.self="close"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-bg/60 backdrop-blur-sm" @click="close" />

        <!-- Panel -->
        <div
          class="relative w-full max-w-lg rounded-2xl border border-border bg-surface overflow-hidden animate-slide-down"
          style="box-shadow: 0 20px 60px -10px rgba(0,0,0,0.18), 0 0 0 1px rgb(var(--color-border-raw) / 0.4);"
        >
          <!-- Search input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
            <Icon name="fluent:search-16-filled" size="16" class="text-text-muted shrink-0" />
            <input
              v-model="query"
              type="text"
              placeholder="Type a command or search…"
              class="flex-1 bg-transparent text-base text-text-primary placeholder:text-text-muted outline-none"
              autofocus
            />
            <button class="btn-icon shrink-0" aria-label="Close search" @click="close">
              <Icon name="fluent:dismiss-16-filled" size="14" />
            </button>
          </div>

          <!-- Results -->
          <div class="py-2 max-h-72 overflow-y-auto">
            <p v-if="filtered.length === 0" class="px-4 py-6 text-sm text-text-muted text-center">
              No results found.
            </p>
            <button
              v-for="(cmd, i) in filtered"
              :key="cmd.id"
              class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors"
              :class="i === selected
                ? 'bg-accent/8 text-text-primary'
                : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'"
              @click="cmd.action"
              @mouseenter="selected = i"
            >
              <span class="text-sm font-medium">{{ cmd.label }}</span>
              <span class="text-xs text-text-muted truncate">{{ cmd.description }}</span>
              <Icon
                name="fluent:arrow-right-16-filled"
                size="14"
                class="shrink-0 transition-opacity"
                :class="i === selected ? 'text-accent opacity-100' : 'opacity-0'"
              />
            </button>
          </div>

          <!-- Footer hint -->
          <div class="px-4 py-2.5 border-t border-border-subtle flex items-center gap-3 text-xs text-text-muted">
            <span class="inline-flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 rounded-md border border-border-subtle bg-bg-secondary text-[0.65rem]">↑↓</kbd>
              navigate
            </span>
            <span class="inline-flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 rounded-md border border-border-subtle bg-bg-secondary text-[0.65rem]">↵</kbd>
              select
            </span>
            <span class="inline-flex items-center gap-1">
              <kbd class="px-1.5 py-0.5 rounded-md border border-border-subtle bg-bg-secondary text-[0.65rem]">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
