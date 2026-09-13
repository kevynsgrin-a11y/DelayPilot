/**
 * SourceFreshnessPanel — where every figure on this surface came from, and how old it is.
 *
 * `DIRECTIVE.md §18.5` places it near the end of the cockpit, after the action area. Its job is to
 * make `AGENTS.md §1.2` inspectable in one place: one row per source, each with its provenance chip
 * and its freshness sentence, so a traveler can see at a glance that the status is four minutes old
 * and the rights rule set is a demo one.
 *
 * All six provenance labels can appear here, and the panel is the surface that proves it: the six
 * are exactly `Live`, `Cached`, `Stale`, `Demo`, `Unavailable`, `Heuristic risk band`. A seventh is
 * a defect, which is why the kind is typed by `interim-contracts.ts` rather than by a string.
 */

import type { JSX } from 'react'
import { Card } from '../primitives/Card.tsx'
import { ProvenanceChip } from '../primitives/ProvenanceChip.tsx'
import type { InterimProvenanceKind } from '../tokens/interim-contracts.ts'

export interface SourceFreshnessRow {
  readonly id: string
  /** What this source supplies, e.g. "Flight status". Copy. */
  readonly subject: string
  /** Named source, e.g. "Fixture provider". */
  readonly source: string
  readonly kind: InterimProvenanceKind
  /** "Updated 6 minutes ago from [source]" — composed by the caller. */
  readonly freshness: string
  /** One sentence explaining what the chip means here. Copy. */
  readonly meaning: string
  /**
   * This row's value came from a fixture, whatever word its chip carries.
   *
   * The row-level spelling of `Provenance.fixture` (`types.ts`) — this panel takes rows rather than
   * a `Provenance`, and the demonstration's own row set proves why the flag has to be independent
   * of `kind`: one row is `stale` and one is `heuristic`, both over the same fixture
   * (`docs/VOICE.md §2.1`).
   */
  readonly fixture?: true
}

export interface SourceFreshnessPanelCopy {
  readonly heading: string
  readonly subjectLabel: string
  readonly sourceLabel: string
  readonly stateLabel: string
  readonly demoCaption?: string
}

export interface SourceFreshnessPanelProps {
  readonly rows: readonly SourceFreshnessRow[]
  readonly copy: SourceFreshnessPanelCopy
  readonly headingLevel?: 2 | 3 | 4
  readonly idPrefix: string
  readonly className?: string
}

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export function SourceFreshnessPanel({
  rows,
  copy,
  headingLevel = 3,
  idPrefix,
  className,
}: SourceFreshnessPanelProps): JSX.Element {
  const Heading = HEADING_TAG[headingLevel]
  const headingId = `${idPrefix}-freshness-title`
  /* Fixture-backed by the ROWS, never by whether a caption was passed. See `AlertTimeline`. */
  const fixtureSourced = rows.some((row) => row.kind === 'demo' || row.fixture === true)

  return (
    <Card as="section" aria-labelledby={headingId} className={`dpp-freshness ${className ?? ''}`}>
      <Heading className="dpp-freshness__title" id={headingId}>
        {copy.heading}
      </Heading>
      <ul className="dpp-freshness__list">
        {rows.map((row) => (
          <li key={row.id} className="dpp-freshness__row">
            <p className="dpp-freshness__subject">{row.subject}</p>
            <ProvenanceChip kind={row.kind} freshness={row.freshness} />
            <p className="dpp-freshness__meaning">{row.meaning}</p>
            <p className="dpp-freshness__source">
              <span className="dpp-row__label">{copy.sourceLabel}</span> {row.source}
            </p>
          </li>
        ))}
      </ul>
      {fixtureSourced ? (
        <div className="dpp-freshness__provenance" data-fixture="true">
          {copy.demoCaption === undefined ? null : (
            <p className="dpp-provenance__demo">{copy.demoCaption}</p>
          )}
        </div>
      ) : null}
    </Card>
  )
}
