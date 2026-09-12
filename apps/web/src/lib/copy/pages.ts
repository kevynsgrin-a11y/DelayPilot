/**
 * Per-route page copy: title, description, heading, introduction, and sections.
 * Owner: `ux-copy-steward`.
 *
 * TITLES. Every route title ends " — DelayPilot". The homepage is the one exception and carries the
 * brand first, which is the convention every search result set expects; `copy.test.ts` enumerates
 * it rather than letting the rule quietly erode. Titles and descriptions are unique per route
 * (`DIRECTIVE.md §19`), and `copy.test.ts` asserts that too.
 *
 * TRUTH. Every sentence describes the product as it is built and enforced, not as it is planned. No
 * licensed provider is connected, no calibrated model is deployed, no rule set is in force, and
 * these pages say so where it matters rather than in a footnote.
 *
 * DIGITS. Three page keys carry strings containing digits, all of them identifiers rather than
 * measurements: the accessibility standard's version, the date the accessibility claim was last
 * verified, and the finding ids and success-criterion numbers in the known-issues list. They are
 * enumerated in `copy.test.ts` with this reason attached.
 */

import { disclaimers } from './disclaimers.ts'
import { provenanceLabels } from './provenance.ts'

export const pages = {
  /** The homepage. Body copy lives in `home.ts`; this is the document metadata. */
  home: {
    title: 'DelayPilot — Stay ahead of flight disruptions',
    description:
      'Track a flight, understand connection risk, and see the refund, care, and rebooking rules that may apply. Every value carries its source and its age.',
  },

  flightStatus: {
    title: 'Flight status — DelayPilot',
    description:
      'Look up a flight and read its status together with the source it came from, how old that response is, and what the answer does not cover.',
    h1: 'Flight status',
    intro:
      'A flight status is only as good as the response behind it. DelayPilot shows the status, the scheduled and current times with their airport code and time zone, the delay against schedule, and the label that says how much to trust all of it.',
    sections: {
      whatYouSee: {
        heading: 'What a status card shows',
        body: 'The operating airline and flight number, both endpoints, scheduled and current times with airport code and time zone, the status, the delay, the gate and terminal when they have been published, the source, and when that source last answered.',
      },
      whatItDoesNotTell: {
        heading: 'What it does not tell you',
        body: 'It does not tell you why. A reason string from an airline or a provider is what was said, not what was established, and DelayPilot renders it as an airline-stated or provider-stated reason and nothing stronger. It is also not a safety judgment: DelayPilot describes operating conditions and never whether a flight should go.',
      },
      whenDataIsMissing: {
        heading: 'When a value is missing',
        body: 'A missing value is shown as missing, with the specific fact named — the gate has not been published, the cause has not been verified. It is never a blank, a dash, or a zero, because each of those reads as information.',
      },
      today: {
        heading: 'What is connected today',
        body: 'No licensed flight-data provider is connected in this deployment, so live status is unavailable and the lookup says so. The demonstration itinerary shows the finished surface with fixture data behind it.',
      },
    },
    disclaimer: disclaimers.flightData,
  },

  delayRisk: {
    title: 'Delay risk — DelayPilot',
    description:
      'How DelayPilot reads the chance of a delay or a cancellation: a heuristic band with the factors behind it, and no percentage from a model nobody validated.',
    h1: 'Delay risk',
    intro:
      'DelayPilot does not tell you a number. It tells you which band an itinerary is in, what put it there, and how fresh the information behind that judgment is.',
    sections: {
      whyABand: {
        heading: 'Why a band and not a percentage',
        body: 'A percentage implies a calibrated model standing behind it. None is deployed. Publishing a figure anyway would give a traveler a precision that does not exist, at the exact moment they are deciding whether to buy another ticket. So the output is a band, labeled as a heuristic band, with the reasoning shown.',
      },
      whatFeedsIt: {
        heading: 'What feeds the band',
        body: 'The current status and its freshness, the inbound aircraft where it is known, published airspace programs, observed operating conditions at both airports, and the time of day and the position in the aircraft rotation. Each factor is listed beside the band with how it was derived.',
      },
      whatWouldChangeIt: {
        heading: 'What would change this',
        body: 'A calibrated model, validated against held-out data and published with its error, would replace the band with a probability — and would arrive with its version, its calibration date, and its limits attached. Until that exists, the band is the honest output.',
      },
      weather: {
        heading: 'Weather is context, never cause',
        body: 'Conditions near an airport describe what operations are dealing with. They do not prove that any particular disruption was outside an airline control, and DelayPilot never presents them as if they did.',
      },
    },
    disclaimer: disclaimers.prediction,
  },

  connectionRisk: {
    title: 'Connection risk — DelayPilot',
    description:
      'Available time, required transfer time, and the slack between them, with every component labeled as measured, policy-derived, airport-derived, or estimated.',
    h1: 'Connection risk',
    intro:
      'A tight connection is not one number. It is the time you have, the time the transfer needs, and the gap between them — and knowing which of the three is the problem is what tells you what to do about it.',
    sections: {
      decomposition: {
        heading: 'The three quantities',
        body: 'Available time runs from the estimated gate-in of the arriving flight to the gate-close of the next one, not to its published departure time. Required time is what the transfer itself needs. Slack is what is left. Negative slack means the connection does not work as scheduled.',
      },
      components: {
        heading: 'What the transfer is made of',
        body: 'Deplaning, walking the distance between the gates, any terminal change, security or immigration where the route crosses a border control, bag recheck on separate tickets, and the gate-close margin at the far end. Each component is shown with how it was derived.',
      },
      topology: {
        heading: 'One ticket or two',
        body: 'On a single protected itinerary, a missed connection is the airline problem to solve, and passenger-rights rules usually treat the journey as one. On separate tickets, rebooking and baggage recovery are usually yours, and the second airline owes you nothing for the first one being late. DelayPilot asks which it is, because everything downstream depends on the answer.',
      },
      noGauge: {
        heading: 'Why there is no dial',
        body: 'A needle on an arc implies a precision the inputs do not have. The connection meter is linear, it reads out in words as well as in color, and it publishes no percentage in any channel.',
      },
    },
    disclaimer: disclaimers.connection,
  },

  methodology: {
    title: 'Methodology — DelayPilot',
    description:
      'How provenance, the heuristic band, the connection decomposition, rights versioning, demo mode, and fail-closed unknown states are actually built and enforced.',
    h1: 'Methodology',
    intro:
      'This page describes what the code does, not what the product aspires to. Each rule below is enforced in the build and tested, and each one exists because the alternative costs a traveler money.',
    sections: {
      provenance: {
        heading: 'Provenance travels with the value',
        body: 'Freshness, source id, and age move from the provider adapter through the normalizer, the repository, the API response, and the component props to the rendered pixel. An interface that cannot express provenance is treated as a defective contract, not as a simplification. Six labels exist and there are no others.',
      },
      band: {
        heading: 'The heuristic band',
        body: 'Risk is reported as a band with its factors, and labeled as a heuristic band wherever it appears. No percentage is displayed from an uncalibrated model, in any channel, including the accessible name of a meter.',
      },
      connection: {
        heading: 'Connection decomposition',
        body: 'Available time, required transfer time, and slack are computed as pure functions of explicit inputs, with each component carrying whether it was measured, derived from a published policy, derived from airport data, or estimated. The same inputs produce the same output every time.',
      },
      rights: {
        heading: 'Rights are versioned, dated, and source-linked',
        body: 'Regulatory prose lives in versioned rule data with effective dates, never inline in a component or an article. An assessment is stored with the rule-set version that produced it, so a card can always say which rule it applied. Five statuses exist and a human label never upgrades one.',
      },
      futureRules: {
        heading: 'Adopted is not the same as effective',
        body: 'A reform that has been adopted but has not entered into force is modeled separately, with its status and its effective date, and is never applied to an event before that date. Enforcement guidance from a regulator is modeled as guidance and never as a repeal.',
      },
      demo: {
        heading: 'Demo mode',
        body: 'The demonstration itinerary uses synthetic airlines, flight numbers, and airports that cannot collide with real ones, and every panel carries its demo label. Fixture data is never substituted for live data outside demo mode, and demo pages are never indexed as individual flights.',
      },
      failClosed: {
        heading: 'Unknown is designed, not accidental',
        body: 'A missing credential, an unapproved provider, an expired rule set, or an unavailable model degrades to a labeled state with its own sentence naming what is missing. The product fails closed rather than quietly serving something plausible.',
      },
      privacy: {
        heading: 'What is never collected',
        body: 'No booking code, no passport or government identifier, no airline account credential, no payment card. No email address, display name, itinerary detail, or receipt text in a log, an analytics event, a page title, or a URL.',
      },
    },
  },

  dataSources: {
    title: 'Data sources — DelayPilot',
    description:
      'The official and operational sources DelayPilot reads, what each one is used for, and the plain statement that no licensed flight-data provider is connected today.',
    h1: 'Data sources',
    intro:
      'DelayPilot prefers a primary source over a summary of one, and records when each source was last checked. Where a source has not been connected, this page says so rather than leaving the impression that it has.',
    sections: {
      today: {
        heading: 'What is connected today',
        body: 'No licensed flight-data provider is connected in this deployment. Live flight status is therefore unavailable, the lookup returns the unavailable state, and the demonstration itinerary is the only itinerary with data behind it.',
      },
      candidates: {
        heading: 'Providers named here are candidates',
        body: 'Commercial flight-data providers are listed as candidates that have been evaluated. Naming one is not an endorsement, a partnership, or an agreement, and none of them has approved, reviewed, or sponsored anything on this site.',
      },
      labels: {
        heading: 'What the six labels mean',
        body: 'Every value carries one of six labels and its age. The labels are the same everywhere and they are never softened.',
      },
      verification: {
        heading: 'How a regulatory source is handled',
        body: 'A regulator page is opened, confirmed current, and recorded with the date it was last verified before any rule that depends on it is published. A change in the law is never auto-published from a diff, and a news summary never outranks the regulator.',
      },
    },
    /** `DIRECTIVE.md §33`, by name and intended use. */
    sources: [
      {
        name: 'United States Department of Transportation',
        use: 'Refund rules, enforcement news, and the airline customer service dashboard that records voluntary commitments.',
      },
      {
        name: 'Your Europe — Air passenger rights',
        use: 'The European Union passenger-rights framework as published for travelers, and the reform timeline.',
      },
      {
        name: 'UK Civil Aviation Authority',
        use: 'United Kingdom delay and cancellation guidance, care thresholds, and compensation bands.',
      },
      {
        name: 'Canadian Transportation Agency',
        use: 'Canadian delay, cancellation, rebooking, refund, and compensation rules, and airline size classification.',
      },
      {
        name: 'AviationWeather.gov',
        use: 'Operating conditions at both endpoints. Context for a risk band, never proof of a cause.',
      },
      {
        name: 'FAA National Airspace System status',
        use: 'Published ground stops, ground delay programs, and airspace constraints in the United States.',
      },
      {
        name: 'Bureau of Transportation Statistics',
        use: 'Historical airline and airport operating data, used to build and check heuristics rather than to describe a specific flight.',
      },
      {
        name: 'International Civil Aviation Organization',
        use: 'Montreal Convention liability limits, for informational baggage context only.',
      },
      {
        name: 'Licensed flight-data providers',
        use: 'Candidates for live status and schedule data. Evaluated, not connected: no agreement exists, so no live flight data is served.',
      },
    ],
    labelsHeading: 'The labels',
    labels: provenanceLabels,
  },

  about: {
    title: 'About — DelayPilot',
    description:
      'What DelayPilot is, what it deliberately is not, why it never asks for anything printed on your ticket, and who it is built for.',
    h1: 'About DelayPilot',
    intro:
      'DelayPilot tells a traveler what is happening to their flight, how much to trust that information, what may happen next, what to do now, and which passenger-rights rules may apply — with the source, the version, and the timestamp attached to every claim.',
    sections: {
      independence: {
        heading: 'Who is behind it',
        body: 'DelayPilot is built and run on its own account. No airline, airport, regulator, or data provider owns it, sponsors it, reviews it, or is paid by it for a favorable answer, and none of them has approved anything on this site. It earns nothing from an assessment going one way rather than the other.',
      },
      whatItIsNot: {
        heading: 'What it is not',
        body: 'It is not an airline, an airport, a government agency, a law firm, a claims company, or a flight-data provider. It does not file a claim, send a complaint, request a refund, rebook a flight, or buy anything for you, and it never will: the point is to put you in a position to do those things with the right facts.',
      },
      noBookingCode: {
        heading: 'It never asks for anything from your ticket',
        body: 'A flight number and a date are enough to follow a public flight. So there is no field for a booking code anywhere in DelayPilot — not in the lookup, not in a URL, not in a log, not in an analytics event. Nor is there one for a passport, a government identifier, a frequent-flyer login, or a card number.',
      },
      whoItIsFor: {
        heading: 'Who it is for',
        body: 'A traveler checking before leaving home. A connecting passenger watching the clock. Someone on separate tickets who knows the risk sits with them. A family member monitoring a flight they are not on. Anyone deciding between waiting, rebooking, and asking for a refund, and anyone trying to put the evidence for that decision in order afterward.',
      },
      howItPaysForItself: {
        heading: 'How it pays for itself',
        body: 'Through optional paid features and clearly labeled commercial placements, never by ranking an assessment. Utility and official rights information always come before any commercial suggestion, and a commercial partner is never presented as the route to a statutory right. Nothing is for sale in this deployment.',
      },
    },
  },

  /** Shell chrome only. The body of this page comes from `content-editorial-lead`. */
  passengerRightsIndex: {
    title: 'Passenger rights — DelayPilot',
    description:
      'Refund, rebooking, care, and compensation rules by jurisdiction, with the rule version, the effective date, and the official source shown beside every statement.',
    h1: 'Passenger rights',
    intro:
      'What may apply after a delay, a cancellation, or a denied boarding depends on where you flew, who operated the flight, how much notice you had, and why it happened. These pages set out each framework on its own terms and link to the regulator that publishes it.',
    jurisdictionsHeading: 'By jurisdiction',
    estimateNote:
      'Every rights page is an informational explanation of a published rule, not an assessment of your case. An assessment happens against the facts you enter, and it says "may apply" because the airline or the regulator is the one that decides.',
    disclaimer: disclaimers.rights,
  },

  /** Shell chrome only. Guide bodies come from `content-editorial-lead`. */
  guidesIndex: {
    title: 'Guides — DelayPilot',
    description:
      'Plain-language guides to disruption, refunds, connections, evidence, and the terms airlines use, each one sourced, dated, and reviewed.',
    h1: 'Guides',
    intro:
      'Written for the moment you need them: short, specific, sourced, and dated. Each guide says when it was last reviewed and links to the official text it is built on.',
    readMore: 'Read the guide',
    reviewedLabel: 'Last reviewed',
  },

  /**
   * The accessibility statement. Contract: `docs/ACCESSIBILITY.md §13`.
   *
   * Every factual claim here comes from `docs/ACCESSIBILITY.md` and nowhere else. The conformance
   * word is "partially conformant" and cannot be stronger until the route-level, keyboard, and
   * screen-reader passes in that document's §10.2 have actually been run. A green design-system
   * gate is not a conformant product, and saying otherwise is the accessibility spelling of the
   * overclaim rule in `AGENTS.md §1.3`.
   */
  accessibility: {
    title: 'Accessibility — DelayPilot',
    description:
      'The accessibility statement for DelayPilot: the standard claimed, the conformance status, every known issue, what has not been tested yet, and how to report a barrier.',
    h1: 'Accessibility',
    intro:
      'This statement says what has been measured, what has not, and what is still wrong. It is written to be useful to someone who has just hit a barrier, which means it does not round anything up.',

    standardHeading: 'The standard claimed',
    /** Digits: a standard version identifier, not a measurement. */
    standard: 'WCAG 2.2 Level AA',
    standardBody:
      'DelayPilot is built to the Web Content Accessibility Guidelines at Level AA. Two rules are held tighter than the guidelines require: the reduced contrast allowance for large text is never used, and the minimum touch target is larger than the guideline floor.',
    lastVerifiedHeading: 'Last verified',
    /** Digits: the date of the review recorded in `docs/ACCESSIBILITY.md`. */
    lastVerified: '2026-09-11',
    lastVerifiedBody:
      'That is the date of the most recent review. It covers the design system: the color tokens, the focus system, reduced motion, and the accessible semantics of the shared components.',

    statusHeading: 'Conformance status',
    status: 'Partially conformant',
    statusBody:
      'Partially conformant means parts of this site do not yet conform. The design system has been measured and reviewed and passed. The route-level checks, the keyboard passes, and the screen-reader passes have not been run, so no stronger word would be true.',
    noClaim:
      'This statement does not say that DelayPilot is accessible, or that it meets every standard. An audit that has not been run cannot support that claim, and a statement you cannot rely on is worse than no statement.',

    knownIssuesHeading: 'Known issues',
    knownIssuesIntro:
      'Every finding still open from the most recent review, with what it affects and when it is expected to be fixed. Nothing has been left out for being awkward.',
    /** Digits: finding ids and success-criterion numbers. Identifiers, not measurements. */
    knownIssues: [
      {
        id: 'F15',
        affected: 'Dialogs and drawers',
        criterion: 'SC 1.3.2 Meaningful Sequence, SC 2.4.3 Focus Order',
        description:
          'Content behind an open dialog is not made inert. Focus is trapped inside the dialog and the dialog is marked as modal, so screen readers already treat the background as hidden, but a pointer or a stylus can still reach it.',
        expected: 'With the dialog patterns in the current frontend release.',
      },
      {
        id: 'F22',
        affected: 'Social sharing image',
        criterion: 'SC 1.1.1 Non-text Content',
        description:
          'The sharing image carries the product name and the promise as artwork. Pages that reference it must publish a text alternative carrying both, or the card is an image with no text for anyone whose client does not render it.',
        expected: 'With the page metadata work in the current release.',
      },
      {
        id: 'F23',
        affected: 'Brand mark',
        criterion: 'Contract guard, no success criterion is failing today',
        description:
          'The accent shape in the mark reads its color from a variable that is not declared, so it renders a measured fallback that passes. If that variable is later declared without being measured, the mark could drop below the contrast floor without anything failing loudly.',
        expected: 'With the theme definitions in the current release.',
      },
      {
        id: 'F24',
        affected: 'Slack and delay meters',
        criterion: 'SC 1.3.1 Info and Relationships, accessible name quality',
        description:
          'The meter announces its reading and its band together. When a value was unknown, both were the same word and it stuttered. The strings now differ, so an unknown reading names the missing quantity first and the band second.',
        expected: 'Fixed in this release. Confirmation waits on a screen-reader pass.',
      },
    ],

    notTestedHeading: 'What has not been tested yet',
    notTestedBody:
      'Automated checks on each route, keyboard-only passes of the main journeys, screen-reader passes, browser zoom, reflow at a narrow width, and text-spacing overrides have not been run. They need a browser and assistive technology, and neither exists in the environment where this release was built. They are scheduled for the quality sweep before launch.',

    environmentsHeading: 'What was tested, and with what',
    environmentsIntro:
      'The checks that have been run were run without a browser: contrast measured directly from the shipped stylesheet, and the shared components rendered to markup and read.',
    /** Digits: tool version identifiers, pinned to the verification date above. */
    environments: [
      {
        name: 'Node.js',
        version: '22.22.2',
        used: 'Running the contrast measurements and the component render harness.',
      },
      {
        name: 'Vitest',
        version: '4.1.10',
        used: 'Running the design-system suite, including the contrast registry and the component semantics tests.',
      },
      {
        name: 'React DOM server renderer',
        version: '19.3.0',
        used: 'Rendering each shared component to markup so its roles, names, and states could be read as a screen reader would receive them.',
      },
    ],
    environmentsNotTested:
      'No browser and no screen reader has been used. There is no Safari with VoiceOver result here, no Firefox with NVDA result, and none is implied by anything above.',

    methodHeading: 'How this was assessed',
    method:
      'Self-assessment. The review was carried out by the DelayPilot accessibility lead, working independently of whoever built the thing being reviewed, and every measurement was re-derived from the source rather than accepted from a report.',

    feedbackHeading: 'Report a barrier',
    feedbackIntro:
      'If something here stopped you, tell us what you were trying to do and what happened. A description of the barrier is enough; you do not need to know which rule it breaks.',
    feedbackNoJavaScript:
      'This page and the address below work without JavaScript and without solving a puzzle.',
  },

  contact: {
    title: 'Contact — DelayPilot',
    description:
      'How to reach DelayPilot about a problem with the site, a factual correction, an accessibility barrier, or a privacy request.',
    h1: 'Contact',
    intro:
      'One address, read by a person. Write about anything on the site: a value that looks wrong, a rule that has changed, a barrier you hit, or a request about your data.',
    addressHeading: 'Email',
    responseTime: 'We aim to reply within five working days.',
    privacyNote:
      'Please leave out anything printed on your ticket. A flight number and a date are enough for us to look at almost anything, and we would rather not hold what we do not need.',
    notAnAirline:
      'DelayPilot cannot rebook you, refund you, or contact an airline for you. For anything about a specific booking, the operating airline is the only party that can act.',
  },

  /**
   * Chrome for an article shell — a guide or a rights explainer. Not a route: the body, the title
   * and the description come from `content-editorial-lead` per article. These are the labels the
   * shell puts around it.
   */
  article: {
    answerFirstLabel: 'The short answer',
    reviewedLabel: 'Reviewed',
    sourcesHeading: 'Sources',
    sourcesIntro:
      'The registry entries this page is built on. Each one is checked against the publisher before any rule that depends on it is published.',
    /**
     * `DIRECTIVE.md §18.6` editorial workflow. An article that has not cleared review says so on
     * the page rather than only in a database column.
     */
    awaitingReview: 'Editorial status: awaiting final review',
    updatedLabel: 'Last updated',
    onThisPage: 'On this page',
  },

  notFound: {
    title: 'Page not found — DelayPilot',
    description: 'That address does not match a page on DelayPilot. Here is where to go instead.',
    h1: 'Page not found',
    intro:
      'The address you followed does not match a page here. It may have moved, or the link may have been wrong.',
    helpHeading: 'Try one of these',
  },
} as const

