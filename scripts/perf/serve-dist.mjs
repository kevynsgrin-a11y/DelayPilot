#!/usr/bin/env node
/**
 * serve-dist.mjs — serve `apps/web/dist` under the response headers the site actually ships,
 * so a Lighthouse or Playwright measurement is taken against the site we deploy rather than a
 * bare static server.
 *
 * WHY THIS EXISTS IN `scripts/perf/**` RATHER THAN BEING BORROWED
 * ---------------------------------------------------------------
 * The S3 session used a throwaway server in its scratchpad. A gate cannot depend on a scratchpad:
 * the directory is session-scoped and is gone on the next machine. `pnpm perf:lighthouse` has to
 * run from a clean clone, so the server lives here. It reproduces the scratchpad tool's behaviour
 * (verified byte-for-byte on the `/*` header block, 2026-09-20) and adds the one thing a CDN does
 * that the scratchpad tool did not: content encoding.
 *
 * THE HEADER POLICY IS NOT RESTATED HERE. It is parsed out of `apps/web/public/_headers`, which is
 * the single source for the static-asset policy (`apps/web/public/_headers` documents why it and
 * `apps/edge/src/index.ts` carry the same policy twice, and `scripts/validate-security-headers.mjs`
 * fails on drift between them). If the CSP changes there, this server serves the changed CSP with
 * no edit here. Adding a header to this file instead of to `_headers` would measure a site we do
 * not ship — the exact failure this server exists to prevent.
 *
 * COMPRESSION
 * -----------
 * `--compress=auto` (default) negotiates `content-encoding` from `Accept-Encoding` — brotli, then
 * gzip, then identity — for text content types only, and never for `woff2`, `png`, `ico` or
 * `webp`, which carry their own compression and which no CDN re-encodes. This models the platform
 * behaviour, not a DelayPilot setting: no file in this repository turns compression on, and the
 * live site could not be probed from this environment to confirm it (egress to `delaypilot.app` is
 * refused by the proxy with `CONNECT` 403, the same block recorded in `docs/BUILD_PLAN.md §10`).
 * `--compress=none` serves identity bytes and is the platform-independent worst case. Both
 * conditions are measured and both are recorded in `docs/PERFORMANCE.md`; the gate runs the one
 * that file names.
 *
 * `Cache-Control` is deliberately NOT synthesised. No file in this repository declares one for a
 * static asset, so the measurement shows the real, missing policy and Lighthouse's
 * `uses-long-cache-ttl` diagnostic reports it. Inventing a cache header here would hide a finding.
 *
 * Usage:
 *   node scripts/perf/serve-dist.mjs [--port 4610] [--dist <dir>] [--headers <file>]
 *                                    [--compress auto|none] [--quiet]
 */

import { createServer } from 'node:http'
import { readFileSync, existsSync, statSync } from 'node:fs'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync, brotliCompressSync, constants as zlibConstants } from 'node:zlib'

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..', '..')

export const DEFAULT_DIST = join(REPO, 'apps', 'web', 'dist')
export const DEFAULT_HEADERS = join(REPO, 'apps', 'web', 'public', '_headers')

/** Content types by extension. Anything unlisted is served as an opaque binary stream. */
const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.map': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
}

/**
 * Extensions a CDN compresses on the wire. Everything else already carries its own compression
 * (woff2 is brotli-wrapped by the format itself; png/webp/avif/ico are compressed image formats)
 * and re-encoding them costs CPU for nothing or makes them bigger.
 */
export const COMPRESSIBLE_EXTENSIONS = new Set([
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

/**
 * Parse the `/*` block of a Cloudflare `_headers` file. Indented `Name: value` lines under a
 * non-indented `/*` path line are the catch-all block; every other block is ignored, because
 * nothing else in that file applies to a page today.
 */
export function parseCatchAllHeaders(text) {
  const out = []
  let inCatchAll = false
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\r$/, '')
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue
    if (!/^\s/.test(line)) {
      inCatchAll = line.trim() === '/*'
      continue
    }
    if (!inCatchAll) continue
    const match = /^\s+([A-Za-z0-9-]+):\s*(.+)$/.exec(line)
    if (match) out.push([match[1], match[2].trim()])
  }
  return out
}

function pickEncoding(acceptEncoding, ext, mode) {
  if (mode === 'none') return null
  if (!COMPRESSIBLE_EXTENSIONS.has(ext)) return null
  const accepted = String(acceptEncoding ?? '')
    .split(',')
    .map((part) => part.split(';')[0].trim().toLowerCase())
    .filter(Boolean)
  if (accepted.includes('br')) return 'br'
  if (accepted.includes('gzip')) return 'gzip'
  return null
}

