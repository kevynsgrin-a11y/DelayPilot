/**
 * The `DIRECTIVE.md §28` alert timeline, told as five states. Owner: `ux-copy-steward`.
 *
 * This is the scroll-scrubbed demonstration chronology permitted by ADR 0003 rule 2(d). Its base
 * DOM is a complete, readable, ordered list, and the copy below has to work with the motion turned
 * off entirely — so nothing here depends on a transition, an order of arrival, or a reveal.
 *
 * NO TIMES AND NO NUMBERS. A chronology with clock times invites a reader to treat it as a
 * schedule. These five steps describe what CHANGES and what the product does about it; the
 * demonstration cockpit is where labeled demo values live.
 */

export const chronology = {
  heading: 'How a disruption unfolds',
  intro:
    'The same itinerary, moving through five states. Each one is designed, tested, and worded on its own — including the ones where the answer is that we do not know.',

  steps: {
    scheduled: {
      label: 'Scheduled',
      description:
        'Both flights are on schedule. The status carries the source it came from and how old that response is, so a quiet screen is still an informative one.',
    },
    delayedInbound: {
      label: 'Inbound delay',
      description:
        'The first flight pushes back later than planned. The itinerary still works. The screen says what changed, what it means for the connection, and nothing more than that.',
    },
    connectionWatch: {
      label: 'Connection watch',
      description:
        'Slack shrinks toward the required transfer time. The band moves to watch, the transfer components are broken out so you can see which one is eating the time, and alerts stay on.',
    },
    cancellation: {
      label: 'Cancellation',
      description:
        'A material disruption is confirmed. The action checklist moves to the front, ordered by what is time-sensitive and what cannot be undone, with the source for each step.',
    },
    rightsMayApply: {
      label: 'Rights that may apply',
      description:
        'The facts entered are read against the rule version shown, and the card says what may apply, what is still missing, and which official source to check. It is an estimate, and it says so.',
    },
  },

  /** Render order. The frontend iterates this; it does not re-sort the object. */
  order: ['scheduled', 'delayedInbound', 'connectionWatch', 'cancellation', 'rightsMayApply'],

  /** Shown under the list when motion is off, so the static frame still explains itself. */
  staticNote:
    'The list above is the whole chronology. Motion only moves between the steps; it never carries information of its own.',
} as const
