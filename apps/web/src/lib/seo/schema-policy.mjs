/**
 * What DelayPilot is allowed to say about itself in JSON-LD, and what it may never say.
 * Owner: `seo-engineer`. Authority: `DIRECTIVE.md §19`, `AGENTS.md §1.1`, §1.4, §2.
 *
 * THE ONE RULE THIS FILE ENFORCES. A structured-data property whose value is not rendered in the
 * visible DOM of that same page is a fabricated value in machine-readable form. Google's own
 * General Structured Data Guidelines say the same thing in its own words — "Don't mark up content
 * that is not visible to readers of the page" (read 2026-09-20 through search; the page itself is
 * unreachable from this build environment, see `docs/SEO.md §6.1`) — but the reason it is refused
 * here is `AGENTS.md §1.1`, which does not depend on any search engine's policy.
 *
 * WHY THE ALLOWLIST IS SHORTER THAN THE CHARTER'S. The charter permits `BreadcrumbList`, `FAQPage`
 * and `WebApplication`/`SoftwareApplication` as a ceiling. This build renders no breadcrumb, no
 * question-and-answer block, and no working flight lookup (no licensed provider is connected), so
 * each of those would describe a surface that does not exist. They are listed in `DEFERRED_TYPES`
 * with the condition that would admit them, and the validator refuses them until then — a type
 * that becomes emittable the day its visible surface ships, and not a day earlier.
 *
 * `.mjs` for the reason given at the top of `site-url.mjs`: the builders (`schema.ts`), the dist
 * scanner (`scripts/seo/test-seo.mjs`) and the unit tests must share one copy of this list.
 */

/** The only `@context` an emitted block may declare. */
export const SCHEMA_CONTEXT = 'https://schema.org'

/**
 * Types this site may emit today. Every one is backed by something a reader can see on the page
 * that carries it:
 *
 *  - `Organization` — the mark and wordmark are inlined in the header of every page.
 *  - `WebSite` — the site exists and names itself in that same lockup.
 *  - `ImageObject` — only as the `logo` of the organization; the raster is the same mark, derived
 *    by `scripts/assets/asset-manifest.mjs`.
 *  - `Article` — a guide or rights explainer whose `<h1>` and "Reviewed <date>" line are on screen.
 *  - `ItemList` / `ListItem` — a rendered list of links, each item's name being the visible link
 *    text.
 */
export const ALLOWED_TYPES = Object.freeze([
  'Organization',
  'WebSite',
  'ImageObject',
  'Article',
  'ItemList',
  'ListItem',
])

/**
 * Types the charter permits in principle and this build may not emit yet, each with the visible
 * surface that would make it honest. The validator quotes these back, so a future contributor gets
 * the condition rather than a bare refusal.
 */
export const DEFERRED_TYPES = Object.freeze({
  BreadcrumbList:
    'no page renders a breadcrumb trail; a BreadcrumbList would describe navigation that is not on the page.',
  FAQPage:
    'no page renders a question-and-answer block whose text this could byte-match (DIRECTIVE.md §19 permits FAQPage only for visible FAQs).',
  WebApplication:
    'the flight lookup reports the provider-unavailable state by design — no licensed provider is connected (AGENTS.md §1.5) — so an application claim would assert a capability that is not shipped.',
  SoftwareApplication:
    'same as WebApplication, and Google grants the software-app rich result only with offers, aggregateRating and review, every one of which this site is forbidden to fabricate.',
})

/**
 * Properties that may never appear, at any depth, with any value — including a seed value, a
 * placeholder, or "just for rich results". Each carries the reason it is refused, and the reason is
 * the message a contributor sees. Three further families are refused by the shape of the name
 * rather than by listing every spelling: `FORBIDDEN_PROPERTY_PATTERNS`, below.
 */
