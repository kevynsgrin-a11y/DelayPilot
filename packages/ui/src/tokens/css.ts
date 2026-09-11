/**
 * The stylesheet emitter.
 *
 * Produces apps/web/src/styles/tokens.css in full. The committed file is generated output: edit
 * this module, run `pnpm --filter @delaypilot/ui tokens:build`, and commit both. test/tokens.test.ts
 * regenerates in memory and asserts byte-equality with the committed file, so a hand edit to the
 * CSS fails the suite rather than quietly diverging from the typed source.
 *
 * ---------------------------------------------------------------------------------------------
 * BLOCK ORDER IS LOAD-BEARING. Do not reorder without reading this.
 * ---------------------------------------------------------------------------------------------
 * scripts/validate-contrast.mjs (owned by principal-architect, gating CI) parses this file as text:
 * the light theme is every `--name: #hex;` declaration BEFORE the first
 * `@media (prefers-color-scheme: dark)`, later declarations winning; the dark theme is that map
 * overlaid with every such declaration AFTER it. Therefore:
 *
 *   1. `:root[data-theme='dark']` is emitted FIRST. Its hexes land in the parser's light map and
 *      are then overwritten by the light block that follows, so the parser sees the correct light
 *      theme. In the real cascade it wins regardless of position: `:root[data-theme]` is
 *      specificity (0,2,0) against (0,1,0) for a bare `:root`.
 *   2. The light `:root` block follows, then `:root[data-theme='light']`.
 *   3. `@media (prefers-color-scheme: dark) { :root { … } }` is the LAST block in the file that
 *      contains any literal hex. Nothing carrying light values may follow it.
 *   4. The print block follows the dark block — deliberately, so that printing an evidence packet
 *      is never dark — and declares custom properties only as `var()` references, never as literal
 *      hexes, so it cannot pollute either parsed theme.
 */

import { primitiveColors, primitiveColorNames } from './primitive.ts'
import { breakpoints, motion, reducedMotion, scaleGroups, type ScaleToken } from './scale.ts'
import {
  legacyColorAliases,
  legacyScaleAliases,
  semanticColorNames,
  semanticColors,
  semanticRaw,
} from './semantic.ts'
import { componentColorNames, componentColors } from './component.ts'
import type { ThemeName } from './pairs.ts'

const INDENT = '  '

function declaration(name: string, value: string, indent: string): string {
  // A value that starts with a newline carries its own wrapping and indentation, matching the shape
  // Prettier gives a declaration too long for the 100-column print width.
  return value.startsWith('\n') ? `${indent}--${name}:${value};` : `${indent}--${name}: ${value};`
}

/** Wrap a note as a trailing comment only when it fits the 100-column print width. */
function withNote(line: string, note: string): string {
  const candidate = `${line} /* ${note} */`
  return candidate.length <= 100 ? candidate : line
}

/** Width of a section-header comment box, in columns, delimiters included. */
const BOX_WIDTH = 99
const BOX_CONTENT = BOX_WIDTH - '/*'.length - '*/'.length
const BOX_RULE = `/* ${'-'.repeat(BOX_CONTENT - 2)} */`

/**
 * Square off the section-header comment boxes.
 *
 * The boxes are authored by hand across several template literals in this file, and a hand-counted
 * right margin drifts the moment a word changes, so the right edge is computed rather than typed.
 * Only whole-line box comments are touched: a trailing note after a declaration does not start a
 * line, and a wrapped comment's continuation lines do not open with the delimiter.
 *
 * An over-long line throws rather than being left ragged: a silent exception is how the drift this
 * function exists to remove gets back in.
 */
function alignCommentBoxes(css: string): string {
  return css
    .split('\n')
    .map((line) => {
      // A box line opens and closes on the same line at column 0. A trailing note after a
      // declaration is indented, and a wrapped comment's continuation lines do not open with `/*`.
      if (!line.startsWith('/*') || !line.endsWith('*/')) return line
      const content = line.slice(2, -2)
      if (/^[-\s]+$/.test(content)) return BOX_RULE
      const trimmed = content.replace(/\s+$/, '')
      if (trimmed.length > BOX_CONTENT) {
        throw new Error(
          `Comment box line is ${String(trimmed.length + 4)} columns, over the ${String(BOX_WIDTH)}-column box: ${line.trim()}`,
        )
      }
      return `/*${trimmed.padEnd(BOX_CONTENT)}*/`
    })
    .join('\n')
}

