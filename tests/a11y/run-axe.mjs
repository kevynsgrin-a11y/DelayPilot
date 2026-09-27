#!/usr/bin/env node
/**
 * `pnpm test:a11y` — the executable half of `docs/ACCESSIBILITY.md §12`.
 *
 * Owner: qa-test-architect. Assertions specified by `accessibility-lead`.
 *
 * WHAT THIS COMMAND MEANS WHEN IT EXITS ZERO
 *
 *   · axe-core 4.13.0, tags wcag2a · wcag2aa · wcag21a · wcag21aa · wcag22aa, at 1440 × 900,
 *     over every route the build emits, four times each — {light, dark} × {no-preference, reduce}.
 *     ZERO violations at any impact, `minor` included. No rule disabled.
 *   · the same four runs over each `§17` state that is hidden until a reader interacts, WITH THE
 *     STATE ON SCREEN and driven through the island's own handler (§12 item 8, `states.mjs`).
 *   · `best-practice` run separately and REPORTED. It does not gate; F13 and F14 live there.
 *   · `incomplete` results counted, classified by their axe message, printed with the disposition
 *     §16.4 measured for that class, and never waived. An undispositioned class fails the run.
 *   · every run returned HTTP 200, and the emitted route set still contains every route the
 *     recorded baseline lists (§12 item 9).
 *   · every check reports the population it examined, and a population that was non-zero in the
 *     baseline and is zero now fails the run (§12 item 7) — `clean` and "nothing matched" are no
 *     longer the same line of output.
 *   · zero console errors and zero CSP refusals, because the page is served under the build's own
 *     `_headers` policy — the bytes Cloudflare parses — and axe is delivered same-origin rather
 *     than injected.
 *   · the six non-axe regression assertions of §12, each of which is a defect axe returned clean
 *     on. See `tests/a11y/regressions.mjs`.
 *
 * WHAT IT DOES NOT MEAN, AND THIS LIST IS THE POINT OF THE SECTION. axe cannot be asked to prove
 * focus order, reading order, meaningful live-region use, accessible-name quality, a keyboard trap
 * in a custom combobox, whether a time carries its airport code and zone, or whether the announced
 * itinerary makes sense to a person standing at a gate (§12). Those stay in the manual matrix in
 * §10 and in `pnpm test:e2e`'s keyboard walk. No screen reader is installed in this environment;
 * the VoiceOver and NVDA passes are Not run, and this command claims nothing about them. §12's
 * route clause is satisfied only for the routes this tree EMITS: the `§18.2` private routes and the
 * unbuilt `§18.1` families are not covered by anything here. `docs/TESTING.md §3` names every
 * clause this command executes and every one it does not.
 *
 * USAGE
 *   node tests/a11y/run-axe.mjs                 # the served build: 20 routes + 3 states, 92 runs
 *   node tests/a11y/run-axe.mjs --conditional   # + a scratch build of /accessibility/ and
 *                                               #   /contact/: 2 routes, 8 runs → 100
 *   node tests/a11y/run-axe.mjs --seed-violation=<name>
 *                                               # prove a check fails when it should; see below
 *   node tests/a11y/run-axe.mjs --port=4521 --dist=<dir>
 *   node tests/a11y/run-axe.mjs --record-baseline
 *                                               # rewrite tests/a11y/baseline.json — a deliberate
 *                                               #   act, never a way to clear a red run
 */
