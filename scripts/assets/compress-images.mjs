#!/usr/bin/env node
/**
 * Image compression + budget enforcement.
 *
 * Owner: visual-asset-director (docs/agents/ROSTER.md §3, `scripts/assets/**`).
 *
 * DelayPilot is read on airport LTE by someone who needs an answer before a gate closes. The
 * targets are LCP < 2.5s at p75 and Lighthouse >= 95 (DIRECTIVE.md §22), so a hero image is a
 * budget line, not a decoration. This script converts source rasters to AVIF + WebP at responsive
 * widths and FAILS if any emitted file exceeds its budget — a budget that only warns is a budget
 * that gets ignored.
 *
 * Usage:
 *   node scripts/assets/compress-images.mjs <sourceDir> <outDir>
 *   node scripts/assets/compress-images.mjs --check <outDir>   # budget check only, no writes
 */

import { readdir, mkdir, stat, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import sharp from 'sharp'

/** Responsive widths. 1600 covers 2x on a ~800px content column; beyond that is waste. */
const WIDTHS = [640, 1024, 1600]

/**
 * Per-file budgets in KB, by emitted width. Derived from the LCP target: a hero must be
 * transferable inside the first ~1.5s of a 3G-ish airport connection alongside HTML, CSS and font.
 */
const BUDGET_KB = { 640: 60, 1024: 120, 1600: 220 }

const KB = 1024

async function listImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile() && /\.(png|jpe?g)$/i.test(e.name))
    .map((e) => path.join(dir, e.name))
}

async function compress(sourceDir, outDir) {
  await mkdir(outDir, { recursive: true })
  const sources = await listImages(sourceDir)

  if (sources.length === 0) {
    console.error(`No PNG/JPEG sources found in ${sourceDir}`)
    process.exit(1)
  }

  const rows = []

  for (const source of sources) {
    const base = path.basename(source).replace(/\.(png|jpe?g)$/i, '')
    const before = (await stat(source)).size
    const meta = await sharp(source).metadata()

    for (const width of WIDTHS) {
      // Never upscale: emitting a 1600px variant of a 900px source spends bytes on nothing.
      if (meta.width !== undefined && meta.width < width) continue

      const pipeline = sharp(source).resize({ width, withoutEnlargement: true })

      const avif = await pipeline.clone().avif({ quality: 55, effort: 6 }).toBuffer()
      const webp = await pipeline.clone().webp({ quality: 76, effort: 6 }).toBuffer()

      const avifPath = path.join(outDir, `${base}-${width}.avif`)
      const webpPath = path.join(outDir, `${base}-${width}.webp`)
      await writeFile(avifPath, avif)
      await writeFile(webpPath, webp)

      rows.push({ file: `${base}-${width}`, width, before, avif: avif.length, webp: webp.length })
    }

    // Intrinsic dimensions are written alongside so that every <img> can carry width/height and
    // reserve its box. Unreserved images are a top source of CLS (DIRECTIVE.md §22, CLS < 0.1).
    if (meta.width !== undefined && meta.height !== undefined) {
      const dimensionsPath = path.join(outDir, `${base}.dimensions.json`)
      await writeFile(
        dimensionsPath,
        `${JSON.stringify({ width: meta.width, height: meta.height }, null, 2)}\n`,
      )
    }
  }

  return rows
}

async function checkBudgets(outDir) {
  const entries = await readdir(outDir, { withFileTypes: true })
  const failures = []
  let checked = 0

  for (const entry of entries) {
    if (!entry.isFile() || !/\.(avif|webp)$/i.test(entry.name)) continue
    const width = Number(/-(\d+)\.(avif|webp)$/i.exec(entry.name)?.[1] ?? 0)
    const budget = BUDGET_KB[width]
    if (budget === undefined) continue

    checked += 1
    const size = (await stat(path.join(outDir, entry.name))).size
    if (size > budget * KB) {
      failures.push(`${entry.name}: ${(size / KB).toFixed(0)} KB exceeds ${budget} KB budget`)
    }
  }

  return { checked, failures }
}

const args = process.argv.slice(2)

if (args[0] === '--check') {
  const outDir = args[1]
  if (outDir === undefined) {
    console.error('Usage: compress-images.mjs --check <outDir>')
    process.exit(1)
  }
  const { checked, failures } = await checkBudgets(outDir)
  console.log(`Checked ${checked} emitted image(s) in ${outDir}`)
  for (const failure of failures) console.error(`ERROR ${failure}`)
  console.log(`\n${failures.length} budget failure(s)`)
  process.exit(failures.length > 0 ? 1 : 0)
}

const [sourceDir, outDir] = args
if (sourceDir === undefined || outDir === undefined) {
  console.error('Usage: compress-images.mjs <sourceDir> <outDir>')
  process.exit(1)
}

const rows = await compress(sourceDir, outDir)

let totalBefore = 0
let totalAfter = 0
const seen = new Set()
for (const row of rows) {
  if (!seen.has(row.before + row.file.replace(/-\d+$/, ''))) {
    seen.add(row.before + row.file.replace(/-\d+$/, ''))
  }
  totalAfter += row.avif
}
for (const source of await listImages(sourceDir)) {
  totalBefore += (await stat(source)).size
}

console.log(`${'file'.padEnd(30)} ${'avif'.padStart(9)} ${'webp'.padStart(9)}`)
for (const row of rows) {
  console.log(
    `${row.file.padEnd(30)} ${`${(row.avif / KB).toFixed(0)} KB`.padStart(9)} ${`${(row.webp / KB).toFixed(0)} KB`.padStart(9)}`,
  )
}
console.log(
  `\nSources: ${(totalBefore / KB / KB).toFixed(1)} MB → AVIF set: ${(totalAfter / KB).toFixed(0)} KB`,
)

const { failures } = await checkBudgets(outDir)
for (const failure of failures) console.error(`ERROR ${failure}`)
console.log(`${failures.length} budget failure(s)`)
process.exit(failures.length > 0 ? 1 : 0)
