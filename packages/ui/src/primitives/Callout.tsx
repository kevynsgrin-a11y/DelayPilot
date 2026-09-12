/**
 * Callout — a bounded notice at one of the four severities.
 *
 * `DIRECTIVE.md §16` severities map onto the four status tones: info to neutral slate, watch to
 * watch, urgent to critical, resolved to safe. Four tones, never a fifth colour.
 *
 * Every severity carries its own icon shape and a required title, so the severity survives
 * greyscale, and nothing pulses: an attention animation on a critical state is forbidden
 * (ADR 0003 rule 3). Calm beats dramatic — nothing may look alarmed that is not confirmed.
 *
 * `info` draws the NEUTRAL `info` glyph, not `status-unknown`. `status-unknown` means one specific
 * thing in this product — insufficient fresh information (`AGENTS.md §1.1`) — so an informational
 * notice that wore it told a reader the product was missing data when it was not
 * (`docs/ACCESSIBILITY.md §15.11`, F34). The tone stays neutral, because the four-tone rule is
 * right; once two severities share a colour, the shape is the only channel left and it has to
 * differ.
 *
 * `headingLevel` exists because a Callout is sometimes a SECTION of a page rather than a notice
 * inside one — two of the fifteen `§18.5` cockpit sections are Callouts — and a `<p>` title makes a
 * heading-list jump skip exactly the panels that report something is unavailable
 * (`docs/ACCESSIBILITY.md` F25). It defaults to undefined, which renders the title as a `<p>`: a
 * heading that opens no section is as wrong as a section that has none.
 */

import type { JSX, ReactNode } from 'react'
import { cx } from './class-names.ts'
import { Icon, type IconName } from './Icon.tsx'
import { type InterimSeverity, severityToStatusTone } from '../tokens/interim-contracts.ts'

const SEVERITY_ICON: Readonly<Record<InterimSeverity, IconName>> = {
  info: 'info',
  watch: 'status-watch',
  urgent: 'status-critical',
  resolved: 'status-safe',
}

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export interface CalloutProps {
  readonly severity: InterimSeverity
  /** Visible title. Required: the severity must be readable as words, not inferred from a colour. */
  readonly title: string
  readonly children?: ReactNode
  /** Trailing action row, e.g. a single Button. */
  readonly action?: ReactNode
  /**
   * Renders the title as a heading at this level instead of a `<p>`. Set it only when the callout
   * is itself a section of the page, and set it to match the surrounding heading order.
   *
   * `| undefined` is explicit — unlike Dialog's, this prop is designed to be forwarded through a
   * wrapper (`patterns/StateBlock`), and under `exactOptionalPropertyTypes` a wrapper cannot pass
   * its own optional level straight through unless the receiver accepts `undefined`. The
   * alternative is a default at the boundary, and the absence of a level is exactly what this
   * primitive must keep meaning: no heading.
   */
  readonly headingLevel?: 2 | 3 | 4 | undefined
  /**
   * Id on the title element, so a wrapper can point `aria-labelledby` at it. Forwardable, as above.
   */
  readonly titleId?: string | undefined
  readonly className?: string
}

export function Callout({
  severity,
  title,
  children,
  action,
  headingLevel,
  titleId,
  className,
}: CalloutProps): JSX.Element {
  const Title = headingLevel === undefined ? 'p' : HEADING_TAG[headingLevel]

  return (
    <div
      className={cx('dp-callout', `dp-callout--${severity}`, className)}
      data-status-tone={severityToStatusTone[severity]}
    >
      <Icon name={SEVERITY_ICON[severity]} decorative className="dp-callout__icon" />
      <div className="dp-callout__content">
        <Title className="dp-callout__title" id={titleId}>
          {title}
        </Title>
        {children === undefined ? null : <div className="dp-callout__body">{children}</div>}
      </div>
      {action === undefined ? null : <div className="dp-callout__action">{action}</div>}
    </div>
  )
}
