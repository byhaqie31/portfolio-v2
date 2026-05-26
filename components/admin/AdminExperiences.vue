<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

const { apiFetch } = useAdmin()
const { confirm: showConfirm, success: showSuccess } = useConfirm()

const loading = ref(true)
const experiences = ref<any[]>([])
const showModal = ref(false)
const editing = ref<any>(null)

const defaultForm = () => ({
  slug: '', period: '', company: '', location: '', role: '', is_current: false, description: '', sort_order: 0, is_visible: true,
  bullets: [] as string[], tags: [] as string[],
})
const form = ref(defaultForm())

useListPreview('experiences', experiences, { form, editing, open: showModal, visibleField: 'is_visible' })

const newBullet = ref('')
const newTag = ref('')
const bulletAdded = ref(false)
const tagAdded = ref(false)

async function load() {
  loading.value = true
  try {
    experiences.value = await apiFetch<any[]>('/api/experiences')
  } catch { /* ignore */ }
  loading.value = false
}

function openAdd() {
  editing.value = null
  form.value = defaultForm()
  showModal.value = true
}

async function openEdit(e: any) {
  editing.value = e
  try {
    const data = await apiFetch(`/api/experiences/${e.id}`)
    form.value = { ...data, is_current: !!data.is_current, is_visible: !!data.is_visible, bullets: data.bullets || [], tags: data.tags || [] }
    showModal.value = true
  } catch { /* ignore */ }
}

function addBullet() {
  if (!newBullet.value.trim()) return
  form.value.bullets.push(newBullet.value.trim())
  newBullet.value = ''
  bulletAdded.value = true
  setTimeout(() => (bulletAdded.value = false), 1500)
}

function removeBullet(i: number) { form.value.bullets.splice(i, 1) }

function addTag() {
  if (!newTag.value.trim()) return
  form.value.tags.push(newTag.value.trim())
  newTag.value = ''
  tagAdded.value = true
  setTimeout(() => (tagAdded.value = false), 1500)
}

function removeTag(i: number) { form.value.tags.splice(i, 1) }

async function save() {
  try {
    if (editing.value) {
      await apiFetch(`/api/experiences/${editing.value.id}`, { method: 'PUT', body: form.value })
    } else {
      await apiFetch('/api/experiences', { method: 'POST', body: form.value })
    }
    const isEdit = !!editing.value
    showModal.value = false
    await load()
    showSuccess({ title: 'Saved', message: isEdit ? 'Experience updated successfully' : 'Experience created successfully' })
  } catch { /* ignore */ }
}

async function remove(id: number) {
  const confirmed = await showConfirm({ title: 'Delete experience', message: 'Are you sure you want to delete this experience? This action cannot be undone.', confirmLabel: 'Delete', variant: 'danger' })
  if (!confirmed) return
  await apiFetch(`/api/experiences/${id}`, { method: 'DELETE' })
  await load()
  showSuccess({ title: 'Deleted', message: 'Experience deleted successfully' })
}

