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

function goTo(page: number) {
  currentPage.value = page
}
</script>

<template>
  <section id="references" class="section">
    <div class="max-w-6xl mx-auto">
      <UiSectionHeading
        label="References"
        title="What people say"
        description="Feedback and references from those I've worked with."
      />

      <div class="flex flex-col gap-4">
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

      <!-- Dot pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 mt-10" role="tablist" aria-label="Reference pages">
        <button
          v-for="i in totalPages"
          :key="i"
          role="tab"
          :aria-label="`Show references page ${i}`"
          :aria-selected="currentPage === i - 1"
          class="w-2 h-2 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          :class="currentPage === i - 1
            ? 'bg-accent w-6'
            : 'bg-border-strong hover:bg-text-muted'"
          @click="goTo(i - 1)"
        />
      </div>
    </div>
  </section>
</template>
