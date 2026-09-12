/**
 * The combobox keyboard contract, line by line.
 *
 * `packages/ui/src/primitives/Combobox.tsx` publishes a seven-line contract and owns none of it.
 * `packages/ui/src/patterns/combobox-keyboard.ts` is the implementation. This file asserts EVERY
 * line of that contract, plus the two invariants stated beneath it — never wrapping is optional but
 * never TRAPPING is not, and `activeOptionId` must always name a rendered option.
 *
 * Each `describe` below quotes the contract line it covers, so a future reader can check the test
 * against the docblock rather than against this file's own idea of what the docblock meant.
 */

import { describe, expect, it } from 'vitest'
import {
  comboboxKeyDown,
  reconcileActiveOption,
  type ComboboxState,
} from '../../../packages/ui/src/patterns/combobox-keyboard.ts'

const OPTIONS = ['opt-a', 'opt-b', 'opt-c'] as const

const state = (overrides: Partial<ComboboxState> = {}): ComboboxState => ({
  expanded: false,
  activeOptionId: undefined,
  optionIds: OPTIONS,
  value: '',
  ...overrides,
})

describe('ArrowDown — open the listbox if closed; otherwise move to the next option', () => {
  it('opens a closed listbox and consumes the keystroke', () => {
    const result = comboboxKeyDown(state(), 'ArrowDown')
    expect(result.state.expanded).toBe(true)
    expect(result.preventDefault).toBe(true)
  })

  it('leaves no option active on open, so the first ArrowDown does exactly one thing', () => {
    expect(comboboxKeyDown(state(), 'ArrowDown').state.activeOptionId).toBeUndefined()
  })

  it('enters at the first option when the listbox is already open with none active', () => {
    const result = comboboxKeyDown(state({ expanded: true }), 'ArrowDown')
    expect(result.state.activeOptionId).toBe('opt-a')
  })

  it('moves to the next option', () => {
    const result = comboboxKeyDown(state({ expanded: true, activeOptionId: 'opt-a' }), 'ArrowDown')
    expect(result.state.activeOptionId).toBe('opt-b')
  })

  it('does not wrap past the last option', () => {
    const result = comboboxKeyDown(state({ expanded: true, activeOptionId: 'opt-c' }), 'ArrowDown')
    expect(result.state.activeOptionId).toBe('opt-c')
  })
})

describe('ArrowUp — open the listbox if closed; otherwise move to the previous option', () => {
  it('opens a closed listbox', () => {
    expect(comboboxKeyDown(state(), 'ArrowUp').state.expanded).toBe(true)
  })

  it('enters at the last option when the listbox is open with none active', () => {
    expect(comboboxKeyDown(state({ expanded: true }), 'ArrowUp').state.activeOptionId).toBe('opt-c')
  })

  it('moves to the previous option', () => {
    const result = comboboxKeyDown(state({ expanded: true, activeOptionId: 'opt-c' }), 'ArrowUp')
    expect(result.state.activeOptionId).toBe('opt-b')
  })

  it('does not wrap past the first option', () => {
    const result = comboboxKeyDown(state({ expanded: true, activeOptionId: 'opt-a' }), 'ArrowUp')
    expect(result.state.activeOptionId).toBe('opt-a')
  })
})

describe('Home / End — first / last option, WHEN THE LISTBOX IS OPEN', () => {
  it('Home moves to the first option when open', () => {
    const result = comboboxKeyDown(state({ expanded: true, activeOptionId: 'opt-c' }), 'Home')
    expect(result.state.activeOptionId).toBe('opt-a')
    expect(result.preventDefault).toBe(true)
  })

  it('End moves to the last option when open', () => {
    const result = comboboxKeyDown(state({ expanded: true, activeOptionId: 'opt-a' }), 'End')
    expect(result.state.activeOptionId).toBe('opt-c')
  })

  it('leaves Home and End to the caret when the listbox is closed', () => {
    for (const key of ['Home', 'End']) {
      const result = comboboxKeyDown(state({ value: 'Demo Airline' }), key)
      expect(result.preventDefault).toBe(false)
      expect(result.state.activeOptionId).toBeUndefined()
    }
  })
})

