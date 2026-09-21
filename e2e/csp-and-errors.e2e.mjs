/**
 * Every served route, loaded under the real Content-Security-Policy.
 *
 * Owner: qa-test-architect. `DIRECTIVE.md §22` (security: CSP present and narrow per route class),
 * `AGENTS.md §1.6` (nothing reachable is broken).
 *
 * WHAT THIS PROVES THAT A BUILD-TIME CHECK CANNOT. `apps/web/scripts/verify-dist.mjs` already
 * refuses an inline `<script>`, an inline `<style>` and a `style="…"` attribute at build time, and
 * prints the hash the header would need. That is a check on the BYTES. This is a check on the
 * BROWSER: it loads each page under the policy `_headers` actually serves and asks whether the
 * policy refused anything the page needs. Those are different questions — a script the build
 * considers external can still be refused if the policy's `script-src` does not cover its origin,
 * and a stylesheet can be refused into an unstyled page that every byte-level check calls clean.
 *
 * The last test in this file seeds a violation and asserts the detector fires, because a suite that
 * has never seen its own check fail is a suite that might be measuring nothing.
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document */

import { test, expect, expectCleanLoad } from './harness.mjs'
import { emittedRoutes } from '../tests/tools/routes.mjs'
import { servedPolicy, DEFAULT_DIST } from '../tests/tools/serve-dist.mjs'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

const ROUTES = emittedRoutes()
const POLICY = servedPolicy(
  existsSync(join(DEFAULT_DIST, '_headers')) ? join(DEFAULT_DIST, '_headers') : undefined,
)

test.describe('CSP and page health', () => {
  test('the build emits routes to test', () => {
    /*
     * A sweep over zero routes passes every assertion below it. `apps/web/dist` is rebuilt by other
     * agents, so this is a real failure mode and not a hypothetical one.
     */
    expect(
      ROUTES.length,
      'no HTML emitted under apps/web/dist — run `pnpm build` first',
    ).toBeGreaterThan(0)
    expect(
      ROUTES,
      'the homepage is missing from dist — this is a partial or in-flight build',
    ).toContain('/')
  })

  for (const route of ROUTES) {
    test(`${route} loads clean under the served policy`, async ({ page, problems }) => {
      const response = await page.goto(route, { waitUntil: 'networkidle' })

      expect(response, `${route}: no response`).not.toBeNull()
      expect(response?.status(), `${route}: status`).toBe(200)

      /* The policy travels with the response, not just with the repository. */
      const header = response?.headers()['content-security-policy']
      expect(header, `${route}: no Content-Security-Policy header`).toBeDefined()
      expect(header, `${route}: served policy differs from apps/web/public/_headers`).toBe(POLICY)

      await expectCleanLoad(problems, route)

      /* Every page carries the app manifest; a page without it bypassed the shell. */
      const manifest = await page.evaluate(async () => {
        const link = document.querySelector('link[rel="manifest"]')
        if (link === null) return { href: null, status: 0 }
        const href = link.getAttribute('href')
        const res = await fetch(href ?? '', { credentials: 'omit' })
        return { href, status: res.status }
      })
      expect(manifest.href, `${route}: no <link rel="manifest">`).toBe('/manifest.webmanifest')
      expect(manifest.status, `${route}: the manifest did not load under the policy`).toBe(200)
    })
  }

  test('the CSP detector fires on a seeded inline script — self-test', async ({
    page,
    problems,
  }) => {
    /*
     * SEEDED VIOLATION. An inline `<script>` is exactly what `script-src 'self'` (no
     * `'unsafe-inline'`, no hashes) must refuse. If this test ever passes without a violation being
     * recorded, every "0 CSP violations" line above is measuring an empty list.
     */
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.evaluate(() => {
      const script = document.createElement('script')
      script.textContent = 'globalThis.__dpSeededInlineScriptRan = true'
      document.body.append(script)
    })

    const violations = await problems.cspViolations()
    expect(violations.join(' | '), 'the policy did not refuse a seeded inline script').toMatch(
      /script-src/,
    )
    const ran = await page.evaluate(() => globalThis.__dpSeededInlineScriptRan === true)
    expect(ran, 'a seeded inline script EXECUTED — the page is not under the policy').toBe(false)
  })
})
