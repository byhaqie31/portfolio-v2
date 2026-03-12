<script setup lang="ts">
definePageMeta({ layout: 'default' })

const adminKey = ref('')
const authenticated = ref(false)

const genName = ref('')
const genRelationship = ref('')
const generatedUrl = ref('')
const generating = ref(false)
const copied = ref(false)
const copiedTokenId = ref<number | null>(null)

const feedbacks = ref<any[]>([])
const loading = ref(false)

onMounted(() => {
  const stored = sessionStorage.getItem('admin_key')
  if (stored) {
    adminKey.value = stored
    authenticated.value = true
    fetchFeedbacks()
  }
})

function login() {
  if (!adminKey.value.trim()) return
  sessionStorage.setItem('admin_key', adminKey.value)
  authenticated.value = true
  fetchFeedbacks()
}

async function fetchFeedbacks() {
  loading.value = true
  try {
    feedbacks.value = await $fetch<any[]>('/api/feedback/list', {
      headers: { 'x-admin-key': adminKey.value },
    })
  } catch {
    authenticated.value = false
    sessionStorage.removeItem('admin_key')
  } finally {
    loading.value = false
  }
}

async function generateLink() {
  if (!genName.value.trim()) return
  generating.value = true
  generatedUrl.value = ''
  try {
    const data = await $fetch<{ url: string }>('/api/feedback/generate', {
      method: 'POST',
      headers: { 'x-admin-key': adminKey.value },
      body: {
        name: genName.value,
        relationship: genRelationship.value || null,
      },
    })
    generatedUrl.value = data.url
    genName.value = ''
    genRelationship.value = ''
    fetchFeedbacks()
  } catch {
    // handle silently
  } finally {
    generating.value = false
  }
}

async function copyUrl() {
  await navigator.clipboard.writeText(generatedUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}

async function copyFeedbackUrl(fb: any) {
  const url = `${window.location.origin}/feedback/${fb.token}`
  await navigator.clipboard.writeText(url)
  copiedTokenId.value = fb.id
  setTimeout(() => (copiedTokenId.value = null), 2000)
}

async function togglePublic(id: number) {
  try {
    const updated = await $fetch<any>(`/api/feedback/${id}/toggle-public`, {
      method: 'PATCH',
      headers: { 'x-admin-key': adminKey.value },
    })
    const idx = feedbacks.value.findIndex((f) => f.id === id)
    if (idx !== -1) feedbacks.value[idx] = updated
  } catch {
    // handle silently
  }
}

function stars(n: number | null) {
  if (!n) return '—'
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}
</script>

<template>
  <div class="min-h-screen px-4 py-16 max-w-4xl mx-auto">

    <!-- Login -->
    <div v-if="!authenticated" class="flex items-center justify-center min-h-[60vh]">
      <div class="card w-full max-w-sm">
        <h1 class="text-xl font-display text-text-primary text-center mb-6">Admin Access</h1>
        <form @submit.prevent="login" class="space-y-4">
          <input
            v-model="adminKey"
            type="password"
            placeholder="Enter admin key"
            class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-3 text-sm focus:outline-none focus:border-accent/60 transition-colors"
            style="border-color: rgb(var(--color-border) / 0.2)"
          />
          <button type="submit" class="btn-primary w-full">Authenticate</button>
        </form>
      </div>
    </div>

    <!-- Dashboard -->
    <div v-else class="space-y-10">
      <h1 class="text-2xl font-display text-text-primary">Feedback Dashboard</h1>

      <!-- Generate Link Section -->
      <section class="card">
        <h2 class="text-lg font-display text-text-primary mb-4">Generate Feedback Link</h2>
        <form @submit.prevent="generateLink" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Name *</label>
              <input
                v-model="genName"
                type="text"
                placeholder="Person's name"
                required
                class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors"
                style="border-color: rgb(var(--color-border) / 0.2)"
              />
            </div>
            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Relationship</label>
              <select
                v-model="genRelationship"
                class="w-full rounded border bg-bg-secondary text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors"
                style="border-color: rgb(var(--color-border) / 0.2)"
              >
                <option value="">Select...</option>
                <option value="colleague">Colleague</option>
                <option value="client">Client</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <button type="submit" :disabled="generating" class="btn-primary disabled:opacity-40">
            {{ generating ? 'Generating...' : 'Generate Link' }}
          </button>
        </form>

        <!-- Generated URL -->
        <div v-if="generatedUrl" class="mt-4 p-3 rounded bg-accent/5 border flex items-center gap-3" style="border-color: rgb(var(--color-accent) / 0.3)">
          <code class="text-xs font-tech text-accent flex-1 break-all">{{ generatedUrl }}</code>
          <button @click="copyUrl" class="btn-ghost text-xs shrink-0">
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
      </section>

      <!-- Feedbacks List -->
      <section>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-display text-text-primary">All Feedbacks</h2>
          <button @click="fetchFeedbacks" class="btn-ghost text-xs">Refresh</button>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="inline-block w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        </div>

        <div v-else-if="feedbacks.length === 0" class="card text-center text-text-muted text-sm">
          No feedbacks yet.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="fb in feedbacks"
            :key="fb.id"
            class="card"
            :class="fb.submitted_at ? 'border-l-2' : 'border-l-2'"
            :style="`border-left-color: ${fb.submitted_at ? 'rgb(var(--color-accent-tertiary))' : 'rgb(255, 200, 50)'}`"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="font-medium text-text-primary text-sm">{{ fb.name }}</span>
                  <span v-if="fb.respondent_name" class="text-text-secondary text-xs font-tech">by {{ fb.respondent_name }}</span>
                  <span v-if="fb.relationship" class="stack-pill">{{ fb.relationship }}</span>
                  <span
                    class="text-2xs font-tech px-2 py-0.5 rounded"
                    :class="fb.submitted_at ? 'bg-accent-tertiary/10 text-accent-tertiary' : 'bg-yellow-500/10 text-yellow-500'"
                  >
                    {{ fb.submitted_at ? 'Submitted' : 'Pending' }}
                  </span>
                </div>
                <div v-if="fb.rating" class="text-accent text-sm mb-1">{{ stars(fb.rating) }}</div>
                <p v-if="fb.message && fb.submitted_at" class="text-text-secondary text-sm line-clamp-2">{{ fb.message }}</p>
                <p v-if="fb.position || fb.company" class="text-text-muted text-xs mt-1 font-tech">
                  {{ [fb.position, fb.company].filter(Boolean).join(' at ') }}
                </p>
                <p v-if="fb.email" class="text-text-muted text-xs mt-1 font-tech">{{ fb.email }}</p>
              </div>
              <div v-if="!fb.submitted_at" class="shrink-0">
                <button
                  @click="copyFeedbackUrl(fb)"
                  class="btn-ghost text-xs"
                >
                  {{ copiedTokenId === fb.id ? 'Copied!' : 'Copy URL' }}
                </button>
              </div>
              <div v-if="fb.submitted_at" class="flex items-center gap-2 shrink-0">
                <span class="text-2xs font-tech" :class="fb.is_public ? 'text-accent' : 'text-text-muted'">
                  {{ fb.is_public ? 'Public' : 'Private' }}
                </span>
                <button
                  @click="togglePublic(fb.id)"
                  class="relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none"
                  :class="fb.is_public ? 'bg-accent/30' : 'bg-surface-overlay'"
                >
                  <span
                    class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-transform duration-200"
                    :class="fb.is_public ? 'translate-x-5 bg-accent' : 'translate-x-0 bg-text-muted'"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

  </div>
</template>
