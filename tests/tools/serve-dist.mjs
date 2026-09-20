/**
 * Static server for a built `apps/web` output that applies the REAL response headers.
 *
 * Owner: qa-test-architect (`docs/agents/ROSTER.md §3`).
 *
 * WHY THIS EXISTS RATHER THAN `astro preview` OR A PLAIN FILE SERVER.
 * The single most valuable property of every browser check in this repository is that it runs under
 * the Content-Security-Policy the site actually serves. That policy lives in
 * `apps/web/public/_headers` — a Cloudflare directive file that Cloudflare parses and never serves,
 * so a naive static server drops it and every page loads with no CSP at all. A suite that measured
 * a page with no policy would pass on a build whose scripts the deployed site refuses to run.
 *
 * So the `/*` block of `_headers` is parsed here and replayed on every response. The policy is READ,
 * never restated: `apps/web/public/_headers` is `seo-engineer`'s file, and a copy of its CSP in this
 * directory would be a second source of truth that drifts silently.
 *
 * Usage (standalone):   node tests/tools/serve-dist.mjs [port] [distDir] [headersFile]
 * Usage (in-process):   import { startServer } from './serve-dist.mjs'
 *
 * Ports: the QA harnesses use 4500–4599 so they never collide with `performance-engineer`'s
 * measurements or a developer's `astro dev` on 4321.
 */
import { createServer } from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = fileURLToPath(new URL('.', import.meta.url))
export const REPO_ROOT = resolve(HERE, '../..')

/**
 * The build under test.
 *
 * `apps/web/dist` by default — the output `pnpm build` produces and CI measures. `DP_DIST` points
 * every harness at a different directory instead, and the reason it exists is not convenience:
 * other agents rebuild `apps/web/dist` IN PLACE while these suites run, and a sweep that globs a
 * directory mid-rebuild finds a truncated page, or no page at all, and reports something that is
 * not a fact about the product. Snapshot the build, export `DP_DIST`, measure the snapshot.
 */
export const DEFAULT_DIST = resolve(process.env['DP_DIST'] ?? resolve(REPO_ROOT, 'apps/web/dist'))
export const DEFAULT_HEADERS = resolve(REPO_ROOT, 'apps/web/public/_headers')

/**
 * Parse the `/*` catch-all block of a Cloudflare `_headers` file.
 *
 * Cloudflare's format: an unindented line is a path pattern, indented lines under it are that
 * pattern's headers. Only the catch-all block is replayed, because that is the block that carries
 * the security policy every HTML page is served with.
 *
 * @param {string} text
 * @returns {[string, string][]}
 */
export function parseCatchAllHeaders(text) {
  /** @type {[string, string][]} */
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
    if (match !== null) out.push([match[1], match[2].trim()])
  }
  return out
}

/**
 * The served Content-Security-Policy, read from `_headers`.
 *
 * @param {string} [headersFile]
 * @returns {string}
 */
export function servedPolicy(headersFile = DEFAULT_HEADERS) {
  const entry = parseCatchAllHeaders(readFileSync(headersFile, 'utf8')).find(
    ([name]) => name.toLowerCase() === 'content-security-policy',
  )
  if (entry === undefined) {
    throw new Error(
      `${headersFile} carries no Content-Security-Policy in its /* block. The browser suites exist ` +
        'to hold pages to the served policy; running them without one would report a false green.',
    )
  }
  return entry[1]
}

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.webmanifest': 'application/manifest+json',
}

/**
 * Start the server.
 *
 * @param {{ port?: number, dist?: string, headersFile?: string }} [options]
 * @returns {Promise<{ origin: string, port: number, close: () => Promise<void> }>}
 */
export function startServer(options = {}) {
  const dist = resolve(options.dist ?? DEFAULT_DIST)
  /*
   * The headers file is taken from INSIDE the build by default. Astro copies `public/**` into
   * `dist`, so `dist/_headers` is the byte Cloudflare will parse — and when a suite measures a
   * snapshot or a scratch outDir, its own `_headers` is the one that belongs to it. Falling back to
   * `apps/web/public/_headers` keeps the standalone case working for a dist that predates the copy.
   */
  const headersFile = resolve(
    options.headersFile ??
      (existsSync(join(dist, '_headers')) ? join(dist, '_headers') : DEFAULT_HEADERS),
  )
  if (!existsSync(dist)) {
    throw new Error(
      `${dist} does not exist. Build first (\`pnpm build\`, or \`astro build --outDir <scratch>\`); ` +
        'these suites measure a real build and never a dev server.',
    )
  }
  const extra = parseCatchAllHeaders(readFileSync(headersFile, 'utf8'))

  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    const path = decodeURIComponent(url.pathname)
    let file = join(dist, path)
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html')
    else if (!existsSync(file) && extname(path) === '') file = join(dist, path, 'index.html')

    let status = 200
    if (!existsSync(file)) {
      status = 404
      file = join(dist, '404.html')
    }
    if (!existsSync(file)) {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('404')
      return
    }

    const body = readFileSync(file)
    /** @type {Record<string, string | number>} */
    const headers = {
      'content-type': CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
      'content-length': body.length,
    }
    for (const [name, value] of extra) headers[name] = value
    res.writeHead(status, headers)
    res.end(body)
  })

  return new Promise((resolveStarted, rejectStarted) => {
    server.once('error', rejectStarted)
    const port = options.port ?? 4520
    server.listen(port, '127.0.0.1', () => {
      resolveStarted({
        origin: `http://127.0.0.1:${port}`,
        port,
        close: () =>
          new Promise((done) => {
            server.close(() => {
              done(undefined)
            })
          }),
      })
    })
  })
}

/* Standalone entry point, so Playwright's `webServer` and a human can start the same server. */
if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.argv[2] ?? 4520)
  const dist = process.argv[3] ?? DEFAULT_DIST
  const headersFile = process.argv[4] ?? DEFAULT_HEADERS
  const started = await startServer({ port, dist, headersFile })
  const count = parseCatchAllHeaders(readFileSync(headersFile, 'utf8')).length
  console.log(`serve-dist: ${dist} on ${started.origin} with ${count} header(s) from _headers`)
}
