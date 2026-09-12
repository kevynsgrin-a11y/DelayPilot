/**
 * Primitive scales — the theme-independent half of the token system.
 *
 * Colour is in primitive.ts; everything that is not a colour lives here: type, space, radius,
 * border, size, layout and motion. These values are identical in both themes, so they are emitted
 * once into `:root` and never restated in a theme block.
 *
 * Owner: brand-design-director. Consumers reference the *semantic* and *component* layers, not
 * these — with the deliberate exception of the scales below, which have no semantic indirection
 * because a spacing step is already its own meaning (`DIRECTIVE.md §7`).
 */

/** A CSS declaration value emitted verbatim. */
export interface ScaleToken {
  readonly value: string
  readonly note: string
}

const scale = <T extends Record<string, ScaleToken>>(t: T): T => t

/**
 * Type scale — 1.2 ratio from a 16 px base, rounded to whole pixels and expressed in `rem` so that
 * browser font-size preferences and 200 % zoom both scale it (`DIRECTIVE.md §22` requires 200 %
 * zoom without clipping). Sizes are named by their px value at the default root size: a name that
 * states the measurement cannot drift from it.
 */
export const typeScale = scale({
  'font-size-12': { value: '0.75rem', note: '12px — chip and legal footnote text' },
  'font-size-14': { value: '0.875rem', note: '14px — secondary text, table body, control labels' },
  'font-size-16': { value: '1rem', note: '16px — base body size' },
  'font-size-18': { value: '1.125rem', note: '18px — lede and card titles' },
  'font-size-20': { value: '1.25rem', note: '20px — section subheads' },
  'font-size-24': { value: '1.5rem', note: '24px — h3 / cockpit panel titles' },
  'font-size-30': { value: '1.875rem', note: '30px — h2' },
  'font-size-36': { value: '2.25rem', note: '36px — h1 below the 768px breakpoint' },
  'font-size-44': { value: '2.75rem', note: '44px — display h1 at 1024px and above' },
})

export const typography = scale({
  'font-sans': {
    // A value beginning with a newline is emitted as a wrapped declaration; this one is pre-wrapped
    // to the exact shape Prettier produces, so generated CSS passes `pnpm format:check` unedited.
    value:
      "\n    'Geist Sans', 'Geist Sans Fallback', ui-sans-serif, system-ui, -apple-system, 'Segoe UI',\n    Roboto, 'Helvetica Neue', Arial, sans-serif",
    note: 'Self-hosted Geist Sans, then the metric-matched fallback face, then the system stack.',
  },
  'font-mono': {
    value: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace",
    note: 'System monospace. No monospace webfont ships; naming one we do not serve would silently fall back anyway.',
  },
  'font-weight-regular': { value: '400', note: 'The only regular face shipped.' },
  'font-weight-semibold': {
    value: '600',
    note: 'The only bold face shipped. Nothing may ask for 700+, which would synthesise a face.',
  },
  'line-height-body': { value: '1.55', note: 'Body and prose.' },
  'line-height-heading': { value: '1.2', note: 'Headings.' },
  'line-height-ui': { value: '1.35', note: 'Controls, chips and table cells.' },
  'letter-spacing-tight': { value: '-0.02em', note: 'Headings only; body copy is never tracked.' },
  'font-variant-tabular': {
    value: 'tabular-nums',
    note: 'Times, flight numbers, countdowns, slack minutes, distances, currency and every numeric table column.',
  },
})

/** 4 px base scale. Named by px value for the same reason as the type scale. */
export const space = scale({
  'space-2': { value: '0.125rem', note: '2px — icon/label optical nudge' },
  'space-4': { value: '0.25rem', note: '4px — inside a chip' },
  'space-8': { value: '0.5rem', note: '8px — control padding, stack gap' },
  'space-12': { value: '0.75rem', note: '12px — control padding, field gap' },
  'space-16': { value: '1rem', note: '16px — card padding, default stack gap' },
  'space-24': { value: '1.5rem', note: '24px — card padding at 768px and above, grid gutter' },
  'space-32': { value: '2rem', note: '32px — panel separation' },
  'space-48': { value: '3rem', note: '48px — section rhythm' },
  'space-64': { value: '4rem', note: '64px — section rhythm at 1024px and above' },
  'space-96': { value: '6rem', note: '96px — hero rhythm at 1440px' },
})

