/**
 * Parse `apps/web/public/brand/mark.svg` and measure it exactly.
 *
 * Owner: visual-asset-director (docs/agents/ROSTER.md §3, `scripts/assets/**`).
 *
 * WHY THIS IS NOT A TABLE OF CONSTANTS
 * ------------------------------------
 * Every derived asset — favicon, ICO, PWA icons, maskable icons, Apple touch icon, OG card,
 * evidence renders — is centred against the mark's content bounding box, and the maskable safe
 * zone is asserted against its circumradius. If those numbers were copied into the build script,
 * the first nudge to a control point would silently mis-centre nine files and quietly push the
 * maskable artwork toward the crop. So the geometry is read from the SVG and measured from first
 * principles here, and `build-assets.mjs` and `verify-assets.mjs` both consume this one module.
 *
 * The bounds are exact, not approximations from control points: cubic extrema come from the
 * derivative roots, arc extrema from the cardinal angles inside the sweep. Because the mark uses
 * round caps and round joins, its stroked outline is exactly the Minkowski sum of the path with a
 * disc of radius `strokeWidth / 2`, so half the stroke width expands the bounds exactly too.
 */

import { readFileSync } from 'node:fs'

/** Marker used for the advance dot's colour in mark.svg; substituted when rasterising. */
export const ACCENT_EXPRESSION = 'var(--brand-mark-accent, #087fbd)'

/**
 * The literal fallback inside {@link ACCENT_EXPRESSION}: the `--color-sky-600` primitive, the one
 * value in the sky ramp clearing 3:1 on every product surface in both themes. See
 * `scripts/assets/brand-colors.mjs` for the measured table.
 */
export const ACCENT_FALLBACK = '#087fbd'

const NUMBER = String.raw`-?\d*\.?\d+(?:e[-+]?\d+)?`

function numbers(source) {
  return (source.match(new RegExp(NUMBER, 'gi')) ?? []).map(Number)
}

/**
 * Endpoint parameterisation to centre parameterisation, SVG 1.1 appendix F.6.5, restricted to
 * circles (rx === ry, no x-axis rotation) because that is all the mark uses. Anything else throws
 * rather than being silently approximated.
 */
function arcCentre(x1, y1, rx, ry, largeArc, sweep, x2, y2) {
  if (rx !== ry) throw new Error(`mark.svg arc is elliptical (rx ${rx} !== ry ${ry}); unsupported`)
  const r = rx
  const dx2 = (x1 - x2) / 2
  const dy2 = (y1 - y2) / 2
  const denominator = r * r * dy2 * dy2 + r * r * dx2 * dx2
  if (denominator === 0) throw new Error('mark.svg arc has zero-length chord')
  const radicand = (r * r * r * r - denominator) / denominator
  const coefficient = (largeArc === sweep ? -1 : 1) * Math.sqrt(Math.max(0, radicand))
  const cxPrime = coefficient * ((r * dy2) / r)
  const cyPrime = coefficient * -((r * dx2) / r)
  const cx = cxPrime + (x1 + x2) / 2
  const cy = cyPrime + (y1 + y2) / 2
  const start = Math.atan2(y1 - cy, x1 - cx)
  let end = Math.atan2(y2 - cy, x2 - cx)
  if (sweep === 1 && end < start) end += 2 * Math.PI
  if (sweep === 0 && end > start) end -= 2 * Math.PI
  return { cx, cy, r, start, end }
}

function arcBounds({ cx, cy, r, start, end }) {
  const points = [
    [cx + r * Math.cos(start), cy + r * Math.sin(start)],
    [cx + r * Math.cos(end), cy + r * Math.sin(end)],
  ]
  const low = Math.min(start, end)
  const high = Math.max(start, end)
  for (let k = -4; k <= 4; k += 1) {
    for (const quadrant of [0, 1, 2, 3]) {
      const angle = (quadrant * Math.PI) / 2 + k * 2 * Math.PI
      if (angle >= low && angle <= high) {
        points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)])
      }
    }
  }
  return boundsOf(points)
}

function cubicBounds(p0, p1, p2, p3) {
  const points = [p0, p3]
  for (const axis of [0, 1]) {
    const a = -p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]
    const b = 2 * (p0[axis] - 2 * p1[axis] + p2[axis])
    const c = -p0[axis] + p1[axis]
    const roots = []
    if (Math.abs(a) < 1e-12) {
      if (Math.abs(b) > 1e-12) roots.push(-c / b)
    } else {
      const discriminant = b * b - 4 * a * c
      if (discriminant >= 0) {
        const root = Math.sqrt(discriminant)
        roots.push((-b + root) / (2 * a), (-b - root) / (2 * a))
      }
    }
    for (const t of roots) {
      if (t <= 0 || t >= 1) continue
      const u = 1 - t
      points.push([
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ])
    }
  }
  return boundsOf(points)
}

function boundsOf(points) {
  return {
    xMin: Math.min(...points.map((p) => p[0])),
    yMin: Math.min(...points.map((p) => p[1])),
    xMax: Math.max(...points.map((p) => p[0])),
    yMax: Math.max(...points.map((p) => p[1])),
  }
}

