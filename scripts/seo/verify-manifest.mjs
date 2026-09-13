#!/usr/bin/env node
/**
 * verify-manifest — apps/web/public/manifest.webmanifest against the shipped asset set.
 *
 * Owner: seo-engineer (docs/agents/ROSTER.md §3, `scripts/seo/**`).
 *
 * WHY THIS EXISTS. The web app manifest restates, in a second file and a second syntax, facts that
 * already live in `scripts/assets/asset-manifest.mjs`: which icons exist, at what intrinsic size,
 * in what format, for which `purpose`. A restatement drifts. When it does, the failure is invisible
 * in review and invisible in the build — the installed icon is simply the wrong one, or a 404, on
 * somebody's home screen weeks later. So the manifest is DERIVED from those records and this script
 * proves the derivation still holds, rather than a reviewer reading two files side by side.
 *
 * WHAT IT CHECKS
 *   1. The file is valid JSON and an object.
 *   2. Every fixed field carries exactly the decided value (docs/SEO.md §4 records why each was
 *      chosen — in particular `display: "browser"`, because no service worker and no offline shell
 *      exist yet; a `standalone` claim without one installs a broken app).
 *   3. `icons` matches `MANIFEST_ICONS` exactly: same entries, same order, `src` = the record's
 *      served url, `sizes` = the record's intrinsic dimensions, `type` = the record's mime,
 *      `purpose` = the record's purpose, with `any` and `maskable` as SEPARATE objects and never
 *      the combined `"any maskable"` string (asset-manifest.mjs says so in the record note: a
 *      combined value lets a browser pick the maskable art for a context that does not mask it).
 *   4. Every icon `src` resolves to a file that actually exists under apps/web/public/.
 *   5. No key outside the agreed set. Screenshots, shortcuts and `related_applications` are absent
 *      on purpose: each would assert a surface or a distribution channel that does not exist
 *      (AGENTS.md §1.1, §1.6).
 *
 * Run: node scripts/seo/verify-manifest.mjs
 * Exit code is 1 on any finding.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { MANIFEST_ICONS } from '../assets/asset-manifest.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const MANIFEST_FILE = 'apps/web/public/manifest.webmanifest'
const PUBLIC_DIR = join(repoRoot, 'apps/web/public')

/** Every non-icon field, and the exact value it must carry. Decisions recorded in docs/SEO.md §4. */
const FIXED_FIELDS = {
  name: 'DelayPilot',
  short_name: 'DelayPilot',
  description: 'Stay ahead of flight disruptions.',
  start_url: '/',
  scope: '/',
  display: 'browser',
  theme_color: '#07111f',
  background_color: '#07111f',
}

/** Keys the manifest is allowed to carry at all. */
const ALLOWED_KEYS = new Set([...Object.keys(FIXED_FIELDS), 'icons'])

const findings = []
const fail = (message) => findings.push(message)

const raw = readFileSync(join(repoRoot, MANIFEST_FILE), 'utf8')

let manifest
try {
  manifest = JSON.parse(raw)
} catch (error) {
  console.error(`verify-manifest: ${MANIFEST_FILE} is not valid JSON.\n  ${String(error)}`)
  process.exit(1)
}

if (manifest === null || typeof manifest !== 'object' || Array.isArray(manifest)) {
  console.error(`verify-manifest: ${MANIFEST_FILE} must be a JSON object.`)
  process.exit(1)
}

for (const [key, expected] of Object.entries(FIXED_FIELDS)) {
  const actual = manifest[key]
  if (actual !== expected) {
    fail(`"${key}" is ${JSON.stringify(actual)}; the decided value is ${JSON.stringify(expected)}.`)
  }
}

for (const key of Object.keys(manifest)) {
  if (!ALLOWED_KEYS.has(key)) {
    fail(
      `"${key}" is not in the agreed key set. Adding one asserts a surface that has to exist ` +
        `first (AGENTS.md §1.1); record the decision in docs/SEO.md §4 and add it here too.`,
    )
  }
}

const expectedIcons = MANIFEST_ICONS.map((asset) => ({
  src: asset.url,
  sizes: `${asset.width}x${asset.height}`,
  type: asset.mime,
  purpose: asset.purpose,
}))

const icons = Array.isArray(manifest.icons) ? manifest.icons : []

if (!Array.isArray(manifest.icons)) {
  fail('"icons" is missing or is not an array.')
} else if (icons.length !== expectedIcons.length) {
  fail(
    `"icons" has ${icons.length} entr(ies); scripts/assets/asset-manifest.mjs declares ` +
      `${expectedIcons.length} asset(s) with a manifest purpose.`,
  )
}

for (const [index, expected] of expectedIcons.entries()) {
  const actual = icons[index]
  if (actual === undefined) {
    fail(`icons[${index}] is missing: expected ${JSON.stringify(expected)}.`)
    continue
  }
  for (const field of ['src', 'sizes', 'type', 'purpose']) {
    if (actual[field] !== expected[field]) {
      fail(
        `icons[${index}].${field} is ${JSON.stringify(actual[field])}; ` +
          `scripts/assets/asset-manifest.mjs gives ${JSON.stringify(expected[field])}.`,
      )
    }
  }
  if (typeof actual.purpose === 'string' && actual.purpose.trim().includes(' ')) {
    fail(
      `icons[${index}].purpose is ${JSON.stringify(actual.purpose)}. Declare "any" and ` +
        `"maskable" as separate objects, never as one combined value.`,
    )
  }
}

let resolved = 0
for (const [index, icon] of icons.entries()) {
  const src = typeof icon?.src === 'string' ? icon.src : ''
  if (!src.startsWith('/')) {
    fail(`icons[${index}].src ${JSON.stringify(src)} is not a root-relative path.`)
    continue
  }
  if (existsSync(join(PUBLIC_DIR, src.slice(1)))) resolved += 1
  else fail(`icons[${index}].src ${src} does not exist under apps/web/public/.`)
}

if (findings.length > 0) {
  console.error(`verify-manifest: ${findings.length} finding(s) in ${MANIFEST_FILE}.\n`)
  for (const finding of findings) console.error(`  · ${finding}`)
  console.error('')
  process.exit(1)
}

console.log(
  `verify-manifest: ${MANIFEST_FILE} valid. ` +
    `${Object.keys(FIXED_FIELDS).length} fixed field(s) match, ` +
    `${icons.length} icon(s) match scripts/assets/asset-manifest.mjs, ` +
    `${resolved}/${icons.length} icon file(s) present in apps/web/public/.`,
)
