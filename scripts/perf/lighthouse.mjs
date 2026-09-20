#!/usr/bin/env node
/**
 * lighthouse.mjs — the Lighthouse gate.
 *
 * Runs Lighthouse 13 against a locally served build and asserts the category thresholds and the
 * Core Web Vitals lab metrics declared in `perf.budgets.json → lighthouse`. Exits non-zero naming
 * the route, the metric, the measured value, the gate, and the owning agent.
 *
 *   node scripts/perf/lighthouse.mjs                       the gate
 *   node scripts/perf/lighthouse.mjs --report              measure and print, assert nothing
 *   node scripts/perf/lighthouse.mjs --routes all          every route in the build, not the six
 *   node scripts/perf/lighthouse.mjs --routes /,/about/    an explicit list
 *   node scripts/perf/lighthouse.mjs --compress none       the no-compression worst case
 *   node scripts/perf/lighthouse.mjs --runs 5              more samples (default from the manifest)
 *   node scripts/perf/lighthouse.mjs --form-factor desktop 1440x900, DIRECTIVE §18.7's widest
 *   node scripts/perf/lighthouse.mjs --dist <dir>          measure a build other than apps/web/dist
 *   node scripts/perf/lighthouse.mjs --out <file>          JSON report (default lighthouse-report.json)
 *   node scripts/perf/lighthouse.mjs --budgets <file>      assert against a different manifest —
 *                                                          how the gate is proven to fail
 *
 * HOW CHROMIUM IS LAUNCHED, AND WHY NOT `chrome-launcher`
 * -------------------------------------------------------
 * `chrome-launcher` is a transitive dependency of `lighthouse`, not a root dependency, so a
 * root-level script cannot import it under pnpm's strict linking. Chromium is launched through
 * `@playwright/test` — pinned to 1.56.1 because playwright-core 1.56.1 declares chromium revision
 * 1194 and `/opt/pw-browsers/chromium-1194` is the browser this environment has (the reasoning is
 * recorded in `docs/BUILD_PLAN.md §10`, "S4 opened") — with `--remote-debugging-port`, and that
 * port is handed to the Lighthouse Node API. `playwright install` is never run here.
 *
 * WHAT IS SERVED
 * --------------
 * `scripts/perf/serve-dist.mjs`, which applies the `/*` block of `apps/web/public/_headers` to
 * every response. Measuring without the real Content-Security-Policy measures a site we do not
 * ship. The server is started and stopped by this script, so the gate is one command.
 *
 * WHAT LIGHTHOUSE DOES NOT MEASURE
 * --------------------------------
 * INP. A Lighthouse load run never interacts with the page, so it reports no INP; Total Blocking
 * Time is the lab proxy and is gated here. Real interaction latency is measured separately by
 * `scripts/perf/interaction-latency.mjs`, and the field INP that `DIRECTIVE §22` targets needs the
 * Core Web Vitals beacon that `platform-release-sre` owns. Reporting a Lighthouse run as an INP
 * measurement would be reporting a number that was not taken.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'
import { startDistServer } from './serve-dist.mjs'
import { measureDist } from './lib/measure-dist.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..', '..')
const BUDGET_FILE = join(REPO, 'perf.budgets.json')

/**
 * Emulation conditions. Widths are DIRECTIVE §18.7 breakpoints: 375 is the narrowest the design
 * system supports and the one a traveler standing at a gate is actually holding; 1440 is the
 * widest. Throttling is Lighthouse's own simulated Slow 4G with a 4x CPU slowdown, which is the
 * condition `.claude/agents/performance-engineer.md:156` names.
 */
const FORM_FACTORS = {
  mobile: {
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      disabled: false,
    },
  },
  desktop: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttling: {
      rttMs: 40,
      throughputKbps: 10 * 1024,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0,
    },
  },
}

