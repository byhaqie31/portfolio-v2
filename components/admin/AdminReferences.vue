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

useListPreview('references', feedbacks, { visibleField: 'is_public' })

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

onMounted(fetchFeedbacks)
</script>

<template>
  <div class="space-y-8">
    <!-- Generate Feedback Link -->
    <div class="card space-y-4">
      <h3 class="text-base font-semibold text-text-primary">Generate feedback link</h3>
      <form @submit.prevent="generateLink" class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UiField label="Name" required>
            <UiInput v-model="genName" type="text" placeholder="Person's name" required />
          </UiField>
          <UiField label="Relationship">
            <UiSelect v-model="genRelationship" placeholder="Select…">
              <option value="colleague">Colleague</option>
              <option value="client">Client</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </UiSelect>
          </UiField>
        </div>
        <div class="flex justify-end">
          <button type="submit" :disabled="generating" class="btn-primary text-sm disabled:opacity-40">
            {{ generating ? 'Generating…' : 'Generate link' }}
          </button>
        </div>
      </form>
    </div>

    <!-- References List -->
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-base font-semibold text-text-primary">All references</h3>
        <button @click="fetchFeedbacks" class="btn-ghost text-sm">Refresh</button>
      </div>

      <div v-if="loading" class="text-center py-8">
        <div class="inline-block w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
      </div>

      <div v-else-if="feedbacks.length === 0" class="card text-center text-text-muted text-sm">
        No references yet.
      </div>

      <div v-else class="space-y-3">
        <div v-for="fb in feedbacks" :key="fb.id" class="card">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <span class="font-semibold text-text-primary text-sm">{{ fb.name }}</span>
                <span v-if="fb.respondent_name" class="text-text-secondary text-xs">by {{ fb.respondent_name }}</span>
                <UiBadge v-if="fb.relationship" variant="neutral">{{ fb.relationship }}</UiBadge>
                <UiBadge :variant="fb.submitted_at ? 'success' : 'warning'">
                  {{ fb.submitted_at ? 'Submitted' : 'Pending' }}
                </UiBadge>
              </div>
              <div v-if="fb.rating" class="inline-flex items-center gap-0.5 text-accent mb-1.5">
                <Icon
                  v-for="i in 5"
                  :key="i"
                  :name="i <= fb.rating ? 'fluent:star-16-filled' : 'fluent:star-16-regular'"
                  size="14"
                  :class="i <= fb.rating ? 'text-accent' : 'text-text-muted/40'"
                />
              </div>
              <p v-if="fb.message && fb.submitted_at" class="text-text-secondary text-sm line-clamp-2 leading-relaxed">{{ fb.message }}</p>
              <p v-if="fb.position || fb.company" class="text-text-muted text-xs mt-1.5">
                {{ [fb.position, fb.company].filter(Boolean).join(' at ') }}
              </p>
              <p v-if="fb.email" class="text-text-muted text-xs mt-0.5">{{ fb.email }}</p>
            </div>
            <div v-if="!fb.submitted_at" class="shrink-0">
              <button @click="copyFeedbackUrl(fb)" class="btn-ghost text-xs">
                {{ copiedTokenId === fb.id ? 'Copied!' : 'Copy URL' }}
              </button>
            </div>
            <div v-if="fb.submitted_at" class="flex items-center gap-2 shrink-0">
              <span class="text-xs" :class="fb.is_public ? 'text-accent' : 'text-text-muted'">
                {{ fb.is_public ? 'Public' : 'Private' }}
              </span>
              <button
                @click="togglePublic(fb.id)"
                class="relative w-10 h-5 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                :class="fb.is_public ? 'bg-accent' : 'bg-bg-tertiary'"
                :aria-label="fb.is_public ? 'Make private' : 'Make public'"
              >
                <span
                  class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                  :class="fb.is_public ? 'translate-x-5' : 'translate-x-0'"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Generated Link Modal -->
    <UiModal v-model:open="showLinkModal" title="Link generated" size="md">
      <div class="space-y-4">
        <p class="text-sm text-text-secondary">Copy the feedback link below and share it with the person you're requesting feedback from.</p>
        <div class="p-3 rounded-lg bg-bg-secondary border border-border-subtle">
          <code class="text-xs text-accent break-all">{{ linkUrl }}</code>
        </div>
      </div>

      <template #actions>
        <button @click="showLinkModal = false" class="btn-ghost text-sm">Close</button>
        <button
          @click="copyUrl"
          class="btn-primary text-sm"
          :class="linkCopied ? 'bg-accent-tertiary! text-text-inverse!' : ''"
        >
          {{ linkCopied ? '✓ Copied' : 'Copy link' }}
        </button>
      </template>
    </UiModal>
  </div>
</template>
