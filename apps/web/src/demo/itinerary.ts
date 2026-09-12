/**
 * The `DIRECTIVE.md §28` demonstration itinerary — INTERIM PRESENTATION FIXTURE.
 *
 * Owner: `frontend-ui-engineer`, temporarily. HANDOFF FILED: `to: integrations-provider-engineer` —
 * `data/fixtures/**` is yours in Phase 4, and this file is to be replaced by a fixture that the
 * `FixtureFlightProvider` serves through the real normalizer, so that the demo exercises the same
 * code path a licensed provider will. Until that exists, the site has no demo at all, and a site
 * with no demo cannot show a traveler what it does before they have a disruption to look up.
 *
 * WHAT IS PERMITTED HERE, and nothing else (`DIRECTIVE.md §28`, S3 dispatch decision 4):
 *   · clock times, scheduled and estimated · the computed delay in minutes
 *   · connection window / required / slack minutes and the transfer components with their
 *     derivation classes · the qualitative band · statuses · severities · the alert timeline.
 *
 * WHAT IS FORBIDDEN HERE, and is absent by construction:
 *   · any gate or terminal (both are `unknown` on every segment)
 *   · any probability or percentage — there is no `%` anywhere in this file, and
 *     `apps/web/scripts/verify-dist.mjs` asserts the same of the rendered cockpit markup
 *   · any price, statistic, rating, accuracy figure or user count
 *   · any rights AMOUNT: no rule set is in force in this deployment, so the demo rights card shows
 *     statuses only, against a rule set line that reads "Demo rule set" with no version and no date
 *     (a version number would be a claim about a legal instrument).
 *
 * IDENTIFIERS are fixed by the dispatch and are synthetic by construction: `Demo Airline`,
 * `DEMO 101`, `DEMO 202`, and `DM1` / `DM2` / `DM3`, whose digits mean they can never collide with
 * an IATA code. Each airport carries a REAL IANA zone, because a demo that renders times without a
 * zone would demonstrate the wrong thing (`AGENTS.md §3.3`).
 *
 * DETERMINISM. Every instant is a literal. Nothing here reads the clock, so two builds produce
 * byte-identical HTML (`AGENTS.md §3.4`) and a visual-regression run has something stable to
 * compare against.
 */

import {
  clockTime,
  known,
  localDate,
  segmentDelayMinutes,
  unknown,
  zoneName,
  type ActionItem,
  type AlertEvent,
  type ConnectionAssessment,
  type EvidenceChronologyEntry,
  type RightsAssessment,
  type RightsContextSource,
  type RightsSourceLink,
  type Segment,
  type SourceFreshnessRow,
  type TransferComponent,
  type ZonedTime,
} from '../../../../packages/ui/src/patterns/index.ts'
import { resolveSource } from '../components/source-registry.ts'
import { cockpit } from '../lib/copy/cockpit.ts'
import { demo } from '../lib/copy/demo.ts'
import { freshness, results } from '../lib/copy/results.ts'
import { provenanceMeanings, unavailableReasons } from '../lib/copy/provenance.ts'

/* ------------------------------------------------------------------------------------------- */
/* Airports. Three fictional codes, three real IANA zones.                                      */
/* ------------------------------------------------------------------------------------------- */

export const demoAirports = {
  DM1: { code: 'DM1', name: demo.airports.DM1, zone: 'America/Los_Angeles' },
  DM2: { code: 'DM2', name: demo.airports.DM2, zone: 'America/New_York' },
  DM3: { code: 'DM3', name: demo.airports.DM3, zone: 'Europe/Amsterdam' },
} as const

type DemoAirportCode = keyof typeof demoAirports

const at = (instant: string, code: DemoAirportCode): ZonedTime => ({
  instant,
  zone: demoAirports[code].zone,
  airport: demoAirports[code].code,
})

/* ------------------------------------------------------------------------------------------- */
/* Instants. All UTC, all literal.                                                              */
/* ------------------------------------------------------------------------------------------- */

