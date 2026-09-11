/**
 * Layer 2 — semantic tokens.
 *
 * Each entry names one primitive ramp step per theme. Dark mode is authored here as a first-class
 * palette, not derived by inversion: `watch-500` is the dark watch text because it measures 5.93:1
 * on `ink-800`, and `watch-700` is the light watch text because the same amber measures 2.12:1 on
 * `cloud-200`. Neither is the other's inverse.
 *
 * Nothing below carries a literal colour. If a value is missing from primitive.ts, add a ramp step
 * there with its derivation — do not inline a hex here.
 */

import type { PrimitiveColorName } from './primitive.ts'

export interface SemanticColor {
  readonly light: PrimitiveColorName
  readonly dark: PrimitiveColorName
  readonly note: string
}

const semantic = <T extends Record<string, SemanticColor>>(t: T): T => t

export const semanticColors = semantic({
  // --- Surfaces. Elevation in dark mode is surface tint plus hairline, not shadow. ---
  'surface-base': { light: 'cloud-100', dark: 'ink-1000', note: 'Page background.' },
  'surface-card': { light: 'cloud-0', dark: 'ink-900', note: 'Cards, panels, inputs, popovers.' },
  'surface-elevated': {
    light: 'cloud-50',
    dark: 'ink-800',
    note: 'Floating layers: dialog, drawer, toast. The hardest dark surface for text.',
  },
  'surface-sunken': {
    light: 'cloud-200',
    dark: 'ink-950',
    note: 'Inset areas: table headers, progress tracks, the neutral Cached chip. The hardest light surface for text.',
  },
  'surface-inverse': {
    light: 'ink-900',
    dark: 'cloud-100',
    note: 'Tooltips. Inverted in both directions so a tooltip never reads as part of the page.',
  },

  // --- Text. Every one of these clears 4.5:1 on every surface it is used on, in both themes. ---
  'text-primary': { light: 'ink-950', dark: 'cloud-50', note: 'Body and heading text.' },
  'text-secondary': {
    light: 'slate-600',
    dark: 'slate-300',
    note: 'Supporting text, freshness strings, table captions. Held to 4.5:1, not to the large-text allowance.',
  },
  'text-disabled': {
    light: 'slate-500',
    dark: 'slate-500',
    note: 'Inactive control text. WCAG 2.2 exempts inactive components from 1.4.3; this is held to the 3:1 non-text floor anyway.',
  },
  'text-inverse': { light: 'cloud-50', dark: 'ink-950', note: 'Text on --surface-inverse.' },
  'text-on-accent': {
    light: 'cloud-0',
    dark: 'ink-1000',
    note: 'Text and glyphs on an accent fill.',
  },
  'text-accent': { light: 'sky-700', dark: 'sky-400', note: 'Links and accent-coloured text.' },

  // --- Borders. ---
  'border-hairline': {
    light: 'cloud-200',
    dark: 'ink-800',
    note: 'The 1px separator between non-interactive regions. Decorative under WCAG 2.2 1.4.11; measured and recorded, not required to clear 3:1.',
  },
  'border-emphasis': {
    light: 'cloud-300',
    dark: 'slate-700',
    note: 'A rule that must read as deliberate: table header underline, footer rule, drawer edge.',
  },
  'border-interactive': {
    light: 'slate-500',
    dark: 'slate-500',
    note: 'The boundary that identifies a control — input, checkbox, radio, switch track, secondary button. Clears 3:1 on every surface in both themes.',
  },
  'border-accent': {
    light: 'sky-600',
    dark: 'sky-400',
    note: 'Selected tab underline and accent-outlined controls.',
  },

  // --- Focus. ---
  'focus-ring': {
    light: 'sky-600',
    dark: 'sky-400',
    note: 'The 2px ring. Measured against every surface AND against the halo, so it never abuts a same-hue fill.',
  },
  'focus-ring-halo': {
    light: 'cloud-0',
    dark: 'ink-1000',
    note: 'Fills the 2px offset gap. This is what makes the ring legible on an accent or status fill.',
  },

  // --- Accent fills. ---
  'accent-bg': { light: 'sky-700', dark: 'sky-400', note: 'Primary button fill.' },
  'accent-bg-hover': { light: 'sky-800', dark: 'sky-300', note: 'Primary button hover fill.' },
  'accent-bg-active': { light: 'sky-900', dark: 'sky-500', note: 'Primary button pressed fill.' },
  'accent-subtle-bg': {
    light: 'sky-50',
    dark: 'sky-950',
    note: 'Selected row, active tab panel, accent callout fill.',
  },

  // --- Status. safe = on track · watch = conditions changing · critical = confirmed material
  //     disruption · unknown = insufficient fresh information. Colour is never the only signal:
  //     every status also carries a distinct icon shape and a text label (AGENTS.md §1.1, §7 floor).
  'status-safe-fg': { light: 'safe-700', dark: 'safe-400', note: 'Safe label text and glyph.' },
  'status-safe-bg': { light: 'safe-50', dark: 'safe-950', note: 'Safe pill and callout fill.' },
  'status-safe-border': {
    light: 'safe-500',
    dark: 'safe-500',
    note: 'Safe pill boundary and dot.',
  },
  'status-watch-fg': { light: 'watch-700', dark: 'watch-500', note: 'Watch label text and glyph.' },
  'status-watch-bg': { light: 'watch-50', dark: 'watch-950', note: 'Watch pill and callout fill.' },
  'status-watch-border': {
    light: 'watch-600',
    dark: 'watch-500',
    note: 'Watch pill boundary and dot. Light needs its own step; the seed amber measures 2.12:1 there.',
  },
  'status-critical-fg': {
    light: 'critical-700',
    dark: 'critical-400',
    note: 'Critical label text and glyph.',
  },
  'status-critical-bg': {
    light: 'critical-50',
    dark: 'critical-950',
    note: 'Critical pill and callout fill. Restrained: nothing may look alarmed that is not confirmed.',
  },
  'status-critical-border': {
    light: 'critical-500',
    dark: 'critical-500',
    note: 'Critical pill boundary and dot.',
  },
  'status-unknown-fg': {
    light: 'unknown-700',
    dark: 'unknown-400',
    note: 'Unknown label text and glyph. Neutral slate, never amber and never faded — a faded chip reads as "loading", which would be a lie.',
  },
  'status-unknown-bg': {
    light: 'unknown-50',
    dark: 'unknown-950',
    note: 'Unknown pill and callout fill.',
  },
  'status-unknown-border': {
    light: 'unknown-500',
    dark: 'unknown-500',
    note: 'Unknown pill boundary and dot.',
  },
})

