/**
 * The five non-axe regression assertions of `docs/ACCESSIBILITY.md §12`.
 *
 * Owner: qa-test-architect. Specified by `accessibility-lead`.
 *
 * EACH ONE IS A DEFECT AXE RETURNED CLEAN ON, and each has now been fixed exactly once. That is the
 * entire reason they exist as code rather than as prose in a review: a rule that only lives in a
 * reviewer's head gets re-broken by the next refactor, and axe will keep saying the page is fine
 * while it happens.
 *
 *   1. 320 px reflow — B8. Two routes scrolled sideways with zero axe violations (SC 1.4.10).
 *   2. Three distinct progressbar strings — B9 and F27. A meter announced as measuring something
 *      it does not measure (SC 2.4.6), and the "Risk band, Risk band" stutter beside it.
 *   3. Prose tables in a named, keyboard-operable region with scoped headers — F31.
 *   4. No surviving `aria-busy`, no live region on a served route — F28 and §15.7.
 *   5. No accessible name ending in its own `<dt>`'s label word — F29, and F39 one component over.
 *
 * Every check returns findings as `{ check, route, detail }`. Nothing is repaired, nothing is
 * waived: a finding is routed to the owning agent with input · expected · observed.
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document, window, getComputedStyle, HTMLElement */

/** @typedef {{ check: string, route: string, detail: string }} Finding */

/* ---------------------------------------------------------------------------------------------- */
/* 1. Reflow at 320 CSS px — SC 1.4.10, B8                                                        */
/* ---------------------------------------------------------------------------------------------- */

/**
 * `document.scrollingElement.scrollWidth === window.innerWidth` at a 320 px viewport, on every
 * route. 320 px is the width a reader gets at 400 % zoom on a 1280 px screen, which is the width
 * SC 1.4.10 names. The widest offending element is reported alongside, because "the page is 37 px
 * too wide" is not actionable and "`.dpp-connection__components` has a 307 px minimum" is.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} route
 * @returns {Promise<Finding[]>}
 */
export async function checkReflow320(page, route) {
  const measured = await page.evaluate(() => {
    const scroller = document.scrollingElement
    const scrollWidth = scroller === null ? 0 : scroller.scrollWidth
    const overflowing = []
    if (scrollWidth > window.innerWidth) {
      for (const element of document.querySelectorAll('body *')) {
        const rect = element.getBoundingClientRect()
        if (rect.width === 0) continue
        if (rect.right > window.innerWidth + 0.5) {
          overflowing.push(
            `${element.tagName.toLowerCase()}.${String(element.className).split(' ')[0]} ` +
              `right=${Math.round(rect.right)}`,
          )
        }
      }
    }
    return { scrollWidth, innerWidth: window.innerWidth, overflowing: overflowing.slice(0, 5) }
  })

  if (measured.scrollWidth === measured.innerWidth) return []
  return [
    {
      check: 'reflow-320',
      route,
      detail:
        `scrollWidth=${measured.scrollWidth} against innerWidth=${measured.innerWidth} ` +
        `(${measured.scrollWidth - measured.innerWidth} px of sideways scroll). ` +
        `Widest offenders: ${measured.overflowing.join(' | ') || 'none identified'}`,
    },
  ]
}

/* ---------------------------------------------------------------------------------------------- */
/* 2. Three distinct progressbar strings — SC 2.4.6, B9 / F27                                     */
/* ---------------------------------------------------------------------------------------------- */

/**
 * For every `role="progressbar"`: `aria-label`, the FIRST CLAUSE of `aria-valuetext`, and the band
 * word must be three different strings (`docs/VOICE.md §9.1`).
 *
 * `aria-valuetext` is authored as "<reading>, <band>", so the first clause is what the bar reads
 * and the last is the band it falls in. A screen reader speaks all three in a row; any two being
 * the same is the stutter F27 filed ("Risk band, Risk band"), and the label matching the reading is
 * B9 — a meter named for a measurement it does not take.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} route
 * @returns {Promise<Finding[]>}
 */
