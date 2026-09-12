/**
 * AdSlotShell — the reserved, labelled, position-checked wrapper around the `AdSlot` primitive.
 *
 * The primitive reserves dimensions and labels itself. This shell adds the one thing a primitive
 * cannot know: WHERE it is, and therefore whether it is allowed to be there at all.
 *
 * `AGENTS.md §4` / `DIRECTIVE.md §20` permit exactly five positions, and this component's
 * `placement` prop is typed to those five. There is no `custom` value and no string escape hatch,
 * because the forbidden positions are the ones that look most reasonable in a pull request: above
 * the search form ("the traveler is already there"), beside the rights card ("related content"),
 * between a warning and its action ("the user has to scroll past it anyway").
 *
 * NOTHING IS PLACED IN THIS WAVE. No ad code, no consent platform and no slot id exists, and
 * `AGENTS.md §4` says a slot loads only after required consent. The component therefore renders
 * nothing at all unless `enabled` is true, and no page passes `enabled` today — the permitted
 * insertion point on the homepage is marked with a comment and handed to
 * `monetization-partnerships-engineer` rather than pre-wired with a dead container.
 *
 * HANDOFF: `to: monetization-partnerships-engineer` — this is the API. Pass `placement`, `label`,
 * `size` (one of the `adSlotSizes` IAB units) and `enabled` once a CMP and a slot id exist; fill it
 * through `children`. The reserved box comes from the primitive's `data-size`, so a slot holds its
 * dimensions before, during and after fill.
 */

import type { JSX, ReactNode } from 'react'
import { AdSlot, type AdSlotSize } from '../primitives/AdSlot.tsx'

/**
 * The five permitted placements of `DIRECTIVE.md §20`. Anything not on this list is forbidden, and
 * the forbidden list is the normative one: above the primary search · inside forms · between a
 * warning and its action · inside or beside a rights card · adjacent to "Contact airline" /
 * "Request refund" / "Save evidence" · on auth, checkout, account, admin, privacy, terms, error or
 * status pages · on any paid authenticated experience.
 */
export type AdPlacement =
  | 'home_after_demo_and_first_explainer'
  | 'guide_mid_article'
  | 'guide_end'
  | 'reference_page_after_answer'
  | 'free_trip_after_action_checklist'

export interface AdSlotShellProps {
  readonly placement: AdPlacement
  /** Visible label, e.g. "Advertisement". Copy. */
  readonly label: string
  /** Reserved dimensions, held whether or not the slot fills. Zero CLS is the contract. */
  readonly size: AdSlotSize
  /**
   * False until a real ad unit and the required consent both exist. False renders NOTHING — not an
   * empty box, not a placeholder, not a "sponsored content loading" line.
   */
  readonly enabled: boolean
  readonly children?: ReactNode
  readonly className?: string
}

export function AdSlotShell({
  placement,
  label,
  size,
  enabled,
  children,
  className,
}: AdSlotShellProps): JSX.Element | null {
  if (!enabled) return null

  return (
    <div className={`dpp-ad ${className ?? ''}`} data-ad-placement={placement}>
      <AdSlot label={label} size={size}>
        {children}
      </AdSlot>
    </div>
  )
}
