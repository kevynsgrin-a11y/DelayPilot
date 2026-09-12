/**
 * The adapter between `apps/web/src/lib/copy/**` (ux-copy-steward) and the pattern components'
 * `copy` props (`packages/ui/src/patterns/**`).
 *
 * It exists so that the patterns hold no copy — every string they render arrives as a prop — and so
 * the mapping from copy-module export to component prop lives in ONE file rather than being
 * re-derived on every page.
 *
 * TWO MAPPINGS LIVE HERE BECAUSE THEY BELONG TO NEITHER SIDE:
 *
 * 1. **Derivation classes.** The copy module keys them `measured | policy | airport | estimated`;
 *    the pattern type keys them `measured | policy_derived | airport_derived | estimated`. The
 *    translation is a frontend concern and is resolved here, not in either owner's tree.
 * 2. **Band → status tone.** `on_track→safe`, `watch→watch`, `at_risk→critical`,
 *    `disrupted→critical`, `unknown→unknown`. Two bands share `critical` deliberately: the tone is
 *    reinforcement and the band WORD is the signal (`DIRECTIVE.md §7`, never colour alone). Mapping
 *    `at_risk` to `watch` would understate it, which is the direction that costs a traveler money.
 *    It lives in `packages/ui/src/patterns/types.ts` as `bandToStatusTone`, which is this agent's
 *    file; nothing about it belongs in the copy tree.
 *
 * F24 (`docs/ACCESSIBILITY.md`): `valueText` and `bandLabel` must never be the same string, because
 * `ProgressBar` joins them into one `aria-valuetext` and "Unknown, Unknown" is a poor rendering of
 * the one state a traveler most needs to trust. The reading always comes from `slackValueText` or
 * `delayValueText` and the band always from `bandLabel`.
 */

import type {
  ActionChecklistCopy,
  AlertTimelineCopy,
  Band,
  Confidence,
  ConnectionCockpitCopy,
  ConnectionTopology,
  DerivationClass,
  EvidencePacketCopy,
  ItineraryTimelineCopy,
  RightsCardCopy,
  SegmentCardCopy,
  SegmentStatus,
  SourceFreshnessPanelCopy,
} from '../../../../packages/ui/src/patterns/index.ts'
import {
  bandLabel,
  delayValueText,
  slackValueText,
  type Band as CopyBand,
} from '../lib/copy/bands.ts'
import { cockpit } from '../lib/copy/cockpit.ts'
import { disclaimers } from '../lib/copy/disclaimers.ts'
import { nav } from '../lib/copy/nav.ts'
import { results } from '../lib/copy/results.ts'
import { disclaimerLabels } from './copy-gaps.ts'

/** The two band vocabularies are the same five words; this assignment keeps them that way. */
const asCopyBand = (band: Band): CopyBand => band

export const bandWord = (band: Band): string => bandLabel(asCopyBand(band))

export const bandStops: Readonly<Record<Band, string>> = {
  on_track: bandWord('on_track'),
  watch: bandWord('watch'),
  at_risk: bandWord('at_risk'),
  disrupted: bandWord('disrupted'),
  unknown: bandWord('unknown'),
}

const derivationLabel: Readonly<Record<DerivationClass, string>> = {
  measured: cockpit.connection.derivation.measured,
  policy_derived: cockpit.connection.derivation.policy,
  airport_derived: cockpit.connection.derivation.airport,
  estimated: cockpit.connection.derivation.estimated,
}

const statusWord = (status: SegmentStatus): string => cockpit.segment.statusLabels[status]
const confidenceWord = (confidence: Confidence): string =>
  cockpit.segment.confidenceLabels[confidence]

/** Minutes as a phrase, never a bare figure. `1 minute` / `47 minutes` / `-18 minutes`. */
const minutesWord = (value: number): string =>
  `${String(value)} ${value === 1 || value === -1 ? 'minute' : 'minutes'}`

export const segmentCardCopy: SegmentCardCopy = {
  scheduledLabel: cockpit.segment.scheduled,
  currentLabel: cockpit.segment.estimated,
  statusLabel: cockpit.segment.status,
  delayLabel: cockpit.segment.delay,
  gateLabel: cockpit.segment.gate,
  terminalLabel: cockpit.segment.terminal,
  sourceLabel: cockpit.segment.source,
  confidenceLabel: cockpit.segment.confidence,
  detailSummary: cockpit.segment.detailsToggle,
  zoneLabel: cockpit.segment.zone,
  estimatedLabel: cockpit.segment.estimated,
  departsLabel: cockpit.segment.departs,
  arrivesLabel: cockpit.segment.arrives,
  nextDayLabel: cockpit.segment.nextDay,
  conflictHeading: cockpit.segment.conflictHeading,
  conflictNewestLabel: cockpit.segment.conflictNewest,
  statusText: statusWord,
  confidenceText: confidenceWord,
  /** The reading, never a bare number: "Delayed 47 minutes", "No delay reported". */
  delayText: (minutes: number) => delayValueText(minutes, true),
}

