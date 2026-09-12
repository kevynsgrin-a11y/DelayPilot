/**
 * Pattern contracts, rendered.
 *
 * Every assertion below is against MARKUP produced by `react-dom/server`, not against JSX read by
 * eye — the same method `packages/ui/test/primitives.test.tsx` uses, and for the same reason: the
 * question is what reaches a browser, not what the source looked like.
 *
 * Each `describe` is a `DIRECTIVE.md §17` state or an invariant, wired to the demonstration fixture
 * so the rendered state is the same one a reader sees on the built site.
 */

import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'

import { ActionChecklist } from '../../../packages/ui/src/patterns/ActionChecklist.tsx'
import { AdSlotShell } from '../../../packages/ui/src/patterns/AdSlotShell.tsx'
import { AlertTimeline } from '../../../packages/ui/src/patterns/AlertTimeline.tsx'
import { BandMeter } from '../../../packages/ui/src/patterns/BandMeter.tsx'
import { ConnectionCockpit } from '../../../packages/ui/src/patterns/ConnectionCockpit.tsx'
import { EvidencePacket } from '../../../packages/ui/src/patterns/EvidencePacket.tsx'
import { ItineraryTimeline } from '../../../packages/ui/src/patterns/ItineraryTimeline.tsx'
import { RightsCard } from '../../../packages/ui/src/patterns/RightsCard.tsx'
import { SegmentCard } from '../../../packages/ui/src/patterns/SegmentCard.tsx'
import { SourceFreshnessPanel } from '../../../packages/ui/src/patterns/SourceFreshnessPanel.tsx'
import { LoadingBlock, StateBlock } from '../../../packages/ui/src/patterns/StateBlock.tsx'
import { bands, rightsStatuses } from '../../../packages/ui/src/patterns/types.ts'

import {
  actionChecklistCopy,
  alertTimelineCopy,
  bandStops,
  connectionCopy,
  evidencePacketCopy,
  itineraryTimelineCopy,
  rightsCopy,
  segmentCardCopy,
  sourceFreshnessCopy,
  stopRoles,
} from '../src/components/pattern-copy.ts'
import { cockpit } from '../src/lib/copy/cockpit.ts'
import { bandLabel, requiredOfAvailableText } from '../src/lib/copy/bands.ts'
import { results } from '../src/lib/copy/results.ts'
import {
  demoActions,
  demoAirports,
  demoAlerts,
  demoChronology,
  demoConnectionInsufficient,
  demoConnectionProtected,
  demoConnectionSelfTransfer,
  demoEvidenceMissing,
  demoEvidenceSchedule,
  demoEvidenceSummary,
  demoRightsEuropeanUnion,
  demoRightsUnitedStates,
  demoSegmentCanceled,
  demoSegmentConflicting,
  demoSegmentInbound,
  demoSegmentPartial,
  demoSegmentStale,
  demoSourceRows,
} from '../src/demo/itinerary.ts'

const html = (element: ReactElement): string => renderToStaticMarkup(element)

/**
 * Visible text only — attributes and tags stripped, character references decoded.
 *
 * The decoding matters: `react-dom/server` escapes an apostrophe to `&#x27;`, so a raw substring
 * check against a `DIRECTIVE.md §26` sentence containing one fails on the escape rather than on the
 * sentence. What a reader sees is the decoded form, so that is what is asserted.
 */
const text = (markup: string): string =>
  markup
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const connectionProps = (assessment: typeof demoConnectionProtected) =>
  connectionCopy({
    demo: true,
    availableMinutes: assessment.availableMinutes.known ? assessment.availableMinutes.value : null,
    requiredMinutes: assessment.requiredMinutes.known ? assessment.requiredMinutes.value : null,
  })

/* ------------------------------------------------------------------------------------------- */

