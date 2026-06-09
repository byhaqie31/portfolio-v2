<script setup lang="ts">
import type { HeroPhoto } from '~/data/index'

const props = withDefaults(
  defineProps<{
    open: boolean
    photos: HeroPhoto[]
    startIndex?: number
  }>(),
  { startIndex: 0 },
)
const emit = defineEmits<{ 'update:open': [boolean] }>()

const N = computed(() => props.photos.length)
const active = ref(0)
const flipped = ref(false) // only the active card can be flipped at a time

// Card size follows the viewport (portrait 4:5, so height-constrained), clamped
// to a sensible range. Width + gap drive both the layout and the centring shift.
const winW = ref(1280)
const winH = ref(800)
function readSize() {
  winW.value = window.innerWidth
  winH.value = window.innerHeight
}
const cardW = computed(() =>
  Math.round(Math.min(Math.max(Math.min(winH.value * 0.5, winW.value * 0.42), 320), 600)),
)
const gap = computed(() => Math.round(cardW.value * 0.1))
const rowShift = computed(() => -(active.value - (N.value - 1) / 2) * (cardW.value + gap.value))
const counter = computed(
  () => `${String(active.value + 1).padStart(2, '0')} / ${String(N.value).padStart(2, '0')}`,
)

function close() {
  emit('update:open', false)
}
function go(dir: number) {
  if (!N.value) return
  active.value = (active.value + dir + N.value) % N.value
  flipped.value = false // moving resets the flip so the new photo shows front
}
function onCardClick(i: number) {
  if (i !== active.value) {
    active.value = i
    flipped.value = false
  } else {
    flipped.value = !flipped.value
  }
}
function onKey(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') go(-1)
  else if (e.key === 'ArrowRight') go(1)
}

watch(
  () => props.open,
  (o) => {
    if (o) {
      active.value = Math.min(Math.max(props.startIndex ?? 0, 0), Math.max(N.value - 1, 0))
      flipped.value = false
    }
    // Freeze the page behind the overlay.
    if (import.meta.client) document.body.style.overflow = o ? 'hidden' : ''
  },
)

onMounted(() => {
  readSize()
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', readSize)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', readSize)
  if (import.meta.client) document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lb">
      <div v-if="open" class="lb" role="dialog" aria-modal="true" aria-label="Photo gallery">
        <div class="lb-backdrop" @click="close" />

        <button class="lb-close" aria-label="Close gallery" @click="close">
          <Icon name="fluent:dismiss-20-filled" size="18" />
        </button>

        <button class="lb-arrow lb-arrow--prev" aria-label="Previous photo" @click="go(-1)">
          <Icon name="fluent:chevron-left-20-filled" size="20" />
        </button>

        <div class="lb-viewport">
          <div class="lb-row" :style="{ gap: `${gap}px`, transform: `translateX(${rowShift}px)` }">
            <figure
              v-for="(p, i) in photos"
              :key="i"
              class="lb-card"
              :class="{ 'is-active': i === active, 'is-flipped': i === active && flipped }"
              :style="{ width: `${cardW}px` }"
              @click="onCardClick(i)"
            >
              <div class="lb-card-inner">
                <div class="lb-face lb-face--front">
                  <img v-if="p.img" :src="p.img" :alt="p.alt || ''" draggable="false" />
                </div>
                <div class="lb-face lb-face--back">
                  <div v-if="p.story" class="lb-story">
                    <span class="lb-story-kicker">{{ p.story.kicker }}</span>
                    <h3 class="lb-story-title">{{ p.story.title }}</h3>
                    <p class="lb-story-body">{{ p.story.body }}</p>
                  </div>
                </div>
              </div>
              <span v-if="i === active && p.story" class="lb-hint">
                Click to {{ flipped ? 'see photo' : 'read story' }}
              </span>
            </figure>
          </div>
        </div>

        <button class="lb-arrow lb-arrow--next" aria-label="Next photo" @click="go(1)">
          <Icon name="fluent:chevron-right-20-filled" size="20" />
        </button>

        <div class="lb-counter">{{ counter }}</div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lb {
  --ease-apple: cubic-bezier(0.16, 1, 0.3, 1);
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lb-backdrop {
  position: absolute;
  inset: 0;
  background: rgb(var(--color-bg-raw) / 0.72);
  backdrop-filter: blur(20px) saturate(120%);
  -webkit-backdrop-filter: blur(20px) saturate(120%);
}

/* Viewport lets clicks on empty space fall through to the backdrop (close). */
.lb-viewport {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
}
.lb-row {
  display: flex;
  padding: 48px 0;
  transition: transform 0.55s var(--ease-apple);
}

.lb-card {
  flex: 0 0 auto; /* width is set inline (responsive to the viewport) */
  aspect-ratio: 4 / 5;
  margin: 0;
  perspective: 1500px;
  cursor: pointer;
  pointer-events: auto;
  opacity: 0.4;
  transform: scale(0.82);
  transition: transform 0.55s var(--ease-apple), opacity 0.55s var(--ease-apple);
}
.lb-card.is-active {
  opacity: 1;
  transform: scale(1.06);
}
.lb-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s var(--ease-apple);
}
.lb-card.is-flipped .lb-card-inner {
  transform: rotateY(180deg);
}
.lb-face {
  position: absolute;
  inset: 0;
  border-radius: 22px;
  overflow: hidden;
  background: var(--color-surface-raised);
  border: 1px solid var(--color-border-subtle);
  box-shadow: 0 30px 70px -30px rgb(var(--color-text-primary-raw) / 0.5);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.lb-face--front img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
}
.lb-face--back {
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  padding: 30px;
  background: var(--color-surface);
}
.lb-story-kicker {
  font-family: var(--font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-accent);
}
.lb-story-title {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--color-text-primary);
}
.lb-story-body {
  font-size: 0.95rem;
  line-height: 1.55;
  color: var(--color-text-secondary);
}
.lb-hint {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -26px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

/* Chrome buttons */
.lb-close,
.lb-arrow {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary);
  background: rgb(var(--color-surface-raw) / 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--color-border-subtle);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 12px 30px -16px rgb(var(--color-text-primary-raw) / 0.5);
  transition: transform 0.18s var(--ease-apple), color 0.18s, border-color 0.18s;
}
.lb-close:hover,
.lb-arrow:hover {
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}
.lb-close:focus-visible,
.lb-arrow:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.lb-close {
  top: 24px;
  right: 24px;
  width: 42px;
  height: 42px;
}
.lb-close:hover {
  transform: rotate(90deg);
}
.lb-arrow {
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
}
.lb-arrow:hover {
  transform: translateY(-50%) scale(1.06);
}
.lb-arrow--prev {
  left: clamp(16px, 4vw, 56px);
}
.lb-arrow--next {
  right: clamp(16px, 4vw, 56px);
}
.lb-counter {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

/* Open / close transition */
.lb-enter-active,
.lb-leave-active {
  transition: opacity 0.32s ease;
}
.lb-enter-from,
.lb-leave-to {
  opacity: 0;
}
.lb-enter-active .lb-row,
.lb-leave-active .lb-row {
  transition: transform 0.4s var(--ease-apple), opacity 0.32s ease;
}
.lb-enter-from .lb-row,
.lb-leave-to .lb-row {
  opacity: 0;
  transform: scale(0.94);
}

@media (prefers-reduced-motion: reduce) {
  .lb-row,
  .lb-card,
  .lb-card-inner,
  .lb-close,
  .lb-arrow {
    transition: none;
  }
}
</style>
