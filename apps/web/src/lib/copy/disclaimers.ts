/**
 * The required disclaimers. Owner: `ux-copy-steward`.
 *
 * FIXED TEXT. Every string below is transcribed byte for byte from `DIRECTIVE.md` — `§26` for the
 * five result disclaimers, `§3.4` for the footer independence disclaimer, `§20` for the affiliate
 * module block. None of them is a draft, none is tunable for tone, and no caller may override one
 * or substitute a shorter version because it fits better. `copy.test.ts` re-reads `DIRECTIVE.md` at
 * test time and fails the build on a single changed character, in either direction.
 *
 * If one of these is wrong, it is escalated to the orchestrator and changed in `DIRECTIVE.md`
 * first. It is never improved in place here.
 *
 * PLACEMENT IS PART OF THE REQUIREMENT. `§26` is titled "placed near the relevant result — not only
 * in the footer". A disclaimer that only exists in the footer has not been shown to the person
 * reading the result it qualifies. `disclaimerPlacement` below is the machine-readable half of the
 * placement map in `docs/VOICE.md`; it is what the Phase 10 copy review is checked against.
 */

export const disclaimers = {
  /**
   * `DIRECTIVE.md §3.4`, verbatim. Ships in the footer of EVERY public page (`AGENTS.md §1.4`).
   * It does not substitute for any of the five below, and none of them substitutes for it.
   */
  independence:
    'DelayPilot is an independent travel-information tool. It is not an airline, airport, government agency, law firm, claims company, or flight-data provider. Guidance is informational and may not reflect every fact in your case.',

  /** `DIRECTIVE.md §26` Flight data, verbatim. */
  flightData:
    'Flight information can change quickly. Confirm critical details with the operating airline and airport.',

  /** `DIRECTIVE.md §26` Prediction, verbatim. */
  prediction: 'This is an estimate, not an airline decision or safety forecast.',

  /** `DIRECTIVE.md §26` Connection, verbatim. */
  connection:
    'Walking, security, immigration, baggage, gate-close rules, and airline assistance can change the outcome.',

  /** `DIRECTIVE.md §26` Rights, verbatim. */
  rights:
    "Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.",

  /** `DIRECTIVE.md §26` Affiliate, verbatim. The short form, for a single link. */
  affiliate:
    'Partner link · DelayPilot may earn a commission if you purchase. This does not change our assessment.',

  /**
   * `DIRECTIVE.md §20` block quote, verbatim. The long form, for an affiliate MODULE. It says
   * "operational or passenger-rights assessment" where `§26` says "assessment"; both are required
   * text, and the module one renders ABOVE the links, inside the module.
   */
  affiliateModule:
    'Partner link · DelayPilot may earn a commission if you purchase. This does not change our operational or passenger-rights assessment.',
} as const

export type DisclaimerKey = keyof typeof disclaimers

/**
 * Where each disclaimer renders. Surfaces are named in the terms this release actually builds.
 *
 * A disclaimer is "beside" a result when a reader who can see the result can see the disclaimer
 * without scrolling, opening a disclosure, or following a link.
 */
export const disclaimerPlacement: Readonly<Record<DisclaimerKey, readonly string[]>> = {
  independence: ['footer of every public page'],
  flightData: [
    'flight-status surface',
    'segment card',
    'lookup result states',
    'any notification carrying a status change',
  ],
  prediction: [
    'delay and cancellation assessment block, adjacent to the band',
    'delay-risk explainer',
  ],
  connection: [
    'connection cockpit, next to slack and the transfer components',
    'connection-risk explainer',
  ],
  rights: ['every rights card', 'every rights explainer', 'the evidence packet'],
  affiliate: ['a single affiliate link outside a module'],
  affiliateModule: ['inside every affiliate module, above the links'],
}
