---
title: 'Reading a METAR and a TAF without over-reading them'
description: 'One is an observation at a station, the other a forecast for the airport. What each contains, and the conclusions neither one supports.'
pageType: guide
status: source_review
intent: 'Teach the observation-versus-forecast distinction in aviation weather products and set hard limits on what a passenger may infer from either.'
answerFirst: 'A METAR reports conditions observed at a specific station at a specific moment. A TAF is a forecast for an airport, covering a defined period and revised as conditions change. Both describe operational conditions and nothing else — they do not say whether a flight is safe, whether it will be cancelled, or who is responsible when it is.'
sources:
  - awc-data-api
internalRefs:
  - 'AGENTS.md §1.3'
  - 'AGENTS.md §2'
  - 'DIRECTIVE.md §13'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-12-11'
indexable: true
author: content-editorial-lead
topics:
  - weather
  - operations
---

Airport weather products look cryptic and are not. They are a compressed, standardised way of saying what the sky is doing, written for people who read hundreds of them a day. A traveller can learn enough of the structure in a few minutes to follow along — and the important part of learning them is learning where their authority stops.

## Observation versus forecast

The distinction does all the work.

A **METAR** is an observation. It is a record of what was measured at a particular station at a particular time, usually issued on a regular cycle with additional reports when something changes materially. It tells you what happened; it makes no claim about what happens next.

A **TAF** is a forecast. It is issued for an airport, covers a defined period, and is amended when the forecaster's expectation changes. It uses change groups to express the difference between a condition expected to persist, a condition expected to arrive gradually, and a condition expected only temporarily or with some probability.

Confusing the two produces both classic errors: treating a snapshot as a prediction, and treating a forecast as a fact that has already occurred.

## What is in them

Without decoding the exact syntax, the fields are the same ones you would want if you were standing on the airfield.

- **Wind** — direction and strength, including gusts and variability. Wind direction relative to the runways in use is one of the main determinants of how many aircraft an airport can handle.
- **Visibility** — how far can be seen, along with runway-specific visual range information where it is reported.
- **Present weather** — precipitation and obscuration, with the standard abbreviations for kind and intensity.
- **Cloud** — the amount of sky covered at each reported layer and the height of its base.
- **Temperature and dew point** — the pair that matters for fog, for icing conditions, and for aircraft performance.
- **Pressure** — the altimeter setting.
- **Remarks** — additional detail, which varies by country and station.

The exact abbreviations, the units each field uses, the reporting cadence, and the meaning of each change group are defined by the issuing authority. This page deliberately does not restate them from memory, because a weather code restated wrongly is worse than one not restated at all. Read them from the data service that publishes them.

## Why the station matters

A METAR belongs to a station, not to a city. That station is usually at the airport, which is what makes it useful, and it is still a point measurement: fog can sit over one end of an airfield and not the other, and a thunderstorm a short distance away is not at the station at all.

DelayPilot names the station it is using for an airport, rather than presenting weather as an ambient property of the place. When the nearest usable station is not the airport itself, that is a fact worth showing rather than hiding.

## The conclusions neither product supports

This is the section that matters, and it is short.

**Neither says a flight is unsafe.** DelayPilot does not make safety judgements, does not classify emergencies, and does not give safety-critical aviation advice. Whether conditions permit a particular operation is a decision for the crew and the operator, made with information a passenger does not have.

**Neither predicts a cancellation.** Conditions influence capacity, and capacity influences schedules, and none of that determines the outcome for your flight. We never tell a reader that their flight will be cancelled.

**Neither proves a legal cause.** This is the most costly misreading. A dramatic forecast does not establish that a specific disruption was outside an airline's control, and it says nothing about whether all reasonable measures were taken. Weather near an airport is context. It is never, on its own, a determination.

## How DelayPilot uses them

As operational context with visible provenance. Observed and forecast conditions are stored in their own fields, separate from an airline-stated cause and separate from a provider-stated cause, and they are displayed with the station used, the time of the observation or the forecast issue, and a freshness label. Where the most recent data is older than we would like, it is labelled stale rather than quietly shown as current.

We do not convert weather into a probability of disruption. Where an assessment rests on weather at all, it is labelled as a heuristic risk band rather than as a calibrated figure, which is explained in [how DelayPilot estimates disruption risk](/guides/how-delaypilot-estimates-disruption-risk/).

## What you still need to know

To connect weather to your own flight you need two things the weather products cannot give you: where the aircraft that becomes your flight currently is, and what the airline states as the reason for any disruption. Weather explains the environment; those two explain your evening.

## What to do now, in order

1. **Check whether the forecast covers your departure window,** not just the moment you are reading it.
2. **Look at the inbound aircraft as well as the sky.** An aircraft that has not left its previous airport is the more reliable signal.
3. **Treat a bad forecast as a reason to hold options open,** not as a reason to assume the worst outcome.
4. **Do not argue cause from the forecast.** It is the weakest card you can play and it invites an argument you cannot win at a desk.
5. **Ask the airline in writing for the reason recorded for your flight,** and keep the answer.

## Sources

- `awc-data-api` — the aviation weather data service that publishes observations and forecasts, and the authority for every field and abbreviation described above.

Each claim is mapped to that entry in `apps/web/src/content/claim-map.json`. It has not been opened and verified in the build environment that produced this page, so the page is held at source review and is not published. No code, unit, cadence, or threshold is restated here from memory.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