const INSTANTS = {
  /** DEMO 101, DM1 → DM2. Scheduled 08:20 PDT, estimated 09:07 PDT. */
  firstScheduledDeparture: '2026-03-14T15:20:00Z',
  firstEstimatedDeparture: '2026-03-14T16:07:00Z',
  firstScheduledArrival: '2026-03-14T22:05:00Z',
  firstEstimatedArrival: '2026-03-14T22:49:00Z',

  /** DEMO 202, DM2 → DM3. Overnight, and it lands on the next local calendar date at DM3. */
  secondScheduledDeparture: '2026-03-14T23:55:00Z',
  secondScheduledArrival: '2026-03-15T07:30:00Z',

  /** The transfer at DM2. */
  gateIn: '2026-03-14T22:49:00Z',
  gateClose: '2026-03-14T23:40:00Z',

  /** Alert timeline. */
  alertMonitoring: '2026-03-13T15:20:00Z',
  alertInboundDelay: '2026-03-14T13:02:00Z',
  alertConnectionWatch: '2026-03-14T14:35:00Z',
  alertCancellation: '2026-03-14T20:10:00Z',
  alertRights: '2026-03-14T20:18:00Z',

  /** The action deadline that leads the checklist. */
  replacementDecision: '2026-03-14T22:30:00Z',
} as const

/** The age, in minutes, that the demo's freshness sentences report. A fixed fixture value. */
const DEMO_AGE_MINUTES = 4
const DEMO_STALE_AGE_MINUTES = 96
const DEMO_SOURCE = 'Demonstration fixture'
const DEMO_SECOND_SOURCE = 'Second demonstration fixture'

/**
 * The `Demo` label every fixture-backed panel carries, with its freshness sentence.
 *
 * Exported because `DemoCockpit.astro` renders four panels of its own — the trip header, overall
 * status, latest change and the assessment — that take no pattern component and therefore have no
 * provenance of their own to pass. Each of them displays a demo operational value, so each carries
 * this chip and `results.demo` beside it (`AGENTS.md §1.2`, `DIRECTIVE.md §28`, trust sweep F4).
 */
export const demoProvenance = {
  kind: 'demo',
  freshness: freshness(DEMO_AGE_MINUTES, DEMO_SOURCE),
} as const

const staleProvenance = {
  kind: 'stale',
  freshness: freshness(DEMO_STALE_AGE_MINUTES, DEMO_SOURCE),
} as const

/* ------------------------------------------------------------------------------------------- */
/* Segments.                                                                                    */
/* ------------------------------------------------------------------------------------------- */

/** Gate and terminal are unknown on every demo segment, and always will be (`§28`). */
const noGate = unknown(cockpit.unknown.gate)
const noTerminal = unknown(cockpit.unknown.terminal)

/**
 * The expandable operational detail every segment carries.
 *
 * THE DEMONSTRATION CAPTION IS NOT A VALUE OF "Status" (`docs/ACCESSIBILITY.md` F30). This list used
 * to pair `cockpit.segment.status` with `demo.note`, so the disclosure announced "Status: Every
 * airline, flight number, and airport here is invented..." while the cancelled segment paired the
 * same label with a real status sentence — one label meaning two things on one page. A `<dt>`/`<dd>`
 * pair is a programmatic assertion that the value is the thing the label names.
 *
 * The demonstration is now stated where it belongs: `results.demo` beside each panel's `Demo` chip
 * (`AGENTS.md §1.2`), and `demo.note` under the section banner.
 */
const operationalDetail = [
  { label: cockpit.rights.causeLabels.airlineStated, value: unknown(cockpit.unknown.cause) },
] as const

/** DEMO 101 — the delayed inbound segment (`§28`). */
export const demoSegmentInbound: Segment = {
  id: 'demo-101',
  airline: demo.airline,
  flightNumber: demo.flights.first,
  origin: {
    code: demoAirports.DM1.code,
    name: demoAirports.DM1.name,
    scheduled: at(INSTANTS.firstScheduledDeparture, 'DM1'),
    current: known({ time: at(INSTANTS.firstEstimatedDeparture, 'DM1'), estimated: true }),
  },
  destination: {
    code: demoAirports.DM2.code,
    name: demoAirports.DM2.name,
    scheduled: at(INSTANTS.firstScheduledArrival, 'DM2'),
    current: known({ time: at(INSTANTS.firstEstimatedArrival, 'DM2'), estimated: true }),
  },
  status: 'delayed',
  departureDelayMinutes: known(
    segmentDelayMinutes(INSTANTS.firstScheduledDeparture, INSTANTS.firstEstimatedDeparture),
  ),
  confidence: 'medium',
  provenance: demoProvenance,
  source: DEMO_SOURCE,
  gate: noGate,
  terminal: noTerminal,
  operationalDetail: [...operationalDetail],
}

