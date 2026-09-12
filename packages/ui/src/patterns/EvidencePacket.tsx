/**
 * EvidencePacket — a factual record a traveler can print.
 *
 * `DIRECTIVE.md §18.5`: trip and segment summary · original schedule · status-change chronology ·
 * user-entered airline messages · receipts/expense table · rights assessment with rule-set version ·
 * missing evidence · official source URLs · disclaimer. Save-as-PDF via the print stylesheet.
 *
 * What it is NOT, and the file is written so it cannot become one: it is not a demand letter, it is
 * never auto-emailed, and it never submits anything on anyone's behalf (`AGENTS.md §2`). There is
 * no send control here and no address field. It states what happened, with timestamps and sources,
 * and lets the person decide what to do with it.
 *
 * The "missing evidence" section is the most useful part and the easiest to drop: a packet that
 * silently omits what it could not establish reads as complete, and a traveler submits it believing
 * it is. Listing the gaps is what makes the rest trustworthy.
 */

import type { JSX } from 'react'
import { Card } from '../primitives/Card.tsx'
import { DataTable, type DataTableColumn } from '../primitives/DataTable.tsx'
import { Link } from '../primitives/Link.tsx'
import { ProvenanceChip } from '../primitives/ProvenanceChip.tsx'
import { Disclaimer, ZonedTimeView } from './atoms.tsx'
import type { Provenance, RightsSourceLink, ZonedTime } from './types.ts'

export interface EvidenceChronologyEntry {
  readonly id: string
  readonly at: ZonedTime
  readonly what: string
  readonly source: string
}

export interface EvidenceExpense {
  readonly id: string
  readonly what: string
  /** Amount as the string the user entered, with their currency. Never re-computed here. */
  readonly amount: string
  readonly at: ZonedTime
}

export interface EvidencePacketCopy {
  readonly heading: string
  readonly summaryHeading: string
  readonly scheduleHeading: string
  readonly chronologyHeading: string
  readonly messagesHeading: string
  readonly expensesHeading: string
  readonly rightsHeading: string
  readonly missingHeading: string
  readonly sourcesHeading: string
  readonly chronologyCaption: string
  readonly expensesCaption: string
  readonly columnWhen: string
  readonly columnWhat: string
  readonly columnSource: string
  readonly columnAmount: string
  readonly emptyMessages: string
  readonly emptyExpenses: string
  readonly zoneLabel: string
  readonly newTabLabel: string
  readonly sourceUnavailableLabel: string
  readonly ruleSetLabel: string
  /** `DIRECTIVE.md §26` rights disclaimer, verbatim. */
  readonly disclaimer: string
  readonly disclaimerLabel: string
  readonly demoCaption?: string
}

