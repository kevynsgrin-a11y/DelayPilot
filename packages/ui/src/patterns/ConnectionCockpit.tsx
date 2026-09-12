/**
 * ConnectionCockpit — whether this transfer fits, and why.
 *
 * `.claude/agents/frontend-ui-engineer.md` fixes the fields: protected / self-transfer badge ·
 * inbound gate-in estimate · next gate-close estimate · available minutes `W = t_gateClose −
 * t_gateIn` · required minutes `T = T_deplane + T_walk + T_security + T_immigration + T_bag +
 * T_mobility + T_uncertainty` · slack `S = W − T` · every transfer component listed individually
 * with its derivation class · band or validated probability · assumptions · missing data · actions.
 *
 * Three refusals:
 *
 * 1. **No percentage.** `assessment.calibrated` is typed `false`; the render path for a probability
 *    does not exist in this file. W, T, S, the band and the assumptions are what the engine can
 *    honestly produce (`DIRECTIVE.md §13`, §18.5).
 * 2. **No unlabelled policy.** When `gateCloseRuleKnown` is false the gate-close figure is rendered
 *    as a BUFFER ESTIMATE with that word attached. Presenting an assumed cutoff as the airline's
 *    rule is a fabricated operational fact (`AGENTS.md §1.1`).
 * 3. **No "looks feasible, therefore protected".** `topology` is rendered verbatim. A self-transfer
 *    gets the baggage / immigration / recheck explanation prominently, above the component table,
 *    and is never described as protected.
 *
 * Every one of the seven `T` terms is listed even when it contributes nothing, because "we did not
 * count immigration" and "immigration does not apply here" are different statements and only one of
 * them is true.
 */

import type { JSX, ReactNode } from 'react'
import { Badge } from '../primitives/Badge.tsx'
import { Card } from '../primitives/Card.tsx'
import { DataTable, type DataTableColumn } from '../primitives/DataTable.tsx'
import { ProvenanceChip } from '../primitives/ProvenanceChip.tsx'
import { BandMeter } from './BandMeter.tsx'
import { Disclaimer, DefinitionRow, MaybeValue, ZonedTimeView } from './atoms.tsx'
import type {
  Band,
  ConnectionAssessment,
  ConnectionTopology,
  DerivationClass,
  TransferComponent,
} from './types.ts'

export interface ConnectionCockpitCopy {
  readonly heading: string
  readonly topologyLabel: Readonly<Record<ConnectionTopology, string>>
  /** The §27 sentence for the topology: protected / self-transfer / topology missing. */
  readonly topologyNote: Readonly<Record<ConnectionTopology, string>>
  /** Shown above the table when the topology is `self_transfer` or `mixed_ticket`. */
  readonly selfTransferExplanation: string
  readonly gateInLabel: string
  readonly gateCloseLabel: string
  readonly gateCloseBufferLabel: string
  readonly availableLabel: string
  readonly requiredLabel: string
  readonly slackLabel: string
  readonly componentsHeading: string
  readonly componentCaption: string
  readonly componentColumnStep: string
  readonly componentColumnMinutes: string
  readonly componentColumnDerivation: string
  readonly derivationLabel: Readonly<Record<DerivationClass, string>>
  readonly notRequiredLabel: string
  readonly assumptionsHeading: string
  readonly missingDataHeading: string
  readonly bandLabel: (band: Band) => string
  readonly bandStops: Readonly<Record<Band, string>>
  readonly bandScaleLabel: string
  readonly currentBandLabel: string
  readonly meterLabel: string
  readonly meterValueText: string
  readonly heuristicNote: string
  readonly minutesText: (minutes: number) => string
  readonly zoneLabel: string
  readonly estimatedLabel: string
  /** `DIRECTIVE.md §26` connection disclaimer, verbatim. */
  readonly disclaimer: string
  readonly disclaimerLabel: string
  readonly demoCaption?: string
}