/** DEMO 202 — the on-time segment (`§28`). */
export const demoSegmentOnward: Segment = {
  id: 'demo-202',
  airline: demo.airline,
  flightNumber: demo.flights.second,
  origin: {
    code: demoAirports.DM2.code,
    name: demoAirports.DM2.name,
    scheduled: at(INSTANTS.secondScheduledDeparture, 'DM2'),
    current: known({ time: at(INSTANTS.secondScheduledDeparture, 'DM2'), estimated: false }),
  },
  destination: {
    code: demoAirports.DM3.code,
    name: demoAirports.DM3.name,
    scheduled: at(INSTANTS.secondScheduledArrival, 'DM3'),
    current: known({ time: at(INSTANTS.secondScheduledArrival, 'DM3'), estimated: false }),
  },
  status: 'scheduled',
  departureDelayMinutes: known(
    segmentDelayMinutes(INSTANTS.secondScheduledDeparture, INSTANTS.secondScheduledDeparture),
  ),
  confidence: 'high',
  provenance: demoProvenance,
  source: DEMO_SOURCE,
  gate: noGate,
  terminal: noTerminal,
  operationalDetail: [...operationalDetail],
}

/** DEMO 202 — the cancellation state (`§28`). */
export const demoSegmentCanceled: Segment = {
  ...demoSegmentOnward,
  id: 'demo-202-canceled',
  status: 'canceled',
  origin: {
    ...demoSegmentOnward.origin,
    current: unknown(cockpit.unknown.estimatedTime),
  },
  destination: {
    ...demoSegmentOnward.destination,
    current: unknown(cockpit.unknown.estimatedTime),
  },
  departureDelayMinutes: unknown(cockpit.unknown.delay),
  confidence: 'high',
}

/** DEMO 101 — the stale-provider state (`§28`). */
export const demoSegmentStale: Segment = {
  ...demoSegmentInbound,
  id: 'demo-101-stale',
  confidence: 'low',
  provenance: staleProvenance,
}

/** DEMO 202 — the partial-data state (`§28`). */
export const demoSegmentPartial: Segment = {
  ...demoSegmentOnward,
  id: 'demo-202-partial',
  status: 'unknown',
  origin: { ...demoSegmentOnward.origin, current: unknown(cockpit.unknown.estimatedTime) },
  destination: {
    ...demoSegmentOnward.destination,
    current: unknown(cockpit.unknown.estimatedTime),
  },
  departureDelayMinutes: unknown(cockpit.unknown.delay),
  confidence: 'low',
  operationalDetail: [
    { label: cockpit.rights.causeLabels.airlineStated, value: unknown(cockpit.unknown.cause) },
    { label: cockpit.segment.status, value: unknown(cockpit.unknown.status) },
  ],
}

/** DEMO 101 — the conflicting-providers state (`§17`). Both snapshots render; neither is hidden. */
export const demoSegmentConflicting: Segment = {
  ...demoSegmentInbound,
  id: 'demo-101-conflicting',
  confidence: 'low',
  conflicting: {
    source: DEMO_SECOND_SOURCE,
    status: 'scheduled',
    freshness: freshness(DEMO_STALE_AGE_MINUTES, DEMO_SECOND_SOURCE),
    newestSource: DEMO_SOURCE,
  },
}

/* ------------------------------------------------------------------------------------------- */
/* Connection.                                                                                  */
/* ------------------------------------------------------------------------------------------- */

const minutes = (value: number) => known(value)

const sharedComponents = {
  deplane: {
    key: 'deplane',
    label: 'Leave the aircraft',
    minutes: minutes(12),
    applies: true,
    derivation: 'estimated',
  },
  walk: {
    key: 'walk',
    label: 'Walk between gates',
    minutes: minutes(14),
    applies: true,
    derivation: 'airport_derived',
  },
  security: {
    key: 'security',
    label: 'Security re-screening',
    minutes: minutes(8),
    applies: true,
    derivation: 'airport_derived',
  },
  immigrationNotRequired: {
    key: 'immigration',
    label: 'Border control',
    minutes: minutes(0),
    applies: false,
    derivation: 'airport_derived',
  },
  mobilityNotRequired: {
    key: 'mobility',
    label: 'Mobility assistance',
    minutes: minutes(0),
    applies: false,
    derivation: 'policy_derived',
  },
  uncertainty: {
    key: 'uncertainty',
    label: 'Uncertainty buffer',
    minutes: minutes(10),
    applies: true,
    derivation: 'estimated',
  },
} as const satisfies Record<string, TransferComponent>

