#!/usr/bin/env node
/**
 * test-seo — the `pnpm test:seo` exit gate. Owner: seo-engineer (`ROSTER.md §3`, `scripts/seo/**`).
 *
 * WHAT IT IS. Nine suites over the BUILT site in `apps/web/dist` plus the public-root files that
 * ship beside it. It reads what the build actually emitted and never re-derives a rule from source:
 * indexability is decided by `apps/web/src/components/routes.ts` and by each page's own `robots`
 * prop, and this runner reads the rendered result of those decisions. A second implementation of
 * the serving rule would be a second rule (`AGENTS.md §3.2`).
 *
 * IT FAILS, IT DOES NOT WARN. Every finding names the page, the check and the offending value, and
 * any finding is exit 1. There is no severity ladder and no allowlist: a page that cannot satisfy a
 * check is a page that is `noindex` and out of the sitemap, which is the design rather than a
 * defect (`DIRECTIVE.md §19`).
 *
 * THE SUITES
 *   site-url     the three files that commit an absolute origin agree with the resolver, and the
 *                resolver still refuses the example value shipped in `.env.example`
 *   canonical    one self-referencing canonical per page, or — with no `PUBLIC_SITE_URL` — none
 *                anywhere; a mixture is the failure, because it means the origin leaked into some
 *                pages and not others
 *   title        one non-empty unique `<title>` per page, matching `og:title` and `twitter:title`
 *   description  one non-empty unique description per page, matching its Open Graph twins
 *   robots       every directive is a directive this site issues; no private route is indexable;
 *                `robots.txt` disallows the four private prefixes and blankets nothing
 *   sitemap      membership is exactly the indexable set; no `noindex`, no error document, no
 *                private prefix, no flight instance, no duplicate, no foreign origin
 *   schema       every JSON-LD block parses, stays inside the allowlist, carries no forbidden
 *                property, says nothing the page does not display, and sits on an indexable page
 *   public-root  robots, sitemap, llms, humans, manifest are served and identical to their source;
 *                `security.txt`, `ads.txt` and the IndexNow key file are asserted if present
 *   privacy      no address, no ticket identifier and no query string in any metadata this site
 *                emits (`AGENTS.md §2`)
 *
 * IT COMPOSES THE TWO SCRIPTS THAT ALREADY EXIST rather than restating them: `verify-sitemap.mjs`
 * and `verify-manifest.mjs` run as child processes and appear as two more suites. `pnpm seo:verify`
 * keeps working and stays the fast subset; `pnpm test:seo` is the superset.
 *
 * Run: node scripts/seo/test-seo.mjs            (after a build — it reads apps/web/dist)
 *      node scripts/seo/test-seo.mjs --self-test  (prove each check fires on a seeded violation)
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { COMMITTED_ORIGIN, normalizeSiteUrl } from '../../apps/web/src/lib/seo/site-url.mjs'
import { validateSchemaNode, visibleTextClaims } from '../../apps/web/src/lib/seo/schema-policy.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DIST = join(repoRoot, 'apps/web/dist')
const PUBLIC = join(repoRoot, 'apps/web/public')

/** `AGENTS.md §2` and `DIRECTIVE.md §18.2`. None is served today; none may ever be indexed. */
const PRIVATE_PREFIXES = ['/app/', '/auth/', '/checkout/', '/admin/']

/** Emitted HTML that is never a sitemap entry, whatever its robots directive says. */
const NEVER_LISTED = new Set(['/404.html'])

/** A path segment shaped like a flight designator — `aa100`, `ba2490`. Never an indexable page. */
const FLIGHT_DESIGNATOR = /^[a-z]{2}\d{1,4}$/

/** The `DIRECTIVE.md §20` line, byte for byte. Asserted here, authored by monetization. */
const ADS_TXT_LINE = 'google.com, pub-9029421562757873, DIRECT, f08c47fec0942fa0'

/** Files that must ship from `apps/web/public` unchanged. */
const ROOT_FILES = ['robots.txt', 'sitemap.xml', 'llms.txt', 'humans.txt', 'manifest.webmanifest']

const TITLE_MAX = 80
const DESCRIPTION_MIN = 50
const DESCRIPTION_MAX = 200

/* ────────────────────────────────────────────────────────────────────────────────────────────── */
/* Parsing                                                                                        */
/* ────────────────────────────────────────────────────────────────────────────────────────────── */

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  mdash: '\u2014',
  ndash: '\u2013',
  middot: '\u00b7',
  hellip: '\u2026',
  rsquo: '\u2019',
  lsquo: '\u2018',
  ldquo: '\u201c',
  rdquo: '\u201d',
  times: '\u00d7',
  deg: '\u00b0',
  copy: '\u00a9',
  sect: '\u00a7',
}

export function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (whole, name) => NAMED_ENTITIES[name.toLowerCase()] ?? whole)
}

/** Attribute value of the first matching tag, decoded. */
function metaContent(html, pattern) {
  const tag = pattern.exec(html)
  if (tag === null) return undefined
  const content = /content=["']([^"']*)["']/i.exec(tag[0])
  return content === null ? undefined : decodeEntities(content[1])
}

function allMetaContents(html, pattern) {
  return [...html.matchAll(pattern)]
    .map((match) => /content=["']([^"']*)["']/i.exec(match[0]))
    .filter((match) => match !== null)
    .map((match) => decodeEntities(match[1]))
}

/** Visible text: everything outside `<head>`, with script, style and tags removed. */
export function visibleText(html) {
  const body = html.includes('<body') ? html.slice(html.indexOf('<body')) : html
  const text = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
  return decodeEntities(text).replace(/\s+/g, ' ').trim()
}

