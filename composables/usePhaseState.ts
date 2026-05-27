import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import { useLenis } from '~/composables/useLenis'

/*
 * Tracks which flight phase the viewer is currently in, based on which
 * phase section's centre is closest to the viewport centre. Powers the
 * <CinematicHUD>'s PHASE / ALT / STAGE readout and the click-to-jump
 * teleport buttons.
 *
 * Per-phase ScrollTriggers are created lazily inside init(). They use
 * onToggle to flip `active` whenever a phase's centre passes through
 * the viewport's centre, so the HUD readout matches what the viewer
 * is actually reading.
 */

gsap.registerPlugin(ScrollTrigger)

export interface Phase {
  index: number
  /** Two-digit string for display, e.g. "00". */
  pad: string
  /** Aviation phase label (mono uppercase). */
  label: string
  /** Symbolic altitude readout. */
  alt: string
  /** Story stage (what this phase represents in the bio). */
  stage: string
  /** CSS selector for the section element. */
  selector: string
}

export const PHASES: Phase[] = [
  { index: 0, pad: '00', label: 'PRE-FLIGHT', alt: 'GATE',     stage: 'FLIGHT AB',       selector: '.phase--hero' },
  { index: 1, pad: '01', label: 'TAXI',       alt: 'RWY 36L',  stage: 'ABOUT',           selector: '.phase--ascent' },
  { index: 2, pad: '02', label: 'TAKEOFF',    alt: 'V_R',      stage: 'EDUCATION',       selector: '.phase--takeoff' },
  { index: 3, pad: '03', label: 'CLIMB',      alt: 'FL180',    stage: 'EARLY WORK',      selector: '.phase--climb' },
  { index: 4, pad: '04', label: 'CRUISE',     alt: 'FL320',    stage: 'CURRENT WORK',    selector: '.phase--cruise' },
  { index: 5, pad: '05', label: 'CRUISE',     alt: 'FL380',    stage: 'SELECTED WORK',   selector: '.phase--fl380-selected' },
  { index: 6, pad: '06', label: 'CRUISE',     alt: 'FL380',    stage: 'OTHER ALTITUDES', selector: '.phase--fl380-other' },
  { index: 7, pad: '07', label: 'DESCENT',    alt: 'TOD',      stage: 'BUILDING',        selector: '.phase--descent' },
  { index: 8, pad: '08', label: 'TOUCHDOWN',  alt: 'V_REF',    stage: 'CONTACT',         selector: '.phase--arrival' },
]

const active = ref(0)
const triggers: ScrollTrigger[] = []

export function usePhaseState() {
  const lenis = useLenis()

  function init() {
    if (triggers.length || typeof window === 'undefined') return

    PHASES.forEach((p) => {
      const trigger = ScrollTrigger.create({
        trigger: p.selector,
        // Hero is pinned: its "active" window is the entire pin span.
        // Other phases activate when their centre passes the viewport centre.
        start: p.index === 0 ? 'top top' : 'top center',
        end: p.index === 0 ? '+=150%' : 'bottom center',
        onToggle: (self) => {
          if (self.isActive) active.value = p.index
        },
      })
      triggers.push(trigger)
    })
  }

  function jumpTo(index: number) {
    const phase = PHASES[index]
    if (!phase) return
    const el = document.querySelector<HTMLElement>(phase.selector)
    if (!el) return
    // Lenis scrollTo accepts an HTMLElement or px offset. The 0 offset
    // lands the target at the top of the viewport.
    lenis.instance?.scrollTo(el, { offset: 0 })
  }

  function destroy() {
    triggers.forEach((t) => t.kill())
    triggers.length = 0
    active.value = 0
  }

  return {
    active: readonly(active),
    phases: PHASES,
    current: computed(() => PHASES[active.value] ?? PHASES[0]),
    init,
    jumpTo,
    destroy,
  }
}