const protectedComponents: readonly TransferComponent[] = [
  sharedComponents.deplane,
  sharedComponents.walk,
  sharedComponents.security,
  sharedComponents.immigrationNotRequired,
  {
    key: 'bag',
    label: 'Reclaim and recheck a bag',
    minutes: minutes(0),
    applies: false,
    derivation: 'policy_derived',
  },
  sharedComponents.mobilityNotRequired,
  sharedComponents.uncertainty,
]

const selfTransferComponents: readonly TransferComponent[] = [
  sharedComponents.deplane,
  sharedComponents.walk,
  sharedComponents.security,
  sharedComponents.immigrationNotRequired,
  {
    key: 'bag',
    label: 'Reclaim and recheck a bag',
    minutes: minutes(25),
    applies: true,
    derivation: 'policy_derived',
  },
  sharedComponents.mobilityNotRequired,
  sharedComponents.uncertainty,
]

const sumApplied = (components: readonly TransferComponent[]): number =>
  components.reduce(
    (total, component) =>
      component.applies && component.minutes.known ? total + component.minutes.value : total,
    0,
  )

/** `W = t_gateClose − t_gateIn`, computed from the instants rather than written down. */
const AVAILABLE_MINUTES = segmentDelayMinutes(INSTANTS.gateIn, INSTANTS.gateClose)

const PROTECTED_REQUIRED = sumApplied(protectedComponents)
const SELF_TRANSFER_REQUIRED = sumApplied(selfTransferComponents)

const gateInValue = known({ time: at(INSTANTS.gateIn, 'DM2'), estimated: true })
const gateCloseValue = known({ time: at(INSTANTS.gateClose, 'DM2'), estimated: true })

const connectionAirport = { code: demoAirports.DM2.code, name: demoAirports.DM2.name }

/** The tightening protected connection (`§28`). */
export const demoConnectionProtected: ConnectionAssessment = {
  id: 'demo-connection-protected',
  topology: 'protected',
  airport: connectionAirport,
  gateIn: gateInValue,
  gateClose: gateCloseValue,
  // The airline's own gate-close rule is not known here, so the figure is a labelled buffer.
  gateCloseRuleKnown: false,
  availableMinutes: known(AVAILABLE_MINUTES),
  requiredMinutes: known(PROTECTED_REQUIRED),
  slackMinutes: known(AVAILABLE_MINUTES - PROTECTED_REQUIRED),
  components: protectedComponents,
  band: 'watch',
  calibrated: false,
  assumptions: [
    // The cockpit's live state is the cancellation, so the first assumption says plainly what
    // these figures describe. A connection assessment that silently outlived its onward flight
    // would be a value with no date on it.
    'The onward flight has since been canceled. The figures below describe the transfer as it was assessed before that.',
    'The inbound flight arrives at the estimated gate-in time shown above.',
    'The transfer stays inside the same terminal and does not cross a border control.',
    'The checked bag travels through on the single reservation and is not reclaimed.',
  ],
  missingData: [
    unavailableReasons.gateNotPublished.fact,
    "The airline's published gate-close rule for this flight is not known, so the figure above is a buffer estimate.",
    unavailableReasons.causeNotVerified.fact,
  ],
  provenance: demoProvenance,
}

/** The same transfer on separate tickets (`§28` self-transfer comparison). */
export const demoConnectionSelfTransfer: ConnectionAssessment = {
  ...demoConnectionProtected,
  id: 'demo-connection-self-transfer',
  topology: 'self_transfer',
  requiredMinutes: known(SELF_TRANSFER_REQUIRED),
  slackMinutes: known(AVAILABLE_MINUTES - SELF_TRANSFER_REQUIRED),
  components: selfTransferComponents,
  band: 'at_risk',
  assumptions: [
    'The inbound flight arrives at the estimated gate-in time shown above.',
    "The bag is reclaimed at the belt and rechecked at the second airline's desk.",
    'No airline is responsible for the onward flight if the first one arrives late.',
  ],
  missingData: [
    unavailableReasons.gateNotPublished.fact,
    "The second airline's check-in cutoff for this flight is not known.",
    unavailableReasons.causeNotVerified.fact,
  ],
}