function primitiveBlock(): string {
  const lines = primitiveColorNames.map((name) =>
    withNote(
      declaration(`color-${name}`, primitiveColors[name].hex, INDENT),
      primitiveColors[name].seed ? '§7 seed' : 'extension',
    ),
  )
  return [
    '/* ------------------------------------------------------------------------------------------- */',
    '/* 1. Primitive ramps. The only literal colours in the system, identical in both themes.        */',
    '/*    The sixteen §7 seeds are verbatim. Every extension records its derivation and its         */',
    '/*    measured result in packages/ui/src/tokens/primitive.ts and in CONTRAST.md.                */',
    '/* ------------------------------------------------------------------------------------------- */',
    ':root {',
    ...lines,
    '}',
  ].join('\n')
}

function scaleBlock(): string {
  const body: string[] = []
  for (const group of scaleGroups) {
    body.push(`${INDENT}/* ${group.title} */`)
    for (const [name, token] of Object.entries(group.tokens as Record<string, ScaleToken>)) {
      body.push(declaration(name, token.value, INDENT))
    }
    body.push('')
  }
  body.push(`${INDENT}/* Compatibility aliases for the pre-Phase-10 public pages. */`)
  for (const [alias, target] of Object.entries(legacyScaleAliases)) {
    body.push(declaration(alias, `var(--${target})`, INDENT))
  }
  return [
    '/* ------------------------------------------------------------------------------------------- */',
    '/* 2. Scales. Theme-independent: type, space, radius, border, size, layout, motion.             */',
    '/*    Breakpoints are NOT tokens — a custom property cannot be used in a media query condition.  */',
    `/*    They are ${Object.values(breakpoints).join(' / ')} px, exported from @delaypilot/ui/tokens, and are */`,
    '/*    written literally into the media queries that need them. */',
    '/* ------------------------------------------------------------------------------------------- */',
    ':root {',
    ...body,
    '}',
  ].join('\n')
}

function themeDeclarations(theme: ThemeName, indent: string): string[] {
  const lines: string[] = []

  lines.push(`${indent}/* Surfaces, text, borders, focus, accent. */`)
  for (const name of semanticColorNames) {
    const spec = semanticColors[name]
    const ramp = theme === 'light' ? spec.light : spec.dark
    lines.push(withNote(declaration(name, primitiveColors[ramp].hex, indent), `--color-${ramp}`))
  }

  lines.push('')
  lines.push(`${indent}/* Values with no measurable ratio: a translucent scrim and two shadows. */`)
  for (const [name, spec] of Object.entries(semanticRaw)) {
    lines.push(declaration(name, theme === 'light' ? spec.light : spec.dark, indent))
  }

  lines.push('')
  lines.push(
    `${indent}/* Compatibility aliases. Literal hexes, not var(): scripts/validate-contrast.mjs`,
  )
  lines.push(`${indent}   parses hex declarations and requires eleven of these names per theme. */`)
  for (const [alias, target] of Object.entries(legacyColorAliases)) {
    const spec = semanticColors[target]
    const ramp = theme === 'light' ? spec.light : spec.dark
    lines.push(withNote(declaration(alias, primitiveColors[ramp].hex, indent), `--${target}`))
  }

  lines.push('')
  lines.push(`${indent}color-scheme: ${theme};`)
  return lines
}

function darkOverrideBlock(): string {
  return [
    '/* ------------------------------------------------------------------------------------------- */',
    '/* 3. Semantic tokens — DARK, explicit user override.                                           */',
    '/*    Emitted first so that the CI contrast parser reads the light block (4) as the light theme. */',
    '/*    Specificity (0,2,0) means it beats both the bare `:root` default and the system-preference */',
    '/*    block at the end of the file, so an explicit choice wins in both directions.               */',
    '/* ------------------------------------------------------------------------------------------- */',
    ":root[data-theme='dark'] {",
    ...themeDeclarations('dark', INDENT),
    '}',
  ].join('\n')
}

