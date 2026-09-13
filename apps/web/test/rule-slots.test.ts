/**
 * The rule-slot guard, and the fail-closed promise it makes.
 *
 * Content bodies carry `{{rule:<jurisdiction>:<dotted.path>}}` tokens that resolve against a
 * versioned rule set. No rule set is in force in this deployment, so no slot can resolve — and a
 * raw token reaching a reader would be a placeholder on a page about their legal rights
 * (`AGENTS.md §1.6`). The build must stop instead.
 *
 * The second half of this file is the assertion that matters most: it walks the REAL content
 * collection and proves that no entry the serving rule would emit contains a slot. That is the
 * check that catches a regulatory entry being promoted to `publishable` ahead of its rule set.
 */

import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { assertNoUnresolvedRuleSlots, hasRuleSlots } from '../src/components/rule-slots.ts'

const CONTENT = fileURLToPath(new URL('../src/content/', import.meta.url))

describe('the guard', () => {
  it('passes a body with no slot', () => {
    expect(() => {
      assertNoUnresolvedRuleSlots('guides/example', 'A body with no rule slot in it.')
    }).not.toThrow()
  })

  it('throws on a slot, naming the entry and the token', () => {
    expect(() => {
      assertNoUnresolvedRuleSlots('guides/example', 'Refunds apply after {{rule:us:refund.delay}}.')
    }).toThrow(/guides\/example.*\{\{rule:us:refund\.delay\}\}/s)
  })

  it('counts every slot in the body', () => {
    expect(() => {
      assertNoUnresolvedRuleSlots('x', '{{rule:eu:a.b}} and {{rule:uk:c.d}}')
    }).toThrow(/2 unresolved rule slot/)
  })

  it('tolerates whitespace inside the token', () => {
    expect(hasRuleSlots('{{ rule:us:refund.delay }}')).toBe(true)
  })

  it('does not fire on an ordinary brace pair', () => {
    expect(hasRuleSlots('The object {{a}} is not a rule slot.')).toBe(false)
  })
})

/* ------------------------------------------------------------------------------------------- */

const FRONTMATTER_STATUS = /^status:\s*(\S+)\s*$/m
const SERVED = new Set(['publishable', 'published'])

async function entries(directory: string): Promise<{ id: string; body: string; status: string }[]> {
  const out: { id: string; body: string; status: string }[] = []
  for (const name of await readdir(join(CONTENT, directory))) {
    if (!name.endsWith('.md')) continue
    const raw = await readFile(join(CONTENT, directory, name), 'utf8')
    const end = raw.indexOf('\n---', 3)
    out.push({
      id: `${directory}/${name}`,
      body: raw.slice(end + 4),
      status: FRONTMATTER_STATUS.exec(raw.slice(0, end))?.[1]?.replace(/['"]/g, '') ?? 'unknown',
    })
  }
  return out
}

describe('the real content collection', () => {
  it('serves no entry that contains a rule slot — fail closed, today', async () => {
    const all = [...(await entries('guides')), ...(await entries('passenger-rights'))]
    expect(all.length).toBeGreaterThan(0)

    const offenders = all
      .filter((entry) => SERVED.has(entry.status) && hasRuleSlots(entry.body))
      .map((entry) => entry.id)

    expect(offenders).toEqual([])
  })

  it('does have entries with slots, unserved — so the guard is guarding something real', async () => {
    const all = [...(await entries('guides')), ...(await entries('passenger-rights'))]
    const withSlots = all.filter((entry) => hasRuleSlots(entry.body))
    expect(withSlots.length).toBeGreaterThan(0)
    for (const entry of withSlots) expect(SERVED.has(entry.status)).toBe(false)
  })
})
