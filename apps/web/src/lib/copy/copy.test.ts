/**
 * Copy invariants. Owner: `ux-copy-steward`.
 *
 * THE POINT OF THIS FILE. `DIRECTIVE.md §26` and `§27` are fixed text, and "fixed" is worth nothing
 * if it is only asserted in a comment. So the tests below RE-READ `DIRECTIVE.md` and `AGENTS.md` at
 * run time and compare byte for byte. A stray comma in a disclaimer, a softened word in a result
 * line, or a seventh provenance label fails the build in both directions: if the directive changes
 * and the constants do not, that fails too, which is exactly what should happen when fixed text
 * moves.
 *
 * The other tests are the rules that are easy to keep on the day they are written and easy to lose
 * three months later: no number inside a string, no ticket-identifier vocabulary, no forbidden
 * phrase, no unknown state that announces itself twice.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import {
  bandDescription,
  bandLabel,
  bandOrder,
  delayValueText,
  requiredOfAvailableText,
  type Band,
} from './bands.ts'
import { chronology } from './chronology.ts'
import { cockpit } from './cockpit.ts'
import { demo } from './demo.ts'
import { disclaimerPlacement, disclaimers, type DisclaimerKey } from './disclaimers.ts'
import { home } from './home.ts'
import { scanText } from './lint/scan.ts'
import { lookup } from './lookup.ts'
import { copyright, nav } from './nav.ts'
import { accessibilityFeedback, contactPage, pages } from './pages.ts'
import {
  provenanceLabels,
  provenanceMeanings,
  provenanceOrder,
  unavailableReasons,
} from './provenance.ts'
import { freshness, freshnessUnknown, results } from './results.ts'
import { states } from './states.ts'

const REPO_ROOT = fileURLToPath(new URL('../../../../../', import.meta.url))
const directive = readFileSync(`${REPO_ROOT}DIRECTIVE.md`, 'utf8')
const constitution = readFileSync(`${REPO_ROOT}AGENTS.md`, 'utf8')

// ── Reading the directive ────────────────────────────────────────────────────────────────────

function section(source: string, heading: string, next: string): string {
  const start = source.indexOf(heading)
  const end = source.indexOf(next, start)
  if (start === -1 || end === -1) throw new Error(`section not found: ${heading}`)
  return source.slice(start + heading.length, end)
}

/** `- **Label:** text`, unwrapping the indented continuation lines markdown wraps prose onto. */
function bulletEntries(block: string): Record<string, string> {
  const out: Record<string, string> = {}
  let key: string | null = null
  let parts: string[] = []
  for (const raw of block.split('\n')) {
    const match = /^- \*\*(.+?):\*\* (.*)$/.exec(raw)
    if (match) {
      if (key !== null) out[key] = parts.join(' ')
      key = match[1] ?? ''
      parts = [(match[2] ?? '').trim()]
      continue
    }
    if (key !== null && raw.trim() !== '' && raw.startsWith('  ')) {
      parts.push(raw.trim())
      continue
    }
    if (key !== null) {
      out[key] = parts.join(' ')
      key = null
      parts = []
    }
  }
  if (key !== null) out[key] = parts.join(' ')
  return out
}

/** `**Label:** text`, same unwrapping. */
function boldEntries(block: string): Record<string, string> {
  const out: Record<string, string> = {}
  let key: string | null = null
  let parts: string[] = []
  for (const raw of block.split('\n')) {
    const match = /^\*\*(.+?):\*\* (.*)$/.exec(raw)
    if (match) {
      if (key !== null) out[key] = parts.join(' ')
      key = match[1] ?? ''
      parts = [(match[2] ?? '').trim()]
      continue
    }
    if (key !== null && raw.trim() !== '' && !raw.startsWith('#')) {
      parts.push(raw.trim())
      continue
    }
    if (key !== null) {
      out[key] = parts.join(' ')
      key = null
      parts = []
    }
  }
  if (key !== null) out[key] = parts.join(' ')
  return out
}

/** The first `> ` block after a marker, unwrapped. */
function blockquoteAfter(source: string, marker: string): string {
  const from = source.indexOf(marker)
  if (from === -1) throw new Error(`marker not found: ${marker}`)
  const lines = source.slice(from).split('\n')
  const collected: string[] = []
  for (const line of lines) {
    if (line.startsWith('> ')) {
      collected.push(line.slice(2).trim())
      continue
    }
    if (collected.length > 0) break
  }
  if (collected.length === 0) throw new Error(`no block quote after: ${marker}`)
  return collected.join(' ')
}

