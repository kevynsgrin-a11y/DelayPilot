/**
 * The `DIRECTIVE.md §17` General state group, plus the states this build reaches because a system
 * is not connected yet. Owner: `ux-copy-steward`.
 *
 * Written before the happy paths, deliberately. These are the screens a traveler hits on a bad day,
 * and a product that words them as an apology or a shrug has failed at the moment it mattered. Each
 * one says what is true, what it means for the information on screen, and what can be done next.
 *
 * None of them apologizes for an airline, performs empathy, or says "oops".
 *
 * The sentences that name a MISSING FACT come from `provenance.unavailableReasons`, so one fact has
 * one wording wherever it appears — the cockpit's per-field unknown, this general state, and any
 * future notification all say it the same way.
 */

import { unavailableReasons } from './provenance.ts'

export const states = {
  offline: {
    heading: 'You are offline',
    body: 'DelayPilot cannot reach any source while you are offline. Anything still on screen is what loaded earlier, and it is not being refreshed.',
    action: 'Reconnect to check for changes.',
  },

  slowNetwork: {
    heading: 'This is taking longer than usual',
    body: 'The connection is slow. The page will fill in as responses arrive, and nothing you entered has been lost.',
    action: null,
  },

  unsupportedBrowser: {
    heading: 'Some of this will not work in this browser',
    body: 'Interactive parts of DelayPilot need a newer browser. The text, the sources, and the rights explainers still read correctly here.',
    action: null,
  },

  /** `§17` empty, per surface. An empty state names why it is empty. */
  empty: {
    guides: {
      heading: 'No guides are published yet',
      body: 'A guide appears here after it has been sourced, reviewed, and dated. Nothing is shown before that, because an unreviewed guide about passenger rights is worse than no guide.',
      action: null,
    },
    rights: {
      heading: 'No rights pages are published yet',
      body: 'A rights page appears once its rule set has been verified against the official source and given a version and an effective date. Until then there is nothing here worth relying on.',
      action: null,
    },
    searchResults: {
      heading: 'Nothing matched',
      body: 'No result matched what you entered. Widening the date or checking the airline code is usually enough.',
      action: null,
    },
  },

  /**
   * The `aria-busy` sentence for a loading region. One per view at most: a page of live regions
   * announces itself into uselessness (`docs/ACCESSIBILITY.md` B4).
   */
  skeleton: 'Loading. This section will update when the content is ready.',

  errorBoundary: {
    heading: 'This section did not load',
    body: 'Something in this part of the page failed. The rest of the page is unaffected, and nothing you entered has been sent anywhere.',
    action: 'Reload the page.',
  },

  maintenance: {
    heading: 'DelayPilot is briefly unavailable',
    body: 'Planned maintenance is in progress. Flight information is not being refreshed, so treat anything you can still see as out of date.',
    action: 'Check with the operating airline for anything time-critical.',
  },

  consentRequired: {
    heading: 'This needs your choice first',
    body: 'This part of the page loads only after you choose what you allow. Nothing is loaded and nothing is measured before that choice.',
    action: null,
  },

  adBlocked: {
    heading: 'An advertisement did not load',
    body: 'The slot is empty. Nothing on this page depends on it, and no part of your itinerary was sent anywhere.',
    action: null,
  },

  affiliateUnavailable: {
    heading: 'No partner links are available',
    body: 'DelayPilot shows a partner link only where a real agreement exists and the merchant is named. None does, so none is shown.',
    action: null,
  },

  /**
   * `DIRECTIVE.md §18.5` weather and airspace, when no feed is connected — the `§17` unavailable
   * state for that panel.
   *
   * An unavailable state names the specific missing fact (`AGENTS.md §1.1`), and the fact here is
   * the feed, not the weather: DelayPilot is not saying conditions are fine, it is saying it cannot
   * see them. The second sentence is the `AGENTS.md §1.3` rule that travels with every mention of
   * conditions — weather near an airport is context for a band, never proof of a cause — and it
   * belongs in the panel rather than in a footnote, because the panel is where a reader would
   * otherwise draw the inference.
   *
   * HOW TO RENDER IT. `body`, then `action`. The section already carries `cockpit.headings.conditions`
   * as its title; `heading` is for a surface that shows this state without that section heading.
   * Never a blank panel, never a dash, never a hidden section.
   */
  conditionsNotConnected: {
    heading: 'Operating conditions are unavailable',
    body: `${unavailableReasons.weatherNotConnected.fact} Conditions are context for a band and are never proof of a cause.`,
    action: unavailableReasons.weatherNotConnected.nextStep,
  },

  /** `§17` billing: billing not configured. The honest state, with no price in it. */
  billingNotConfigured: {
    heading: 'Purchases are not available',
    body: 'No payment processor is configured in this deployment. Nothing can be bought here, and no price is shown.',
    action: null,
  },
} as const

export interface SurfaceState {
  readonly heading: string
  readonly body: string
  readonly action: string | null
}
