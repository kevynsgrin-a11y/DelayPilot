/**
 * The forbidden-phrase scanner. Owner: `ux-copy-steward`.
 *
 * WHAT IT DOES. Normalizes a file, searches the normalized text for every phrase in
 * `forbidden-phrases.ts`, and maps each match back to a line and column in the ORIGINAL file so the
 * output points at something a person can open.
 *
 * NORMALIZATION, and why each step is there:
 *
 *  - **Case folded.** A phrase shouted in capitals is the same claim as the lower-case one.
 *  - **Curly apostrophes folded to straight**, and an apostrophe inside a token is optional at match
 *    time, so `you're`, `you’re` and `youre` are one phrase.
 *  - **Separators folded to a single space**: whitespace, hyphens, underscores, dots, slashes,
 *    pipes, list and quote markers, and the dashes. This is what makes the scanner tolerant of LINE
 *    WRAPPING (a phrase broken across two prose lines), of markdown blockquote and bullet
 *    continuations, and of the hyphen/space variants the charter names. Two are kept rather than
 *    folded, each with its note at the branch that keeps it: `#` immediately before a digit, and a
 *    `.` that ends a sentence. Everything the normalizer does NOT fold — a comma, a colon, a
 *    semicolon, a bracket, a quotation mark, `!`, `?` — already stops a phrase where it stands.
 *  - **`\n`, `\r`, `\t` escape sequences folded to a space**, because a phrase split across a
 *    template literal is still a phrase.
 *  - **camelCase split**, so an identifier spells out the claim it encodes.
 *  - **Runs of spaces collapsed**, so the phrase regexes can assume exactly one.
 *
 * Matching is anchored on non-alphanumeric boundaries, so a phrase never matches inside a longer
 * word.
 *
 * WHAT IT DOES NOT DO. It never edits a file. It has no auto-fix and will not get one: the fix for
 * an overclaim is a rewrite by someone who knows what the sentence is trying to say, and a lint
 * that silently rewords legal copy is a worse problem than the one it solves.
 *
 * THE ALLOWLIST IS FOUR ENTRIES AND IT IS CLOSED. They are the files whose job is to DEFINE the ban
 * — the constitution, the directive, the voice guide, and this lint's own fixtures. Adding a fifth
 * to unblock a failing build is forbidden by the owning charter; the fix is to change the copy, or
 * to escalate to the orchestrator if the copy is right and the rule is wrong.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

import {
  forbiddenPhrases,
  GAP_NO_NEGATION,
  isGap,
  phraseText,
  type ForbiddenPhrase,
} from './forbidden-phrases.ts'

export interface Hit {
  /** Repository-relative, POSIX separators. */
  readonly file: string
  /** 1-based. */
  readonly line: number
  /** 1-based. */
  readonly column: number
  readonly phraseId: string
  /** The phrase as a human reads it. */
  readonly phrase: string
  /** The text as it actually appears in the file, which may be hyphenated or wrapped. */
  readonly matched: string
  readonly invariant: string
  readonly why: string
  /** The offending source line, trimmed. */
  readonly excerpt: string
}

export interface AllowlistEntry {
  /** Repository-relative path, POSIX separators. A trailing slash means "everything under here". */
  readonly path: string
  /** Why this file is permitted to contain a banned phrase. Every entry carries one. */
  readonly reason: string
}

/**
 * The complete allowlist. Four entries, each one a file whose PURPOSE is to state the ban.
 * `lint.test.ts` asserts the length, so a fifth entry cannot arrive quietly.
 */
export const allowlist: readonly AllowlistEntry[] = [
  {
    path: 'AGENTS.md',
    reason:
      'The constitution. §1.3 enumerates the banned phrases verbatim; a ban that cannot be written down cannot be enforced.',
  },
  {
    path: 'DIRECTIVE.md',
    reason: 'The build directive. §7 enumerates the "Never" list verbatim, for the same reason.',
  },
  {
    path: 'docs/VOICE.md',
    reason:
      'The voice guide. It publishes the forbidden list for humans, so the list has to be readable there.',
  },
  {
    path: 'apps/web/src/lib/copy/lint/fixtures/',
    reason:
      "This lint's own fixtures. One of them exists precisely to contain a violation, so that the scanner can be proven to fire on it; a lint with no proof it fires is not a lint.",
  },
]

