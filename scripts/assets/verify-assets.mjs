#!/usr/bin/env node
/**
 * Assert every shipped brand asset against its contract.
 *
 * Owner: visual-asset-director (docs/agents/ROSTER.md §3, `scripts/assets/**`).
 *
 * WHAT IS CHECKED
 *   token drift       every hex the pipeline bakes is still declared by its primitive token
 *   presence          every row of asset-manifest.mjs exists on disk
 *   dimensions        exact intrinsic width/height, measured, not declared
 *   format            the encoder actually used
 *   byte budget       hard ceiling per file; over budget fails the build
 *   metadata          no EXIF, no ICC profile — weight, and a privacy leak
 *   maskable safe zone every non-background pixel inside the centred 80%-diameter circle, and the
 *                     background bleeding to all four corners
 *   Apple icon        genuinely alpha-free, because iOS renders an alpha channel as black
 *   ICO structure     three members at 16, 32 and 48, each a real PNG, offsets consistent
 *   SVG hygiene       no editor cruft, no <metadata>, no embedded raster, no font reference,
 *                     no <text>, and path precision capped at 2 decimals
 *   mark integrity    exactly three elements, stroke floor, margin, no fabricated text
 *   svg references    transform arguments comma-separated, aria-labelledby ids resolving
 *   served tree       apps/web/public/{brand,icons,og} hold artwork only — no docs get served
 *   licences          every record complete, every path resolving, every licence text present
 *
 * WHY IT IS A SCRIPT AND A SPEC
 * `verify-assets.spec.mjs` re-exports these checks so `pnpm test` runs them; this file runs
 * standalone so the build and CI can run them without a test runner. One implementation, two
 * entry points — a rule expressed twice is a rule that is wrong in one place (AGENTS.md §3.2).
 *
 * USAGE
 *   node scripts/assets/verify-assets.mjs
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

import { ASSETS } from './asset-manifest.mjs'
import { COLOR } from './brand-colors.mjs'
import { ACCENT_EXPRESSION, ACCENT_FALLBACK, readMark } from './mark-geometry.mjs'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const abs = (relative) => path.join(REPO, relative)

/** The mark's grid contract, from DIRECTIVE.md §7 and the dispatch. */
const MARK_GRID = { size: 24, margin: 2, minStroke: 2 }

/** Maskable safe zone: a centred circle of 80% diameter. */
const SAFE_ZONE_DIAMETER_FRACTION = 0.8

/** A pixel counts as artwork once any channel differs from the plate by more than this. */
const PLATE_TOLERANCE = 8

/** Every licence record must carry all of these, filled in. */
const LICENCE_FIELDS = [
  'path',
  'description',
  'source',
  'sourceUrl',
  'licenceId',
  'licenceName',
  'licenceUrl',
  'licenceTextPath',
  'permittedCommercialUse',
  'modificationRights',
  'attribution',
  'verifiedDate',
  'verificationMethod',
]

/**
 * The only strings permitted to appear as artwork anywhere in the asset set. An Open Graph image
 * or an illustration must never carry a flight number, gate, terminal, time, date, statistic or
 * passenger name, real or realistic (AGENTS.md §1.1, §2, DIRECTIVE.md §28). The wordmark pipeline
 * is the only path by which text reaches a shipped asset, so pinning its inputs pins the whole
 * surface.
 */
const PERMITTED_STRINGS = {
  wordmark: 'DelayPilot',
  tagline: 'Stay ahead of flight disruptions.',
}

/** Attributes whose numeric contents are held to the 2-decimal precision cap. */
const GEOMETRY_ATTRIBUTES = [
  'd',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'width',
  'height',
  'viewBox',
  'stroke-width',
  'transform',
  'stroke-dasharray',
]

function check(results, name, ok, detail) {
  results.push({ name, ok: Boolean(ok), detail: detail ?? '' })
}

