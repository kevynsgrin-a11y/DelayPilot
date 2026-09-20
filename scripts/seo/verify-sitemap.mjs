#!/usr/bin/env node
/**
 * verify-sitemap — apps/web/public/sitemap.xml against what apps/web/dist actually serves.
 *
 * Owner: seo-engineer (docs/agents/ROSTER.md §3, `scripts/seo/**`).
 *
 * WHY THIS EXISTS. The sitemap is a hand-maintained list of URLs until the Phase 11 generator
 * lands, and a hand-maintained list of URLs is wrong the first time somebody adds a route without
 * remembering it. Both directions of that error are real and neither is visible in a diff:
 *
 *   - A new indexable page that is not listed is a page nobody finds.
 *   - A listed page that the build no longer emits is a 404 submitted to every search engine.
 *   - A listed page that carries `noindex` is a contradiction: Search Console counts the
 *     submission and then reports the URL as excluded by the tag. The sitemap does not override a
 *     robots directive, it just disagrees with it in public.
 *
 * So the sitemap is checked against the built output, which is the only thing that knows the
 * truth. The rule it enforces is one sentence: **a page belongs in the sitemap exactly when the
 * build emits it and its own robots meta does not say noindex** — 404.html excepted, because an
 * error document is not an address to submit.
 *
 * WHERE INDEXABILITY IS DECIDED, and why this script does not decide it. For article routes it is
 * `entryRobots()` in apps/web/src/components/routes.ts: `published && indexable` indexes,
 * `publishable` serves with noindex. For route shells it is the page's own `robots` prop. This
 * script reads the RENDERED result of those decisions out of dist and never re-derives them; a
 * second implementation of the same rule is a second rule (AGENTS.md §3.2).
 *
 * THE ORIGIN COMES FROM THE RESOLVER. PUBLIC_SITE_URL is unset by owner input I-4, so BaseLayout
 * emits no canonical and no og:url — guessing an origin would be a fabricated value
 * (AGENTS.md §1.1). But the sitemap protocol requires an absolute <loc>, so an origin is committed
 * anyway, once, in apps/web/src/lib/seo/site-url.mjs. This script imports it rather than restating
 * it, and it exists so sitemap.xml and robots.txt are checked against that one statement rather
 * than trusted: a typo'd or swapped host in either file fails here. Configure PUBLIC_SITE_URL and
 * the configured origin takes over with no edit to any of the three files.
 *
 * Run: node scripts/seo/verify-sitemap.mjs   (after a build — it reads apps/web/dist)
 * Exit code is 1 on any finding. `pnpm test:seo` runs this script as one of its suites; running it
 * alone is the fast subset.
 */

import { readFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { COMMITTED_ORIGIN, normalizeSiteUrl } from '../../apps/web/src/lib/seo/site-url.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DIST = join(repoRoot, 'apps/web/dist')
const SITEMAP_SOURCE = 'apps/web/public/sitemap.xml'
const SITEMAP_BUILT = 'apps/web/dist/sitemap.xml'
const ROBOTS_SOURCE = 'apps/web/public/robots.txt'

/**
 * The origin every `<loc>` must use: the configured `PUBLIC_SITE_URL` when there is one, and
 * otherwise the origin committed in `apps/web/src/lib/seo/site-url.mjs` because the sitemap
 * protocol has no relative form. It is no longer typed here — the S4 resolver is the single source
 * the docblock above anticipated, so this file and robots.txt are checked against it rather than
 * against a third copy of the string.
 */
const configuredOrigin = normalizeSiteUrl(process.env['PUBLIC_SITE_URL'])
const EXPECTED_ORIGIN = configuredOrigin.ok ? configuredOrigin.origin : COMMITTED_ORIGIN

/** Emitted HTML that is never a sitemap entry, whatever its robots directive says. */
const NEVER_LISTED = new Set(['/404.html'])

const findings = []
const fail = (message) => findings.push(message)

async function walk(directory) {
  const out = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

/**
 * True when the document carries a robots directive containing `noindex`.
 *
 * Matched on the CONTENT attribute of `<meta name="robots">` rather than on the whole document,
 * so the word appearing in page prose — /editorial-policy/ explains what noindex means — is not
 * mistaken for a directive.
 */
function isNoindex(html) {
  for (const match of html.matchAll(/<meta\s+[^>]*name=["']robots["'][^>]*>/gi)) {
    const content = /content=["']([^"']*)["']/i.exec(match[0])?.[1] ?? ''
    if (/\bnoindex\b/i.test(content)) return true
  }
  return false
}

/**
 * `<loc>` values in document order, whitespace trimmed.
 *
 * XML comments are stripped FIRST. sitemap.xml carries a long comment that necessarily writes the
 * element name it is explaining, and without this the scanner reads the documentation as data.
 */
function locations(xml) {
  const withoutComments = xml.replace(/<!--[\s\S]*?-->/g, '')
  return [...withoutComments.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => match[1].trim())
}

if (!existsSync(DIST)) {
  console.error(
    'verify-sitemap: apps/web/dist does not exist. Run `pnpm --filter @delaypilot/web build` ' +
      'first — this script checks the sitemap against what the build actually emits, and has ' +
      'nothing to check without it.',
  )
  process.exit(1)
}

const sourceXml = await readFile(join(repoRoot, SITEMAP_SOURCE), 'utf8')

/*
 * public/ is copied verbatim into dist, so the two files must be byte-identical. If they are not,
 * the build is stale and every result below would describe a sitemap that is not the one shipping.
 */
if (existsSync(join(repoRoot, SITEMAP_BUILT))) {
  const builtXml = await readFile(join(repoRoot, SITEMAP_BUILT), 'utf8')
  if (builtXml !== sourceXml) {
    fail(
      `${SITEMAP_BUILT} differs from ${SITEMAP_SOURCE}. public/ is copied verbatim into dist, so ` +
        `this means the build is stale. Rebuild before trusting anything else here.`,
    )
  }
} else {
  fail(`${SITEMAP_BUILT} is absent: the build did not copy the sitemap into the served output.`)
}

/** Every emitted page, as the address it is served at, with its indexability. */
const files = await walk(DIST)
const pages = new Map()
for (const file of files.filter((f) => f.endsWith('.html'))) {
  const relativePath = `/${relative(DIST, file).split('\\').join('/')}`
  const route = relativePath.endsWith('/index.html')
    ? relativePath.slice(0, -'index.html'.length)
    : relativePath
  const html = await readFile(file, 'utf8')
  pages.set(route, { relativePath, noindex: isNoindex(html) })
}

const indexable = [...pages.entries()]
  .filter(([route, page]) => !page.noindex && !NEVER_LISTED.has(route))
  .map(([route]) => route)
  .sort()

const noindexPages = [...pages.entries()].filter(([, page]) => page.noindex).map(([route]) => route)

const locs = locations(sourceXml)

if (locs.length === 0) fail(`${SITEMAP_SOURCE} contains no <loc> entries.`)

/** loc → path, and the origin/trailing-slash/duplicate checks, in one pass. */
const listed = []
const seen = new Set()

for (const loc of locs) {
  if (seen.has(loc)) {
    fail(`duplicate entry ${loc}. A URL submitted twice is a URL listed once and reviewed never.`)
    continue
  }
  seen.add(loc)

  let url
  try {
    url = new URL(loc)
  } catch {
    fail(`<loc>${loc}</loc> is not an absolute URL. The sitemap protocol has no relative form.`)
    continue
  }

  if (url.origin !== EXPECTED_ORIGIN) {
    fail(
      `<loc>${loc}</loc> has origin ${url.origin}; the resolved origin is ${EXPECTED_ORIGIN}. ` +
        `Changing the site's domain is one edit in sitemap.xml, one in robots.txt, and — when the ` +
        `fallback itself moves — COMMITTED_ORIGIN in apps/web/src/lib/seo/site-url.mjs.`,
    )
    continue
  }

  if (url.search !== '' || url.hash !== '') {
    fail(`<loc>${loc}</loc> carries a query string or fragment. A sitemap lists clean URLs only.`)
    continue
  }

  if (!url.pathname.endsWith('/')) {
    fail(
      `<loc>${loc}</loc> has no trailing slash. astro.config.mjs sets trailingSlash: 'always', ` +
        `so this URL redirects rather than resolves.`,
    )
    continue
  }

  if (url.pathname !== url.pathname.toLowerCase()) {
    fail(`<loc>${loc}</loc> is not lowercase; two casings of one path are two URLs to a crawler.`)
    continue
  }

  listed.push(url.pathname)
}

for (const path of listed) {
  const page = pages.get(path)
  if (page === undefined) {
    fail(
      `${EXPECTED_ORIGIN}${path} is listed but the build emits no such page. A submitted URL that ` +
        `404s is a dead reference (AGENTS.md §1.6).`,
    )
    continue
  }
  if (page.noindex) {
    fail(
      `${EXPECTED_ORIGIN}${path} is listed but ${page.relativePath} carries ` +
        `<meta name="robots" content="noindex">. The sitemap does not override the tag, it just ` +
        `disagrees with it in public. Remove the entry, or promote the content and let ` +
        `entryRobots() index the page.`,
    )
  }
  if (NEVER_LISTED.has(path)) fail(`${path} must never be a sitemap entry.`)
}

const listedSet = new Set(listed)
for (const route of indexable) {
  if (!listedSet.has(route)) {
    fail(
      `${route} is emitted and indexable but is missing from ${SITEMAP_SOURCE}. Add ` +
        `<url><loc>${EXPECTED_ORIGIN}${route}</loc></url>, or give the page a noindex directive ` +
        `if it is not meant to be found.`,
    )
  }
}

/** robots.txt must point at this sitemap, on the same origin. */
const robots = await readFile(join(repoRoot, ROBOTS_SOURCE), 'utf8')
const sitemapLines = [...robots.matchAll(/^\s*Sitemap:\s*(\S+)\s*$/gim)].map((m) => m[1])

if (sitemapLines.length === 0) {
  fail(`${ROBOTS_SOURCE} declares no Sitemap: line, so nothing points a crawler at the sitemap.`)
} else {
  for (const line of sitemapLines) {
    if (line !== `${EXPECTED_ORIGIN}/sitemap.xml`) {
      fail(
        `${ROBOTS_SOURCE} points at ${line}; expected ${EXPECTED_ORIGIN}/sitemap.xml. ` +
          `A Sitemap: line on a different origin is ignored by every major crawler.`,
      )
    }
  }
}

if (findings.length > 0) {
  console.error(`verify-sitemap: ${findings.length} finding(s).\n`)
  for (const finding of findings) console.error(`  · ${finding}`)
  console.error('')
  process.exit(1)
}

console.log(
  `verify-sitemap: ${pages.size} page(s) in apps/web/dist — ` +
    `${indexable.length} indexable, ${noindexPages.length} noindex, ` +
    `${NEVER_LISTED.size} never-listed. ` +
    `${listed.length} sitemap entr(ies), all present in the build, all indexable, ` +
    `all absolute ${EXPECTED_ORIGIN} URLs with a trailing slash, 0 duplicates.`,
)
console.log(`noindex and therefore excluded: ${noindexPages.sort().join(', ')}`)
