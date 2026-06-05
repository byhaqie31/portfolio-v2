<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const { isDark, toggle: toggleTheme, init } = useTheme()
// The login screen is a full-bleed split that bakes in its own top bar + footer,
// so the layout's own chrome only shows once signed in (see pages/admin/index.vue).
const { isAuthenticated } = useAdmin()

onMounted(() => {
  init()
})
</script>

<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <!-- Top bar -->
    <header v-if="isAuthenticated" class="flex items-center justify-between px-6 h-14 border-b border-border-subtle">
      <NuxtLink href="/" class="text-base font-semibold tracking-tight text-text-primary hover:text-accent transition-colors">
        Ahmad<span class="text-accent">.Baihaqie</span>
      </NuxtLink>
      <button
        class="btn-icon"
        :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        @click="toggleTheme"
      >
        <Icon v-if="isDark" name="fluent:weather-sunny-16-filled" size="14" />
        <Icon v-else name="fluent:weather-moon-16-filled" size="14" />
      </button>
    </header>

    <!-- Main content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer v-if="isAuthenticated" class="py-6 text-center border-t border-border-subtle">
      <p class="text-text-muted text-xs">
        © {{ new Date().getFullYear() }} Axelnova ·
        <a href="https://baihaqie.com" target="_blank" class="hover:text-text-primary transition-colors">baihaqie.com</a>
      </p>
    </footer>

    <UiAdminConfirm />
  </div>
</template>
