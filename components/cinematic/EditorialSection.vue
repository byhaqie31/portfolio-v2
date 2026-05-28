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
  /**
   * Pin mode — when true, the section is wrapped in a tall runway
   * and uses CSS position:sticky inside to lock to the viewport
   * while the user scrolls through the runway. The page's GSAP
   * scrubs animations against the runway scroll progress.
   */
  pin?: boolean
  /**
   * Total runway height when `pin` is true. Sticky duration =
   * pinHeight - 100vh (the visible section height). Example:
   *   '400vh' — 100vh locked + 300vh of card transitions
   */
  pinHeight?: string
}>(), {
  flourish: 'wing-divider',
  showRouteArc: true,
  pin: false,
  pinHeight: '200vh',
})
</script>

<template>
  <!-- Pin mode: outer runway wrapper provides scroll length, inner
       section uses CSS position:sticky to lock to viewport. -->
  <div
    v-if="pin"
    :class="['editorial-section__runway', `editorial-section__runway--${id}`]"
    :style="{ height: pinHeight }"
  >
    <section
      :id="id"
      :class="[
        'editorial-section',
        `editorial-section--${id}`,
        'editorial-section--pinned',
      ]"
    >
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
  </div>

  <!-- Normal (un-pinned) mode -->
  <section
    v-else
    :id="id"
    :class="[
      'editorial-section',
      `editorial-section--${id}`,
    ]"
  >
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

/* ── Pinned variant — runway + sticky pattern ──────────────── */

.editorial-section__runway {
  /* Runway provides the scroll length. Height set inline from
   * pinHeight prop. Sticky child locks for runway.height - 100vh. */
  position: relative;
}

.editorial-section--pinned {
  /* CSS sticky locks the section to viewport top while the runway
   * scrolls past. The page's GSAP scrubs animations against the
   * runway scroll progress. */
  position: sticky;
  top: 0;
  height: 100vh;
  max-height: 100vh;
  padding: var(--space-12) var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  overflow: hidden;
}

.editorial-section--pinned .editorial-section__flourish {
  /* Reduce the breathing-room margin so the header doesn't eat too
   * much vertical space in the constrained 100vh layout. */
  margin-bottom: var(--space-4);
}

.editorial-section--pinned .editorial-section__route-arc {
  margin: var(--space-2) 0;
}

.editorial-section--pinned .editorial-section__body {
  /* Fills available vertical space. min-height:0 lets flex children
   * actually shrink below their intrinsic height (without it,
   * scrollable / overflow content forces the body to its full size
   * and breaks the 100vh constraint). */
  flex: 1 1 auto;
  min-height: 0;
  margin-top: var(--space-3);
  /* Drop the body's prose max-width when pinned — pin mode is for
   * full-bleed content (card stacks, horizontal tracks), not prose. */
  max-width: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.editorial-section--pinned .editorial-section__footer {
  margin-top: 0;
}

@media (max-width: 768px) {
  /* Mobile drops the runway + sticky entirely. */
  .editorial-section__runway {
    height: auto !important;
  }
  .editorial-section--pinned {
    position: static;
    top: auto;
    height: auto;
    max-height: none;
    padding: var(--space-16) var(--space-5);
    overflow: visible;
  }
}
</style>