function lightBlock(): string {
  return [
    '/* ------------------------------------------------------------------------------------------- */',
    '/* 4. Semantic tokens — LIGHT. The default when no preference and no override is expressed.     */',
    '/*    Dark mode is not an inversion of this: both themes are authored as first-class palettes    */',
    '/*    in packages/ui/src/tokens/semantic.ts, and each is measured on its own.                    */',
    '/* ------------------------------------------------------------------------------------------- */',
    ':root {',
    ...themeDeclarations('light', INDENT),
    '}',
  ].join('\n')
}

function lightOverrideBlock(): string {
  return [
    '/* ------------------------------------------------------------------------------------------- */',
    '/* 5. Semantic tokens — LIGHT, explicit user override. Wins over a system dark preference.      */',
    '/* ------------------------------------------------------------------------------------------- */',
    ":root[data-theme='light'] {",
    ...themeDeclarations('light', INDENT),
    '}',
  ].join('\n')
}

function componentBlock(): string {
  const lines = componentColorNames.map((name) =>
    declaration(name, `var(--${componentColors[name].ref})`, INDENT),
  )
  return [
    '/* ------------------------------------------------------------------------------------------- */',
    '/* 6. Component tokens. Aliases onto the semantic layer — never a ramp step, never a literal.   */',
    '/*    The six provenance chip variants of AGENTS.md §1.2, and the four DIRECTIVE.md §16          */',
    '/*    severities mapped onto the same four status tones rather than onto a fifth colour.         */',
    '/* ------------------------------------------------------------------------------------------- */',
    ':root {',
    ...lines,
    '}',
  ].join('\n')
}

function darkPreferenceBlock(): string {
  return [
    '/* ------------------------------------------------------------------------------------------- */',
    '/* 12. Semantic tokens — DARK, system preference.                                               */',
    '/*     LAST block in this file containing a literal hex. See the block-order note at the top of  */',
    '/*     packages/ui/src/tokens/css.ts: anything carrying light values placed after this would be  */',
    '/*     read by scripts/validate-contrast.mjs as part of the dark theme.                          */',
    '/* ------------------------------------------------------------------------------------------- */',
    '@media (prefers-color-scheme: dark) {',
    `${INDENT}:root {`,
    ...themeDeclarations('dark', INDENT + INDENT),
    `${INDENT}}`,
    '}',
  ].join('\n')
}

/**
 * Metric-matched fallback overrides.
 *
 * Measured at build time with fontTools 4.65 against the real font files, and recorded here because
 * the woff2 subsets that ship are not parseable at runtime without adding a font library to the
 * bundle. Method and numbers are in the emitted comment so they can be re-derived.
 */
const FONT_METRICS = {
  unitsPerEm: 1000,
  hheaAscender: 1005,
  hheaDescender: -295,
  hheaLineGap: 0,
  corpusChars: 1121,
  regular: {
    geistAvgAdvance: 0.461548,
    fallbackAvgAdvance: 0.440375,
    sizeAdjust: '104.81%',
    ascentOverride: '95.89%',
    descentOverride: '28.15%',
    lineGapOverride: '0%',
  },
  semibold: {
    geistAvgAdvance: 0.483093,
    fallbackAvgAdvance: 0.47539,
    sizeAdjust: '101.62%',
    ascentOverride: '98.9%',
    descentOverride: '29.03%',
    lineGapOverride: '0%',
  },
} as const

