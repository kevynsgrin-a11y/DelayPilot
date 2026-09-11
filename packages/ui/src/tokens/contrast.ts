/**
 * WCAG 2.2 contrast arithmetic.
 *
 * `DIRECTIVE.md §7` sets a WCAG 2.2 AA floor and the Phase 9 exit gate requires every token pair to
 * be *measured* in both themes rather than judged by eye. This module is the measurement: relative
 * luminance from sRGB per WCAG 2.2 "relative luminance", and the contrast ratio
 * `(L1 + 0.05) / (L2 + 0.05)`.
 *
 * Source: W3C WCAG 2.2 Recommendation, definitions of *relative luminance* and *contrast ratio*
 * (https://www.w3.org/TR/WCAG22/#dfn-relative-luminance, #dfn-contrast-ratio). The same arithmetic
 * is implemented independently in scripts/validate-contrast.mjs, which gates CI against the
 * generated stylesheet; two implementations agreeing on the same numbers is the point.
 */

/** A six-digit lowercase sRGB hex. Alpha is deliberately unrepresentable: a translucent value has * no single measurable ratio. */
export type Hex = `#${string}`

const HEX_PATTERN = /^#[0-9a-f]{6}$/

/** Throws on anything that is not a six-digit lowercase hex, so an unmeasurable value cannot enter the system. */
export function assertHex(value: string): Hex {
  if (!HEX_PATTERN.test(value)) {
    throw new Error(
      `Not a six-digit lowercase sRGB hex: ${JSON.stringify(value)}. ` +
        `Translucent and shorthand colours cannot be measured against a threshold.`,
    )
  }
  return value as Hex
}

/** Channel components 0-255. */
export function toRgb(hex: Hex): readonly [number, number, number] {
  assertHex(hex)
  const r = Number.parseInt(hex.slice(1, 3), 16)
  const g = Number.parseInt(hex.slice(3, 5), 16)
  const b = Number.parseInt(hex.slice(5, 7), 16)
  return [r, g, b]
}

/** WCAG 2.2 sRGB channel linearisation. */
function linearise(channel8Bit: number): number {
  const c = channel8Bit / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/** WCAG 2.2 relative luminance, 0 (black) to 1 (white). */
export function relativeLuminance(hex: Hex): number {
  const [r, g, b] = toRgb(hex)
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b)
}

/** WCAG 2.2 contrast ratio, 1 to 21. Order-independent. */
export function contrastRatio(a: Hex, b: Hex): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const [hi, lo] = la > lb ? [la, lb] : [lb, la]
  return (hi + 0.05) / (lo + 0.05)
}

/** Ratios are reported truncated, never rounded up: 4.499 must not print as "4.50" beside a 4.5 threshold. */
export function formatRatio(ratio: number): string {
  return (Math.floor(ratio * 100) / 100).toFixed(2)
}
