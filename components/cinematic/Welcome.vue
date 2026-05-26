<script setup lang="ts">
import { gsap } from 'gsap'
import { useLenis } from '~/composables/useLenis'

/*
 * Welcome card — the second act of the intro. Plays after <CinematicIntro>
 * emits complete, before the static aircraft and hero copy assemble.
 *
 * Sequence (~3.1s total):
 *   t=0.0 → 0.8  Text fades + lifts in (opacity 0 → 1, y +16 → 0), expo.out.
 *   t=0.8 → 2.3  Hold (1.5s).
 *   t=2.3 → 3.1  Text fades + lifts out (opacity 1 → 0, y 0 → -16), expo.in.
 *   t=3.1        Component unmounts, Lenis resumes, parent moves to the
 *                next act (aircraft + hero copy).
 *
 * Lenis stays paused so the welcome can't be scrolled past. Text floats
 * over the sky — no opaque overlay; the cinematic-twilight sky behind it
 * is part of the composition.
 */

const emit = defineEmits<{ complete: [] }>()

const root = ref<HTMLDivElement | null>(null)
const text = ref<HTMLParagraphElement | null>(null)
const visible = ref(true)

const lenis = useLenis()
let mm: ReturnType<typeof gsap.matchMedia> | null = null

function finish() {
  visible.value = false
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
      tl.to(text.value, { opacity: 0, y: -16, duration: 0.8, ease: 'expo.in' }, 2.3)
    }, root.value!)

    return () => ctx.revert()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    finish()
  })
})

onBeforeUnmount(() => {
  mm?.revert()
  lenis.instance?.start()
})
</script>

<template>
  <div v-if="visible" ref="root" class="welcome" aria-hidden="true">
    <p ref="text" class="welcome__text">
      Welcome aboard<br />
      to my journey!
    </p>
  </div>
</template>

<style scoped>
.welcome {
  position: fixed;
  inset: 0;
  z-index: var(--z-controls);
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
