/**
 * The `DIRECTIVE.md §28` demonstration fixture, held to the rules that make a demo safe.
 *
 * A polished demo that reads as live data is the `AGENTS.md §1.1` fabrication with better styling,
 * so these assertions are not stylistic. Each one is a thing the fixture must never acquire, and
 * the reason it must never acquire it.
 */

import { describe, expect, it } from 'vitest'
import {
  contextSource,
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
  sourceLink,
} from '../src/demo/itinerary.ts'
import { resolveSource } from '../src/components/source-registry.ts'
import { unavailableReasons } from '../src/lib/copy/provenance.ts'
import { cockpit, demoAlertBody, type DemoAlertId } from '../src/lib/copy/cockpit.ts'
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

  /*
   * copy review F-26. `ask-reason` explained its unknown deadline with `causeNotVerified`, so the
   * card read "Deadline: The disruption cause has not been verified." beside a step whose whole
   * purpose is to obtain that cause. WHY no deadline can be stated is the same on all three: no
   * rule set is in force, so no limit has a source.
   */
  it('explains an unknown deadline by the missing rule set, not by the missing cause', () => {
    for (const item of demoActions) {
      if (item.deadline.known) continue
      expect(item.deadline.reason).toBe(unavailableReasons.noRuleSetInForce.fact)
    }
  })

  /* The checklist is one jurisdiction's, so its source links are one regulator's (F-26). */
  it('cites the same regulator record across the US steps', () => {
    const ids = new Set(demoActions.flatMap((item) => item.sources.map((source) => source.id)))
    expect([...ids]).toEqual(['dot-refunds'])
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

/**
 * Trust sweep F3. The fixture listed the Council of the EU's press release under "Official sources"
 * beside a regulator record. The registry ALREADY recorded it as `evidenceClass: "secondary"` with
 * `citableForRuleValues: false` — the fact was in the data and nothing read it.
 *
 * `docs/EDITORIAL_POLICY.md`: the evidence class decides what a record can carry.
 */
describe('the evidence class decides which list a source lands in', () => {
  it('lists only primary, rule-citable records as official sources', () => {
    for (const assessment of [demoRightsUnitedStates, demoRightsEuropeanUnion]) {
      for (const source of assessment.sources) {
        const record = resolveSource(source.id)
        expect(record.missing).toBe(false)
        expect(record.evidenceClass).toBe('primary')
        expect(record.citableForRuleValues).toBe(true)
      }
    }
  })

  it('lists only secondary records as context, and never as a link', () => {
    for (const source of demoRightsEuropeanUnion.contextSources ?? []) {
      expect(resolveSource(source.id).evidenceClass).toBe('secondary')
      expect(source.evidenceClass).toBe('secondary')
      expect(Object.hasOwn(source, 'href')).toBe(false)
    }
  })

  it('moved the Council press release out of the EU sources list', () => {
    expect(demoRightsEuropeanUnion.sources.map((source) => source.id)).not.toContain(
      'eu-council-2026-07-13',
    )
    expect(demoRightsEuropeanUnion.contextSources?.map((source) => source.id)).toContain(
      'eu-council-2026-07-13',
    )
  })

  it('refuses a secondary id passed as an official source — at build time, not at review', () => {
    expect(() => sourceLink('eu-council-2026-07-13', 'Council press release')).toThrow(
      /cannot be listed as an official source/,
    )
  })

  it('refuses a primary id passed as a context source', () => {
    expect(() => contextSource('dot-refunds', 'DOT refunds')).toThrow(/belongs in sources/)
  })

  it('refuses an id the registry does not know at all', () => {
    expect(() => sourceLink('not-a-registry-id', 'Nothing')).toThrow(/no registry record/)
  })

  it('holds every action item to the same rule', () => {
    for (const item of demoActions) {
      for (const source of item.sources) {
        expect(resolveSource(source.id).evidenceClass).toBe('primary')
      }
    }
  })
})

/**
 * Trust sweep F2. The registry records the reform's only source as non-citable for rule values, and
 * no Official Journal record exists in it at all. A stated interval is a rule value.
 */
describe('the EU reform states no interval it cannot source', () => {
  it('does not name a period between publication and entry into force', () => {
    const detail = demoRightsEuropeanUnion.futureRule?.detail ?? ''
    expect(detail).not.toMatch(/twelve months|12 months|twenty days|20 days/i)
    expect(detail).toContain('has not been verified here')
  })
})

/**
 * `docs/ACCESSIBILITY.md` F30. A `<dt>`/`<dd>` pair asserts the value is the thing the label names,
 * and this list paired "Status" with the demonstration caption on every segment while the cancelled
 * segment paired the same label with a real status sentence.
 */
describe('the operational detail list says what its labels name', () => {
  it('does not pair a field label with the demonstration caption', () => {
    for (const segment of SEGMENTS) {
      for (const row of segment.operationalDetail) {
        const value = row.value.known ? row.value.value : row.value.reason
        expect(value).not.toContain('is invented')
      }
    }
  })
})

/**
 * `AGENTS.md §1.3` bans the legal determination in EITHER direction, and the fixture had one of the
 * negative kind: a self-transfer assumption stating flatly that no carrier bore responsibility for
 * the onward flight (copy review F-24; the trust sweep rated this class critical). The negative
 * half is the one a traveler acts on by NOT acting — they read it and do not ask.
 *
 * The patterns below are the class, not the one sentence: a rewrite that swaps "responsible" for
 * "liable" is the same defect. The forbidden-phrase lint does not cover them yet — a handoff is
 * filed with `ux-copy-steward` — so this holds the fixture to them meanwhile.
 */
describe('no flat legal determination, in either direction', () => {
  it('states assumptions and facts, never who is or is not responsible', () => {
    const determinations = [
      /\bno\s+airline\s+is\s+responsible\b/i,
      /\bowes?\s+you\s+nothing\b/i,
      /\bis\s+not\s+liable\b/i,
      /\bhas\s+no\s+obligation\b/i,
      /\bcannot\s+claim\b/i,
    ]
    for (const pattern of determinations) {
      expect(ALL_TEXT).not.toMatch(pattern)
    }
  })

  it('keeps the self-transfer assumption about the assessment, not about liability', () => {
    const [, , third] = demoConnectionSelfTransfer.assumptions
    expect(third).toBe(
      'The two tickets are assessed as separate journeys, so nothing here assumes the second ' +
        'airline will re-accommodate you.',
    )
  })
})

/**
 * copy re-check F-25. Three of the five bodies were the copy module's generic severity DEFINITION,
 * and the first contradicted its own title: "Monitoring started for this itinerary" over "A detail
 * changed. Worth knowing, nothing to do." `DIRECTIVE.md §16` asks for what changed, what it means,
 * and the next useful action.
 *
 * The assertions are structural on purpose — the wording is `ux-copy-steward`'s and is asserted in
 * `copy.test.ts`. What belongs here is that the fixture cannot drift from it: every id is one the
 * copy module knows, every body is the one that id names, and no two alerts share a body.
 */
describe('the demonstration alert bodies', () => {
  it('uses the five alert ids the copy module keys its bodies by, in timeline order', () => {
    expect(demoAlerts.map((event) => event.id)).toEqual(Object.keys(cockpit.alerts.demoBodies))
  })

  it('takes every body from the copy module, keyed by its own id', () => {
    for (const event of demoAlerts) {
      expect(event.detail).toBe(demoAlertBody(event.id as DemoAlertId))
    }
  })

  it('gives each alert a body of its own', () => {
    expect(new Set(demoAlerts.map((event) => event.detail)).size).toBe(demoAlerts.length)
  })
})

describe('typography', () => {
  it('writes apostrophes as ASCII, per docs/VOICE.md §11', () => {
    expect(ALL_TEXT).not.toMatch(/[\u2018\u2019\u201c\u201d]/)
  })
})
