<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

useSeoMeta({ robots: 'noindex, nofollow' })

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
  <div class="min-h-[80vh] flex items-center justify-center px-4 py-16">
    <div class="w-full max-w-lg">

      <!-- Loading -->
      <div v-if="state === 'loading'" class="text-center">
        <div class="inline-block w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
        <p class="mt-4 text-text-muted text-sm">Validating link…</p>
      </div>

      <!-- Not Found -->
      <div v-else-if="state === 'not_found'" class="card text-center">
        <div class="w-12 h-12 mx-auto rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
          <Icon name="fluent:link-dismiss-24-regular" size="24" class="text-text-muted" />
        </div>
        <h2 class="text-lg font-semibold text-text-primary mb-2">Invalid link</h2>
        <p class="text-text-secondary text-sm">This feedback link is not valid or has expired.</p>
      </div>

      <!-- Already Submitted -->
      <div v-else-if="state === 'already_submitted'" class="card text-center">
        <div class="w-12 h-12 mx-auto rounded-full bg-accent-tertiary/10 flex items-center justify-center mb-4">
          <Icon name="fluent:checkmark-circle-24-filled" size="24" class="text-accent-tertiary" />
        </div>
        <h2 class="text-lg font-semibold text-text-primary mb-2">Already submitted</h2>
        <p class="text-text-secondary text-sm">Feedback has already been submitted for this link.</p>
      </div>

      <!-- Error -->
      <div v-else-if="state === 'error'" class="card text-center">
        <div class="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
          <Icon name="fluent:warning-24-regular" size="24" class="text-red-500" />
        </div>
        <h2 class="text-lg font-semibold text-text-primary mb-2">Something went wrong</h2>
        <p class="text-text-secondary text-sm">{{ errorMsg }}</p>
      </div>

      <!-- Success -->
      <div v-else-if="state === 'submitted'" class="card text-center">
        <div class="w-12 h-12 mx-auto rounded-full bg-accent-tertiary/10 flex items-center justify-center mb-4">
          <Icon name="fluent:checkmark-circle-24-filled" size="24" class="text-accent-tertiary" />
        </div>
        <h2 class="text-lg font-semibold text-text-primary mb-2">Thank you</h2>
        <p class="text-text-secondary text-sm mb-6">Your feedback has been submitted. It means a lot.</p>
        <a href="https://baihaqie.com" target="_blank" class="btn-primary text-sm inline-flex">
          View profile
        </a>
      </div>

      <!-- Feedback Form -->
      <div v-else-if="state === 'valid'" class="card space-y-6">
        <div class="text-center">
          <p class="text-sm text-accent font-medium mb-2">Feedback request</p>
          <h1 class="text-xl font-semibold tracking-tight text-text-primary leading-snug">
            Hi! <span class="text-accent">{{ feedbackName }}</span> would love your honest feedback.
          </h1>
        </div>

        <form @submit.prevent="submit" class="space-y-5">
          <UiField label="Your name" for="respondentName" required>
            <UiInput
              id="respondentName"
              v-model="respondentName"
              type="text"
              placeholder="John Doe"
              required
              autocomplete="name"
            />
          </UiField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UiField label="Position" for="position" required>
              <UiInput
                id="position"
                v-model="position"
                type="text"
                placeholder="Software Engineer"
                required
                autocomplete="organization-title"
              />
            </UiField>
            <UiField label="Company" for="company" required>
              <UiInput
                id="company"
                v-model="company"
                type="text"
                placeholder="Acme Inc."
                required
                autocomplete="organization"
              />
            </UiField>
          </div>

          <!-- Star Rating -->
          <div class="flex flex-col gap-2">
            <span class="text-sm font-medium text-text-secondary">
              Rating <span class="text-red-500" aria-label="required">*</span>
            </span>
            <div class="flex gap-1 justify-center" role="radiogroup" aria-label="Rating">
              <button
                v-for="star in 5"
                :key="star"
                type="button"
                class="p-1.5 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-full"
                role="radio"
                :aria-checked="rating === star"
                :aria-label="`${star} star${star > 1 ? 's' : ''}`"
                @click="rating = star"
                @mouseenter="hoverRating = star"
                @mouseleave="hoverRating = 0"
              >
                <Icon
                  :name="(hoverRating || rating) >= star ? 'fluent:star-24-filled' : 'fluent:star-24-regular'"
                  size="28"
                  :class="(hoverRating || rating) >= star ? 'text-accent' : 'text-text-muted/40'"
                />
              </button>
            </div>
          </div>

          <div>
            <UiField label="Message" for="message" required>
              <UiTextarea
                id="message"
                v-model="message"
                :rows="5"
                :maxlength="2000"
                placeholder="Share your thoughts…"
                required
              />
            </UiField>
            <p class="text-right text-xs mt-1" :class="charCount > 1900 ? 'text-red-500' : 'text-text-muted'">
              {{ charCount }} / 2000
            </p>
          </div>

          <UiField label="Email" for="email" required>
            <UiInput
              id="email"
              v-model="email"
              type="email"
              placeholder="your@email.com"
              required
              autocomplete="email"
            />
          </UiField>

          <p v-if="errorMsg" class="text-red-500 text-sm text-center">{{ errorMsg }}</p>

          <button
            type="submit"
            :disabled="!message.trim() || !respondentName.trim() || !position.trim() || !company.trim() || !email.trim() || !rating || submitting"
            class="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {{ submitting ? 'Submitting…' : 'Submit feedback' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>
