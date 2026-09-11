/**
 * Badge — a short neutral or accent label.
 *
 * Deliberately NOT status-toned: a status is a StatusPill and a source is a ProvenanceChip. A badge
 * that could be mistaken for either would put an unmeasured meaning on a colour.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'

export interface BadgeProps {
  readonly children: ReactNode
  readonly tone?: 'neutral' | 'accent'
  /** Times, counts and flight numbers get tabular figures so the badge cannot resize as they change. */
  readonly numeric?: boolean
  readonly className?: string
}

export function Badge({
  children,
  tone = 'neutral',
  numeric = false,
  className,
}: BadgeProps): JSX.Element {
  return (
    <span className={cx('dp-badge', `dp-badge--${tone}`, numeric ? 'tnum' : undefined, className)}>
      {children}
    </span>
  )
}