function parseArgs(argv) {
  const out = {
    report: false,
    routes: null,
    compress: null,
    runs: null,
    formFactor: 'mobile',
    dist: null,
    out: join(REPO, 'lighthouse-report.json'),
    port: 4620,
    debugPort: 9620,
    budgets: BUDGET_FILE,
  }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = () => argv[(i += 1)]
    if (arg === '--report') out.report = true
    else if (arg === '--routes') out.routes = next()
    else if (arg === '--compress') out.compress = next()
    else if (arg === '--runs') out.runs = Number(next())
    else if (arg === '--form-factor') out.formFactor = next()
    else if (arg === '--dist') out.dist = next()
    else if (arg === '--out') out.out = next()
    else if (arg === '--port') out.port = Number(next())
    else if (arg === '--debug-port') out.debugPort = Number(next())
    else if (arg === '--budgets') out.budgets = next()
    else {
      console.error(`lighthouse: unknown option ${arg}`)
      process.exit(2)
    }
  }
  if (!FORM_FACTORS[out.formFactor]) {
    console.error(`lighthouse: --form-factor must be mobile or desktop, got "${out.formFactor}"`)
    process.exit(2)
  }
  return out
}

function globToRegExp(glob) {
  let source = '^'
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob[i]
    if (char === '*') {
      if (glob[i + 1] === '*') {
        source += '.*'
        i += 1
      } else source += '[^/]*'
    } else if ('\\^$.|?+()[]{}'.includes(char)) source += '\\' + char
    else source += char
  }
  return new RegExp(source + '$')
}

function classify(route, routeClasses) {
  for (const [name, spec] of Object.entries(routeClasses)) {
    for (const pattern of spec.match) if (globToRegExp(pattern).test(route)) return name
  }
  return null
}