export async function checkProgressBarStrings(page, route) {
  const meters = await page.evaluate(() =>
    [...document.querySelectorAll('[role="progressbar"]')].map((element) => ({
      label: element.getAttribute('aria-label'),
      valueText: element.getAttribute('aria-valuetext'),
      valueNow: element.getAttribute('aria-valuenow'),
      className: String(element.className).slice(0, 60),
    })),
  )

  /** @type {Finding[]} */
  const findings = []
  for (const meter of meters) {
    const where = `${meter.className || '(no class)'}`
    if (meter.label === null || meter.label.trim() === '') {
      findings.push({
        check: 'progressbar-three-strings',
        route,
        detail: `${where}: no aria-label. A meter with no name is announced as "progress bar".`,
      })
      continue
    }
    if (meter.valueText === null || meter.valueText.trim() === '') {
      findings.push({
        check: 'progressbar-three-strings',
        route,
        detail:
          `${where}: no aria-valuetext. Without it a screen reader speaks a computed percentage, ` +
          'which is the published-precision defect DIRECTIVE.md §18.5 forbids.',
      })
      continue
    }

    const clauses = meter.valueText.split(',').map((part) => part.trim())
    const reading = clauses[0] ?? ''
    const band = clauses.at(-1) ?? ''
    /** @param {string} value */
    const key = (value) => value.toLowerCase().replace(/[\s.]+$/, '')

    const three = [
      ['aria-label', meter.label],
      ['aria-valuetext first clause', reading],
      ['band word', band],
    ]
    for (let a = 0; a < three.length; a += 1) {
      for (let b = a + 1; b < three.length; b += 1) {
        if (key(three[a][1]) === key(three[b][1])) {
          findings.push({
            check: 'progressbar-three-strings',
            route,
            detail:
              `${where}: ${three[a][0]} and ${three[b][0]} are the same string ` +
              `("${three[a][1]}"). docs/VOICE.md §9.1 requires name ≠ reading ≠ band.`,
          })
        }
      }
    }
  }
  return findings
}

/* ---------------------------------------------------------------------------------------------- */
/* 3. Tables in a named, operable region with scoped headers — F31                                */
/* ---------------------------------------------------------------------------------------------- */

/**
 * Every `<table>` sits inside an element with `role="region"`, `tabindex="0"` and an
 * `aria-labelledby` that RESOLVES to non-empty text; every `<th>` carries a `scope`.
 *
 * The region is what makes a table that is wider than a 320 px viewport scroll instead of the page
 * (B8's fix), and `tabindex="0"` is what makes that scroll reachable without a mouse (Phase 9's
 * B6). `aria-labelledby` has to resolve: an id that points at nothing leaves the region unnamed,
 * which is worse than no region at all because the reader is told there is something to enter.
 *
 * Applied to EVERY table, not only the two in article prose. A data table that legitimately needs
 * different treatment is a finding for `accessibility-lead` to rule on, not something this runner
 * decides by guessing which tables are "prose".
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} route
 * @returns {Promise<Finding[]>}
 */