describe('SegmentCard — §17 flight-data states', () => {
  it('delayed: renders the delay as a reading, the source, and the confidence word', () => {
    const markup = html(<SegmentCard segment={demoSegmentInbound} copy={segmentCardCopy} />)
    expect(text(markup)).toContain('47 minutes')
    expect(markup).toContain(demoSegmentInbound.source)
    expect(text(markup)).toContain(cockpit.segment.confidenceLabels.medium)
  })

  it('canceled: renders the status word, not an empty time', () => {
    const markup = html(<SegmentCard segment={demoSegmentCanceled} copy={segmentCardCopy} />)
    expect(text(markup)).toContain(cockpit.segment.statusLabels.canceled)
    expect(markup).toContain('data-state="unknown"')
  })

  it('partial data: every missing field renders its own sentence, never a dash or a zero', () => {
    const markup = html(<SegmentCard segment={demoSegmentPartial} copy={segmentCardCopy} />)
    const visible = text(markup)
    expect(visible).toContain(cockpit.unknown.delay)
    expect(visible).toContain(cockpit.unknown.gate)
    expect(visible).not.toMatch(/>\s*—\s*</)
  })

  it('stale: carries the Stale chip rather than being withheld', () => {
    const markup = html(<SegmentCard segment={demoSegmentStale} copy={segmentCardCopy} />)
    expect(markup).toContain('data-provenance="stale"')
    expect(text(markup)).toContain('Stale')
  })

  it('conflicting providers: BOTH snapshots render and the newest source is named', () => {
    const markup = html(<SegmentCard segment={demoSegmentConflicting} copy={segmentCardCopy} />)
    const visible = text(markup)
    expect(visible).toContain(cockpit.segment.conflictHeading)
    expect(visible).toContain(cockpit.segment.conflictNewest)
    expect(visible).toContain(cockpit.segment.statusLabels.delayed)
    expect(visible).toContain(cockpit.segment.statusLabels.scheduled)
  })

  it('never renders a gate or terminal value in demo mode', () => {
    for (const segment of [demoSegmentInbound, demoSegmentCanceled, demoSegmentPartial]) {
      const markup = html(<SegmentCard segment={segment} copy={segmentCardCopy} />)
      expect(text(markup)).toContain(cockpit.unknown.gate)
      expect(text(markup)).toContain(cockpit.unknown.terminal)
    }
  })

  it('labels every time with its airport code AND its IANA zone', () => {
    const markup = html(<SegmentCard segment={demoSegmentInbound} copy={segmentCardCopy} />)
    expect(markup).toContain(demoAirports.DM1.code)
    expect(markup).toContain(demoAirports.DM1.zone)
    expect(markup).toContain(demoAirports.DM2.zone)
  })

  it('marks an estimated time as estimated', () => {
    const markup = html(<SegmentCard segment={demoSegmentInbound} copy={segmentCardCopy} />)
    expect(text(markup)).toContain(cockpit.segment.estimated)
  })
})

/* ------------------------------------------------------------------------------------------- */

