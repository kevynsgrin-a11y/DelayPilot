// @delaypilot/ui — composed patterns.
//
// Owner: frontend-ui-engineer (docs/agents/ROSTER.md §3, `packages/ui/src/patterns/**`).
// The primitives and tokens next door are brand-design-director's; these compose them into the
// product surfaces DIRECTIVE.md §18.5 names, and hold no copy of their own — every string is a
// prop, supplied by apps/web from `src/lib/copy/**`.
//
// apps/web reaches this entry point through the `@delaypilot/ui/patterns` alias declared in
// apps/web/astro.config.mjs and apps/web/tsconfig.json, because the package's `exports` map is
// brand-design-director's file and does not list it.
//
// Nothing here is hydrated. The patterns render on the server and ship as HTML; see the CSP note
// in apps/web/astro.config.mjs for why apps/web has no `client:*` directive.

export * from './types.ts'
export * from './time.ts'
export * from './action-order.ts'
export * from './combobox-keyboard.ts'

export {
  Disclaimer,
  DefinitionRow,
  MaybeValue,
  ProvenanceHeader,
  ZonedTimeView,
  type DisclaimerProps,
  type DefinitionRowProps,
  type MaybeValueProps,
  type ProvenanceHeaderProps,
  type ZonedTimeViewProps,
} from './atoms.tsx'

export {
  ActionChecklist,
  type ActionChecklistCopy,
  type ActionChecklistProps,
} from './ActionChecklist.tsx'
export { AdSlotShell, type AdPlacement, type AdSlotShellProps } from './AdSlotShell.tsx'
export { AlertTimeline, type AlertTimelineCopy, type AlertTimelineProps } from './AlertTimeline.tsx'
export { BandMeter, type BandMeterProps } from './BandMeter.tsx'
export {
  FlightLookupFields,
  type FlightLookupFieldsCopy,
  type FlightLookupFieldsProps,
} from './FlightLookupFields.tsx'
export {
  ConnectionCockpit,
  type ConnectionCockpitCopy,
  type ConnectionCockpitProps,
} from './ConnectionCockpit.tsx'
export {
  EvidencePacket,
  type EvidenceChronologyEntry,
  type EvidenceExpense,
  type EvidencePacketCopy,
  type EvidencePacketProps,
} from './EvidencePacket.tsx'
export {
  ItineraryTimeline,
  type ItineraryLeg,
  type ItineraryStop,
  type ItineraryTimelineCopy,
  type ItineraryTimelineProps,
} from './ItineraryTimeline.tsx'
export { RightsCard, type RightsCardCopy, type RightsCardProps } from './RightsCard.tsx'
export { SegmentCard, type SegmentCardCopy, type SegmentCardProps } from './SegmentCard.tsx'
export {
  SourceFreshnessPanel,
  type SourceFreshnessPanelCopy,
  type SourceFreshnessPanelProps,
  type SourceFreshnessRow,
} from './SourceFreshnessPanel.tsx'
export {
  LoadingBlock,
  StateBlock,
  type LoadingBlockProps,
  type PanelStateKind,
  type StateBlockProps,
} from './StateBlock.tsx'
