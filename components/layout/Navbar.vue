<script setup lang="ts">
import { Menu, X, Search, Sun, Moon } from 'lucide-vue-next'
import { navLinks, personal } from '~/data/index'
import { useCommandPalette } from '~/composables/useCommandPalette'
import { useTheme } from '~/composables/useTheme'

const { open, setupShortcut } = useCommandPalette()
setupShortcut()

const { isDark, toggle: toggleTheme } = useTheme()

const mobileOpen = ref(false)
const scrolled = ref(false)
const activeSection = ref('')

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 24
  }, { passive: true })

  // Track active section via IntersectionObserver
  const sectionIds = navLinks.map((l) => l.href.replace('#', ''))

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  )

  sectionIds.forEach((id) => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })

  onUnmounted(() => observer.disconnect())
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
      <NuxtLink href="/" class="font-mono text-sm text-text-primary hover:text-accent transition-colors">
        qie<span class="text-accent">.dev</span>
      </NuxtLink>

      <!-- Desktop links -->
      <ul class="hidden md:flex items-center gap-8">
        <li v-for="link in navLinks" :key="link.label">
          <a
            :href="link.href"
            class="relative text-sm transition-colors duration-200"
            :class="activeSection === link.href.replace('#', '')
              ? 'text-text-primary'
              : 'text-text-secondary hover:text-text-primary'"
          >
            {{ link.label }}
            <span
              class="absolute -bottom-0.5 left-0 right-0 h-px bg-accent transition-all duration-300"
              :class="activeSection === link.href.replace('#', '') ? 'opacity-100' : 'opacity-0'"
            />
          </a>
        </li>
      </ul>

      <!-- Right actions -->
      <div class="hidden md:flex items-center gap-2">
        <!-- Theme toggle -->
        <button class="btn-icon" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
          <Sun v-if="isDark" :size="14" />
          <Moon v-else :size="14" />
        </button>
        <!-- Search / Command palette -->
        <button class="btn-icon" title="Search (⌘K)" @click="open">
          <Search :size="14" />
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
          class="text-sm py-1 transition-colors"
          :class="activeSection === link.href.replace('#', '')
            ? 'text-text-primary font-medium'
            : 'text-text-secondary'"
          @click="closeMenu"
        >
          {{ link.label }}
        </a>
        <div class="border-t border-border pt-4 flex flex-col gap-2">
          <button class="btn-ghost text-sm justify-start" @click="() => { toggleTheme() }">
            <Sun v-if="isDark" :size="14" /> <Moon v-else :size="14" />
            {{ isDark ? 'Light mode' : 'Dark mode' }}
          </button>
          <button class="btn-ghost text-sm justify-start" @click="() => { open(); closeMenu() }">
            <Search :size="14" /> Search
          </button>
          <a :href="`mailto:${personal.email}`" class="btn-primary text-sm" @click="closeMenu">
            Contact
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>
