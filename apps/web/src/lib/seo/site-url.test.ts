/**
 * The origin resolver, and the production guard that depends on it.
 *
 * The case that matters most is the one in the middle: a build with NO configured origin must
 * succeed locally and FAIL in production. Both directions are asserted, because a guard that only
 * ever fails is a guard nobody can build against, and one that never fails is not a guard.
 */

import { describe, expect, it } from 'vitest'

import {
  COMMITTED_ORIGIN,
  DEV_FALLBACK_ORIGIN,
  REASONS,
  SiteUrlConfigError,
  absoluteUrl,
  canonicalUrl,
  isProductionBuild,
  normalizeSiteUrl,
  resolveSiteUrl,
} from './site-url.mjs'

describe('normalizeSiteUrl', () => {
  it('accepts a bare https origin, with or without the trailing slash', () => {
    expect(normalizeSiteUrl('https://delaypilot.app')).toEqual({
      ok: true,
      origin: 'https://delaypilot.app',
    })
    expect(normalizeSiteUrl('  https://delaypilot.app/  ')).toEqual({
      ok: true,
      origin: 'https://delaypilot.app',
    })
  })

  it('accepts the origin the sitemap and robots.txt already commit', () => {
    expect(normalizeSiteUrl(COMMITTED_ORIGIN).ok).toBe(true)
  })

  const rejected: readonly [unknown, string][] = [
    [undefined, REASONS.missing],
    ['', REASONS.missing],
    ['   ', REASONS.missing],
    [42, REASONS.missing],
    ['delaypilot.app', REASONS.notAbsolute],
    ['http://delaypilot.app', REASONS.notHttps],
    ['https://reader:secret@delaypilot.app', REASONS.hasCredentials],
    ['https://delaypilot.app/site', REASONS.hasPath],
    ['https://delaypilot.app/?utm_source=x', REASONS.hasQuery],
    ['https://delaypilot.app/#top', REASONS.hasFragment],
    ['https://example.com', REASONS.placeholderHost],
    // The literal shipped in .env.example. If this ever passes, the guard is decorative.
    ['https://example.invalid', REASONS.placeholderHost],
    ['https://your-domain.com', REASONS.placeholderHost],
    ['https://changeme.app', REASONS.placeholderHost],
    ['https://staging.test', REASONS.placeholderHost],
    ['https://app.localhost', REASONS.placeholderHost],
    ['https://localhost', REASONS.noDot],
    ['https://127.0.0.1', REASONS.ipLiteral],
    ['https://intranet', REASONS.noDot],
  ]

  for (const [value, code] of rejected) {
    it(`rejects ${JSON.stringify(value)} as ${code}`, () => {
      const result = normalizeSiteUrl(value)
      expect(result.ok).toBe(false)
      if (result.ok) return
      expect(result.code).toBe(code)
      expect(result.message.length).toBeGreaterThan(20)
    })
  }

  it('does not reject a real domain merely for containing a placeholder word', () => {
    expect(normalizeSiteUrl('https://exampletravel.app').ok).toBe(true)
    expect(normalizeSiteUrl('https://testudo.app').ok).toBe(true)
  })
})

