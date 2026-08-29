#!/usr/bin/env node
/**
 * Security-header parity check.
 *
 * DelayPilot serves responses from two places, and Cloudflare gives them two different header
 * mechanisms:
 *
 *   - Static assets (every pre-rendered HTML page) are served straight from the edge asset cache
 *     without invoking the Worker, because wrangler.jsonc lists selective `run_worker_first`
 *     prefixes. Their headers come from apps/web/public/_headers.
 *   - Worker-generated responses (/api/*, and the residual ASSETS fallthrough) never see the
 *     _headers file at all. Their headers come from the middleware in apps/edge/src/index.ts.
 *
 * So the same policy has to be written twice, and a change to one is silent in the other: an
 * engineer tightening the CSP on the API would leave every HTML page on the old policy, and the
 * site would look protected while being half-protected. Nothing else in the toolchain would notice.
 *
 * This script fails the build when the two disagree. It is deliberately dumb — string comparison
 * after whitespace normalization, no CSP semantics — because its job is to catch drift, not to
 * judge whether the policy is good.
 *
 * Run: node scripts/validate-security-headers.mjs
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const HEADERS_FILE = 'apps/web/public/_headers'
const WORKER_FILE = 'apps/edge/src/index.ts'

/** Headers that must be identical in both places. Ordering and casing are not significant. */
const REQUIRED = [
  'content-security-policy',
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
]

const errors = []
const normalize = (value) => value.trim().replace(/\s+/g, ' ')

/**
 * Parse the `/*` catch-all block of a Cloudflare _headers file. Comment lines and other path
 * blocks are ignored; only the site-wide block is compared, since that is the one the Worker
 * middleware is the counterpart to.
 */
function parseHeadersFile(text) {
  const found = new Map()
  let inCatchAll = false

  for (const rawLine of text.split('\n')) {
    const line = rawLine.replace(/\r$/, '')
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue

    // A non-indented line starts a new path block.
    if (!/^\s/.test(line)) {
      inCatchAll = line.trim() === '/*'
      continue
    }
    if (!inCatchAll) continue

    const match = /^\s+([A-Za-z0-9-]+):\s*(.+)$/.exec(line)
    if (match) found.set(match[1].toLowerCase(), normalize(match[2]))
  }
  return found
}

/**
 * Extract the SECURITY_HEADERS object literal from the Worker source.
 *
 * Values may be written as adjacent string literals joined by `+` (prettier splits the CSP that
 * way to stay inside printWidth), so every quoted segment of an entry is concatenated before
 * comparison.
 */
function parseWorkerFile(text) {
  const start = text.indexOf('const SECURITY_HEADERS')
  if (start === -1) {
    errors.push(`${WORKER_FILE}: could not find a SECURITY_HEADERS declaration.`)
    return new Map()
  }
  const open = text.indexOf('{', start)
  const close = text.indexOf('\n}', open)
  if (open === -1 || close === -1) {
    errors.push(`${WORKER_FILE}: could not find the bounds of the SECURITY_HEADERS object.`)
    return new Map()
  }
  const body = text.slice(open + 1, close)

  const found = new Map()

  // Segments may be single- OR double-quoted: the CSP value is written in double quotes precisely
  // because it contains single quotes ('self', 'none'). Matching only one quote style silently
  // skips that entry, which would make this whole check pass while comparing nothing.
  const STRING = String.raw`'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"`
  const entry = new RegExp(String.raw`'([A-Za-z0-9-]+)':\s*((?:\s*(?:${STRING})\s*\+?)+)`, 'g')
  const segment = new RegExp(STRING, 'g')

  let m
  while ((m = entry.exec(body)) !== null) {
    const segments = m[2].match(segment) ?? []
    const value = segments.map((s) => s.slice(1, -1)).join('')
    found.set(m[1].toLowerCase(), normalize(value))
  }
  return found
}

const staticHeaders = parseHeadersFile(readFileSync(join(repoRoot, HEADERS_FILE), 'utf8'))
const workerHeaders = parseWorkerFile(readFileSync(join(repoRoot, WORKER_FILE), 'utf8'))

for (const name of REQUIRED) {
  const inStatic = staticHeaders.get(name)
  const inWorker = workerHeaders.get(name)

  if (inStatic === undefined) errors.push(`${HEADERS_FILE}: missing required header "${name}".`)
  if (inWorker === undefined) errors.push(`${WORKER_FILE}: missing required header "${name}".`)
  if (inStatic !== undefined && inWorker !== undefined && inStatic !== inWorker) {
    errors.push(
      `Header "${name}" differs between the two policies:\n` +
        `  ${HEADERS_FILE}: ${inStatic}\n` +
        `  ${WORKER_FILE}: ${inWorker}\n` +
        `  Static pages and Worker responses would disagree about what is executable.`,
    )
  }
}

if (errors.length > 0) {
  console.error('Security-header parity check FAILED:\n')
  for (const error of errors) console.error(`  - ${error}`)
  console.error(
    `\n${errors.length} error(s). Both policies must declare the same value for: ${REQUIRED.join(', ')}.`,
  )
  process.exit(1)
}

console.log(`Security-header parity check passed (${REQUIRED.length} headers, 2 policies).`)
console.log(`Compared ${HEADERS_FILE} against SECURITY_HEADERS in ${WORKER_FILE}.`)
