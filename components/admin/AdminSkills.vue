<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

const { apiFetch } = useAdmin()
const { confirm: showConfirm, success: showSuccess } = useConfirm()

const loading = ref(true)
const groups = ref<any[]>([])
const showModal = ref(false)
const editing = ref<any>(null)

const defaultForm = () => ({ label: '', sort_order: 0, items: [] as string[] })
const form = ref(defaultForm())

useListPreview('skills', groups, { form, editing, open: showModal })
const newItem = ref('')
const itemAdded = ref(false)

async function load() {
  loading.value = true
  try {
    groups.value = await apiFetch<any[]>('/api/skills')
  } catch { /* ignore */ }
  loading.value = false
}

function openAdd() {
  editing.value = null
  form.value = defaultForm()
  showModal.value = true
}

function openEdit(g: any) {
  editing.value = g
  form.value = { label: g.label, sort_order: g.sort_order, items: [...(g.items || [])] }
  showModal.value = true
}

function addItem() {
  if (!newItem.value.trim()) return
  form.value.items.push(newItem.value.trim())
  newItem.value = ''
  itemAdded.value = true
  setTimeout(() => (itemAdded.value = false), 1500)
}

function removeItem(i: number) { form.value.items.splice(i, 1) }

async function save() {
  try {
    if (editing.value) {
      await apiFetch(`/api/skills/groups/${editing.value.id}`, { method: 'PUT', body: form.value })
    } else {
      await apiFetch('/api/skills/groups', { method: 'POST', body: form.value })
    }
    const isEdit = !!editing.value
    showModal.value = false
    await load()
    showSuccess({ title: 'Saved', message: isEdit ? 'Skill group updated successfully' : 'Skill group created successfully' })
  } catch { /* ignore */ }
}

async function remove(id: number) {
  const confirmed = await showConfirm({ title: 'Delete skill group', message: 'Are you sure you want to delete this skill group and all its items? This action cannot be undone.', confirmLabel: 'Delete', variant: 'danger' })
  if (!confirmed) return
  await apiFetch(`/api/skills/groups/${id}`, { method: 'DELETE' })
  await load()
  showSuccess({ title: 'Deleted', message: 'Skill group deleted successfully' })
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <button @click="openAdd" class="btn-primary text-sm">Add group</button>
      <button @click="load" class="btn-ghost text-sm">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="g in groups" :key="g.id" class="card">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-baseline gap-2">
            <span class="text-sm font-semibold text-text-primary">{{ g.label }}</span>
            <span class="text-xs text-text-muted">Order: {{ g.sort_order }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button @click="openEdit(g)" class="btn-ghost text-xs w-16">Edit</button>
            <button @click="remove(g.id)" class="text-xs font-medium px-3 py-2 rounded-full text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors">Delete</button>
          </div>
        </div>
        <div class="flex flex-wrap gap-1.5">
          <span v-for="item in g.items" :key="item" class="skill-tag">{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UiModal v-model:open="showModal" :title="editing ? 'Edit skill group' : 'Add skill group'" size="lg">
      <form id="skills-form" @submit.prevent="save" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <UiField label="Label" required>
            <UiInput v-model="form.label" required />
          </UiField>
          <UiField label="Sort order">
            <UiInput v-model.number="form.sort_order" type="number" />
          </UiField>
        </div>

        <div>
          <label class="text-sm font-medium text-text-secondary mb-2 block">Skills</label>
          <div v-if="form.items.length" class="flex flex-wrap gap-1.5 mb-2">
            <span v-for="(item, i) in form.items" :key="i" class="skill-tag inline-flex items-center gap-1">
              {{ item }}
              <button type="button" @click="removeItem(i)" class="text-text-muted hover:text-red-500 ml-1" aria-label="Remove">&times;</button>
            </span>
          </div>
          <div class="flex gap-2">
            <div class="flex-1">
              <UiInput v-model="newItem" placeholder="Add skill…" @keydown.enter.prevent="addItem" />
            </div>
            <button
              type="button"
              @click="addItem"
              class="btn-ghost text-sm"
              :class="itemAdded ? 'border-accent-tertiary/40 bg-accent-tertiary/10 text-accent-tertiary' : ''"
            >
              {{ itemAdded ? '✓ Added' : 'Add' }}
            </button>
          </div>
        </div>
      </form>

      <template #actions>
        <button type="button" @click="showModal = false" class="btn-ghost text-sm">Cancel</button>
        <button type="submit" form="skills-form" class="btn-primary text-sm">{{ editing ? 'Update' : 'Create' }}</button>
      </template>
    </UiModal>
  </div>
</template>
