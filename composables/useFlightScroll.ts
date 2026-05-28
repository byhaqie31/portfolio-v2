import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

/*
 * Iris reveal choreography for /experience's hero.
 *
 * After the auto-played intro (plane silhouette + welcome card fade-in)
 * finishes, the hero section is pinned and a single timeline scrubs the
 * reveal as the user scrolls:
 *
 *   0% → 100% of scroll progress (covers 150vh of scroll distance)
 *     • <CinematicOverlay> radial-mask hole grows 0 → 150vw
 *       (the iris — sky + aircraft pop out from the centre of the wording)
 *     • <CinematicWelcome> text shrinks 1 → 0.5 + fades 1 → 0
 *     • <CinematicAircraft> materials opacity 0 → 1 (visible mid-scroll)
 *     • .hero-reveal elements fade up + slide up (cinematic dataline +
 *       lower-third masthead)
 *
 * Per-phase aircraft pose choreography (nose-up climb → cruise hold →
 * nose-down descent) used to live here; it was removed when the journey
 * content moved out of the 3D scene and into a separate editorial body
 * with no aircraft. The hero's plane now relies on OrbitControls'
 * autoRotate for motion.
 */

gsap.registerPlugin(ScrollTrigger)

let masterTl: gsap.core.Timeline | null = null

export interface FlightScrollInit {
  /**
   * CSS selector for the section to pin. Must NOT be an ancestor of any
   * position:fixed elements you want to stay glued to the viewport during
   * the reveal — ScrollTrigger's pin can convert the pinned element into
   * a containing block for its fixed descendants, which makes them follow
   * the pin instead of the viewport. Recommended: '.experience-hero'.
   */
  trigger: string
  /** Pin distance — string ('+=150%') or number of px. */
  end?: string | number
  /**
   * Materials of the GLB aircraft so their opacity can scrub. Typed
   * structurally (we only mutate .opacity) to avoid pulling THREE types
   * into this file, which keeps the scroll composable independent of
   * Three.js even though it drives a Three.js-rendered model.
   */
  aircraftMaterials?: () => Array<{ opacity: number }> | null
  /**
   * Optional callback fired on every scrub update of the masterTl with
   * the current progress (0 → 1). Pages can use this to flip their own
   * state when the iris reveal completes (e.g. revealing post-reveal
   * CTAs), since the masterTl's scrollTrigger is the authoritative
   * source of pin progress — sibling ScrollTriggers on a pinned
   * element calculate progress against a stationary element and stay
   * at 0.
   */
  onScrollProgress?: (progress: number) => void
}

export function useFlightScroll() {
  function init({
    trigger,
    end = '+=150%',
    aircraftMaterials,
    onScrollProgress,
  }: FlightScrollInit) {
    if (masterTl || typeof window === 'undefined') return

    masterTl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: 'top top',
        end,
        pin: true,
        scrub: 1,
        // anticipatePin reduces a one-frame jump when the pin engages.
        anticipatePin: 1,
        onUpdate: onScrollProgress ? (self) => onScrollProgress(self.progress) : undefined,
      },
    })

    // ── Iris reveal — overlay's mask hole grows from centre outward.
    masterTl.to(
      '.cinematic-overlay',
      { '--hole-r': '150vw', duration: 1, ease: 'none' },
      0,
    )

    // ── Welcome text — scales down + fades during the first 60% of scroll.
    masterTl.to(
      '.welcome__text',
      { scale: 0.5, opacity: 0, duration: 0.6, ease: 'none' },
      0,
    )

    // ── Scroll hint — stays visible across almost the entire reveal so
    // the user knows to keep scrolling, then fades out just as the
    // post-reveal CTAs take over (the page flips revealComplete at
    // progress 0.98 — see pages/experience/index.vue).
    masterTl.to(
      '.welcome__hint',
      { opacity: 0, duration: 0.08, ease: 'none' },
      0.9,
    )

    // ── Aircraft materials — fade in across the middle of the scroll.
    // Pulled lazily so the GLB has time to load before we touch its
    // materials; if it isn't ready when scroll fires, we no-op.
    if (aircraftMaterials) {
      masterTl.add(() => {
        const mats = aircraftMaterials()
        if (!mats || mats.length === 0) return
        mats.forEach((m) => (m.opacity = 0))
        gsap.to(mats, {
          opacity: 1,
          duration: 0.4,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top top',
            end,
            scrub: 1,
          },
        })
      }, 0)
    }

    // ── Hero copy — fades up + slides in, staggered across the end of scroll.
    masterTl.fromTo(
      '.hero-reveal',
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'none',
        stagger: 0.05,
      },
      0.5,
    )
  }

  function destroy() {
    masterTl?.scrollTrigger?.kill()
    masterTl?.kill()
    masterTl = null
    ScrollTrigger.getAll().forEach((t) => t.kill())
  }

  return { init, destroy }
}