describe('ConnectionCockpit', () => {
  it('renders W, T, S and every one of the seven components with its derivation class', () => {
    const markup = html(
      <ConnectionCockpit
        assessment={demoConnectionProtected}
        copy={connectionProps(demoConnectionProtected)}
      />,
    )
    const visible = text(markup)
    expect(visible).toContain(cockpit.connection.availableMinutes)
    expect(visible).toContain(cockpit.connection.requiredMinutes)
    expect(visible).toContain(cockpit.connection.slack)
    for (const component of demoConnectionProtected.components) {
      expect(visible).toContain(component.label)
    }
    expect(visible).toContain(cockpit.connection.derivation.airport)
    expect(visible).toContain(cockpit.connection.derivation.estimated)
  })

  it('labels an unknown gate-close rule as a buffer estimate, never as policy', () => {
    const markup = html(
      <ConnectionCockpit
        assessment={demoConnectionProtected}
        copy={connectionProps(demoConnectionProtected)}
      />,
    )
    expect(text(markup)).toContain(cockpit.connection.gateCloseBuffer)
  })

  it('publishes NO percentage in visible text', () => {
    for (const assessment of [
      demoConnectionProtected,
      demoConnectionSelfTransfer,
      demoConnectionInsufficient,
    ]) {
      const markup = html(
        <ConnectionCockpit assessment={assessment} copy={connectionProps(assessment)} />,
      )
      expect(text(markup)).not.toContain('%')
    }
  })

  it('carries the Heuristic risk band chip wherever a band is shown', () => {
    const markup = html(
      <ConnectionCockpit
        assessment={demoConnectionProtected}
        copy={connectionProps(demoConnectionProtected)}
      />,
    )
    expect(markup).toContain('data-provenance="heuristic"')
    expect(text(markup)).toContain('Heuristic risk band')
  })

  it('renders the §26 connection disclaimer beside the figures', () => {
    const markup = html(
      <ConnectionCockpit
        assessment={demoConnectionProtected}
        copy={connectionProps(demoConnectionProtected)}
      />,
    )
    expect(text(markup)).toContain(
      'Walking, security, immigration, baggage, gate-close rules, and airline assistance can change the outcome.',
    )
  })

  it('self-transfer: prominently explains baggage, and is never called protected', () => {
    const markup = html(
      <ConnectionCockpit
        assessment={demoConnectionSelfTransfer}
        copy={connectionProps(demoConnectionSelfTransfer)}
      />,
    )
    const visible = text(markup)
    expect(visible).toContain(results.selfTransfer)
    expect(visible).toContain(cockpit.connection.topology.selfTransferLabel)
    expect(visible).not.toContain(cockpit.connection.topology.protectedLabel)
  })

  it('insufficient data: names the missing quantity rather than announcing "Unknown, Unknown"', () => {
    const markup = html(
      <ConnectionCockpit
        assessment={demoConnectionInsufficient}
        copy={connectionProps(demoConnectionInsufficient)}
      />,
    )
    expect(markup).toContain(
      `aria-valuetext="${requiredOfAvailableText(null, null)}, ${bandLabel('unknown')}"`,
    )
    expect(markup).not.toContain('aria-valuetext="Unknown, Unknown"')
  })

  it('omits aria-valuenow when the meter has nothing to read', () => {
    const markup = html(
      <ConnectionCockpit
        assessment={demoConnectionInsufficient}
        copy={connectionProps(demoConnectionInsufficient)}
      />,
    )
    expect(markup).not.toContain('aria-valuenow')
  })
})

/* ------------------------------------------------------------------------------------------- */

describe('BandMeter', () => {
  it('is a linear meter, never a gauge: no canvas, no arc path, no needle', () => {
    for (const band of bands) {
      const markup = html(
        <BandMeter
          band={band}
          label={cockpit.connection.meterLabel}
          valueText={requiredOfAvailableText(44, 51)}
          bandLabel={bandLabel(band)}
          stopLabels={bandStops}
          scaleLabel={cockpit.connection.bandScaleLabel}
          currentStopLabel={cockpit.connection.currentBand}
          calibrated={false}
          value={44}
          max={51}
        />,
      )
      expect(markup).not.toContain('<canvas')
      expect(markup.toLowerCase()).not.toMatch(/\b(gauge|speedometer|needle)\b/)
      expect(text(markup)).toContain(bandLabel(band))
    }
  })

  it('never lets the reading equal the band word (finding F24)', () => {
    const markup = html(
      <BandMeter
        band="unknown"
        label={cockpit.connection.meterLabel}
        valueText={requiredOfAvailableText(null, null)}
        bandLabel={bandLabel('unknown')}
        stopLabels={bandStops}
        scaleLabel={cockpit.connection.bandScaleLabel}
        currentStopLabel={cockpit.connection.currentBand}
        calibrated={false}
      />,
    )
    expect(markup).toContain('aria-valuetext="Slack unknown, Unknown"')
  })

  it('marks the current stop with a word as well as a colour', () => {
    const markup = html(
      <BandMeter
        band="watch"
        label={cockpit.connection.meterLabel}
        valueText={requiredOfAvailableText(44, 51)}
        bandLabel={bandLabel('watch')}
        stopLabels={bandStops}
        scaleLabel={cockpit.connection.bandScaleLabel}
        currentStopLabel={cockpit.connection.currentBand}
        calibrated={false}
      />,
    )
    expect(markup).toContain('data-band="watch" data-current="true"')
    expect(text(markup)).toContain(cockpit.connection.currentBand)
  })
})

/* ------------------------------------------------------------------------------------------- */

