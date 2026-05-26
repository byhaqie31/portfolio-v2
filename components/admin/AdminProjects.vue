<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

const { apiFetch } = useAdmin()
const { confirm: showConfirm, success: showSuccess } = useConfirm()

const loading = ref(true)
const projects = ref<any[]>([])
const showModal = ref(false)
const editing = ref<any>(null)

const defaultForm = () => ({
  slug: '', tag: '', featured: false, name: '', description: '', href: '', github_url: '', sort_order: 0, is_visible: true,
  stack: [] as string[], metrics: [] as { value: string; label: string }[],
})
const form = ref(defaultForm())

useListPreview('projects', projects, { form, editing, open: showModal, visibleField: 'is_visible' })

const newStackItem = ref('')
const newMetric = ref({ value: '', label: '' })
const stackAdded = ref(false)
const metricAdded = ref(false)

async function load() {
  loading.value = true
  try {
    projects.value = await apiFetch<any[]>('/api/projects')
  } catch { /* ignore */ }
  loading.value = false
}

function openAdd() {
  editing.value = null
  form.value = defaultForm()
  showModal.value = true
}

async function openEdit(p: any) {
  editing.value = p
  try {
    const data = await apiFetch(`/api/projects/${p.id}`)
    form.value = { ...data, featured: !!data.featured, is_visible: !!data.is_visible, stack: data.stack || [], metrics: data.metrics || [] }
    showModal.value = true
  } catch { /* ignore */ }
}

function addStack() {
  if (!newStackItem.value.trim()) return
  form.value.stack.push(newStackItem.value.trim())
  newStackItem.value = ''
  stackAdded.value = true
  setTimeout(() => (stackAdded.value = false), 1500)
}

function removeStack(i: number) { form.value.stack.splice(i, 1) }

function addMetric() {
  if (!newMetric.value.value || !newMetric.value.label) return
  form.value.metrics.push({ ...newMetric.value })
  newMetric.value = { value: '', label: '' }
  metricAdded.value = true
  setTimeout(() => (metricAdded.value = false), 1500)
}

function removeMetric(i: number) { form.value.metrics.splice(i, 1) }

async function save() {
  try {
    if (editing.value) {
      await apiFetch(`/api/projects/${editing.value.id}`, { method: 'PUT', body: form.value })
    } else {
      await apiFetch('/api/projects', { method: 'POST', body: form.value })
    }
    const isEdit = !!editing.value
    showModal.value = false
    await load()
    showSuccess({ title: 'Saved', message: isEdit ? 'Project updated successfully' : 'Project created successfully' })
  } catch { /* ignore */ }
}

async function remove(id: number) {
  const confirmed = await showConfirm({ title: 'Delete project', message: 'Are you sure you want to delete this project? This action cannot be undone.', confirmLabel: 'Delete', variant: 'danger' })
  if (!confirmed) return
  await apiFetch(`/api/projects/${id}`, { method: 'DELETE' })
  await load()
  showSuccess({ title: 'Deleted', message: 'Project deleted successfully' })
}

