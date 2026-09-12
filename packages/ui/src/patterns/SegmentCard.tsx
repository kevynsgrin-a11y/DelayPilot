/**
 * SegmentCard — one flight leg.
 *
 * `DIRECTIVE.md §18.5` fixes the fields: airline + flight number · origin/destination · scheduled
 * vs current times, each labelled with airport code and IANA zone · status · gate/terminal when
 * licensed data supplies them · delay minutes · provider source · last updated (age) · confidence
 * Low/Medium/High · expandable operational detail.
 *
 * Four things this component refuses to do, each of which is the cheap version of one of them:
 *
 * 1. **Print a gate that was not supplied.** `gate` and `terminal` are `Maybe`, so the absent case
 *    renders the reason ("The gate has not been published.") and cannot render a blank.
 * 2. **Present an estimate as an actual.** `current.estimated` renders the word "estimated" beside
 *    the time; a reader must be able to tell the two apart without hovering anything.
 * 3. **Blend the two providers when they disagree.** `conflicting` renders BOTH snapshots, names
 *    the newest high-quality source, and the caller lowers confidence. It never picks a winner
 *    silently (`DIRECTIVE.md §17`).
 * 4. **Confuse leg delay with journey delay.** The figure here is the DEPARTURE delay of this leg,
 *    `(actualOrEstimatedDeparture − scheduledDeparture)/60000`, and it is labelled as such by the
 *    caller's copy. The delay to the final destination is the journey's, and it is not this card's.
 *
 * No motion: a segment card is a data-bearing component, and ADR 0003 rule 1 excludes every one of
 * those from the marketing-motion allowance.
 */

import type { JSX } from 'react'
import { Card } from '../primitives/Card.tsx'
import { Disclosure } from '../primitives/Disclosure.tsx'
import { StatusPill } from '../primitives/StatusPill.tsx'
import { ProvenanceChip } from '../primitives/ProvenanceChip.tsx'
import type { InterimStatusTone } from '../tokens/interim-contracts.ts'
import { DefinitionRow, MaybeValue, ZonedTimeView } from './atoms.tsx'
import { crossesLocalDate } from './time.ts'
import type { Confidence, Segment, SegmentStatus } from './types.ts'

/** Status → tone. `unknown` is its own tone, never silently folded into `scheduled`. */
const STATUS_TONE: Readonly<Record<SegmentStatus, InterimStatusTone>> = {
  scheduled: 'safe',
  delayed: 'watch',
  canceled: 'critical',
  diverted: 'critical',
  returned: 'critical',
  departed: 'safe',
  landed: 'safe',
  unknown: 'unknown',
}

export interface SegmentCardCopy {
  readonly scheduledLabel: string
  readonly currentLabel: string
  readonly statusLabel: string
  readonly delayLabel: string
  readonly gateLabel: string
  readonly terminalLabel: string
  readonly sourceLabel: string
  readonly confidenceLabel: string
  readonly detailSummary: string
  readonly zoneLabel: string
  readonly estimatedLabel: string
  readonly departsLabel: string
  readonly arrivesLabel: string
  readonly nextDayLabel: string
  readonly conflictHeading: string
  readonly conflictNewestLabel: string
  readonly statusText: (status: SegmentStatus) => string
  readonly confidenceText: (confidence: Confidence) => string
  readonly delayText: (minutes: number) => string
}