async function toggleVisible(id: number) {
  const updated = await apiFetch(`/api/experiences/${id}/toggle-visible`, { method: 'PATCH' })
  const idx = experiences.value.findIndex(e => e.id === id)
  if (idx !== -1) experiences.value[idx] = { ...experiences.value[idx], is_visible: updated.is_visible }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <button @click="openAdd" class="btn-primary text-sm">Add experience</button>
      <button @click="load" class="btn-ghost text-sm">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="e in experiences" :key="e.id" class="card flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <span class="text-sm font-semibold text-text-primary">{{ e.role }}</span>
            <UiBadge v-if="e.is_current" variant="success">Current</UiBadge>
            <UiBadge :variant="e.is_visible ? 'success' : 'warning'">
              {{ e.is_visible ? 'Visible' : 'Hidden' }}
            </UiBadge>
          </div>
          <p class="text-xs text-text-muted">{{ e.company }} · {{ e.period }} · Order: {{ e.sort_order }}</p>
          <div v-if="e.tags?.length" class="flex flex-wrap gap-1 mt-2">
            <span v-for="t in e.tags" :key="t" class="skill-tag">{{ t }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button @click="toggleVisible(e.id)" class="btn-ghost text-xs w-16">{{ e.is_visible ? 'Hide' : 'Show' }}</button>
          <button @click="openEdit(e)" class="btn-ghost text-xs w-16">Edit</button>
          <button @click="remove(e.id)" class="text-xs font-medium px-3 py-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UiModal v-model:open="showModal" :title="editing ? 'Edit experience' : 'Add experience'" size="2xl">
      <form id="experience-form" @submit.prevent="save" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left: basic info -->
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <UiField label="Slug" required>
              <UiInput v-model="form.slug" required />
            </UiField>
            <UiField label="Period" required>
              <UiInput v-model="form.period" required />
            </UiField>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UiField label="Company" required>
              <UiInput v-model="form.company" required />
            </UiField>
            <UiField label="Location" required>
              <UiInput v-model="form.location" required />
            </UiField>
          </div>

          <UiField label="Role" required>
            <UiInput v-model="form.role" required />
          </UiField>

          <UiField label="Description" required>
            <UiTextarea v-model="form.description" :rows="3" required />
          </UiField>

          <!-- Tags -->
          <div>
            <label class="text-sm font-medium text-text-secondary mb-2 block">Tags</label>
            <div v-if="form.tags.length" class="flex flex-wrap gap-1.5 mb-2">
              <span v-for="(t, i) in form.tags" :key="i" class="skill-tag inline-flex items-center gap-1">
                {{ t }}
                <button type="button" @click="removeTag(i)" class="text-text-muted hover:text-red-500 ml-1" aria-label="Remove">&times;</button>
              </span>
            </div>
            <div class="flex gap-2">
              <div class="flex-1">
                <UiInput v-model="newTag" placeholder="Add tag…" @keydown.enter.prevent="addTag" />
              </div>
              <button
                type="button"
                @click="addTag"
                class="btn-ghost text-sm"
                :class="tagAdded ? 'border-accent-tertiary/40 bg-accent-tertiary/10 text-accent-tertiary' : ''"
              >
                {{ tagAdded ? '✓ Added' : 'Add' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Right: bullets + settings -->
        <div class="space-y-4">
          <!-- Bullets -->
          <div>
            <label class="text-sm font-medium text-text-secondary mb-2 block">Bullets</label>
            <div v-if="form.bullets.length" class="space-y-1.5 mb-2">
              <div v-for="(b, i) in form.bullets" :key="i" class="flex items-start gap-2 px-3 py-2 rounded-lg bg-bg-secondary border border-border-subtle text-sm text-text-secondary">
                <span class="flex-1">{{ b }}</span>
                <button type="button" @click="removeBullet(i)" class="text-text-muted hover:text-red-500 shrink-0" aria-label="Remove">&times;</button>
              </div>
            </div>
            <div v-if="form.bullets.length < 5" class="flex gap-2">
              <div class="flex-1">
                <UiTextarea v-model="newBullet" :rows="2" placeholder="Add bullet point…" />
              </div>
              <button
                type="button"
                @click="addBullet"
                class="btn-ghost text-sm self-end"
                :class="bulletAdded ? 'border-accent-tertiary/40 bg-accent-tertiary/10 text-accent-tertiary' : ''"
              >
                {{ bulletAdded ? '✓ Added' : 'Add' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-4">
            <UiField label="Sort order">
              <UiInput v-model.number="form.sort_order" type="number" />
            </UiField>
            <label class="flex items-center gap-2 text-sm text-text-secondary cursor-pointer self-end pb-2.5">
              <input v-model="form.is_current" type="checkbox" class="accent-[rgb(var(--color-accent-raw))] w-4 h-4" /> Current
            </label>
            <label class="flex items-center gap-2 text-sm text-text-secondary cursor-pointer self-end pb-2.5">
              <input v-model="form.is_visible" type="checkbox" class="accent-[rgb(var(--color-accent-raw))] w-4 h-4" /> Visible
            </label>
          </div>
        </div>
      </form>

      <template #actions>
        <button type="button" @click="showModal = false" class="btn-ghost text-sm">Cancel</button>
        <button type="submit" form="experience-form" class="btn-primary text-sm">{{ editing ? 'Update' : 'Create' }}</button>
      </template>
    </UiModal>
  </div>
</template>
