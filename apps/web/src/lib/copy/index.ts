/**
 * DelayPilot in-product copy. Owner: `ux-copy-steward` (`docs/agents/ROSTER.md §3`).
 *
 * EVERY STRING A USER READS COMES FROM HERE. A component, a layout, or a page that holds a literal
 * has taken the voice out of one owner's hands, and the next person to edit it will not know that
 * the sentence beside it is fixed text from `DIRECTIVE.md §26`. Import the constant.
 *
 * THE RULES THESE MODULES ENCODE, all of them from `AGENTS.md` and `DIRECTIVE.md`:
 *
 *  1. **Provenance is a closed vocabulary.** `Live`, `Cached`, `Stale`, `Demo`, `Unavailable`,
 *     `Heuristic risk band` — six words, no synonyms, no softening, never omitted (`§1.2`).
 *  2. **`§26` disclaimers and `§27` microcopy are fixed text.** Byte-exact, verified against
 *     `DIRECTIVE.md` at test time, never rewritten for tone. If one is wrong, it is escalated, not
 *     improved in place.
 *  3. **No number is written into a string.** Every figure arrives as an argument from a value that
 *     carried provenance and a calibration flag. The only digits in this tree are the demo
 *     identifiers and three enumerated identifier strings on the accessibility page.
 *  4. **No ticket-identifier vocabulary, anywhere** (`§2`) — not a label, a placeholder, help text,
 *     an error, or an example. DelayPilot has no field for anything printed on a ticket.
 *  5. **No legal overclaim** (`§1.3`). "May apply", "estimated rights", "based on the facts
 *     entered". A status label never upgrades its status.
 *  6. **`unknown` is a designed state** (`§1.1`). Every unknown has a sentence that names the
 *     specific missing fact, and never a blank, a dash, or a zero.
 *
 * The mechanical half of rule 5 is `./lint/` — a forbidden-phrase scanner that runs over the whole
 * repository, not only over this directory, because a phrase in a fixture or a test is a phrase
 * that reaches production eventually.
 *
 * Voice, both lists, the placement map, and the lint's rules: `docs/VOICE.md`.
 */

export {
  bandDescription,
  bandLabel,
  bandOrder,
  delayValueText,
  minutesText,
  requiredOfAvailableText,
  slackMinutesText,
} from './bands.ts'
export type { Band } from './bands.ts'

export { chronology } from './chronology.ts'
export {
  cockpit,
  connectionComponentsCaption,
  connectionHeading,
  demoAlertBody,
} from './cockpit.ts'
export type { ConnectionTopologyKey, DemoAlertId } from './cockpit.ts'
export { demo, demoAirportOrder } from './demo.ts'
export { disclaimerPlacement, disclaimers } from './disclaimers.ts'
export type { DisclaimerKey, NotedDisclaimerKey } from './disclaimers.ts'

export { home } from './home.ts'
export { lookup } from './lookup.ts'
export { copyright, nav } from './nav.ts'

export { accessibilityFeedback, contactPage, pages } from './pages.ts'

export {
  provenanceLabels,
  provenanceMeanings,
  provenanceOrder,
  unavailableReasons,
} from './provenance.ts'
export type { ProvenanceKey, UnavailableReason, UnavailableReasonKey } from './provenance.ts'

export { freshness, freshnessUnknown, results } from './results.ts'
export type { ResultKey } from './results.ts'

export { states } from './states.ts'
export type { SurfaceState } from './states.ts'
