/**
 * Tests for the forbidden-phrase lint. Owner: `ux-copy-steward`.
 *
 * A lint with no proof that it fires is not a lint, so the center of this file is a fixture that
 * CONTAINS violations and an assertion that every one of them is reported — with the hyphen,
 * curly-apostrophe, line-wrap, camelCase and escape-sequence variants the charter requires it to
 * tolerate. The mirror of that is a clean fixture proving it stays quiet on correct copy, because a
 * rule that flags good writing gets switched off inside a week.
 *
 * Nothing in this file writes the banned literals out. The fixtures carry them, the test reads the
 * fixtures from disk, and the few short phrases the precision tests need are ASSEMBLED at runtime.
 * Writing one out would oblige this file to join the allowlist, and the allowlist is closed at
 * four — the same discipline `forbidden-phrases.ts` keeps, for the same reason.
 */

import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { forbiddenPhrases, GAP, GAP_NO_NEGATION, isGap } from './forbidden-phrases.ts'
import {
  allowlist,
  isAllowlisted,
  normalize,
  scanRepository,
  scanText,
  ROOT_FILES,
  type Hit,
} from './scan.ts'

const REPO_ROOT = fileURLToPath(new URL('../../../../../../', import.meta.url))
const CLI = fileURLToPath(new URL('./cli.ts', import.meta.url))
const VIOLATING = 'apps/web/src/lib/copy/lint/fixtures/violating/overclaim-sample.md'
const CLEAN = 'apps/web/src/lib/copy/lint/fixtures/clean/compliant-sample.md'

const read = (relativePath: string): string =>
  readFileSync(fileURLToPath(new URL(relativePath, `file://${REPO_ROOT}`)), 'utf8')

const idsIn = (hits: readonly Hit[]): Set<string> => new Set(hits.map((hit) => hit.phraseId))

/**
 * Assembles a banned literal from parts, so that the literal never appears in this source file.
 * A multi-word phrase only needs its separator broken; a one-word phrase has to be split mid-word.
 */
const joined = (...parts: readonly string[]): string => parts.join('')

/** A ticket-identifier phrase, assembled. Used by the scope test. */
const TICKET_CODE = ['confirmation', 'code'].join(' ')
/** A bare superlative claim, assembled. Used by the collocation test. */
const SUPERLATIVE_CLAIM = joined('the ', 'be', 'st', ' tracker there is')
/** The rank numeral and its spelled form, assembled. Used by the rank-claim test. */
const RANK_NUMERAL = joined('#', '1')
const RANK_WORDS = ['number', 'one'].join(' ')

describe('normalization', () => {
  it('folds case, hyphens, underscores and runs of whitespace to one shape', () => {
    expect(normalize('Estimated-Slack').text).toBe('estimated slack')
    expect(normalize('estimated_slack').text).toBe('estimated slack')
    expect(normalize('estimated   \n\t slack').text).toBe('estimated slack')
    expect(normalize('heuristic.risk/band').text).toBe('heuristic risk band')
  })

  it('keeps an all-capitals word whole rather than spelling it out', () => {
    // The camelCase rule looks at the character as READ, not as folded. Looking at the folded one
    // turned every shouted word into single letters, and the scanner missed a shouted phrase
    // entirely — which is the form marketing copy tends to arrive in.
    expect(normalize('HEURISTIC RISK BAND').text).toBe('heuristic risk band')
    expect(normalize('Demo Data').text).toBe('demo data')
  })

  it('splits camelCase, so an identifier spells out the claim it encodes', () => {
    expect(normalize('protectedItinerary').text).toBe('protected itinerary')
    expect(normalize('PascalCaseName').text).toBe('pascal case name')
  })

  it('folds curly apostrophes and the escape sequences in a string literal', () => {
    expect(normalize('airline’s').text).toBe("airline's")
    expect(normalize('will\\nbe').text).toBe('will be')
  })

  it('records a source offset for every normalized character', () => {
    const { text, offsets } = normalize('  Hello-World  ')
    expect(offsets).toHaveLength(text.length)
    expect(
      offsets.every((offset, index) => index === 0 || offset >= (offsets[index - 1] ?? 0)),
    ).toBe(true)
  })
})

