#!/usr/bin/env node
/**
 * verify-dist — the gate between `astro build` and a shipped page.
 *
 * Owner: frontend-ui-engineer. Runs from `apps/web`'s `build` script, immediately after
 * `astro build`, and exits non-zero on any finding. Everything it checks is something that a type
 * cannot catch and a reviewer would have to notice by hand, which is another way of saying:
 * something that ships broken eventually.
 *
 * THE POLICY IT CHECKS AGAINST IS READ FROM `apps/web/public/_headers`, NEVER RESTATED HERE. That
 * file belongs to `seo-engineer` and it moves: `img-src` carried `data:` for the placeholder favicon
 * until BaseLayout v2 linked a real icon set, and a copy of the policy pasted into this script would
 * still be checking the old one. So the `Content-Security-Policy` line is parsed at run time, the
 * inline-hash allowlist is DERIVED from its `script-src` and `style-src` sources, and the summary
 * prints the policy the build was actually held to.
 *
 * As served today that policy is `script-src 'self'; style-src 'self'` with no hash sources, so the
 * derived allowlist is empty and the build must contain ZERO inline `<script>`, ZERO inline
 * `<style>` and zero `style="…"` attributes. If a future session adds a `client:*` directive, Astro
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
 *   a `data:` image while img-src forbids one  the served policy discards it; the image vanishes
 *   'unsafe-inline' in the served policy       the widening this script exists to make visible
 *   a page with no web app manifest link       every page is BaseLayout's, and BaseLayout links it
 *   unreferenced JavaScript chunk              `dist` must not misstate what the site loads
 *   an ad slot in a forbidden POSITION         DIRECTIVE.md §20 — above the search, in a form,
 *                                              between a warning and its action, in or beside a
 *                                              rights card or an action checklist
 *   a bare `Demo` chip                         AGENTS.md §1.2, DIRECTIVE.md §28 — the label never
 *                                              travels without "Demo data — not a live flight."
 *   a drifted §26/§27 sentence                 fixed text is transcribed, never auto-corrected
 *   two runs of text joined with no space      Astro's JSX whitespace rule, in shipped prose
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
import { fileURLToPath, pathToFileURL } from 'node:url'

/*
 * THE FIXED SENTENCES ARE IMPORTED FROM THE COPY MODULE, NEVER RETYPED HERE.
 *
 * A checker that carries its own copy of the text it is checking is a checker that will one day
 * pass a page that drifted from the copy module and fail one that did not. Node 22.18 and later
 * strip TypeScript types on import with no flag and no build step (the repository's own
 * `pnpm lint:copy` already loads a `.ts` entry point this way), so this reads the same exports the
 * components render.
 */

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const DIST = resolve(ROOT, 'dist')
const HEADERS_FILE = resolve(ROOT, 'public/_headers')
const COPY = resolve(ROOT, 'src/lib/copy')

const { disclaimers } = await import(pathToFileURL(resolve(COPY, 'disclaimers.ts')).href)
const { results } = await import(pathToFileURL(resolve(COPY, 'results.ts')).href)
const { provenanceMeanings } = await import(pathToFileURL(resolve(COPY, 'provenance.ts')).href)

/**
 * The `§26` sentences plus `§27` Demo, as the copy module holds them.
 *
 * `disclaimers.labels` is the one member of that object that is not a sentence — it is the
 * accessible name of each `role="note"` — so it is filtered out rather than listed by hand: a
 * hand-written key list here would be a second place to update.
 */
const FIXED_SENTENCES = [
  ...Object.entries(disclaimers)
    .filter(([, value]) => typeof value === 'string')
    .map(([key, value]) => ({ key: `disclaimers.${key}`, text: value })),
  { key: 'results.demo', text: results.demo },
]

/** `DIRECTIVE.md §27` Demo, verbatim. Required beside every `Demo` chip (`AGENTS.md §1.2`). */
const DEMO_SENTENCE = results.demo

/** What a LEGEND chip carries instead, since it labels the vocabulary rather than a datum. */
const DEMO_MEANING = provenanceMeanings.demo

const findings = []
const fail = (file, message) => findings.push(`${file}: ${message}`)

/**
 * The served Content-Security-Policy, parsed out of `apps/web/public/_headers`.
 *
 * Read rather than restated: this script's whole value is that it holds the build to the policy a
 * browser will actually apply, and a second copy of that policy here would drift from the first one
 * silently. `_headers` is `seo-engineer`'s file; this is a consumer of it.
 */
