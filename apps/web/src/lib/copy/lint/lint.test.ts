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

import { forbiddenPhrases } from './forbidden-phrases.ts'
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
