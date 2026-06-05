<script setup lang="ts">
/*
 * In-flight waypoint cards. One fades/slides in as the aircraft passes
 * each career stop (only one active at a time); the fourth is the centred
 * "final" contact variant. Content is composed by the page from
 * data/index.ts and passed in as `cards`; this component is presentation.
 *
 * The whole layer is pointer-events:none so it never blocks the scene;
 * only the active card is interactive + in the a11y tree (`:inert` on the
 * inactive ones), so the final card's contact links stay reachable
 * without the hidden cards trapping focus.
 */

interface WaypointStat {
  value: string
  accent?: string
  label: string
}

interface WaypointCard {
  idx: string
  year: string
  org: string
  role?: string
  desc: string
  highlights?: string[]
  stats?: WaypointStat[]
  meta?: string[]
  final?: boolean
  signoff?: string
  cta?: { label: string; href: string }
  links?: { label: string; href: string }[]
}

defineProps<{
  cards: WaypointCard[]
  active: number
}>()
</script>

<template>
  <div class="flight-waypoints">
    <article
      v-for="(card, i) in cards"
      :key="card.idx"
      class="wp"
      :class="{ 'wp--final': card.final, 'wp--active': active === i }"
      :inert="active !== i"
    >
      <div class="wp__head">
        <span class="wp__idx">{{ card.idx }}</span>
        <span class="wp__rule" />
        <span class="wp__year">{{ card.year }}</span>
      </div>

      <h2 class="wp__org">{{ card.org }}</h2>
      <p v-if="card.role" class="wp__role">{{ card.role }}</p>
      <p class="wp__desc">{{ card.desc }}</p>

      <ul v-if="card.highlights?.length" class="wp__highlights">
        <li v-for="(h, k) in card.highlights" :key="k">{{ h }}</li>
      </ul>

      <div v-if="card.stats?.length" class="wp__stats">
        <div v-for="(stat, j) in card.stats" :key="j" class="wp__stat">
          <div class="wp__stat-value">
            {{ stat.value }}<span v-if="stat.accent" class="wp__accent">{{ stat.accent }}</span>
          </div>
          <div class="wp__stat-label">{{ stat.label }}</div>
        </div>
      </div>

      <div v-if="card.meta?.length" class="wp__meta">
        <span v-for="tag in card.meta" :key="tag">{{ tag }}</span>
      </div>

      <p v-if="card.signoff" class="wp__signoff">{{ card.signoff }}</p>

      <a v-if="card.cta" :href="card.cta.href" class="wp__cta">{{ card.cta.label }}</a>

      <div v-if="card.links?.length" class="wp__links">
        <a
          v-for="link in card.links"
          :key="link.href"
          :href="link.href"
          target="_blank"
          rel="noopener"
          >{{ link.label }}</a
        >
      </div>
    </article>
  </div>
</template>

<style scoped>
.flight-waypoints {
  position: fixed;
  inset: 0;
  z-index: var(--z-controls);
  pointer-events: none;
}

.wp {
  /* Left-anchored, vertically centred — the IFE info panel beside the
   * flight. A touch wider so the moving-map strip + copy breathe. */
  position: absolute;
  left: var(--space-10);
  top: 50%;
  width: min(520px, 42vw);
  padding: var(--space-6) var(--space-8);
  background: rgba(10, 11, 15, 0.58);
  border: 1px solid var(--color-hairline);
  border-left: 2px solid var(--color-cool);
  border-radius: var(--radius-sharp);
  opacity: 0;
  transform: translateY(calc(-50% + 18px));
  transition: opacity 0.5s var(--ease-cinematic), transform 0.5s var(--ease-cinematic);
}

.wp--active {
  opacity: 1;
  transform: translateY(-50%);
}

.wp__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.wp__idx {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  color: var(--color-cool-soft);
}

