/**
 * The combobox keyboard contract, as a pure reducer.
 *
 * `packages/ui/src/primitives/Combobox.tsx` deliberately owns no key handling: what Enter commits
 * and what "next option" means are the caller's model. Its docblock publishes the contract the
 * caller must implement, and this file IS that implementation — written once, as a pure function of
 * (state, key), so the same behaviour serves the server-rendered lookup form's DOM binding and any
 * future React island, and so `accessibility-lead` and `qa-test-architect` test one thing.
 *
 * THE CONTRACT, transcribed line for line from `Combobox.tsx`, each line's test named beside it in
 * `apps/web/test/combobox-keyboard.test.ts`:
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
 * Two readings the contract leaves open, and the choice made here, stated so a reviewer can
 * disagree with the choice rather than guess at it:
 *
 * 1. **Opening does not select.** "open the listbox if closed; OTHERWISE move" is read literally:
 *    ArrowDown on a closed listbox opens it and leaves `activeOptionId` undefined; the next
 *    ArrowDown moves to the first option. The alternative (open and highlight simultaneously) is
 *    common, but it makes the first ArrowDown do two things, and a screen-reader user who opens the
 *    list to hear how many options there are has not yet chosen one.
 * 2. **No wrapping.** "Wrapping at the ends is optional; never wrapping and never trapping are
 *    not." ArrowDown on the last option stays on the last option. Wrapping silently moves a
 *    keyboard user from the bottom of a list to the top, which reads as the list having reset.
 *
 * And one invariant the contract states outright: `activeOptionId` must always name an option that
 * is currently rendered. `reconcileActiveOption` is how a caller that re-filters its options keeps
 * that true; without it `aria-activedescendant` points at nothing.
 */

export interface ComboboxState {
  /** Whether the listbox is open. */
  readonly expanded: boolean
  /** Id of the active option, or undefined when none is active. Always a member of `optionIds`. */
  readonly activeOptionId: string | undefined
  /** Ids of the options currently rendered, in visual order. Empty means there is nothing to open. */
  readonly optionIds: readonly string[]
  /** The input's current text value. */
  readonly value: string
}

/**
 * What the host must do in addition to adopting the next state.
 *
 * `commit` carries the option the caller should write into the field; the reducer does not write
 * it, because what an option's text is belongs to the caller's model, not to a key handler.
 */
export type ComboboxEffect =
  | { readonly type: 'none' }
  | { readonly type: 'commit'; readonly optionId: string }
  | { readonly type: 'submit' }

export interface ComboboxKeyResult {
  readonly state: ComboboxState
  /**
   * True only where the contract requires the keystroke to be consumed. Tab is never consumed, and
   * Enter with nothing active is never consumed — both would trap the field.
   */
  readonly preventDefault: boolean
  readonly effect: ComboboxEffect
}

const NO_EFFECT: ComboboxEffect = { type: 'none' }

const result = (
  state: ComboboxState,
  preventDefault: boolean,
  effect: ComboboxEffect = NO_EFFECT,
): ComboboxKeyResult => ({ state, preventDefault, effect })

const withActive = (state: ComboboxState, activeOptionId: string | undefined): ComboboxState => ({
  expanded: state.expanded,
  activeOptionId,
  optionIds: state.optionIds,
  value: state.value,
})

const closed = (state: ComboboxState, value = state.value): ComboboxState => ({
  expanded: false,
  activeOptionId: undefined,
  optionIds: state.optionIds,
  value,
})

const step = (state: ComboboxState, direction: 1 | -1): ComboboxState => {
  const { optionIds, activeOptionId } = state
  if (optionIds.length === 0) return state

  const lastIndex = optionIds.length - 1
  const currentIndex = activeOptionId === undefined ? -1 : optionIds.indexOf(activeOptionId)

  // No option active yet: ArrowDown enters at the top, ArrowUp enters at the bottom.
  if (currentIndex === -1) {
    return withActive(state, direction === 1 ? optionIds[0] : optionIds[lastIndex])
  }

  // No wrapping, by choice (see the docblock). Clamped at both ends.
  const nextIndex = Math.min(Math.max(currentIndex + direction, 0), lastIndex)
  return withActive(state, optionIds[nextIndex])
}

/**
 * Apply one keystroke. Returns the next state, whether to consume the event, and any effect.
 *
 * Keys the contract does not name are returned unchanged with `preventDefault: false`, so typing,
 * caret movement and browser shortcuts all behave natively.
 */
export function comboboxKeyDown(state: ComboboxState, key: string): ComboboxKeyResult {
  const hasOptions = state.optionIds.length > 0

  switch (key) {
    case 'ArrowDown':
    case 'ArrowUp': {
      // An empty option source has nothing to open. Decision: the listbox never opens on an empty
      // source, and the keystroke is NOT consumed, so the caret still moves — the field behaves as
      // the plain labelled input it currently is.
      if (!hasOptions) return result(state, false)
      if (!state.expanded) {
        return result(
          {
            expanded: true,
            activeOptionId: undefined,
            optionIds: state.optionIds,
            value: state.value,
          },
          true,
        )
      }
      return result(step(state, key === 'ArrowDown' ? 1 : -1), true)
    }

    case 'Home':
    case 'End': {
      // Only when the listbox is open; otherwise Home/End move the caret, which is what a typist
      // pressing them in a text field means.
      if (!state.expanded || !hasOptions) return result(state, false)
      const index = key === 'Home' ? 0 : state.optionIds.length - 1
      return result(withActive(state, state.optionIds[index]), true)
    }

    case 'Enter': {
      if (state.expanded && state.activeOptionId !== undefined) {
        return result(closed(state), true, { type: 'commit', optionId: state.activeOptionId })
      }
      // Nothing active: the form submits. Consuming this is what turns the field into a trap for
      // someone who typed the whole value and never opened the list.
      return result(state, false, { type: 'submit' })
    }

    case 'Escape': {
      // First Escape closes. Focus is never moved — the contract says so, and a combobox that
      // blurs on Escape loses a fast typist's place.
      if (state.expanded) return result(closed(state), true)
      // Second Escape clears the input.
      if (state.value !== '') return result(closed(state, ''), true)
      return result(state, false)
    }

    case 'Tab': {
      // Leaving the field closes the popup, but the keystroke is never swallowed: swallowing Tab
      // is the definition of a keyboard trap.
      return result(state.expanded ? closed(state) : state, false)
    }

    default:
      return result(state, false)
  }
}

/**
 * Re-point `activeOptionId` after the option source changes.
 *
 * `aria-activedescendant` must always name a rendered option. When the previously active option is
 * filtered away the active option is cleared rather than guessed at, and an empty source also
 * closes the listbox — an open, empty listbox announces "0 options" on every keystroke.
 */
export function reconcileActiveOption(
  state: ComboboxState,
  optionIds: readonly string[],
): ComboboxState {
  const stillRendered =
    state.activeOptionId !== undefined && optionIds.includes(state.activeOptionId)

  return {
    expanded: optionIds.length === 0 ? false : state.expanded,
    activeOptionId: stillRendered ? state.activeOptionId : undefined,
    optionIds,
    value: state.value,
  }
}
