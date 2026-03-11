<script setup lang="ts">
import { Menu, X, Command } from 'lucide-vue-next'
import { navLinks, personal } from '~/data/index'
import { useCommandPalette } from '~/composables/useCommandPalette'

const { open, setupShortcut } = useCommandPalette()
setupShortcut()

const mobileOpen = ref(false)
const scrolled = ref(false)

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 24
  }, { passive: true })
})

function closeMenu() { mobileOpen.value = false }
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-bg/80 backdrop-blur-md border-b border-border' : 'bg-transparent'"
  >
    <nav class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink href="/" class="font-mono text-sm text-text-primary hover:text-white transition-colors">
        {{ personal.name.split(' ')[0].toLowerCase() }}<span class="text-accent">.</span>
      </NuxtLink>

      <!-- Desktop links -->
      <ul class="hidden md:flex items-center gap-8">
        <li v-for="link in navLinks" :key="link.label">
          <a
            :href="link.href"
            class="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {{ link.label }}
          </a>
        </li>
      </ul>

      <!-- Right actions -->
      <div class="hidden md:flex items-center gap-2">
        <button class="btn-icon" title="Command palette (⌘K)" @click="open">
          <Command :size="14" />
        </button>
        <a :href="`mailto:${personal.email}`" class="btn-primary text-xs px-4 py-2">
          Contact
        </a>
      </div>

      <!-- Mobile toggle -->
      <button
        class="md:hidden btn-icon"
        @click="mobileOpen = !mobileOpen"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
      >
        <X v-if="mobileOpen" :size="16" />
        <Menu v-else :size="16" />
      </button>
    </nav>

    <!-- Mobile menu -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileOpen"
        class="md:hidden border-t border-border bg-bg/95 backdrop-blur-md px-6 py-5 flex flex-col gap-4"
      >
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="text-sm text-text-secondary hover:text-text-primary transition-colors py-1"
          @click="closeMenu"
        >
          {{ link.label }}
        </a>
        <div class="border-t border-border pt-4 flex flex-col gap-2">
          <button class="btn-ghost text-sm justify-start" @click="() => { open(); closeMenu() }">
            <Command :size="14" /> Command palette
          </button>
          <a :href="`mailto:${personal.email}`" class="btn-primary text-sm" @click="closeMenu">
            Contact
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>