/** Sentinel root meaning "the text files directly in the repository root, not recursively". */
export const ROOT_FILES = '.'

/**
 * The scanned tree (`ux-copy-steward` charter): every text-bearing file under these roots.
 *
 * `design/**` and `.claude/**` are not scanned by default and this is deliberate, not an oversight.
 * `design/**` is v0-generated reference material that is never built, never served, and already
 * excluded from ESLint and Prettier; `.claude/**` holds the agent charters, whose "You must not"
 * sections quote the bans on purpose and which `scripts/validate-build-system.mjs` already covers
 * with a prohibiting-context rule. Scan either explicitly with `--root` when porting code out of
 * them — and anything ported into `apps/**` is scanned at its new path, which is the point.
 */
export const scanRoots: readonly string[] = [
  'apps',
  'packages',
  'tests',
  'e2e',
  'data',
  'docs',
  'ml',
  'scripts',
  // The text files sitting directly in the repository root, AGENTS.md and DIRECTIVE.md among them.
  // Without this entry their allowlist entries would be decorative, because they would never have
  // been scanned in the first place.
  ROOT_FILES,
]

const SCANNED_EXTENSIONS: ReadonlySet<string> = new Set([
  'md',
  'mdx',
  'txt',
  'csv',
  'tsv',
  'ts',
  'tsx',
  'mts',
  'cts',
  'js',
  'jsx',
  'mjs',
  'cjs',
  'astro',
  'vue',
  'svelte',
  'html',
  'htm',
  'css',
  'scss',
  'sass',
  'less',
  'json',
  'jsonc',
  'json5',
  'yml',
  'yaml',
  'toml',
  'xml',
  'svg',
  'sql',
  'snap',
  'sh',
  'py',
  'example',
])

/** Files with no extension that still carry shipped text. */
const SCANNED_BASENAMES: ReadonlySet<string> = new Set(['_headers', '_redirects'])

const SKIPPED_DIRECTORIES: ReadonlySet<string> = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.astro',
  '.wrangler',
  '.turbo',
  '.cache',
  '.next',
  '.output',
  '.vercel',
  'coverage',
  'playwright-report',
  'test-results',
  'artifacts',
])

/**
 * Generated artifacts and lockfiles. Not authored text: nobody can fix a phrase inside them, and
 * `worker-configuration.d.ts` is emitted by `wrangler types` and regenerated on every run. Skipping
 * a machine-written file is not the same as allowlisting a hand-written one.
 */
const SKIPPED_BASENAMES: ReadonlySet<string> = new Set([
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  'worker-configuration.d.ts',
])

/** Two megabytes. Beyond that it is data, not prose. */
const MAX_BYTES = 2_000_000

const APOSTROPHES = new Set(['’', '‘', 'ʼ', '´'])
const SEPARATORS = new Set([
  ' ',
  '\t',
  '\n',
  '\r',
  '\f',
  '\v',
  ' ',
  '-',
  '_',
  '.',
  '/',
  '\\',
  '>',
  '*',
  '|',
  '#',
  '+',
  '–',
  '—',
])

interface Normalized {
  readonly text: string
  /** `offsets[i]` is the source index the normalized character at `i` came from. */
  readonly offsets: readonly number[]
}

const isLower = (c: string): boolean => c >= 'a' && c <= 'z'
const isDigit = (c: string): boolean => c >= '0' && c <= '9'
const isUpper = (c: string): boolean => c >= 'A' && c <= 'Z'

/**
 * Does the `.` at `at` end a sentence? True when the next thing that is not whitespace is a capital
 * letter, or when nothing follows it at all.
 *
 * DELIBERATELY NARROW, because the cost is asymmetric. Keeping a `.` blocks a match across it, so a
 * rule that kept too many would start missing claims — and a missed claim costs a traveler money
 * while a false positive costs a build. So the dotted forms that are NOT sentence ends still fold to
 * a space and nothing that used to be caught stops being caught: `results.demo`, `AGENTS.md`, a hex
 * value, a version, a file path, a `.` before a digit or a lower-case letter.
 *
 * An abbreviation followed by a capitalised word — "e.g. Two tickets…" — is read as a sentence end
 * and blocks there. That costs nothing measurable: a phrase beginning after the abbreviation still
 * matches from its own first word, and a phrase that spans an abbreviation and a capitalised word is
 * not a phrase anyone writes. (The example this note first used spelled a banned phrase to make the
 * point, and the lint caught this file. Its own rule, applied to its own comment.)
 */
