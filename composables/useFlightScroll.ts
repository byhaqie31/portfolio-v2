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
let flightTl: gsap.core.Timeline | null = null

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
  /**
   * The GLB aircraft model. Used by the choreography ScrollTrigger to
   * tween rotation.x (pitch) and position.y (height) across the post-pin
   * phases — takeoff, climb, cruise, FL380, descent, landing. Typed
   * structurally for the same reason as aircraftMaterials.
   */
  aircraftModel?: () => {
    rotation: { x: number; y: number; z: number }
    position: { x: number; y: number; z: number }
  } | null
  /**
   * CSS selector for the first post-pin phase (.phase--takeoff). The
   * choreography ScrollTrigger pins to its top.
   */
  flightStart?: string
  /**
   * CSS selector for the last phase (.phase--arrival). The choreography
   * ScrollTrigger ends when its bottom passes the viewport top.
   */
  flightEnd?: string
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
    aircraftModel,
    flightStart,
    flightEnd,
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

    // ── Aircraft flight choreography ──────────────────────────────────
    //
    // Once the pre-flight pin releases and the user enters the
    // post-pre-flight phases, the aircraft scrubs through a flight arc:
    //
    //   Takeoff (phase 01)  → pitch nose up ~9°
    //   Climb (phase 02)    → ease back toward level
    //   Cruise (phase 03)   → level (rotation.x = 0)
    //   FL380 (phases 4-5)  → still level
    //   Descent (phase 06)  → pitch nose down ~6°
    //   Landing (phase 07)  → pitch nose down further + drop in frame
    //
    // The timeline is built lazily inside an `add()` so the model has
    // a chance to load before we try to read its transforms. If it
    // hasn't loaded yet, the no-op is safe — choreography just doesn't
    // run on this navigation.
    if (aircraftModel && flightStart && flightEnd) {
      masterTl.add(() => {
        // Scrub re-fires this callback when scroll crosses time 0 in
        // either direction; without this guard, scrolling back to the
        // hero and forward again would build duplicate timelines.
        if (flightTl) return

        const m = aircraftModel()
        if (!m) return

        flightTl = gsap.timeline({
          scrollTrigger: {
            trigger: flightStart,
            start: 'top top',
            endTrigger: flightEnd,
            end: 'bottom top',
            scrub: 1,
          },
        })

        // Pitch (rotation.x) — keyframes by progress fraction.
        //   0.00 → 0.10  takeoff:  0       → -0.16 (nose up)
        //   0.25 → 0.40  cruise:   -0.16   →  0    (level off)
        //   0.40 → 0.70  hold:     0       →  0    (no tween needed)
        //   0.70 → 0.85  descent:   0      →  0.10 (nose down)
        //   0.85 → 0.95  landing:   0.10   →  0.18 (more nose down)
        flightTl.to(m.rotation, { x: -0.16, duration: 0.10, ease: 'power2.out' }, 0)
        flightTl.to(m.rotation, { x: 0, duration: 0.15, ease: 'sine.inOut' }, 0.25)
        flightTl.to(m.rotation, { x: 0.10, duration: 0.15, ease: 'sine.inOut' }, 0.70)
        flightTl.to(m.rotation, { x: 0.18, duration: 0.10, ease: 'sine.inOut' }, 0.85)

        // Height (position.y) — the aircraft drops as it lands.
        //   0.00 → 0.85  hold at 2 (cruise altitude)
        //   0.85 → 0.95  drop to 0 (landing height)
        flightTl.to(m.position, { y: 0, duration: 0.10, ease: 'sine.inOut' }, 0.85)
      }, 0)
    }
  }

  function destroy() {
    masterTl?.scrollTrigger?.kill()
    masterTl?.kill()
    masterTl = null
    flightTl?.scrollTrigger?.kill()
    flightTl?.kill()
    flightTl = null
    ScrollTrigger.getAll().forEach((t) => t.kill())
  }

  return { init, destroy }
}
