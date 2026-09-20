/**
 * The `DIRECTIVE.md §17` states the homepage lookup can actually reach, driven through the UI.
 *
 * Owner: qa-test-architect.
 *
 * DRIVEN THROUGH THE UI, NEVER THROUGH THE DOM. The states below are reached by typing into the
 * form and submitting it, exactly as a traveler would. Setting `hidden` on a panel directly would
 * prove the panel renders and nothing about whether a person can get to it.
 *
 * WHAT THIS BUILD CAN REACH. No provider contract exists yet (Phase 4), so the lookup's terminal
 * state is `provider unavailable` — and that is the point of the last test here: the honest
 * degradation is a LABELLED state, never a plausible-looking answer. `AGENTS.md §1.5` and §1.1.
 * The remaining `§17` states — `multiple matches`, `no match`, `stale`, `partial data`,
 * `conflicting providers` — are rendered as static demonstration panels elsewhere on the served
 * routes and are covered by the visual baselines and the axe sweep, not by this spec. They are not
 * claimed as driven flows.
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document, HTMLFormElement */

import { test, expect, PROVENANCE_LABELS, DEMO_SENTENCE, INDEPENDENCE_OPENING } from './harness.mjs'

test.describe('§17 lookup states on the homepage', () => {
  test('initial — the form is present and no result state is shown', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    await expect(page.locator('form[data-dp-lookup]')).toBeVisible()
    await expect(page.locator('.dpx-lookup [data-dp-state="initial"]')).toBeVisible()
    await expect(page.locator('.dpx-lookup [data-dp-state="searching"]')).toBeHidden()
    await expect(page.locator('.dpx-lookup [data-dp-state="unavailable"]')).toBeHidden()
    await expect(page.locator('.dpx-lookup [data-dp-errors]')).toBeHidden()
  })

  test('invalid flight — the error summary appears, takes focus, and wires each field', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.locator('form[data-dp-lookup] button[type="submit"]').click()

    const summary = page.locator('.dpx-lookup [data-dp-errors]')
    await expect(summary).toBeVisible()
    await expect(summary.locator('li')).not.toHaveCount(0)

    const focused = await page.evaluate(
      () => document.activeElement?.hasAttribute('data-dp-errors') === true,
    )
    expect(
      focused,
      'the error summary did not take focus, so a screen-reader user is not told',
    ).toBe(true)

    const field = page.locator('[data-dp-field="airline"]')
    await expect(field).toHaveAttribute('aria-invalid', 'true')
    const describedBy = await field.getAttribute('aria-describedby')
    const id = await field.getAttribute('id')
    expect(
      describedBy ?? '',
      'the invalid field does not point at its own error message',
    ).toContain(`${id}-error`)
    /* Attribute selector, not `#id`: the ids are Astro-generated and `CSS.escape` is a DOM API. */
    await expect(page.locator(`[id="${id}-error"]`)).toHaveText(/\S/)
  })

  test('searching then provider unavailable — labelled, focused, with no invented value', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await page.locator('[data-dp-field="airline"]').fill('Demo Airline')
    await page.locator('[data-dp-field="flightNumber"]').fill('101')
    await page.locator('[data-dp-field="date"]').fill('2026-03-14')

    /*
     * The searching state is transient by design. It is observed synchronously with the submit,
     * inside the page, rather than waited for afterwards: polling for it from the test side would
     * be a race, and `waitForTimeout` would be the flake cure this charter forbids.
     */
    const searching = await page.evaluate(() => {
      const form = document.querySelector('form[data-dp-lookup]')
      const panel = document.querySelector('.dpx-lookup [data-dp-state="searching"]')
      if (!(form instanceof HTMLFormElement) || panel === null) return null
      form.requestSubmit()
      return {
        shown: !panel.hasAttribute('hidden'),
        busy: panel.querySelector('[aria-busy="true"]') !== null,
      }
    })
    expect(searching, 'the lookup form or its searching panel is missing').not.toBeNull()
    expect(searching?.shown, 'submitting did not show the searching state').toBe(true)
    expect(searching?.busy, 'the searching state carries no aria-busy region').toBe(true)

    const unavailable = page.locator('.dpx-lookup [data-dp-state="unavailable"]')
    await expect(unavailable).toBeVisible()
    await expect(page.locator('.dpx-lookup [data-dp-state="searching"]')).toBeHidden()

    const focused = await page.evaluate(
      () => document.activeElement?.getAttribute('data-dp-state') === 'unavailable',
    )
    expect(focused, 'the resolved state did not take focus').toBe(true)

    /* `AGENTS.md §1.2`: the datum carries a provenance label, and it is one of exactly six. */
    const chip = unavailable.locator('[data-provenance]').first()
    await expect(chip).toBeVisible()
    const chipText = ((await chip.textContent()) ?? '').replace(/\s+/g, ' ').trim()
    expect(
      PROVENANCE_LABELS,
      `the provenance chip reads "${chipText}", which is not one of the AGENTS.md §1.2 six`,
    ).toContain(chipText)
    expect(chipText, 'a failed lookup must degrade to Unavailable, never to a value').toBe(
      'Unavailable',
    )

    /*
     * `AGENTS.md §1.1`: no invented operational fact. A failed lookup has no gate, no terminal, no
     * estimate and no percentage, so none of those may appear in the panel a reader is now looking
     * at. This asserts the ABSENCE of fabrication rather than the presence of a particular string —
     * the copy is `ux-copy-steward`'s and may change; the rule may not.
     */
    const text = ((await unavailable.textContent()) ?? '').replace(/\s+/g, ' ')
    expect(text, 'a percentage appeared in a state where nothing was measured').not.toMatch(
      /\d+\s*%/,
    )
    expect(text, 'a gate was named for a flight that was never resolved').not.toMatch(
      /\bgate\s+[A-Z]?\d+\b/i,
    )
    expect(text, 'a terminal was named for a flight that was never resolved').not.toMatch(
      /\bterminal\s+[A-Z0-9]\b/i,
    )
  })

  test('the footer carries the §3.4 independence disclaimer as rendered text', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    const disclaimer = page.locator('footer').getByText(INDEPENDENCE_OPENING, { exact: false })
    await expect(disclaimer).toBeVisible()
  })

  test('every Demo label on the homepage is accompanied by the §28 sentence', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })

    const counts = await page.evaluate((sentence) => {
      const chips = [...document.querySelectorAll('[data-provenance="demo"]')]
      const body = document.body.textContent?.replace(/\s+/g, ' ') ?? ''
      return {
        chips: chips.length,
        sentences: body.split(sentence).length - 1,
      }
    }, DEMO_SENTENCE)

    expect(counts.chips, 'the homepage demonstration carries no Demo label at all').toBeGreaterThan(
      0,
    )
    expect(
      counts.sentences,
      `${counts.chips} Demo label(s) and ${counts.sentences} occurrence(s) of "${DEMO_SENTENCE}" — ` +
        'DIRECTIVE.md §28 requires the sentence with the label',
    ).toBeGreaterThan(0)
  })
})
