/**
 * An element that says it is hidden must be hidden.
 *
 * Owner: qa-test-architect. `DIRECTIVE.md §17` (every state implemented AND tested),
 * `AGENTS.md §1.6` (nothing unfinished or wrong-state reachable by a user).
 *
 * WHY THIS IS A SEPARATE, WHOLE-SITE SWEEP RATHER THAN AN ASSERTION INSIDE ONE FLOW.
 *
 * `hidden` is a content attribute whose effect comes from ONE user-agent rule —
 * `[hidden] { display: none }` — and that rule has the lowest possible precedence. Any author rule
 * that sets `display` on the same element silently defeats it, and nothing in a byte-level check
 * can see that happen: the markup still says `hidden`, the HTML still validates, and axe still
 * returns clean because the resulting page is perfectly accessible — it is simply showing a state
 * the product did not mean to show.
 *
 * `apps/web/scripts/verify-dist.mjs` cannot catch this, and did not. The build is the reason this
 * suite runs a browser at all.
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document, getComputedStyle */

import { test, expect } from './harness.mjs'
import { emittedRoutes } from '../tests/tools/routes.mjs'

const ROUTES = emittedRoutes()

test.describe('hidden states stay hidden', () => {
  for (const route of ROUTES) {
    test(`${route} — every [hidden] element computes display:none`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' })

      const rendered = await page.evaluate(() =>
        [...document.querySelectorAll('[hidden]')]
          .map((element) => {
            const style = getComputedStyle(element)
            const rect = element.getBoundingClientRect()
            return {
              selector:
                `${element.tagName.toLowerCase()}` +
                `${String(element.className) === '' ? '' : `.${String(element.className).split(' ')[0]}`}` +
                `${element.hasAttribute('data-dp-state') ? `[data-dp-state="${element.getAttribute('data-dp-state')}"]` : ''}`,
              display: style.display,
              size: `${Math.round(rect.width)}×${Math.round(rect.height)}`,
              text: (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 70),
            }
          })
          .filter((entry) => entry.display !== 'none'),
      )

      expect(
        rendered.map(
          (entry) => `${entry.selector} display:${entry.display} ${entry.size} "${entry.text}"`,
        ),
        `${route}: element(s) carrying the \`hidden\` attribute are RENDERED. An author \`display\` ` +
          'rule outranks the user-agent `[hidden] { display: none }`, so the attribute has no ' +
          'effect and a state the product meant to conceal is on screen. Owner: ' +
          'frontend-ui-engineer (apps/web/src/layouts/**).',
      ).toEqual([])
    })
  }
})
