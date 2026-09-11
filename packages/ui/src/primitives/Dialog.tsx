/**
 * Dialog — a modal layer.
 *
 * `role="dialog"`, `aria-modal="true"`, labelled by its own heading, focus trapped while open and
 * restored to the invoker on close, Escape closes, the scrim closes. It enters at
 * `--motion-base` — a state change, which is the one thing motion is for (`DIRECTIVE.md §7`).
 *
 * `closeLabel` is required and has no default: the accessible name of the close control is product
 * copy, and copy belongs to ux-copy-steward.
 */

import { useId, useRef, type JSX, type ReactNode } from 'react'
import { cx } from './class-names.ts'
import { Icon } from './Icon.tsx'
import { useFocusTrap } from './use-focus-trap.ts'

export interface DialogProps {
  readonly open: boolean
  readonly onClose: () => void
  /** Rendered as the dialog's heading and used as its accessible name. */
  readonly title: string
  readonly children: ReactNode
  /** Accessible name for the close control, e.g. "Close". */
  readonly closeLabel: string
  /** Action row. Kept out of the scrolling body so the primary action never scrolls away. */
  readonly footer?: ReactNode
  readonly className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  closeLabel,
  footer,
  className,
}: DialogProps): JSX.Element | null {
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  useFocusTrap(open, ref)

  if (!open) return null

  return (
    <div className="dp-overlay">
      <div
        className="dp-overlay__scrim"
        role="presentation"
        onClick={() => {
          onClose()
        }}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx('dp-dialog', className)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            onClose()
          }
        }}
      >
        <div className="dp-dialog__header">
          <h2 className="dp-dialog__title" id={titleId}>
            {title}
          </h2>
          <button
            type="button"
            className="dp-button dp-button--ghost dp-button--icon-only"
            aria-label={closeLabel}
            onClick={() => {
              onClose()
            }}
          >
            <Icon name="close" decorative />
          </button>
        </div>
        <div className="dp-dialog__body">{children}</div>
        {footer === undefined ? null : <div className="dp-dialog__footer">{footer}</div>}
      </div>
    </div>
  )
}
