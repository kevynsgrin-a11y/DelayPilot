/**
 * `DIRECTIVE.md §20` ad placement, asserted against the rendered page.
 *
 * Owner: qa-test-architect. Rules read from `apps/web/scripts/verify-dist.mjs` and restated for
 * the live DOM in `e2e/pages/ad-placement.mjs`, where the reasoning lives.
 *
 * NO AD SLOT IS RENDERED ANYWHERE IN THIS BUILD, and that is the honest state: `AdSlotShell`
 * returns `null` until a consent platform and a real slot id exist, so every "0 violations" below
 * is a check over zero slots. A suite that stopped there would be worthless — it would report green
 * on the day the first slot lands in the worst possible place.
 *
 * So the file does three things, in this order:
 *   1. asserts the current state honestly: zero slots on every served route;
 *   2. SEEDS a real ad slot into each of the six forbidden positions on the rendered page and
 *      asserts the corresponding clause fires — six proofs that the detector is wired;
 *   3. seeds one slot in a PERMITTED position and asserts it fires nothing, so the detector is not
 *      simply returning a violation for every slot it sees.
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document */

import { test, expect } from './harness.mjs'
import { emittedRoutes } from '../tests/tools/routes.mjs'
import { auditAdPlacement, AD_SELECTOR } from './pages/ad-placement.mjs'

const ROUTES = emittedRoutes()

/**
 * Insert a slot into the page and return the audit. The slot is the real shape `AdSlotShell`
 * emits — `[data-ad-placement]` on a `div` — so the detector is exercised with the markup it will
 * actually meet rather than a stand-in.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} recipe a key understood by the in-page placer below
 */
async function seedSlot(page, recipe) {
  const placed = await page.evaluate((where) => {
    const slot = document.createElement('div')
    slot.setAttribute('data-ad-placement', 'seeded_for_test')
    slot.className = 'dp-ad-slot'
    slot.style.height = '90px'
    slot.textContent = 'Advertisement'

    /** Create a §20 named control so clause 5 has something to be adjacent to. */
    const namedControl = () => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = 'Contact the airline'
      return button
    }

    switch (where) {
      case 'above-search': {
        const form = document.querySelector('form[data-dp-lookup]')
        if (form === null) return false
        form.parentElement?.insertBefore(slot, form)
        return true
      }
      case 'inside-form': {
        const form = document.querySelector('form[data-dp-lookup]')
        if (form === null) return false
        form.append(slot)
        return true
      }
      case 'warning-action': {
        const state = document.querySelector('.dpp-state')
        if (state === null) return false
        const action = document.createElement('p')
        action.className = 'dp-callout__action'
        action.append(namedControl())
        state.append(action, slot)
        return true
      }
      case 'inside-rights': {
        const rights = document.querySelector('.dpp-rights')
        if (rights === null) return false
        rights.append(slot)
        return true
      }
      case 'beside-named-control': {
        /* A control OUTSIDE any rights card or checklist — the case the container rule misses. */
        const host = document.querySelector('main')
        if (host === null) return false
        const wrapper = document.createElement('div')
        wrapper.append(namedControl(), slot)
        host.append(wrapper)
        return true
      }
      case 'inside-actions': {
        const actions = document.querySelector('.dpp-actions')
        if (actions === null) return false
        actions.append(slot)
        return true
      }
      case 'permitted': {
        /*
         * A permitted placement: after the complete content, inside its own sectioning element, with
         * no named control near it and below the primary search.
         */
        const host = document.querySelector('main')
        if (host === null) return false
        const section = document.createElement('section')
        section.append(document.createElement('h2'), slot)
        host.append(section)
        return true
      }
      default:
        return false
    }
  }, recipe)
  expect(placed, `could not seed an ad slot for "${recipe}" — the anchor element is missing`).toBe(
    true,
  )
  return auditAdPlacement(page)
}

test.describe('§20 ad placement', () => {
  for (const route of ROUTES) {
    test(`${route} — no ad slot in any forbidden position`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'networkidle' })
      const audit = await auditAdPlacement(page)
      expect(
        audit.violations.map((violation) => `[${violation.clause}] ${violation.detail}`),
        `${route}: DIRECTIVE.md §20 / AGENTS.md §4 placement violation(s)`,
      ).toEqual([])
    })
  }

  test('no ad slot is rendered anywhere in this build — the honest current state', async ({
    page,
  }) => {
    /** @type {string[]} */
    const withSlots = []
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'domcontentloaded' })
      const count = await page.locator(AD_SELECTOR).count()
      if (count > 0) withSlots.push(`${route} (${count})`)
    }
    expect(
      withSlots,
      'an ad slot is rendered. That is not forbidden in itself — but AGENTS.md §4 requires consent ' +
        'gating and DIRECTIVE.md §20 requires a labelled, dimension-reserving slot, and neither ' +
        'exists yet. Owner: monetization-partnerships-engineer.',
    ).toEqual([])
  })

  test.describe('the detector fires — seeded violations', () => {
    /** @type {[string, string, string][]} name · recipe · route */
    const cases = [
      ['above the primary search', 'above-search', '/'],
      ['inside a form', 'inside-form', '/'],
      ['between a warning and its action', 'warning-action', '/'],
      ['inside a rights card', 'inside-rights', '/'],
      ['adjacent to a named crisis control', 'beside-named-control', '/'],
      ['inside or adjacent to an action checklist', 'inside-actions', '/'],
    ]

    for (const [clause, recipe, route] of cases) {
      test(`clause: ${clause}`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'networkidle' })
        const audit = await seedSlot(page, recipe)
        expect(audit.slots, 'the seeded slot was not found by the detector').toBeGreaterThan(0)
        expect(
          audit.violations.map((violation) => violation.clause),
          `seeding an ad slot "${recipe}" did not trip the "${clause}" clause`,
        ).toContain(clause)
      })
    }

    test('a permitted placement trips nothing', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' })
      const audit = await seedSlot(page, 'permitted')
      expect(audit.slots, 'the seeded slot was not found by the detector').toBe(1)
      expect(
        audit.violations.map((violation) => `[${violation.clause}] ${violation.detail}`),
        'the detector reports a violation for a slot in a permitted position — it is not measuring ' +
          'position, it is just counting slots',
      ).toEqual([])
    })
  })
})
