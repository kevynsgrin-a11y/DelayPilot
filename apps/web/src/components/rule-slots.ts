/**
 * The rule-slot guard.
 *
 * Content bodies may carry `{{rule:<jurisdiction>:<dotted.path>}}` tokens. A slot is not a
 * placeholder in the `AGENTS.md §1.6` sense while it is unserved: it is a deliberate mechanism that
 * keeps time-sensitive regulatory VALUES out of article prose and inside versioned rule data
 * (`AGENTS.md §3.2` — "Time-sensitive regulatory prose lives in versioned rule data with effective
 * dates, never inline in a React component or an article body").
 *
 * The moment such a body is SERVED, though, the token has to resolve — to the value, its rule-set
 * version and its effective date — or the reader sees `{{rule:us:refund.significantDelay}}` on a
 * page about their legal rights. That is a placeholder in a shipped surface, and it is the worst
 * possible place for one.
 *
 * No rule set is in force in this deployment (`docs/BUILD_PLAN.md §7`), so no slot can resolve.
 * This therefore FAILS CLOSED (`AGENTS.md §1.5`): the build stops, naming the entry and the slot,
 * rather than emitting the page. Today no served entry contains one, so the guard is silent — and
 * it stays silent until someone promotes a regulatory entry to `publishable` ahead of its rule set,
 * which is exactly the mistake it exists to catch.
 *
 * When `rights-rules-engine` publishes a rule set, this function is replaced by a resolver that
 * substitutes the value and renders the version and effective date beside it. The signature is
 * deliberately (id, body) so that replacement is local.
 */

const SLOT = /\{\{\s*rule:([^:}]+):([^}]+)\}\}/g

export class UnresolvedRuleSlotError extends Error {
  override readonly name = 'UnresolvedRuleSlotError'
}

/**
 * Throw if `body` contains a rule slot.
 *
 * @param id  the entry id, so the failure names the file rather than the symptom
 * @param body the raw Markdown body
 */
export function assertNoUnresolvedRuleSlots(id: string, body: string): void {
  const slots = [...body.matchAll(SLOT)].map((match) => match[0])
  if (slots.length === 0) return

  throw new UnresolvedRuleSlotError(
    `${id} is served but contains ${String(slots.length)} unresolved rule slot(s): ` +
      `${slots.slice(0, 5).join(', ')}. No rule set is in force in this deployment, so the value, ` +
      `its rule-set version and its effective date cannot be rendered. Return the entry to ` +
      `source_review, or publish the rule set first. A raw {{rule:...}} token must never reach a ` +
      `reader (AGENTS.md §1.5, §1.6).`,
  )
}

/** True when the body carries at least one slot. Used by tests and by the index shells. */
export const hasRuleSlots = (body: string): boolean => new RegExp(SLOT.source).test(body)
