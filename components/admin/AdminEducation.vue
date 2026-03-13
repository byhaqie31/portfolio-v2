<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

const { apiFetch } = useAdmin()
const toast = useToast()
const { confirm: showConfirm } = useConfirm()

const loading = ref(true)
const items = ref<any[]>([])
const showModal = ref(false)
const editing = ref<any>(null)

const defaultForm = () => ({ slug: '', period: '', institution: '', location: '', degree: '', cgpa: '', sort_order: 0, is_visible: true })
const form = ref(defaultForm())

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
    showModal.value = false
    toast.add({ title: 'Education saved successfully!', icon: 'fluent:checkmark-circle-24-regular', color: 'success' })
    await load()
  } catch { toast.add({ title: 'Error saving education', icon: 'fluent:error-circle-24-regular', color: 'error' }) }
}

async function remove(id: number) {
  const confirmed = await showConfirm({ title: 'Delete Education', message: 'Are you sure you want to delete this education entry? This action cannot be undone.', confirmLabel: 'Delete', variant: 'danger' })
  if (!confirmed) return
  await apiFetch(`/api/education/${id}`, { method: 'DELETE' })
  toast.add({ title: 'Education deleted', icon: 'fluent:checkmark-circle-24-regular', color: 'success' })
  await load()
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
      <button @click="openAdd" class="btn-primary text-sm">+ Add Education</button>
      <button @click="load" class="btn-ghost text-xs">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in items" :key="item.id" class="card flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-sm font-medium text-text-primary">{{ item.degree }}</span>
            <span class="text-2xs font-tech px-2 py-0.5 rounded" :class="item.is_visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'">
              {{ item.is_visible ? 'Visible' : 'Hidden' }}
            </span>
          </div>
          <p class="text-xs text-text-muted font-tech">{{ item.institution }} · {{ item.period }} · CGPA: {{ item.cgpa }}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button @click="toggleVisible(item.id)" class="btn-ghost text-xs uppercase w-16">{{ item.is_visible ? 'Hide' : 'Show' }}</button>
          <button @click="openEdit(item)" class="btn-ghost text-xs uppercase w-16">Edit</button>
          <button @click="remove(item.id)" class="btn-ghost text-xs w-16 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/50">Delete</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="absolute inset-0 bg-black/60" @click="showModal = false" />
        <div class="relative bg-bg-secondary rounded-lg border w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" style="border-color: rgb(var(--color-border-raw) / 0.2)">
          <h3 class="text-sm font-display text-text-primary uppercase tracking-wider mb-4">
            {{ editing ? 'Edit Education' : 'Add Education' }}
          </h3>

          <form @submit.prevent="save" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Slug</label>
                <input v-model="form.slug" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
              </div>
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Period</label>
                <input v-model="form.period" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Institution</label>
              <input v-model="form.institution" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
            </div>

            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Location</label>
              <input v-model="form.location" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
            </div>

            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Degree</label>
              <input v-model="form.degree" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">CGPA</label>
                <input v-model="form.cgpa" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
              </div>
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Sort Order</label>
                <input v-model.number="form.sort_order" type="number" class="w-full rounded border bg-bg-secondary text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
              </div>
            </div>

            <label class="flex items-center gap-2 text-xs font-tech text-text-secondary cursor-pointer">
              <input v-model="form.is_visible" type="checkbox" class="accent-[rgb(var(--color-accent-raw))]" /> Visible
            </label>

            <div class="flex gap-3 pt-2">
              <button type="submit" class="btn-primary">{{ editing ? 'Update' : 'Create' }}</button>
              <button type="button" @click="showModal = false" class="btn-ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