export interface EvidencePacketProps {
  readonly copy: EvidencePacketCopy
  readonly tripTitle: string
  readonly summaryLines: readonly string[]
  readonly scheduleLines: readonly string[]
  readonly chronology: readonly EvidenceChronologyEntry[]
  /** Messages the traveler entered by hand. Never read from an inbox (`AGENTS.md §2`). */
  readonly airlineMessages: readonly string[]
  readonly expenses: readonly EvidenceExpense[]
  readonly rightsSummary: readonly string[]
  readonly ruleSet: string
  readonly missingEvidence: readonly string[]
  readonly sources: readonly RightsSourceLink[]
  readonly provenance: Provenance
  readonly headingLevel?: 2 | 3 | 4
  readonly idPrefix: string
  readonly className?: string
}

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export function EvidencePacket({
  copy,
  tripTitle,
  summaryLines,
  scheduleLines,
  chronology,
  airlineMessages,
  expenses,
  rightsSummary,
  ruleSet,
  missingEvidence,
  sources,
  provenance,
  headingLevel = 3,
  idPrefix,
  className,
}: EvidencePacketProps): JSX.Element {
  const Heading = HEADING_TAG[headingLevel]
  const headingId = `${idPrefix}-evidence-title`

  const chronologyColumns: readonly DataTableColumn<EvidenceChronologyEntry>[] = [
    {
      key: 'when',
      header: copy.columnWhen,
      rowHeader: true,
      cell: (row) => <ZonedTimeView time={row.at} zoneLabel={copy.zoneLabel} withDate />,
    },
    { key: 'what', header: copy.columnWhat, cell: (row) => row.what },
    { key: 'source', header: copy.columnSource, cell: (row) => row.source },
  ]

  const expenseColumns: readonly DataTableColumn<EvidenceExpense>[] = [
    { key: 'what', header: copy.columnWhat, rowHeader: true, cell: (row) => row.what },
    {
      key: 'when',
      header: copy.columnWhen,
      cell: (row) => <ZonedTimeView time={row.at} zoneLabel={copy.zoneLabel} withDate />,
    },
    { key: 'amount', header: copy.columnAmount, numeric: true, cell: (row) => row.amount },
  ]

  return (
    <Card as="section" aria-labelledby={headingId} className={`dpp-evidence ${className ?? ''}`}>
      <header className="dpp-evidence__header">
        <Heading className="dpp-evidence__title" id={headingId}>
          {copy.heading}
        </Heading>
        <p className="dpp-evidence__trip">{tripTitle}</p>
        <ProvenanceChip
          kind={provenance.kind}
          {...(provenance.freshness === undefined ? {} : { freshness: provenance.freshness })}
        />
        {provenance.kind === 'demo' && copy.demoCaption !== undefined ? (
          <p className="dpp-provenance__demo">{copy.demoCaption}</p>
        ) : null}
      </header>

      <section className="dpp-evidence__section">
        <h4 className="dpp-evidence__subheading">{copy.summaryHeading}</h4>
        <ul className="dpp-list">
          {summaryLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="dpp-evidence__section">
        <h4 className="dpp-evidence__subheading">{copy.scheduleHeading}</h4>
        <ul className="dpp-list">
          {scheduleLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="dpp-evidence__section">
        <h4 className="dpp-evidence__subheading">{copy.chronologyHeading}</h4>
        <DataTable
          caption={copy.chronologyCaption}
          columns={chronologyColumns}
          rows={chronology}
          rowKey={(row) => row.id}
        />
      </section>

      <section className="dpp-evidence__section">
        <h4 className="dpp-evidence__subheading">{copy.messagesHeading}</h4>
        {airlineMessages.length === 0 ? (
          <p className="dpp-evidence__empty" data-state="empty">
            {copy.emptyMessages}
          </p>
        ) : (
          <ul className="dpp-list">
            {airlineMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="dpp-evidence__section">
        <h4 className="dpp-evidence__subheading">{copy.expensesHeading}</h4>
        {expenses.length === 0 ? (
          <p className="dpp-evidence__empty" data-state="empty">
            {copy.emptyExpenses}
          </p>
        ) : (
          <DataTable
            caption={copy.expensesCaption}
            columns={expenseColumns}
            rows={expenses}
            rowKey={(row) => row.id}
          />
        )}
      </section>

      <section className="dpp-evidence__section">
        <h4 className="dpp-evidence__subheading">{copy.rightsHeading}</h4>
        <p className="dpp-evidence__rule-set">
          <span className="dpp-row__label">{copy.ruleSetLabel}</span> {ruleSet}
        </p>
        <ul className="dpp-list">
          {rightsSummary.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="dpp-evidence__section">
        <h4 className="dpp-evidence__subheading">{copy.missingHeading}</h4>
        <ul className="dpp-list">
          {missingEvidence.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="dpp-evidence__section">
        <h4 className="dpp-evidence__subheading">{copy.sourcesHeading}</h4>
        <ul className="dpp-list">
          {sources.map((source) => (
            <li key={source.id}>
              {source.href === undefined ? (
                <span className="dpp-rights__source-offline">
                  {source.label}
                  <span className="dpp-rights__source-note"> — {copy.sourceUnavailableLabel}</span>
                </span>
              ) : (
                <Link href={source.href} newTab={copy.newTabLabel}>
                  {source.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Disclaimer label={copy.disclaimerLabel}>{copy.disclaimer}</Disclaimer>
    </Card>
  )
}