describe('RightsCard — §17 rights states', () => {
  it('renders the answer first and the reasoning behind a disclosure', () => {
    const markup = html(
      <RightsCard
        assessment={demoRightsUnitedStates}
        copy={rightsCopy({ demo: true })}
        idPrefix="t-us"
      />,
    )
    // Through `text`, not the raw markup: the assessment's answer carries an ASCII apostrophe
    // (`docs/VOICE.md §11`) and `react-dom/server` escapes it to `&#x27;`, so a raw substring
    // search would fail on the escape rather than on the order this test is about.
    const rendered = text(markup)
    const answerIndex = rendered.indexOf(demoRightsUnitedStates.whatMayApply)
    const reasoningIndex = rendered.indexOf(cockpit.rights.reasoningToggle)
    expect(answerIndex).toBeGreaterThan(-1)
    expect(answerIndex).toBeLessThan(reasoningIndex)
  })

  it('renders only the five permitted status words', () => {
    const markup = html(
      <RightsCard
        assessment={demoRightsEuropeanUnion}
        copy={rightsCopy({ demo: true })}
        idPrefix="t-eu"
      />,
    )
    const permitted = rightsStatuses.map((status) => cockpit.rights.statusLabels[status])
    for (const label of [
      ...text(markup).matchAll(
        /(Likely applies|May apply|Not indicated|Cannot determine|Future rule, not active)/g,
      ),
    ]) {
      expect(permitted).toContain(label[0])
    }
  })

  it('renders no amount and no total when the payload carries none', () => {
    const markup = html(
      <RightsCard
        assessment={demoRightsUnitedStates}
        copy={rightsCopy({ demo: true })}
        idPrefix="t-us2"
      />,
    )
    expect(markup).not.toContain('dpp-rights__line-amount')
    expect(text(markup)).not.toMatch(/[€£$]\s?\d/)
  })

  it('puts a future rule in its own module, marked not active', () => {
    const markup = html(
      <RightsCard
        assessment={demoRightsEuropeanUnion}
        copy={rightsCopy({ demo: true })}
        idPrefix="t-eu2"
      />,
    )
    const visible = text(markup)
    expect(visible).toContain(cockpit.rights.currentVsFuture)
    expect(visible).toContain(cockpit.rights.statusLabels.future_rule_not_active)
  })

  it('keeps voluntary commitments in a separate labelled module', () => {
    const markup = html(
      <RightsCard
        assessment={demoRightsUnitedStates}
        copy={rightsCopy({ demo: true })}
        idPrefix="t-us3"
      />,
    )
    expect(text(markup)).toContain(cockpit.voluntaryCommitments.label)
  })

  it('renders an unreachable official source as text, never as a link', () => {
    const markup = html(
      <RightsCard
        assessment={demoRightsUnitedStates}
        copy={rightsCopy({ demo: true })}
        idPrefix="t-us4"
      />,
    )
    expect(markup).toContain('dpp-rights__source-offline')
    expect(text(markup)).toContain(cockpit.rights.sourceUnavailable)
  })

  it('carries the §26 rights disclaimer inside the card', () => {
    const markup = html(
      <RightsCard
        assessment={demoRightsUnitedStates}
        copy={rightsCopy({ demo: true })}
        idPrefix="t-us5"
      />,
    )
    expect(text(markup)).toContain(
      "Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.",
    )
  })
})

/* ------------------------------------------------------------------------------------------- */

describe('ActionChecklist', () => {
  const markup = html(
    <ActionChecklist items={demoActions} copy={actionChecklistCopy} idPrefix="t-actions" />,
  )

  it('never renders the internal utility score, in any channel', () => {
    expect(markup).not.toContain('utility')
    expect(text(markup)).not.toMatch(/\bU\s*=/)
  })

  it('gives an irreversible step a consequence line', () => {
    expect(text(markup)).toContain(cockpit.actions.consequenceLabel)
    expect(markup).toContain('data-reversible="false"')
  })

  it('renders the unknown deadline as a sentence rather than a blank', () => {
    expect(markup).toContain('data-state="unknown"')
  })

  it('is an ordered list, so the order is carried semantically', () => {
    expect(markup).toContain('<ol')
  })

  it('renders a designed empty state', () => {
    const empty = html(<ActionChecklist items={[]} copy={actionChecklistCopy} idPrefix="t-e" />)
    expect(text(empty)).toContain(cockpit.actions.empty)
  })
})