const section26 = bulletEntries(
  section(
    directive,
    '## 26. Required disclaimers, placed near the relevant result — not only in the footer',
    '## 27. Result microcopy',
  ),
)
const section27 = boldEntries(section(directive, '## 27. Result microcopy', '## 28. Demo mode'))
const section7 = boldEntries(
  section(directive, '## 7. Brand, voice, and visual system', '## 8. Users and jobs'),
)

// ── Walking every exported string ────────────────────────────────────────────────────────────

interface Entry {
  readonly path: string
  readonly value: string
}

function walk(value: unknown, path: string, out: Entry[]): void {
  if (typeof value === 'string') {
    out.push({ path, value })
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walk(item, `${path}[${String(index)}]`, out)
    })
    return
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, child] of Object.entries(value)) walk(child, `${path}.${key}`, out)
  }
}

const modules: Readonly<Record<string, unknown>> = {
  chronology,
  cockpit,
  demo,
  disclaimerPlacement,
  disclaimers,
  home,
  lookup,
  nav,
  pages,
  provenanceLabels,
  provenanceMeanings,
  unavailableReasons,
  results,
  states,
}

const everyString: Entry[] = []
for (const [name, value] of Object.entries(modules)) walk(value, name, everyString)

// ── The fixed text ───────────────────────────────────────────────────────────────────────────

describe('DIRECTIVE.md §26 disclaimers are byte-exact', () => {
  const expected: readonly (readonly [string, string])[] = [
    ['Flight data', disclaimers.flightData],
    ['Prediction', disclaimers.prediction],
    ['Connection', disclaimers.connection],
    ['Rights', disclaimers.rights],
    ['Affiliate', disclaimers.affiliate],
  ]

  for (const [label, constant] of expected) {
    it(`matches the directive for "${label}"`, () => {
      expect(constant).toBe(section26[label])
    })
  }

  it('covers all five and invents none', () => {
    expect(Object.keys(section26).sort()).toEqual(
      ['Affiliate', 'Connection', 'Flight data', 'Prediction', 'Rights'].sort(),
    )
  })

  it('carries the §3.4 independence disclaimer verbatim', () => {
    expect(disclaimers.independence).toBe(
      blockquoteAfter(directive, '**3.4 No false affiliation.**'),
    )
  })

  it('carries the §20 affiliate module text verbatim', () => {
    expect(disclaimers.affiliateModule).toBe(blockquoteAfter(directive, '**Affiliate categories**'))
  })

  it('places every disclaimer beside at least one named surface', () => {
    // `labels` is the one member of `disclaimers` that is not a §26/§3.4/§20 sentence — it holds
    // the accessible names of the notes. Every other member is fixed text and must have a surface.
    const sentenceKeys = Object.keys(disclaimers).filter((key) => key !== 'labels')
    expect(Object.keys(disclaimerPlacement).sort()).toEqual([...sentenceKeys].sort())
    for (const key of sentenceKeys) {
      const surfaces = disclaimerPlacement[key as DisclaimerKey]
      expect(surfaces.length, `no placement recorded for ${key}`).toBeGreaterThan(0)
    }
  })

  it('names each role="note" disclaimer without restating or softening it', () => {
    // packages/ui/src/patterns/atoms.tsx renders every §26 disclaimer inside `role="note"`, which
    // needs an accessible name or a screen-reader user hears a qualifying sentence with nothing to
    // attach it to. Four notes render in this release; the footer and the affiliate module do not.
    expect(Object.keys(disclaimers.labels).sort()).toEqual([
      'connection',
      'flightData',
      'prediction',
      'rights',
    ])
    const names = Object.values(disclaimers.labels)
    expect(new Set(names).size, 'two notes share an accessible name').toBe(names.length)
    for (const [key, name] of Object.entries(disclaimers.labels)) {
      // A name, not a copy of the sentence: it says WHAT the note is, the note says what it means.
      expect(name).not.toBe(disclaimers[key as DisclaimerKey])
      expect(name.length).toBeLessThan(disclaimers[key as DisclaimerKey].length)
      expect(name.endsWith('.'), `${key} reads as a sentence, not a name`).toBe(false)
    }
  })

  it('keeps the independence disclaimer in the footer and nowhere else in the map', () => {
    // AGENTS.md §1.4: it ships on every public page, and it does NOT substitute for any of the five.
    expect(disclaimerPlacement.independence).toEqual(['footer of every public page'])
    for (const key of ['flightData', 'prediction', 'connection', 'rights'] as const) {
      expect(disclaimerPlacement[key].join(' ')).not.toContain('footer')
    }
  })
})