export interface ConnectionCockpitProps {
  readonly assessment: ConnectionAssessment
  readonly copy: ConnectionCockpitCopy
  readonly headingLevel?: 2 | 3 | 4
  /** The next-best actions for this transfer. Rendered after the assessment, never before it. */
  readonly actions?: ReactNode
  readonly className?: string
}

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export function ConnectionCockpit({
  assessment,
  copy,
  headingLevel = 3,
  actions,
  className,
}: ConnectionCockpitProps): JSX.Element {
  const Heading = HEADING_TAG[headingLevel]
  const headingId = `connection-${assessment.id}-title`
  const separateTickets =
    assessment.topology === 'self_transfer' || assessment.topology === 'mixed_ticket'

  const columns: readonly DataTableColumn<TransferComponent>[] = [
    {
      key: 'step',
      header: copy.componentColumnStep,
      rowHeader: true,
      cell: (row) => row.label,
    },
    {
      key: 'minutes',
      header: copy.componentColumnMinutes,
      numeric: true,
      cell: (row) =>
        row.applies ? (
          <MaybeValue value={row.minutes} render={(minutes) => copy.minutesText(minutes)} />
        ) : (
          <span className="dpp-not-required">{copy.notRequiredLabel}</span>
        ),
    },
    {
      key: 'derivation',
      header: copy.componentColumnDerivation,
      cell: (row) => <Badge>{copy.derivationLabel[row.derivation]}</Badge>,
    },
  ]

  return (
    <Card as="section" aria-labelledby={headingId} className={`dpp-connection ${className ?? ''}`}>
      <header className="dpp-connection__header">
        <Heading className="dpp-connection__title" id={headingId}>
          {copy.heading}
        </Heading>
        <p className="dpp-connection__badges">
          <Badge tone="accent">{copy.topologyLabel[assessment.topology]}</Badge>
          <span className="dpp-connection__airport">
            <span className="tnum">{assessment.airport.code}</span> {assessment.airport.name}
          </span>
        </p>
        <ProvenanceChip
          kind={assessment.provenance.kind}
          {...(assessment.provenance.freshness === undefined
            ? {}
            : { freshness: assessment.provenance.freshness })}
        />
        {assessment.provenance.kind === 'demo' && copy.demoCaption !== undefined ? (
          <p className="dpp-provenance__demo">{copy.demoCaption}</p>
        ) : null}
      </header>

      <p className="dpp-connection__topology-note">{copy.topologyNote[assessment.topology]}</p>

      {separateTickets ? (
        <p className="dpp-connection__self-transfer">{copy.selfTransferExplanation}</p>
      ) : null}

      <BandMeter
        band={assessment.band}
        label={copy.meterLabel}
        valueText={copy.meterValueText}
        bandLabel={copy.bandLabel(assessment.band)}
        stopLabels={copy.bandStops}
        scaleLabel={copy.bandScaleLabel}
        currentStopLabel={copy.currentBandLabel}
        calibrated={assessment.calibrated}
        heuristicNote={copy.heuristicNote}
        {...(assessment.availableMinutes.known && assessment.requiredMinutes.known
          ? { value: assessment.requiredMinutes.value, max: assessment.availableMinutes.value }
          : {})}
      />

      <dl className="dpp-connection__figures">
        <DefinitionRow label={copy.gateInLabel}>
          <MaybeValue
            value={assessment.gateIn}
            render={(gateIn) => (
              <ZonedTimeView
                time={gateIn.time}
                estimated={gateIn.estimated}
                estimatedLabel={copy.estimatedLabel}
                zoneLabel={copy.zoneLabel}
              />
            )}
          />
        </DefinitionRow>
        <DefinitionRow
          label={copy.gateCloseLabel}
          note={assessment.gateCloseRuleKnown ? undefined : copy.gateCloseBufferLabel}
        >
          <MaybeValue
            value={assessment.gateClose}
            render={(gateClose) => (
              <ZonedTimeView
                time={gateClose.time}
                estimated={gateClose.estimated}
                estimatedLabel={copy.estimatedLabel}
                zoneLabel={copy.zoneLabel}
              />
            )}
          />
        </DefinitionRow>
        <DefinitionRow label={copy.availableLabel}>
          <MaybeValue
            className="tnum"
            value={assessment.availableMinutes}
            render={(minutes) => copy.minutesText(minutes)}
          />
        </DefinitionRow>
        <DefinitionRow label={copy.requiredLabel}>
          <MaybeValue
            className="tnum"
            value={assessment.requiredMinutes}
            render={(minutes) => copy.minutesText(minutes)}
          />
        </DefinitionRow>
        <DefinitionRow label={copy.slackLabel}>
          <MaybeValue
            className="tnum"
            value={assessment.slackMinutes}
            render={(minutes) => copy.minutesText(minutes)}
          />
        </DefinitionRow>
      </dl>

      <div className="dpp-connection__components">
        <DataTable
          caption={copy.componentCaption}
          columns={columns}
          rows={assessment.components}
          rowKey={(row) => row.key}
        />
      </div>

      <div className="dpp-connection__notes">
        <section className="dpp-connection__note-group">
          <h4 className="dpp-connection__note-heading">{copy.assumptionsHeading}</h4>
          <ul className="dpp-list">
            {assessment.assumptions.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
        <section className="dpp-connection__note-group">
          <h4 className="dpp-connection__note-heading">{copy.missingDataHeading}</h4>
          <ul className="dpp-list">
            {assessment.missingData.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      </div>

      {actions}

      <Disclaimer label={copy.disclaimerLabel}>{copy.disclaimer}</Disclaimer>
    </Card>
  )
}
