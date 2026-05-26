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
    const data = await apiFetch('/api/personal')
    languages.value = data.languages || []
    langAdded.value = true
    setTimeout(() => (langAdded.value = false), 2000)
  } catch { /* ignore */ }
}

async function deleteLang(id: number) {
  const confirmed = await showConfirm({ title: 'Delete language', message: 'Are you sure you want to delete this language?', confirmLabel: 'Delete', variant: 'danger' })
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
      <div class="inline-block w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-8">
      <!-- Personal Info Form -->
      <form @submit.prevent="save" class="card space-y-5">
        <h3 class="text-base font-semibold text-text-primary">Personal info</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UiField label="Full name">
            <UiInput v-model="form.name" />
          </UiField>
          <UiField label="Short name">
            <UiInput v-model="form.short_name" />
          </UiField>
        </div>

        <UiField label="Role">
          <UiInput v-model="form.role" />
        </UiField>

        <UiField label="Summary">
          <UiTextarea v-model="form.summary" :rows="2" />
        </UiField>

        <UiField label="Bio (paragraph 1)">
          <UiTextarea v-model="form.bio_1" :rows="4" />
        </UiField>

        <UiField label="Bio (paragraph 2)">
          <UiTextarea v-model="form.bio_2" :rows="4" />
        </UiField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UiField label="Location">
            <UiInput v-model="form.location" />
          </UiField>
          <UiField label="Email">
            <UiInput v-model="form.email" type="email" />
          </UiField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UiField label="Mobile">
            <UiInput v-model="form.mobile" />
          </UiField>
          <UiField label="Website">
            <UiInput v-model="form.website" type="url" />
          </UiField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UiField label="GitHub URL">
            <UiInput v-model="form.github" type="url" />
          </UiField>
          <UiField label="LinkedIn URL">
            <UiInput v-model="form.linkedin" type="url" />
          </UiField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UiField label="Available for">
            <UiInput v-model="form.available_for" />
          </UiField>
          <UiField label="Focus">
            <UiInput v-model="form.focus" />
          </UiField>
        </div>

        <div class="flex items-center justify-end gap-3 pt-2">
          <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 translate-x-2" enter-to-class="opacity-100 translate-x-0" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100" leave-to-class="opacity-0">
            <span v-if="saveStatus === 'success'" class="inline-flex items-center gap-1.5 text-sm text-accent-tertiary">
              <Icon name="fluent:checkmark-circle-24-filled" size="16" /> Saved
            </span>
            <span v-else-if="saveStatus === 'error'" class="inline-flex items-center gap-1.5 text-sm text-red-500">
              <Icon name="fluent:error-circle-24-filled" size="16" /> Error saving
            </span>
          </Transition>
          <button type="submit" :disabled="saving" class="btn-primary">
            {{ saving ? 'Saving…' : 'Save changes' }}
          </button>
        </div>
      </form>

      <!-- Languages -->
      <div class="card space-y-4">
        <h3 class="text-base font-semibold text-text-primary">Languages</h3>

        <div v-if="languages.length" class="flex flex-col gap-2">
          <div
            v-for="lang in languages"
            :key="lang.id"
            class="flex items-center gap-3 px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle"
          >
            <span class="text-sm text-text-primary flex-1">{{ lang.lang }}</span>
            <UiBadge variant="neutral">{{ lang.level }}</UiBadge>
            <button
              type="button"
              @click="deleteLang(lang.id)"
              class="text-text-muted hover:text-red-500 transition-colors"
              aria-label="Delete language"
            >
              <Icon name="fluent:delete-16-filled" size="16" />
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-2">
          <div class="flex-1">
            <UiInput v-model="newLang.lang" placeholder="Language" />
          </div>
          <div class="flex-1">
            <UiSelect v-model="newLang.level" placeholder="Fluency">
              <option v-for="level in fluencyLevels" :key="level" :value="level">{{ level }}</option>
            </UiSelect>
          </div>
          <button
            type="button"
            @click="addLang"
            class="btn-ghost text-sm"
            :class="langAdded ? 'border-accent-tertiary/40 bg-accent-tertiary/10 text-accent-tertiary' : ''"
          >
            {{ langAdded ? '✓ Added' : 'Add' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
