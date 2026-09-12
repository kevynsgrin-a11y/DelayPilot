---
title: 'Canada APPR: the three control categories that decide everything'
description: 'How the Air Passenger Protection Regulations sort a disruption into within control, within control for safety, or outside control, and what each changes.'
pageType: rights-explainer
jurisdiction: canada
status: source_review
intent: 'Explain the APPR control categories and the large-versus-small carrier distinction, and show why the cause classification decides more in Canada than in any other framework DelayPilot models.'
answerFirst: "Canadian rules sort every disruption into one of three categories: within the airline's control, within its control but required for safety, or outside its control. That classification decides what the airline owes you in communication, care, rebooking or refund, and whether a fixed sum can arise at all. Whether the airline is treated as large or small then changes the figures."
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
  - passenger-rights
  - canada
  - appr
---

Every other framework DelayPilot models treats cause as a defence the airline may raise. The Canadian regulations put it at the front: before anything else is decided, the disruption is sorted into one of three categories, and that sorting drives the rest of the analysis. Learning those three categories is most of the work of understanding Canadian air passenger rights.

## The three categories

| Category                               | Plain meaning                                                                                  | Broad effect                                                                      |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Within the airline's control           | Something the carrier could influence — commercial and operational decisions of its own making | The fullest set of obligations, and the only category where a fixed sum can arise |
| Within control but required for safety | Something the carrier decided, but for a safety reason defined by the regulations              | Obligations remain, but the fixed sum does not follow                             |
| Outside the airline's control          | Something the regulations treat as beyond the carrier — the classic example is weather         | A reduced set of obligations centred on getting you to your destination           |

The precise definitions, the examples the regulator treats as falling in each category, and the obligations attached to each are rule-set values with effective dates: {{rule:canada:cause.categories}}, {{rule:canada:obligations.byCategory}}.

Two warnings about that table. The airline does the initial sorting, and it has an obvious interest in the result. And an airline-stated reason is not a determination — the Canadian Transportation Agency, not the carrier, is the body that resolves a dispute about which category a disruption belongs in.

## Large airline or small airline

Where a fixed sum can arise, its size depends on whether the carrier is treated as large or small. This is not a judgement about the airline's reputation or aircraft size; it is a classification with a definition, and DelayPilot reads it from the official source rather than guessing from how big a carrier feels. The definition and both sets of figures render from the rule set: {{rule:canada:carrierClass.definition}}, {{rule:canada:compensation.largeCarrier}}, {{rule:canada:compensation.smallCarrier}}.

## What the airline must do, in rough order

Across the categories, the regulations work through a similar sequence: keep you informed on a defined cadence, look after you while you wait when the category calls for it, get you to your destination by rebooking within defined windows, and offer a refund where rebooking within those windows is not achieved or no longer serves your purpose. The communication cadence, the care thresholds, the rebooking windows, and the refund conditions are all rule-set values: {{rule:canada:communication.cadence}}, {{rule:canada:care.thresholds}}, {{rule:canada:rebooking.windows}}, {{rule:canada:refund.conditions}}.

Where a fixed sum arises it is calculated from your arrival delay at your destination, in bands, and there is a time limit for asking the airline for it. Both are rule-set values, and the deadline is the reason this page is not the place to wait: {{rule:canada:compensation.arrivalDelayBands}}, {{rule:canada:claim.deadline}}.

## Proposals are not law

Canadian passenger-rights rules have been the subject of consultation and proposed amendment. A consultation document, a draft regulation, or a ministerial announcement is not a rule in force, and DelayPilot activates a Canadian rule version only after verifying that it is in force. Where you read that something "will change", check which of those two things you are reading.

## What you still need to know

A Canadian assessment usually stalls on: which category the airline assigned and what reason it gave in writing; whether the carrier is treated as large or small; your actual arrival time at your destination; whether you were rebooked, and on what; and whether you asked the airline directly before the time limit.

## What to do now, in order

1. **Ask the airline, in writing, which category it assigned and why.** This is the single most valuable sentence you can obtain in Canada, and it costs an email.
2. **Record your actual arrival time at your destination.** The bands are measured from it.
3. **Keep every notification the airline sent, with timestamps.** The communication obligations are themselves part of the regulations.
4. **Accept care and keep receipts** while the category is still being argued about.
5. **Ask the airline for a fixed sum in writing if the category allows it,** and do it well inside the time limit shown above. The deadline is not a thing to research later.
6. **Take the file to the Canadian Transportation Agency** if the airline's answer does not match the published rules. It, not the airline, resolves the disagreement.

## Sources

- `cta-delays-cancellations` — the regulator's own explanation of what happens when a flight is delayed or cancelled.
- `cta-rebooking-refunds-compensation` — the regulator's own material on rebooking, refunds, and compensation.

Every regulatory claim above is mapped to one of those two entries in `apps/web/src/content/claim-map.json`. Neither has been opened and verified in the build environment that produced this page, so it is held at source review and is not published. Because the Canadian material carries a claim deadline, this page also carries the shortest review interval we use.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
