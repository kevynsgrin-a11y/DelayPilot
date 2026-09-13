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
 *
 * `labels` is the one thing in this module that `DIRECTIVE.md` does not write: the accessible name
 * of each `role="note"`. It names the note, it never restates or softens the sentence inside it.
 */

/**
 * The seven fixed sentences. Private, because `DisclaimerKey` is derived from it: the exported
 * `disclaimers` object also carries the accessible names below, and a key set that mixed sentences
 * with labels would let `disclaimerPlacement` claim a surface for something that is not a
 * disclaimer.
 */
const sentences = {
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

export type DisclaimerKey = keyof typeof sentences

/**
 * The four `§26` disclaimers that render inside `role="note"`, and therefore need an accessible
 * name (`packages/ui/src/patterns/atoms.tsx`).
 *
 * `Extract` rather than a bare union, so a typo here fails the build instead of naming a note after
 * a disclaimer that does not exist.
 */
export type NotedDisclaimerKey = Extract<
  DisclaimerKey,
  'flightData' | 'prediction' | 'connection' | 'rights'
>

/**
 * The accessible name of each `role="note"`.
 *
 * A note with no name announces a qualifying sentence with no indication of WHAT it qualifies: a
 * screen-reader user hears "This is an estimate, not an airline decision or safety forecast" with
 * no way to tell which estimate. These four names supply that, they are short noun phrases, and
 * they are distinct from one another — "Prediction disclaimer" and "Connection disclaimer" sit on
 * the same page and must not sound alike when heard once, at speed.
 *
 * They are NOT headings and are not rendered visually: the visible context is the panel the note
 * sits in, and a visible duplicate of a heading is noise for everyone else.
 *
 * Four, not seven. The independence disclaimer is footer content in the `contentinfo` landmark,
 * which is already named; the two affiliate strings render inside an affiliate module, which is
 * named by its own heading, and no such module ships in this release.
 */
const labels: Readonly<Record<NotedDisclaimerKey, string>> = {
  flightData: 'Flight data disclaimer',
  prediction: 'Prediction disclaimer',
  connection: 'Connection disclaimer',
  rights: 'Passenger rights disclaimer',
}

/**
 * The disclaimers as callers consume them: the seven fixed sentences, plus `labels`.
 *
 * `labels` is the only member that is not a `DIRECTIVE.md` sentence. Everything else here is fixed
 * text and `copy.test.ts` holds the two key sets apart.
 */
export const disclaimers = { ...sentences, labels } as const

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