function endsSentence(source: string, at: number): boolean {
  for (let i = at + 1; i < source.length; i += 1) {
    const c = source.charAt(i)
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f' || c === '\v') continue
    if (c === '\\') {
      // An escaped newline inside a string literal is whitespace to a reader, so keep looking.
      const next = source.charAt(i + 1)
      if (next === 'n' || next === 'r' || next === 't') {
        i += 1
        continue
      }
      return false
    }
    return isUpper(c)
  }
  return true
}

/** Fold a source file into the matchable form, keeping a source index per character. */
export function normalize(source: string): Normalized {
  const chars: string[] = []
  const offsets: number[] = []
  // `previous` is the last character EMITTED, used to collapse runs of spaces. `previousSource` is
  // the last character READ, and it is the one the camelCase rule has to look at: folding case
  // first would turn every all-capitals word into "l e g a l l y".
  let previous = ''
  let previousSource = ''

  const push = (c: string, at: number): void => {
    if (c === ' ' && (chars.length === 0 || previous === ' ')) {
      previous = ' '
      return
    }
    chars.push(c)
    offsets.push(at)
    previous = c
  }

  for (let i = 0; i < source.length; i += 1) {
    const c = source.charAt(i)
    const prior = previousSource
    previousSource = c

    if (c === '\\') {
      const next = source.charAt(i + 1)
      if (next === 'n' || next === 'r' || next === 't') {
        push(' ', i)
        previousSource = next
        i += 1
        continue
      }
      push(' ', i)
      continue
    }

    // `#` IS A SEPARATOR EXCEPT IMMEDIATELY BEFORE A DIGIT. It folds to a space so that markdown
    // headings, blockquote markers and list continuations do not break a phrase — but folding it
    // everywhere destroyed the one claim that is written with it, the rank numeral, which reduced
    // to a bare digit and could not be matched without matching every digit in the repository.
    // Keeping the `#` when a digit follows makes the claim addressable and changes nothing else:
    // a markdown heading is `#` before a space or a letter, and a hex colour or an issue reference
    // keeps its `#` but is excluded by the digit boundary on the phrase pattern (`#12` is not a
    // hit). Verified before the rule landed: no bare rank numeral exists in the scanned tree.
    if (SEPARATORS.has(c)) {
      if (c === '#' && isDigit(source.charAt(i + 1))) {
        push(c, i)
        continue
      }
      // A FULL STOP THAT ENDS A SENTENCE IS KEPT, so no phrase can be assembled across one.
      // `trust-compliance-officer` F15: `.` folded to a space like every other separator, and
      // "call the airline. Owes you nothing is not something we say." was a hit, because the fold
      // turned two sentences into one. `!` and `?` were never separators and already blocked;
      // this makes the third terminator behave like its siblings.
      if (c === '.' && endsSentence(source, i)) {
        push(c, i)
        continue
      }
      push(' ', i)
      continue
    }

    if (APOSTROPHES.has(c)) {
      push("'", i)
      continue
    }

    if (isUpper(c)) {
      if (isLower(prior) || isDigit(prior)) push(' ', i)
      push(c.toLowerCase(), i)
      continue
    }

    push(c.toLowerCase(), i)
  }

  return { text: chars.join(''), offsets }
}

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/** A token matches with or without its apostrophes: `you're`, `you’re` and `youre` are one word. */
const tokenPattern = (token: string): string =>
  token
    .split("'")
    .map((part) => escapeRegExp(part))
    .join("'?")

const patternCache = new Map<string, RegExp>()

/**
 * An elastic join: up to two inserted words, each followed by the single space the normalizer
 * leaves behind. Bounded at two, so the pattern cannot backtrack, and built only from word
 * characters and single spaces, so it cannot cross a comma, a colon, a bracket or a quotation
 * mark — none of which the normalizer folds away (`forbidden-phrases.ts`, `GAP`).
 */