.wp__rule {
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.wp__year {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.wp__org {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: var(--font-display-medium);
  line-height: 1.08;
  letter-spacing: -0.015em;
  color: var(--color-ink-primary);
  margin: 0;
}

.wp__role {
  margin: var(--space-2) 0 0;
  font-family: var(--font-body);
  font-size: var(--font-body-small);
  color: var(--color-ink-secondary);
}

.wp__desc {
  margin: var(--space-3) 0 0;
  font-family: var(--font-body);
  font-size: var(--font-body-small);
  line-height: 1.62;
  color: var(--color-ink-muted);
}

.wp__highlights {
  list-style: none;
  margin: var(--space-4) 0 0;
  padding: 0;
  display: grid;
  gap: var(--space-2);
}

.wp__highlights li {
  position: relative;
  padding-left: var(--space-4);
  font-family: var(--font-body);
  font-size: var(--font-body-small);
  line-height: 1.5;
  color: var(--color-ink-secondary);
}

.wp__highlights li::before {
  content: '›';
  position: absolute;
  left: 0;
  top: 0;
  font-family: var(--font-mono);
  color: var(--color-cool-soft);
}

.wp__stats {
  display: flex;
  gap: var(--space-8);
  margin-top: var(--space-5);
}

.wp__stat-value {
  font-family: var(--font-display);
  font-size: 1.9rem;
  line-height: 1;
  color: var(--color-ink-primary);
  font-variant-numeric: tabular-nums;
}

.wp__accent {
  color: var(--color-cool);
}

.wp__stat-label {
  margin-top: 7px;
  max-width: 14ch;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
}

.wp__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: var(--space-5);
}

.wp__meta span {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  letter-spacing: 0.08em;
  color: var(--color-ink-secondary);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-sharp);
  padding: 4px 9px;
}

/* ── Final / contact variant ─────────────────────────────────── */
.wp--final {
  left: 50%;
  top: 50%;
  bottom: auto;
  width: min(560px, 86vw);
  margin-top: -40px;
  text-align: center;
  border-left: 1px solid var(--color-hairline);
  transform: translate(-50%, 18px);
}

.wp--final.wp--active {
  transform: translate(-50%, -50%);
}

.wp--final {
  padding: var(--space-8) var(--space-10);
}

.wp--final .wp__head {
  justify-content: center;
}

.wp--final .wp__org {
  font-size: var(--font-display-large);
}

.wp__signoff {
  margin: var(--space-5) 0 0;
  font-family: var(--font-display);
  font-style: italic;
  font-size: var(--font-display-medium);
  line-height: 1.2;
  color: var(--color-ink-primary);
}

.wp__cta {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding: 13px 24px;
  font-family: var(--font-mono);
  font-size: var(--font-caption);
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-bg-base);
  background: var(--color-ink-primary);
  border-radius: var(--radius-sharp);
  text-decoration: none;
  pointer-events: auto;
  transition: background 0.3s var(--ease-out), transform 0.3s var(--ease-out);
}

.wp--final .wp__cta {
  margin-top: var(--space-8);
  padding: 16px 32px;
  font-size: var(--font-ui);
}

.wp__cta:hover,
.wp__cta:focus-visible {
  background: var(--color-cool);
  transform: translateY(-1px);
  outline: none;
}

.wp__links {
  display: flex;
  justify-content: center;
  gap: var(--space-5);
  margin-top: var(--space-5);
}

.wp__links a {
  font-family: var(--font-mono);
  font-size: var(--font-label);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  text-decoration: none;
  pointer-events: auto;
  transition: color 0.3s var(--ease-out);
}

.wp__links a:hover,
.wp__links a:focus-visible {
  color: var(--color-cool);
  outline: none;
}

@media (max-width: 760px) {
  .wp {
    left: var(--space-4);
    right: var(--space-4);
    width: auto;
    padding: var(--space-5);
  }
  .wp--final {
    left: 50%;
    right: auto;
    width: calc(100% - var(--space-8));
  }
}
</style>