/** `§17` connection: insufficient data / unknown topology. */
export const demoConnectionInsufficient: ConnectionAssessment = {
  ...demoConnectionProtected,
  id: 'demo-connection-unknown',
  topology: 'unknown',
  gateClose: unknown(unavailableReasons.estimateNotPublished.fact),
  availableMinutes: unknown(cockpit.unknown.connection),
  requiredMinutes: unknown(cockpit.unknown.connection),
  slackMinutes: unknown(cockpit.unknown.connection),
  band: 'unknown',
  components: protectedComponents.map((component) =>
    component.key === 'walk' || component.key === 'security'
      ? { ...component, minutes: unknown(cockpit.unknown.connection) }
      : component,
  ),
  assumptions: ['Nothing has been assumed: the reservation structure is not known.'],
  missingData: [unavailableReasons.topologyUnknown.fact, unavailableReasons.gateNotPublished.fact],
}

/* ------------------------------------------------------------------------------------------- */
/* Rights. Statuses only. No amounts — no rule set is in force in this deployment.              */
/* ------------------------------------------------------------------------------------------- */

const demoRuleSet = cockpit.rights.ruleSetDemo

/**
 * THE EVIDENCE CLASS COMES FROM THE REGISTRY, NOT FROM WHOEVER TYPED THE CALL.
 *
 * Trust sweep F3: this fixture listed the Council of the EU's press release under "Official sources"
 * beside a regulator record. `data/rights/sources/registry.json` already recorded it as
 * `evidenceClass: "secondary"` with `citableForRuleValues: false` — the fact was in the data and
 * nothing read it. So these two helpers read it, and a mis-filed id fails the BUILD rather than
 * shipping a press release dressed as a regulator (`DIRECTIVE.md §3.5`: a news summary never
 * outranks the regulator; `docs/EDITORIAL_POLICY.md`: the evidence class decides what a record can
 * carry).
 *
 * They throw rather than degrade because this is a build-time fixture, not a runtime path: there is
 * no traveler in front of a thrown error here, and `AGENTS.md §1.5` says fail closed. Both are
 * exported so `apps/web/test/demo-itinerary.test.ts` can assert the refusal in both directions.
 */
export function sourceLink(id: string, label: string): RightsSourceLink {
  const record = resolveSource(id)
  if (record.missing) {
    throw new Error(`demo fixture: no registry record for source id "${id}".`)
  }
  if (record.evidenceClass !== 'primary' || !record.citableForRuleValues) {
    throw new Error(
      `demo fixture: "${id}" is evidenceClass "${record.evidenceClass}" and cannot be listed as an ` +
        `official source. Pass it to contextSource() instead.`,
    )
  }
  return { id, label }
}

/** The other half: a record that reports ON a rule. Never a link, never counted as a source. */
export function contextSource(id: string, label: string): RightsContextSource {
  const record = resolveSource(id)
  if (record.missing) {
    throw new Error(`demo fixture: no registry record for source id "${id}".`)
  }
  if (record.evidenceClass === 'primary') {
    throw new Error(
      `demo fixture: "${id}" is a primary record and belongs in sources, not contextSources.`,
    )
  }
  return { id, label, evidenceClass: 'secondary' }
}

/** The US refund example (`§28`). Voluntary commitments are a separate, labelled module. */
export const demoRightsUnitedStates: RightsAssessment = {
  jurisdiction: 'United States',
  ruleSet: demoRuleSet,
  whatMayApply:
    "On the facts in this demonstration — an onward flight canceled by the airline, and a traveler who has not accepted a replacement — a refund of the unused portion may apply. Nothing else can be reached without the airline's stated reason.",
  whatWeStillNeed: [
    unavailableReasons.causeNotVerified.fact,
    unavailableReasons.noticeUnknown.fact,
    'Whether a replacement itinerary has been offered, and whether it has been accepted.',
  ],
  lines: [
    {
      key: 'refund',
      label: cockpit.rights.refund,
      status: 'may_apply',
      detail:
        'The flight was canceled by the airline and no replacement has been accepted, which is the situation a refund rule is written for.',
    },
    {
      key: 'rebooking',
      label: cockpit.rights.rebooking,
      status: 'cannot_determine',
      detail: cockpit.unknown.rights,
    },
    {
      key: 'care',
      label: cockpit.rights.care,
      status: 'cannot_determine',
      detail: cockpit.unknown.rights,
    },
    {
      key: 'compensation',
      label: cockpit.rights.compensation,
      status: 'cannot_determine',
      detail: cockpit.unknown.rights,
    },
    {
      key: 'deadline',
      label: cockpit.rights.deadline,
      status: 'cannot_determine',
      detail: unavailableReasons.noRuleSetInForce.fact,
    },
  ],
  evidenceChecklist: [
    'The message that announced the cancellation, with the date and time it arrived.',
    'The original booking confirmation showing the scheduled times.',
    'Any receipt for a meal, a hotel, or ground transport you paid for yourself.',
  ],
  sources: [
    sourceLink('dot-refunds', 'US Department of Transportation — refunds'),
    sourceLink(
      'dot-dashboard',
      'US Department of Transportation — airline customer service dashboard',
    ),
  ],
  voluntaryCommitments: {
    label: cockpit.voluntaryCommitments.label,
    detail: cockpit.voluntaryCommitments.explanation,
  },
  provenance: demoProvenance,
}

