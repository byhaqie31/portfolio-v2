<script setup lang="ts">
import { personal, skillGroups, activities } from '~/data/index'
</script>

<template>
  <section id="about" class="section border-t border-border">
    <div class="max-w-5xl mx-auto">
      <div class="grid md:grid-cols-2 gap-16 items-start">
        <!-- Left: bio -->
        <div>
          <UiSectionHeading label="About" title="A bit about me" />

          <div class="space-y-4 text-text-secondary leading-relaxed reveal">
            <p>
              I'm <span class="text-text-primary font-medium">{{ personal.shortName }}</span>, a software
              engineer based in {{ personal.location }}, focused on
              <span class="font-serif italic text-text-primary">{{ personal.focus }}</span>.
            </p>
            <p>{{ personal.summary }}</p>
          </div>

          <!-- Languages -->
          <div class="mt-8 reveal reveal-delay-1">
            <p class="font-mono text-2xs text-accent uppercase tracking-widest mb-3">Languages</p>
            <div class="space-y-2">
              <div
                v-for="l in personal.languages"
                :key="l.lang"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-text-primary">{{ l.lang }}</span>
                <span class="text-text-muted font-mono text-xs">{{ l.level }}</span>
              </div>
            </div>
          </div>

          <!-- Activities -->
          <div class="mt-8 reveal reveal-delay-2">
            <p class="font-mono text-2xs text-accent uppercase tracking-widest mb-3">Extra-curricular</p>
            <ul class="space-y-2">
              <li
                v-for="act in activities"
                :key="act"
                class="text-xs text-text-muted leading-relaxed pl-3 border-l border-border"
              >
                {{ act }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Right: skills -->
        <div class="reveal reveal-delay-2">
          <p class="font-mono text-2xs text-accent uppercase tracking-widest mb-6">Skills & Tools</p>
          <div class="space-y-6">
            <div v-for="group in skillGroups" :key="group.label">
              <p class="text-xs text-text-muted mb-2.5">{{ group.label }}</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="item in group.items" :key="item" class="skill-tag">
                  {{ item }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
