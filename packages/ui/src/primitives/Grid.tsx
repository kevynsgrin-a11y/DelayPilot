/**
 * Grid — the 12-column layout, including the desktop cockpit split.
 *
 * `DIRECTIVE.md §18.7`: 12 columns with 8 for action and itinerary and 4 for source, alerts and
 * secondary detail. Below 1024px the cockpit collapses to a single column in source order, so the
 * itinerary is read before the secondary panel on a phone.
 *
 * The template is never composed here. There are exactly two variants and exactly three even
 * column counts, each resolved by a rule in primitives.css against `data-variant` / `data-columns`,
 * because an inline `style` is discarded by the served Content-Security-Policy (`style-src 'self'`,
 * apps/web/public/_headers) and an arbitrary template string could not be expressed any other way.
 *
 * The three placements a cockpit needs, and the only three there are:
 *
 *   - `primary`   — 8 of 12 at 1024px and above: itinerary, status, the recommended action.
 *   - `secondary` — the remaining 4: sources, provenance, alerts, secondary detail.
 *   - `full`      — all 12, at every width: a row that spans the cockpit, such as a disruption
 *                   callout that must not be read as belonging to one column.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'

/** Even splits of the 12-column grid. Anything else is a cockpit, not an `equal` grid. */
export type GridColumns = 2 | 3 | 4

export interface GridProps {
  readonly children: ReactNode
  /** `cockpit` is the §18.7 8+4 split; `equal` divides the 12 columns evenly. */
  readonly variant?: 'cockpit' | 'equal'
  /** Ignored by the `cockpit` variant, which is always 8+4. */
  readonly columns?: GridColumns
  readonly className?: string
}

export function Grid({
  children,
  variant = 'equal',
  columns = 2,
  className,
}: GridProps): JSX.Element {
  return (
    <div
      className={cx('dp-grid', className)}
      data-variant={variant}
      data-columns={variant === 'equal' ? columns : undefined}
    >
      {children}
    </div>
  )
}

export interface GridAreaProps {
  readonly children: ReactNode
  /** Which part of the cockpit split this belongs to. `equal` honours `full` and ignores the rest. */
  readonly area: 'primary' | 'secondary' | 'full'
  readonly className?: string
}

export function GridArea({ children, area, className }: GridAreaProps): JSX.Element {
  return <div className={cx(`dp-grid__${area}`, className)}>{children}</div>
}
