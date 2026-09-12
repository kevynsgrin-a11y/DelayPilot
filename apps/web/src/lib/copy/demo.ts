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

export const demo = {
  /** The fictional operating carrier. Not an IATA or ICAO designator. */
  airline: 'Demo Airline',

  flights: {
    /** The inbound segment. */
    first: 'DEMO 101',
    /** The onward segment. */
    second: 'DEMO 202',
  },

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
