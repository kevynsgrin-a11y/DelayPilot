/**
 * ProgressBar — a linear meter.
 *
 * Never a speedometer, never a gauge, never a dial (`DIRECTIVE.md §18.5`). A needle on an arc
 * implies a precision the connection engine does not have, and the moment a traveler reads "72%"
 * off a dial we have published an uncalibrated number.
 *
 * The fill takes a NAMED BAND — safe, watch, critical, unknown — not a continuous gradient, and
 * `valueText` is required so the meter is always readable as words. There is no indeterminate
 * variant: an indeterminate bar loops, and loops are forbidden inside data-bearing components.
 */

import type { CSSProperties, JSX } from 'react'
import { cx } from './class-names.ts'
import type { InterimStatusTone } from '../tokens/interim-contracts.ts'

export interface ProgressBarProps {
  readonly value: number
  readonly min?: number
  readonly max?: number
  /** Accessible name, e.g. "Connection slack used". */
  readonly label: string
  /** The value in words, e.g. "18 of 45 minutes". Announced instead of a bare percentage. */
  readonly valueText: string
  /** Which named band this reading falls in. Determines the fill tone only. */
  readonly band?: InterimStatusTone
  readonly className?: string
}

export function ProgressBar({
  value,
  min = 0,
  max = 100,
  label,
  valueText,
  band = 'unknown',
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
      <span className="dp-progress__track">
        <span
          className="dp-progress__fill"
          style={{ '--dp-progress-fraction': fraction } as CSSProperties}
        />
      </span>
    </div>
  )
}
