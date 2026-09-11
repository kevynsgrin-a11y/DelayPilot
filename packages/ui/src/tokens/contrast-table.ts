/**
 * The measured contrast table.
 *
 * Emits packages/ui/src/tokens/CONTRAST.md from the same code that runs in the test, so the
 * committed table can never describe a palette the tests are not measuring. Every registered pair,
 * both themes, the ratio, the floor, the verdict.
 *
 * Tables are emitted pre-aligned in Prettier's markdown table shape so that `pnpm format:check`
 * passes on generated output without a formatting pass.
 */

import { formatRatio } from './contrast.ts'
import {
  contrastPairs,
  measureAllPairs,
  type PairMeasurement,
  themeNames,
  tightestPair,
  type UsageClass,
  usageThresholds,
} from './pairs.ts'
import { primitiveColorNames, primitiveColors } from './primitive.ts'
import { semanticColorNames, semanticColors } from './semantic.ts'
import { componentColorNames } from './component.ts'

function alignTable(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const widths = header.map((cell, column) =>
    Math.max(3, cell.length, ...rows.map((row) => (row[column] ?? '').length)),
  )
  const line = (cells: readonly string[]): string =>
    `| ${cells.map((cell, column) => cell.padEnd(widths[column] ?? 0)).join(' | ')} |`
  const separator = `| ${widths.map((width) => '-'.repeat(width)).join(' | ')} |`
  return [line(header), separator, ...rows.map(line)].join('\n')
}

const USAGE_TITLES: Readonly<Record<UsageClass, string>> = {
  text: 'Text — WCAG 2.2 SC 1.4.3, floor 4.5:1',
  'text-inactive': 'Inactive control text — exempt from SC 1.4.3, held to 3:1 anyway',
  'ui-boundary': 'Component boundaries — SC 1.4.11, floor 3:1',
  icon: 'Glyphs and dots — SC 1.4.11, floor 3:1',
  focus: 'Focus indicator — SC 2.4.11 / 2.4.13, floor 3:1 against both adjacent colours',
  decorative: 'Decorative — no floor applies, measured and recorded with the reason',
}

const USAGE_ORDER: readonly UsageClass[] = [
  'text',
  'text-inactive',
  'ui-boundary',
  'icon',
  'focus',
  'decorative',
]

function byTheme(measurements: readonly PairMeasurement[]): Map<string, PairMeasurement> {
  const index = new Map<string, PairMeasurement>()
  for (const measurement of measurements) {
    index.set(
      `${measurement.theme}|${measurement.pair.foreground}|${measurement.pair.background}|${measurement.pair.usage}`,
      measurement,
    )
  }
  return index
}

