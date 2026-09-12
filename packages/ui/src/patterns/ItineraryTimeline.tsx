/**
 * ItineraryTimeline — the journey at a glance.
 *
 * `DIRECTIVE.md §18.5` asks for a horizontal itinerary on desktop and a vertical timeline on
 * mobile. That is ONE ordered list in the DOM and two CSS layouts, not two component trees: a
 * screen reader and a keyboard walk must traverse the journey in the order it is flown whatever the
 * viewport, and duplicating the markup is how the two orders drift apart (`DIRECTIVE.md §7`,
 * "screen-reader-sane itinerary order").
 *
 * Every stop carries its airport code, its name, and — where a time is shown — the airport code and
 * IANA zone of that time (`AGENTS.md §3.3`). The connecting edge between two stops carries the
 * connection's band as a WORD, never as a colour alone.
 */

import type { JSX } from 'react'
import { StatusPill } from '../primitives/StatusPill.tsx'
import { ZonedTimeView } from './atoms.tsx'
import { bandToStatusTone, type Band, type ZonedTime } from './types.ts'

export interface ItineraryStop {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly time: ZonedTime
  /** Copy: whether this stop is a departure, a connection or an arrival. */
  readonly roleLabel: string
}

export interface ItineraryLeg {
  readonly id: string
  readonly flightNumber: string
  readonly airline: string
  readonly statusLabel: string
  readonly band: Band
}

export interface ItineraryTimelineCopy {
  readonly label: string
  readonly zoneLabel: string
  readonly bandLabel: (band: Band) => string
}

export interface ItineraryTimelineProps {
  readonly stops: readonly ItineraryStop[]
  /** One fewer than `stops`: the leg flown between stop n and stop n+1. */
  readonly legs: readonly ItineraryLeg[]
  readonly copy: ItineraryTimelineCopy
  readonly className?: string
}

export function ItineraryTimeline({
  stops,
  legs,
  copy,
  className,
}: ItineraryTimelineProps): JSX.Element {
  return (
    <ol className={`dpp-itinerary ${className ?? ''}`} aria-label={copy.label}>
      {stops.map((stop, index) => {
        const leg = index < legs.length ? legs[index] : undefined
        return (
          <li key={stop.id} className="dpp-itinerary__stop">
            <p className="dpp-itinerary__role">{stop.roleLabel}</p>
            <p className="dpp-itinerary__code tnum">{stop.code}</p>
            <p className="dpp-itinerary__place">{stop.name}</p>
            <ZonedTimeView time={stop.time} zoneLabel={copy.zoneLabel} withDate />
            {leg === undefined ? null : (
              <p className="dpp-itinerary__leg">
                <span className="dpp-itinerary__leg-flight tnum">{leg.flightNumber}</span>
                <span className="dpp-itinerary__leg-airline">{leg.airline}</span>
                <StatusPill
                  status={bandToStatusTone[leg.band]}
                  label={copy.bandLabel(leg.band)}
                  detail={leg.statusLabel}
                />
              </p>
            )}
          </li>
        )
      })}
    </ol>
  )
}
