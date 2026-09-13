/**
 * Trip cockpit copy, in the `DIRECTIVE.md §18.5` order. Owner: `ux-copy-steward`.
 *
 * This is the surface a traveler reads while standing at a gate, so the order of the words matters
 * as much as the words: what changed, what it means, what to do next — in that order, every time.
 *
 * WHAT THIS BUILD RENDERS. `§28` demo mode only. Nothing here is wired to a provider, a model, a
 * rule set, or a payment processor, and each of those absences has its own honest state below
 * rather than a blank. The labels are written so the same module serves a live cockpit unchanged
 * when those systems land.
 *
 * PER-FIELD UNKNOWNS. `unknown` names the missing fact — never "—", never "N/A", never zero
 * (`AGENTS.md §1.1`). The sentences come from `provenance.unavailableReasons` so the same fact is
 * worded the same way wherever it appears.
 */

import { disclaimers } from './disclaimers.ts'
import { results } from './results.ts'
import { unavailableReasons } from './provenance.ts'

export const cockpit = {
  /** `DIRECTIVE.md §28`: the explicit banner over every demo surface. */
  demoBanner: 'Demonstration itinerary',

  /** `DIRECTIVE.md §27` Demo, verbatim. Every demo panel carries it. */
  demoCaption: results.demo,

  /** Section headings, in the `§18.5` order. Rendering them out of order is a defect. */
  headings: {
    trip: 'Itinerary',
    overallStatus: 'Overall status',
    timeline: 'Route',
    segments: 'Segments',
    latestChange: 'Latest change',
    nextStep: 'Next step',
    assessment: 'Delay and cancellation assessment',
    connection: 'Connection',
    conditions: 'Weather and airspace',
    rights: 'Passenger rights',
    evidence: 'Evidence',
    alerts: 'Alerts',
    sources: 'Sources and freshness',
    upgrade: 'Trip Pass',
  },

  /** Order the headings render in. The frontend iterates this, it does not re-sort it. */
  headingOrder: [
    'trip',
    'overallStatus',
    'timeline',
    'segments',
    'latestChange',
    'nextStep',
    'assessment',
    'connection',
    'conditions',
    'rights',
    'evidence',
    'alerts',
    'sources',
    'upgrade',
  ],

  trip: {
    dateLabel: 'Travel date',
    travelersLabel: 'Travelers',
    monitoringLabel: 'Monitoring',
    monitoringStates: {
      pending: 'Starting',
      active: 'On',
      paused: 'Paused',
      completed: 'Finished',
      notAvailable: 'Not available in this deployment',
    },
  },

  /** `§18.5` segment card. Every time carries its airport code and zone (`AGENTS.md §3.3`). */
  segment: {
    airlineAndFlight: 'Airline and flight',
    from: 'From',
    to: 'To',
    scheduled: 'Scheduled',
    estimated: 'Estimated',
    status: 'Status',
    delay: 'Delay',
    gate: 'Gate',
    terminal: 'Terminal',
    source: 'Source',
    updated: 'Updated',
    confidence: 'Confidence',
    details: 'Operational detail',
    detailsToggle: 'Show operational detail',

    departs: 'Departs',
    arrives: 'Arrives',
    /** Shown when the arrival falls on a later local date than the departure (`AGENTS.md §3.3`). */
    nextDay: 'Arrives on a later local date',
    /** Accessible prefix for the airport-code-and-zone line under every time. */
    zone: 'Airport and time zone',

    /** The eight `§17` flight-data statuses. "Status unknown" never collides with a band word. */
    statusLabels: {
      scheduled: 'Scheduled',
      delayed: 'Delayed',
      canceled: 'Canceled',
      diverted: 'Diverted',
      returned: 'Returned to gate',
      departed: 'Departed',
      landed: 'Landed',
      unknown: 'Status unknown',
    },

    /**
     * `§18.5` confidence. A qualitative word about the ANSWER, not a probability about the flight:
     * it describes how fresh the response is and whether the sources agree, and `confidenceNote`
     * says so wherever it is shown.
     */
    confidenceLabels: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
    confidenceNote:
      'Confidence describes this answer, not the flight: how fresh the source response is and whether the sources agree. It is not a probability.',

    /** `§17` conflicting providers. Both answers are shown; neither is silently dropped. */
    conflictHeading: 'Two sources disagree about this segment',
    conflictNewest: 'Newest high-quality source',
    conflictBody:
      'Both answers are shown because discarding one would hide a real disagreement. Confirm anything time-critical with the operating airline.',

    /** `DIRECTIVE.md §26` Flight data. Renders inside the card. */
    disclaimer: disclaimers.flightData,
  },

  /** `§18.5` horizontal itinerary on desktop, vertical timeline on mobile. */
  timeline: {
    /** Accessible name for the route list. DOM order is travel order, always. */
    label: 'Route, in the order it is flown',
    departure: 'Departure',
    connection: 'Connection',
    arrival: 'Arrival',
  },

  /** `§18.5` delay and cancellation assessment. Band and factors, never a percentage. */
  assessment: {
    bandLabel: 'Risk band',
    factorsHeading: 'What is driving this',
    methodLabel: 'Method',
    /** Renders wherever a band is shown and no calibrated model is deployed. */
    heuristicNote:
      'This is a heuristic band, not a model output. No calibrated model is deployed, so DelayPilot shows the band and the factors behind it and no probability.',
    /** `DIRECTIVE.md §26` Prediction. Renders adjacent to the band. */
    disclaimer: disclaimers.prediction,
  },

  /** `§18.5` connection cockpit. A linear meter, never a dial. */
  connection: {
    topology: {
      protectedLabel: 'One protected itinerary',
      protectedBody: results.protectedItinerary,
      selfTransferLabel: 'Separate tickets',
      selfTransferBody: results.selfTransfer,
      unknownLabel: 'Reservation unknown',
      unknownBody: results.topologyMissing,
    },
    gateIn: 'Estimated gate-in',
    gateClose: 'Estimated gate-close',
    availableMinutes: 'Available time',
    requiredMinutes: 'Required transfer time',
    slack: 'Slack',
    /**
     * `aria-label` for the connection meter, and for that meter only — a band meter on the delay
     * and cancellation assessment is a different quantity and takes `headings.assessment`.
     *
     * THE NAME NAMES WHAT THE BAR FILLS, like the reading does (`docs/VOICE.md §9.3`). It used to
     * say "Connection slack against the required transfer time", which named a third ratio: the
     * bar fills required transfer time within the available window, and the reading beside it says
     * "44 of 51 minutes" in that order, so a name about slack-against-required described neither.
     * `BandMeter` renders `label` into `aria-label` and nowhere visible, so the mismatch was
     * invisible to a sighted reader and unverifiable by the reader it was given to — which is the
     * asymmetry `docs/ACCESSIBILITY.md` B9 was raised about, one surface over.
     *
     * Announced with the reading and the band: "Required transfer time within the available
     * connection window, 44 of 51 minutes, Watch". Slack is still the row underneath, in words,
     * from `bands.slackMinutesText`.
     */
    meterLabel: 'Required transfer time within the available connection window',
    componentsHeading: 'Transfer components',
    componentsCaption: 'Every component of the required transfer time',
    columnStep: 'Transfer step',
    columnMinutes: 'Minutes',
    columnDerivation: 'How this was derived',
    notRequired: 'Not required on this transfer',
    /** Shown beside a gate-close figure when the airline's own rule is not known. */
    gateCloseBuffer: 'Buffer estimate, not an airline rule',
    bandScaleLabel: 'Band scale',
    currentBand: 'Current band',
    derivationLabel: 'How this was derived',
    derivation: {
      measured: 'Measured',
      policy: 'Policy-derived',
      airport: 'Airport-derived',
      estimated: 'Estimated',
    },
    bandLabel: 'Connection band',
    assumptionsHeading: 'Assumptions',
    missingDataHeading: 'What we do not know',
    actionsHeading: 'What to do now',
    /** `DIRECTIVE.md §26` Connection. Renders next to slack and the components. */
    disclaimer: disclaimers.connection,
  },

  /** `§18.5` rights card. Answer first, reasoning expandable. */
  rights: {
    jurisdiction: 'Jurisdiction',
    ruleSet: 'Rule set',
    ruleSetDemo: 'Demo rule set',
    ruleVersion: 'Rule version',
    lastVerified: 'Source last verified',
    whatMayApply: 'What may apply',
    whatWeStillNeed: 'What we still need to know',
    refund: 'Refund',
    rebooking: 'Rebooking',
    care: 'Care',
    compensation: 'Compensation',
    deadline: 'Deadline',
    evidence: 'Evidence checklist',
    officialSources: 'Official sources',
    currentVsFuture: 'Current rule and adopted reform',
    reasoningToggle: 'Show how this was reached',
    entitlementsHeading: 'What each rule says',
    sourceUnavailable: unavailableReasons.officialSourceUnavailable.fact,
    /** `DIRECTIVE.md §27` Rights, verbatim. The answer-first line at the top of the card. */
    summary: results.rights,
    /** The five permitted statuses (`AGENTS.md §1.3`). No label upgrades its status. */
    statusLabels: {
      likely_applies: 'Likely applies',
      may_apply: 'May apply',
      not_indicated: 'Not indicated',
      cannot_determine: 'Cannot determine',
      future_rule_not_active: 'Future rule, not active',
    },
    /** How a cause is rendered. Never as a determination (`AGENTS.md §1.3`). */
    causeLabels: {
      airlineStated: 'Airline-stated reason',
      providerStated: 'Provider-stated reason',
      userReported: 'What you told us',
      observedContext: 'Observed conditions',
      verifiedFinding: 'Verified finding',
    },
    causeNote:
      'A reason given by an airline or a provider is what was said, not what was established. Conditions observed near an airport are context and never proof of cause.',
    /** `DIRECTIVE.md §26` Rights. Renders inside every rights card. */
    disclaimer: disclaimers.rights,
  },

  /** `DIRECTIVE.md §3.5`: voluntary commitments live in their own module, never mixed with law. */
  voluntaryCommitments: {
    label: 'Voluntary airline commitments',
    explanation:
      'These are commitments an airline has published for itself. They are not statutory rights, they can change without a rule changing, and they are shown separately for that reason.',
  },

  /** `§18.5` action checklist. Ordered by time pressure and by what cannot be undone. */
  actions: {
    heading: 'Action checklist',
    orderNote:
      'Ordered by what is time-sensitive and what cannot be undone. Do the reversible things first where you can.',
    reversibleLabel: 'Can be undone',
    irreversibleLabel: 'Cannot be undone',
    sourceLabel: 'Source for this step',
    deadlineLabel: 'Deadline',
    jurisdictionLabel: 'Jurisdiction',
    consequenceLabel: 'If you do this',
    empty: 'There is no time-sensitive step for this itinerary right now.',
    neverOnYourBehalf:
      'DelayPilot does not file, claim, rebook, or buy anything for you. Every step here is one you take.',
  },

  /** `§18.5` evidence packet. Never auto-emailed, never auto-submitted. */
  evidence: {
    heading: 'Evidence',
    intro:
      'What to keep, in the order an airline or a regulator tends to ask for it. Everything stays yours.',
    whatToSave: 'What to save',
    missing: 'What is missing',
    exportLabel: 'Save or print',
    ruleSetLabel: 'Rule set',

    summaryHeading: 'Trip and segments',
    scheduleHeading: 'Original schedule',
    chronologyHeading: 'What changed, and when',
    messagesHeading: 'Airline messages you entered',
    expensesHeading: 'Receipts and expenses',
    rightsHeading: 'Rights assessment',
    sourcesHeading: 'Official sources',

    chronologyCaption: 'Status changes in the order they were recorded',
    expensesCaption: 'Expenses you entered, with the date and amount you recorded',
    columnWhen: 'When',
    columnWhat: 'What',
    columnSource: 'Source',
    columnAmount: 'Amount',

    emptyMessages: 'You have not entered any airline messages for this trip.',
    emptyExpenses: 'You have not entered any expenses for this trip.',
    neverSent:
      'The evidence packet is generated for you to keep. It is never emailed or submitted anywhere on your behalf.',
    /** `DIRECTIVE.md §26` Rights. The packet carries a rights assessment, so it carries this. */
    disclaimer: disclaimers.rights,
  },

  /** `§16` severities and delivery states. */
  alerts: {
    heading: 'Alerts',
    severityLabels: {
      info: 'Info',
      watch: 'Watch',
      urgent: 'Urgent',
      resolved: 'Resolved',
    },
    /**
     * The body of each alert in the `§28` demonstration timeline, keyed by the fixture's alert id.
     *
     * WHY THESE EXIST. `apps/web/src/demo/itinerary.ts` was passing a generic definition of each
     * SEVERITY as the body of three of the five alerts, so a specific event was explained by the
     * meaning of its rung — and the first one contradicted its own title outright, pairing
     * "Monitoring started for this itinerary" with a sentence saying a detail had changed and there
     * was nothing to do. `DIRECTIVE.md §16` requires a message to carry what changed, what it
     * means, and the next useful action. A definition of a severity carries none of those. Raised
     * as copy F-25 in the S3 re-check.
     *
     * THE DEFINITIONS THEMSELVES ARE GONE, and that is the other half of the fix. `severityMeanings`
     * described the four rungs in a second wording, one the alert-ladder explainer on the homepage
     * never used — that surface renders `home.monitoring.severities[]`, which is the one place the
     * rungs are described. Two wordings of one concept is a rule expressed in two places
     * (`AGENTS.md §3.2`), and an exported string with a plausible name and no call site is exactly
     * how a rung definition ended up under an alert title in the first place (`docs/VOICE.md §9.3`).
     * It was kept for one commit only, because deleting it before the fixture was rewired would
     * have broken the fixture; the frontend removed the last three call sites in `af24302` and it
     * is deleted here, as its own docblock undertook.
     *
     * KEYED BY ALERT ID, NOT ORDERED. An ordered tuple re-pairs every title with the wrong body the
     * first time somebody inserts an alert or reorders the timeline, silently, and a mismatched
     * title and body is the exact defect this export was written to fix. An id that no longer
     * exists is a type error; an id that is missing is a type error. Neither is a wrong sentence
     * under a right heading.
     *
     * WHAT THEY MAY SAY. Only what is in the fixture. No figure of any kind — the minutes, the
     * band, and the flight identifiers are already on the panels, carrying their provenance, and a
     * number repeated in an alert body is a number that can disagree with the one it came from. No
     * urgency beyond the rung: the `urgent` body is directive because the event is a confirmed
     * cancellation with an irreversible decision attached, not because an adjective was available.
     */
    demoBodies: {
      /** `info` — monitoring started. Nothing has happened yet, and the body must not pretend one has. */
      'alert-monitoring':
        'Both flights are now being watched, and so is the transfer between them. Nothing needs doing yet. This is the start of the record that every later change is measured against.',

      /** `watch` — the inbound estimate moved later. */
      'alert-inbound-delay':
        'The estimate moved; the schedule did not. A later departure leaves less room for the transfer at the connecting airport. Open the connection panel to see which part of the transfer is tight.',

      /** `watch` — slack narrowed toward the required transfer time. */
      'alert-connection-watch':
        'Slack is what is left once the transfer takes the time it needs, and there is less of it than before. The connection still works as scheduled. Read the transfer components to see which step to plan around.',

      /** `urgent` — the onward flight is cancelled. Directive, and no further than the facts go. */
      'alert-cancellation':
        'The onward flight is off, so this itinerary no longer completes as booked. What you accept next can close an option you still have. Work the action checklist before you accept anything.',

      /** `info` — the rights estimate was regenerated. Never upgrades a status. */
      'alert-rights':
        'The cancellation changed the facts, so the rights card was read again against the rule version shown on it. What may apply moves as facts arrive. Open the card to see what is still missing.',
    },
    quietHours: {
      label: 'Quiet hours',
      body: 'Inside quiet hours, info and watch alerts wait until they end. Urgent alerts are sent through only if you have allowed them to.',
    },
    channelsLabel: 'Where alerts go',
    empty: 'No alert has been recorded for this itinerary.',
    notConfigured:
      'Monitoring is not connected in this deployment, so no alert is sent. Nothing here is scheduled and nothing is queued.',
  },

  /** `§18.5` source and freshness panel. */
  sources: {
    heading: 'Sources and freshness',
    intro:
      'Every value on this page, with the source that produced it and how old that response is.',
    sourceLabel: 'Source',
    updatedLabel: 'Updated',
    provenanceLabel: 'Label',
    ruleVersionLabel: 'Rule version',
    methodLabel: 'Assessment method',
  },

  /**
   * `§18.5` upgrade prompt, shown only after value.
   *
   * ONE STATE, ONE SENTENCE. The `§17` billing-not-configured copy lives in
   * `states.billingNotConfigured` and nowhere else. This module carried a second, near-identical
   * wording of it until the S3 copy review; it had no caller — `DemoCockpit.astro` renders the
   * `states` one — and two sentences for one state is a rule expressed in two places, which is a
   * defect under `AGENTS.md §3.2` whether the duplicate is a rule or the words that report it. The
   * copy that is one edit away from disagreeing with itself is the copy that eventually does.
   */
  upgrade: {
    heading: 'Trip Pass',
  },

  /**
   * Per-field unknown sentences. Each names the specific missing fact. Sourced from
   * `provenance.unavailableReasons` so one fact has one wording everywhere.
   */
  unknown: {
    gate: unavailableReasons.gateNotPublished.fact,
    terminal: unavailableReasons.terminalNotPublished.fact,
    estimatedTime: unavailableReasons.estimateNotPublished.fact,
    cause: unavailableReasons.causeNotVerified.fact,
    status: 'No status has been reported for this segment yet.',
    delay: 'No delay figure has been reported against the schedule.',
    confidence: unavailableReasons.noCalibratedModel.fact,
    topology: unavailableReasons.topologyUnknown.fact,
    notice: unavailableReasons.noticeUnknown.fact,
    airlineSize: unavailableReasons.airlineSizeUnknown.fact,
    ruleSet: unavailableReasons.noRuleSetInForce.fact,
    liveData: unavailableReasons.providerNotConnected.fact,
    /** `§18.5` weather and airspace. The missing fact is the FEED, not the weather. */
    conditions: unavailableReasons.weatherNotConnected.fact,
    /** `DIRECTIVE.md §27` Unknown, for the overall assessment. */
    assessment: results.unknown,
    /** `§17` connection: insufficient data. */
    connection: 'There is not enough information to assess this connection.',
    /** `§17` rights: cause unknown / cannot determine. */
    rights: 'A fact this rule turns on is missing, so no status can be reached for it yet.',
  },
} as const

