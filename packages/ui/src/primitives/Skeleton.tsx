/**
 * Skeleton — a placeholder that reserves the final dimensions.
 *
 * Both dimensions are required, and they are the dimensions the real content will occupy: a
 * skeleton that does not reserve its space is a layout shift waiting for a slow network, and the
 * CLS budget is < 0.1 (`DIRECTIVE.md §22`).
 *
 * It does NOT shimmer. A looping animation inside a data-bearing component is forbidden
 * (`DIRECTIVE.md §7`, ADR 0003 rule 3) — and a pulsing block beside a delayed flight reads as
 * something happening, when nothing is.
 *
 * IT IS NOT A LIVE REGION. `role="status"` carries an implicit `aria-live="polite"`, and a cockpit
 * renders a grid of these: one polite announcement per placeholder, queued, every time a panel
 * reloads — including on a background poll that returned identical data. A skeleton → content swap
 * is not a change in the recommended action, and announcing it is exactly the chatter the
 * `DIRECTIVE.md §7` floor ("`aria-live` only for meaningful changes") exists to prevent
 * (`docs/ACCESSIBILITY.md` B4).
 *
 * The correct wiring is the composing pattern's: the REGION being replaced carries
 * `aria-busy="true"` while it loads, and drops it when the content arrives. `live` is available for
 * the one case where a view genuinely has nothing else to announce, and a view must set it at most
 * once.
 */

import type { CSSProperties, JSX } from 'react'
import { cx } from './class-names.ts'
import { VisuallyHidden } from './VisuallyHidden.tsx'

export interface SkeletonProps {
  /** Any CSS length. Use the width the loaded content will occupy. */
  readonly width: string
  readonly height: string
  /** Announced text, e.g. "Loading flight status". Copy is the caller's. */
  readonly label: string
  readonly radius?: 'control' | 'card' | 'pill'
  /**
   * Opt in to `role="status"`. Default false, and it should stay false: put `aria-busy="true"` on
   * the region instead. At most one skeleton per view may set it.
   */
  readonly live?: boolean
  readonly className?: string
  readonly style?: CSSProperties
}

export function Skeleton({
  width,
  height,
  label,
  radius = 'control',
  live = false,
  className,
  style,
}: SkeletonProps): JSX.Element {
  return (
    <span
      className={cx('dp-skeleton', `dp-skeleton--${radius}`, className)}
      style={{ ...style, inlineSize: width, blockSize: height }}
      {...(live ? { role: 'status' } : {})}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  )
}
