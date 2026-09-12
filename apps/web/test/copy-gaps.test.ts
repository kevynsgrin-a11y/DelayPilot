/**
 * The copy gaps, kept honest.
 *
 * `apps/web/src/components/copy-gaps.ts` holds the strings `apps/web/src/lib/copy/**` does not
 * export yet. The risk it carries is not that the strings are wrong — it is that one of them
 * SURVIVES after the real export lands, so two sources of the same sentence drift apart and the
 * reviewed one is not the one that ships.
 *
 * These tests fail when that happens: each asserts that the copy module still lacks the export the
 * gap stands in for. A green run means the gap is still a gap; a red one means it is time to delete
 * the interim string, not to loosen the test.
 */

import { describe, expect, it } from 'vitest'
import {
  conditionsNotConnected,
  disclaimerLabels,
  sourceBlockLabels,
} from '../src/components/copy-gaps.ts'
import { cockpit } from '../src/lib/copy/cockpit.ts'
import { disclaimers } from '../src/lib/copy/disclaimers.ts'
import { pages } from '../src/lib/copy/pages.ts'
import { states } from '../src/lib/copy/states.ts'
import { unavailableReasons } from '../src/lib/copy/provenance.ts'

const has = (record: object, key: string): boolean => Object.hasOwn(record, key)

describe('requested exports are still missing from lib/copy', () => {
  it('states.conditionsNotConnected / cockpit.unknown.conditions', () => {
    expect(has(states, 'conditionsNotConnected')).toBe(false)
    expect(has(cockpit.unknown, 'conditions')).toBe(false)
    expect(has(unavailableReasons, 'weatherNotConnected')).toBe(false)
  })

  it('disclaimers.labels', () => {
    expect(has(disclaimers, 'labels')).toBe(false)
  })

  it('pages.article.notYetVerified / internalRefsHeading / context*', () => {
    for (const key of [
      'notYetVerified',
      'internalRefsHeading',
      'contextHeading',
      'contextIntro',
      'contextNote',
    ]) {
      expect(has(pages.article, key)).toBe(false)
    }
  })
})

describe('the interim strings themselves', () => {
  it('say only what is true of this build', () => {
    expect(conditionsNotConnected).toContain('is connected in this deployment')
    expect(conditionsNotConnected).toContain('never proof of a cause')
  })

  it('name every §26 disclaimer, and only those four', () => {
    expect(Object.keys(disclaimerLabels).sort()).toEqual([
      'connection',
      'flightData',
      'prediction',
      'rights',
    ])
  })

  it('render a null verification date as words rather than hiding it', () => {
    expect(sourceBlockLabels.notYetVerified).toMatch(/not yet verified/i)
  })

  it('contain no placeholder token of any kind', () => {
    const everything = [
      conditionsNotConnected,
      ...Object.values(disclaimerLabels),
      ...Object.values(sourceBlockLabels),
    ].join(' ')
    expect(everything.toLowerCase()).not.toMatch(/todo|fixme|lorem|coming soon|tbd/)
  })
})
