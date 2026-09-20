/**
 * The `DIRECTIVE.md §17` states that are hidden until a reader interacts, swept by axe WITH THE
 * STATE ON SCREEN — `docs/ACCESSIBILITY.md §12` item 8, finding F45.
 *
 * Owner: qa-test-architect. States specified by `accessibility-lead`; the drive mechanism is the
 * one `e2e/lookup-states.e2e.mjs` already uses, reused rather than reinvented.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * WHY A SWEEP OF SERVED PAGES CANNOT COVER THESE.
 *
 * axe does not descend into a `display: none` subtree. It is not being lenient — there is nothing
 * to evaluate: no box, no computed colour, no contrast. So every `§17` state that is `hidden` until
 * a reader does something is outside every run that loads a route and measures it as served, and it
 * is outside them SILENTLY: the run reports the same clean result it would report if the state did
 * not exist.
 *
 * `accessibility-lead` measured that rather than arguing it (§16.3). The same alt-less `<img>` that
 * produced four `critical` `image-alt` violations on `/about/` produced ZERO when it was seeded
 * inside the hidden provider-unavailable panel on `/`. §12 names `provider unavailable` for a
 * reason: these are the states a traveler reaches on a bad day, which is when accessibility is
 * load-bearing rather than decorative.
 *
 * DRIVEN THROUGH THE UI, NEVER BY SETTING `hidden` FROM THE TEST. Every state below is reached by
 * filling the form and submitting it, through the island's own handler. Toggling the attribute
 * directly would prove the panel renders and nothing about whether a reader can get to it — and it
 * would make this sweep pass on a build whose island is broken.
 *
 * HOLDING A TRANSIENT STATE STILL, WITHOUT WAITING. `searching` is followed by `unavailable` on a
 * `setTimeout(…, 0)` the island schedules inside its own submit handler. Polling for `searching`
 * from Node is a race by construction and `waitForTimeout` is the flake cure this charter forbids,
 * so the drive swaps `window.setTimeout` for the DURATION OF THE SYNCHRONOUS SUBMIT DISPATCH ONLY,
 * drops the one callback scheduled inside it, and restores the real function before the evaluate
 * returns. Nothing else runs in that window, axe's own timers are untouched, and the result is
 * deterministic instead of timed.
 *
 * The input is synthetic: an airline name that is not a carrier and a flight number that is not a
 * flight (`AGENTS.md §1.1`, `DIRECTIVE.md §28`). Nothing in this file asserts an operational value,
 * and the lookup reaches `Unavailable` because no provider is connected — which is the honest
 * terminal state of this tree, not a stub.
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 */
/*
 * BROWSER GLOBALS. Every `document` reference in this file sits inside a function that Playwright
 * serialises and runs IN THE PAGE, not in Node.
 */
/* global document, window, HTMLFormElement */

import { openAxePage, runAxe, summarise } from './axe-sweep.mjs'
import { CONTEXT_MATRIX } from '../tools/browser.mjs'
import {
  VISIBILITY_OPTIONS,
  checkProgressBarStrings,
  checkTableRegions,
  checkBusyAndLiveRegions,
  checkLabelEchoes,
  checkHiddenMeansHidden,
} from './regressions.mjs'

/** Synthetic lookup input. Not a carrier, not a flight, not a date anyone is travelling on. */
const SYNTHETIC_QUERY = { airline: 'Demo Airline', flightNumber: '101', date: '2026-03-14' }

/**
 * The states, each with the surface that owns it and the drive that reaches it.
 *
 * `loading: true` tells the `aria-busy` half of the `busy-and-live` check to stand down for that
 * state: while `searching` is on screen the page IS loading, `aria-busy="true"` is correct, and
 * `e2e/lookup-states.e2e.mjs` asserts it is present. Asserting its absence here would be two suites
 * requiring opposite things of the same element.
 *
 * @type {{
 *   id: string,
 *   route: string,
 *   container: string,
 *   loading?: boolean,
 *   drive: (page: import('@playwright/test').Page) => Promise<void>,
 * }[]}
 */
export const HIDDEN_STATES = [
  {
    id: 'error summary',
    route: '/',
    container: '.dpx-lookup [data-dp-errors]',
    async drive(page) {
      /* Submit with every field empty: the island's own validation raises the summary. */
      await page.locator('form[data-dp-lookup] button[type="submit"]').click()
      await page.locator('.dpx-lookup [data-dp-errors]').waitFor({ state: 'visible' })
    },
  },
  {
    id: 'searching',
    route: '/',
    container: '.dpx-lookup [data-dp-state="searching"]',
    loading: true,
    async drive(page) {
      for (const [name, value] of Object.entries(SYNTHETIC_QUERY)) {
        await page.locator(`[data-dp-field="${name}"]`).fill(value)
      }
      await page.evaluate(() => {
        const form = document.querySelector('form[data-dp-lookup]')
        if (!(form instanceof HTMLFormElement)) throw new Error('no lookup form on this page')
        const realSetTimeout = window.setTimeout
        /* Hold the island's own `setTimeout(…, 0)` — see the header. Restored in `finally`. */
        window.setTimeout = () => 0
        try {
          form.requestSubmit()
        } finally {
          window.setTimeout = realSetTimeout
        }
      })
    },
  },
  {
    id: 'provider unavailable',
    route: '/',
    container: '.dpx-lookup [data-dp-state="unavailable"]',
    async drive(page) {
      for (const [name, value] of Object.entries(SYNTHETIC_QUERY)) {
        await page.locator(`[data-dp-field="${name}"]`).fill(value)
      }
      await page.locator('form[data-dp-lookup] button[type="submit"]').click()
      await page.locator('.dpx-lookup [data-dp-state="unavailable"]').waitFor({ state: 'visible' })
    },
  },
]

