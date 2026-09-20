#!/usr/bin/env node
/**
 * `pnpm test:a11y` — the whole of `docs/ACCESSIBILITY.md §12`, executed.
 *
 * Owner: qa-test-architect. Assertions specified by `accessibility-lead`.
 *
 * WHAT THIS COMMAND MEANS WHEN IT EXITS ZERO
 *
 *   · axe-core 4.13.0, tags wcag2a · wcag2aa · wcag21a · wcag21aa · wcag22aa, at 1440 × 900,
 *     over every route the build emits, four times each — {light, dark} × {no-preference, reduce}.
 *     ZERO violations at any impact, `minor` included. No rule disabled.
 *   · `best-practice` run separately and REPORTED. It does not gate; F13 and F14 live there.
 *   · `incomplete` results counted and printed, never waived — a change in their number is a
 *     signal, and §15.9 resolved the known twenty by pixel measurement rather than by waiver.
 *   · zero console errors and zero CSP refusals, because the page is served under the build's own
 *     `_headers` policy — the bytes Cloudflare parses — and axe is delivered same-origin rather
 *     than injected.
 *   · the five non-axe regression assertions of §12, each of which is a defect axe returned clean
 *     on. See `tests/a11y/regressions.mjs`.
 *
 * WHAT IT DOES NOT MEAN. axe cannot be asked to prove focus order, reading order, meaningful
 * live-region use, accessible-name quality, a keyboard trap in a custom combobox, whether a time
 * carries its airport code and zone, or whether the announced itinerary makes sense to a person
 * standing at a gate (§12). Those stay in the manual matrix in §10 and in `pnpm test:e2e`'s
 * keyboard walk. No screen reader is installed in this environment; the VoiceOver and NVDA passes
 * are Not run, and this command claims nothing about them.
 *
 * USAGE
 *   node tests/a11y/run-axe.mjs                 # the served build: 20 routes, 80 runs
 *   node tests/a11y/run-axe.mjs --conditional   # + a scratch build of /accessibility/ and
 *                                               #   /contact/: 2 routes, 8 runs → the published 88
 *   node tests/a11y/run-axe.mjs --seed-violation=<name>
 *                                               # prove a check fails when it should; see below
 *   node tests/a11y/run-axe.mjs --port=4521 --dist=<dir>
 */
import { writeFileSync } from 'node:fs'
import { resolve as resolvePath } from 'node:path'
import { startServer } from '../tools/serve-dist.mjs'
import { launchChromium } from '../tools/browser.mjs'
import { emittedRoutes, CONDITIONAL_ROUTES } from '../tools/routes.mjs'
import { sweep, summaryLine, AXE_VIEWPORT } from './axe-sweep.mjs'
import { buildConditionalRoutes } from './conditional-build.mjs'
import {
  checkReflow320,
  checkProgressBarStrings,
  checkTableRegions,
  checkBusyAndLiveRegions,
  checkLabelEchoes,
} from './regressions.mjs'

/* ---------------------------------------------------------------------------------------------- */
/* Arguments                                                                                       */
/* ---------------------------------------------------------------------------------------------- */

const argv = process.argv.slice(2)
/** @param {string} name @param {string} [fallback] */
const option = (name, fallback) => {
  const hit = argv.find((value) => value.startsWith(`--${name}=`))
  return hit === undefined ? fallback : hit.slice(name.length + 3)
}
const flag = (/** @type {string} */ name) => argv.includes(`--${name}`)

const PORT = Number(option('port', '4521'))
const DIST = option('dist')
const WITH_CONDITIONAL = flag('conditional')
const JSON_OUT = option('json')
/** `--routes=/,/404.html` narrows the sweep. Used by the seeded-violation self-tests, never by CI. */
const ONLY_ROUTES = option('routes')

