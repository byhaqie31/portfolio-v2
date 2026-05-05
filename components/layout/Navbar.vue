<script setup lang="ts">
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
    :class="scrolled
      ? 'bg-bg/80 backdrop-blur-md border-b border-accent/10'
      : 'bg-transparent'"
  >
    <nav class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink href="/" class="font-display text-sm font-bold tracking-[0.15em] uppercase text-text-primary hover:text-accent transition-colors neon-glow">
        qie<span class="text-accent">.dev</span>
      </NuxtLink>

      <!-- Desktop links -->
      <ul class="hidden md:flex items-center gap-8">
        <li v-for="link in navLinks" :key="link.label">
          <a
            :href="link.href"
            class="relative font-mono text-xs uppercase tracking-widest transition-colors duration-200"
            :class="activeSection === link.href.replace('#', '')
              ? 'text-accent'
              : 'text-text-muted hover:text-text-primary'"
          >
            {{ link.label }}
            <span
              class="absolute -bottom-0.5 left-0 right-0 h-px transition-all duration-300"
              :class="activeSection === link.href.replace('#', '')
                ? 'opacity-100 bg-accent'
                : 'opacity-0 bg-accent'"
              :style="activeSection === link.href.replace('#', '')
                ? 'box-shadow: 0 0 8px rgb(var(--color-accent-raw) / 0.5)'
                : ''"
            />
          </a>
        </li>
      </ul>

      <!-- Right actions -->
      <div class="hidden md:flex items-center gap-2">
        <!-- Status indicator -->
        <span class="flex items-center gap-1.5 mr-3">
          <span class="w-1.5 h-1.5 rounded-full bg-accent-tertiary animate-pulse" />
          <span class="font-mono text-2xs text-text-muted tracking-wide uppercase">Online</span>
        </span>
        <!-- Theme toggle -->
        <button class="btn-icon" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggleTheme">
          <Icon v-if="isDark" name="fluent:weather-sunny-16-filled" size="14" />
          <Icon v-else name="fluent:weather-moon-16-filled" size="14" />
        </button>
        <!-- Search / Command palette -->
        <button class="btn-icon" title="Search (⌘K)" @click="open">
          <Icon name="fluent:search-16-filled" size="14" />
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
        <Icon v-if="mobileOpen" name="fluent:dismiss-16-filled" size="16" />
        <Icon v-else name="fluent:navigation-16-filled" size="16" />
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
        class="md:hidden border-t border-accent/10 bg-surface/95 backdrop-blur-md px-6 py-5 flex flex-col gap-4"
      >
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="font-mono text-xs uppercase tracking-widest py-1 transition-colors"
          :class="activeSection === link.href.replace('#', '')
            ? 'text-accent font-medium'
            : 'text-text-secondary'"
          @click="closeMenu"
        >
          {{ link.label }}
        </a>
        <div class="border-t border-accent/10 pt-4 flex flex-col gap-2">
          <button class="btn-ghost text-sm justify-start" @click="() => { toggleTheme() }">
            <Icon v-if="isDark" name="fluent:weather-sunny-16-filled" size="14" /> <Icon v-else name="fluent:weather-moon-16-filled" size="14" />
            {{ isDark ? 'Light mode' : 'Dark mode' }}
          </button>
          <button class="btn-ghost text-sm justify-start" @click="() => { open(); closeMenu() }">
            <Icon name="fluent:search-16-filled" size="14" /> Search
          </button>
          <a :href="`mailto:${personal.email}`" class="btn-primary text-sm" @click="closeMenu">
            Contact
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>
