/**
 * AdSlot — a reserved, labelled container for a monetization unit.
 *
 * This is a SHELL. It renders no network call, no script, no consent check and no placement
 * decision: what may be placed where, and after which consent, is `AGENTS.md §4` and
 * `DIRECTIVE.md §20`, owned by monetization-partnerships-engineer. This primitive exists so that
 * whatever they place cannot shift the page.
 *
 * The size is one of the six IAB fixed units the §20 placements use, and the reserved box lives in
 * primitives.css. It used to arrive as `width` and `height` props written to an inline `style`,
 * which the served Content-Security-Policy (`style-src 'self'` with no `'unsafe-inline'`,
 * apps/web/public/_headers) discards — so the slot reserved nothing and a filled ad pushed the page
 * down, which is the CLS defect the primitive was written to prevent (`AGENTS.md §4`,
 * `DIRECTIVE.md §20`). See no-inline-style.ts.
 *
 * Reserving a box is not choosing one: a unit wider than the column it sits in is a placement
 * error, and picking the size that fits the breakpoint (320x50 and 320x100 are the phone units)
 * belongs to the placement owner. The frame clips rather than pushing the page sideways, and the
 * reserved height is held either way. An unlabelled slot is an ad confusable with product content.
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

/** The IAB fixed units the `DIRECTIVE.md §20` placements use. Nothing else has a reserved box. */
export const adSlotSizes = ['300x250', '336x280', '728x90', '320x100', '320x50', '970x250'] as const

export type AdSlotSize = (typeof adSlotSizes)[number]

export interface AdSlotProps {
  /** Visible label, e.g. "Advertisement". Required, and it is copy, so the caller supplies it. */
  readonly label: string
  /** Reserved dimensions, held whether or not the slot fills. */
  readonly size: AdSlotSize
  /** The unit itself. Absent means the slot stays reserved and empty rather than collapsing. */
  readonly children?: ReactNode
  readonly className?: string
}

export function AdSlot({ label, size, children, className }: AdSlotProps): JSX.Element {
  const labelId = useId()

  return (
    <div
      className={cx('dp-ad-slot', 'dp-no-print', className)}
      role="group"
      aria-labelledby={labelId}
      data-size={size}
    >
      <span className="dp-ad-slot__label" id={labelId}>
        {label}
      </span>
      <div className="dp-ad-slot__frame">{children}</div>
    </div>
  )
}
