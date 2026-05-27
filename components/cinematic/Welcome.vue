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
const hint = ref<HTMLDivElement | null>(null)

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
      gsap.set(hint.value, { opacity: 0 })

      const tl = gsap.timeline({ onComplete: finish })
      tl.to(text.value, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0)
      // Scroll hint fades in once the welcome text has landed — the cue
      // is meant to appear only when the user is actually expected to
      // take over.
      tl.to(hint.value, { opacity: 1, duration: 0.6, ease: 'expo.out' }, 1.0)
      // Hold the whole composition for 1.5s of read time, then emit
      // `complete`. No fade-out — scroll will dismiss everything via
      // useFlightScroll.
      tl.to({}, { duration: 1.5 }, 0.8)

      // The chevron's perpetual bounce is a CSS keyframe animation (see
      // styles below) so we don't need a GSAP timeline to manage it.
    }, root.value!)

    return () => ctx.revert()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    if (text.value) gsap.set(text.value, { opacity: 1, y: 0 })
    if (hint.value) gsap.set(hint.value, { opacity: 1 })
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

    <div ref="hint" class="welcome__hint">
      <span class="welcome__hint-label">SCROLL</span>
      <Icon
        name="fluent:chevron-down-16-filled"
        size="16"
        class="welcome__hint-chevron"
      />
    </div>
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

.welcome__hint {
  position: absolute;
  bottom: var(--space-12);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.welcome__hint-label {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.welcome__hint-chevron {
  display: block;
  color: var(--color-ink-muted);
  animation: scroll-bounce 1.8s ease-in-out infinite;
}

@keyframes scroll-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}

@media (prefers-reduced-motion: reduce) {
  .welcome__hint-chevron {
    animation: none;
  }
}
</style>
