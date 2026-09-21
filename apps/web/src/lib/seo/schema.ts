/**
 * The JSON-LD DelayPilot emits, and nothing else. Owner: `seo-engineer`.
 *
 * ONE BLOCK PER PAGE, BUILT HERE, VALIDATED HERE. A page gets a single
 * `<script type="application/ld+json">` holding a `@graph`: the sitewide identity (`Organization`,
 * `WebSite`) plus, where the page has one, the node describing what the page itself renders — an
 * `Article` for a guide or rights explainer, an `ItemList` for a rendered list of links. Every
 * builder runs its own output through `validateSchemaNode` and THROWS on a finding, so a node that
 * breaks the policy fails the build rather than shipping (`AGENTS.md §1.5`, fail closed).
 *
 * EVERY FIELD IS BACKED BY SOMETHING ON THE PAGE.
 *
 *   `name`          the wordmark and the footer both render "DelayPilot" as text, ten times on a
 *                   typical page; the string comes from `nav.brand`, the same constant the header
 *                   renders, so the markup cannot drift from the pixel.
 *   `url` / `@id`   the page's own canonical URL, from the one resolver (`site-url.mjs`).
 *   `logo`          `/icons/icon-512.png`, the raster of the mark that is inlined in the header of
 *                   every page (`scripts/assets/asset-manifest.mjs`).
 *   `headline`      the article's visible `<h1>`, passed in by the caller, never re-derived.
 *   `dateModified`  the "Reviewed <date>" line the article already prints. There is no
 *                   `datePublished`: no entry records a publication date, and inventing one would
 *                   be a fabricated fact in a field a search engine reads as authoritative.
 *   `itemListElement` one entry per rendered card, `name` being that card's visible link text.
 *
 * WHAT IS ABSENT AND WHY: `schema-policy.mjs`. The short version is that a rating, a price, an
 * award, a user count, a social profile, a breadcrumb that no page draws and an application claim
 * the product cannot honour are each a statement no reader could check.
 *
 * WHERE IT IS RENDERED. The `<head>` belongs to `apps/web/src/layouts/BaseLayout.astro`
 * (`frontend-ui-engineer`). This module is the contract that layout calls; it deliberately renders
 * nothing itself. A JSON-LD block is a data block, not executable script: measured under the served
 * `script-src 'self'` policy, it produces zero CSP violations while an executable inline script in
 * the same page produces one (`docs/SEO.md §6.2`).
 */

import { nav } from '../copy/nav.ts'
import { absoluteUrl, canonicalUrl } from './site-url.mjs'
import { SCHEMA_CONTEXT, validateSchemaNode } from './schema-policy.mjs'

/** A node in the emitted graph. Values are JSON — no `undefined`, ever (the validator refuses it). */
export type SchemaValue = string | number | boolean | SchemaNode | readonly SchemaValue[]
export interface SchemaNode {
  readonly [property: string]: SchemaValue
}

export interface SchemaGraph {
  readonly '@context': string
  readonly '@graph': readonly SchemaNode[]
}

/** The logo raster. 512×512, the same mark the header inlines. */
const LOGO_PATH = '/icons/icon-512.png'
const LOGO_PIXELS = 512

const organizationId = (origin: string): string => `${canonicalUrl(origin, '/')}#organization`
const webSiteId = (origin: string): string => `${canonicalUrl(origin, '/')}#website`

/** The publisher node. Referenced by `@id` from everything else, never repeated inline. */
export function organizationNode(origin: string): SchemaNode {
  return {
    '@type': 'Organization',
    '@id': organizationId(origin),
    name: nav.brand,
    url: canonicalUrl(origin, '/'),
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl(origin, LOGO_PATH),
      width: LOGO_PIXELS,
      height: LOGO_PIXELS,
    },
  }
}

/** The site node. No `potentialAction`: there is no search endpoint to declare. */
export function webSiteNode(origin: string): SchemaNode {
  return {
    '@type': 'WebSite',
    '@id': webSiteId(origin),
    name: nav.brand,
    url: canonicalUrl(origin, '/'),
    inLanguage: 'en',
    publisher: { '@id': organizationId(origin) },
  }
}

export interface ArticleInput {
  /** The visible `<h1>`, byte for byte. */
  readonly headline: string
  /** The date the page prints beside "Reviewed", `YYYY-MM-DD`. */
  readonly reviewedAt: string
}

export interface ListItemInput {
  /** The visible link text of the rendered card. */
  readonly name: string
  /** The route the card links to. */
  readonly pathname: string
}

export interface PageSchemaInput {
  /** A validated origin from `site-url.mjs`. */
  readonly origin: string
  /** The page's own path. */
  readonly pathname: string
  readonly article?: ArticleInput | undefined
  /** One entry per rendered card, in the order they appear on the page. */
  readonly itemList?: readonly ListItemInput[] | undefined
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * The complete graph for one page.
 *
 * @throws when a caller passes a value the policy refuses, or an empty headline, or a reviewed date
 * that is not an ISO calendar date. Failing here is the point: the alternative is a page that ships
 * with a machine-readable claim nobody checked.
 */
export function pageSchemaGraph(input: PageSchemaInput): SchemaGraph {
  const { origin, pathname, article, itemList } = input
  const canonical = canonicalUrl(origin, pathname)

  const nodes: SchemaNode[] = [organizationNode(origin), webSiteNode(origin)]

  if (article !== undefined) {
    const headline = article.headline.trim()
    if (headline === '') {
      throw new Error('pageSchemaGraph: an Article needs the page’s visible headline.')
    }
    if (!ISO_DATE.test(article.reviewedAt)) {
      throw new Error(
        `pageSchemaGraph: reviewedAt must be an ISO calendar date, received "${article.reviewedAt}".`,
      )
    }
    nodes.push({
      '@type': 'Article',
      '@id': `${canonical}#article`,
      headline,
      url: canonical,
      mainEntityOfPage: canonical,
      dateModified: article.reviewedAt,
      inLanguage: 'en',
      isPartOf: { '@id': webSiteId(origin) },
      publisher: { '@id': organizationId(origin) },
    })
  }

  if (itemList !== undefined && itemList.length > 0) {
    nodes.push({
      '@type': 'ItemList',
      '@id': `${canonical}#list`,
      numberOfItems: itemList.length,
      itemListElement: itemList.map((item, index) => {
        const name = item.name.trim()
        if (name === '') {
          throw new Error('pageSchemaGraph: every ItemList entry needs its visible link text.')
        }
        return {
          '@type': 'ListItem',
          position: index + 1,
          name,
          url: canonicalUrl(origin, item.pathname),
        }
      }),
    })
  }

  const graph: SchemaGraph = { '@context': SCHEMA_CONTEXT, '@graph': nodes }

  const findings = validateSchemaNode(graph)
  if (findings.length > 0) {
    const detail = findings.map((f) => `${f.path}: ${f.detail}`).join('\n  ')
    throw new Error(`pageSchemaGraph: the built graph breaks the policy.\n  ${detail}`)
  }

  return graph
}

/**
 * The graph as the exact text of a `<script type="application/ld+json">` body.
 *
 * `<` is escaped to `<`, which is still the same JSON string to any parser and cannot close
 * the element early. That is the whole of the injection surface for a data block, and it is handled
 * here rather than trusted to a caller.
 */
export function pageSchemaJson(input: PageSchemaInput): string {
  return JSON.stringify(pageSchemaGraph(input)).replace(/</g, '\\u003c')
}