/**
 * `--seed-violation=<name>` injects a synthetic defect into every page before it is measured, so a
 * run can prove the check it names actually fires. A check nobody has watched fail is a check that
 * may not be wired up at all — this is how the suite audits itself, and it is the only supported
 * way to make this command exit non-zero on a clean tree.
 *
 * @type {Record<string, string>}
 */
const SEEDS = {
  /* 1. 320 px reflow — a fixed-width block wider than the viewport. */
  reflow: `{ const d = document.createElement('div'); d.style.width = '900px'; d.style.height = '4px';
             d.setAttribute('data-seeded-violation', 'reflow'); document.body.append(d) }`,
  /* 2. progressbar — a meter whose label repeats its own reading. */
  progressbar: `{ const d = document.createElement('div'); d.setAttribute('role', 'progressbar');
             d.setAttribute('aria-label', 'Risk band'); d.setAttribute('aria-valuetext', 'Risk band, Watch');
             d.setAttribute('data-seeded-violation', 'progressbar'); document.body.append(d) }`,
  /* 3. table region — a bare table with an unscoped header. */
  table: `{ const t = document.createElement('table'); t.innerHTML = '<tr><th>Seeded</th></tr>';
             t.setAttribute('data-seeded-violation', 'table'); document.body.append(t) }`,
  /* 4. live region — the thing §12 item 4 forbids outright. */
  live: `{ const d = document.createElement('div'); d.setAttribute('aria-live', 'polite');
             d.setAttribute('data-seeded-violation', 'live'); document.body.append(d) }`,
  /* 5. label echo — the "Delayed Status" shape, inside a real definition list. */
  'label-echo': `{ const l = document.createElement('dl'); l.innerHTML = '<dt>Status</dt><dd><span>Delayed Status</span></dd>';
             l.setAttribute('data-seeded-violation', 'label-echo'); document.body.append(l) }`,
  /* axe itself — an image with no alternative text is a `critical` SC 1.1.1 failure. */
  axe: `{ const i = document.createElement('img'); i.src = '/icons/icon-192.png';
             i.setAttribute('data-seeded-violation', 'axe'); document.body.append(i) }`,
}
const SEED = option('seed-violation')
if (SEED !== undefined && !(SEED in SEEDS)) {
  console.error(`unknown --seed-violation=${SEED}. Known seeds: ${Object.keys(SEEDS).join(', ')}.`)
  process.exit(2)
}

/* ---------------------------------------------------------------------------------------------- */
/* The regression pass                                                                             */
/* ---------------------------------------------------------------------------------------------- */

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {string} origin
 * @param {string[]} routes
 * @returns {Promise<import('./regressions.mjs').Finding[]>}
 */
async function runRegressions(browser, origin, routes) {
  /** @type {import('./regressions.mjs').Finding[]} */
  const findings = []

  /* Reflow needs its own viewport; the rest read structure and are viewport-independent. */
  const narrow = await browser.newContext({ viewport: { width: 320, height: 720 } })
  const wide = await browser.newContext({ viewport: AXE_VIEWPORT })
  if (SEED !== undefined) {
    const script = SEEDS[SEED]
    await narrow.addInitScript(`window.addEventListener('load', () => ${script})`)
    await wide.addInitScript(`window.addEventListener('load', () => ${script})`)
  }

  const narrowPage = await narrow.newPage()
  const widePage = await wide.newPage()

  for (const route of routes) {
    await narrowPage.goto(origin + route, { waitUntil: 'networkidle' })
    findings.push(...(await checkReflow320(narrowPage, route)))

    await widePage.goto(origin + route, { waitUntil: 'networkidle' })
    findings.push(...(await checkProgressBarStrings(widePage, route)))
    findings.push(...(await checkTableRegions(widePage, route)))
    findings.push(...(await checkBusyAndLiveRegions(widePage, route)))
    findings.push(...(await checkLabelEchoes(widePage, route)))
  }

  await narrow.close()
  await wide.close()
  return findings
}

/* ---------------------------------------------------------------------------------------------- */
/* Main                                                                                            */
/* ---------------------------------------------------------------------------------------------- */

