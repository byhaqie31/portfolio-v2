<script setup lang="ts">
import { gsap } from 'gsap'
import { useLenis } from '~/composables/useLenis'

/*
 * Cinematic intro for /experience.
 *
 * Sequence (~3.7s total — paced for "plane at altitude" register, not
 * "blink and you miss it"):
 *
 *   t=0.0        Overlay opaque, plane parked at y:100vh below viewport,
 *                plane fully inverted (white silhouette).
 *   t=0.0 → 3.0  Plane translates y: 100vh → -100vh over 3s, linear.
 *                The plane stays white-on-black for the entire flight —
 *                pure dramatic register, no mid-flight colour shift.
 *                Linear ease reads as genuine constant-speed flight;
 *                anything else looks like floating, not flying.
 *   t≈0.2        Plane crests the bottom of the viewport.
 *   t≈2.5        Plane fully exits the top of the viewport.
 *   t=3.0 → 3.7  Plane is gone. Overlay fades 1 → 0 (0.7s, power2.inOut)
 *                revealing the sky behind. Curtain effect — the world
 *                appears only after the plane has cleared the stage.
 *   t=3.7        Timeline complete. Component unmounts, Lenis resumes,
 *                hero copy fades up via the page's @complete handler.
 *
 * Lenis is paused during the intro so a stray wheel event can't scrub
 * the page mid-reveal. prefers-reduced-motion skips the timeline and
 * unmounts immediately so the static main view appears without fanfare.
 */

const emit = defineEmits<{ complete: [] }>()

const root = ref<HTMLDivElement | null>(null)
const overlay = ref<HTMLDivElement | null>(null)
const plane = ref<HTMLImageElement | null>(null)
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

  // Hold smooth scroll until the intro completes. Lenis might not be
  // initialized yet (layout mounts in parallel), so chain via optional.
  lenis.instance?.stop()

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ctx = gsap.context(() => {
      gsap.set(overlay.value, { opacity: 1 })
      gsap.set(plane.value, {
        xPercent: -50,
        yPercent: -50,
        y: '100vh',
        opacity: 1,
      })

      const tl = gsap.timeline({ onComplete: finish })

      // Plane: 3s linear traversal, white-on-black the whole flight.
      tl.to(plane.value, { y: '-100vh', duration: 3, ease: 'none' }, 0)

      // Once the plane has cleared the stage, the overlay fades to reveal
      // the sky behind. Starts at t=3 (plane already off-screen since t≈2.5).
      tl.to(overlay.value, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, 3)
    }, root.value!)

    return () => ctx.revert()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    finish()
  })
})

onBeforeUnmount(() => {
  mm?.revert()
  // Belt-and-braces — always restore scroll even if unmounted mid-intro.
  lenis.instance?.start()
})
</script>

<template>
  <div v-if="visible" ref="root" class="intro" aria-hidden="true">
    <div ref="overlay" class="intro__overlay" />
    <img
      ref="plane"
      src="/images/A350_summary.png"
      alt=""
      class="intro__plane"
    />
  </div>
</template>

<style scoped>
.intro {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  pointer-events: none;
}

.intro__overlay {
  position: absolute;
  inset: 0;
  background: var(--color-bg-base);
}

.intro__plane {
  position: absolute;
  left: 50%;
  top: 50%;
  /* GSAP owns the full transform via xPercent/yPercent/y. */
  width: clamp(220px, 38vw, 480px);
  height: auto;
  /* Source asset is a black silhouette on transparent. Inverted to white
   * for the entire flight — the plane has fully exited the viewport before
   * the overlay starts fading, so the filter never needs to transition. */
  filter: invert(1);
  user-select: none;
}
</style>