async function toggleVisible(id: number) {
  const updated = await apiFetch(`/api/projects/${id}/toggle-visible`, { method: 'PATCH' })
  const idx = projects.value.findIndex(p => p.id === id)
  if (idx !== -1) projects.value[idx] = { ...projects.value[idx], is_visible: updated.is_visible }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <button @click="openAdd" class="btn-primary text-sm">Add project</button>
      <button @click="load" class="btn-ghost text-sm">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="p in projects" :key="p.id" class="card flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <span class="text-sm font-semibold text-text-primary">{{ p.name }}</span>
            <UiBadge v-if="p.featured" variant="accent">Featured</UiBadge>
            <UiBadge :variant="p.is_visible ? 'success' : 'warning'">
              {{ p.is_visible ? 'Visible' : 'Hidden' }}
            </UiBadge>
          </div>
          <p class="text-xs text-text-muted">{{ p.tag }} · Order: {{ p.sort_order }}</p>
          <div v-if="p.stack?.length" class="flex flex-wrap gap-1 mt-2">
            <span v-for="s in p.stack" :key="s" class="skill-tag">{{ s }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button @click="toggleVisible(p.id)" class="btn-ghost text-xs w-16">{{ p.is_visible ? 'Hide' : 'Show' }}</button>
          <button @click="openEdit(p)" class="btn-ghost text-xs w-16">Edit</button>
          <button @click="remove(p.id)" class="text-xs font-medium px-3 py-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UiModal v-model:open="showModal" :title="editing ? 'Edit project' : 'Add project'" size="2xl">
      <form id="project-form" @submit.prevent="save" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <UiField label="Slug" required>
            <UiInput v-model="form.slug" required />
          </UiField>
          <UiField label="Tag" required>
            <UiInput v-model="form.tag" required />
          </UiField>
        </div>

        <UiField label="Name" required>
          <UiInput v-model="form.name" required />
        </UiField>

        <UiField label="Description" required>
          <UiTextarea v-model="form.description" :rows="3" required />
        </UiField>

        <div class="grid grid-cols-2 gap-4">
          <UiField label="URL">
            <UiInput v-model="form.href" type="url" />
          </UiField>
          <UiField label="GitHub URL">
            <UiInput v-model="form.github_url" type="url" />
          </UiField>
        </div>

        <div class="grid grid-cols-3 gap-4">
          <UiField label="Sort order">
            <UiInput v-model.number="form.sort_order" type="number" />
          </UiField>
          <label class="flex items-center gap-2 text-sm text-text-secondary cursor-pointer self-end pb-2.5">
            <input v-model="form.featured" type="checkbox" class="accent-[rgb(var(--color-accent-raw))] w-4 h-4" /> Featured
          </label>
          <label class="flex items-center gap-2 text-sm text-text-secondary cursor-pointer self-end pb-2.5">
            <input v-model="form.is_visible" type="checkbox" class="accent-[rgb(var(--color-accent-raw))] w-4 h-4" /> Visible
          </label>
        </div>

        <!-- Stack -->
        <div>
          <label class="text-sm font-medium text-text-secondary mb-2 block">Tech stack</label>
          <div v-if="form.stack.length" class="flex flex-wrap gap-1.5 mb-2">
            <span v-for="(s, i) in form.stack" :key="i" class="skill-tag inline-flex items-center gap-1">
              {{ s }}
              <button type="button" @click="removeStack(i)" class="text-text-muted hover:text-red-500 ml-1" aria-label="Remove">&times;</button>
            </span>
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <UiInput v-model="newStackItem" placeholder="Add tech…" @keydown.enter.prevent="addStack" />
            </div>
            <button
              type="button"
              @click="addStack"
              class="btn-ghost text-sm"
              :class="stackAdded ? 'border-accent-tertiary/40 bg-accent-tertiary/10 text-accent-tertiary' : ''"
            >
              {{ stackAdded ? '✓ Added' : 'Add' }}
            </button>
          </div>
        </div>

        <!-- Metrics -->
        <div>
          <label class="text-sm font-medium text-text-secondary mb-2 block">Metrics</label>
          <div v-if="form.metrics.length" class="space-y-1 mb-2">
            <div v-for="(m, i) in form.metrics" :key="i" class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-subtle text-sm">
              <span class="font-semibold text-accent">{{ m.value }}</span>
              <span class="text-text-secondary">{{ m.label }}</span>
              <button type="button" @click="removeMetric(i)" class="text-text-muted hover:text-red-500 ml-auto" aria-label="Remove">&times;</button>
            </div>
          </div>
          <div class="flex gap-2">
            <div class="w-24">
              <UiInput v-model="newMetric.value" placeholder="Value" />
            </div>
            <div class="flex-1">
              <UiInput v-model="newMetric.label" placeholder="Label" />
            </div>
            <button
              type="button"
              @click="addMetric"
              class="btn-ghost text-sm"
              :class="metricAdded ? 'border-accent-tertiary/40 bg-accent-tertiary/10 text-accent-tertiary' : ''"
            >
              {{ metricAdded ? '✓ Added' : 'Add' }}
            </button>
          </div>
        </div>
      </form>

      <template #actions>
        <button type="button" @click="showModal = false" class="btn-ghost text-sm">Cancel</button>
        <button type="submit" form="project-form" class="btn-primary text-sm">{{ editing ? 'Update' : 'Create' }}</button>
      </template>
    </UiModal>
  </div>
</template>
