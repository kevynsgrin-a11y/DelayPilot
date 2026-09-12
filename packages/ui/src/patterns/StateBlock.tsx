/**
 * State-matrix wrappers — every `DIRECTIVE.md §17` state that is a WHOLE-PANEL condition.
 *
 * The rule these enforce is `AGENTS.md §1.1` and `§1.6` together: a surface that has no data
 * renders a designed, named, labelled state — never a blank, never a dash, never a zero, never a
 * spinner with no announcement. Each state here is a render, not a branch that returns `null`.
 *
 * `kind` is the §17 state name, emitted as `data-state` on the container so a test, an axe run and
 * `apps/web/scripts/verify-dist.mjs` can enumerate the states a built page actually reaches.
 *
 * `skeleton` is the one with a behavioural requirement beyond markup: the region that is loading
 * carries `aria-busy="true"` (the other half of `docs/ACCESSIBILITY.md` B4, handed to this phase),
 * and the `Skeleton` primitive's own `live` flag stays OFF — one announcement per load, from the
 * region, not one per bone.
 */

import type { JSX, ReactNode } from 'react'
import { Callout } from '../primitives/Callout.tsx'
import { Skeleton, type SkeletonLines } from '../primitives/Skeleton.tsx'
import type { InterimSeverity } from '../tokens/interim-contracts.ts'

/** The `DIRECTIVE.md §17` states that a whole panel can be in. */
export type PanelStateKind =
  | 'initial'
  | 'searching'
  | 'skeleton'
  | 'empty'
  | 'no_match'
  | 'multiple_matches'
  | 'invalid_flight'
  | 'provider_unavailable'
  | 'rate_limited'
  | 'stale'
  | 'partial_data'
  | 'conflicting_providers'
  | 'offline'
  | 'slow_network'
  | 'unsupported_browser'
  | 'error_boundary'
  | 'maintenance'
  | 'consent_required'
  | 'ad_blocked'
  | 'affiliate_unavailable'
  | 'billing_not_configured'
  | 'demo'

export interface StateBlockProps {
  readonly kind: PanelStateKind
  readonly severity: InterimSeverity
  /** Visible title. Copy. */
  readonly title: string
  /** One or more sentences explaining the state and what a traveler can do about it. */
  readonly children?: ReactNode
  /** A real control, never a disabled one (`AGENTS.md §1.6`). */
  readonly action?: ReactNode
  readonly className?: string
}

/**
 * A named §17 state, rendered as a labelled callout.
 *
 * `severity` maps onto the four status tones; there is no fifth. A `provider unavailable` state is
 * `watch`, not `urgent`: the flight has not gone wrong, our view of it has, and shouting about it
 * spends a traveler's attention on our problem.
 */
export function StateBlock({
  kind,
  severity,
  title,
  children,
  action,
  className,
}: StateBlockProps): JSX.Element {
  return (
    <div className={`dpp-state ${className ?? ''}`} data-state={kind}>
      <Callout severity={severity} title={title} action={action}>
        {children}
      </Callout>
    </div>
  )
}

export interface LoadingBlockProps {
  /** Accessible name of the region that is loading, e.g. "Flight result". Copy. */
  readonly label: string
  /** The sentence announced while loading, e.g. "Searching for that flight." Copy. */
  readonly message: string
  /** Number of skeleton lines to reserve. The variant reserves its box, so nothing shifts. */
  readonly lines?: SkeletonLines
  readonly className?: string
}

/**
 * The `searching` / `skeleton` state.
 *
 * `aria-busy="true"` sits on the region, and the message is rendered as visible text as well as
 * being the region's description — a spinner that says nothing is indistinguishable from a page
 * that has stopped working.
 */
export function LoadingBlock({
  label,
  message,
  lines = 3,
  className,
}: LoadingBlockProps): JSX.Element {
  return (
    <div
      className={`dpp-state dpp-loading ${className ?? ''}`}
      data-state="searching"
      role="group"
      aria-label={label}
      aria-busy="true"
    >
      <p className="dpp-loading__message">{message}</p>
      <div className="dpp-loading__bones">
        {/* One placeholder, `lines` bones. `live` stays off: the region above carries aria-busy. */}
        <Skeleton variant="text-block" lines={lines} label={message} />
      </div>
    </div>
  )
}
