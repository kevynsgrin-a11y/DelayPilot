#!/usr/bin/env node
/**
 * Measured colour-contrast gate.
 *
 * DIRECTIVE.md §7 sets a WCAG 2.2 AA floor, and the Phase 9 exit gate requires contrast to be
 * *measured* in both themes rather than judged by eye — it is one of the four gates
 * docs/BUILD_PLAN.md §6 calls out as most commonly rationalised away.
 *
 * This reads the real token values out of apps/web/src/styles/tokens.css and computes the WCAG 2.x
 * contrast ratio for every foreground/background pair the site actually renders, in both themes. It
 * exists because the palette it guards came from design/v0-preview, where 24 of 48 pairs failed AA
 * — including the primary button and every status colour on every light surface. Those values were
 * corrected token by token; without a gate, the next edit that reaches for a v0 hex from memory
 * silently reintroduces the failure.
 *
 * Deliberately not a full a11y suite. Phase 12 runs axe over every route (accessibility-lead,
 * DIRECTIVE.md §22); this checks the one thing a static analyser cannot infer from markup — whether
 * the token values themselves clear the threshold before any markup uses them.
 *
 * Run: node scripts/validate-contrast.mjs
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const TOKENS = 'apps/web/src/styles/tokens.css'

const AA_TEXT = 4.5

/** WCAG 2.x relative luminance and contrast ratio. */
const channel = (v) => {
  const c = v / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

const luminance = (hex) => {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const contrast = (a, b) => {
  const [l1, l2] = [luminance(a), luminance(b)]
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Pull custom properties out of a slice of CSS.
 *
 * The light theme is the LAST `:root {` block that is not inside a media query; the dark theme is
 * the `:root` block inside `@media (prefers-color-scheme: dark)`. Splitting on the media query
 * keeps this to string handling rather than a CSS parser dependency, at the cost of being coupled
 * to that structure — which is why a missing token is a hard error below rather than a skip.
 */
function readTokens(css) {
  const darkStart = css.indexOf('@media (prefers-color-scheme: dark)')
  if (darkStart === -1) {
    throw new Error(`${TOKENS}: no (prefers-color-scheme: dark) block found.`)
  }
  const lightCss = css.slice(0, darkStart)
  const darkCss = css.slice(darkStart)

  const collect = (slice) => {
    const found = new Map()
    const re = /(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g
    let m
    while ((m = re.exec(slice)) !== null) found.set(m[1], m[2].toLowerCase())
    return found
  }

  // Later declarations win, and collect() overwrites in source order, so the light map already
  // reflects the cascade within the non-media portion of the file.
  const light = collect(lightCss)
  const dark = new Map(light)
  for (const [k, v] of collect(darkCss)) dark.set(k, v)

  return { light, dark }
}

/**
 * The pairs the site actually renders. Surfaces are listed per token because a token only has to
 * clear the threshold on the surfaces it is used on — and the hardest surface differs by theme
 * (--background is darkest in light mode, --surface-raised is lightest in dark mode).
 */
const TEXT_ON_SURFACES = ['--background', '--surface', '--surface-raised']
const TEXT_TOKENS = [
  '--foreground',
  '--muted',
  '--accent',
  '--status-safe',
  '--status-watch',
  '--status-critical',
  '--status-unknown',
]

const errors = []
const checked = []

const css = readFileSync(join(repoRoot, TOKENS), 'utf8')
const themes = readTokens(css)

for (const [themeName, tokens] of Object.entries(themes)) {
  const need = (name) => {
    const value = tokens.get(name)
    if (value === undefined) {
      errors.push(`${TOKENS}: ${themeName} theme is missing ${name}.`)
      return null
    }
    return value
  }

  for (const fgName of TEXT_TOKENS) {
    const fg = need(fgName)
    if (fg === null) continue
    for (const bgName of TEXT_ON_SURFACES) {
      const bg = need(bgName)
      if (bg === null) continue
      const ratio = contrast(fg, bg)
      checked.push({ themeName, fgName, bgName, ratio })
      if (ratio < AA_TEXT) {
        errors.push(
          `${themeName}: ${fgName} (${fg}) on ${bgName} (${bg}) is ${ratio.toFixed(2)}:1, ` +
            `below the ${AA_TEXT}:1 WCAG 2.2 AA threshold for text.`,
        )
      }
    }
  }

  // Button text sits on the accent fill rather than a surface, so it is checked separately.
  const accent = need('--accent')
  const accentContrast = need('--accent-contrast')
  if (accent !== null && accentContrast !== null) {
    const ratio = contrast(accentContrast, accent)
    checked.push({ themeName, fgName: '--accent-contrast', bgName: '--accent', ratio })
    if (ratio < AA_TEXT) {
      errors.push(
        `${themeName}: --accent-contrast (${accentContrast}) on --accent (${accent}) is ` +
          `${ratio.toFixed(2)}:1, below ${AA_TEXT}:1. This is the primary button.`,
      )
    }
  }
}

if (errors.length > 0) {
  console.error('Contrast check FAILED:\n')
  for (const error of errors) console.error(`  - ${error}`)
  console.error(
    `\n${errors.length} failure(s) across ${checked.length} measured pairs. ` +
      `Fix the token values in ${TOKENS} — do not lower the threshold.`,
  )
  process.exit(1)
}

const worst = checked.reduce((a, b) => (a.ratio < b.ratio ? a : b))
console.log(`Contrast check passed: ${checked.length} pairs measured across 2 themes.`)
console.log(
  `Tightest pair: ${worst.themeName} ${worst.fgName} on ${worst.bgName} at ` +
    `${worst.ratio.toFixed(2)}:1 (threshold ${AA_TEXT}:1).`,
)
