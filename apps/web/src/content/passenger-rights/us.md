---
title: 'US air passenger rights: five layers, not one rule'
description: 'US refund rules, voluntary commitments, denied-boarding rules, enforcement guidance and the contract of carriage are five separate things.'
pageType: rights-explainer
jurisdiction: us
status: source_review
intent: 'Separate the five distinct layers of US air passenger protection so a reader stops treating a voluntary commitment as a legal right, or a refund rule as a compensation rule.'
answerFirst: 'US federal rules can require an airline to refund you in defined situations. They do not create a general federal cash-compensation right for an ordinary delay or cancellation, and any page that says otherwise is describing a different country. Four further layers sit around that refund rule, each with a different author and a different force.'
sources:
  - dot-refunds
  - dot-whats-new
  - dot-dashboard
ruleSetRefs:
  - jurisdiction: us
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15.1'
  - 'docs/EDITORIAL_POLICY.md'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-10-12'
indexable: true
author: content-editorial-lead
topics:
  - passenger-rights
  - united-states
  - refunds
---

The single most expensive misunderstanding in US air travel is that a long delay produces a payment. It generally does not. What the federal layer does is define when the money you already paid has to come back to you, in what form, and how quickly. Everything that looks like compensation — a hotel, a meal, a credit, a cash gesture — comes from a different layer with a different author, and can be changed by that author without any change in the law.

## The five layers

| Layer                 | What it is                                                             | Who sets it                    | Can it change without a rule change?    |
| --------------------- | ---------------------------------------------------------------------- | ------------------------------ | --------------------------------------- |
| Federal refund rule   | When a refund is required, in what form, and by when                   | The federal regulator          | No                                      |
| Voluntary commitments | What an airline says it will do for a controllable disruption          | Each airline, published by DOT | Yes                                     |
| Denied-boarding rules | What applies when you hold a confirmed seat and are not carried        | The federal regulator          | No                                      |
| Enforcement guidance  | Where the regulator will and will not direct its enforcement attention | The federal regulator          | Yes, and it is not a change in the rule |
| Contract of carriage  | The airline's own contractual promises to you                          | Each airline                   | Yes                                     |

Reading them as one thing produces two predictable errors: expecting a payment the law does not require, and missing a refund the law does require because an airline offered a credit first.

## Layer one: the federal refund rule

This is the statutory layer, and the one worth knowing well. It attaches to defined events rather than to inconvenience: a cancellation, a change to your itinerary significant enough to meet the rule's own definition, a delay long enough to meet the rule's own threshold, and — critically — your decision not to accept what the airline offered instead.

The triggers, the definition of a significant change, the delay thresholds, the form the refund must take, and the time the airline has to pay it are all values with effective dates. They render here from the rule set in force on your travel date rather than from this sentence: {{rule:us:refund.triggers}}, {{rule:us:refund.significantChange}}, {{rule:us:refund.significantDelay}}, {{rule:us:refund.form}}, {{rule:us:refund.timing}}.

Two practical consequences follow from the structure, and neither depends on a number.

First, **accepting the alternative is a choice.** If you take the rebooking, the credit, or the voucher, you have accepted what the airline offered, and the refund question generally stops being live. That is why our action lists put irreversible steps last.

Second, **a refund is the fare coming back, not a payment on top.** If you have already travelled on the changed itinerary, you are asking a different question than the one this rule answers.

## Layer two: voluntary commitments

The government publishes a dashboard showing what each airline has committed to do when a disruption is within its control — the kind of thing travellers experience as meals, hotels, ground transport, and rebooking. Those commitments are real and useful, and they are not law. An airline can change its own commitment, and the dashboard reflects the change rather than preventing it.

DelayPilot presents commitments in a separate module from statutory rights for that reason, cited to the dashboard with the date we last verified it: {{rule:us:dashboard.commitmentCategories}}. If a page blends the two, you cannot tell which part survives an airline changing its mind.

## Layer three: denied boarding

Being involuntarily denied boarding when you hold a confirmed seat is governed by its own rules, with their own conditions and their own figures. It is a genuinely different situation from a delay or a cancellation, it is the one US context where a defined payment can arise, and it does not generalise: {{rule:us:deniedBoarding.conditions}}, {{rule:us:deniedBoarding.amounts}}.

## Layer four: enforcement guidance

In 2026 the regulator issued guidance extending limited enforcement discretion for certain renumbered flights. Enforcement discretion is a statement about where an agency will direct its attention. It is not a repeal, it does not delete the underlying obligation, and it has a defined scope and a defined window: {{rule:us:enforcementDiscretion.scope}}, {{rule:us:enforcementDiscretion.window}}.

DelayPilot models it as guidance. If your situation falls inside its scope, the honest reading is that the rule still says what it says while the regulator has said where it is directing enforcement — which is exactly the kind of nuance that a confident summary destroys.

## Layer five: the contract of carriage

Every airline publishes a contract of carriage, and it is the document that actually governs the commercial relationship between you and the airline. It can promise more than the regulations require. DelayPilot only reflects contract terms from a source that has been reviewed and recorded, because these documents are long, airline-specific, and revised without announcement.

## What you still need to know

A US assessment usually stalls on one of four facts. Whether the change to your itinerary meets the rule's definition of significant. Whether you accepted the alternative, and when. Whether the disruption was within the airline's control, which decides the voluntary layer and not the statutory one. And whether you were denied boarding or simply not carried for another reason, which are different things with different rules.

## What to do now, in order

1. **Screenshot the itinerary as sold, and the itinerary as changed.** Free, instant, and impossible to reconstruct later.
2. **Save the airline's message announcing the change, with its timestamp.** The words the airline used are a fact; what it meant is not.
3. **Ask for the refund explicitly and in writing if you do not want the alternative.** Silence can look like acceptance.
4. **Do not accept a credit or voucher while you are still deciding.** This is the most commonly regretted irreversible step in US disruption.
5. **Check the airline's commitments on the government dashboard** for the meals, hotel, and ground-transport layer, and keep the receipts either way.
6. **Escalate to the regulator's complaint channel** if the airline's answer and its own published rule do not match.

## Sources

- `dot-refunds` — the federal refund rules layer.
- `dot-whats-new` — the 2026 enforcement-discretion notice and subsequent regulator updates.
- `dot-dashboard` — the airline customer-service commitments layer.

Each claim on this page is mapped to one of those registry entries in `apps/web/src/content/claim-map.json`. None has been opened and verified in the build environment that produced this page, so the page is held at source review and is not published. The values above render from a rule set once one reaches in-force status; no amount, threshold, or window is written into this text.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
