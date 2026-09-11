/**
 * Tooltip — supplementary text attached to a control.
 *
 * WCAG 2.2 SC 1.4.13 Content on Hover or Focus: dismissible with Escape, hoverable (the bubble is
 * inside the same hover target), and persistent until dismissed or focus moves. Shown on focus as
 * well as hover, so it is reachable from a keyboard.
 *
 * A tooltip is never the only place a fact appears. Anything a traveler needs in order to act
 * belongs in the flow of the page, not behind a hover.
 */

import { cloneElement, useId, useState, type JSX, type ReactElement, type ReactNode } from 'react'
import { cx } from './class-names.ts'

export interface TooltipProps {
  /** The control this describes. Receives `aria-describedby` pointing at the bubble. */
  readonly trigger: ReactElement<{ 'aria-describedby'?: string }>
  readonly children: ReactNode
  readonly className?: string
}

export function Tooltip({ trigger, children, className }: TooltipProps): JSX.Element {
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <span
      className={cx('dp-tooltip', className)}
      onPointerEnter={() => {
        setOpen(true)
      }}
      onPointerLeave={() => {
        setOpen(false)
      }}
      onFocusCapture={() => {
        setOpen(true)
      }}
      onBlurCapture={() => {
        setOpen(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation()
          setOpen(false)
        }
      }}
    >
      {cloneElement(trigger, { 'aria-describedby': id })}
      <span role="tooltip" id={id} className="dp-tooltip__bubble" hidden={!open}>
        {children}
      </span>
    </span>
  )
}
