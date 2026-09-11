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
  readonly className?: string
  readonly style?: CSSProperties
}

export function Skeleton({
  width,
  height,
  label,
  radius = 'control',
  className,
  style,
}: SkeletonProps): JSX.Element {
  return (
    <span
      className={cx('dp-skeleton', `dp-skeleton--${radius}`, className)}
      style={{ ...style, inlineSize: width, blockSize: height }}
      role="status"
    >
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  )
}