const ELASTIC_JOIN = "(?:[a-z0-9']+ ){0,2}"

/**
 * The words that turn a promise into a hedge. Anything ending in "n't" counts, with or without the
 * apostrophe, because the normalizer keeps a straight one and an author may omit it.
 */
const NEGATORS = ['not', 'cannot', 'never', 'no', 'neither', 'nor', "[a-z]*n'?t"]

/**
 * `GAP_NO_NEGATION`: the same two-word width, with each inserted word required not to be a negator.
 * The check is a lookahead at every repetition, so a negator in EITHER slot abandons the match — the
 * two-word branch cannot slip one past by consuming it in the second position.
 */
const ELASTIC_JOIN_NO_NEGATION = `(?:(?!(?:${NEGATORS.join('|')}) )[a-z0-9']+ ){0,2}`

function patternFor(phrase: ForbiddenPhrase): RegExp {
  const cached = patternCache.get(phrase.id)
  if (cached !== undefined) return cached
  let body = ''
  let elastic: string | null = null
  for (const token of phrase.tokens) {
    if (isGap(token)) {
      elastic = token === GAP_NO_NEGATION ? ELASTIC_JOIN_NO_NEGATION : ELASTIC_JOIN
      continue
    }
    if (body !== '') body += elastic === null ? ' ' : ` ${elastic}`
    body += tokenPattern(token)
    elastic = null
  }
  const built = new RegExp(`(?<![a-z0-9])${body}(?![a-z0-9])`, 'g')
  patternCache.set(phrase.id, built)
  return built
}

/** Line start offsets, so a source index becomes a line and a column. */
function lineStarts(source: string): number[] {
  const starts = [0]
  for (let i = 0; i < source.length; i += 1) {
    if (source.charAt(i) === '\n') starts.push(i + 1)
  }
  return starts
}

function positionOf(starts: readonly number[], offset: number): { line: number; column: number } {
  let low = 0
  let high = starts.length - 1
  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    const start = starts[mid] ?? 0
    if (start <= offset) low = mid
    else high = mid - 1
  }
  return { line: low + 1, column: offset - (starts[low] ?? 0) + 1 }
}

/** Does an exempt collocation cover this match? Used only by the superlative rule. */
function coveredByCollocation(
  normalizedText: string,
  start: number,
  end: number,
  collocations: readonly string[],
): boolean {
  for (const collocation of collocations) {
    let from = 0
    for (;;) {
      const at = normalizedText.indexOf(collocation, from)
      if (at === -1) break
      if (at <= start && at + collocation.length >= end) return true
      from = at + 1
    }
  }
  return false
}

function inScope(phrase: ForbiddenPhrase, file: string): boolean {
  if (phrase.scope === undefined) return true
  return phrase.scope.some((prefix) => file === prefix || file.startsWith(`${prefix}/`))
}

export interface ScanTextOptions {
  /** Repository-relative path, used for the scoped phrases. Defaults to unscoped. */
  readonly file?: string
  /** Restrict to a subset of the list. Defaults to all of it. */
  readonly phrases?: readonly ForbiddenPhrase[]
}

/**
 * Scan one file's text. The allowlist is NOT applied here — it is a property of a path in a
 * repository scan, not of a string — so tests can prove the scanner fires on an allowlisted fixture.
 */
export function scanText(source: string, options: ScanTextOptions = {}): Hit[] {
  const file = options.file ?? ''
  const list = options.phrases ?? forbiddenPhrases
  const { text, offsets } = normalize(source)
  const starts = lineStarts(source)
  const sourceLines = source.split('\n')
  const hits: Hit[] = []

  for (const phrase of list) {
    if (file !== '' && !inScope(phrase, file)) continue
    if (file === '' && phrase.scope !== undefined) continue

    const pattern = patternFor(phrase)
    pattern.lastIndex = 0
    let match = pattern.exec(text)
    while (match !== null) {
      const start = match.index
      const end = start + match[0].length
      const exempt =
        phrase.notWhenPartOf !== undefined &&
        coveredByCollocation(text, start, end, phrase.notWhenPartOf)

      if (!exempt) {
        const from = offsets[start] ?? 0
        const to = offsets[end - 1] ?? from
        const { line, column } = positionOf(starts, from)
        hits.push({
          file,
          line,
          column,
          phraseId: phrase.id,
          phrase: phraseText(phrase),
          matched: source.slice(from, to + 1),
          invariant: phrase.invariant,
          why: phrase.why,
          excerpt: (sourceLines[line - 1] ?? '').trim().slice(0, 160),
        })
      }

      pattern.lastIndex = end
      match = pattern.exec(text)
    }
  }

  return hits.sort((a, b) => a.line - b.line || a.column - b.column)
}