function fontBlock(): string {
  const { regular, semibold } = FONT_METRICS
  return `/* ------------------------------------------------------------------------------------------- */
/* 0. Fonts.                                                                                    */
/*                                                                                              */
/* Geist Sans, SIL Open Font License 1.1 (verified: \`npm view geist license\` -> SIL OPEN FONT    */
/* LICENSE; licence text at /fonts/LICENSE-Geist.txt). Self-hosted and served same-origin: no    */
/* third-party font CDN, so no font request leaks a reader's IP to a third party (AGENTS.md §2). */
/* Exactly two faces ship, 400 and 600, subset to Latin — nothing may request 700+, which would  */
/* synthesise a face.                                                                           */
/*                                                                                              */
/* ZERO-CLS SWAP. 'Geist Sans Fallback' is the same metric-matched face the browser would have   */
/* used anyway (Arial, or Liberation Sans where Arial is absent — the two are metric-compatible  */
/* by design), re-declared with overrides so a line of text occupies the same space before and   */
/* after the swap. The overrides were computed with fontTools 4.65 from the real font files:     */
/*                                                                                              */
/*   size-adjust    = mean advance width of the corpus in Geist (in em) divided by the same      */
/*                    mean in Liberation Sans.                                                   */
/*   ascent/descent = Geist hhea ascender ${String(FONT_METRICS.hheaAscender)} / descender ${String(FONT_METRICS.hheaDescender)} over unitsPerEm ${String(FONT_METRICS.unitsPerEm)},        */
/*                    divided by size-adjust so the scaled fallback lands on the same line box.  */
/*   line-gap       = Geist hhea lineGap ${String(FONT_METRICS.hheaLineGap)}.                                                  */
/*                                                                                               */
/* The corpus is the ${String(FONT_METRICS.corpusChars)} characters of DIRECTIVE.md §27 result microcopy — the product's own  */
/* English UI text, so the match is tuned to the sentences actually rendered rather than to a     */
/* pangram. Measured means, in em: 400 ${String(regular.geistAvgAdvance)} Geist vs ${String(regular.fallbackAvgAdvance)} fallback;             */
/* 600 ${String(semibold.geistAvgAdvance)} vs ${String(semibold.fallbackAvgAdvance)}. Geist uses USE_TYPO_METRICS with hhea == OS/2 typo,   */
/* so there is no hhea/typo ambiguity to resolve.                                                */
/* ------------------------------------------------------------------------------------------- */
@font-face {
  font-family: 'Geist Sans';
  src: url('/fonts/geist-sans-latin-400.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00ff, U+2013-2014, U+2018-201d, U+2022, U+2026, U+2212, U+20ac;
}

@font-face {
  font-family: 'Geist Sans';
  src: url('/fonts/geist-sans-latin-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00ff, U+2013-2014, U+2018-201d, U+2022, U+2026, U+2212, U+20ac;
}

@font-face {
  font-family: 'Geist Sans Fallback';
  src: local('Arial'), local('Liberation Sans'), local('Helvetica Neue'), local('Helvetica');
  font-weight: 400;
  font-style: normal;
  size-adjust: ${regular.sizeAdjust};
  ascent-override: ${regular.ascentOverride};
  descent-override: ${regular.descentOverride};
  line-gap-override: ${regular.lineGapOverride};
}

@font-face {
  font-family: 'Geist Sans Fallback';
  src:
    local('Arial Bold'), local('Arial-BoldMT'), local('Liberation Sans Bold'),
    local('LiberationSans-Bold'), local('Helvetica Bold');
  font-weight: 600;
  font-style: normal;
  size-adjust: ${semibold.sizeAdjust};
  ascent-override: ${semibold.ascentOverride};
  descent-override: ${semibold.descentOverride};
  line-gap-override: ${semibold.lineGapOverride};
}`
}

const HEADER = `/**
 * DelayPilot design tokens — GENERATED FILE, DO NOT EDIT BY HAND.
 *
 * Source of truth: packages/ui/src/tokens/ (owner: brand-design-director).
 * Regenerate:      pnpm --filter @delaypilot/ui tokens:build
 * Drift check:     pnpm test  (packages/ui/test/tokens.test.ts regenerates in memory and asserts
 *                  byte-equality with this file, so a hand edit fails the suite.)
 *
 * Layers: primitive ramps -> semantic tokens -> component tokens. A rule references the semantic or
 * component layer; only a semantic token names a ramp step. Framework-free custom properties, no
 * build step in apps/web, because the public pages ship near-zero JavaScript to hold LCP < 2.5 s
 * and Lighthouse >= 95 (DIRECTIVE.md §22).
 *
 * Contrast: every pair used for text, for a non-text boundary or glyph, and for the focus ring is
 * registered in packages/ui/src/tokens/pairs.ts and measured in BOTH themes by
 * packages/ui/test/contrast.test.ts. The measured table is committed at
 * packages/ui/src/tokens/CONTRAST.md. scripts/validate-contrast.mjs re-measures the shipped values
 * out of this file in CI.
 *
 * Motion: state change only (DIRECTIVE.md §7). The --motion-reveal*, --motion-ambient-cycle and
 * --motion-view-transition tokens exist only for the narrow public-marketing-route allowance in
 * docs/decisions/0003-marketing-motion-allowance.md and are forbidden inside any data-bearing
 * component. All of them collapse under prefers-reduced-motion: reduce.
 */`

