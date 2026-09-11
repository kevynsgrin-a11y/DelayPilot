/**
 * Layer 1 — primitive colour ramps.
 *
 * This is the ONLY file in the repository that contains a literal colour. Every semantic token
 * names a step here; every component token names a semantic token; no component or primitive
 * references a ramp step directly.
 *
 * ---------------------------------------------------------------------------------------------
 * SEEDS AND EXTENSIONS
 * ---------------------------------------------------------------------------------------------
 * The sixteen `DIRECTIVE.md §7` seed hexes are reproduced verbatim and are marked `seed: true`.
 * They are seeds, not verified pairs. Measured against the four light surfaces they must serve,
 * five of them fail the AA floor for text — `sky-600` at 3.53:1, `safe-500` at 3.26:1,
 * `critical-500` at 3.35:1, `unknown-500` at 3.17:1 and `watch-500` at 2.12:1, each against
 * `cloud-200`, the darkest light surface. `watch-500` additionally fails the 3:1 non-text floor
 * there.
 *
 * So the ramp is extended rather than the floor lowered (`§7`: "adjust only to satisfy measured
 * contrast; never ship an unmeasured pair"). Every extension is derived from its seed by the
 * smallest hue- and saturation-preserving HSL lightness shift that clears the stated threshold
 * against every surface the token is used on, or by a documented sRGB mix with a surface colour.
 * The derivation and the measured result are recorded per entry, and re-measured for both themes
 * by test/contrast.test.ts on every run.
 *
 * Note the asymmetry the measurement produced: green, red and slate keep their seed at the 3:1
 * boundary weight, while amber needs a dedicated `watch-600`. Amber is the weak hue on light
 * surfaces; that is a fact about the palette, not a preference.
 */

import { assertHex, type Hex } from './contrast.ts'

export interface PrimitiveColor {
  readonly hex: Hex
  /** True only for the sixteen hexes printed in DIRECTIVE.md §7. Their values are frozen. */
  readonly seed: boolean
  readonly note: string
}

const ramp = <T extends Record<string, PrimitiveColor>>(entries: T): T => {
  for (const [name, entry] of Object.entries(entries)) {
    try {
      assertHex(entry.hex)
    } catch (error) {
      throw new Error(`Primitive ramp ${name} is not a measurable colour.`, { cause: error })
    }
  }
  return entries
}

