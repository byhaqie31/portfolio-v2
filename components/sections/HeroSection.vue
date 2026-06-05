<script setup lang="ts">
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { personal as staticPersonal, heroBadge, heroBadgeExp, heroTaglines } from '~/data/index'

const { data: personalData } = await usePersonal()

const personal = computed(() => {
  const d = personalData.value as any
  return {
    shortName: d?.short_name || staticPersonal.shortName,
    location: d?.location || staticPersonal.location,
    availableFor: d?.available_for || staticPersonal.availableFor,
    focus: d?.focus || staticPersonal.focus,
  }
})

// Stacked headline — first word on its own line, the rest (with the accent
// period) beneath it, mirroring the "Ahmad / Baihaqie." prototype.
const nameParts = computed(() => {
  const parts = personal.value.shortName.trim().split(' ')
  return { first: parts[0], rest: parts.slice(1).join(' ') || parts[0] }
})

const heroRoot = ref<HTMLElement | null>(null)
const photoWrap = ref<HTMLElement | null>(null)
const photo = ref<HTMLImageElement | null>(null)
const badgeStack = ref<HTMLElement | null>(null)
const badgeExp = ref<HTMLElement | null>(null)
const subInner = ref<HTMLElement | null>(null)

// Rotating subtitle: parse a `**bold**`-marked line into styled segments.
const taglineIndex = ref(0)
const segments = computed(() =>
  (heroTaglines[taglineIndex.value] ?? '')
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^\*\*([^*]+)\*\*$/)
      return m ? { text: m[1], em: true } : { text: part, em: false }
    }),
)

let mm: ReturnType<typeof gsap.matchMedia> | null = null

// After the portrait settles, recompute pinned-section measurements so the
// Statement / Projects pins start from the correct document height.
function refreshTriggers() {
  if (import.meta.client) ScrollTrigger.refresh()
}

onMounted(() => {
  if (!heroRoot.value) return

  mm = gsap.matchMedia()

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    let rotTimer: ReturnType<typeof gsap.delayedCall> | null = null

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo('.hero-photo-wrap', { opacity: 0, scale: 0.92, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 1.6 }, 0)
        .fromTo('[data-hero-stagger]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, 0.15)
        .fromTo('.hero-badge', { opacity: 0, y: 14, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08 }, 0.9)
        .fromTo('.scroll-cue', { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.2)
    }, heroRoot.value!)

    // Cross-fade the subtitle between taglines, looping while mounted.
    function cycle() {
      if (heroTaglines.length < 2 || !subInner.value) return
      gsap
        .timeline({ onComplete: () => { rotTimer = gsap.delayedCall(2.8, cycle) } })
        .to(subInner.value, { opacity: 0, y: -8, duration: 0.4, ease: 'power2.in' })
        .add(() => { taglineIndex.value = (taglineIndex.value + 1) % heroTaglines.length })
        .fromTo(subInner.value, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'expo.out' }, '+=0.06')
    }
    rotTimer = gsap.delayedCall(3.8, cycle)

    return () => {
      rotTimer?.kill()
      if (subInner.value) gsap.killTweensOf(subInner.value)
      taglineIndex.value = 0
      ctx.revert()
    }
  })

  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set('[data-hero-stagger], .hero-photo-wrap, .hero-badge, .scroll-cue', {
      opacity: 1,
      y: 0,
      scale: 1,
    })
  })

  // Hover (desktop, motion-on): portrait zooms in, badges drift apart for depth.
  mm.add('(prefers-reduced-motion: no-preference) and (hover: hover)', () => {
    const wrap = photoWrap.value
    const img = photo.value
    const bStack = badgeStack.value
    const bExp = badgeExp.value
    if (!wrap || !img || !bStack || !bExp) return

    const ease = 'power3.out'
    const onEnter = () => {
      gsap.to(img, { scale: 1.06, duration: 0.6, ease })
      gsap.to(bStack, { x: -10, y: 10, scale: 1.05, duration: 0.6, ease })
      gsap.to(bExp, { x: 10, y: -10, scale: 1.05, duration: 0.6, ease })
    }
    const onLeave = () => {
      gsap.to([img, bStack, bExp], { x: 0, y: 0, scale: 1, duration: 0.7, ease })
    }

    wrap.addEventListener('mouseenter', onEnter)
    wrap.addEventListener('mouseleave', onLeave)

    return () => {
      wrap.removeEventListener('mouseenter', onEnter)
      wrap.removeEventListener('mouseleave', onLeave)
      gsap.set([img, bStack, bExp], { clearProps: 'transform' })
    }
  })

  // Image may already be cached (complete) on mount.
  if (photo.value?.complete) refreshTriggers()
})

onUnmounted(() => mm?.revert())
</script>

