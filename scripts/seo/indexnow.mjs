#!/usr/bin/env node
/**
 * indexnow — the IndexNow key file and submitter. Owner: seo-engineer (`scripts/seo/**`).
 *
 * INERT UNTIL TWO THINGS EXIST: `INDEXNOW_KEY` in the environment and a valid `PUBLIC_SITE_URL`.
 * With either missing, every mode prints one line saying which is absent and exits 0. That is the
 * fail-closed path `AGENTS.md §1.5` asks for: no key means no submission, not a guessed one.
 *
 * NOTHING IS SUBMITTED WITHOUT `--submit`, EVER, AND NOTHING SUBMITS FROM A BUILD. The default is
 * a dry run that prints the exact payload. This script is not wired into `pnpm build` or
 * `pnpm test:seo` and must not be: a build that reaches out to a third party is a build that can
 * fail for a reason that has nothing to do with the code.
 *
 * WHAT IT MAY SUBMIT. Only URLs that are already in `apps/web/public/sitemap.xml`, which is the
 * gate's own output: a URL is in the sitemap only when the build emitted the page and the page's
 * own robots directive does not say `noindex` (`docs/SEO.md §3`). Three further filters run here
 * anyway, because a submitter that trusts its input is one bad merge away from announcing a
 * private route to every search engine: same origin, no `AGENTS.md §2` private prefix, and no path
 * segment shaped like a flight designator (`DIRECTIVE.md §9`, §28).
 *
 * THE KEY FILE SITS AT THE SITE ROOT, and that is a protocol requirement rather than a preference:
 * IndexNow scopes a key file to its own directory, so a key served from `/.well-known/` would
 * authorize only URLs under `/.well-known/`. The file is named after the key, contains the key and
 * nothing else, and is written by `--write-key` into `apps/web/public/` so the ordinary build
 * copies it into `dist`. It is not committed today because no key exists
 * (`docs/SEO.md §10`, activation).
 *
 * Protocol read 2026-09-20 from indexnow.org's documentation through search (the host itself is
 * unreachable from this build environment): POST `https://api.indexnow.org/indexnow`,
 * `Content-Type: application/json; charset=utf-8`, body `{ host, key, keyLocation, urlList }`, up
 * to 10,000 URLs per request, HTTP 200 on success. Key: 8 to 128 characters of a-z, A-Z, 0-9, `-`.
 *
 * Usage:
 *   node scripts/seo/indexnow.mjs               # dry run: print what would be submitted
 *   node scripts/seo/indexnow.mjs --write-key   # write apps/web/public/<key>.txt
 *   node scripts/seo/indexnow.mjs --submit      # actually submit (never from a build)
 */

import { writeFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import { normalizeSiteUrl } from '../../apps/web/src/lib/seo/site-url.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const PUBLIC = join(repoRoot, 'apps/web/public')
const ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URLS = 10_000
const KEY_SHAPE = /^[A-Za-z0-9-]{8,128}$/
const PRIVATE_PREFIXES = ['/app/', '/auth/', '/checkout/', '/admin/']
const FLIGHT_DESIGNATOR = /^[a-z]{2}\d{1,4}$/

const wantsKeyFile = process.argv.includes('--write-key')
const wantsSubmit = process.argv.includes('--submit')

const key = process.env['INDEXNOW_KEY']
const site = normalizeSiteUrl(process.env['PUBLIC_SITE_URL'])

if (key === undefined || key.trim() === '') {
  console.log(
    'indexnow: INDEXNOW_KEY is not set, so there is nothing to submit and no key file to write. ' +
      'This is the designed inert state (docs/SEO.md §10); it is not an error.',
  )
  process.exit(0)
}

if (!KEY_SHAPE.test(key.trim())) {
  console.error(
    `indexnow: INDEXNOW_KEY is not a valid key. IndexNow requires 8 to 128 characters of a-z, ` +
      `A-Z, 0-9 or "-"; the configured value is ${key.trim().length} character(s).`,
  )
  process.exit(1)
}

if (!site.ok) {
  console.log(
    `indexnow: ${site.message} IndexNow submits absolute URLs on one host and verifies a key file ` +
      `on that same host, so there is nothing to submit until the origin is configured. Exiting ` +
      `without submitting.`,
  )
  process.exit(0)
}

const origin = site.origin
const trimmedKey = key.trim()
const keyFileName = `${trimmedKey}.txt`
const keyLocation = `${origin}/${keyFileName}`

if (wantsKeyFile) {
  const path = join(PUBLIC, keyFileName)
  writeFileSync(path, `${trimmedKey}\n`, 'utf8')
  console.log(
    `indexnow: wrote ${path}. It is served at ${keyLocation} by the ordinary build, which copies ` +
      `apps/web/public verbatim. Commit it, or keep it untracked and write it in CI before deploy.`,
  )
}

const sitemapXml = await readFile(join(PUBLIC, 'sitemap.xml'), 'utf8')
const locations = [
  ...sitemapXml.replace(/<!--[\s\S]*?-->/g, '').matchAll(/<loc>([\s\S]*?)<\/loc>/g),
].map((match) => match[1].trim())

const refused = []
const urlList = []
for (const loc of locations) {
  let url
  try {
    url = new URL(loc)
  } catch {
    refused.push([loc, 'not an absolute URL'])
    continue
  }
  if (url.origin !== origin) {
    refused.push([loc, `origin ${url.origin} is not ${origin}`])
    continue
  }
  if (PRIVATE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) {
    refused.push([loc, 'private route (AGENTS.md §2)'])
    continue
  }
  if (url.pathname.split('/').some((segment) => FLIGHT_DESIGNATOR.test(segment))) {
    refused.push([loc, 'flight instance (DIRECTIVE.md §9)'])
    continue
  }
  urlList.push(url.href)
}

for (const [loc, why] of refused) console.error(`indexnow: refusing ${loc} — ${why}.`)

if (urlList.length === 0) {
  console.log('indexnow: the sitemap lists no submittable URL. Nothing to do.')
  process.exit(refused.length > 0 ? 1 : 0)
}

if (urlList.length > MAX_URLS) {
  console.error(
    `indexnow: ${urlList.length} URLs exceeds the documented limit of ${MAX_URLS} per request.`,
  )
  process.exit(1)
}

const payload = { host: new URL(origin).host, key: trimmedKey, keyLocation, urlList }

if (!wantsSubmit) {
  console.log(
    `indexnow: dry run. ${urlList.length} URL(s) would be submitted to ${ENDPOINT}.\n` +
      `${JSON.stringify(payload, null, 2)}\n` +
      'Pass --submit to send it. Nothing is submitted from a build.',
  )
  process.exit(refused.length > 0 ? 1 : 0)
}

const response = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
})

if (!response.ok) {
  console.error(
    `indexnow: ${ENDPOINT} answered ${response.status} ${response.statusText}. ` +
      `${urlList.length} URL(s) were not accepted.`,
  )
  process.exit(1)
}

console.log(
  `indexnow: submitted ${urlList.length} URL(s); ${ENDPOINT} answered ${response.status}.`,
)
process.exit(refused.length > 0 ? 1 : 0)
