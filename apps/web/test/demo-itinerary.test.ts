/**
 * The `DIRECTIVE.md §28` demonstration fixture, held to the rules that make a demo safe.
 *
 * A polished demo that reads as live data is the `AGENTS.md §1.1` fabrication with better styling,
 * so these assertions are not stylistic. Each one is a thing the fixture must never acquire, and
 * the reason it must never acquire it.
 */

import { describe, expect, it } from 'vitest'
import {
  demoActions,
  demoAirports,
  demoAlerts,
  demoAssessmentFactors,
  demoConnectionInsufficient,
  demoConnectionProtected,
  demoConnectionSelfTransfer,
  demoEvidenceSchedule,
  demoRightsEuropeanUnion,
  demoRightsUnitedStates,
  demoSegmentCanceled,
  demoSegmentConflicting,
  demoSegmentInbound,
  demoSegmentOnward,
  demoSegmentPartial,
  demoSegmentStale,
  demoSourceRows,
} from '../src/demo/itinerary.ts'
import { orderActionItems } from '../../../packages/ui/src/patterns/action-order.ts'
import type { Segment } from '../../../packages/ui/src/patterns/types.ts'

const SEGMENTS: readonly Segment[] = [
  demoSegmentInbound,
  demoSegmentOnward,
  demoSegmentCanceled,
  demoSegmentStale,
  demoSegmentPartial,
  demoSegmentConflicting,
]

/** Every string the fixture can put on a screen, flattened. */
const everyString = (value: unknown, out: string[] = []): string[] => {
  if (typeof value === 'string') out.push(value)
  else if (Array.isArray(value)) for (const item of value) everyString(item, out)
  else if (value !== null && typeof value === 'object') {
    for (const item of Object.values(value)) everyString(item, out)
  }
  return out
}

const ALL_TEXT = everyString([
  SEGMENTS,
  demoConnectionProtected,
  demoConnectionSelfTransfer,
  demoConnectionInsufficient,
  demoRightsUnitedStates,
  demoRightsEuropeanUnion,
  demoActions,
  demoAlerts,
  demoAssessmentFactors,
  demoEvidenceSchedule,
  demoSourceRows,
]).join('\n')

describe('identifiers are synthetic by construction', () => {
  it('uses the fixed demo airline and flight numbers', () => {
    expect(demoSegmentInbound.airline).toBe('Demo Airline')
    expect(demoSegmentInbound.flightNumber).toBe('DEMO 101')
    expect(demoSegmentOnward.flightNumber).toBe('DEMO 202')
  })

  it('uses airport codes carrying a digit, so none can collide with an IATA code', () => {
    for (const airport of Object.values(demoAirports)) {
      expect(airport.code).toMatch(/^[A-Z]{2}\d$/)
    }
  })

  it('gives every airport a real IANA zone, never an offset', () => {
    for (const airport of Object.values(demoAirports)) {
      expect(airport.zone).toMatch(/^[A-Za-z_]+\/[A-Za-z_]+$/)
    }
  })
})