describe('DIRECTIVE.md §27 result microcopy is byte-exact', () => {
  const expected: readonly (readonly [string, string])[] = [
    ['On track', results.onTrack],
    ['Watch', results.watch],
    ['At risk', results.atRisk],
    ['Disrupted', results.disrupted],
    ['Unknown', results.unknown],
    ['Protected', results.protectedItinerary],
    ['Self-transfer', results.selfTransfer],
    ['Topology missing', results.topologyMissing],
    ['Rights', results.rights],
    ['Stale', results.stale],
    ['Demo', results.demo],
  ]

  for (const [label, constant] of expected) {
    it(`matches the directive for "${label}"`, () => {
      expect(constant).toBe(section27[label])
    })
  }

  it('accounts for every line in §27, freshness included', () => {
    expect(Object.keys(section27)).toHaveLength(expected.length + 1)
    expect(Object.keys(section27)).toContain('Freshness')
  })

  it('reproduces the freshness SHAPE through the function, never as a literal', () => {
    // §27 writes "Updated 6 minutes ago from [source]." That is a shape. Interpolating the same
    // two values must reproduce it exactly — and no constant may contain the literal, because the
    // "6" and the "[source]" are a number nobody measured and a placeholder nobody filled.
    expect(freshness(6, '[source]')).toBe(section27['Freshness'])
    const literal = section27['Freshness'] ?? ''
    for (const entry of everyString) {
      expect(entry.value, `${entry.path} hardcodes the §27 freshness line`).not.toBe(literal)
    }
  })

  it('pluralizes, rounds toward staleness, and refuses a nonsense age', () => {
    expect(freshness(1, 'demo-fixture')).toBe('Updated 1 minute ago from demo-fixture.')
    expect(freshness(2, 'demo-fixture')).toBe('Updated 2 minutes ago from demo-fixture.')
    // Zero keeps the §27 shape. "Just now" is a softer claim than the data supports.
    expect(freshness(0, 'demo-fixture')).toBe('Updated 0 minutes ago from demo-fixture.')
    // Rounding UP: reporting data as fresher than it is, is the direction that costs money.
    expect(freshness(4.2, 'demo-fixture')).toBe('Updated 5 minutes ago from demo-fixture.')
    expect(freshness(-3, 'demo-fixture')).toBe(freshnessUnknown('demo-fixture'))
    expect(freshness(Number.NaN, 'demo-fixture')).toBe(freshnessUnknown('demo-fixture'))
    expect(freshnessUnknown('demo-fixture')).not.toContain('0')
  })

  it('keeps the §7 promise, support line, trust line and CTAs verbatim', () => {
    expect(home.promise).toBe(section7['Promise'])
    expect(home.support).toBe(section7['Support'])
    expect(home.trustLine.join(' · ')).toBe(section7['Trust line'])
    const ctas = (section7['Primary CTA'] ?? '').split(' · **Secondary CTA:** ')
    expect(home.ctas.primary).toBe(ctas[0])
    expect(home.ctas.secondary).toBe(ctas[1])
    expect(home.hero.heading).toBe(home.promise)
    expect(home.hero.intro).toBe(home.support)
  })
})

// ── Provenance ───────────────────────────────────────────────────────────────────────────────

