/**
 * StatusPill — the four operational states.
 *
 * `safe` on track · `watch` conditions changing · `critical` confirmed material disruption ·
 * `unknown` insufficient fresh information.
 *
 * Three signals ship together and none of them is optional: a distinct ICON SHAPE (circle,
 * triangle, octagon, square), a visible TEXT LABEL, and the status tone. Colour is never the only
 * signal (`AGENTS.md §1.1`, `DIRECTIVE.md §7` accessibility floor), which is why `label` is a
 * required string rather than a default this primitive could invent.
 *
 * `unknown` is a designed state, not an absence: it renders neutral slate at full strength, never
 * a dash, never a blank, never faded. A faded chip reads as "we are still loading", which would be
 * a lie about what we know.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'
import { Icon, type IconName } from './Icon.tsx'
import type { InterimStatusTone } from '../tokens/interim-contracts.ts'

const STATUS_ICON: Readonly<Record<InterimStatusTone, IconName>> = {
  safe: 'status-safe',
  watch: 'status-watch',
  critical: 'status-critical',
  unknown: 'status-unknown',
}

export interface StatusPillProps {
  readonly status: InterimStatusTone
  /** The visible label. Required: a status must never be conveyed by hue and shape alone. */
  readonly label: string
  /** Optional trailing detail, e.g. a duration or a count. Rendered with tabular figures. */
  readonly detail?: ReactNode
  readonly className?: string
}

export function StatusPill({ status, label, detail, className }: StatusPillProps): JSX.Element {
  return (
    <span className={cx('dp-status-pill', `dp-status-pill--${status}`, className)}>
      <Icon name={STATUS_ICON[status]} decorative className="dp-status-pill__icon" />
      <span className="dp-status-pill__label">{label}</span>
      {detail === undefined ? null : <span className="dp-status-pill__detail tnum">{detail}</span>}
    </span>
  )
}