function readServedPolicy(source) {
  const line = source
    .split('\n')
    .map((entry) => entry.trim())
    .find((entry) => entry.toLowerCase().startsWith('content-security-policy:'))

  if (line === undefined) {
    console.error(
      'verify-dist: apps/web/public/_headers carries no Content-Security-Policy line. The build ' +
        'cannot be held to a policy that is not served; restore the header first.',
    )
    process.exit(1)
  }

  const policy = line.slice(line.indexOf(':') + 1).trim()
  const directives = new Map()
  for (const directive of policy.split(';')) {
    const [name, ...sources] = directive.trim().split(/\s+/)
    if (name === undefined || name === '') continue
    directives.set(name.toLowerCase(), sources)
  }
  return { policy, directives }
}

const { policy: SERVED_POLICY, directives: POLICY } = readServedPolicy(
  await readFile(HEADERS_FILE, 'utf8'),
)

/** Sources for a directive, falling back to `default-src` exactly as a browser does. */
const sourcesFor = (directive) => POLICY.get(directive) ?? POLICY.get('default-src') ?? []

/**
 * Inline script/style hash sources the SERVED policy admits — derived, never typed by hand.
 *
 * Empty as the policy stands today. Any inline element found is reported with the hash it would
 * need, so adding one is a deliberate act with a matching header change rather than a silent
 * breakage on the deployed site.
 */
const ALLOWED_INLINE_HASHES = new Set(
  ['script-src', 'style-src']
    .flatMap((directive) => sourcesFor(directive))
    .filter((source) => /^'(?:sha256|sha384|sha512)-/.test(source))
    .map((source) => source.slice(1, -1)),
)

/**
 * `'unsafe-inline'` on either directive makes every inline check below vacuous: the build could
 * ship inline scripts and this script would pass them. `_headers` says in its own comments that a
 * source added to unblock a red build is the failure mode it exists to prevent, so the widening is
 * reported here rather than silently honoured.
 */
for (const directive of ['script-src', 'style-src']) {
  if (sourcesFor(directive).includes("'unsafe-inline'")) {
    fail(
      'apps/web/public/_headers',
      `${directive} carries 'unsafe-inline'. Every inline-element check in this script becomes ` +
        `vacuous, so a green build stops being evidence of anything. Move the element to an ` +
        `external same-origin file and take the source back out.`,
    )
  }
}

/**
 * True when NO directive of the served policy admits a `data:` URI — which is the case today.
 *
 * `img-src` lost `data:` when BaseLayout v2 replaced the `<link rel="icon" href="data:,">`
 * placeholder with a real icon set. So a `data:` URI anywhere in the emitted output is a resource a
 * browser will refuse: a favicon that does not appear, or a background image that silently does not
 * paint. `assetsInlineLimit: 0` in `astro.config.mjs` is what stops Vite producing one; this check
 * is what makes that setting's effect verified rather than assumed.
 */
const DATA_URI_FORBIDDEN = ![...POLICY.values()].some((sources) => sources.includes('data:'))

/**
 * Every page is rendered by `apps/web/src/layouts/BaseLayout.astro`, and BaseLayout links the web
 * app manifest. A page without the link is a page that bypassed the shell, which is how a head
 * silently loses its canonical, its icons and its `theme-color` too.
 */
const MANIFEST_LINK = /<link\b[^>]*\brel="manifest"[^>]*>/i
const MANIFEST_HREF = /<link\b[^>]*\brel="manifest"[^>]*\bhref="([^"]+)"/i

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

/**
 * A `data:` URI in an emitted asset while the served policy admits none.
 *
 * Runs over HTML and CSS both: a `url(data:…)` in a stylesheet is an image request like any other,
 * and `img-src` governs it.
 */
