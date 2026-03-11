<script setup lang="ts">
import { Menu, X } from 'lucide-vue-next'
import { navLinks, personal } from '~/data/portfolio'

const mobileOpen = ref(false)
const scrolled = ref(false)

onMounted(() => {
  window.addEventListener('scroll', () => {
    scrolled.value = window.scrollY > 20
  })
})

function closeMenu() {
  mobileOpen.value = false
}
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
    :class="scrolled ? 'bg-surface/80 backdrop-blur-md border-b border-border' : 'bg-transparent'"
  >
    <nav class="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink
        href="/"
        class="font-mono text-sm text-text-primary hover:text-white transition-colors"
      >
        {{ personal.name.split(' ')[0].toLowerCase() }}<span class="text-text-muted">.</span>dev
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

      <!-- CTA -->
      <a
        :href="`mailto:${personal.email}`"
        class="hidden md:inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-md bg-white text-black font-medium hover:bg-white/90 transition-colors"
      >
        Contact
      </a>

      <!-- Mobile toggle -->
      <button
        class="md:hidden text-text-secondary hover:text-text-primary transition-colors"
        @click="mobileOpen = !mobileOpen"
        :aria-label="mobileOpen ? 'Close menu' : 'Open menu'"
      >
        <X v-if="mobileOpen" :size="20" />
        <Menu v-else :size="20" />
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
        class="md:hidden border-t border-border bg-surface-1/95 backdrop-blur-md px-6 py-4 flex flex-col gap-4"
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
        <a
          :href="`mailto:${personal.email}`"
          class="text-sm px-4 py-2 rounded-md bg-white text-black font-medium text-center hover:bg-white/90 transition-colors mt-2"
          @click="closeMenu"
        >
          Contact
        </a>
      </div>
    </Transition>
  </header>
</template>
