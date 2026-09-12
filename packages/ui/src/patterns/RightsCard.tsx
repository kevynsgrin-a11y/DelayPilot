/**
 * RightsCard — answer-first, with expandable reasoning.
 *
 * `DIRECTIVE.md §18.5` fixes the fields: jurisdiction · rule-set date/version · "What may apply" ·
 * "What we still need to know" · refund · rebooking · care · compensation · deadline · evidence
 * checklist · official source links · current-vs-future rule notice · disclaimer.
 *
 * The four rules this file exists to keep:
 *
 * 1. **Exactly five statuses**, rendered verbatim: `likely_applies`, `may_apply`, `not_indicated`,
 *    `cannot_determine`, `future_rule_not_active` (`AGENTS.md §1.3`). The status word is a prop and
 *    the tone is reinforcement; there is no sixth branch to fall into.
 * 2. **Amounts come from the payload.** `RightsLine.amount` is rendered as the string the
 *    assessment produced. Nothing here composes a figure, and nothing here sums two figures: a
 *    total states an entitlement as settled, which is the overclaim `AGENTS.md §1.3` forbids
 *    wearing a different hat.
 * 3. **A future rule renders as future.** `futureRule` is its own module with its own heading, and
 *    its status is typed to the single literal `future_rule_not_active`, so an
 *    `adopted_not_effective` rule set cannot be rendered as applicable (`DIRECTIVE.md §3.5`).
 * 4. **Voluntary commitments are separate.** US airline dashboard commitments are voluntary and
 *    distinct from statutory refund rights, so they get their own labelled module and make no
 *    claim (`DIRECTIVE.md §3.5`).
 * 5. **A secondary record never sits in the sources list.** `contextSources` is its own labelled
 *    block, after the sources, rendered as text — `RightsContextSource` has no `href` at any value,
 *    so a press release cannot be styled like a regulator (`DIRECTIVE.md §3.5`, trust sweep F3).
 *    `ArticleLayout.astro` renders the same block from the same three copy exports.
 *
 * The §26 rights disclaimer sits inside the card, beside the result it qualifies — not only in the
 * page footer.
 */

import type { JSX } from 'react'
import { Card } from '../primitives/Card.tsx'
import { Disclosure } from '../primitives/Disclosure.tsx'
import { Link } from '../primitives/Link.tsx'
import { ProvenanceChip } from '../primitives/ProvenanceChip.tsx'
import { StatusPill } from '../primitives/StatusPill.tsx'
import { Disclaimer } from './atoms.tsx'
import { rightsStatusTone, type RightsAssessment, type RightsStatus } from './types.ts'

export interface RightsCardCopy {
  readonly heading: string
  readonly jurisdictionLabel: string
  readonly ruleSetLabel: string
  readonly whatMayApplyLabel: string
  readonly whatWeStillNeedLabel: string
  readonly entitlementsLabel: string
  readonly evidenceLabel: string
  readonly sourcesLabel: string
  /**
   * The three strings for the context block (`pages.article.contextHeading` / `contextIntro` /
   * `contextNote`). `ArticleLayout.astro` renders the same block from the same three exports; the
   * two surfaces must read identically, so they take the same copy rather than two wordings of it.
   */
  readonly contextHeading: string
  readonly contextIntro: string
  readonly contextNote: string
  readonly futureRuleLabel: string
  readonly voluntaryLabel: string
  readonly reasoningSummary: string
  readonly statusLabel: Readonly<Record<RightsStatus, string>>
  /** `DIRECTIVE.md §26` rights disclaimer, verbatim. */
  readonly disclaimer: string
  readonly disclaimerLabel: string
  /** `DIRECTIVE.md §27` rights microcopy, verbatim. */
  readonly resultNote: string
  readonly newTabLabel: string
  readonly sourceUnavailableLabel: string
  readonly demoCaption?: string
}

export interface RightsCardProps {
  readonly assessment: RightsAssessment
  readonly copy: RightsCardCopy
  readonly headingLevel?: 2 | 3 | 4
  readonly className?: string
  /** Stable id fragment so two rights cards on one page do not share element ids. */
  readonly idPrefix: string
}

const HEADING_TAG = { 2: 'h2', 3: 'h3', 4: 'h4' } as const

