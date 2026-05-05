<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

definePageMeta({ layout: 'dashboard' })

const { isAuthenticated, login, logout, restoreSession } = useAdmin()
const { init: initPreview } = usePreview()
const toast = useToast()

const keyInput = ref('')
const loggingIn = ref(false)
const loginError = ref('')
const activeTab = ref('personal')

const tabs = [
  { id: 'personal', label: 'Personal' },
  { id: 'projects', label: 'Projects' },
  { id: 'experiences', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'activities', label: 'Activities' },
  { id: 'references', label: 'References' },
]

// Map admin tab → public section anchor for auto-scroll in the preview iframe
const tabToSectionId: Record<string, string> = {
  personal: 'about',
  projects: 'projects',
  experiences: 'experience',
  education: 'about',
  skills: 'skills',
  activities: 'experience',
  references: 'references',
}

const previewFrame = ref<HTMLIFrameElement | null>(null)
const previewShell = ref<HTMLElement | null>(null)

// Render iframe at laptop-ish width and scale it down to fit the pane,
// so the preview shows the real desktop layout instead of mobile.
const NATIVE_PREVIEW_WIDTH = 1280
const previewScale = ref(0.55)

watch(activeTab, (tab) => {
  const id = tabToSectionId[tab]
  if (!id) return
  previewFrame.value?.contentWindow?.postMessage(
    { type: 'preview:scroll-to', id },
    window.location.origin,
  )
})

onMounted(() => {
  if (!import.meta.client) return

  // Install message listeners so the iframe can request initial overlay
  // state and the parent can respond.
  initPreview()

  const recompute = () => {
    if (!previewShell.value) return
    const w = previewShell.value.clientWidth
    if (w > 0) previewScale.value = Math.min(1, w / NATIVE_PREVIEW_WIDTH)
  }

  const ro = new ResizeObserver(recompute)
  watch(
    previewShell,
    (el) => {
      if (el) {
        ro.observe(el)
        recompute()
      }
    },
    { immediate: true, flush: 'post' },
  )

  onUnmounted(() => ro.disconnect())
})

async function handleLogin() {
  if (!keyInput.value.trim()) return
  loginError.value = ''
  loggingIn.value = true
  try {
    await $fetch('/api/auth/verify', { headers: { 'x-admin-key': keyInput.value } })
    login(keyInput.value)
    keyInput.value = ''
    toast.add({ title: 'Authenticated successfully', icon: 'fluent:checkmark-circle-24-regular', color: 'success' })
  } catch {
    loginError.value = 'Wrong password'
  }
  loggingIn.value = false
}

function handleLogout() {
  logout()
  activeTab.value = 'personal'
}

onMounted(() => {
  restoreSession()
})
</script>

<template>
  <div class="min-h-screen px-4 py-8 max-w-400 mx-auto">

    <!-- Login -->
    <div v-if="!isAuthenticated" class="flex items-center justify-center min-h-[60vh]">
      <div class="card w-full max-w-sm">
        <h1 class="text-xl font-display text-text-primary text-center mb-6">Admin Access</h1>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <input
              v-model="keyInput"
              type="password"
              placeholder="Enter admin key"
              class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-3 text-sm focus:outline-none transition-colors"
              :class="loginError ? 'border-red-500/60' : ''"
              :style="loginError ? '' : 'border-color: rgb(var(--color-border-raw) / 0.2)'"
            />
            <p v-if="loginError" class="text-red-400 text-xs font-tech mt-2">{{ loginError }}</p>
          </div>
          <button type="submit" :disabled="loggingIn" class="btn-primary w-full">{{ loggingIn ? 'Authenticating...' : 'Authenticate' }}</button>
        </form>
      </div>
    </div>

    <!-- Dashboard -->
    <div v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-display text-text-primary">Portfolio Admin</h1>
        <button @click="handleLogout" class="btn-ghost inline-flex items-center gap-2 text-sm">
          <Icon name="fluent:sign-out-20-filled" size="14" />
          Logout
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-[160px_minmax(420px,1fr)_minmax(560px,1.4fr)] gap-6">
        <!-- Sidebar Nav -->
        <nav class="lg:sticky lg:top-6 lg:self-start">
          <div class="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-4 py-2.5 rounded text-sm font-tech text-left whitespace-nowrap transition-colors"
              :class="activeTab === tab.id
                ? 'bg-accent/10 text-accent border border-accent/20'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised border border-transparent'"
            >
              {{ tab.label }}
            </button>
          </div>
        </nav>

        <!-- Form Area -->
        <main class="min-w-0">
          <h2 class="text-lg font-display text-text-primary mb-6 uppercase tracking-wider">
            {{ tabs.find(t => t.id === activeTab)?.label }}
          </h2>

          <AdminPersonal v-if="activeTab === 'personal'" />
          <AdminProjects v-else-if="activeTab === 'projects'" />
          <AdminExperiences v-else-if="activeTab === 'experiences'" />
          <AdminEducation v-else-if="activeTab === 'education'" />
          <AdminSkills v-else-if="activeTab === 'skills'" />
          <AdminActivities v-else-if="activeTab === 'activities'" />
          <AdminReferences v-else-if="activeTab === 'references'" />
        </main>

        <!-- Live Preview Pane -->
        <aside class="hidden lg:block lg:sticky lg:top-6 lg:self-start min-w-0">
          <div class="rounded border border-accent/15 bg-bg overflow-hidden flex flex-col" style="height: calc(100vh - 6rem)">
            <div class="h-10 px-3 flex items-center justify-between border-b border-accent/15 bg-surface-raised shrink-0">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-accent-secondary animate-pulse" />
                <span class="font-mono text-2xs text-accent-secondary uppercase tracking-[0.2em]">Live Preview</span>
                <span class="font-mono text-2xs text-text-muted tracking-wider">
                  {{ NATIVE_PREVIEW_WIDTH }}px · {{ Math.round(previewScale * 100) }}%
                </span>
              </div>
              <a
                href="/admin/preview"
                target="_blank"
                rel="noopener"
                class="font-mono text-2xs text-text-muted hover:text-accent uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                title="Open in new tab"
              >
                <Icon name="fluent:arrow-up-right-16-filled" size="12" />
                Open
              </a>
            </div>

            <!-- Scaled iframe shell. Outer div = pane width; inner iframe renders
                 at NATIVE_PREVIEW_WIDTH and is transform-scaled to fit. -->
            <div ref="previewShell" class="relative flex-1 overflow-hidden bg-bg">
              <iframe
                ref="previewFrame"
                src="/admin/preview?embed=1"
                title="Live preview"
                class="absolute top-0 left-0 origin-top-left border-0 bg-bg"
                :style="{
                  width: `${NATIVE_PREVIEW_WIDTH}px`,
                  height: `${100 / previewScale}%`,
                  transform: `scale(${previewScale})`,
                }"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>

  </div>
</template>
