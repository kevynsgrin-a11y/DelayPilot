/**
 * AlertTimeline — the monitoring record, oldest first.
 *
 * `DIRECTIVE.md §28` requires the demo to show an alert timeline, and `§16` fixes the four
 * severities — `info`, `watch`, `urgent`, `resolved` — which map onto the same four status tones
 * rather than onto a fifth colour (`packages/ui/src/tokens/interim-contracts.ts`).
 *
 * It is an ordered list, and it stays an ordered list: no auto-advance, no pulse on a `watch` or
 * `urgent` row, no motion on re-render. ADR 0003 rule 3 forbids all three, and a notification
 * history that animates is a notification history a traveler cannot read on a moving train.
 *
 * Every row carries its own provenance chip. An alert about a flight is a claim about a flight, and
 * a claim without its source is the thing `AGENTS.md §1.2` exists to prevent.
 */

import type { JSX } from 'react'
import { Card } from '../primitives/Card.tsx'
import { ProvenanceChip } from '../primitives/ProvenanceChip.tsx'
import { StatusPill } from '../primitives/StatusPill.tsx'
import { severityToStatusTone, type InterimSeverity } from '../tokens/interim-contracts.ts'
import { ZonedTimeView } from './atoms.tsx'
import type { AlertEvent } from './types.ts'

export interface AlertTimelineCopy {
  readonly heading: string
  readonly severityLabel: Readonly<Record<InterimSeverity, string>>
  readonly zoneLabel: string
  readonly emptyLabel: string
  readonly demoCaption?: string
}

export interface AlertTimelineProps {
  readonly events: readonly AlertEvent[]
  readonly copy: AlertTimelineCopy
  readonly headingLevel?: 2 | 3 | 4
  readonly idPrefix: string
  readonly className?: string
}

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export function AlertTimeline({
  events,
  copy,
  headingLevel = 3,
  idPrefix,
  className,
}: AlertTimelineProps): JSX.Element {
  const Heading = HEADING_TAG[headingLevel]
  const headingId = `${idPrefix}-alerts-title`

  return (
    <Card as="section" aria-labelledby={headingId} className={`dpp-alerts ${className ?? ''}`}>
      <Heading className="dpp-alerts__title" id={headingId}>
        {copy.heading}
      </Heading>

      {events.length === 0 ? (
        <p className="dpp-alerts__empty">{copy.emptyLabel}</p>
      ) : (
        <ol className="dpp-alerts__list">
          {events.map((event) => (
            <li key={event.id} className="dpp-alerts__item" data-severity={event.severity}>
              <div className="dpp-alerts__head">
                <StatusPill
                  status={severityToStatusTone[event.severity]}
                  label={copy.severityLabel[event.severity]}
                />
                <ZonedTimeView time={event.at} zoneLabel={copy.zoneLabel} withDate />
              </div>
              <p className="dpp-alerts__event-title">{event.title}</p>
              <p className="dpp-alerts__event-detail">{event.detail}</p>
              <ProvenanceChip
                kind={event.provenance.kind}
                {...(event.provenance.freshness === undefined
                  ? {}
                  : { freshness: event.provenance.freshness })}
              />
            </li>
          ))}
        </ol>
      )}

      {copy.demoCaption === undefined ? null : (
        <p className="dpp-provenance__demo">{copy.demoCaption}</p>
      )}
    </Card>
  )
}
