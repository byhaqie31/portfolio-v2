<script setup lang="ts">
/*
 * Phase card for /experience. One discrete card per section, structured
 * top-down as a flight strip:
 *
 *   TELEMETRY ROW (aviation status — mono, leads the card)
 *   ──────────────────────────────────────────────────────
 *   Headline.                          (Playfair, bio chapter title)
 *   Subline phrase.                    (Geist, optional)
 *   META DATA · LOCATION               (mono, optional)
 *
 *   Body paragraph(s)…                 (Geist, slotted)
 *
 * The `phaseLabel` prop is the telemetry string — e.g.
 * "CRUISE · FL380 · M.85 · 478 KT GS". Real-ish A350-1000 ops data.
 */

defineProps<{
  phaseLabel: string
  headline: string
  subline?: string
  meta?: string
}>()
</script>

<template>
  <section class="phase phase--standard">
    <div class="phase__masthead">
      <p class="phase__telemetry">{{ phaseLabel }}</p>

      <hr class="phase__rule" />

      <h2 class="phase__display">{{ headline }}</h2>
      <p v-if="subline" class="phase__subline">{{ subline }}</p>
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

/* Phase mastheads are flight-strip cards: warm-white panel, mono
 * telemetry row leading, full-width hairline rule, then bio chapter
 * content beneath. Documented as the masthead panel exception in
 * CINEMATIC.md §2.1. */
.phase__masthead {
  max-width: 720px;
  background: var(--color-ink-primary);
  padding: var(--space-7) var(--space-8) var(--space-8);
  border-radius: var(--radius-card);
}

.phase__telemetry {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(20, 17, 13, 0.6);
  margin: 0 0 var(--space-4);
}

.phase__rule {
  /* Full-width hairline that separates the telemetry header from the
   * bio body. Editorial print register — data above the line, story
   * below. (Was a 56px accent before the card restructure.) */
  width: 100%;
  height: 1px;
  background: rgba(20, 17, 13, 0.18);
  border: 0;
  margin: 0 0 var(--space-6);
}

.phase__display {
  font-family: var(--font-display);
  font-size: var(--font-display-large);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  /* Deep warm near-black — same value as the hero title exception in §2.1. */
  color: #14110D;
  margin: 0 0 var(--space-3);
}

.phase__subline {
  font-family: var(--font-body);
  font-size: var(--font-body-large);
  color: rgba(20, 17, 13, 0.78);
  margin: 0 0 var(--space-5);
}

.phase__meta {
  font-family: var(--font-mono);
  font-size: var(--font-ui);
  letter-spacing: 0.1em;
  color: rgba(20, 17, 13, 0.55);
  margin: 0 0 var(--space-5);
}

.phase__body {
  font-family: var(--font-body);
  font-size: var(--font-body);
  color: rgba(20, 17, 13, 0.78);
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
