---
title: 'EU rights under the rule in force: a walkthrough with your itinerary'
description: 'Five facts decide an EC 261 assessment. Here is how to establish each one from your own itinerary and messages, before anyone quotes a figure at you.'
pageType: guide
status: source_review
intent: 'Walk a traveller through establishing the five facts an EU assessment needs — operating carrier, topology, notice, arrival time, stated cause — from documents they already have.'
answerFirst: 'An EU assessment is decided by five facts you can establish yourself: who actually operated the flight, whether your journey was one reservation, when the airline told you, when you really arrived at your final destination, and what the airline stated as the cause. Collect those five and the rest is arithmetic against a dated rule set. Collect none of them and no figure anyone quotes you means anything.'
sources:
  - eu-your-europe-air
  - eu-council-2026-07-13
ruleSetRefs:
  - jurisdiction: eu
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15.2'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-10-12'
indexable: true
author: content-editorial-lead
topics:
  - european-union
  - ec261
  - evidence
---

Open your itinerary and the messages the airline sent you. Everything below can be settled from those two things in about ten minutes, and settling them is the difference between a question somebody can answer and a question that stalls forever in "it depends". The structure of the framework itself is on the [EU rights explainer](/passenger-rights/eu/); this page is about producing the inputs it needs.

## Fact one: who operated the flight

Not whose name is on your ticket — who actually flew the aircraft. Codeshares make these different more often than travellers expect, and the operating carrier is what several coverage tests turn on.

Look for the phrase "operated by" on the itinerary or the boarding pass. If it is there, that is your carrier. If your ticket says one airline and the aircraft had another airline's name on the tail, write both down and let the assessment use the operating one.

## Fact two: one reservation, or several?

This is the fact with the largest effect and the least glamour. A journey sold on one reservation is assessed to its final destination — the place your ticket says you were going, not the airport where the connection broke. Flights bought separately are separate journeys, no matter how tight or how sensible the connection looked.

Check the number of separate confirmations in your email. Two confirmations generally means two journeys. If a travel site sold you both in one transaction, that still does not necessarily make them one contract of carriage; look at what the airlines issued, not what the reseller's page looked like. [Self-transfer risk](/guides/self-transfer-risk/) covers what changes when the answer is "several".

## Fact three: when they told you

Notice is a live test in the cancellation rules, and the bands are rule-set values with effective dates: {{rule:eu:cancellation.noticeBands}}.

The evidence is the message itself with its timestamp, not your memory of the afternoon. Airline apps replace itineraries in place, so the screen that told you is frequently gone by the time you think to look. Screenshot it, or forward the email to yourself so it keeps its headers.

## Fact four: when you actually arrived

The delay that matters for the fixed-sum question is measured at your final destination, and the qualifying threshold is a rule-set value: {{rule:eu:delay.compensationThreshold}}.

"Arrived" has a technical meaning that is not the same as when the wheels touched down, and it is one of the most litigated points in the framework. Record the time the aircraft parked and the doors opened, to the minute, on the day. A photograph of the arrivals board or a timestamped message to someone meeting you is better evidence than a recollection.

## Fact five: what the airline stated as the cause

Ask for it in writing, and store it as what it is: an assertion by the airline. An airline can argue that the disruption was caused by extraordinary circumstances that could not have been avoided even with all reasonable measures. That argument is assessed by a national enforcement body or a court, not settled by the airline saying it.

It is also not settled by the weather. A storm over the airport is context; it does not establish that your specific disruption was outside the carrier's control, and it says nothing about whether all reasonable measures were taken. DelayPilot keeps the airline's stated cause, a provider's reported cause and observed weather as three separate fields precisely so that none of them can quietly become a fourth thing: a determination.

## What the framework offers once those facts exist

Three different outcomes, and it is worth knowing which one you are chasing.

**Care while you wait** — refreshments, a means of communication, accommodation where an overnight is involved. It is triggered by distance and waiting time, not by fault: {{rule:eu:care.thresholds}}. This is the one people most often fail to claim.

**A choice after a cancellation** — rerouting now, rerouting later at your convenience, or reimbursement of the fare. Choosing is the least reversible thing you will do.

**A fixed sum,** where the conditions are met, varying by distance band and reducible when you accept rerouting that gets you there within a defined window: {{rule:eu:compensation.bands}}, {{rule:eu:compensation.distanceBands}}, {{rule:eu:rerouting.reduction}}.

## Which version of the rule applies to you

The rule applied to an event is the one in force on the date of the event. A reform of the EU framework was adopted in 2026 and has not reached its effective date; DelayPilot stores it as adopted and not effective, shows it beside the current rule, and applies it to nothing. See [the 2026 EU reform timeline](/guides/eu-2026-reform-timeline/) for the adopted-versus-effective picture. If you read an article that applies the reform to a flight that has already happened, close it.

## What you still need to know

If any of the five facts is missing, say which one. An assessment that names its gap is useful; an assessment that guesses is worse than none. The gap most often is the stated cause, and the fastest route to closing it is a single written request to the airline.

## What to do now, in order

1. **Screenshot the itinerary as sold and the message that changed it.** Both, with timestamps visible.
2. **Count your confirmations** to establish whether this was one journey or several.
3. **Write down your actual arrival time at the final destination** while you still remember it.
4. **Ask for care at the airport,** and keep receipts for whatever you buy yourself.
5. **Email the airline for its stated reason,** in one sentence, before you do anything else with the claim.
6. **Make the reroute-or-reimburse choice last,** because it is the one you cannot unmake.
7. **Escalate to the national enforcement body** of the relevant country if the airline's answer does not match its published position.

## Sources

- `eu-your-europe-air` — the official EU summary of air passenger rights under the framework in force.
- `eu-council-2026-07-13` — the Council's 2026 clearance release, cited only for the adopted-not-effective status of the reform.

Each claim is mapped to one of those entries in `apps/web/src/content/claim-map.json`. Neither has been opened and verified in the build environment that produced this page, so it is held at source review and is not published.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
