/**
 * The adapter between the copy module and the pattern components.
 *
 * Two things are asserted here that nothing else can catch: that the connection meter's words
 * describe the same ratio its bar draws, and that the `Band → status tone` map never understates a
 * band.
 *
 * WHY THE READING IS ASSERTED THROUGH `connectionCopy` AND NOT BY CALLING THE COPY FUNCTION.
 * `apps/web/src/lib/copy/bands.ts` owns the words and `copy.test.ts` proves them. What is left for
 * this file is the one thing that lives at this boundary: the ARGUMENT ORDER at the single call
 * site. `requiredOfAvailableText(required, available)` and the inverse reading differ only in the
 * order two numbers are passed, a swap is invisible in review, and the result is a sentence that
 * contradicts the bar beside it. So every branch below goes through the adapter.
 */

import { describe, expect, it } from 'vitest'
import {
  bandStops,
  bandWord,
  connectionCopy,
  rightsCopy,
  segmentCardCopy,
} from '../src/components/pattern-copy.ts'
import { minutesText, requiredOfAvailableText, slackMinutesText } from '../src/lib/copy/bands.ts'
import { cockpit } from '../src/lib/copy/cockpit.ts'
import { pages } from '../src/lib/copy/pages.ts'
import { bandToStatusTone, bands } from '../../../packages/ui/src/patterns/types.ts'

/**
 * The meter reading the connection cockpit would render for this pair, in the page's own terms:
 * how much time is available, and how much the transfer requires.
 */
const reading = (availableMinutes: number | null, requiredMinutes: number | null): string =>
  connectionCopy({ demo: false, availableMinutes, requiredMinutes }).meterValueText

describe('the connection meter reading — the words agree with the bar', () => {
  it('reads required OUT OF available when both are known', () => {
    // ConnectionCockpit fills the bar `value={required}` of `max={available}` — 44/51, 86 %.
    // "51 of 44 minutes" beside that bar reads as over budget, which is its exact inverse.
    expect(reading(51, 44)).toBe('44 of 51 minutes')
    expect(reading(51, 44)).toBe(requiredOfAvailableText(44, 51))
    expect(reading(51, 44)).not.toBe('51 of 44 minutes')
  })

  it('still reads correctly for a connection that does not fit', () => {
    expect(reading(51, 69)).toBe('69 of 51 minutes')
  })

  it('names the missing quantity rather than guessing, when one is unknown', () => {
    expect(reading(51, null)).toBe('Required transfer time unknown')
    expect(reading(null, 44)).toBe('Available connection time unknown')
  })

  it('falls back to the slack sentence when neither is known', () => {
    expect(reading(null, null)).toBe('Slack unknown')
  })

  it('never equals a band word, in any branch (finding F24)', () => {
    const readings = [reading(51, 44), reading(51, null), reading(null, 44), reading(null, null)]
    const words = bands.map(bandWord)
    for (const value of readings) expect(words).not.toContain(value)
  })
})

describe('band → status tone', () => {
  it('never maps at_risk or disrupted to a calmer tone than critical', () => {
    expect(bandToStatusTone.at_risk).toBe('critical')
    expect(bandToStatusTone.disrupted).toBe('critical')
  })

  it('gives every band a distinct visible word', () => {
    const words = Object.values(bandStops)
    expect(new Set(words).size).toBe(words.length)
  })
})

describe('§26 disclaimer notes are named from the copy module', () => {
  it('gives each note a name that is not a second copy of the sentence', () => {
    // `atoms.tsx` renders every §26 disclaimer inside `role="note"`, which needs an accessible
    // name. The names come from `disclaimers.labels`; this asserts the adapter hands the RIGHT
    // one to each pattern, which is the mapping this file owns.
    const connection = connectionCopy({ demo: false, availableMinutes: 51, requiredMinutes: 44 })
    const rights = rightsCopy({ demo: false })

    expect(connection.disclaimerLabel).toBe('Connection disclaimer')
    expect(rights.disclaimerLabel).toBe('Passenger rights disclaimer')
    expect(connection.disclaimerLabel).not.toBe(rights.disclaimerLabel)
    expect(connection.disclaimerLabel).not.toBe(connection.disclaimer)
    expect(rights.disclaimerLabel).not.toBe(rights.disclaimer)
  })
})

/**
 * `docs/VOICE.md §9.4`: a sign is a word. The Slack row is the one signed quantity on the
 * connection surface, and its entire meaning rested on a hyphen-minus that assistive technology may
 * drop or read inconsistently. These go THROUGH the adapter, for the same reason the meter reading
 * does: what matters is which function reaches the component, and a wiring mistake is invisible at
 * the call site.
 */
