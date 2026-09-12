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
 * the one state a traveler most needs to trust. The reading always comes from
 * `requiredOfAvailableText` or `delayValueText` and the band always from `bandLabel`. The S3 review
 * extended the rule to the meter's NAME: a reading may equal neither its band label nor its
 * accessible name (`docs/VOICE.md §9.1`), which is why a band meter's three slots take three
 * different registers — the surface, the quantity, the value.
 *
 * NO WORD IS WRITTEN IN THIS FILE. Every string below is an export of `lib/copy/**`, composed at
 * most by concatenating two of them. If a slot has no string, it is a handoff to `ux-copy-steward`
 * named by state, not a literal typed here (`docs/VOICE.md §12`).
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
  minutesText,
  requiredOfAvailableText,
  slackMinutesText,
  type Band as CopyBand,
} from '../lib/copy/bands.ts'
import {
  cockpit,
  connectionComponentsCaption,
  connectionHeading,
  type ConnectionTopologyKey,
} from '../lib/copy/cockpit.ts'
import { disclaimers } from '../lib/copy/disclaimers.ts'
import { nav } from '../lib/copy/nav.ts'
import { pages } from '../lib/copy/pages.ts'
import { results } from '../lib/copy/results.ts'

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
  conflictBody: cockpit.segment.conflictBody,
  /*
   * The `§28` sentence is passed unconditionally: `SegmentCard` gates the render on
   * `segment.provenance.kind === 'demo'`, exactly as five other patterns do, so the constant is
   * inert on a live segment and present the moment a fixture one renders. A card that needed its
   * caller to remember the caption is a card that will one day ship without it (trust sweep F4).
   */
  demoCaption: cockpit.demoCaption,
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
 * The pattern's four topologies onto the copy module's three.
 *
 * The SAME collapse `topologyLabel` and `topologyNote` above already make, for the same reason: a
 * mixed ticket is a separate-ticket transfer as far as a traveler's exposure goes. It is written
 * once more here rather than derived, because a name a reader hears from a landmark list must be
 * chosen deliberately, not fall out of a lookup.
 */
const topologyKey: Readonly<Record<ConnectionTopology, ConnectionTopologyKey>> = {
  protected: 'protected',
  self_transfer: 'selfTransfer',
  mixed_ticket: 'selfTransfer',
  unknown: 'unknown',
}

/**
 * `meterValueText` is per-assessment, not per-page: it names WHICH quantity is missing when one is
 * (F24), so it cannot be a constant. The two minute figures are therefore arguments — and the ORDER
 * they are passed in is the whole correctness question on this surface.
 *
 * `ConnectionCockpit` fills its meter `value={requiredMinutes}` of `max={availableMinutes}`: how
 * much of the window the transfer eats, so a nearly-full bar means nearly no room. The words beside
 * it must name that same ratio in that same order, which is what `requiredOfAvailableText(required,
 * available)` renders — "44 of 51 minutes" for the demonstration itinerary's 44-minute transfer
 * inside a 51-minute window. Read the other way round it says "51 of 44 minutes" beside a bar
 * filled to seven-eighths, which a tired reader can only take as its inverse. Nothing is swapped
 * here: the copy module owns the reading and this passes its arguments through in order
 * (`docs/VOICE.md §9.3`).
 *
 * THE THREE MINUTE READINGS ARE THE COPY MODULE'S, NOT THIS FILE'S. `minutesText` is the duration
 * phrase and `slackMinutesText` is the Slack row's — an adapter may compose copy exports, it may
 * not author them (`docs/VOICE.md §12`). This file carried its own `minutesWord`, which put two
 * rendered words ("minute", "minutes") outside the copy owner's hands and rendered negative slack
 * as "-18 minutes"; both are gone.
 *
 * `apps/web/test/pattern-copy.test.ts` asserts every branch of both readings THROUGH this function,
 * so a swapped argument or a re-introduced local helper fails there rather than at a gate.
 *
 * `demo` adds the `§28` caption; every other panel-level string here is a constant.
 */
export function connectionCopy(options: {
  readonly demo: boolean
  readonly availableMinutes: number | null
  readonly requiredMinutes: number | null
  /**
   * The reservation structure, when more than one cockpit shares a page, or `null` when one does
   * not — `/connection-risk/` renders three and a landmark list offered six entries under two
   * names (`docs/ACCESSIBILITY.md` F26). The copy module decides the wording; this decides only
   * that the question is asked once, here, rather than at each of the four call sites.
   */
  readonly topology?: ConnectionTopology | null
}): ConnectionCockpitCopy {
  const key = options.topology == null ? null : topologyKey[options.topology]
  return {
    heading: connectionHeading(key),
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
    componentCaption: connectionComponentsCaption(key),
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
    meterValueText: requiredOfAvailableText(options.requiredMinutes, options.availableMinutes),
    heuristicNote: cockpit.assessment.heuristicNote,
    minutesText,
    slackText: slackMinutesText,
    zoneLabel: cockpit.segment.zone,
    estimatedLabel: cockpit.segment.estimated,
    disclaimer: disclaimers.connection,
    disclaimerLabel: disclaimers.labels.connection,
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
    /*
     * The same three exports `ArticleLayout.astro` renders its context block from. One wording for
     * one idea, on both surfaces: a record that reports on a rule is not the rule.
     */
    contextHeading: pages.article.contextHeading,
    contextIntro: pages.article.contextIntro,
    contextNote: pages.article.contextNote,
    futureRuleLabel: cockpit.rights.currentVsFuture,
    voluntaryLabel: cockpit.voluntaryCommitments.label,
    reasoningSummary: cockpit.rights.reasoningToggle,
    statusLabel: cockpit.rights.statusLabels,
    disclaimer: disclaimers.rights,
    disclaimerLabel: disclaimers.labels.rights,
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
  /* Inert unless the caller also passes a `demo` provenance; see `segmentCardCopy` above. */
  demoCaption: cockpit.demoCaption,
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
    disclaimerLabel: disclaimers.labels.rights,
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
