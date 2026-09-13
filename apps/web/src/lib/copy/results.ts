/**
 * The `DIRECTIVE.md §27` result microcopy. Owner: `ux-copy-steward`.
 *
 * FIXED TEXT, same rule as `disclaimers.ts`: transcribed byte for byte, verified against
 * `DIRECTIVE.md` by `copy.test.ts`, never rewritten for tone. These are the sentences a traveler
 * reads at a gate, and they are worded to state what is known and what is not.
 *
 * FRESHNESS IS A FUNCTION, NOT A STRING. `§27` writes the freshness line as "Updated 6 minutes ago
 * from [source]." — that is a SHAPE, not copy. Shipping the literal would publish a number nobody
 * measured and a placeholder nobody filled (`AGENTS.md §1.1`, §1.6). The real age and the real
 * source id arrive with the datum and are interpolated here.
 */

export const results = {
  /** `§27` On track. */
  onTrack: 'No major disruption signal is visible right now.',

  /** `§27` Watch. */
  watch: 'Conditions are changing. Review the factors and keep alerts on.',

  /** `§27` At risk. */
  atRisk: 'Your itinerary has less room for recovery. Here are the most useful steps now.',

  /** `§27` Disrupted. */
  disrupted: 'A material disruption is confirmed. Start with the action checklist below.',

  /** `§27` Unknown. A designed state, never a blank and never a zero (`AGENTS.md §1.1`). */
  unknown: 'We do not have enough fresh information to make a reliable assessment.',

  /** `§27` Protected. Exported as `protectedItinerary`: `protected` is a reserved word. */
  protectedItinerary:
    'These segments appear to be on one protected itinerary. Confirm this on your ticket.',

  /** `§27` Self-transfer. */
  selfTransfer:
    "Separate tickets usually leave rebooking and baggage recovery to you. Build in more time and verify each airline's rules.",

  /** `§27` Topology missing. */
  topologyMissing:
    'Tell us whether both flights are on one reservation. That changes the connection and passenger-rights analysis.',

  /** `§27` Rights. The only permitted framing: "may apply", plus the rule version, plus the caveat. */
  rights:
    'Based on the facts entered and the rule version shown below, these rights may apply. The airline or regulator may reach a different conclusion after reviewing the full circumstances.',

  /** `§27` Stale. */
  stale:
    'The latest source response is older than expected. Treat this as context, not confirmation.',

  /** `§27` Demo. Required beside every demo panel (`AGENTS.md §1.2`, `DIRECTIVE.md §28`). */
  demo: 'Demo data — not a live flight.',
} as const

export type ResultKey = keyof typeof results

/**
 * The `§27` freshness line, with the real values.
 *
 * @param ageMinutes how old the source response is, in minutes, as measured — not rounded for looks
 * @param source the source id the datum carries, rendered as it arrived
 *
 * DECISIONS, recorded because each one could have gone the other way:
 *
 * - **Zero renders as "Updated 0 minutes ago".** "Updated just now" is not permitted: it is a
 *   softer claim than the data supports and it breaks the one shape `§27` fixes. Zero is honest and
 *   it keeps the sentence identical at every age.
 * - **A fractional age rounds UP.** Rounding down would report data as fresher than it is, and that
 *   is the direction that costs a traveler money. `4.2` minutes reads as five minutes, never four.
 * - **An age that is not a finite, non-negative number is not an age.** A negative age means a clock
 *   disagreement, not freshness, so the function returns the unknown-age sentence rather than
 *   printing a negative number into a result. A copy function never throws inside a render.
 */
export function freshness(ageMinutes: number, source: string): string {
  if (!Number.isFinite(ageMinutes) || ageMinutes < 0) return freshnessUnknown(source)
  const whole = Math.ceil(ageMinutes)
  const unit = whole === 1 ? 'minute' : 'minutes'
  return `Updated ${String(whole)} ${unit} ago from ${source}.`
}

/** The freshness line when the age of the response is not known. Never a blank, never a zero. */
export function freshnessUnknown(source: string): string {
  return `The age of the latest response from ${source} is not known.`
}