function grow(bounds, amount) {
  return {
    xMin: bounds.xMin - amount,
    yMin: bounds.yMin - amount,
    xMax: bounds.xMax + amount,
    yMax: bounds.yMax + amount,
  }
}

function union(list) {
  return {
    xMin: Math.min(...list.map((b) => b.xMin)),
    yMin: Math.min(...list.map((b) => b.yMin)),
    xMax: Math.max(...list.map((b) => b.xMax)),
    yMax: Math.max(...list.map((b) => b.yMax)),
  }
}

/** Width, height, centre and circumradius of a bounding box. */
export function describe(bounds) {
  const width = bounds.xMax - bounds.xMin
  const height = bounds.yMax - bounds.yMin
  return {
    ...bounds,
    width,
    height,
    cx: (bounds.xMin + bounds.xMax) / 2,
    cy: (bounds.yMin + bounds.yMax) / 2,
    circumradius: Math.hypot(width, height) / 2,
  }
}

/**
 * Read the mark and return its three elements plus measured bounds.
 *
 * Element identification is positional and asserted: exactly one `A` path (the radar arc), exactly
 * one `C` path (the route line) and exactly one `<circle>` (the advance dot). A mark.svg that grows
 * a fourth element, or loses one, fails here instead of producing a subtly wrong icon set.
 */
export function readMark(markPath) {
  const source = readFileSync(markPath, 'utf8')

  const paths = [...source.matchAll(/<path\s+d="([^"]+)"\s+stroke-width="([\d.]+)"\s*\/>/g)].map(
    (match) => ({ d: match[1], strokeWidth: Number(match[2]) }),
  )
  const circles = [
    ...source.matchAll(/<circle\s+cx="([\d.]+)"\s+cy="([\d.]+)"\s+r="([\d.]+)"\s+fill="([^"]+)"/g),
  ].map((match) => ({
    cx: Number(match[1]),
    cy: Number(match[2]),
    r: Number(match[3]),
    fill: match[4],
  }))

  if (paths.length !== 2 || circles.length !== 1) {
    throw new Error(
      `mark.svg must hold exactly two stroked paths and one circle; found ${paths.length} and ${circles.length}. ` +
        'DIRECTIVE.md §7 fixes the mark at three elements: route line, radar arc, forward-motion cue.',
    )
  }

  const arcPath = paths.find((p) => /[Aa]/.test(p.d))
  const routePath = paths.find((p) => /[Cc]/.test(p.d) && !/[Aa]/.test(p.d))
  if (!arcPath || !routePath) throw new Error('mark.svg must hold one arc path and one cubic path')

  const [ax1, ay1, arx, ary, aRot, aLarge, aSweep, ax2, ay2] = numbers(arcPath.d)
  if (aRot !== 0) throw new Error('mark.svg arc must have zero x-axis rotation')
  const arcParams = arcCentre(ax1, ay1, arx, ary, aLarge, aSweep, ax2, ay2)

  const [rx0, ry0, rx1, ry1, rx2, ry2, rx3, ry3] = numbers(routePath.d)
  const route = {
    ...routePath,
    p0: [rx0, ry0],
    p1: [rx1, ry1],
    p2: [rx2, ry2],
    p3: [rx3, ry3],
  }

  const dot = circles[0]
  const viewBox = numbers(/viewBox="([^"]+)"/.exec(source)?.[1] ?? '')
  if (viewBox.length !== 4) throw new Error('mark.svg must declare a four-value viewBox')

  const arcBox = grow(arcBounds(arcParams), arcPath.strokeWidth / 2)
  const routeBox = grow(
    cubicBounds(route.p0, route.p1, route.p2, route.p3),
    routePath.strokeWidth / 2,
  )
  const dotBox = {
    xMin: dot.cx - dot.r,
    yMin: dot.cy - dot.r,
    xMax: dot.cx + dot.r,
    yMax: dot.cy + dot.r,
  }

  return {
    source,
    viewBox: { x: viewBox[0], y: viewBox[1], width: viewBox[2], height: viewBox[3] },
    arc: { ...arcPath, ...arcParams, bounds: describe(arcBox) },
    route: { ...route, bounds: describe(routeBox) },
    dot: { ...dot, bounds: describe(dotBox) },
    /** Bounds of all three elements — what the full mark must be centred by. */
    content: describe(union([arcBox, routeBox, dotBox])),
    /** Bounds of the favicon reduction: route line and advance dot, radar arc dropped. */
    reduced: describe(union([routeBox, dotBox])),
  }
}

/**
 * Emit an `A`-command path for a circular arc, in the centre parameterisation. Used to restate the
 * mark's own arc at other radii (the Open Graph range rings, the radar motif) so those remain
 * derivations of the mark rather than newly drawn curves.
 */
export function arcPathData(cx, cy, r, start, end, round) {
  const sweep = end >= start ? 1 : 0
  const largeArc = Math.abs(end - start) > Math.PI ? 1 : 0
  const x1 = round(cx + r * Math.cos(start))
  const y1 = round(cy + r * Math.sin(start))
  const x2 = round(cx + r * Math.cos(end))
  const y2 = round(cy + r * Math.sin(end))
  return `M${x1} ${y1}A${round(r)} ${round(r)} 0 ${largeArc} ${sweep} ${x2} ${y2}`
}
