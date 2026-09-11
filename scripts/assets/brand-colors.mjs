/**
 * The exact hexes the asset pipeline paints with, and the token each one comes from.
 *
 * Owner: visual-asset-director (docs/agents/ROSTER.md §3, `scripts/assets/**`).
 *
 * WHY THIS IS A SEPARATE FILE
 * Rasters do not inherit CSS. A PNG icon, an ICO member and an Open Graph card have to bake a
 * literal colour, which means the asset pipeline holds a *copy* of part of the token layer — and a
 * copy drifts. So every value below names the primitive token it was read from, and
 * `verify-assets.mjs` asserts that `apps/web/src/styles/tokens.css` still declares that token with
 * that hex. A token change that would silently re-colour thirteen files now fails the asset spec
 * instead.
 *
 * Primitives (`--color-*`) are asserted rather than the semantic aliases (`--accent`, `--muted`)
 * deliberately: the primitive palette is the brand and is stable, while the semantic layer is a
 * mapping that `brand-design-director` re-derives as contrast measurements change. Binding to the
 * primitive is binding to the thing that is actually fixed.
 *
 * CONTRAST IS COMPUTED HERE, NOT TRANSCRIBED
 * Every ratio the asset evidence prints comes out of `formatRatio` below, which mirrors
 * `packages/ui/src/tokens/contrast.ts` line for line — same 0.03928 linearisation threshold, same
 * `(L1 + 0.05) / (L2 + 0.05)`, and the same TRUNCATION. Truncating matters: a rounded 2.995 prints
 * as `3.00` beside a 3:1 floor and reads as a pass. The token layer has always truncated; the
 * asset evidence used to round, which `accessibility-lead` caught as finding F21 in
 * `docs/ACCESSIBILITY.md §2` (their independent measurement of the same pairs gave 4.48, 2.73,
 * 5.51 where this file printed 4.49, 2.74, 5.52). Two implementations agreeing on the same numbers
 * is the point, so the method is duplicated deliberately and the values are not.
 *
 * Non-text graphics need 3:1 (WCAG 2.2 SC 1.4.11).
 */

/** @typedef {{hex: string, token: string, role: string}} BrandColor */

/** @type {Record<string, BrandColor>} */
export const COLOR = {
  ink: {
    hex: '#07111f',
    token: '--color-ink-950',
    role: 'Icon and Open Graph plate. Every raster in the set is drawn on this.',
  },
  cloud: {
    hex: '#f8fbff',
    token: '--color-cloud-50',
    role: 'Mark strokes on the ink plate.',
  },
  markAccent: {
    hex: '#087fbd',
    token: '--color-sky-600',
    /*
     * The advance dot's literal fallback, and the one value in the sky ramp that clears 3:1 on
     * ALL six product surfaces in BOTH themes. That matters because the fallback is what renders
     * with no CSS context at all — an `<img src="mark.svg">`, an email client, a print stylesheet,
     * a PDF. The theme accents are each better in their own theme and fail in the other, which is
     * exactly why they are applied through `--brand-mark-accent` only where a theme context
     * exists. The measured matrix is generated into `design/evidence/s2-mark/README.md §3`; no
     * figure is transcribed into a comment, because a transcribed figure is a figure that goes
     * stale the next time a token moves.
     */
    role: 'Advance dot fallback in mark.svg and logotype.svg.',
  },
  accentDark: {
    hex: '#31c5ff',
    token: '--color-sky-400',
    role: 'Advance dot on the ink plate (icons, Open Graph).',
  },
  accentLight: {
    hex: '#076ca1',
    token: '--color-sky-700',
    role: 'Light-theme accent, used only in the light legibility evidence renders.',
  },
  muted: {
    hex: '#7a8da1',
    token: '--color-slate-300',
    role: 'Open Graph promise line on the ink plate.',
  },
  border: {
    hex: '#13243a',
    token: '--color-ink-800',
    role: 'Open Graph decorative range rings. Decorative: no floor applies, no text sits over it.',
  },
  inkDeep: {
    hex: '#050b16',
    token: '--color-ink-1000',
    role: 'Dark-theme surface in the legibility evidence renders.',
  },
}

/** Plain hex lookup, for the places that only need the value. */
export const HEX = Object.fromEntries(Object.entries(COLOR).map(([key, value]) => [key, value.hex]))

/* ------------------------------------------------------------------------------------------- */
/* WCAG 2.2 contrast arithmetic. Mirrors packages/ui/src/tokens/contrast.ts.                     */
/* ------------------------------------------------------------------------------------------- */

/**
 * The surfaces the mark and the icon set actually appear on, in both themes, plus the icon plate.
 * Hexes are the semantic surface tokens in apps/web/src/styles/tokens.css.
 */
export const SURFACES = [
  { label: 'light `--surface` `#ffffff`', hex: '#ffffff' },
  { label: 'light `--surface-raised` `#f8fbff`', hex: '#f8fbff' },
  { label: 'light `--background` `#eef5fb`', hex: '#eef5fb' },
  { label: 'dark `--background` `#050b16`', hex: '#050b16' },
  { label: 'dark `--surface` `#0b1728`', hex: '#0b1728' },
  { label: 'dark `--surface-raised` `#13243a`', hex: '#13243a' },
  { label: 'icon plate `#07111f`', hex: '#07111f' },
]

const HEX_PATTERN = /^#[0-9a-f]{6}$/

function assertHex(value) {
  if (!HEX_PATTERN.test(value)) {
    throw new Error(
      `Not a six-digit lowercase sRGB hex: ${JSON.stringify(value)}. ` +
        'A translucent or shorthand colour has no single measurable ratio.',
    )
  }
  return value
}

/** WCAG 2.2 sRGB channel linearisation. */
function linearise(channel8Bit) {
  const c = channel8Bit / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** WCAG 2.2 relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex) {
  assertHex(hex)
  const value = Number.parseInt(hex.slice(1), 16)
  return (
    0.2126 * linearise((value >> 16) & 255) +
    0.7152 * linearise((value >> 8) & 255) +
    0.0722 * linearise(value & 255)
  )
}

/** WCAG 2.2 contrast ratio, 1 to 21. Order-independent. */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * Ratios are reported TRUNCATED, never rounded: a 2.995 must not print as `3.00` beside a 3:1
 * floor. Identical to `formatRatio` in packages/ui/src/tokens/contrast.ts, so the asset evidence
 * and CONTRAST.md report the same pair with the same digits.
 */
export function formatRatio(ratio) {
  return (Math.floor(ratio * 100) / 100).toFixed(2)
}

/** `foreground` measured against every surface, truncated, in SURFACES order. */
export function ratiosAgainstSurfaces(foreground) {
  return SURFACES.map((surface) => ({
    surface,
    ratio: contrastRatio(foreground, surface.hex),
    text: formatRatio(contrastRatio(foreground, surface.hex)),
  }))
}

/**
 * Every truncated ratio this palette can legitimately produce against these surfaces.
 *
 * `verify-assets.mjs` asserts that every `N.NN:1` literal written into `mark.svg` or the evidence
 * README is a member of this set. That is what makes a rounded or stale figure fail a test rather
 * than wait for a reviewer to re-measure by hand — the F21 failure mode.
 */
export function permittedRatioLiterals() {
  const set = new Set()
  const foregrounds = [
    ...Object.values(COLOR).map((color) => color.hex),
    ...SURFACES.map((surface) => surface.hex),
  ]
  for (const foreground of foregrounds) {
    for (const surface of SURFACES) set.add(formatRatio(contrastRatio(foreground, surface.hex)))
  }
  return set
}
