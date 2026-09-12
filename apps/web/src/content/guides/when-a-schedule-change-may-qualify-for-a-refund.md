---
title: 'The schedule change email: read it before you tap accept'
description: 'Schedule changes arrive quietly, weeks ahead, with a friendly accept button. What changed and whether you accept it decide whether a refund stays available.'
pageType: guide
status: source_review
intent: 'Turn a schedule-change notification into a deliberate decision by showing what to compare, what significance tests exist, and why accepting closes options.'
answerFirst: 'A schedule change is the one disruption you get to think about before it happens. Compare the new itinerary with the one you bought — times, airports, connections, cabin — because whether the change is significant enough to open a refund is a defined test, not a feeling. Tapping accept is a decision, and it is usually the one that closes the question.'
sources:
  - dot-refunds
  - dot-whats-new
  - eu-your-europe-air
  - cta-rebooking-refunds-compensation
ruleSetRefs:
  - jurisdiction: us
    version: none-in-force
  - jurisdiction: eu
    version: none-in-force
  - jurisdiction: canada
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-10-12'
indexable: true
author: content-editorial-lead
topics:
  - schedule-changes
  - refunds
---

Schedule changes do not feel like disruptions. They arrive by email weeks ahead, phrased as an update, with a reassuring button that makes the message go away. That framing is the problem: the same change that would be a crisis at the airport is presented as housekeeping, and the button quietly records a decision you did not know you were making.

## Compare the two itineraries properly

Before anything else, put the original and the new version side by side. The original is in your confirmation email; the new one is in the notification. Check all of the following, because a change to any of them can matter under one framework or another:

- **Departure and arrival times,** and by how much each moved.
- **The airports at either end.** A change to a different airport in the same city is a materially different journey, especially with onward ground transport booked.
- **The number of connections.** A non-stop that becomes a one-stop is not the same product.
- **The connection times,** if you have them. A change that leaves a very short transfer creates a new risk that was not in what you bought.
- **The cabin.** A downgrade is a change to what you paid for.
- **The operating carrier and the flight number.**

Whether any of that is significant enough to open a refund is a defined test with effective dates, and it differs by jurisdiction. Those tests render from the rule set rather than from this sentence: {{rule:us:refund.significantChange}}, {{rule:eu:cancellation.noticeBands}}, {{rule:canada:refund.conditions}}.

## The flight-number-only change

One case deserves separate treatment because it is where a rule, a piece of guidance, and an airline's system all meet. Sometimes nothing changes except the number on the flight — same airports, same times, same aircraft, different digits.

In 2026 the US regulator issued guidance extending limited enforcement discretion for certain renumbered flights, with a defined scope and a defined window: {{rule:us:enforcementDiscretion.scope}}, {{rule:us:enforcementDiscretion.window}}.

Enforcement discretion describes where an agency directs its attention. It is not a repeal of the underlying obligation and it is not a statement that nothing happened. If your change is of this kind, the honest position is that the rule still says what it says while the regulator has said where it is enforcing — which is different from "you have no case" and different from "nothing has changed". Read it alongside [US refund rules](/guides/us-automatic-refund-rules/).

## Why accepting matters so much

Across several frameworks, the passenger's own choice is part of the test. Declining what the airline offered is what keeps a refund question live; accepting it is what generally ends it.

Airline interfaces do not make this obvious. The accept button is prominent, the alternatives are behind a link, and the email does not say "this is a decision". Treat it as one. If you are unsure, do nothing for a day: a schedule change, unlike a cancellation at the gate, gives you the luxury of time.

## The thing people get wrong in the other direction

Not every change is significant, and treating every minor adjustment as an opportunity wastes your attention and the airline's. A small time shift on a direct flight with no onward commitment is usually just a schedule change. The tests exist precisely to separate the two, and they are worth reading before you write a long email.

There is also a version of this that costs money: refusing to engage at all, missing the window in which the airline would have moved you to a better alternative for free, and ending up with the worst option because it was the only one left. Decide deliberately, but decide.

## Look past the flight

A schedule change is rarely only about the flight. A new arrival time can miss a connection you booked separately, arrive after a hotel's check-in desk closes, or land after the event you were travelling for has started. Those consequences are yours to notice; the airline's system is comparing two flights, not two trips.

Work out what the new itinerary costs you in the rest of the trip before you answer. If the answer is "the trip no longer works", that is the situation the refund tests exist for, and it is much easier to make that argument before you have accepted the change than afterwards.

## What you still need to know

Four facts: what exactly changed, measured against the original; when the airline told you; whether you have accepted anything, in the app or by email or by silence; and which framework covers this journey. The first two are documents you already have. The third is worth checking in the airline's own record rather than trusting your memory of what you tapped.

## What to do now, in order

1. **Screenshot the original itinerary from the confirmation email.** Once you accept, the original is gone from the app.
2. **Screenshot the change notification with its timestamp.** Notice is a test in more than one framework.
3. **Do not tap accept while you are still deciding.** Nothing bad happens if you wait a day.
4. **Ask the airline what alternatives exist,** including other airports and partner flights. Asking is not accepting.
5. **If you do not want the new itinerary, say so in writing and ask for a refund to the original form of payment.** A phone call leaves no record.
6. **If you do want it, accept it explicitly** rather than by silence, and keep the confirmation.
7. **Escalate to the relevant regulator** only after the airline has answered and its answer conflicts with its published rule.

## Sources

- `dot-refunds` — the US refund layer and its significance tests.
- `dot-whats-new` — the 2026 US enforcement-discretion guidance on renumbered flights.
- `eu-your-europe-air` — the EU material on cancellation, notice, and the passenger's choice.
- `cta-rebooking-refunds-compensation` — the Canadian regulator on refund conditions.

Each claim is mapped to one of those entries in `apps/web/src/content/claim-map.json`. None has been opened and verified in the build environment that produced this page, so it is held at source review and is not published.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
