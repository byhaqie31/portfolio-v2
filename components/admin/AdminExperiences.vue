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
    showSuccess({ title: 'Saved', message: isEdit ? 'Experience updated successfully!' : 'Experience created successfully!' })
  } catch { /* ignore */ }
}

async function remove(id: number) {
  const confirmed = await showConfirm({ title: 'Delete Experience', message: 'Are you sure you want to delete this experience? This action cannot be undone.', confirmLabel: 'Delete', variant: 'danger' })
  if (!confirmed) return
  await apiFetch(`/api/experiences/${id}`, { method: 'DELETE' })
  await load()
  showSuccess({ title: 'Deleted', message: 'Experience deleted successfully!' })
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
      <button @click="openAdd" class="btn-primary text-sm">+ Add Experience</button>
      <button @click="load" class="btn-ghost text-xs">Refresh</button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>

    <div v-else class="space-y-3">
      <div v-for="e in experiences" :key="e.id" class="card flex items-start justify-between gap-4">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-sm font-medium text-text-primary">{{ e.role }}</span>
            <span v-if="e.is_current" class="text-2xs font-tech px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">Current</span>
            <span class="text-2xs font-tech px-2 py-0.5 rounded" :class="e.is_visible ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-500'">
              {{ e.is_visible ? 'Visible' : 'Hidden' }}
            </span>
          </div>
          <p class="text-xs text-text-muted font-tech">{{ e.company }} · {{ e.period }} · Order: {{ e.sort_order }}</p>
          <div v-if="e.tags?.length" class="flex flex-wrap gap-1 mt-2">
            <span v-for="t in e.tags" :key="t" class="stack-pill text-2xs">{{ t }}</span>
          </div>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button @click="toggleVisible(e.id)" class="btn-ghost text-xs uppercase w-16">{{ e.is_visible ? 'Hide' : 'Show' }}</button>
          <button @click="openEdit(e)" class="btn-ghost text-xs uppercase w-16">Edit</button>
          <button @click="remove(e.id)" class="btn-ghost text-xs w-16 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/50">Delete</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="absolute inset-0 bg-black/60" @click="showModal = false" />
        <div class="relative bg-bg-secondary rounded-lg border w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6" style="border-color: rgb(var(--color-border-raw) / 0.2)">
          <h3 class="text-sm font-display text-text-primary uppercase tracking-wider mb-4">
            {{ editing ? 'Edit Experience' : 'Add Experience' }}
          </h3>

          <form @submit.prevent="save">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left Column: Basic Info -->
              <div class="space-y-4">
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

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Company</label>
                    <input v-model="form.company" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
                  </div>
                  <div>
                    <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Location</label>
                    <input v-model="form.location" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Role</label>
                  <input v-model="form.role" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
                </div>

                <div>
                  <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Description</label>
                  <textarea v-model="form.description" rows="3" required class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
                </div>

                <!-- Tags -->
                <div>
                  <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-2">Tags</label>
                  <div class="flex flex-wrap gap-1 mb-2">
                    <span v-for="(t, i) in form.tags" :key="i" class="inline-flex items-center gap-1 stack-pill text-2xs">
                      {{ t }}
                      <button type="button" @click="removeTag(i)" class="text-red-400 hover:text-red-300 ml-1">&times;</button>
                    </span>
                  </div>
                  <div class="flex gap-2">
                    <input v-model="newTag" placeholder="Add tag..." @keydown.enter.prevent="addTag" class="flex-1 rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-3 py-2 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
                    <button type="button" @click="addTag" class="btn-ghost text-xs" :class="tagAdded ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : ''">{{ tagAdded ? '✓ Added' : 'Add' }}</button>
                  </div>
                </div>
              </div>

              <!-- Right Column: Bullets + Settings -->
              <div class="space-y-4">
                <!-- Bullets -->
                <div>
                  <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-2">Bullets</label>
                  <div class="space-y-1 mb-2">
                    <div v-for="(b, i) in form.bullets" :key="i" class="flex items-start gap-2 text-sm text-text-secondary px-3 py-2 rounded bg-bg-secondary" style="border: 1px solid rgb(var(--color-border-raw) / 0.1)">
                      <span class="flex-1">{{ b }}</span>
                      <button type="button" @click="removeBullet(i)" class="text-red-400 hover:text-red-300 text-xs shrink-0">&times;</button>
                    </div>
                  </div>
                  <div v-if="form.bullets.length < 5" class="flex gap-2">
                    <textarea v-model="newBullet" rows="2" placeholder="Add bullet point..." class="flex-1 rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-3 py-2 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
                    <button type="button" @click="addBullet" class="btn-ghost text-xs self-end" :class="bulletAdded ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : ''">{{ bulletAdded ? '✓ Added' : 'Add' }}</button>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <label class="block text-xs font-tech text-text-secondary uppercase tracking-wider mb-1">Sort Order</label>
                    <input v-model.number="form.sort_order" type="number" class="w-full rounded border bg-bg-secondary text-text-primary px-4 py-2.5 text-sm focus:outline-none focus:border-accent/60 transition-colors" style="border-color: rgb(var(--color-border-raw) / 0.2)" />
                  </div>
                  <div class="flex items-end pb-2">
                    <label class="flex items-center gap-2 text-xs font-tech text-text-secondary cursor-pointer">
                      <input v-model="form.is_current" type="checkbox" class="accent-[rgb(var(--color-accent-raw))]" /> Current
                    </label>
                  </div>
                  <div class="flex items-end pb-2">
                    <label class="flex items-center gap-2 text-xs font-tech text-text-secondary cursor-pointer">
                      <input v-model="form.is_visible" type="checkbox" class="accent-[rgb(var(--color-accent-raw))]" /> Visible
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-4 mt-4 border-t" style="border-color: rgb(var(--color-border-raw) / 0.1)">
              <button type="button" @click="showModal = false" class="btn-ghost">Cancel</button>
              <button type="submit" class="btn-primary">{{ editing ? 'Update' : 'Create' }}</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>
