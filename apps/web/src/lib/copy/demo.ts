/**
 * The demonstration itinerary's identifiers. Owner: `ux-copy-steward`.
 *
 * `DIRECTIVE.md §28` requires a polished product without paid credentials, built on "clearly
 * synthetic identifiers" — and forbids "a real flight number with fake live details". Every string
 * here is synthetic by construction: `DEMO` is not an airline designator, `DM1`/`DM2`/`DM3` are not
 * airport codes, and none of them collides with a live identifier.
 *
 * These are the ONLY exported strings in `apps/web/src/lib/copy/**` that contain a digit, and
 * `copy.test.ts` enumerates them as the exceptions to the no-number rule. They are identifiers, not
 * measurements: nothing about them is a claim.
 */

import { results } from './results.ts'

/**
 * The two flight identifiers, as a reader sees them on a card: designator plus number.
 *
 * Declared before `demo` so `flightNumberOnly` can be DERIVED from `first` rather than written a
 * second time. Two strings that must agree, typed twice, eventually disagree.
 */
const flights = {
  /** The inbound segment. */
  first: 'DEMO 101',
  /** The onward segment. */
  second: 'DEMO 202',
} as const

export const demo = {
  /** The fictional operating carrier. Not an IATA or ICAO designator. */
  airline: 'Demo Airline',

  flights,

  /**
   * The number part of `flights.first`, for the lookup form's flight-number example.
   *
   * THE EXAMPLE HAS TO BE ENTERABLE IN THE FIELD IT SITS UNDER. That field's help says "Digits
   * only. The airline code belongs in the field above", and `LookupForm` enforces it — the input
   * is `pattern="[0-9]{1,4}"` with `maxLength="4"`. The example under it was the whole identifier,
   * "DEMO 101", so the one form the field rejects was the one form the page demonstrated, to a
   * reader who is by definition looking at the example because they were unsure. Found in the
   * built page by the S3 copy re-check.
   *
   * Derived by stripping the leading designator, so it cannot drift from `flights.first`, and so
   * no digit is typed into this module a second time.
   */
  flightNumberOnly: flights.first.replace(/^\D+/, ''),

  /** The three fictional airports. Not IATA codes. */
  airports: {
    DM1: 'Demo Origin',
    DM2: 'Demo Hub',
    DM3: 'Demo Destination',
  },

  /** `DIRECTIVE.md §27` Demo, via `results.demo`. Every demo panel carries it. */
  caption: results.demo,

  /**
   * The sentence under the demo banner. Says what is fictional and what is real, because a polished
   * demo that reads as live data is the fabrication in `AGENTS.md §1.1` with better styling.
   */
  note: 'Every airline, flight number, and airport here is invented. The clock times and durations are fixed demonstration values, not a forecast, and nothing on this panel came from a provider.',

  /**
   * What the demo is FOR. It exists because the states are the product: a traveler should be able
   * to see how a disruption reads before they are standing in one.
   */
  purpose:
    'The demonstration itinerary shows how DelayPilot presents a result end to end — status with its source, a connection that tightens, a cancellation, and the rights that may apply.',
} as const

export const demoAirportOrder: readonly ['DM1', 'DM2', 'DM3'] = ['DM1', 'DM2', 'DM3']
