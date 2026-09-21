/**
 * `DIRECTIVE.md §20` / `AGENTS.md §4` ad placement, decided in the LIVE DOM.
 *
 * Owner: qa-test-architect.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS BESIDE `apps/web/scripts/verify-dist.mjs`, WHICH ALREADY CHECKS THE SAME FIVE
 * CLAUSES
 *
 * That script answers the question by BYTE OFFSET in the emitted HTML: how many characters of
 * markup separate a slot from a control, and does a `</section>` fall between them. That is the
 * right tool for a build gate and it is deliberately not re-implemented here.
 *
 * It is the wrong tool for two of the five clauses once CSS exists. "Above the primary search" is a
 * question about what a reader meets first, and `order`, `grid-area`, `position: sticky`, `float`
 * and a `flex-direction: column-reverse` can all put a slot above a form that follows it in the
 * source. "Adjacent" is a question about perceived separation, and 600 characters of markup is not
 * a distance a person experiences — 600 pixels is.
 *
 * So this module asks the same five questions of the RENDERED page: document order AND painted
 * geometry for clause 1, containment by `closest()` for clauses 2–4, and a separation rule in CSS
 * pixels plus structural boundaries for clause 5. The two checks agree today because nothing is
 * placed; they will disagree the first time a layout rule moves a slot, and that disagreement is
 * the finding.
 *
 * THE ADJACENCY RULE, STATED ONCE SO IT CAN BE ARGUED WITH. A slot is adjacent to a named control
 * when BOTH hold: (a) no sectioning element, heading or `<hr>` lies between them in document
 * order — §20's permitted placement asks for "strong separation", and those are the breaks a
 * reader perceives; and (b) their painted boxes are within `ADJACENT_PX` of each other. 600 px is
 * roughly one card at this site's density, measured on the demonstration cockpit's own panels. It
 * is a floor on separation, not a measurement of one.
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 */
/*
 * BROWSER GLOBALS. Every `document` / `window` reference in this file sits inside a function that
 * Playwright serialises and runs IN THE PAGE, not in Node. `eslint.config.js` gives a `.mjs` file
 * Node globals only, and that file is `principal-architect`'s — so the page's globals are declared
 * here rather than by widening the lint configuration for the whole repository.
 */
/* global document, window, Node */

/** Every hook an ad slot can be rendered with today. `AdSlotShell` emits `[data-ad-placement]`. */
export const AD_SELECTOR = '[data-ad-placement], .dp-ad-slot, .dpp-ad, ins.adsbygoogle'

/**
 * The five positional clauses, by the name `DIRECTIVE.md §20` gives them, plus the two container
 * clauses `AGENTS.md §4` adds ("inside or adjacent to a rights card or action checklist").
 */
export const CLAUSES = [
  'above the primary search',
  'inside a form',
  'between a warning and its action',
  'inside a rights card',
  'adjacent to a named crisis control',
  'inside or adjacent to an action checklist',
]

/**
 * Evaluate every clause against the current DOM. Runs inside the page.
 *
 * Returned as a plain function so `page.evaluate` can serialise it; it therefore closes over
 * nothing and takes its configuration as an argument.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ slots: number, violations: { clause: string, detail: string }[] }>}
 */