describe('the seeded violation fixture', () => {
  const hits = scanText(read(VIOLATING), { file: VIOLATING })

  it('fires', () => {
    expect(hits.length).toBeGreaterThan(0)
  })

  it('catches every variant the charter requires it to tolerate', () => {
    const ids = idsIn(hits)
    for (const id of [
      'owed-as-settled', // plain, lower case
      'compensation-guarantee', // hyphenated
      'owed-contracted-spelling', // curly apostrophe
      'airline-obligation-to-pay', // wrapped across two prose lines
      'connection-guarantee', // camelCase identifier
      'predicted-cancellation-single-l', // escaped newline inside a string literal
      'fault-asserted', // wrapped across a markdown blockquote continuation
      'promise-to-win',
      'legal-entitlement', // all capitals
      'claim-outcome-asserted',
      'unsubstantiated-superlative',
      'accuracy-superlative',
      'payout-promise',
      'ticket-identifier-a', // scoped rule, and the fixture is inside the copy tree
      'rank-claim-numeral', // the hash-and-digit spelling, which survives normalization
      'rank-claim-words', // and the spelled form of the same claim
    ]) {
      expect(ids, `expected the scanner to report ${id}`).toContain(id)
    }
  })

  it('reports a line, a column, the phrase and the invariant for each hit', () => {
    for (const hit of hits) {
      expect(hit.line).toBeGreaterThan(0)
      expect(hit.column).toBeGreaterThan(0)
      expect(hit.phrase.length).toBeGreaterThan(0)
      expect(hit.invariant).toMatch(/^(AGENTS|DIRECTIVE)\.md §/)
      expect(hit.why.length).toBeGreaterThan(0)
    }
  })

  it('points at text that is really there, at the line it names', () => {
    const lines = read(VIOLATING).split('\n')
    for (const hit of hits) {
      const line = lines[hit.line - 1] ?? ''
      // A wrapped match starts on the reported line and continues onto the next one.
      expect(line.slice(hit.column - 1).length).toBeGreaterThan(0)
      expect(hit.matched.split('\n')[0]).toBe(
        line.slice(hit.column - 1, line.length).slice(0, (hit.matched.split('\n')[0] ?? '').length),
      )
    }
  })
})

describe('the clean fixture', () => {
  it('reports nothing, with the allowlist disabled', () => {
    expect(scanText(read(CLEAN), { file: CLEAN })).toEqual([])
  })
})

/**
 * `trust-compliance-officer` trust F9. One word inserted at a join defeated five of the eight §1.3
 * rules — and the word that defeated two of them is this product's own house adjective for a
 * carrier, fixed in the `§26` flight-data disclaimer, so the most likely spelling of the banned
 * claim was the one the rule could not see.
 *
 * THE PROBES LIVE IN THE FIXTURE, NOT HERE. This file may not spell a banned literal (see its
 * header), so the regression is pinned by LOCATION: the two sections added to the violating fixture
 * hold one claim per line, and this asserts that every one of those lines fires, with the rule it
 * must fire. Adding a probe line to the fixture without the rule to catch it fails the count.
 */
