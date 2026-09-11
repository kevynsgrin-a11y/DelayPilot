/**
 * AdSlot — a reserved, labelled container for a monetization unit.
 *
 * This is a SHELL. It renders no network call, no script, no consent check and no placement
 * decision: what may be placed where, and after which consent, is `AGENTS.md §4` and
 * `DIRECTIVE.md §20`, owned by monetization-partnerships-engineer. This primitive exists so that
 * whatever they place cannot shift the page.
 *
 * Both dimensions are required and are applied to the container whether or not anything fills it.
 * A slot that collapses when unfilled is a CLS defect (`AGENTS.md §4`, `DIRECTIVE.md §20`), and an
 * unlabelled slot is an ad confusable with product content.
 *
 * It is dropped from print: an evidence packet is a record, not an inventory surface.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'

export interface AdSlotProps {
  /** Visible label, e.g. "Advertisement". Required, and it is copy, so the caller supplies it. */
  readonly label: string
  /** Reserved dimensions. Any CSS length; they are held whether or not the slot fills. */
  readonly width: string
  readonly height: string
  /** The unit itself. Absent means the slot stays reserved and empty rather than collapsing. */
  readonly children?: ReactNode
  readonly className?: string
}

export function AdSlot({ label, width, height, children, className }: AdSlotProps): JSX.Element {
  return (
    <aside
      className={cx('dp-ad-slot', 'dp-no-print', className)}
      aria-label={label}
      style={{ inlineSize: width, blockSize: height }}
    >
      <span className="dp-ad-slot__label">{label}</span>
      <div className="dp-ad-slot__frame">{children}</div>
    </aside>
  )
}