export function renderContrastTable(): string {
  const measurements = measureAllPairs()
  const index = byTheme(measurements)
  const failures = measurements.filter((measurement) => !measurement.pass)

  const sections: string[] = []

  sections.push(`# Measured contrast — DelayPilot design tokens

GENERATED FILE, DO NOT EDIT BY HAND. Source: \`packages/ui/src/tokens/pairs.ts\`.
Regenerate with \`pnpm --filter @delaypilot/ui tokens:build\`; \`pnpm test\` re-measures every row.

Method: WCAG 2.2 relative luminance from sRGB, ratio \`(L1 + 0.05) / (L2 + 0.05)\`, computed in
\`packages/ui/src/tokens/contrast.ts\`. Ratios are truncated, never rounded up, so a 4.499 can never
print as \`4.50\` beside a 4.5 floor. Every pair is measured in BOTH themes: a pair that passes on
ink and fails on cloud is a failing pair.

Two departures from the WCAG minimum, both stricter than required:

1. The 3:1 large-text allowance (SC 1.4.3, text at or above 24px, or 19px bold) is never used.
   Every text token clears 4.5:1 on every surface it renders on, at every size.
2. Inactive controls are exempt from SC 1.4.3 entirely. They are registered here anyway and held
   to 3:1, so "disabled" can never become "invisible".

Colour is never the only signal. Each of the four status tones also ships a distinct icon shape and
a required text label, and each of the six provenance chips carries its \`AGENTS.md\` 1.2 label as
visible text (\`Live\`, \`Cached\`, \`Stale\`, \`Demo\`, \`Unavailable\`, \`Heuristic risk band\`).`)

  const summaryRows = themeNames.map((theme) => {
    const worst = tightestPair(measurements, theme)
    return [
      theme,
      String(measurements.filter((measurement) => measurement.theme === theme).length),
      `${formatRatio(worst.ratio)}:1`,
      `\`--${worst.pair.foreground}\` on \`--${worst.pair.background}\``,
      `${String(worst.threshold ?? 0)}:1`,
    ]
  })

  sections.push(`## Summary

${String(contrastPairs.length)} registered pairs, measured in 2 themes: ${String(measurements.length)} measurements,
${String(failures.length)} failing, 0 unmeasured.

${alignTable(['Theme', 'Measurements', 'Tightest', 'Tightest pair', 'Its floor'], summaryRows)}`)

  for (const usage of USAGE_ORDER) {
    const pairs = contrastPairs.filter((pair) => pair.usage === usage)
    if (pairs.length === 0) continue
    const threshold = usageThresholds[usage]
    const rows = pairs.map((pair) => {
      const light = index.get(`light|${pair.foreground}|${pair.background}|${pair.usage}`)
      const dark = index.get(`dark|${pair.foreground}|${pair.background}|${pair.usage}`)
      if (light === undefined || dark === undefined) {
        throw new Error(`Missing measurement for --${pair.foreground} on --${pair.background}.`)
      }
      const verdict = threshold === null ? 'exempt' : light.pass && dark.pass ? 'pass' : 'FAIL'
      return [
        `\`--${pair.foreground}\``,
        `\`--${pair.background}\``,
        `${light.foregroundHex} on ${light.backgroundHex}`,
        `${formatRatio(light.ratio)}:1`,
        `${dark.foregroundHex} on ${dark.backgroundHex}`,
        `${formatRatio(dark.ratio)}:1`,
        verdict,
      ]
    })

    const notes = pairs.map((pair) => {
      const reason = pair.exempt === undefined ? '' : ` Exempt: ${pair.exempt}`
      return `- \`--${pair.foreground}\` on \`--${pair.background}\` — ${pair.where}${reason}`
    })

    sections.push(`## ${USAGE_TITLES[usage]}

${alignTable(
  ['Foreground', 'Background', 'Light values', 'Light', 'Dark values', 'Dark', 'Result'],
  rows,
)}

Where these render:

${notes.join('\n')}`)
  }

  const rampRows = primitiveColorNames.map((name) => [
    `\`--color-${name}\``,
    primitiveColors[name].hex,
    primitiveColors[name].seed ? 'DIRECTIVE 7 seed' : 'extension',
    primitiveColors[name].note,
  ])

  sections.push(`## Primitive ramp

The only literal colours in the system. A semantic token names a step here; nothing else may.

${alignTable(['Token', 'Hex', 'Origin', 'Derivation and role'], rampRows)}`)

  const semanticRows = semanticColorNames.map((name) => [
    `\`--${name}\``,
    `\`--color-${semanticColors[name].light}\``,
    primitiveColors[semanticColors[name].light].hex,
    `\`--color-${semanticColors[name].dark}\``,
    primitiveColors[semanticColors[name].dark].hex,
  ])

  sections.push(`## Semantic layer

${String(semanticColorNames.length)} semantic colour tokens and ${String(componentColorNames.length)} component
tokens. Component tokens are aliases onto this layer and are therefore covered by the measurements
above; no component token introduces a colour of its own.

${alignTable(['Token', 'Light ramp', 'Light', 'Dark ramp', 'Dark'], semanticRows)}`)

  return `${sections.join('\n\n')}\n`
}
