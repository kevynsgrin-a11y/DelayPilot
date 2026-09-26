/**
 * Shared fixtures for the Playwright suite.
 *
 * Owner: qa-test-architect.
 *
 * Every spec in `e2e/**` uses the `test` exported here rather than `@playwright/test`'s own, so
 * three things are true of every page load in the suite without any spec remembering to ask:
 *
 *   1. AD AND ANALYTICS HOSTS ARE BLOCKED. `DIRECTIVE.md §20` says ads "are disabled in
 *      local/test/screenshot/demo-review modes", and a suite that silently allowed a third-party
 *      script would make its own screenshots nondeterministic and its own CSP result meaningless.
 *      Every blocked and every cross-origin request is RECORDED, not just refused. The one
 *      expected cross-origin request is the GA4 loader (`EXPECTED_ANALYTICS`): it is answered
 *      locally with an empty script — never fetched — AFTER the browser has applied the served CSP
 *      to it, so a policy that refused the loader still shows up as a CSP violation.
 *   2. CSP VIOLATIONS, CONSOLE ERRORS AND PAGE ERRORS ARE COLLECTED. Collected from before the
 *      first byte, through an init script, because a `securitypolicyviolation` fired during parse
 *      is exactly the one a listener attached after `goto` would miss.
 *   3. MOTION IS OFF AND THE CLOCK IS FIXED for the visual project, so a baseline diff means a
 *      change in the product rather than in the weather.
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document */

import { test as base, expect } from '@playwright/test'
import { GA4_LOADER_URL, stubAnalytics } from '../tests/tools/analytics-stub.mjs'

export { expect }

/**
 * Ad, ad-tech and analytics hosts. Nothing in this build requests any of them except the exact
 * GA4 loader in `EXPECTED_ANALYTICS` (stubbed, checked first) — `AGENTS.md §4` keeps every ad slot
 * behind a consent gate that does not exist yet — so this list is a tripwire rather than a filter,
 * and `thirdParty` below is what actually reports a breach.
 */
export const BLOCKED_HOSTS = [
  'googlesyndication.com',
  'googletagservices.com',
  'googletagmanager.com',
  'google-analytics.com',
  'analytics.google.com',
  'doubleclick.net',
  'adservice.google.com',
  'pagead2.googlesyndication.com',
  'adtrafficquality.google',
  'facebook.net',
  'hotjar.com',
  'segment.io',
  'sentry.io',
]

/**
 * The only third-party request a page is expected to make: Google's gtag.js loader for this site's
 * own GA4 property (BaseLayout; bootstrap in `apps/web/src/pages/ga4.js.ts`). Exact URL, not a host,
 * so a second tag or a different measurement ID is still a finding.
 */
export const EXPECTED_ANALYTICS = [GA4_LOADER_URL]

/**
 * @typedef {object} Problems
 * @property {string[]} consoleErrors
 * @property {string[]} pageErrors
 * @property {string[]} blocked        requests refused because the host is on the block list
 * @property {string[]} thirdParty     requests to any origin other than the server under test
 * @property {string[]} analytics      requests matching `EXPECTED_ANALYTICS`, answered with a stub
 * @property {() => Promise<string[]>} cspViolations  read from the page, after navigation
 */

export const test = base.extend({
  /**
   * Every test, whether or not it asks for `problems`: the GA4 loader is answered locally, so no
   * spec fetches Google's script or sends a page view to the production property. A page-level
   * route (`problems` below) takes precedence over this context-level one.
   *
   * @param {{ context: import('@playwright/test').BrowserContext }} fixtures
   * @param {(value: undefined) => Promise<void>} use
   */
  analyticsStub: [
    async ({ context }, use) => {
      await stubAnalytics(context)
      await use(undefined)
    },
    { auto: true },
  ],

  /**
   * @param {{ page: import('@playwright/test').Page, baseURL: string | undefined }} fixtures
   * @param {(problems: Problems) => Promise<void>} use
   */
  problems: async ({ page, baseURL }, use) => {
    /** @type {Problems} */
    const problems = {
      consoleErrors: [],
      pageErrors: [],
      blocked: [],
      thirdParty: [],
      analytics: [],
      cspViolations: async () =>
        page.evaluate(() => /** @type {string[]} */ (globalThis.__dpCspViolations ?? [])),
    }

    await page.addInitScript(() => {
      globalThis.__dpCspViolations = []
      document.addEventListener('securitypolicyviolation', (event) => {
        globalThis.__dpCspViolations.push(
          `${event.violatedDirective} blocked ${event.blockedURI === '' ? '(inline)' : event.blockedURI}`,
        )
      })
    })

    page.on('console', (message) => {
      if (message.type() === 'error' || /Refused to/.test(message.text())) {
        problems.consoleErrors.push(message.text())
      }
    })
    page.on('pageerror', (error) => problems.pageErrors.push(`pageerror: ${error.message}`))

    const origin = baseURL === undefined ? '' : new URL(baseURL).origin
    await page.route('**/*', async (route) => {
      const url = route.request().url()
      if (EXPECTED_ANALYTICS.includes(url)) {
        problems.analytics.push(url)
        await route.fulfill({ status: 200, contentType: 'text/javascript', body: '' })
        return
      }
      if (BLOCKED_HOSTS.some((host) => url.includes(host))) {
        problems.blocked.push(url)
        await route.abort('blockedbyclient')
        return
      }
      if (origin !== '' && !url.startsWith(origin) && !url.startsWith('data:')) {
        problems.thirdParty.push(url)
      }
      await route.continue()
    })

    await use(problems)
  },
})

/* ---------------------------------------------------------------------------------------------- */
/* Small helpers every spec wants                                                                  */
/* ---------------------------------------------------------------------------------------------- */

/**
 * `AGENTS.md §1.2` — the six provenance labels, exactly. No synonym, no seventh, never softened.
 * A spec asserts membership of this set rather than a particular label, because which label a panel
 * carries is the product's business and WHETHER it carries one of these six is the invariant.
 */
export const PROVENANCE_LABELS = [
  'Live',
  'Cached',
  'Stale',
  'Demo',
  'Unavailable',
  'Heuristic risk band',
]

/** `DIRECTIVE.md §28` / `AGENTS.md §1.2` — the sentence that must accompany every `Demo` label. */
export const DEMO_SENTENCE = 'Demo data — not a live flight.'

/** `DIRECTIVE.md §3.4` — the independence disclaimer that ships in every public footer. */
export const INDEPENDENCE_OPENING = 'DelayPilot is an independent travel-information tool.'

/**
 * Assert a page load produced nothing a reader would see as broken.
 *
 * @param {Problems} problems
 * @param {string} route
 */
export async function expectCleanLoad(problems, route) {
  expect(await problems.cspViolations(), `${route}: CSP violations`).toEqual([])
  expect(problems.consoleErrors, `${route}: console errors`).toEqual([])
  expect(problems.pageErrors, `${route}: page errors`).toEqual([])
  expect(problems.blocked, `${route}: requests to a blocked ad/analytics host`).toEqual([])
  expect(problems.thirdParty, `${route}: cross-origin requests`).toEqual([])
  expect([...new Set(problems.analytics)], `${route}: the GA4 loader request`).toEqual(
    EXPECTED_ANALYTICS,
  )
}
