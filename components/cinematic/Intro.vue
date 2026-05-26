<script setup lang="ts">
import { gsap } from 'gsap'
import { useLenis } from '~/composables/useLenis'

/*
 * Cinematic intro for /experience.
 *
 * Sequence (5s total — paced for "plane at altitude" register, not
 * "blink and you miss it"):
 *
 *   t=0.0        Overlay opaque, plane parked at y:100vh below viewport,
 *                plane fully inverted (white silhouette) for visibility
 *                against the black overlay.
 *   t=0.0 → 5.0  Plane translates y: 100vh → -100vh over 5s, linear.
 *                Linear feels like genuine constant-speed flight; eased
 *                motion would read as floating, not flying.
 *   t≈0.4        Plane crests the bottom of the viewport.
 *   t=1.25 → 2.5 Overlay fades 1 → 0 (sky reveals) AND plane invert
 *                tweens 1 → 0 (white silhouette settles into dark
 *                silhouette against the sky). Synchronized over 1.25s,
 *                power2.inOut — the reveal completes as the plane
 *                crosses the centre of the viewport at t=2.5.
 *   t≈4.6        Plane fully exits the top of the viewport.
 *   t=5.0        Timeline complete. Component unmounts, Lenis resumes,
 *                hero copy fades up.
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
        '--invert-amount': 1,
      })

      const tl = gsap.timeline({ onComplete: finish })

      // Plane: 5s linear traversal from below-viewport to above-viewport.
      tl.to(plane.value, { y: '-100vh', duration: 5, ease: 'none' }, 0)

      // Overlay fade + plane de-invert, synchronized 1.25s window ending
      // at the plane's mid-viewport moment (t=2.5).
      tl.to(overlay.value, { opacity: 0, duration: 1.25, ease: 'power2.inOut' }, 1.25)
      tl.to(plane.value, { '--invert-amount': 0, duration: 1.25, ease: 'power2.inOut' }, 1.25)
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
  /* Source asset is a black silhouette on transparent. During the black
   * phase the plane is fully inverted (white, visible against the overlay);
   * GSAP tweens --invert-amount 1 → 0 in sync with the overlay fade so it
   * settles into a dark silhouette against the sky. */
  filter: invert(var(--invert-amount, 1));
  user-select: none;
}
</style>
