/**
 * Provenance vocabulary and the sentences that go with it. Owner: `ux-copy-steward`.
 *
 * THE SIX LABELS ARE THE WHOLE VOCABULARY (`AGENTS.md §1.2`, `DIRECTIVE.md §3.3`). There is no
 * seventh, no synonym, and no softened variant. Not "Fresh", not "Recent", not "Approximate", not
 * "Estimated risk", and not the two-word softener beginning with the superlative this repository
 * bans outright. A label may not be omitted to make a screen look tidier, and a value with no label
 * does not get displayed at all.
 *
 * `Demo` never ships alone: it carries `results.demo` — "Demo data — not a live flight."
 *
 * `Unavailable` never renders as a blank, a dash, or a zero. It renders a sentence that names the
 * SPECIFIC missing fact, and, where one exists, the next useful step. That is what
 * `unavailableReasons` is for: "The gate has not been published yet." tells a traveler something;
 * "—" tells them the product is broken.
 */

/** `AGENTS.md §1.2`, verbatim. Six entries, exactly these words. Adding a seventh is a defect. */
export const provenanceLabels: Readonly<
  Record<'live' | 'cached' | 'stale' | 'demo' | 'unavailable' | 'heuristic', string>
> = {
  live: 'Live',
  cached: 'Cached',
  stale: 'Stale',
  demo: 'Demo',
  unavailable: 'Unavailable',
  heuristic: 'Heuristic risk band',
}

export type ProvenanceKey = keyof typeof provenanceLabels

/** Iteration order for the provenance section of the homepage: strongest claim to weakest. */
export const provenanceOrder: readonly ProvenanceKey[] = [
  'live',
  'cached',
  'stale',
  'demo',
  'unavailable',
  'heuristic',
]

/**
 * One plain sentence per label, for the homepage trust section and the methodology page.
 *
 * These explain what the label MEANS, not what we would like a reader to feel about it. `Stale` is
 * not reassured into "recent"; `Heuristic risk band` says outright that no percentage exists.
 */
export const provenanceMeanings: Readonly<Record<ProvenanceKey, string>> = {
  live: 'A licensed provider answered, and the answer is inside the freshness threshold for that source.',
  cached:
    'A provider answer we already had, still inside the cache window the license permits. Older than live, and labeled as such.',
  stale:
    'Past the normal freshness threshold. Still shown, because out-of-date context beats no context — but shown as stale, and never as confirmation.',
  demo: 'Fixture data from the demonstration itinerary. It is not a real flight, and every demo panel says so.',
  unavailable:
    'No trustworthy answer exists. The value stays unknown, the screen names the fact that is missing, and nothing is filled in to cover the gap.',
  heuristic:
    'A qualitative band, not a probability. No calibrated model is deployed, so DelayPilot shows a band and the factors behind it, and no percentage anywhere.',
}

/**
 * The `unavailable` and `unknown` sentences, one per missing fact.
 *
 * `fact` names exactly what is missing. `nextStep` is what the reader can usefully do about it, or
 * `null` when there is nothing honest to suggest — an invented next step is as bad as an invented
 * value.
 */
export interface UnavailableReason {
  readonly fact: string
  readonly nextStep: string | null
}

export const unavailableReasons: Readonly<
  Record<
    | 'gateNotPublished'
    | 'terminalNotPublished'
    | 'estimateNotPublished'
    | 'causeNotVerified'
    | 'providerNotConnected'
    | 'noRuleSetInForce'
    | 'noCalibratedModel'
    | 'topologyUnknown'
    | 'airlineSizeUnknown'
    | 'noticeUnknown'
    | 'officialSourceUnavailable'
    | 'contactNotConfigured',
    UnavailableReason
  >
> = {
  gateNotPublished: {
    fact: 'The gate has not been published yet.',
    nextStep: 'Airport departure boards usually show it before the airline app does.',
  },
  terminalNotPublished: {
    fact: 'The terminal has not been published yet.',
    nextStep: 'Check the airport site for this flight before you plan the transfer.',
  },
  estimateNotPublished: {
    fact: 'No estimated time has been published for this segment.',
    nextStep: 'The scheduled time is what we have. Treat it as a plan, not a prediction.',
  },
  causeNotVerified: {
    fact: 'The disruption cause has not been verified.',
    nextStep:
      'Ask the airline for its reason in writing. Which rights may apply often turns on that answer.',
  },
  providerNotConnected: {
    fact: 'No licensed flight-data provider is connected in this deployment, so live flight status cannot be shown.',
    nextStep:
      'Open the demonstration itinerary to see how a result is presented, or check the flight with the operating airline.',
  },
  noRuleSetInForce: {
    fact: 'No passenger-rights rule set is in force in this deployment, so no rule version can be applied to your facts.',
    nextStep:
      'The rights explainers describe how each framework works and link to the official source.',
  },
  noCalibratedModel: {
    fact: 'No calibrated model is deployed, so no probability is available for this assessment.',
    nextStep: 'Read the heuristic risk band and the factors listed beside it.',
  },
  topologyUnknown: {
    fact: 'Whether both flights sit on one reservation is unknown.',
    nextStep:
      'Check your ticket and tell us. It changes both the connection analysis and the rights analysis.',
  },
  airlineSizeUnknown: {
    fact: "The airline's size classification has not been confirmed against the official source.",
    nextStep:
      'Canadian compensation bands depend on it, so the estimate stays open until it is confirmed.',
  },
  noticeUnknown: {
    fact: 'How much notice the airline gave has not been established.',
    nextStep: 'Find the message that announced the change and note the date and time it arrived.',
  },
  officialSourceUnavailable: {
    fact: 'The official source for this rule could not be reached, so the version shown cannot be re-verified right now.',
    nextStep: 'The rule version and its last verified date are shown beside the assessment.',
  },
  contactNotConfigured: {
    fact: 'No contact address is configured for this deployment.',
    nextStep: null,
  },
}

export type UnavailableReasonKey = keyof typeof unavailableReasons