import { writeFileSync } from 'node:fs'
import { resolve as resolvePath } from 'node:path'
import { stubAnalytics } from '../tools/analytics-stub.mjs'
import { startServer } from '../tools/serve-dist.mjs'
import { launchChromium } from '../tools/browser.mjs'
import { emittedRoutes, CONDITIONAL_ROUTES } from '../tools/routes.mjs'
import { sweep, summaryLine, totals, AXE_VIEWPORT } from './axe-sweep.mjs'
import { sweepStates } from './states.mjs'
import { buildConditionalRoutes } from './conditional-build.mjs'
import { dispositionFor } from './incomplete.mjs'
import {
  BASELINE_PATH,
  loadBaseline,
  writeBaseline,
  compareRouteSet,
  comparePopulations,
  compareIncomplete,
  foldIncomplete,
} from './coverage.mjs'
import {
  POPULATION_COLUMNS,
  checkReflow320,
  checkProgressBarStrings,
  checkTableRegions,
  checkBusyAndLiveRegions,
  checkLabelEchoes,
  checkHiddenMeansHidden,
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
const RECORD = flag('record-baseline')
const JSON_OUT = option('json')
/** `--routes=/,/404.html` narrows the sweep. Used by the seeded-violation self-tests, never by CI. */
const ONLY_ROUTES = option('routes')

/**
 * `--seed-violation=<name>` injects a synthetic defect into every page before it is measured, so a
 * run can prove the check it names actually fires. A check nobody has watched fail is a check that
 * may not be wired up at all — this is how the suite audits itself, and it is the only supported
 * way to make this command exit non-zero on a clean tree.
 *
 * The three checks added in S5 are NOT here, and deliberately: F43, F44, F45, F46, F49 and F50 are
 * all defects of the BUILD or of the coverage, not of a page's markup, so an init script cannot
 * express them. Their proofs are seeded into the bytes of a scratch `dist` instead — the method
 * `docs/ACCESSIBILITY.md §16.2` used — and they are recorded in `docs/TESTING.md §7` with the
 * exact command, the old behaviour and the new one.
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
  /* 2b. progressbar — the announcement and the visible readout disagree (F48). */
  'progressbar-readout': `{ const d = document.createElement('div'); d.setAttribute('role', 'progressbar');
             d.setAttribute('aria-label', 'Connection slack used'); d.setAttribute('aria-valuetext', '18 of 45 minutes, Watch');
             d.innerHTML = '<p class="dp-progress__readout"><span class="dp-progress__value">31 of 45 minutes</span><span class="dp-progress__band">Safe</span></p>';
             d.setAttribute('data-seeded-violation', 'progressbar-readout'); document.body.append(d) }`,
  /* 3. table region — a bare table with an unscoped header. */
  table: `{ const t = document.createElement('table'); t.innerHTML = '<tr><th>Seeded</th></tr>';
             t.setAttribute('data-seeded-violation', 'table'); document.body.append(t) }`,
  /* 4. live region — the thing §12 item 4 forbids outright. */
  live: `{ const d = document.createElement('div'); d.setAttribute('aria-live', 'polite');
             d.setAttribute('data-seeded-violation', 'live'); document.body.append(d) }`,
  /* 4b. aria-busy on a visible element of a page that is not loading — F28, F43's shape. */
  busy: `{ const d = document.createElement('div'); d.setAttribute('aria-busy', 'true');
             d.setAttribute('hidden', ''); d.style.setProperty('display', 'block', 'important');
             d.textContent = 'Looking up this flight.';
             d.setAttribute('data-seeded-violation', 'busy'); document.body.append(d) }`,
  /*
   * 5. label echo — the "Delayed Status" shape, inside a real definition list.
   *
   * The value is a STATUS PILL, not a bare `<span>`, because that is what F29 and F39 both were:
   * a pill whose accessible NAME read "Delayed Status". The seed used to be an unnamed span, and
   * it fired only because the row pass at the time matched any descendant — the same over-broad
   * traversal that, on the product's own `<div class="dpp-row">` rows, matched nothing at all
   * (F-QA-2). A seed has to be the defect, or the proof it gives is about the seed.
   */
  'label-echo': `{ const l = document.createElement('dl');
             l.innerHTML = '<dt>Status</dt><dd><span class="dp-status-pill">Delayed Status</span></dd>';
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
if (RECORD && (SEED !== undefined || ONLY_ROUTES !== undefined)) {
  console.error(
    '--record-baseline refuses a seeded or narrowed run. A baseline recorded from either one ' +
      'would write a defect, or a fraction of the route set, in as the expectation.',
  )
  process.exit(2)
}

/* ---------------------------------------------------------------------------------------------- */
/* The regression pass                                                                             */
/* ---------------------------------------------------------------------------------------------- */

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {string} origin
 * @param {string[]} routes
 * @returns {Promise<{
 *   findings: import('./regressions.mjs').Finding[],
 *   populations: Record<string, Record<string, number>>,
 *   notes: string[],
 *   assertions: number,
 * }>}
 */
async function runRegressions(browser, origin, routes) {
  /** @type {import('./regressions.mjs').Finding[]} */
  const findings = []
  /** @type {Record<string, Record<string, number>>} */
  const populations = {}
  /** @type {string[]} */
  const notes = []
  let assertions = 0

  /* Reflow needs its own viewport; the rest read structure and are viewport-independent. */
  const narrow = await browser.newContext({ viewport: { width: 320, height: 720 } })
  const wide = await browser.newContext({ viewport: AXE_VIEWPORT })
  await stubAnalytics(narrow)
  await stubAnalytics(wide)
  if (SEED !== undefined) {
    const script = SEEDS[SEED]
    await narrow.addInitScript(`window.addEventListener('load', () => ${script})`)
    await wide.addInitScript(`window.addEventListener('load', () => ${script})`)
  }

  const narrowPage = await narrow.newPage()
  const widePage = await wide.newPage()

  for (const route of routes) {
    await narrowPage.goto(origin + route, { waitUntil: 'networkidle' })
    await widePage.goto(origin + route, { waitUntil: 'networkidle' })

    /** @type {Record<string, number>} */
    const routePopulations = {}
    for (const result of [
      await checkReflow320(narrowPage, route),
      await checkProgressBarStrings(widePage, route),
      await checkTableRegions(widePage, route),
      await checkBusyAndLiveRegions(widePage, route),
      await checkLabelEchoes(widePage, route),
      await checkHiddenMeansHidden(widePage, route),
    ]) {
      findings.push(...result.findings)
      Object.assign(routePopulations, result.populations)
      for (const note of result.notes ?? []) notes.push(`${route}: ${note}`)
      assertions += 1
    }
    populations[route] = routePopulations
  }

  await narrow.close()
  await wide.close()
  return { findings, populations, notes, assertions }
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

const baseline = loadBaseline()

console.log(
  `test:a11y — docs/ACCESSIBILITY.md §12 over ${routes.length} emitted route(s), ` +
    `${routes.length * 4} axe run(s), under the build's own \`_headers\` policy.`,
)
if (SEED !== undefined) {
  console.log(`SEEDED VIOLATION: "${SEED}" is injected into every page. This run MUST fail.\n`)
}

