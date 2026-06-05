<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { projects as staticProjects } from '~/data/index'

const { data: projectsData } = await usePreviewableFetch<any[]>('projects', '/api/projects', {
  key: 'projects',
  default: () => staticProjects as any[],
})

const projects = computed(() => {
  const data = projectsData.value as any[]
  if (!data?.length) return staticProjects
  return data.map((p: any) => ({
    id: p.slug || p.id,
    tag: p.tag,
    featured: !!p.featured,
    name: p.name,
    description: p.description,
    stack: p.stack || [],
    metrics: p.metrics,
    href: p.href,
    github: p.github_url || p.github,
  }))
})

const total = computed(() => projects.value.length)
const totalLabel = computed(() => String(total.value).padStart(2, '0'))

// A project's outbound link + label for the quiet card CTA.
function projectLink(p: any): { href: string; label: string } | null {
  if (p.github) return { href: p.github, label: 'View on GitHub' }
  if (p.href && p.href !== '#') return { href: p.href, label: 'Visit live site' }
  return null
}

const root = ref<HTMLElement | null>(null)
const outer = ref<HTMLElement | null>(null)
const viewport = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)

// SSR + no-JS + mobile + reduced-motion all render the vertical fallback grid.
// The pinned rail is enabled only inside the matching matchMedia branch.
const pinEnabled = ref(false)
const progressPct = ref(0)
const currentIdx = ref('01')

let mm: ReturnType<typeof gsap.matchMedia> | null = null
let pinCtx: ReturnType<typeof gsap.context> | null = null

onMounted(() => {
  if (!root.value) return

  mm = gsap.matchMedia()

  mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
    pinEnabled.value = true
    let killed = false

    // Wait for v-show to make the rail measurable before building the tween.
    nextTick(() => {
      if (killed || !track.value || !outer.value || !viewport.value) return
      const trackEl = track.value
      const getScrollDist = () => trackEl.scrollWidth - window.innerWidth + 48

      pinCtx = gsap.context(() => {
        gsap.to(trackEl, {
          x: () => -getScrollDist(),
          ease: 'none',
          scrollTrigger: {
            trigger: outer.value!,
            start: 'top top',
            end: () => '+=' + getScrollDist(),
            pin: viewport.value!,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              progressPct.value = self.progress * 100
              currentIdx.value = String(
                Math.min(total.value, Math.floor(self.progress * total.value) + 1),
              ).padStart(2, '0')
            },
          },
        })
      }, root.value!)

      ScrollTrigger.refresh()
    })

    return () => {
      killed = true
      pinCtx?.revert()
      pinCtx = null
      pinEnabled.value = false
    }
  })
})

onUnmounted(() => mm?.revert())
</script>

<template>
  <section id="projects" ref="root">
    <!-- ── Pinned horizontal rail (desktop, motion-on) ── -->
    <div v-show="pinEnabled" ref="outer" class="projects-pin-outer">
      <div ref="viewport" class="projects-track-viewport">
        <div class="projects-head-row max-w-6xl mx-auto px-6 w-full">
          <div>
            <p class="text-sm text-accent font-medium mb-3">Selected work</p>
            <h2 class="text-3xl md:text-4xl lg:text-[2.75rem] font-semibold tracking-tight leading-[1.1] text-text-primary">
              Projects & shipped products.
            </h2>
          </div>
          <div class="projects-progress">
            <span class="tabular-nums">{{ currentIdx }}</span>
            <span class="bar"><i :style="{ width: progressPct + '%' }" /></span>
            <span class="tabular-nums">{{ totalLabel }} · scroll →</span>
          </div>
        </div>

        <div ref="track" class="projects-track">
          <article
            v-for="(p, i) in projects"
            :key="p.id"
            class="project-card"
          >
            <div class="text-xs text-text-muted tabular-nums mb-3.5">{{ String(i + 1).padStart(2, '0') }}</div>
            <span class="text-xs font-semibold text-accent mb-4 inline-flex items-center gap-1.5">{{ p.tag }}</span>
            <h3 class="text-2xl font-semibold tracking-tight leading-tight text-text-primary">{{ p.name }}</h3>
            <p class="mt-4 text-[0.9375rem] text-text-secondary leading-relaxed flex-1">{{ p.description }}</p>

            <div v-if="p.metrics?.length" class="flex gap-6 my-5">
              <div v-for="m in p.metrics" :key="m.label">
                <div class="text-2xl font-semibold text-accent leading-none">{{ m.value }}</div>
                <div class="text-xs text-text-muted mt-1.5 max-w-[12ch]">{{ m.label }}</div>
              </div>
            </div>

            <div class="flex flex-wrap gap-1.5 mt-5">
              <span v-for="s in p.stack" :key="s" class="stack-pill">{{ s }}</span>
            </div>

            <div v-if="projectLink(p)" class="mt-6">
              <a :href="projectLink(p)!.href" target="_blank" rel="noopener noreferrer" class="link-quiet">
                {{ projectLink(p)!.label }} <span class="arrow">→</span>
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>

    <!-- ── Fallback grid (mobile / reduced-motion / no-JS) ── -->
    <div v-show="!pinEnabled" class="section">
      <div class="max-w-6xl mx-auto">
        <UiSectionHeading
          label="Selected work"
          title="Projects & shipped products."
          description="A selection of projects I've shipped, from fintech portals to full-stack web apps."
        />
        <div class="grid gap-6 md:grid-cols-2">
          <UiProjectCard v-for="p in projects" :key="p.id" :project="p" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.projects-pin-outer {
  position: relative;
}
.projects-track-viewport {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.projects-head-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 36px;
}
.projects-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
.projects-progress .bar {
  width: 120px;
  height: 2px;
  background: var(--color-border);
  border-radius: 2px;
  overflow: hidden;
}
.projects-progress .bar i {
  display: block;
  height: 100%;
  background: var(--color-accent);
}
.projects-track {
  display: flex;
  gap: 28px;
  padding: 0 24px;
  will-change: transform;
}
.project-card {
  flex: 0 0 auto;
  width: min(440px, 80vw);
  min-height: 460px;
  display: flex;
  flex-direction: column;
  padding: 36px;
  border-radius: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
}
</style>
