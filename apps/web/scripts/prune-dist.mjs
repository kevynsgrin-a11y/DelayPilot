#!/usr/bin/env node
/**
 * prune-dist — remove JavaScript chunks that nothing references.
 *
 * Owner: frontend-ui-engineer. Runs from `apps/web`'s `build` script between `astro build` and
 * `verify-dist.mjs`.
 *
 * WHY THIS EXISTS. `@astrojs/react` registers a client entrypoint, and Astro's client build emits
 * it whether or not a single island hydrates. This app hydrates none — the served
 * `script-src 'self'` policy has no hash sources, and Astro injects inline script and style for
 * every island (see `astro.config.mjs`) — so the React runtime, measured at 220,923 bytes, is
 * written to `dist/_astro/` and referenced by exactly zero pages.
 *
 * It costs a user nothing: an unreferenced file is never fetched. It costs two other things that
 * matter more. It puts a quarter of a megabyte of dead weight on the CDN, and — the reason this
 * script exists rather than a comment — it makes `dist` LIE about what the site loads. Anyone
 * sizing the bundle, `performance-engineer` included, sees a 216 KB React chunk sitting in the
 * output and reasonably concludes the marketing routes ship React.
 *
 * SAFETY. A chunk is removed only when its filename appears in NO emitted `.html` and in NO other
 * emitted `.js` — the second check is what makes a dynamic `import()` from another chunk safe. The
 * script prints every removal with its size, so the deletion is visible in build output rather than
 * silent. `verify-dist.mjs` then asserts that nothing unreferenced remains, so if this script ever
 * stops working the build fails rather than quietly regrowing the orphan.
 *
 * When a future session adds a real island, the entry becomes referenced and this script leaves it
 * alone. Nothing here needs changing at that point.
 */

import { readFile, readdir, rm, stat } from 'node:fs/promises'
import { basename, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist')

async function walk(directory) {
  const out = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name)
    if (entry.isDirectory()) out.push(...(await walk(full)))
    else out.push(full)
  }
  return out
}

const files = await walk(DIST)
const html = files.filter((file) => file.endsWith('.html'))
const scripts = files.filter((file) => file.endsWith('.js'))

/** Everything that could name a chunk: page markup, and every other script. */
const referrers = await Promise.all(
  [...html, ...scripts].map(async (file) => ({ file, source: await readFile(file, 'utf8') })),
)

let removed = 0
let bytes = 0

for (const script of scripts) {
  const name = basename(script)
  const referenced = referrers.some(
    (referrer) => referrer.file !== script && referrer.source.includes(name),
  )
  if (referenced) continue

  const size = (await stat(script)).size
  await rm(script)
  removed += 1
  bytes += size
  console.log(
    `prune-dist: removed ${relative(DIST, script)} (${String(size)} bytes) — referenced by no page ` +
      `and no other chunk.`,
  )
}

console.log(
  removed === 0
    ? 'prune-dist: nothing to remove; every emitted chunk is referenced.'
    : `prune-dist: ${String(removed)} unreferenced chunk(s), ${String(bytes)} bytes.`,
)
