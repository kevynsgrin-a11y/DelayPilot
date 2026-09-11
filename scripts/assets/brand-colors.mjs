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
 * Contrast figures are measured with the WCAG 2.x relative-luminance formula against the six
 * product surfaces in both themes. Non-text graphics need 3:1 (WCAG 2.2, 1.4.11).
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
    role: 'Mark strokes on the ink plate. 18.25:1.',
  },
  markAccent: {
    hex: '#087fbd',
    token: '--color-sky-600',
    /*
     * The advance dot's literal fallback, and the one value in the sky ramp that clears 3:1 on
     * ALL six product surfaces in BOTH themes: 4.39 / 4.23 / 3.99 light, 4.49 / 4.10 / 3.56 dark,
     * 4.31 on the icon plate. That matters because the fallback is what renders with no CSS
     * context at all — an `<img src="mark.svg">`, an email client, a print stylesheet, a PDF.
     * The theme accents are each better in their own theme and fail in the other (light
     * `--color-sky-700` #076ca1 is 2.74:1 on dark `--surface-raised`; dark `--color-sky-400`
     * #31c5ff is 1.81:1 on light `--background`), which is exactly why they are applied through
     * `--brand-mark-accent` only where a theme context exists.
     */
    role: 'Advance dot fallback in mark.svg and logotype.svg.',
  },
  accentDark: {
    hex: '#31c5ff',
    token: '--color-sky-400',
    role: 'Advance dot on the ink plate (icons, Open Graph). 9.52:1 on the plate.',
  },
  accentLight: {
    hex: '#076ca1',
    token: '--color-sky-700',
    role: 'Light-theme accent, used only in the light legibility evidence renders. 5.52:1.',
  },
  muted: {
    hex: '#7a8da1',
    token: '--color-slate-300',
    role: 'Open Graph promise line on the ink plate. 5.55:1.',
  },
  border: {
    hex: '#13243a',
    token: '--color-ink-800',
    role: 'Open Graph decorative range rings. 1.21:1 — decorative, no text over it.',
  },
  inkDeep: {
    hex: '#050b16',
    token: '--color-ink-1000',
    role: 'Dark-theme surface in the legibility evidence renders.',
  },
}

/** Plain hex lookup, for the places that only need the value. */
export const HEX = Object.fromEntries(Object.entries(COLOR).map(([key, value]) => [key, value.hex]))
