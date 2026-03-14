<script setup lang="ts">
import { useTheme } from '~/composables/useTheme'

const { isDark, toggle: toggleTheme, init } = useTheme()
const starCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  init()
  initStarfield()
})

function initStarfield() {
  const canvas = starCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let animId: number
  const stars: { x: number; y: number; r: number; baseAlpha: number; speed: number; phase: number }[] = []
  const STAR_COUNT = 350

  function resize() {
    canvas!.width = window.innerWidth
    canvas!.height = window.innerHeight
    createStars()
  }

  function createStars() {
    stars.length = 0
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        r: Math.random() * 1.6 + 0.2,
        baseAlpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 1.0 + 0.2,
        phase: Math.random() * Math.PI * 2,
      })
    }
  }

  function draw(time: number) {
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
    const dark = document.documentElement.classList.contains('dark')

    for (const star of stars) {
      const twinkle = Math.sin(time * 0.001 * star.speed + star.phase) * 0.35 + 0.65
      const alpha = star.baseAlpha * twinkle

      if (dark) {
        const isCyan = star.r > 1.0
        ctx!.fillStyle = isCyan
          ? `rgba(0, 200, 255, ${alpha})`
          : `rgba(208, 232, 245, ${alpha * 0.7})`

        if (star.r > 1.2) {
          ctx!.shadowBlur = 8
          ctx!.shadowColor = `rgba(0, 200, 255, ${alpha * 0.6})`
        } else {
          ctx!.shadowBlur = 0
        }
      } else {
        ctx!.fillStyle = `rgba(0, 120, 200, ${alpha * 0.2})`
        if (star.r > 1.2) {
          ctx!.shadowBlur = 4
          ctx!.shadowColor = `rgba(0, 160, 220, ${alpha * 0.15})`
        } else {
          ctx!.shadowBlur = 0
        }
      }

      ctx!.beginPath()
      ctx!.arc(star.x, star.y, star.r, 0, Math.PI * 2)
      ctx!.fill()
    }

    ctx!.shadowBlur = 0
    animId = requestAnimationFrame(draw)
  }

  resize()
  animId = requestAnimationFrame(draw)

  window.addEventListener('resize', resize)

  onUnmounted(() => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', resize)
  })
}
</script>

<template>
  <div class="min-h-screen bg-bg scanlines flex flex-col">
    <!-- Starfield canvas -->
    <canvas
      ref="starCanvas"
      class="fixed inset-0 w-full h-full pointer-events-none z-0"
    />

    <!-- Noise texture overlay -->
    <svg class="fixed inset-0 w-full h-full pointer-events-none z-98 opacity-[0.03]">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>

    <!-- Top bar with theme toggle -->
    <header class="relative z-1 flex items-center justify-between px-6 h-14">
      <span class="font-display text-sm font-bold tracking-[0.15em] uppercase text-text-primary">
        qie<span class="text-accent">.dev</span>
      </span>
      <button class="btn-ghost text-xs" @click="toggleTheme">
        <Icon v-if="isDark" name="fluent:weather-sunny-16-filled" size="14" />
        <Icon v-else name="fluent:weather-moon-16-filled" size="14" />
        {{ isDark ? 'Light' : 'Dark' }}
      </button>
    </header>

    <!-- Main content -->
    <main class="relative z-1 flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="relative z-1 py-6 text-center">
      <p class="text-text-muted text-xs font-tech tracking-wider">
        &copy; {{ new Date().getFullYear() }} Axelnova &middot;
        <a href="https://baihaqie.com" target="_blank" class="text-accent hover:text-accent/80 transition-colors">baihaqie.com</a>
      </p>
    </footer>

    <UiAdminConfirm />
  </div>
</template>