export function RightsCard({
  assessment,
  copy,
  headingLevel = 3,
  className,
  idPrefix,
}: RightsCardProps): JSX.Element {
  const Heading = HEADING_TAG[headingLevel]
  const headingId = `${idPrefix}-rights-title`

  return (
    <Card as="section" aria-labelledby={headingId} className={`dpp-rights ${className ?? ''}`}>
      <header className="dpp-rights__header">
        <Heading className="dpp-rights__title" id={headingId}>
          {copy.heading}
        </Heading>
        <dl className="dpp-rights__meta">
          <div className="dpp-row">
            <dt className="dpp-row__label">{copy.jurisdictionLabel}</dt>
            <dd className="dpp-row__value">{assessment.jurisdiction}</dd>
          </div>
          <div className="dpp-row">
            <dt className="dpp-row__label">{copy.ruleSetLabel}</dt>
            <dd className="dpp-row__value">{assessment.ruleSet}</dd>
          </div>
        </dl>
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

      {/* Answer first. */}
      <section className="dpp-rights__answer">
        <h4 className="dpp-rights__subheading">{copy.whatMayApplyLabel}</h4>
        <p className="dpp-rights__lede">{assessment.whatMayApply}</p>
      </section>

      <section className="dpp-rights__entitlements">
        <h4 className="dpp-rights__subheading">{copy.entitlementsLabel}</h4>
        <ul className="dpp-rights__lines">
          {assessment.lines.map((line) => (
            <li key={line.key} className="dpp-rights__line">
              <div className="dpp-rights__line-head">
                <span className="dpp-rights__line-label">{line.label}</span>
                <StatusPill
                  status={rightsStatusTone[line.status]}
                  label={copy.statusLabel[line.status]}
                />
              </div>
              <p className="dpp-rights__line-detail">{line.detail}</p>
              {/* Rendered verbatim from the assessment payload. Never composed, never totalled. */}
              {line.amount === undefined ? null : (
                <p className="dpp-rights__line-amount tnum">{line.amount}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Disclosure summary={copy.reasoningSummary} className="dpp-rights__reasoning">
        <h4 className="dpp-rights__subheading">{copy.whatWeStillNeedLabel}</h4>
        <ul className="dpp-list">
          {assessment.whatWeStillNeed.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <h4 className="dpp-rights__subheading">{copy.evidenceLabel}</h4>
        <ul className="dpp-list">
          {assessment.evidenceChecklist.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Disclosure>

      {assessment.futureRule === undefined ? null : (
        <section className="dpp-rights__future">
          <h4 className="dpp-rights__subheading">{copy.futureRuleLabel}</h4>
          <div className="dpp-rights__line-head">
            <span className="dpp-rights__line-label">{assessment.futureRule.label}</span>
            <StatusPill
              status={rightsStatusTone[assessment.futureRule.status]}
              label={copy.statusLabel[assessment.futureRule.status]}
            />
          </div>
          <p className="dpp-rights__line-detail">{assessment.futureRule.detail}</p>
        </section>
      )}

      {assessment.voluntaryCommitments === undefined ? null : (
        <section className="dpp-rights__voluntary">
          <h4 className="dpp-rights__subheading">{copy.voluntaryLabel}</h4>
          {/* The payload's own label is rendered only when it says something the heading does
              not — a specific commitment set, rather than a second copy of "Voluntary airline
              commitments" stacked under itself. */}
          {assessment.voluntaryCommitments.label === copy.voluntaryLabel ? null : (
            <p className="dpp-rights__line-label">{assessment.voluntaryCommitments.label}</p>
          )}
          <p className="dpp-rights__line-detail">{assessment.voluntaryCommitments.detail}</p>
        </section>
      )}

      <section className="dpp-rights__sources">
        <h4 className="dpp-rights__subheading">{copy.sourcesLabel}</h4>
        <ul className="dpp-list">
          {assessment.sources.map((source) => (
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

      {/*
        A record that reports ON a rule, in its own block after the sources — never inside them,
        never a link, never counted (trust sweep F3). `RightsContextSource` has no `href` at any
        value, so this cannot become a link by editing markup; it would have to change a type.
       */}
      {assessment.contextSources === undefined || assessment.contextSources.length === 0 ? null : (
        <section className="dpp-rights__context">
          <h4 className="dpp-rights__subheading">{copy.contextHeading}</h4>
          <p className="dpp-rights__line-detail">{copy.contextIntro}</p>
          <ul className="dpp-list">
            {assessment.contextSources.map((source) => (
              <li key={source.id}>
                {source.label}
                <span className="dpp-rights__source-note"> — {copy.contextNote}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="dpp-rights__result-note">{copy.resultNote}</p>

      <Disclaimer label={copy.disclaimerLabel}>{copy.disclaimer}</Disclaimer>
    </Card>
  )
}