/* ------------------------------------------------------------------------------------------- */

describe('EvidencePacket', () => {
  const markup = html(
    <EvidencePacket
      copy={evidencePacketCopy({ demo: true })}
      tripTitle="Demo Origin to Demo Destination"
      summaryLines={demoEvidenceSummary}
      scheduleLines={demoEvidenceSchedule}
      chronology={demoChronology}
      airlineMessages={[]}
      expenses={[]}
      rightsSummary={['Refund: May apply.']}
      ruleSet={cockpit.rights.ruleSetDemo}
      missingEvidence={demoEvidenceMissing}
      sources={demoRightsUnitedStates.sources}
      provenance={demoRightsUnitedStates.provenance}
      idPrefix="t-ev"
    />,
  )

  it('lists what is missing, which is the section that makes the rest trustworthy', () => {
    expect(text(markup)).toContain(cockpit.evidence.missing)
    for (const line of demoEvidenceMissing) expect(text(markup)).toContain(line)
  })

  it('renders designed empty states for messages and expenses', () => {
    expect(text(markup)).toContain(cockpit.evidence.emptyMessages)
    expect(text(markup)).toContain(cockpit.evidence.emptyExpenses)
  })

  it('has no send, email or submit control — it is never filed on anyone behalf', () => {
    expect(markup.toLowerCase()).not.toMatch(/<form|type="submit"|mailto:/)
  })

  it('states the rule-set version it was generated against', () => {
    expect(text(markup)).toContain(cockpit.rights.ruleSetDemo)
  })
})

/* ------------------------------------------------------------------------------------------- */

describe('AlertTimeline and SourceFreshnessPanel', () => {
  it('renders the alert timeline as an ordered list with a severity word per row', () => {
    const markup = html(
      <AlertTimeline
        events={demoAlerts}
        copy={alertTimelineCopy({ demo: true })}
        idPrefix="t-al"
      />,
    )
    expect(markup).toContain('<ol')
    expect(text(markup)).toContain(cockpit.alerts.severityLabels.urgent)
    expect(markup).toContain('data-severity="urgent"')
  })

  it('renders a designed empty alert state', () => {
    const markup = html(
      <AlertTimeline events={[]} copy={alertTimelineCopy({ demo: true })} idPrefix="t-al2" />,
    )
    expect(text(markup)).toContain(cockpit.alerts.empty)
  })

  it('renders a chip and a freshness sentence for every source row', () => {
    const markup = html(
      <SourceFreshnessPanel
        rows={demoSourceRows}
        copy={sourceFreshnessCopy({ demo: true })}
        idPrefix="t-fr"
      />,
    )
    for (const row of demoSourceRows) {
      expect(markup).toContain(`data-provenance="${row.kind}"`)
      expect(text(markup)).toContain(row.freshness)
    }
  })
})

/* ------------------------------------------------------------------------------------------- */

describe('ItineraryTimeline', () => {
  it('is one ordered list in travel order, whatever the viewport', () => {
    const markup = html(
      <ItineraryTimeline
        stops={[
          {
            id: 's1',
            code: demoAirports.DM1.code,
            name: demoAirports.DM1.name,
            time: demoSegmentInbound.origin.scheduled,
            roleLabel: stopRoles.departure,
          },
          {
            id: 's2',
            code: demoAirports.DM2.code,
            name: demoAirports.DM2.name,
            time: demoSegmentInbound.destination.scheduled,
            roleLabel: stopRoles.connection,
          },
        ]}
        legs={[
          {
            id: 'l1',
            flightNumber: demoSegmentInbound.flightNumber,
            airline: demoSegmentInbound.airline,
            statusLabel: cockpit.segment.status,
            band: 'watch',
          },
        ]}
        copy={itineraryTimelineCopy}
      />,
    )
    expect(markup).toContain('<ol')
    expect(markup.indexOf(demoAirports.DM1.code)).toBeLessThan(
      markup.indexOf(demoAirports.DM2.code),
    )
    expect(text(markup)).toContain(bandLabel('watch'))
  })
})

