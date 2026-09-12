---
title: 'How DelayPilot assesses passenger rights'
description: 'The five rights statuses DelayPilot can report, the facts that decide which one applies, and why each jurisdiction page waits for source verification.'
pageType: rights-explainer
jurisdiction: overview
status: publishable
intent: 'Teach a reader to interpret any DelayPilot rights result by explaining the five statuses, the facts that produce them, and the rule-set versioning behind every value.'
answerFirst: 'DelayPilot reports which of five statuses your situation reaches under a dated rule set. It never reports that a payment is due, because that determination belongs to the airline or the regulator, not to us. Every value we show comes from a versioned rule set with an effective date, and every fact we are missing is named rather than assumed.'
sources: []
internalRefs:
  - 'DIRECTIVE.md §15'
  - 'DIRECTIVE.md §17'
  - 'DIRECTIVE.md §26'
  - 'DIRECTIVE.md §27'
  - 'AGENTS.md §1.3'
  - 'docs/EDITORIAL_POLICY.md'
reviewedAt: '2026-09-12'
nextReviewDue: '2027-03-11'
indexable: true
author: content-editorial-lead
topics:
  - passenger-rights
  - methodology
---

A rights assessment is a reading of your facts against a dated rule set. It is not a decision, a promise, or a prediction of what an airline will do. What DelayPilot produces is narrower and more useful than either: the status your situation reaches, the facts that produced it, the rule set and version that was applied, and the list of things we still do not know. This page explains that vocabulary so that every jurisdiction page you read afterwards means something precise.

## The five statuses

DelayPilot reports exactly five rights statuses. There is no sixth, and none of them means that money is due to you.

| Status                   | What it means                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `likely_applies`         | The facts we hold satisfy the conditions in the rule set, and no condition is left unknown.                        |
| `may_apply`              | The facts we hold are consistent with the rule, but at least one condition depends on something we cannot confirm. |
| `not_indicated`          | A condition in the rule set is not met on the facts we hold. Different facts could change this.                    |
| `cannot_determine`       | A fact the rule turns on is missing, contradictory, or unverifiable. We say which fact.                            |
| `future_rule_not_active` | A rule exists on paper but has not reached its effective date. We describe it and apply the rule in force instead. |

Read `likely_applies` as the strongest thing an independent tool can honestly say. It means the conditions we can see are met under the version shown. It does not mean a claim will succeed, because the airline and the regulator assess facts we never see, including the airline's own operational records.

## Why "may apply" is the normal result, not a hedge

Most disruptions arrive with a fact missing. The cause is stated by the airline but not determined by anyone. The reservation structure is unclear from the outside. The notice you received exists in a message you no longer have. Every one of those gaps changes the outcome under at least one framework, so a tool that answered confidently would be answering a question it had not actually been given.

`may_apply` names that gap instead of papering over it. Each `may_apply` result carries the specific condition it is waiting on, which is also the fastest route to a firm answer: one email to the airline asking for its stated reason in writing often converts `cannot_determine` into something decidable.

## The facts that decide the outcome

Across every framework DelayPilot models, the same small set of facts does most of the work.

- **Jurisdiction coverage.** Where the flight departed, where it arrived, and which carrier operated it. Each framework combines those three differently, and the exact combinations live in the rule set rather than in this prose.
- **Journey topology.** Whether your flights sit on one reservation or on separate tickets, and whether the rule measures your delay at the segment or at the final destination. This single fact changes more outcomes than any other.
- **Notice.** When the airline told you, measured against your departure. Notice bands are rule-set values with effective dates.
- **Cause, and who says it.** DelayPilot stores an airline-stated cause, a provider-stated cause, observed weather or airspace context, a passenger-reported cause, and a verified authority finding as five distinct fields. Only the last is a determination. Weather near an airport is context; it never proves that a specific disruption was outside an airline's control.
- **What you chose.** Accepting a rebooking, a voucher, or a refund is a fact with consequences. Some choices close other options, which is why our action lists are ordered by reversibility.
- **Carrier class and distance,** where a framework uses them. Both are rule-set inputs. Neither is written as prose on a DelayPilot page.

## Rule sets, versions, and effective dates

Every regulatory value DelayPilot displays is rendered from a versioned rule set, beside the version identifier and the effective date that produced it. Nothing is typed into an article body, because a number typed into prose survives the law changing and quietly becomes wrong.

A rule set carries one of six statuses: `draft`, `review`, `in_force`, `adopted_not_effective`, `superseded`, or `withdrawn`. Only `in_force` is applied to an event, and only if the event date falls inside its effective window. A rule that has been adopted but has not reached its effective date is shown side by side with the rule in force, labelled `future_rule_not_active`, and applied to nothing. Applying an adopted rule early would be as wrong as applying a superseded one late.

## The four frameworks, by name

DelayPilot models four bodies of passenger-rights material, and describes them as four separate things because they are not versions of each other.

- **United States.** Not one rule but five layers: a federal refund rule, voluntary airline commitments published on a government dashboard, denied-boarding rules, enforcement guidance from the regulator, and each airline's own contract of carriage. DelayPilot never states a general US federal cash-compensation right for an ordinary delay or cancellation. The layers are written separately because they have different authors and different force.
- **European Union.** EC 261, applied as currently in force. A reform was adopted in 2026 and has not reached its effective date; it is stored as adopted, not effective, and is never applied early or retroactively.
- **United Kingdom.** UK261, read from the UK Civil Aviation Authority's own guidance. It is a separate framework from the EU one, and a change to one is not automatically a change to the other.
- **Canada.** The Air Passenger Protection Regulations, which sort a disruption into within the airline's control, within its control but required for safety, or outside its control, and treat large and small carriers differently. Proposals under consultation are not law and are never written as law.

Baggage liability under the Montreal Convention is a separate framework again, with its own limits and its own time limits. DelayPilot does not mix it with the fixed-compensation frameworks above and does not assess it yet.

## Why the jurisdiction pages are not published

The four jurisdiction explainers are written, complete, and unpublished. Each regulatory sentence in them is mapped to a specific entry in our source registry, and none of those entries has been opened and verified in the environment that produced this build, because outbound network access to the regulators' own sites is blocked there. Under our editorial policy a page resting on a regulatory claim cannot pass source review on memory, so those pages stay unpublished until a reviewer opens each source, records the date it was verified, and a rule set reaches in-force status.

That is a slower answer than a confident one. It is the only answer that is worth the reader's trust, and it is the reason this overview contains no amount, no threshold, and no deadline.

## What to do while the jurisdiction pages wait

1. **Write down what you were told and when, in the airline's words.** This costs nothing now and is unrecoverable later.
2. **Keep the original schedule.** A screenshot of the itinerary as sold is the fact most frequently missing when someone asks for help.
3. **Ask the airline in writing for its stated reason for the disruption.** Its answer is not a determination, but it is the input that most often unblocks a `cannot_determine`.
4. **Decide slowly about anything irreversible.** Accepting a voucher or a changed itinerary can be a choice with consequences under more than one framework.
5. **Go to the regulator's own site for the values.** Until our jurisdiction pages are verified, the authority is the regulator, not us.

## Sources

This page makes no external regulatory claim. It documents DelayPilot's own method, and cites the repository documents that define it: `DIRECTIVE.md §15` (rights engine, statuses, inputs, outputs), `DIRECTIVE.md §17` (rights UI states), `DIRECTIVE.md §26` (required disclaimers), `DIRECTIVE.md §27` (result microcopy), `AGENTS.md §1.3` (the permitted statuses and forbidden phrasing), and `docs/EDITORIAL_POLICY.md` (workflow states and citation rules).

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
