/**
 * BandMeter — a labelled LINEAR meter with named band stops.
 *
 * Never a speedometer, gauge, dial, needle or ring percentage. `DIRECTIVE.md §18.5` bans the shape
 * outright, and the reason is not aesthetic: the connection engine emits a qualitative band because
 * no calibrated distribution exists (`DIRECTIVE.md §13`), and an arc with a needle asserts a
 * precision that nothing in the payload supports. A traveler who reads "72%" off a dial has been
 * handed a number this product cannot stand behind.
 *
 * What it renders instead:
 *   · the `ProgressBar` primitive — a linear track with a visible readout and a required band word;
 *   · a `Heuristic risk band` provenance chip whenever no calibrated model produced the band;
 *   · the four named band stops as visible text, with the current one marked by a word AND a
 *     silhouette, never by colour alone (`DIRECTIVE.md §7`).
 *
 * A percentage may be rendered here only when the payload marks its distribution calibrated. The
 * `calibrated` prop is typed `false` for exactly that reason: today there is no artifact, so the
 * type refuses the other value rather than leaving it to a review to notice.
 */

import type { JSX } from 'react'
import { Icon } from '../primitives/Icon.tsx'
import { ProgressBar } from '../primitives/ProgressBar.tsx'
import { ProvenanceChip } from '../primitives/ProvenanceChip.tsx'
import { VisuallyHidden } from '../primitives/VisuallyHidden.tsx'
import { bands, bandToStatusTone, type Band } from './types.ts'

const STOP_ICON = {
  on_track: 'status-safe',
  watch: 'status-watch',
  at_risk: 'status-critical',
  disrupted: 'status-critical',
  unknown: 'status-unknown',
} as const

export interface BandMeterProps {
  readonly band: Band
  /** Accessible name of the meter, e.g. "Connection time required against time available". */
  readonly label: string
  /** The reading in words, e.g. "44 minutes needed of 51 available". Copy. */
  readonly valueText: string
  /** The band as a word, e.g. "Watch". Copy — it must never be carried by hue alone. */
  readonly bandLabel: string
  /** Band words for the four stops, in `bands` order. Copy. */
  readonly stopLabels: Readonly<Record<Band, string>>
  /** Visible label for the stop scale, e.g. "Band scale". */
  readonly scaleLabel: string
  /** Announced for the current stop, e.g. "current band". */
  readonly currentStopLabel: string
  /**
   * `true` only when the payload marks the distribution calibrated. Typed `false` because no
   * calibrated artifact is deployed; when one is, widen this and the caller may pass a probability.
   */
  readonly calibrated: false
  /** Copy for the `Heuristic risk band` chip's freshness slot, e.g. "No calibrated model". */
  readonly heuristicNote?: string
  /**
   * Meter extent. Omit either one and the meter draws NO FILL and omits `aria-valuenow` — the
   * WAI-ARIA indeterminate form — while keeping the track, the readout and `aria-valuetext`. The
   * unknown state is therefore the same component in a different state, not a different component,
   * which is what makes it impossible to ship an unknown that renders as a blank.
   */
  readonly value?: number
  readonly max?: number
  readonly className?: string
}

export function BandMeter({
  band,
  label,
  valueText,
  bandLabel,
  stopLabels,
  scaleLabel,
  currentStopLabel,
  heuristicNote,
  value,
  max,
  className,
}: BandMeterProps): JSX.Element {
  const measurable = value !== undefined && max !== undefined && max > 0

  return (
    <div className={`dpp-band ${className ?? ''}`}>
      <ProgressBar
        value={measurable ? Math.min(value, max) : null}
        max={measurable ? max : 100}
        label={label}
        valueText={valueText}
        band={bandToStatusTone[band]}
        bandLabel={bandLabel}
      />

      <p className="dpp-band__provenance">
        {/* No calibrated model is deployed, so every band on this surface is heuristic. */}
        <ProvenanceChip
          kind="heuristic"
          {...(heuristicNote === undefined ? {} : { freshness: heuristicNote })}
        />
      </p>

      <ul className="dpp-band__stops" aria-label={scaleLabel}>
        {bands
          .filter((stop) => stop !== 'unknown' || band === 'unknown')
          .map((stop) => (
            <li
              key={stop}
              className="dpp-band__stop"
              data-band={stop}
              data-current={stop === band ? 'true' : 'false'}
            >
              <Icon name={STOP_ICON[stop]} decorative className="dpp-band__stop-icon" />
              <span className="dpp-band__stop-label">{stopLabels[stop]}</span>
              {stop === band ? <VisuallyHidden>{currentStopLabel}</VisuallyHidden> : null}
            </li>
          ))}
      </ul>
    </div>
  )
}
