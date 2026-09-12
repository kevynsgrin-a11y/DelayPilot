---
title: 'How DelayPilot estimates connection risk'
description: 'The method in full: available time, required time, slack, the provenance of each component, and when a probability may be computed at all.'
pageType: guide
status: publishable
intent: 'Document the connection-risk computation end to end, including the notation, the state vocabulary, and the rule that no probability is displayed without validated distributions.'
answerFirst: 'The computation is deliberately plain: available time between getting off one aircraft and the next gate closing, minus the time the transfer requires, gives slack. Each part of the required time is shown with where it came from. A probability appears only when validated distributions exist to compute one; otherwise you get the quantities, a qualitative band, and the assumptions.'
sources: []
internalRefs:
  - 'DIRECTIVE.md §13'
  - 'DIRECTIVE.md §17'
  - 'DIRECTIVE.md §18.5'
  - 'DIRECTIVE.md §27'
  - 'AGENTS.md §1.2'
  - 'AGENTS.md §3.4'
reviewedAt: '2026-09-12'
nextReviewDue: '2027-03-11'
indexable: true
author: content-editorial-lead
topics:
  - connections
  - methodology
  - risk
---

A connection assessment is the one part of this product that can be written out in full on a single screen, and that is the point. Every quantity is either something you can check yourself or something we tell you we estimated.

## The quantities

**Available time, `W`.** The window between the moment you can be off the inbound aircraft and the moment the onward flight's gate closes. Written out: `W = t_gateClose − t_gateIn`.

Both ends of that window are worth examining. Gate-in is not the same as landing, and gate-close is not the same as departure. Where the operating airline's gate-close rule is known to us, it is used and labelled as policy-derived. Where it is not, we estimate from the scheduled departure using a configurable, clearly labelled buffer — and we never present that estimate as the airline's policy, because it is not.

**Required time, `T`.** The sum of the parts of the transfer:

`T = T_deplane + T_walk + T_security + T_immigration + T_bag + T_mobility + T_uncertainty`

Each term is displayed separately. Deplaning depends on where you are seated and how the aircraft is unloaded. The walk may include an inter-terminal train. Security appears only if you re-enter it. Immigration appears only if a border sits between the flights. Baggage appears only if you must reclaim and re-check. Mobility covers the reality that assessments built for a solo traveller walking briskly do not describe everyone. Uncertainty is an explicit allowance rather than optimism hidden in the other terms.

**Slack, `S = W − T`.** The headroom. Slack can be negative, and a negative slack is shown as negative rather than rounded up to reassurance.

## Why each component carries a provenance class

Every term in `T` is labelled as measured, policy-derived, airport-derived, or estimated.

This is not decoration. It tells you which parts of the assessment you can improve by knowing something we do not, and it prevents the failure this design is aimed at, which is a single confident figure that cannot be argued with. If the immigration term is estimated and the walk is airport-derived, you know which one to adjust when you have cleared immigration at that airport before.

The same discipline applies to freshness. Every input arrives with its own timestamp and one of the six provenance labels, and an assessment built on stale data says so on its face.

## When a probability may be shown, and when it may not

A misconnection probability is `P_miss = P(D + T > W)`, where `D` is the arrival delay of the inbound flight. Computing it honestly requires validated distributions for `D` and for the transfer time, not point estimates dressed up with a spread.

Where those distributions exist, the probability may be estimated by simulation, `p̂ = (1/N) · Σ 1(Dᵢ + Tᵢ > W)`, with seeded sampling so that tests are reproducible, enough samples to support the precision displayed, convergence and sensitivity checks, and documented correlation assumptions. Correlation matters more than people expect: a day that makes the inbound late is often the same day that makes the transfer slow, and treating the two as independent understates the risk.

Where they do not exist — which is the current state — no percentage is displayed. You get `W`, `T`, `S`, the components, a qualitative band, and the assumptions. There is no dial and no speedometer, because those shapes imply a precision the inputs do not have.

## The state vocabulary

A connection is described by exactly one state, and the vocabulary is fixed: none, protected, self-transfer, mixed ticket, unknown topology, ample slack, watch, high risk, likely missed, already missed, or insufficient data.

Two of those deserve emphasis. **Unknown topology** means we do not know whether your flights are on one reservation, and we ask rather than guess, because a wrong guess in the reassuring direction would be read as protection that does not exist. **Self-transfer** is never upgraded to protected on the strength of a comfortable-looking gap; feasibility is not protection, and no amount of slack makes two tickets into one journey.

**Insufficient data** is a real state with its own copy, not a blank card.

## Determinism, and why it matters to you

The connection maths is a pure function of explicit inputs. The same inputs produce the same outputs, byte for byte, and every assessment is snapshotted immutably alongside the version that produced it.

That sounds like an engineering detail and it is actually a user-facing promise: if an assessment changes, something in the facts changed, and we can show you which fact. An estimate that drifts on its own is an estimate you cannot reason about.

## What this does not do

It does not promise that you will make the connection, and no output here should be read as such a promise. It does not model an airline's willingness to hold a flight, which is a human decision made on the day. It does not know about your bag unless you tell us how it is tagged. And it is not a rights assessment: whether anyone is responsible when a connection fails is a separate question, decided by the structure of your ticket and the applicable framework.

## What you still need to know

Supply three facts and the assessment improves more than any modelling could: whether both flights sit on one reservation, whether the bag is tagged through, and whether a border crossing sits between the two. Add a fourth if it applies — mobility needs, small children, or a group moving together.

## What to do with the output

1. **Read the slack and the components, not the colour.**
2. **Fix the gate-close assumption if you can.** Ask at the first gate; a known gate-close time replaces the assumption the whole estimate rests on.
3. **Treat a thin positive slack as thin.** The uncertainty allowance is an allowance, not a promise.
4. **If the state is unknown topology, answer the question.** It changes both this assessment and the rights analysis.
5. **Prepare the fallback while slack is still positive:** the next departure, the last departure of the day, and what an overnight costs.

## Sources

This page makes no external regulatory claim. It documents DelayPilot's own method: `DIRECTIVE.md §13` (the connection window, transfer decomposition, misconnection probability, and the ban on unvalidated percentages), `DIRECTIVE.md §17` (the connection state vocabulary), `DIRECTIVE.md §18.5` (the connection cockpit), `DIRECTIVE.md §27` (protected and self-transfer microcopy), `AGENTS.md §1.2` (provenance labels), and `AGENTS.md §3.4` (determinism and immutable snapshots).

Walking, security, immigration, baggage, gate-close rules, and airline assistance can change the outcome.
