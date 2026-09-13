/**
 * The small shared pieces every pattern is built from.
 *
 * One idea runs through all of them: a value that is not known renders as a SENTENCE, never as a
 * blank, a dash or a zero (`AGENTS.md §1.1`). `MaybeValue` is where that is enforced — it cannot
 * render an empty string, because `Maybe` cannot carry an absent value without a reason.
 *
 * No copy is authored here. Every string is a prop, following the convention the primitives set:
 * copy belongs to `ux-copy-steward`, and a pattern that hard-coded a sentence would put product
 * copy inside a package that has no copy review (`docs/agents/ROSTER.md §5`).
 */

import type { JSX, ReactNode } from 'react'
import { ProvenanceChip } from '../primitives/ProvenanceChip.tsx'
import { VisuallyHidden } from '../primitives/VisuallyHidden.tsx'
import { isFixtureSourced } from './types.ts'
import type { Maybe, Provenance, ZonedTime } from './types.ts'
import { clockTime, localDate, zoneName } from './time.ts'

/* ------------------------------------------------------------------------------------------- */

export interface MaybeValueProps<T> {
  readonly value: Maybe<T>
  readonly render: (value: T) => ReactNode
  /** Extra class on the wrapper, e.g. `tnum` for a figure. */
  readonly className?: string
}

/**
 * Render a value, or the designed unknown state carrying its reason.
 *
 * The unknown branch is marked with `data-state="unknown"` so a test — and
 * `apps/web/scripts/verify-dist.mjs` — can find every unknown on a page without parsing prose.
 */
export function MaybeValue<T>({ value, render, className }: MaybeValueProps<T>): JSX.Element {
  if (value.known) {
    return <span className={className}>{render(value.value)}</span>
  }
  return (
    <span className="dpp-unknown" data-state="unknown">
      {value.reason}
    </span>
  )
}

/* ------------------------------------------------------------------------------------------- */

export interface DefinitionRowProps {
  readonly label: ReactNode
  readonly children: ReactNode
  /** Rendered after the value, e.g. a provenance chip or a derivation-class badge. */
  readonly note?: ReactNode
}

/** One label/value pair inside a `<dl>`. */
export function DefinitionRow({ label, children, note }: DefinitionRowProps): JSX.Element {
  return (
    <div className="dpp-row">
      <dt className="dpp-row__label">{label}</dt>
      <dd className="dpp-row__value">
        {children}
        {note === undefined ? null : <span className="dpp-row__note">{note}</span>}
      </dd>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------- */

export interface ZonedTimeViewProps {
  readonly time: ZonedTime
  /** True when the instant is an estimate rather than an actual. Rendered as a word, not a style. */
  readonly estimated?: boolean
  /** Copy: the word for an estimated value, e.g. "estimated". */
  readonly estimatedLabel?: string
  /** Copy: accessible prefix for the zone line, e.g. "airport and time zone". */
  readonly zoneLabel: string
  /** Show the local calendar date as well — required on any overnight or date-line leg. */
  readonly withDate?: boolean
}

/**
 * One displayed instant, with its airport code and its IANA zone.
 *
 * `AGENTS.md §3.3` requires both labels on every displayed time, so both are rendered as visible
 * text: the zone NAME at that instant (which changes across a DST boundary, and should) and the
 * IANA identifier itself (which does not, and is what makes the label unambiguous). Never an
 * offset — see `zoneName` for why `timeZoneName: 'short'` was not usable.
 */
export function ZonedTimeView({
  time,
  estimated = false,
  estimatedLabel,
  zoneLabel,
  withDate = false,
}: ZonedTimeViewProps): JSX.Element {
  return (
    <span className="dpp-time">
      <span className="dpp-time__clock tnum">{clockTime(time.instant, time.zone)}</span>
      <span className="dpp-time__zone">
        <VisuallyHidden>{zoneLabel}</VisuallyHidden>
        <span className="dpp-time__code tnum">{time.airport}</span>
        <span className="dpp-time__abbr">{zoneName(time.instant, time.zone)}</span>
        <span className="dpp-time__iana">{time.zone}</span>
      </span>
      {withDate ? (
        <span className="dpp-time__date">{localDate(time.instant, time.zone)}</span>
      ) : null}
      {estimated && estimatedLabel !== undefined ? (
        <span className="dpp-time__estimated">{estimatedLabel}</span>
      ) : null}
    </span>
  )
}

/* ------------------------------------------------------------------------------------------- */

export interface ProvenanceHeaderProps {
  readonly provenance: Provenance
  /**
   * "Demo data — not a live flight." Required whenever `provenance.kind` is `demo`
   * (`AGENTS.md §1.2`); the type cannot enforce that, so `ProvenanceHeader` asserts it visually by
   * rendering the caption immediately beside the chip.
   */
  readonly demoCaption?: string
  /** Optional heading-level context, e.g. the panel title, rendered before the chip. */
  readonly children?: ReactNode
}

/**
 * The provenance line that sits at the top of every data-bearing panel.
 *
 * Chip + freshness +, in demo mode, the demo sentence. Never implied, never in a tooltip, never
 * only in the footer: the label travels with the datum to the pixel (`AGENTS.md §1.2`).
 */
export function ProvenanceHeader({
  provenance,
  demoCaption,
  children,
}: ProvenanceHeaderProps): JSX.Element {
  return (
    /* `data-fixture`: see `SegmentCard`. The chip word answers freshness; this answers origin. */
    <div
      className="dpp-provenance"
      {...(isFixtureSourced(provenance) ? { 'data-fixture': 'true' } : {})}
    >
      {children}
      <ProvenanceChip
        kind={provenance.kind}
        {...(provenance.freshness === undefined ? {} : { freshness: provenance.freshness })}
      />
      {isFixtureSourced(provenance) && demoCaption !== undefined ? (
        <p className="dpp-provenance__demo">{demoCaption}</p>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------- */

export interface DisclaimerProps {
  /** One of the `DIRECTIVE.md §26` sentences, verbatim, from `lib/copy/disclaimers`. */
  readonly children: ReactNode
  /** Accessible label for the note, e.g. "Flight data disclaimer". */
  readonly label: string
}

/**
 * A `§26` disclaimer, rendered BESIDE the result it qualifies rather than only in the footer.
 *
 * It is a `<p>` inside a labelled `role="note"`, so a screen-reader user hears what the sentence
 * qualifies ("Connection disclaimer") before hearing the sentence.
 *
 * THERE IS NO ICON, AND THAT IS NOW A CHOICE RATHER THAN A GAP. The handoff this comment used to
 * record has landed: a neutral `info` glyph exists (`primitives/Icon.tsx`) and `Callout` and `Toast`
 * draw it for `info` severity (`docs/ACCESSIBILITY.md §15.11`, F34). `Disclaimer` still takes none.
 *
 * Two reasons, in order. A `§26` disclaimer is not a notice a reader can act on or dismiss — it is
 * a permanent qualification on the result beside it — and drawing it with the same mark as a
 * `Callout` would put the two in one visual class when only one of them ever says something new.
 * And these sentences already sit inside a named `role="note"` with a left rule; an icon adds a
 * second silhouette to a block whose whole job is to be quiet enough to live under every result on
 * the page without competing with it. If that judgement changes, the glyph is there.
 */
export function Disclaimer({ children, label }: DisclaimerProps): JSX.Element {
  return (
    <div className="dpp-disclaimer" role="note" aria-label={label}>
      <p className="dpp-disclaimer__text">{children}</p>
    </div>
  )
}
