<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

const { apiFetch } = useAdmin()

// Generate link state
const genName = ref('')
const genRelationship = ref('')
const generating = ref(false)
const showLinkModal = ref(false)
const linkUrl = ref('')
const linkCopied = ref(false)
const copiedTokenId = ref<number | null>(null)

// Feedbacks list state
const feedbacks = ref<any[]>([])
const loading = ref(false)

async function fetchFeedbacks() {
  loading.value = true
  try {
    feedbacks.value = await apiFetch<any[]>('/api/feedback/list')
  } catch { /* ignore */ }
  loading.value = false
}

async function generateLink() {
  if (!genName.value.trim()) return
  generating.value = true
  try {
    const data = await apiFetch<{ url: string }>('/api/feedback/generate', {
      method: 'POST',
      body: { name: genName.value, relationship: genRelationship.value || null },
    })
    linkUrl.value = data.url
    linkCopied.value = false
    showLinkModal.value = true
    genName.value = ''
    genRelationship.value = ''
    fetchFeedbacks()
  } catch { /* ignore */ }
  generating.value = false
}

async function copyUrl() {
  await navigator.clipboard.writeText(linkUrl.value)
  linkCopied.value = true
}

async function copyFeedbackUrl(fb: any) {
  const url = `${window.location.origin}/feedback/${fb.token}`
  await navigator.clipboard.writeText(url)
  copiedTokenId.value = fb.id
  setTimeout(() => (copiedTokenId.value = null), 2000)
}

async function togglePublic(id: number) {
  try {
    const updated = await apiFetch<any>(`/api/feedback/${id}/toggle-public`, { method: 'PATCH' })
    const idx = feedbacks.value.findIndex((f) => f.id === id)
    if (idx !== -1) feedbacks.value[idx] = updated
  } catch { /* ignore */ }
}

function stars(n: number | null) {
  if (!n) return '—'
  return '★'.repeat(n) + '☆'.repeat(5 - n)
}

onMounted(fetchFeedbacks)
</script>

<template>
  <div class="space-y-8">
    <!-- Generate Feedback Link -->
    <div class="card">
      <h3 class="text-sm font-display text-text-primary uppercase tracking-wider mb-4">Generate Feedback Link</h3>
      <form @submit.prevent="generateLink" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Name *</label>
            <input v-model="genName" type="text" placeholder="Person's name" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Relationship</label>
            <div class="relative">
              <select v-model="genRelationship" class="w-full rounded border bg-bg-secondary text-text-primary pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors appearance-none cursor-pointer" style="border-color: rgb(var(--color-border-raw) / 0.2)">
                <option value="">Select...</option>
                <option value="colleague">Colleague</option>
                <option value="client">Client</option>
                <option value="friend">Friend</option>
                <option value="other">Other</option>
              </select>
              <Icon name="fluent:chevron-down-16-filled" size="14" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>
        </div>
        <div class="flex justify-end">
          <button type="submit" :disabled="generating" class="btn-primary disabled:opacity-40">
            {{ generating ? 'Generating...' : 'Generate Link' }}
          </button>
        </div>
      </form>

    </div>

    <!-- References List -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-display text-text-primary uppercase tracking-wider">All References</h3>
        <button @click="fetchFeedbacks" class="btn-ghost text-xs">Refresh</button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="inline-block w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>

      <div v-else-if="feedbacks.length === 0" class="card text-center text-text-muted text-sm">
        No references yet.
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="fb in feedbacks"
          :key="fb.id"
          class="card border-l-2"
          :style="`border-left-color: ${fb.submitted_at ? 'rgb(var(--color-accent-tertiary-raw))' : 'rgb(255, 200, 50)'}`"
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
              <button @click="copyFeedbackUrl(fb)" class="btn-ghost text-xs">
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
    </div>

    <!-- Generated Link Modal -->
    <Teleport to="body">
      <div v-if="showLinkModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60" @click="showLinkModal = false" />
        <div class="relative bg-bg-secondary rounded-lg border w-full max-w-sm p-6" style="border-color: rgb(var(--color-border-raw) / 0.2)">
          <div class="flex items-start gap-4">
            <div class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-green-500/10">
              <Icon name="fluent:checkmark-circle-24-filled" class="w-5 h-5 text-green-400" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-sm font-display text-text-primary uppercase tracking-wider mb-1">Link Generated</h3>
              <p class="text-sm text-text-secondary font-tech mb-3">Copy the feedback link below:</p>
              <div class="p-2 rounded bg-accent/5 border" style="border-color: rgb(var(--color-accent-raw) / 0.3)">
                <code class="text-xs font-tech text-accent break-all">{{ linkUrl }}</code>
              </div>
            </div>
          </div>
          <div class="flex justify-center gap-3 mt-6">
            <button @click="copyUrl" class="btn-ghost text-xs" :class="linkCopied ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : ''">{{ linkCopied ? '✓ Copied' : 'Copy' }}</button>
            <button @click="showLinkModal = false" class="btn-ghost text-xs">Close</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
