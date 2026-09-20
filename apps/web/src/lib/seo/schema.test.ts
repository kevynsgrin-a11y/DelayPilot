/**
 * The structured-data builders, and the policy that decides what they may say.
 *
 * The last test in this file is the one the charter's definition of done names: a grep over an
 * emitted graph for every property that would assert a rating, a price, an award or a user count.
 * It runs over the richest graph the builders can produce, so "nothing emits it" is a measurement
 * rather than a claim about the code.
 */

import { describe, expect, it } from 'vitest'

import {
  ALLOWED_TYPES,
  DEFERRED_TYPES,
  FORBIDDEN_PROPERTIES,
  SCHEMA_CONTEXT,
  validateSchemaNode,
  visibleTextClaims,
} from './schema-policy.mjs'
import { organizationNode, pageSchemaGraph, pageSchemaJson, webSiteNode } from './schema.ts'

const origin = 'https://delaypilot.app'

describe('the sitewide identity graph', () => {
  const graph = pageSchemaGraph({ origin, pathname: '/about/' })

  it('is one @graph holding exactly the organization and the site', () => {
    expect(graph['@context']).toBe(SCHEMA_CONTEXT)
    expect(graph['@graph'].map((node) => node['@type'])).toEqual(['Organization', 'WebSite'])
  })

  it('names the brand with the same constant the header renders', () => {
    expect(organizationNode(origin)['name']).toBe('DelayPilot')
    expect(webSiteNode(origin)['name']).toBe('DelayPilot')
  })

  it('points every identifier and URL at the configured origin', () => {
    const serialized = JSON.stringify(graph)
    const urls = [...serialized.matchAll(/"(https?:\/\/[^"]+)"/g)]
      .map((match) => match[1] ?? '')
      .filter((url) => url !== SCHEMA_CONTEXT)
    expect(urls.length).toBeGreaterThan(0)
    for (const url of urls) expect(url.startsWith(`${origin}/`), url).toBe(true)
  })

  it('declares no search action, because there is no search endpoint', () => {
    expect(JSON.stringify(graph)).not.toContain('potentialAction')
  })
})

describe('the article node', () => {
  const graph = pageSchemaGraph({
    origin,
    pathname: '/guides/self-transfer-risk/',
    article: { headline: 'Self-transfer risk', reviewedAt: '2026-09-12' },
  })
  const article = graph['@graph'].find((node) => node['@type'] === 'Article')

  it('carries the visible headline and the reviewed date, and nothing else about the author', () => {
    expect(article?.['headline']).toBe('Self-transfer risk')
    expect(article?.['dateModified']).toBe('2026-09-12')
    expect(article?.['author']).toBeUndefined()
    expect(article?.['datePublished']).toBeUndefined()
    expect(article?.['image']).toBeUndefined()
  })

  it('identifies itself by the page canonical', () => {
    expect(article?.['url']).toBe('https://delaypilot.app/guides/self-transfer-risk/')
    expect(article?.['mainEntityOfPage']).toBe('https://delaypilot.app/guides/self-transfer-risk/')
  })

  it('refuses an empty headline or a date that is not an ISO calendar date', () => {
    expect(() =>
      pageSchemaGraph({
        origin,
        pathname: '/guides/x/',
        article: { headline: '   ', reviewedAt: '2026-09-12' },
      }),
    ).toThrow(/visible headline/)
    expect(() =>
      pageSchemaGraph({
        origin,
        pathname: '/guides/x/',
        article: { headline: 'X', reviewedAt: '12 September 2026' },
      }),
    ).toThrow(/ISO calendar date/)
  })
})

describe('the item list', () => {
  const graph = pageSchemaGraph({
    origin,
    pathname: '/guides/',
    itemList: [
      { name: 'Self-transfer risk', pathname: '/guides/self-transfer-risk/' },
      { name: 'Saving receipts and evidence', pathname: '/guides/saving-receipts-and-evidence/' },
    ],
  })
  const list = graph['@graph'].find((node) => node['@type'] === 'ItemList')

  it('numbers the rendered cards from one, in the order they appear', () => {
    expect(list?.['numberOfItems']).toBe(2)
    const items = list?.['itemListElement'] as readonly Record<string, unknown>[]
    expect(items.map((item) => item['position'])).toEqual([1, 2])
    expect(items[0]?.['name']).toBe('Self-transfer risk')
    expect(items[1]?.['url']).toBe('https://delaypilot.app/guides/saving-receipts-and-evidence/')
  })

  it('emits nothing when the page rendered no list', () => {
    const empty = pageSchemaGraph({ origin, pathname: '/guides/', itemList: [] })
    expect(empty['@graph'].some((node) => node['@type'] === 'ItemList')).toBe(false)
  })
})

