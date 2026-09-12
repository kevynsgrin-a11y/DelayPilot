---
title: 'Canada: the written question that decides your APPR claim'
description: 'In Canada the airline assigns the reason category, and that assignment drives everything. Ask for it in writing on the day, and keep every notification.'
pageType: guide
status: source_review
intent: "Show a Canadian passenger how to obtain and use the airline's stated reason category in writing, and how the communication obligations create a usable record."
answerFirst: 'In Canada, the airline sorts your disruption into a reason category, and that sorting decides what it must do for you and whether a fixed sum can arise. Ask for the category and the reason in writing on the day of the disruption. There is a time limit for asking the airline for a fixed sum, so this is one of the few places where moving early genuinely matters.'
sources:
  - cta-delays-cancellations
  - cta-rebooking-refunds-compensation
ruleSetRefs:
  - jurisdiction: canada
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15.4'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-10-12'
indexable: true
author: content-editorial-lead
topics:
  - canada
  - appr
  - evidence
---

Canadian air passenger rules hand the first and most consequential decision to the airline: which of three reason categories your disruption belongs in. Everything downstream — communication, care, rebooking, refund, and whether a fixed sum is even possible — follows from that assignment. The categories themselves are explained on the [Canada rights explainer](/passenger-rights/canada/). This page is about getting the assignment out of the airline and into writing while it still can be.

## Why the written reason is worth more than anything else you do

A spoken reason at a desk is not evidence, is often given by someone who does not know, and changes between staff members. A written reason is a position the airline has taken, dated, in its own words. If it later assigns a different category, the discrepancy is itself the strongest thing in your file.

The request does not need to be clever. One message, in the airline's own channel, on the day:

> Please confirm the reason recorded for the disruption to this flight on this date, and which category it has been assigned under the Canadian air passenger protection regulations.

That is the whole technique. It works because the airline has to have an answer, and because asking on the day makes the answer contemporaneous.

## What the airline is supposed to be doing while you wait

The regulations attach obligations to the waiting itself. The airline is expected to keep you informed on a defined cadence, to look after you where the category calls for it, and to get you to your destination by rebooking within defined windows, with a refund available where that does not happen or no longer serves your purpose. Those values come from the rule set: {{rule:canada:communication.cadence}}, {{rule:canada:care.thresholds}}, {{rule:canada:rebooking.windows}}, {{rule:canada:refund.conditions}}.

The communication obligation is the one most travellers do not realise exists, and it has a useful side effect: each update you receive is a timestamped record of what the airline knew and when. Keep them all, including the ones that told you nothing.

## The fixed sum, and the clock on it

Where a fixed sum arises, it is calculated from your arrival delay at your destination, in bands, and it depends on whether the carrier is treated as large or small. Carrier class is a defined classification read from the official source, not a judgement about the airline's size or reputation: {{rule:canada:carrierClass.definition}}, {{rule:canada:compensation.largeCarrier}}, {{rule:canada:compensation.smallCarrier}}, {{rule:canada:compensation.arrivalDelayBands}}.

There is a time limit for asking the airline, and it is a rule-set value with an effective date: {{rule:canada:claim.deadline}}. This is the reason Canada is the jurisdiction where procrastination costs the most. Ask inside the limit even if you are still gathering evidence; a request made in time can be supplemented later, while a request made late is simply late.

## Cause is claimed by the airline and resolved by the regulator

The airline makes the initial category assignment and has an obvious interest in the result. It is not the last word. The Canadian Transportation Agency resolves disputes about which category a disruption belongs in.

The category must not be inferred from the weather either. A snowstorm at the airport is context. It does not establish that your specific cancellation was outside the carrier's control, and the same storm produces disruptions on both sides of the line — an aircraft that could not land is a different story from an aircraft on the ground with no crew available to fly it.

DelayPilot records an airline-stated cause as airline-stated, a provider-reported cause as provider-reported, and observed weather as context. None of the three becomes a determination on our screen.

## Proposals are not rules

Canadian passenger-rights rules have been through consultation and proposed amendment, and coverage of those proposals reads very much like coverage of law. A consultation paper, a draft regulation, or an announcement is not a rule in force. DelayPilot activates a Canadian rule version only once it is verified as in force, and says so beside the version. If an article tells you the rules "now" say something, check whether it means now or soon.

## What you still need to know

A Canadian assessment usually waits on: the category the airline assigned and its stated reason in writing, whether the carrier is treated as large or small, your actual arrival time at your destination, what rebooking was offered and when, and whether you asked the airline inside the time limit. The last one is the only item on that list that expires.

## What to do now, in order

1. **Send the written question above, today.** It costs a minute and it is the whole foundation.
2. **Keep every notification with its timestamp,** including the unhelpful ones. They evidence the communication obligation.
3. **Record your actual arrival time at your destination.** The bands are measured from it.
4. **Accept care and keep receipts** while the category is still unsettled.
5. **Make the claim to the airline inside the time limit,** even if your evidence is incomplete. A timely request can be completed; a late one cannot be rescued.
6. **Take the file to the Canadian Transportation Agency** if the airline's answer does not match the published rules. It, and not the airline, resolves the disagreement.

## Sources

- `cta-delays-cancellations` — the regulator's own explanation of delays and cancellations.
- `cta-rebooking-refunds-compensation` — the regulator's own material on rebooking, refunds, and compensation, including the claim process.

Each claim is mapped to one of those entries in `apps/web/src/content/claim-map.json`. Neither has been opened and verified in the build environment that produced this page, so it is held at source review and is not published. Because this material carries a claim deadline, it also carries our shortest review interval.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
