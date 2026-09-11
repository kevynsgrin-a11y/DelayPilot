/**
 * The contrast pair registry.
 *
 * Machine-readable, exhaustive, and the thing the Phase 9 exit gate is actually about: every token
 * pair this system renders for text, for a non-text boundary or glyph, or for a focus indicator,
 * measured in BOTH themes. A pair that passes on ink and fails on cloud is a failing pair; a pair
 * that is used but not registered here is an unmeasured pair, and an unmeasured pair blocks the
 * gate (`.claude/agents/brand-design-director.md`, "Contrast procedure").
 *
 * Thresholds, from WCAG 2.2:
 *   - 4.5:1  SC 1.4.3 Contrast (Minimum), text and images of text.
 *   - 3:1    SC 1.4.11 Non-text Contrast, UI component boundaries, glyphs, diagram strokes.
 *   - 3:1    SC 2.4.11 / 2.4.13 Focus Appearance, against BOTH adjacent colours.
 *
 * Two deliberate departures from the minimum, both stricter than required:
 *
 *   1. The 3:1 large-text allowance (SC 1.4.3, text ≥ 24px or ≥ 19px bold) is never used. Every
 *      text token clears 4.5:1 on every surface it renders on, at every size. A heading is not
 *      easier to read at a gate in glare than a table cell.
 *   2. Inactive controls are exempt from SC 1.4.3 entirely. They are still registered here and
 *      held to 3:1, so "disabled" can never become "invisible".
 *
 * `decorative` is the one class with no threshold. It exists so that a value which is genuinely
 * exempt is still MEASURED and RECORDED with the reason it is exempt, rather than quietly omitted.
 */

import { contrastRatio, type Hex } from './contrast.ts'
import { primitiveColors } from './primitive.ts'
import { type SemanticColorName, semanticColors } from './semantic.ts'

export type ThemeName = 'light' | 'dark'

export const themeNames: readonly ThemeName[] = ['light', 'dark']

export type UsageClass = 'text' | 'text-inactive' | 'ui-boundary' | 'icon' | 'focus' | 'decorative'

/** `null` means "no threshold applies"; such a pair must carry an `exempt` reason. */
export const usageThresholds: Readonly<Record<UsageClass, number | null>> = {
  text: 4.5,
  'text-inactive': 3,
  'ui-boundary': 3,
  icon: 3,
  focus: 3,
  decorative: null,
}

export interface ContrastPair {
  readonly foreground: SemanticColorName
  readonly background: SemanticColorName
  readonly usage: UsageClass
  /** What renders this pair. Named concretely so a reviewer can go and look at it. */
  readonly where: string
  /** Required for, and only for, `decorative`. Why no threshold applies. */
  readonly exempt?: string
}

/** Every surface that carries text. Ordered hardest-last per theme is not possible — both orders are measured. */
const TEXT_SURFACES = [
  'surface-base',
  'surface-card',
  'surface-elevated',
  'surface-sunken',
] as const satisfies readonly SemanticColorName[]

const STATUS_TONES = ['safe', 'watch', 'critical', 'unknown'] as const

const on = (
  foreground: SemanticColorName,
  backgrounds: readonly SemanticColorName[],
  usage: UsageClass,
  where: string,
): ContrastPair[] => backgrounds.map((background) => ({ foreground, background, usage, where }))

