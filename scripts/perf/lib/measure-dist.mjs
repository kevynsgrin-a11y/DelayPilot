/**
 * measure-dist.mjs — turn `apps/web/dist` into a measured resource graph.
 *
 * Every number this module produces comes from reading the built files. Nothing is estimated,
 * inherited from a document, or carried forward from a previous session: a figure quoted in a
 * markdown file is not a measurement, and a budget asserted against one would be a fabricated
 * value in a different costume (`AGENTS.md §1.1`).
 *
 * WIRE MODEL
 * ----------
 * `wireBytes` for a file is:
 *   - gzip level 9 of its contents, for content types a CDN compresses (html, css, js, svg,
 *     json, txt, xml, webmanifest);
 *   - its byte length unchanged, for content types a CDN does not re-encode (woff2 carries brotli
 *     inside the format; png / webp / avif / ico are already compressed).
 *
 * gzip level 9 is the unit because `.claude/agents/performance-engineer.md:80-85` states every
 * budget in gzipped kilobytes, because it is reproducible from the Node standard library with no
 * pinned tool, and because it is an upper bound on brotli, which is what a browser negotiating
 * `br` actually receives. Brotli quality 11 is measured alongside and reported, never gated.
 *
 * `wireBytes` is a PAYLOAD size. Lighthouse's `transferSize` additionally includes response
 * headers — about 600 bytes per response with the `_headers` security policy attached — so a
 * Lighthouse network total reads higher than this model by roughly (requests × header bytes).
 * `scripts/perf/lighthouse.mjs` reconciles the two and reports the residual, which is how the
 * model stays honest rather than merely self-consistent.
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join, extname, relative, posix, dirname, resolve } from 'node:path'
import { gzipSync, brotliCompressSync, constants as zlibConstants } from 'node:zlib'

/** Content types a CDN compresses on the wire. Mirrors `COMPRESSIBLE_EXTENSIONS` in serve-dist.mjs. */
const COMPRESSIBLE = new Set([
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.json',
  '.map',
  '.svg',
  '.txt',
  '.xml',
  '.webmanifest',
])

const KIND_BY_EXT = {
  '.html': 'document',
  '.css': 'css',
  '.js': 'js',
  '.mjs': 'js',
  '.woff2': 'font',
  '.woff': 'font',
  '.ttf': 'font',
  '.otf': 'font',
  '.png': 'image',
  '.jpg': 'image',
  '.jpeg': 'image',
  '.webp': 'image',
  '.avif': 'image',
  '.gif': 'image',
  '.svg': 'image',
  '.ico': 'image',
  '.webmanifest': 'manifest',
  '.json': 'data',
  '.xml': 'data',
  '.txt': 'data',
}

export function wireBytes(buffer, ext) {
  return COMPRESSIBLE.has(ext) ? gzipSync(buffer, { level: 9 }).length : buffer.length
}

export function brotliBytes(buffer, ext) {
  return COMPRESSIBLE.has(ext)
    ? brotliCompressSync(buffer, {
        params: {
          [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
          [zlibConstants.BROTLI_PARAM_SIZE_HINT]: buffer.length,
        },
      }).length
    : buffer.length
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.isFile()) out.push(full)
  }
  return out
}

/** `dist/index.html` -> `/`, `dist/guides/x/index.html` -> `/guides/x/`, `dist/404.html` -> `/404.html`. */
export function routeForHtmlFile(distRelative) {
  const unix = distRelative.split(/[\\/]/).join('/')
  if (unix === 'index.html') return '/'
  if (unix.endsWith('/index.html')) return '/' + unix.slice(0, -'index.html'.length)
  return '/' + unix
}

const ATTR = (source, name) => {
  const match = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(source)
  if (!match) return null
  return match[2] ?? match[3] ?? match[4] ?? ''
}
const HAS_ATTR = (source, name) => new RegExp(`\\b${name}\\b`, 'i').test(source)

/**
 * Pull every same-origin subresource reference out of one HTML document.
 * Returns references in document order with enough context to classify fetch priority.
 */