export const radius = scale({
  'radius-control': { value: '0.25rem', note: '4px — buttons, inputs, checkboxes' },
  'radius-card': { value: '0.5rem', note: '8px — cards, callouts, table shells' },
  'radius-dialog': { value: '0.75rem', note: '12px — dialogs, drawers, popovers' },
  'radius-pill': { value: '999px', note: 'Chips, pills, switch tracks.' },
})

export const border = scale({
  'border-width-hairline': { value: '1px', note: 'Every non-focus border in the system.' },
  'border-width-emphasis': {
    value: '2px',
    note: 'Selected tab underline and the Demo chip outline — the two places where 1px is not enough signal.',
  },
  'focus-ring-width': {
    value: '2px',
    note: 'WCAG 2.2 SC 2.4.13 minimum for a 2px-thick indicator.',
  },
  'focus-ring-offset': {
    value: '2px',
    note: 'Gap between control edge and ring, filled with --focus-ring-halo so the ring never abuts a same-hue fill.',
  },
})

export const size = scale({
  'target-min': {
    value: '2.75rem',
    note: '44px minimum interactive target (DIRECTIVE.md §18.7). In rem so it grows, never shrinks, under zoom.',
  },
  'icon-size-16': { value: '1rem', note: '16px — inline status and chip glyphs' },
  'icon-size-20': { value: '1.25rem', note: '20px — control glyphs' },
})

/**
 * Layout. Breakpoints are deliberately NOT emitted as custom properties: a custom property cannot
 * be used in a media query condition, so emitting them would ship four tokens no stylesheet could
 * consume. They are exported from TypeScript (`breakpoints` below) and written literally into the
 * media queries this package generates.
 */
export const layout = scale({
  'layout-shell-max': { value: '68rem', note: 'Bounded readable page width (DIRECTIVE.md §18.7).' },
  'layout-prose-max': { value: '68ch', note: 'Prose measure cap.' },
  'grid-columns': { value: '12', note: 'Desktop cockpit grid (DIRECTIVE.md §18.7).' },
  'grid-gutter': { value: '1.5rem', note: '24px gutter, matching --space-24.' },
  'grid-cockpit-primary': { value: '8', note: 'Columns for action and itinerary.' },
  'grid-cockpit-secondary': {
    value: '4',
    note: 'Columns for source, alerts and secondary detail.',
  },
})

/**
 * Motion. Base rule (`DIRECTIVE.md §7`): state change only. The `--motion-reveal*`,
 * `--motion-ambient-cycle` and `--motion-view-transition` tokens exist solely for the narrow
 * public-marketing-route allowance in docs/decisions/0003-marketing-motion-allowance.md, so that no
 * page hand-rolls a duration; they are forbidden inside any data-bearing component. Every one of
 * them collapses under `prefers-reduced-motion: reduce` (ADR 0003 rule 4).
 */