export async function checkTableRegions(page, route) {
  const tables = await page.evaluate(() =>
    [...document.querySelectorAll('table')].map((table, index) => {
      const region = table.closest('[role="region"]')
      const labelledBy = region?.getAttribute('aria-labelledby') ?? null
      const resolved =
        labelledBy === null
          ? null
          : labelledBy
              .split(/\s+/)
              .filter(Boolean)
              .map((id) => document.getElementById(id)?.textContent?.trim() ?? '')
              .join(' ')
              .trim()
      const headers = [...table.querySelectorAll('th')]
      return {
        index,
        caption: table.querySelector('caption')?.textContent?.trim() ?? null,
        hasRegion: region !== null,
        tabIndex: region?.getAttribute('tabindex') ?? null,
        labelledBy,
        resolved,
        headers: headers.length,
        headersWithoutScope: headers.filter((th) => !th.hasAttribute('scope')).length,
        firstHeader: headers[0]?.textContent?.trim().slice(0, 40) ?? '',
      }
    }),
  )

  /** @type {Finding[]} */
  const findings = []
  for (const table of tables) {
    const where = `table #${table.index} ("${table.firstHeader}…")`
    if (!table.hasRegion) {
      findings.push({
        check: 'table-region',
        route,
        detail: `${where}: not inside role="region". At 320 px the page scrolls instead of the table.`,
      })
    } else {
      if (table.tabIndex !== '0') {
        findings.push({
          check: 'table-region',
          route,
          detail: `${where}: the region has tabindex="${table.tabIndex}" — a scroll container that is not focusable cannot be scrolled from the keyboard (Phase 9 B6).`,
        })
      }
      if (table.labelledBy === null) {
        findings.push({
          check: 'table-region',
          route,
          detail: `${where}: the region has no aria-labelledby, so it is announced as an unnamed region.`,
        })
      } else if (table.resolved === null || table.resolved === '') {
        findings.push({
          check: 'table-region',
          route,
          detail: `${where}: aria-labelledby="${table.labelledBy}" resolves to no text.`,
        })
      }
    }
    if (table.headersWithoutScope > 0) {
      findings.push({
        check: 'table-region',
        route,
        detail: `${where}: ${table.headersWithoutScope} of ${table.headers} <th> carry no scope.`,
      })
    }
  }
  return findings
}

/* ---------------------------------------------------------------------------------------------- */
/* 4. No surviving `aria-busy`, no live region — F28 and §15.7                                    */
/* ---------------------------------------------------------------------------------------------- */

/**
 * Two rules in one pass, because they are the same mistake in two directions: telling a reader
 * something is happening when it is not.
 *
 * `aria-busy="true"` on a RENDERED element of a page that is not loading is F28. The one instance
 * this build carries is inside `<div data-dp-state="searching" hidden>` on `/` — the real searching
 * state, out of the accessibility tree until a search runs — so the check measures what is rendered
 * rather than what is in the markup.
 *
 * `aria-live` on a served route is forbidden outright by §12 item 4. `role="alert"` and
 * `role="status"` are implicit live regions and are held to the same rule, which is what §15.15
 * measured ("No `aria-live`, no `role="alert"`, no `role="status"` on any of the 22 pages"). A page
 * that genuinely needs one is a design change `accessibility-lead` reviews, and this check is the
 * thing that forces that review to happen.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} route
 * @returns {Promise<Finding[]>}
 */
export async function checkBusyAndLiveRegions(page, route) {
  const measured = await page.evaluate(() => {
    /** @param {Element} element */
    const rendered = (element) =>
      element.closest('[hidden]') === null &&
      !(element instanceof HTMLElement && element.offsetParent === null) &&
      getComputedStyle(element).display !== 'none'

    const busy = [...document.querySelectorAll('[aria-busy="true"]')]
    return {
      busyRendered: busy
        .filter(rendered)
        .map(
          (element) =>
            `${element.tagName.toLowerCase()}.${String(element.className).split(' ')[0]}`,
        ),
      busyTotal: busy.length,
      live: [...document.querySelectorAll('[aria-live]')].map(
        (element) =>
          `${element.tagName.toLowerCase()}[aria-live="${element.getAttribute('aria-live')}"]`,
      ),
      alerts: [...document.querySelectorAll('[role="alert"], [role="status"]')].map(
        (element) => `${element.tagName.toLowerCase()}[role="${element.getAttribute('role')}"]`,
      ),
    }
  })

  /** @type {Finding[]} */
  const findings = []
  if (measured.busyRendered.length > 0) {
    findings.push({
      check: 'busy-and-live',
      route,
      detail:
        `${measured.busyRendered.length} rendered element(s) carry aria-busy="true" on a page that ` +
        `is not loading: ${measured.busyRendered.join(', ')} (F28).`,
    })
  }
  if (measured.live.length > 0) {
    findings.push({
      check: 'busy-and-live',
      route,
      detail: `${measured.live.length} aria-live region(s): ${measured.live.join(', ')}. docs/ACCESSIBILITY.md §12 item 4 forbids any on a served route.`,
    })
  }
  if (measured.alerts.length > 0) {
    findings.push({
      check: 'busy-and-live',
      route,
      detail: `${measured.alerts.length} implicit live region(s): ${measured.alerts.join(', ')}. §15.7 measured zero; a new one needs an accessibility-lead ruling, not a silent addition.`,
    })
  }
  return findings
}