/**
 * The accessibility statement's feedback route, rendered from the configured contact address.
 *
 * A function, not a string, because the address is deployment configuration and an address written
 * into copy is an address that goes stale. When none is configured, the statement says so plainly:
 * `docs/ACCESSIBILITY.md §13` requires a feedback route that reaches a person, and a link to an
 * address that does not exist would be a dead control (`AGENTS.md §1.6`).
 */
export function accessibilityFeedback(contactEmail: string | null): {
  readonly body: string
  readonly address: string | null
} {
  if (contactEmail === null || contactEmail.trim() === '') {
    return {
      body: 'No contact address is configured for this deployment, so there is no route to report a barrier from this page yet. This statement will name one as soon as there is one.',
      address: null,
    }
  }
  return {
    body: `Email ${contactEmail}. ${pages.contact.responseTime}`,
    address: contactEmail,
  }
}

/**
 * The contact page, rendered from the configured address. The route is only emitted when an
 * address exists, so the page never renders a form that goes nowhere.
 */
export function contactPage(contactEmail: string): {
  readonly title: string
  readonly description: string
  readonly h1: string
  readonly intro: string
  readonly addressHeading: string
  readonly address: string
  readonly responseTime: string
  readonly privacyNote: string
  readonly notAnAirline: string
} {
  return {
    title: pages.contact.title,
    description: pages.contact.description,
    h1: pages.contact.h1,
    intro: pages.contact.intro,
    addressHeading: pages.contact.addressHeading,
    address: contactEmail,
    responseTime: pages.contact.responseTime,
    privacyNote: pages.contact.privacyNote,
    notAnAirline: pages.contact.notAnAirline,
  }
}