/**
 * The ids of the `§28` demonstration alerts, derived from the copy rather than restated.
 *
 * `apps/web/src/demo/itinerary.ts` types its `demoAlerts` entries against this, so the fixture and
 * the bodies cannot drift apart: an id with no body, or a body with no alert, is a type error at
 * the call site rather than a wrong sentence under a right heading in the built page.
 */
export type DemoAlertId = keyof typeof cockpit.alerts.demoBodies

/** The body for one demonstration alert. Never `severityMeanings` (copy F-25). */
export function demoAlertBody(id: DemoAlertId): string {
  return cockpit.alerts.demoBodies[id]
}

/**
 * Which reservation structure a connection cockpit is showing. The copy module's own three cases —
 * the frontend's `mixed_ticket` maps onto `selfTransfer`, because a mixed ticket is a separate-ticket
 * transfer as far as a traveler's exposure goes, and that mapping is already made in
 * `apps/web/src/components/pattern-copy.ts`.
 */
export type ConnectionTopologyKey = 'protected' | 'selfTransfer' | 'unknown'

const TOPOLOGY_QUALIFIER: Readonly<Record<ConnectionTopologyKey, string>> = {
  protected: 'on one protected itinerary',
  selfTransfer: 'on separate tickets',
  unknown: 'when the reservation is unknown',
}

