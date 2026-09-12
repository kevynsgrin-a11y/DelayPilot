/**
 * The CSP boundary for props.
 *
 * `apps/web/public/_headers` serves `style-src 'self'` with no `'unsafe-inline'`, and that
 * directive governs the `style` ATTRIBUTE as well as the `<style>` element. Chromium refuses the
 * attribute outright — "Refused to apply inline style because it violates the following Content
 * Security Policy directive: style-src 'self'" — and an attribute value cannot be allowed by hash,
 * because the hash would have to be computed over content that changes on every render.
 *
 * So a primitive that emits `style=` emits a declaration the browser discards. That is not a
 * cosmetic loss. The ProgressBar fill was positioned by an inline custom property, which means that
 * under the policy the site actually serves, the meter rendered EMPTY at every reading.
 *
 * Every primitive therefore expresses its variable geometry as data attributes over a finite set,
 * class names, SVG presentation attributes (`width`, `height` and `fill` on an SVG shape are not
 * governed by `style-src`) or native HTML attributes — and refuses `style` in both directions:
 * `NoInlineStyle<T>` removes it from the prop type, and `withoutInlineStyle` removes it from a
 * spread at runtime, so an untyped caller cannot reintroduce one either.
 */

/** Native attributes minus the one the Content-Security-Policy forbids. */
export type NoInlineStyle<T> = Omit<T, 'style'>

/**
 * Drop `style` from a props spread. The type says it cannot be there; this makes it so at runtime
 * for callers who are not type-checked, and gives the test suite something it can actually assert.
 */
export function withoutInlineStyle<T extends object>(props: T): NoInlineStyle<T> {
  if (!('style' in props)) return props
  const { style: _style, ...rest } = props as T & { style?: unknown }
  return rest
}