describe('the shapes a claim uses to get past an exact rule', () => {
  const source = read(VIOLATING)
  const hits = scanText(source, { file: VIOLATING })
  const lines = source.split('\n')

  /** The line numbers a section spans, from its heading to the next one. 1-based, inclusive. */
  const sectionRange = (headingContains: string): readonly [number, number] => {
    const start = lines.findIndex(
      (line) => line.startsWith('## ') && line.includes(headingContains),
    )
    expect(start, `fixture section not found: ${headingContains}`).toBeGreaterThan(-1)
    const after = lines.findIndex((line, index) => index > start && line.startsWith('## '))
    return [start + 1, after === -1 ? lines.length : after]
  }

  const inSection = (headingContains: string): readonly Hit[] => {
    const [from, to] = sectionRange(headingContains)
    return hits.filter((hit) => hit.line >= from && hit.line <= to)
  }

  it('catches the six probes, one per line, with the rule each one defeated', () => {
    const found = inSection('One word inserted')
    expect(idsIn(found)).toEqual(
      new Set([
        'airline-debt-asserted',
        'airline-obligation-to-pay',
        'connection-guarantee',
        'fault-asserted',
        'predicted-cancellation-double-l',
      ]),
    )
    // Six claim lines, six distinct lines with hits. A seventh probe with no rule fails here.
    expect(new Set(found.map((hit) => hit.line)).size).toBe(6)
  })

  it('catches the sentence that actually shipped, on the first claim line of that section', () => {
    // trust F8 / copy F-16: the `/connection-risk/` topology paragraph. It is the first line after
    // the section's explanatory paragraph, and it is in the fixture so the regression is mechanical
    // rather than remembered.
    const found = inSection('One word inserted')
    const firstClaimLine = Math.min(...found.map((hit) => hit.line))
    expect(idsIn(found.filter((hit) => hit.line === firstClaimLine))).toContain(
      'airline-debt-asserted',
    )
  })

  it('catches the same claims negated, because a negation is the same determination', () => {
    const found = inSection('The same claim, negated')
    expect(idsIn(found)).toEqual(
      new Set(['owed-as-settled', 'airline-debt-asserted', 'predicted-cancellation-double-l']),
    )
    expect(new Set(found.map((hit) => hit.line)).size).toBe(3)
  })

  it('catches a determination pointing the reassuring way, in ten spellings', () => {
    // docs/EDITORIAL_POLICY.md §6.5, copy F-27, rated critical by the trust review. Section 13 of
    // the fixture holds one claim per line, and the first two are the sentences that actually
    // shipped: one in a guide body, one as an assumption on the demonstration connection.
    const found = inSection('A determination pointing the reassuring way')
    expect(idsIn(found)).toEqual(
      new Set([
        'carrier-responsibility-determined',
        'carrier-liability-determined',
        'carrier-obligation-determined',
        'carrier-problem-assigned',
        'rebooking-outcome-denied',
        'duty-detachment-determined',
        'claim-possibility-denied',
        'outcome-denied',
        'entitlement-denied',
        // The last line is both a denial and the affirmative near-miss it mirrors, which is the
        // point: one claim, two rules, and neither of them is the negation word.
        'entitlement-to-compensation',
      ]),
    )
    expect(new Set(found.map((hit) => hit.line)).size).toBe(10)
  })

  it('catches a modal or an intensifier in front of the promise — F14', () => {
    const found = inSection('A modal in front of the promise')
    expect(idsIn(found)).toEqual(new Set(['bare-guarantee']))
    expect(new Set(found.map((hit) => hit.line)).size).toBe(3)
  })

  it('does not assemble a claim out of two sentences — F15', () => {
    // `.` folded to a space like every other separator, so the end of one sentence and the start of
    // the next made a phrase. The violating line is one sentence; the clean line opposite is the
    // same words with the full stop where the author put it, and it must stay quiet.
    const found = inSection('Two sentences are not one sentence')
    expect(idsIn(found)).toEqual(new Set(['airline-debt-asserted']))
    expect(new Set(found.map((hit) => hit.line)).size).toBe(1)
  })

  it('stays quiet on the honest sentences that contain the same words', () => {
    // The mirror sections of the clean fixture: the §26 disclaimer, the house adjective in a field
    // hint, the hedged topology paragraph, and the bare-promise hedge the rigid rule protects.
    // Covered by the clean-fixture test above; this names why those passages are there.
    const clean = read(CLEAN)
    expect(clean).toContain('## 11.')
    expect(clean).toContain('## 12.')
    expect(scanText(clean, { file: CLEAN })).toEqual([])
  })
})

