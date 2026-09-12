/**
 * Skeleton — a placeholder that reserves the final dimensions.
 *
 * The dimensions are a FINITE SET, one per variant, held in primitives.css: a skeleton that does
 * not reserve its space is a layout shift waiting for a slow network, and the CLS budget is < 0.1
 * (`DIRECTIVE.md §22`). They used to arrive as `width` and `height` props written to an inline
 * `style`, which the served Content-Security-Policy (`style-src 'self'` with no `'unsafe-inline'`,
 * apps/web/public/_headers) discards — so on the real site every placeholder collapsed to nothing
 * and reserved no space at all, which is precisely the defect this primitive exists to prevent.
 * See no-inline-style.ts.
 *
 * Each variant reserves the box its real content occupies, derived from the same tokens that
 * content is built from:
 *
 *   - `text-line`  — one line of body copy.
 *   - `text-block` — `lines` lines of body copy with the stack gap between them; the last is short,
 *                    as the last line of a paragraph is.
 *   - `heading`    — one line at the h3 / panel-title size.
 *   - `chip`       — a ProvenanceChip box: 12px text, chip padding, hairline border.
 *   - `card`       — a card-shaped block: full width on a fixed aspect ratio, so the reserved
 *                    height scales with the column rather than being guessed in pixels.
 *   - `meter`      — a ProgressBar box: readout line, gap, track.
 *   - `avatar`     — a 44px round target-sized block.
 *
 * It does NOT shimmer. A looping animation inside a data-bearing component is forbidden
 * (`DIRECTIVE.md §7`, ADR 0003 rule 3) — and a pulsing block beside a delayed flight reads as
 * something happening, when nothing is.
 *
 * IT IS NOT A LIVE REGION. `role="status"` carries an implicit `aria-live="polite"`, and a cockpit
 * renders a grid of these: one polite announcement per placeholder, queued, every time a panel
 * reloads — including on a background poll that returned identical data. A skeleton → content swap
 * is not a change in the recommended action, and announcing it is exactly the chatter the
 * `DIRECTIVE.md §7` floor ("`aria-live` only for meaningful changes") exists to prevent
 * (`docs/ACCESSIBILITY.md` B4).
 *
 * The correct wiring is the composing pattern's: the REGION being replaced carries
 * `aria-busy="true"` while it loads, and drops it when the content arrives. `live` is available for
 * the one case where a view genuinely has nothing else to announce, and a view must set it at most
 * once.
 */

import type { JSX } from 'react'
import { cx } from './class-names.ts'
import { VisuallyHidden } from './VisuallyHidden.tsx'

export const skeletonVariants = [
  'text-line',
  'text-block',
  'heading',
  'chip',
  'card',
  'meter',
  'avatar',
] as const

export type SkeletonVariant = (typeof skeletonVariants)[number]

/** Paragraph lengths a placeholder may reserve. Beyond six lines, reserve a `card`. */
export type SkeletonLines = 2 | 3 | 4 | 5 | 6

interface SkeletonBase {
  /** Announced text, e.g. "Loading flight status". Copy is the caller's. */
  readonly label: string
  /**
   * Opt in to `role="status"`. Default false, and it should stay false: put `aria-busy="true"` on
   * the region instead. At most one skeleton per view may set it.
   */
  readonly live?: boolean
  readonly className?: string
}

export interface SkeletonBlockProps extends SkeletonBase {
  readonly variant?: Exclude<SkeletonVariant, 'text-block'>
  /** Only `text-block` has lines, and the type says so. */
  readonly lines?: never
}

export interface SkeletonTextBlockProps extends SkeletonBase {
  readonly variant: 'text-block'
  readonly lines?: SkeletonLines
}

export type SkeletonProps = SkeletonBlockProps | SkeletonTextBlockProps

export function Skeleton(props: SkeletonProps): JSX.Element {
  const { label, live = false, className } = props
  const variant = props.variant ?? 'text-line'
  const lines = props.variant === 'text-block' ? (props.lines ?? 3) : undefined

  return (
    <span
      className={cx('dp-skeleton', className)}
      data-variant={variant}
      data-lines={lines}
      {...(live ? { role: 'status' } : {})}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {lines === undefined
        ? null
        : Array.from({ length: lines }, (_line, index) => (
            <span className="dp-skeleton__line" key={index} />
          ))}
    </span>
  )
}
