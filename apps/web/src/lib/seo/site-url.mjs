/**
 * The one place DelayPilot decides what its own origin is. Owner: `seo-engineer`.
 *
 * WHY THIS FILE IS `.mjs` AND NOT `.ts`. Four consumers need the same answer and they do not share
 * a runtime: the Astro layout (TypeScript, Vite), `scripts/seo/*.mjs` (bare Node, no loader,
 * because `pnpm test:seo` is exactly `node scripts/seo/test-seo.mjs`), `astro.config.mjs`
 * (`frontend-ui-engineer`'s file, which may import it after the S4 handoff), and the unit tests.
 * Plain JavaScript with JSDoc types is the only form all four resolve with zero configuration, and
 * `allowJs` is on in `apps/web/tsconfig.json` (from `astro/tsconfigs/base`), so `astro check` still
 * type-checks every call site. A second implementation of this rule in a `.mjs` beside a `.ts`
 * would be the rule expressed twice, which `AGENTS.md §3.2` calls a defect.
 *
 * THE RULE, IN ONE PARAGRAPH. `PUBLIC_SITE_URL` is the origin. A **production** build with that
 * variable missing, empty, non-`https`, carrying a path, query, fragment or credentials, or still
 * holding an example value FAILS with a named error (`SiteUrlConfigError`) — `DIRECTIVE.md §19`.
 * A local or preview build does not fail: it resolves to `undefined`, and every absolute tag that
 * needs an origin is omitted rather than stamped against a guessed host. Inventing a canonical is
 * the fabricated value `AGENTS.md §1.1` forbids, and a canonical is the one tag a crawler acts on
 * without asking.
 *
 * WHY `COMMITTED_ORIGIN` EXISTS ANYWAY. The sitemap protocol has no relative `<loc>`, so
 * `sitemap.xml` and the `Sitemap:` line in `robots.txt` must write an absolute host whether or not
 * the build environment has been configured. That host is committed knowingly (`docs/SEO.md §3`)
 * and it is stated here once so the three files that carry it are checked against one constant
 * rather than against each other's typos.
 */

/** The product's own origin, committed for the files whose format has no relative form. */
export const COMMITTED_ORIGIN = 'https://delaypilot.app'

/** What `astro dev` serves on. Used only in `mode: 'dev'`; never stamped into a build. */
export const DEV_FALLBACK_ORIGIN = 'http://localhost:4321'

/**
 * A configuration error with a name a build log can be grepped for.
 *
 * @property {string} code machine-readable reason, one of the `REASONS` values below.
 */
export class SiteUrlConfigError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message)
    this.name = 'SiteUrlConfigError'
    this.code = code
  }
}

/** Every rejection reason, as a closed set, so a caller can branch without matching on prose. */
export const REASONS = Object.freeze({
  missing: 'missing',
  notAbsolute: 'not-absolute',
  notHttps: 'not-https',
  hasCredentials: 'has-credentials',
  hasPath: 'has-path',
  hasQuery: 'has-query',
  hasFragment: 'has-fragment',
  placeholderHost: 'placeholder-host',
  ipLiteral: 'ip-literal',
  noDot: 'no-dot',
  invalidSwitch: 'invalid-switch',
})

/** The one variable that can force the production rule on or off, named once. */
export const PRODUCTION_SWITCH_VAR = 'SEO_REQUIRE_SITE_URL'

/** Everything that switch accepts. Compared trimmed and lower-cased; nothing else is a value. */
export const SWITCH_ON_VALUES = Object.freeze(['1', 'true'])
export const SWITCH_OFF_VALUES = Object.freeze(['0', 'false'])

/**
 * Host labels that mean "nobody has filled this in yet".
 *
 * Matched label by label rather than as a substring, so a real domain that merely contains one of
 * these letters sequences (`exampletravel.com`) is not rejected, while `example.com`,
 * `example.invalid` — the literal in `.env.example` — `your-domain.com` and `changeme.dev` are.
 * `.test`, `.invalid`, `.example` and `.localhost` are the reserved names of RFC 2606 and RFC 6761,
 * which exist precisely so that a placeholder can never be somebody's real site.
 */