const started = Date.now()
const routes =
  ONLY_ROUTES === undefined
    ? emittedRoutes(DIST)
    : ONLY_ROUTES.split(',')
        .map((route) => route.trim())
        .filter(Boolean)

/*
 * A sweep over zero routes returns zero violations, which is the exact shape of a false green this
 * charter exists to prevent. It is also not hypothetical: `apps/web/dist` is rebuilt by other
 * agents, and a run that globs it mid-build finds nothing and reports success. Fail loudly instead.
 */
if (routes.length === 0) {
  console.error(
    `test:a11y found no emitted route under ${DIST ?? 'apps/web/dist'}. A sweep over zero routes ` +
      'reports zero violations, which would be a false green. Run `pnpm build` first, or point ' +
      '`--dist=<dir>` at a completed build. If another agent is rebuilding dist in place, snapshot ' +
      'it first and measure the snapshot.',
  )
  process.exit(2)
}

console.log(
  `test:a11y — docs/ACCESSIBILITY.md §12 over ${routes.length} emitted route(s), ` +
    `${routes.length * 4} axe run(s), under the build's own \`_headers\` policy.`,
)
if (SEED !== undefined) {
  console.log(`SEEDED VIOLATION: "${SEED}" is injected into every page. This run MUST fail.\n`)
}

const server = await startServer({ port: PORT, dist: DIST })
const browser = await launchChromium()

/** @type {{ label: string, result: Awaited<ReturnType<typeof sweep>> }[]} */
const sweeps = []
/** @type {import('./regressions.mjs').Finding[]} */
const regressionFindings = []
/** @type {(() => Promise<void>)[]} */
const teardown = []
let conditionalRuns = 0
/** @type {string | null} */
let conditionalSkipReason = null

try {
  console.log('axe — served build')
  const initScript = SEED === undefined ? undefined : SEEDS[SEED]
  sweeps.push({
    label: 'served',
    result: await sweep({ browser, origin: server.origin, routes, log: console.log, initScript }),
  })

  console.log('\nnon-axe regression assertions — §12 items 1–5')
  regressionFindings.push(...(await runRegressions(browser, server.origin, routes)))
  const byCheck = new Map()
  for (const finding of regressionFindings) {
    byCheck.set(finding.check, (byCheck.get(finding.check) ?? 0) + 1)
  }
  for (const name of [
    'reflow-320',
    'progressbar-three-strings',
    'table-region',
    'busy-and-live',
    'label-echo',
  ]) {
    const count = byCheck.get(name) ?? 0
    console.log(`  ${name.padEnd(28)} ${count === 0 ? 'clean' : `${count} finding(s)`}`)
  }

  if (WITH_CONDITIONAL) {
    console.log('\naxe — the two conditional routes (owner input I-3)')
    const { dist, cleanup } = await buildConditionalRoutes()
    const conditionalServer = await startServer({ port: PORT + 1, dist })
    teardown.push(conditionalServer.close)
    teardown.push(async () => {
      cleanup()
    })
    const result = await sweep({
      browser,
      origin: conditionalServer.origin,
      routes: CONDITIONAL_ROUTES,
      log: console.log,
      initScript,
    })
    sweeps.push({ label: 'conditional', result })
    conditionalRuns = result.runs
    const conditionalRegressions = await runRegressions(
      browser,
      conditionalServer.origin,
      CONDITIONAL_ROUTES,
    )
    regressionFindings.push(...conditionalRegressions)
  } else {
    conditionalSkipReason =
      '/accessibility/ and /contact/ are emitted only when PUBLIC_CONTACT_EMAIL is set ' +
      '(owner input I-3). Pass --conditional to build them into a scratch outDir with a ' +
      'reserved .invalid address and sweep them too.'
  }
} finally {
  await browser.close()
  for (const close of teardown) await close()
  await server.close()
}

/* ---------------------------------------------------------------------------------------------- */
/* Verdict                                                                                         */
/* ---------------------------------------------------------------------------------------------- */

