/**
 * The rights source registry, read at build time.
 *
 * `regulatory-source-steward` owns `data/rights/sources/registry.json` — 27 records, one per
 * registry id (`dot-refunds`, `eu-your-europe-air`, `uk-caa-delays`, …). Content frontmatter cites
 * those ids, and an article's source block has to render an AUTHORITY, the canonical address, and
 * the date the source was last verified — not an opaque slug.
 *
 * `lastVerifiedAt` IS RENDERED EVEN WHEN IT IS NULL, as "not yet verified". Every record in this
 * build carries `status: "unreachable"` and a null verification date, because no source could be
 * opened from this session (`EGRESS_BLOCKED`). Hiding that would present an unverified citation as
 * a verified one, which is the overclaim rule applied to sourcing (`AGENTS.md §1.1`, `§1.3`).
 *
 * A URL BECOMES A LINK ONLY WHEN THE REGISTRY RECORDS THE SOURCE AS REACHABLE. Until then the
 * address is rendered as text: a link the steward could not open is a citation nobody verified, and
 * a reader who follows it and lands on a 404 has been told something false about our process.
 */

import registry from '../../../../data/rights/sources/registry.json'

interface RegistryRecord {
  readonly id: string
  readonly authority: string
  readonly jurisdiction: string
  readonly canonicalUrl: string
  readonly lastVerifiedAt: string | null
  readonly status: string
}

const records = new Map<string, RegistryRecord>()
for (const record of registry.sources as readonly RegistryRecord[]) {
  records.set(record.id, record)
}

export interface ResolvedSource {
  readonly id: string
  /** The publishing authority, or the id unchanged when the registry has no record for it. */
  readonly label: string
  /** The canonical address, always rendered — as a link only when `href` is set. */
  readonly address: string | undefined
  /** Set only for a source the registry records as reachable. */
  readonly href: string | undefined
  /** The verification date, or `null`, which the caller renders as "not yet verified". */
  readonly lastVerifiedAt: string | null
  /** True when no registry record exists for this id at all. */
  readonly missing: boolean
}

export const registryVersion: string = registry.registryVersion

export function resolveSource(id: string): ResolvedSource {
  const record = records.get(id)
  if (record === undefined) {
    return {
      id,
      label: id,
      address: undefined,
      href: undefined,
      lastVerifiedAt: null,
      missing: true,
    }
  }

  const reachable = record.status === 'reachable'

  return {
    id,
    label: record.authority,
    address: record.canonicalUrl,
    href: reachable ? record.canonicalUrl : undefined,
    lastVerifiedAt: record.lastVerifiedAt,
    missing: false,
  }
}

export const resolveSources = (ids: readonly string[]): readonly ResolvedSource[] =>
  ids.map(resolveSource)