export function parseDocumentReferences(html) {
  const head = html.split(/<\/head>/i)[0] ?? ''
  const refs = []
  const inlineScripts = []
  const inlineStyles = []

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0]
    const rel = (ATTR(tag, 'rel') ?? '').toLowerCase()
    const href = ATTR(tag, 'href')
    if (!href) continue
    refs.push({
      tag: 'link',
      rel,
      href,
      as: (ATTR(tag, 'as') ?? '').toLowerCase(),
      media: ATTR(tag, 'media'),
      inHead: match.index < head.length,
    })
  }

  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = match[1]
    const body = match[2]
    const src = ATTR(attrs, 'src')
    const type = (ATTR(attrs, 'type') ?? '').toLowerCase()
    if (src) {
      refs.push({
        tag: 'script',
        href: src,
        module: type === 'module',
        defer: HAS_ATTR(attrs, 'defer'),
        async: HAS_ATTR(attrs, 'async'),
        inHead: match.index < head.length,
      })
    } else if (body.trim() !== '') {
      inlineScripts.push({ type, bytes: Buffer.byteLength(body, 'utf8') })
    }
  }

  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    inlineStyles.push({ bytes: Buffer.byteLength(match[1], 'utf8') })
  }

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]
    const src = ATTR(tag, 'src')
    if (src) {
      refs.push({
        tag: 'img',
        href: src,
        loading: (ATTR(tag, 'loading') ?? '').toLowerCase(),
        width: ATTR(tag, 'width'),
        height: ATTR(tag, 'height'),
        inHead: false,
      })
    }
    for (const candidate of (ATTR(tag, 'srcset') ?? '').split(',')) {
      const url = candidate.trim().split(/\s+/)[0]
      if (url) refs.push({ tag: 'img-srcset', href: url, inHead: false })
    }
  }

  const islands = (html.match(/<astro-island\b/gi) ?? []).length
  const styleAttributes = (html.match(/\sstyle\s*=\s*["']/gi) ?? []).length

  return { refs, inlineScripts, inlineStyles, islands, styleAttributes }
}

/** `url(...)` references inside a stylesheet, excluding fragment-only and data URLs. */
export function parseStylesheetReferences(css) {
  const out = []
  for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi)) {
    const raw = (match[1] ?? match[2] ?? match[3] ?? '').trim()
    if (!raw || raw.startsWith('#') || raw.startsWith('data:')) continue
    out.push(raw)
  }
  return out
}

function isSameOriginPath(href) {
  if (!href) return false
  if (href.startsWith('data:') || href.startsWith('#') || href.startsWith('mailto:')) return false
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false
  if (href.startsWith('//')) return false
  return true
}