const PLACEHOLDER_LABELS = Object.freeze([
  'example',
  'invalid',
  'test',
  'localhost',
  'changeme',
  'change-me',
  'placeholder',
  'yourdomain',
  'your-domain',
  'mydomain',
  'my-domain',
  'todo',
  'tbd',
])

/** IPv4 literal, or anything bracketed, which is how `URL` reports IPv6. */
const isIpLiteral = (hostname) =>
  /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.startsWith('[')

/**
 * Validate a candidate origin.
 *
 * @param {unknown} value raw configuration value, typically `process.env.PUBLIC_SITE_URL`
 * @returns {{ ok: true, origin: string } | { ok: false, code: string, message: string }}
 */
export function normalizeSiteUrl(value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return {
      ok: false,
      code: REASONS.missing,
      message: 'PUBLIC_SITE_URL is missing or empty.',
    }
  }

  const raw = value.trim()
  let url
  try {
    url = new URL(raw)
  } catch {
    return {
      ok: false,
      code: REASONS.notAbsolute,
      message: `PUBLIC_SITE_URL is "${raw}", which is not an absolute URL. Expected an origin such as https://delaypilot.app with no path.`,
    }
  }

  if (url.protocol !== 'https:') {
    return {
      ok: false,
      code: REASONS.notHttps,
      message: `PUBLIC_SITE_URL is "${raw}". The public origin is served over https and every canonical URL must say so; "${url.protocol}//" would canonicalize the site to a scheme it does not serve.`,
    }
  }

  if (url.username !== '' || url.password !== '') {
    return {
      ok: false,
      code: REASONS.hasCredentials,
      message: `PUBLIC_SITE_URL carries credentials. A credential in an origin is a secret in a canonical tag, a sitemap and every Open Graph URL (AGENTS.md §2).`,
    }
  }

  if (url.pathname !== '/') {
    return {
      ok: false,
      code: REASONS.hasPath,
      message: `PUBLIC_SITE_URL is "${raw}", which carries the path "${url.pathname}". This value is an ORIGIN: every page path is appended to it, so a path here appears twice in every URL the site emits.`,
    }
  }

  if (url.search !== '') {
    return {
      ok: false,
      code: REASONS.hasQuery,
      message: `PUBLIC_SITE_URL is "${raw}", which carries a query string. A query string in a canonical URL splits one page into two addresses.`,
    }
  }

  if (url.hash !== '') {
    return {
      ok: false,
      code: REASONS.hasFragment,
      message: `PUBLIC_SITE_URL is "${raw}", which carries a fragment. A fragment is never part of an origin.`,
    }
  }

  const hostname = url.hostname.toLowerCase()

  if (isIpLiteral(hostname)) {
    return {
      ok: false,
      code: REASONS.ipLiteral,
      message: `PUBLIC_SITE_URL is "${raw}". An IP literal is not a public origin; canonicalizing to one takes the site out of the index.`,
    }
  }

  if (!hostname.includes('.')) {
    return {
      ok: false,
      code: REASONS.noDot,
      message: `PUBLIC_SITE_URL is "${raw}", whose host "${hostname}" has no dot. That is a local or container name, not a public origin.`,
    }
  }

  const labels = hostname.split('.')
  const placeholder = labels.find((label) => PLACEHOLDER_LABELS.includes(label))
  if (placeholder !== undefined) {
    return {
      ok: false,
      code: REASONS.placeholderHost,
      message: `PUBLIC_SITE_URL is "${raw}", whose host contains the placeholder label "${placeholder}". That is the value shipped in .env.example, not a domain this site is served from. Set the real origin or leave the variable unset — a placeholder canonical is a fabricated value (AGENTS.md §1.1).`,
    }
  }

  return { ok: true, origin: url.origin }
}

