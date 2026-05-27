<script setup lang="ts">
/*
 * Generic phase section for /experience. Uses the lower-third
 * composition: small mono dataline pinned to the upper-left of the
 * section, masthead anchored to the bottom-left (Playfair headline +
 * subline + hairline rule + mono meta + body), sky/aircraft fill the
 * middle. One 100vh section per phase; the scroll choreography in
 * useFlightScroll handles aircraft pose across the whole flight.
 *
 * Body content is slotted so phases with custom layouts (e.g. FL380
 * with project tiles) can override the default body styling.
 */

defineProps<{
  phaseLabel: string
  headline: string
  subline: string
  meta?: string
}>()
</script>

<template>
  <section class="phase phase--standard">
    <p class="phase__label">{{ phaseLabel }}</p>

    <div class="phase__masthead">
      <h2 class="phase__display">{{ headline }}</h2>
      <p class="phase__subline">{{ subline }}</p>

      <hr class="phase__rule" />

      <p v-if="meta" class="phase__meta">{{ meta }}</p>

      <div class="phase__body">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.phase {
  min-height: 100vh;
  padding: var(--space-12) var(--space-8) var(--space-16);
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
}

.phase__masthead {
  max-width: 720px;
}

.phase__label {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 0 0 var(--space-6);
}

.phase__display {
  font-family: var(--font-display);
  font-size: var(--font-display-large);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--color-ink-primary);
  margin: 0 0 var(--space-4);
}

.phase__subline {
  font-family: var(--font-body);
  font-size: var(--font-body-large);
  color: var(--color-ink-secondary);
  margin: 0 0 var(--space-8);
}

.phase__rule {
  width: 56px;
  height: 1px;
  background: var(--color-divider);
  border: 0;
  margin: 0 0 var(--space-6);
}

.phase__meta {
  font-family: var(--font-mono);
  font-size: var(--font-ui);
  letter-spacing: 0.1em;
  color: var(--color-ink-muted);
  margin: 0 0 var(--space-4);
}

.phase__body {
  font-family: var(--font-body);
  font-size: var(--font-body);
  color: var(--color-ink-secondary);
  line-height: 1.6;
}

.phase__body :deep(p) {
  max-width: 60ch;
  margin: 0 0 var(--space-3);
}

.phase__body :deep(p:last-child) {
  margin-bottom: 0;
}

.phase__body :deep(a) {
  color: var(--color-cool);
  text-decoration: none;
  border-bottom: 1px solid currentColor;
  transition: color var(--duration-quick) var(--ease-out);
}

.phase__body :deep(a:hover) {
  color: var(--color-cool-soft);
}
</style>