function resolveHref(routePath, href) {
  const withoutQuery = href.split(/[?#]/)[0]
  if (withoutQuery.startsWith('/')) return withoutQuery
  return posix.resolve(posix.dirname(posix.join(routePath, 'index.html')), withoutQuery)
}

/**
 * Discretionary references: the browser may or may not fetch them on a page load, and none of
 * them is on the path to first paint. They are measured and reported but kept out of the
 * critical-path total so the critical-path number means one thing only.
 */
const DISCRETIONARY_RELS = new Set(['icon', 'shortcut icon', 'apple-touch-icon', 'manifest'])

export function measureDist(distDir) {
  const dist = resolve(distDir)
  const files = new Map()
  for (const absolute of walk(dist)) {
    const rel = relative(dist, absolute)
    const ext = extname(rel).toLowerCase()
    const buffer = readFileSync(absolute)
    files.set('/' + rel.split(/[\\/]/).join('/'), {
      path: '/' + rel.split(/[\\/]/).join('/'),
      ext,
      kind: KIND_BY_EXT[ext] ?? 'other',
      rawBytes: buffer.length,
      wireBytes: wireBytes(buffer, ext),
      brotliBytes: brotliBytes(buffer, ext),
      buffer,
    })
  }

  const routes = []
  for (const [path, file] of files) {
    if (file.ext !== '.html') continue
    const html = file.buffer.toString('utf8')
    const route = routeForHtmlFile(path.slice(1))
    const parsed = parseDocumentReferences(html)

    const resources = []
    const seen = new Set()
    const add = (target, role, meta = {}) => {
      if (!files.has(target) || seen.has(target + role)) return
      seen.add(target + role)
      const f = files.get(target)
      resources.push({
        path: target,
        kind: f.kind,
        role,
        rawBytes: f.rawBytes,
        wireBytes: f.wireBytes,
        brotliBytes: f.brotliBytes,
        ...meta,
      })
    }

    let renderBlocking = 0
    const missing = []

    for (const ref of parsed.refs) {
      if (!isSameOriginPath(ref.href)) continue
      const target = resolveHref(route, ref.href)
      if (!files.has(target)) {
        missing.push({ href: ref.href, resolved: target, tag: ref.tag })
        continue
      }
      if (ref.tag === 'link' && ref.rel === 'stylesheet') {
        const blocking = !ref.media || ref.media === 'all' || ref.media === 'screen'
        if (blocking && ref.inHead) renderBlocking += 1
        add(target, 'critical', { why: 'stylesheet', renderBlocking: blocking && ref.inHead })
        for (const cssRef of parseStylesheetReferences(files.get(target).buffer.toString('utf8'))) {
          const cssTarget = cssRef.startsWith('/')
            ? cssRef.split(/[?#]/)[0]
            : posix.resolve(posix.dirname(target), cssRef.split(/[?#]/)[0])
          if (files.has(cssTarget) && files.get(cssTarget).kind !== 'font') {
            add(cssTarget, 'discretionary', { why: 'stylesheet url()' })
          }
        }
      } else if (ref.tag === 'link' && ref.rel === 'preload') {
        add(target, 'critical', { why: `preload as=${ref.as || 'unspecified'}`, preload: true })
      } else if (ref.tag === 'link' && DISCRETIONARY_RELS.has(ref.rel)) {
        add(target, 'discretionary', { why: `link rel=${ref.rel}` })
      } else if (ref.tag === 'script') {
        // A classic script in <head> with neither defer nor async blocks the parser.
        const blocking = ref.inHead && !ref.module && !ref.defer && !ref.async
        if (blocking) renderBlocking += 1
        add(target, 'critical', {
          why: ref.module ? 'module script' : 'classic script',
          renderBlocking: blocking,
        })
      } else if (ref.tag === 'img' || ref.tag === 'img-srcset') {
        add(target, ref.loading === 'lazy' ? 'discretionary' : 'critical', {
          why: 'image',
          lazy: ref.loading === 'lazy',
          dimensioned: Boolean(ref.width && ref.height),
        })
      }
    }

    const critical = resources.filter((r) => r.role === 'critical')
    const discretionary = resources.filter((r) => r.role === 'discretionary')
    const sum = (list, key) => list.reduce((total, item) => total + item[key], 0)

    routes.push({
      route,
      file: path,
      documentRawBytes: file.rawBytes,
      documentWireBytes: file.wireBytes,
      documentBrotliBytes: file.brotliBytes,
      criticalPathWireBytes: file.wireBytes + sum(critical, 'wireBytes'),
      criticalPathBrotliBytes: file.brotliBytes + sum(critical, 'brotliBytes'),
      criticalRequestCount: 1 + critical.length,
      totalRouteWireBytes:
        file.wireBytes + sum(critical, 'wireBytes') + sum(discretionary, 'wireBytes'),
      renderBlockingCount: renderBlocking,
      scriptCount: critical.filter((r) => r.kind === 'js').length,
      scriptWireBytes: sum(
        critical.filter((r) => r.kind === 'js'),
        'wireBytes',
      ),
      cssWireBytes: sum(
        critical.filter((r) => r.kind === 'css'),
        'wireBytes',
      ),
      fontWireBytes: sum(
        critical.filter((r) => r.kind === 'font'),
        'wireBytes',
      ),
      imageWireBytes: sum(
        resources.filter((r) => r.kind === 'image' && r.why === 'image'),
        'wireBytes',
      ),
      preloadCount: critical.filter((r) => r.preload).length,
      hydratedIslands: parsed.islands,
      inlineScripts: parsed.inlineScripts,
      inlineStyles: parsed.inlineStyles,
      styleAttributes: parsed.styleAttributes,
      undimensionedImages: resources.filter((r) => r.why === 'image' && r.dimensioned === false)
        .length,
      missingReferences: missing,
      resources,
    })
  }
  routes.sort((a, b) => a.route.localeCompare(b.route))

  const all = [...files.values()]
  const byKind = (kind) => all.filter((f) => f.kind === kind)
  const sumWire = (list) => list.reduce((total, f) => total + f.wireBytes, 0)

  return {
    dist,
    routes,
    // The file buffers stay out of the returned report: they are the raw bytes of the whole
    // build, and a JSON report is meant to be read.
    files: all.map((file) =>
      Object.fromEntries(Object.entries(file).filter(([key]) => key !== 'buffer')),
    ),
    global: {
      fileCount: all.length,
      buildWireBytes: sumWire(all),
      js: {
        fileCount: byKind('js').length,
        wireBytes: sumWire(byKind('js')),
        largestWireBytes: Math.max(0, ...byKind('js').map((f) => f.wireBytes)),
        files: byKind('js')
          .map((f) => ({ path: f.path, wireBytes: f.wireBytes, rawBytes: f.rawBytes }))
          .sort((a, b) => b.wireBytes - a.wireBytes),
      },
      css: {
        fileCount: byKind('css').length,
        wireBytes: sumWire(byKind('css')),
        largestWireBytes: Math.max(0, ...byKind('css').map((f) => f.wireBytes)),
        files: byKind('css')
          .map((f) => ({ path: f.path, wireBytes: f.wireBytes, rawBytes: f.rawBytes }))
          .sort((a, b) => b.wireBytes - a.wireBytes),
      },
      fonts: {
        fileCount: byKind('font').length,
        // Fonts are never re-encoded on the wire, so raw and wire bytes are the same number.
        wireBytes: sumWire(byKind('font')),
        extensions: [...new Set(byKind('font').map((f) => f.ext))].sort(),
        files: byKind('font')
          .map((f) => ({ path: f.path, wireBytes: f.wireBytes }))
          .sort((a, b) => b.wireBytes - a.wireBytes),
      },
      images: {
        fileCount: byKind('image').length,
        wireBytes: sumWire(byKind('image')),
        largestWireBytes: Math.max(0, ...byKind('image').map((f) => f.wireBytes)),
        files: byKind('image')
          .map((f) => ({ path: f.path, wireBytes: f.wireBytes, rawBytes: f.rawBytes }))
          .sort((a, b) => b.wireBytes - a.wireBytes),
      },
      totalHydratedIslands: routes.reduce((total, r) => total + r.hydratedIslands, 0),
      totalInlineScripts: routes.reduce((total, r) => total + r.inlineScripts.length, 0),
      totalInlineStyles: routes.reduce((total, r) => total + r.inlineStyles.length, 0),
    },
  }
}

export { dirname }