async function rasterFacts(record) {
  const buffer = readFileSync(abs(record.path))
  const metadata = await sharp(buffer).metadata()
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true })
  return { buffer, metadata, data, info }
}

function pixelAt(data, info, x, y) {
  const offset = (y * info.width + x) * info.channels
  return Array.from(data.subarray(offset, offset + info.channels))
}

/** Longest distance from the canvas centre to any pixel that is not the plate colour. */
function artworkRadius(data, info, plate) {
  let furthest = 0
  const centreX = (info.width - 1) / 2
  const centreY = (info.height - 1) / 2
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const pixel = pixelAt(data, info, x, y)
      const differs = plate.some(
        (channel, index) => Math.abs((pixel[index] ?? 0) - channel) > PLATE_TOLERANCE,
      )
      if (!differs) continue
      furthest = Math.max(furthest, Math.hypot(x - centreX, y - centreY))
    }
  }
  return furthest
}

function parseIco(buffer) {
  if (buffer.readUInt16LE(0) !== 0 || buffer.readUInt16LE(2) !== 1) return null
  const count = buffer.readUInt16LE(4)
  const entries = []
  for (let index = 0; index < count; index += 1) {
    const at = 6 + index * 16
    const declared = buffer.readUInt8(at)
    const length = buffer.readUInt32LE(at + 8)
    const offset = buffer.readUInt32LE(at + 12)
    entries.push({
      size: declared === 0 ? 256 : declared,
      length,
      offset,
      isPng:
        offset + 8 <= buffer.length &&
        buffer.subarray(offset, offset + 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      withinFile: offset + length <= buffer.length,
    })
  }
  return entries
}

/** Numbers appearing in geometry attributes, with the attribute they came from. */
function geometryNumbers(source) {
  const found = []
  for (const attribute of GEOMETRY_ATTRIBUTES) {
    const pattern = new RegExp(`(?:^|[\\s])${attribute}="([^"]*)"`, 'g')
    for (const match of source.matchAll(pattern)) {
      const value = match[1]
      // Skip custom-property expressions: `var(--motif-line, currentColor)` holds no geometry.
      if (value.includes('var(')) continue
      for (const raw of value.match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? []) {
        found.push({ attribute, raw })
      }
    }
  }
  return found
}

function svgHygiene(results, record) {
  const raw = readFileSync(abs(record.path), 'utf8')
  // Strip XML comments before scanning. Every authored SVG here documents its own constraints in
  // a comment, and several of those comments necessarily name the very constructs this check
  // bans ("no <text> element", "no font reference"). Scanning the prose instead of the markup
  // would make documenting a rule the thing that breaks it.
  const source = raw.replace(/<!--[\s\S]*?-->/g, '')
  const label = record.path

  const forbidden = [
    ['inkscape:', /inkscape:/],
    ['sodipodi:', /sodipodi:/],
    ['<metadata>', /<metadata[\s>]/],
    ['<image>', /<image[\s>]/i],
    ['data: URI', /data:[a-z]+\/[a-z0-9.+-]+;base64/i],
    ['<text>', /<text[\s>]/i],
    ['font-family', /font-family/i],
    ['@font-face', /@font-face/i],
    ['xlink:href', /xlink:href/i],
    ['<script>', /<script[\s>]/i],
    ['onload handler', /\son[a-z]+="/i],
  ]
  const hits = forbidden.filter(([, pattern]) => pattern.test(source)).map(([name]) => name)
  check(
    results,
    `${label}: free of editor cruft, raster, script and font references`,
    hits.length === 0,
    hits.join(', '),
  )

  const overPrecision = geometryNumbers(source).filter(({ raw }) => {
    const decimals = raw.split('.')[1]
    return decimals !== undefined && decimals.length > 2
  })
  check(
    results,
    `${label}: geometry precision capped at 2 decimals`,
    overPrecision.length === 0,
    overPrecision
      .slice(0, 5)
      .map(({ attribute, raw }) => `${attribute}="${raw}"`)
      .join(' '),
  )

  /*
   * The SVG transform grammar requires a comma-wsp between a function's arguments. Path data does
   * not — `10-5` is two numbers there — so a shared number-packing helper will happily emit
   * `translate(-6.49-.25)`, which is an invalid transform list. An invalid transform attribute is
   * dropped whole, and the artwork lands in the corner. librsvg accepts it, so this class of bug
   * rasterises correctly in the build and breaks only in a browser: it has to be linted, not
   * eyeballed.
   */
  const malformedTransforms = [...source.matchAll(/\stransform="([^"]*)"/g)]
    .map((match) => match[1])
    .filter((value) => /\d-/.test(value.replace(/e-\d/gi, '')))
  check(
    results,
    `${label}: transform arguments are comma-separated, not minus-delimited`,
    malformedTransforms.length === 0,
    malformedTransforms.join(' | '),
  )

  /*
   * An `aria-labelledby` pointing at an id that is not in the document gives the graphic no
   * accessible name at all — worse than omitting the attribute, because it looks handled.
   */
  const ids = new Set([...source.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]))
  const danglingLabels = [...source.matchAll(/aria-labelledby="([^"]+)"/g)]
    .flatMap((match) => match[1].split(/\s+/))
    .filter((reference) => !ids.has(reference))
  check(
    results,
    `${label}: every aria-labelledby reference resolves to an id in the file`,
    danglingLabels.length === 0,
    danglingLabels.join(', '),
  )

  if (record.width !== null) {
    const width = /\swidth="([^"]+)"/.exec(source)?.[1]
    const height = /\sheight="([^"]+)"/.exec(source)?.[1]
    check(
      results,
      `${label}: declares intrinsic ${record.width} x ${record.height}`,
      Number(width) === record.width && Number(height) === record.height,
      `found width="${width}" height="${height}"`,
    )
  }
}