/* ------------------------------------------------------------------------------------------- */

describe('StateBlock and LoadingBlock — §17 general states', () => {
  it('emits the state name as data-state so every state is enumerable', () => {
    const markup = html(
      <StateBlock kind="provider_unavailable" severity="watch" title="Flight status">
        <p>Nothing is connected.</p>
      </StateBlock>,
    )
    expect(markup).toContain('data-state="provider_unavailable"')
  })

  it('puts aria-busy on the loading region, and no live role on the placeholder', () => {
    const markup = html(<LoadingBlock label="Flight result" message="Looking up this flight." />)
    expect(markup).toContain('aria-busy="true"')
    expect(markup).not.toContain('role="status"')
  })
})

/* ------------------------------------------------------------------------------------------- */

describe('AdSlotShell', () => {
  it('renders NOTHING while no consent platform and no slot id exist', () => {
    expect(
      html(
        <AdSlotShell
          placement="home_after_demo_and_first_explainer"
          label="Advertisement"
          size="300x250"
          enabled={false}
        />,
      ),
    ).toBe('')
  })

  it('reserves its box and labels itself once enabled', () => {
    const markup = html(
      <AdSlotShell
        placement="free_trip_after_action_checklist"
        label="Advertisement"
        size="300x250"
        enabled
      />,
    )
    expect(markup).toContain('data-ad-placement="free_trip_after_action_checklist"')
    expect(markup).toContain('data-size="300x250"')
    expect(text(markup)).toContain('Advertisement')
  })
})

/* ------------------------------------------------------------------------------------------- */
/* The slots and attributes the Phase 10 reviews found wrong.                                   */
/* ------------------------------------------------------------------------------------------- */

describe('the Demo label never travels alone (AGENTS.md §1.2, trust sweep F4)', () => {
  it("renders the §28 sentence beside a demo segment card's chip", () => {
    const markup = html(<SegmentCard segment={demoSegmentInbound} copy={segmentCardCopy} />)
    expect(markup).toContain('data-provenance="demo"')
    expect(text(markup)).toContain(results.demo)
  })

  it('does not render it on a segment that is not demo data', () => {
    const markup = html(<SegmentCard segment={demoSegmentStale} copy={segmentCardCopy} />)
    expect(markup).toContain('data-provenance="stale"')
    expect(text(markup)).not.toContain(results.demo)
  })

  it("renders it beside the action checklist's own chip when a provenance is passed", () => {
    const markup = html(
      <ActionChecklist
        items={demoActions}
        copy={actionChecklistCopy}
        idPrefix="t-demo-actions"
        provenance={{
          kind: 'demo',
          freshness: 'Updated 4 minutes ago from Demonstration fixture.',
        }}
      />,
    )
    expect(markup).toContain('data-provenance="demo"')
    expect(text(markup)).toContain(results.demo)
  })

  it('renders no chip at all when the checklist has no provenance to state', () => {
    const markup = html(
      <ActionChecklist items={demoActions} copy={actionChecklistCopy} idPrefix="t-plain-actions" />,
    )
    expect(markup).not.toContain('data-provenance')
  })
})

describe('the conflicting-providers state says what to do next (copy review F-6)', () => {
  it('renders the conflict body under the conflict heading', () => {
    const rendered = text(
      html(<SegmentCard segment={demoSegmentConflicting} copy={segmentCardCopy} />),
    )
    expect(rendered).toContain(cockpit.segment.conflictHeading)
    expect(rendered).toContain(cockpit.segment.conflictBody)
    expect(rendered.indexOf(cockpit.segment.conflictHeading)).toBeLessThan(
      rendered.indexOf(cockpit.segment.conflictBody),
    )
  })

  it('renders neither on a segment where the sources agree', () => {
    const rendered = text(html(<SegmentCard segment={demoSegmentInbound} copy={segmentCardCopy} />))
    expect(rendered).not.toContain(cockpit.segment.conflictBody)
  })
})

