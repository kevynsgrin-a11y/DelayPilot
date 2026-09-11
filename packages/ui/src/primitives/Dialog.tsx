/**
 * Dialog — a modal layer.
 *
 * `role="dialog"`, `aria-modal="true"`, labelled by its own heading, focus trapped while open and
 * restored to the invoker on close, Escape closes, the scrim closes. It enters at
 * `--motion-base` — a state change, which is the one thing motion is for (`DIRECTIVE.md §7`).
 *
 * `closeLabel` is required and has no default: the accessible name of the close control is product
 * copy, and copy belongs to ux-copy-steward.
 *
 * `headingLevel` exists because a dialog opened from a section under an `<h3>` would otherwise emit
 * a hard-coded `<h2>` and break the page's heading order (`docs/ACCESSIBILITY.md` F14).
 */

import { useId, useRef, type JSX, type ReactNode } from 'react'
import { cx } from './class-names.ts'
import { Icon } from './Icon.tsx'
import { useFocusTrap } from './use-focus-trap.ts'

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

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
  /** Heading level for the title. Set it to match the section the dialog was opened from. */
  readonly headingLevel?: 2 | 3 | 4
  readonly className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  children,
  closeLabel,
  footer,
  headingLevel = 2,
  className,
}: DialogProps): JSX.Element | null {
  const titleId = useId()
  const Heading = HEADING_TAG[headingLevel]
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
          <Heading className="dp-dialog__title" id={titleId}>
            {title}
          </Heading>
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
