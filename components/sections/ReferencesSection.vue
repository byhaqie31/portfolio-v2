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

const { data: publicFeedbacks } = await useFetch<PublicFeedback[]>('/api/feedback/public')
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

      <div class="grid md:grid-cols-2 gap-4">
        <!-- Public feedbacks from DB -->
        <div
          v-for="fb in publicFeedbacks"
          :key="'fb-' + fb.submitted_at"
          class="reveal card-hover relative overflow-hidden"
        >
          <div class="absolute top-0 right-0 w-4 h-4 border-t border-r border-accent/20" />

          <!-- Rating -->
          <div v-if="fb.rating" class="mb-3 text-accent text-sm tracking-wide">
            {{ '★'.repeat(fb.rating) }}{{ '☆'.repeat(5 - fb.rating) }}
          </div>

          <!-- Quote -->
          <div class="mb-5">
            <p class="text-text-secondary leading-relaxed text-sm italic">
              "{{ fb.message }}"
            </p>
          </div>

          <div class="pt-4 border-t border-accent/10 flex items-start gap-3">
            <div class="w-8 h-8 rounded bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <span class="font-mono text-xs text-accent font-semibold">
                {{ (fb.respondent_name || fb.name).split(' ').map((n: string) => n[0]).join('').slice(0, 2) }}
              </span>
            </div>
            <div>
              <p class="text-sm font-medium text-text-primary">{{ fb.respondent_name || fb.name }}</p>
              <p v-if="fb.position" class="font-mono text-2xs text-text-muted uppercase tracking-wider">{{ fb.position }}</p>
              <p v-if="fb.company" class="font-mono text-2xs text-text-muted uppercase tracking-wider">{{ fb.company }}</p>
              <p v-if="fb.relationship && !fb.position" class="font-mono text-2xs text-text-muted uppercase tracking-wider">{{ fb.relationship }}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