const RESET_AND_BASE = `/* ------------------------------------------------------------------------------------------- */
/* 7. Reset and base.                                                                           */
/*    Sizing is in rem throughout and no container height is locked to a text height, so 200%    */
/*    zoom and text-spacing overrides reflow instead of clipping (DIRECTIVE.md §22).             */
/* ------------------------------------------------------------------------------------------- */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  background-color: var(--surface-base);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: var(--font-size-16);
  line-height: var(--line-height-body);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1,
h2,
h3,
h4 {
  margin: 0;
  line-height: var(--line-height-heading);
  letter-spacing: var(--letter-spacing-tight);
  font-weight: var(--font-weight-semibold);
  text-wrap: balance;
}

/* 36px at 375px, 44px at 1440px. The rem floor keeps text-only zoom working; the vw term is
   bounded at both ends so nothing overflows a 375px viewport. */
h1 {
  font-size: clamp(var(--font-size-36), 2.074rem + 0.751vw, var(--font-size-44));
}

/* 24px at 375px, 30px at 1440px. */
h2 {
  font-size: clamp(var(--font-size-24), 1.368rem + 0.563vw, var(--font-size-30));
}

h3 {
  font-size: var(--font-size-20);
}

h4 {
  font-size: var(--font-size-18);
}

p {
  margin: 0;
  text-wrap: pretty;
}

a {
  color: var(--text-accent);
  text-underline-offset: 0.2em;
}

code,
kbd,
samp,
pre {
  font-family: var(--font-mono);
  font-size: var(--font-size-14);
}

img,
svg,
video {
  max-width: 100%;
  height: auto;
}

/* ------------------------------------------------------------------------------------------- */
/* 8. Focus. A 2px ring at a 2px offset, with the gap filled by --focus-ring-halo so the ring    */
/*    never abuts a fill of its own hue. Both adjacent colours are measured at >= 3:1 in both    */
/*    themes (WCAG 2.2 SC 2.4.11 / 2.4.13) — see CONTRAST.md, usage class "focus".               */
/* ------------------------------------------------------------------------------------------- */
:where(a, button, input, select, textarea, summary, [tabindex], [contenteditable]):focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
  box-shadow: 0 0 0 var(--focus-ring-offset) var(--focus-ring-halo);
}

/* ------------------------------------------------------------------------------------------- */
/* 9. Utilities.                                                                                */
/* ------------------------------------------------------------------------------------------- */

/* Tabular numerals. Required, not optional, on clock times, flight numbers, countdowns, slack
   minutes, distances, currency amounts and every numeric table column, so a counting-down value
   never reflows the line it sits on. Verified against the shipped subset: the ten default digit
   advances are 663/384/619/613/615/626/593/524/604/593 units, and the ten tnum digits are all
   600 units. */
.tnum {
  font-variant-numeric: var(--font-variant-tabular);
  font-feature-settings: 'tnum' 1;
}

/* Print hooks for the evidence packet (DIRECTIVE.md §18.5). Published contract for
   frontend-ui-engineer: .dp-no-print is dropped from print, .dp-print-only appears only in print,
   and .dp-print-url expands its links' hrefs so an official source URL survives on paper. */
.dp-print-only {
  display: none;
}`