describe('isProductionBuild', () => {
  it('is false for a bare environment: a laptop build is not a deployment', () => {
    expect(isProductionBuild({})).toBe(false)
  })

  it('reads VERCEL_ENV, which is the only signal that separates production from a preview', () => {
    expect(isProductionBuild({ VERCEL_ENV: 'production' })).toBe(true)
    expect(isProductionBuild({ VERCEL_ENV: 'preview' })).toBe(false)
    expect(isProductionBuild({ VERCEL_ENV: 'development' })).toBe(false)
    expect(isProductionBuild({ VERCEL_ENV: 'qa-sandbox' })).toBe(false)
  })

  it('treats a Cloudflare build of the integration branch as production', () => {
    expect(isProductionBuild({ CF_PAGES_BRANCH: 'main' })).toBe(true)
    expect(isProductionBuild({ CF_PAGES_BRANCH: 'claude/whatever' })).toBe(false)
    expect(isProductionBuild({ WORKERS_CI_BRANCH: 'main' })).toBe(true)
  })

  it('never reads NODE_ENV, which is production for every optimized build', () => {
    expect(isProductionBuild({ NODE_ENV: 'production' })).toBe(false)
  })

  it('lets the explicit switch win in both directions', () => {
    expect(isProductionBuild({ SEO_REQUIRE_SITE_URL: '1' })).toBe(true)
    expect(isProductionBuild({ SEO_REQUIRE_SITE_URL: 'true' })).toBe(true)
    expect(isProductionBuild({ SEO_REQUIRE_SITE_URL: '0', VERCEL_ENV: 'production' })).toBe(false)
  })
})

describe('resolveSiteUrl', () => {
  it('returns the configured origin', () => {
    expect(resolveSiteUrl({ env: { PUBLIC_SITE_URL: 'https://delaypilot.app/' } })).toEqual({
      origin: 'https://delaypilot.app',
      source: 'env',
    })
  })

  it('resolves to nothing, with a reason, when a local build has no origin', () => {
    const resolved = resolveSiteUrl({ env: {} })
    expect(resolved.origin).toBeUndefined()
    expect(resolved.source).toBe('absent')
    expect(resolved.reason).toContain('PUBLIC_SITE_URL')
  })

  it('falls back to localhost only in dev mode', () => {
    expect(resolveSiteUrl({ env: {}, mode: 'dev' }).origin).toBe(DEV_FALLBACK_ORIGIN)
    expect(resolveSiteUrl({ env: {}, mode: 'build' }).origin).toBeUndefined()
  })

  it('fails a production build with a named error and a machine-readable code', () => {
    let thrown: unknown
    try {
      resolveSiteUrl({ env: { VERCEL_ENV: 'production' } })
    } catch (error: unknown) {
      thrown = error
    }
    expect(thrown).toBeInstanceOf(SiteUrlConfigError)
    const error = thrown as SiteUrlConfigError
    expect(error.name).toBe('SiteUrlConfigError')
    expect(error.code).toBe(REASONS.missing)
    expect(error.message).toContain('PRODUCTION build')
  })

  it('fails a production build that still holds the example value', () => {
    expect(() =>
      resolveSiteUrl({
        env: { PUBLIC_SITE_URL: 'https://example.invalid', SEO_REQUIRE_SITE_URL: '1' },
      }),
    ).toThrow(SiteUrlConfigError)
  })

  it('does not fail a preview build that has no origin', () => {
    expect(resolveSiteUrl({ env: { VERCEL_ENV: 'preview' } }).origin).toBeUndefined()
  })
})

describe('canonicalUrl', () => {
  const origin = 'https://delaypilot.app'

  it('applies the route shape: lower case, trailing slash, nothing else', () => {
    expect(canonicalUrl(origin, '/')).toBe('https://delaypilot.app/')
    expect(canonicalUrl(origin, '/guides/')).toBe('https://delaypilot.app/guides/')
    expect(canonicalUrl(origin, '/guides')).toBe('https://delaypilot.app/guides/')
    expect(canonicalUrl(origin, '/Guides/Self-Transfer-Risk/')).toBe(
      'https://delaypilot.app/guides/self-transfer-risk/',
    )
  })

  it('drops a query string and a fragment, so one page has one address', () => {
    expect(canonicalUrl(origin, '/about/?utm_campaign=newsletter#team')).toBe(
      'https://delaypilot.app/about/',
    )
  })
})

describe('absoluteUrl', () => {
  it('keeps an asset path exactly as it is, and adds no trailing slash', () => {
    expect(absoluteUrl('https://delaypilot.app', '/og/default-1200x630.png')).toBe(
      'https://delaypilot.app/og/default-1200x630.png',
    )
  })
})
