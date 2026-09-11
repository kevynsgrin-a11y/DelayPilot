/**
 * Tooltip — supplementary text attached to a control.
 *
 * WCAG 2.2 SC 1.4.13 Content on Hover or Focus requires all three of dismissible, hoverable and
 * persistent, and the first two are easy to get wrong:
 *
 *   - DISMISSIBLE. Escape is bound to the DOCUMENT while the bubble is open, not to the wrapper.
 *     A wrapper handler only ever sees keydowns whose target is inside the wrapper, so a tooltip
 *     opened by hover — the case the SC is written about, where focus is somewhere else entirely —
 *     could not be dismissed at all (`docs/ACCESSIBILITY.md` B5). The listener is added on open and
 *     removed on close; nothing is left bound.
 *   - HOVERABLE. The bubble sits 8px clear of the trigger, and that 8px is bridged by
 *     `.dp-tooltip__bubble::before` so the pointer can travel from one to the other without leaving
 *     the hover target and destroying the thing it is travelling towards.
 *   - PERSISTENT. Nothing here is on a timer; the bubble stays until the pointer leaves, focus
 *     moves, or Escape.
 *
 * A tooltip is never the only place a fact appears. Anything a traveler needs in order to act
 * belongs in the flow of the page, not behind a hover.
 */

import {
  cloneElement,
  useEffect,
  useId,
  useState,
  type JSX,
  type ReactElement,
  type ReactNode,
} from 'react'
import { cx } from './class-names.ts'

/** The slice of a keyboard event this handler reads. */
export interface DismissKeyEvent {
  readonly key: string
  stopPropagation: () => void
}

/**
 * The slice of `document` this handler binds to. Narrow on purpose: the behaviour below is a
 * contract, and a contract that can only be exercised in a browser is a contract this repository
 * cannot test today (no DOM environment is installed at the test runner).
 */
export interface DismissTarget {
  addEventListener(
    type: 'keydown',
    listener: (event: DismissKeyEvent) => void,
    capture: boolean,
  ): void
  removeEventListener(
    type: 'keydown',
    listener: (event: DismissKeyEvent) => void,
    capture: boolean,
  ): void
}

/**
 * Bind Escape-to-dismiss for an open tooltip. Returns the unbind function.
 *
 * Capture phase, and the event is stopped: the innermost open layer owns Escape, so dismissing a
 * tooltip inside a Dialog must not also close the Dialog behind it.
 */
export function bindTooltipDismiss(target: DismissTarget, onDismiss: () => void): () => void {
  const onKeyDown = (event: DismissKeyEvent): void => {
    if (event.key !== 'Escape') return
    event.stopPropagation()
    onDismiss()
  }
  target.addEventListener('keydown', onKeyDown, true)
  return () => {
    target.removeEventListener('keydown', onKeyDown, true)
  }
}

export interface TooltipProps {
  /** The control this describes. Receives `aria-describedby` pointing at the bubble. */
  readonly trigger: ReactElement<{ 'aria-describedby'?: string }>
  readonly children: ReactNode
  readonly className?: string
}

export function Tooltip({ trigger, children, className }: TooltipProps): JSX.Element {
  const id = useId()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    return bindTooltipDismiss(document, () => {
      setOpen(false)
    })
  }, [open])

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
    >
      {cloneElement(trigger, { 'aria-describedby': id })}
      <span role="tooltip" id={id} className="dp-tooltip__bubble" hidden={!open}>
        {children}
      </span>
    </span>
  )
}
