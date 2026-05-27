<script setup lang="ts">
/*
 * The editorial body's section primitive.
 *
 * Renders the consistent rhythm every body section follows:
 *
 *   ─ wing-divider ─                     (separates from previous section)
 *   ✦ LABEL                              (mono uppercase + compass-mark dingbat)
 *   Headline.                            (Playfair display)
 *   ─── route arc ───                    (dashed great-circle arc)
 *   Optional subline in body type.
 *   <body slot>                          (default slot — section content)
 *   HDG 045° · LABEL                     (mono footer with hairline border)
 *
 * Discipline: every section uses the same primitive so the page reads
 * as one editorial voice rather than a stack of bespoke compositions.
 * Per-section specialisation (timeline rail, pinned zoom, horizontal
 * pin) wraps this primitive's body slot, not the primitive itself.
 */

withDefaults(defineProps<{
  /** Anchor id + class suffix. */
  id: string
  /** Mono uppercase label above the headline (ABOUT, EDUCATION, …). */
  label: string
  /** Playfair display headline. Period-terminated, short. */
  headline: string
  /** Optional secondary line in body type. */
  subline?: string
  /**
   * Heading-readout for the footer (e.g. '045°'). Rendered as `HDG 045°`.
   * Establishes typographic continuity with the hero's compass without
   * rebuilding a full HUD. Omit to skip the footer.
   */
  heading?: string
  /**
   * Top flourish that separates this section from the one above.
   * Default 'wing-divider'. Set to 'none' on the first body section
   * (no previous section to separate from).
   */
  flourish?: 'wing-divider' | 'route-arc' | 'none'
  /**
   * Whether to render the route arc under the headline. Default true.
   * The arc is decorative and not every section needs it — set false
   * for sections that already feel busy (e.g. SELECTED WORK).
   */
  showRouteArc?: boolean
}>(), {
  flourish: 'wing-divider',
  showRouteArc: true,
})
</script>

<template>
  <section :id="id" :class="['editorial-section', `editorial-section--${id}`]">
    <div v-if="flourish !== 'none'" class="editorial-section__flourish">
      <CinematicAviationFlourish :motif="flourish" />
    </div>

    <p class="editorial-section__label">
      <CinematicAviationFlourish motif="compass-mark" />
      <span>{{ label }}</span>
    </p>

    <h2 class="editorial-section__headline">{{ headline }}</h2>

    <CinematicAviationFlourish
      v-if="showRouteArc"
      motif="route-arc"
      class="editorial-section__route-arc"
    />

    <p v-if="subline" class="editorial-section__subline">{{ subline }}</p>

    <div class="editorial-section__body">
      <slot />
    </div>

    <div v-if="heading" class="editorial-section__footer">
      <span>HDG {{ heading }}</span>
      <span>{{ label }}</span>
    </div>
  </section>
</template>

<style scoped>
.editorial-section {
  max-width: 880px;
  margin: 0 auto;
  padding: var(--space-24) var(--space-6);
  display: grid;
  /* Tight gap so label → headline reads as one typographic block; the
   * larger vertical breaks come from the section's own top/bottom
   * padding and the wing-divider flourish above. */
  gap: var(--space-4);
}

.editorial-section__flourish {
  display: flex;
  justify-content: center;
  /* Sits in the visual margin between sections, lower opacity so it
   * reads as a separator, not a focal element. */
  opacity: 0.45;
  margin-bottom: var(--space-12);
}

.editorial-section__label {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin: 0;
}

.editorial-section__label :deep(.aviation-flourish) {
  opacity: 0.6;
}

.editorial-section__headline {
  font-family: var(--font-display);
  font-size: var(--font-display-large);
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--color-ink-primary);
  margin: 0;
  /* Headlines stay short — luxury editorial. */
  max-width: 16ch;
}

.editorial-section__route-arc {
  /* Sits between headline and body content. Lower opacity so it
   * reads as a watermark, not part of the type composition. */
  margin: var(--space-3) 0;
  opacity: 0.5;
}

.editorial-section__subline {
  font-family: var(--font-body);
  font-size: var(--font-body-large);
  line-height: 1.5;
  color: var(--color-ink-secondary);
  margin: 0;
  max-width: 48ch;
}

.editorial-section__body {
  font-family: var(--font-body);
  font-size: var(--font-body);
  line-height: 1.7;
  color: var(--color-ink-secondary);
  margin-top: var(--space-4);
  max-width: 60ch;
}

.editorial-section__body :deep(p) {
  margin: 0 0 var(--space-5);
}

.editorial-section__body :deep(p:last-child) {
  margin-bottom: 0;
}

.editorial-section__footer {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-16);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-hairline);
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
}

@media (max-width: 768px) {
  .editorial-section {
    padding: var(--space-16) var(--space-5);
    gap: var(--space-3);
  }

  .editorial-section__headline {
    max-width: 100%;
  }

  .editorial-section__flourish {
    margin-bottom: var(--space-8);
  }
}
</style>