describe('the allowlist', () => {
  it('has exactly four entries, and they are the files that define the ban', () => {
    expect(allowlist.map((entry) => entry.path)).toEqual([
      'AGENTS.md',
      'DIRECTIVE.md',
      'docs/VOICE.md',
      'apps/web/src/lib/copy/lint/fixtures/',
    ])
  })

  it('justifies every entry in writing', () => {
    for (const entry of allowlist) expect(entry.reason.length).toBeGreaterThan(40)
  })

  it('matches a file exactly and a directory by prefix, and nothing else', () => {
    expect(isAllowlisted('AGENTS.md')).toBe(true)
    expect(isAllowlisted('docs/VOICE.md')).toBe(true)
    expect(isAllowlisted(VIOLATING)).toBe(true)
    expect(isAllowlisted('docs/AGENTS.md')).toBe(false)
    expect(isAllowlisted('apps/web/src/lib/copy/results.ts')).toBe(false)
    expect(isAllowlisted('scripts/validate-build-system.mjs')).toBe(false)
  })

  it('silences the seeded fixture in a repository scan, and only the fixture', () => {
    const guarded = scanRepository({ root: REPO_ROOT, roots: ['apps/web/src/lib/copy'] })
    expect(guarded.hits).toEqual([])

    const unguarded = scanRepository({
      root: REPO_ROOT,
      roots: ['apps/web/src/lib/copy'],
      allowlist: [],
    })
    expect(unguarded.hits.length).toBeGreaterThan(0)
    expect(new Set(unguarded.hits.map((hit) => hit.file))).toEqual(new Set([VIOLATING]))
  })
})

describe('the lint sources need no allowlist entry of their own', () => {
  it('is clean with the allowlist disabled, fixtures aside', () => {
    // The phrases are stored as token arrays and no id spells its phrase, precisely so that this
    // holds. If it ever fails, the fix is to reword the lint — not to exempt it.
    const { hits } = scanRepository({
      root: REPO_ROOT,
      roots: ['apps/web/src/lib/copy'],
      allowlist: [],
    })
    const outsideFixtures = hits.filter(
      (hit) => !hit.file.startsWith('apps/web/src/lib/copy/lint/fixtures/'),
    )
    expect(outsideFixtures).toEqual([])
  })
})

