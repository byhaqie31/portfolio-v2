<script setup lang="ts">
interface PublicFeedback {
  name: string
  relationship: string | null
  respondent_name: string | null
  position: string | null
  company: string | null
  rating: number | null
  message: string
  submitted_at: string
}

const { data: publicFeedbacks } = await usePreviewableFetch<PublicFeedback[]>('references', '/api/feedback/public', {
  key: 'public-feedbacks',
  server: true,
  lazy: false,
})

const PAGE_SIZE = 3
const currentPage = ref(0)

const totalPages = computed(() =>
  Math.ceil((publicFeedbacks.value?.length ?? 0) / PAGE_SIZE)
)

const paginatedFeedbacks = computed(() =>
  publicFeedbacks.value?.slice(
    currentPage.value * PAGE_SIZE,
    (currentPage.value + 1) * PAGE_SIZE
  ) ?? []
)

function next() {
  if (currentPage.value < totalPages.value - 1) currentPage.value++
}

function prev() {
  if (currentPage.value > 0) currentPage.value--
}
</script>

<template>
  <section id="references" class="section">
    <hr class="section-divider mb-24 md:mb-32" />
    <div class="max-w-5xl mx-auto">
      <UiSectionHeading
        label="Transmissions"
        title="What people say"
        description="Feedback and references from those I've worked with."
      />

      <div class="flex flex-col gap-4 min-h-150">
        <div
          v-for="fb in paginatedFeedbacks"
          :key="'fb-' + fb.submitted_at"
          class="card-hover is-visible"
        >
          <p class="text-base text-text-secondary leading-relaxed mb-6">
            "{{ fb.message }}"
          </p>

          <!-- Bottom: Name + Position / Company on one line -->
          <div class="pt-5 border-t border-border-subtle flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Icon name="fluent:person-16-filled" size="16" class="text-accent" />
            </div>
            <div class="flex items-baseline gap-2 flex-wrap">
              <p class="text-sm font-semibold text-text-primary">{{ fb.respondent_name || fb.name }}</p>
              <span v-if="fb.position || fb.company" class="text-sm text-text-muted">
                {{ [fb.position, fb.company].filter(Boolean).join(' · ') }}
              </span>
              <span v-else-if="fb.relationship" class="text-sm text-text-muted">
                {{ fb.relationship }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination controls -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 mt-8">
        <button
          :disabled="currentPage === 0"
          class="text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5"
          @click="prev"
        >
          ← Prev
        </button>
        <span class="text-sm text-text-muted">
          {{ currentPage + 1 }} / {{ totalPages }}
        </span>
        <button
          :disabled="currentPage >= totalPages - 1"
          class="text-sm text-text-secondary hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5"
          @click="next"
        >
          Next →
        </button>
      </div>
    </div>
  </section>
</template>

