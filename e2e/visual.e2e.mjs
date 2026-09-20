/**
 * Visual regression — `DIRECTIVE.md §22` ("375 / 768 / 1024 / 1440 px, light and dark, every major
 * state") and `§18.7`.
 *
 * Owner: qa-test-architect. Run as the `visual` Playwright project: `pnpm exec playwright test
 * --project=visual`.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * WHAT IS BASELINED, AND WHY EXACTLY THIS SET
 *
 *   · BREAKPOINT FRAMES — the six state-bearing routes, at all four widths, in both themes. The
 *     first screen, not the whole page: the breakpoints decide the header, the hero and the primary
 *     lookup, which is what a reader meets, and a full-page homepage baseline is a 2 MB PNG that
 *     changes whenever any of fifteen sections moves. 48 frames.
 *   · REDUCED MOTION AS ITS OWN STATE — ADR 0003 rule 4 makes `prefers-reduced-motion: reduce` a
 *     state the page can be WRONG in, not a variant of another one, so it gets its own baselines
 *     rather than a flag on an existing shot. 8 frames, plus a computed-style assertion on every
 *     visual route that ZERO animations run under `reduce`, which is a stronger claim than a
 *     photograph can make.
 *   · §17 STATE PANELS — the three demonstration-cockpit panels that carry the states this tree can
 *     actually reach (`demo`, `stale`, `heuristic risk band`, `connection protected`, rights
 *     `may apply` / `cause unknown`), element-scoped at the two widths where their layout genuinely
 *     differs — 343 px single column against 1040 px — in both themes. 12 frames.
 *
 * WHAT IS DELIBERATELY NOT BASELINED. Every `§17` state that needs a contract, a provider, a trip
 * or a session: `already missed`, `offline`, `error boundary`, `maintenance`, `consent required`,
 * `ad blocked`, everything under Trip, Billing beyond `not configured`, and Notifications. They are
 * not reachable on this tree (`docs/ACCESSIBILITY.md §15.1` reached the same conclusion
 * independently) and a baseline of a state nobody can reach would certify nothing.
 *
 * DETERMINISM
 *   · `animations: 'disabled'` (Playwright's default for `toHaveScreenshot`) cancels the ambient
 *     motifs and fast-forwards finite animations, so a frame is not a photograph of an arbitrary
 *     moment. That is ORTHOGONAL to `prefers-reduced-motion`, which changes which CSS applies —
 *     hence both dimensions exist here.
 *   · Fonts are awaited through `document.fonts.ready`: Geist is self-hosted, and a frame taken
 *     mid-swap differs from one taken after in every glyph on the page.
 *   · Ads and analytics are blocked by the shared harness, and this build makes zero cross-origin
 *     requests, so nothing outside the repository can move a pixel.
 *
 * TOLERANCE — one sentence, as asked: `maxDiffPixels: 0`, because two consecutive runs of this
 * suite on this toolchain produce byte-identical PNGs, so any non-zero diff is a real change in the
 * product rather than noise this suite would be hiding by rounding it away.
 *
 * UPDATING A BASELINE
 *   pnpm exec playwright test --project=visual --update-snapshots=changed -g "<the one test>"
 * Never a blanket `--update-snapshots`. A diff is a finding for the owning agent first; the
 * baseline moves only after that agent has agreed the new rendering is the intended one, and the
 * commit that moves it says which change it belongs to.
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document, window */

import { test, expect } from './harness.mjs'
import { VISUAL_ROUTES } from '../tests/tools/routes.mjs'

const WIDTHS = [375, 768, 1024, 1440]
const THEMES = /** @type {const} */ (['light', 'dark'])

/** Height is fixed so a frame is the same surface at every width. */
const height = (width) => (width < 768 ? 812 : 900)

/**
 * Settle a page for capture: layout done, fonts resolved, lazy content in.
 *
 * @param {import('@playwright/test').Page} page
 */
async function settle(page) {
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => {
    window.scrollTo(0, 0)
  })
}

test.describe('visual regression', () => {
  test.describe('breakpoint frames', () => {
    for (const route of VISUAL_ROUTES) {
      for (const width of WIDTHS) {
        for (const theme of THEMES) {
          test(`${route.name} ${width} ${theme}`, async ({ page }) => {
            await page.emulateMedia({ colorScheme: theme, reducedMotion: 'no-preference' })
            await page.setViewportSize({ width, height: height(width) })
            await page.goto(route.path, { waitUntil: 'networkidle' })
            await settle(page)
            await expect(page).toHaveScreenshot(`${route.name}-${width}-${theme}.png`, {
              maxDiffPixels: 0,
            })
          })
        }
      }
    }
  })

  test.describe('reduced motion — its own state, not a variant', () => {
    for (const width of WIDTHS) {
      for (const theme of THEMES) {
        test(`home ${width} ${theme} reduce`, async ({ page }) => {
          await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' })
          await page.setViewportSize({ width, height: height(width) })
          await page.goto('/', { waitUntil: 'networkidle' })
          await settle(page)
          await expect(page).toHaveScreenshot(`home-${width}-${theme}-reduce.png`, {
            maxDiffPixels: 0,
          })
        })
      }
    }

    test('zero animations run under reduce, on every visual route', async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.setViewportSize({ width: 1440, height: 900 })

      /** @type {string[]} */
      const running = []
      for (const route of VISUAL_ROUTES) {
        await page.goto(route.path, { waitUntil: 'networkidle' })
        await settle(page)
        const animations = await page.evaluate(() =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === 'running')
            .map((animation) => {
              const effect = animation.effect
              const target = effect !== null && 'target' in effect ? effect.target : null
              return `${animation.constructor.name} on ${
                target === null
                  ? '?'
                  : `${target.tagName.toLowerCase()}.${String(target.className).split(' ')[0]}`
              }`
            }),
        )
        running.push(...animations.map((entry) => `${route.path}: ${entry}`))
      }

      expect(
        running,
        'animation(s) still running under prefers-reduced-motion: reduce — ADR 0003 rule 4 ' +
          'requires every permitted item to collapse to a static frame. Owner: ' +
          'frontend-ui-engineer / brand-design-director.',
      ).toEqual([])
    })
  })

  test.describe('§17 state panels', () => {
    /** @type {{ name: string, path: string, selector: string, state: string }[]} */
    const PANELS = [
      {
        name: 'cockpit-segment',
        path: '/',
        selector: 'article.dpp-segment',
        state: 'demo · delayed · airline-stated reason',
      },
      {
        name: 'cockpit-connection',
        path: '/',
        selector: 'section.dpp-connection',
        state: 'connection protected · heuristic risk band · the whole of T beside W and S',
      },
      {
        name: 'cockpit-rights',
        path: '/',
        selector: 'section.dpp-rights',
        state: 'rights may apply · cause unknown · demo rule set',
      },
    ]

    for (const panel of PANELS) {
      for (const width of [375, 1440]) {
        for (const theme of THEMES) {
          test(`${panel.name} ${width} ${theme}`, async ({ page }) => {
            await page.emulateMedia({ colorScheme: theme, reducedMotion: 'no-preference' })
            await page.setViewportSize({ width, height: height(width) })
            await page.goto(panel.path, { waitUntil: 'networkidle' })
            await settle(page)
            const element = page.locator(panel.selector).first()
            await expect(
              element,
              `${panel.selector} is not rendered — ${panel.state}`,
            ).toBeVisible()
            await expect(element).toHaveScreenshot(`${panel.name}-${width}-${theme}.png`, {
              maxDiffPixels: 0,
            })
          })
        }
      }
    }
  })
})
