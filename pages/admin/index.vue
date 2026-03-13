<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

definePageMeta({ layout: 'dashboard' })

const { isAuthenticated, login, logout, restoreSession } = useAdmin()
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
  <div class="min-h-screen px-4 py-8 max-w-6xl mx-auto">

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
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-display text-text-primary">Portfolio Admin</h1>
        <button @click="handleLogout" class="btn-ghost inline-flex items-center gap-2 text-sm">
          <Icon name="fluent:sign-out-20-filled" size="14" />
          Logout
        </button>
      </div>

      <div class="flex flex-col md:flex-row gap-6">
        <!-- Sidebar Nav -->
        <nav class="md:w-48 shrink-0">
          <div class="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
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

        <!-- Content Area -->
        <main class="flex-1 min-w-0">
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
      </div>
    </div>

  </div>
</template>
