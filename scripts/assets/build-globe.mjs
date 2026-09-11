#!/usr/bin/env node
/**
 * Generate `apps/web/public/brand/motifs/route-globe.svg`: an orthographic wireframe globe.
 *
 * Owner: visual-asset-director (docs/agents/ROSTER.md §3, `scripts/assets/**`).
 *
 * WHY IT IS GENERATED AND WHY IT IS A WIREFRAME
 * ADR 0003 rule 6 adopts "Option A": a build-time-rendered SVG orthographic projection, animated
 * in CSS, captioned "Illustrative route lines — not live traffic.", with no IATA codes on the
 * globe. The `cobe` WebGL alternative is explicitly not adopted. A 10° graticule is ~1,400 points
 * of trigonometry; hand-authoring it would be transcription, and transcription drifts.
 *
 * There are no coastlines, no country outlines, no borders, no city dots, no airport codes and no
 * labels. That is deliberate and it is not a shortcut: an outline of a coast is a claim about
 * territory, a dot on a coast is a claim about an airport, and a line between two dots is a claim
 * about a route someone operates. This motif makes none of them. The three arcs run between
 * arbitrary round-number anchors on a bare sphere and carry no operational meaning whatsoever
 * (AGENTS.md §1.1, §1.4).
 *
 * PROJECTION
 * Orthographic, centred on (PHI0, LAMBDA0). For a point (phi, lambda), with dl = lambda - LAMBDA0:
 *     cos c = sin(PHI0) sin(phi) + cos(PHI0) cos(phi) cos(dl)      visible when cos c >= 0
 *     x     = R cos(phi) sin(dl)
 *     y     = R (cos(PHI0) sin(phi) - sin(PHI0) cos(phi) cos(dl))
 * Screen coordinates are (CENTRE + x, CENTRE - y): SVG's y axis points down.
 * The back hemisphere is culled by the cos c test, sample by sample, so a graticule line that
 * crosses the limb is split into separate visible runs rather than drawn across the globe.
 *
 * DETERMINISM
 * Pure trigonometry over fixed constants, rounded to 1 decimal. Same input, same bytes, always.
 *
 * USAGE
 *   node scripts/assets/build-globe.mjs
 */

import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { assetByPath } from './asset-manifest.mjs'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUTPUT = 'apps/web/public/brand/motifs/route-globe.svg'

/** Canvas. 480 with R 200 leaves a 40-unit margin for the arcs that bulge past the limb. */
const SIZE = 480
const CENTRE = SIZE / 2
const R = 200

/** Viewing centre. Chosen for a balanced graticule, not to frame any particular place. */
const PHI0 = (25 * Math.PI) / 180
const LAMBDA0 = (-20 * Math.PI) / 180

/** Graticule spacing, fixed at 10° by the dispatch. */
const GRATICULE_STEP = 10

/**
 * Sampling step along each graticule line, in degrees. 4° keeps a 200-unit radius visually smooth
 * (the worst-case chord error is R(1 - cos 2°) = 0.12 units, well under a stroke width) while
 * holding the whole file inside its 32 KB budget. Finer sampling buys nothing a reader can see.
 */
const SAMPLE_STEP = 4

/**
 * Three illustrative arcs between arbitrary anchors on the sphere, in degrees [lat, lon]. Round
 * numbers, deliberately: they are not airports, not cities and not a route network. Each is drawn
 * as a true great circle so the curvature is honest geometry rather than a decorative swoop.
 */
const ARCS = [
  [
    [10, -60],
    [48, 10],
  ],
  [
    [-15, -35],
    [35, 40],
  ],
  [
    [40, -75],
    [5, 25],
  ],
]

const toRadians = (degrees) => (degrees * Math.PI) / 180

/** Round to 1 decimal: 0.1 units on a 480-unit canvas is 0.02% — invisible, and half the bytes. */
function fmt(value) {
  const rounded = Math.round(value * 10) / 10
  return String(Object.is(rounded, -0) ? 0 : rounded)
}

function project(phi, lambda) {
  const dl = lambda - LAMBDA0
  const cosC = Math.sin(PHI0) * Math.sin(phi) + Math.cos(PHI0) * Math.cos(phi) * Math.cos(dl)
  return {
    visible: cosC >= 0,
    x: CENTRE + R * Math.cos(phi) * Math.sin(dl),
    y:
      CENTRE - R * (Math.cos(PHI0) * Math.sin(phi) - Math.sin(PHI0) * Math.cos(phi) * Math.cos(dl)),
  }
}

/**
 * Turn a sampled line into path data, breaking it wherever it passes behind the globe. A run of
 * fewer than two visible samples is dropped: a single point is a dot, and a stray dot on a
 * wireframe reads as a place.
 */
function polyline(samples) {
  let out = ''
  let run = []
  const flush = () => {
    if (run.length >= 2) {
      out += `M${run.map(({ x, y }) => `${fmt(x)} ${fmt(y)}`).join('L')}`
    }
    run = []
  }
  for (const sample of samples) {
    if (sample.visible) run.push(sample)
    else flush()
  }
  flush()
  return out
}

function meridians() {
  const data = []
  for (let lon = -180; lon < 180; lon += GRATICULE_STEP) {
    const samples = []
    for (let lat = -90; lat <= 90; lat += SAMPLE_STEP) {
      samples.push(project(toRadians(lat), toRadians(lon)))
    }
    const d = polyline(samples)
    if (d) data.push(d)
  }
  return data
}

