/**
 * Callout — a bounded notice at one of the four severities.
 *
 * `DIRECTIVE.md §16` severities map onto the four status tones: info to neutral slate, watch to
 * watch, urgent to critical, resolved to safe. Four tones, never a fifth colour.
 *
 * Every severity carries its own icon shape and a required title, so the severity survives
 * greyscale, and nothing pulses: an attention animation on a critical state is forbidden
 * (ADR 0003 rule 3). Calm beats dramatic — nothing may look alarmed that is not confirmed.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'
import { Icon, type IconName } from './Icon.tsx'
import { type InterimSeverity, severityToStatusTone } from '../tokens/interim-contracts.ts'

const SEVERITY_ICON: Readonly<Record<InterimSeverity, IconName>> = {
  info: 'status-unknown',
  watch: 'status-watch',
  urgent: 'status-critical',
  resolved: 'status-safe',
}

export interface CalloutProps {
  readonly severity: InterimSeverity
  /** Visible title. Required: the severity must be readable as words, not inferred from a colour. */
  readonly title: string
  readonly children?: ReactNode
  /** Trailing action row, e.g. a single Button. */
  readonly action?: ReactNode
  readonly className?: string
}

export function Callout({
  severity,
  title,
  children,
  action,
  className,
}: CalloutProps): JSX.Element {
  return (
    <div
      className={cx('dp-callout', `dp-callout--${severity}`, className)}
      data-status-tone={severityToStatusTone[severity]}
    >
      <Icon name={SEVERITY_ICON[severity]} decorative className="dp-callout__icon" />
      <div className="dp-callout__content">
        <p className="dp-callout__title">{title}</p>
        {children === undefined ? null : <div className="dp-callout__body">{children}</div>}
      </div>
      {action === undefined ? null : <div className="dp-callout__action">{action}</div>}
    </div>
  )
}