describe('the provenance vocabulary', () => {
  it('is exactly the six labels in the AGENTS.md §1.2 table', () => {
    const rows = constitution
      .split('\n')
      .filter((line) => /^\| `[A-Z]/.test(line))
      .map((line) => /^\| `([^`]+)`/.exec(line)?.[1] ?? '')
    expect(rows).toEqual(['Live', 'Cached', 'Stale', 'Demo', 'Unavailable', 'Heuristic risk band'])
    expect(Object.values(provenanceLabels)).toEqual(rows)
  })

  it('has a meaning for each label and orders all six', () => {
    expect(Object.keys(provenanceMeanings).sort()).toEqual(Object.keys(provenanceLabels).sort())
    expect([...provenanceOrder].sort()).toEqual(Object.keys(provenanceLabels).sort())
  })

  it('ships no softened synonym anywhere in the copy tree', () => {
    for (const entry of everyString) {
      expect(entry.value, `${entry.path} uses a softened provenance synonym`).not.toMatch(
        /\bEstimated risk\b/i,
      )
    }
  })

  it('names a specific missing fact for every unavailable reason', () => {
    for (const [key, reason] of Object.entries(unavailableReasons)) {
      expect(reason.fact.length, `${key} has no fact`).toBeGreaterThan(20)
      expect(reason.fact.trim().endsWith('.'), `${key} is not a sentence`).toBe(true)
      // Never a blank, a dash, or a zero.
      expect(reason.fact.trim()).not.toBe('—')
      expect(reason.fact.trim()).not.toBe('-')
      if (reason.nextStep !== null) expect(reason.nextStep.length).toBeGreaterThan(10)
    }
  })

  it('ties the Demo label to its required caption', () => {
    expect(demo.caption).toBe(results.demo)
    expect(cockpit.demoCaption).toBe(results.demo)
    expect(lookup.states.demo).toBe(results.demo)
  })
})

// ── Bands, and the F24 stutter ───────────────────────────────────────────────────────────────

describe('band words and meter readings', () => {
  it('labels all five bands', () => {
    expect(bandOrder.map(bandLabel)).toEqual([
      'On track',
      'Watch',
      'At risk',
      'Disrupted',
      'Unknown',
    ])
  })

  it('pairs each band with its §27 sentence', () => {
    const expected: Readonly<Record<Band, string>> = {
      on_track: results.onTrack,
      watch: results.watch,
      at_risk: results.atRisk,
      disrupted: results.disrupted,
      unknown: results.unknown,
    }
    for (const band of bandOrder) expect(bandDescription(band)).toBe(expected[band])
  })

  it('never lets a reading equal its band label — F24', () => {
    // The ProgressBar announces `${valueText}, ${bandLabel}`. If the two are the same word an
    // unknown slack meter says "Unknown, Unknown", which is a poor rendering of the one state a
    // traveler most has to trust. Every reading below must differ from every band label.
    const readings = [
      requiredOfAvailableText(null, null),
      requiredOfAvailableText(44, null),
      requiredOfAvailableText(null, 51),
      requiredOfAvailableText(44, 51),
      delayValueText(null),
      delayValueText(null, true),
      delayValueText(0),
      delayValueText(0, true),
      delayValueText(20),
      delayValueText(20, true),
      delayValueText(-6),
      // The segment status words land in the same announcements, so they are checked here too.
      ...Object.values(cockpit.segment.statusLabels),
    ]
    for (const reading of readings) {
      for (const band of bandOrder) {
        expect(reading, `"${reading}" collides with the band label`).not.toBe(bandLabel(band))
      }
    }
    expect(requiredOfAvailableText(null, null)).not.toBe(bandLabel('unknown'))
    expect(`${requiredOfAvailableText(null, null)}, ${bandLabel('unknown')}`).toBe(
      'Slack unknown, Unknown',
    )
  })

  it('never lets a reading equal the meter accessible name it is announced beside — F24', () => {
    // The S3 review found `BandMeter label={cockpit.assessment.bandLabel}` paired with
    // `valueText={cockpit.assessment.bandLabel}`, which renders aria-label="Risk band" beside
    // aria-valuetext="Risk band, Disrupted" — the same phrase twice in one announcement. The rule
    // in docs/VOICE.md §9.1 now covers the accessible name as well as the band word, and the
    // meter names this module ships must stay distinct from the readings that sit inside them.
    const meterNames = [
      cockpit.connection.meterLabel,
      cockpit.assessment.bandLabel,
      cockpit.headings.assessment,
      cockpit.connection.bandScaleLabel,
    ]
    const readings = [
      requiredOfAvailableText(null, null),
      requiredOfAvailableText(44, null),
      requiredOfAvailableText(null, 51),
      requiredOfAvailableText(44, 51),
      delayValueText(null),
      delayValueText(20),
    ]
    for (const name of meterNames) {
      for (const reading of readings) {
        expect(reading, `"${reading}" repeats the meter name "${name}"`).not.toBe(name)
      }
    }
  })

  it('names which quantity is missing rather than collapsing both', () => {
    expect(requiredOfAvailableText(null, 45)).not.toBe(requiredOfAvailableText(18, null))
    expect(requiredOfAvailableText(18, 45)).toBe('18 of 45 minutes')
    expect(requiredOfAvailableText(18, 1)).toBe('18 of 1 minute')
  })

  it('reads the meter in the direction the bar draws', () => {
    // packages/ui/src/patterns/ConnectionCockpit.tsx fills the meter `value={required}` of
    // `max={available}` — required OF available. The words have to name the same ratio in the same
    // order, or the bar and the sentence beside it contradict each other: 44 minutes required
    // inside a 51-minute window is a bar at 86 %, and "51 of 44 minutes" reads as its inverse.
    const required = 44
    const available = 51
    expect(requiredOfAvailableText(required, available)).toBe('44 of 51 minutes')
    // The inverse reading — "51 of 44 minutes" — is what the meter used to carry. No function in
    // this module produces it any more (docs/VOICE.md §9.3), and this asserts the direction that
    // replaced it rather than the one that was removed.
    expect(requiredOfAvailableText(available, required)).toBe('51 of 44 minutes')
    expect(requiredOfAvailableText(required, available)).not.toBe(
      requiredOfAvailableText(available, required),
    )
    expect(requiredOfAvailableText(1, 51)).toBe('1 of 51 minutes')
    expect(requiredOfAvailableText(44, 1)).toBe('44 of 1 minute')
  })

  it('keeps the three unknown branches naming the missing quantity, not the direction', () => {
    // F24 again, on the new function: never the bare word, and never the wrong missing fact. The
    // branches are NOT swapped with the arguments — which quantity is missing does not depend on
    // which way the bar fills.
    expect(requiredOfAvailableText(null, null)).toBe('Slack unknown')
    expect(requiredOfAvailableText(null, 51)).toBe('Required transfer time unknown')
    expect(requiredOfAvailableText(44, null)).toBe('Available connection time unknown')
    for (const reading of [
      requiredOfAvailableText(null, null),
      requiredOfAvailableText(null, 51),
      requiredOfAvailableText(44, null),
    ]) {
      expect(reading).not.toBe(bandLabel('unknown'))
      expect(reading).not.toBe('Unknown')
    }
    // Each unknown branch names a different missing fact, so a reader can act on the right one.
    expect(requiredOfAvailableText(null, 51)).not.toBe(requiredOfAvailableText(44, null))
  })

  it('separates "no delay reported" from "delay unknown"', () => {
    expect(delayValueText(0)).not.toBe(delayValueText(null))
    expect(delayValueText(20)).toBe('Delayed 20 minutes')
    expect(delayValueText(20, true)).toBe('Estimated delay 20 minutes')
    expect(delayValueText(1)).toBe('Delayed 1 minute')
    expect(delayValueText(-6)).toBe('6 minutes ahead of schedule')
  })
})

// ── No numbers, no ticket identifiers, no forbidden phrases ──────────────────────────────────

/**
 * The only digits permitted in an exported string. Each is an IDENTIFIER, not a measurement:
 * nothing about it is a claim, and nothing about it could be wrong in the direction that costs a
 * traveler money.
 */
const DEMO_IDENTIFIERS: readonly string[] = ['DEMO 101', 'DEMO 202', 'DM1', 'DM2', 'DM3']

const DIGIT_EXCEPTIONS: readonly { readonly pattern: RegExp; readonly reason: string }[] = [
  {
    pattern: /^pages\.accessibility\.standard$/,
    reason: 'The version number of the WCAG standard being claimed. A standard name.',
  },
  {
    pattern: /^pages\.accessibility\.lastVerified$/,
    reason: 'The date the accessibility claim was last verified, required by ACCESSIBILITY.md §13.',
  },
  {
    pattern: /^pages\.accessibility\.knownIssues\[\d+]\.(id|criterion)$/,
    reason: 'Finding ids and WCAG success-criterion numbers. Identifiers of published items.',
  },
  {
    pattern: /^pages\.accessibility\.environments\[\d+]\.version$/,
    reason: 'Tool version identifiers, pinned to the verification date. Required by §13 item 4.',
  },
]

describe('no number is written into a string', () => {
  it('holds for every exported string, with only the enumerated exceptions', () => {
    const offenders: string[] = []
    for (const entry of everyString) {
      if (DIGIT_EXCEPTIONS.some((exception) => exception.pattern.test(entry.path))) continue
      let stripped = entry.value
      for (const identifier of DEMO_IDENTIFIERS) stripped = stripped.split(identifier).join('')
      if (/\d/.test(stripped)) offenders.push(`${entry.path}: ${entry.value}`)
    }
    expect(offenders).toEqual([])
  })

  it('enumerates the demo identifiers rather than allowing digits loosely', () => {
    expect(demo.flights.first).toBe('DEMO 101')
    expect(demo.flights.second).toBe('DEMO 202')
    expect(Object.keys(demo.airports)).toEqual(['DM1', 'DM2', 'DM3'])
  })

  it('justifies every digit exception in writing', () => {
    for (const exception of DIGIT_EXCEPTIONS) expect(exception.reason.length).toBeGreaterThan(30)
  })
})

describe('no forbidden phrase and no ticket-identifier vocabulary', () => {
  it('holds for every exported string', () => {
    const offenders: string[] = []
    for (const entry of everyString) {
      // The path makes the scoped rules apply, which is what catches ticket-identifier vocabulary.
      const hits = scanText(entry.value, { file: 'apps/web/src/lib/copy/index.ts' })
      for (const hit of hits) offenders.push(`${entry.path}: ${hit.phrase} (${hit.invariant})`)
    }
    expect(offenders).toEqual([])
  })

  it('states the trust line without naming a ticket identifier', () => {
    expect(lookup.noBookingCode.line).toBe('No booking code required.')
    expect(home.trustLine).toContain('No booking code required')
    expect(scanText(lookup.noBookingCode.why, { file: 'apps/web/src/lib/copy/lookup.ts' })).toEqual(
      [],
    )
  })

  it('keeps every rights status label from upgrading its status', () => {
    expect(cockpit.rights.statusLabels).toEqual({
      likely_applies: 'Likely applies',
      may_apply: 'May apply',
      not_indicated: 'Not indicated',
      cannot_determine: 'Cannot determine',
      future_rule_not_active: 'Future rule, not active',
    })
    for (const label of Object.values(cockpit.rights.statusLabels)) {
      expect(label).not.toMatch(/qualif|owed|entitle|guarantee/i)
    }
  })
})

// ── Page metadata ────────────────────────────────────────────────────────────────────────────

describe('route metadata', () => {
  /**
   * The route entries of `pages`. `pages.article` is chrome for an article shell rather than a
   * route — its title and description come from the article — so it is named here rather than
   * silently skipped by a shape check.
   */
  const ROUTE_KEYS = [
    'home',
    'flightStatus',
    'delayRisk',
    'connectionRisk',
    'methodology',
    'dataSources',
    'about',
    'passengerRightsIndex',
    'guidesIndex',
    'accessibility',
    'contact',
    'notFound',
  ] as const

  const routes: readonly (readonly [string, { title: string; description: string }])[] =
    ROUTE_KEYS.map((key) => [key, pages[key]])

  it('accounts for every key in the module', () => {
    expect(Object.keys(pages).sort()).toEqual([...ROUTE_KEYS, 'article'].sort())
  })

  it('gives every route a unique title and description', () => {
    const titles = routes.map(([, page]) => page.title)
    const descriptions = routes.map(([, page]) => page.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  it('ends every title with the brand, except the homepage', () => {
    for (const [key, page] of routes) {
      if (key === 'home') {
        // The homepage leads with the brand, which is the convention a search result set expects.
        expect(page.title.startsWith('DelayPilot — ')).toBe(true)
        continue
      }
      expect(page.title.endsWith(' — DelayPilot'), `${key} title`).toBe(true)
    }
  })

  it('keeps descriptions to a usable length', () => {
    for (const [key, page] of routes) {
      expect(page.description.length, `${key} description too short`).toBeGreaterThan(60)
      expect(page.description.length, `${key} description too long`).toBeLessThan(240)
    }
  })
})

// ── The accessibility statement ──────────────────────────────────────────────────────────────

describe('the accessibility statement', () => {
  const page = pages.accessibility

  it('claims partial conformance and nothing stronger', () => {
    expect(page.status).toBe('Partially conformant')
    expect(page.statusBody).toContain('have not been run')
    expect(page.noClaim).toContain('does not say that DelayPilot is accessible')
  })

  it('never claims the site is accessible or meets every standard', () => {
    const prose = [page.intro, page.standardBody, page.statusBody, page.method].join(' ')
    expect(prose).not.toMatch(/\bis accessible\b/)
    expect(prose).not.toMatch(/meets all standards/i)
    expect(prose).not.toMatch(/fully conformant/i)
  })

  it('lists every finding that ACCESSIBILITY.md leaves open', () => {
    expect(page.knownIssues.map((issue) => issue.id)).toEqual(['F15', 'F22', 'F23', 'F24'])
    for (const issue of page.knownIssues) {
      expect(issue.affected.length).toBeGreaterThan(3)
      expect(issue.criterion.length).toBeGreaterThan(3)
      expect(issue.description.length).toBeGreaterThan(60)
      expect(issue.expected.length).toBeGreaterThan(10)
    }
  })

  it('names the environments with versions, and says what was not tested', () => {
    expect(page.environments.length).toBeGreaterThan(0)
    for (const environment of page.environments) {
      expect(environment.version).toMatch(/^\d+\.\d+/)
    }
    expect(page.environmentsNotTested).toContain('No browser and no screen reader')
    expect(page.notTestedBody).toContain('screen-reader passes')
  })

  it('states the standard, the date, and the method', () => {
    expect(page.standard).toBe('WCAG 2.2 Level AA')
    expect(page.lastVerified).toBe('2026-09-11')
    expect(page.method).toContain('Self-assessment')
  })

  it('renders a feedback route from configuration, and says so when there is none', () => {
    const configured = accessibilityFeedback('access@example.test')
    expect(configured.address).toBe('access@example.test')
    expect(configured.body).toContain('access@example.test')
    expect(configured.body).toContain(pages.contact.responseTime)

    for (const empty of [null, '', '   ']) {
      const missing = accessibilityFeedback(empty)
      expect(missing.address).toBeNull()
      expect(missing.body).toContain('No contact address is configured')
    }
  })

  it('builds the contact page from the configured address', () => {
    const contact = contactPage('hello@example.test')
    expect(contact.address).toBe('hello@example.test')
    expect(contact.title).toBe(pages.contact.title)
    // No address is baked into a constant: an address in copy is an address that goes stale.
    for (const entry of everyString) expect(entry.value).not.toContain('@')
  })
})

// ── Coverage of the §17 state matrix ─────────────────────────────────────────────────────────

describe('every state this release renders has a string', () => {
  it('covers the §17 general group', () => {
    for (const key of [
      'offline',
      'slowNetwork',
      'unsupportedBrowser',
      'empty',
      'skeleton',
      'errorBoundary',
      'maintenance',
      'consentRequired',
      'adBlocked',
      'affiliateUnavailable',
      'billingNotConfigured',
    ] as const) {
      expect(states[key]).toBeDefined()
    }
  })

  it('covers the §17 flight-data lookup states', () => {
    for (const key of [
      'initial',
      'searching',
      'multipleMatches',
      'noMatch',
      'invalidFlight',
      'providerUnavailable',
      'rateLimited',
      'stale',
      'demo',
    ] as const) {
      expect(lookup.states[key].length).toBeGreaterThan(0)
    }
  })

  it('covers the §17 connection topology states', () => {
    expect(cockpit.connection.topology.protectedBody).toBe(results.protectedItinerary)
    expect(cockpit.connection.topology.selfTransferBody).toBe(results.selfTransfer)
    expect(cockpit.connection.topology.unknownBody).toBe(results.topologyMissing)
  })

  it('covers the §16 severities on both the homepage and the cockpit', () => {
    expect(home.monitoring.severities.map((item) => item.severity)).toEqual([
      'info',
      'watch',
      'urgent',
      'resolved',
    ])
    expect(Object.keys(cockpit.alerts.severityLabels)).toEqual([
      'info',
      'watch',
      'urgent',
      'resolved',
    ])
  })

  it('gives the chronology five ordered steps and no clock time', () => {
    expect(chronology.order).toHaveLength(5)
    expect([...chronology.order].sort()).toEqual(Object.keys(chronology.steps).sort())
    for (const step of Object.values(chronology.steps)) {
      expect(step.description).not.toMatch(/\d/)
    }
  })

  it('supplies every label the pattern-copy adapter maps onto a component prop', () => {
    // These names were filed as a gap list by frontend-ui-engineer during the S2 session and are
    // now consumed by the adapter in apps/web/src/components/pattern-copy.ts; the interim request
    // file that carried the list has been retired. Losing one of these silently would put a literal
    // back into a component, which is the failure this module exists to prevent.
    expect(Object.keys(cockpit.segment.statusLabels)).toEqual([
      'scheduled',
      'delayed',
      'canceled',
      'diverted',
      'returned',
      'departed',
      'landed',
      'unknown',
    ])
    expect(Object.keys(cockpit.segment.confidenceLabels)).toEqual(['low', 'medium', 'high'])
    for (const key of ['departs', 'arrives', 'nextDay', 'zone', 'conflictHeading'] as const) {
      expect(cockpit.segment[key].length).toBeGreaterThan(0)
    }
    for (const key of [
      'columnStep',
      'columnMinutes',
      'columnDerivation',
      'componentsCaption',
      'notRequired',
      'gateCloseBuffer',
      'bandScaleLabel',
      'currentBand',
    ] as const) {
      expect(cockpit.connection[key].length).toBeGreaterThan(0)
    }
    for (const key of [
      'deadlineLabel',
      'jurisdictionLabel',
      'consequenceLabel',
      'empty',
    ] as const) {
      expect(cockpit.actions[key].length).toBeGreaterThan(0)
    }
    for (const key of [
      'summaryHeading',
      'scheduleHeading',
      'chronologyHeading',
      'messagesHeading',
      'expensesHeading',
      'rightsHeading',
      'sourcesHeading',
      'columnWhen',
      'columnWhat',
      'columnSource',
      'columnAmount',
      'emptyMessages',
      'emptyExpenses',
      'ruleSetLabel',
    ] as const) {
      expect(cockpit.evidence[key].length).toBeGreaterThan(0)
    }
    expect(cockpit.rights.entitlementsHeading.length).toBeGreaterThan(0)
    expect(cockpit.rights.sourceUnavailable).toBe(unavailableReasons.officialSourceUnavailable.fact)
    expect(cockpit.alerts.empty.length).toBeGreaterThan(0)
    expect(Object.keys(cockpit.timeline)).toEqual(['label', 'departure', 'connection', 'arrival'])
    for (const key of [
      'answerFirstLabel',
      'reviewedLabel',
      'sourcesHeading',
      'sourcesIntro',
      'awaitingReview',
      'notYetVerified',
      'internalRefsHeading',
      'contextHeading',
      'contextIntro',
      'contextNote',
    ] as const) {
      expect(pages.article[key].length).toBeGreaterThan(0)
    }
    for (const route of [
      '/affiliate-disclosure/',
      '/advertising-policy/',
      '/editorial-policy/',
      '/accessibility/',
      '/privacy/',
      '/terms/',
    ] as const) {
      expect(nav.footer.links[route].length).toBeGreaterThan(0)
    }
  })

  it('renders a null verification date as words, and context sources as context', () => {
    // The article shell reads each registry record's authority, address and `lastVerifiedAt`. Every
    // record in this build has a null date, and a citation with the date silently omitted reads as
    // a verified citation — the fabrication in AGENTS.md §1.1. So the null renders as words.
    expect(pages.article.notYetVerified).toMatch(/not yet verified/i)
    expect(pages.article.notYetVerified).toContain('publisher')

    // DIRECTIVE.md §3.5: a news summary never outranks the regulator. The context block says so in
    // three places — the heading, the intro, and a note on every item — and never says "source"
    // alone, which would read as an authority.
    expect(pages.article.contextHeading).not.toBe(pages.article.sourcesHeading)
    expect(pages.article.contextNote).toContain('not an authority')
    expect(pages.article.contextIntro).toContain('reports on a rule without being the rule')
    expect(pages.article.contextIntro).toMatch(/no rule value on this page comes from it/i)

    // The repository's own documents are not sources and do not sit under the sources heading.
    expect(pages.article.internalRefsHeading).not.toBe(pages.article.sourcesHeading)
    expect(pages.article.internalRefsHeading).toContain('DelayPilot')
  })

  it('gives the weather and airspace panel an unavailable state that names the feed', () => {
    // §18.5 conditions, with no feed connected. The missing fact is the FEED, not the weather:
    // saying nothing would read as "conditions are fine" (AGENTS.md §1.1), and naming the weather
    // would claim knowledge of it. One wording, single-sourced from unavailableReasons.
    expect(cockpit.unknown.conditions).toBe(unavailableReasons.weatherNotConnected.fact)
    expect(states.conditionsNotConnected.body).toContain(
      unavailableReasons.weatherNotConnected.fact,
    )
    expect(states.conditionsNotConnected.action).toBe(
      unavailableReasons.weatherNotConnected.nextStep,
    )
    expect(states.conditionsNotConnected.action).not.toBeNull()

    // AGENTS.md §1.3: contextual evidence is never legal cause, and the panel is where a reader
    // would otherwise draw that inference. The rule travels with the sentence, not with a footnote.
    expect(states.conditionsNotConnected.body).toContain('never proof of a cause')

    // Neither a blank, a dash, nor a zero — and it says what is missing before what to do.
    expect(states.conditionsNotConnected.body).not.toMatch(/^[\s—–-]*$/)
    for (const value of Object.values(states.conditionsNotConnected)) {
      expect(value === null || value.trim().length > 0).toBe(true)
    }
  })

  it('takes the copyright year as an argument rather than baking one in', () => {
    // A year in a constant is a year that goes stale in January, and `new Date()` inside copy makes
    // two builds of the same tree differ (`AGENTS.md §3.4`).
    expect(copyright(2026)).toBe('© 2026 DelayPilot')
    expect(copyright(2031)).toBe('© 2031 DelayPilot')
  })

  it('supplies the layout strings the S2 handoff asked for', () => {
    expect(nav.newTab).toBe('opens in a new tab')
    expect(nav.skipLink).toBe('Skip to main content')
    expect(home.hero.motifCaption).toBe('Illustrative route lines — not live traffic.')
  })
})
