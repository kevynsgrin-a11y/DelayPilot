/**
 * The keyboard walk, as a reusable measurement.
 *
 * Owner: qa-test-architect. `DIRECTIVE.md §22` (accessibility: keyboard-only flows, focus order),
 * `docs/ACCESSIBILITY.md §15.6` and §15.15, where the walk was performed by hand and returned
 * "44 stops on `/`, 26 on `/flight-status/`; 0 stops without a focus indicator, 0 obscured, 0
 * traps, focus leaves the document at the end of every walk".
 *
 * THE THREE THINGS A WALK CAN ACTUALLY DECIDE, and how each is measured here:
 *
 *   · NO MISSING FOCUS INDICATOR. `tokens.css §8` draws a 2 px ring with a 2 px offset plus a halo
 *     `box-shadow` on `:focus-visible`. Tab produces `:focus-visible`, so the presence of either an
 *     outline with non-zero width or a box-shadow is the indicator being drawn. This does not
 *     re-measure the ring's CONTRAST — `accessibility-lead` did that from rendered pixels
 *     (§15.15: tightest 3.52:1) and a token change is their gate, not this one's.
 *   · NOTHING OBSCURED (SC 2.4.11). The focused element's own centre must hit itself: a sticky
 *     header or an open overlay that covers the control a reader just tabbed to is the defect, and
 *     `elementFromPoint` is what a pointer would hit at that spot.
 *   · NO TRAP (SC 2.1.2). Focus must eventually leave the document. A cap is the only way to
 *     express "eventually" in a test, and a walk that hits the cap is reported as a TRAP rather
 *     than silently truncated — the failure mode of a trap check is to look like a long page.
 *
 * Deliberately NOT measured here: focus ORDER against reading order, and accessible-name quality.
 * Both need a human judgement about meaning (`docs/ACCESSIBILITY.md §12`), and a test that asserted
 * the current order would be a snapshot of today's markup rather than a rule.
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document, window, getComputedStyle, HTMLElement */

/**
 * @typedef {object} Stop
 * @property {number} index
 * @property {string} descriptor
 * @property {boolean} hasIndicator
 * @property {boolean} obscured
 * @property {boolean} browserInternal
 * @property {string} indicatorDetail
 */

/**
 * @typedef {object} WalkResult
 * @property {Stop[]} stops
 * @property {boolean} trapped      true when the cap was hit before focus left the document
 * @property {Stop[]} withoutIndicator
 * @property {Stop[]} browserInternal  stops inside a closed shadow part the page cannot style
 * @property {Stop[]} obscured
 */

/**
 * Tab through a page from the top and measure every stop.
 *
 * @param {import('@playwright/test').Page} page
 * @param {number} [cap] maximum Tab presses before the walk is declared a trap
 * @returns {Promise<WalkResult>}
 */
export async function walk(page, cap = 160) {
  /** @type {Stop[]} */
  const stops = []
  let trapped = true

  /* Start from the very top of the document so the first Tab lands on the skip link. */
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    window.scrollTo(0, 0)
  })

  for (let index = 0; index < cap; index += 1) {
    await page.keyboard.press('Tab')
    const stop = await page.evaluate(() => {
      const element = document.activeElement
      if (element === null || element === document.body || element === document.documentElement) {
        return null
      }

      const style = getComputedStyle(element)
      const outlineWidth = Number.parseFloat(style.outlineWidth)
      const hasOutline =
        style.outlineStyle !== 'none' && Number.isFinite(outlineWidth) && outlineWidth > 0
      const hasShadow = style.boxShadow !== 'none' && style.boxShadow !== ''

      /*
       * A BROWSER-INTERNAL STOP. `<input type="date">` holds three of its own tab stops (month,
       * day, year) and then a fourth on the closed-shadow calendar-picker indicator. At that fourth
       * stop `document.activeElement` is still the input, but the input matches `:focus-within` and
       * NOT `:focus` — focus is on a part the page cannot select, cannot style, and does not own.
       * Chromium draws its own indicator there. Holding the product responsible for a ring it has
       * no way to paint would be a false failure, so the stop is counted, hit-tested, and excluded
       * from the indicator assertion with its reason recorded.
       */
      const browserInternal = !element.matches(':focus') && element.matches(':focus-within')

      const rect = element.getBoundingClientRect()
      /*
       * A control smaller than 4 px in either direction is a visually-hidden technique (the 1 × 1
       * clipped `<legend>`, a clipped radio inside its own `<label>`). Hit-testing its centre would
       * measure the wrong element, so the obscured check is scoped to controls a pointer can reach.
       */
      const measurable = rect.width >= 4 && rect.height >= 4
      let obscured = false
      if (measurable) {
        const x = Math.min(Math.max(rect.left + rect.width / 2, 1), window.innerWidth - 1)
        const y = Math.min(Math.max(rect.top + rect.height / 2, 1), window.innerHeight - 1)
        const hit = document.elementFromPoint(x, y)
        obscured =
          hit === null || !(hit === element || element.contains(hit) || hit.contains(element))
      }

      const label =
        element.getAttribute('aria-label') ??
        element.textContent?.replace(/\s+/g, ' ').trim().slice(0, 40) ??
        ''
      return {
        descriptor:
          `${element.tagName.toLowerCase()}` +
          `${element.id === '' ? '' : `#${element.id}`}` +
          `${String(element.className) === '' ? '' : `.${String(element.className).split(' ')[0]}`}` +
          ` "${label}"`,
        hasIndicator: hasOutline || hasShadow,
        browserInternal,
        indicatorDetail:
          `outline=${style.outlineStyle} ${style.outlineWidth} shadow=${style.boxShadow.slice(0, 40)}` +
          (browserInternal ? ' [browser-internal shadow part]' : ''),
        obscured,
      }
    })

    if (stop === null) {
      trapped = false
      break
    }
    stops.push({ index, ...stop })
  }

  return {
    stops,
    trapped,
    withoutIndicator: stops.filter((stop) => !stop.hasIndicator && !stop.browserInternal),
    browserInternal: stops.filter((stop) => stop.browserInternal),
    obscured: stops.filter((stop) => stop.obscured),
  }
}