describe('what the demo may never contain', () => {
  it('has no gate and no terminal on any segment — §28 and AGENTS.md §1.1', () => {
    for (const segment of SEGMENTS) {
      expect(segment.gate.known).toBe(false)
      expect(segment.terminal.known).toBe(false)
    }
  })

  it('has no percentage anywhere', () => {
    expect(ALL_TEXT).not.toContain('%')
    expect(ALL_TEXT).not.toMatch(/\bper ?cent\b/i)
  })

  it('has no rights amount — no rule set is in force, so there is nothing to quantify', () => {
    for (const assessment of [demoRightsUnitedStates, demoRightsEuropeanUnion]) {
      for (const line of assessment.lines) expect(line.amount).toBeUndefined()
    }
    expect(ALL_TEXT).not.toMatch(/[€£$]\s?\d/)
  })

  it('names its rule set "Demo rule set" — never a version pretending to be a legal one', () => {
    for (const assessment of [demoRightsUnitedStates, demoRightsEuropeanUnion]) {
      expect(assessment.ruleSet).toBe('Demo rule set')
    }
  })

  it('uses only the five permitted rights statuses', () => {
    const permitted = new Set([
      'likely_applies',
      'may_apply',
      'not_indicated',
      'cannot_determine',
      'future_rule_not_active',
    ])
    for (const assessment of [demoRightsUnitedStates, demoRightsEuropeanUnion]) {
      for (const line of assessment.lines) expect(permitted.has(line.status)).toBe(true)
    }
  })

  it('shows the EU 2026 reform only as a future rule that is not active', () => {
    expect(demoRightsEuropeanUnion.futureRule?.status).toBe('future_rule_not_active')
    for (const line of demoRightsEuropeanUnion.lines) {
      expect(line.status).not.toBe('future_rule_not_active')
    }
  })

  it('keeps voluntary commitments in their own module, on the US card only', () => {
    expect(demoRightsUnitedStates.voluntaryCommitments).toBeDefined()
    expect(demoRightsEuropeanUnion.voluntaryCommitments).toBeUndefined()
  })
})

describe('computed values are computed, not written down', () => {
  it('derives the inbound delay from the two instants', () => {
    // 15:20Z scheduled, 16:07Z estimated.
    expect(demoSegmentInbound.departureDelayMinutes).toEqual({ known: true, value: 47 })
  })

  it('reports zero delay for the on-time segment — zero is not unknown', () => {
    expect(demoSegmentOnward.departureDelayMinutes).toEqual({ known: true, value: 0 })
  })

  it('satisfies S = W − T on the protected connection', () => {
    const w = demoConnectionProtected.availableMinutes
    const t = demoConnectionProtected.requiredMinutes
    const s = demoConnectionProtected.slackMinutes
    expect(w.known && t.known && s.known).toBe(true)
    if (w.known && t.known && s.known) expect(s.value).toBe(w.value - t.value)
  })

  it('sums T from the applicable components only', () => {
    const total = demoConnectionProtected.components.reduce(
      (sum, component) =>
        component.applies && component.minutes.known ? sum + component.minutes.value : sum,
      0,
    )
    expect(demoConnectionProtected.requiredMinutes).toEqual({ known: true, value: total })
  })

  it('lists all seven T components, applicable or not', () => {
    for (const assessment of [demoConnectionProtected, demoConnectionSelfTransfer]) {
      expect(assessment.components.map((component) => component.key)).toEqual([
        'deplane',
        'walk',
        'security',
        'immigration',
        'bag',
        'mobility',
        'uncertainty',
      ])
    }
  })

  it('gives every component a derivation class', () => {
    const permitted = new Set(['measured', 'policy_derived', 'airport_derived', 'estimated'])
    for (const component of demoConnectionProtected.components) {
      expect(permitted.has(component.derivation)).toBe(true)
    }
  })
})

describe('the self-transfer comparison', () => {
  it('is never labelled protected', () => {
    expect(demoConnectionSelfTransfer.topology).toBe('self_transfer')
  })

  it('differs from the protected assessment ONLY in the bag component', () => {
    const fingerprint = (assessment: typeof demoConnectionProtected): string[] =>
      assessment.components.map(
        (component) =>
          `${component.key}:${String(component.applies)}:${JSON.stringify(component.minutes)}`,
      )

    const before = fingerprint(demoConnectionProtected)
    const after = fingerprint(demoConnectionSelfTransfer)
    const changed = demoConnectionSelfTransfer.components
      .map((component, index) => ({ key: component.key, same: before[index] === after[index] }))
      .filter((entry) => !entry.same)
    expect(changed.map((component) => component.key)).toEqual(['bag'])
  })

  it('turns the slack negative, which is the whole point of showing it', () => {
    const slack = demoConnectionSelfTransfer.slackMinutes
    expect(slack.known && slack.value < 0).toBe(true)
  })
})

