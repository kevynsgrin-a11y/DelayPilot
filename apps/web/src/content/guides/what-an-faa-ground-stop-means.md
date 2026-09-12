---
title: 'Ground stops, ground delay programs, and what they mean for you'
description: 'Air traffic measures are decisions about the system, not about your flight. Here is what the common ones do, where to read them, and what they do not prove.'
pageType: guide
status: source_review
intent: 'Explain US air traffic management measures as system-level operational context, and warn against reading a published measure as the verified cause of an individual disruption.'
answerFirst: 'A ground stop holds aircraft bound for a particular airport at the places they are departing from. A ground delay program spaces arrivals out instead of stopping them. Both are decisions about traffic flow at an airport or in a region — they describe the system you are flying into, they do not describe your flight, and they never establish the legal cause of any individual disruption.'
sources:
  - faa-nas-status
  - awc-data-api
internalRefs:
  - 'AGENTS.md §1.3'
  - 'DIRECTIVE.md §13'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-12-11'
indexable: true
author: content-editorial-lead
topics:
  - operations
  - airspace
---

When something goes wrong at a large US airport, the explanation you get at the gate is often a phrase rather than a sentence: ground stop, ground delay, flow control. These are real, published, system-level measures with specific meanings, and knowing which one is in effect tells you something genuinely useful about how your evening is likely to go. It tells you almost nothing about whether anyone is responsible for it.

## The measures, in plain terms

**Ground stop.** Aircraft heading for a particular airport are held on the ground where they currently are. If your aircraft is somewhere else, it is not coming yet. The effect on you is indirect and delayed: the aircraft that becomes your flight is somewhere in the system, not moving.

**Ground delay program.** Rather than stopping traffic, arrivals into an airport are spaced out, and departures elsewhere are assigned later times to fit that spacing. Flights depart, but later and in a managed order.

**Airspace flow measures and reroutes.** Traffic is moved around a constrained region — weather, volume, or an airspace restriction — which lengthens flights and consumes aircraft time without necessarily showing up as a published delay.

**Airport closures and runway configuration changes.** Physical constraints at the airport itself, which reduce how many aircraft can land per hour regardless of how many want to.

The authoritative descriptions of these measures, and what is in effect right now, come from the national airspace status service rather than from an airline's app or from a summary like this one.

## Why they arrive at your gate late

Air traffic measures do their damage through aircraft rotation. A morning measure at one airport delays an aircraft that was due to fly three more sectors that day, and the passengers on the last of those sectors experience a delay caused by something that happened in a different city before lunch, in clear weather, with no measure in effect anywhere near them.

This is why a delay explanation can be simultaneously true and useless. "Air traffic control" may well be the honest origin of your delay, four aircraft rotations ago.

It is also why the most useful thing you can look at during a system-wide disruption is not the departure board but the inbound aircraft. If the aircraft that is supposed to become your flight has not left its previous airport, your departure time is aspirational regardless of what the board says.

## What a published measure does not establish

A measure in effect at your airport is context. It is not a determination of the cause of your disruption, and it is not a defence that any particular airline has actually made.

Three specific errors are worth naming. A ground stop somewhere does not mean every delayed flight at that airport was delayed by it. A measure attributed to weather does not mean that a given cancellation was outside a carrier's control — an aircraft grounded by a measure is a different story from an aircraft on the ground with no crew left to fly it. And the absence of a measure does not prove the opposite either; plenty of disruptions happen in a perfectly healthy system.

DelayPilot stores airspace status as observed context in its own field, separate from an airline-stated cause and separate from a provider-stated cause. We show it because it helps you predict the shape of your day, and we never promote it into a finding. Nothing about the rules changes because you can see a measure on a map.

## What it is reasonable to conclude

That the system you are flying into is constrained, and that constraints propagate. That rebooking capacity is being consumed right now by people ahead of you in the queue. That later flights in the day are more exposed than earlier ones, because the constraint accumulates. And that the last flight of the evening in a constrained system is the one most likely to be cancelled rather than merely delayed.

Those are operational conclusions and they are enough to act on.

## What you still need to know

Whether your specific flight's aircraft is affected, which you establish by looking at where that aircraft is rather than at the measure. What the airline states as your flight's reason, which you obtain by asking in writing. And whether the airline's own commitments cover care for the category it has assigned — which, in the US, is a question about the commitments layer rather than about air traffic control.

## What to do now, in order

1. **Check where the inbound aircraft is,** not just your departure time. It is the most informative signal available to a passenger.
2. **Rebook early if a measure is in effect and your trip has a hard deadline.** Capacity is consumed in the order people ask for it.
3. **Prefer an earlier alternative over a better one** in a constrained system. The later flight is more exposed to the accumulating constraint.
4. **Ask for care as the wait lengthens,** and keep receipts. This does not depend on who caused the constraint.
5. **Ask the airline in writing for the reason recorded for your flight.** "There was a ground stop" is an observation about the airport, not an answer about you.
6. **Do not argue cause at the desk.** Nobody there can resolve it, and the conversation costs you the time you need for rebooking.

## Sources

- `faa-nas-status` — the national airspace system status service; the authority for what measures exist and what is in effect.
- `awc-data-api` — the aviation weather data service, cited for observed conditions used as context only.

Each claim about the measures above is mapped to one of those entries in `apps/web/src/content/claim-map.json`. Neither has been opened and verified in the build environment that produced this page, so it is held at source review and is not published.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
