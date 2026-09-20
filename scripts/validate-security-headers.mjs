#!/usr/bin/env node
/**
 * Security-header and cache-policy check.
 *
 * ONE POLICY, DECLARED IN FOUR PLACES, BECAUSE THREE DIFFERENT SERVERS READ THREE DIFFERENT
 * FORMATS AND NONE OF THEM READS ANOTHER'S:
 *
 *   1. `apps/web/public/_headers` — Cloudflare's static-assets header format. This is the
 *      reference copy: `apps/web/scripts/verify-dist.mjs`, `scripts/perf/serve-dist.mjs`,
 *      `tests/tools/serve-dist.mjs` and `tests/a11y/run-axe.mjs` all read the policy out of this
 *      file rather than restating it, so it is the string the build is actually verified against.
 *   2. `apps/edge/src/index.ts` → `SECURITY_HEADERS` — the Cloudflare Worker's middleware, which
 *      covers Worker-generated responses (`/api/*` and the residual ASSETS fallthrough). A Worker
 *      response never sees the `_headers` file.
 *   3. `vercel.json` and 4. `apps/web/vercel.json` — the only header declaration Vercel reads, and
 *      Vercel is what serves `delaypilot.app` today. Vercel does not read `_headers` at all: it
 *      copies it into the build output as an ordinary static file and ignores it as configuration.
 *
 * Why two Vercel files. Vercel reads `vercel.json` from the project's configured Root Directory,
 * not from the repository root. `docs/decisions/0002-foundation-stack-and-versions.md` and the
 * merged PR #16 both record that the `delaypilot` project's Root Directory is `apps/web`, which
 * makes the repository-root file inert; the repository cannot observe that setting, so the same
 * configuration is committed at both paths and this check holds them byte-identical. Once the
 * setting is confirmed, the inert copy is deleted and `VERCEL_FILES` loses a row —
 * `docs/DEPLOYMENT.md §2` carries the decision procedure.
 *
 * WHAT DRIFT COSTS. An engineer tightening the CSP in one file leaves the other three on the old
 * policy, and the site looks protected while being a quarter protected. Nothing else in the
 * toolchain notices: the build verifies itself against `_headers`, and users receive `vercel.json`.
 * That gap is exactly how a strict policy that everything was reviewed against ended up being
 * served to nobody.
 *
 * WHAT THIS CHECKS
 *
 *   A. Every file declares every header in `REQUIRED`, with identical values after whitespace
 *      normalization. Ordering and casing are not significant; the value is compared as a string,
 *      with no CSP semantics — the job is to catch drift, not to judge the policy.
 *   B. Each `vercel.json` has exactly one site-wide header block, and it carries no `Cache-Control`
 *      (caching is declared per path class, see D).
 *   C. Every `vercel.json` is byte-identical to the first one.
 *   D. Every `Cache-Control` rule in `vercel.json` is written in a source grammar this checker can
 *      prove disjoint, and no two of them overlap. Vercel applies every matching header rule, and
 *      no documentation reachable from this repository defines which value wins when two rules set
 *      the same key — so the rules are kept disjoint and the question never arises.
 *   E. `/app`, `/auth`, `/checkout`, `/admin` and `/api` each carry exactly one `Cache-Control`
 *      rule, it contains `no-store` and `private`, and it contains no shared-cache directive.
 *      `AGENTS.md §2`: private routes are never stored in a shared cache. Declaring the rule before
 *      the routes exist is the point — the guard cannot be forgotten on the day they land.
 *
 * Run:  node scripts/validate-security-headers.mjs
 * Prove it fires:  node scripts/validate-security-headers.mjs --self-test
 *
 * The self-test reads the four real files, asserts the live policy passes, then applies one seeded
 * divergence at a time IN MEMORY and asserts the checker rejects it. Nothing on disk is modified,
 * so it is safe to run while another agent is measuring the tree.
 */

import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

const HEADERS_FILE = 'apps/web/public/_headers'
const WORKER_FILE = 'apps/edge/src/index.ts'

/**
 * Every Vercel configuration in the repository. Each one that exists is held to the same policy,
 * so adding a copy for a different Root Directory can never introduce a weaker second answer.
 */
const VERCEL_FILES = ['vercel.json', 'apps/web/vercel.json']

/** Headers that must be identical everywhere. Ordering and casing are not significant. */
const REQUIRED = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
]

