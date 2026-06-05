<script setup lang="ts">
import { gsap } from 'gsap'
import { impact } from '~/data/index'

const root = ref<HTMLElement | null>(null)

// Live display values for counter metrics (keyed by index). Glyph metrics
// don't appear here — they render their static glyph directly.
const counts = reactive<Record<number, number>>({})
impact.forEach((m, i) => {
  if (m.count != null) counts[i] = 0
})

let mm: ReturnType<typeof gsap.matchMedia> | null = null

onMounted(() => {
  if (!root.value) return

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const ctx = gsap.context(() => {
      impact.forEach((m, i) => {
        if (m.count == null) return
        const obj = { v: 0 }
        gsap.to(obj, {
          v: m.count,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: root.value!, start: 'top 85%', once: true },
          onUpdate: () => {
            counts[i] = Math.round(obj.v)
          },
        })
      })
    }, root.value!)

    return () => ctx.revert()
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    impact.forEach((m, i) => {
      if (m.count != null) counts[i] = m.count
    })
  })
})

onUnmounted(() => mm?.revert())
</script>

<template>
  <section ref="root" aria-label="Impact" class="bg-bg-secondary px-6 py-24 md:py-28">
    <div class="max-w-6xl mx-auto grid gap-8 sm:gap-6 sm:grid-cols-3">
      <div
        v-for="(m, i) in impact"
        :key="i"
        class="metric text-center px-3 py-4"
      >
        <div class="figure">
          <template v-if="m.count != null">
            <span class="tabular-nums">{{ counts[i] ?? 0 }}</span><span class="suffix">{{ m.suffix }}</span>
          </template>
          <span v-else class="text-accent">{{ m.glyph }}</span>
        </div>
        <p class="mt-4 text-[0.9375rem] text-text-secondary">{{ m.label }}</p>
        <p class="mt-1 text-[0.8125rem] text-text-muted">{{ m.sub }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.metric .figure {
  font-size: clamp(3rem, 7vw, 5rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--color-text-primary);
  display: inline-flex;
  align-items: baseline;
  font-variant-numeric: tabular-nums;
}
.metric .figure .suffix {
  font-size: 0.45em;
  color: var(--color-accent);
  margin-left: 4px;
  font-weight: 600;
}
</style>
