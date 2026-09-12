/**
 * The adapter between the copy module and the pattern components.
 *
 * Two things are asserted here that nothing else can catch: that the connection meter's words
 * describe the same ratio its bar draws, and that the `Band → status tone` map never understates a
 * band.
 */

import { describe, expect, it } from 'vitest'
import { bandStops, bandWord, meterReading } from '../src/components/pattern-copy.ts'
import { bandToStatusTone, bands } from '../../../packages/ui/src/patterns/types.ts'

describe('meterReading — the words agree with the bar', () => {
  it('reads required OUT OF available when both are known', () => {
    // The bar fills 44/51. "51 of 44 minutes" beside an 86%-full bar reads as over budget.
    expect(meterReading(51, 44)).toBe('44 of 51 minutes')
  })

  it('still reads correctly for a connection that does not fit', () => {
    expect(meterReading(51, 69)).toBe('69 of 51 minutes')
  })

  it('names the missing quantity rather than guessing, when one is unknown', () => {
    expect(meterReading(51, null)).toBe('Required transfer time unknown')
    expect(meterReading(null, 44)).toBe('Available connection time unknown')
  })

  it('falls back to the slack sentence when neither is known', () => {
    expect(meterReading(null, null)).toBe('Slack unknown')
  })

  it('never equals a band word, in any branch (finding F24)', () => {
    const readings = [
      meterReading(51, 44),
      meterReading(51, null),
      meterReading(null, 44),
      meterReading(null, null),
    ]
    const words = bands.map(bandWord)
    for (const reading of readings) expect(words).not.toContain(reading)
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