describe('phrase definitions', () => {
  it('gives every phrase an id, tokens, an invariant and a reason', () => {
    for (const phrase of forbiddenPhrases) {
      expect(phrase.id).toMatch(/^[a-z0-9-]+$/)
      expect(phrase.tokens.length).toBeGreaterThan(0)
      expect(phrase.tokens.every((token) => token === token.toLowerCase())).toBe(true)
      expect(phrase.why.length).toBeGreaterThan(20)
    }
  })

  it('uses unique ids', () => {
    const ids = forbiddenPhrases.map((phrase) => phrase.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('places every elastic join between two real tokens', () => {
    // A `GAP` marks the join BEFORE the next token. First, last, or doubled, it marks nothing and
    // `patternFor` would silently drop it — a rule that looks widened and is not.
    for (const phrase of forbiddenPhrases) {
      expect(isGap(phrase.tokens[0] ?? ''), `${phrase.id} opens with a gap`).toBe(false)
      expect(isGap(phrase.tokens.at(-1) ?? ''), `${phrase.id} ends with a gap`).toBe(false)
      phrase.tokens.forEach((token, index) => {
        if (index === 0) return
        expect(
          isGap(token) && isGap(phrase.tokens[index - 1] ?? ''),
          `${phrase.id} has two gaps in a row`,
        ).toBe(false)
      })
      expect(phrase.tokens.filter((token) => !isGap(token)).length).toBeGreaterThan(0)
    }
  })

  it('scopes the negative-determination rules to the trees a reader is served from', () => {
    // These bans a CLAIM, so by §4.3's own reasoning they would be unscoped. They carry a scope
    // because this class differs in one measurable way: its canonical examples are published in
    // full in three files whose job is to record that the claim is banned — the editorial policy
    // that defines it, the build record that filed it, and a fixture test that asserts the sentence
    // is absent. None makes the claim; all three would fire. The alternative was a fifth allowlist
    // entry, which the charter forbids and which would not have worked anyway: the fixture test is
    // another owner's to keep or retire.
    // Named one by one rather than matched by prefix: a filter that misses a rule reports a
    // smaller class than exists, which is the failure this whole test is about. `docs/VOICE.md
    // §4.5` prints the same twelve in the same three groups.
    const ids = [
      'carrier-responsibility-determined',
      'carrier-responsibility-determined-plural',
      'carrier-liability-determined',
      'carrier-liability-determined-plural',
      'carrier-obligation-determined',
      'carrier-obligation-determined-plural',
      'carrier-problem-assigned',
      'rebooking-outcome-denied',
      'duty-detachment-determined',
      'claim-possibility-denied',
      'outcome-denied',
      'entitlement-denied',
    ]
    const determinations = forbiddenPhrases.filter((phrase) => ids.includes(phrase.id))
    expect(determinations.map((phrase) => phrase.id).sort()).toEqual([...ids].sort())
    for (const phrase of determinations) {
      expect(phrase.scope, `${phrase.id} must name the trees it applies to`).toBeDefined()
      // The demonstration fixture is in scope: one of the two sentences that shipped was there.
      expect(phrase.scope).toContain('apps/web/src/demo')
      // The documents that record the ban are not, and neither is any test tree.
      for (const exempt of ['docs', 'tests', 'apps/web/test', '.']) {
        expect(phrase.scope).not.toContain(exempt)
      }
    }
  })

  it('reaches the trees Phase 5 and 6 will author this class into — F16', () => {
    // Listed before they exist, on the same reasoning that put the notification templates there:
    // the cheapest moment to have the rule in place is before the first line is written. A rights
    // assessment, a risk band and a connection result are three surfaces whose whole job is to say
    // what a rule does, which is one word away from saying what a rule decides.
    const rule = forbiddenPhrases.find(
      (phrase) => phrase.id === 'carrier-responsibility-determined',
    )
    for (const tree of [
      'packages/rights-engine/src',
      'packages/risk-engine/src',
      'packages/connection-engine/src',
      'data/rights/rulesets',
      'packages/notifications/src/templates',
    ]) {
      expect(rule?.scope, `${tree} must be in scope before it is written into`).toContain(tree)
    }
  })

  it('reaches the claim map, which is the decision and not an oversight', () => {
    // docs/VOICE.md §4.5. The claim map holds the propositions a reviewer opens a source to confirm
    // or reject, it never renders, and `docs/EDITORIAL_POLICY.md §6.5` says such a proposition stays
    // flat. It is still IN scope, because it sits upstream of article prose rather than downstream:
    // the F-27 sentence and the claim beside it said the same thing, and the article shipped. A
    // proposition stays categorical by naming what a SOURCE says, which is verifiable and makes no
    // determination in DelayPilot's voice. The map is clean today and this pins that it is scanned.
    const rule = forbiddenPhrases.find((phrase) => phrase.id === 'carrier-obligation-determined')
    expect(rule?.scope).toContain('apps/web/src/content')
    const map = 'apps/web/src/content/claim-map.json'
    expect(scanText(read(map), { file: map })).toEqual([])
  })

  it('applies a determination rule inside a voice tree and not in a document', () => {
    // The sentence is LOCATED, never written: this file may not spell a banned literal, and it just
    // proved why — an earlier draft of this test matched the line with a regular expression that
    // spelled it, and the lint failed on this file. That is the same stopgap shape the fixture test
    // uses, in a tree that is in scope. Take the line the rule itself reports instead.
    const lines = read(VIOLATING).split('\n')
    const reported = scanText(read(VIOLATING), { file: VIOLATING }).filter(
      (hit) => hit.phraseId === 'carrier-responsibility-determined',
    )
    expect(reported.length).toBeGreaterThan(0)
    const sentence = lines[(reported.at(-1)?.line ?? 1) - 1] ?? ''
    expect(sentence.length).toBeGreaterThan(0)
    expect(idsIn(scanText(sentence, { file: 'apps/web/src/demo/itinerary.ts' }))).toContain(
      'carrier-responsibility-determined',
    )
    expect(idsIn(scanText(sentence, { file: 'apps/web/src/content/guides/example.md' }))).toContain(
      'carrier-responsibility-determined',
    )
    expect(scanText(sentence, { file: 'docs/EDITORIAL_POLICY.md' })).toEqual([])
    expect(scanText(sentence, { file: 'apps/web/test/demo-itinerary.test.ts' })).toEqual([])
  })

  it('gives the bare-promise rule the one slot that reads its filler', () => {
    // trust F14. It shipped rigid because a plain gap would have flagged the honest hedge — the
    // sentence DelayPilot SHOULD write. Rigid also left the modal and emphatic promises reachable,
    // because the word that makes a promise emphatic sits in the slot that makes it a hedge. So the
    // slot exists and is negation-aware: it is the only rule in the file with that marker.
    const rigid = forbiddenPhrases.find((phrase) => phrase.id === 'bare-guarantee')
    expect(rigid).toBeDefined()
    expect(rigid?.tokens).toContain(GAP_NO_NEGATION)
    expect(rigid?.tokens).not.toContain(GAP)
    const negationAware = forbiddenPhrases.filter((phrase) =>
      phrase.tokens.includes(GAP_NO_NEGATION),
    )
    expect(negationAware.map((phrase) => phrase.id)).toEqual(['bare-guarantee'])
  })

  it('covers the AGENTS.md §1.3 list and the charter near-misses', () => {
    const ids = new Set(forbiddenPhrases.map((phrase) => phrase.id))
    for (const id of [
      'owed-as-settled',
      'compensation-guarantee',
      'legal-entitlement',
      'claim-approval',
      'promise-to-win',
      'airline-obligation-to-pay',
      'connection-guarantee',
      'predicted-cancellation-double-l',
      'predicted-cancellation-single-l',
      'fault-asserted',
      'manufactured-urgency',
      'ai-as-value-proposition',
      'accuracy-superlative',
      'unsubstantiated-superlative',
      'owed-contracted-spelling',
      'entitlement-to-compensation',
      'payout-promise',
      'claim-outcome-asserted',
      'airline-debt-asserted',
      'bare-guarantee',
    ]) {
      expect(ids, `missing phrase ${id}`).toContain(id)
    }
  })
})

describe('match precision', () => {
  it('does not match inside a longer word', () => {
    expect(scanText('bestseller bestial')).toEqual([])
    expect(scanText('unguaranteedcompensational')).toEqual([])
  })

  it('exempts the documented non-claim collocations, and only those', () => {
    expect(scanText('Cloudflare Workers Best Practices')).toEqual([])
    expect(scanText('best-effort delivery')).toEqual([])
    expect(scanText('the next-best-action card')).toEqual([])
    expect(scanText('font.getBestCmap()')).toEqual([])
    expect(scanText(SUPERLATIVE_CLAIM)).toHaveLength(1)
  })

  it('applies a scoped phrase only inside the copy trees', () => {
    const sentence = `Enter your ${TICKET_CODE}.`
    const inCopy = scanText(sentence, { file: 'apps/web/src/lib/copy/lookup.ts' })
    const elsewhere = scanText(sentence, { file: 'apps/web/src/pages/privacy.astro' })
    expect(idsIn(inCopy)).toContain('ticket-identifier-d')
    expect(elsewhere).toEqual([])
  })

  it('catches a rank claim in both spellings, and nothing that merely looks like one', () => {
    // Raised by trust-compliance-officer's S3 sweep: the §7 superlative clause was enforced for
    // two wordings and missed the one marketing copy reaches for first.
    expect(idsIn(scanText(`DelayPilot is ${RANK_NUMERAL} for connections.`))).toContain(
      'rank-claim-numeral',
    )
    expect(idsIn(scanText(`The ${RANK_WORDS} choice of frequent flyers.`))).toContain(
      'rank-claim-words',
    )
    // Capitals and a trailing full stop are the same claim.
    expect(idsIn(scanText(`We are ${RANK_WORDS.toUpperCase()}.`))).toContain('rank-claim-words')

    // The numeral survives normalization because `#` is kept before a digit — and ONLY there, so
    // none of these is a hit. An issue reference, a section reference, a hex colour, and the
    // ordinary word before an ordinary numeral all have to stay quiet, or the rule gets switched
    // off within a week.
    for (const quiet of [
      'See issue #12 for the rationale.',
      '#3 of the methodology explains it.',
      'The accent is #1a2b3c in the light theme.',
      '--ink-950:#07111f',
      'Segment number 1 departs first.',
      'It is numbered one of three.',
    ]) {
      expect(scanText(quiet), `"${quiet}" must not be a hit`).toEqual([])
    }
  })

  it('keeps the hash as a separator everywhere a digit does not follow it', () => {
    // The markdown tolerance this scanner was built for must survive the exception above: a
    // heading marker, a blockquote and a bullet still fold to a space.
    // A leading space is dropped by the collapse rule, so these fold to the bare word.
    expect(normalize('## Heading').text).toBe('heading')
    expect(normalize('#tag').text).toBe('tag')
    expect(normalize('a ## b').text).toBe('a b')
    // Assembled, like every other banned literal in this file: the scanner keeps this shape, so
    // writing it out would make the test its own first hit.
    expect(normalize(RANK_NUMERAL).text).toBe(RANK_NUMERAL)
    expect(normalize(`${RANK_NUMERAL}a`).text).toBe(`${RANK_NUMERAL}a`)
  })

  it('covers article bodies, which are prose in DelayPilot voice', () => {
    // Widened in the S3 review at the trust officer's request (`docs/VOICE.md §4.3`). An article
    // body is the product speaking, so a ticket identifier in one is the same defect as one in a
    // placeholder. The tree scanned clean before the scope changed.
    const sentence = `Enter your ${TICKET_CODE}.`
    const inContent = scanText(sentence, { file: 'apps/web/src/content/guides/example.md' })
    expect(idsIn(inContent)).toContain('ticket-identifier-d')
  })

  it('permits the one negative mention the directive fixes as the trust line', () => {
    // `DIRECTIVE.md §7` fixes the trust line as "No booking code required", and `lookup.noBookingCode`
    // says why. "Booking code" is deliberately NOT a banned token sequence — a traveler trained by
    // claims sites to expect that field has to be told it is not coming. The five banned
    // identifiers are the ones a form could actually ask for.
    const trustLine = 'No booking code required.'
    const why =
      'DelayPilot never asks for anything printed on your ticket, so there is no booking code field.'
    for (const file of [
      'apps/web/src/lib/copy/lookup.ts',
      'apps/web/src/content/guides/example.md',
      'packages/notifications/src/templates/example.ts',
    ]) {
      expect(scanText(trustLine, { file })).toEqual([])
      expect(scanText(why, { file })).toEqual([])
    }
  })
})

describe('the command line entry', () => {
  const run = (args: readonly string[]): ReturnType<typeof spawnSync> =>
    spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8' })

  it('exits non-zero on the seeded violation fixture', () => {
    const result = run([
      '--root',
      REPO_ROOT,
      '--only',
      'apps/web/src/lib/copy/lint/fixtures/violating',
      '--no-allowlist',
    ])
    expect(result.status).toBe(1)
    expect(result.stdout).toContain('overclaim-sample.md')
    expect(result.stdout).toContain('AGENTS.md §1.3')
  })

  it('exits zero on a clean tree', () => {
    const result = run([
      '--root',
      REPO_ROOT,
      '--only',
      'apps/web/src/lib/copy/lint/fixtures/clean',
      '--no-allowlist',
    ])
    expect(result.status).toBe(0)
    expect(result.stdout).toContain('0 hit(s)')
  })

  it('never edits a file: the fixture is byte-identical after a run', () => {
    const before = read(VIOLATING)
    run(['--root', REPO_ROOT, '--only', 'apps/web/src/lib/copy/lint/fixtures', '--no-allowlist'])
    expect(read(VIOLATING)).toBe(before)
  })

  it('prints one line per hit, with path, line, column, phrase and invariant', () => {
    const result = run([
      '--root',
      REPO_ROOT,
      '--only',
      'apps/web/src/lib/copy/lint/fixtures/violating',
      '--no-allowlist',
      '--json',
    ])
    const parsed: unknown = JSON.parse(typeof result.stdout === 'string' ? result.stdout : '{}')
    expect(parsed).toMatchObject({ scanned: 1 })
  })
})

describe('the scanned tree', () => {
  it('includes the repository root files, so the allowlist is not decorative', () => {
    const { hits } = scanRepository({ root: REPO_ROOT, roots: [ROOT_FILES], allowlist: [] })
    // AGENTS.md quotes the ban verbatim; with the allowlist off it must be reported, which proves
    // the root sweep reaches it.
    expect(hits.some((hit) => hit.file === 'AGENTS.md')).toBe(true)
  })

  it('honours the allowlist for those same root files', () => {
    const { hits } = scanRepository({ root: REPO_ROOT, roots: [ROOT_FILES] })
    expect(hits.some((hit) => hit.file === 'AGENTS.md' || hit.file === 'DIRECTIVE.md')).toBe(false)
  })
})