/** The EU rights example (`§28`). The 2026 reform appears only as a future rule. */
export const demoRightsEuropeanUnion: RightsAssessment = {
  jurisdiction: 'European Union',
  ruleSet: demoRuleSet,
  whatMayApply:
    'On the facts in this demonstration, a refund or a re-route, and care while waiting, may apply. Compensation turns on the reason the airline gives, and that reason has not been established.',
  whatWeStillNeed: [
    unavailableReasons.causeNotVerified.fact,
    unavailableReasons.noticeUnknown.fact,
    unavailableReasons.noRuleSetInForce.fact,
  ],
  lines: [
    {
      key: 'refund',
      label: cockpit.rights.refund,
      status: 'may_apply',
      detail:
        "A canceled flight normally puts the choice between a refund and a re-route in the traveler's hands.",
    },
    {
      key: 'rebooking',
      label: cockpit.rights.rebooking,
      status: 'may_apply',
      detail: 'A re-route at the earliest opportunity is the usual alternative to a refund.',
    },
    {
      key: 'care',
      label: cockpit.rights.care,
      status: 'may_apply',
      detail:
        'Meals and, where an overnight wait follows, accommodation are normally owed while waiting.',
    },
    {
      key: 'compensation',
      label: cockpit.rights.compensation,
      status: 'cannot_determine',
      detail: cockpit.rights.causeNote,
    },
    {
      key: 'deadline',
      label: cockpit.rights.deadline,
      status: 'cannot_determine',
      detail: unavailableReasons.noRuleSetInForce.fact,
    },
  ],
  evidenceChecklist: [
    'The message that announced the cancellation, with the date and time it arrived.',
    "The airline's stated reason, in writing.",
    'Receipts for anything you paid for while waiting.',
  ],
  sources: [sourceLink('eu-your-europe-air', 'European Commission — air passenger rights')],
  /*
   * The Council press release reports on the reform; it is not the reform, and the registry records
   * it as `evidenceClass: "secondary"`, `citableForRuleValues: false`. It is shown, because hiding
   * a record we consulted would be its own kind of dishonesty — in its own labelled block, as text,
   * never counted among the official sources (trust sweep F3).
   */
  contextSources: [
    contextSource('eu-council-2026-07-13', 'Council of the European Union — press release'),
  ],
  futureRule: {
    label: 'The 2026 reform of the EU air passenger rights regulation',
    status: 'future_rule_not_active',
    detail:
      'The reform has been adopted but is not in force: it enters into force on a date computed from its publication in the Official Journal, and that date has not been verified here. Events before it are assessed under the rule currently in effect.',
  },
  provenance: demoProvenance,
}

/* ------------------------------------------------------------------------------------------- */
/* Delay and cancellation assessment factors.                                                   */
/*                                                                                              */
/* What put the band where it is, in words. There is no weight, no score and no percentage: no  */
/* calibrated model is deployed, so a number here would be a number nobody validated            */
/* (`DIRECTIVE.md §13`).                                                                        */
/* ------------------------------------------------------------------------------------------- */

export const demoAssessmentFactors: readonly string[] = [
  `${demo.flights.second} is reported canceled by the operating airline, which is a confirmed disruption rather than a forecast.`,
  `${demo.flights.first} is estimated to depart later than scheduled, which leaves the transfer at ${demoAirports.DM2.code} with less room than planned.`,
  unavailableReasons.causeNotVerified.fact,
]

/* ------------------------------------------------------------------------------------------- */
/* Actions.                                                                                     */
/* ------------------------------------------------------------------------------------------- */

