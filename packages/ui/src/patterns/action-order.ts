/**
 * Action-checklist ordering.
 *
 * `.claude/agents/frontend-ui-engineer.md`: "time sensitivity first (soonest-expiring deadline
 * leads), then reversibility — irreversible choices (accepting a voucher, accepting a rebooking,
 * declining a changed itinerary) rank above reversible ones and carry an explicit consequence
 * line. Rank internally with `U = p_cancel·c_cancel + p_miss·c_miss + p_delay60·c_delay`; never
 * display U, never render it as a probability."
 *
 * `U` is therefore a SORT KEY and nothing else. It is computed upstream, carried on the item, used
 * here as a tie-break, and never read by a renderer — `ActionChecklist.tsx` has no access path to
 * it beyond this comparator. That separation is deliberate: the moment a utility score reaches a
 * screen it reads as a probability, and no calibrated model exists to make it one
 * (`DIRECTIVE.md §13`).
 *
 * The sort is total and deterministic (`AGENTS.md §3.4`): every comparison falls through to the
 * item id, so two runs over the same input produce byte-identical output.
 */

import type { ActionItem } from './types.ts'

/** The `U` terms, kept here so the formula lives in exactly one place (`AGENTS.md §3.2`). */
export interface UtilityInputs {
  readonly pCancel: number
  readonly cCancel: number
  readonly pMiss: number
  readonly cMiss: number
  readonly pDelay60: number
  readonly cDelay: number
}

/**
 * `U = p_cancel·c_cancel + p_miss·c_miss + p_delay60·c_delay`.
 *
 * Internal ranking only. Never displayed, never rendered as a probability, never labelled as a
 * score to a user.
 */
export function actionUtility(inputs: UtilityInputs): number {
  return (
    inputs.pCancel * inputs.cCancel + inputs.pMiss * inputs.cMiss + inputs.pDelay60 * inputs.cDelay
  )
}

const deadlineRank = (item: ActionItem): number =>
  item.deadline.known ? new Date(item.deadline.value.instant).getTime() : Number.POSITIVE_INFINITY

/**
 * Order a checklist: soonest deadline, then irreversible before reversible, then higher `U`, then
 * id. An item with no known deadline sorts AFTER every item with one — never before, because an
 * unknown deadline is not an urgent deadline.
 */
export function orderActionItems(items: readonly ActionItem[]): readonly ActionItem[] {
  return [...items].sort((a, b) => {
    // Compared, never subtracted. Two items with no known deadline both rank
    // `Number.POSITIVE_INFINITY`, and `Infinity - Infinity` is `NaN` — a comparator that returns
    // NaN makes `Array.prototype.sort` implementation-defined, which is how a checklist ordered by
    // irreversibility silently came out in input order instead. Caught by
    // `apps/web/test/demo-itinerary.test.ts`, "the action checklist ordering is deterministic".
    const rankA = deadlineRank(a)
    const rankB = deadlineRank(b)
    if (rankA !== rankB) return rankA < rankB ? -1 : 1

    if (a.reversible !== b.reversible) return a.reversible ? 1 : -1

    const utilityDelta = (b.utility ?? 0) - (a.utility ?? 0)
    if (utilityDelta !== 0) return utilityDelta

    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  })
}
