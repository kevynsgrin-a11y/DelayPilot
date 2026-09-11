/**
 * Grid — the 12-column layout, including the desktop cockpit split.
 *
 * `DIRECTIVE.md §18.7`: 12 columns with 8 for action and itinerary and 4 for source, alerts and
 * secondary detail. Below 1024px the cockpit collapses to a single column in source order, so the
 * itinerary is read before the secondary panel on a phone.
 */

import type { CSSProperties, JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'

export interface GridProps {
  readonly children: ReactNode
  /** `cockpit` is the §18.7 8+4 split; `equal` divides the 12 columns evenly. */
  readonly variant?: 'cockpit' | 'equal'
  readonly columns?: 2 | 3 | 4
  readonly className?: string
  readonly style?: CSSProperties
}

export function Grid({
  children,
  variant = 'equal',
  columns = 2,
  className,
  style,
}: GridProps): JSX.Element {
  return (
    <div
      className={cx('dp-grid', `dp-grid--${variant}`, className)}
      style={
        variant === 'equal' ? ({ ...style, '--dp-grid-columns': columns } as CSSProperties) : style
      }
    >
      {children}
    </div>
  )
}

export interface GridAreaProps {
  readonly children: ReactNode
  /** Which half of the cockpit split this belongs to. Ignored by the `equal` variant. */
  readonly area: 'primary' | 'secondary'
  readonly className?: string
}

export function GridArea({ children, area, className }: GridAreaProps): JSX.Element {
  return <div className={cx(`dp-grid__${area}`, className)}>{children}</div>
}
