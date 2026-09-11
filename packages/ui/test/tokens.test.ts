/**
 * Token system contract.
 *
 * Three things this file exists to prevent:
 *
 *   1. **Drift.** apps/web/src/styles/tokens.css and CONTRAST.md are generated. Regenerating them
 *      in memory and comparing byte-for-byte means a hand edit to either fails the suite instead of
 *      quietly diverging from the typed source.
 *   2. **Layer leakage.** A primitive that reaches past the semantic layer into a raw ramp step
 *      makes the ramp untouchable. The check is mechanical, not a review note.
 *   3. **Dead tokens.** `AGENTS.md §1.6` forbids an unused token. Every ramp step must be named by
 *      a semantic token, every semantic and component token must be referenced by a rule, and every
 *      scale token must be referenced or listed as a published contract with its consumer named.
 *
 * It also pins the structural constraints that scripts/validate-contrast.mjs depends on. That
 * script is not ours; breaking its parser breaks CI with an unhelpful error, so the constraint is
 * asserted here where the failure can explain itself.
 */

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { renderTokensCss } from '../src/tokens/css.ts'
import { renderContrastTable } from '../src/tokens/contrast-table.ts'
import { CONTRAST_TABLE_PATH, STYLESHEET_PATH } from './paths.ts'
import { primitiveColorNames, primitiveColors } from '../src/tokens/primitive.ts'
import {
  contrastGateNames,
  legacyColorAliases,
  legacyScaleAliases,
  semanticColorNames,
  semanticColors,
  semanticRaw,
} from '../src/tokens/semantic.ts'
import { componentColorNames, componentColors } from '../src/tokens/component.ts'
import {
  externallyConsumedScaleTokens,
  motion,
  reducedMotion,
  scaleTokenNames,
  typeScale,
} from '../src/tokens/scale.ts'

const generatedCss = renderTokensCss()
const committedCss = readFileSync(STYLESHEET_PATH, 'utf8')
const primitivesCss = readFileSync(
  new URL('../src/primitives/primitives.css', import.meta.url),
  'utf8',
)

/** Every `var(--name)` reference across both stylesheets. */
function varReferences(...sources: readonly string[]): Set<string> {
  const found = new Set<string>()
  for (const source of sources) {
    for (const match of source.matchAll(/var\(\s*(--[a-z0-9-]+)/g)) {
      const name = match[1]
      if (name !== undefined) found.add(name.slice(2))
    }
  }
  return found
}

const referenced = varReferences(generatedCss, primitivesCss)

/** Strip comments, so prose about a forbidden construct is not mistaken for the construct. */
function declarationsOnly(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '')
}

const generatedRules = declarationsOnly(generatedCss)
const primitiveRules = declarationsOnly(primitivesCss)

describe('generated artifacts', () => {
  it('the committed stylesheet is byte-identical to a fresh render', () => {
    expect(committedCss).toBe(generatedCss)
  })

  it('the committed contrast table is byte-identical to a fresh render', () => {
    expect(readFileSync(CONTRAST_TABLE_PATH, 'utf8')).toBe(renderContrastTable())
  })

  it('ships no placeholder (AGENTS.md §1.6)', () => {
    for (const source of [generatedCss, primitivesCss]) {
      expect(source).not.toMatch(/\bTODO\b|\bFIXME\b|coming soon|lorem ipsum/i)
    }
  })
})

describe('DIRECTIVE.md §7 seed hexes', () => {
  const SEEDS: Readonly<Record<string, string>> = {
    'ink-1000': '#050b16',
    'ink-950': '#07111f',
    'ink-900': '#0b1728',
    'ink-800': '#13243a',
    'cloud-50': '#f8fbff',
    'cloud-100': '#eef5fb',
    'cloud-200': '#dce8f2',
    'slate-500': '#62758a',
    'slate-700': '#34465a',
    'sky-400': '#31c5ff',
    'sky-500': '#0ba8ea',
    'sky-600': '#087fbd',
    'safe-500': '#168f6a',
    'watch-500': '#d99014',
    'critical-500': '#d9485f',
    'unknown-500': '#738197',
  }

  it('reproduces all sixteen verbatim', () => {
    for (const [name, hex] of Object.entries(SEEDS)) {
      expect(primitiveColors[name as keyof typeof primitiveColors].hex, name).toBe(hex)
      expect(generatedCss).toContain(`--color-${name}: ${hex};`)
    }
  })

  it('marks exactly those sixteen as seeds', () => {
    const seeds = primitiveColorNames.filter((name) => primitiveColors[name].seed)
    expect([...seeds].sort()).toEqual(Object.keys(SEEDS).sort())
  })
})

