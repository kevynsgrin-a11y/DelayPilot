---
title: 'EU air passenger rights under the rule currently in force'
description: 'How EC 261 is structured: coverage, care, rerouting, cancellation notice, arrival delay at the final destination, and extraordinary circumstances.'
pageType: rights-explainer
jurisdiction: eu
status: source_review
intent: 'Explain the structure of the EU framework in force today — coverage, care, choice and cause — without applying the adopted 2026 reform and without writing a single figure into prose.'
answerFirst: 'The EU framework in force today can require an airline to look after you, to reroute or reimburse you, and in defined circumstances to pay a fixed sum. Whether it reaches your flight depends on where you departed, where you arrived and who operated it, and whether it produces a payment depends on notice, arrival delay at your final destination and the cause. A reform adopted in 2026 has not taken effect and is applied to nothing.'
sources:
  - eu-your-europe-air
contextSources:
  - eu-council-2026-07-13
ruleSetRefs:
  - jurisdiction: eu
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15.2'
  - 'DIRECTIVE.md §3.5'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-10-12'
indexable: true
author: content-editorial-lead
topics:
  - passenger-rights
  - european-union
  - ec261
---

EC 261 is easier to use once you stop reading it as a single payout and start reading it as three separate questions asked in order. Does the rule reach this flight at all? If it does, what must happen to you now — food, communication, somewhere to sleep, a way onward or your money back? And only then: does this particular disruption also produce the fixed sum people mean when they say compensation? Most confused conversations about EU rights are two people answering different ones of those three questions.

## Question one: does the rule reach your flight?

Coverage turns on a combination of where the flight departed, where it arrived, and whether the operating carrier is an EU carrier. The combinations are precise, and they are the reason two passengers on apparently similar journeys get different answers. The rule set holds the exact test: {{rule:eu:coverage.tests}}.

Two topology facts matter as much as geography. A journey sold on one reservation is assessed to its **final destination**, not segment by segment — so a short first leg that causes a long arrival delay is measured at the end of the journey, not at the connecting airport. Flights bought separately are separate journeys, however tight the connection looked when you booked.

## Question two: care, rerouting, and reimbursement

The care obligations — refreshments, communication, and accommodation where an overnight is involved — attach to waiting, and they are not conditional on whose fault the disruption was. That is the part travellers most often leave on the table, because they assume that a weather disruption removes every obligation. It does not remove this one. The thresholds that trigger care are distance- and delay-dependent rule-set values: {{rule:eu:care.thresholds}}.

When a flight is cancelled, the rule frames your position as a choice rather than an award: being rerouted, being rerouted later at your convenience, or having the fare reimbursed. The choice is yours to make, and making it changes what else remains available. If the disruption is long enough, a similar choice can arise on a delay: {{rule:eu:delay.reimbursementThreshold}}.

## Question three: the fixed sum

This is the part that has figures attached, and the part this page deliberately does not print. The sum depends on the flight distance band, and it can be reduced when you accept rerouting that gets you there within a defined window. Both the bands and the reduction render from the rule set in force on your travel date: {{rule:eu:compensation.bands}}, {{rule:eu:compensation.distanceBands}}, {{rule:eu:rerouting.reduction}}.

Two further conditions sit in front of it.

**Notice.** For a cancellation, how far ahead you were told changes the answer, and the notice bands are themselves rule-set values with effective dates: {{rule:eu:cancellation.noticeBands}}. Keep the message in which the airline told you; its timestamp is the fact the whole test turns on.

**Arrival delay at the final destination.** The measurement is when you arrived, not when you departed, and the qualifying delay is a rule-set threshold: {{rule:eu:delay.compensationThreshold}}.

## Extraordinary circumstances are an assertion, not a weather report

An airline can argue that a disruption was caused by extraordinary circumstances that could not have been avoided even if all reasonable measures had been taken. Three things follow, and none of them is what the phrase sounds like.

It is an **assertion by the airline**, not a fact you can read off a forecast. A thunderstorm near the airport, a snow warning, or a busy airspace day is context. It does not establish that this particular disruption was outside the carrier's control, and it says nothing about whether all reasonable measures were taken.

It is **subject to determination** by the airline first and then, if you press it, by a national enforcement body or a court. DelayPilot records what the airline stated and labels it as airline-stated. We never convert it into a determination, in either direction.

It does not switch off care. The obligation to look after you while you wait does not depend on winning the cause argument.

## The 2026 reform is adopted, and is not in effect

A reform of the EU framework received final clearance from the Council in 2026. It enters into force on a date computed from its publication in the Official Journal, and that publication date has not been verified by DelayPilot. Until it is, the reform is stored with the status `adopted_not_effective`, it is displayed beside the rule in force rather than instead of it, and it is applied to no event — neither early, nor retroactively to a disruption that happened before its effective date. The side-by-side timeline is in our guide to the 2026 reform.

## What you still need to know

An EU assessment usually stalls on: which carrier actually operated the flight, as opposed to whose code was on the ticket; whether your flights were one reservation or several; exactly when the airline notified you of a cancellation; your actual arrival time at the final destination; and what the airline stated as the reason, in writing.

## What to do now, in order

1. **Note your actual arrival time at your final destination.** It is the fact the delay test turns on and it disappears from your memory within a day.
2. **Screenshot the cancellation or change message with its timestamp visible.** Notice is a test, and a screenshot is evidence of it.
3. **Ask for care while you are waiting,** and keep the receipts if you buy your own. This obligation does not wait for the cause argument to be settled.
4. **Make the reroute-or-reimburse choice deliberately.** It is the decision on this page with the least room to change your mind.
5. **Ask the airline, in writing, for the reason for the disruption.** Its answer is an assertion; it is also the input an assessment about cause is waiting on.
6. **Take it to the national enforcement body** in the relevant country if the airline's answer and its own published position do not line up.

## Sources

- `eu-your-europe-air` — the official EU summary of air passenger rights under the framework in force; the authority for every EU claim above.

**Context source, not an authority.** `eu-council-2026-07-13`, the Council's 2026 final-clearance release, is a press release: the registry records it as secondary and not citable for a rule value. It supports the status note that the reform is adopted and not yet effective, and nothing else. No amount, threshold, or date on this page rests on it.

Each regulatory claim above is mapped in `apps/web/src/content/claim-map.json`. Neither record has been opened and verified in the build environment that produced this page, so the page is held at source review and is not published.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
