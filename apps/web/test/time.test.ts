/**
 * Time rendering: DST gaps, DST folds, overnight legs and date-line crossings.
 *
 * `AGENTS.md §3.3` calls these "tested cases, not edge cases", and this file is what makes that
 * true. Every assertion is on a pure function of (UTC instant, IANA zone) — nothing here reads the
 * host clock or the host zone, so the result is the same on a CI runner in any region.
 */

import { describe, expect, it } from 'vitest'
import {
  clockTime,
  crossesLocalDate,
  localIsoDate,
  minutesBetween,
  segmentDelayMinutes,
  zoneName,
} from '../../../packages/ui/src/patterns/time.ts'

const LA = 'America/Los_Angeles'
const NY = 'America/New_York'
const AMS = 'Europe/Amsterdam'
const AKL = 'Pacific/Auckland'

describe('clock and zone', () => {
  it('renders a 24-hour zero-padded clock in the airport zone', () => {
    expect(clockTime('2026-03-14T15:20:00Z', LA)).toBe('08:20')
    expect(clockTime('2026-03-14T15:20:00Z', NY)).toBe('11:20')
  })

  it('labels the zone as it is AT THAT INSTANT, so summer and winter differ', () => {
    // 2026-03-08 is the US spring-forward date: 01:59 PST becomes 03:00 PDT.
    expect(zoneName('2026-03-01T20:00:00Z', LA)).toBe('Pacific Standard Time')
    expect(zoneName('2026-03-14T20:00:00Z', LA)).toBe('Pacific Daylight Time')
  })

  it('never renders an offset as the zone — an offset is not a zone (AGENTS.md §3.3)', () => {
    for (const zone of [LA, NY, AMS, AKL]) {
      expect(zoneName('2026-03-14T20:00:00Z', zone)).not.toMatch(/^GMT[+-]/)
    }
  })
})

describe('the DST gap — the hour that does not exist', () => {
  // 2026-03-08T10:00:00Z is exactly the transition: 02:00 PST → 03:00 PDT.
  it('renders the instants either side of the gap without inventing an hour', () => {
    expect(clockTime('2026-03-08T09:59:00Z', LA)).toBe('01:59')
    expect(clockTime('2026-03-08T10:00:00Z', LA)).toBe('03:00')
  })

  it('measures the elapsed minutes across the gap, not the clock difference', () => {
    // One minute of real time, even though the wall clock advanced by 61.
    expect(minutesBetween('2026-03-08T09:59:00Z', '2026-03-08T10:00:00Z')).toBe(1)
  })
})

describe('the DST fold — the hour that happens twice', () => {
  // 2026-11-01T06:00:00Z: 01:59:59 PDT becomes 01:00:00 PST.
  it('renders the same wall-clock hour for two different instants', () => {
    expect(clockTime('2026-11-01T08:30:00Z', LA)).toBe('01:30')
    expect(clockTime('2026-11-01T09:30:00Z', LA)).toBe('01:30')
  })

  it('distinguishes them by zone name, which is the only thing that does', () => {
    expect(zoneName('2026-11-01T08:30:00Z', LA)).toBe('Pacific Daylight Time')
    expect(zoneName('2026-11-01T09:30:00Z', LA)).toBe('Pacific Standard Time')
  })

  it('still measures sixty real minutes between them', () => {
    expect(minutesBetween('2026-11-01T08:30:00Z', '2026-11-01T09:30:00Z')).toBe(60)
  })
})

describe('an overnight leg', () => {
  // DEMO 202: 19:55 EDT on the 14th, arriving 08:30 CET on the 15th.
  const departure = { instant: '2026-03-14T23:55:00Z', zone: NY }
  const arrival = { instant: '2026-03-15T07:30:00Z', zone: AMS }

  it('lands on a later local calendar date', () => {
    expect(localIsoDate(departure.instant, departure.zone)).toBe('2026-03-14')
    expect(localIsoDate(arrival.instant, arrival.zone)).toBe('2026-03-15')
    expect(crossesLocalDate(departure, arrival)).toBe(true)
  })
})

describe('a date-line crossing', () => {
  // Eastbound across the date line: depart Auckland, arrive Los Angeles on the PREVIOUS local day.
  const departure = { instant: '2026-06-10T06:30:00Z', zone: AKL }
  const arrival = { instant: '2026-06-10T19:00:00Z', zone: LA }

  it('arrives on an earlier local calendar date than it departed', () => {
    expect(localIsoDate(departure.instant, departure.zone)).toBe('2026-06-10')
    expect(localIsoDate(arrival.instant, arrival.zone)).toBe('2026-06-10')
    // Same UTC day, but the local clock ran backwards by nineteen hours.
    expect(clockTime(departure.instant, departure.zone)).toBe('18:30')
    expect(clockTime(arrival.instant, arrival.zone)).toBe('12:00')
  })

  it('reports a crossing when the local dates differ', () => {
    const westbound = { instant: '2026-06-11T09:00:00Z', zone: AKL }
    expect(crossesLocalDate(arrival, westbound)).toBe(true)
  })
})

describe('segmentDelayMinutes', () => {
  it('is (actualOrEstimatedDeparture − scheduledDeparture) / 60000, in whole minutes', () => {
    expect(segmentDelayMinutes('2026-03-14T15:20:00Z', '2026-03-14T16:07:00Z')).toBe(47)
  })

  it('is zero for an on-time departure — which is not the same as unknown', () => {
    expect(segmentDelayMinutes('2026-03-14T15:20:00Z', '2026-03-14T15:20:00Z')).toBe(0)
  })

  it('is negative for an early departure rather than clamped to zero', () => {
    expect(segmentDelayMinutes('2026-03-14T15:20:00Z', '2026-03-14T15:08:00Z')).toBe(-12)
  })

  it('measures real elapsed minutes across a DST transition', () => {
    // Scheduled 01:30 PST, actually pushed back an hour of REAL time across the spring forward.
    expect(segmentDelayMinutes('2026-03-08T09:30:00Z', '2026-03-08T10:30:00Z')).toBe(60)
  })
})
