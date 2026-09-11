/**
 * Drawer — a modal panel anchored to an edge.
 *
 * Same contract as Dialog: `aria-modal`, trapped focus, focus restored to the invoker, Escape
 * closes. `DIRECTIVE.md §18.7` asks for drawers instead of side panels on mobile, so the default
 * anchor is the bottom edge, where a thumb can reach it.
 *
 * `headingLevel` for the same reason as Dialog's: a hard-coded `<h2>` opened from under an `<h3>`
 * breaks the page's heading order (`docs/ACCESSIBILITY.md` F14).
 */

import { useId, useRef, type JSX, type ReactNode } from 'react'
import { cx } from './class-names.ts'
import { Icon } from './Icon.tsx'
import { useFocusTrap } from './use-focus-trap.ts'

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export interface DrawerProps {
  readonly open: boolean
  readonly onClose: () => void
  readonly title: string
  readonly children: ReactNode
  readonly closeLabel: string
  readonly side?: 'bottom' | 'end'
  /** Heading level for the title. Set it to match the section the drawer was opened from. */
  readonly headingLevel?: 2 | 3 | 4
  readonly className?: string
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  closeLabel,
  side = 'bottom',
  headingLevel = 2,
  className,
}: DrawerProps): JSX.Element | null {
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
        className={cx('dp-drawer', `dp-drawer--${side}`, className)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            onClose()
          }
        }}
      >
        <div className="dp-drawer__header">
          <Heading className="dp-drawer__title" id={titleId}>
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
        <div className="dp-drawer__body">{children}</div>
      </div>
    </div>
  )
}
