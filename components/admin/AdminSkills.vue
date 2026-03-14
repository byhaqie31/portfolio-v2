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
    showSuccess({ title: 'Saved', message: isEdit ? 'Skill group updated successfully!' : 'Skill group created successfully!' })
  } catch { /* ignore */ }
}

async function remove(id: number) {
  const confirmed = await showConfirm({ title: 'Delete Skill Group', message: 'Are you sure you want to delete this skill group and all its items? This action cannot be undone.', confirmLabel: 'Delete', variant: 'danger' })
  if (!confirmed) return
  await apiFetch(`/api/skills/groups/${id}`, { method: 'DELETE' })
  await load()
  showSuccess({ title: 'Deleted', message: 'Skill group deleted successfully!' })
}

onMounted(load)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <button @click="openAdd" class="btn-primary text-sm">+ Add Group</button>
      <button @click="load" class="btn-ghost text-xs">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="g in groups" :key="g.id" class="card">
        <div class="flex items-center justify-between mb-3">
          <div>
            <span class="text-sm font-medium text-text-primary">{{ g.label }}</span>
            <span class="text-xs text-text-muted font-tech ml-2">Order: {{ g.sort_order }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button @click="openEdit(g)" class="btn-ghost text-xs uppercase w-16">Edit</button>
            <button @click="remove(g.id)" class="btn-ghost text-xs w-16 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/50">Delete</button>
          </div>
        </div>
        <div class="flex flex-wrap gap-1">
          <span v-for="item in g.items" :key="item" class="stack-pill text-2xs">{{ item }}</span>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="absolute inset-0 bg-black/60" @click="showModal = false" />
        <div class="relative bg-bg-secondary rounded-lg border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" style="border-color: rgb(var(--color-border-raw) / 0.2)">
          <h3 class="text-sm font-display text-text-primary uppercase tracking-wider mb-4">
            {{ editing ? 'Edit Skill Group' : 'Add Skill Group' }}
          </h3>

          <form @submit.prevent="save" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Label</label>
                <input v-model="form.label" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
              </div>
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Sort Order</label>
                <input v-model.number="form.sort_order" type="number" class="w-full rounded border bg-bg-secondary text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-2">Skills</label>
              <div class="flex flex-wrap gap-1 mb-2">
                <span v-for="(item, i) in form.items" :key="i" class="inline-flex items-center gap-1 stack-pill text-2xs">
                  {{ item }}
                  <button type="button" @click="removeItem(i)" class="text-red-400 hover:text-red-300 ml-1">&times;</button>
                </span>
              </div>
              <div class="flex gap-2">
                <input v-model="newItem" placeholder="Add skill..." @keydown.enter.prevent="addItem" class="flex-1 rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-3 py-2 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
                <button type="button" @click="addItem" class="btn-ghost text-xs" :class="itemAdded ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : ''">{{ itemAdded ? '✓ Added' : 'Add' }}</button>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-2">
              <button type="button" @click="showModal = false" class="btn-ghost">Cancel</button>
              <button type="submit" class="btn-primary">{{ editing ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
