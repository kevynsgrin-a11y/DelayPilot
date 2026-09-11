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
 *
 * It is NOT a landmark. `<aside>` with an accessible name is a `complementary` landmark whatever it
 * is nested in, so two slots on one page produced two identically named landmarks in the list a
 * screen-reader user navigates by (`docs/ACCESSIBILITY.md` F13). `role="group"` names the container
 * from its own visible label without adding anything to that list.
 */

import { useId, type JSX, type ReactNode } from 'react'
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
  const labelId = useId()

  return (
    <div
      className={cx('dp-ad-slot', 'dp-no-print', className)}
      role="group"
      aria-labelledby={labelId}
      style={{ inlineSize: width, blockSize: height }}
    >
      <span className="dp-ad-slot__label" id={labelId}>
        {label}
      </span>
      <div className="dp-ad-slot__frame">{children}</div>
    </div>
  )
}