/* ---------------------------------------------------------------------------------------------- */
/* 5. No accessible name ending in its own `<dt>`'s label word — F29 / F39                        */
/* ---------------------------------------------------------------------------------------------- */

/**
 * The "Delayed Status" shape: a value rendered with the name of the field it answers stuck on the
 * end, so a reader hears the label twice and "Watch Status" reads as an instruction.
 *
 * Two passes, because the defect was found twice in two different scopes:
 *
 *   a. §12's wording — per definition-list ROW: nothing inside a `<dd>` may end with the last word
 *      of its own `<dt>`.
 *   b. §15.16's wider sweep — no STATUS PILL anywhere on the page may end with any word this page
 *      uses as a `<dt>` label. F39 lived in `ItineraryTimeline`, which is not inside a `<dl>` at
 *      all, so pass (a) alone would have missed it exactly as the first review did.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} route
 * @returns {Promise<Finding[]>}
 */
export async function checkLabelEchoes(page, route) {
  const measured = await page.evaluate(() => {
    /** @param {string} value */
    const lastWord = (value) =>
      value
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .at(-1)
        ?.replace(/[^\p{L}\p{N}]/gu, '')
        .toLowerCase() ?? ''

    /** @param {Element} element */
    const name = (element) =>
      (element.getAttribute('aria-label') ?? element.textContent ?? '').replace(/\s+/g, ' ').trim()

    /* (a) per definition-list row */
    const rowHits = []
    const labelWords = new Set()
    for (const list of document.querySelectorAll('dl')) {
      /** @type {Element | null} */
      let term = null
      for (const child of list.children) {
        if (child.tagName === 'DT') {
          term = child
          const word = lastWord(name(child))
          if (word !== '') labelWords.add(word)
          continue
        }
        if (child.tagName !== 'DD' || term === null) continue
        const word = lastWord(name(term))
        if (word === '') continue
        /*
         * An outer element and its only child report the same text, so the same defect would be
         * filed twice. One defect, one finding: dedupe on the pair that identifies it.
         */
        const seen = new Set()
        const candidates = [child, ...child.querySelectorAll('*')]
        for (const candidate of candidates) {
          const value = name(candidate)
          if (value === '' || lastWord(value) !== word) continue
          if (value.toLowerCase() === name(term).toLowerCase()) continue
          const key = `${name(term)}\u0000${value}`
          if (seen.has(key)) continue
          seen.add(key)
          rowHits.push({ term: name(term), value: value.slice(0, 60) })
        }
      }
    }

    /* (b) every status pill on the page, against every label word on the page */
    const pillHits = []
    for (const pill of document.querySelectorAll('[class*="status-pill"], [class*="dp-pill"]')) {
      const value = name(pill)
      if (value === '') continue
      const word = lastWord(value)
      if (labelWords.has(word) && value.toLowerCase() !== word) {
        pillHits.push({ pill: value.slice(0, 60), word })
      }
    }

    return { rowHits, pillHits, labelWords: [...labelWords].length }
  })

  /** @type {Finding[]} */
  const findings = []
  for (const hit of measured.rowHits) {
    findings.push({
      check: 'label-echo',
      route,
      detail: `"${hit.value}" sits under <dt>${hit.term}</dt> and ends with that label's own word (F29).`,
    })
  }
  for (const hit of measured.pillHits) {
    findings.push({
      check: 'label-echo',
      route,
      detail: `status pill "${hit.pill}" ends with "${hit.word}", which this page uses as a <dt> label (F39).`,
    })
  }
  return findings
}
