---
title: 'UK261 as your delay lengthens: what changes, and when'
description: 'A UK delay is a sequence, not a single event. Care comes first, a refund choice can open later, and a fixed sum depends on how late you finally arrived.'
pageType: guide
status: source_review
intent: 'Follow a UK delay forward in time, showing which obligation becomes live at each stage and what the passenger should ask for at that moment.'
answerFirst: 'In a UK delay, different things become available at different points. Care while you wait comes first and does not depend on whose fault the delay was. A choice about abandoning the journey can open if the delay runs long enough. A fixed sum, if it arises at all, is decided by how late you reached your final destination and by the cause the airline states.'
sources:
  - uk-caa-delays
  - eu-your-europe-air
ruleSetRefs:
  - jurisdiction: uk
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15.3'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-12-11'
indexable: true
author: content-editorial-lead
topics:
  - united-kingdom
  - uk261
  - delays
---

Most UK261 explanations are written as a reference and read at the wrong moment. What a delayed passenger actually needs is a timeline: as the departure board slips further, which question becomes live, and what is the useful thing to say at that point. The structural reference is on the [UK rights explainer](/passenger-rights/uk/). This is the sequence.

## Stage one: the delay is announced

Nothing about compensation is decided here, and almost everything about evidence is.

Screenshot the original departure time and the revised one. Save the message the airline sent, with its timestamp. Note the aircraft's inbound story if the app shows it — a delay caused by a late inbound aircraft has a different shape from a delay caused by a problem at your own airport, and you will not be able to reconstruct it later.

Do not start arguing about cause at this stage. It is too early for anyone to answer, and the conversation that matters now is about care.

## Stage two: the wait becomes long enough for care

The care obligations — refreshments, a means of communication, and accommodation with transport to it where the wait runs overnight — are triggered by a combination of flight distance and waiting time: {{rule:uk:care.thresholds}}.

The important feature of this stage is that care does not wait for the cause argument. An airline that believes the delay was caused by something outside its control still has the care obligation. Passengers routinely leave this on the table because they assume that weather cancels everything.

Ask at the desk. If nothing is forthcoming, buy something reasonable and keep the receipt. Reasonable is doing real work in that sentence: a meal and a bed are one thing, and a long taxi ride and a suite are another.

## Stage three: the delay becomes long enough to abandon the journey

Where a delay runs past a defined threshold, the framework can put a different question in front of you: whether to stop travelling and ask for the fare back instead. The threshold is a rule-set value: {{rule:uk:delay.refundThreshold}}.

This is a real fork, and it is worth thinking about rather than reacting to. Taking the fare back generally ends the journey, which is the right answer when the trip no longer has a purpose and the wrong answer when you still need to get there. If you abandon a journey partway, the position is more complicated than either the desk or this page can settle in a sentence, which is a reason to ask the airline to confirm in writing what it is offering.

## Stage four: the flight is cancelled rather than delayed

A cancellation replaces the delay question with a choice: be rerouted at the earliest opportunity, be rerouted later at a time that suits you, or take the fare back. The choice is yours, and it is the least reversible thing on this page.

Notice matters here in a way it does not for delays. How far in advance the airline told you is a live test, with bands in the rule set: {{rule:uk:cancellation.noticeBands}}. This is why the timestamp on the cancellation message is worth more than most people assume.

## Stage five: you arrive, eventually

Now the fixed-sum question becomes answerable, because it is decided by how late you reached your final destination — not by how late you left, and not by how long you sat at the gate.

The sums vary by the flight's distance band, and on the longest flights they vary again with the size of the arrival delay: {{rule:uk:compensation.bands}}, {{rule:uk:compensation.distanceBands}}, {{rule:uk:delay.compensationThreshold}}.

Write down the actual arrival time, to the minute, on the day. It is the single most commonly missing fact in UK claims, and the one that decides which band applies on the flights where the difference is largest.

## Where the airline's cause argument enters

An airline can assert that the disruption was caused by extraordinary circumstances that could not have been avoided even if all reasonable measures had been taken. Three things about that assertion are worth holding on to.

It is an assertion by an interested party, not a finding. It is resolved, if you press it, by the regulator's complaint route or a court. And it does not remove the care obligation from stage two.

Nearby weather does not prove it. Neither does a news story about a busy day in the airspace. DelayPilot stores what the airline stated as airline-stated, keeps observed weather as context, and does not merge them.

## What you still need to know

A UK assessment needs five things: the operating carrier, whether your flights were on one reservation, the notice you received with its timestamp, your true arrival time at the final destination, and the airline's stated reason in writing. Anything missing should be named rather than guessed — and if your flights were on separate tickets, read [self-transfer risk](/guides/self-transfer-risk/) first, because a self-transfer is not a protected through journey however it was sold.

## What to do now, in order

1. **Screenshot the original and revised times** as soon as the delay is announced.
2. **Ask for care once the wait is long,** and keep receipts for anything you buy yourself.
3. **Ask the airline to confirm in writing what it is offering** before you accept anything at stage three or four.
4. **Record your actual arrival time** at the final destination, on the day.
5. **Email the airline for its stated reason.** One sentence, and it unblocks most assessments.
6. **Use the regulator's complaint route** if the airline's answer does not match its published position.

## Sources

- `uk-caa-delays` — the UK Civil Aviation Authority's guidance on delays and cancellations; the authority for every UK claim on this page.
- `eu-your-europe-air` — cited only to support the statement that the EU framework is separate material with its own scope.

Each claim is mapped to one of those entries in `apps/web/src/content/claim-map.json`. Neither has been opened and verified in the build environment that produced this page, so it is held at source review and is not published.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
