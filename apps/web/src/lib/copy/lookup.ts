/**
 * The flight lookup form and its states. Owner: `ux-copy-steward`.
 *
 * `DIRECTIVE.md §18.4`: airline + flight number + date + optional endpoint disambiguation, visible
 * examples, inline validation, no forced account, **no field for anything printed on a ticket**,
 * loading skeleton, candidate chooser, demo shortcut, provider-unavailable and stale states.
 *
 * NO TICKET-IDENTIFIER VOCABULARY, ANYWHERE (`AGENTS.md §2`). Not as a label, a placeholder, help
 * text, an error, or an example. The one permitted mention is the NEGATIVE one — `DIRECTIVE.md §7`
 * fixes the trust line as "No booking code required", and `noBookingCode` below says why in one
 * sentence, because a traveler who has been trained by claims sites to expect that field needs to
 * be told it is not coming rather than left hunting for it.
 *
 * THE EXAMPLES ARE THE DEMO IDENTIFIERS. A real airline code in a placeholder reads as an
 * endorsement, and a real flight number in an example is a real flight number with invented context
 * (`DIRECTIVE.md §28`). `demo.airline` and `demo.flights.first` are synthetic by construction.
 */

import { demo } from './demo.ts'
import { disclaimers } from './disclaimers.ts'
import { results } from './results.ts'
import { unavailableReasons } from './provenance.ts'

export const lookup = {
  heading: 'Track a flight',
  intro:
    'Three details are enough: who is operating it, which flight, and which day. Nothing from your ticket, and no account.',

  fields: {
    airline: {
      label: 'Airline',
      help: 'The operating airline — the one whose aircraft you board. Name or code.',
      example: demo.airline,
    },
    flightNumber: {
      label: 'Flight number',
      help: 'Digits only. The airline code belongs in the field above.',
      example: demo.flights.first,
    },
    date: {
      label: 'Date of departure',
      help: 'The scheduled departure date in the origin airport local time, which is not always the date on your calendar at home.',
      example: 'Year, month, and day',
    },
    origin: {
      label: 'From (optional)',
      help: 'Add the departure airport only if this flight number is used on more than one route that day.',
      example: 'Airport name or code',
    },
    destination: {
      label: 'To (optional)',
      help: 'Add the arrival airport for the same reason: it tells two flights with one number apart.',
      example: 'Airport name or code',
    },
  },

  /**
   * THREE MESSAGES, BECAUSE THERE ARE THREE VALIDATIONS. Each one is wired: `LookupForm.astro`
   * passes them to its script as `data-message-airline`, `data-message-flight` and
   * `data-message-date`.
   *
   * A FOURTH WAS REMOVED IN THE S3 REVIEW and the reason is recorded here so it is reinstated
   * rather than re-invented. `dateOutOfRange` — "That date is outside the range this lookup
   * covers" — described a bound that does not exist: `FlightLookupFields` renders `type="date"`
   * with no `min` and no `max`, and the range it would announce is a licensed provider's lookup
   * window. No provider is connected, so any bound written today would be a system limit nobody
   * measured (`AGENTS.md §1.1`) attached to a validation nothing can fail.
   *
   * When a provider lands with a real window, ask `ux-copy-steward` for the message and it comes
   * back with the bound interpolated, never hardcoded.
   */
  validation: {
    airlineRequired: 'Enter the operating airline, by name or by code.',
    flightNumberInvalid: 'Enter the flight number as digits only, without the airline code.',
    dateInvalid: 'Enter a departure date as a year, a month, and a day.',
    /** Rendered at the top of the form on submit, with focus moved to it. */
    summaryHeading: 'Check these details before searching',
  },

  states: {
    initial:
      'Enter an airline, a flight number, and a date to see the current status, where it came from, and what it means for the rest of the itinerary.',

    /**
     * One string, used as the visible loading sentence AND as the `aria-busy` region's
     * announcement, so a screen-reader user and a sighted user are told the same thing.
     */
    searching: 'Looking up this flight.',

    multipleMatches:
      'More than one flight matches those details. Choose the one you are traveling on — the endpoints and departure time tell them apart.',

    noMatch:
      'No flight matches those details. Check the airline, the flight number, and the date, and remember the date is the one at the departure airport.',

    invalidFlight:
      'That flight number does not look valid for this airline. Check both, then try again.',

    /** `§17` provider unavailable. Names what is missing, then what to do instead. */
    providerUnavailable: unavailableReasons.providerNotConnected.fact,
    providerUnavailableNextStep: unavailableReasons.providerNotConnected.nextStep,

    rateLimited:
      'Too many lookups from here in a short time. Wait a moment and try again — nothing you entered has been lost.',

    /** `DIRECTIVE.md §27` Stale. */
    stale: results.stale,

    /** `DIRECTIVE.md §27` Demo. */
    demo: results.demo,
  },

  /** The demo shortcut, offered beside the form and again in the unavailable state. */
  demoShortcut: {
    label: 'Open the demonstration itinerary',
    help: 'A fixed, fictional trip that shows the full result — status, connection, cancellation, and the rights that may apply.',
  },

  /** `DIRECTIVE.md §7` trust line, said plainly where the traveler expects the field to be. */
  noBookingCode: {
    line: 'No booking code required.',
    why: 'A flight number and a date are enough to follow a public flight, so DelayPilot never asks for anything printed on your ticket — not in this form, not anywhere else.',
  },

  submit: 'Track a flight',

  /** `DIRECTIVE.md §26` Flight data. Renders with the result, not only in the footer. */
  disclaimer: disclaimers.flightData,
} as const