/**
 * Read `SEO_REQUIRE_SITE_URL` as the three-state switch it is: on, off, or silent.
 *
 * WHY AN UNRECOGNIZED VALUE REFUSES THE BUILD RATHER THAN PICKING AN ANSWER. This switch has two
 * readers with opposite interests. Someone writing `yes` is reaching for it to turn the guard ON;
 * reading an unknown value as OFF hands them a production build with the guard silently skipped —
 * exactly the build where silence is most expensive, since it can ship canonical tags pointing at
 * a host nobody owns. Reading an unknown value as ON is no better: it fails the builds whose
 * author wrote something like `exempt` meaning off. There is no reading of `yes` that is right for
 * both, so neither is guessed. Refusing, by name, with the accepted values in the message, is the
 * fail-closed answer (`AGENTS.md §1.5`) and the only one that tells the author what to write.
 *
 * WHAT IS STILL ACCEPTED, because each of these is load-bearing:
 *
 *  - case is ignored, so `TRUE` and `False` work;
 *  - surrounding whitespace is ignored, as it is for `PUBLIC_SITE_URL` above — a value that is
 *    only whitespace carries no token at all and is treated as blank, not as a typo;
 *  - blank means unset, so `SEO_REQUIRE_SITE_URL=` (the line shipped in `.env.example`) defers to
 *    `VERCEL_ENV` and the Cloudflare branch rather than forcing anything.
 *
 * @param {Record<string, string | undefined>} env
 * @returns {boolean | undefined} `true` forces the guard on, `false` forces it off, `undefined`
 *   means the variable says nothing and the platform signals decide.
 * @throws {SiteUrlConfigError} with code `invalid-switch` on any value outside that vocabulary
 */
export function readProductionSwitch(env) {
  const raw = env[PRODUCTION_SWITCH_VAR]
  if (raw === undefined || raw === null) return undefined

  const value = String(raw).trim().toLowerCase()
  if (value === '') return undefined
  if (SWITCH_ON_VALUES.includes(value)) return true
  if (SWITCH_OFF_VALUES.includes(value)) return false

  throw new SiteUrlConfigError(
    REASONS.invalidSwitch,
    `${PRODUCTION_SWITCH_VAR} is ${JSON.stringify(String(raw))}, which is not one of the values ` +
      'this switch accepts, so the build stops instead of guessing which one was meant.\n' +
      `Write ${PRODUCTION_SWITCH_VAR}=${SWITCH_ON_VALUES.join(' or =')} to REQUIRE ` +
      `PUBLIC_SITE_URL (the production rule of DIRECTIVE.md §19), ` +
      `=${SWITCH_OFF_VALUES.join(' or =')} to exempt this build from it, or leave the variable ` +
      'unset or empty to let VERCEL_ENV and the Cloudflare branch decide. Case and surrounding ' +
      'whitespace are ignored.\n' +
      'It is refused rather than read as OFF because someone writing an unrecognized value is ' +
      'far more likely to be turning the guard ON, and a guard that skips itself on a typo is ' +
      'not a guard (AGENTS.md §1.5). See docs/SEO.md §10.1.',
  )
}

/**
 * Is this build the one whose output is served at the public origin?
 *
 * WHAT IS DELIBERATELY NOT READ: `NODE_ENV`. Every optimized build sets it to `production`,
 * including a preview deployment of a branch and a developer's `pnpm build`, so it cannot
 * distinguish the deployment that owns the domain from one that does not. Keying the guard on it
 * would fail exactly the builds the dispatch requires to keep working.
 *
 * WHAT IS READ, in order:
 *
 *  1. `SEO_REQUIRE_SITE_URL` — the explicit switch, over a CLOSED vocabulary. `1`/`true` force the
 *     guard on, `0`/`false` force it off, unset or blank says nothing and defers to the signals
 *     below, and ANY OTHER VALUE throws `SiteUrlConfigError [invalid-switch]` instead of being
 *     read as either answer (`readProductionSwitch`). It exists so a platform this list has never
 *     heard of can still opt in with one variable, and so a deliberate production-shaped build in
 *     CI can be exercised.
 *  2. `VERCEL_ENV` — Vercel's own system variable, whose documented values are `production`,
 *     `preview`, `development`, or a custom environment name. The site is deployed there today
 *     (`docs/decisions/0002-foundation-stack-and-versions.md`), and it is the only one of these
 *     signals that separates a production deployment from a preview of the same commit.
 *  3. `CF_PAGES_BRANCH` / `WORKERS_CI_BRANCH` — Cloudflare's build variables. `main` is the
 *     integration branch and merging to it is a production deploy (decision D1,
 *     `docs/BUILD_PLAN.md §10`), so a build of `main` there is a production build.
 *
 * Anything else — a laptop, `pnpm build` in a pull-request check, a preview deployment — is not a
 * production build and does not fail on a missing origin.
 *
 * @param {Record<string, string | undefined>} env
 * @returns {boolean}
 * @throws {SiteUrlConfigError} when `SEO_REQUIRE_SITE_URL` holds a value it does not accept
 */
