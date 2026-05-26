import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

/**
 * useReveal — GSAP + ScrollTrigger driven entrance for `.reveal` elements.
 * Elements should start at opacity:0 in CSS to prevent FOUC; GSAP animates them in
 * when they cross 85% of the viewport. Respects prefers-reduced-motion via matchMedia.
 */
export function useReveal() {
  let mm: ReturnType<typeof gsap.matchMedia> | null = null

  onMounted(() => {
    mm = gsap.matchMedia()

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const elements = gsap.utils.toArray<HTMLElement>('.reveal')
      elements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              once: true,
            },
          },
        )
      })
    })

    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.reveal', { opacity: 1, y: 0 })
    })
  })

  onUnmounted(() => {
    mm?.revert()
    ScrollTrigger.getAll().forEach((t) => t.kill())
  })
}
