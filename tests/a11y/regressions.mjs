/**
 * The non-axe regression assertions of `docs/ACCESSIBILITY.md §12`.
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
 *      it does not measure (SC 2.4.6), and the "Risk band, Risk band" stutter beside it. Since the
 *      §16.6 amendment it also asserts that the ANNOUNCEMENT EQUALS THE VISIBLE READOUT (F48).
 *   3. Prose tables in a named, keyboard-operable region with scoped headers — F31.
 *   4. No surviving `aria-busy`, no live region on a served route — F28 and §15.7.
 *   5. No accessible name ending in its own `<dt>`'s label word — F29, and F39 one component over.
 *   6. Every element carrying `hidden` computes `display: none` — F-QA-1, §12 item 6.
 *
 * Every check returns `{ findings, populations }`. Nothing is repaired, nothing is waived: a
 * finding is routed to the owning agent with input · expected · observed.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * POPULATIONS — §12 item 7, F46. NO CHECK MAY REPORT "clean" OVER ZERO ELEMENTS.
 *
 * `clean` and `nothing matched` used to be the same line of output. There are 6 meters and 7 tables
 * across 20 routes, so 17 routes have no meter at all and the meter check still printed `clean`;
 * and the item-5 pill pass is keyed on the class substrings `status-pill` / `dp-pill`, so a rename
 * would take it to zero silently — F39's fix already removed one class from that family. So every
 * check now reports the size of the population it examined, `run-axe.mjs` prints it per route, and
 * `coverage.mjs` fails the run when a population that was non-zero in `baseline.json` is zero now.
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document, window, getComputedStyle */

/** @typedef {{ check: string, route: string, detail: string }} Finding */
/**
 * `notes` are observations a check reports without gating on them — measured, printed, and routed
 * to an owner, but not a failure this suite decided on its own. See `checkLabelEchoes`.
 *
 * @typedef {{ findings: Finding[], populations: Record<string, number>, notes?: string[] }} CheckResult
 */

/**
 * The populations every route reports, in print order. `key` is what `baseline.json` records and
 * what the zero-floor rule compares; `label` is the column head; `check` is the assertion whose
 * coverage the number describes, so a floor breach names the check that stopped examining anything.
 *
 * `zeroIsTheResult` marks the one population whose zero is the ASSERTION rather than a coverage
 * hole: §12 item 4 forbids live regions outright, so `live-candidate: 0` is the check passing, not
 * the check finding nothing to look at. Every other zero means the check cannot fail on that
 * surface, and the runner says so out loud.
 *
 * @type {{ key: string, check: string, label: string, zeroIsTheResult?: true }[]}
 */
export const POPULATION_COLUMNS = [
  { key: 'body-elements', check: 'reflow-320', label: 'elements' },
  { key: 'progressbar', check: 'progressbar-three-strings', label: 'meters' },
  { key: 'progressbar-readout', check: 'progressbar-three-strings', label: 'readouts' },
  { key: 'table', check: 'table-region', label: 'tables' },
  { key: 'th', check: 'table-region', label: 'th' },
  { key: 'aria-busy', check: 'busy-and-live', label: 'busy' },
  { key: 'live-candidate', check: 'busy-and-live', label: 'live', zeroIsTheResult: true },
  { key: 'hidden-attribute', check: 'hidden-means-hidden', label: 'hidden' },
  { key: 'dl-row', check: 'label-echo', label: 'dl-rows' },
  { key: 'dl-named-value', check: 'label-echo', label: 'named' },
  { key: 'dt-label-word', check: 'label-echo', label: 'dt-words' },
  { key: 'status-pill', check: 'label-echo', label: 'pills' },
  { key: 'state-container-elements', check: 'state-fixture', label: 'state-el' },
]