export function isProductionBuild(env) {
  const explicit = readProductionSwitch(env)
  if (explicit !== undefined) return explicit

  const vercel = env['VERCEL_ENV']
  if (vercel !== undefined && vercel !== '') return vercel === 'production'

  const cloudflareBranch = env['CF_PAGES_BRANCH'] ?? env['WORKERS_CI_BRANCH']
  if (cloudflareBranch !== undefined && cloudflareBranch !== '') return cloudflareBranch === 'main'

  return false
}

/**
 * Resolve the origin for this build, or explain why there is none.
 *
 * @param {{ env: Record<string, string | undefined>, mode?: 'build' | 'dev' }} options
 * @returns {{ origin: string | undefined, source: 'env' | 'dev-fallback' | 'absent', reason?: string }}
 * @throws {SiteUrlConfigError} in a production build with no usable value
 */
export function resolveSiteUrl({ env, mode = 'build' }) {
  // First, and unconditionally: an unreadable SEO_REQUIRE_SITE_URL is a configuration error even
  // when this build happens to have a usable origin. Validating it only on the failure path would
  // leave the typo in place until the day the origin goes missing, which is the worst day to
  // discover that the switch meant to catch that was never being read.
  const production = isProductionBuild(env)

  const result = normalizeSiteUrl(env['PUBLIC_SITE_URL'])
  if (result.ok) return { origin: result.origin, source: 'env' }

  if (production) {
    throw new SiteUrlConfigError(
      result.code,
      `${result.message}\n` +
        'This is a PRODUCTION build (DIRECTIVE.md §19), so the build fails rather than shipping a ' +
        'site with no canonical URL or, worse, one pointing at a host nobody owns. Set ' +
        'PUBLIC_SITE_URL to the real origin — see docs/SEO.md §10 for the activation steps — or ' +
        'build without the production signal to get a local build with the absolute tags omitted.',
    )
  }

  if (mode === 'dev') return { origin: DEV_FALLBACK_ORIGIN, source: 'dev-fallback' }

  return { origin: undefined, source: 'absent', reason: result.message }
}

/**
 * The canonical URL of a page, built from the resolver rather than by string concatenation.
 *
 * Applies the §18.1 route shape: lower case, leading slash, trailing slash, no query, no fragment.
 * A caller that passes `/Guides/x?ref=nav#top` gets `<origin>/guides/x/` — one address, not four.
 *
 * @param {string} origin an origin already through `normalizeSiteUrl`
 * @param {string} pathname
 * @returns {string}
 */
export function canonicalUrl(origin, pathname) {
  const url = new URL(pathname, origin)
  url.search = ''
  url.hash = ''
  url.pathname = url.pathname.toLowerCase()
  if (!url.pathname.endsWith('/')) url.pathname = `${url.pathname}/`
  return url.href
}

/**
 * An absolute URL for an asset, from the same resolver. Asset paths keep their case and take no
 * trailing slash: `/og/default-1200x630.png` is a file, not a route.
 *
 * @param {string} origin
 * @param {string} path
 * @returns {string}
 */
export function absoluteUrl(origin, path) {
  const url = new URL(path, origin)
  url.search = ''
  url.hash = ''
  return url.href
}