/**
 * Route prefixes that must never be stored in a shared cache (`AGENTS.md §2`). None of them is
 * built yet; the rule is declared now so that the day one of them ships it is already covered.
 */
const PRIVATE_PREFIXES = ['/app', '/auth', '/checkout', '/admin', '/api']

/** Directives that hand a response to a cache shared between people. */
const SHARED_CACHE_DIRECTIVES = ['public', 's-maxage', 'stale-while-revalidate', 'immutable']

/** Source patterns that match every path. Only the security block may use one. */
const CATCH_ALL_SOURCES = new Set(['/(.*)', '/:path*'])

const normalize = (value) => value.trim().replace(/\s+/g, ' ')

/**
 * Parse the `/*` catch-all block of a Cloudflare `_headers` file. Comment lines and other path
 * blocks are ignored; only the site-wide block is compared, since that is the one the Worker
 * middleware and the Vercel site-wide block are the counterparts to.
 */
export function parseHeadersFile(text) {
  const found = new Map()
  let inCatchAll = false

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue

    // A non-indented line starts a new path block.
    if (!/^\s/.test(line)) {
      inCatchAll = line.trim() === '/*'
      continue
    }
    if (!inCatchAll) continue

    const match = /^\s+([A-Za-z0-9-]+):\s*(.+)$/.exec(line)
    if (match) found.set(match[1].toLowerCase(), normalize(match[2]))
  }
  return found
}

/**
 * Extract the `SECURITY_HEADERS` object literal from the Worker source.
 *
 * Values may be written as adjacent string literals joined by `+` (prettier splits the CSP that
 * way to stay inside printWidth), so every quoted segment of an entry is concatenated before
 * comparison.
 */
export function parseWorkerFile(text, errors) {
  const start = text.indexOf('const SECURITY_HEADERS')
  if (start === -1) {
    errors.push(`${WORKER_FILE}: could not find a SECURITY_HEADERS declaration.`)
    return new Map()
  }
  const open = text.indexOf('{', start)
  const close = text.indexOf('\n}', open)
  if (open === -1 || close === -1) {
    errors.push(`${WORKER_FILE}: could not find the bounds of the SECURITY_HEADERS object.`)
    return new Map()
  }
  const body = text.slice(open + 1, close)

  const found = new Map()

  // Segments may be single- OR double-quoted: the CSP value is written in double quotes precisely
  // because it contains single quotes ('self', 'none'). Matching only one quote style silently
  // skips that entry, which would make this whole check pass while comparing nothing.
  const STRING = String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"`
  const entry = new RegExp(String.raw`'([A-Za-z0-9-]+)':\s*((?:\s*(?:${STRING})\s*\+?)+)`, 'g')
  const segment = new RegExp(STRING, 'g')

  let m
  while ((m = entry.exec(body)) !== null) {
    const segments = m[2].match(segment) ?? []
    const value = segments.map((s) => s.slice(1, -1)).join('')
    found.set(m[1].toLowerCase(), normalize(value))
  }
  return found
}

/**
 * Classify a Vercel `source` pattern into the restricted grammar this checker can reason about.
 *
 * Vercel compiles `source` with path-to-regexp, where a literal `.` is escaped and `/api/:path*`
 * matches `/api`, `/api/` and `/api/v1/health` but not `/apiary` (verified against the
 * path-to-regexp 6.3.0 copy in this repository's node_modules). Anything outside this grammar is
 * rejected rather than guessed at: an overlap this checker cannot see is an undefined
 * `Cache-Control`, and an undefined `Cache-Control` on a private route is a privacy defect.
 */
export function classifySource(source) {
  if (CATCH_ALL_SOURCES.has(source)) return { kind: 'catchAll' }

  const prefix = /^((?:\/[A-Za-z0-9._-]+)+)\/:path\*$/.exec(source)
  if (prefix) return { kind: 'prefix', path: prefix[1] }

  if (/^(?:\/[A-Za-z0-9._-]+)+$/.test(source)) return { kind: 'exact', path: source }

  return { kind: 'unsupported' }
}

/** True when two classified sources can both match the same request path. */
export function sourcesOverlap(a, b) {
  if (a.kind === 'catchAll' || b.kind === 'catchAll') return true

  const covers = (prefix, path) => path === prefix || path.startsWith(`${prefix}/`)

  if (a.kind === 'prefix' && b.kind === 'prefix')
    return covers(a.path, b.path) || covers(b.path, a.path)
  if (a.kind === 'prefix') return covers(a.path, b.path)
  if (b.kind === 'prefix') return covers(b.path, a.path)
  return a.path === b.path
}