/**
 * THE VISIBILITY PREDICATE. One function, used by every check that asks "is this on screen".
 *
 * `Element.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true,
 * visibilityProperty: true })` AND NOTHING ELSE — `docs/ACCESSIBILITY.md §12` item 4 as amended by
 * §16.6. The two terms it replaces were both wrong, and both wrong in the direction that reports a
 * defect as clean:
 *
 *   · `element.closest('[hidden]') === null` dismissed an element BY THE ATTRIBUTE THAT FAILED.
 *     F-QA-1 was a `hidden` attribute with no effect — an author `display` rule outranks the
 *     user-agent `[hidden] { display: none }` — so `hidden` is a claim to be checked, never
 *     evidence. And because the three terms were `&&`-ed with that one first, a panel inside
 *     `[hidden]` was declared not-rendered before either computed-style term ran (F43). Measured on
 *     a seeded build: `display: grid`, `visibility: visible`, painting at 446 × 170 px, carrying
 *     `aria-busy="true"` — and `rendered()` counted 0 of 1.
 *   · `offsetParent === null` is null BY SPECIFICATION for every `position: fixed` element and for
 *     `<body>`, both ordinary places to put a loading state (F44).
 *
 * Exported as the OPTIONS OBJECT rather than as a function, because a `page.evaluate` body is
 * serialised and cannot close over anything in Node — the options travel as an argument, so every
 * caller asks the browser the same question and there is one place to change it. It is deliberately
 * not passed as a source string to `eval`: the page is served under `script-src 'self'` with no
 * `'unsafe-eval'`, and a check that needed the policy relaxed would be measuring a page nobody
 * serves.
 *
 * @type {{ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true }}
 */
export const VISIBILITY_OPTIONS = {
  contentVisibilityAuto: true,
  opacityProperty: true,
  visibilityProperty: true,
}

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
 * @returns {Promise<CheckResult>}
 */
