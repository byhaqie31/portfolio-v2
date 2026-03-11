<script setup lang="ts">
import { ArrowRight, Globe, MapPin } from 'lucide-vue-next'
import { personal } from '~/data/index'

// Typewriter for the role
const displayed = ref('')
const target = personal.role
let i = 0

// Cursor spotlight
const cursor = reactive({ x: 0, y: 0 })
const smoothCursor = reactive({ x: 0, y: 0 })
let raf: number

function onMouseMove(e: MouseEvent) {
  cursor.x = e.clientX
  cursor.y = e.clientY
}

function animateCursor() {
  smoothCursor.x += (cursor.x - smoothCursor.x) * 0.08
  smoothCursor.y += (cursor.y - smoothCursor.y) * 0.08
  raf = requestAnimationFrame(animateCursor)
}

onMounted(() => {
  const timer = setInterval(() => {
    displayed.value += target[i]
    i++
    if (i >= target.length) clearInterval(timer)
  }, 50)

  smoothCursor.x = window.innerWidth / 2
  smoothCursor.y = window.innerHeight / 2
  cursor.x = smoothCursor.x
  cursor.y = smoothCursor.y
  animateCursor()
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <section class="relative min-h-screen flex items-center px-6 pt-14 overflow-hidden" @mousemove="onMouseMove">
    <!-- Cursor spotlight -->
    <div
      class="absolute pointer-events-none rounded-full transition-opacity duration-300"
      :style="{
        width: '600px',
        height: '600px',
        left: `${smoothCursor.x}px`,
        top: `${smoothCursor.y}px`,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(200,169,126,0.07) 0%, transparent 65%)',
        filter: 'blur(8px)',
      }"
    />

    <!-- Dot grid -->
    <div
      class="absolute inset-0 pointer-events-none"
      style="background-image: radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px); background-size: 28px 28px;"
    />
    <!-- Gold glow -->
    <div
      class="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
      style="background: radial-gradient(circle, rgba(200,169,126,0.05) 0%, transparent 70%); filter: blur(60px);"
    />

    <div class="relative max-w-5xl mx-auto w-full py-24 md:py-36 flex flex-col md:flex-row items-center gap-12 md:gap-16">
      <!-- Left: text content -->
      <div class="flex-1 min-w-0">
      <!-- Availability badge -->
      <div
        class="animate-reveal inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-xs text-accent mb-10"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Available for {{ personal.availableFor }}
      </div>

      <!-- Name -->
      <p class="animate-reveal font-mono text-sm text-text-muted mb-3" style="animation-delay:0.05s">
        {{ personal.name }}
      </p>

      <!-- Role — typewriter -->
      <h1
        class="animate-reveal text-4xl sm:text-5xl md:text-[3.25rem] font-semibold tracking-tight leading-[1.1] text-text-primary mb-2"
        style="animation-delay:0.1s"
      >
        {{ displayed }}<span class="animate-blink text-accent ml-0.5">|</span>
      </h1>

      <!-- Focus area -->
      <p class="animate-reveal font-serif text-lg text-text-secondary italic mt-3 mb-8" style="animation-delay:0.15s">
        Focused on {{ personal.focus }}
      </p>

      <!-- Summary -->
      <p
        class="animate-reveal max-w-xl text-base text-text-secondary leading-relaxed mb-10"
        style="animation-delay:0.2s"
      >
        {{ personal.summary }}
      </p>

      <!-- CTAs -->
      <div class="animate-reveal flex flex-wrap items-center gap-3 mb-12" style="animation-delay:0.25s">
        <a href="#projects" class="btn-primary group">
          View my work
          <ArrowRight :size="14" class="group-hover:translate-x-0.5 transition-transform" />
        </a>
        <a :href="`mailto:${personal.email}`" class="btn-ghost">
          Get in touch
        </a>
      </div>

      <!-- Meta row -->
      <div class="animate-reveal flex flex-wrap items-center gap-5" style="animation-delay:0.3s">
        <span class="flex items-center gap-1.5 text-xs text-text-muted">
          <MapPin :size="12" />
          {{ personal.location }}
        </span>
        <span class="w-px h-3 bg-border" />
        <a
          :href="personal.website"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <Globe :size="12" />
          baihaqie.com
        </a>
      </div>
      </div>

      <!-- Right: profile picture -->
      <div class="animate-reveal shrink-0 flex items-center justify-center" style="animation-delay:0.2s">
        <div class="relative w-56 h-56 md:w-72 md:h-72">
          <!-- Outer glow -->
          <div
            class="absolute -inset-6 rounded-full pointer-events-none"
            style="background: radial-gradient(circle, rgba(200,169,126,0.18) 0%, transparent 70%); filter: blur(20px);"
          />
          <!-- Rotating dashed ring -->
          <div
            class="absolute -inset-3 rounded-full border border-dashed border-accent/20 animate-spin"
            style="animation-duration: 18s;"
          />
          <!-- Static outer ring -->
          <div class="absolute -inset-1.5 rounded-full border border-accent/30" />
          <!-- Inner frame with shadow -->
          <div
            class="relative w-full h-full rounded-full overflow-hidden border-2 border-accent/50"
            style="box-shadow: 0 0 0 4px rgba(200,169,126,0.08), 0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(200,169,126,0.12);"
          >
            <img
              src="/images/ProfilePicture.png"
              alt="Ahmad Baihaqie"
              class="w-full h-full object-cover object-top"
            />
            <!-- Subtle vignette overlay -->
            <div
              class="absolute inset-0 rounded-full pointer-events-none"
              style="background: radial-gradient(circle at 50% 110%, rgba(0,0,0,0.35) 0%, transparent 65%);"
            />
          </div>
          <!-- Corner accent dots -->
          <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent/60" />
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent/60" />
        </div>
      </div>
    </div>

    <!-- Scroll cue -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
      <div class="w-px h-10 bg-gradient-to-b from-border/0 to-border/60 mx-auto animate-pulse" />
    </div>
  </section>
</template>
