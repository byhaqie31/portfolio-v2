<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { navLinks, personal } from '~/data/index'
import { useCommandPalette } from '~/composables/useCommandPalette'
import { useTheme } from '~/composables/useTheme'

const { open, setupShortcut } = useCommandPalette()
setupShortcut()

const { isDark, toggle: toggleTheme } = useTheme()

const mobileOpen = ref(false)
const scrolled = ref(false)
const activeSection = ref('')

const mobilePanel = ref<HTMLElement | null>(null)
const mobileToggle = ref<HTMLElement | null>(null)

onClickOutside(mobilePanel, () => {
  if (mobileOpen.value) mobileOpen.value = false
}, { ignore: [mobileToggle] })

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
      ? 'bg-bg/80 backdrop-blur-md border-b border-border-subtle'
      : 'bg-transparent'"
  >
    <nav class="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink href="/" class="text-base font-semibold tracking-tight text-text-primary hover:text-accent transition-colors">
        qie<span class="text-accent">.dev</span>
      </NuxtLink>

      <!-- Desktop links -->
      <ul class="hidden md:flex items-center gap-7">
        <li v-for="link in navLinks" :key="link.label">
          <a
            :href="link.href"
            class="relative text-sm transition-colors duration-200"
            :class="activeSection === link.href.replace('#', '')
              ? 'text-text-primary font-medium'
              : 'text-text-muted hover:text-text-primary'"
          >
            {{ link.label }}
            <span
              class="absolute -bottom-1.5 left-0 right-0 h-px bg-accent transition-opacity duration-300"
              :class="activeSection === link.href.replace('#', '')
                ? 'opacity-100'
                : 'opacity-0'"
            />
          </a>
        </li>
      </ul>

      <!-- Right actions -->
      <div class="hidden md:flex items-center gap-2">
        <!-- Status indicator -->
        <span class="flex items-center gap-1.5 mr-3 text-sm text-text-muted">
          <span class="w-1.5 h-1.5 rounded-full bg-accent-tertiary animate-pulse" />
          Online
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
        ref="mobileToggle"
        class="md:hidden btn-icon"
        @click="mobileOpen = !mobileOpen"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
        :aria-expanded="mobileOpen"
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
        ref="mobilePanel"
        class="md:hidden border-t border-border-subtle bg-surface/95 backdrop-blur-md px-6 py-6 flex flex-col gap-1"
      >
        <a
          v-for="link in navLinks"
          :key="link.label"
          :href="link.href"
          class="text-base py-2.5 transition-colors"
          :class="activeSection === link.href.replace('#', '')
            ? 'text-text-primary font-medium'
            : 'text-text-secondary'"
          @click="closeMenu"
        >
          {{ link.label }}
        </a>
        <!-- Utility row: theme + search as icon buttons, contact as primary -->
        <div class="mt-5 pt-5 border-t border-border-subtle flex items-center gap-3">
          <button
            class="btn-icon"
            :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            @click="toggleTheme"
          >
            <Icon v-if="isDark" name="fluent:weather-sunny-16-filled" size="14" />
            <Icon v-else name="fluent:weather-moon-16-filled" size="14" />
          </button>
          <button
            class="btn-icon"
            title="Search"
            aria-label="Search"
            @click="() => { open(); closeMenu() }"
          >
            <Icon name="fluent:search-16-filled" size="14" />
          </button>
          <a
            :href="`mailto:${personal.email}`"
            class="btn-primary text-sm ml-auto"
            @click="closeMenu"
          >
            Contact
          </a>
        </div>
      </div>
    </Transition>
  </header>
</template>
