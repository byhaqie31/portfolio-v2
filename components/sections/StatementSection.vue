<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { statement } from '~/data/index'

// Lead words + the final accent word, flattened for rendering/lighting.
const words = computed(() => [
  ...statement.words.map((w) => ({ text: w, accent: false })),
  { text: statement.accent, accent: true },
])

const root = ref<HTMLElement | null>(null)
const litCount = ref(0)

let mm: ReturnType<typeof gsap.matchMedia> | null = null

onMounted(() => {
  if (!root.value) return

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const total = words.value.length
    const ctx = gsap.context(() => {
      // Scale the phrase up as it travels through the pin.
      gsap.fromTo(
        '.statement-text',
        { scale: 0.62 },
        {
          scale: 1.04,
          ease: 'none',
          scrollTrigger: { trigger: root.value!, start: 'top top', end: 'bottom bottom', scrub: 0.6 },
        },
      )
      // Ink each word in slightly ahead of scroll progress.
      ScrollTrigger.create({
        trigger: root.value!,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          litCount.value = Math.round(self.progress * total * 1.25)
        },
      })
    }, root.value!)

    return () => ctx.revert()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    litCount.value = words.value.length
  })
})

onUnmounted(() => mm?.revert())
</script>

<template>
  <section ref="root" class="statement" aria-label="Statement">
    <div class="statement-pin">
      <p class="statement-text">
        <span
          v-for="(w, i) in words"
          :key="i"
          class="reveal-word"
          :class="{ lit: i < litCount, 'is-accent': w.accent }"
        >{{ w.text }}</span>
      </p>
    </div>
  </section>
</template>

<style scoped>
.statement {
  position: relative;
  height: 300vh;
}
.statement-pin {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
}
.statement-text {
  font-size: clamp(2rem, 6vw, 4.5rem);
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.05;
  max-width: 16ch;
  padding: 0 24px;
  will-change: transform;
}
.reveal-word {
  display: inline-block;
  margin-right: 0.26em;
  color: var(--color-text-muted);
  transition: color 0.1s linear;
}
.reveal-word:last-child {
  margin-right: 0;
}
.reveal-word.lit {
  color: var(--color-text-primary);
}
.reveal-word.is-accent.lit {
  color: var(--color-accent);
}

@media (prefers-reduced-motion: reduce) {
  /* No pin scrub — settle centered with all words lit. */
  .statement {
    height: auto;
  }
  .statement-pin {
    position: static;
    height: auto;
    padding: 96px 24px;
  }
  .statement-text {
    transform: none !important;
  }
}
</style>
