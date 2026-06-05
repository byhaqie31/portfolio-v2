<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

definePageMeta({ layout: 'dashboard' })

useSeoMeta({ robots: 'noindex, nofollow' })

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
  <div>

    <!-- Login — full-screen split. The header (wordmark + label) and footer
         (copyright + link) are baked into the panels; the dashboard layout hides
         its own chrome while signed out (see layouts/dashboard.vue). -->
    <div v-if="!isAuthenticated" class="grid lg:grid-cols-2 h-dvh overflow-hidden">
      <!-- Left — sign-in, with integrated top bar + footer -->
      <div class="flex flex-col h-full px-6 sm:px-10 lg:px-14 py-7">
        <!-- Top bar -->
        <div class="flex items-center justify-between shrink-0">
          <NuxtLink to="/" class="text-base font-semibold tracking-tight text-text-primary hover:text-accent transition-colors">
            Ahmad<span class="text-accent">.Baihaqie</span>
          </NuxtLink>
          <span class="text-sm text-text-muted">Portfolio admin</span>
        </div>

        <!-- Centered form -->
        <div class="flex-1 min-h-0 flex flex-col justify-center overflow-y-auto py-8">
          <div class="w-full max-w-sm mx-auto">
            <div class="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-accent/10 text-accent mb-6">
              <Icon name="fluent:lock-closed-16-filled" size="18" />
            </div>
            <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-text-primary">Welcome back</h1>
            <p class="mt-2 text-sm text-text-secondary leading-relaxed">
              Sign in to manage your portfolio content.
            </p>

            <form @submit.prevent="handleLogin" class="mt-8 space-y-4">
              <UiField label="Admin key" :error="loginError">
                <UiInput
                  v-model="keyInput"
                  type="password"
                  placeholder="Enter admin key"
                  autocomplete="current-password"
                />
              </UiField>
              <button type="submit" :disabled="loggingIn" class="btn-primary w-full">
                <span
                  v-if="loggingIn"
                  class="inline-block w-4 h-4 border-2 border-text-inverse/40 border-t-text-inverse rounded-full animate-spin"
                />
                {{ loggingIn ? 'Signing in…' : 'Sign in' }}
              </button>
            </form>

            <NuxtLink
              to="/"
              class="mt-8 inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
            >
              <Icon name="fluent:arrow-left-16-filled" size="14" />
              Back to site
            </NuxtLink>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between shrink-0 text-sm text-text-muted">
          <span>© {{ new Date().getFullYear() }} Ahmad Baihaqie</span>
          <a
            href="https://baihaqie.com"
            target="_blank"
            rel="noopener noreferrer"
            class="hover:text-text-primary transition-colors"
          >
            baihaqie.com
          </a>
        </div>
      </div>

      <!-- Right — full-height brand statement. Reuses the sanctioned .dark-chapter
           token flip (navy field + vibrant blue accent); the panel-scoped style
           contains its glow. Status pill top, statement bottom. -->
      <aside class="statement-panel dark-chapter relative hidden lg:flex flex-col justify-between overflow-hidden px-14 py-7">
        <!-- Oversized monogram watermark -->
        <span
          aria-hidden="true"
          class="pointer-events-none select-none absolute -right-12 top-1/2 -translate-y-1/2 text-[26rem] leading-none font-semibold tracking-tighter text-text-primary/4"
        >
          AB
        </span>

        <!-- Top — status pill -->
        <div class="relative flex justify-end shrink-0">
          <span class="inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1.5 text-sm text-text-secondary backdrop-blur-sm">
            <span class="w-1.5 h-1.5 rounded-full bg-accent-tertiary animate-pulse" />
            All systems operational
          </span>
        </div>

        <!-- Bottom — statement -->
        <div class="relative max-w-lg">
          <p class="text-sm font-medium text-accent mb-4">Ahmad Baihaqie · Portfolio admin</p>
          <h2 class="text-[clamp(2.25rem,3.2vw,3.25rem)] font-semibold tracking-tight leading-[1.05] text-text-primary">
            Craft the details<br>that make the whole.
          </h2>
          <p class="mt-5 text-base text-text-secondary leading-relaxed max-w-md">
            The quiet workspace where the portfolio is shaped — projects, experience, and the details that add up to the difference.
          </p>

          <!-- Sign-off badge -->
          <div class="mt-8 inline-flex items-center gap-3 rounded-xl border border-border bg-surface/40 px-4 py-3 backdrop-blur-sm">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 text-accent shrink-0">
              <Icon name="fluent:shield-keyhole-16-filled" size="15" />
            </span>
            <div class="text-sm leading-tight">
              <p class="font-medium text-text-primary">Private workspace</p>
              <p class="text-text-muted">Key-protected · session only</p>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <!-- Dashboard -->
    <div v-else class="min-h-screen px-4 py-8 max-w-400 mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-semibold tracking-tight text-text-primary">Portfolio admin</h1>
        <button @click="handleLogout" class="btn-ghost inline-flex items-center gap-2 text-sm">
          <Icon name="fluent:sign-out-20-filled" size="14" />
          Sign out
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
              class="px-4 py-2.5 rounded-lg text-sm font-medium text-left whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              :class="activeTab === tab.id
                ? 'bg-accent/10 text-accent'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised'"
            >
              {{ tab.label }}
            </button>
          </div>
        </nav>

        <!-- Form Area -->
        <main class="min-w-0">
          <h2 class="text-lg font-semibold tracking-tight text-text-primary mb-6">
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
          <div class="rounded-2xl border border-border bg-surface overflow-hidden flex flex-col" style="height: calc(100vh - 6rem)">
            <div class="h-10 px-4 flex items-center justify-between border-b border-border-subtle bg-bg-secondary shrink-0">
              <div class="flex items-center gap-2 text-sm text-text-muted">
                <span class="w-1.5 h-1.5 rounded-full bg-accent-tertiary animate-pulse" />
                <span class="text-text-secondary font-medium">Live preview</span>
                <span class="text-xs">{{ NATIVE_PREVIEW_WIDTH }}px · {{ Math.round(previewScale * 100) }}%</span>
              </div>
              <a
                href="/admin/preview"
                target="_blank"
                rel="noopener"
                class="text-sm text-text-muted hover:text-text-primary transition-colors inline-flex items-center gap-1"
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

<style scoped>
/* Inherit .dark-chapter's navy token flip, but replace its full-bleed,
   viewport-fixed glow with a soft one contained to this panel. */
.statement-panel {
  background-color: rgb(var(--color-bg-raw));
  background-image: radial-gradient(
    72% 52% at 74% 32%,
    rgb(41 151 255 / 0.2) 0%,
    transparent 62%
  );
  background-repeat: no-repeat;
  background-attachment: scroll;
}
</style>
