/**
 * INTERIM TYPES — to be replaced by `packages/contracts`.
 *
 * `packages/contracts` is Phase 2 work owned by `principal-architect` and does not exist yet, but
 * the primitives in this package need to name a status tone, a severity and a provenance variant at
 * the type level today. `AGENTS.md §5.1` forbids inventing a parallel shape for an upstream
 * contract, so these are declared here as narrowly as possible, exported only for this package's
 * own primitives, and marked for deletion.
 *
 * HANDOFF FILED: `to: principal-architect` — publish `StatusTone`, `Severity` and `ProvenanceKind`
 * from `packages/contracts` in Phase 2. When they land, delete this file and re-point
 * `packages/ui/src/primitives/**` at the contract. Nothing here may be re-exported as a public API
 * of a second package in the meantime.
 *
 * The values themselves are not invented: the four status tones are the `DIRECTIVE.md §7` /
 * `§27` result states, the four severities are `DIRECTIVE.md §16`, and the six provenance labels are
 * transcribed verbatim from the `AGENTS.md §1.2` table, which fixes them as exactly six with no
 * synonyms, no softening and no icon-only variant.
 */

/** `safe` on track · `watch` conditions changing · `critical` confirmed material disruption · `unknown` insufficient fresh information. */
export type InterimStatusTone = 'safe' | 'watch' | 'critical' | 'unknown'

export const interimStatusTones: readonly InterimStatusTone[] = [
  'safe',
  'watch',
  'critical',
  'unknown',
]

/** `DIRECTIVE.md §16` notification severity. Maps onto the four status tones — never a fifth colour. */
export type InterimSeverity = 'info' | 'watch' | 'urgent' | 'resolved'

export const interimSeverities: readonly InterimSeverity[] = ['info', 'watch', 'urgent', 'resolved']

/** The severity → status-tone mapping the token layer encodes. */
export const severityToStatusTone: Readonly<Record<InterimSeverity, InterimStatusTone>> = {
  info: 'unknown',
  watch: 'watch',
  urgent: 'critical',
  resolved: 'safe',
}

/** The six provenance variants of `AGENTS.md §1.2`. Exactly six; adding a seventh is a defect. */
export type InterimProvenanceKind =
  'live' | 'cached' | 'stale' | 'demo' | 'unavailable' | 'heuristic'

export const interimProvenanceKinds: readonly InterimProvenanceKind[] = [
  'live',
  'cached',
  'stale',
  'demo',
  'unavailable',
  'heuristic',
]

/**
 * The visible chip text, transcribed from the `AGENTS.md §1.2` table. Every chip renders its label
 * as text; there is no icon-only variant and no synonym.
 */
export const provenanceLabels: Readonly<Record<InterimProvenanceKind, string>> = {
  live: 'Live',
  cached: 'Cached',
  stale: 'Stale',
  demo: 'Demo',
  unavailable: 'Unavailable',
  heuristic: 'Heuristic risk band',
}