function checkDataUris(file, source) {
  if (!DATA_URI_FORBIDDEN) return
  const uris = [
    ...[...source.matchAll(/\s(?:src|href|srcset|content)="(data:[^"]*)"/gi)].map((m) => m[1]),
    ...[...source.matchAll(/url\(\s*["']?(data:[^"')]*)/gi)].map((m) => m[1]),
  ]
  if (uris.length === 0) return
  const shown = uris.slice(0, 3).map((uri) => `${uri.slice(0, 48)}…`)
  fail(
    file,
    `${uris.length} data: URI(s) — ${shown.join(', ')}. The served policy admits none, so the ` +
      `browser refuses every one of them and the resource simply does not appear. Emit the asset ` +
      `as a file (astro.config.mjs pins assetsInlineLimit to 0), or coordinate a _headers change.`,
  )
}

/** Every page comes from BaseLayout, and BaseLayout links the web app manifest. */
function checkManifestLink(file, html) {
  if (!MANIFEST_LINK.test(html)) {
    fail(
      file,
      'no <link rel="manifest">. Every page is rendered by BaseLayout, which emits one, so a page ' +
        'without it bypassed the shell — and a head that lost the manifest lost the icons and the ' +
        'theme-color with it.',
    )
    return
  }
  const href = MANIFEST_HREF.exec(html)?.[1]
  if (href === undefined || !href.startsWith('/')) {
    fail(
      file,
      `<link rel="manifest"> points at ${href ?? '(no href)'}. It must be a same-origin path: the ` +
        `served policy has no manifest-src and falls back to default-src 'self'.`,
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

/**
 * `AGENTS.md §4` / `DIRECTIVE.md §20`, the POSITIONAL half.
 *
 * The route-prefix check above covers "on a forbidden surface". §20's first five forbidden clauses
 * are not about which page a slot is on — they are about WHERE ON THE PAGE it is, and every one of
 * them was unchecked (trust sweep F6):
 *
 *   above the primary search · inside a form · between a warning and its action ·
 *   inside a rights card · adjacent to a rights card or an action checklist
 *
 * Each is expressed here as a position in the emitted document, because that is the only place the
 * rule is actually true or false. A slot that satisfies every prefix rule and sits two hundred
 * bytes above the lookup form is the defect §20 is written about.
 *
 * The scan is by byte offset rather than by parsing, which is exactly as much precision as the
 * question needs: "does this ad open before that form opens" is an ordering question, and the
 * enclosure questions are answered by matching each container's open and close tags around the
 * slot's offset. `--self-test` feeds a synthetic violation for each clause and asserts it fires.
 */

/** Every offset at which an ad slot begins. */
const adOffsets = (html) =>
  [...html.matchAll(/<[a-zA-Z][^>]*(?:data-ad-placement|class="[^"]*\bdp-ad-slot\b)[^>]*>/g)].map(
    (match) => match.index,
  )

/**
 * Offsets of the region each `openPattern` element spans, found by tag-depth counting.
 *
 * Written out rather than regex-matched to a closing tag because these containers nest: a
 * `.dpp-rights` section contains sections of its own, and `indexOf('</section>')` would close at
 * the first inner one and declare everything after it "outside the rights card".
 */
function spansOf(html, openPattern, tagName) {
  const spans = []
  const open = new RegExp(openPattern, 'g')
  const boundary = new RegExp(`<${tagName}\\b[^>]*>|</${tagName}>`, 'g')

  for (const match of html.matchAll(open)) {
    const start = match.index
    boundary.lastIndex = start
    let depth = 0
    for (let step = boundary.exec(html); step !== null; step = boundary.exec(html)) {
      depth += step[0].startsWith('</') ? -1 : 1
      if (depth === 0) {
        spans.push([start, step.index + step[0].length])
        break
      }
    }
  }
  return spans
}

const within = (offset, spans) => spans.some(([start, end]) => offset >= start && offset < end)

export function findAdPositionViolations(html) {
  const offsets = adOffsets(html)
  if (offsets.length === 0) return []

  const out = []

  /*
   * The lookup form's stable hook is `data-dp-lookup` on the `<form>` (LookupForm.astro). The
   * PRIMARY search is the first one on the page; "above" is document order, which is what a reader
   * meets first on every viewport and what §20 means by it.
   */
  const lookup = html.search(/<form\b[^>]*\bdata-dp-lookup\b/)
  const forms = spansOf(html, '<form\\b[^>]*>', 'form')
  const rights = spansOf(html, '<[a-z]+\\b[^>]*class="[^"]*\\bdpp-rights\\b[^"]*"[^>]*>', 'section')
  const actions = spansOf(
    html,
    '<[a-z]+\\b[^>]*class="[^"]*\\bdpp-actions\\b[^"]*"[^>]*>',
    'section',
  )

  /*
   * A "warning and its action": a `StateBlock` whose callout carries an action row. §20 forbids a
   * slot BETWEEN them, and the block itself is the only place an element can be between the two, so
   * the block is the forbidden region.
   *
   * Severity is deliberately NOT checked. §20 says "warning", and an `info` state block that offers
   * a real control — "no provider is connected, here is the demonstration" — is a step a reader was
   * about to take, which is the thing the clause protects. Reading it strictly costs nothing: no
   * permitted placement is inside a state block at any severity.
   */
  const warnings = spansOf(
    html,
    '<div\\b[^>]*class="dpp-state[^"]*"[^>]*>(?=[\\s\\S]{0,4000}?dp-callout__action)',
    'div',
  )

  for (const offset of offsets) {
    if (lookup !== -1 && offset < lookup) {
      out.push(
        'an ad slot appears BEFORE the primary lookup form in document order — DIRECTIVE.md §20 ' +
          'forbids an ad above the primary search, on every viewport.',
      )
    }
    if (within(offset, forms)) {
      out.push('an ad slot is inside a <form> — DIRECTIVE.md §20 forbids an ad inside a form.')
    }
    if (within(offset, rights)) {
      out.push(
        'an ad slot is inside a rights card (.dpp-rights) — AGENTS.md §4 forbids it outright.',
      )
    }
    if (within(offset, actions)) {
      out.push('an ad slot is inside an action checklist (.dpp-actions) — AGENTS.md §4.')
    }
    if (within(offset, warnings)) {
      out.push(
        'an ad slot sits between a warning and its action — DIRECTIVE.md §20 forbids it, and this ' +
          'is the placement that costs a traveler the step they were about to take.',
      )
    }
    if (adjacentTo(html, offset, rights)) {
      out.push('an ad slot is adjacent to a rights card — AGENTS.md §4 forbids "inside or beside".')
    }
    if (adjacentTo(html, offset, actions)) {
      out.push(
        'an ad slot is adjacent to an action checklist — §20 permits one only AFTER the complete ' +
          'checklist and with strong separation, which an immediate sibling is not.',
      )
    }
  }

  return [...new Set(out)]
}

/**
 * Adjacent = nothing but whitespace and comments between the slot and the container, either side.
 *
 * §20 says "inside or adjacent to", and a slot separated from a rights card by one blank line is
 * the thing a reader cannot tell apart from part of it.
 */
function adjacentTo(html, offset, spans) {
  const isBlank = (text) => text.replace(/<!--[\s\S]*?-->/g, '').trim() === ''
  return spans.some(([start, end]) => {
    if (offset >= start && offset < end) return false
    if (offset >= end) return isBlank(html.slice(end, offset))
    const slotEnd = html.indexOf('>', offset)
    return slotEnd !== -1 && slotEnd < start && isBlank(html.slice(slotEnd + 1, start))
  })
}

/* --------------------------------------------------------------------------------------------- */
/* The `Demo` label never travels alone.                                                          */
/* --------------------------------------------------------------------------------------------- */

/**
 * `AGENTS.md §1.2`: the `Demo` label "Must be accompanied by 'Demo data — not a live flight.'"
 * `DIRECTIVE.md §28`: "Every demo panel says 'Demo data — not a live flight.'"
 *
 * Neither admits an exception, and the trust sweep measured what the missing half costs: on a phone
 * the demonstration banner scrolls off, and what is left beside a fixture value is a bare one-word
 * chip — on the surface where a reader is most likely to mistake a demonstration for their own
 * flight (F4; `docs/VOICE.md §2` now records the resolved rule).
 *
 * GRANULARITY IS THE PANEL. One caption per panel, beside that panel's chip, covers every chip
 * inside it: the alert timeline's five rows and the source-freshness rows share their panel's
 * caption. What fails is a chip whose nearest enclosing `article` or `section` carries no sentence.
 *
 * The sentence comes from `results.demo`, never from a literal here.
 */
function checkDemoCaptions(file, html) {
  const chip = /<([a-z]+)\b[^>]*\bdata-provenance="demo"[^>]*>/g
  const legends = spansOf(html, '<ul\\b[^>]*\\bdata-provenance-legend\\b[^>]*>', 'ul')

  for (const match of html.matchAll(chip)) {
    /*
     * A LEGEND chip is exempt, and the exemption is verified rather than assumed. `docs/VOICE.md
     * §2`: "A provenance legend is not a panel. A chip in a legend labels the vocabulary rather
     * than a datum, and is accompanied by `provenanceMeanings.demo`." So the sentence it must carry
     * is that one, and this checks for it.
     */
    if (within(match.index, legends)) {
      const item = nearestListItem(html, match.index)
      if (item === undefined || !item.includes(DEMO_MEANING)) {
        fail(
          file,
          'a Demo chip in a provenance legend is not accompanied by provenanceMeanings.demo. A ' +
            'legend entry is exempt from the §28 sentence only because it carries its own ' +
            'explanation; without one it is a bare label (docs/VOICE.md §2).',
        )
      }
      continue
    }

    /*
     * The tightest possible adjacency: `ProvenanceChip` renders `freshness` INSIDE the chip, so a
     * chip whose own element carries the sentence has already satisfied "accompanied by". The
     * homepage's page-level chip is built that way deliberately.
     */
    const self = html.slice(match.index, closingIndex(html, match.index, match[1]) ?? match.index)
    if (self.includes(DEMO_SENTENCE)) continue

    const panel = nearestPanel(html, match.index)
    if (panel === undefined) {
      fail(
        file,
        'a Demo provenance chip sits in no <article> or <section> at all, so nothing bounds the ' +
          `panel it labels. AGENTS.md §1.2 requires "${DEMO_SENTENCE}" beside it.`,
      )
      continue
    }
    if (!panel.includes(DEMO_SENTENCE)) {
      fail(
        file,
        `a Demo provenance chip whose nearest <article>/<section> does not contain "${DEMO_SENTENCE}". ` +
          'AGENTS.md §1.2 and DIRECTIVE.md §28 require the sentence beside the label, not only in ' +
          'a banner above it — on a phone the banner scrolls off and the chip does not.',
      )
    }
  }
}

/** The innermost `<li>` containing `offset`, as raw markup. The unit of a legend. */
function nearestListItem(html, offset) {
  let innermost
  for (const match of html.matchAll(/<li\b[^>]*>/g)) {
    if (match.index > offset) break
    const end = closingIndex(html, match.index, 'li')
    if (end === undefined || end <= offset) continue
    if (innermost === undefined || match.index > innermost[0]) innermost = [match.index, end]
  }
  return innermost === undefined ? undefined : html.slice(innermost[0], innermost[1])
}

/**
 * The innermost `<article>` or `<section>` containing `offset`, as raw markup.
 *
 * Found by scanning every opening tag before the offset and keeping the closest one whose matching
 * close is after it. Depth counting matters: these elements nest four deep in a cockpit panel, and
 * the nearest ANCESTOR is the panel the chip belongs to, not the outermost section on the page.
 */
function nearestPanel(html, offset) {
  let innermost
  const open = /<(article|section)\b[^>]*>/g

  for (const match of html.matchAll(open)) {
    if (match.index > offset) break
    const end = closingIndex(html, match.index, match[1])
    if (end === undefined || end <= offset) continue
    if (innermost === undefined || match.index > innermost[0]) innermost = [match.index, end]
  }

  return innermost === undefined ? undefined : html.slice(innermost[0], innermost[1])
}

/** The index just past the tag that closes the element opening at `start`. */
function closingIndex(html, start, tagName) {
  const boundary = new RegExp(`<${tagName}\\b[^>]*>|</${tagName}>`, 'g')
  boundary.lastIndex = start
  let depth = 0
  for (let step = boundary.exec(html); step !== null; step = boundary.exec(html)) {
    depth += step[0].startsWith('</') ? -1 : 1
    if (depth === 0) return step.index + step[0].length
  }
  return undefined
}

/* --------------------------------------------------------------------------------------------- */
/* Fixed text stays byte-exact from the copy module to the pixel.                                 */
/* --------------------------------------------------------------------------------------------- */

/**
 * `DIRECTIVE.md §26`, `§27` and `§3.4` are FIXED TEXT: `copy.test.ts` re-reads the directive and
 * fails on a single changed character. That guarantee stopped at the module boundary.
 *
 * Astro's Markdown pipeline enables smartypants by default, and it rewrote the rights disclaimer's
 * ASCII apostrophe ("the airline or regulator's determination") to U+2019 in every Markdown body at
 * build time. Two served routes had already drifted and all twenty content entries would have
 * followed (copy review F-3, trust sweep F1). `markdown.smartypants: false` in `astro.config.mjs`
 * is the fix; this is the guard, so a future remark plugin, a paste from a word processor or an
 * editor's autocorrect cannot re-introduce it unnoticed.
 *
 * THE TEST IS ON THE OPENING WORDS, not on the whole sentence: a page that carries the first six
 * words of a fixed sentence is a page trying to say it, so anything short of the exact text is a
 * drift rather than an unrelated coincidence.
 */
function checkFixedSentences(file, html) {
  const text = decodeEntities(visibleText(html)).replace(/\s+/g, ' ')

  for (const { key, text: sentence } of FIXED_SENTENCES) {
    const opening = sentence.split(' ').slice(0, 6).join(' ')
    if (!text.includes(opening) || text.includes(sentence)) continue

    const drifted = driftedCharacters(text, sentence)
    fail(
      file,
      `${key} is rendered with altered characters. Expected, byte for byte:\n      "${sentence}"\n` +
        `    Found${drifted === undefined ? '' : ` (differs at: ${drifted})`}:\n      ` +
        `"${excerptAround(text, opening, sentence.length)}"\n` +
        '    DIRECTIVE.md §26/§27 text is transcribed, never retyped or auto-corrected.',
    )
  }
}

/** The characters that differ, as `expected→found` pairs, for the first mismatching run. */
function driftedCharacters(text, sentence) {
  const opening = sentence.split(' ').slice(0, 6).join(' ')
  const start = text.indexOf(opening)
  if (start === -1) return undefined
  const found = text.slice(start, start + sentence.length)
  for (let i = 0; i < sentence.length; i += 1) {
    if (found[i] !== sentence[i]) {
      return `U+${sentence.codePointAt(i).toString(16).toUpperCase().padStart(4, '0')} expected, U+${(
        found.codePointAt(i) ?? 0
      )
        .toString(16)
        .toUpperCase()
        .padStart(4, '0')} found, at offset ${i}`
    }
  }
  return undefined
}

const excerptAround = (text, opening, length) => {
  const start = text.indexOf(opening)
  return start === -1 ? '' : text.slice(start, start + length)
}

/** The five named entities Astro emits, plus numeric ones. Enough to compare prose. */
function decodeEntities(text) {
  return text
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
}

/* --------------------------------------------------------------------------------------------- */
/* Two words that must not run together.                                                          */
/* --------------------------------------------------------------------------------------------- */

/**
 * Astro's JSX whitespace rule drops the whitespace between a line-ending node and a node that
 * starts the next line, so markup that reads correctly in the editor ships with the words joined:
 *
 *     <strong>{lookup.noBookingCode.line}</strong>
 *     {lookup.noBookingCode.why}
 *
 * rendered as "No booking code required.A flight number and a date are enough" — `DIRECTIVE.md §7`'s
 * trust line, on the homepage, run together. The fix is an explicit `{' '}`; this is the guard,
 * because the defect is invisible in the source and looks like a typo in the output.
 *
 * IT ONLY FIRES ON INLINE ELEMENTS. A `display: block` element supplies its own separation, so a
 * letter against `<p` or `<div` is not a join. The exclusion list is explicit and small, and each
 * entry names the rule that makes it block — a class added to it without that reason is how a
 * guard stops guarding.
 */
const INLINE_JOIN_TAGS = 'a|strong|em|code|abbr|time|span'

/**
 * Classes proven `display: block` (or the equivalent) in an owned stylesheet, so the two runs of
 * text they separate are on different lines whatever the markup says.
 *
 *   .dpx-lookup__example        `display: block` — the example line under a field label
 *   .dpx-article__answer-label  `display: block` — the "Short answer" label above its paragraph
 *   .dpp-rights__source-note    a trailing note that follows an em dash, which is its own separator
 *   .dpp-time__*                the ZonedTimeView parts are a grid of block cells
 *   .dp-visually-hidden         not painted at all; it carries its own leading space where needed
 */
/** The opening tag matching the `</tagName>` that ends at `offset`, by backwards depth counting. */
function openingTagFor(html, offset, tagName) {
  const boundary = new RegExp(`<${tagName}\\b[^>]*>|</${tagName}>`, 'g')
  const stack = []
  for (const step of html.matchAll(boundary)) {
    // `>=`, not `>`: the closing tag AT the offset is the one we are looking up, so it must not
    // pop its own opening tag off the stack before we read it.
    if (step.index >= offset) break
    if (step[0].startsWith('</')) stack.pop()
    else stack.push(step[0])
  }
  return stack.at(-1)
}

const BLOCK_CLASSES = [
  'dpx-lookup__example',
  'dpx-article__answer-label',
  'dpp-rights__source-note',
  'dpp-time__',
  'dp-visually-hidden',
]

function checkInlineJoins(file, html) {
  const opening = new RegExp(`([A-Za-z.,;:])<(?:${INLINE_JOIN_TAGS})\\b[^>]*>`, 'g')
  const closing = new RegExp(`</(${INLINE_JOIN_TAGS})>([A-Za-z(])`, 'g')

  for (const match of [...html.matchAll(opening), ...html.matchAll(closing)]) {
    // On a closing tag the class is on the OPENING one, so find that before deciding.
    const isClose = match[0].startsWith('</')
    const tag = isClose
      ? (openingTagFor(html, match.index, match[1]) ?? match[0])
      : (/<[a-z]+\b[^>]*>/.exec(match[0])?.[0] ?? match[0])
    if (BLOCK_CLASSES.some((name) => tag.includes(name))) continue
    fail(
      file,
      `two runs of text are joined with no space: ${JSON.stringify(
        html.slice(Math.max(0, match.index - 40), match.index + match[0].length + 40),
      )}. Astro drops the whitespace between a line-ending node and the next line's node; add an ` +
        "explicit {' '} between them.",
    )
  }
}

function checkAdPlacement(file, route, html) {
  if (!html.includes('dp-ad-slot') && !html.includes('data-ad-placement')) return
  if (AD_FORBIDDEN_PREFIXES.some((prefix) => route.startsWith(prefix))) {
    fail(file, `an ad slot is present on ${route} — AGENTS.md §4 forbids it on this surface.`)
  }
  for (const violation of findAdPositionViolations(html)) fail(file, violation)
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

/* --------------------------------------------------------------------------------------------- */
/* --self-test: prove each positional and textual check actually fires.                           */
/* --------------------------------------------------------------------------------------------- */

/**
 * A check that never fires is indistinguishable from a build with no defects, and the four checks
 * added in this pass are all of the "absence is the pass" kind: nothing in `dist` exercises the ad
 * positions at all today, because no ad ships. So each clause is fed a synthetic violation here and
 * asserted to produce a finding, and the two that are easiest to over-fire are fed a legitimate
 * document and asserted to stay quiet.
 *
 * It runs from `apps/web`'s `build` script, before the real pass. `node scripts/verify-dist.mjs
 * --self-test` prints one line per case.
 */
const LOOKUP_FORM = '<form data-dp-lookup><input name="flight"></form>'
const AD = '<div data-ad-placement="free_trip_after_action_checklist"></div>'
const RIGHTS = '<section class="dp-card dpp-rights"><h3>Passenger rights</h3></section>'
const ACTIONS = '<section class="dp-card dpp-actions"><h3>Action checklist</h3></section>'
const WARNING =
  '<div class="dpp-state" data-state="provider_unavailable"><div class="dp-callout">' +
  '<p class="dp-callout__title">Provider unavailable</p>REPLACE' +
  '<div class="dp-callout__action"><a href="/">Retry</a></div></div></div>'

const SELF_TESTS = [
  {
    name: 'ad above the primary search',
    run: () => findAdPositionViolations(`${AD}${LOOKUP_FORM}`),
    expect: /BEFORE the primary lookup form/,
  },
  {
    name: 'ad inside a form',
    run: () => findAdPositionViolations(`<form data-dp-lookup>${AD}</form>`),
    expect: /inside a <form>/,
  },
  {
    name: 'ad inside a rights card',
    run: () =>
      findAdPositionViolations(
        `${LOOKUP_FORM}<section class="dp-card dpp-rights"><section>x</section>${AD}</section>`,
      ),
    expect: /inside a rights card/,
  },
  {
    name: 'ad inside an action checklist',
    run: () =>
      findAdPositionViolations(
        `${LOOKUP_FORM}<section class="dp-card dpp-actions">${AD}</section>`,
      ),
    expect: /inside an action checklist/,
  },
  {
    name: 'ad between a warning and its action',
    run: () => findAdPositionViolations(`${LOOKUP_FORM}${WARNING.replace('REPLACE', AD)}`),
    expect: /between a warning and its action/,
  },
  {
    name: 'ad adjacent to a rights card',
    run: () => findAdPositionViolations(`${LOOKUP_FORM}${RIGHTS}\n  ${AD}`),
    expect: /adjacent to a rights card/,
  },
  {
    name: 'ad adjacent to an action checklist',
    run: () => findAdPositionViolations(`${LOOKUP_FORM}${ACTIONS}\n${AD}`),
    expect: /adjacent to an action checklist/,
  },
  {
    name: 'a permitted ad position produces no finding',
    run: () =>
      findAdPositionViolations(
        `${LOOKUP_FORM}${ACTIONS}<section class="dpx-separator"><p>Advertisement</p></section>` +
          `<section class="dpx-ad">${AD}</section>`,
      ),
    expect: null,
  },
  {
    name: 'a bare Demo chip with no sentence in its panel',
    run: () =>
      collect((f) =>
        checkDemoCaptions(
          f,
          '<section><h3>Overall status</h3><span data-provenance="demo">Demo</span></section>',
        ),
      ),
    expect: /does not contain/,
  },
  {
    name: 'a Demo chip whose panel carries the sentence',
    run: () =>
      collect((f) =>
        checkDemoCaptions(
          f,
          `<section><span data-provenance="demo">Demo</span><p>${DEMO_SENTENCE}</p></section>`,
        ),
      ),
    expect: null,
  },
  {
    name: 'a legend Demo chip with no meaning beside it',
    run: () =>
      collect((f) =>
        checkDemoCaptions(
          f,
          '<ul data-provenance-legend><li><span data-provenance="demo">Demo</span></li></ul>',
        ),
      ),
    expect: /provenanceMeanings\.demo/,
  },
  {
    name: 'a §26 sentence with a curly apostrophe',
    run: () =>
      collect((f) =>
        checkFixedSentences(
          f,
          // The curly apostrophe is written as an escape, so this file itself stays ASCII and the
          // repository-wide smart-quote sweep does not have to carve out an exception for its own
          // guard (`docs/VOICE.md §11`).
          `<p>${disclaimers.rights.replace("regulator's", 'regulator\u2019s')}</p>`,
        ),
      ),
    expect: /altered characters/,
  },
  {
    name: 'a §26 sentence transcribed exactly',
    run: () => collect((f) => checkFixedSentences(f, `<p>${disclaimers.rights}</p>`)),
    expect: null,
  },
  {
    name: 'two runs of text joined with no space',
    run: () =>
      collect((f) =>
        checkInlineJoins(f, '<p><strong>No booking code required.</strong>A flight number.</p>'),
      ),
    expect: /joined with no space/,
  },
  {
    name: 'a block-level element between two runs of text',
    run: () =>
      collect((f) =>
        checkInlineJoins(
          f,
          '<p><span class="dpx-article__answer-label">The short answer</span>DelayPilot reports.</p>',
        ),
      ),
    expect: null,
  },
]

/** Run `body` with a private findings list, and return what it reported. */
function collect(body) {
  const saved = findings.splice(0, findings.length)
  body('self-test')
  const produced = findings.splice(0, findings.length)
  findings.push(...saved)
  return produced
}

function selfTest() {
  let failed = 0
  for (const { name, run, expect } of SELF_TESTS) {
    const produced = run()
    const matched = expect === null ? produced.length === 0 : produced.some((f) => expect.test(f))
    if (!matched) {
      failed += 1
      console.error(
        `  x ${name}\n      expected ${expect === null ? 'no finding' : expect} but got ` +
          `${produced.length === 0 ? 'nothing' : JSON.stringify(produced)}`,
      )
    } else {
      console.log(`  . ${name}`)
    }
  }

  if (failed > 0) {
    console.error(`\nverify-dist --self-test: ${failed} check(s) did not behave as specified.\n`)
    process.exit(1)
  }
  console.log(`verify-dist --self-test: ${SELF_TESTS.length} check(s) behave as specified.`)
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
    checkDataUris(label, source)
    checkManifestLink(label, source)
    checkText(label, source, routes)
    checkAdPlacement(label, route, source)
    checkDemoCaptions(label, source)
    checkFixedSentences(label, source)
    checkInlineJoins(label, source)
  }

  for (const file of files.filter((entry) => entry.endsWith('.css'))) {
    checkDataUris(relative(DIST, file), await readFile(file, 'utf8'))
  }

  if (findings.length > 0) {
    console.error(`verify-dist: ${findings.length} finding(s).\n`)
    for (const finding of findings) console.error(`  · ${finding}`)
    console.error('')
    process.exit(1)
  }

  console.log(
    `verify-dist: ${html.length} page(s) and ${scripts.length} chunk(s) checked, 0 findings.\n` +
      `  Held to the policy served by apps/web/public/_headers:\n    ${SERVED_POLICY}\n` +
      `  No inline script or style and no data: URI, so that policy needs no additional source.`,
  )
}

if (process.argv.includes('--self-test')) selfTest()
else await main()
