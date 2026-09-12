/**
 * Toast — a transient message about something that just changed.
 *
 * `urgent` uses `role="alert"` (assertive), everything else `role="status"` (polite): interrupting
 * a reader is reserved for a confirmed material change, which is what `aria-live` "only for
 * meaningful changes" means in practice (`DIRECTIVE.md §7`).
 *
 * It does not auto-dismiss on a timer. A traveler reading one-handed at a gate must not lose a
 * message because they were slow, and a disappearing message cannot be re-read.
 *
 * Each of the four severities draws its own glyph, so the severity survives greyscale. `info` draws
 * the NEUTRAL `info` glyph, not `status-unknown`, whose meaning here is the specific one of
 * insufficient fresh information (`AGENTS.md §1.1`, `docs/ACCESSIBILITY.md §15.11`, F34). The tone
 * stays neutral — four tones, never a fifth colour — so the shape is what separates a note from a
 * gap in the data.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'
import { Icon, type IconName } from './Icon.tsx'
import type { InterimSeverity } from '../tokens/interim-contracts.ts'

const SEVERITY_ICON: Readonly<Record<InterimSeverity, IconName>> = {
  info: 'info',
  watch: 'status-watch',
  urgent: 'status-critical',
  resolved: 'status-safe',
}

export interface ToastProps {
  readonly severity: InterimSeverity
  readonly title: string
  readonly children?: ReactNode
  readonly onDismiss: () => void
  /** Accessible name for the dismiss control, e.g. "Dismiss". */
  readonly dismissLabel: string
  readonly className?: string
}

export function Toast({
  severity,
  title,
  children,
  onDismiss,
  dismissLabel,
  className,
}: ToastProps): JSX.Element {
  return (
    <div
      className={cx('dp-toast', `dp-toast--${severity}`, 'dp-no-print', className)}
      role={severity === 'urgent' ? 'alert' : 'status'}
    >
      <Icon name={SEVERITY_ICON[severity]} decorative className="dp-toast__icon" />
      <div className="dp-toast__content">
        <p className="dp-toast__title">{title}</p>
        {children === undefined ? null : <div className="dp-toast__body">{children}</div>}
      </div>
      <button
        type="button"
        className="dp-button dp-button--ghost dp-button--icon-only"
        aria-label={dismissLabel}
        onClick={() => {
          onDismiss()
        }}
      >
        <Icon name="close" decorative />
      </button>
    </div>
  )
}
