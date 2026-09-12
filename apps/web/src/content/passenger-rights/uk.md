---
title: 'UK air passenger rights: how UK261 is structured'
description: 'UK261 read from CAA guidance: which flights it reaches, care while you wait, the reroute-or-refund choice, and why separate tickets are not one journey.'
pageType: rights-explainer
jurisdiction: uk
status: source_review
intent: 'Set out the UK framework on its own terms, separate from the EU one, and make clear that a self-transfer on separate tickets is never a protected through journey.'
answerFirst: 'UK261 is the UK framework, read from the Civil Aviation Authority guidance rather than from EU material. It can require care while you wait, a choice between rerouting and a refund, and in defined circumstances a fixed sum that depends on flight distance and how late you arrived. It is a separate framework from the EU one, and changes to the EU rules do not automatically change it.'
sources:
  - uk-caa-delays
  - eu-your-europe-air
  - icao-montreal
ruleSetRefs:
  - jurisdiction: uk
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15.3'
  - 'DIRECTIVE.md §15.5'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-12-11'
indexable: true
author: content-editorial-lead
topics:
  - passenger-rights
  - united-kingdom
  - uk261
---

UK261 looks familiar to anyone who has read the EU framework, and that familiarity is the trap. The two are separate bodies of law with separate authorities behind them, they are amended separately, and a change announced in Brussels is not a change to what the Civil Aviation Authority publishes. Read the UK rules from the UK regulator, and read them in the same three-question order that makes any of these frameworks tractable: does this reach my flight, what must happen to me now, and does this disruption also produce a fixed sum?

## Which flights it reaches

Coverage turns on where the flight departed, where it arrived, and which carrier operated it — the same three dimensions as the EU framework, combined under UK rules and published by the UK regulator. The exact test is a rule-set value, not a sentence we will paraphrase from memory: {{rule:uk:coverage.tests}}.

The practical consequence is that a journey touching both the UK and the EU can fall under one framework, the other, or in some configurations be assessed differently depending on the carrier. That is a reason to establish which framework applies before reading anything about figures.

## Care while you wait

The obligations that attach to waiting — refreshments, a means of communication, and accommodation with transport to it where an overnight is involved — do not depend on establishing whose fault the disruption was. They are triggered by distance and waiting time: {{rule:uk:care.thresholds}}.

This is the part most often not claimed, because passengers assume that a weather day removes everything. Ask at the desk, and if the airline does not provide it, buy what is reasonable and keep the receipt. Reasonable is doing its work in that sentence: a meal is a different proposition from a long taxi ride and a suite.

## The choice after a cancellation

A cancellation puts a choice in front of you rather than handing you an award: be rerouted at the earliest opportunity, be rerouted later at your convenience, or take the fare back. Choosing is your decision, and it changes what else remains open. Make it after you have read the rest of this page, not at the desk in the first rush.

Where a delay becomes long enough, a comparable choice can arise: {{rule:uk:delay.refundThreshold}}.

## The fixed sum

The UK framework attaches a fixed sum to defined circumstances. It varies by the distance of the flight, and on the longest flights it varies again according to how late you arrived at your final destination. Those bands, the distance boundaries between them, the qualifying arrival delay, and the cancellation notice bands all render from the rule set in force on your travel date: {{rule:uk:compensation.bands}}, {{rule:uk:compensation.distanceBands}}, {{rule:uk:delay.compensationThreshold}}, {{rule:uk:cancellation.noticeBands}}.

Distance is measured as a great-circle distance between the airports, which is why a route that feels long can sit in a lower band than you expect. DelayPilot computes that distance with a single shared implementation and states its units, rather than quoting a figure from a travel site.

## Separate tickets are not one journey

This is the UK section with the most money attached and the least ambiguity. Where your flights sit on one reservation, the assessment runs to your final destination. Where you bought two tickets and connected yourself — a self-transfer — you have two journeys, each assessed on its own, and the missed second flight is generally a flight you did not turn up for.

No amount of feasibility changes this. A connection can look comfortable, be sold to you by a travel site as a single itinerary, and still be two separate contracts. DelayPilot never marks a separate-ticket connection as protected, and when we cannot tell, we ask you rather than assume.

## Extraordinary circumstances

An airline can assert that a disruption was caused by extraordinary circumstances it could not have avoided with all reasonable measures. Treat that as an assertion with a determination still to come. Weather near the airport, an airspace restriction, or a crew shortage reported in the press is context and not proof about your specific flight. DelayPilot stores what the airline stated as airline-stated, and never promotes it to a finding.

Care obligations are not switched off by that argument.

## Baggage is a different framework

Delayed, damaged, or lost baggage is governed by the Montreal Convention, which has its own limits, its own currency mechanism, and its own time limits for notifying the airline. It is not part of UK261 and the two must not be added together. DelayPilot does not assess baggage claims and points to the convention material instead.

## What you still need to know

A UK assessment typically stalls on: which carrier operated the flight, whether your flights were one reservation, when the airline notified you, your actual arrival time at the final destination, and the airline's stated reason in writing.

## What to do now, in order

1. **Record your actual arrival time at your final destination.** On long flights it is the fact that decides which band you are in.
2. **Screenshot the notification with its timestamp.** Notice is a test in the cancellation rules.
3. **Ask for care at the desk while you wait,** and keep receipts if you buy your own.
4. **Confirm whether your flights are on one reservation** before you read anything about a missed connection.
5. **Make the reroute-or-refund choice deliberately.** It is the least reversible step here.
6. **Ask the airline for its reason in writing,** then take the answer to the UK regulator's complaint route if it does not match its published position.

## Sources

- `uk-caa-delays` — the UK Civil Aviation Authority's own guidance on delays and cancellations; the primary authority for every UK claim above.
- `eu-your-europe-air` — cited only to support the statement that the EU framework is a separate body of material with its own scope.
- `icao-montreal` — cited only for the existence and separateness of the baggage liability framework.

Every regulatory claim above is mapped to one of those entries in `apps/web/src/content/claim-map.json`. None has been opened and verified in the build environment that produced this page, so it is held at source review and is not published.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