describe('the Slack row reading — no meaning rests on a hyphen', () => {
  const slackText = (minutes: number | null): string =>
    connectionCopy({ demo: false, availableMinutes: 51, requiredMinutes: 44 }).slackText(minutes)

  it('states positive slack as a quantity', () => {
    expect(slackText(18)).toBe('18 minutes of slack')
  })

  it('pluralizes one minute', () => {
    expect(slackText(1)).toBe('1 minute of slack')
  })

  it('says "No slack" for exactly none, never "0 minutes"', () => {
    expect(slackText(0)).toBe('No slack')
    expect(slackText(0)).not.toMatch(/\bminute/)
  })

  it('spells a negative as a word, never as a leading hyphen', () => {
    expect(slackText(-18)).toBe('18 minutes short')
    expect(slackText(-18)).not.toMatch(/^-/)
    expect(slackText(-1)).toBe('1 minute short')
  })

  it('distinguishes "none" from "not known" (AGENTS.md §1.1)', () => {
    expect(slackText(null)).toBe('Slack unknown')
    expect(slackText(null)).not.toBe(slackText(0))
  })

  it("is the copy module's function, not a local one", () => {
    for (const value of [18, 1, 0, -18, null]) {
      expect(slackText(value)).toBe(slackMinutesText(value))
    }
  })

  it('never equals a band word, in any branch (F24)', () => {
    const words = bands.map(bandWord)
    for (const value of [18, 1, 0, -18, null]) expect(words).not.toContain(slackText(value))
  })
})

describe('the duration reading belongs to the copy module', () => {
  it('renders the component rows, the window and the required time through minutesText', () => {
    const copy = connectionCopy({ demo: false, availableMinutes: 51, requiredMinutes: 44 })
    for (const value of [1, 6, 44, 51]) expect(copy.minutesText(value)).toBe(minutesText(value))
  })

  it('spells a mis-routed negative rather than drawing it', () => {
    const copy = connectionCopy({ demo: false, availableMinutes: 51, requiredMinutes: 44 })
    expect(copy.minutesText(-18)).toBe('minus 18 minutes')
    expect(copy.minutesText(-18)).not.toMatch(/^-/)
  })
})

/**
 * `docs/ACCESSIBILITY.md` F26. Three cockpits on `/connection-risk/` were three regions named
 * "Connection", each containing a region named "Every component of the required transfer time".
 */
describe('a connection cockpit is named by its topology when more than one shares a page', () => {
  const named = (topology: 'protected' | 'self_transfer' | 'mixed_ticket' | 'unknown' | null) =>
    connectionCopy({ demo: false, availableMinutes: 51, requiredMinutes: 44, topology })

  it('gives the three topologies three distinct headings and three distinct captions', () => {
    const headings = (['protected', 'self_transfer', 'unknown'] as const).map(
      (topology) => named(topology).heading,
    )
    const captions = (['protected', 'self_transfer', 'unknown'] as const).map(
      (topology) => named(topology).componentCaption,
    )
    expect(new Set(headings).size).toBe(3)
    expect(new Set(captions).size).toBe(3)
  })

  it('reads a mixed ticket as a separate-ticket transfer, as the other two maps already do', () => {
    expect(named('mixed_ticket').heading).toBe(named('self_transfer').heading)
  })

  it('keeps the plain §18.5 heading when there is nothing to tell apart', () => {
    expect(named(null).heading).toBe(cockpit.headings.connection)
    expect(named(null).componentCaption).toBe(cockpit.connection.componentsCaption)
    expect(connectionCopy({ demo: false, availableMinutes: 51, requiredMinutes: 44 }).heading).toBe(
      cockpit.headings.connection,
    )
  })
})

describe('the meter name comes from the export, never from a literal', () => {
  it('takes cockpit.connection.meterLabel as it stands today', () => {
    const copy = connectionCopy({ demo: false, availableMinutes: 51, requiredMinutes: 44 })
    expect(copy.meterLabel).toBe(cockpit.connection.meterLabel)
  })

  it('keeps the name, the reading and the band word three different strings (VOICE §9.1)', () => {
    const copy = connectionCopy({ demo: false, availableMinutes: 51, requiredMinutes: 44 })
    expect(copy.meterLabel).not.toBe(copy.meterValueText)
    expect(copy.meterValueText).not.toBe(bandWord('watch'))
    expect(copy.meterLabel).not.toBe(bandWord('watch'))
  })
})

describe('the slots the reviews found empty', () => {
  it('passes the §28 caption to every segment card, gated by the card on provenance', () => {
    expect(segmentCardCopy.demoCaption).toBe(cockpit.demoCaption)
  })

  it('gives the conflicting-providers state its "what to do next" sentence (copy F-6)', () => {
    expect(segmentCardCopy.conflictBody).toBe(cockpit.segment.conflictBody)
    expect(segmentCardCopy.conflictBody).not.toBe(segmentCardCopy.conflictHeading)
  })

  it('renders a rights context block from the same exports ArticleLayout uses (trust F3)', () => {
    const copy = rightsCopy({ demo: true })
    expect(copy.contextHeading).toBe(pages.article.contextHeading)
    expect(copy.contextIntro).toBe(pages.article.contextIntro)
    expect(copy.contextNote).toBe(pages.article.contextNote)
    expect(copy.contextHeading).not.toBe(copy.sourcesLabel)
  })
})
