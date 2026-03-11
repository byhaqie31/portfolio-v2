<script setup lang="ts">
import { personal, skillGroups } from '~/data/index'
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
              I'm <span class="text-text-primary font-medium">{{ personal.name }}</span>, a software
              engineer based in {{ personal.location }}. I care about writing code that is clean,
              maintainable, and ships real value.
            </p>
            <p>
              My focus is on the <span class="font-serif italic text-text-primary">intersection of design
              and engineering</span> — building interfaces that feel fast and intentional, backed by
              solid architecture.
            </p>
            <p>
              When I'm not coding, I'm usually reading about systems design, experimenting with new
              tools, or obsessing over typography.
            </p>
          </div>
        </div>

        <!-- Right: skills -->
        <div class="reveal reveal-delay-2">
          <p class="font-mono text-2xs text-accent uppercase tracking-widest mb-6">Skills & Tools</p>
          <div class="space-y-6">
            <div v-for="group in skillGroups" :key="group.category">
              <p class="text-xs text-text-muted mb-2.5">{{ group.category }}</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="skill in group.skills" :key="skill" class="skill-tag">
                  {{ skill }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
