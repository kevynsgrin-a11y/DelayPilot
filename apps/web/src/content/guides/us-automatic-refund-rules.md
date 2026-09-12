---
title: 'US refund rules and what "automatic" actually means'
description: 'The US federal refund layer: which events trigger it, why declining the alternative matters, and what automatic does and does not promise.'
pageType: guide
status: source_review
intent: 'Explain the US federal refund rule as a mechanism — trigger, choice, form, timing — and dismantle the assumption that a refund and a compensation payment are the same thing.'
answerFirst: 'A US refund is your own fare coming back, not a payment on top of it. The federal rule attaches to defined events — a cancellation, a significant change, a long enough delay — and to one decision of yours: declining what the airline offered instead. Automatic describes when the airline is expected to act without you asking; it does not describe a payment for inconvenience.'
sources:
  - dot-refunds
  - dot-whats-new
ruleSetRefs:
  - jurisdiction: us
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15.1'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-10-12'
indexable: true
author: content-editorial-lead
topics:
  - united-states
  - refunds
---

Two different things get called a refund at an airport. One is the fare you paid coming back to the card you paid it with. The other is a travel credit with the airline's name on it, which is a product rather than a repayment. The US federal layer is about the first one, and most of the value in understanding it comes from being able to tell the difference under pressure.

## What triggers it

The rule is event-driven rather than inconvenience-driven. It attaches to a cancellation, to a change significant enough to meet the rule's own definition, and to a delay long enough to meet the rule's own threshold. The list of triggering events, the definition of significant, and the delay thresholds are values with effective dates, and they render here from the rule set rather than from this sentence: {{rule:us:refund.triggers}}, {{rule:us:refund.significantChange}}, {{rule:us:refund.significantDelay}}.

What "significant" covers is broader than most people expect, and is worth reading in full on the [US rights explainer](/passenger-rights/us/): it can reach changes to departure or arrival times, changes to the airports at either end, added connections, and a downgrade in the cabin you paid for. It is a structural test, not a judgement about how annoyed you are.

## The decision that actually controls the outcome

The rule is built around a choice. The airline offers you something — a seat on a later flight, a different routing, a credit. If you take it, you have accepted the alternative, and the refund question usually stops being live. If you decline it, the refund question stays open.

This is why the practical advice is so blunt: do not accept anything while you are still deciding. Nothing else on this page is as consequential, and nothing else is as hard to reverse. An airline agent offering a voucher is not doing anything improper; they are offering the option their system presents first. Your job is to know that it is one option among several.

## What the money looks like when it arrives

A refund under this layer is the fare and the associated taxes and fees coming back in the original form of payment. It is not a credit unless you chose a credit. The required form and the time the airline has to pay are rule-set values: {{rule:us:refund.form}}, {{rule:us:refund.timing}}.

If the money arrives as a credit and you did not ask for one, that is a discrepancy worth raising in writing straight away, quoting the date and the flight.

## What "automatic" promises, and what it does not

"Automatic" is about who has to start the process. Where the conditions in the rule are met, the airline is expected to act without you filing a form: {{rule:us:refund.automaticConditions}}.

It does not promise speed beyond the stated timing, it does not promise that the airline's system will classify your situation correctly, and it does not create a payment for delay. Plenty of refunds that should have been automatic are issued only after someone asked. Treat automatic as the standard you can hold the airline to, not as a reason to stop paying attention.

## What this layer is not

It is not a compensation right. There is no general US federal cash payment for an ordinary delay or cancellation, and any article that implies otherwise has imported a European idea into an American situation. Meals, hotels, ground transport and rebooking commitments come from a different layer — the voluntary commitments published on the government dashboard — which is explained in [voluntary commitments versus legal rights](/guides/voluntary-commitments-vs-legal-rights/).

Denied boarding is different again, with its own rules and its own figures, and is the one US context where a defined payment can arise.

## Enforcement guidance is not a change in the rule

In 2026 the regulator issued guidance extending limited enforcement discretion for certain renumbered flights. Enforcement discretion describes where an agency directs its attention. It does not repeal an obligation, and it has a defined scope and a defined window: {{rule:us:enforcementDiscretion.scope}}, {{rule:us:enforcementDiscretion.window}}.

If your change was a flight-number change with the same times and the same airports, this is the paragraph that applies to you, and the honest reading is careful: the underlying rule still says what it says, and the regulator has said where it is directing enforcement. That is a different sentence from "you have no case", and a different sentence from "nothing has changed".

## What you still need to know

Before anyone can assess a US refund question, four facts need to exist in writing: what the itinerary was when you bought it, what it became, whether you accepted the alternative and when, and whether the change meets the rule's definition of significant. The first two are screenshots. The third is a message you sent or did not send. The fourth is the part that needs the rule set.

## What to do now, in order

1. **Screenshot the original itinerary and the changed one.** Free, instant, and impossible to reconstruct once the airline's app updates.
2. **Say nothing that sounds like acceptance until you have decided.** Asking about options is not accepting them.
3. **If you do not want the alternative, decline it in writing and ask for a refund to the original form of payment.** One sentence, dated, in the airline's own channel.
4. **Keep the confirmation of that request.** It establishes when the clock started.
5. **Check whether the airline's own commitments cover meals or a hotel,** and keep those receipts separately from the refund question.
6. **Escalate to the regulator's complaint route** if the airline's answer does not match its published rule. It is free and the airline knows it.

## Sources

- `dot-refunds` — the federal refund rules, and the primary authority for every claim on this page.
- `dot-whats-new` — the regulator's current notices, including the 2026 enforcement-discretion guidance.

Each claim is mapped to one of those entries in `apps/web/src/content/claim-map.json`. Neither has been opened and verified in the build environment that produced this page, so it is held at source review and is not published. Every figure, threshold, and window above renders from a versioned rule set beside its effective date; none is written into this text.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