/** @type {import('./regressions.mjs').Finding[]} */
const coverageFindings = []
/** @type {string[]} */
const coverageNotes = []

/* §12 item 9 — the route set, asserted rather than merely derived (F49). */
if (ONLY_ROUTES === undefined) {
  const routeSet = compareRouteSet(baseline.routes, routes)
  coverageFindings.push(...routeSet.findings)
  if (routeSet.added.length > 0) {
    coverageNotes.push(
      `${routeSet.added.length} route(s) this build emits are not in the recorded baseline and ` +
        `were swept anyway: ${routeSet.added.join(', ')}. A new route joins the sweep on the ` +
        'build that emits it; record the baseline when it is meant to stay.',
    )
  }
} else {
  coverageNotes.push(
    'Not run: the route-set assertion (§12 item 9). --routes narrows the sweep deliberately, so ' +
      'the emitted set is not the set under test.',
  )
}

const server = await startServer({ port: PORT, dist: DIST })
const browser = await launchChromium()

/** @type {{ label: string, result: Awaited<ReturnType<typeof sweep>> }[]} */
const sweeps = []
/** @type {import('./regressions.mjs').Finding[]} */
const regressionFindings = []
/** @type {Record<string, Record<string, number>>} */
const populations = {}
/** @type {string[]} */
const reportedNotes = []
/** @type {(() => Promise<void>)[]} */
const teardown = []
let conditionalRuns = 0
let stateRuns = 0
let assertionCount = 0
/** @type {string | null} */
let conditionalSkipReason = null