export type SemanticColorName = keyof typeof semanticColors

export const semanticColorNames = Object.keys(semanticColors) as SemanticColorName[]

/**
 * Themed values that are not single opaque colours and therefore have no measurable ratio: a scrim
 * and two shadows. They are listed apart from semanticColors so that nothing unmeasurable can be
 * registered as a contrast pair by accident.
 */
export interface ThemedRaw {
  readonly light: string
  readonly dark: string
  readonly note: string
}

export const semanticRaw: Readonly<Record<string, ThemedRaw>> = {
  'surface-scrim': {
    light: 'rgb(5 11 22 / 0.56)',
    dark: 'rgb(5 11 22 / 0.72)',
    note: 'Dialog and drawer backdrop. Translucent, so it carries no contrast pair; the dialog surface beneath the text is what is measured.',
  },
  'shadow-elevated': {
    light: '0 1px 2px rgb(5 11 22 / 0.06), 0 8px 24px rgb(5 11 22 / 0.1)',
    dark: '0 1px 2px rgb(0 0 0 / 0.5), 0 8px 24px rgb(0 0 0 / 0.45)',
    note: 'Floating layers only. In dark mode elevation reads from surface tint plus hairline; the shadow only separates it from the page.',
  },
  'shadow-overlay': {
    light: '0 2px 4px rgb(5 11 22 / 0.08), 0 16px 40px rgb(5 11 22 / 0.14)',
    dark: '0 2px 4px rgb(0 0 0 / 0.55), 0 16px 40px rgb(0 0 0 / 0.5)',
    note: 'Dialog and drawer.',
  },
}

/**
 * Compatibility aliases for the names the pre-Phase-10 public pages already use
 * (apps/web/src/layouts/BaseLayout.astro, pages/*.astro — frontend-ui-engineer's files, rebuilt in
 * the next session). They are generated from the semantic map above, so they cannot drift from it.
 *
 * These are emitted as literal hexes rather than `var()` references for one concrete reason:
 * scripts/validate-contrast.mjs parses `--name: #hex;` declarations straight out of the generated
 * stylesheet and requires eleven of these names in both themes. A `var()` alias would be invisible
 * to it and the CI gate would fail with "missing token" rather than measure anything.
 */
export const legacyColorAliases: Readonly<Record<string, SemanticColorName>> = {
  background: 'surface-base',
  surface: 'surface-card',
  'surface-raised': 'surface-elevated',
  foreground: 'text-primary',
  muted: 'text-secondary',
  accent: 'text-accent',
  'accent-contrast': 'text-on-accent',
  'status-safe': 'status-safe-fg',
  'status-watch': 'status-watch-fg',
  'status-critical': 'status-critical-fg',
  'status-unknown': 'status-unknown-fg',
  border: 'border-hairline',
  'border-strong': 'border-emphasis',
}

/** The eleven names scripts/validate-contrast.mjs requires in both themes. */
export const contrastGateNames: readonly string[] = [
  'background',
  'surface',
  'surface-raised',
  'foreground',
  'muted',
  'accent',
  'accent-contrast',
  'status-safe',
  'status-watch',
  'status-critical',
  'status-unknown',
]

/** Compatibility aliases for non-colour names the same pages use. */
export const legacyScaleAliases: Readonly<Record<string, string>> = {
  radius: 'radius-dialog',
  'radius-sm': 'radius-card',
  'radius-lg': 'radius-dialog',
}
