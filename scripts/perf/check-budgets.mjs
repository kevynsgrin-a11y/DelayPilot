#!/usr/bin/env node
/**
 * check-budgets.mjs — assert the built site against `perf.budgets.json`.
 *
 * Invoked by `pnpm perf:budgets` as plain `node scripts/perf/check-budgets.mjs`, with no flags and
 * no loader, so it is runnable ESM with no dependency outside the Node standard library. It exits
 * non-zero on any breach, naming the budget, the measured value, the budget value, the overage,
 * and the agent who owns the file that has to change.
 *
 *   node scripts/perf/check-budgets.mjs               assert (the gate)
 *   node scripts/perf/check-budgets.mjs --report      print every measurement, assert nothing
 *   node scripts/perf/check-budgets.mjs --json <path> also write the measurements as JSON
 *   node scripts/perf/check-budgets.mjs --dist <dir>  measure a build other than apps/web/dist
 *
 * WHAT IT IS FOR. The site ships four external same-origin scripts totalling about 2 KB gzipped
 * and hydrates nothing: React renders on the server and no `client:*` directive exists anywhere
 * (`docs/BUILD_PLAN.md §10`, S3 record). That property, not any individual byte count, is the
 * performance story, and it is exactly the property a well-intentioned change destroys — one
 * `client:load` on one component pulls in the React runtime and the number stops being 2 KB
 * forever. So the script count, the hydrated-island count and the inline-executable-script count
 * are budgeted exactly, with no headroom, while byte budgets carry stated headroom.
 *
 * WHAT IT IS NOT FOR. It does not restate the Content-Security-Policy rule that forbids inline
 * scripts and styles: that rule lives in `apps/web/public/_headers` and is enforced on every build
 * by `apps/web/scripts/verify-dist.mjs`, which prints the sha256 source a future inline element
 * would need. This script counts inline executable scripts for a different reason — bytes inside a
 * `<script>` element are JavaScript that no per-file budget can see, so an inline script would make
 * the JavaScript budget silently wrong. An inline `application/ld+json` data block is not
 * executable, is required by search engines to be in the page, and is counted where it belongs:
 * inside the document byte budget, because it is part of the document.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { measureDist } from './lib/measure-dist.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..', '..')
const BUDGET_FILE = join(REPO, 'perf.budgets.json')

function parseArgs(argv) {
  const out = { report: false, dist: null, json: null, budgets: BUDGET_FILE }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = () => argv[(i += 1)]
    if (arg === '--report') out.report = true
    else if (arg === '--dist') out.dist = next()
    else if (arg === '--json') out.json = next()
    else if (arg === '--budgets') out.budgets = next()
    else {
      console.error(`check-budgets: unknown option ${arg}`)
      process.exit(2)
    }
  }
  return out
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KiB`
const pct = (measured, budget) =>
  budget === 0 ? '—' : `${(((measured - budget) / budget) * 100).toFixed(1)}%`

/** Match a route against the `routeClasses[].match` glob list. `**` crosses `/`, `*` does not. */
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
    for (const pattern of spec.match) {
      if (globToRegExp(pattern).test(route)) return name
    }
  }
  return null
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  const budgets = JSON.parse(readFileSync(args.budgets, 'utf8'))
  const dist = args.dist ? resolve(args.dist) : resolve(REPO, budgets.measurement.dist)

  let measured
  try {
    measured = measureDist(dist)
  } catch (error) {
    console.error(`check-budgets: cannot measure ${dist}`)
    console.error(`  ${error instanceof Error ? error.message : String(error)}`)
    console.error('  Run `pnpm build` first — the budget gate asserts a build, never a guess.')
    process.exit(2)
  }

  const failures = []
  const checks = []
  const check = ({ scope, key, measuredValue, budget, comparison, unit, owner, note }) => {
    const ok =
      comparison === 'max'
        ? measuredValue <= budget
        : comparison === 'exact'
          ? measuredValue === budget
          : measuredValue >= budget
    const row = { scope, key, measured: measuredValue, budget, comparison, unit, owner, ok, note }
    checks.push(row)
    if (!ok) failures.push(row)
  }

  // ---- global budgets -------------------------------------------------------------------------
  const g = measured.global
  const globalValues = {
    hydratedIslands: g.totalHydratedIslands,
    inlineExecutableScripts: measured.routes.reduce(
      (total, r) =>
        total +
        r.inlineScripts.filter(
          (s) =>
            s.type === '' ||
            /^(module|text\/javascript|application\/javascript|importmap)$/.test(s.type),
        ).length,
      0,
    ),
    inlineStyleElements: g.totalInlineStyles,
    scriptFileCount: g.js.fileCount,
    scriptWireBytesTotal: g.js.wireBytes,
    largestScriptWireBytes: g.js.largestWireBytes,
    stylesheetFileCount: g.css.fileCount,
    stylesheetWireBytesTotal: g.css.wireBytes,
    fontFileCount: g.fonts.fileCount,
    fontWireBytesTotal: g.fonts.wireBytes,
    largestImageWireBytes: g.images.largestWireBytes,
    imageWireBytesTotal: g.images.wireBytes,
    documentWireBytesTotal: measured.routes.reduce((t, r) => t + r.documentWireBytes, 0),
    buildWireBytesTotal: g.buildWireBytes,
    routeCount: measured.routes.length,
  }
  for (const [key, spec] of Object.entries(budgets.global)) {
    if (!(key in globalValues)) {
      console.error(`check-budgets: budget "global.${key}" measures nothing this script computes.`)
      process.exit(2)
    }
    check({
      scope: 'global',
      key,
      measuredValue: globalValues[key],
      budget: spec.budget,
      comparison: spec.comparison,
      unit: spec.unit,
      owner: spec.owner,
      note: spec.why,
    })
  }

  // Font format is a list, not a number: every font file must be woff2.
  const unexpectedFontFormats = g.fonts.extensions.filter(
    (ext) => !budgets.fontFormats.allowed.includes(ext),
  )
  checks.push({
    scope: 'global',
    key: 'fontFormats',
    measured: g.fonts.extensions.join(',') || '(none)',
    budget: budgets.fontFormats.allowed.join(','),
    comparison: 'subset',
    unit: 'extension',
    owner: budgets.fontFormats.owner,
    ok: unexpectedFontFormats.length === 0,
    note: budgets.fontFormats.why,
  })
  if (unexpectedFontFormats.length > 0) failures.push(checks[checks.length - 1])

  // ---- per-route budgets ----------------------------------------------------------------------
  const unbudgeted = []
  for (const route of measured.routes) {
    const className = classify(route.route, budgets.routeClasses)
    if (!className) {
      unbudgeted.push(route.route)
      continue
    }
    const spec = {
      ...budgets.routeClasses[className].budgets,
      ...(budgets.routeOverrides[route.route]?.budgets ?? {}),
    }
    const values = {
      documentWireBytes: route.documentWireBytes,
      criticalPathWireBytes: route.criticalPathWireBytes,
      totalRouteWireBytes: route.totalRouteWireBytes,
      criticalRequestCount: route.criticalRequestCount,
      renderBlockingCount: route.renderBlockingCount,
      preloadCount: route.preloadCount,
      undimensionedImages: route.undimensionedImages,
    }
    for (const [key, budget] of Object.entries(spec)) {
      if (!(key in values)) {
        console.error(
          `check-budgets: budget "routeClasses.${className}.budgets.${key}" measures nothing this script computes.`,
        )
        process.exit(2)
      }
      check({
        scope: route.route,
        key,
        measuredValue: values[key],
        budget: budget.budget,
        comparison: budget.comparison,
        unit: budget.unit,
        owner: budget.owner ?? budgets.routeClasses[className].owner,
        note: budgets.routeOverrides[route.route]?.why,
      })
    }
    if (route.missingReferences.length > 0) {
      const row = {
        scope: route.route,
        key: 'unresolvedReferences',
        measured: route.missingReferences.length,
        budget: 0,
        comparison: 'max',
        unit: 'reference',
        owner: 'frontend-ui-engineer',
        ok: false,
        note: route.missingReferences.map((m) => `${m.tag} ${m.href} -> ${m.resolved}`).join('; '),
      }
      checks.push(row)
      failures.push(row)
    }
  }

  if (unbudgeted.length > 0 && budgets.unbudgetedRoutes === 'fail') {
    const row = {
      scope: 'routes',
      key: 'unbudgetedRoutes',
      measured: unbudgeted.length,
      budget: 0,
      comparison: 'max',
      unit: 'route',
      owner: 'performance-engineer',
      ok: false,
      note: `no routeClasses entry matches: ${unbudgeted.join(', ')}`,
    }
    checks.push(row)
    failures.push(row)
  }

  // ---- output ---------------------------------------------------------------------------------
  const report = {
    generatedAt: new Date().toISOString(),
    dist,
    budgetsFile: args.budgets,
    budgetsVersion: budgets.version,
    global: globalValues,
    routes: measured.routes.map((r) => ({
      route: r.route,
      class: classify(r.route, budgets.routeClasses),
      documentWireBytes: r.documentWireBytes,
      documentBrotliBytes: r.documentBrotliBytes,
      documentRawBytes: r.documentRawBytes,
      criticalPathWireBytes: r.criticalPathWireBytes,
      criticalPathBrotliBytes: r.criticalPathBrotliBytes,
      totalRouteWireBytes: r.totalRouteWireBytes,
      criticalRequestCount: r.criticalRequestCount,
      renderBlockingCount: r.renderBlockingCount,
      preloadCount: r.preloadCount,
      scriptWireBytes: r.scriptWireBytes,
      cssWireBytes: r.cssWireBytes,
      fontWireBytes: r.fontWireBytes,
      hydratedIslands: r.hydratedIslands,
      inlineScripts: r.inlineScripts,
      inlineStyles: r.inlineStyles.length,
    })),
    checks,
  }

  if (args.json) {
    mkdirSync(dirname(resolve(args.json)), { recursive: true })
    writeFileSync(resolve(args.json), JSON.stringify(report, null, 2) + '\n')
  }

  const label = (row) =>
    `${row.scope} · ${row.key}: measured ${row.unit === 'byte' ? kb(row.measured) : row.measured}` +
    ` (${row.measured}${row.unit === 'byte' ? ' B' : ''}), budget ${row.unit === 'byte' ? kb(row.budget) : row.budget}` +
    `${row.unit === 'byte' ? ` (${row.budget} B)` : ''}`

  if (args.report) {
    console.log(`Budget report — ${dist}`)
    console.log(`Budget manifest ${args.budgets} (version ${budgets.version})\n`)
    const width = Math.max(...checks.map((c) => `${c.scope} · ${c.key}`.length))
    for (const row of checks) {
      console.log(
        `${row.ok ? 'ok  ' : 'FAIL'} ${`${row.scope} · ${row.key}`.padEnd(width)}  ` +
          `${String(row.measured).padStart(9)} / ${String(row.budget).padStart(9)} ${row.unit}` +
          `${row.ok ? '' : `   ${pct(row.measured, row.budget)} over`}`,
      )
    }
    console.log(`\n${checks.length} checks, ${failures.length} over budget.`)
    process.exit(0)
  }

  if (failures.length === 0) {
    console.log(
      `perf budgets: ${checks.length} checks passed across ${measured.routes.length} routes ` +
        `(${dist}, manifest version ${budgets.version}).`,
    )
    console.log(
      `  javascript ${globalValues.scriptWireBytesTotal} B gz in ${globalValues.scriptFileCount} external scripts, ` +
        `${globalValues.hydratedIslands} hydrated islands, ${globalValues.inlineExecutableScripts} inline executable scripts.`,
    )
    console.log(
      `  css ${globalValues.stylesheetWireBytesTotal} B gz, fonts ${globalValues.fontWireBytesTotal} B in ` +
        `${globalValues.fontFileCount} face(s), build ${globalValues.buildWireBytesTotal} B gz.`,
    )
    process.exit(0)
  }

  console.error(`perf budgets: ${failures.length} of ${checks.length} checks OVER BUDGET.\n`)
  for (const row of failures) {
    console.error(`  ✗ ${label(row)}`)
    if (row.comparison === 'exact') {
      console.error(`      required exactly ${row.budget}; measured ${row.measured}`)
    } else if (row.unit === 'byte') {
      console.error(
        `      over by ${row.measured - row.budget} B (${kb(row.measured - row.budget)}), ${pct(row.measured, row.budget)} above budget`,
      )
    } else {
      console.error(`      over by ${row.measured - row.budget} ${row.unit}(s)`)
    }
    console.error(`      owner: ${row.owner}`)
    if (row.note) console.error(`      why this budget exists: ${row.note}`)
    console.error('')
  }
  console.error(
    'A budget is not a suggestion and not a thing to edit upward to get a green build.\n' +
      'Either the change that caused this comes out, or the owner named above lands a fix, or an\n' +
      'orchestrator decision raises the budget with the new measurement recorded in\n' +
      'docs/PERFORMANCE.md — `.claude/agents/performance-engineer.md:78` (tighten, never loosen).',
  )
  process.exit(1)
}

main()
