---
title: 'You missed a connection on one ticket: what that changes'
description: 'On one reservation the delay that counts is measured at your final destination, and the airline that lost you is the one that must move you onward.'
pageType: guide
status: source_review
intent: 'Explain what a single reservation changes when a connection is missed — who rebooks, where the delay is measured, and which facts to capture at the transfer airport.'
answerFirst: 'On one reservation, a missed connection is the airline problem rather than yours: the carrier that failed to deliver you to the connection is the one expected to move you onward. The delay that matters is measured at your final destination, not at the airport where you got stuck. That single fact is why a short first-leg delay can produce a long, assessable journey delay.'
sources:
  - eu-your-europe-air
  - uk-caa-delays
  - dot-refunds
  - cta-rebooking-refunds-compensation
ruleSetRefs:
  - jurisdiction: eu
    version: none-in-force
  - jurisdiction: uk
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-10-12'
indexable: true
author: content-editorial-lead
topics:
  - connections
  - cancellations
---

The word for a journey sold on one reservation is protected, and it is worth being precise about what the protection is. It is not a promise that you will make the connection. It is the fact that the connection is the airline's problem when you do not, and that your journey is assessed as one journey rather than as a series of unrelated flights. Both halves of that matter within an hour of landing at the transfer airport.

## Who moves you

On a single reservation, the carrier that delivered you late is generally the one that rebooks you onward, and it does so without you buying anything new. In practice the rebooking often happens automatically while you are still in the air, and there is a new boarding pass waiting in the app or at a transfer desk before you have reached it.

That automation is a convenience and a trap. The flight the system found is the one it found first, not necessarily the one that suits you. Ask what else exists — the airline's own later flights, its partners, a different airport in the same city — before you accept. Asking about options is not declining them.

## Where the delay is measured

This is the fact that decides most assessments and the one most travellers get wrong. In the frameworks that use a final-destination test, your delay is the difference between when you were supposed to arrive at the end of the journey and when you actually arrived there. The delay on the first leg is a cause, not the measurement.

A modest first-leg delay that costs you a connection and puts you on a flight the following morning produces a very large final-destination delay. That is the situation where people conclude that nothing can be done because "we were only a little late leaving", and it is precisely backwards.

The qualifying thresholds are rule-set values under each framework: {{rule:eu:delay.compensationThreshold}}, {{rule:uk:delay.compensationThreshold}}.

## While you are waiting for the new flight

The waiting obligations apply at the transfer airport too. Where the wait is long enough, care — refreshments, communication, accommodation for an overnight — is triggered by rules that do not depend on whose fault the original delay was: {{rule:eu:care.thresholds}}, {{rule:uk:care.thresholds}}.

An overnight in a transfer airport is the single most expensive form of this situation, and it is also the one with the clearest documentary trail: a receipt for a hotel, a receipt for a meal, a boarding pass showing the new flight. Keep all three.

## What it is not

It is not a compensation right in the US. The US federal layer is about refunds of what you paid, and a missed connection that the airline rebooks does not by itself produce a payment. If you decide not to travel at all and decline what the airline offered, that is a different question, and it is covered in [US refund rules](/guides/us-automatic-refund-rules/).

It is not automatic anywhere. Every framework has conditions, and cause is one of them.

And it does not apply to separate tickets. If you bought the two flights independently, you have two journeys and the second airline recorded you as not turning up. That situation is genuinely different and is covered in [self-transfer risk](/guides/self-transfer-risk/).

## If you can see it failing while you are still in the air

The most useful window in this entire situation is the last part of the inbound flight, and almost nobody uses it.

If the arrival time on the seat-back map or the crew announcement has already made the connection implausible, start working before the doors open. Check the airline's app for the onward options; many carriers rebook proactively and the new itinerary appears there first. Ask a member of the crew whether transfer staff will be meeting the flight, which is common at large hubs when a whole group of passengers is affected. Move to the front of the cabin if the crew agrees to it. Have the connecting flight number and gate already written down rather than looking for them in the jet bridge.

None of this changes what the rules say. It changes the number of options still open when you reach a desk, because the first passenger to arrive at a transfer counter is choosing from a longer list than the fortieth.

## What you still need to know

Five facts, all obtainable at the transfer airport while you wait: the scheduled arrival time at your final destination as originally sold; your actual arrival time once you get there; the operating carrier of the flight that was late; what the airline stated as the reason; and whether anyone offered you care and what you had to buy yourself.

If you are unsure whether your journey is one reservation, count the confirmation emails and look for a single reference covering every leg. Two separate confirmations usually means two journeys, whatever the travel site's page looked like.

## What to do now, in order

1. **Screenshot the original itinerary before the app replaces it.** Once you are rebooked, the schedule you were sold disappears from the screen.
2. **Ask what else is available before accepting the rebooking.** The first answer is the fastest one the system found, not the one that suits you.
3. **Ask for care at the transfer airport** if the wait is long or overnight, and keep receipts if you buy your own.
4. **Note the actual arrival time at your final destination** when you finally land. It is the measurement the whole assessment uses.
5. **Email the airline for its stated reason** for the original delay, in one sentence.
6. **Keep the new boarding pass and the old itinerary together.** Those two documents are the story of the journey.
7. **Escalate to the relevant regulator** only after the airline has answered and its answer does not match its published position.

## Sources

- `eu-your-europe-air` — the EU material on final-destination delay and care.
- `uk-caa-delays` — the UK regulator's guidance on delays, cancellations, and connections.
- `dot-refunds` — the US refund layer, cited to show what a US missed connection does not produce.
- `cta-rebooking-refunds-compensation` — the Canadian regulator on rebooking obligations.

Each claim is mapped to one of those entries in `apps/web/src/content/claim-map.json`. None has been opened and verified in the build environment that produced this page, so it is held at source review and is not published.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