const LEGACY = `/* ------------------------------------------------------------------------------------------- */
/* 10. Page layer for the pre-Phase-10 public pages.                                            */
/*                                                                                              */
/*     apps/web/src/layouts/BaseLayout.astro and apps/web/src/pages/*.astro are                 */
/*     frontend-ui-engineer's files and are rebuilt on @delaypilot/ui primitives in the next     */
/*     session. Until then these class names must keep working, so they are re-expressed on the  */
/*     new tokens rather than deleted. This whole section is replaced, not extended.             */
/* ------------------------------------------------------------------------------------------- */
.skip-link {
  position: absolute;
  left: -9999px;
  top: 0;
  z-index: 100;
  padding: var(--space-12) var(--space-16);
  background: var(--surface-card);
  color: var(--text-primary);
  border: var(--border-width-hairline) solid var(--border-emphasis);
  border-radius: var(--radius-card);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
}

.skip-link:focus {
  left: var(--space-16);
  top: var(--space-16);
}

.shell {
  width: 100%;
  max-width: var(--layout-shell-max);
  margin-inline: auto;
  padding-inline: clamp(var(--space-16), 0.5rem + 2vw, var(--space-32));
}

.site-header {
  border-bottom: var(--border-width-hairline) solid var(--border-hairline);
  background: var(--surface-card);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-16);
  min-height: var(--space-64);
  flex-wrap: wrap;
}

.wordmark {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-18);
  letter-spacing: var(--letter-spacing-tight);
  color: var(--text-primary);
  text-decoration: none;
}

.wordmark__accent {
  color: var(--text-accent);
}

.site-nav {
  display: flex;
  align-items: center;
  gap: var(--space-24);
  font-size: var(--font-size-14);
}

.site-nav a {
  color: var(--text-secondary);
  text-decoration: none;
  padding-block: var(--space-12);
  min-height: var(--target-min);
  display: inline-flex;
  align-items: center;
}

.site-nav a:hover,
.site-nav a[aria-current='page'] {
  color: var(--text-primary);
}

.hero {
  padding-block: clamp(var(--space-48), 2rem + 5vw, var(--space-96))
    clamp(var(--space-32), 1.5rem + 3vw, var(--space-48));
  display: grid;
  gap: var(--space-24);
  max-width: var(--layout-prose-max);
}

.lede {
  font-size: var(--font-size-18);
  color: var(--text-secondary);
}

.trust-line {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-8) var(--space-16);
  padding: 0;
  margin: 0;
  list-style: none;
  font-size: var(--font-size-14);
  color: var(--text-secondary);
}

.trust-line li {
  display: inline-flex;
  align-items: center;
  gap: var(--space-8);
}

.trust-line li::before {
  content: '';
  inline-size: var(--space-8);
  block-size: var(--space-8);
  border-radius: var(--radius-pill);
  background: var(--border-accent);
  flex: none;
}

.section {
  padding-block: clamp(var(--space-32), 1.5rem + 3vw, var(--space-48));
  border-top: var(--border-width-hairline) solid var(--border-hairline);
  display: grid;
  gap: var(--space-24);
}

.section__intro {
  max-width: var(--layout-prose-max);
  color: var(--text-secondary);
}

.card-grid {
  display: grid;
  gap: var(--space-16);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 17rem), 1fr));
}

.card {
  background: var(--surface-card);
  border: var(--border-width-hairline) solid var(--border-hairline);
  border-radius: var(--radius);
  padding: var(--space-24);
  display: grid;
  gap: var(--space-8);
  align-content: start;
}

.card p {
  color: var(--text-secondary);
  font-size: var(--font-size-14);
}

/* The provenance vocabulary is fixed at exactly six values (AGENTS.md §1.2). These chips render
   the label itself; they never stand in for a value, and they are not decorative. The full
   six-variant primitive is ProvenanceChip in packages/ui/src/primitives/. */
.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-8);
  border-radius: var(--radius-pill);
  border: var(--border-width-hairline) solid currentcolor;
  font-size: var(--font-size-12);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-ui);
  white-space: nowrap;
}

.chip--unavailable {
  color: var(--chip-unavailable-fg);
  background: var(--chip-unavailable-bg);
}

.chip--demo {
  color: var(--chip-demo-fg);
  background: var(--chip-demo-bg);
  border-style: dashed;
  border-width: var(--border-width-emphasis);
}

.chip__dot {
  inline-size: var(--space-8);
  block-size: var(--space-8);
  border-radius: var(--radius-pill);
  background: currentcolor;
  flex: none;
}

.prose {
  display: grid;
  gap: var(--space-16);
  max-width: var(--layout-prose-max);
}

.prose h2 {
  margin-top: var(--space-16);
}

.prose p,
.prose li {
  color: var(--text-secondary);
}

.prose strong {
  color: var(--text-primary);
}

.prose ul {
  margin: 0;
  padding-left: var(--space-24);
  display: grid;
  gap: var(--space-8);
}

.meta {
  font-size: var(--font-size-14);
  color: var(--text-secondary);
}

.site-footer {
  border-top: var(--border-width-hairline) solid var(--border-hairline);
  padding-block: var(--space-32) var(--space-48);
  margin-top: var(--space-16);
  display: grid;
  gap: var(--space-16);
  font-size: var(--font-size-14);
  color: var(--text-secondary);
}

.site-footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-12) var(--space-24);
}

.site-footer__nav a {
  color: var(--text-secondary);
}

.disclaimer {
  max-width: var(--layout-prose-max);
}`