function encode(buffer, encoding) {
  if (encoding === 'br') {
    return brotliCompressSync(buffer, {
      params: {
        [zlibConstants.BROTLI_PARAM_QUALITY]: 11,
        [zlibConstants.BROTLI_PARAM_SIZE_HINT]: buffer.length,
      },
    })
  }
  if (encoding === 'gzip') return gzipSync(buffer, { level: 9 })
  return buffer
}

/**
 * Resolve a request path to a file inside `dist`, exactly as a static host does:
 * a directory becomes its `index.html`, an extensionless path becomes `<path>/index.html`,
 * and anything unresolved becomes `404.html` with a 404 status.
 * Paths that escape `dist` are refused.
 */
export function resolveRequestPath(dist, pathname) {
  const decoded = decodeURIComponent(pathname)
  const candidate = resolve(join(dist, decoded))
  if (candidate !== dist && !candidate.startsWith(dist + '/')) {
    return { status: 403, file: null }
  }
  let file = candidate
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
  else if (!existsSync(file) && !extname(decoded)) file = join(candidate, 'index.html')
  if (existsSync(file) && statSync(file).isFile()) return { status: 200, file }
  const notFound = join(dist, '404.html')
  return { status: 404, file: existsSync(notFound) ? notFound : null }
}

export function createDistServer({
  dist = DEFAULT_DIST,
  headersFile = DEFAULT_HEADERS,
  compress = 'auto',
} = {}) {
  const distRoot = resolve(dist)
  const extraHeaders = existsSync(headersFile)
    ? parseCatchAllHeaders(readFileSync(headersFile, 'utf8'))
    : []
  const cache = new Map()

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const { status, file } = resolveRequestPath(distRoot, url.pathname)
    if (!file) {
      res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' })
      res.end(status === 403 ? 'Forbidden' : 'Not Found')
      return
    }
    const ext = extname(file)
    const encoding = pickEncoding(req.headers['accept-encoding'], ext, compress)
    const key = `${file}::${encoding ?? 'identity'}`
    let body = cache.get(key)
    if (!body) {
      body = encode(readFileSync(file), encoding)
      cache.set(key, body)
    }
    const headers = {
      'content-type': CONTENT_TYPES[ext] ?? 'application/octet-stream',
      'content-length': body.length,
    }
    if (encoding) {
      headers['content-encoding'] = encoding
      headers.vary = 'accept-encoding'
    } else if (COMPRESSIBLE_EXTENSIONS.has(ext) && compress !== 'none') {
      headers.vary = 'accept-encoding'
    }
    for (const [name, value] of extraHeaders) headers[name] = value
    res.writeHead(status, headers)
    if (req.method === 'HEAD') res.end()
    else res.end(body)
  })

  return { server, headerCount: extraHeaders.length, dist: distRoot }
}

/** Start the server and resolve once it is listening. Port 0 picks a free port. */
export async function startDistServer(options = {}) {
  const { server, headerCount, dist } = createDistServer(options)
  const port = options.port ?? 0
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen)
    server.listen(port, '127.0.0.1', resolveListen)
  })
  const address = server.address()
  const actualPort = typeof address === 'object' && address ? address.port : port
  return {
    port: actualPort,
    origin: `http://127.0.0.1:${actualPort}`,
    headerCount,
    dist,
    async close() {
      await new Promise((done) => server.close(() => done()))
    },
  }
}

function parseArgs(argv) {
  const out = { port: 4610, compress: 'auto', quiet: false }
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    const next = () => argv[(i += 1)]
    if (arg === '--port') out.port = Number(next())
    else if (arg === '--dist') out.dist = next()
    else if (arg === '--headers') out.headersFile = next()
    else if (arg === '--compress') out.compress = next()
    else if (arg === '--quiet') out.quiet = true
    else if (arg.startsWith('--')) {
      console.error(`serve-dist: unknown option ${arg}`)
      process.exit(2)
    }
  }
  if (out.compress !== 'auto' && out.compress !== 'none') {
    console.error(`serve-dist: --compress must be "auto" or "none", got "${out.compress}"`)
    process.exit(2)
  }
  return out
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
if (invokedDirectly) {
  const args = parseArgs(process.argv.slice(2))
  const handle = await startDistServer(args)
  if (!args.quiet) {
    console.log(
      `serve-dist: ${handle.dist} on ${handle.origin} — ${handle.headerCount} header(s) from _headers, compress=${args.compress}`,
    )
  }
}