/**
 * Parse one `vercel.json`: the site-wide security block, and every rule that sets `Cache-Control`.
 */
export function parseVercelFile(text, label, errors) {
  let config
  try {
    config = JSON.parse(text)
  } catch (error) {
    errors.push(`${label}: not valid JSON — ${error instanceof Error ? error.message : error}`)
    return { siteWide: new Map(), cacheRules: [] }
  }

  const rules = Array.isArray(config.headers) ? config.headers : []
  if (rules.length === 0) {
    errors.push(`${label}: declares no "headers" rules at all.`)
    return { siteWide: new Map(), cacheRules: [] }
  }

  const siteWideBlocks = []
  const cacheRules = []

  for (const rule of rules) {
    const source = typeof rule?.source === 'string' ? rule.source : ''
    const entries = Array.isArray(rule?.headers) ? rule.headers : []
    const byName = new Map()
    for (const entry of entries) {
      if (typeof entry?.key !== 'string' || typeof entry?.value !== 'string') {
        errors.push(`${label}: rule "${source}" has a header entry without a string key and value.`)
        continue
      }
      byName.set(entry.key.toLowerCase(), normalize(entry.value))
    }

    if (CATCH_ALL_SOURCES.has(source)) siteWideBlocks.push({ source, byName })

    if (byName.has('cache-control')) {
      if (rule.has !== undefined || rule.missing !== undefined) {
        errors.push(
          `${label}: rule "${source}" sets Cache-Control behind a "has"/"missing" condition. ` +
            `Conditional rules cannot be proven disjoint, so caching may not use them.`,
        )
      }
      cacheRules.push({ source, value: byName.get('cache-control') })
    }
  }

  if (siteWideBlocks.length === 0) {
    errors.push(
      `${label}: no site-wide header block. One rule must use a catch-all source ` +
        `(${[...CATCH_ALL_SOURCES].join(' or ')}) and carry the security headers.`,
    )
  } else if (siteWideBlocks.length > 1) {
    errors.push(
      `${label}: ${siteWideBlocks.length} site-wide header blocks. Exactly one may exist, or the ` +
        `served security policy depends on undefined precedence between them.`,
    )
  }

  return { siteWide: siteWideBlocks[0]?.byName ?? new Map(), cacheRules }
}

/** Check D: no two Cache-Control rules may match the same path. */
function checkCacheDisjointness(label, cacheRules, errors) {
  const classified = []

  for (const rule of cacheRules) {
    const kind = classifySource(rule.source)
    if (kind.kind === 'catchAll') {
      errors.push(
        `${label}: rule "${rule.source}" sets a site-wide Cache-Control. It would collide with ` +
          `every path-class rule; caching is declared per path class.`,
      )
      continue
    }
    if (kind.kind === 'unsupported') {
      errors.push(
        `${label}: Cache-Control source "${rule.source}" is outside the grammar this checker can ` +
          `prove disjoint ("/exact/path" or "/prefix/:path*"). Rewrite it, or two rules may set ` +
          `Cache-Control on one request with no defined winner.`,
      )
      continue
    }
    classified.push({ ...rule, kind })
  }

  for (let i = 0; i < classified.length; i += 1) {
    for (let j = i + 1; j < classified.length; j += 1) {
      const a = classified[i]
      const b = classified[j]
      if (sourcesOverlap(a.kind, b.kind)) {
        errors.push(
          `${label}: Cache-Control rules "${a.source}" and "${b.source}" both match the same ` +
            `path. Vercel applies every matching rule and the winner is undefined.`,
        )
      }
    }
  }

  return classified
}