console.log('')
for (const { result } of sweeps) console.log(summaryLine(result))

const totalRuns = sweeps.reduce((sum, entry) => sum + entry.result.runs, 0)
const violations = sweeps.reduce((sum, entry) => sum + entry.result.violations, 0)
const consoleErrors = sweeps.reduce((sum, entry) => sum + entry.result.consoleErrors, 0)
const bestPractice = sweeps.reduce((sum, entry) => sum + entry.result.bestPractice, 0)
const incomplete = sweeps.reduce((sum, entry) => sum + entry.result.incomplete, 0)

if (violations > 0 || consoleErrors > 0) {
  console.log('\nWCAG A/AA violations and console errors, in full:')
  for (const { result } of sweeps) {
    for (const row of result.rows) {
      for (const violation of row.violations) {
        console.log(
          `  ${row.route} ${row.colorScheme}/${row.reducedMotion}: ${violation.id} ` +
            `(${violation.impact}) × ${violation.nodes} — ${violation.targets.join(' | ')}`,
        )
      }
      for (const error of row.consoleErrors) {
        console.log(`  ${row.route} ${row.colorScheme}/${row.reducedMotion}: ${error}`)
      }
    }
  }
}

if (bestPractice > 0) {
  console.log('\nbest-practice — reported, NOT blocking:')
  const seen = new Map()
  for (const { result } of sweeps) {
    for (const row of result.rows) {
      for (const entry of row.bestPractice) {
        const key = `${row.route} ${entry.id}`
        seen.set(key, (seen.get(key) ?? 0) + 1)
      }
    }
  }
  for (const [key, count] of seen) console.log(`  ${key} × ${count} run(s)`)
}

if (incomplete > 0) {
  console.log(
    `\n${incomplete} incomplete result(s) — reported, not waived. ` +
      'docs/ACCESSIBILITY.md §15.9 resolves the known `color-contrast` set by pixel diff behind ' +
      'the z-index:-1 motif layer; a change in this number is a finding, not noise.',
  )
  const seen = new Map()
  for (const { result } of sweeps) {
    for (const row of result.rows) {
      for (const entry of row.incomplete) {
        seen.set(`${row.route} ${entry.id}`, (seen.get(`${row.route} ${entry.id}`) ?? 0) + 1)
      }
    }
  }
  for (const [key, count] of seen) console.log(`  ${key} × ${count} run(s)`)
}

if (regressionFindings.length > 0) {
  console.log('\nnon-axe regression findings — each is a release-blocking defect:')
  for (const finding of regressionFindings) {
    console.log(`  [${finding.check}] ${finding.route}: ${finding.detail}`)
  }
}

if (conditionalSkipReason !== null) {
  console.log(`\nNot run: the 8 conditional runs. ${conditionalSkipReason}`)
}

if (JSON_OUT !== undefined) {
  /* Relative to the caller's cwd, so `--json=/tmp/…` writes to a scratch path, not the repo. */
  writeFileSync(
    resolvePath(process.cwd(), JSON_OUT),
    JSON.stringify({ sweeps, regressionFindings }, null, 2),
  )
}

const failures = violations + consoleErrors + regressionFindings.length
console.log(
  `\n${totalRuns} axe run(s)${conditionalRuns > 0 ? ` (${conditionalRuns} conditional)` : ''}, ` +
    `${routes.length * 5}${conditionalRuns > 0 ? ` + ${CONDITIONAL_ROUTES.length * 5}` : ''} ` +
    `regression assertion(s), ${Math.round((Date.now() - started) / 1000)}s. ` +
    (failures === 0
      ? 'Passing — 0 violations at any impact, 0 console errors, 0 regression findings.'
      : `Failing — ${violations} violation(s), ${consoleErrors} console error(s), ` +
        `${regressionFindings.length} regression finding(s).`),
)
process.exit(failures === 0 ? 0 : 1)