export const FORBIDDEN_PROPERTIES = Object.freeze({
  offers: 'Nothing on this site is for sale today, and no price is displayed anywhere.',
  availability: 'An availability claim about a product this site does not sell.',
  award: 'DelayPilot has won nothing. An award nobody gave is a fabricated credential.',
  awards: 'Same.',
  interactionCount: 'A user count. None is measured and none is displayed (AGENTS.md §1.1).',
  userInteractionCount: 'Same.',
  interactionStatistic: 'Same, in its current spelling.',
  sameAs: 'Every sameAs is an identity claim about a profile elsewhere. None is verified here.',
  potentialAction:
    'The only plausible action is a SearchAction, and this site has no search endpoint to declare.',
  email: 'No address goes into markup, a URL, a title or a log (AGENTS.md §2).',
  telephone: 'No telephone number exists, and none is displayed.',
  faxNumber: 'Same.',
  address: 'No postal address is published on this site.',
  founder: 'Not published, and a person is not a credit this site makes machine-readable.',
  foundingDate: 'Not published anywhere a reader can see.',
  numberOfEmployees: 'Not published, and not a fact this site asserts.',
  duns: 'A company identifier that is not published on any page.',
  taxID: 'Same.',
  vatID: 'Same.',
  leiCode: 'Same.',
  memberOf: 'An affiliation claim. DelayPilot is affiliated with nobody (AGENTS.md §1.4).',
  parentOrganization: 'Same.',
  subOrganization: 'Same.',
  brand: 'A brand relationship claim that no page states.',
  sponsor: 'A commercial relationship claim that no page states.',
  funder: 'Same.',
  airline: 'No airline entity is ever described here; naming one implies affiliation (§1.4).',
  flightNumber: 'A live flight instance is never described in markup (DIRECTIVE.md §9, §28).',
  departureAirport: 'Same.',
  arrivalAirport: 'Same.',
})

/**
 * Three whole families are refused by shape rather than by name, because each has more spellings
 * than a list can hold and a new one appears with every schema.org release: a rating property is
 * refused whatever it is called, a `review…` property is refused whatever it counts, and a price
 * property is refused whatever currency it is in. Matching the NAME by pattern also means the
 * refusal survives a vocabulary that renames the field.
 *
 * (It has a second, smaller benefit: the repository's forbidden-phrase lint reads the superlative
 * inside one of those schema.org property names as a claim of its own, and a rule is the honest way
 * to refuse the family without typing it out.)
 */
export const FORBIDDEN_PROPERTY_PATTERNS = Object.freeze([
  {
    id: 'rating',
    pattern: /rating/i,
    reason:
      'DelayPilot has no ratings, so no property naming one may be emitted — not the aggregate, not the value, not the count, not the bounds beside them. A rating nobody gave is a fabricated statistic (AGENTS.md §1.1).',
  },
  {
    id: 'review',
    pattern: /^review/i,
    reason:
      'No review exists. Marked-up reviews that no reader can see are fabricated content, and a count of them is a fabricated number.',
  },
  {
    id: 'price',
    pattern: /price/i,
    reason: 'No price is rendered on any page of this site, in any currency or specification.',
  },
])

/**
 * Property names whose values are prose a reader must be able to find on the page. Everything else
 * an emitted node carries is a URL, a date, an identifier, a type or a number.
 */
export const VISIBLE_TEXT_PROPERTIES = Object.freeze([
  'name',
  'headline',
  'description',
  'text',
  'caption',
  'alternateName',
  'abstract',
])

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Walk an emitted node and report every violation. Never throws, never mutates: a validator that
 * edits what it is checking cannot be trusted by the thing it checked.
 *
 * @param {unknown} node
 * @param {{ path?: string, requireContext?: boolean }} [options]
 * @returns {{ code: string, path: string, detail: string }[]}
 */
