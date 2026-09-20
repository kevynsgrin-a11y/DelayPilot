/**
 * The axe half of `docs/ACCESSIBILITY.md §12`, implemented exactly as that section specifies it.
 *
 * Owner: qa-test-architect. Assertions specified by `accessibility-lead`.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * HOW AXE IS INJECTED, AND WHY IT MATTERS MORE THAN IT LOOKS.
 *
 * axe has to run inside the page. There are two ways to get it there and they measure different
 * products:
 *
 *   1. `AxeBuilder` (`@axe-core/playwright`) injects through `page.evaluate`, which travels over
 *      CDP and is therefore NOT subject to the page's Content-Security-Policy. Convenient, and it
 *      silently removes the policy from the thing under test. Other harnesses reach for
 *      `bypassCSP: true` for the same reason.
 *   2. Serve axe from a SAME-ORIGIN URL through request interception, and load it with an ordinary
 *      `<script src>`. The page's real `script-src 'self'` stays enforced for the whole run, so a
 *      page that would be broken by its own policy on the deployed site is broken here too.
 *
 * `docs/ACCESSIBILITY.md §12` records that the published 88-run baseline used method 2, and that an
 * inline injection "disables the CSP under test and the first attempt failed loudly, which is the
 * behaviour to keep". This file keeps method 2. `@axe-core/playwright` is installed and unused on
 * purpose: the convenience is not worth measuring a page under a policy nobody serves.
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * Threshold: ZERO violations at any impact, `minor` included. No rule is disabled. `best-practice`
 * runs as a separate, reported, non-blocking pass. `incomplete` results are reported, never waived
 * here — §15.3 and §15.9 resolve the known twenty by pixel measurement, and this runner's job is to
 * make a change in their number visible rather than to re-litigate them.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { CONTEXT_MATRIX } from '../tools/browser.mjs'

const require = createRequire(import.meta.url)

/** The axe-core bundle, read once from the pinned dependency (`axe-core@4.13.0`). */
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8')

/**
 * `docs/ACCESSIBILITY.md §12`, verbatim. `wcag21a` is in the list because the executed baseline used
 * it; `heading-order` is retained deliberately — §15.15 names it as the guard that replaces the
 * visual cue a `Callout` heading no longer carries.
 */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/** The §12 viewport. 1440 × 900 is the width the published baseline was measured at. */
export const AXE_VIEWPORT = { width: 1440, height: 900 }

/**
 * Sweep a set of routes: every route four times, `{light, dark} × {no-preference, reduce}`.
 *
 * @param {object} options
 * @param {import('@playwright/test').Browser} options.browser
 * @param {string} options.origin
 * @param {string[]} options.routes
 * @param {(line: string) => void} [options.log]
 * @param {string} [options.initScript] a body injected into every page before it is measured, used
 *   only by `--seed-violation` to prove that a clean run is a measurement and not an empty loop.
 * @returns {Promise<{
 *   axeVersion: string | null,
 *   runs: number,
 *   violations: number,
 *   incomplete: number,
 *   bestPractice: number,
 *   consoleErrors: number,
 *   rows: object[],
 * }>}
 */
export async function sweep({ browser, origin, routes, log = console.log, initScript }) {
  /** @type {object[]} */
  const rows = []
  /** @type {string | null} */
  let axeVersion = null

  for (const route of routes) {
    for (const { colorScheme, reducedMotion } of CONTEXT_MATRIX) {
      const context = await browser.newContext({
        colorScheme,
        reducedMotion,
        viewport: AXE_VIEWPORT,
      })
      if (initScript !== undefined) {
        await context.addInitScript(`window.addEventListener('load', () => { ${initScript} })`)
      }
      const page = await context.newPage()

      /* Same-origin delivery, so `script-src 'self'` stays enforced. See the note above. */
      await page.route('**/__axe-core.js', (request) =>
        request.fulfill({
          status: 200,
          contentType: 'text/javascript; charset=utf-8',
          body: AXE_SOURCE,
        }),
      )

      /** @type {string[]} */
      const consoleErrors = []
      page.on('console', (message) => {
        if (message.type() === 'error' || /Refused to/.test(message.text())) {
          consoleErrors.push(message.text())
        }
      })
      page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`))

      const response = await page.goto(origin + route, { waitUntil: 'networkidle' })
      await page.addScriptTag({ url: '/__axe-core.js' })

      const result = await page.evaluate(async (tags) => {
        /* eslint-disable no-undef -- `axe` is the script this run just loaded into the page. */
        const wcag = await axe.run(document, {
          runOnly: { type: 'tag', values: tags },
          resultTypes: ['violations', 'incomplete'],
        })
        const bestPractice = await axe.run(document, {
          runOnly: { type: 'tag', values: ['best-practice'] },
          resultTypes: ['violations'],
        })
        return {
          version: axe.version,
          violations: wcag.violations,
          incomplete: wcag.incomplete,
          bestPractice: bestPractice.violations,
        }
        /* eslint-enable no-undef */
      }, WCAG_TAGS)

      axeVersion = result.version

      /** @param {{ id: string, impact: string | null, nodes: { target: string[] }[] }[]} list */
      const summarise = (list) =>
        list.map((entry) => ({
          id: entry.id,
          impact: entry.impact,
          nodes: entry.nodes.length,
          targets: entry.nodes.slice(0, 4).map((node) => node.target.join(' ')),
        }))

      rows.push({
        route,
        colorScheme,
        reducedMotion,
        status: response?.status() ?? 0,
        violations: summarise(result.violations),
        incomplete: summarise(result.incomplete),
        bestPractice: summarise(result.bestPractice),
        consoleErrors,
      })

      await context.close()
    }

    const forRoute = rows.filter((row) => row.route === route)
    /** @param {'violations' | 'incomplete' | 'bestPractice' | 'consoleErrors'} key */
    const total = (key) => forRoute.reduce((sum, row) => sum + row[key].length, 0)
    log(
      `  ${route.padEnd(52)} violations=${total('violations')} incomplete=${total('incomplete')} ` +
        `best-practice=${total('bestPractice')} console=${total('consoleErrors')}`,
    )
  }

  /** @param {'violations' | 'incomplete' | 'bestPractice' | 'consoleErrors'} key */
  const across = (key) => rows.reduce((sum, row) => sum + row[key].length, 0)

  return {
    axeVersion,
    runs: rows.length,
    violations: across('violations'),
    incomplete: across('incomplete'),
    bestPractice: across('bestPractice'),
    consoleErrors: across('consoleErrors'),
    rows,
  }
}

/**
 * The one-line summary `docs/ACCESSIBILITY.md §15.3` and §15.15 quote, in the same shape, so a
 * result from this runner can be compared to the published baseline without reformatting it.
 *
 * @param {Awaited<ReturnType<typeof sweep>>} result
 * @returns {string}
 */
export const summaryLine = (result) =>
  `axe-core ${result.axeVersion ?? '?'} | runs: ${result.runs} | WCAG A/AA violations: ` +
  `${result.violations} | incomplete: ${result.incomplete} | best-practice: ${result.bestPractice} ` +
  `| console errors: ${result.consoleErrors}`
