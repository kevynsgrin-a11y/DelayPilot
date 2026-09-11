/**
 * Drawer — a modal panel anchored to an edge.
 *
 * Same contract as Dialog: `aria-modal`, trapped focus, focus restored to the invoker, Escape
 * closes. `DIRECTIVE.md §18.7` asks for drawers instead of side panels on mobile, so the default
 * anchor is the bottom edge, where a thumb can reach it.
 */

import { useId, useRef, type JSX, type ReactNode } from 'react'
import { cx } from './class-names.ts'
import { Icon } from './Icon.tsx'
import { useFocusTrap } from './use-focus-trap.ts'

export interface DrawerProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly title: string
  readonly children: ReactNode
  readonly closeLabel: string
  readonly side?: 'bottom' | 'end'
  readonly className?: string
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  closeLabel,
  side = 'bottom',
  className,
}: DrawerProps): JSX.Element | null {
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
        className={cx('dp-drawer', `dp-drawer--${side}`, className)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            onClose()
          }
        }}
      >
        <div className="dp-drawer__header">
          <h2 className="dp-drawer__title" id={titleId}>
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
        <div className="dp-drawer__body">{children}</div>
      </div>
    </div>
  )
}