describe('the status pill carries a value, not its own field name (F29)', () => {
  it('does not put the word "Status" inside the pill', () => {
    const markup = html(<SegmentCard segment={demoSegmentCanceled} copy={segmentCardCopy} />)
    const pill = /<span class="dp-pill[\s\S]*?<\/span>\s*<\/(?:span|p|div)>/.exec(markup)?.[0] ?? ''
    expect(text(markup)).toContain(cockpit.segment.statusLabels.canceled)
    expect(pill).not.toContain(cockpit.segment.status)
  })
})

describe('the Slack row spells its sign (docs/VOICE.md §9.4)', () => {
  it('renders negative slack as words, with no leading hyphen anywhere in the markup', () => {
    const markup = html(
      <ConnectionCockpit
        assessment={demoConnectionSelfTransfer}
        copy={connectionProps(demoConnectionSelfTransfer)}
      />,
    )
    expect(text(markup)).toContain('18 minutes short')
    expect(markup).not.toMatch(/-\d+\s*minute/)
  })

  it('renders positive slack as a quantity on the protected transfer', () => {
    const markup = html(
      <ConnectionCockpit
        assessment={demoConnectionProtected}
        copy={connectionProps(demoConnectionProtected)}
      />,
    )
    expect(text(markup)).toContain('7 minutes of slack')
  })

  it('names the missing fact rather than rendering a blank when slack is unknown', () => {
    const markup = html(
      <ConnectionCockpit
        assessment={demoConnectionInsufficient}
        copy={connectionProps(demoConnectionInsufficient)}
      />,
    )
    expect(markup).toContain('data-state="unknown"')
    expect(markup).not.toMatch(/-\d+\s*minute/)
  })
})

describe('a rights context source is rendered apart, and never as a link (trust sweep F3)', () => {
  const markup = html(
    <RightsCard
      assessment={demoRightsEuropeanUnion}
      copy={rightsCopy({ demo: true })}
      idPrefix="t-eu-context"
    />,
  )

  it('renders the context block after the sources list', () => {
    const rendered = text(markup)
    expect(rendered).toContain(cockpit.rights.officialSources)
    expect(rendered).toContain(rightsCopy({ demo: true }).contextHeading)
    expect(rendered.indexOf(cockpit.rights.officialSources)).toBeLessThan(
      rendered.lastIndexOf(rightsCopy({ demo: true }).contextHeading),
    )
  })

  it('labels the record as context rather than as an authority', () => {
    expect(text(markup)).toContain(rightsCopy({ demo: true }).contextNote)
  })

  it('renders no anchor for it', () => {
    const context = markup.slice(markup.indexOf('dpp-rights__context'))
    expect(context).not.toContain('<a ')
  })

  it('renders nothing at all when an assessment has no context sources', () => {
    const plain = html(
      <RightsCard
        assessment={demoRightsUnitedStates}
        copy={rightsCopy({ demo: true })}
        idPrefix="t-us-context"
      />,
    )
    expect(plain).not.toContain('dpp-rights__context')
  })
})

describe('a §18.5 section that is a Callout opens a heading (F25)', () => {
  it('renders the title as a heading at the level the caller passes', () => {
    const markup = html(
      <StateBlock
        kind="provider_unavailable"
        severity="info"
        title="Weather and airspace"
        headingLevel={3}
      >
        <p>No feed is connected.</p>
      </StateBlock>,
    )
    expect(markup).toContain('<h3 class="dp-callout__title">Weather and airspace</h3>')
  })

  it('keeps the <p> when no level is passed, so a notice opens no section', () => {
    const markup = html(
      <StateBlock kind="offline" severity="watch" title="You are offline">
        <p>The last saved snapshot is shown.</p>
      </StateBlock>,
    )
    expect(markup).toContain('<p class="dp-callout__title">You are offline</p>')
  })
})

describe('an illustrated loading state is not a loading state (F28)', () => {
  it('drops aria-busy while keeping the skeleton and the message', () => {
    const markup = html(<LoadingBlock label="Track a flight" message="Searching." illustration />)
    expect(markup).not.toContain('aria-busy')
    expect(markup).toContain('aria-label="Track a flight"')
    expect(text(markup)).toContain('Searching.')
  })

  it('keeps aria-busy when the region really is loading', () => {
    const markup = html(<LoadingBlock label="Track a flight" message="Searching." />)
    expect(markup).toContain('aria-busy="true"')
  })
})
