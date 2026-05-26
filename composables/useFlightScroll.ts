import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

/*
 * Master scroll choreography for /experience.
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
 * Each tween has its own progress window so the reveal stages instead
 * of arriving all at once. Aircraft materials are fed in via the
 * `aircraftMaterials` getter so the scroll trigger can opacity-tween
 * them even though they live inside the Three.js scene.
 */

gsap.registerPlugin(ScrollTrigger)

let masterTl: gsap.core.Timeline | null = null

export interface FlightScrollInit {
  /**
   * CSS selector for the section to pin. Must NOT be an ancestor of any
   * position:fixed elements you want to stay glued to the viewport during
   * the reveal — ScrollTrigger's pin can convert the pinned element into
   * a containing block for its fixed descendants, which makes them follow
   * the pin instead of the viewport. Recommended: '.phase--hero'.
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
}

export function useFlightScroll() {
  function init({ trigger, end = '+=150%', aircraftMaterials }: FlightScrollInit) {
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