export const motion = scale({
  'motion-fast': { value: '120ms', note: 'Hover, press and other direct feedback.' },
  'motion-base': { value: '180ms', note: 'Status transition, disclosure, dialog enter, toast.' },
  'motion-slow': { value: '240ms', note: 'Drawer travel.' },
  'motion-ease-entrance': {
    value: 'cubic-bezier(0, 0, 0.2, 1)',
    note: 'Decelerating ease-out for anything arriving.',
  },
  'motion-ease-linear': {
    value: 'linear',
    note: 'Progress only. Progress must not appear to ease.',
  },
  'motion-transition-control': {
    value: 'var(--motion-fast) var(--motion-ease-entrance)',
    note: 'Composed duration + easing for control feedback. Composed from the tokens above, so the reduced-motion collapse reaches it without a second override.',
  },
  'motion-transition-state': {
    value: 'var(--motion-base) var(--motion-ease-entrance)',
    note: 'Composed duration + easing for a state change.',
  },
  'motion-reveal': { value: '240ms', note: 'ADR 0003 scroll-driven entrance reveal.' },
  'motion-reveal-distance': {
    value: '16px',
    note: 'ADR 0003 caps the translate at 24px; the system ships 16px.',
  },
  'motion-ambient-cycle': {
    value: '12s',
    note: 'ADR 0003 caps an ambient decorative cycle at 12s.',
  },
  'motion-view-transition': {
    value: '180ms',
    note: 'ADR 0003 caps an Astro view transition at 180ms (= --motion-base).',
  },
})

/**
 * Values the reduced-motion block overrides. Every entry must name a token declared above, and the
 * generator asserts that. ADR 0003 rule 4: reveals become instant, ambient motifs render a single
 * static frame, view transitions are off — and the state change itself is never removed.
 */
export const reducedMotion: Readonly<Record<string, string>> = {
  'motion-fast': '1ms',
  'motion-base': '1ms',
  'motion-slow': '1ms',
  'motion-reveal': '1ms',
  'motion-reveal-distance': '0px',
  'motion-ambient-cycle': '0s',
  'motion-view-transition': '1ms',
}

/**
 * Scale tokens this package publishes but does not itself consume, each with the named consumer.
 *
 * `AGENTS.md §1.6` forbids an unused token, and test/tokens.test.ts enforces that: every scale
 * token must be referenced by a rule in the generated stylesheet or in primitives.css, or appear
 * here with a reason. This list is the published-contract escape hatch, and it is deliberately
 * short — everything on it is a value a page would otherwise hand-roll.
 */
export const externallyConsumedScaleTokens: Readonly<Record<string, string>> = {
  'layout-shell-max':
    'Page shell width — apps/web/src/layouts/app.css `.dpx-shell` (frontend-ui-engineer). No rule in this package sets a page width.',
  'layout-prose-max':
    'Prose measure cap — apps/web/src/layouts/app.css `.prose`, the one class shared with the policy pages (frontend-ui-engineer).',
  'motion-slow':
    'Drawer and sheet travel on §18.1 routes — frontend-ui-engineer, S3. Primitives use --motion-base.',
  'motion-reveal':
    'ADR 0003 scroll-driven entrance reveal. Public marketing routes only; never inside a data-bearing component.',
  'motion-reveal-distance': 'ADR 0003 reveal translate. Capped at 24px by the ADR; 16px here.',
  'motion-ambient-cycle':
    'ADR 0003 ambient decorative motif cycle. At most two motifs per route, 12s maximum.',
  'motion-view-transition':
    'ADR 0003 Astro view transition. 180ms maximum, public marketing routes only.',
}

/**
 * Breakpoints, in px, matching the visual-regression matrix in `DIRECTIVE.md §22`.
 * Exported for TypeScript consumers and for the media queries written by css.ts.
 */
export const breakpoints = {
  xs: 375,
  sm: 768,
  md: 1024,
  lg: 1440,
} as const

export type BreakpointName = keyof typeof breakpoints

/** Every theme-independent scale, in emission order. */
export const scaleGroups = [
  { title: 'Typography', tokens: typography },
  { title: 'Type scale (1.2 ratio from 16px)', tokens: typeScale },
  { title: 'Space (4px base)', tokens: space },
  { title: 'Radius', tokens: radius },
  { title: 'Border and focus', tokens: border },
  { title: 'Size', tokens: size },
  { title: 'Layout and cockpit grid', tokens: layout },
  { title: 'Motion', tokens: motion },
] as const satisfies readonly { title: string; tokens: Record<string, ScaleToken> }[]

export const scaleTokenNames: readonly string[] = scaleGroups.flatMap((group) =>
  Object.keys(group.tokens),
)