try {
  console.log('axe — served build')
  const initScript = SEED === undefined ? undefined : SEEDS[SEED]
  sweeps.push({
    label: 'served',
    result: await sweep({ browser, origin: server.origin, routes, log: console.log, initScript }),
  })

  console.log('\naxe — the §17 states that are hidden until a reader interacts (§12 item 8)')
  const states = await sweepStates({
    browser,
    origin: server.origin,
    routes,
    log: console.log,
    initScript,
  })
  if (states.rows.length > 0) {
    sweeps.push({
      label: 'states',
      result: {
        axeVersion: sweeps[0].result.axeVersion,
        ...totals(states.rows),
        rows: states.rows,
      },
    })
    stateRuns = states.rows.length
  }
  regressionFindings.push(...states.findings)
  Object.assign(populations, states.populations)
  reportedNotes.push(...states.notes)
  assertionCount += Object.keys(states.populations).length * 5
  for (const skip of states.skipped) coverageNotes.push(`Not run: the state sweep for ${skip}.`)

  console.log('\nnon-axe regression assertions — §12 items 1–6')
  const regressions = await runRegressions(browser, server.origin, routes)
  regressionFindings.push(...regressions.findings)
  Object.assign(populations, regressions.populations)
  reportedNotes.push(...regressions.notes)
  assertionCount += regressions.assertions

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
    regressionFindings.push(...conditionalRegressions.findings)
    Object.assign(populations, conditionalRegressions.populations)
    reportedNotes.push(...conditionalRegressions.notes)
    assertionCount += conditionalRegressions.assertions
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
for (const { label, result } of sweeps) console.log(`${label.padEnd(12)} ${summaryLine(result)}`)

const allRows = sweeps.flatMap((entry) => entry.result.rows)
const totalRuns = sweeps.reduce((sum, entry) => sum + entry.result.runs, 0)
const violations = sweeps.reduce((sum, entry) => sum + entry.result.violations, 0)
const consoleErrors = sweeps.reduce((sum, entry) => sum + entry.result.consoleErrors, 0)
const bestPractice = sweeps.reduce((sum, entry) => sum + entry.result.bestPractice, 0)
const incomplete = sweeps.reduce((sum, entry) => sum + entry.result.incomplete, 0)

/* §12 item 9 — the status was collected and never read (F50). */
for (const row of allRows) {
  if (row.status !== 200) {
    coverageFindings.push({
      check: 'http-status',
      route: row.route,
      detail:
        `${row.colorScheme}/${row.reducedMotion} returned HTTP ${row.status}. axe measured ` +
        'whatever the server sent instead — on this server a 404 body, on a host with a 200 ' +
        "fallback the soft-404 page — and reported it under this route's name.",
    })
  }
}

if (violations > 0 || consoleErrors > 0) {
  console.log('\nWCAG A/AA violations and console errors, in full:')
  for (const row of allRows) {
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

if (bestPractice > 0) {
  console.log('\nbest-practice — reported, NOT blocking:')
  const seen = new Map()
  for (const row of allRows) {
    for (const entry of row.bestPractice) {
      const key = `${row.route} ${entry.id}`
      seen.set(key, (seen.get(key) ?? 0) + 1)
    }
  }
  for (const [key, count] of seen) console.log(`  ${key} × ${count} run(s)`)
}

/* ---------------------------------------------------------------------------------------------- */
/* `incomplete` — classified, counted, dispositioned per class (F47)                               */
/* ---------------------------------------------------------------------------------------------- */

const folded = foldIncomplete(allRows)
if (incomplete > 0) {
  console.log(
    `\n${incomplete} incomplete result(s) across ${totalRuns} run(s) — reported, never waived. ` +
      'axe returns `incomplete` when it cannot resolve a background, so each one is a rule that ' +
      'has stopped gating on those nodes; the count below is NODES PER RUN, which is the ' +
      'granularity a change actually shows up in (docs/ACCESSIBILITY.md §16.4, F47).',
  )
  /** @type {Map<string, number>} */
  const byClass = new Map()
  for (const [route, rules] of Object.entries(folded.counts)) {
    for (const [rule, classes] of Object.entries(rules)) {
      const parts = Object.entries(classes)
        .map(([id, nodes]) => `${id}=${nodes}`)
        .join(' ')
      console.log(`  ${route.padEnd(24)} ${rule.padEnd(16)} ${parts}`)
      for (const [id, nodes] of Object.entries(classes)) {
        byClass.set(id, (byClass.get(id) ?? 0) + nodes)
      }
    }
  }
  console.log('  disposition per class, per docs/ACCESSIBILITY.md §16.4:')
  for (const [id, nodes] of byClass) {
    console.log(`    ${id} — ${nodes} node(s) per run. ${dispositionFor(id)}`)
  }
  for (const divergence of folded.divergences) {
    console.log(`  context divergence: ${divergence}`)
  }

  /*
   * A STANDING NOTE, printed every run while it is true. §16.4 measured the incomplete nodes of the
   * SERVED routes from pixels. The `§17` state surfaces were outside every run until §12 item 8
   * landed, so any node a state exposes beyond its own route's count is a contrast question nobody
   * has answered yet. Recording the count in `baseline.json` stops it being NEW next run, which
   * would quietly retire the question — so it is re-derived here instead of being remembered.
   */
  for (const [key, rules] of Object.entries(folded.counts)) {
    const split = key.indexOf(' [')
    if (split === -1) continue
    const base = folded.counts[key.slice(0, split)] ?? {}
    for (const [rule, classes] of Object.entries(rules)) {
      for (const [id, nodes] of Object.entries(classes)) {
        const onRoute = base[rule]?.[id] ?? 0
        if (nodes > onRoute) {
          console.log(
            `  ${key} ${rule}/${id}: ${nodes - onRoute} node(s) MORE than the served route ` +
              `(${onRoute} → ${nodes}). docs/ACCESSIBILITY.md §16.4 measured the served routes ` +
              'only; these nodes have never been measured from pixels. Open re-measurement ' +
              'request for accessibility-lead — not a waiver, and not blocking here.',
          )
        }
      }
    }
  }
}

const incompleteComparison = compareIncomplete(baseline.incomplete, folded.counts)
coverageFindings.push(...incompleteComparison.findings)

/* ---------------------------------------------------------------------------------------------- */
/* Populations — §12 item 7 (F46)                                                                  */
/* ---------------------------------------------------------------------------------------------- */

console.log(
  '\npopulation examined, per check per route — §12 item 7. A check that matched nothing may ' +
    'not print the same word as a check that passed.',
)
/*
 * A population this surface did not report at all prints `·`, not `0`. They are different facts —
 * "the check did not run here" against "the check ran and found nothing" — and collapsing them
 * would be the F46 shape inside F46's own fix. Reflow needs a 320 px context, so it is `·` on the
 * state rows; `state-el` is `·` on every ordinary route.
 */
const cell = (/** @type {Record<string, number>} */ row, /** @type {string} */ key) =>
  row[key] === undefined ? '·' : String(row[key])
const columnWidth = (/** @type {{ key: string, label: string }} */ column) =>
  Math.max(
    column.label.length,
    ...Object.values(populations).map((row) => cell(row, column.key).length),
  )
const widths = POPULATION_COLUMNS.map(columnWidth)
const routeWidth = Math.max(24, ...Object.keys(populations).map((key) => key.length))
console.log(
  `  ${'route'.padEnd(routeWidth)} ` +
    POPULATION_COLUMNS.map((column, index) => column.label.padStart(widths[index])).join(' '),
)
for (const [route, row] of Object.entries(populations)) {
  console.log(
    `  ${route.padEnd(routeWidth)} ` +
      POPULATION_COLUMNS.map((column, index) => cell(row, column.key).padStart(widths[index])).join(
        ' ',
      ),
  )
}
const populationTotals = Object.fromEntries(
  POPULATION_COLUMNS.map((column) => [
    column.key,
    Object.values(populations).reduce((sum, row) => sum + (row[column.key] ?? 0), 0),
  ]),
)
console.log(
  `  ${'TOTAL'.padEnd(routeWidth)} ` +
    POPULATION_COLUMNS.map((column, index) =>
      String(populationTotals[column.key]).padStart(widths[index]),
    ).join(' '),
)

/*
 * The loudest line in this section. A population that is zero on EVERY surface in the run is a
 * check that cannot fail here at all, which is not a pass and must not read like one (§12 item 7).
 * `live-candidate` is excluded because its zero IS the assertion.
 */
const inert = POPULATION_COLUMNS.filter(
  (column) =>
    column.zeroIsTheResult !== true &&
    Object.values(populations).every((row) => (row[column.key] ?? 0) === 0),
)
if (inert.length > 0) {
  console.log(
    `  ${inert.length} check population(s) are ZERO on every surface in this run, so those ` +
      'assertions cannot fail here. This is not a pass:',
  )
  for (const column of inert) {
    console.log(
      `    ${column.check} / ${column.key} — 0 across ${Object.keys(populations).length} surface(s)`,
    )
  }
}

const populationComparison = comparePopulations(
  baseline.populations,
  populations,
  POPULATION_COLUMNS,
)
coverageFindings.push(...populationComparison.findings)
if (populationComparison.unrecorded.length > 0) {
  coverageNotes.push(
    `${populationComparison.unrecorded.length} surface(s) have no recorded population and are ` +
      `therefore held to no floor: ${populationComparison.unrecorded.join(', ')}.`,
  )
}

/* ---------------------------------------------------------------------------------------------- */
/* Findings                                                                                        */
/* ---------------------------------------------------------------------------------------------- */

/** @type {Record<string, number>} */
const byCheck = {}
for (const finding of [...regressionFindings, ...coverageFindings]) {
  byCheck[finding.check] = (byCheck[finding.check] ?? 0) + 1
}
console.log('')
/*
 * THE LINE F46 IS ABOUT. `progressbar-three-strings    clean` said nothing about whether it looked
 * at 6 meters or at none, so every summary carries its own population now: the word `clean` and the
 * size of what produced it, on the same line.
 */
const surfaces = Object.keys(populations).length
/** @type {Map<string, string[]>} */
const keysByCheck = new Map()
for (const column of POPULATION_COLUMNS) {
  keysByCheck.set(column.check, [...(keysByCheck.get(column.check) ?? []), column.key])
}
for (const name of [
  'reflow-320',
  'progressbar-three-strings',
  'table-region',
  'busy-and-live',
  'label-echo',
  'hidden-means-hidden',
  'state-fixture',
  'route-set',
  'http-status',
  'population-floor',
  'incomplete-class',
]) {
  const count = byCheck[name] ?? 0
  const keys = keysByCheck.get(name)
  let coverage = ''
  if (keys !== undefined) {
    const sums = Object.values(populations).map((row) =>
      keys.reduce((total, key) => total + (row[key] ?? 0), 0),
    )
    const examined = sums.filter((sum) => sum > 0).length
    coverage =
      ` over ${sums.reduce((total, sum) => total + sum, 0)} element(s) on ` +
      `${examined}/${surfaces} surface(s)`
  }
  console.log(`  ${name.padEnd(28)} ${count === 0 ? 'clean' : `${count} finding(s)`}${coverage}`)
}

if (regressionFindings.length > 0) {
  console.log('\nnon-axe regression findings — each is a release-blocking defect:')
  for (const finding of regressionFindings) {
    console.log(`  [${finding.check}] ${finding.route}: ${finding.detail}`)
  }
}

if (coverageFindings.length > 0) {
  console.log('\ncoverage findings — the gate measured less than it claims to:')
  for (const finding of coverageFindings) {
    console.log(`  [${finding.check}] ${finding.route}: ${finding.detail}`)
  }
}

if (incompleteComparison.reviews.length > 0) {
  console.log(
    '\nincomplete node populations moved — NOT blocking, and a re-measurement request for ' +
      'accessibility-lead (see tests/a11y/incomplete.mjs for why this is not a failure):',
  )
  for (const review of incompleteComparison.reviews) console.log(`  ${review}`)
}

if (reportedNotes.length > 0) {
  console.log(
    `\n${reportedNotes.length} observation(s) reported and NOT gated on — measured, and a ruling ` +
      'for accessibility-lead / ux-copy-steward rather than a failure this suite decided alone:',
  )
  for (const note of reportedNotes) console.log(`  ${note}`)
}

for (const note of coverageNotes) console.log(`\n${note}`)
if (conditionalSkipReason !== null) {
  console.log(`\nNot run: the 8 conditional runs. ${conditionalSkipReason}`)
}

if (JSON_OUT !== undefined) {
  /* Relative to the caller's cwd, so `--json=/tmp/…` writes to a scratch path, not the repo. */
  writeFileSync(
    resolvePath(process.cwd(), JSON_OUT),
    JSON.stringify({ sweeps, regressionFindings, coverageFindings, populations }, null, 2),
  )
}

const failures = violations + consoleErrors + regressionFindings.length + coverageFindings.length

if (RECORD) {
  if (failures > 0) {
    console.error(
      '\n--record-baseline refuses to write from a failing run. Fix the findings first; a ' +
        'baseline is a record of a state someone decided was correct, not a way to clear red.',
    )
    process.exit(2)
  }
  writeBaseline({
    recordedAt: new Date().toISOString().slice(0, 10),
    recordedFrom: `${DIST ?? 'apps/web/dist'}, ${routes.length} emitted route(s), axe-core ${sweeps[0].result.axeVersion ?? '?'}`,
    routes,
    populations,
    incomplete: folded.counts,
  })
  console.log(`\nbaseline recorded: ${BASELINE_PATH}`)
}

console.log(
  `\n${totalRuns} axe run(s) (${routes.length * 4} route` +
    `${stateRuns > 0 ? ` + ${stateRuns} state` : ''}` +
    `${conditionalRuns > 0 ? ` + ${conditionalRuns} conditional` : ''}), ` +
    `${assertionCount} regression assertion(s), ${Math.round((Date.now() - started) / 1000)}s. ` +
    (failures === 0
      ? 'Passing — 0 violations at any impact, 0 console errors, 0 regression findings, ' +
        '0 coverage findings.'
      : `Failing — ${violations} violation(s), ${consoleErrors} console error(s), ` +
        `${regressionFindings.length} regression finding(s), ` +
        `${coverageFindings.length} coverage finding(s).`),
)
process.exit(failures === 0 ? 0 : 1)