/** Check E: private prefixes are covered, and are never handed to a shared cache. */
function checkPrivatePrefixes(label, classified, errors) {
  for (const prefix of PRIVATE_PREFIXES) {
    const covering = classified.filter(
      (rule) => rule.kind.kind === 'prefix' && rule.kind.path === prefix,
    )

    if (covering.length === 0) {
      errors.push(
        `${label}: no Cache-Control rule for "${prefix}". AGENTS.md §2 requires private routes to ` +
          `be kept out of every shared cache; declare "${prefix}/:path*" as "private, no-store" ` +
          `before the routes exist, not after.`,
      )
      continue
    }

    for (const rule of covering) {
      const value = rule.value.toLowerCase()
      if (!value.includes('no-store')) {
        errors.push(
          `${label}: "${rule.source}" must contain "no-store" (AGENTS.md §2). Got: ${rule.value}`,
        )
      }
      if (!value.includes('private')) {
        errors.push(
          `${label}: "${rule.source}" must contain "private" (AGENTS.md §2). Got: ${rule.value}`,
        )
      }
      for (const directive of SHARED_CACHE_DIRECTIVES) {
        if (value.includes(directive)) {
          errors.push(
            `${label}: "${rule.source}" carries the shared-cache directive "${directive}". ` +
              `A private route may never be stored in a cache shared between people ` +
              `(AGENTS.md §2). Got: ${rule.value}`,
          )
        }
      }
    }
  }
}

/**
 * The whole check, as a pure function over file contents, so the self-test can seed a divergence
 * without touching the working tree.
 *
 * @param {{ headersText: string, workerText: string, vercel: { label: string, text: string }[] }} input
 * @returns {string[]} errors — empty means the policy is consistent
 */
export function checkPolicies({ headersText, workerText, vercel }) {
  const errors = []

  const staticHeaders = parseHeadersFile(headersText)
  const workerHeaders = parseWorkerFile(workerText, errors)

  const policies = [
    { label: HEADERS_FILE, headers: staticHeaders },
    { label: WORKER_FILE, headers: workerHeaders },
  ]

  if (vercel.length === 0) {
    errors.push(
      `No Vercel configuration found at any of: ${VERCEL_FILES.join(', ')}. Vercel serves the ` +
        `site and reads nothing else, so the policy would reach no one.`,
    )
  }

  for (const file of vercel) {
    const { siteWide, cacheRules } = parseVercelFile(file.text, file.label, errors)
    policies.push({ label: file.label, headers: siteWide })

    if (siteWide.has('cache-control')) {
      errors.push(
        `${file.label}: the site-wide block sets Cache-Control. It would collide with every ` +
          `path-class rule; caching is declared per path class.`,
      )
    }

    const classified = checkCacheDisjointness(file.label, cacheRules, errors)
    checkPrivatePrefixes(file.label, classified, errors)
  }

  // Check C — every Vercel configuration is byte-identical, so whichever Root Directory the
  // project uses, the answer is the same one.
  for (const file of vercel.slice(1)) {
    if (file.text !== vercel[0].text) {
      errors.push(
        `${file.label} is not byte-identical to ${vercel[0].label}. Both are committed because the ` +
          `project's Root Directory cannot be observed from the repository; if they differ, which ` +
          `one users receive depends on a setting no reviewer can see.`,
      )
    }
  }

  // Check A — one value per header, everywhere.
  for (const name of REQUIRED) {
    const reference = policies[0].headers.get(name)
    if (reference === undefined) {
      errors.push(`${policies[0].label}: missing required header "${name}".`)
    }

    for (const policy of policies.slice(1)) {
      const value = policy.headers.get(name)
      if (value === undefined) {
        errors.push(`${policy.label}: missing required header "${name}".`)
        continue
      }
      if (reference !== undefined && value !== reference) {
        errors.push(
          `Header "${name}" differs between policies:\n` +
            `  ${policies[0].label}: ${reference}\n` +
            `  ${policy.label}: ${value}\n` +
            `  The build is verified against the first and users receive the last.`,
        )
      }
    }
  }

  return errors
}

/** Read the four sources off disk. */
function readSources() {
  const vercel = []
  for (const rel of VERCEL_FILES) {
    const abs = join(repoRoot, rel)
    if (existsSync(abs)) vercel.push({ label: rel, text: readFileSync(abs, 'utf8') })
  }
  return {
    headersText: readFileSync(join(repoRoot, HEADERS_FILE), 'utf8'),
    workerText: readFileSync(join(repoRoot, WORKER_FILE), 'utf8'),
    vercel,
  }
}

/**
 * Prove the checker fires. Each case seeds one realistic divergence into a copy of the real
 * sources and asserts the checker rejects it with a message containing `expect`.
 */
