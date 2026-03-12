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

const { data: publicFeedbacks } = await useFetch<PublicFeedback[]>('/api/feedback/public', {
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

      <div class="flex flex-col gap-4 min-h-[600px]">
        <div
          v-for="fb in paginatedFeedbacks"
          :key="'fb-' + fb.submitted_at"
          class="card-hover relative overflow-hidden is-visible"
        >
          <div class="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent/20" />

          <!-- Top: Rating + Quote -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <div v-if="fb.rating" class="text-accent text-sm tracking-wide shrink-0">
              {{ '★'.repeat(fb.rating) }}{{ '☆'.repeat(5 - fb.rating) }}
            </div>
          </div>

          <p class="text-text-secondary leading-relaxed text-sm italic mb-5">
            "{{ fb.message }}"
          </p>

          <!-- Bottom: Name + Position / Company on one line -->
          <div class="pt-4 border-t border-accent/10 flex items-center gap-3">
            <div class="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <svg class="w-4 h-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div class="flex items-baseline gap-2 flex-wrap">
              <p class="text-sm font-medium text-text-primary">{{ fb.respondent_name || fb.name }}</p>
              <span v-if="fb.position || fb.company" class="font-mono text-2xs text-text-muted uppercase tracking-wider">
                {{ [fb.position, fb.company].filter(Boolean).join(' · ') }}
              </span>
              <span v-else-if="fb.relationship" class="font-mono text-2xs text-text-muted uppercase tracking-wider">
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
          class="font-mono text-sm text-accent border border-accent/20 px-4 py-2 hover:bg-accent/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          @click="prev"
        >
          ← Prev
        </button>
        <span class="font-mono text-xs text-text-muted">
          {{ currentPage + 1 }} / {{ totalPages }}
        </span>
        <button
          :disabled="currentPage >= totalPages - 1"
          class="font-mono text-sm text-accent border border-accent/20 px-4 py-2 hover:bg-accent/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          @click="next"
        >
          Next →
        </button>
      </div>
    </div>
  </section>
</template>