describe('the policy', () => {
  it('refuses a type that is not on the allowlist', () => {
    const findings = validateSchemaNode({
      '@context': SCHEMA_CONTEXT,
      '@type': 'Flight',
      name: 'AA100',
    })
    expect(findings.map((finding) => finding.code)).toContain('type-not-allowed')
  })

  it('refuses a deferred type and says what would make it honest', () => {
    for (const type of Object.keys(DEFERRED_TYPES)) {
      const findings = validateSchemaNode({ '@context': SCHEMA_CONTEXT, '@type': type })
      const deferred = findings.find((finding) => finding.code === 'type-deferred')
      expect(deferred, type).toBeDefined()
      expect(deferred?.detail.length).toBeGreaterThan(40)
    }
  })

  it('refuses every forbidden property, at any depth, with any value', () => {
    for (const property of Object.keys(FORBIDDEN_PROPERTIES)) {
      const findings = validateSchemaNode({
        '@context': SCHEMA_CONTEXT,
        '@type': 'Organization',
        name: 'DelayPilot',
        publisher: { '@type': 'Organization', name: 'DelayPilot', [property]: '1.0' },
      })
      expect(
        findings.some(
          (finding) => finding.code === 'forbidden-property' && finding.path.endsWith(property),
        ),
        property,
      ).toBe(true)
    }
  })

  it('refuses a whole family by the shape of the name, not only by a listed name', () => {
    for (const property of [
      'aggregateRating',
      'ratingValue',
      'ratingCount',
      'reviewRating',
      'reviewCount',
      'reviews',
      'price',
      'priceCurrency',
      'highPrice',
      'lowPrice',
    ]) {
      const findings = validateSchemaNode({
        '@context': SCHEMA_CONTEXT,
        '@type': 'Organization',
        name: 'DelayPilot',
        [property]: '1.0',
      })
      expect(
        findings.some(
          (finding) => finding.code === 'forbidden-property' && finding.path.endsWith(property),
        ),
        property,
      ).toBe(true)
    }
  })

  it('refuses a property with no value rather than letting it assert an unknown', () => {
    const findings = validateSchemaNode({
      '@context': SCHEMA_CONTEXT,
      '@type': 'Organization',
      name: '',
    })
    expect(findings.map((finding) => finding.code)).toContain('empty-value')
  })

  it('refuses a context that is not schema.org', () => {
    const findings = validateSchemaNode({ '@context': 'https://example.com', '@type': 'WebSite' })
    expect(findings.map((finding) => finding.code)).toContain('bad-context')
  })

  it('lists only prose as a claim the page must display', () => {
    const claims = visibleTextClaims(pageSchemaGraph({ origin, pathname: '/' }))
    expect(claims.map((claim) => claim.value)).toEqual(['DelayPilot', 'DelayPilot'])
  })

  it('keeps the allowlist inside the charter ceiling', () => {
    const ceiling = [
      'Organization',
      'WebSite',
      'WebApplication',
      'SoftwareApplication',
      'BreadcrumbList',
      'Article',
      'FAQPage',
      'ItemList',
      'ListItem',
      'ImageObject',
      'Question',
      'Answer',
    ]
    for (const type of ALLOWED_TYPES) expect(ceiling).toContain(type)
  })
})

describe('serialization', () => {
  it('escapes < so a data block cannot be closed early', () => {
    const json = pageSchemaJson({
      origin,
      pathname: '/guides/x/',
      article: { headline: 'A < B </script>', reviewedAt: '2026-09-12' },
    })
    expect(json).not.toContain('</script>')
    expect(json).toContain('\\u003c')
    expect(JSON.parse(json)).toBeTruthy()
  })
})

describe('the definition-of-done grep', () => {
  it('emits no rating, review, price, availability, award or interaction count', () => {
    const richest = pageSchemaJson({
      origin,
      pathname: '/guides/',
      article: { headline: 'Guides', reviewedAt: '2026-09-12' },
      itemList: [{ name: 'Self-transfer risk', pathname: '/guides/self-transfer-risk/' }],
    })
    for (const banned of [
      'aggregateRating',
      'review',
      'ratingValue',
      'reviewCount',
      'price',
      'availability',
      'award',
      'userInteractionCount',
    ]) {
      expect(richest.toLowerCase(), banned).not.toContain(banned.toLowerCase())
    }
  })
})