export async function runChecks() {
  const results = []

  /* ----------------------------------------------------------------------------------------- */
  /* 0. Token drift.                                                                            */
  /*                                                                                            */
  /* Rasters do not inherit CSS, so the asset pipeline bakes literal hexes — a copy of part of   */
  /* the token layer, owned by brand-design-director. A copy drifts silently. Asserting each    */
  /* one against the primitive it came from turns "the brand quietly changed under the icons"    */
  /* into a failing test. Primitives, not semantic aliases: the primitive palette is the brand,  */
  /* the semantic layer is a mapping that gets re-derived as contrast is re-measured.            */
  /* ----------------------------------------------------------------------------------------- */

  const tokensPath = 'apps/web/src/styles/tokens.css'
  if (!existsSync(abs(tokensPath))) {
    check(
      results,
      `${tokensPath}: present`,
      false,
      'the asset palette cannot be verified without it',
    )
  } else {
    const tokens = readFileSync(abs(tokensPath), 'utf8')
    for (const [name, { hex, token, role }] of Object.entries(COLOR)) {
      const declared = new RegExp(`${token}:\\s*${hex}\\s*;`, 'i').test(tokens)
      check(
        results,
        `palette ${name}: ${token} is still ${hex} in tokens.css`,
        declared,
        `${token} no longer declares ${hex}. The asset pipeline paints ${role} with it; ` +
          're-measure contrast, update scripts/assets/brand-colors.mjs, and re-run build-assets.mjs.',
      )
    }
    check(
      results,
      `mark.svg: advance-dot fallback matches the palette (${ACCENT_FALLBACK})`,
      readFileSync(abs('apps/web/public/brand/mark.svg'), 'utf8').includes(ACCENT_EXPRESSION),
      `expected ${ACCENT_EXPRESSION} in the mark`,
    )
  }

  /* ----------------------------------------------------------------------------------------- */
  /* 1. The mark itself.                                                                        */
  /* ----------------------------------------------------------------------------------------- */

  const markPath = 'apps/web/public/brand/mark.svg'
  let geometry = null
  try {
    geometry = readMark(abs(markPath))
    check(
      results,
      'mark.svg: exactly three elements (route line, radar arc, forward-motion cue)',
      true,
    )
  } catch (error) {
    check(
      results,
      'mark.svg: exactly three elements (route line, radar arc, forward-motion cue)',
      false,
      String(error.message),
    )
  }

  if (geometry) {
    check(
      results,
      `mark.svg: authored on the ${MARK_GRID.size} x ${MARK_GRID.size} grid`,
      geometry.viewBox.width === MARK_GRID.size && geometry.viewBox.height === MARK_GRID.size,
      `viewBox ${geometry.viewBox.width} x ${geometry.viewBox.height}`,
    )

    const thinnest = Math.min(geometry.arc.strokeWidth, geometry.route.strokeWidth)
    check(
      results,
      `mark.svg: thinnest stroke >= ${MARK_GRID.minStroke} units (${(
        (MARK_GRID.minStroke / MARK_GRID.size) *
        16
      ).toFixed(2)} px at 16 px)`,
      thinnest >= MARK_GRID.minStroke,
      `thinnest ${thinnest}`,
    )
    check(
      results,
      'mark.svg: radar arc drawn thinner than the route line',
      geometry.arc.strokeWidth < geometry.route.strokeWidth,
      `arc ${geometry.arc.strokeWidth} vs route ${geometry.route.strokeWidth}`,
    )

    const { xMin, yMin, xMax, yMax } = geometry.content
    const inside =
      xMin >= MARK_GRID.margin &&
      yMin >= MARK_GRID.margin &&
      xMax <= MARK_GRID.size - MARK_GRID.margin &&
      yMax <= MARK_GRID.size - MARK_GRID.margin
    check(
      results,
      `mark.svg: content inside the ${MARK_GRID.margin}-unit outer margin`,
      inside,
      `content x ${xMin.toFixed(2)}..${xMax.toFixed(2)}, y ${yMin.toFixed(2)}..${yMax.toFixed(2)}`,
    )
  }

  /* ----------------------------------------------------------------------------------------- */
  /* 2. Text inputs. The only route by which words reach an asset.                              */
  /* ----------------------------------------------------------------------------------------- */

  const wordmarkPath = 'scripts/assets/wordmark.json'
  if (existsSync(abs(wordmarkPath))) {
    const wordmark = JSON.parse(readFileSync(abs(wordmarkPath), 'utf8'))
    const actual = Object.fromEntries(
      Object.entries(wordmark.strings).map(([key, value]) => [key, value.text]),
    )
    check(
      results,
      'wordmark.json: carries only the product name and the promise line — no flight number, gate, time or statistic',
      JSON.stringify(actual) === JSON.stringify(PERMITTED_STRINGS),
      `found ${JSON.stringify(actual)}`,
    )
  } else {
    check(results, 'wordmark.json: present', false, `${wordmarkPath} is missing`)
  }

  /* ----------------------------------------------------------------------------------------- */
  /* 3. Every manifest row: presence, size, dimensions, format, budget.                         */
  /* ----------------------------------------------------------------------------------------- */

  for (const record of ASSETS) {
    const present = existsSync(abs(record.path))
    check(results, `${record.path}: present`, present)
    if (!present) continue

    const bytes = statSync(abs(record.path)).size
    check(
      results,
      `${record.path}: ${bytes} bytes within ${record.bytes} budget`,
      bytes <= record.bytes,
      `${bytes} > ${record.bytes}`,
    )

    if (record.kind === 'svg') {
      svgHygiene(results, record)
      continue
    }

    if (record.kind === 'ico') {
      const buffer = readFileSync(abs(record.path))
      const entries = parseIco(buffer)
      check(results, `${record.path}: valid ICO header`, entries !== null)
      if (!entries) continue
      check(
        results,
        `${record.path}: members at ${record.sizes.join(', ')}`,
        JSON.stringify(entries.map((entry) => entry.size)) === JSON.stringify(record.sizes),
        `found ${entries.map((entry) => entry.size).join(', ')}`,
      )
      check(
        results,
        `${record.path}: every member is a PNG inside the file`,
        entries.every((entry) => entry.isPng && entry.withinFile),
        entries.map((entry) => `${entry.size}:${entry.isPng ? 'png' : 'not-png'}`).join(' '),
      )
      continue
    }

    const { metadata, data, info } = await rasterFacts(record)
    check(
      results,
      `${record.path}: ${record.width} x ${record.height}`,
      metadata.width === record.width && metadata.height === record.height,
      `found ${metadata.width} x ${metadata.height}`,
    )
    check(
      results,
      `${record.path}: encoded as ${record.kind}`,
      metadata.format === record.kind,
      `found ${metadata.format}`,
    )
    check(
      results,
      `${record.path}: metadata stripped (no EXIF, no ICC profile)`,
      !metadata.exif && !metadata.icc && !metadata.iptc && !metadata.xmp,
      [metadata.exif && 'exif', metadata.icc && 'icc', metadata.xmp && 'xmp']
        .filter(Boolean)
        .join(' '),
    )

    if (record.purpose === 'maskable') {
      const plate = pixelAt(data, info, 0, 0)
      const corners = [
        pixelAt(data, info, 0, 0),
        pixelAt(data, info, info.width - 1, 0),
        pixelAt(data, info, 0, info.height - 1),
        pixelAt(data, info, info.width - 1, info.height - 1),
      ]
      check(
        results,
        `${record.path}: background bleeds to all four corners`,
        corners.every((corner) => JSON.stringify(corner) === JSON.stringify(plate)),
        JSON.stringify(corners),
      )
      check(
        results,
        `${record.path}: fully opaque, no transparency`,
        !metadata.hasAlpha,
        `hasAlpha ${metadata.hasAlpha}`,
      )
      const radius = artworkRadius(data, info, plate)
      const limit = (record.width * SAFE_ZONE_DIAMETER_FRACTION) / 2
      check(
        results,
        `${record.path}: all artwork inside the ${SAFE_ZONE_DIAMETER_FRACTION * 100}%-diameter safe circle`,
        radius <= limit,
        `furthest artwork pixel ${radius.toFixed(1)} px from centre, safe radius ${limit} px`,
      )
    }

    if (record.path.includes('apple-touch-icon')) {
      check(
        results,
        `${record.path}: no alpha channel (iOS renders one as black)`,
        metadata.hasAlpha === false && metadata.channels === 3,
        `hasAlpha ${metadata.hasAlpha}, channels ${metadata.channels}`,
      )
      const corners = [
        pixelAt(data, info, 0, 0),
        pixelAt(data, info, info.width - 1, info.height - 1),
      ]
      check(
        results,
        `${record.path}: opaque square, no self-applied corner radius`,
        corners.every((corner) => JSON.stringify(corner) === JSON.stringify(corners[0])),
        JSON.stringify(corners),
      )
    }
  }

  /* ----------------------------------------------------------------------------------------- */
  /* 3b. Nothing but artwork ships from the brand tree.                                         */
  /*                                                                                            */
  /* Everything under apps/web/public/ is copied verbatim into apps/web/dist/ and served, so a   */
  /* README, a note or a spec sheet dropped beside the art becomes a public URL and an           */
  /* indexable page that is not a page. Documentation lives in scripts/assets/. This is a lint,  */
  /* not a convention, because "remember not to put docs there" is the kind of rule that holds   */
  /* until the first person in a hurry.                                                         */
  /* ----------------------------------------------------------------------------------------- */

  for (const directory of [
    'apps/web/public/brand',
    'apps/web/public/icons',
    'apps/web/public/og',
  ]) {
    if (!existsSync(abs(directory))) continue
    const unexpected = []
    const walk = (dir) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (!/\.(svg|png|webp|avif|ico)$/i.test(entry.name)) {
          unexpected.push(path.relative(REPO, full))
        }
      }
    }
    walk(abs(directory))
    check(
      results,
      `${directory}/: ships artwork only, no documentation or other non-image files`,
      unexpected.length === 0,
      `${unexpected.join(', ')} would be served from the site root. Move documentation to scripts/assets/.`,
    )
  }

  /* ----------------------------------------------------------------------------------------- */
  /* 4. Licences.                                                                               */
  /* ----------------------------------------------------------------------------------------- */

  const licencePath = 'scripts/assets/asset-licenses.json'
  if (!existsSync(abs(licencePath))) {
    check(results, `${licencePath}: present`, false)
  } else {
    const manifest = JSON.parse(readFileSync(abs(licencePath), 'utf8'))
    check(
      results,
      `${licencePath}: carries the originality and no-third-party-marks statement`,
      Boolean(manifest.statement?.originalWork && manifest.statement?.noThirdPartyMarks),
    )
    for (const record of manifest.assets ?? []) {
      const missing = LICENCE_FIELDS.filter(
        (field) => typeof record[field] !== 'string' || record[field].trim() === '',
      )
      check(
        results,
        `licence ${record.path ?? '(unnamed)'}: every required field present`,
        missing.length === 0,
        `missing ${missing.join(', ')}`,
      )
      check(
        results,
        `licence ${record.path}: asset resolves on disk`,
        existsSync(abs(record.path ?? '')),
        `${record.path} not found. If this is a font, it is delivered by brand-design-director; file a handoff rather than deleting the record.`,
      )
      check(
        results,
        `licence ${record.path}: licence text committed at ${record.licenceTextPath}`,
        existsSync(abs(record.licenceTextPath ?? '')),
        `${record.licenceTextPath} not found`,
      )
      check(
        results,
        `licence ${record.path}: verified date is ISO and not empty`,
        /^\d{4}-\d{2}-\d{2}$/.test(record.verifiedDate ?? ''),
        `found ${record.verifiedDate}`,
      )
    }

    /*
     * The other half of the licence contract: nothing may ship that has no record. Every raster in
     * the owned trees must either be generated from mark.svg by build-assets.mjs (and therefore
     * appear in asset-manifest.mjs) or carry a licence record.
     */
    const manifestPaths = new Set(ASSETS.map((asset) => asset.path))
    const licencedPaths = new Set((manifest.assets ?? []).map((asset) => asset.path))
    const strays = []
    for (const directory of [
      'apps/web/public/images',
      'apps/web/public/brand',
      'apps/web/public/og',
    ]) {
      if (!existsSync(abs(directory))) continue
      const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name)
          const relative = path.relative(REPO, full)
          if (entry.isDirectory()) walk(full)
          else if (/\.(png|jpe?g|webp|avif|gif)$/i.test(entry.name)) {
            if (!manifestPaths.has(relative) && !licencedPaths.has(relative)) strays.push(relative)
          }
        }
      }
      walk(abs(directory))
    }
    check(
      results,
      'no raster ships without a manifest row or a licence record',
      strays.length === 0,
      strays.join(', '),
    )
  }

  return results
}

async function main() {
  const results = await runChecks()
  const failures = results.filter((result) => !result.ok)
  for (const result of results) {
    // `detail` explains a failure; printing it beside a PASS reads as if the check had failed.
    console.log(
      `${result.ok ? 'PASS' : 'FAIL'}  ${result.name}${result.ok || !result.detail ? '' : `\n        ${result.detail}`}`,
    )
  }
  console.log(`\n${results.length - failures.length}/${results.length} checks passed.`)
  return failures.length === 0 ? 0 : 1
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main()
}
