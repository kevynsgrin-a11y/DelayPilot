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
import { bandStops, bandWord, connectionCopy, rightsCopy } from '../src/components/pattern-copy.ts'
import { requiredOfAvailableText } from '../src/lib/copy/bands.ts'
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
