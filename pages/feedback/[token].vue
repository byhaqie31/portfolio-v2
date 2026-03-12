<script setup lang="ts">
definePageMeta({ layout: 'default' })

const route = useRoute()
const token = route.params.token as string

const state = ref<'loading' | 'valid' | 'submitted' | 'already_submitted' | 'not_found' | 'error'>('loading')
const feedbackName = ref('')
const errorMsg = ref('')

const rating = ref(0)
const hoverRating = ref(0)
const respondentName = ref('')
const position = ref('')
const company = ref('')
const message = ref('')
const email = ref('')
const submitting = ref(false)

onMounted(async () => {
  try {
    const data = await $fetch<{ valid: boolean; name: string }>(`/api/feedback/${token}`)
    feedbackName.value = data.name
    state.value = 'valid'
  } catch (err: any) {
    const status = err?.response?.status || err?.statusCode
    if (status === 404) state.value = 'not_found'
    else if (status === 410) state.value = 'already_submitted'
    else {
      state.value = 'error'
      errorMsg.value = 'Something went wrong. Please try again later.'
    }
  }
})

const charCount = computed(() => message.value.length)

async function submit() {
  if (!message.value.trim() || !respondentName.value.trim() || !position.value.trim() || !company.value.trim() || !email.value.trim() || !rating.value) return
  submitting.value = true
  try {
    await $fetch(`/api/feedback/${token}`, {
      method: 'POST',
      body: {
        message: message.value,
        rating: rating.value || null,
        email: email.value || null,
        respondent_name: respondentName.value || null,
        position: position.value || null,
        company: company.value || null,
      },
    })
    state.value = 'submitted'
  } catch (err: any) {
    const msg = err?.data?.statusMessage || err?.response?._data?.statusMessage || 'Failed to submit feedback'
    errorMsg.value = msg
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-lg">

      <!-- Loading -->
      <div v-if="state === 'loading'" class="text-center">
        <div class="inline-block w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
        <p class="mt-4 text-text-muted font-tech text-sm">Validating link...</p>
      </div>

      <!-- Not Found -->
      <div v-else-if="state === 'not_found'" class="card text-center">
        <div class="text-4xl mb-4">🔗</div>
        <h2 class="text-xl font-display text-text-primary mb-2">Invalid Link</h2>
        <p class="text-text-muted text-sm">This feedback link is not valid or has expired.</p>
      </div>

      <!-- Already Submitted -->
      <div v-else-if="state === 'already_submitted'" class="card text-center">
        <div class="text-4xl mb-4">✅</div>
        <h2 class="text-xl font-display text-text-primary mb-2">Already Submitted</h2>
        <p class="text-text-muted text-sm">Feedback has already been submitted for this link.</p>
      </div>

      <!-- Error -->
      <div v-else-if="state === 'error'" class="card text-center">
        <div class="text-4xl mb-4">⚠️</div>
        <h2 class="text-xl font-display text-text-primary mb-2">Error</h2>
        <p class="text-text-muted text-sm">{{ errorMsg }}</p>
      </div>

      <!-- Success -->
      <div v-else-if="state === 'submitted'" class="card text-center">
        <div class="text-4xl mb-4">🎉</div>
        <h2 class="text-xl font-display text-text-primary mb-2">Thank You!</h2>
        <p class="text-text-muted text-sm">Your feedback has been submitted successfully. It means a lot!</p>
        <a href="https://baihaqie.com" target="_blank" class="btn-primary inline-block mt-6">
          View Profile
        </a>
      </div>

      <!-- Feedback Form -->
      <div v-else-if="state === 'valid'" class="card">
        <div class="text-center mb-8">
          <p class="text-text-muted text-sm font-tech uppercase tracking-wider mb-2">Feedback Request</p>
          <h1 class="text-xl font-display text-text-primary">
            Hi! <span class="text-accent">{{ feedbackName }}</span> <br />
            I'd love to hear your honest feedback.
          </h1>
        </div>

        <form @submit.prevent="submit" class="space-y-6">
          <!-- Name -->
          <div>
            <label for="respondentName" class="block text-sm font-tech text-text-secondary uppercase tracking-wider mb-2">
              Your Name <span class="text-accent-secondary">*</span>
            </label>
            <input
              id="respondentName"
              v-model="respondentName"
              type="text"
              required
              placeholder="John Doe"
              class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-3 text-sm focus:outline-none focus:border-accent/60 transition-colors"
              style="border-color: rgb(var(--color-border) / 0.2)"
            />
          </div>

          <!-- Position & Company -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="position" class="block text-sm font-tech text-text-secondary uppercase tracking-wider mb-2">
                Position <span class="text-accent-secondary">*</span>
              </label>
              <input
                id="position"
                v-model="position"
                type="text"
                required
                placeholder="Software Engineer"
                class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-3 text-sm focus:outline-none focus:border-accent/60 transition-colors"
                style="border-color: rgb(var(--color-border) / 0.2)"
              />
            </div>
            <div>
              <label for="company" class="block text-sm font-tech text-text-secondary uppercase tracking-wider mb-2">
                Company <span class="text-accent-secondary">*</span>
              </label>
              <input
                id="company"
                v-model="company"
                type="text"
                required
                placeholder="Acme Inc."
                class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-3 text-sm focus:outline-none focus:border-accent/60 transition-colors"
                style="border-color: rgb(var(--color-border) / 0.2)"
              />
            </div>
          </div>

          <!-- Star Rating -->
          <div>
            <label class="block text-sm font-tech text-text-secondary uppercase tracking-wider mb-3">Rating <span class="text-accent-secondary">*</span></label>
            <div class="flex gap-2 justify-center">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="text-3xl transition-transform duration-150 hover:scale-110 focus:outline-none"
                @click="rating = star"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
              >
                <span :class="(hoverRating || rating) >= star ? 'text-accent' : 'text-text-muted/30'">★</span>
              </button>
            </div>
          </div>

          <!-- Message -->
          <div>
            <label for="message" class="block text-sm font-tech text-text-secondary uppercase tracking-wider mb-2">
              Message <span class="text-accent-secondary">*</span>
            </label>
            <textarea
              id="message"
              v-model="message"
              rows="5"
              maxlength="2000"
              required
              placeholder="Share your thoughts..."
              class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-3 text-sm focus:outline-none focus:border-accent/60 transition-colors resize-none"
              style="border-color: rgb(var(--color-border) / 0.2)"
            />
            <p class="text-right text-xs font-tech mt-1" :class="charCount > 1900 ? 'text-accent-secondary' : 'text-text-muted'">
              {{ charCount }} / 2000
            </p>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-tech text-text-secondary uppercase tracking-wider mb-2">
              Email <span class="text-accent-secondary">*</span>
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="your@email.com"
              class="w-full rounded border bg-bg-secondary text-text-primary placeholder-text-muted/50 px-4 py-3 text-sm focus:outline-none focus:border-accent/60 transition-colors"
              style="border-color: rgb(var(--color-border) / 0.2)"
            />
          </div>

          <!-- Error message -->
          <p v-if="errorMsg" class="text-accent-secondary text-sm text-center">{{ errorMsg }}</p>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="!message.trim() || !respondentName.trim() || !position.trim() || !company.trim() || !email.trim() || !rating || submitting"
            class="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {{ submitting ? 'Submitting...' : 'Submit Feedback' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>
