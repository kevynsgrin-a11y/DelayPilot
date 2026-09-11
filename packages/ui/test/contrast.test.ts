/**
 * The contrast suite.
 *
 * This is the Phase 9 exit gate in executable form: every registered token pair, measured in BOTH
 * themes, against the WCAG 2.2 threshold for its usage class. A failing pair fails the build; an
 * unmeasured pair — a semantic colour that no registered pair covers — also fails the build,
 * because "it looks fine" is not a result.
 *
 * It prints a ratio for every pair. That output is the evidence, and it is committed in parallel
 * as packages/ui/src/tokens/CONTRAST.md.
 */

import { describe, expect, it } from 'vitest'

import { contrastRatio, formatRatio } from '../src/tokens/contrast.ts'
import {
  contrastPairs,
  measureAllPairs,
  resolveSemantic,
  themeNames,
  tightestPair,
  usageThresholds,
} from '../src/tokens/pairs.ts'
import { semanticColorNames } from '../src/tokens/semantic.ts'
import { componentColors } from '../src/tokens/component.ts'

const measurements = measureAllPairs()

describe('WCAG 2.2 arithmetic', () => {
  it('reproduces the reference ratios', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 10)
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 10)
    // WCAG's own worked example: #777777 on white is the canonical 4.48:1 near-miss.
    expect(formatRatio(contrastRatio('#777777', '#ffffff'))).toBe('4.47')
  })

  it('is order-independent', () => {
    expect(contrastRatio('#0b1728', '#f8fbff')).toBeCloseTo(contrastRatio('#f8fbff', '#0b1728'), 12)
  })

  it('truncates rather than rounding up, so a near-miss can never print as a pass', () => {
    expect(formatRatio(4.4999)).toBe('4.49')
  })
})

describe('pair registry', () => {
  it('registers every pair exactly once', () => {
    const keys = contrastPairs.map((pair) => `${pair.foreground}|${pair.background}|${pair.usage}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('measures every pair in both themes', () => {
    expect(measurements).toHaveLength(contrastPairs.length * themeNames.length)
    for (const theme of themeNames) {
      expect(measurements.filter((m) => m.theme === theme)).toHaveLength(contrastPairs.length)
    }
  })

  it('leaves no semantic colour unmeasured', () => {
    const covered = new Set<string>()
    for (const pair of contrastPairs) {
      covered.add(pair.foreground)
      covered.add(pair.background)
    }
    const unmeasured = semanticColorNames.filter((name) => !covered.has(name))
    expect(unmeasured, `Unmeasured semantic tokens: ${unmeasured.join(', ')}`).toEqual([])
  })

  it('covers every component token through the semantic pair it aliases', () => {
    const covered = new Set<string>()
    for (const pair of contrastPairs) {
      covered.add(pair.foreground)
      covered.add(pair.background)
    }
    for (const [name, entry] of Object.entries(componentColors)) {
      expect(covered.has(entry.ref), `--${name} aliases an unmeasured --${entry.ref}`).toBe(true)
    }
  })

  it('requires a written reason for every exempt pair', () => {
    for (const pair of contrastPairs) {
      if (usageThresholds[pair.usage] === null) {
        expect(pair.exempt, `--${pair.foreground} on --${pair.background}`).toBeTruthy()
      } else {
        expect(pair.exempt, `--${pair.foreground} on --${pair.background}`).toBeUndefined()
      }
    }
  })

  it('resolves every pair to an opaque six-digit hex in both themes', () => {
    for (const theme of themeNames) {
      for (const pair of contrastPairs) {
        expect(resolveSemantic(pair.foreground, theme)).toMatch(/^#[0-9a-f]{6}$/)
        expect(resolveSemantic(pair.background, theme)).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
  })
})

describe('measured contrast, both themes', () => {
  const lines: string[] = []

  for (const pair of contrastPairs) {
    const light = measurements.find((m) => m.theme === 'light' && m.pair === pair)
    const dark = measurements.find((m) => m.theme === 'dark' && m.pair === pair)

    it(`${pair.usage}: --${pair.foreground} on --${pair.background}`, () => {
      expect(light).toBeDefined()
      expect(dark).toBeDefined()
      if (light === undefined || dark === undefined) return

      const floor = usageThresholds[pair.usage]
      lines.push(
        `${pair.usage.padEnd(13)} --${pair.foreground} on --${pair.background} ` +
          `light ${formatRatio(light.ratio)}:1 dark ${formatRatio(dark.ratio)}:1 ` +
          `floor ${floor === null ? 'exempt' : `${String(floor)}:1`}`,
      )

      if (floor === null) return
      expect(
        light.ratio,
        `light: ${light.foregroundHex} on ${light.backgroundHex} is ${formatRatio(light.ratio)}:1`,
      ).toBeGreaterThanOrEqual(floor)
      expect(
        dark.ratio,
        `dark: ${dark.foregroundHex} on ${dark.backgroundHex} is ${formatRatio(dark.ratio)}:1`,
      ).toBeGreaterThanOrEqual(floor)
    })
  }

  it(`reports ${String(contrastPairs.length)} pairs x 2 themes with zero unmeasured`, () => {
    console.log(
      [
        '',
        `Measured contrast — ${String(contrastPairs.length)} registered pairs, ${String(measurements.length)} measurements, both themes:`,
        ...lines,
        ...themeNames.map((theme) => {
          const worst = tightestPair(measurements, theme)
          return `tightest ${theme}: --${worst.pair.foreground} on --${worst.pair.background} at ${formatRatio(worst.ratio)}:1 (floor ${String(worst.threshold)}:1)`
        }),
        '',
      ].join('\n'),
    )
    expect(measurements.filter((m) => !m.pass)).toEqual([])
  })
})