/**
 * The accessible name of a connection cockpit, disambiguated by its reservation structure.
 *
 * `docs/ACCESSIBILITY.md` F26. `/connection-risk/` renders three cockpits side by side to show the
 * three topologies. Each was a region named "Connection" containing a region named "Every component
 * of the required transfer time", so a landmark list offered six entries under two names and
 * nothing said which example was which. A landmark list is a navigation aid; six identical entries
 * make it a worse one than no landmarks at all, because it costs a visit to each to find out.
 *
 * The topology IS the distinguishing fact — it is the thing the three examples differ by, and the
 * thing that changes the answer — so it is what the name carries.
 *
 * @param topology the reservation structure, or `null` where only one cockpit is on the page
 *
 * PASS `null` WHEN THERE IS NOTHING TO DISAMBIGUATE. A single cockpit keeps the plain `§18.5`
 * section heading, which is what the cockpit's heading order declares and what a reader of the
 * demonstration itinerary should hear. Disambiguation exists to tell things apart; adding it where
 * there is nothing to tell apart is just a longer name.
 *
 * This is also the shape a real trip needs: an itinerary with two connections will render two of
 * these, and they will need telling apart by something other than their position on the page.
 */
export function connectionHeading(topology: ConnectionTopologyKey | null): string {
  if (topology === null) return cockpit.headings.connection
  return `${cockpit.headings.connection} ${TOPOLOGY_QUALIFIER[topology]}`
}

/**
 * The caption of the transfer-components table inside a connection cockpit, disambiguated the same
 * way and for the same reason — the table is itself a named region (it scrolls, so it is keyboard
 * operable), and three of them shared one name.
 *
 * The caption is a `<caption>`, not a heading: it describes the table to someone who has landed on
 * it out of context, which is exactly the reader this finding is about.
 *
 * @param topology the reservation structure, or `null` where only one cockpit is on the page
 */
export function connectionComponentsCaption(topology: ConnectionTopologyKey | null): string {
  if (topology === null) return cockpit.connection.componentsCaption
  return `${cockpit.connection.componentsCaption} ${TOPOLOGY_QUALIFIER[topology]}`
}
