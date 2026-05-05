<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

const { apiFetch } = useAdmin()
const { confirm: showConfirm, success: showSuccess } = useConfirm()

const loading = ref(true)
const saving = ref(false)
const saveStatus = ref<'idle' | 'success' | 'error'>('idle')
const form = ref<any>({})
const languages = ref<any[]>([])
const newLang = ref({ lang: '', level: '' })
const fluencyLevels = ['Native', 'Fluent', 'Advanced', 'Intermediate', 'Beginner']
const langAdded = ref(false)

useFormPreview('personal', form)

async function load() {
  loading.value = true
  try {
    const data = await apiFetch('/api/personal')
    const { languages: langs, ...personal } = data
    form.value = personal
    languages.value = langs || []
  } catch { /* ignore */ }
  loading.value = false
}

async function save() {
  saving.value = true
  saveStatus.value = 'idle'
  try {
    await apiFetch('/api/personal', { method: 'PUT', body: form.value })
    saveStatus.value = 'success'
  } catch {
    saveStatus.value = 'error'
  }
  saving.value = false
  setTimeout(() => (saveStatus.value = 'idle'), 2500)
}

async function addLang() {
  if (!newLang.value.lang || !newLang.value.level) return
  try {
    await apiFetch('/api/languages', { method: 'POST', body: { ...newLang.value, sort_order: languages.value.length + 1 } })
    newLang.value = { lang: '', level: '' }
    // Refresh languages without resetting loading (avoids scroll jump)
    const data = await apiFetch('/api/personal')
    languages.value = data.languages || []
    langAdded.value = true
    setTimeout(() => (langAdded.value = false), 2000)
  } catch { /* ignore */ }
}

async function deleteLang(id: number) {
  const confirmed = await showConfirm({ title: 'Delete Language', message: 'Are you sure you want to delete this language?', confirmLabel: 'Delete', variant: 'danger' })
  if (!confirmed) return
  await apiFetch(`/api/languages/${id}`, { method: 'DELETE' })
  showSuccess({ title: 'Deleted', message: 'Language deleted successfully' })
  const data = await apiFetch('/api/personal')
  languages.value = data.languages || []
}

onMounted(load)
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-8">
      <!-- Personal Info Form -->
      <form @submit.prevent="save" class="card space-y-4">
        <h3 class="text-sm font-display text-text-primary uppercase tracking-wider mb-2">Personal Info</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Full Name</label>
            <input v-model="form.name" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Short Name</label>
            <input v-model="form.short_name" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Role</label>
          <input v-model="form.role" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
        </div>

        <div>
          <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Summary</label>
          <textarea v-model="form.summary" rows="2" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
        </div>

        <div>
          <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Bio (paragraph 1)</label>
          <textarea v-model="form.bio_1" rows="4" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
        </div>

        <div>
          <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Bio (paragraph 2)</label>
          <textarea v-model="form.bio_2" rows="4" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Location</label>
            <input v-model="form.location" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Email</label>
            <input v-model="form.email" type="email" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Mobile</label>
            <input v-model="form.mobile" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Website</label>
            <input v-model="form.website" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">GitHub URL</label>
            <input v-model="form.github" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">LinkedIn URL</label>
            <input v-model="form.linkedin" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Available For</label>
            <input v-model="form.available_for" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
          <div>
            <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Focus</label>
            <input v-model="form.focus" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          </div>
        </div>

        <div class="flex items-center justify-end gap-3">
          <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-x-2" enter-to-class="opacity-100 translate-x-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <span v-if="saveStatus === 'success'" class="inline-flex items-center gap-1.5 text-sm font-tech text-green-400">
              <Icon name="fluent:checkmark-circle-24-filled" size="16" /> Saved Successfully!
            </span>
            <span v-else-if="saveStatus === 'error'" class="inline-flex items-center gap-1.5 text-sm font-tech text-red-400">
              <Icon name="fluent:error-circle-24-filled" size="16" /> Error saving
            </span>
          </Transition>
          <button type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>

      <!-- Languages -->
      <div class="card">
        <h3 class="text-sm font-display text-text-primary uppercase tracking-wider mb-4">Languages</h3>

        <div class="space-y-2 mb-4">
          <div v-for="lang in languages" :key="lang.id" class="flex items-center gap-3 px-3 py-2 rounded bg-bg-secondary" style="border: 1px solid rgb(var(--color-border-raw) / 0.1)">
            <span class="text-sm text-text-primary flex-1">{{ lang.lang }}</span>
            <span class="text-xs font-tech text-text-muted">{{ lang.level }}</span>
            <button @click="deleteLang(lang.id)" class="text-red-400 hover:text-red-300 transition-colors"><Icon name="fluent:delete-16-filled" size="16" /></button>
          </div>
        </div>

        <div class="flex gap-2">
          <input v-model="newLang.lang" placeholder="Language" class="flex-1 rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-3 py-2 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
          <div class="relative flex-1">
            <select v-model="newLang.level" class="w-full rounded border bg-bg-secondary text-text-primary pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-accent/60 transition-colors appearance-none cursor-pointer" style="border-color: rgb(var(--color-border-raw) / 0.2)">
              <option value="" disabled>Fluency</option>
              <option v-for="level in fluencyLevels" :key="level" :value="level">{{ level }}</option>
            </select>
            <Icon name="fluent:chevron-down-16-filled" size="14" class="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
          <button @click="addLang" class="btn-ghost text-xs" :class="langAdded ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : ''">{{ langAdded ? '✓ Added' : 'Add' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>
