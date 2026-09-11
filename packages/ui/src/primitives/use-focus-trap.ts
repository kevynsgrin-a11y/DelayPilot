/**
 * Focus containment for modal layers.
 *
 * On open: remember what had focus, move focus into the layer. While open: Tab and Shift+Tab cycle
 * inside it. On close: put focus back on the invoker. That last step is the one most
 * implementations skip, and it is the one that decides whether a keyboard user ends up back where
 * they were or at the top of the document.
 *
 * Effects only, so server rendering is unaffected.
 */

import { useEffect, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableWithin(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => element.offsetParent !== null || element === document.activeElement,
  )
}

export function useFocusTrap(open: boolean, containerRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    if (!open) return undefined
    const container = containerRef.current
    if (container === null) return undefined

    const invoker = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const initial = focusableWithin(container)[0] ?? container
    initial.focus()

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Tab') return
      const items = focusableWithin(container)
      const first = items[0]
      const last = items[items.length - 1]
      if (first === undefined || last === undefined) {
        event.preventDefault()
        container.focus()
        return
      }
      const active = document.activeElement
      if (event.shiftKey && (active === first || active === container)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      } else if (active !== null && !container.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      invoker?.focus()
    }
  }, [open, containerRef])
}