export const contrastPairs: readonly ContrastPair[] = [
  // ---------------------------------------------------------------------------------------------
  // Text — SC 1.4.3, held to 4.5:1 at every size.
  // ---------------------------------------------------------------------------------------------
  ...on('text-primary', TEXT_SURFACES, 'text', 'Body copy, headings, table cells, control labels.'),
  ...on(
    'text-secondary',
    TEXT_SURFACES,
    'text',
    'Supporting copy and freshness strings ("Updated 6 minutes ago from …"). Also the Cached chip label on --surface-sunken.',
  ),
  ...on('text-accent', TEXT_SURFACES, 'text', 'Links and accent-coloured text.'),
  {
    foreground: 'text-inverse',
    background: 'surface-inverse',
    usage: 'text',
    where: 'Tooltip text.',
  },
  ...on(
    'text-on-accent',
    ['accent-bg', 'accent-bg-hover', 'accent-bg-active'],
    'text',
    'Primary button label, in all three interaction states.',
  ),
  ...on(
    'text-primary',
    ['accent-subtle-bg'],
    'text',
    'Text on a selected row, active tab panel or accent callout.',
  ),
  ...on('text-accent', ['accent-subtle-bg'], 'text', 'Link inside an accent callout.'),
  ...on(
    'text-primary',
    ['border-hairline'],
    'text',
    'Demo chip label where a hatch stripe falls under a glyph (--chip-demo-hatch).',
  ),
  ...on(
    'text-secondary',
    ['border-hairline'],
    'text',
    'Demo chip freshness string where a hatch stripe falls under a glyph.',
  ),
  ...STATUS_TONES.flatMap((tone): ContrastPair[] => {
    const fg = `status-${tone}-fg` as SemanticColorName
    const bg = `status-${tone}-bg` as SemanticColorName
    return [
      {
        foreground: fg,
        background: bg,
        usage: 'text',
        where: `StatusPill "${tone}" label and glyph on its own fill.`,
      },
      {
        foreground: 'text-primary',
        background: bg,
        usage: 'text',
        where: `Callout body text on the ${tone} fill.`,
      },
      {
        foreground: 'text-secondary',
        background: bg,
        usage: 'text',
        where: `Callout supporting text on the ${tone} fill.`,
      },
      ...on(
        fg,
        TEXT_SURFACES,
        'text',
        `Inline ${tone} status text and glyph on a bare surface; also the ${tone} ProgressBar band fill on --surface-sunken.`,
      ),
    ]
  }),

  // ---------------------------------------------------------------------------------------------
  // Inactive text — exempt from SC 1.4.3; held to 3:1 anyway.
  // ---------------------------------------------------------------------------------------------
  ...on(
    'text-disabled',
    TEXT_SURFACES,
    'text-inactive',
    'Label of a control that is present but not currently operable.',
  ),

  // ---------------------------------------------------------------------------------------------
  // Non-text boundaries — SC 1.4.11.
  // ---------------------------------------------------------------------------------------------
  ...on(
    'border-interactive',
    TEXT_SURFACES,
    'ui-boundary',
    'Input, select, checkbox, radio, switch track and secondary button boundary. Also the Cached chip boundary and the minimum weight for a route-diagram stroke.',
  ),
  ...on(
    'border-accent',
    TEXT_SURFACES,
    'ui-boundary',
    'Selected tab underline and accent-outlined control boundary.',
  ),
  ...STATUS_TONES.flatMap((tone): ContrastPair[] => {
    const border = `status-${tone}-border` as SemanticColorName
    const bg = `status-${tone}-bg` as SemanticColorName
    return [
      ...on(
        border,
        TEXT_SURFACES,
        'ui-boundary',
        `StatusPill "${tone}" boundary on a bare surface.`,
      ),
      {
        foreground: border,
        background: bg,
        usage: 'icon',
        where: `StatusPill "${tone}" dot and icon stroke on its own fill.`,
      },
    ]
  }),

  // ---------------------------------------------------------------------------------------------
  // Focus — SC 2.4.11 / 2.4.13, measured against both adjacent colours.
  // ---------------------------------------------------------------------------------------------
  ...on(
    'focus-ring',
    TEXT_SURFACES,
    'focus',
    'The outer adjacent colour of the 2px focus ring: whatever surface the control sits on.',
  ),
  {
    foreground: 'focus-ring',
    background: 'focus-ring-halo',
    usage: 'focus',
    where:
      'The inner adjacent colour of the focus ring. The halo fills the 2px offset gap, which is what keeps the ring legible when the control itself is an accent or status fill — the ring is never measured against a fill because it never touches one.',
  },

  // ---------------------------------------------------------------------------------------------
  // Decorative — no threshold, measured and recorded with the reason.
  // ---------------------------------------------------------------------------------------------
  ...(
    [
      'surface-base',
      'surface-card',
      'surface-elevated',
    ] as const satisfies readonly SemanticColorName[]
  ).map((background): ContrastPair => ({
    foreground: 'border-hairline',
    background,
    usage: 'decorative',
    where: 'Hairline between non-interactive regions: card edge, section rule, list divider.',
    exempt:
      'WCAG 2.2 SC 1.4.11 applies to boundaries required to identify a component. These separate static regions that are already distinguished by their fill, and no information depends on seeing them. Interactive boundaries use --border-interactive, which is held to 3:1.',
  })),
  ...TEXT_SURFACES.map((background): ContrastPair => ({
    foreground: 'border-emphasis',
    background,
    usage: 'decorative',
    where: 'Deliberate rule: table header underline, footer rule, drawer edge.',
    exempt:
      'A heavier hairline. Still decorative: no control is identified by it. A route-diagram stroke or any graphical object that carries meaning must use --border-interactive or --border-accent instead.',
  })),
  {
    foreground: 'surface-sunken',
    background: 'surface-card',
    usage: 'decorative',
    where: 'Skeleton block reserving the final dimensions of content that has not arrived.',
    exempt:
      'A skeleton carries no information — its accessible name is a VisuallyHidden "Loading" string, and it is never the only route to the content.',
  },
  {
    foreground: 'surface-card',
    background: 'surface-base',
    usage: 'decorative',
    where: 'Card fill against the page.',
    exempt:
      'Elevation, not identification. The card also carries --border-hairline, and nothing about the card is conveyed by the fill difference alone.',
  },
]

export interface PairMeasurement {
  readonly pair: ContrastPair
  readonly theme: ThemeName
  readonly foregroundHex: Hex
  readonly backgroundHex: Hex
  readonly ratio: number
  readonly threshold: number | null
  readonly pass: boolean
}

/** Resolve a semantic token to its literal hex in one theme. */
export function resolveSemantic(name: SemanticColorName, theme: ThemeName): Hex {
  const spec = semanticColors[name]
  return primitiveColors[theme === 'light' ? spec.light : spec.dark].hex
}

/** Measure every registered pair in both themes. Pure: same input, same output, every run. */
export function measureAllPairs(): readonly PairMeasurement[] {
  const results: PairMeasurement[] = []
  for (const theme of themeNames) {
    for (const pair of contrastPairs) {
      const foregroundHex = resolveSemantic(pair.foreground, theme)
      const backgroundHex = resolveSemantic(pair.background, theme)
      const ratio = contrastRatio(foregroundHex, backgroundHex)
      const threshold = usageThresholds[pair.usage]
      results.push({
        pair,
        theme,
        foregroundHex,
        backgroundHex,
        ratio,
        threshold,
        pass: threshold === null ? true : ratio >= threshold,
      })
    }
  }
  return results
}

/** The tightest measured pair per theme, excluding exempt pairs. Reported by the test and the table. */
export function tightestPair(
  measurements: readonly PairMeasurement[],
  theme: ThemeName,
): PairMeasurement {
  const scoped = measurements.filter((m) => m.theme === theme && m.threshold !== null)
  const first = scoped[0]
  if (first === undefined) {
    throw new Error(`No non-exempt pairs registered for the ${theme} theme.`)
  }
  return scoped.reduce(
    (worst, candidate) => (candidate.ratio < worst.ratio ? candidate : worst),
    first,
  )
}
