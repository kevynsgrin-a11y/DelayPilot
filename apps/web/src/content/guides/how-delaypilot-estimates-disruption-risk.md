---
title: 'How DelayPilot estimates disruption risk'
description: 'Today the answer is a labelled heuristic band, not a percentage. What goes into it, why no number is shown, and the gate a model must pass first.'
pageType: guide
status: publishable
intent: 'Document DelayPilot disruption-risk method honestly, including the absence of a calibrated model and the pre-declared gate any future model must pass.'
answerFirst: 'DelayPilot currently shows a heuristic risk band, labelled as one, and not a probability. No calibrated model is deployed, and showing a percentage from an uncalibrated model would be borrowing the authority of statistics without doing the work. This page describes what the band reflects, how confidence is kept separate from risk, and the gate a model must pass before any number replaces the band.'
sources: []
internalRefs:
  - 'DIRECTIVE.md §13'
  - 'DIRECTIVE.md §17'
  - 'DIRECTIVE.md §27'
  - 'AGENTS.md §1.1'
  - 'AGENTS.md §1.2'
  - 'docs/BUILD_PLAN.md'
reviewedAt: '2026-09-12'
nextReviewDue: '2027-03-11'
indexable: true
author: content-editorial-lead
topics:
  - methodology
  - risk
---

Most flight-risk products lead with a number. A number is satisfying, comparable, and easy to put on a card. It is also the easiest thing in this entire domain to fake, because nothing on the screen tells a reader whether the number was measured, modelled, or invented.

So the honest description of what DelayPilot shows today is a band with a label on it, and a refusal to dress it up.

## What you see today, and what the label means

Where we assess disruption risk, the result carries the provenance label **Heuristic risk band**. That is one of exactly six labels the product may use, and it means precisely what it says: no validated, calibrated model is deployed for this assessment.

The other labels describe where a piece of data came from and how fresh it is — `Live`, `Cached`, `Stale`, `Demo`, `Unavailable`. They travel with the datum from the provider adapter all the way to the pixel. A band without its label would be a different product, and a worse one.

## What the band reflects

The band is built from observable structural factors, each of which is displayed rather than folded into a hidden score:

- **The state of the flight itself** — scheduled, delayed, or otherwise, with the time the information was last refreshed.
- **The aircraft's position in its day.** A flight late in a rotation inherits the accumulated lateness of everything before it. This is often the single most informative thing available to a passenger.
- **Operational context at the airports involved,** including published airspace measures where they exist.
- **Observed and forecast weather at the named station** for each airport, as context and never as a cause.
- **The structure of the itinerary** — connections, their slack, and whether a border or a bag change sits in the middle.

Each of those is shown with its own freshness, so a band resting on an hours-old refresh is visibly different from one resting on a fresh response. Data that is older than its threshold is labelled stale rather than quietly presented as current.

## Why there is no percentage

Because a probability is a claim about frequency, and a claim about frequency has to be earned.

A number produced by an uncalibrated model is not a probability; it is a score with a percentage sign. The difference shows up exactly where it hurts: in the tail cases where someone decides whether to rebook. A model that ranks flights adequately but is systematically overconfident produces a great-looking chart and a bad decision.

Where we do not have the evidence, the product says so. `Unknown` is a designed state in this product, with its own copy and its own visual treatment, not an empty space or a zero.

## The gate a model must pass first

This is the part that makes the previous section a commitment rather than an opinion. Before any percentage appears in DelayPilot, the model behind it must satisfy a pre-declared gate:

- Training with **explicit missing-value handling** and **horizon-specific** behaviour, because risk at departure minus a week and risk at departure minus an hour are different questions.
- **Time-based holdouts** and no post-event leakage, so the evaluation is a forecast rather than a hindsight fit.
- **Group tests by airport, route, and carrier** to detect memorisation rather than generalisation.
- **Calibration** fitted on a split separate from final evaluation.
- A reported **Brier score, expected calibration error, ROC AUC, PR AUC, log loss, and calibration slope and intercept**, with performance sliced by airport size, carrier, route frequency, season, and horizon.

If a model fails that gate, the band stays. A model's coefficients, incidentally, are never presented as causal conclusions: a variable being predictive is not the same as it being the reason.

## Confidence is a separate axis from risk

Risk answers "how exposed is this itinerary". Confidence answers "how much do we know". They are displayed separately, because a high-risk assessment on thin data and a high-risk assessment on fresh, agreeing data call for different behaviour from you.

Confidence combines coverage, freshness, provider agreement, model support, and sample sufficiency, with documented weights, and it is displayed as Low, Medium, or High. It is deliberately not called a confidence interval, because it is not one.

## Historical rates, when they appear

Where a historical rate is shown for a route or a flight, it is a smoothed posterior estimate rather than a raw ratio: `p̂ = (k + α) / (n + α + β)`. Raw ratios over small samples produce headlines that evaporate — a handful of observations can read as a perfect record or a disaster, and neither is real.

Any such figure is displayed with its sample size and a sufficiency indication, and it is suppressed or widened where the cohort is too small to support it. We do not pick a confident prior to make a number look stable.

## Two things this is not

It is not an airline's decision. Airlines cancel and delay flights for reasons that are invisible from outside, and nothing here anticipates an operational decision that has not been taken.

It is not a safety assessment. DelayPilot describes operational conditions, does not classify emergencies, and does not give safety-critical aviation advice. No output here means a flight is unsafe.

## What you still need to know

The band describes exposure, not outcome. Two facts do more to change your actual day than any assessment: where the inbound aircraft currently is, and what the airline states if something goes wrong. The first is observable now; the second is a written question worth asking early.

## What to do with a band

1. **Read the label before the colour.** Heuristic means heuristic.
2. **Check the freshness beside it.** An assessment on stale data is context, not confirmation.
3. **Look at the components,** especially the inbound aircraft, rather than the summary.
4. **Use a raised band to keep options open early** — an alternative identified before a disruption is worth more than one found during it.
5. **Re-read after a refresh rather than acting on a single snapshot,** because these inputs change fast.

## Sources

This page makes no external regulatory claim. It documents DelayPilot's own method: `DIRECTIVE.md §13` (risk, calibration, freshness weighting, confidence, and smoothed historical rates), `DIRECTIVE.md §17` (the state matrix these outputs must cover), `DIRECTIVE.md §27` (result microcopy), `AGENTS.md §1.1` and `§1.2` (no fabricated values, and the six provenance labels), and `docs/BUILD_PLAN.md` (the current state of the build, including the absence of a deployed model).

This is an estimate, not an airline decision or safety forecast.
