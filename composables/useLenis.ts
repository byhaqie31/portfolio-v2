import { gsap } from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/*
 * Lenis lifecycle for the cinematic surface. Driven by GSAP's ticker
 * so ScrollTrigger stays frame-accurate.
 *
 * Pattern mirrors jet-engine-infographic/src/host-animations.js. The
 * singleton ensures we never double-init when the layout remounts on
 * client-side navigation, and that destroy() reliably cleans up.
 *
 * ScrollTrigger is registered + bound to Lenis's scroll event here so
 * any composable that creates triggers (useFlightScroll, future ones)
 * stays in sync with the smooth-scrolled position.
 */

gsap.registerPlugin(ScrollTrigger)

let lenis: Lenis | null = null
let rafCallback: ((time: number) => void) | null = null

export function useLenis() {
  function init() {
    if (lenis || typeof window === 'undefined') return

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

    lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)
    rafCallback = (time: number) => lenis?.raf(time * 1000)
    gsap.ticker.add(rafCallback)
    gsap.ticker.lagSmoothing(0)

    window.scrollTo(0, 0)
    lenis.scrollTo(0, { immediate: true })
  }

  function destroy() {
    if (!lenis) return
    if (rafCallback) gsap.ticker.remove(rafCallback)
    lenis.destroy()
    lenis = null
    rafCallback = null
  }

  return {
    init,
    destroy,
    get instance() {
      return lenis
    },
  }
}