const toPosix = (value: string): string => (sep === '/' ? value : value.split(sep).join('/'))

function isScannable(name: string): boolean {
  if (SKIPPED_BASENAMES.has(name)) return false
  if (name.endsWith('.min.js') || name.endsWith('.map')) return false
  if (SCANNED_BASENAMES.has(name)) return true
  const dot = name.lastIndexOf('.')
  if (dot <= 0) return false
  return SCANNED_EXTENSIONS.has(name.slice(dot + 1).toLowerCase())
}

/** Every scannable file under `directory`, recursively, repository-relative and POSIX-separated. */
export function collectFiles(root: string, directory: string, files: string[] = []): string[] {
  let entries
  try {
    entries = readdirSync(directory, { withFileTypes: true })
  } catch {
    return files
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIPPED_DIRECTORIES.has(entry.name)) continue
      collectFiles(root, join(directory, entry.name), files)
      continue
    }
    if (!entry.isFile()) continue
    if (!isScannable(entry.name)) continue
    files.push(toPosix(relative(root, join(directory, entry.name))))
  }
  return files
}

/**
 * Resolve a list of roots into files. `ROOT_FILES` sweeps the repository root one level deep; every
 * other entry is a directory to walk or a single file to scan. A missing root is skipped rather
 * than fatal, because the scanned tree names directories that later phases create.
 */
export function collectRepositoryFiles(
  root: string,
  roots: readonly string[] = scanRoots,
): string[] {
  const files: string[] = []
  for (const name of roots) {
    if (name === ROOT_FILES) {
      try {
        for (const entry of readdirSync(root, { withFileTypes: true })) {
          if (entry.isFile() && isScannable(entry.name)) files.push(toPosix(entry.name))
        }
      } catch {
        continue
      }
      continue
    }
    const full = join(root, name)
    try {
      if (statSync(full).isDirectory()) collectFiles(root, full, files)
      else if (isScannable(name)) files.push(toPosix(name))
    } catch {
      continue
    }
  }
  return [...new Set(files)].sort()
}

export function isAllowlisted(
  file: string,
  entries: readonly AllowlistEntry[] = allowlist,
): boolean {
  return entries.some((entry) =>
    entry.path.endsWith('/') ? file.startsWith(entry.path) : file === entry.path,
  )
}

export interface ScanOptions {
  readonly root: string
  /** Defaults to `scanRoots`. Pass a single directory to scan only that. */
  readonly roots?: readonly string[]
  /** Defaults to the four-entry allowlist. Pass `[]` to scan everything, which tests do. */
  readonly allowlist?: readonly AllowlistEntry[]
  /** Stop after the first file that has a hit. */
  readonly failFast?: boolean
}

export interface ScanResult {
  readonly scanned: number
  readonly skipped: number
  readonly hits: readonly Hit[]
}

/** Scan a repository. Reads files; writes nothing, ever. */
export function scanRepository(options: ScanOptions): ScanResult {
  const entries = options.allowlist ?? allowlist
  const files = collectRepositoryFiles(options.root, options.roots ?? scanRoots)
  const hits: Hit[] = []
  let scanned = 0
  let skipped = 0

  for (const file of files) {
    if (isAllowlisted(file, entries)) {
      skipped += 1
      continue
    }
    const full = join(options.root, file)
    let source: string
    try {
      if (statSync(full).size > MAX_BYTES) {
        skipped += 1
        continue
      }
      source = readFileSync(full, 'utf8')
    } catch {
      skipped += 1
      continue
    }
    scanned += 1
    const found = scanText(source, { file })
    if (found.length > 0) {
      hits.push(...found)
      if (options.failFast === true) break
    }
  }

  return { scanned, skipped, hits }
}
