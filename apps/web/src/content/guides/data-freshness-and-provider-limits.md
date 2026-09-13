---
title: 'Data freshness, provider limits, and the six labels we use'
description: 'Every figure here carries a label saying where it came from and how old it is. What each label means, why data goes stale, and what the limits are.'
pageType: guide
status: publishable
intent: 'Explain DelayPilot provenance and freshness vocabulary and the real constraints — licensing, call budgets, provider disagreement — that produce each state.'
answerFirst: 'Every displayed value in DelayPilot carries one of six labels: Live, Cached, Stale, Demo, Unavailable, or Heuristic risk band. The label and the age travel with the value from the provider all the way to the screen. Where nothing trustworthy exists, you get Unavailable rather than a confident-looking guess.'
sources: []
internalRefs:
  - 'AGENTS.md §1.1'
  - 'AGENTS.md §1.2'
  - 'AGENTS.md §1.5'
  - 'AGENTS.md §3.3'
  - 'DIRECTIVE.md §13'
  - 'DIRECTIVE.md §16'
  - 'DIRECTIVE.md §28'
  - 'docs/PROVIDER_LICENSING.md'
reviewedAt: '2026-09-12'
nextReviewDue: '2027-03-11'
indexable: true
author: content-editorial-lead
topics:
  - methodology
  - provenance
---

A flight status is a claim about the world that was true at a moment. Products that show it without that moment attached are not simplifying; they are removing the part that tells you whether to believe it. Ten minutes is nothing at a gate and an eternity during a disruption, and only the timestamp tells you which situation you are in.

## The six labels

There are exactly six, they are used verbatim, and there are no synonyms and no softer variants.

| Label                 | What it means                                                                      |
| --------------------- | ---------------------------------------------------------------------------------- |
| `Live`                | A licensed provider returned a fresh response within its freshness threshold.      |
| `Cached`              | A prior licensed response, still inside the contractually permitted cache window.  |
| `Stale`               | Beyond the normal freshness threshold, still permitted to display, shown as stale. |
| `Demo`                | Fixture data, always shown with "Demo data — not a live flight."                   |
| `Unavailable`         | No trustworthy response exists.                                                    |
| `Heuristic risk band` | No validated calibrated model is deployed for this assessment.                     |

Two of those are the ones people skip past. `Stale` is not a failure state — it is data we are allowed to show you, clearly marked as older than we would like, because context you can see beats a blank box. `Unavailable` is the product declining to invent something, and it is a designed state with its own copy rather than an empty space or a zero.

## The label travels with the value

Freshness is not a banner at the top of the page. The timestamp, the source, and the age attach to the individual datum and travel with it through every layer: provider adapter, normaliser, repository, API response, component, rendered pixel.

That is why a single screen can show a fresh gate number beside a stale estimated arrival time, each labelled separately. Averaging them into one page-level "updated a moment ago" would be more comfortable and less true.

## What the state of this deployment is today

No licensed flight-data provider is enabled here. The adapters are specified, the fail-closed paths exist, and the credentials do not — so anything you see demonstrated is fixture data carrying the `Demo` label and the sentence "Demo data — not a live flight."

That is a deliberate design rule rather than an accident of the build. Fixture data is never substituted for live data at runtime outside explicit demo mode, and production readiness fails rather than silently serving fixtures. A product that quietly falls back to plausible-looking sample data during an outage is the worst possible behaviour at exactly the worst possible moment.

## Why data goes stale

**Licence terms.** Flight data is licensed, and licences define how long a response may be cached and how it may be displayed. A cache window is a contractual fact, not a performance tuning knob, and the permitted uses per provider are recorded before any adapter is enabled.

**Call budgets.** Providers meter requests. A product that refreshes everything constantly burns its budget on flights nobody is watching and has nothing left for the disruption that matters.

**Refresh policy.** Refresh is slow when the flight is far away, faster only near an event that matters, and stops entirely once a segment is finalised. Errors from a provider cause backoff rather than retry storms.

**Coalescing.** Everyone following the same public flight shares one refresh, which is then fanned out. That is both a licensing and a cost requirement, and it means freshness is a property of the flight rather than of how many times you reloaded.

## When providers disagree

Two sources reporting the same flight differently is normal, and the handling is specific. We compare normalised fields rather than blending incompatible timestamps — averaging two conflicting arrival times produces a third time that nobody reported.

The newest high-quality source is shown, the conflict is exposed rather than hidden, confidence is lowered, and both snapshots are retained. There is no undocumented tie-breaker.

## What we will never do to make it look better

No invented gate, terminal, cause, estimate, or status. If a provider did not return it, it is unknown, and unknown is a first-class state.

No decorative numbers. A figure on the screen is a measurement or it is not there.

No unlabelled fallback. Every degraded state has a label, and the label is not softened because the page looks worse with it.

## Every time is labelled with its airport and its zone

A freshness label is useless if the time beside it is ambiguous, so times get the same treatment as data.

Instants are stored in UTC. Each airport carries its own time-zone identifier, stored separately rather than derived from a numeric offset, because an offset cannot tell you what a place does in summer. Service dates are derived in the origin airport's local time, which is the only definition that matches how a traveller and an airline both talk about "the flight on Tuesday".

Displayed times name the airport and the zone. That removes an ordinary reading error: comparing a departure in one zone with an arrival in another and concluding that a flight is shorter, longer, or on a different day than it is. Overnight flights, date-line crossings, and the two annual clock changes are handled as ordinary cases rather than as exceptions, and they are tested as such.

## What you still need to know

A label tells you how much to trust a value; it does not replace the airline. For anything with a real consequence — whether to leave for the airport, whether to abandon a connection — the operating airline and the airport are the authority, and this product is the thing that tells you when to go and ask them.

## What to do with a freshness label

1. **Read the age before the value.** During a disruption, a value refreshed long ago is history.
2. **Treat `Stale` as context, not confirmation.** It is worth reading and not worth acting on alone.
3. **Treat `Unavailable` as a prompt to go direct,** not as a sign that nothing is happening.
4. **Do not reload to force freshness.** Refresh is coalesced and budgeted; reloading changes nothing except your blood pressure.
5. **Confirm anything irreversible with the airline,** whatever the label says.

## Sources

This page makes no external regulatory claim. It documents DelayPilot's own provenance and refresh rules: `AGENTS.md §1.1` (never fabricate operational fact), `§1.2` (the six labels and provenance propagation), `§1.5` (fail closed), `DIRECTIVE.md §13` (freshness weighting, confidence, and provider agreement), `DIRECTIVE.md §16` (refresh policy and coalescing), `DIRECTIVE.md §28` (demo mode), and `docs/PROVIDER_LICENSING.md` (the licence terms that define cache windows).

Flight information can change quickly. Confirm critical details with the operating airline and airport.
