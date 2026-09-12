---
title: 'Minimum connection time is a threshold, not a forecast'
description: 'A connection minimum is what makes an itinerary sellable. A realistic connection is built from deplaning, walking, queues, bags and a gate-close time.'
pageType: guide
status: publishable
intent: 'Replace the idea that a published connection minimum predicts a successful transfer with an explicit component model of available time, required time and slack.'
answerFirst: 'A connection minimum is a scheduling threshold: it is the shortest gap a system will sell, not a forecast about your particular day. A realistic connection is the time actually available between your arrival and the next gate closing, minus the time the transfer actually takes. DelayPilot computes both sides explicitly and shows where each number came from, because a single combined figure hides everything that matters.'
sources: []
internalRefs:
  - 'DIRECTIVE.md §13'
  - 'DIRECTIVE.md §17'
  - 'DIRECTIVE.md §18.5'
  - 'DIRECTIVE.md §27'
  - 'docs/PROVIDER_LICENSING.md'
reviewedAt: '2026-09-12'
nextReviewDue: '2027-03-11'
indexable: true
author: content-editorial-lead
topics:
  - connections
  - methodology
---

Two connections at the same airport with the same gap can be completely different propositions. One is a walk down a corridor between two gates in the same concourse. The other crosses a border, reclaims a bag, re-enters security, and changes terminal by train. Any single figure that claims to cover both is hiding the difference that decides it.

## What a connection minimum actually is

It is a threshold used when an itinerary is put together: below it, the combination is not offered as a single journey. It is a property of the airport, the terminals involved, and sometimes the carriers, and it is a scheduling convention rather than a statement about today.

DelayPilot treats any such value as a policy-derived input and labels it as one. We do not publish connection minimums of our own, we do not hold a licensed feed of them, and where one appears in the product it is shown with the source it came from rather than presented as our own estimate. That is a licensing position as much as an editorial one, recorded in `docs/PROVIDER_LICENSING.md`.

The practical consequence is simple: an itinerary meeting a minimum has cleared a filter, not a forecast.

## The two sides DelayPilot computes

Rather than one number, the assessment has two, and their difference.

**Available time** is the window between the moment you can realistically be off the inbound aircraft and the moment the next flight's gate closes. Note what that is not: it is not the gap between the two scheduled times. Gate close happens before departure, and the difference between those two is often the whole margin. Where the operating airline's gate-close rule is not known to us, we estimate it from the scheduled departure with a clearly labelled buffer and we never present that estimate as the airline's policy.

**Required time** is the sum of the parts of the transfer: getting off the aircraft, the walk or the inter-terminal transit, security if you re-enter it, immigration if a border sits between the two flights, baggage if you must reclaim and re-check, an allowance for mobility needs or travelling with children, and an uncertainty allowance for the parts that vary.

**Slack** is available time minus required time. It is shown as a quantity with its components visible, so that a tight connection can be understood rather than merely feared: a transfer that is tight because of one long walk is a different problem from one that is tight because of an immigration queue.

## Why every component carries its own provenance

Each part of the required time is labelled with where it came from — measured, policy-derived, airport-derived, or estimated. That labelling is the difference between a tool you can argue with and a number you have to trust.

If the walk is airport-derived and the immigration allowance is estimated, you know which part to interrogate and which part to adjust for your own circumstances. A single opaque figure invites exactly the wrong response: believing it when it is confident and abandoning it entirely when it is wrong once.

## Why there is no percentage on the screen

A probability of missing a connection is computable only with validated distributions of arrival delay and transfer time. Without those, a percentage is a decoration that borrows the authority of statistics without doing the work.

So when the inputs do not support one, DelayPilot shows the available time, the required time, the slack, a qualitative band, and the assumptions behind them — and no number that looks like a probability. Where validated distributions exist, a probability may be computed by simulation with documented assumptions, and it will say so. The full method is in [how DelayPilot estimates connection risk](/guides/how-delaypilot-estimates-connection-risk/).

There is also no speedometer, no dial, and no single score. Those designs imply a precision the underlying data does not have.

## Separate tickets change the question entirely

If your two flights are on separate reservations, none of the above makes the connection protected. Available time and required time are still useful — they tell you whether the transfer is physically plausible — but the consequences of failing are different, because no airline is responsible for moving you onward. DelayPilot never marks a separate-ticket connection as protected, and asks you when the data does not make the answer clear.

## What you still need to know

Four things change a connection assessment more than anything else, and three of them are yours to supply: whether both flights are on one reservation; whether your bag is tagged through to the final destination; whether a border crossing sits between the two flights; and how you personally move through an airport, which is not an average.

## What to do now, in order

1. **Find the gate-close time, not the departure time.** Ask at the first gate or check the second airline's own conditions. It is the deadline that actually exists.
2. **Confirm at check-in whether your bag is tagged through.** It changes the required time more than any other single fact.
3. **Ask whether you will re-enter security or cross a border** on this transfer. Both are queue-driven and both dominate short gaps.
4. **Tell the tool about mobility, children, or a group.** An assessment built on a solo traveller walking briskly is not about your family.
5. **Watch the inbound aircraft, not the departure board,** in the hours before the transfer.
6. **Where the slack is thin, prepare the fallback before you need it:** the next departure, the last departure of the day, and what an overnight would cost.

## Sources

This page makes no external regulatory claim. It documents DelayPilot's own connection method and its provenance rules: `DIRECTIVE.md §13` (the connection and transfer formulas and the ban on unvalidated probabilities), `DIRECTIVE.md §17` (connection UI states), `DIRECTIVE.md §18.5` (the connection cockpit and its component display), `DIRECTIVE.md §27` (the protected and self-transfer microcopy), and `docs/PROVIDER_LICENSING.md` (why no connection-minimum feed is published here).

Walking, security, immigration, baggage, gate-close rules, and airline assistance can change the outcome.