const round = (value, places = 0) => {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

/**
 * The audits inside a category that actually scored below 1. A category score is a weighted
 * average, so "seo 63" says nothing about what is wrong; the audit list does. It is also what lets
 * a deliberately `noindex` route be gated honestly: the route cannot score 100 because
 * `is-crawlable` fails by design, and the useful assertion is that nothing ELSE fails.
 */
function failingAudits(lhr, categoryId) {
  const category = lhr.categories[categoryId]
  if (!category) return []
  return category.auditRefs
    .filter((ref) => {
      const audit = lhr.audits[ref.id]
      return audit && audit.score !== null && audit.score < 1 && (ref.weight ?? 0) > 0
    })
    .map((ref) => ({ id: ref.id, weight: ref.weight, score: lhr.audits[ref.id].score }))
}

/** Pull the numbers this gate cares about out of one Lighthouse result. */
function extract(lhr) {
  const audit = (id) => lhr.audits[id]
  const numeric = (id) => audit(id)?.numericValue ?? null
  const network = (audit('network-requests')?.details?.items ?? []).filter(
    // Lighthouse injects a `data:` probe image of its own. No file in `apps/web/dist` contains a
    // `data:` URI — apps/web/scripts/verify-dist.mjs fails the build on one — so anything with a
    // `data:` URL is the tool's, not the site's, and counting it would attribute Lighthouse's
    // bytes to DelayPilot.
    (item) => !String(item.url).startsWith('data:'),
  )
  return {
    scores: {
      performance: round((lhr.categories.performance?.score ?? 0) * 100),
      accessibility: round((lhr.categories.accessibility?.score ?? 0) * 100),
      bestPractices: round((lhr.categories['best-practices']?.score ?? 0) * 100),
      seo: round((lhr.categories.seo?.score ?? 0) * 100),
      agenticBrowsing:
        lhr.categories['agentic-browsing'] == null
          ? null
          : round(lhr.categories['agentic-browsing'].score * 100),
    },
    metrics: {
      lcpMs: round(numeric('largest-contentful-paint')),
      fcpMs: round(numeric('first-contentful-paint')),
      speedIndexMs: round(numeric('speed-index')),
      tbtMs: round(numeric('total-blocking-time')),
      clsScore: round(numeric('cumulative-layout-shift'), 4),
      ttiMs: round(numeric('interactive')),
      maxPotentialFidMs: round(numeric('max-potential-fid')),
    },
    failingAudits: {
      performance: failingAudits(lhr, 'performance'),
      accessibility: failingAudits(lhr, 'accessibility'),
      bestPractices: failingAudits(lhr, 'best-practices'),
      seo: failingAudits(lhr, 'seo'),
    },
    network: {
      requestCount: network.length,
      transferBytes: network.reduce((total, item) => total + (item.transferSize ?? 0), 0),
      resourceBytes: network.reduce((total, item) => total + (item.resourceSize ?? 0), 0),
      items: network.map((item) => ({
        url: item.url,
        resourceType: item.resourceType,
        priority: item.priority,
        transferSize: item.transferSize,
        resourceSize: item.resourceSize,
        mimeType: item.mimeType,
      })),
    },
    diagnostics: Object.fromEntries(
      [
        'unsized-images',
        'cache-insight',
        'render-blocking-insight',
        'font-display-insight',
        'cls-culprits-insight',
        'lcp-breakdown-insight',
        'network-dependency-tree-insight',
        'legacy-javascript-insight',
        'duplicated-javascript-insight',
        'third-parties-insight',
        'forced-reflow-insight',
        'dom-size-insight',
        'unused-css-rules',
        'unused-javascript',
        'long-tasks',
        'bootup-time',
        'mainthread-work-breakdown',
        'total-byte-weight',
      ]
        .filter((id) => lhr.audits[id])
        .map((id) => [
          id,
          {
            score: lhr.audits[id].score,
            numericValue: lhr.audits[id].numericValue ?? null,
            displayValue: lhr.audits[id].displayValue ?? null,
          },
        ]),
    ),
    environment: {
      lighthouseVersion: lhr.lighthouseVersion,
      benchmarkIndex: lhr.environment?.benchmarkIndex ?? null,
      throttling: lhr.configSettings?.throttling ?? null,
      throttlingMethod: lhr.configSettings?.throttlingMethod ?? null,
      formFactor: lhr.configSettings?.formFactor ?? null,
      screenEmulation: lhr.configSettings?.screenEmulation ?? null,
    },
  }
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted.length % 2 === 1
    ? sorted[(sorted.length - 1) / 2]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
}

/**
 * Pick the representative run. One whole run is reported rather than a per-metric median so the
 * reported LCP, CLS and score all describe the same page load; a metric-wise median is a load that
 * never happened. The run chosen is the one whose LCP is the median LCP, because LCP is the metric
 * the traveler experiences as "did the answer arrive".
 */
function medianRun(runs) {
  const target = median(runs.map((r) => r.metrics.lcpMs))
  let closest = runs[0]
  let closestDistance = Infinity
  for (const run of runs) {
    const distance = Math.abs(run.metrics.lcpMs - target)
    if (distance < closestDistance) {
      closest = run
      closestDistance = distance
    }
  }
  return closest
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const budgets = JSON.parse(readFileSync(args.budgets, 'utf8'))
  const config = budgets.lighthouse
  if (!config?.gates) {
    console.error('lighthouse: perf.budgets.json has no lighthouse.gates section to assert.')
    process.exit(2)
  }
  const dist = args.dist ? resolve(args.dist) : resolve(REPO, budgets.measurement.dist)
  const compress = args.compress ?? config.conditions.compression
  const runsPerRoute = args.runs ?? config.conditions.runsPerRoute
  const factor = FORM_FACTORS[args.formFactor]

  const staticModel = measureDist(dist)
  const allRoutes = staticModel.routes.map((r) => r.route)
  let routes
  if (args.routes === 'all') routes = allRoutes
  else if (args.routes) routes = args.routes.split(',').map((r) => r.trim())
  else routes = config.routes.map((r) => r.route)

  const unknown = routes.filter((r) => !allRoutes.includes(r))
  if (unknown.length > 0) {
    console.error(`lighthouse: these routes are not in the build at ${dist}: ${unknown.join(', ')}`)
    process.exit(2)
  }

  const server = await startDistServer({ dist, port: args.port, compress })
  const browser = await chromium.launch({ args: [`--remote-debugging-port=${args.debugPort}`] })
  const results = []
  const startedAt = new Date().toISOString()

  try {
    for (const route of routes) {
      const url = `${server.origin}${route}`
      const runs = []
      for (let i = 0; i < runsPerRoute; i += 1) {
        const { lhr } = await lighthouse(url, {
          port: args.debugPort,
          output: 'json',
          logLevel: 'error',
          ...factor,
        })
        runs.push(extract(lhr))
      }
      const chosen = medianRun(runs)
      const predicted = staticModel.routes.find((r) => r.route === route)
      results.push({
        route,
        class: classify(route, budgets.routeClasses),
        runs: runs.length,
        chosen,
        spread: {
          lcpMs: [
            Math.min(...runs.map((r) => r.metrics.lcpMs)),
            Math.max(...runs.map((r) => r.metrics.lcpMs)),
          ],
          fcpMs: [
            Math.min(...runs.map((r) => r.metrics.fcpMs)),
            Math.max(...runs.map((r) => r.metrics.fcpMs)),
          ],
          tbtMs: [
            Math.min(...runs.map((r) => r.metrics.tbtMs)),
            Math.max(...runs.map((r) => r.metrics.tbtMs)),
          ],
          clsScore: [
            Math.min(...runs.map((r) => r.metrics.clsScore)),
            Math.max(...runs.map((r) => r.metrics.clsScore)),
          ],
          performance: [
            Math.min(...runs.map((r) => r.scores.performance)),
            Math.max(...runs.map((r) => r.scores.performance)),
          ],
        },
        // Reconciliation: the static wire model counts payload bytes only; Lighthouse's
        // transferSize also counts response headers. If the request counts disagree the static
        // model is wrong about what a browser fetches, and that is worth knowing loudly.
        reconciliation: {
          predictedCriticalRequests: predicted?.criticalRequestCount ?? null,
          measuredRequests: chosen.network.requestCount,
          requestCountMatches: predicted?.criticalRequestCount === chosen.network.requestCount,
          predictedPayloadBytesGzip: predicted?.criticalPathWireBytes ?? null,
          predictedPayloadBytesBrotli: predicted?.criticalPathBrotliBytes ?? null,
          measuredTransferBytes: chosen.network.transferBytes,
          residualBytes:
            chosen.network.transferBytes -
            (compress === 'none'
              ? (predicted?.resources ?? []).reduce((t, r) => t + r.rawBytes, 0) +
                (predicted?.documentRawBytes ?? 0)
              : (predicted?.criticalPathBrotliBytes ?? 0)),
        },
      })
      const m = chosen.metrics
      const s = chosen.scores
      console.log(
        `${route.padEnd(56)} perf ${String(s.performance).padStart(3)} a11y ${String(s.accessibility).padStart(3)}` +
          ` bp ${String(s.bestPractices).padStart(3)} seo ${String(s.seo).padStart(3)}` +
          ` | LCP ${String(m.lcpMs).padStart(5)} ms  CLS ${m.clsScore}  TBT ${String(m.tbtMs).padStart(4)} ms` +
          ` | ${chosen.network.requestCount} req ${chosen.network.transferBytes} B`,
      )
    }
  } finally {
    await browser.close()
    await server.close()
  }

  const routeConfig = new Map(config.routes.map((entry) => [entry.route, entry]))
  const failures = []
  for (const result of results) {
    const classGate = config.gates[result.class] ?? config.gates.default
    if (!classGate) {
      failures.push({
        route: result.route,
        key: 'gate',
        measured: result.class,
        gate: 'a gate for this route class',
        owner: 'performance-engineer',
        why: 'No lighthouse.gates entry matches this route class.',
      })
      continue
    }
    // A per-route override replaces the class gate for that key; `null` removes it, which is how a
    // route that cannot score 100 by design (a deliberately `noindex` page) stops being gated on a
    // number it can never reach, and is gated on the audit list instead.
    const gate = { ...classGate, ...(routeConfig.get(result.route)?.gateOverrides ?? {}) }
    const failing = result.chosen.failingAudits
    const countFailing = (category, allow = []) =>
      failing[category].filter((a) => !allow.includes(a.id)).length
    const measuredValues = {
      ...result.chosen.scores,
      ...result.chosen.metrics,
      failingPerformanceAudits: failing.performance.length,
      failingAccessibilityAudits: failing.accessibility.length,
      failingBestPracticesAudits: failing.bestPractices.length,
      failingSeoAudits: failing.seo.length,
    }
    for (const [key, spec] of Object.entries(gate)) {
      if (key === 'owner' || key === 'why' || spec === null) continue
      const category = {
        failingPerformanceAudits: 'performance',
        failingAccessibilityAudits: 'accessibility',
        failingBestPracticesAudits: 'bestPractices',
        failingSeoAudits: 'seo',
      }[key]
      if (category && Array.isArray(spec.allow)) {
        measuredValues[key] = countFailing(category, spec.allow)
      }
      const measured = measuredValues[key]
      if (measured == null) {
        failures.push({
          route: result.route,
          key,
          measured: 'not reported',
          gate: spec.threshold,
          owner: spec.owner ?? gate.owner,
          why: `Lighthouse did not report "${key}". A gate on a metric that was not produced is a gate that passes by accident.`,
        })
        continue
      }
      const ok = spec.comparison === 'min' ? measured >= spec.threshold : measured <= spec.threshold
      if (!ok) {
        const categoryForKey =
          {
            performance: 'performance',
            accessibility: 'accessibility',
            bestPractices: 'bestPractices',
            seo: 'seo',
          }[key] ?? category
        failures.push({
          route: result.route,
          key,
          measured,
          gate: `${spec.comparison === 'min' ? '>=' : '<='} ${spec.threshold}`,
          owner: spec.owner ?? gate.owner,
          why: spec.why,
          failingAudits: categoryForKey
            ? failing[categoryForKey].map((a) => `${a.id} (score ${a.score}, weight ${a.weight})`)
            : undefined,
        })
      }
    }
    if (!result.reconciliation.requestCountMatches) {
      failures.push({
        route: result.route,
        key: 'requestCountReconciliation',
        measured: `${result.reconciliation.measuredRequests} requests`,
        gate: `${result.reconciliation.predictedCriticalRequests} predicted by the static model`,
        owner: 'performance-engineer',
        why: 'scripts/perf/lib/measure-dist.mjs and the browser disagree about what this route fetches. Until they agree, the byte budgets are measuring a graph the browser does not load.',
      })
    }
  }

  const report = {
    generatedAt: startedAt,
    finishedAt: new Date().toISOString(),
    dist,
    compression: compress,
    formFactor: args.formFactor,
    runsPerRoute,
    lighthouseVersion: results[0]?.chosen.environment.lighthouseVersion ?? null,
    benchmarkIndex: results[0]?.chosen.environment.benchmarkIndex ?? null,
    throttling: results[0]?.chosen.environment.throttling ?? null,
    gates: config.gates,
    results,
    failures,
  }
  mkdirSync(dirname(resolve(args.out)), { recursive: true })
  writeFileSync(resolve(args.out), JSON.stringify(report, null, 2) + '\n')
  console.log(`\nJSON report: ${resolve(args.out)}`)

  if (args.report) {
    console.log(`\n--report: ${failures.length} gate(s) would have failed. Asserting nothing.`)
    for (const f of failures)
      console.log(`  would fail: ${f.route} · ${f.key} = ${f.measured}, gate ${f.gate}`)
    process.exit(0)
  }

  if (failures.length === 0) {
    console.log(
      `\nLighthouse gate: ${results.length} route(s) at or above every threshold ` +
        `(lighthouse ${report.lighthouseVersion}, ${args.formFactor} ${factor.screenEmulation.width}x${factor.screenEmulation.height}, ` +
        `compression=${compress}, median of ${runsPerRoute} run(s), benchmarkIndex ${report.benchmarkIndex}).`,
    )
    process.exit(0)
  }

  console.error(`\nLighthouse gate: ${failures.length} threshold(s) FAILED.\n`)
  for (const f of failures) {
    console.error(`  ✗ ${f.route} · ${f.key}: measured ${f.measured}, gate ${f.gate}`)
    console.error(`      owner: ${f.owner}`)
    if (f.failingAudits?.length) {
      console.error(`      failing audits: ${f.failingAudits.join(', ')}`)
    }
    if (f.why) console.error(`      why this gate exists: ${f.why}`)
    console.error('')
  }
  console.error(
    'DIRECTIVE.md §22 gates public routes at 95/100/100/100 and targets LCP < 2.5 s, CLS < 0.1.\n' +
      'A route missing any one of these is failing; there is no weighted average across routes\n' +
      '(.claude/agents/performance-engineer.md:74-77).',
  )
  process.exit(1)
}

await main()
