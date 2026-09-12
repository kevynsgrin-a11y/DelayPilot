#!/usr/bin/env node
/**
 * verify-dist — the gate between `astro build` and a shipped page.
 *
 * Owner: frontend-ui-engineer. Runs from `apps/web`'s `build` script, immediately after
 * `astro build`, and exits non-zero on any finding. Everything it checks is something that a type
 * cannot catch and a reviewer would have to notice by hand, which is another way of saying:
 * something that ships broken eventually.
 *
 * THE POLICY IT CHECKS AGAINST. `apps/web/public/_headers` serves
 *
 *     script-src 'self'; style-src 'self'
 *
 * with NO 'unsafe-inline' and no hash sources. That file belongs to `seo-engineer` and cannot
 * change in this wave, so this build is held to it exactly as served: ZERO inline `<script>`, ZERO
 * inline `<style>`, and zero `style="…"` attributes. The allowlist below is therefore empty, and
 * that is the finding to report rather than a gap — `apps/web` needs no `'sha256-…'` addition to
 * `_headers` or to `apps/edge/src/index.ts`. If a future session adds a `client:*` directive, Astro
 * will inject an inline island style and two inline island scripts, this check will fail, and the
 * hashes it prints are what the header policy would then have to carry.
 *
 * WHAT ELSE IT REFUSES, and the invariant behind each:
 *
 *   style attribute          `style-src 'self'` discards it, so the rule silently does not apply
 *   <img src="/brand/*.svg"> currentColor does not resolve inside <img>; the mark vanishes on dark
 *   dead internal link       AGENTS.md §1.6 — no dead control, no link to an unemitted route
 *   TODO / FIXME / lorem ipsum / coming soon   AGENTS.md §1.6, in visible text
 *   ticket-identifier vocabulary in a FIELD    AGENTS.md §2 — name, label, placeholder, id, URL
 *   `%` in the demo cockpit's visible text     DIRECTIVE.md §13, §18.5 — no uncalibrated figure
 *   gauge / speedometer / dial / needle        DIRECTIVE.md §18.5 — the shape is banned outright
 *   duplicate element id                       a duplicate id breaks every aria-* that points at it
 *   unresolved {{…}} template token            AGENTS.md §1.6 — a placeholder in a shipped surface
 *   missing independence disclaimer            AGENTS.md §1.4, DIRECTIVE.md §3.4 — every page
 *   route-globe without its caption            ADR 0003 rule 6
 *   ad on a forbidden surface                  AGENTS.md §4, DIRECTIVE.md §20
 *   unreferenced JavaScript chunk              `dist` must not misstate what the site loads
 *
 * WHAT IT DELIBERATELY ALLOWS. The one `%` in the built output is the `width` PRESENTATION
 * ATTRIBUTE on `ProgressBar`'s SVG fill rect — geometry, not text, not in the accessible name, and
 * the only CSP-safe way to express a fill fraction without an inline style. The `%` check therefore
 * runs over visible TEXT with tags stripped, which is where a published figure would actually reach
 * a reader.
 */

