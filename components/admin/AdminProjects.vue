<script setup lang="ts">
import { useAdmin } from '~/composables/useAdmin'

const { apiFetch } = useAdmin()

const loading = ref(true)
const projects = ref<any[]>([])
const showModal = ref(false)
const editing = ref<any>(null)
const toast = ref('')

const defaultForm = () => ({
  slug: '', tag: '', featured: false, name: '', description: '', href: '', github_url: '', sort_order: 0, is_visible: true,
  stack: [] as string[], metrics: [] as { value: string; label: string }[],
})
const form = ref(defaultForm())
const newStackItem = ref('')
const newMetric = ref({ value: '', label: '' })

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
    form.value = { ...data, stack: data.stack || [], metrics: data.metrics || [] }
    showModal.value = true
  } catch { /* ignore */ }
}

function addStack() {
  if (!newStackItem.value.trim()) return
  form.value.stack.push(newStackItem.value.trim())
  newStackItem.value = ''
}

function removeStack(i: number) { form.value.stack.splice(i, 1) }

function addMetric() {
  if (!newMetric.value.value || !newMetric.value.label) return
  form.value.metrics.push({ ...newMetric.value })
  newMetric.value = { value: '', label: '' }
}

function removeMetric(i: number) { form.value.metrics.splice(i, 1) }

async function save() {
  try {
    if (editing.value) {
      await apiFetch(`/api/projects/${editing.value.id}`, { method: 'PUT', body: form.value })
    } else {
      await apiFetch('/api/projects', { method: 'POST', body: form.value })
    }
    showModal.value = false
    toast.value = 'Saved!'
    setTimeout(() => toast.value = '', 2000)
    await load()
  } catch { toast.value = 'Error saving' }
}

async function remove(id: number) {
  if (!confirm('Delete this project?')) return
  await apiFetch(`/api/projects/${id}`, { method: 'DELETE' })
  await load()
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
    <div v-if="toast" class="mb-4 px-4 py-2 rounded bg-accent/10 text-accent text-sm font-tech">{{ toast }}</div>

    <div class="flex items-center justify-between mb-4">
      <button @click="openAdd" class="btn-primary text-sm">+ Add Project</button>
      <button @click="load" class="btn-ghost text-xs">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="p in projects" :key="p.id" class="card flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-sm font-medium text-text-primary">{{ p.name }}</span>
            <span v-if="p.featured" class="text-2xs font-tech px-2 py-0.5 rounded bg-accent/10 text-accent">Featured</span>
            <span class="text-2xs font-tech px-2 py-0.5 rounded" :class="p.is_visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'">
              {{ p.is_visible ? 'Visible' : 'Hidden' }}
            </span>
          </div>
          <p class="text-xs text-text-muted font-tech">{{ p.tag }} · Order: {{ p.sort_order }}</p>
          <div v-if="p.stack?.length" class="flex flex-wrap gap-1 mt-2">
            <span v-for="s in p.stack" :key="s" class="stack-pill text-2xs">{{ s }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button @click="toggleVisible(p.id)" class="btn-ghost text-xs">{{ p.is_visible ? 'Hide' : 'Show' }}</button>
          <button @click="openEdit(p)" class="btn-ghost text-xs">Edit</button>
          <button @click="remove(p.id)" class="text-xs text-red-400 hover:text-red-300 font-tech">Delete</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="absolute inset-0 bg-black/60" @click="showModal = false" />
        <div class="relative bg-bg-secondary rounded-lg border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" style="border-color: rgb(var(--color-border) / 0.2)">
          <h3 class="text-sm font-display text-text-primary uppercase tracking-wider mb-4">
            {{ editing ? 'Edit Project' : 'Add Project' }}
          </h3>

          <form @submit.prevent="save" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Slug</label>
                <input v-model="form.slug" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border) / 0.2)" />
              </div>
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Tag</label>
                <input v-model="form.tag" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border) / 0.2)" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Name</label>
              <input v-model="form.name" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border) / 0.2)" />
            </div>

            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Description</label>
              <textarea v-model="form.description" rows="3" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border) / 0.2)" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">URL</label>
                <input v-model="form.href" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border) / 0.2)" />
              </div>
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">GitHub URL</label>
                <input v-model="form.github_url" class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border) / 0.2)" />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Sort Order</label>
                <input v-model.number="form.sort_order" type="number" class="w-full rounded border bg-bg-secondary text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border) / 0.2)" />
              </div>
              <div class="flex items-end pb-2">
                <label class="flex items-center gap-2 text-xs font-tech text-text-secondary cursor-pointer">
                  <input v-model="form.featured" type="checkbox" class="accent-[rgb(var(--color-accent))]" /> Featured
                </label>
              </div>
              <div class="flex items-end pb-2">
                <label class="flex items-center gap-2 text-xs font-tech text-text-secondary cursor-pointer">
                  <input v-model="form.is_visible" type="checkbox" class="accent-[rgb(var(--color-accent))]" /> Visible
                </label>
              </div>
            </div>

            <!-- Stack -->
            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-2">Tech Stack</label>
              <div class="flex flex-wrap gap-1 mb-2">
                <span v-for="(s, i) in form.stack" :key="i" class="inline-flex items-center gap-1 stack-pill text-2xs">
                  {{ s }}
                  <button type="button" @click="removeStack(i)" class="text-red-400 hover:text-red-300 ml-1">&times;</button>
                </span>
              </div>
              <div class="flex gap-2">
                <input v-model="newStackItem" placeholder="Add tech..." @keydown.enter.prevent="addStack" class="flex-1 rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-3 py-2 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border) / 0.2)" />
                <button type="button" @click="addStack" class="btn-ghost text-xs">Add</button>
              </div>
            </div>

            <!-- Metrics -->
            <div>
              <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-2">Metrics</label>
              <div class="space-y-1 mb-2">
                <div v-for="(m, i) in form.metrics" :key="i" class="flex items-center gap-2 text-sm text-text-secondary">
                  <span class="font-bold text-accent">{{ m.value }}</span>
                  <span>{{ m.label }}</span>
                  <button type="button" @click="removeMetric(i)" class="text-red-400 hover:text-red-300 text-xs ml-auto">&times;</button>
                </div>
              </div>
              <div class="flex gap-2">
                <input v-model="newMetric.value" placeholder="Value" class="w-20 rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-3 py-2 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border) / 0.2)" />
                <input v-model="newMetric.label" placeholder="Label" class="flex-1 rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-3 py-2 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border) / 0.2)" />
                <button type="button" @click="addMetric" class="btn-ghost text-xs">Add</button>
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
