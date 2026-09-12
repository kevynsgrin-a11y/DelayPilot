/**
 * Class-name joining. One of the two shared helpers in this directory; the other is
 * no-inline-style.ts, which keeps the `style` attribute out of every rendered primitive.
 *
 * Primitives are behaviour plus tokens. They carry no product logic, no copy, no layout decision
 * and no fetch, so there is nothing else worth sharing between them.
 */
export function cx(...parts: readonly (string | false | null | undefined)[]): string {
  return parts
    .filter((part): part is string => typeof part === 'string' && part.length > 0)
    .join(' ')
}