export const demoActions: readonly ActionItem[] = [
  {
    id: 'decide-replacement',
    label: 'Decide on the replacement itinerary the airline has offered',
    detail:
      'The offer in this demonstration expires before the original departure time, so it is the step with the nearest deadline.',
    deadline: known(at(INSTANTS.replacementDecision, 'DM2')),
    reversible: false,
    consequence:
      'Accepting a replacement itinerary may end the option of a cash refund for the flight that was canceled.',
    jurisdiction: 'United States',
    sources: [sourceLink('dot-refunds', 'US Department of Transportation — refunds')],
  },
  {
    id: 'request-refund',
    label: 'Ask for a refund of the unused portion instead',
    detail:
      'A refund and a replacement are alternatives, not a sequence. Choosing one closes the other.',
    deadline: unknown(unavailableReasons.noRuleSetInForce.fact),
    reversible: false,
    consequence:
      'Declining the replacement itinerary gives up the seat on it. If the refund is later refused, that seat may already be gone.',
    jurisdiction: 'United States',
    sources: [sourceLink('dot-refunds', 'US Department of Transportation — refunds')],
  },
  {
    id: 'ask-reason',
    label: 'Ask the airline for the cancellation reason in writing',
    detail:
      'Which rules may apply often turns on the reason the airline gives. A screenshot of the app is not the same as a written statement.',
    deadline: unknown(unavailableReasons.causeNotVerified.fact),
    reversible: true,
    sources: [sourceLink('eu-your-europe-air', 'European Commission — air passenger rights')],
  },
  {
    id: 'keep-receipts',
    label: 'Keep every receipt from here on',
    detail:
      'Meals, transport, and any overnight stay. Photograph each one now; the evidence packet has a place for them.',
    deadline: unknown(unavailableReasons.noRuleSetInForce.fact),
    reversible: true,
    sources: [],
  },
]

/* ------------------------------------------------------------------------------------------- */
/* Alerts.                                                                                      */
/* ------------------------------------------------------------------------------------------- */

export const demoAlerts: readonly AlertEvent[] = [
  {
    id: 'alert-monitoring',
    severity: 'info',
    title: 'Monitoring started for this itinerary',
    detail: cockpit.alerts.severityMeanings.info,
    at: at(INSTANTS.alertMonitoring, 'DM1'),
    provenance: demoProvenance,
  },
  {
    id: 'alert-inbound-delay',
    severity: 'watch',
    title: `${demo.flights.first} is now estimated to depart later than scheduled`,
    detail: cockpit.alerts.severityMeanings.watch,
    at: at(INSTANTS.alertInboundDelay, 'DM1'),
    provenance: demoProvenance,
  },
  {
    id: 'alert-connection-watch',
    severity: 'watch',
    title: 'Connection slack has narrowed toward the required transfer time',
    detail: cockpit.connection.topology.protectedBody,
    at: at(INSTANTS.alertConnectionWatch, 'DM2'),
    provenance: demoProvenance,
  },
  {
    id: 'alert-cancellation',
    severity: 'urgent',
    title: `${demo.flights.second} has been canceled`,
    detail: cockpit.alerts.severityMeanings.urgent,
    at: at(INSTANTS.alertCancellation, 'DM2'),
    provenance: demoProvenance,
  },
  {
    id: 'alert-rights',
    severity: 'info',
    title: 'The rights estimate has been updated with the new facts',
    detail: results.rights,
    at: at(INSTANTS.alertRights, 'DM2'),
    provenance: demoProvenance,
  },
]

/* ------------------------------------------------------------------------------------------- */
/* Evidence.                                                                                    */
/* ------------------------------------------------------------------------------------------- */

export const demoChronology: readonly EvidenceChronologyEntry[] = [
  {
    id: 'chron-1',
    at: at(INSTANTS.alertInboundDelay, 'DM1'),
    what: `${demo.flights.first} estimated departure moved later than scheduled`,
    source: DEMO_SOURCE,
  },
  {
    id: 'chron-2',
    at: at(INSTANTS.alertConnectionWatch, 'DM2'),
    what: 'Connection slack recomputed against the new estimate',
    source: DEMO_SOURCE,
  },
  {
    id: 'chron-3',
    at: at(INSTANTS.alertCancellation, 'DM2'),
    what: `${demo.flights.second} reported as canceled`,
    source: DEMO_SOURCE,
  },
  {
    id: 'chron-4',
    at: at(INSTANTS.alertRights, 'DM2'),
    what: 'Rights estimate regenerated against the rule set shown',
    source: DEMO_SOURCE,
  },
]