describe('the insufficient-data connection', () => {
  it('reports unknown rather than zero for W, T and S', () => {
    expect(demoConnectionInsufficient.availableMinutes.known).toBe(false)
    expect(demoConnectionInsufficient.requiredMinutes.known).toBe(false)
    expect(demoConnectionInsufficient.slackMinutes.known).toBe(false)
  })

  it('bands as unknown, and is never calibrated', () => {
    expect(demoConnectionInsufficient.band).toBe('unknown')
    expect(demoConnectionInsufficient.calibrated).toBe(false)
  })

  it('gives every unknown a reason sentence, never a blank', () => {
    for (const value of [
      demoConnectionInsufficient.availableMinutes,
      demoConnectionInsufficient.requiredMinutes,
      demoConnectionInsufficient.slackMinutes,
    ]) {
      expect(value.known).toBe(false)
      if (!value.known) expect(value.reason.length).toBeGreaterThan(10)
    }
  })
})

describe('provenance', () => {
  it('labels every segment with one of the six kinds and a freshness sentence', () => {
    const permitted = new Set(['live', 'cached', 'stale', 'demo', 'unavailable', 'heuristic'])
    for (const segment of SEGMENTS) {
      expect(permitted.has(segment.provenance.kind)).toBe(true)
      expect(segment.provenance.freshness).toBeTruthy()
    }
  })

  it('renders the stale segment as stale rather than dropping it', () => {
    expect(demoSegmentStale.provenance.kind).toBe('stale')
  })

  it('shows both snapshots on the conflicting segment and names the newest source', () => {
    expect(demoSegmentConflicting.conflicting).toBeDefined()
    expect(demoSegmentConflicting.conflicting?.newestSource).toBeTruthy()
    expect(demoSegmentConflicting.conflicting?.status).not.toBe(demoSegmentConflicting.status)
    // Confidence is lowered rather than a winner being picked.
    expect(demoSegmentConflicting.confidence).toBe('low')
  })

  it('covers the unavailable and heuristic labels in the freshness panel', () => {
    const kinds = new Set(demoSourceRows.map((row) => row.kind))
    expect(kinds.has('unavailable')).toBe(true)
    expect(kinds.has('heuristic')).toBe(true)
    expect(kinds.has('stale')).toBe(true)
    expect(kinds.has('demo')).toBe(true)
  })
})

describe('the action checklist ordering', () => {
  const ordered = orderActionItems(demoActions)

  it('leads with the soonest known deadline', () => {
    expect(ordered[0]?.id).toBe('decide-replacement')
    expect(ordered[0]?.deadline.known).toBe(true)
  })

  it('ranks irreversible above reversible once deadlines tie', () => {
    const withoutDeadline = ordered.filter((item) => !item.deadline.known)
    expect(withoutDeadline[0]?.reversible).toBe(false)
  })

  it('gives every irreversible item a consequence line', () => {
    for (const item of demoActions) {
      if (!item.reversible) expect(item.consequence).toBeTruthy()
    }
  })

  it('never carries a utility score into the fixture — U is computed, not authored', () => {
    for (const item of demoActions) expect(item.utility).toBeUndefined()
  })

  it('is deterministic', () => {
    expect(orderActionItems(demoActions).map((item) => item.id)).toEqual(
      orderActionItems([...demoActions].reverse()).map((item) => item.id),
    )
  })
})

describe('the evidence schedule', () => {
  it('carries the airport code and the IANA zone on every time it states', () => {
    for (const line of demoEvidenceSchedule) {
      expect(line).toMatch(/DM[123]/)
      expect(line).toMatch(/\((America|Europe)\/[A-Za-z_]+\)/)
    }
  })

  it('says the onward leg lands on a later local date', () => {
    expect(demoEvidenceSchedule[1]).toContain('Sun 15 Mar')
  })
})
