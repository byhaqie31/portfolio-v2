import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Ref } from 'vue'

if (import.meta.client) {
  gsap.registerPlugin(ScrollTrigger)
}

interface RailOptions {
  root: Ref<HTMLElement | null>
  outer: Ref<HTMLElement | null>
  viewport: Ref<HTMLElement | null>
  track: Ref<HTMLElement | null>
  /** Live count of cards in the track (drives the progress index). */
  count: () => number
}

/**
 * useHorizontalRail — pinned horizontal-scroll choreography shared by the
 * Projects and References rails. Translates `track` across the pinned
 * `viewport` as the page scrolls through `outer`, exposing reactive progress.
 *
 * SSR / no-JS / mobile / reduced-motion all leave `pinEnabled` false so the
 * consumer renders its vertical fallback grid instead. The rail is also
 * skipped when the track already fits the viewport (nothing to scroll).
 *
 * All GSAP is gsap.matchMedia-gated and scoped via gsap.context, reverted on
 * unmount — no ScrollTrigger leaks on route change.
 */
export function useHorizontalRail(opts: RailOptions) {
  const pinEnabled = ref(false)
  const progressPct = ref(0)
  const currentIdx = ref('01')

  let mm: ReturnType<typeof gsap.matchMedia> | null = null
  let ctx: ReturnType<typeof gsap.context> | null = null

  onMounted(() => {
    if (!opts.root.value) return

    mm = gsap.matchMedia()

    mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
      pinEnabled.value = true
      let killed = false

      // Wait for v-show to make the rail measurable before building the tween.
      nextTick(() => {
        if (killed || !opts.track.value || !opts.outer.value || !opts.viewport.value) return
        const trackEl = opts.track.value
        const getScrollDist = () => trackEl.scrollWidth - window.innerWidth + 48

        // Track already fits the viewport — fall back to the grid.
        if (getScrollDist() <= 0) {
          pinEnabled.value = false
          return
        }

        ctx = gsap.context(() => {
          gsap.to(trackEl, {
            x: () => -getScrollDist(),
            ease: 'none',
            scrollTrigger: {
              trigger: opts.outer.value!,
              start: 'top top',
              end: () => '+=' + getScrollDist(),
              pin: opts.viewport.value!,
              scrub: 0.8,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const total = opts.count()
                progressPct.value = self.progress * 100
                currentIdx.value = String(
                  Math.min(total, Math.floor(self.progress * total) + 1),
                ).padStart(2, '0')
              },
            },
          })
        }, opts.root.value!)

        ScrollTrigger.refresh()
      })

      return () => {
        killed = true
        ctx?.revert()
        ctx = null
        pinEnabled.value = false
      }
    })
  })

  onUnmounted(() => mm?.revert())

  return { pinEnabled, progressPct, currentIdx }
}
