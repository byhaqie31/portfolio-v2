<script setup lang="ts">
/*
 * Persistent black overlay that lives on /experience from page-load
 * through to the iris reveal. Covers the cinematic sky + aircraft so
 * the welcome card sits on solid black until the user scrolls.
 *
 * The reveal is a radial mask "iris" — a transparent circle of radius
 * --hole-r grows from the centre of the viewport outward. As it grows,
 * progressively more of the world behind the overlay becomes visible.
 *
 * useFlightScroll owns the scrubbing (CSS variable tween via GSAP
 * ScrollTrigger). This component just renders the masked surface.
 *
 * Sits at z-overlay (between content and modal). The intro's own
 * overlay (z-modal, higher) plays on top until the intro unmounts;
 * both are the same black so the handoff is invisible.
 */
</script>

<template>
  <div class="cinematic-overlay" aria-hidden="true" />
</template>

<style scoped>
.cinematic-overlay {
  /* Initial value — useFlightScroll scrubs this from 0 to ~150vw to
   * dissolve the overlay outward from the centre of the viewport. */
  --hole-r: 0px;

  position: fixed;
  inset: 0;
  z-index: 20;
  background: var(--color-bg-base);
  pointer-events: none;

  /* Radial mask: transparent in the centre circle (overlay invisible
   * there → world shows through), black outside (overlay visible). The
   * 80px feather between the two stops gives the iris a soft edge.
   * The max() guard keeps the inner stop non-negative when --hole-r is
   * small (otherwise calc(0px - 80px) would render as a hard edge). */
  -webkit-mask-image: radial-gradient(
    circle at 50% 50%,
    transparent max(0px, calc(var(--hole-r) - 80px)),
    black var(--hole-r)
  );
  mask-image: radial-gradient(
    circle at 50% 50%,
    transparent max(0px, calc(var(--hole-r) - 80px)),
    black var(--hole-r)
  );
}
</style>
