<script setup lang="ts">
import { gsap } from 'gsap'
import { useLenis } from '~/composables/useLenis'

/*
 * Welcome card — second act of the intro. Plays after <CinematicIntro>
 * emits complete; sits on the persistent <CinematicOverlay> (solid black)
 * until the user scrolls. Then the master scroll choreography in
 * useFlightScroll takes the text over (fades + scales it out as the
 * iris reveals the sky behind).
 *
 * Sequence (~2.3s total):
 *   t=0.0 → 0.8  Text fades + lifts in (opacity 0 → 1, y +16 → 0), expo.out.
 *   t=0.8 → 2.3  Hold (1.5s) — text stays visible, waiting for the user.
 *   t=2.3        Emit `complete` so the parent can resume Lenis + arm the
 *                ScrollTrigger reveal. Component stays mounted; the text
 *                will be dismissed by scroll, not by an auto fade-out.
 *
 * Lenis stays paused for the duration of the fade-in + hold. The parent
 * resumes it on `complete`, after which the page becomes scrollable.
 */

const emit = defineEmits<{ complete: [] }>()

const root = ref<HTMLDivElement | null>(null)
const text = ref<HTMLParagraphElement | null>(null)

const lenis = useLenis()
let mm: ReturnType<typeof gsap.matchMedia> | null = null

function finish() {
  lenis.instance?.start()
  emit('complete')
}

onMounted(() => {
  if (!root.value) return

  lenis.instance?.stop()

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ctx = gsap.context(() => {
      gsap.set(text.value, { opacity: 0, y: 16 })

      const tl = gsap.timeline({ onComplete: finish })
      tl.to(text.value, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0)
      // Hold for 1.5s, then emit `complete`. No fade-out — scroll will
      // dismiss the text via the master scroll choreography.
      tl.to({}, { duration: 1.5 }, 0.8)
    }, root.value!)

    return () => ctx.revert()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    if (text.value) gsap.set(text.value, { opacity: 1, y: 0 })
    finish()
  })
})

onBeforeUnmount(() => {
  mm?.revert()
  lenis.instance?.start()
})
</script>

<template>
  <div ref="root" class="welcome" aria-hidden="true">
    <p ref="text" class="welcome__text">
      Welcome aboard<br />
      to my journey!
    </p>
  </div>
</template>

<style scoped>
.welcome {
  /* Sits above the persistent <CinematicOverlay> (z 20) so the text
   * stays visible after the iris reveal starts clipping the overlay.
   * The text's own opacity + scale are scrubbed by useFlightScroll. */
  position: fixed;
  inset: 0;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  pointer-events: none;
}

.welcome__text {
  font-family: var(--font-display);
  font-size: var(--font-display-large);
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--color-ink-primary);
  text-align: center;
  margin: 0;
  max-width: 18ch;
}
</style>