function parallels() {
  const data = []
  for (let lat = -80; lat <= 80; lat += GRATICULE_STEP) {
    const samples = []
    for (let lon = -180; lon <= 180; lon += SAMPLE_STEP) {
      samples.push(project(toRadians(lat), toRadians(lon)))
    }
    const d = polyline(samples)
    if (d) data.push(d)
  }
  return data
}

/** Spherical linear interpolation between two unit vectors: a true great-circle path. */
function greatCircle([latA, lonA], [latB, lonB], steps = 96) {
  const unit = (lat, lon) => {
    const phi = toRadians(lat)
    const lambda = toRadians(lon)
    return [Math.cos(phi) * Math.cos(lambda), Math.cos(phi) * Math.sin(lambda), Math.sin(phi)]
  }
  const a = unit(latA, lonA)
  const b = unit(latB, lonB)
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))
  const omega = Math.acos(dot)
  const samples = []
  for (let step = 0; step <= steps; step += 1) {
    const t = step / steps
    const scaleA = omega === 0 ? 1 - t : Math.sin((1 - t) * omega) / Math.sin(omega)
    const scaleB = omega === 0 ? t : Math.sin(t * omega) / Math.sin(omega)
    const point = [
      a[0] * scaleA + b[0] * scaleB,
      a[1] * scaleA + b[1] * scaleB,
      a[2] * scaleA + b[2] * scaleB,
    ]
    const phi = Math.asin(Math.min(1, Math.max(-1, point[2])))
    const lambda = Math.atan2(point[1], point[0])
    samples.push(project(phi, lambda))
  }
  return polyline(samples)
}

function build() {
  const graticule = [...meridians(), ...parallels()].join('')
  const arcs = ARCS.map((arc) => greatCircle(arc[0], arc[1])).filter(Boolean)

  const svg =
    '<!--\n' +
    '  GENERATED FILE — do not edit. Written by scripts/assets/build-globe.mjs.\n' +
    '\n' +
    '  Decorative orthographic wireframe globe. Owner: visual-asset-director.\n' +
    '\n' +
    '  Permitted as an ambient decorative motif on the public marketing routes only, under ADR 0003\n' +
    '  rule 2b and rule 6 (Option A: build-time SVG, CSS-animated, no WebGL). aria-hidden, no text,\n' +
    '  no data, collapses to this static frame under prefers-reduced-motion. No motion is baked in.\n' +
    '\n' +
    '  ADR 0003 rule 6 REQUIRES the page that embeds this to carry the visible caption\n' +
    '  "Illustrative route lines — not live traffic." in page copy. The caption is not optional and\n' +
    '  it does not live in this file, because a caption inside an aria-hidden decorative graphic is\n' +
    '  a caption nobody reads.\n' +
    '\n' +
    '  There are no coastlines, no country outlines, no borders, no city dots, no airport or airline\n' +
    '  codes and no labels. The three arcs run between arbitrary round-number anchors on a bare\n' +
    `  sphere: ${ARCS.map((a) => `[${a[0]}]->[${a[1]}]`).join(', ')} in degrees lat/lon. They are not\n` +
    '  flights, not routes anyone operates, and not traffic (AGENTS.md §1.1, §1.4).\n' +
    '\n' +
    `  Projection: orthographic, centred on ${(PHI0 * 180) / Math.PI}° lat, ${(LAMBDA0 * 180) / Math.PI}° lon, R ${R} on a ${SIZE}-unit canvas.\n` +
    `  Graticule every ${GRATICULE_STEP}°, sampled every ${SAMPLE_STEP}°, back hemisphere culled sample by sample.\n` +
    '\n' +
    '  HOOKS  #limb, #graticule, #routes. Colour via the motif-line / motif-accent custom\n' +
    '         properties (written here without their leading double hyphen, which an XML comment\n' +
    '         may not contain), falling back to currentColor.\n' +
    '-->\n' +
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" fill="none" aria-hidden="true" focusable="false">\n` +
    `  <circle id="limb" cx="${CENTRE}" cy="${CENTRE}" r="${R}" stroke="var(--motif-line, currentColor)" stroke-width="1.5" stroke-opacity="var(--motif-limb-opacity, 0.4)"/>\n` +
    `  <path id="graticule" d="${graticule}" stroke="var(--motif-line, currentColor)" stroke-width="1" stroke-opacity="var(--motif-grid-opacity, 0.18)"/>\n` +
    '  <g id="routes" stroke="var(--motif-accent, currentColor)" stroke-width="2" stroke-linecap="round" stroke-opacity="var(--motif-route-opacity, 0.75)">\n' +
    arcs.map((d, index) => `    <path id="globe-route-${index + 1}" d="${d}"/>\n`).join('') +
    '  </g>\n' +
    '</svg>\n'

  const absolute = path.join(REPO, OUTPUT)
  mkdirSync(path.dirname(absolute), { recursive: true })
  writeFileSync(absolute, svg)

  const bytes = statSync(absolute).size
  const budget = assetByPath(OUTPUT).bytes
  console.log(
    `${OUTPUT}  ${bytes} bytes / ${budget} budget  ${bytes > budget ? 'OVER BUDGET' : 'ok'}`,
  )
  console.log(
    `  graticule: ${meridians().length} meridian runs, ${parallels().length} parallel runs; ${arcs.length} illustrative arcs`,
  )
  return bytes > budget ? 1 : 0
}

process.exitCode = build()
