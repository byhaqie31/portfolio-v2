<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

const { apiFetch } = useAdmin()

const loading = ref(true)
const items = ref<any[]>([])
const showModal = ref(false)
const editing = ref<any>(null)
const toast = ref('')

const defaultForm = () => ({ content: '', sort_order: 0, is_visible: true })
const form = ref(defaultForm())

async function load() {
  loading.value = true
  try {
    items.value = await apiFetch<any[]>('/api/activities')
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
  form.value = { content: item.content, sort_order: item.sort_order, is_visible: !!item.is_visible }
  showModal.value = true
}

async function save() {
  try {
    if (editing.value) {
      await apiFetch(`/api/activities/${editing.value.id}`, { method: 'PUT', body: form.value })
    } else {
      await apiFetch('/api/activities', { method: 'POST', body: form.value })
    }
    showModal.value = false
    toast.value = 'Saved!'
    setTimeout(() => toast.value = '', 2000)
    await load()
  } catch { toast.value = 'Error saving' }
}

async function remove(id: number) {
  if (!confirm('Delete this activity?')) return
  await apiFetch(`/api/activities/${id}`, { method: 'DELETE' })
  await load()
}

async function toggleVisible(id: number) {
  const updated = await apiFetch(`/api/activities/${id}/toggle-visible`, { method: 'PATCH' })
  const idx = items.value.findIndex(a => a.id === id)
  if (idx !== -1) items.value[idx] = { ...items.value[idx], is_visible: updated.is_visible }
}

onMounted(load)
</script>

<template>
  <div>
    <div v-if="toast" class="mb-4 px-4 py-2 rounded bg-accent/10 text-accent text-sm font-tech">{{ toast }}</div>

    <div class="flex items-center justify-between mb-4">
      <button @click="openAdd" class="btn-primary text-sm">+ Add Activity</button>
      <button @click="load" class="btn-ghost text-xs">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="item in items" :key="item.id" class="card flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <p class="text-sm text-text-primary">{{ item.content }}</p>
          <p class="text-xs text-text-muted font-tech mt-1">Order: {{ item.sort_order }}</p>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <span class="text-2xs font-tech px-2 py-0.5 rounded" :class="item.is_visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'">
            {{ item.is_visible ? 'Visible' : 'Hidden' }}
          </span>
          <button @click="toggleVisible(item.id)" class="btn-ghost text-xs">{{ item.is_visible ? 'Hide' : 'Show' }}</button>
          <button @click="openEdit(item)" class="btn-ghost text-xs">Edit</button>
          <button @click="remove(item.id)" class="text-xs text-red-400 hover:text-red-300 font-tech">Delete</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="absolute inset-0 bg-black/60" @click="showModal = false" />
        <div class="relative bg-bg-secondary rounded-lg border w-full max-w-lg p-6" style="border-color: rgb(var(--color-border-raw) / 0.2)">
          <h3 class="text-sm font-display text-text-primary uppercase tracking-wider mb-4">
            {{ editing ? 'Edit Activity' : 'Add Activity' }}
          </h3>

          <form @submit.prevent="save" class="space-y-4">
            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Content</label>
              <textarea v-model="form.content" rows="3" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Sort Order</label>
                <input v-model.number="form.sort_order" type="number" class="w-full rounded border bg-bg-secondary text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
              </div>
              <div class="flex items-end pb-2">
                <label class="flex items-center gap-2 text-xs font-tech text-text-secondary cursor-pointer">
                  <input v-model="form.is_visible" type="checkbox" class="accent-[rgb(var(--color-accent-raw))]" /> Visible
                </label>
              </div>
            </div>

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
