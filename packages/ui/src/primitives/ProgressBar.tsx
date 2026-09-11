/**
 * ProgressBar — a linear meter.
 *
 * Never a speedometer, never a gauge, never a dial (`DIRECTIVE.md §18.5`). A needle on an arc
 * implies a precision the connection engine does not have, and the moment a traveler reads "72%"
 * off a dial we have published an uncalibrated number.
 *
 * THREE SIGNALS, none of them optional, the same contract StatusPill sets:
 *
 *   1. `valueText` — the reading in words, rendered as VISIBLE text. `aria-valuetext` alone is not
 *      enough: it is exposed to assistive technology and to nothing else, so a sighted reader was
 *      left with a coloured bar and no number (`docs/ACCESSIBILITY.md` B3).
 *   2. `bandLabel` — the band as a word, beside a band-shaped glyph. Hue is the reinforcement, never
 *      the signal (`DIRECTIVE.md §7`, "never colour alone").
 *   3. The track outline, which is what the fill is read against.
 *
 * The fill takes a NAMED BAND — safe, watch, critical, unknown — not a continuous gradient. There
 * is no indeterminate variant: an indeterminate bar loops, and loops are forbidden inside
 * data-bearing components.
 *
 * `role="progressbar"` has presentational children in WAI-ARIA 1.2, so the visible readout inside it
 * is shown to the eye without being announced a second time; assistive technology reads `aria-label`
 * and `aria-valuetext`, which carry the same strings.
 */

import type { CSSProperties, JSX } from 'react'
import { cx } from './class-names.ts'
import { Icon, type IconName } from './Icon.tsx'
import type { InterimStatusTone } from '../tokens/interim-contracts.ts'

const BAND_ICON: Readonly<Record<InterimStatusTone, IconName>> = {
  safe: 'status-safe',
  watch: 'status-watch',
  critical: 'status-critical',
  unknown: 'status-unknown',
}

export interface ProgressBarProps {
  readonly value: number
  readonly min?: number
  readonly max?: number
  /** Accessible name, e.g. "Connection slack used". */
  readonly label: string
  /**
   * The reading in words, e.g. "18 of 45 minutes". Rendered as visible text AND as
   * `aria-valuetext`. Required: a meter with no number is a bar of indeterminate extent.
   */
  readonly valueText: string
  /** Which named band this reading falls in. Drives the glyph and the fill tone. */
  readonly band?: InterimStatusTone
  /**
   * The band as a visible word, e.g. "Watch". Required, and it is copy, so the caller supplies it:
   * the band must never be carried by hue alone.
   */
  readonly bandLabel: string
  readonly className?: string
}

export function ProgressBar({
  value,
  min = 0,
  max = 100,
  label,
  valueText,
  band = 'unknown',
  bandLabel,
  className,
}: ProgressBarProps): JSX.Element {
  const span = max - min
  const clamped = Math.min(Math.max(value, min), max)
  const fraction = span <= 0 ? 0 : (clamped - min) / span

  return (
    <div
      className={cx('dp-progress', `dp-progress--${band}`, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={clamped}
      aria-valuetext={valueText}
    >
      <p className="dp-progress__readout">
        <span className="dp-progress__value">{valueText}</span>
        <span className="dp-progress__band">
          <Icon name={BAND_ICON[band]} decorative className="dp-progress__band-icon" />
          {bandLabel}
        </span>
      </p>
      <span className="dp-progress__track">
        <span
          className="dp-progress__fill"
          style={{ '--dp-progress-fraction': fraction } as CSSProperties}
        />
      </span>
    </div>
  )
}
