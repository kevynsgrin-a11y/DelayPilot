/**
 * Keyboard operation of the served routes.
 *
 * Owner: qa-test-architect. `DIRECTIVE.md §22` (keyboard-only flows, focus order, dialogs),
 * ported from the S3 scratch harness and from the walks `accessibility-lead` ran by hand in
 * `docs/ACCESSIBILITY.md §15.15` and §15.16.
 *
 * The stop COUNT is reported, never asserted. Asserting "44 stops on `/`" would be a snapshot of
 * today's markup dressed up as a rule: adding a link would fail the suite for no reason, and the
 * number tells you nothing a reader cares about. What a reader cares about is in `walk()`: every
 * stop is visibly focused, nothing is covered, and the walk ends.
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document, getComputedStyle, HTMLElement, HTMLDialogElement */

import { test, expect } from './harness.mjs'
import { walk } from './pages/keyboard.mjs'

const WALK_ROUTES = ['/', '/flight-status/', '/connection-risk/', '/passenger-rights/', '/404.html']

test.describe('keyboard walk', () => {
  for (const route of WALK_ROUTES) {
    test(`${route} — every stop is focusable, visible and escapable`, async ({
      page,
    }, testInfo) => {
      await page.goto(route, { waitUntil: 'networkidle' })
      const result = await walk(page)

      expect(result.stops.length, `${route}: no focusable element at all`).toBeGreaterThan(0)
      expect(
        result.withoutIndicator.map((stop) => `${stop.descriptor} → ${stop.indicatorDetail}`),
        `${route}: stop(s) with no focus indicator`,
      ).toEqual([])
      expect(
        result.obscured.map((stop) => stop.descriptor),
        `${route}: focused control(s) covered by another element (SC 2.4.11)`,
      ).toEqual([])
      expect(
        result.trapped,
        `${route}: focus never left the document in ${result.stops.length} Tab presses — keyboard trap (SC 2.1.2)`,
      ).toBe(false)

      testInfo.annotations.push({
        type: 'measured',
        description:
          `${route} (${testInfo.project.name}): ${result.stops.length} stops, 0 without an ` +
          `indicator, 0 obscured, no trap, ${result.browserInternal.length} browser-internal ` +
          'shadow stop(s) excluded',
      })
    })
  }

  test('the skip link is the first stop and targets the main landmark', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.keyboard.press('Tab')
    const first = await page.evaluate(() => ({
      className: String(document.activeElement?.className ?? ''),
      href: document.activeElement?.getAttribute('href'),
      target: document.querySelector('main')?.getAttribute('id'),
      mainTabIndex: document.querySelector('main')?.getAttribute('tabindex'),
    }))
    expect(first.className, 'the first tab stop is not the skip link').toContain('dpx-skip-link')
    expect(first.href, 'the skip link does not target #main').toBe('#main')
    expect(first.target, '<main> has no id for the skip link to reach').toBe('main')
    expect(first.mainTabIndex, '<main> is not programmatically focusable').toBe('-1')
  })

  test('the mega-nav disclosure opens with Enter and Escape restores focus', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const trigger = page.locator('[data-dp-menu-trigger]').first()
    /*
     * At 375 the mega-nav collapses into the drawer and the trigger is `hidden` — the drawer test
     * below covers that viewport. Skipping is the honest result: there is no disclosure to operate,
     * as opposed to one that failed to open.
     */
    test.skip(
      !(await trigger.isVisible()),
      'the mega-nav disclosure is not rendered at this viewport',
    )

    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await expect(page.locator('[data-dp-menu-panel]').first()).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
    const focusReturned = await page.evaluate(
      () => document.activeElement?.hasAttribute('data-dp-menu-trigger') === true,
    )
    expect(focusReturned, 'Escape closed the menu without returning focus to its trigger').toBe(
      true,
    )
  })

  test('the mobile drawer is modal, inert behind, and Escape restores focus', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/', { waitUntil: 'networkidle' })

    const open = page.locator('[data-dp-drawer-open]').first()
    await open.click()
    await expect(open).toHaveAttribute('aria-expanded', 'true')

    const state = await page.evaluate(() => {
      const dialog = document.querySelector('dialog')
      const behind = document.querySelector('.dpx-hero a')
      if (behind instanceof HTMLElement) behind.focus()
      return {
        open: dialog instanceof HTMLDialogElement && dialog.open,
        modal: dialog !== null && dialog.matches(':modal'),
        scrollLocked: getComputedStyle(document.documentElement).overflow === 'hidden',
        backgroundTookFocus: document.activeElement === behind,
      }
    })
    expect(state.open, 'the drawer did not open').toBe(true)
    expect(state.modal, 'the drawer is not a modal dialog, so the background is not inert').toBe(
      true,
    )
    expect(state.scrollLocked, 'the page behind the drawer still scrolls').toBe(true)
    expect(
      state.backgroundTookFocus,
      'a control behind the open drawer took focus — the background is not inert (F15)',
    ).toBe(false)

    await page.keyboard.press('Escape')
    await expect(open).toHaveAttribute('aria-expanded', 'false')
    const restored = await page.evaluate(
      () => document.activeElement?.hasAttribute('data-dp-drawer-open') === true,
    )
    expect(restored, 'Escape closed the drawer without returning focus to the menu button').toBe(
      true,
    )
  })

  test('the focus-indicator detector fires when the ring is removed — self-test', async ({
    page,
  }) => {
    /*
     * SEEDED VIOLATION. Strip the focus ring with a same-origin stylesheet and assert the walk
     * reports stops with no indicator. Without this, "0 stops without a focus indicator" could
     * equally mean "the detector reads a property that is always set".
     *
     * The rule is injected through a same-origin stylesheet URL rather than an inline `<style>`,
     * because `style-src 'self'` carries no `'unsafe-inline'` and an inline rule would simply be
     * refused — which is itself worth knowing, and is what `csp-and-errors.e2e.mjs` asserts.
     */
    await page.route('**/__seeded-no-focus-ring.css', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'text/css; charset=utf-8',
        body: '*:focus-visible, *:focus { outline: none !important; box-shadow: none !important; }',
      }),
    )
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.evaluate(async () => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/__seeded-no-focus-ring.css'
      const loaded = new Promise((done) => link.addEventListener('load', done, { once: true }))
      document.head.append(link)
      await loaded
    })

    const result = await walk(page, 12)
    expect(
      result.withoutIndicator.length,
      'the focus-indicator detector did not notice a stripped focus ring',
    ).toBeGreaterThan(0)
  })
})