export async function checkReflow320(page, route) {
  const measured = await page.evaluate(() => {
    const scroller = document.scrollingElement
    const scrollWidth = scroller === null ? 0 : scroller.scrollWidth
    const candidates = [...document.querySelectorAll('body *')]
    const overflowing = []
    if (scrollWidth > window.innerWidth) {
      for (const element of candidates) {
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
    return {
      scrollWidth,
      innerWidth: window.innerWidth,
      overflowing: overflowing.slice(0, 5),
      population: candidates.length,
    }
  })

  const populations = { 'body-elements': measured.population }
  if (measured.scrollWidth === measured.innerWidth) return { findings: [], populations }
  return {
    populations,
    findings: [
      {
        check: 'reflow-320',
        route,
        detail:
          `scrollWidth=${measured.scrollWidth} against innerWidth=${measured.innerWidth} ` +
          `(${measured.scrollWidth - measured.innerWidth} px of sideways scroll). ` +
          `Widest offenders: ${measured.overflowing.join(' | ') || 'none identified'}`,
      },
    ],
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* 2. The meter says one thing — SC 2.4.6 / 1.3.1, B9 / F27 / F48                                 */
/* ---------------------------------------------------------------------------------------------- */

/**
 * For every `role="progressbar"`, two rules:
 *
 *   (a) `aria-label`, the FIRST CLAUSE of `aria-valuetext`, and the band word are three different
 *       strings (`docs/VOICE.md §9.1`). `aria-valuetext` is authored as "<reading>, <band>", so the
 *       first clause is what the bar reads and the last is the band it falls in. A screen reader
 *       speaks all three in a row; any two being the same is the stutter F27 filed ("Risk band,
 *       Risk band"), and the label matching the reading is B9 — a meter named for a measurement it
 *       does not take.
 *
 *   (b) `aria-valuetext` EQUALS THE VISIBLE READOUT — `.dp-progress__value` then
 *       `.dp-progress__band`, joined with ", " exactly as `ProgressBar.tsx` composes the attribute.
 *       §12 item 2 as amended by §16.6, finding F48. (a) compares three ARIA strings to each other
 *       and can therefore never catch the failure mode that produced B3 and then B7: the children
 *       of `role="progressbar"` are PRESENTATIONAL in WAI-ARIA 1.2, so everything inside the meter
 *       is dropped from the accessibility tree, and the eye and the accessibility tree can drift
 *       apart without either one looking wrong on its own. B3 was a reading that reached the tree
 *       and not the eye; B7 was a band word that reached the eye and not the tree. Nothing guarded
 *       the third case — both present, saying different things — until this.
 *
 * A meter with no visible readout element at all is itself the B3 shape and is reported as one,
 * which is also what keeps the `progressbar-readout` population honest: rename the classes and the
 * population drops to zero and `coverage.mjs` fails the run, rather than this rule quietly passing
 * over nothing (F46).
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} route
 * @returns {Promise<CheckResult>}
 */
export async function checkProgressBarStrings(page, route) {
  const meters = await page.evaluate(() => {
    /*
     * `\s` in JavaScript already includes U+00A0, so collapsing whitespace also normalises a
     * non-breaking space. Comparing an attribute to rendered text without that would fail on a
     * typographic space nobody can see.
     *
     * @param {Element | null} element
     */
    const text = (element) =>
      element === null ? null : (element.textContent ?? '').replace(/\s+/g, ' ').trim()

    return [...document.querySelectorAll('[role="progressbar"]')].map((element) => ({
      label: element.getAttribute('aria-label'),
      valueText: element.getAttribute('aria-valuetext'),
      valueNow: element.getAttribute('aria-valuenow'),
      visibleValue: text(element.querySelector('.dp-progress__value')),
      visibleBand: text(element.querySelector('.dp-progress__band')),
      className: String(element.className).slice(0, 60),
    }))
  })

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

    /* (b) — F48. The announcement against the readout a sighted reader actually has. */
    if (meter.visibleValue === null || meter.visibleBand === null) {
      findings.push({
        check: 'progressbar-three-strings',
        route,
        detail:
          `${where}: no visible readout — ` +
          `${meter.visibleValue === null ? '.dp-progress__value' : '.dp-progress__band'} is absent. ` +
          'A meter whose reading exists only in ARIA leaves a sighted reader a coloured bar and no ' +
          'number (docs/ACCESSIBILITY.md B3). If the class was renamed, this check has stopped ' +
          'examining anything and §12 item 7 requires the run to fail rather than print clean.',
      })
      continue
    }
    const announced = meter.valueText.replace(/\s+/g, ' ').trim()
    const onScreen = `${meter.visibleValue}, ${meter.visibleBand}`
    if (announced !== onScreen) {
      findings.push({
        check: 'progressbar-three-strings',
        route,
        detail:
          `${where}: aria-valuetext is "${announced}" and the visible readout is "${onScreen}". ` +
          'The children of role="progressbar" are presentational, so the eye and the accessibility ' +
          'tree have drifted apart (docs/ACCESSIBILITY.md §12 item 2 as amended, B3/B7, F48).',
      })
    }
  }

  return {
    findings,
    populations: {
      progressbar: meters.length,
      'progressbar-readout': meters.filter(
        (meter) => meter.visibleValue !== null && meter.visibleBand !== null,
      ).length,
    },
  }
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
 * @returns {Promise<CheckResult>}
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

  return {
    findings,
    populations: {
      table: tables.length,
      th: tables.reduce((sum, table) => sum + table.headers, 0),
    },
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* 4. No surviving `aria-busy`, no live region — F28 and §15.7                                    */
/* ---------------------------------------------------------------------------------------------- */

/**
 * Two rules in one pass, because they are the same mistake in two directions: telling a reader
 * something is happening when it is not.
 *
 * `aria-busy="true"` on a VISIBLE element of a page that is not loading is F28. The one instance a
 * served build carries is inside `<div data-dp-state="searching" hidden>` on `/` — the real
 * searching state, out of the accessibility tree until a search runs — so the check measures what
 * is on screen rather than what is in the markup. What "on screen" means is `VISIBLE` above, and
 * the two findings F43 and F44 are both the old predicate answering that question from an
 * attribute and from `offsetParent` instead of from the rendered box.
 *
 * `loading: true` suspends the `aria-busy` half and says so in the output. It is passed by the
 * state sweep for `searching` and by nothing else: while that state is on screen the page IS
 * loading, `aria-busy` is correct, and asserting its absence there would be asserting the opposite
 * of what `e2e/lookup-states.e2e.mjs` requires. The live-region half still runs.
 *
 * `aria-live` on a served route is forbidden outright by §12 item 4. `role="alert"` and
 * `role="status"` are implicit live regions and are held to the same rule, which is what §15.15
 * measured ("No `aria-live`, no `role="alert"`, no `role="status"` on any of the 22 pages"). A page
 * that genuinely needs one is a design change `accessibility-lead` reviews, and this check is the
 * thing that forces that review to happen.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} route
 * @param {{ loading?: boolean }} [options]
 * @returns {Promise<CheckResult>}
 */
export async function checkBusyAndLiveRegions(page, route, options = {}) {
  const loading = options.loading === true
  const measured = await page.evaluate((options) => {
    /** @param {Element} element */
    const visible = (element) => element.checkVisibility(options)

    const busy = [...document.querySelectorAll('[aria-busy="true"]')]
    return {
      busyVisible: busy
        .filter(visible)
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
  }, VISIBILITY_OPTIONS)

  /** @type {Finding[]} */
  const findings = []
  if (!loading && measured.busyVisible.length > 0) {
    findings.push({
      check: 'busy-and-live',
      route,
      detail:
        `${measured.busyVisible.length} visible element(s) carry aria-busy="true" on a page that ` +
        `is not loading: ${measured.busyVisible.join(', ')} (F28). Visibility is decided by ` +
        'Element.checkVisibility, so a `hidden` attribute that has been defeated by an author ' +
        '`display` rule does not exempt it (F43/F44).',
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

  return {
    findings,
    populations: {
      'aria-busy': measured.busyTotal,
      'live-candidate': measured.live.length + measured.alerts.length,
    },
  }
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
 * Pass (b) is keyed on the class substrings `status-pill` and `dp-pill`, which is a real fragility
 * — F39's own fix removed one class from that family. It is not made less fragile by being written
 * differently; it is made VISIBLE by reporting the pill population, so the next rename fails the
 * run at the floor check instead of passing over zero elements (F46, §12 item 7).
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} route
 * @returns {Promise<CheckResult>}
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

    /*
     * DOES THIS ELEMENT HAVE AN ACCESSIBLE NAME OF ITS OWN? §12 item 5 is worded about accessible
     * names, and both defects it was written from — F29 on `SegmentCard`, F39 on
     * `ItineraryTimeline` — were a STATUS PILL whose name read "Delayed Status". A bare `<span>` of
     * prose inside a `<dd>` has no accessible name: it contributes text to the `<dd>`'s content and
     * a reader hears the row as a unit. So the gating pass is over named objects, and the prose
     * scan is reported separately rather than failing a build on a copy judgement nobody has ruled
     * on (see `proseHits` below).
     */
    const NAMED_ROLES = new Set([
      'button',
      'link',
      'heading',
      'status',
      'img',
      'option',
      'tab',
      'progressbar',
      'meter',
    ])
    /** @param {Element} element */
    const named = (element) => {
      if (element.closest('[aria-hidden="true"]') !== null) return false
      if (element.hasAttribute('aria-label') || element.hasAttribute('aria-labelledby')) return true
      const role = element.getAttribute('role')
      if (role !== null && NAMED_ROLES.has(role)) return true
      if (/^(BUTTON|SUMMARY|H[1-6])$/.test(element.tagName)) return true
      if (element.tagName === 'A' && element.hasAttribute('href')) return true
      /* The pill/chip family F29 and F39 both lived in. Its population is reported, so a rename
         fails the run at the floor check instead of taking this pass to zero silently (F46). */
      return /status-pill|dp-pill|dp-chip/.test(String(element.className))
    }

    /*
     * (a) per definition-list row.
     *
     * A ROW IS A `<dt>` AND THE `<dd>`s THAT FOLLOW IT, wherever they sit. This used to walk
     * `list.children` and take only direct `<dt>` / `<dd>` children, and on this build that is
     * ZERO OF 120 ROWS on every route: every row in the product is wrapped in
     * `<div class="dpp-row">`, which the HTML specification explicitly permits inside a `<dl>`.
     * So the rule §12 item 5 actually words — F29's rule — examined nothing and printed `clean`,
     * while `--seed-violation=label-echo` passed because the seed appends a FLAT `<dl>` that the
     * old traversal could see. A seeded proof shows the mechanism works; only the population shows
     * whether it works on the product. That is F46's whole argument, and it found this.
     */
    const rowHits = []
    const proseHits = []
    const labelWords = new Set()
    let rows = 0
    let namedValues = 0
    for (const term of document.querySelectorAll('dl dt')) {
      const word = lastWord(name(term))
      if (word !== '') labelWords.add(word)
      for (
        let sibling = term.nextElementSibling;
        sibling !== null && sibling.tagName === 'DD';
        sibling = sibling.nextElementSibling
      ) {
        rows += 1
        const candidates = [sibling, ...sibling.querySelectorAll('*')]
        namedValues += candidates.filter(named).length
        if (word === '') continue
        /*
         * An outer element and its only child report the same text, so the same defect would be
         * filed twice. One defect, one finding: dedupe on the pair that identifies it.
         *
         * THE NAMED CANDIDATE WINS THE DEDUPE. A `<dd>` wrapping a single status pill reports the
         * pill's text as its own, and the wrapper has no accessible name — so a first-wins dedupe
         * files the defect as unnamed prose and the gating pass never sees the pill. That is F29's
         * exact markup, and the `--seed-violation=label-echo` proof caught it: the seed fired only
         * through the page-wide pill pass until this became an upgrade rather than a skip.
         */
        const seen = new Map()
        for (const candidate of candidates) {
          const value = name(candidate)
          if (value === '' || lastWord(value) !== word) continue
          if (value.toLowerCase() === name(term).toLowerCase()) continue
          const key = `${name(term)}\u0000${value}`
          const previous = seen.get(key)
          if (previous === undefined) {
            seen.set(key, { term: name(term), value: value.slice(0, 60), named: named(candidate) })
          } else if (named(candidate)) {
            previous.named = true
          }
        }
        for (const hit of seen.values()) {
          if (hit.named) rowHits.push(hit)
          else proseHits.push(hit)
        }
      }
    }

    /* (b) every status pill on the page, against every label word on the page */
    const pillHits = []
    const pills = [...document.querySelectorAll('[class*="status-pill"], [class*="dp-pill"]')]
    for (const pill of pills) {
      const value = name(pill)
      if (value === '') continue
      const word = lastWord(value)
      if (labelWords.has(word) && value.toLowerCase() !== word) {
        pillHits.push({ pill: value.slice(0, 60), word })
      }
    }

    return {
      rowHits,
      proseHits,
      pillHits,
      rows,
      namedValues,
      labelWords: [...labelWords].length,
      pills: pills.length,
    }
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

  return {
    findings,
    /*
     * Reported, not gated. These are `<dd>` PROSE that repeats its own `<dt>`'s last word —
     * "Slack: 7 minutes of slack" — which is a copy judgement for `ux-copy-steward` and a ruling
     * for `accessibility-lead`, not the accessible-name defect §12 item 5 was written from. They
     * became visible only when the row traversal was fixed; failing a build on them would be this
     * suite inventing a gate nobody specified.
     */
    notes: measured.proseHits.map(
      (hit) => `"${hit.value}" sits under <dt>${hit.term}</dt> and repeats that label's own word`,
    ),
    populations: {
      'dl-row': measured.rows,
      'dl-named-value': measured.namedValues,
      'dt-label-word': measured.labelWords,
      'status-pill': measured.pills,
    },
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* 6. The `hidden` attribute means what it says — F-QA-1, §12 item 6                              */
/* ---------------------------------------------------------------------------------------------- */

/**
 * Every element carrying `hidden` computes `display: none`, read from computed style.
 *
 * This is F-QA-1's rule, and it is implemented in `e2e/hidden-states.e2e.mjs` as a whole-site
 * sweep. §16.6 item 6 puts it in the accessibility gate as well, for two reasons that are both
 * about what a gate is for: a `§17` state panel that paints when it should not is an accessibility
 * defect — it announces a state the product did not mean to announce — and a rule that lives in
 * exactly one suite can be deleted from that suite without anything noticing. Two suites, one rule,
 * and neither one is where the other's coverage comes from.
 *
 * It is also the rule whose absence here let F43 through: the `aria-busy` check used to decide
 * hiddenness from the same attribute this check exists to doubt.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} route
 * @returns {Promise<CheckResult>}
 */
export async function checkHiddenMeansHidden(page, route) {
  const measured = await page.evaluate(() => {
    const all = [...document.querySelectorAll('[hidden]')]
    return {
      population: all.length,
      rendered: all
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
            text: (element.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60),
          }
        })
        .filter((entry) => entry.display !== 'none'),
    }
  })

  return {
    populations: { 'hidden-attribute': measured.population },
    findings: measured.rendered.map((entry) => ({
      check: 'hidden-means-hidden',
      route,
      detail:
        `${entry.selector} carries \`hidden\` and computes display:${entry.display}, painting ` +
        `${entry.size} — "${entry.text}". An author \`display\` rule outranks the user-agent ` +
        '`[hidden] { display: none }`, so the attribute has no effect and a state the product ' +
        'meant to conceal is on screen (F-QA-1, §12 item 6). Owner: frontend-ui-engineer.',
    })),
  }
}
