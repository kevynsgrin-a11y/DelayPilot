/**
 * ProgressBar — a linear meter.
 *
 * Never a speedometer, never a gauge, never a dial (`DIRECTIVE.md §18.5`). A needle on an arc
 * implies a precision the connection engine does not have, and the moment a traveler reads "72%"
 * off a dial we have published an uncalibrated number.
 *
 * THREE SIGNALS, none of them optional, the same contract StatusPill sets:
 *
 *   1. `valueText` — the reading in words, VISIBLE and in `aria-valuetext`. An attribute alone is
 *      exposed to assistive technology and to nothing else, so a sighted reader was left with a
 *      coloured bar and no number (`docs/ACCESSIBILITY.md` B3).
 *   2. `bandLabel` — the band as a word, VISIBLE beside a band-shaped glyph and in
 *      `aria-valuetext`. Hue is the reinforcement, never the signal (`DIRECTIVE.md §7`, "never
 *      colour alone"); an unannounced word is the same failure in the other direction (B7).
 *   3. The track outline, which is what the fill is read against.
 *
 * The fill takes a NAMED BAND — safe, watch, critical, unknown — not a continuous gradient. There
 * is no indeterminate variant: an indeterminate bar loops, and loops are forbidden inside
 * data-bearing components.
 *
 * WHY THE FILL IS AN SVG RECT. The extent used to be an inline `style` setting a custom property,
 * and the site serves `style-src 'self'` with no `'unsafe-inline'` (apps/web/public/_headers), so
 * the browser discarded that declaration and the meter rendered EMPTY at every reading — the B2 and
 * B3 fixes were invisible on the real site. `width` on an SVG `<rect>` is a presentation attribute,
 * which `style-src` does not govern, so the extent survives the policy. The `<svg>` is inside the
 * presentational subtree of `role="progressbar"` and is `aria-hidden` besides. Nothing about the
 * reading is carried by it: the number a reader gets is `valueText`, in text (`DIRECTIVE.md §18.5`
 * — no percentage is rendered anywhere on this meter, in any channel).
 *
 * WHY `aria-valuetext` CARRIES BOTH STRINGS. `role="progressbar"` has presentational children in
 * WAI-ARIA 1.2: everything inside this element is dropped from the accessibility tree. The visible
 * readout is therefore for the eye only, and anything it says has to be said again in an attribute
 * or it is said to no one — which is exactly how `bandLabel`, a required prop and the
 * recommended-action signal on a slack meter, reached nobody (`docs/ACCESSIBILITY.md` B7).
 * `aria-valuetext` is the reading and the band, in that order: "18 of 45 minutes, Watch".
 *
 * The alternative — moving the readout outside the progressbar and pointing `aria-describedby` at
 * it — was not taken. It forces a choice between announcing the value twice (once as
 * `aria-valuetext`, once as description text) and dropping `aria-valuetext` altogether, at which
 * point assistive technology computes and announces a PERCENTAGE from valuenow/valuemin/valuemax.
 * A spoken "40 percent" is the same published-precision defect as a dial, and this primitive exists
 * to refuse it (`DIRECTIVE.md §18.5`).
 *
 * AN UNKNOWN READING IS `value={null}`, not zero. `unknown` is a designed state (`AGENTS.md §1.1`)
 * and "0 of 45 minutes" is a claim about the flight, so a meter with no fresh input renders no fill
 * and omits `aria-valuenow` — WAI-ARIA 1.2's spelling of "the current value is not known". The
 * track, the readout and `aria-valuetext` are unchanged, and the words in them are the caller's.
 */

import type { JSX } from 'react'
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
  /** The reading, or `null` when there is no fresh input to read. */
  readonly value: number | null
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
  const reading = value === null ? null : Math.min(Math.max(value, min), max)
  // Geometry for the SVG presentation attribute below, to one decimal place. It is never rendered
  // as text and never announced; see the header on why this meter publishes no percentage.
  const extent =
    reading === null ? null : span <= 0 ? 0 : Math.round(((reading - min) / span) * 1000) / 10
  // Both caller strings, joined. Nothing is composed here beyond the separator: the words are the
  // caller's, because they are copy.
  const announced = `${valueText}, ${bandLabel}`

  return (
    <div
      className={cx('dp-progress', `dp-progress--${band}`, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      {...(reading === null ? {} : { 'aria-valuenow': reading })}
      aria-valuetext={announced}
    >
      <p className="dp-progress__readout">
        <span className="dp-progress__value">{valueText}</span>
        <span className="dp-progress__band">
          <Icon name={BAND_ICON[band]} decorative className="dp-progress__band-icon" />
          {bandLabel}
        </span>
      </p>
      <span className="dp-progress__track">
        <svg className="dp-progress__meter" aria-hidden="true" focusable="false">
          {extent === null ? null : (
            <rect
              className="dp-progress__fill"
              x="0"
              y="0"
              width={`${String(extent)}%`}
              height="100%"
            />
          )}
        </svg>
      </span>
    </div>
  )
}
