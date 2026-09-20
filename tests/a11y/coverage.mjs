/**
 * The coverage floor of `pnpm test:a11y` — `docs/ACCESSIBILITY.md §12` items 7 and 9, findings
 * F46, F47, F49.
 *
 * Owner: qa-test-architect.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * A CHECK THAT MATCHED NOTHING PRINTED THE SAME WORD AS A CHECK THAT PASSED.
 *
 * Every assertion in this suite used to report `clean` when it found no defect AND when it found no
 * elements. Those are not the same result. Measured on this build: 6 `role="progressbar"` and 7
 * `<table>` across 20 routes, so 17 routes had no meter at all and the meter check printed `clean`
 * on every one of them; and the item-5 pill pass is keyed on the class substrings `status-pill` and
 * `dp-pill`, which F39's own fix already narrowed once. A rename takes any of those populations to
 * zero and nothing in the output changes.
 *
 * The same shape one level up: route coverage was whatever `dist` happened to contain. Deriving the
 * route set from the build is right and it stays — a new route joins the sweep on the build that
 * emits it — but a route that DISAPPEARS took its coverage with it silently, and the zero-route
 * tripwire only catches total loss.
 *
 * So this file compares three things against a recorded expectation:
 *
 *   1. the emitted route set (F49) — a recorded route that is missing FAILS the run; a new route is
 *      printed and does not;
 *   2. the population every check examined, per check per route (F46) — a population that was
 *      non-zero in the baseline and is zero now FAILS;
 *   3. the `incomplete` node population, per route per rule per message class (F47) — an
 *      UNDISPOSITIONED class fails; a change in a dispositioned class's count is printed as a
 *      re-measurement request for `accessibility-lead`. The reasoning for that asymmetry is in
 *      `incomplete.mjs`, and it is a judgement, not an oversight.
 *
 * RECORDING IS A DELIBERATE ACT. `--record-baseline` rewrites `baseline.json` from a run, and it
 * refuses to do so from a seeded or a narrowed one. It is the same discipline as a visual
 * rebaseline (`docs/TESTING.md §5`): a baseline moves when someone has decided the new state is the
 * intended one and says so in the commit — never to clear a red run.
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dispositionFor, UNMEASURED } from './incomplete.mjs'

/** @typedef {import('./regressions.mjs').Finding} Finding */

/**
 * @typedef {object} Baseline
 * @property {string} recordedAt
 * @property {string} recordedFrom
 * @property {string[]} routes
 * @property {Record<string, Record<string, number>>} populations
 * @property {Record<string, Record<string, Record<string, number>>>} incomplete
 */

export const BASELINE_PATH = fileURLToPath(new URL('./baseline.json', import.meta.url))

/** @returns {Baseline} */
export function loadBaseline() {
  return JSON.parse(readFileSync(BASELINE_PATH, 'utf8'))
}

/**
 * @param {Baseline} baseline
 * @returns {void}
 */
export function writeBaseline(baseline) {
  writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`)
}

/**
 * The emitted route set against the recorded one — §12 item 9, F49.
 *
 * @param {string[]} expected
 * @param {string[]} actual
 * @returns {{ findings: Finding[], added: string[] }}
 */
export function compareRouteSet(expected, actual) {
  const emitted = new Set(actual)
  const missing = expected.filter((route) => !emitted.has(route))
  const added = actual.filter((route) => !expected.includes(route))
  return {
    added,
    findings: missing.map((route) => ({
      check: 'route-set',
      route,
      detail:
        'recorded in tests/a11y/baseline.json and not emitted by this build, so it was not swept ' +
        'at all. Either the build stopped emitting a route — in which case this is a finding for ' +
        'its owner — or the route was deliberately removed, in which case re-record the baseline ' +
        'in the same change (docs/TESTING.md §3).',
    })),
  }
}

/**
 * Population floors — §12 item 7, F46.
 *
 * @param {Record<string, Record<string, number>>} expected
 * @param {Record<string, Record<string, number>>} actual
 * @param {{ key: string, check: string, label: string }[]} columns
 * @returns {{ findings: Finding[], unrecorded: string[] }}
 */
export function comparePopulations(expected, actual, columns) {
  /** @type {Finding[]} */
  const findings = []
  /** @type {string[]} */
  const unrecorded = []

  for (const [route, observed] of Object.entries(actual)) {
    const recorded = expected[route]
    if (recorded === undefined) {
      unrecorded.push(route)
      continue
    }
    for (const [key, was] of Object.entries(recorded)) {
      const now = observed[key] ?? 0
      if (was > 0 && now === 0) {
        const column = columns.find((entry) => entry.key === key)
        findings.push({
          check: 'population-floor',
          route,
          detail:
            `${check_(column)} examined ${was} \`${key}\` element(s) when the baseline was ` +
            'recorded and examines 0 now, so it can no longer fail on this route and its `clean` ' +
            'result means nothing. §12 item 7: a check may not report clean over zero elements. ' +
            'Either the elements were removed — a finding for the owner of that surface — or the ' +
            'selector stopped matching them, which is a finding against this suite.',
        })
      }
    }
  }
  return { findings, unrecorded }
}

