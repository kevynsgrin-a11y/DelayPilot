---
title: "Following someone else's flight without their airline password"
description: 'Sharing an airline login to watch a relative fly hands over the ability to act as them. A flight number and a date are enough, and that is how the design works.'
pageType: guide
status: draft
intent: "Set out the privacy rules for watching another person's journey and describe the specified family-monitoring design without implying the unbuilt feature exists."
answerFirst: "You do not need anyone's airline account to follow their flight — a carrier, a flight number and a date identify a public flight. Sharing a login gives away the ability to change, cancel and spend on someone else's behalf, and no monitoring product needs that. DelayPilot's family features are specified and not built yet; this page describes the design and says plainly where it stands."
sources: []
internalRefs:
  - 'AGENTS.md §2'
  - 'DIRECTIVE.md §9'
  - 'DIRECTIVE.md §16'
  - 'DIRECTIVE.md §18.2'
  - 'docs/BUILD_PLAN.md §10'
reviewedAt: '2026-09-12'
nextReviewDue: '2027-03-11'
indexable: false
author: content-editorial-lead
topics:
  - privacy
  - monitoring
  - product-status
---

**Status: this describes a specified design, not a shipped feature.** The family-monitoring capability referenced here belongs to a later phase of the build and does not exist in the current deployment. It is described so that the privacy rules governing it are public before it is written, and the page stays unpublished until the feature is real.

## Why the password question comes up at all

Someone you care about is flying, something has gone wrong, and they are in the air, or asleep, or out of signal. The obvious move is to log into their airline account and look. It is also the worst available option, and it is worth being specific about why.

An airline login is not a viewing pass. It is the ability to change an itinerary, cancel it, spend a loyalty balance, alter contact details, and read identity documents. Handing it over — or being handed it — creates a situation where a mistake made with good intentions is indistinguishable from one made with bad ones, and where the account holder has no record of who did what.

It is also usually unnecessary. A flight is a public object: a carrier, a number, and a date describe it, and almost everything a worried relative actually wants to know is a property of that flight rather than of the reservation.

## What is enough

The carrier, the flight number, and the date of departure. If the number is not to hand, the route and the approximate time will usually narrow it to a short list.

That is the whole input. No login, no identity document, no traveller number, and nothing that could be used to alter the trip. DelayPilot looks a flight up from its number and its date, and the privacy invariants that keep it that way are recorded in `AGENTS.md §2` rather than left to product judgement: we do not read inboxes, we do not authenticate as a user to any third party, we do not store identity documents, and we never submit a claim, refund request, rebooking, or purchase on anyone's behalf.

## What the specified design does

When the family capability is built, it is specified to work like this.

**Permission is granted, not taken.** A traveller invites a family member to follow a trip. The invitation is revocable by the traveller at any time, and revocation takes effect immediately rather than at the end of a billing period.

**Permissions are scoped.** Following a trip is a different permission from editing it. The design separates the two, because most family situations want a watcher rather than a second driver.

**Notifications are per-channel and opt-in,** with quiet hours in the recipient's own time zone. An urgent alert can override quiet hours only where the recipient has explicitly permitted it, because a product that wakes people by default trains them to turn it off entirely.

**Notification content is deliberately thin.** Every alert carries the flight and date, what changed, how fresh the information is, the next useful step, and a link. None carries a reservation identifier, a full email address, payment information, receipt contents, or a promise about the outcome of a claim — again, an invariant rather than a preference.

**Private surfaces stay private.** Anything behind an account is excluded from search indexing, uses opaque identifiers in its URLs, and is never stored in a shared cache.

## What it will not do

It will not give a family member the ability to act as the traveller with an airline.

It will not put itinerary detail into an analytics event, an advertising parameter, or a page title. That rule has no exception for a feature that would be more convenient with it.

It will not present a family member as authorised to make decisions. A watcher sees what is happening and helps by knowing things; the person holding the ticket makes the choices.

## What to do today, with the product as it exists

The absence of the feature does not leave you without options, and none of the following requires anyone's password.

1. **Get the carrier, flight number, and date** before they leave. A screenshot of the itinerary is enough, and they can crop out anything they would rather not share.
2. **Agree what "something has gone wrong" means,** and what you should do if it happens. Most family stress during a disruption is coordination failure rather than missing information.
3. **Agree who talks to the airline.** Two people calling the same airline about the same trip slows both of them down and produces contradictory answers.
4. **Watch the inbound aircraft on the day.** It is public information, and it is the fact a departure time depends on.
5. **Keep your own written note of what you were told and when.** If the traveller is exhausted at a transfer desk, the person at home with a timeline is the one who can still say what happened when.
6. **Never accept an offer to "just log in and sort it out".** If a change is needed, the person holding the ticket makes it, or authorises it in writing with the airline directly.

## What you still need to know

Two things determine how useful any of this is. Whether the traveller's journey sits on one reservation, which decides who is responsible if a connection fails. And whether the traveller actually wants help — worth asking rather than assuming, because a stream of alerts to someone already standing in a queue is not support.

## Sources

This page makes no external regulatory claim. It documents DelayPilot's privacy invariants and a specified design: `AGENTS.md §2` (no credential sharing, no inbox access, no acting on a user's behalf, no identity documents, private routes excluded from indexing), `DIRECTIVE.md §9` (scope), `DIRECTIVE.md §16` (notification content, per-channel opt-in, quiet hours, family permissions), `DIRECTIVE.md §18.2` (private routes), and `docs/BUILD_PLAN.md §10` (the current state of the build, in which this feature does not exist).

Flight information can change quickly. Confirm critical details with the operating airline and airport.