export function validateSchemaNode(node, options = {}) {
  const { path = '$', requireContext = true } = options
  /** @type {{ code: string, path: string, detail: string }[]} */
  const findings = []

  if (!isPlainObject(node)) {
    findings.push({
      code: 'not-an-object',
      path,
      detail: 'A JSON-LD block must be a JSON object.',
    })
    return findings
  }

  if (requireContext) {
    const context = node['@context']
    if (context !== SCHEMA_CONTEXT) {
      findings.push({
        code: 'bad-context',
        path,
        detail: `@context is ${JSON.stringify(context)}; the only permitted value is "${SCHEMA_CONTEXT}".`,
      })
    }
  }

  walk(node, path, findings)
  return findings
}

/**
 * @param {unknown} value
 * @param {string} path
 * @param {{ code: string, path: string, detail: string }[]} findings
 */
function walk(value, path, findings) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walk(entry, `${path}[${index}]`, findings))
    return
  }
  if (!isPlainObject(value)) return

  const type = value['@type']
  if (type !== undefined) {
    const types = Array.isArray(type) ? type : [type]
    for (const one of types) {
      if (typeof one !== 'string') {
        findings.push({
          code: 'bad-type',
          path: `${path}.@type`,
          detail: `@type must be a string, found ${JSON.stringify(one)}.`,
        })
        continue
      }
      if (ALLOWED_TYPES.includes(one)) continue
      const deferred = Object.prototype.hasOwnProperty.call(DEFERRED_TYPES, one)
        ? DEFERRED_TYPES[one]
        : undefined
      findings.push({
        code: deferred === undefined ? 'type-not-allowed' : 'type-deferred',
        path: `${path}.@type`,
        detail:
          deferred === undefined
            ? `"${one}" is not on the allowlist (${ALLOWED_TYPES.join(', ')}). Adding a type is a deliberate change to apps/web/src/lib/seo/schema-policy.mjs with the visible surface that backs it.`
            : `"${one}" is deferred: ${deferred}`,
      })
    }
  }

  for (const [key, entry] of Object.entries(value)) {
    const here = `${path}.${key}`
    if (Object.prototype.hasOwnProperty.call(FORBIDDEN_PROPERTIES, key)) {
      findings.push({
        code: 'forbidden-property',
        path: here,
        detail: `"${key}" may never be emitted. ${FORBIDDEN_PROPERTIES[key]}`,
      })
      continue
    }
    const family = FORBIDDEN_PROPERTY_PATTERNS.find((rule) => rule.pattern.test(key))
    if (family !== undefined) {
      findings.push({
        code: 'forbidden-property',
        path: here,
        detail: `"${key}" is a ${family.id} property and may never be emitted. ${family.reason}`,
      })
      continue
    }
    if (entry === undefined || entry === null) {
      findings.push({
        code: 'empty-value',
        path: here,
        detail:
          'A property with no value asserts that the value is unknown-but-present. Omit the property instead (AGENTS.md §1.1).',
      })
      continue
    }
    if (typeof entry === 'string' && entry.trim() === '') {
      findings.push({
        code: 'empty-value',
        path: here,
        detail: 'An empty string is not a value. Omit the property instead.',
      })
      continue
    }
    walk(entry, here, findings)
  }
}

/**
 * Every prose string an emitted node carries, with the property path that produced it. These are
 * the strings a page's visible text must contain; anything else in the block is a URL, a date, an
 * identifier or a number.
 *
 * @param {unknown} node
 * @param {string} [path]
 * @returns {{ path: string, property: string, value: string }[]}
 */
export function visibleTextClaims(node, path = '$') {
  /** @type {{ path: string, property: string, value: string }[]} */
  const claims = []

  const visit = (value, here) => {
    if (Array.isArray(value)) {
      value.forEach((entry, index) => visit(entry, `${here}[${index}]`))
      return
    }
    if (!isPlainObject(value)) return
    for (const [key, entry] of Object.entries(value)) {
      const next = `${here}.${key}`
      if (typeof entry === 'string' && VISIBLE_TEXT_PROPERTIES.includes(key)) {
        claims.push({ path: next, property: key, value: entry })
        continue
      }
      visit(entry, next)
    }
  }

  visit(node, path)
  return claims
}