export const demoEvidenceSummary: readonly string[] = [
  `${demo.airline} ${demo.flights.first}: ${demoAirports.DM1.code} ${demoAirports.DM1.name} to ${demoAirports.DM2.code} ${demoAirports.DM2.name}.`,
  `${demo.airline} ${demo.flights.second}: ${demoAirports.DM2.code} ${demoAirports.DM2.name} to ${demoAirports.DM3.code} ${demoAirports.DM3.name}.`,
  'One reservation covering both flights, according to this demonstration.',
]

/**
 * The original schedule, in words.
 *
 * Composed from the SAME formatters the segment cards use, never written out by hand: a schedule
 * line that drifts from the card above it is a record that contradicts the thing it is a record of,
 * and the evidence packet is the one surface where that would be handed to a regulator.
 */
const scheduleLine = (
  flight: string,
  from: (typeof demoAirports)[DemoAirportCode],
  fromInstant: string,
  to: (typeof demoAirports)[DemoAirportCode],
  toInstant: string,
): string =>
  `${flight} was scheduled to depart ${from.code} at ${clockTime(fromInstant, from.zone)} ` +
  `${zoneName(fromInstant, from.zone)} (${from.zone}) on ${localDate(fromInstant, from.zone)}, ` +
  `and to arrive ${to.code} at ${clockTime(toInstant, to.zone)} ${zoneName(toInstant, to.zone)} ` +
  `(${to.zone}) on ${localDate(toInstant, to.zone)}.`

export const demoEvidenceSchedule: readonly string[] = [
  scheduleLine(
    demo.flights.first,
    demoAirports.DM1,
    INSTANTS.firstScheduledDeparture,
    demoAirports.DM2,
    INSTANTS.firstScheduledArrival,
  ),
  scheduleLine(
    demo.flights.second,
    demoAirports.DM2,
    INSTANTS.secondScheduledDeparture,
    demoAirports.DM3,
    INSTANTS.secondScheduledArrival,
  ),
]

export const demoEvidenceMissing: readonly string[] = [
  unavailableReasons.causeNotVerified.fact,
  unavailableReasons.noticeUnknown.fact,
  unavailableReasons.gateNotPublished.fact,
  unavailableReasons.noRuleSetInForce.fact,
]

/* ------------------------------------------------------------------------------------------- */
/* Source and freshness panel.                                                                  */
/* ------------------------------------------------------------------------------------------- */

export const demoSourceRows: readonly SourceFreshnessRow[] = [
  {
    id: 'status',
    subject: cockpit.headings.segments,
    source: DEMO_SOURCE,
    kind: 'demo',
    freshness: freshness(DEMO_AGE_MINUTES, DEMO_SOURCE),
    meaning: provenanceMeanings.demo,
  },
  {
    id: 'earlier-snapshot',
    subject: cockpit.headings.latestChange,
    source: DEMO_SECOND_SOURCE,
    kind: 'stale',
    freshness: freshness(DEMO_STALE_AGE_MINUTES, DEMO_SECOND_SOURCE),
    meaning: provenanceMeanings.stale,
  },
  {
    id: 'band',
    subject: cockpit.headings.connection,
    source: DEMO_SOURCE,
    kind: 'heuristic',
    freshness: unavailableReasons.noCalibratedModel.fact,
    meaning: provenanceMeanings.heuristic,
  },
  {
    id: 'cause',
    subject: cockpit.rights.causeLabels.airlineStated,
    source: DEMO_SOURCE,
    kind: 'unavailable',
    freshness: unavailableReasons.causeNotVerified.fact,
    meaning: provenanceMeanings.unavailable,
  },
  {
    id: 'rule-set',
    subject: cockpit.headings.rights,
    source: DEMO_SOURCE,
    kind: 'unavailable',
    freshness: unavailableReasons.noRuleSetInForce.fact,
    meaning: provenanceMeanings.unavailable,
  },
]

/* ------------------------------------------------------------------------------------------- */
/* The trip header.                                                                             */
/* ------------------------------------------------------------------------------------------- */

export const demoTrip = {
  title: `${demoAirports.DM1.name} to ${demoAirports.DM3.name}`,
  /** Rendered through `localDate`, so the date carries the origin airport's own calendar. */
  dateInstant: INSTANTS.firstScheduledDeparture,
  dateZone: demoAirports.DM1.zone,
  travelers: 'One traveler',
  monitoringState: cockpit.trip.monitoringStates.notAvailable,
} as const