import { readFile, readdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = resolve(ROOT, 'dist')

/**
 * Inline script/style SHA-256 sources the SERVED policy admits.
 *
 * Empty, because `apps/web/public/_headers` carries none. Any inline element found is reported with
 * the hash it would need, so adding one is a deliberate act with a matching header change rather
 * than a silent breakage on the deployed site.
 */
const ALLOWED_INLINE_HASHES = new Set([])

/** `DIRECTIVE.md §3.4`, verbatim. Required on every emitted page. */
const INDEPENDENCE =
  'DelayPilot is an independent travel-information tool. It is not an airline, airport, government agency, law firm, claims company, or flight-data provider. Guidance is informational and may not reflect every fact in your case.'

/** ADR 0003 rule 6. Required on any page that inlines the route globe. */
const GLOBE_CAPTION = 'Illustrative route lines — not live traffic.'

/**
 * `AGENTS.md §2`. Matched against FORM SEMANTICS and URLs, never against prose.
 *
 * The distinction is the whole point. A field, label, placeholder, autocomplete hint, `name`, id or
 * query parameter carrying this vocabulary is the defect. A SENTENCE carrying it is usually the
 * promise: `DIRECTIVE.md §7` fixes the trust line as "No booking code required", and the privacy and
 * terms pages have to be able to say what is never collected. A scanner that cannot tell the two
 * apart forces the product to stop making the commitment in order to pass its own check.
 */
const TICKET_IDENTIFIER_TERMS = [
  'booking reference',
  'booking-reference',
  'bookingreference',
  'record locator',
  'record-locator',
  'recordlocator',
  'confirmation code',
  'confirmation-code',
  'confirmationcode',
  'reservation code',
  'pnr',
]

/**
 * `DIRECTIVE.md §18.5`. The shape, by any of its names — matched against COMPONENT AND CLASS NAMES,
 * never against prose.
 *
 * Same reason as above: `/connection-risk/` explains why there is no needle, and two guides explain
 * why there is no speedometer. Those sentences are the product keeping its promise. What must not
 * exist is a component: `class="…gauge…"`, `data-gauge`, `<dp-speedometer>`. `dial` is matched on a
 * word boundary so it does not fire on the `<dialog>` element the mobile navigation uses.
 */
const GAUGE_TERMS = ['gauge', 'speedometer', 'needle', 'dial']

/**
 * `AGENTS.md §1.6`, matched against visible text.
 *
 * `placeholder` and `tbd` are NOT on this list: `/editorial-policy/` publishes the content-quality
 * gate, which includes "no placeholder tokens", and a scanner that fires on the word would force
 * that promise off the page. The four below have no legitimate prose use on this site.
 */
const PLACEHOLDER_TERMS = ['todo', 'fixme', 'lorem ipsum', 'coming soon']

/** `AGENTS.md §4` / `DIRECTIVE.md §20`: no ad on any of these. */
const AD_FORBIDDEN_PREFIXES = [
  '/privacy/',
  '/terms/',
  '/editorial-policy/',
  '/advertising-policy/',
  '/affiliate-disclosure/',
  '/accessibility/',
  '/contact/',
  '/app/',
  '/auth/',
  '/checkout/',
  '/admin/',
  '/status/',
  '/404',
]

const findings = []
const fail = (file, message) => findings.push(`${file}: ${message}`)

async function walk(directory) {
  const out = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

const sha256 = (value) => `sha256-${createHash('sha256').update(value, 'utf8').digest('base64')}`

/** Strip every tag, comment, and the contents of script/style, leaving visible text. */
const visibleText = (html) =>
  html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')

/** Every `id="…"` value, including those inside inlined SVG. */
const elementIds = (html) => [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])

/**
 * Every attribute VALUE in the document, plus the text of every `<label>`.
 *
 * This is the surface the ticket-identifier and gauge checks run over: what a form field is called,
 * what it autofills as, what a URL carries, and what a label says — never the prose around them.
 */
const attributeValues = (html) => [...html.matchAll(/\s[a-zA-Z-]+="([^"]*)"/g)].map((m) => m[1])

const labelText = (html) =>
  [...html.matchAll(/<label\b[^>]*>([\s\S]*?)<\/label>/gi)].map((m) => visibleText(m[1]))

/** Internal hrefs, excluding fragments, mailto, tel and absolute URLs. */
const internalLinks = (html) =>
  [...html.matchAll(/\shref="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((href) => href.startsWith('/'))
    .map((href) => href.split('#')[0])
    .filter((href) => href !== '')

function checkInlineElements(file, html) {
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attributes = match[1]
    const body = match[2]
    if (/\ssrc=/i.test(attributes)) continue
    if (body.trim() === '') continue
    const hash = sha256(body)
    if (!ALLOWED_INLINE_HASHES.has(hash)) {
      fail(
        file,
        `inline <script> is not in the served policy. The header would need script-src '${hash}'. ` +
          `Move it to an external same-origin module, or coordinate a _headers change first.`,
      )
    }
  }

  for (const match of html.matchAll(/<style\b([^>]*)>([\s\S]*?)<\/style>/gi)) {
    const body = match[2]
    if (body.trim() === '') continue
    const hash = sha256(body)
    if (!ALLOWED_INLINE_HASHES.has(hash)) {
      fail(
        file,
        `inline <style> is not in the served policy. The header would need style-src '${hash}'. ` +
          `build.inlineStylesheets is 'never'; an inline style here means an island injected one.`,
      )
    }
  }

  const styleAttributes = [...html.matchAll(/\sstyle="([^"]*)"/g)]
  if (styleAttributes.length > 0) {
    fail(
      file,
      `${styleAttributes.length} style="…" attribute(s): ${styleAttributes
        .slice(0, 3)
        .map((match) => match[0].trim())
        .join(', ')}. style-src 'self' discards them, so the rule never applies. Use a data ` +
        `attribute over a finite set, an SVG presentation attribute, or a class.`,
    )
  }
}

function checkBrandImages(file, html) {
  for (const match of html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)) {
    if (/^\/brand\//.test(match[1])) {
      fail(
        file,
        `<img src="${match[1]}"> — brand and motif SVG must be INLINED. Inside <img> there is no ` +
          `inherited color and no custom properties, so currentColor falls back to black and the ` +
          `mark disappears on a dark surface (scripts/assets/asset-manifest.mjs).`,
      )
    }
  }
}

function checkText(file, html, routes) {
  const text = visibleText(html)
  const machineSurface = [...attributeValues(html), ...labelText(html)].join('\n').toLowerCase()
  const elementNames = [...html.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)/g)]
    .map((match) => match[1].toLowerCase())
    .join(' ')

  for (const term of TICKET_IDENTIFIER_TERMS) {
    if (machineSurface.includes(term)) {
      fail(
        file,
        `ticket-identifier vocabulary "${term}" in a field name, label, placeholder, ` +
          `autocomplete hint, id or URL — AGENTS.md §2.`,
      )
    }
  }

  for (const term of GAUGE_TERMS) {
    const pattern = new RegExp(`\\b${term}\\b`)
    if (pattern.test(machineSurface) || pattern.test(elementNames)) {
      fail(file, `a "${term}" component or class — DIRECTIVE.md §18.5 forbids the shape.`)
    }
  }

  for (const term of PLACEHOLDER_TERMS) {
    if (text.toLowerCase().includes(term)) {
      fail(file, `placeholder text "${term}" — AGENTS.md §1.6.`)
    }
  }

  if (/\{\{[\s\S]{0,80}?\}\}/.test(text)) {
    const token = /\{\{[\s\S]{0,80}?\}\}/.exec(text)?.[0] ?? ''
    fail(file, `unresolved template token ${token.trim()} reached the page — AGENTS.md §1.6.`)
  }

  if (!html.includes(INDEPENDENCE)) {
    fail(file, 'the DIRECTIVE.md §3.4 independence disclaimer is missing from the footer.')
  }

  if (html.includes('id="limb"') && !html.includes(GLOBE_CAPTION)) {
    fail(
      file,
      `the route globe is inlined without its ADR 0003 rule 6 caption: "${GLOBE_CAPTION}".`,
    )
  }

  const cockpit = /<div class="dpx-cockpit"[\s\S]*?<\/div>\s*<\/(?:section|body)>/.exec(html)
  if (cockpit !== null && visibleText(cockpit[0]).includes('%')) {
    fail(
      file,
      'the demonstration cockpit renders a "%" in visible text. No calibrated model is deployed, ' +
        'so no percentage may be published (DIRECTIVE.md §13, §18.5).',
    )
  }

  const ids = elementIds(html)
  const duplicates = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))]
  if (duplicates.length > 0) {
    fail(
      file,
      `duplicate element id(s): ${duplicates.join(', ')}. Every aria-labelledby, ` +
        `aria-describedby and aria-controls pointing at one resolves to the wrong element. A ` +
        `second React root or a second inline of the same SVG is the usual cause.`,
    )
  }

  for (const href of internalLinks(html)) {
    if (!routes.has(href)) {
      fail(file, `dead internal link to ${href} — that route was not emitted (AGENTS.md §1.6).`)
    }
  }
}

