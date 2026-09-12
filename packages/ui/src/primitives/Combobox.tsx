/**
 * Combobox — the ARIA shell only.
 *
 * This primitive owns the ROLES and the IDS of a combobox. It owns no filtering, no fetching, no
 * airline or airport list, and no notion of what an option means: the caller supplies options and
 * decides what "matching" is. A combobox that knew what a flight was would have crossed into
 * frontend-ui-engineer's scope (`docs/agents/ROSTER.md §3`).
 *
 * WAI-ARIA 1.2 combobox pattern: `role="combobox"` on the input, `aria-expanded`,
 * `aria-controls` pointing at a `role="listbox"`, and `aria-activedescendant` naming the active
 * option. Focus stays on the input throughout, which is what makes it usable one-handed.
 *
 * ---------------------------------------------------------------------------------------------
 * IT DOES NOT OWN THE KEYBOARD. There is no key handling in this file, deliberately: what Enter
 * commits, what Escape reverts and what "next option" means are the caller's model, not a token
 * decision (`docs/ACCESSIBILITY.md` F16 corrected an earlier docblock that claimed otherwise).
 *
 * THE CONTRACT THE CALLER MUST IMPLEMENT on the input's `onKeyDown`, published here so that
 * frontend-ui-engineer and accessibility-lead test the same thing in Phase 10:
 *
 *   ArrowDown   open the listbox if closed; otherwise move `activeOptionId` to the next option.
 *   ArrowUp     open the listbox if closed; otherwise move `activeOptionId` to the previous one.
 *   Home / End  first / last option, when the listbox is open.
 *   Enter       commit the active option and close. Only when one is active — Enter with nothing
 *               active must submit the form, or the field becomes a trap for a fast typist.
 *   Escape      close the listbox and clear `activeOptionId`; a second Escape clears the input.
 *               Never move focus.
 *   Tab         leave the field. Do not trap it, and do not swallow the keystroke.
 *
 * Wrapping at the ends is optional; never wrapping and never trapping are not. `activeOptionId`
 * must always name an option that is currently rendered, or `aria-activedescendant` points at
 * nothing and the ACTIVE styling below marks a row that does not exist.
 * ---------------------------------------------------------------------------------------------
 */

import type { InputHTMLAttributes, JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'
import { withoutInlineStyle } from './no-inline-style.ts'

export interface ComboboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'children' | 'role' | 'type' | 'aria-expanded' | 'aria-controls' | 'style'
> {
  /** Id of the listbox element rendered in `children`. */
  readonly listboxId: string
  readonly expanded: boolean
  /** Id of the visually highlighted option, or undefined when none is active. */
  readonly activeOptionId?: string
  /** The listbox. Rendered inside the shell so the popup is adjacent to the input in the DOM. */
  readonly children: ReactNode
  readonly className?: string
}

export function Combobox({
  listboxId,
  expanded,
  activeOptionId,
  children,
  className,
  ...rest
}: ComboboxProps): JSX.Element {
  return (
    <div className={cx('dp-combobox', className)}>
      <input
        type="text"
        role="combobox"
        className="dp-combobox__input"
        autoComplete="off"
        aria-expanded={expanded}
        aria-controls={listboxId}
        aria-autocomplete="list"
        {...(activeOptionId === undefined ? {} : { 'aria-activedescendant': activeOptionId })}
        {...withoutInlineStyle(rest)}
      />
      {children}
    </div>
  )
}

export interface ComboboxListboxProps {
  readonly id: string
  readonly children: ReactNode
  /** Accessible name for the popup, e.g. the field's own label. */
  readonly 'aria-label': string
  readonly hidden?: boolean
}

export function ComboboxListbox({
  id,
  children,
  hidden = false,
  ...rest
}: ComboboxListboxProps): JSX.Element {
  return (
    <ul
      id={id}
      role="listbox"
      className="dp-combobox__listbox"
      hidden={hidden}
      {...withoutInlineStyle(rest)}
    >
      {children}
    </ul>
  )
}

export interface ComboboxOptionProps {
  readonly id: string
  readonly selected: boolean
  /** True when this option is the `aria-activedescendant` target. */
  readonly active: boolean
  readonly children: ReactNode
  readonly onSelect: () => void
}

export function ComboboxOption({
  id,
  selected,
  active,
  children,
  onSelect,
}: ComboboxOptionProps): JSX.Element {
  return (
    <li
      id={id}
      role="option"
      aria-selected={selected}
      className={cx('dp-combobox__option', active ? 'is-active' : undefined)}
      onMouseDown={(event) => {
        // Pointer selection must not blur the input first, or the listbox closes before the click.
        event.preventDefault()
        onSelect()
      }}
    >
      {children}
    </li>
  )
}