function reducedMotionBlock(): string {
  const overrides = Object.entries(reducedMotion).map(([name, value]) => {
    if (!(name in motion)) {
      throw new Error(`Reduced-motion override --${name} does not name a motion token.`)
    }
    return declaration(name, value, INDENT + INDENT)
  })
  return [
    '/* ------------------------------------------------------------------------------------------- */',
    '/* 11. Reduced motion.                                                                          */',
    '/*     Every duration collapses, the reveal travel goes to zero and the ambient cycle stops.     */',
    '/*     ADR 0003 rule 4: reveals become instant, ambient motifs render a single static frame,     */',
    '/*     view transitions are off — and the state change itself is never removed, because the      */',
    '/*     final state is applied either way.                                                        */',
    '/* ------------------------------------------------------------------------------------------- */',
    '@media (prefers-reduced-motion: reduce) {',
    `${INDENT}:root {`,
    ...overrides,
    `${INDENT}}`,
    '',
    `${INDENT}*,`,
    `${INDENT}*::before,`,
    `${INDENT}*::after {`,
    `${INDENT}${INDENT}animation-duration: 1ms !important;`,
    `${INDENT}${INDENT}animation-iteration-count: 1 !important;`,
    `${INDENT}${INDENT}transition-duration: 1ms !important;`,
    `${INDENT}${INDENT}scroll-behavior: auto !important;`,
    `${INDENT}${INDENT}view-transition-name: none !important;`,
    `${INDENT}}`,
    '}',
  ].join('\n')
}

const PRINT = `/* ------------------------------------------------------------------------------------------- */
/* 13. Print — the evidence packet (DIRECTIVE.md §18.5).                                        */
/*                                                                                              */
/*     Placed after the dark block on purpose: an evidence packet printed from a dark theme      */
/*     wastes ink and is harder to read on paper, and the selector list below includes           */
/*     :root[data-theme='dark'] so it also outranks an explicit dark override.                   */
/*                                                                                              */
/*     Every declaration here is a var() reference, never a literal hex, so this block cannot be  */
/*     mistaken for a theme by the CI contrast parser. The surfaces it selects are already        */
/*     measured light-theme combinations: text on --color-cloud-0 is the light theme's           */
/*     --surface-card, and text on --color-cloud-100 is its --surface-base.                       */
/* ------------------------------------------------------------------------------------------- */
@media print {
  :root,
  :root[data-theme='dark'],
  :root[data-theme='light'] {
    --surface-base: var(--color-cloud-0);
    --surface-card: var(--color-cloud-0);
    --surface-elevated: var(--color-cloud-0);
    --surface-sunken: var(--color-cloud-100);
    --text-primary: var(--color-ink-950);
    --text-secondary: var(--color-slate-600);
    --text-accent: var(--color-sky-700);
    --border-hairline: var(--color-cloud-300);
    --border-emphasis: var(--color-slate-500);
    --shadow-elevated: none;
    --shadow-overlay: none;
    color-scheme: light;
  }

  @page {
    margin: 16mm;
  }

  body {
    background: none;
  }

  .dp-no-print {
    display: none !important;
  }

  .dp-print-only {
    display: revert;
  }

  /* An official source URL is evidence. On paper the href is the only way to read it. */
  .dp-print-url a[href^='http']::after {
    content: ' <' attr(href) '>';
    font-size: var(--font-size-12);
    word-break: break-all;
  }

  .card {
    break-inside: avoid;
  }
}`

/** The complete stylesheet. Deterministic: same source, byte-identical output, every run. */
export function renderTokensCss(): string {
  const blocks = [
    HEADER,
    fontBlock(),
    primitiveBlock(),
    scaleBlock(),
    darkOverrideBlock(),
    lightBlock(),
    lightOverrideBlock(),
    componentBlock(),
    RESET_AND_BASE,
    LEGACY,
    reducedMotionBlock(),
    darkPreferenceBlock(),
    PRINT,
  ]
  return `${alignCommentBoxes(blocks.join('\n\n'))}\n`
}