function checkAdPlacement(file, route, html) {
  if (!html.includes('dp-ad-slot') && !html.includes('data-ad-placement')) return
  if (AD_FORBIDDEN_PREFIXES.some((prefix) => route.startsWith(prefix))) {
    fail(file, `an ad slot is present on ${route} — AGENTS.md §4 forbids it on this surface.`)
  }
}

/**
 * A JavaScript chunk nothing references.
 *
 * `prune-dist.mjs` removes these before this runs; the check is here so that if it ever stops
 * working, the build fails rather than quietly regrowing a 216 KB React runtime that no page loads
 * and every bundle measurement counts.
 */
function checkOrphanScripts(scripts, referrers) {
  for (const script of scripts) {
    const name = script.split('/').pop() ?? script
    const referenced = referrers.some(
      (referrer) => referrer.file !== script && referrer.source.includes(name),
    )
    if (!referenced) {
      fail(
        name,
        'is an emitted JavaScript chunk that no page and no other chunk references. It ships to ' +
          'the CDN, is never fetched, and makes every bundle measurement of dist wrong. ' +
          'prune-dist.mjs should have removed it.',
      )
    }
  }
}

async function main() {
  const files = await walk(DIST)
  const html = files.filter((file) => file.endsWith('.html'))

  if (html.length === 0) {
    console.error('verify-dist: no HTML was emitted. Did astro build run?')
    process.exit(1)
  }

  /** Every address this build serves: directory routes, plus every emitted asset path. */
  const routes = new Set()
  for (const file of files) {
    const path = `/${relative(DIST, file).split('\\').join('/')}`
    routes.add(path)
    if (path.endsWith('/index.html')) routes.add(path.slice(0, -'index.html'.length))
  }
  routes.add('/')

  const scripts = files.filter((file) => file.endsWith('.js'))
  const referrers = await Promise.all(
    [...html, ...scripts].map(async (file) => ({ file, source: await readFile(file, 'utf8') })),
  )
  checkOrphanScripts(scripts, referrers)

  for (const file of html) {
    const label = relative(DIST, file)
    const route = `/${relative(DIST, file).replace(/index\.html$/, '')}`
    const source = await readFile(file, 'utf8')

    checkInlineElements(label, source)
    checkBrandImages(label, source)
    checkText(label, source, routes)
    checkAdPlacement(label, route, source)
  }

  if (findings.length > 0) {
    console.error(`verify-dist: ${findings.length} finding(s).\n`)
    for (const finding of findings) console.error(`  · ${finding}`)
    console.error('')
    process.exit(1)
  }

  console.log(
    `verify-dist: ${html.length} page(s) and ${scripts.length} chunk(s) checked, 0 findings. ` +
      `No inline script or style, so the served policy (script-src 'self'; style-src 'self') ` +
      `needs no hash additions.`,
  )
}

await main()