/**
 * Sweep every state in `HIDDEN_STATES` whose route is in `routes`: four runs each, the same
 * `{light, dark} × {no-preference, reduce}` matrix §12 requires of a route, because a state is a
 * variant of a route and not a lesser thing.
 *
 * The state is proved to be ON SCREEN before it is measured — `Element.checkVisibility`, the same
 * predicate §12 item 4 now uses — and the population inside its container is reported. A drive that
 * silently stops working therefore fails the run at the coverage floor rather than reporting a
 * clean sweep of a state nobody reached, which is the F46 shape one level up.
 *
 * @param {object} options
 * @param {import('@playwright/test').Browser} options.browser
 * @param {string} options.origin
 * @param {string[]} options.routes the routes this run is sweeping; states on other routes are skipped
 * @param {(line: string) => void} [options.log]
 * @param {string} [options.initScript]
 * @returns {Promise<{
 *   rows: object[],
 *   findings: import('./regressions.mjs').Finding[],
 *   populations: Record<string, Record<string, number>>,
 *   notes: string[],
 *   skipped: string[],
 * }>}
 */
export async function sweepStates({ browser, origin, routes, log = console.log, initScript }) {
  /** @type {object[]} */
  const rows = []
  /** @type {import('./regressions.mjs').Finding[]} */
  const findings = []
  /** @type {Record<string, Record<string, number>>} */
  const populations = {}
  /** @type {string[]} */
  const notes = []
  /** @type {string[]} */
  const skipped = []

  for (const state of HIDDEN_STATES) {
    if (!routes.includes(state.route)) {
      skipped.push(`${state.id} (${state.route} is not in this run's route set)`)
      continue
    }
    const key = stateKey(state)

    for (const { colorScheme, reducedMotion } of CONTEXT_MATRIX) {
      const { context, page, consoleErrors } = await openAxePage({
        browser,
        colorScheme,
        reducedMotion,
        initScript,
      })
      const response = await page.goto(origin + state.route, { waitUntil: 'networkidle' })
      await state.drive(page)

      const onScreen = await page.evaluate(
        ({ selector, options }) => {
          const element = document.querySelector(selector)
          if (element === null) return { present: false, visible: false, population: 0, box: '' }
          const rect = element.getBoundingClientRect()
          return {
            present: true,
            visible: element.checkVisibility(options),
            population: element.querySelectorAll('*').length,
            box: `${Math.round(rect.width)}×${Math.round(rect.height)}`,
          }
        },
        { selector: state.container, options: VISIBILITY_OPTIONS },
      )

      if (!onScreen.visible) {
        findings.push({
          check: 'state-fixture',
          route: key,
          detail:
            `the drive did not put "${state.id}" on screen — ${state.container} is ` +
            `${onScreen.present ? 'present but not visible' : 'not in the document'}. §12 item 8 ` +
            'requires this state to be measured WITH THE STATE APPLIED; a sweep that silently ' +
            'measured the served page instead would report the clean result F45 filed.',
        })
      }

      const result = await runAxe(page)
      rows.push({
        route: key,
        colorScheme,
        reducedMotion,
        status: response?.status() ?? 0,
        violations: summarise(result.violations),
        incomplete: summarise(result.incomplete),
        bestPractice: summarise(result.bestPractice),
        consoleErrors,
      })

      /*
       * The structural regression checks, on the state. Reflow is not among them: it needs its own
       * 320 px context and these runs are the §12 axe viewport. Recorded as a gap in
       * docs/TESTING.md §3 rather than implied.
       */
      if (colorScheme === 'light' && reducedMotion === 'no-preference') {
        /** @type {Record<string, number>} */
        const statePopulations = { 'state-container-elements': onScreen.population }
        for (const result_ of [
          await checkProgressBarStrings(page, key),
          await checkTableRegions(page, key),
          await checkBusyAndLiveRegions(page, key, { loading: state.loading === true }),
          await checkLabelEchoes(page, key),
          await checkHiddenMeansHidden(page, key),
        ]) {
          findings.push(...result_.findings)
          Object.assign(statePopulations, result_.populations)
          for (const note of result_.notes ?? []) notes.push(`${key}: ${note}`)
        }
        populations[key] = statePopulations
        log(
          `  ${key.padEnd(52)} on screen=${onScreen.visible} ${onScreen.box} ` +
            `elements=${onScreen.population}`,
        )
      }

      await context.close()
    }
  }

  return { rows, findings, populations, notes, skipped }
}

/**
 * The key a state is recorded and printed under. Distinct from a route path so it can never be
 * mistaken for one in `baseline.json` or in the output.
 *
 * @param {{ route: string, id: string }} state
 * @returns {string}
 */
export function stateKey(state) {
  return `${state.route} [${state.id}]`
}
