<script setup lang="ts">
/*
 * Aviation-themed SVG flourishes for the editorial body. Inline rather
 * than loaded from /public so each motif inherits the parent's
 * `color` via `currentColor` — that's how a section can choose to
 * paint a flourish faint (`--color-ink-faint`) or muted
 * (`--color-ink-muted`) without re-authoring the asset.
 *
 * Discipline rule (CINEMATIC.md, body identity): pick 2–3 motifs per
 * section, not all four. Default register for the first pass:
 *   - `wing-divider` between major sections
 *   - `route-arc` under the section headline
 *   - `compass-mark` as a dingbat next to the section label
 *   - `corner-bracket` reserved for card corners (sparingly)
 */

type Motif = 'wing-divider' | 'route-arc' | 'compass-mark' | 'corner-bracket'

defineProps<{
  motif: Motif
}>()
</script>

<template>
  <span :class="['aviation-flourish', `aviation-flourish--${motif}`]" aria-hidden="true">
    <!-- Wing divider — top-down asymmetric airfoil silhouette. Reads as
         aviation without being literal; the right-tapered tip evokes
         wingtip flow. -->
    <svg v-if="motif === 'wing-divider'" viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 4 12 C 28 6, 78 6, 108 10 L 116 12 L 108 14 C 78 18, 28 18, 4 12 Z"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linejoin="round"
      />
    </svg>

    <!-- Route arc — great-circle flight path with dashed stroke and
         end-point dots. Drawn so a future GSAP `stroke-dashoffset`
         tween can animate it in (id targets `route-arc-path`). -->
    <svg v-else-if="motif === 'route-arc'" viewBox="0 0 400 80" xmlns="http://www.w3.org/2000/svg">
      <path
        class="aviation-flourish__route-path"
        d="M 12 64 Q 200 -8 388 64"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-dasharray="3 6"
        stroke-linecap="round"
      />
      <circle cx="12" cy="64" r="2" fill="currentColor" />
      <circle cx="388" cy="64" r="2" fill="currentColor" />
    </svg>

    <!-- Compass mark — four-point cross with a small N indicator atop.
         Used inline with section labels as a typographic ornament. -->
    <svg v-else-if="motif === 'compass-mark'" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
      <line x1="7" y1="2" x2="7" y2="14" stroke="currentColor" stroke-width="1" />
      <line x1="1" y1="8" x2="13" y2="8" stroke="currentColor" stroke-width="1" />
      <path d="M 7 0 L 5 3 L 9 3 Z" fill="currentColor" />
    </svg>

    <!-- Corner bracket — small L-shape for card corner accents. -->
    <svg v-else viewBox="0 0 8 8" xmlns="http://www.w3.org/2000/svg">
      <path d="M 0 0 L 0 8 L 8 8" fill="none" stroke="currentColor" stroke-width="1" />
    </svg>
  </span>
</template>

<style scoped>
.aviation-flourish {
  display: inline-block;
  line-height: 0;
  color: var(--color-ink-faint);
}

.aviation-flourish svg {
  display: block;
  width: 100%;
  height: auto;
}

.aviation-flourish--wing-divider { width: 120px; }
.aviation-flourish--route-arc    { width: 400px; }
.aviation-flourish--compass-mark { width: 14px; height: 14px; }
.aviation-flourish--corner-bracket { width: 8px; height: 8px; }

@media (max-width: 768px) {
  .aviation-flourish--route-arc { width: 260px; }
}
</style>