<template>
  <section
    id="top"
    ref="heroRoot"
    class="relative min-h-svh flex items-center px-6 pt-20 pb-32 lg:pb-0"
  >
    <div class="max-w-6xl mx-auto w-full grid lg:grid-cols-[1.15fr_0.85fr] gap-11 lg:gap-16 items-center">
      <!-- Left: copy -->
      <div class="order-2 lg:order-1">
        <span
          data-hero-stagger
          class="inline-flex items-center gap-2.5 text-sm font-medium text-text-secondary mb-7"
        >
          <span class="dot-available" />
          Available for {{ personal.availableFor }} · {{ personal.location }}
        </span>

        <h1 class="text-[clamp(3rem,8vw,5.5rem)] font-semibold leading-[0.98] text-text-primary" style="letter-spacing:-0.035em">
          <span data-hero-stagger class="block">{{ nameParts.first }}</span>
          <span data-hero-stagger class="block">{{ nameParts.rest }}<span class="text-accent">.</span></span>
        </h1>

        <p data-hero-stagger class="mt-7 text-[clamp(1.125rem,2.2vw,1.5rem)] text-text-secondary leading-snug min-h-[2.9em] sm:min-h-[2.8em]">
          <span ref="subInner" class="inline-block max-w-[34ch]">
            <template v-for="(seg, i) in segments" :key="i"><span
              v-if="seg.em"
              class="text-text-primary font-medium"
            >{{ seg.text }}</span><template v-else>{{ seg.text }}</template></template>
          </span>
        </p>

        <div data-hero-stagger class="mt-10 flex flex-wrap items-center gap-5">
          <NuxtLink to="/experience" class="btn-primary group">
            Experience my journey
            <Icon name="fluent:arrow-right-16-filled" size="14" class="group-hover:translate-x-0.5 transition-transform" />
          </NuxtLink>
          <a href="#contact" class="link-quiet">
            Get in touch <span class="arrow">→</span>
          </a>
        </div>
      </div>

      <!-- Right: portrait + floating credential badges -->
      <div ref="photoWrap" class="hero-photo-wrap order-1 lg:order-2 relative justify-self-center lg:justify-self-end">
        <div class="hero-photo relative overflow-hidden rounded-[28px] border border-border-subtle">
          <img
            ref="photo"
            src="/images/ProfilePicture.png"
            alt="Portrait of Ahmad Baihaqie"
            class="w-full h-full object-cover object-top"
            @load="refreshTriggers"
          />
        </div>

        <!-- Stack / role badge — bottom-left -->
        <div ref="badgeStack" class="hero-badge hero-badge-stack">
          <div class="text-2xl font-semibold tracking-tight text-text-primary">{{ heroBadge.key }}</div>
          <div class="text-xs text-text-muted mt-0.5">{{ heroBadge.label }}</div>
        </div>

        <!-- Experience / company badge — top-right, desktop only -->
        <div ref="badgeExp" class="hero-badge hero-badge-exp hidden lg:block">
          <div class="text-2xl font-semibold tracking-tight text-text-primary">{{ heroBadgeExp.key }}</div>
          <div class="text-xs text-text-muted mt-0.5">{{ heroBadgeExp.label }}</div>
        </div>
      </div>
    </div>

    <!-- Scroll cue -->
    <div class="scroll-cue">
      <span class="mouse" />
      Scroll
    </div>
  </section>
</template>

<style scoped>
.hero-photo {
  width: clamp(260px, 30vw, 400px);
  aspect-ratio: 4 / 5;
  box-shadow: 0 40px 80px -40px rgb(var(--color-accent-raw) / 0.45);
}
.hero-photo img {
  will-change: transform;
}

.hero-badge {
  position: absolute;
  padding: 14px 18px;
  border-radius: 16px;
  background: rgb(var(--color-surface-raw) / 0.82);
  border: 1px solid var(--color-border-subtle);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 20px 50px -24px rgb(var(--color-text-primary-raw) / 0.4);
  will-change: transform;
}
.hero-badge-stack {
  left: -20px;
  bottom: 28px;
}
.hero-badge-exp {
  right: -20px;
  top: 28px;
}

.scroll-cue {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.scroll-cue .mouse {
  width: 22px;
  height: 34px;
  border: 1.5px solid var(--color-border-strong);
  border-radius: 12px;
  position: relative;
}
.scroll-cue .mouse::after {
  content: "";
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 3px;
  height: 6px;
  border-radius: 2px;
  background: var(--color-text-muted);
  animation: scroll-wheel 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
}
@keyframes scroll-wheel {
  0% { opacity: 0; transform: translate(-50%, 0); }
  40% { opacity: 1; }
  100% { opacity: 0; transform: translate(-50%, 10px); }
}

@media (max-width: 1023px) {
  /* Single badge on tablet/mobile — keep it inside the narrower portrait. */
  .hero-badge-stack { left: auto; right: -8px; }
}

/* FOUC guard — only when JS can run the entrance. SSR/no-JS shows content. */
@media (scripting: enabled) {
  [data-hero-stagger],
  .hero-photo-wrap,
  .scroll-cue {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-cue { display: none; }
}
</style>
