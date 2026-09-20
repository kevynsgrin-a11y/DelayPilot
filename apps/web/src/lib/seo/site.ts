/**
 * The site origin as the rendering layer sees it. Owner: `seo-engineer`.
 *
 * This is the typed face of `site-url.mjs`; the rules live there and are not restated here. A
 * layout, a page or a JSON-LD builder asks this module for an absolute URL and never builds one by
 * concatenation, so there is exactly one answer to "what is this site's address" on every surface.
 *
 * WHY THE PRODUCTION GUARD IS NOT IN THIS FILE. Vite — and therefore Astro — exposes only prefixed
 * variables on `import.meta.env`. `VERCEL_ENV`, `CF_PAGES_BRANCH` and `SEO_REQUIRE_SITE_URL` carry
 * no prefix and are invisible here by design, so the "is this a production build" decision is made
 * where the unprefixed environment exists: `scripts/seo/site-url-guard.mjs`, run from the build
 * (`docs/SEO.md §10`). This module's job is narrower and unconditional: with a valid
 * `PUBLIC_SITE_URL` it yields absolute URLs, and without one it yields `undefined` and every tag
 * that needs an origin is omitted rather than guessed (`AGENTS.md §1.1`).
 */

import { DEV_FALLBACK_ORIGIN, absoluteUrl, canonicalUrl, normalizeSiteUrl } from './site-url.mjs'

/**
 * Read through the index signature: `PUBLIC_SITE_URL` is not part of Astro's own `ImportMetaEnv`,
 * and `noPropertyAccessFromIndexSignature` (`AGENTS.md §3.1`) forbids dotting into one.
 */
const configured: unknown = import.meta.env['PUBLIC_SITE_URL']

const resolved = normalizeSiteUrl(configured)

/**
 * `astro dev` only. A developer running the dev server sees the canonical, `og:url` and absolute
 * image tags against `http://localhost:4321` so their presence and shape are reviewable; a BUILD
 * with no configured origin omits them, because a localhost canonical in a deployed artifact would
 * be a fabricated address rather than a visible placeholder.
 */
const devFallback: string | undefined = import.meta.env.DEV ? DEV_FALLBACK_ORIGIN : undefined

/** The origin every absolute URL on the site is stamped from, or `undefined` when unconfigured. */
export const siteOrigin: string | undefined = resolved.ok ? resolved.origin : devFallback

/** Why there is no origin, for a build log. `undefined` when there is one. */
export const siteOriginAbsentReason: string | undefined =
  siteOrigin === undefined && !resolved.ok ? resolved.message : undefined

/**
 * The self-referencing canonical URL for a route, or `undefined` when no origin is configured.
 *
 * The §18.1 route shape is applied by `canonicalUrl`: lower case, trailing slash, no query, no
 * fragment. Two routes can therefore never differ only by case or by a tracking parameter.
 */
export function canonicalFor(pathname: string): string | undefined {
  return siteOrigin === undefined ? undefined : canonicalUrl(siteOrigin, pathname)
}

/**
 * An absolute URL for a static asset — an Open Graph image, an icon — or `undefined` when no origin
 * is configured. A crawler cannot resolve a site-relative `og:image`, so the tag is omitted with
 * the origin rather than emitted as a path.
 */
export function absoluteFor(path: string): string | undefined {
  return siteOrigin === undefined ? undefined : absoluteUrl(siteOrigin, path)
}