describe('layering', () => {
  it('every component token aliases a semantic token', () => {
    for (const name of componentColorNames) {
      expect(semanticColorNames, `--${name}`).toContain(componentColors[name].ref)
    }
  })

  it('every semantic token names a primitive ramp step', () => {
    for (const name of semanticColorNames) {
      expect(primitiveColorNames).toContain(semanticColors[name].light)
      expect(primitiveColorNames).toContain(semanticColors[name].dark)
    }
  })

  it('primitives.css never reaches past the semantic layer into a ramp step', () => {
    const leaks = [...varReferences(primitivesCss)].filter((name) => name.startsWith('color-'))
    expect(leaks, `primitives.css references ramp steps: ${leaks.join(', ')}`).toEqual([])
  })

  it('primitives.css carries no literal colour', () => {
    expect(primitiveRules).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(primitiveRules).not.toMatch(/\b(rgb|rgba|hsl|hsla|oklch|color-mix)\(/)
  })

  it('every token primitives.css references is defined, or is component-local plumbing', () => {
    const defined = new Set<string>()
    for (const match of generatedCss.matchAll(/^\s*(--[a-z0-9-]+):/gm)) {
      const name = match[1]
      if (name !== undefined) defined.add(name.slice(2))
    }
    const undefinedRefs = [...varReferences(primitivesCss)].filter(
      (name) => !defined.has(name) && !name.startsWith('dp-'),
    )
    expect(undefinedRefs, `Undefined: ${undefinedRefs.join(', ')}`).toEqual([])
  })
})

describe('no unused token (AGENTS.md §1.6)', () => {
  it('every ramp step is named by at least one semantic token', () => {
    const used = new Set<string>()
    for (const name of semanticColorNames) {
      used.add(semanticColors[name].light)
      used.add(semanticColors[name].dark)
    }
    // The print block re-points semantic tokens at ramp steps directly; count those too.
    for (const name of varReferences(generatedCss)) {
      if (name.startsWith('color-')) used.add(name.slice('color-'.length))
    }
    const unused = primitiveColorNames.filter((name) => !used.has(name))
    expect(unused, `Unused ramp steps: ${unused.join(', ')}`).toEqual([])
  })

  it('every semantic colour is referenced by a rule or a component token', () => {
    const unused = semanticColorNames.filter((name) => !referenced.has(name))
    expect(unused, `Unused semantic tokens: ${unused.join(', ')}`).toEqual([])
  })

  it('every component token is referenced by a rule', () => {
    const unused = componentColorNames.filter((name) => !referenced.has(name))
    expect(unused, `Unused component tokens: ${unused.join(', ')}`).toEqual([])
  })

  it('every themed raw value is referenced by a rule', () => {
    const unused = Object.keys(semanticRaw).filter((name) => !referenced.has(name))
    expect(unused, `Unused raw values: ${unused.join(', ')}`).toEqual([])
  })

  it('every scale token is referenced, or published with a named consumer', () => {
    const unused = scaleTokenNames.filter(
      (name) => !referenced.has(name) && externallyConsumedScaleTokens[name] === undefined,
    )
    expect(unused, `Unused scale tokens: ${unused.join(', ')}`).toEqual([])
    for (const [name, consumer] of Object.entries(externallyConsumedScaleTokens)) {
      expect(scaleTokenNames, name).toContain(name)
      expect(consumer.length).toBeGreaterThan(20)
    }
  })

  it('every compatibility alias is defined and still reachable', () => {
    for (const alias of Object.keys(legacyColorAliases)) {
      expect(generatedCss).toMatch(new RegExp(`^\\s*--${alias}: #[0-9a-f]{6};`, 'm'))
    }
    for (const alias of Object.keys(legacyScaleAliases)) {
      expect(generatedCss).toContain(`--${alias}: var(--`)
    }
  })
})

/**
 * The parser in scripts/validate-contrast.mjs, reimplemented. If this drifts from that script the
 * assertions below stop meaning anything, so it is kept deliberately literal.
 */
function parseThemes(css: string): { light: Map<string, string>; dark: Map<string, string> } {
  const darkStart = css.indexOf('@media (prefers-color-scheme: dark)')
  expect(darkStart).toBeGreaterThan(-1)
  const collect = (slice: string): Map<string, string> => {
    const found = new Map<string, string>()
    for (const match of slice.matchAll(/(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) {
      const [, name, value] = match
      if (name !== undefined && value !== undefined) found.set(name, value.toLowerCase())
    }
    return found
  }
  const light = collect(css.slice(0, darkStart))
  const dark = new Map(light)
  for (const [name, value] of collect(css.slice(darkStart))) dark.set(name, value)
  return { light, dark }
}

describe('stylesheet structure the CI contrast gate depends on', () => {
  const themes = parseThemes(generatedCss)

  it('exposes all eleven gate token names in both themes', () => {
    for (const name of contrastGateNames) {
      expect(themes.light.get(`--${name}`), `light --${name}`).toMatch(/^#[0-9a-f]{6}$/)
      expect(themes.dark.get(`--${name}`), `dark --${name}`).toMatch(/^#[0-9a-f]{6}$/)
    }
  })

  it('parses each gate name to the value its semantic source holds', () => {
    for (const [alias, target] of Object.entries(legacyColorAliases)) {
      expect(themes.light.get(`--${alias}`)).toBe(primitiveColors[semanticColors[target].light].hex)
      expect(themes.dark.get(`--${alias}`)).toBe(primitiveColors[semanticColors[target].dark].hex)
    }
  })

  it('orders the theme blocks so the parser and the cascade agree', () => {
    const darkOverride = generatedCss.indexOf(":root[data-theme='dark']")
    const lightDefault = generatedCss.indexOf('\n:root {\n  /* Surfaces, text, borders, focus')
    const lightOverride = generatedCss.indexOf(":root[data-theme='light']")
    const systemDark = generatedCss.indexOf('@media (prefers-color-scheme: dark)')

    expect(darkOverride).toBeGreaterThan(-1)
    expect(lightDefault).toBeGreaterThan(darkOverride)
    expect(lightOverride).toBeGreaterThan(lightDefault)
    expect(systemDark).toBeGreaterThan(lightOverride)
  })

  it('places no literal hex after the system-dark block', () => {
    const systemDark = generatedCss.indexOf('@media (prefers-color-scheme: dark)')
    const tail = generatedCss.slice(systemDark)
    const blockEnd = tail.indexOf('\n}\n')
    const afterBlock = tail.slice(blockEnd)
    expect(afterBlock).not.toMatch(/--[a-z0-9-]+\s*:\s*#[0-9a-fA-F]{3,8}\s*;/)
  })

  it('lets an explicit theme choice win in both directions', () => {
    // Both override blocks are (0,2,0); the system-preference block is (0,1,0) and cannot beat them.
    expect(generatedCss).toContain(":root[data-theme='dark'] {")
    expect(generatedCss).toContain(":root[data-theme='light'] {")
  })

  it('prints light, never the dark theme, and outranks an explicit dark override', () => {
    const print = generatedCss.slice(generatedCss.indexOf('@media print'))
    expect(print).toContain(":root[data-theme='dark'],")
    expect(print).not.toMatch(/--[a-z0-9-]+\s*:\s*#[0-9a-fA-F]{3,8}\s*;/)
    expect(generatedCss.indexOf('@media print')).toBeGreaterThan(
      generatedCss.indexOf('@media (prefers-color-scheme: dark)'),
    )
  })
})

describe('typography, motion and the compatibility surface', () => {
  it('emits the 1.2 type scale from a 16px base', () => {
    expect(Object.keys(typeScale)).toEqual([
      'font-size-12',
      'font-size-14',
      'font-size-16',
      'font-size-18',
      'font-size-20',
      'font-size-24',
      'font-size-30',
      'font-size-36',
      'font-size-44',
    ])
    expect(generatedCss).toContain('--font-size-16: 1rem;')
    expect(generatedCss).toContain('--line-height-body: 1.55;')
    expect(generatedCss).toContain('--line-height-heading: 1.2;')
    expect(generatedCss).toContain('--layout-prose-max: 68ch;')
  })

  it('wires tabular numerals as a utility and a token', () => {
    expect(generatedCss).toContain('--font-variant-tabular: tabular-nums;')
    expect(generatedCss).toMatch(
      /\.tnum \{\n {2}font-variant-numeric: var\(--font-variant-tabular\);/,
    )
    expect(primitivesCss).toContain('font-variant-numeric: var(--font-variant-tabular);')
  })

  it('serves two self-hosted Geist faces and two metric-matched fallback faces', () => {
    expect(generatedCss).toContain("url('/fonts/geist-sans-latin-400.woff2') format('woff2')")
    expect(generatedCss).toContain("url('/fonts/geist-sans-latin-600.woff2') format('woff2')")
    expect(generatedCss).not.toMatch(/https?:\/\/[^)]*fonts/)
    expect(generatedCss.match(/font-display: swap;/g)).toHaveLength(2)
    expect(generatedRules.match(/\n {2}size-adjust: /g)).toHaveLength(2)
    expect(generatedCss).toContain('ascent-override: 95.89%;')
    expect(generatedCss).toContain('descent-override: 28.15%;')
    expect(generatedCss).toContain('line-gap-override: 0%;')
    expect(generatedCss).toContain("font-family: 'Geist Sans Fallback';")
  })

  it('publishes the motion tokens and collapses every one of them under reduced motion', () => {
    expect(generatedCss).toContain('--motion-fast: 120ms;')
    expect(generatedCss).toContain('--motion-base: 180ms;')
    expect(generatedCss).toContain('--motion-slow: 240ms;')
    expect(generatedCss).toContain('--motion-reveal-distance: 16px;')
    expect(generatedCss).toContain('--motion-ambient-cycle: 12s;')
    expect(generatedCss).toContain('--motion-view-transition: 180ms;')

    const reduced = generatedCss.slice(
      generatedCss.indexOf('@media (prefers-reduced-motion: reduce)'),
    )
    for (const [name, value] of Object.entries(reducedMotion)) {
      expect(reduced).toContain(`--${name}: ${value};`)
    }
    // Durations that are not overridden directly must be composed from ones that are.
    for (const name of Object.keys(motion)) {
      const overridden = reducedMotion[name] !== undefined
      const composed = motion[name as keyof typeof motion].value.includes('var(--motion-')
      const easing = name.startsWith('motion-ease-')
      expect(overridden || composed || easing, `--${name} survives reduced motion`).toBe(true)
    }
    expect(reduced).toContain('animation-iteration-count: 1 !important;')
    // ACCESSIBILITY.md F18: a delay that survives makes a reduced-motion user wait for content.
    expect(reduced).toContain('animation-delay: 0ms !important;')
    expect(reduced).toContain('transition-delay: 0ms !important;')
  })

  it('contains no keyframe animation anywhere', () => {
    expect(generatedRules).not.toContain('@keyframes')
    expect(primitiveRules).not.toContain('@keyframes')
    expect(primitiveRules).not.toMatch(/animation(-name)?:\s*(?!none)/)
  })

  /**
   * ACCESSIBILITY.md F19 widened this. The earlier version matched a named-property list only, so
   * `transition: all`, `transition-property: width` and a property reached through a custom
   * property would all have passed. `all` is the important one: it silently includes every layout
   * property a future rule adds.
   */
  it('never transitions a layout property, and never `all`', () => {
    const forbidden =
      /transition(-property)?:[^;]*\b(all|width|height|inline-size|block-size|padding|margin|inset|top|left|right|bottom)\b/
    expect(primitiveRules).not.toMatch(forbidden)
    expect(generatedRules).not.toMatch(forbidden)
    // A transition whose property list is itself a custom property cannot be read here, so it is
    // refused outright rather than trusted.
    const indirect = /transition(-property)?:\s*var\(/
    expect(primitiveRules).not.toMatch(indirect)
    expect(generatedRules).not.toMatch(indirect)
  })

  it('keeps every class the pre-Phase-10 pages depend on', () => {
    const required = [
      'skip-link',
      'shell',
      'site-header',
      'site-header__inner',
      'wordmark',
      'wordmark__accent',
      'site-nav',
      'hero',
      'lede',
      'trust-line',
      'section',
      'section__intro',
      'card-grid',
      'card',
      'chip',
      'chip--unavailable',
      'chip--demo',
      'chip__dot',
      'prose',
      'meta',
      'site-footer',
      'site-footer__nav',
      'disclaimer',
      'tnum',
    ]
    for (const className of required) {
      expect(generatedCss, `.${className}`).toMatch(
        new RegExp(`\\.${className.replace(/-/g, '-')}[\\s,{:.]`),
      )
    }
    for (const custom of [
      '--border',
      '--border-strong',
      '--radius',
      '--radius-sm',
      '--radius-lg',
      '--font-sans',
      '--font-mono',
    ]) {
      expect(generatedCss, custom).toMatch(new RegExp(`^\\s*${custom}:`, 'm'))
    }
  })

  it('publishes the breakpoints and the cockpit grid', () => {
    expect(generatedCss).toContain('--grid-columns: 12;')
    expect(generatedCss).toContain('--grid-cockpit-primary: 8;')
    expect(generatedCss).toContain('--grid-cockpit-secondary: 4;')
    expect(generatedCss).toContain('--target-min: 2.75rem;')
    expect(primitivesCss).toContain('@media (min-width: 1024px)')
    expect(primitivesCss).toContain('@media (min-width: 768px)')
  })
})
/**
 * The rules `docs/ACCESSIBILITY.md` B1, B2, B5, F7, F10 and F12 turn on.
 *
 * These are CSS facts, not markup facts, so they cannot be asserted from a render. Each one is a
 * declaration whose absence reintroduces a specific defect: an unmarked active option, a meter with
 * no scale, a tooltip that cannot be reached with a pointer, a Toast with no severity fill, an
 * edgeless card inside a dialog, and a focus ring drawn against a 2.89:1 neighbour.
 */
describe('primitive rules the Phase 9 review depends on', () => {
  const ruleBody = (selector: string): string => {
    const at = primitiveRules.indexOf(`${selector} {`)
    expect(at, `no rule for ${selector}`).toBeGreaterThan(-1)
    const end = primitiveRules.indexOf('}', at)
    return primitiveRules.slice(at, end)
  }

  it('B1 — the active combobox option inverts, and the selected one carries a bar', () => {
    const active = ruleBody('.dp-combobox__option.is-active')
    expect(active).toContain('background-color: var(--accent-bg);')
    expect(active).toContain('color: var(--text-on-accent);')

    const selected = ruleBody(".dp-combobox__option[aria-selected='true']")
    expect(selected).toContain('border-inline-start-color: var(--border-accent);')

    // The bar is reserved on every option, so becoming active changes a colour and not a box.
    expect(ruleBody('.dp-combobox__option')).toContain(
      'border-inline-start: var(--border-width-emphasis) solid transparent;',
    )
    // Whichever rule is declared last wins at equal specificity; active must be it.
    expect(primitiveRules.indexOf('.dp-combobox__option.is-active {')).toBeGreaterThan(
      primitiveRules.indexOf(".dp-combobox__option[aria-selected='true'] {"),
    )
  })

  it('B2 — the ProgressBar track is an outline, not an invisible fill', () => {
    const track = ruleBody('.dp-progress__track')
    expect(track).toContain('var(--progress-track-border)')
    expect(track).toContain('background-color: transparent;')
    expect(track).not.toContain('var(--surface-sunken)')
  })

  it('B5 — the tooltip bubble bridges its own offset', () => {
    expect(ruleBody('.dp-tooltip__bubble')).toContain(
      'inset-block-end: calc(100% + var(--space-8));',
    )
    const bridge = ruleBody('.dp-tooltip__bubble::before')
    expect(bridge).toContain('inset-block-start: 100%;')
    // The bridge is exactly as tall as the offset it covers, or a dead strip survives.
    expect(bridge).toContain('block-size: var(--space-8);')
    expect(bridge).toContain('inset-inline: 0;')
  })

  it('F7 — nothing re-declares a Toast background after the severity modifiers', () => {
    const lastModifier = primitiveRules.lastIndexOf('.dp-toast--')
    expect(lastModifier).toBeGreaterThan(-1)
    expect(primitiveRules.slice(lastModifier)).not.toMatch(/\.dp-toast \{[^}]*background-color/)
  })

  it('F10 — a card nested in a floating layer takes the heavier rule', () => {
    expect(primitiveRules).toContain(
      ':where(.dp-dialog, .dp-drawer) :is(.dp-card, .dp-table, .dp-disclosure) {',
    )
  })

  it('F12 — the dialog focus ring is inset clear of the panel border', () => {
    expect(primitiveRules).toContain('outline-offset: calc(-1 * var(--space-4));')
    expect(primitiveRules).not.toContain('outline-offset: calc(-1 * var(--focus-ring-offset));')
  })
})