export interface SegmentCardProps {
  readonly segment: Segment
  readonly copy: SegmentCardCopy
  /** Heading level so the card sits correctly under the section it is rendered in. */
  readonly headingLevel?: 2 | 3 | 4
  readonly className?: string
}

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export function SegmentCard({
  segment,
  copy,
  headingLevel = 3,
  className,
}: SegmentCardProps): JSX.Element {
  const Heading = HEADING_TAG[headingLevel]
  const headingId = `segment-${segment.id}-title`
  const overnight = crossesLocalDate(segment.origin.scheduled, segment.destination.scheduled)

  return (
    <Card as="article" aria-labelledby={headingId} className={`dpp-segment ${className ?? ''}`}>
      <header className="dpp-segment__header">
        <Heading className="dpp-segment__title" id={headingId}>
          <span className="dpp-segment__airline">{segment.airline}</span>{' '}
          <span className="dpp-segment__flight tnum">{segment.flightNumber}</span>
        </Heading>
        <StatusPill
          status={STATUS_TONE[segment.status]}
          label={copy.statusText(segment.status)}
          detail={copy.statusLabel}
        />
      </header>

      <p className="dpp-segment__route">
        <span className="dpp-segment__endpoint">
          <span className="dpp-segment__code tnum">{segment.origin.code}</span>
          <span className="dpp-segment__place">{segment.origin.name}</span>
        </span>
        <span className="dpp-segment__arrow" aria-hidden="true">
          &rarr;
        </span>
        <span className="dpp-segment__endpoint">
          <span className="dpp-segment__code tnum">{segment.destination.code}</span>
          <span className="dpp-segment__place">{segment.destination.name}</span>
        </span>
      </p>

      <dl className="dpp-segment__times">
        <DefinitionRow label={`${copy.departsLabel} · ${copy.scheduledLabel}`}>
          <ZonedTimeView time={segment.origin.scheduled} zoneLabel={copy.zoneLabel} withDate />
        </DefinitionRow>
        <DefinitionRow label={`${copy.departsLabel} · ${copy.currentLabel}`}>
          <MaybeValue
            value={segment.origin.current}
            render={(current) => (
              <ZonedTimeView
                time={current.time}
                estimated={current.estimated}
                estimatedLabel={copy.estimatedLabel}
                zoneLabel={copy.zoneLabel}
                withDate
              />
            )}
          />
        </DefinitionRow>
        <DefinitionRow
          label={`${copy.arrivesLabel} · ${copy.scheduledLabel}`}
          {...(overnight ? { note: copy.nextDayLabel } : {})}
        >
          <ZonedTimeView time={segment.destination.scheduled} zoneLabel={copy.zoneLabel} withDate />
        </DefinitionRow>
        <DefinitionRow label={`${copy.arrivesLabel} · ${copy.currentLabel}`}>
          <MaybeValue
            value={segment.destination.current}
            render={(current) => (
              <ZonedTimeView
                time={current.time}
                estimated={current.estimated}
                estimatedLabel={copy.estimatedLabel}
                zoneLabel={copy.zoneLabel}
                withDate
              />
            )}
          />
        </DefinitionRow>
      </dl>

      <dl className="dpp-segment__facts">
        <DefinitionRow label={copy.delayLabel}>
          <MaybeValue
            className="tnum"
            value={segment.departureDelayMinutes}
            render={(minutes) => copy.delayText(minutes)}
          />
        </DefinitionRow>
        <DefinitionRow label={copy.gateLabel}>
          <MaybeValue value={segment.gate} render={(gate) => gate} />
        </DefinitionRow>
        <DefinitionRow label={copy.terminalLabel}>
          <MaybeValue value={segment.terminal} render={(terminal) => terminal} />
        </DefinitionRow>
        <DefinitionRow label={copy.sourceLabel}>
          <span>{segment.source}</span>
        </DefinitionRow>
        <DefinitionRow label={copy.confidenceLabel}>
          <span>{copy.confidenceText(segment.confidence)}</span>
        </DefinitionRow>
      </dl>

      <div className="dpp-segment__provenance">
        <ProvenanceChip
          kind={segment.provenance.kind}
          {...(segment.provenance.freshness === undefined
            ? {}
            : { freshness: segment.provenance.freshness })}
        />
      </div>

      {segment.conflicting === undefined ? null : (
        <div className="dpp-segment__conflict">
          <p className="dpp-segment__conflict-heading">{copy.conflictHeading}</p>
          <dl className="dpp-segment__facts">
            <DefinitionRow label={segment.source}>
              <span>{copy.statusText(segment.status)}</span>
            </DefinitionRow>
            <DefinitionRow label={segment.conflicting.source} note={segment.conflicting.freshness}>
              <span>{copy.statusText(segment.conflicting.status)}</span>
            </DefinitionRow>
            <DefinitionRow label={copy.conflictNewestLabel}>
              <span>{segment.conflicting.newestSource}</span>
            </DefinitionRow>
          </dl>
        </div>
      )}

      <Disclosure summary={copy.detailSummary} className="dpp-segment__detail">
        <dl className="dpp-segment__facts">
          {segment.operationalDetail.map((row) => (
            <DefinitionRow key={row.label} label={row.label}>
              <MaybeValue value={row.value} render={(value) => value} />
            </DefinitionRow>
          ))}
          <DefinitionRow label={`${copy.departsLabel} · ${copy.zoneLabel}`}>
            <span>{segment.origin.scheduled.zone}</span>
          </DefinitionRow>
          <DefinitionRow label={`${copy.arrivesLabel} · ${copy.zoneLabel}`}>
            <span>{segment.destination.scheduled.zone}</span>
          </DefinitionRow>
        </dl>
      </Disclosure>
    </Card>
  )
}