export function auditAdPlacement(page) {
  return page.evaluate(
    ({ adSelector, adjacentPx }) => {
      /** @type {{ clause: string, detail: string }[]} */
      const violations = []
      const slots = [...document.querySelectorAll(adSelector)]
      if (slots.length === 0) return { slots: 0, violations }

      /* §20 names three controls by ACTION, not by button caption. The article is optional. */
      const NAMED = [
        { clause: 'Contact airline', pattern: /\bcontact\s+(?:the\s+)?airline\b/i },
        { clause: 'Request refund', pattern: /\brequest\s+(?:a\s+|the\s+|your\s+)?refund\b/i },
        { clause: 'Save evidence', pattern: /\bsave\s+(?:the\s+|your\s+)?evidence\b/i },
      ]

      /** Accessible name, in the order the name computation uses. */
      const nameOf = (element) => {
        const label = element.getAttribute('aria-label')
        if (label !== null) return label.replace(/\s+/g, ' ').trim()
        const labelledBy = element.getAttribute('aria-labelledby')
        if (labelledBy !== null) {
          return labelledBy
            .split(/\s+/)
            .filter(Boolean)
            .map((id) => document.getElementById(id)?.textContent ?? '')
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim()
        }
        return (element.textContent ?? '').replace(/\s+/g, ' ').trim()
      }

      const controls = [...document.querySelectorAll('a, button')]
        .map((element) => ({ element, name: nameOf(element) }))
        .map((entry) => ({
          ...entry,
          control: NAMED.find((candidate) => candidate.pattern.test(entry.name)),
        }))
        .filter((entry) => entry.control !== undefined)

      /* Document order, flattened once, so "between them" is answerable. */
      const ordered = [...document.querySelectorAll('*')]
      const indexOf = new Map(ordered.map((element, index) => [element, index]))
      const BOUNDARY = /^(SECTION|ARTICLE|ASIDE|MAIN|HEADER|FOOTER|FORM|H1|H2|H3|H4|H5|H6|HR)$/

      const describe = (element) =>
        `${element.tagName.toLowerCase()}` +
        `${String(element.className) === '' ? '' : `.${String(element.className).split(' ')[0]}`}`

      const search = document.querySelector('form[data-dp-lookup]')

      for (const slot of slots) {
        const slotRect = slot.getBoundingClientRect()
        const slotIndex = indexOf.get(slot) ?? -1

        /* 1. Above the primary search — in document order OR in paint order. */
        if (search !== null) {
          const searchRect = search.getBoundingClientRect()
          const beforeInSource =
            (slot.compareDocumentPosition(search) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
          const aboveOnScreen = slotRect.top + window.scrollY < searchRect.top + window.scrollY
          if (beforeInSource || aboveOnScreen) {
            violations.push({
              clause: 'above the primary search',
              detail:
                `${describe(slot)} is ${beforeInSource ? 'before the lookup form in document order' : ''}` +
                `${beforeInSource && aboveOnScreen ? ' and ' : ''}` +
                `${aboveOnScreen ? 'painted above it' : ''} — §20 forbids an ad above the primary search on every viewport.`,
            })
          }
        }

        /* 2. Inside a form. */
        if (slot.closest('form') !== null) {
          violations.push({
            clause: 'inside a form',
            detail: `${describe(slot)} is inside <form> — §20 forbids an ad inside a form.`,
          })
        }

        /* 3. Between a warning and its action: inside a state block that offers a control. */
        const state = slot.closest('.dpp-state')
        if (state !== null && state.querySelector('.dp-callout__action, .dp-button') !== null) {
          violations.push({
            clause: 'between a warning and its action',
            detail:
              `${describe(slot)} is inside a state block that carries an action — §20 forbids it, ` +
              'and this is the placement that costs a traveler the step they were about to take.',
          })
        }

        /* 4. Inside a rights card. */
        if (slot.closest('.dpp-rights') !== null) {
          violations.push({
            clause: 'inside a rights card',
            detail: `${describe(slot)} is inside .dpp-rights — AGENTS.md §4 forbids it outright.`,
          })
        }

        /* 4b / §4. Inside or adjacent to an action checklist, and adjacent to a rights card. */
        for (const [selector, label] of [
          ['.dpp-actions', 'action checklist'],
          ['.dpp-rights', 'rights card'],
        ]) {
          const inside = slot.closest(selector)
          const container = inside ?? undefined
          const siblings = [...document.querySelectorAll(selector)].filter(
            (element) =>
              element !== container &&
              (element.previousElementSibling === slot || element.nextElementSibling === slot),
          )
          if (selector === '.dpp-actions' && inside !== null) {
            violations.push({
              clause: 'inside or adjacent to an action checklist',
              detail: `${describe(slot)} is inside ${label} — AGENTS.md §4.`,
            })
          }
          if (siblings.length > 0) {
            violations.push({
              clause:
                selector === '.dpp-rights'
                  ? 'inside a rights card'
                  : 'inside or adjacent to an action checklist',
              detail:
                `${describe(slot)} is an immediate sibling of a ${label} — §20 permits one only ` +
                'AFTER the complete checklist and with strong separation, which a sibling is not.',
            })
          }
        }

        /* 5. Adjacent to a named crisis control. */
        for (const { element, name, control } of controls) {
          const controlIndex = indexOf.get(element) ?? -1
          if (slotIndex < 0 || controlIndex < 0) continue
          const [from, to] =
            slotIndex < controlIndex ? [slotIndex, controlIndex] : [controlIndex, slotIndex]
          const between = ordered.slice(from + 1, to)
          if (between.some((node) => BOUNDARY.test(node.tagName))) continue

          const controlRect = element.getBoundingClientRect()
          const gap = Math.max(
            0,
            Math.max(slotRect.top, controlRect.top) - Math.min(slotRect.bottom, controlRect.bottom),
          )
          if (gap > adjacentPx) continue

          violations.push({
            clause: 'adjacent to a named crisis control',
            detail:
              `${describe(slot)} is ${Math.round(gap)} px from the "${control?.clause}" control ` +
              `("${name.slice(0, 50)}") with no sectioning boundary between them — §20 forbids an ` +
              'ad adjacent to "Contact airline" / "Request refund" / "Save evidence" by name, ' +
              'whatever container the control happens to sit in.',
          })
        }
      }

      return { slots: slots.length, violations }
    },
    { adSelector: AD_SELECTOR, adjacentPx: 600 },
  )
}
