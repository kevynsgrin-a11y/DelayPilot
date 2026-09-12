/**
 * ActionChecklist — the next useful steps, in the order they matter.
 *
 * Ordering is `orderActionItems`: soonest-expiring deadline first, then irreversible before
 * reversible, then the internal utility `U`, then the id. `U` is never rendered here — this file
 * has no reference to `item.utility` at all, which is the point (see `action-order.ts`).
 *
 * An irreversible item carries an explicit consequence line, because "Accept the voucher" and
 * "Accept the voucher — doing so may end your claim to a cash refund" are different offers, and a
 * traveler at a gate reads the first one as free.
 *
 * Every item is source-linked. A commercial affiliate is never the primary route to a statutory
 * right (`AGENTS.md §4`), which is why this component renders official sources only: it has no
 * affiliate slot to put one in.
 */

import type { JSX } from 'react'
import { Badge } from '../primitives/Badge.tsx'
import { Card } from '../primitives/Card.tsx'
import { Link } from '../primitives/Link.tsx'
import { MaybeValue, ZonedTimeView } from './atoms.tsx'
import { orderActionItems } from './action-order.ts'
import type { ActionItem } from './types.ts'

export interface ActionChecklistCopy {
  readonly heading: string
  readonly deadlineLabel: string
  readonly irreversibleLabel: string
  readonly reversibleLabel: string
  readonly consequenceLabel: string
  readonly jurisdictionLabel: string
  readonly sourcesLabel: string
  readonly newTabLabel: string
  readonly sourceUnavailableLabel: string
  readonly zoneLabel: string
  readonly emptyLabel: string
}

export interface ActionChecklistProps {
  readonly items: readonly ActionItem[]
  readonly copy: ActionChecklistCopy
  readonly headingLevel?: 2 | 3 | 4
  readonly idPrefix: string
  readonly className?: string
}

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export function ActionChecklist({
  items,
  copy,
  headingLevel = 3,
  idPrefix,
  className,
}: ActionChecklistProps): JSX.Element {
  const Heading = HEADING_TAG[headingLevel]
  const headingId = `${idPrefix}-actions-title`
  const ordered = orderActionItems(items)

  return (
    <Card as="section" aria-labelledby={headingId} className={`dpp-actions ${className ?? ''}`}>
      <Heading className="dpp-actions__title" id={headingId}>
        {copy.heading}
      </Heading>

      {ordered.length === 0 ? (
        <p className="dpp-actions__empty">{copy.emptyLabel}</p>
      ) : (
        <ol className="dpp-actions__list">
          {ordered.map((item) => (
            <li
              key={item.id}
              className="dpp-actions__item"
              data-reversible={String(item.reversible)}
            >
              <p className="dpp-actions__label">{item.label}</p>
              <p className="dpp-actions__detail">{item.detail}</p>

              <p className="dpp-actions__meta">
                <Badge>{item.reversible ? copy.reversibleLabel : copy.irreversibleLabel}</Badge>
                <span className="dpp-actions__deadline">
                  <span className="dpp-actions__meta-label">{copy.deadlineLabel}</span>{' '}
                  <MaybeValue
                    value={item.deadline}
                    render={(time) => (
                      <ZonedTimeView time={time} zoneLabel={copy.zoneLabel} withDate />
                    )}
                  />
                </span>
                {item.jurisdiction === undefined ? null : (
                  <span className="dpp-actions__jurisdiction">
                    <span className="dpp-actions__meta-label">{copy.jurisdictionLabel}</span>{' '}
                    {item.jurisdiction}
                  </span>
                )}
              </p>

              {item.reversible || item.consequence === undefined ? null : (
                <p className="dpp-actions__consequence">
                  <span className="dpp-actions__meta-label">{copy.consequenceLabel}</span>{' '}
                  {item.consequence}
                </p>
              )}

              {item.sources.length === 0 ? null : (
                <p className="dpp-actions__sources">
                  <span className="dpp-actions__meta-label">{copy.sourcesLabel}</span>{' '}
                  {item.sources.map((source, index) => (
                    <span key={source.id}>
                      {index === 0 ? null : <span aria-hidden="true"> · </span>}
                      {source.href === undefined ? (
                        <span className="dpp-rights__source-offline">
                          {source.label}
                          <span className="dpp-rights__source-note">
                            {' '}
                            — {copy.sourceUnavailableLabel}
                          </span>
                        </span>
                      ) : (
                        <Link href={source.href} newTab={copy.newTabLabel}>
                          {source.label}
                        </Link>
                      )}
                    </span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </Card>
  )
}
