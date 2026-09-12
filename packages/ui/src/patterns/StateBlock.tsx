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
  /**
   * Render the title as a heading at this level instead of the `Callout`'s default `<p>`.
   *
   * Set it when the state block IS a section of the page rather than a notice inside one. Two of
   * the fifteen `§18.5` cockpit sections are state blocks — "Weather and airspace" and the upgrade
   * prompt — and with a `<p>` title a heading-list jump skipped exactly the two panels that report
   * something is unavailable (`docs/ACCESSIBILITY.md` F25). Forwarded to `Callout`, which defaults
   * to `<p>`: a heading that opens no section is as wrong as a section that has none.
   */
  readonly headingLevel?: 2 | 3 | 4 | undefined
  /** Id on the title element, so a wrapper can point `aria-labelledby` at it. */
  readonly titleId?: string | undefined
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
  headingLevel,
  titleId,
  className,
}: StateBlockProps): JSX.Element {
  return (
    <div className={`dpp-state ${className ?? ''}`} data-state={kind}>
      {/* Both forwarded straight through: `Callout` accepts `| undefined` on each precisely so a
          wrapper does not have to reintroduce a default, and the ABSENCE of a heading level is
          what has to keep meaning "no heading" (see the primitive's note). */}
      <Callout
        severity={severity}
        title={title}
        action={action}
        headingLevel={headingLevel}
        titleId={titleId}
      >
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
  /**
   * `true` when this block ILLUSTRATES the searching state rather than being in it — an explainer
   * page showing a reader what a lookup looks like while it waits.
   *
   * It drops `aria-busy` and nothing else: the skeleton, the message and the reserved box all stay,
   * so the picture is identical and the claim is not made. `/flight-status/` renders the `§17`
   * searching state as an example, and with `aria-busy="true"` the page permanently told assistive
   * technology that a region was updating while nothing loaded — technology that honours the
   * attribute may defer or skip the whole block (`docs/ACCESSIBILITY.md` F28). A state that is not
   * true must not be in the accessibility tree (`AGENTS.md §1.1`).
   */
  readonly illustration?: boolean
  readonly className?: string
}

/**
 * The `searching` / `skeleton` state.
 *
 * `aria-busy="true"` sits on the region, and the message is rendered as visible text as well as
 * being the region's description — a spinner that says nothing is indistinguishable from a page
 * that has stopped working.
 *
 * `illustration` drops `aria-busy` for a page that is SHOWING this state rather than being in it.
 * See the prop's own note: the picture is the same, the claim is not made.
 */
export function LoadingBlock({
  label,
  message,
  lines = 3,
  illustration = false,
  className,
}: LoadingBlockProps): JSX.Element {
  return (
    <div
      className={`dpp-state dpp-loading ${className ?? ''}`}
      data-state="searching"
      role="group"
      aria-label={label}
      {...(illustration ? {} : { 'aria-busy': 'true' })}
    >
      <p className="dpp-loading__message">{message}</p>
      <div className="dpp-loading__bones">
        {/* One placeholder, `lines` bones. `live` stays off: the region above carries aria-busy. */}
        <Skeleton variant="text-block" lines={lines} label={message} />
      </div>
    </div>
  )
}