describe('Enter — commit the active option and close; otherwise submit the form', () => {
  it('commits the active option, closes, and consumes the keystroke', () => {
    const result = comboboxKeyDown(state({ expanded: true, activeOptionId: 'opt-b' }), 'Enter')
    expect(result.effect).toEqual({ type: 'commit', optionId: 'opt-b' })
    expect(result.state.expanded).toBe(false)
    expect(result.state.activeOptionId).toBeUndefined()
    expect(result.preventDefault).toBe(true)
  })

  it('submits the form when nothing is active, and does NOT consume the keystroke', () => {
    // "Enter with nothing active must submit the form, or the field becomes a trap for a fast
    // typist." Consuming it here is precisely that trap.
    const result = comboboxKeyDown(state({ expanded: true, value: 'Demo Airline' }), 'Enter')
    expect(result.effect).toEqual({ type: 'submit' })
    expect(result.preventDefault).toBe(false)
  })

  it('submits when the listbox is closed', () => {
    expect(comboboxKeyDown(state({ value: 'Demo Airline' }), 'Enter').effect).toEqual({
      type: 'submit',
    })
  })
})

describe('Escape — close and clear the active option; a second Escape clears the input', () => {
  it('first Escape closes and clears the active option', () => {
    const result = comboboxKeyDown(
      state({ expanded: true, activeOptionId: 'opt-b', value: 'Demo' }),
      'Escape',
    )
    expect(result.state.expanded).toBe(false)
    expect(result.state.activeOptionId).toBeUndefined()
    expect(result.state.value).toBe('Demo')
    expect(result.preventDefault).toBe(true)
  })

  it('second Escape clears the input', () => {
    const first = comboboxKeyDown(state({ expanded: true, value: 'Demo' }), 'Escape')
    const second = comboboxKeyDown(first.state, 'Escape')
    expect(second.state.value).toBe('')
    expect(second.preventDefault).toBe(true)
  })

  it('does nothing on a closed, empty field', () => {
    const result = comboboxKeyDown(state(), 'Escape')
    expect(result.preventDefault).toBe(false)
    expect(result.state).toEqual(state())
  })

  it('NEVER MOVES FOCUS — no effect can ask for it', () => {
    const result = comboboxKeyDown(state({ expanded: true }), 'Escape')
    expect(result.effect).toEqual({ type: 'none' })
  })
})

describe('Tab — leave the field; do not trap it, and do not swallow the keystroke', () => {
  it('never consumes Tab, open or closed', () => {
    expect(comboboxKeyDown(state({ expanded: true }), 'Tab').preventDefault).toBe(false)
    expect(comboboxKeyDown(state(), 'Tab').preventDefault).toBe(false)
  })

  it('closes the popup on the way out', () => {
    expect(
      comboboxKeyDown(state({ expanded: true, activeOptionId: 'opt-a' }), 'Tab').state,
    ).toEqual(state({ expanded: false, activeOptionId: undefined }))
  })
})

describe('an empty option source', () => {
  // The airline field ships with no options until Phase 3 supplies `data/airlines`.
  const empty = state({ optionIds: [] })

  it('never opens', () => {
    expect(comboboxKeyDown(empty, 'ArrowDown').state.expanded).toBe(false)
    expect(comboboxKeyDown(empty, 'ArrowUp').state.expanded).toBe(false)
  })

  it('does not swallow the arrow keys, so the field behaves as a plain labelled input', () => {
    expect(comboboxKeyDown(empty, 'ArrowDown').preventDefault).toBe(false)
  })
})

describe('keys the contract does not name', () => {
  it('are passed through untouched', () => {
    for (const key of ['a', 'Backspace', 'PageDown', ' ', 'F5']) {
      const result = comboboxKeyDown(state({ expanded: true, activeOptionId: 'opt-b' }), key)
      expect(result.preventDefault).toBe(false)
      expect(result.effect).toEqual({ type: 'none' })
      expect(result.state.activeOptionId).toBe('opt-b')
    }
  })
})

describe('activeOptionId always names a rendered option', () => {
  it('clears the active option when it is filtered away', () => {
    const next = reconcileActiveOption(state({ expanded: true, activeOptionId: 'opt-c' }), [
      'opt-a',
    ])
    expect(next.activeOptionId).toBeUndefined()
  })

  it('keeps the active option when it survives the filter', () => {
    const next = reconcileActiveOption(state({ expanded: true, activeOptionId: 'opt-a' }), [
      'opt-a',
      'opt-b',
    ])
    expect(next.activeOptionId).toBe('opt-a')
  })

  it('closes an open listbox whose options have all gone', () => {
    const next = reconcileActiveOption(state({ expanded: true, activeOptionId: 'opt-a' }), [])
    expect(next.expanded).toBe(false)
    expect(next.activeOptionId).toBeUndefined()
  })
})