const topologyLabel: Readonly<Record<ConnectionTopology, string>> = {
  protected: cockpit.connection.topology.protectedLabel,
  self_transfer: cockpit.connection.topology.selfTransferLabel,
  // A mixed ticket is a separate-ticket transfer as far as a traveler's exposure goes.
  mixed_ticket: cockpit.connection.topology.selfTransferLabel,
  unknown: cockpit.connection.topology.unknownLabel,
}

const topologyNote: Readonly<Record<ConnectionTopology, string>> = {
  protected: cockpit.connection.topology.protectedBody,
  self_transfer: cockpit.connection.topology.selfTransferBody,
  mixed_ticket: cockpit.connection.topology.selfTransferBody,
  unknown: cockpit.connection.topology.unknownBody,
}

/**
 * The connection meter's reading.
 *
 * THE BAR AND THE WORDS MUST DESCRIBE THE SAME RATIO. `BandMeter` fills `required / available` —
 * how much of the window the transfer eats — because that is the shape a traveler can act on: a
 * nearly-full bar means nearly no room. `slackValueText(available, required)` renders the other
 * ratio, `available of required`, which is the right reading for a connection that does NOT fit
 * (18 of the 45 minutes you need) and the wrong one for a connection that just barely does: the
 * demonstration itinerary has 51 minutes available against 44 required, and the documented argument
 * order renders "51 of 44 minutes" beside a bar filled to 86 %. A reader can reasonably take "51 of
 * 44" as fifty-one minutes needed out of forty-four available — the exact opposite of the seven
 * minutes of slack the row below states.
 *
 * So when both figures are known the arguments are swapped, producing "44 of 51 minutes", which
 * agrees with the bar. When either is missing the documented order is used unchanged, because those
 * three branches name WHICH quantity is missing and swapping them would name the wrong one.
 * `apps/web/test/pattern-copy.test.ts` asserts all four branches, so a change inside
 * `slackValueText` fails here rather than silently inverting a reading at a gate.
 *
 * HANDOFF FILED: `to: ux-copy-steward` — either rename the parameters to
 * `slackValueText(numerator, denominator)`, or add a `requiredOfAvailableText(required, available)`
 * so this wrapper can go away.
 */
export const meterReading = (available: number | null, required: number | null): string =>
  available === null || required === null
    ? slackValueText(available, required)
    : slackValueText(required, available)

/**
 * `meterValueText` is per-assessment, not per-page: it names WHICH quantity is missing when one is
 * (F24), so it cannot be a constant. The two minute figures are therefore arguments.
 */
export function connectionCopy(options: {
  readonly demo: boolean
  readonly availableMinutes: number | null
  readonly requiredMinutes: number | null
}): ConnectionCockpitCopy {
  return {
    heading: cockpit.headings.connection,
    topologyLabel,
    topologyNote,
    selfTransferExplanation: results.selfTransfer,
    gateInLabel: cockpit.connection.gateIn,
    gateCloseLabel: cockpit.connection.gateClose,
    gateCloseBufferLabel: cockpit.connection.gateCloseBuffer,
    availableLabel: cockpit.connection.availableMinutes,
    requiredLabel: cockpit.connection.requiredMinutes,
    slackLabel: cockpit.connection.slack,
    componentsHeading: cockpit.connection.componentsHeading,
    componentCaption: cockpit.connection.componentsCaption,
    componentColumnStep: cockpit.connection.columnStep,
    componentColumnMinutes: cockpit.connection.columnMinutes,
    componentColumnDerivation: cockpit.connection.columnDerivation,
    derivationLabel,
    notRequiredLabel: cockpit.connection.notRequired,
    assumptionsHeading: cockpit.connection.assumptionsHeading,
    missingDataHeading: cockpit.connection.missingDataHeading,
    bandLabel: bandWord,
    bandStops,
    bandScaleLabel: cockpit.connection.bandScaleLabel,
    currentBandLabel: cockpit.connection.currentBand,
    meterLabel: cockpit.connection.meterLabel,
    meterValueText: meterReading(options.availableMinutes, options.requiredMinutes),
    heuristicNote: cockpit.assessment.heuristicNote,
    minutesText: minutesWord,
    zoneLabel: cockpit.segment.zone,
    estimatedLabel: cockpit.segment.estimated,
    disclaimer: disclaimers.connection,
    disclaimerLabel: disclaimerLabels.connection,
    ...(options.demo ? { demoCaption: cockpit.demoCaption } : {}),
  }
}

