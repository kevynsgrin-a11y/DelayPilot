/**
 * Tabs — a controlled tablist with roving tabindex.
 *
 * Arrow keys move between tabs, Home and End jump to the ends, and only the selected tab is in the
 * tab sequence, so Tab moves out of the tablist rather than through it. Selection follows focus,
 * which is the correct pattern when panels are already rendered and switching costs nothing.
 *
 * The selected tab is marked by an underline AND by `aria-selected`, never by colour alone.
 */

import { useRef, type JSX, type ReactNode } from 'react'
import { cx } from './class-names.ts'

export interface TabDefinition {
  readonly id: string
  readonly label: ReactNode
  readonly panel: ReactNode
}

export interface TabsProps {
  readonly tabs: readonly TabDefinition[]
  readonly selectedId: string
  readonly onSelect: (id: string) => void
  /** Accessible name for the tablist, e.g. "Trip sections". */
  readonly label: string
  readonly className?: string
}

export function Tabs({ tabs, selectedId, onSelect, label, className }: TabsProps): JSX.Element {
  const listRef = useRef<HTMLDivElement>(null)

  const move = (delta: number, from: number): void => {
    const next = tabs[(from + delta + tabs.length) % tabs.length]
    if (next === undefined) return
    onSelect(next.id)
    listRef.current?.querySelector<HTMLElement>(`[data-tab-id="${next.id}"]`)?.focus()
  }

  return (
    <div className={cx('dp-tabs', className)}>
      <div className="dp-tabs__list" role="tablist" aria-label={label} ref={listRef}>
        {tabs.map((tab, index) => {
          const selected = tab.id === selectedId
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${tab.id}-tab`}
              data-tab-id={tab.id}
              aria-selected={selected}
              aria-controls={`${tab.id}-panel`}
              tabIndex={selected ? 0 : -1}
              className={cx('dp-tabs__tab', selected ? 'is-selected' : undefined)}
              onClick={() => {
                onSelect(tab.id)
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowRight') {
                  event.preventDefault()
                  move(1, index)
                } else if (event.key === 'ArrowLeft') {
                  event.preventDefault()
                  move(-1, index)
                } else if (event.key === 'Home') {
                  event.preventDefault()
                  move(-index, index)
                } else if (event.key === 'End') {
                  event.preventDefault()
                  move(tabs.length - 1 - index, index)
                }
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${tab.id}-panel`}
          aria-labelledby={`${tab.id}-tab`}
          tabIndex={0}
          className="dp-tabs__panel"
          hidden={tab.id !== selectedId}
        >
          {tab.panel}
        </div>
      ))}
    </div>
  )
}