function parsePage(route, file, html) {
  /*
   * `<title>` is counted in the HEAD only. An inlined SVG carries its own `<title>` as its
   * accessible name — the brand lockup in the header is one — and counting those reported two
   * titles on every page the first time this ran.
   */
  const headEnd = html.toLowerCase().indexOf('</head>')
  const head = headEnd === -1 ? html : html.slice(0, headEnd)
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(head)
  return {
    route,
    file,
    title: title === null ? undefined : decodeEntities(title[1]).trim(),
    titleCount: [...head.matchAll(/<title[^>]*>/gi)].length,
    description: metaContent(html, /<meta\s+[^>]*name=["']description["'][^>]*>/i),
    descriptionCount: [...html.matchAll(/<meta\s+[^>]*name=["']description["'][^>]*>/gi)].length,
    robots: allMetaContents(html, /<meta\s+[^>]*name=["']robots["'][^>]*>/gi),
    canonicals: [...html.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi)]
      .map((match) => /href=["']([^"']*)["']/i.exec(match[0]))
      .filter((match) => match !== null)
      .map((match) => decodeEntities(match[1])),
    ogUrl: metaContent(html, /<meta\s+[^>]*property=["']og:url["'][^>]*>/i),
    ogTitle: metaContent(html, /<meta\s+[^>]*property=["']og:title["'][^>]*>/i),
    ogDescription: metaContent(html, /<meta\s+[^>]*property=["']og:description["'][^>]*>/i),
    twitterTitle: metaContent(html, /<meta\s+[^>]*name=["']twitter:title["'][^>]*>/i),
    twitterDescription: metaContent(html, /<meta\s+[^>]*name=["']twitter:description["'][^>]*>/i),
    jsonLd: [
      ...html.matchAll(
        /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ].map((match) => match[1]),
    googleVerification: metaContent(
      html,
      /<meta\s+[^>]*name=["']google-site-verification["'][^>]*>/i,
    ),
    bingVerification: metaContent(html, /<meta\s+[^>]*name=["']msvalidate\.01["'][^>]*>/i),
    visibleText: visibleText(html),
  }
}

const isNoindex = (page) => page.robots.some((value) => /\bnoindex\b/i.test(value))

/** `<loc>` values, XML comments stripped first so documentation is not read as data. */
export function sitemapLocations(xml) {
  const withoutComments = xml.replace(/<!--[\s\S]*?-->/g, '')
  return [...withoutComments.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => match[1].trim())
}

async function walk(directory) {
  const out = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

const readIfPresent = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : undefined)

/* ────────────────────────────────────────────────────────────────────────────────────────────── */
/* The model                                                                                      */
/* ────────────────────────────────────────────────────────────────────────────────────────────── */

export async function collectSite({ dist = DIST, publicDir = PUBLIC, env = process.env } = {}) {
  const files = await walk(dist)
  const pages = []
  for (const file of files.filter((f) => f.endsWith('.html'))) {
    const relativePath = `/${relative(dist, file).split('\\').join('/')}`
    const route = relativePath.endsWith('/index.html')
      ? relativePath.slice(0, -'index.html'.length)
      : relativePath
    pages.push(parsePage(route, relativePath, readFileSync(file, 'utf8')))
  }
  pages.sort((a, b) => (a.route < b.route ? -1 : 1))

  const configured = normalizeSiteUrl(env['PUBLIC_SITE_URL'])
  const rootFiles = {}
  for (const name of ROOT_FILES) {
    rootFiles[name] = {
      source: readIfPresent(join(publicDir, name)),
      built: readIfPresent(join(dist, name)),
    }
  }

  return {
    configuredOrigin: configured.ok ? configured.origin : undefined,
    committedOrigin: COMMITTED_ORIGIN,
    pages,
    sitemapLocs: sitemapLocations(rootFiles['sitemap.xml'].source ?? ''),
    rootFiles,
    adsTxt: readIfPresent(join(publicDir, 'ads.txt')),
    securityTxt: {
      wellKnown: readIfPresent(join(publicDir, '.well-known/security.txt')),
      root: readIfPresent(join(publicDir, 'security.txt')),
    },
    indexNowKey: env['INDEXNOW_KEY'],
    verificationTokens: {
      'google-site-verification': env['GOOGLE_SITE_VERIFICATION'],
      'msvalidate.01': env['BING_SITE_VERIFICATION'],
    },
    distRootTextFiles: files
      .filter((file) => dirname(file) === dist && file.endsWith('.txt'))
      .map((file) => relative(dist, file)),
  }
}

/* ────────────────────────────────────────────────────────────────────────────────────────────── */
/* The suites                                                                                     */
/* ────────────────────────────────────────────────────────────────────────────────────────────── */

export function runSuites(model) {
  const findings = []
  const fail = (suite, check, where, detail) => findings.push({ suite, check, where, detail })

  const expectedOrigin = model.configuredOrigin ?? model.committedOrigin
  const robotsTxt = model.rootFiles['robots.txt'].source ?? ''
  const indexable = model.pages.filter((page) => !isNoindex(page) && !NEVER_LISTED.has(page.route))

  /* ── site-url ─────────────────────────────────────────────────────────────────────────────── */

  if (normalizeSiteUrl('https://example.invalid').ok) {
    fail(
      'site-url',
      'site-url.example-accepted',
      '.env.example',
      'The resolver accepts the example origin shipped in .env.example. The production guard is decorative while that is true.',
    )
  }

  for (const loc of model.sitemapLocs) {
    let url
    try {
      url = new URL(loc)
    } catch {
      continue
    }
    if (url.origin !== expectedOrigin) {
      fail(
        'site-url',
        'site-url.origin-drift',
        'apps/web/public/sitemap.xml',
        `<loc>${loc}</loc> has origin ${url.origin}; the resolved origin is ${expectedOrigin}.`,
      )
    }
  }

  for (const line of [...robotsTxt.matchAll(/^\s*Sitemap:\s*(\S+)\s*$/gim)].map((m) => m[1])) {
    if (!line.startsWith(`${expectedOrigin}/`)) {
      fail(
        'site-url',
        'site-url.origin-drift',
        'apps/web/public/robots.txt',
        `Sitemap: ${line} is not on ${expectedOrigin}. A Sitemap: line on another origin is ignored by every major crawler.`,
      )
    }
  }

  const llms = model.rootFiles['llms.txt'].source
  if (llms !== undefined) {
    for (const match of llms.matchAll(/https?:\/\/[^\s)>\]]+/g)) {
      const url = new URL(match[0])
      if (url.origin !== expectedOrigin) {
        fail(
          'site-url',
          'site-url.origin-drift',
          'apps/web/public/llms.txt',
          `${match[0]} is not on ${expectedOrigin}.`,
        )
      }
    }
  }

  /* ── canonical ────────────────────────────────────────────────────────────────────────────── */

  /*
   * The error document is judged apart from the rest. It is emitted at /404.html and served on a
   * 404 response, so the only self-reference it could write is an address that does not resolve —
   * a dead reference (AGENTS.md §1.6). It therefore carries NO canonical, whether or not the rest
   * of the site does, and it is excluded from the all-or-none comparison below.
   */
  const addressable = model.pages.filter((page) => !NEVER_LISTED.has(page.route))
  for (const page of model.pages) {
    if (NEVER_LISTED.has(page.route) && page.canonicals.length > 0) {
      fail(
        'canonical',
        'canonical.on-error-document',
        page.route,
        `the error document carries the canonical ${page.canonicals[0]}, which is an address the site does not serve. An error document has no canonical.`,
      )
    }
  }

  const withCanonical = addressable.filter((page) => page.canonicals.length > 0)

  if (withCanonical.length > 0 && withCanonical.length !== addressable.length) {
    const absent = addressable
      .filter((page) => page.canonicals.length === 0)
      .map((page) => page.route)
    fail(
      'canonical',
      'canonical.mixed',
      absent.join(', '),
      `${withCanonical.length} of ${addressable.length} addressable pages carry a canonical. Either every one has it or none does; a mixture means the origin reached some pages and not others.`,
    )
  }

  const seenCanonical = new Map()
  for (const page of addressable) {
    if (page.canonicals.length > 1) {
      fail(
        'canonical',
        'canonical.multiple',
        page.route,
        `${page.canonicals.length} canonical links: ${page.canonicals.join(' | ')}. A page has one address.`,
      )
    }
    const href = page.canonicals[0]
    if (href === undefined) {
      if (page.ogUrl !== undefined) {
        fail(
          'canonical',
          'canonical.og-url-without-canonical',
          page.route,
          `og:url is ${page.ogUrl} but the page has no canonical. Both come from the same resolver, so one without the other means a hand-built URL.`,
        )
      }
      continue
    }

    let url
    try {
      url = new URL(href)
    } catch {
      fail('canonical', 'canonical.shape', page.route, `canonical "${href}" is not absolute.`)
      continue
    }

    if (url.origin !== expectedOrigin) {
      fail(
        'canonical',
        'canonical.foreign-origin',
        page.route,
        `canonical points at ${url.origin}; the resolved origin is ${expectedOrigin}.`,
      )
      continue
    }
    if (url.search !== '' || url.hash !== '') {
      fail(
        'canonical',
        'canonical.shape',
        page.route,
        `canonical "${href}" carries a query string or fragment.`,
      )
    }
    if (url.pathname !== url.pathname.toLowerCase()) {
      fail('canonical', 'canonical.shape', page.route, `canonical "${href}" is not lower case.`)
    }
    if (!url.pathname.endsWith('/') && !url.pathname.endsWith('.html')) {
      fail(
        'canonical',
        'canonical.shape',
        page.route,
        `canonical "${href}" has no trailing slash; astro.config.mjs sets trailingSlash: 'always'.`,
      )
    }
    if (url.pathname !== page.route && `${url.pathname}index.html` !== page.file) {
      fail(
        'canonical',
        'canonical.not-self',
        page.route,
        `canonical points at ${url.pathname}, which is not this page. Every indexable page is self-referencing.`,
      )
    }
    const previous = seenCanonical.get(url.href)
    if (previous !== undefined) {
      fail(
        'canonical',
        'canonical.duplicate',
        `${previous} and ${page.route}`,
        `both emit the canonical ${url.href}. Two pages claiming one address is a collision, not a preference.`,
      )
    }
    seenCanonical.set(url.href, page.route)

    if (page.ogUrl !== undefined && page.ogUrl !== url.href) {
      fail(
        'canonical',
        'canonical.og-url-mismatch',
        page.route,
        `og:url is ${page.ogUrl}; the canonical is ${url.href}.`,
      )
    }
  }

  /* ── title ────────────────────────────────────────────────────────────────────────────────── */

  const titles = new Map()
  for (const page of model.pages) {
    if (page.title === undefined || page.title === '') {
      fail('title', 'title.missing', page.route, 'no <title>.')
      continue
    }
    if (page.titleCount > 1) {
      fail('title', 'title.multiple', page.route, `${page.titleCount} <title> elements.`)
    }
    if (page.title.length > TITLE_MAX) {
      fail(
        'title',
        'title.too-long',
        page.route,
        `${page.title.length} characters (limit ${TITLE_MAX}): "${page.title}". Past that the distinguishing half is invisible in every result listing.`,
      )
    }
    if (!page.title.includes('DelayPilot')) {
      fail('title', 'title.no-brand', page.route, `"${page.title}" does not name the site.`)
    }
    const previous = titles.get(page.title)
    if (previous !== undefined) {
      fail(
        'title',
        'title.duplicate',
        `${previous} and ${page.route}`,
        `share the title "${page.title}". Titles are unique repo-wide (DIRECTIVE.md §19).`,
      )
    }
    titles.set(page.title, page.route)

    for (const [label, value] of [
      ['og:title', page.ogTitle],
      ['twitter:title', page.twitterTitle],
    ]) {
      if (value !== undefined && value !== page.title) {
        fail(
          'title',
          'title.social-mismatch',
          page.route,
          `${label} is "${value}" but <title> is "${page.title}".`,
        )
      }
    }
  }

  /* ── description ──────────────────────────────────────────────────────────────────────────── */

  const descriptions = new Map()
  for (const page of model.pages) {
    const description = page.description
    if (description === undefined || description.trim() === '') {
      fail('description', 'description.missing', page.route, 'no meta description.')
      continue
    }
    if (page.descriptionCount > 1) {
      fail(
        'description',
        'description.multiple',
        page.route,
        `${page.descriptionCount} description tags.`,
      )
    }
    if (description.length < DESCRIPTION_MIN) {
      fail(
        'description',
        'description.too-short',
        page.route,
        `${description.length} characters (floor ${DESCRIPTION_MIN}): "${description}".`,
      )
    }
    if (description.length > DESCRIPTION_MAX) {
      fail(
        'description',
        'description.too-long',
        page.route,
        `${description.length} characters (limit ${DESCRIPTION_MAX}): "${description}".`,
      )
    }
    if (page.title !== undefined && description === page.title) {
      fail('description', 'description.equals-title', page.route, 'description repeats the title.')
    }
    const previous = descriptions.get(description)
    if (previous !== undefined) {
      fail(
        'description',
        'description.duplicate',
        `${previous} and ${page.route}`,
        `share the description "${description}".`,
      )
    }
    descriptions.set(description, page.route)

    for (const [label, value] of [
      ['og:description', page.ogDescription],
      ['twitter:description', page.twitterDescription],
    ]) {
      if (value !== undefined && value !== description) {
        fail(
          'description',
          'description.social-mismatch',
          page.route,
          `${label} is "${value}" but the meta description is "${description}".`,
        )
      }
    }
  }

  /* ── robots ───────────────────────────────────────────────────────────────────────────────── */

  const KNOWN_DIRECTIVES = new Set([
    'index',
    'noindex',
    'follow',
    'nofollow',
    'noarchive',
    'nosnippet',
    'noimageindex',
    'notranslate',
    'max-snippet',
    'max-image-preview',
    'max-video-preview',
  ])

  for (const page of model.pages) {
    if (page.robots.length > 1) {
      fail(
        'robots',
        'robots.multiple',
        page.route,
        `${page.robots.length} robots meta tags: ${page.robots.join(' | ')}.`,
      )
    }
    for (const value of page.robots) {
      for (const token of value.split(',').map((part) => part.trim().toLowerCase())) {
        const name = token.split(':')[0]
        if (name !== '' && !KNOWN_DIRECTIVES.has(name)) {
          fail(
            'robots',
            'robots.unknown-directive',
            page.route,
            `"${token}" is not a directive this site issues.`,
          )
        }
      }
    }

    const isPrivate = PRIVATE_PREFIXES.some((prefix) => page.route.startsWith(prefix))
    if (isPrivate) {
      const value = page.robots.join(', ').toLowerCase()
      for (const required of ['noindex', 'nofollow', 'noarchive']) {
        if (!value.includes(required)) {
          fail(
            'robots',
            'robots.private-route-indexable',
            page.route,
            `a private route (AGENTS.md §2) is missing "${required}" in its robots meta. Required: noindex, nofollow, noarchive, as a meta tag AND an X-Robots-Tag.`,
          )
        }
      }
    }

    if (NEVER_LISTED.has(page.route) && !isNoindex(page)) {
      fail('robots', 'robots.error-document', page.route, 'the error document must be noindex.')
    }
  }

  if (robotsTxt.trim() === '') {
    fail(
      'robots',
      'robots.txt-missing',
      'apps/web/public/robots.txt',
      'the file is empty or absent.',
    )
  } else {
    const directives = [...robotsTxt.matchAll(/^\s*Disallow:\s*(\S*)\s*$/gim)].map((m) => m[1])
    if (directives.includes('/')) {
      fail(
        'robots',
        'robots.txt-blanket-disallow',
        'apps/web/public/robots.txt',
        'Disallow: / hides the gate rather than implementing it (DIRECTIVE.md §19).',
      )
    }
    for (const prefix of PRIVATE_PREFIXES) {
      if (!directives.includes(prefix)) {
        fail(
          'robots',
          'robots.txt-missing-disallow',
          'apps/web/public/robots.txt',
          `${prefix} is not disallowed. Every private prefix is listed in advance, before the route ships.`,
        )
      }
    }
    if (!/^\s*Sitemap:\s*\S+\s*$/im.test(robotsTxt)) {
      fail(
        'robots',
        'robots.txt-sitemap-missing',
        'apps/web/public/robots.txt',
        'no Sitemap: line, so nothing points a crawler at the sitemap.',
      )
    }
  }

  /* ── sitemap ──────────────────────────────────────────────────────────────────────────────── */

  const sitemapXml = model.rootFiles['sitemap.xml'].source ?? ''
  if (!sitemapXml.includes('http://www.sitemaps.org/schemas/sitemap/0.9')) {
    fail(
      'sitemap',
      'sitemap.namespace',
      'apps/web/public/sitemap.xml',
      'the urlset does not declare the sitemap 0.9 namespace.',
    )
  }
  const urlCount = [...sitemapXml.matchAll(/<url>/g)].length
  if (urlCount !== model.sitemapLocs.length) {
    fail(
      'sitemap',
      'sitemap.malformed',
      'apps/web/public/sitemap.xml',
      `${urlCount} <url> elements but ${model.sitemapLocs.length} <loc> values.`,
    )
  }

  const listedPaths = []
  const seenLoc = new Set()
  for (const loc of model.sitemapLocs) {
    if (seenLoc.has(loc)) {
      fail('sitemap', 'sitemap.duplicate', loc, 'listed twice.')
      continue
    }
    seenLoc.add(loc)
    let url
    try {
      url = new URL(loc)
    } catch {
      fail(
        'sitemap',
        'sitemap.shape',
        loc,
        'not an absolute URL; the protocol has no relative form.',
      )
      continue
    }
    listedPaths.push(url.pathname)

    if (PRIVATE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
      fail(
        'sitemap',
        'sitemap.private-route',
        loc,
        'a private route is never listed (AGENTS.md §2).',
      )
    }
    if (NEVER_LISTED.has(url.pathname) || url.pathname.endsWith('/404.html')) {
      fail(
        'sitemap',
        'sitemap.error-document',
        loc,
        'an error document is not an address to submit.',
      )
    }
    if (url.pathname.split('/').some((segment) => FLIGHT_DESIGNATOR.test(segment))) {
      fail(
        'sitemap',
        'sitemap.flight-instance',
        loc,
        'a flight-instance URL is never indexable (DIRECTIVE.md §9, §28).',
      )
    }
  }

  const builtRoutes = new Map(model.pages.map((page) => [page.route, page]))
  for (const path of listedPaths) {
    const page = builtRoutes.get(path)
    if (page === undefined) {
      fail('sitemap', 'sitemap.extra-entry', path, 'listed but the build emits no such page.')
      continue
    }
    if (isNoindex(page)) {
      fail(
        'sitemap',
        'sitemap.noindex-entry',
        path,
        'listed but the page carries noindex. The sitemap does not override the tag, it disagrees with it in public.',
      )
    }
  }
  const listedSet = new Set(listedPaths)
  for (const page of indexable) {
    if (!listedSet.has(page.route)) {
      fail(
        'sitemap',
        'sitemap.missing-page',
        page.route,
        'emitted and indexable but absent from the sitemap.',
      )
    }
  }

  /* ── schema ───────────────────────────────────────────────────────────────────────────────── */

  for (const page of model.pages) {
    for (const [index, raw] of page.jsonLd.entries()) {
      const where = `${page.route} block ${index + 1}`
      let parsed
      try {
        parsed = JSON.parse(raw)
      } catch (error) {
        fail('schema', 'schema.invalid-json', where, `does not parse: ${String(error)}`)
        continue
      }
      if (isNoindex(page)) {
        fail(
          'schema',
          'schema.on-noindex-page',
          where,
          'structured data on a page that is not indexable. Markup is a search surface; a page that is not in the index has none.',
        )
      }
      for (const finding of validateSchemaNode(parsed)) {
        fail('schema', `schema.${finding.code}`, where, `${finding.path}: ${finding.detail}`)
      }
      const haystack = page.visibleText.replace(/\s+/g, ' ')
      for (const claim of visibleTextClaims(parsed)) {
        if (!haystack.includes(claim.value.replace(/\s+/g, ' '))) {
          fail(
            'schema',
            'schema.invisible-text',
            where,
            `${claim.path} says ${JSON.stringify(claim.value)}, which does not appear in the page's visible text. Structured data states what a reader can see, and nothing else (AGENTS.md §1.1).`,
          )
        }
      }
      for (const match of JSON.stringify(parsed).matchAll(/"(https?:\/\/[^"]+)"/g)) {
        const url = new URL(match[1])
        if (url.origin !== expectedOrigin && url.origin !== 'https://schema.org') {
          fail(
            'schema',
            'schema.foreign-origin',
            where,
            `${match[1]} is neither this site nor the schema.org context.`,
          )
        }
      }
    }
  }

  /* ── public-root ──────────────────────────────────────────────────────────────────────────── */

  for (const name of ROOT_FILES) {
    const file = model.rootFiles[name]
    if (file.source === undefined) {
      fail('public-root', 'public-root.missing', `apps/web/public/${name}`, 'is absent.')
      continue
    }
    if (file.built === undefined) {
      fail(
        'public-root',
        'public-root.not-served',
        `apps/web/dist/${name}`,
        'the build did not copy this file into the served output.',
      )
      continue
    }
    if (file.built !== file.source) {
      fail(
        'public-root',
        'public-root.drift',
        name,
        'the built copy differs from apps/web/public. public/ is copied verbatim, so the build is stale.',
      )
    }
  }

  if (llms !== undefined) {
    /*
     * llms.txt links only to pages of this site — an external citation belongs on the page that
     * makes the claim, not in the file that describes the site. So every markdown target is read
     * as a route here: absolute on the resolved origin, or already a path.
     */
    for (const match of llms.matchAll(/\]\(([^)\s]+)\)/g)) {
      const target = match[1]
      const path = target.startsWith(expectedOrigin)
        ? target.slice(expectedOrigin.length)
        : target.startsWith('/')
          ? target
          : undefined
      if (path === undefined) continue
      const listed = builtRoutes.get(path)
      if (listed === undefined && !existsSync(join(DIST, path.replace(/^\//, '')))) {
        fail(
          'public-root',
          'public-root.llms-dead-link',
          'apps/web/public/llms.txt',
          `${target} is linked but the build emits no such page (AGENTS.md §1.6).`,
        )
        continue
      }
      if (listed !== undefined && isNoindex(listed)) {
        fail(
          'public-root',
          'public-root.llms-noindex-link',
          'apps/web/public/llms.txt',
          `${target} is linked but the page carries noindex. This file describes the site as it is published.`,
        )
      }
    }
  }

  if (model.adsTxt !== undefined) {
    const line = model.adsTxt.trim()
    if (line !== ADS_TXT_LINE) {
      fail(
        'public-root',
        'public-root.ads-txt-content',
        'apps/web/public/ads.txt',
        `reads "${line}"; DIRECTIVE.md §20 fixes it at "${ADS_TXT_LINE}".`,
      )
    }
  }

  for (const [location, text] of Object.entries(model.securityTxt)) {
    if (text === undefined) continue
    const fields = new Map(
      [...text.matchAll(/^([A-Za-z-]+):\s*(.+)$/gm)].map((match) => [
        match[1].toLowerCase(),
        match[2].trim(),
      ]),
    )
    const where = `security.txt (${location})`
    if (!fields.has('contact')) {
      fail(
        'public-root',
        'public-root.security-txt-invalid',
        where,
        'no Contact field (RFC 9116 requires one).',
      )
    }
    const expires = fields.get('expires')
    if (expires === undefined) {
      fail(
        'public-root',
        'public-root.security-txt-invalid',
        where,
        'no Expires field (RFC 9116 requires one).',
      )
    } else {
      const when = Date.parse(expires)
      if (Number.isNaN(when)) {
        fail(
          'public-root',
          'public-root.security-txt-invalid',
          where,
          `Expires "${expires}" is not a date.`,
        )
      } else if (when <= Date.now()) {
        fail(
          'public-root',
          'public-root.security-txt-expired',
          where,
          `Expires ${expires} is in the past. An expired security.txt tells a finder the channel is unmaintained.`,
        )
      }
    }
    for (const contact of [...text.matchAll(/^Contact:\s*(.+)$/gim)].map((m) => m[1].trim())) {
      if (!/^(mailto:|https:|tel:)/.test(contact)) {
        fail(
          'public-root',
          'public-root.security-txt-invalid',
          where,
          `Contact "${contact}" is not a mailto:, https: or tel: URI.`,
        )
      }
    }
  }
  if (
    model.securityTxt.wellKnown !== undefined &&
    model.securityTxt.root !== undefined &&
    model.securityTxt.wellKnown !== model.securityTxt.root
  ) {
    fail(
      'public-root',
      'public-root.security-txt-drift',
      'security.txt',
      'the well-known copy and the root copy differ. Two answers to one question.',
    )
  }

  const key = model.indexNowKey
  const keyFiles = model.distRootTextFiles.filter((name) => /^[A-Za-z0-9-]{8,128}\.txt$/.test(name))
  if (key !== undefined && key !== '') {
    if (!/^[A-Za-z0-9-]{8,128}$/.test(key)) {
      fail(
        'public-root',
        'public-root.indexnow-key',
        'INDEXNOW_KEY',
        'the key must be 8 to 128 characters of a-z, A-Z, 0-9 or "-".',
      )
    } else if (!keyFiles.includes(`${key}.txt`)) {
      fail(
        'public-root',
        'public-root.indexnow-key',
        `${key}.txt`,
        'INDEXNOW_KEY is set but the key file is not served from the site root. Write it with `node scripts/seo/indexnow.mjs --write-key`.',
      )
    }
  } else if (keyFiles.length > 0) {
    fail(
      'public-root',
      'public-root.indexnow-key',
      keyFiles.join(', '),
      'a key-shaped file is served but INDEXNOW_KEY is unset. A stray key file authorizes submissions nobody configured.',
    )
  }

  /* ── verification ─────────────────────────────────────────────────────────────────────────── */

  for (const [name, property] of [
    ['google-site-verification', 'googleVerification'],
    ['msvalidate.01', 'bingVerification'],
  ]) {
    const configured = model.verificationTokens[name]
    const rendered = model.pages.filter((candidate) => candidate[property] !== undefined)
    if (configured === undefined || configured.trim() === '') {
      for (const candidate of rendered) {
        fail(
          'verification',
          'verification.token-unconfigured',
          candidate.route,
          `a <meta name="${name}"> tag is served but no token is configured. A verification tag nobody can explain is a claim about who controls this site.`,
        )
      }
      continue
    }
    if (rendered.length === 0) {
      fail(
        'verification',
        'verification.token-not-rendered',
        name,
        'a token is configured but no page carries the tag, so verification silently never completes. The tag belongs in BaseLayout (docs/SEO.md §10).',
      )
      continue
    }
    for (const candidate of rendered) {
      if (candidate[property] !== configured.trim()) {
        fail(
          'verification',
          'verification.token-mismatch',
          candidate.route,
          `<meta name="${name}"> carries "${candidate[property]}" but the configured token is "${configured.trim()}".`,
        )
      }
    }
  }

  /* ── privacy ──────────────────────────────────────────────────────────────────────────────── */

  const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/
  const TICKET_WORDS = /\b(booking reference|record locator|confirmation code|reservation code)\b/i

  for (const page of model.pages) {
    const metadata = [
      ['title', page.title],
      ['description', page.description],
      ['og:title', page.ogTitle],
      ['og:description', page.ogDescription],
      ['canonical', page.canonicals[0]],
      ['og:url', page.ogUrl],
    ]
    for (const [label, value] of metadata) {
      if (value === undefined) continue
      if (EMAIL.test(value)) {
        fail(
          'privacy',
          'privacy.email-in-metadata',
          page.route,
          `${label} contains an address. Titles, URLs and Open Graph tags carry no personal data (AGENTS.md §2).`,
        )
      }
      if (TICKET_WORDS.test(value)) {
        fail(
          'privacy',
          'privacy.ticket-identifier',
          page.route,
          `${label} names a ticket identifier. DelayPilot has no such field (AGENTS.md §2).`,
        )
      }
    }
  }

  for (const loc of model.sitemapLocs) {
    if (loc.includes('?') || loc.includes('#')) {
      fail(
        'privacy',
        'privacy.query-in-url',
        loc,
        'a sitemap URL carries a query string or fragment; a tracking parameter in a submitted URL is a tracked visitor.',
      )
    }
  }

  return findings
}

/* ────────────────────────────────────────────────────────────────────────────────────────────── */
/* Composition: the two scripts that already own their rules                                      */
/* ────────────────────────────────────────────────────────────────────────────────────────────── */

function runComposed(script) {
  const result = spawnSync(process.execPath, [join(repoRoot, 'scripts/seo', script)], {
    encoding: 'utf8',
  })
  return {
    script,
    ok: result.status === 0,
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`.trim(),
  }
}

/* ────────────────────────────────────────────────────────────────────────────────────────────── */
/* --self-test: prove each check fires                                                            */
/* ────────────────────────────────────────────────────────────────────────────────────────────── */

const page = (route, overrides = {}) => ({
  route,
  file: route === '/404.html' ? '/404.html' : `${route}index.html`,
  title: `Page ${route} — DelayPilot`,
  titleCount: 1,
  description: `A description for ${route} long enough to clear the fifty-character floor this runner sets.`,
  descriptionCount: 1,
  robots: [],
  canonicals: [],
  ogUrl: undefined,
  ogTitle: undefined,
  ogDescription: undefined,
  twitterTitle: undefined,
  twitterDescription: undefined,
  jsonLd: [],
  googleVerification: undefined,
  bingVerification: undefined,
  visibleText: 'DelayPilot',
  ...overrides,
})

/** A three-page site that passes every suite. Mutations below are applied to a fresh copy. */
function sampleModel() {
  const origin = COMMITTED_ORIGIN
  return {
    configuredOrigin: undefined,
    committedOrigin: origin,
    pages: [
      page('/'),
      page('/guides/'),
      page('/guides/one/', { robots: ['noindex'] }),
      page('/404.html', { robots: ['noindex'] }),
    ],
    sitemapLocs: [`${origin}/`, `${origin}/guides/`],
    rootFiles: Object.fromEntries(
      ROOT_FILES.map((name) => [
        name,
        {
          source:
            name === 'sitemap.xml'
              ? `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${origin}/</loc></url><url><loc>${origin}/guides/</loc></url></urlset>`
              : name === 'robots.txt'
                ? `User-agent: *\nAllow: /\nDisallow: /app/\nDisallow: /auth/\nDisallow: /checkout/\nDisallow: /admin/\n\nSitemap: ${origin}/sitemap.xml\n`
                : `${name} body`,
          built: undefined,
        },
      ]),
    ),
    adsTxt: undefined,
    securityTxt: { wellKnown: undefined, root: undefined },
    indexNowKey: undefined,
    verificationTokens: { 'google-site-verification': undefined, 'msvalidate.01': undefined },
    distRootTextFiles: [],
  }
}

function freshSample() {
  const model = sampleModel()
  for (const name of ROOT_FILES) model.rootFiles[name].built = model.rootFiles[name].source
  return model
}

const SELF_TESTS = [
  {
    check: 'title.duplicate',
    mutate: (m) => {
      m.pages[1].title = m.pages[0].title
    },
  },
  {
    check: 'title.missing',
    mutate: (m) => {
      m.pages[0].title = undefined
    },
  },
  {
    check: 'title.too-long',
    mutate: (m) => {
      m.pages[0].title = `${'Very long title '.repeat(8)}DelayPilot`
    },
  },
  {
    check: 'title.social-mismatch',
    mutate: (m) => {
      m.pages[0].ogTitle = 'Something else'
    },
  },
  {
    check: 'description.duplicate',
    mutate: (m) => {
      m.pages[1].description = m.pages[0].description
    },
  },
  {
    check: 'description.missing',
    mutate: (m) => {
      m.pages[0].description = undefined
    },
  },
  {
    check: 'description.too-short',
    mutate: (m) => {
      m.pages[0].description = 'Too short.'
    },
  },
  {
    check: 'sitemap.noindex-entry',
    mutate: (m) => {
      m.sitemapLocs.push(`${m.committedOrigin}/guides/one/`)
      m.rootFiles['sitemap.xml'].source = m.rootFiles['sitemap.xml'].source.replace(
        '</urlset>',
        `<url><loc>${m.committedOrigin}/guides/one/</loc></url></urlset>`,
      )
      m.rootFiles['sitemap.xml'].built = m.rootFiles['sitemap.xml'].source
    },
  },
  {
    check: 'sitemap.extra-entry',
    mutate: (m) => {
      m.sitemapLocs.push(`${m.committedOrigin}/pricing/`)
    },
  },
  {
    check: 'sitemap.missing-page',
    mutate: (m) => {
      m.sitemapLocs = m.sitemapLocs.filter((loc) => !loc.endsWith('/guides/'))
    },
  },
  {
    check: 'sitemap.duplicate',
    mutate: (m) => {
      m.sitemapLocs.push(`${m.committedOrigin}/`)
    },
  },
  {
    check: 'sitemap.private-route',
    mutate: (m) => {
      m.pages.push(page('/app/trips/'))
      m.sitemapLocs.push(`${m.committedOrigin}/app/trips/`)
    },
  },
  {
    check: 'sitemap.flight-instance',
    mutate: (m) => {
      m.pages.push(page('/flights/aa100/'))
      m.sitemapLocs.push(`${m.committedOrigin}/flights/aa100/`)
    },
  },
  {
    check: 'sitemap.error-document',
    mutate: (m) => {
      m.sitemapLocs.push(`${m.committedOrigin}/404.html`)
    },
  },
  {
    check: 'site-url.origin-drift',
    mutate: (m) => {
      m.sitemapLocs.push('https://delaypilot.example/')
    },
  },
  {
    check: 'canonical.mixed',
    mutate: (m) => {
      m.pages[0].canonicals = [`${m.committedOrigin}/`]
    },
  },
  {
    check: 'canonical.duplicate',
    mutate: (m) => {
      for (const p of m.pages) p.canonicals = [`${m.committedOrigin}/`]
    },
  },
  {
    check: 'canonical.not-self',
    mutate: (m) => {
      for (const p of m.pages) p.canonicals = [`${m.committedOrigin}${p.route}`]
      m.pages[1].canonicals = [`${m.committedOrigin}/elsewhere/`]
      m.pages.push(page('/elsewhere/', { canonicals: [`${m.committedOrigin}/elsewhere/`] }))
      m.sitemapLocs.push(`${m.committedOrigin}/elsewhere/`)
    },
  },
  {
    check: 'canonical.on-error-document',
    mutate: (m) => {
      for (const p of m.pages) p.canonicals = [`${m.committedOrigin}${p.route}`]
      m.pages[3].canonicals = [`${m.committedOrigin}/404/`]
    },
  },
  {
    check: 'canonical.foreign-origin',
    mutate: (m) => {
      for (const p of m.pages) p.canonicals = ['https://delaypilot.example/']
    },
  },
  {
    check: 'canonical.og-url-without-canonical',
    mutate: (m) => {
      m.pages[0].ogUrl = `${m.committedOrigin}/`
    },
  },
  {
    check: 'robots.private-route-indexable',
    mutate: (m) => {
      m.pages.push(page('/app/', { robots: ['noindex'] }))
      m.sitemapLocs.push(`${m.committedOrigin}/app/`)
    },
  },
  {
    check: 'robots.unknown-directive',
    mutate: (m) => {
      m.pages[0].robots = ['index, noodp']
    },
  },
  {
    check: 'robots.error-document',
    mutate: (m) => {
      m.pages[3].robots = []
      m.sitemapLocs.push(`${m.committedOrigin}/404.html`)
    },
  },
  {
    check: 'robots.txt-blanket-disallow',
    mutate: (m) => {
      m.rootFiles['robots.txt'].source += 'Disallow: /\n'
      m.rootFiles['robots.txt'].built = m.rootFiles['robots.txt'].source
    },
  },
  {
    check: 'robots.txt-missing-disallow',
    mutate: (m) => {
      m.rootFiles['robots.txt'].source = m.rootFiles['robots.txt'].source.replace(
        'Disallow: /admin/\n',
        '',
      )
      m.rootFiles['robots.txt'].built = m.rootFiles['robots.txt'].source
    },
  },
  {
    check: 'schema.on-noindex-page',
    mutate: (m) => {
      m.pages[2].jsonLd = [
        '{"@context":"https://schema.org","@type":"WebSite","name":"DelayPilot"}',
      ]
    },
  },
  {
    check: 'schema.invalid-json',
    mutate: (m) => {
      m.pages[0].jsonLd = ['{ not json ]']
    },
  },
  {
    check: 'schema.forbidden-property',
    mutate: (m) => {
      m.pages[0].jsonLd = [
        '{"@context":"https://schema.org","@type":"Organization","name":"DelayPilot","aggregateRating":{"ratingValue":"5"}}',
      ]
    },
  },
  {
    check: 'schema.type-deferred',
    mutate: (m) => {
      m.pages[0].jsonLd = ['{"@context":"https://schema.org","@type":"FAQPage"}']
    },
  },
  {
    check: 'schema.invisible-text',
    mutate: (m) => {
      m.pages[0].jsonLd = [
        '{"@context":"https://schema.org","@type":"WebSite","name":"A name nobody can see"}',
      ]
    },
  },
  {
    check: 'public-root.drift',
    mutate: (m) => {
      m.rootFiles['humans.txt'].built = 'something else'
    },
  },
  {
    check: 'public-root.not-served',
    mutate: (m) => {
      m.rootFiles['llms.txt'].built = undefined
    },
  },
  {
    check: 'public-root.llms-dead-link',
    mutate: (m) => {
      m.rootFiles['llms.txt'].source = `- [Nowhere](${m.committedOrigin}/nowhere-at-all/)\n`
      m.rootFiles['llms.txt'].built = m.rootFiles['llms.txt'].source
    },
  },
  {
    check: 'public-root.llms-noindex-link',
    mutate: (m) => {
      m.rootFiles['llms.txt'].source = `- [One](${m.committedOrigin}/guides/one/)\n`
      m.rootFiles['llms.txt'].built = m.rootFiles['llms.txt'].source
    },
  },
  {
    check: 'public-root.ads-txt-content',
    mutate: (m) => {
      m.adsTxt = 'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0'
    },
  },
  {
    check: 'public-root.security-txt-invalid',
    mutate: (m) => {
      m.securityTxt.wellKnown = 'Policy: https://delaypilot.app/security/\n'
    },
  },
  {
    check: 'public-root.security-txt-expired',
    mutate: (m) => {
      m.securityTxt.wellKnown =
        'Contact: mailto:security@delaypilot.app\nExpires: 2020-01-01T00:00:00Z\n'
    },
  },
  {
    check: 'public-root.indexnow-key',
    mutate: (m) => {
      m.distRootTextFiles = ['a1b2c3d4e5f60718.txt']
    },
  },
  {
    check: 'verification.token-unconfigured',
    mutate: (m) => {
      m.pages[0].googleVerification = 'a-token-nobody-configured'
    },
  },
  {
    check: 'verification.token-not-rendered',
    mutate: (m) => {
      m.verificationTokens['msvalidate.01'] = '1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D'
    },
  },
  {
    check: 'verification.token-mismatch',
    mutate: (m) => {
      m.verificationTokens['google-site-verification'] = 'the-configured-token'
      m.pages[0].googleVerification = 'a-different-token'
    },
  },
  {
    check: 'privacy.email-in-metadata',
    mutate: (m) => {
      m.pages[0].description = `Write to hello@delaypilot.app for anything at all, at any time of day.`
    },
  },
  {
    check: 'privacy.ticket-identifier',
    mutate: (m) => {
      m.pages[0].title = 'Find your booking reference — DelayPilot'
    },
  },
  {
    check: 'privacy.query-in-url',
    mutate: (m) => {
      m.sitemapLocs.push(`${m.committedOrigin}/about/?utm_source=nav`)
      m.pages.push(page('/about/'))
    },
  },
]

function selfTest() {
  const clean = runSuites(freshSample())
  let failed = 0
  if (clean.length > 0) {
    failed += 1
    console.error('  ✗ the clean sample model must produce no findings, but produced:')
    for (const finding of clean) console.error(`      ${finding.check} — ${finding.detail}`)
  } else {
    console.log('  ✓ clean sample model: 0 findings')
  }

  for (const { check, mutate } of SELF_TESTS) {
    const model = freshSample()
    mutate(model)
    const codes = runSuites(model).map((finding) => finding.check)
    if (codes.includes(check)) {
      console.log(`  ✓ ${check}`)
    } else {
      failed += 1
      console.error(`  ✗ ${check} did not fire. Findings: ${codes.join(', ') || '(none)'}`)
    }
  }

  if (failed > 0) {
    console.error(`\ntest-seo --self-test: ${failed} check(s) did not behave as specified.\n`)
    process.exit(1)
  }
  console.log(`\ntest-seo --self-test: ${SELF_TESTS.length + 1} check(s) behave as specified.`)
  process.exit(0)
}

/* ────────────────────────────────────────────────────────────────────────────────────────────── */
/* Main                                                                                           */
/* ────────────────────────────────────────────────────────────────────────────────────────────── */

if (process.argv.includes('--self-test')) selfTest()

if (!existsSync(DIST)) {
  console.error(
    'test-seo: apps/web/dist does not exist. Run `pnpm build` first — this runner checks what the ' +
      'build actually emitted, and has nothing to check without it.',
  )
  process.exit(1)
}

const model = await collectSite()
const findings = runSuites(model)
const composed = [runComposed('verify-manifest.mjs'), runComposed('verify-sitemap.mjs')]

for (const suite of composed) {
  if (!suite.ok) {
    findings.push({
      suite: 'composed',
      check: `composed.${suite.script}`,
      where: `scripts/seo/${suite.script}`,
      detail: suite.output,
    })
  }
}

const indexableCount = model.pages.filter(
  (candidate) => !isNoindex(candidate) && !NEVER_LISTED.has(candidate.route),
).length
const jsonLdCount = model.pages.reduce((total, candidate) => total + candidate.jsonLd.length, 0)

if (findings.length > 0) {
  console.error(`\ntest-seo: ${findings.length} finding(s).\n`)
  const bySuite = new Map()
  for (const finding of findings) {
    if (!bySuite.has(finding.suite)) bySuite.set(finding.suite, [])
    bySuite.get(finding.suite).push(finding)
  }
  for (const [suite, entries] of bySuite) {
    console.error(`  ${suite} (${entries.length})`)
    for (const finding of entries) {
      console.error(`    · [${finding.check}] ${finding.where}\n        ${finding.detail}`)
    }
  }
  console.error('')
  process.exit(1)
}

console.log(
  `test-seo: ${model.pages.length} page(s) in apps/web/dist — ${indexableCount} indexable, ` +
    `${model.pages.length - indexableCount} noindex.\n` +
    `  canonical   ${model.pages.filter((p) => p.canonicals.length > 0).length} page(s) carry one` +
    `${model.configuredOrigin === undefined ? ' (PUBLIC_SITE_URL unset: the designed absent state, owner input I-4)' : ` at ${model.configuredOrigin}`}\n` +
    `  title       ${model.pages.length} unique, longest ${Math.max(...model.pages.map((p) => (p.title ?? '').length))} characters\n` +
    `  description ${model.pages.length} unique\n` +
    `  sitemap     ${model.sitemapLocs.length} entr(ies) = the indexable set, 0 noindex, 0 private, 0 flight instances\n` +
    `  schema      ${
      jsonLdCount === 0
        ? '0 JSON-LD blocks; the builders are delivered and not yet wired into the layout (docs/SEO.md §6.3)'
        : `${jsonLdCount} block(s), all inside the allowlist and backed by visible text`
    }\n` +
    `  public-root ${ROOT_FILES.join(', ')} served and identical to source; ` +
    `ads.txt ${model.adsTxt === undefined ? 'absent (monetization-partnerships-engineer)' : 'asserted verbatim'}; ` +
    `security.txt ${model.securityTxt.wellKnown === undefined ? 'absent (blocked on owner input I-3)' : 'valid'}; ` +
    `IndexNow ${model.indexNowKey === undefined || model.indexNowKey === '' ? 'inert (no key)' : 'key file served'}\n` +
    `  composed    ${composed.map((suite) => suite.script).join(', ')} — both green`,
)
