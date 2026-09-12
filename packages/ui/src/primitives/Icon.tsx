/**
 * Icon — the system's glyph set.
 *
 * Original geometry, drawn as strokes on a 24x24 grid at a 2-unit weight so the shape survives at
 * 16px and in greyscale. No airline, airport, regulator or provider mark, and no brand mark: the
 * DelayPilot mark, favicons and OG art are visual-asset-director's (docs/agents/ROSTER.md §3).
 *
 * The four status glyphs are deliberately four DIFFERENT SHAPES — circle, triangle, octagon,
 * square — because hue is never allowed to be the only signal (`AGENTS.md §1.1`, `DIRECTIVE.md §7`
 * accessibility floor). Print one in greyscale and it is still identifiable.
 *
 * `info` is the one neutral glyph and is NOT a status: it marks explanatory prose, never a flight,
 * a freshness or a confidence. Nothing else in the set may be reused to mean "read this note".
 *
 * Naming is at the type level: an icon is either decorative (`aria-hidden`, no name) or it carries
 * a `title`, which becomes its accessible name. There is no third option.
 */

import type { JSX } from 'react'
import { cx } from './class-names.ts'

export type IconName =
  | 'status-safe'
  | 'status-watch'
  | 'status-critical'
  | 'status-unknown'
  | 'provenance-live'
  | 'provenance-cached'
  | 'provenance-stale'
  | 'provenance-demo'
  | 'provenance-unavailable'
  | 'provenance-heuristic'
  | 'info'
  | 'chevron-down'
  | 'check'
  | 'close'
  | 'minus'

interface Glyph {
  /** Stroked geometry, drawn with the shared stroke attributes. */
  readonly stroke?: readonly string[]
  /** Filled geometry, drawn with `fill: currentColor` and no stroke. */
  readonly fill?: readonly string[]
}

const GLYPHS: Readonly<Record<IconName, Glyph>> = {
  // --- Status. Four distinct silhouettes, legible in greyscale. ---
  'status-safe': {
    stroke: ['M12 3.2a8.8 8.8 0 1 1 0 17.6 8.8 8.8 0 0 1 0-17.6z', 'M8 12.4l2.6 2.6 5.4-5.6'],
  },
  'status-watch': {
    stroke: ['M12 3.6 21.2 20H2.8z', 'M12 9.6v4.2', 'M12 17.1v.01'],
  },
  'status-critical': {
    stroke: [
      'M8.6 3.2h6.8L20.8 8.6v6.8L15.4 20.8H8.6L3.2 15.4V8.6z',
      'M9.4 9.4l5.2 5.2',
      'M14.6 9.4l-5.2 5.2',
    ],
  },
  'status-unknown': {
    stroke: [
      'M5 3.6h14a1.4 1.4 0 0 1 1.4 1.4v14a1.4 1.4 0 0 1-1.4 1.4H5A1.4 1.4 0 0 1 3.6 19V5A1.4 1.4 0 0 1 5 3.6z',
      'M9.9 9.6a2.1 2.1 0 1 1 2.9 2.5c-.6.3-.9.8-.9 1.4v.4',
      'M11.9 16.7v.01',
    ],
  },

  // --- Provenance. Six distinct marks; none of them is a plain filled dot except Live. ---
  'provenance-live': { fill: ['M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z'] },
  'provenance-cached': { stroke: ['M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z'] },
  'provenance-stale': {
    stroke: ['M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10z'],
    fill: ['M12 7a5 5 0 0 1 0 10z'],
  },
  'provenance-demo': {
    stroke: [
      'M7 6.4h10a.6.6 0 0 1 .6.6v10a.6.6 0 0 1-.6.6H7a.6.6 0 0 1-.6-.6V7a.6.6 0 0 1 .6-.6z',
      'M7.4 14.6l7.2-7.2',
      'M10.2 17l6.4-6.4',
    ],
  },
  'provenance-unavailable': {
    stroke: ['M12 6.4a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2z', 'M8 16l8-8'],
  },
  'provenance-heuristic': {
    stroke: ['M5 8.4v7.2', 'M19 8.4v7.2', 'M5 12h14'],
  },

  // --- Neutral information. NOT a status and not a provenance mark: it carries no claim about a
  //     flight, a freshness or a confidence. It marks explanatory text — the §26 disclaimers, a
  //     method note, a definition — so that prose no longer has to borrow `status-unknown`, whose
  //     meaning is the specific one of "insufficient fresh information". Same 8.8 ring as the
  //     status circle for optical weight; the upright bar and separated dot read differently from
  //     the check inside `status-safe` at 16px and in greyscale.
  info: {
    stroke: ['M12 3.2a8.8 8.8 0 1 1 0 17.6 8.8 8.8 0 0 1 0-17.6z', 'M12 7.6v.01', 'M12 11.2v5.4'],
  },

  // --- Controls. ---
  'chevron-down': { stroke: ['M6 9.5l6 6 6-6'] },
  check: { stroke: ['M5 12.6l4.6 4.6L19 7.4'] },
  close: { stroke: ['M6.6 6.6l10.8 10.8', 'M17.4 6.6L6.6 17.4'] },
  minus: { stroke: ['M6.5 12h11'] },
}

export const iconNames = Object.keys(GLYPHS) as IconName[]

interface IconBase {
  readonly name: IconName
  readonly className?: string
  /** Rendered size. Defaults to 1em so a glyph tracks the text it sits beside. */
  readonly size?: string
}

/** Decorative: hidden from assistive technology because the adjacent text already says it. */
interface DecorativeIcon extends IconBase {
  readonly decorative: true
  readonly title?: never
}

/** Meaningful: the title becomes the accessible name. Required — there is no unnamed third state. */
interface TitledIcon extends IconBase {
  readonly decorative?: false
  readonly title: string
}

export type IconProps = DecorativeIcon | TitledIcon

export function Icon(props: IconProps): JSX.Element {
  const { name, className, size = '1em' } = props
  const glyph = GLYPHS[name]
  const decorative = props.decorative === true

  return (
    <svg
      className={cx('dp-icon', className)}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      focusable="false"
    >
      {decorative ? null : <title>{props.title}</title>}
      {glyph.stroke?.map((d) => (
        <path key={d} d={d} />
      ))}
      {glyph.fill?.map((d) => (
        <path key={d} d={d} fill="currentColor" stroke="none" />
      ))}
    </svg>
  )
}
