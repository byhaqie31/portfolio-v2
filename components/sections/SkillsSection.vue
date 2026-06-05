<script setup lang="ts">
import { gsap } from 'gsap'
import { skillGroups as staticSkillGroups } from '~/data/index'

const { data: skillsData } = await usePreviewableFetch<any[]>('skills', '/api/skills', {
  key: 'skills',
  default: () => staticSkillGroups as any[],
})

const skillGroups = computed(() => {
  const data = skillsData.value as any[]
  if (!data?.length) return staticSkillGroups
  return data.map((g: any) => ({
    label: g.label,
    items: g.items || [],
  }))
})

const grid = ref<HTMLElement | null>(null)

let mm: ReturnType<typeof gsap.matchMedia> | null = null
const cleanups: Array<() => void> = []

onMounted(() => {
  if (!grid.value) return

  mm = gsap.matchMedia()

  // Only on real hover-capable, motion-allowed devices.
  mm.add('(prefers-reduced-motion: no-preference) and (hover: hover)', () => {
    const cards = Array.from(grid.value!.querySelectorAll<HTMLElement>('.skill-card'))

    cards.forEach((card) => {
      // ── Card wiggle on enter ──
      const onCardEnter = () => {
        gsap.killTweensOf(card, 'rotation')
        gsap.to(card, {
          keyframes: { rotation: [-1.6, 1.2, -0.7, 0.4, 0] },
          duration: 0.6,
          ease: 'power2.out',
        })
      }
      card.addEventListener('mouseenter', onCardEnter)
      cleanups.push(() => card.removeEventListener('mouseenter', onCardEnter))

      // ── Dock-style magnify on the pills ──
      const row = card.querySelector<HTMLElement>('.skill-tags')
      if (!row) return
      const pills = Array.from(row.querySelectorAll<HTMLElement>('.skill-tag'))
      const scaleTo = pills.map((p) => gsap.quickTo(p, 'scale', { duration: 0.3, ease: 'power3.out' }))

      let centers: number[] = []
      const RADIUS = 88 // px of influence each side of the cursor
      const AMP = 0.36 // peak extra scale at the cursor

      const cacheCenters = () => {
        centers = pills.map((p) => {
          const r = p.getBoundingClientRect()
          return r.left + r.width / 2
        })
      }
      const onMove = (e: MouseEvent) => {
        if (!centers.length) cacheCenters()
        pills.forEach((_, i) => {
          const center = centers[i]
          const set = scaleTo[i]
          if (center == null || !set) return
          const dist = Math.abs(e.clientX - center)
          set(dist < RADIUS ? 1 + AMP * (1 - dist / RADIUS) : 1)
        })
      }
      const onLeave = () => {
        centers = []
        scaleTo.forEach((fn) => fn(1))
      }

      row.addEventListener('mouseenter', cacheCenters)
      row.addEventListener('mousemove', onMove)
      row.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        row.removeEventListener('mouseenter', cacheCenters)
        row.removeEventListener('mousemove', onMove)
        row.removeEventListener('mouseleave', onLeave)
      })
    })

    return () => {
      cleanups.forEach((fn) => fn())
      cleanups.length = 0
      gsap.set(grid.value!.querySelectorAll('.skill-tag'), { clearProps: 'transform' })
      gsap.set(cards, { clearProps: 'rotation' })
    }
  })
})

onUnmounted(() => {
  cleanups.forEach((fn) => fn())
  mm?.revert()
})
</script>

<template>
  <section id="skills" class="section">
    <div class="max-w-6xl mx-auto">
      <UiSectionHeading
        label="Skills"
        title="A toolkit across design and front-end."
        description="Technologies and tools I reach for day-to-day to design and ship products."
      />

      <div ref="grid" class="grid gap-5 sm:grid-cols-2">
        <article
          v-for="(group, gi) in skillGroups"
          :key="group.label"
          class="skill-card card reveal"
        >
          <h3 class="flex items-center gap-2.5 text-[1.0625rem] font-semibold tracking-tight text-text-primary mb-5">
            <span class="idx">{{ String(gi + 1).padStart(2, '0') }}</span>
            {{ group.label }}
          </h3>
          <div class="skill-tags flex flex-wrap gap-2.5">
            <span v-for="item in group.items" :key="item" class="skill-tag">
              {{ item }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* GSAP owns transform (wiggle/magnify); only animate non-transform props in CSS. */
.skill-card {
  padding: 32px;
  will-change: transform;
  transition: border-color 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.skill-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: 0 18px 40px -24px rgb(var(--color-text-primary-raw) / 0.18);
}

.idx {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.skill-card .skill-tag {
  transform-origin: center;
  will-change: transform;
  cursor: default;
}
</style>
