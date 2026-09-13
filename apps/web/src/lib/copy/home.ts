/**
 * Homepage copy, in the `DIRECTIVE.md §18.3` section order. Owner: `ux-copy-steward`.
 *
 * Two sections of `§18.3` have no copy here and that is deliberate: pricing cards are Phase 8 and
 * no billing exists, and the affiliate module is disabled until a real agreement exists
 * (`DIRECTIVE.md §20`). Writing their copy now would be writing a promise the product cannot keep.
 *
 * EVERY SENTENCE IS TRUE OF THIS BUILD. No licensed provider is connected, no calibrated model is
 * deployed, no rule set is in force, there are no accounts and no monitoring. So this page
 * describes what DelayPilot DOES and, in the same breath, how it behaves when the data is not
 * there — which is the more useful half anyway, and the half most products hide.
 */

import { disclaimers } from './disclaimers.ts'
import { results } from './results.ts'

export const home = {
  /** `DIRECTIVE.md §7` Promise, verbatim. The `h1`. */
  promise: 'Stay ahead of flight disruptions.',

  /** `DIRECTIVE.md §7` Support, verbatim, em dash and all. */
  support:
    'Track a flight, understand connection risk, and see the refund, care, and rebooking rules that may apply—before airport chaos makes the decision for you.',

  /** `DIRECTIVE.md §7` Trust line, verbatim, as three items. */
  trustLine: [
    'Source-linked status',
    'Versioned passenger-rights rules',
    'No booking code required',
  ],

  /** `DIRECTIVE.md §7` CTAs, verbatim. */
  ctas: {
    primary: 'Track a flight',
    secondary: 'Try the demo',
  },

  hero: {
    heading: 'Stay ahead of flight disruptions.',
    intro:
      'Track a flight, understand connection risk, and see the refund, care, and rebooking rules that may apply—before airport chaos makes the decision for you.',
    trustLineLabel: 'What that means here',
    /**
     * Said before the traveler submits, not after. No licensed provider is connected, so a lookup
     * ends in the provider-unavailable state every time; letting someone type a flight number to
     * find that out is a dead control wearing a working one's clothes (`AGENTS.md §1.6`).
     */
    availabilityNote:
      'No licensed flight-data provider is connected in this deployment yet, so a lookup returns the unavailable state rather than a guess. The demonstration itinerary shows the finished result in full.',
    /** ADR 0003 rule 6. Renders as the visible caption of the route-globe motif. */
    motifCaption: 'Illustrative route lines — not live traffic.',
  },

  /** `§18.3`: trust line and source/freshness explanation. */
  sources: {
    heading: 'Every value says where it came from',
    intro:
      'Flight information goes out of date while you are reading it. So each value on a DelayPilot screen carries one of six labels, the source it came from, and how old that source response is — from the provider adapter all the way to the pixel. These six are the whole vocabulary. There are no synonyms and none of them is dropped to make a screen look tidier.',
    /** Rendered beside the labels, because this is where flight data first appears. */
    disclaimer: disclaimers.flightData,
  },

  /** `§18.3`: interactive demo result. */
  demo: {
    heading: 'A complete result, end to end',
    intro:
      'This is the demonstration itinerary: two flights, one tightening connection, and the states a real disruption moves through. It is the same interface a live itinerary uses, with fixture data behind it.',
    /** The banner text lives in `cockpit.demoBanner`; the caption is `results.demo`. */
    caption: results.demo,
  },

  /** `§18.3`: "What DelayPilot tells you". Exactly four tiles. */
  tells: {
    heading: 'What DelayPilot tells you',
    intro:
      'Four answers, each one carrying the thing that makes it usable: where it came from, and how confident anyone should be about it.',
    items: [
      {
        title: 'The status, and how much to trust it',
        body: 'Scheduled and current times with the airport code and time zone, the status, the delay against schedule, and the label that says whether this is live, cached, stale, demo, or unavailable.',
      },
      {
        title: 'A delay and cancellation read',
        body: 'A heuristic risk band with the factors behind it. No calibrated model is deployed, so DelayPilot shows the band and the reasoning and no percentage — a number nobody validated is worse than no number.',
      },
      {
        title: 'How much room the connection has',
        body: 'Available time, required transfer time, and the slack between them, with every component labeled as measured, policy-derived, airport-derived, or estimated.',
      },
      {
        title: 'The rights that may apply',
        body: 'Refund, rebooking, care, and compensation rules that may apply under the rule version shown, with a link to the official source. An estimate based on the facts entered, never a determination.',
      },
    ],
  },

  /** `§18.3`: connection-risk explainer. */
  connection: {
    heading: 'How connection risk is measured',
    intro:
      'A connection is three quantities and the gap between two of them. DelayPilot shows all three rather than a single score, because the useful question is not how risky it is — it is which part of the transfer is eating the time.',
    terms: [
      {
        term: 'Available time',
        body: 'From the estimated gate-in of the arriving flight to the gate-close of the next one. Not the published departure time: the door closes earlier.',
      },
      {
        term: 'Required time',
        body: 'What the transfer itself needs — walking the distance, any security or immigration step, and rechecking a bag where that applies.',
      },
      {
        term: 'Slack',
        body: 'Available time minus required time. Negative slack means the connection does not work as currently scheduled, and the checklist takes over from the meter.',
      },
    ],
    derivationHeading: 'Where each component comes from',
    derivationIntro:
      'Every component is labeled with how it was arrived at, because a measured number and a modeled number deserve different amounts of trust.',
    derivations: [
      { term: 'Measured', body: 'Read from an observed value in a source response.' },
      {
        term: 'Policy-derived',
        body: 'Taken from a published airline or airport rule, such as a gate-close time or a minimum connection time.',
      },
      {
        term: 'Airport-derived',
        body: 'Taken from published airport data about the terminals, the transfer path, and whether it crosses a border control.',
      },
      {
        term: 'Estimated',
        body: 'Derived rather than observed, and labeled as such wherever it appears. An estimate does not become a measurement by being displayed next to one.',
      },
    ],
    selfTransferHeading: 'Separate tickets are a different problem',
    selfTransfer: results.selfTransfer,
    /** `DIRECTIVE.md §26` Connection. Renders inside this section, not only in the footer. */
    disclaimer: disclaimers.connection,
  },

  /** `§18.3`: passenger-rights explainer. */
  rights: {
    heading: 'Passenger rights, stated as an estimate',
    intro:
      'DelayPilot reads your facts against a dated, versioned rule set and tells you what may apply. It is not a claims company: it never files anything, never acts on your behalf, and never tells you an outcome is settled.',
    statusHeading: 'The five answers a rule can give',
    statuses: [
      {
        status: 'likely_applies',
        label: 'Likely applies',
        body: 'The facts entered meet the conditions in the rule version shown. Still an estimate — the airline or the regulator decides.',
      },
      {
        status: 'may_apply',
        label: 'May apply',
        body: 'The rule could cover this, and at least one condition depends on a fact that is unproven or missing.',
      },
      {
        status: 'not_indicated',
        label: 'Not indicated',
        body: 'On the facts entered, this rule does not appear to cover what happened.',
      },
      {
        status: 'cannot_determine',
        label: 'Cannot determine',
        body: 'A fact the rule turns on is missing, and the card names which one rather than guessing at it.',
      },
      {
        status: 'future_rule_not_active',
        label: 'Future rule, not active',
        body: 'A reform has been adopted but is not yet in force. Shown for context, never applied to an event before its effective date.',
      },
    ],
    disciplineHeading: 'Why it always says "may"',
    discipline:
      "Eligibility turns on the full circumstances, on the cause the airline gives in writing, and on a decision DelayPilot does not make. Nearby weather is not proof that a disruption was outside an airline's control, and a provider's reason string is what the airline said, not what was established.",
    currentVsFutureHeading: 'Current rules and adopted reforms are kept apart',
    currentVsFuture:
      'Where a reform has been adopted but has not taken effect, the current rule is the one applied and the future rule is shown separately with its status and its effective date. Applying a future rule early is wrong in exactly the direction that costs a traveler money.',
    /** `DIRECTIVE.md §26` Rights. Renders inside this explainer. */
    disclaimer: disclaimers.rights,
  },

  /** `§18.3`: monitoring / alert demonstration. */
  monitoring: {
    heading: 'What an alert looks like',
    intro:
      'Alerts climb one rung at a time and stop at the top of the ladder, not above it. The tone goes from informative to attentive to directive to closing, and never to panic — urgency the data does not support is noise the fourth time it arrives.',
    severities: [
      {
        severity: 'info',
        label: 'Info',
        body: 'Something changed that is worth knowing: a schedule detail, a gate, a terminal.',
      },
      {
        severity: 'watch',
        label: 'Watch',
        body: 'A meaningful delay, or connection slack that is shrinking toward the required transfer time.',
      },
      {
        severity: 'urgent',
        label: 'Urgent',
        body: 'A cancellation, a diversion, a likely missed connection, a major schedule change, or a rights or action step that is time-limited.',
      },
      {
        severity: 'resolved',
        label: 'Resolved',
        body: 'The situation the earlier alerts described has ended, and the message says how it ended.',
      },
    ],
    contents:
      'Every message carries the flight and the date, what changed, how fresh the source was, the next useful step, and a link back. None carries anything from your ticket, your full email address, payment details, or a legal guarantee.',
    notConnected:
      'Monitoring is not connected in this deployment, so no alert is sent today. The ladder above is the contract the alerts are written against.',
  },

  /** `§18.3`: source and methodology strip. */
  methodologyStrip: {
    heading: 'How this works, in detail',
    intro:
      'None of the rules above is a slogan. Each one is written down, and each page below says how the thing is actually computed.',
    links: {
      '/methodology/': 'Methodology',
      '/data-sources/': 'Data sources',
      '/about/': 'About DelayPilot',
      '/accessibility/': 'Accessibility',
    },
  },

  /**
   * `§18.3`: selected guides.
   *
   * NO RANKING OF SITUATIONS BY COST. The intro read "the situations that cost travelers the most
   * money" — a ranking over a population DelayPilot has never measured, which is the superlative
   * clause of `DIRECTIVE.md §7` and `docs/EDITORIAL_POLICY.md §7.1`: an unmeasured superlative is a
   * statistic with the number taken out. The S3 copy review raised exactly this class against the
   * content tree as F-14 and 61 lines were reworded there; the re-check found the same claim still
   * standing in this module, which is the tree the finding came from. It now says what the guides
   * are about — decisions with money attached — and asserts no order among them.
   */
  guidesStrip: {
    heading: 'Guides',
    intro:
      'Plain-language explanations of the disruptions where a decision costs money, each one sourced and dated.',
    readMore: 'Read the guide',
  },
} as const