function selfTest() {
  const base = readSources()
  const cases = [
    {
      name: `${HEADERS_FILE}: CSP widened with 'unsafe-inline'`,
      seed: (s) => ({
        ...s,
        headersText: s.headersText.replace(
          "script-src 'self'",
          "script-src 'self' 'unsafe-inline'",
        ),
      }),
      expect: 'Header "content-security-policy" differs between policies',
    },
    {
      name: `${WORKER_FILE}: X-Frame-Options relaxed to SAMEORIGIN`,
      seed: (s) => ({
        ...s,
        workerText: s.workerText.replace(
          "'x-frame-options': 'DENY'",
          "'x-frame-options': 'SAMEORIGIN'",
        ),
      }),
      expect: 'Header "x-frame-options" differs between policies',
    },
    {
      name: 'vercel.json: Permissions-Policy dropped',
      seed: (s) => ({
        ...s,
        vercel: s.vercel.map((f) => ({
          ...f,
          text: f.text.replace(/\s*\{\s*"key": "Permissions-Policy",[\s\S]*?\},/, ''),
        })),
      }),
      expect: 'missing required header "permissions-policy"',
    },
    {
      name: 'vercel.json: the two copies disagree',
      seed: (s) => ({
        ...s,
        vercel: s.vercel.map((f, i) =>
          i === 0 ? f : { ...f, text: f.text.replace('"DENY"', '"SAMEORIGIN"') },
        ),
      }),
      expect: 'is not byte-identical to',
    },
    {
      name: 'vercel.json: two Cache-Control rules overlap',
      seed: (s) => ({
        ...s,
        vercel: s.vercel.map((f) => ({
          ...f,
          // A one-hour rule for a file that now sits under the year-long /_astro/ rule: both match,
          // and which TTL the file is served with stops being knowable from the config.
          text: f.text.replace('"/theme-init.js"', '"/_astro/theme-init.js"'),
        })),
      }),
      expect: 'both match the same',
    },
    {
      name: 'vercel.json: a private route handed to a shared cache',
      seed: (s) => ({
        ...s,
        vercel: s.vercel.map((f) => ({
          ...f,
          text: f.text.replace(
            /"source": "\/app\/:path\*",\s*"headers": \[\{ "key": "Cache-Control", "value": "private, no-store" \}\]/,
            '"source": "/app/:path*",\n      "headers": [{ "key": "Cache-Control", "value": "public, s-maxage=600" }]',
          ),
        })),
      }),
      expect: 'shared-cache directive',
    },
  ]

  let failures = 0

  const clean = checkPolicies(base)
  if (clean.length === 0) {
    console.log('  ok    the live policy passes')
  } else {
    failures += 1
    console.error('  FAIL  the live policy does not pass, so no seeded case proves anything:')
    for (const error of clean) console.error(`          - ${error}`)
  }

  for (const testCase of cases) {
    const seeded = testCase.seed(base)
    if (JSON.stringify(seeded) === JSON.stringify(base)) {
      failures += 1
      console.error(`  FAIL  ${testCase.name} — the seed changed nothing; the case is vacuous.`)
      continue
    }
    const errors = checkPolicies(seeded)
    const caught = errors.some((error) => error.includes(testCase.expect))
    if (caught) {
      console.log(`  ok    caught: ${testCase.name}`)
    } else {
      failures += 1
      console.error(`  FAIL  not caught: ${testCase.name}`)
      console.error(`          expected an error containing: ${testCase.expect}`)
      for (const error of errors) console.error(`          got: ${error}`)
    }
  }

  if (failures > 0) {
    console.error(`\nSelf-test FAILED: ${failures} case(s).`)
    process.exit(1)
  }
  console.log(`\nSelf-test passed: ${cases.length} seeded divergence(s) caught, live policy clean.`)
}

const sources = readSources()

if (process.argv.includes('--self-test')) {
  console.log('Security-header checker self-test (in memory; nothing on disk is modified):\n')
  selfTest()
} else {
  const errors = checkPolicies(sources)

  if (errors.length > 0) {
    console.error('Security-header and cache-policy check FAILED:\n')
    for (const error of errors) console.error(`  - ${error}`)
    console.error(
      `\n${errors.length} error(s). Every policy must declare the same value for: ` +
        `${REQUIRED.join(', ')}.`,
    )
    process.exit(1)
  }

  const labels = [HEADERS_FILE, WORKER_FILE, ...sources.vercel.map((f) => f.label)]
  console.log(
    `Security-header and cache-policy check passed ` +
      `(${REQUIRED.length} headers, ${labels.length} policies).`,
  )
  console.log(`  Compared: ${labels.join(', ')}`)
  console.log(
    `  Cache-Control rules proven disjoint; ${PRIVATE_PREFIXES.join(', ')} are private, no-store.`,
  )
}