export function rightsCopy(options: { readonly demo: boolean }): RightsCardCopy {
  return {
    heading: cockpit.headings.rights,
    jurisdictionLabel: cockpit.rights.jurisdiction,
    ruleSetLabel: cockpit.rights.ruleSet,
    whatMayApplyLabel: cockpit.rights.whatMayApply,
    whatWeStillNeedLabel: cockpit.rights.whatWeStillNeed,
    entitlementsLabel: cockpit.rights.entitlementsHeading,
    evidenceLabel: cockpit.rights.evidence,
    sourcesLabel: cockpit.rights.officialSources,
    futureRuleLabel: cockpit.rights.currentVsFuture,
    voluntaryLabel: cockpit.voluntaryCommitments.label,
    reasoningSummary: cockpit.rights.reasoningToggle,
    statusLabel: cockpit.rights.statusLabels,
    disclaimer: disclaimers.rights,
    disclaimerLabel: disclaimerLabels.rights,
    resultNote: results.rights,
    newTabLabel: nav.newTab,
    sourceUnavailableLabel: cockpit.rights.sourceUnavailable,
    ...(options.demo ? { demoCaption: cockpit.demoCaption } : {}),
  }
}

export const actionChecklistCopy: ActionChecklistCopy = {
  heading: cockpit.actions.heading,
  deadlineLabel: cockpit.actions.deadlineLabel,
  irreversibleLabel: cockpit.actions.irreversibleLabel,
  reversibleLabel: cockpit.actions.reversibleLabel,
  consequenceLabel: cockpit.actions.consequenceLabel,
  jurisdictionLabel: cockpit.actions.jurisdictionLabel,
  sourcesLabel: cockpit.actions.sourceLabel,
  newTabLabel: nav.newTab,
  sourceUnavailableLabel: cockpit.rights.sourceUnavailable,
  zoneLabel: cockpit.segment.zone,
  emptyLabel: cockpit.actions.empty,
}

export function alertTimelineCopy(options: { readonly demo: boolean }): AlertTimelineCopy {
  return {
    heading: cockpit.alerts.heading,
    severityLabel: cockpit.alerts.severityLabels,
    zoneLabel: cockpit.segment.zone,
    emptyLabel: cockpit.alerts.empty,
    ...(options.demo ? { demoCaption: cockpit.demoCaption } : {}),
  }
}

export function sourceFreshnessCopy(options: { readonly demo: boolean }): SourceFreshnessPanelCopy {
  return {
    heading: cockpit.sources.heading,
    subjectLabel: cockpit.sources.provenanceLabel,
    sourceLabel: cockpit.sources.sourceLabel,
    stateLabel: cockpit.sources.provenanceLabel,
    ...(options.demo ? { demoCaption: cockpit.demoCaption } : {}),
  }
}

export function evidencePacketCopy(options: { readonly demo: boolean }): EvidencePacketCopy {
  return {
    heading: cockpit.evidence.heading,
    summaryHeading: cockpit.evidence.summaryHeading,
    scheduleHeading: cockpit.evidence.scheduleHeading,
    chronologyHeading: cockpit.evidence.chronologyHeading,
    messagesHeading: cockpit.evidence.messagesHeading,
    expensesHeading: cockpit.evidence.expensesHeading,
    rightsHeading: cockpit.evidence.rightsHeading,
    missingHeading: cockpit.evidence.missing,
    sourcesHeading: cockpit.evidence.sourcesHeading,
    chronologyCaption: cockpit.evidence.chronologyCaption,
    expensesCaption: cockpit.evidence.expensesCaption,
    columnWhen: cockpit.evidence.columnWhen,
    columnWhat: cockpit.evidence.columnWhat,
    columnSource: cockpit.evidence.columnSource,
    columnAmount: cockpit.evidence.columnAmount,
    emptyMessages: cockpit.evidence.emptyMessages,
    emptyExpenses: cockpit.evidence.emptyExpenses,
    zoneLabel: cockpit.segment.zone,
    newTabLabel: nav.newTab,
    sourceUnavailableLabel: cockpit.rights.sourceUnavailable,
    ruleSetLabel: cockpit.evidence.ruleSetLabel,
    disclaimer: disclaimers.rights,
    disclaimerLabel: disclaimerLabels.rights,
    ...(options.demo ? { demoCaption: cockpit.demoCaption } : {}),
  }
}

export const itineraryTimelineCopy: ItineraryTimelineCopy = {
  label: cockpit.timeline.label,
  zoneLabel: cockpit.segment.zone,
  bandLabel: bandWord,
}

export const stopRoles = {
  departure: cockpit.timeline.departure,
  connection: cockpit.timeline.connection,
  arrival: cockpit.timeline.arrival,
} as const
