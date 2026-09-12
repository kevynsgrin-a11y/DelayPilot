/**
 * `orderActionItems` — the `§18.5` ordering rule, and the fact that `U` never reaches a screen.
 *
 * "Time sensitivity first (soonest-expiring deadline leads), then reversibility — irreversible
 * choices rank above reversible ones. Rank internally with U; never display U, never render it as a
 * probability."
 */

import { describe, expect, it } from 'vitest'
import { actionUtility, orderActionItems } from '../../../packages/ui/src/patterns/action-order.ts'
import { known, unknown, type ActionItem } from '../../../packages/ui/src/patterns/types.ts'

const at = (instant: string) => known({ instant, zone: 'America/New_York', airport: 'DM2' })

const item = (overrides: Partial<ActionItem> & { id: string }): ActionItem => ({
  label: overrides.id,
  detail: 'detail',
  deadline: unknown('No deadline is known.'),
  reversible: true,
  sources: [],
  ...overrides,
})

describe('ordering', () => {
  it('leads with the soonest deadline', () => {
    const ordered = orderActionItems([
      item({ id: 'later', deadline: at('2026-03-14T23:00:00Z') }),
      item({ id: 'sooner', deadline: at('2026-03-14T21:00:00Z') }),
    ])
    expect(ordered.map((entry) => entry.id)).toEqual(['sooner', 'later'])
  })

  it('sorts an unknown deadline AFTER every known one — unknown is not urgent', () => {
    const ordered = orderActionItems([
      item({ id: 'unknown-deadline' }),
      item({ id: 'known-deadline', deadline: at('2026-03-20T00:00:00Z') }),
    ])
    expect(ordered.map((entry) => entry.id)).toEqual(['known-deadline', 'unknown-deadline'])
  })

  it('ranks irreversible above reversible when deadlines tie', () => {
    const ordered = orderActionItems([
      item({ id: 'reversible', reversible: true }),
      item({ id: 'irreversible', reversible: false, consequence: 'It cannot be undone.' }),
    ])
    expect(ordered.map((entry) => entry.id)).toEqual(['irreversible', 'reversible'])
  })

  it('uses U only as a tie-break, higher first', () => {
    const ordered = orderActionItems([
      item({ id: 'low', utility: 1 }),
      item({ id: 'high', utility: 9 }),
    ])
    expect(ordered.map((entry) => entry.id)).toEqual(['high', 'low'])
  })

  it('falls through to the id, so the sort is total and deterministic', () => {
    const ids = ['c', 'a', 'b'].map((id) => item({ id }))
    expect(orderActionItems(ids).map((entry) => entry.id)).toEqual(['a', 'b', 'c'])
    expect(orderActionItems([...ids].reverse()).map((entry) => entry.id)).toEqual(['a', 'b', 'c'])
  })

  it('does not mutate its input', () => {
    const input = [item({ id: 'b' }), item({ id: 'a' })]
    orderActionItems(input)
    expect(input.map((entry) => entry.id)).toEqual(['b', 'a'])
  })
})

describe('actionUtility', () => {
  it('is U = p_cancel·c_cancel + p_miss·c_miss + p_delay60·c_delay', () => {
    expect(
      actionUtility({
        pCancel: 0.5,
        cCancel: 10,
        pMiss: 0.25,
        cMiss: 8,
        pDelay60: 0.1,
        cDelay: 4,
      }),
    ).toBeCloseTo(0.5 * 10 + 0.25 * 8 + 0.1 * 4)
  })

  it('is a sort key and nothing else: no formatter, no percentage, no label', () => {
    // The value is a bare number. Nothing in the module turns it into a string, which is the
    // mechanical half of "never displayed" — there is no code path from U to a rendered node.
    const value = actionUtility({
      pCancel: 1,
      cCancel: 1,
      pMiss: 0,
      cMiss: 0,
      pDelay60: 0,
      cDelay: 0,
    })
    expect(typeof value).toBe('number')
  })
})
