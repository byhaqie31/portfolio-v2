<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

const { apiFetch } = useAdmin()
const { confirm: showConfirm, success: showSuccess } = useConfirm()

const loading = ref(true)
const items = ref<any[]>([])
const showModal = ref(false)
const editing = ref<any>(null)

const defaultForm = () => ({ slug: '', period: '', institution: '', location: '', degree: '', cgpa: '', sort_order: 0, is_visible: true })
const form = ref(defaultForm())

useListPreview('education', items, { form, editing, open: showModal, visibleField: 'is_visible' })

async function load() {
  loading.value = true
  try {
    items.value = await apiFetch<any[]>('/api/education')
  } catch { /* ignore */ }
  loading.value = false
}

function openAdd() {
  editing.value = null
  form.value = defaultForm()
  showModal.value = true
}

function openEdit(item: any) {
  editing.value = item
  form.value = { ...item, is_visible: !!item.is_visible }
  showModal.value = true
}

async function save() {
  try {
    if (editing.value) {
      await apiFetch(`/api/education/${editing.value.id}`, { method: 'PUT', body: form.value })
    } else {
      await apiFetch('/api/education', { method: 'POST', body: form.value })
    }
    const isEdit = !!editing.value
    showModal.value = false
    await load()
    showSuccess({ title: 'Saved', message: isEdit ? 'Education updated successfully' : 'Education created successfully' })
  } catch { /* ignore */ }
}

async function remove(id: number) {
  const confirmed = await showConfirm({ title: 'Delete education', message: 'Are you sure you want to delete this education entry? This action cannot be undone.', confirmLabel: 'Delete', variant: 'danger' })
  if (!confirmed) return
  await apiFetch(`/api/education/${id}`, { method: 'DELETE' })
  await load()
  showSuccess({ title: 'Deleted', message: 'Education deleted successfully' })
}

async function toggleVisible(id: number) {
  const updated = await apiFetch(`/api/education/${id}/toggle-visible`, { method: 'PATCH' })
  const idx = items.value.findIndex(e => e.id === id)
  if (idx !== -1) items.value[idx] = { ...items.value[idx], is_visible: updated.is_visible }
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <button @click="openAdd" class="btn-primary text-sm">Add education</button>
      <button @click="load" class="btn-ghost text-sm">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in items" :key="item.id" class="card flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1.5 flex-wrap">
            <span class="text-sm font-semibold text-text-primary">{{ item.degree }}</span>
            <UiBadge :variant="item.is_visible ? 'success' : 'warning'">
              {{ item.is_visible ? 'Visible' : 'Hidden' }}
            </UiBadge>
          </div>
          <p class="text-xs text-text-muted">{{ item.institution }} · {{ item.period }} · CGPA: {{ item.cgpa }}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button @click="toggleVisible(item.id)" class="btn-ghost text-xs w-16">{{ item.is_visible ? 'Hide' : 'Show' }}</button>
          <button @click="openEdit(item)" class="btn-ghost text-xs w-16">Edit</button>
          <button @click="remove(item.id)" class="text-xs font-medium px-3 py-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UiModal v-model:open="showModal" :title="editing ? 'Edit education' : 'Add education'" size="lg">
      <form id="education-form" @submit.prevent="save" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <UiField label="Slug" required>
            <UiInput v-model="form.slug" required />
          </UiField>
          <UiField label="Period" required>
            <UiInput v-model="form.period" required />
          </UiField>
        </div>

        <UiField label="Institution" required>
          <UiInput v-model="form.institution" required />
        </UiField>

        <UiField label="Location" required>
          <UiInput v-model="form.location" required />
        </UiField>

        <UiField label="Degree" required>
          <UiInput v-model="form.degree" required />
        </UiField>

        <div class="grid grid-cols-2 gap-4">
          <UiField label="CGPA" required>
            <UiInput v-model="form.cgpa" required />
          </UiField>
          <UiField label="Sort order">
            <UiInput v-model.number="form.sort_order" type="number" />
          </UiField>
        </div>

        <label class="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input v-model="form.is_visible" type="checkbox" class="accent-[rgb(var(--color-accent-raw))] w-4 h-4" /> Visible
        </label>
      </form>

      <template #actions>
        <button type="button" @click="showModal = false" class="btn-ghost text-sm">Cancel</button>
        <button type="submit" form="education-form" class="btn-primary text-sm">{{ editing ? 'Update' : 'Create' }}</button>
      </template>
    </UiModal>
  </div>
</template>