/** @param {{ check: string } | undefined} column */
const check_ = (column) => (column === undefined ? 'a check' : `\`${column.check}\``)

/**
 * `incomplete` node populations, per route per rule per message class — §12's "reported, never
 * waived" clause at the granularity F47 showed it needs.
 *
 * @param {Record<string, Record<string, Record<string, number>>>} expected
 * @param {Record<string, Record<string, Record<string, number>>>} actual
 * @returns {{ findings: Finding[], reviews: string[] }}
 */
export function compareIncomplete(expected, actual) {
  /** @type {Finding[]} */
  const findings = []
  /** @type {string[]} */
  const reviews = []

  for (const [route, rules] of Object.entries(actual)) {
    for (const [rule, classes] of Object.entries(rules)) {
      for (const [id, nodes] of Object.entries(classes)) {
        const was = expected[route]?.[rule]?.[id]
        if (id === UNMEASURED) {
          findings.push({
            check: 'incomplete-class',
            route,
            detail:
              `${nodes} node(s) of rule \`${rule}\` returned an \`incomplete\` message that ` +
              `matches none of the classes docs/ACCESSIBILITY.md §16.4 measured. ${dispositionFor(id)}`,
          })
          continue
        }
        if (was === undefined) {
          reviews.push(
            `${route} ${rule}/${id}: ${nodes} node(s), NEW on this route. ${dispositionFor(id)}`,
          )
        } else if (was !== nodes) {
          reviews.push(`${route} ${rule}/${id}: ${was} → ${nodes} node(s). ${dispositionFor(id)}`)
        }
      }
    }
    for (const [rule, classes] of Object.entries(expected[route] ?? {})) {
      for (const [id, was] of Object.entries(classes)) {
        if (actual[route]?.[rule]?.[id] === undefined) {
          reviews.push(
            `${route} ${rule}/${id}: ${was} → 0 node(s), the class is gone from this route.`,
          )
        }
      }
    }
  }
  return { findings, reviews }
}

/**
 * Fold the per-run axe rows into `route → rule → class → nodes`, asserting that the four context
 * runs of a route agree. They do on this tree — light and dark return identical node populations —
 * and a divergence is worth seeing rather than averaging away.
 *
 * @param {object[]} rows
 * @returns {{ counts: Record<string, Record<string, Record<string, number>>>, divergences: string[] }}
 */
export function foldIncomplete(rows) {
  /** @type {Record<string, Record<string, Record<string, number>>>} */
  const counts = {}
  /** @type {Record<string, Set<number>>} */
  const seen = {}
  /** @type {string[]} */
  const divergences = []

  for (const row of rows) {
    for (const entry of row.incomplete) {
      for (const [id, nodes] of Object.entries(entry.classes)) {
        counts[row.route] ??= {}
        counts[row.route][entry.id] ??= {}
        counts[row.route][entry.id][id] = Math.max(counts[row.route][entry.id][id] ?? 0, nodes)
        const key = `${row.route} ${entry.id}/${id}`
        seen[key] ??= new Set()
        seen[key].add(nodes)
      }
    }
  }
  for (const [key, values] of Object.entries(seen)) {
    if (values.size > 1) {
      divergences.push(`${key}: ${[...values].join(' / ')} nodes across the four context runs`)
    }
  }
  return { counts, divergences }
}