export const primitiveColors = ramp({
  // --- Ink: dark-theme surfaces and light-theme text. All four are §7 seeds. ---
  'ink-1000': { hex: '#050b16', seed: true, note: 'Dark page background; light-on-accent text.' },
  'ink-950': { hex: '#07111f', seed: true, note: 'Light-theme body text; dark inset surface.' },
  'ink-900': {
    hex: '#0b1728',
    seed: true,
    note: 'Dark card surface; light-theme inverse surface.',
  },
  'ink-800': { hex: '#13243a', seed: true, note: 'Dark elevated surface and dark hairline.' },

  // --- Cloud: light-theme surfaces and dark-theme text. 50/100/200 are §7 seeds. ---
  'cloud-0': {
    hex: '#ffffff',
    seed: false,
    note: 'Extension. Pure white: the light card surface and the light focus-ring halo. No §7 seed is white, and a card must read as lifted off cloud-100.',
  },
  'cloud-50': { hex: '#f8fbff', seed: true, note: 'Light elevated surface; dark-theme body text.' },
  'cloud-100': { hex: '#eef5fb', seed: true, note: 'Light page background; dark inverse surface.' },
  'cloud-200': { hex: '#dce8f2', seed: true, note: 'Light inset surface and light hairline.' },
  'cloud-300': {
    hex: '#c3d4e2',
    seed: false,
    note: 'Extension. Light emphasis divider: cloud-200 is 1.13:1 on the page and disappears where a rule must be read as deliberate.',
  },

  // --- Slate: neutral text and control boundaries. 500/700 are §7 seeds. ---
  'slate-300': {
    hex: '#7a8da1',
    seed: false,
    note: 'Extension. slate-500 lightened until 4.55:1 on ink-800, the hardest dark surface; measures 4.59:1. Dark secondary text.',
  },
  'slate-500': {
    hex: '#62758a',
    seed: true,
    note: 'Control boundary in BOTH themes (4.31:1 light / 3.30:1 dark, floor 3:1) and disabled text.',
  },
  'slate-600': {
    hex: '#58687b',
    seed: false,
    note: 'Extension. slate-500 darkened until 4.55:1 on cloud-200, the hardest light surface; measures 4.58:1. Light secondary text.',
  },
  'slate-700': { hex: '#34465a', seed: true, note: 'Dark emphasis divider.' },

  // --- Sky: the accent. 400/500/600 are §7 seeds. ---
  'sky-50': {
    hex: '#e5f4fd',
    seed: false,
    note: 'Extension. sRGB mix of sky-500 8% over cloud-50. Light selected/subtle accent fill.',
  },
  'sky-300': {
    hex: '#55cfff',
    seed: false,
    note: 'Extension. sRGB mix of sky-400 82% over cloud-50. Dark accent hover fill; ink-1000 on it measures 11.03:1.',
  },
  'sky-400': {
    hex: '#31c5ff',
    seed: true,
    note: 'Dark accent text, fill, border and focus ring (7.87:1 on ink-800).',
  },
  'sky-500': {
    hex: '#0ba8ea',
    seed: true,
    note: 'Dark accent pressed fill; ink-1000 on it measures 7.32:1.',
  },
  'sky-600': {
    hex: '#087fbd',
    seed: true,
    note: 'Light accent border and focus ring (3.53:1 on cloud-200, floor 3:1). NOT usable for light text: 3.53:1 there.',
  },
  'sky-700': {
    hex: '#076ca1',
    seed: false,
    note: 'Extension. sky-600 darkened until 4.55:1 on cloud-200; measures 4.60:1. Light accent text and light accent fill (white on it: 5.72:1).',
  },
  'sky-800': {
    hex: '#066293',
    seed: false,
    note: 'Extension. sky-700 darkened to 6.6:1 against white. Light accent hover fill.',
  },
  'sky-900': {
    hex: '#065781',
    seed: false,
    note: 'Extension. sky-700 darkened to 7.8:1 against white. Light accent pressed fill.',
  },
  'sky-950': {
    hex: '#062438',
    seed: false,
    note: 'Extension. sRGB mix of sky-500 16% over ink-1000. Dark selected/subtle accent fill.',
  },

  // --- Safe: on track. 500 is the §7 seed. ---
  'safe-50': {
    hex: '#e6f2f3',
    seed: false,
    note: 'Extension. sRGB mix of safe-500 8% over cloud-50. Light safe chip fill.',
  },
  'safe-400': {
    hex: '#189d74',
    seed: false,
    note: 'Extension. safe-500 lightened until 4.55:1 on ink-800; measures 4.56:1. Dark safe text and glyph.',
  },
  'safe-500': {
    hex: '#168f6a',
    seed: true,
    note: 'Safe boundary and dot in BOTH themes (3.26:1 light / 3.86:1 dark, floor 3:1).',
  },
  'safe-700': {
    hex: '#127456',
    seed: false,
    note: 'Extension. safe-500 darkened until 4.55:1 on cloud-200; measures 4.61:1. Light safe text and glyph.',
  },
  'safe-950': {
    hex: '#082023',
    seed: false,
    note: 'Extension. sRGB mix of safe-500 16% over ink-1000. Dark safe chip fill.',
  },

  // --- Watch: conditions changing. 500 is the §7 seed. The weak hue on light surfaces. ---
  'watch-50': {
    hex: '#f6f2ec',
    seed: false,
    note: 'Extension. sRGB mix of watch-500 8% over cloud-50. Light watch chip fill.',
  },
  'watch-500': {
    hex: '#d99014',
    seed: true,
    note: 'Dark watch text, boundary and dot (5.93:1 on ink-800). On light surfaces it measures 2.12:1 and is never used there.',
  },
  'watch-600': {
    hex: '#b07510',
    seed: false,
    note: 'Extension. watch-500 darkened until 3.12:1 on cloud-200; measures 3.12:1. Light watch boundary and dot — the seed cannot clear even the 3:1 non-text floor on light.',
  },
  'watch-700': {
    hex: '#8d5d0d',
    seed: false,
    note: 'Extension. watch-500 darkened until 4.55:1 on cloud-200; measures 4.55:1. Light watch text and glyph.',
  },
  'watch-950': {
    hex: '#272016',
    seed: false,
    note: 'Extension. sRGB mix of watch-500 16% over ink-1000. Dark watch chip fill — a saturated amber fill glares on ink.',
  },

  // --- Critical: confirmed material disruption. 500 is the §7 seed. ---
  'critical-50': {
    hex: '#f6edf2',
    seed: false,
    note: 'Extension. sRGB mix of critical-500 8% over cloud-50. Light critical chip fill.',
  },
  'critical-400': {
    hex: '#de6275',
    seed: false,
    note: 'Extension. critical-500 lightened until 4.55:1 on ink-800; measures 4.56:1. Dark critical text and glyph.',
  },
  'critical-500': {
    hex: '#d9485f',
    seed: true,
    note: 'Critical boundary and dot in BOTH themes (3.35:1 light / 3.76:1 dark, floor 3:1).',
  },
  'critical-700': {
    hex: '#c32841',
    seed: false,
    note: 'Extension. critical-500 darkened until 4.55:1 on cloud-200; measures 4.56:1. Light critical text and glyph.',
  },
  'critical-950': {
    hex: '#271522',
    seed: false,
    note: 'Extension. sRGB mix of critical-500 16% over ink-1000. Dark critical chip fill.',
  },

  // --- Unknown: insufficient fresh information. Neutral slate, never amber, never faded. ---
  'unknown-50': {
    hex: '#edf1f7',
    seed: false,
    note: 'Extension. sRGB mix of unknown-500 8% over cloud-50. Light unknown chip fill.',
  },
  'unknown-400': {
    hex: '#7f8ba0',
    seed: false,
    note: 'Extension. unknown-500 lightened until 4.55:1 on ink-800; measures 4.55:1. Dark unknown text and glyph.',
  },
  'unknown-500': {
    hex: '#738197',
    seed: true,
    note: 'Unknown boundary and dot in BOTH themes (3.17:1 light / 3.96:1 dark, floor 3:1).',
  },
  'unknown-700': {
    hex: '#5b677b',
    seed: false,
    note: 'Extension. unknown-500 darkened until 4.55:1 on cloud-200; measures 4.59:1. Light unknown text and glyph.',
  },
  'unknown-950': {
    hex: '#171e2b',
    seed: false,
    note: 'Extension. sRGB mix of unknown-500 16% over ink-1000. Dark unknown chip fill.',
  },
})

export type PrimitiveColorName = keyof typeof primitiveColors

export const primitiveColorNames = Object.keys(primitiveColors) as PrimitiveColorName[]

export function primitiveHex(name: PrimitiveColorName): Hex {
  return primitiveColors[name].hex
}

/** The §7 seed hexes, for the handoff to visual-asset-director. */
export const seedColorNames: readonly PrimitiveColorName[] = primitiveColorNames.filter(
  (name) => primitiveColors[name].seed,
)
