---
title: 'Controllable or uncontrollable: the US label that decides your hotel'
description: 'What the controllable and uncontrollable labels mean in the US, who applies them, and why weather outside the window does not settle the question.'
pageType: guide
status: source_review
intent: 'Explain the US controllable-versus-uncontrollable distinction as an airline-applied label attached to voluntary commitments, not as a statutory compensation trigger.'
answerFirst: 'Controllable and uncontrollable are the labels that decide whether a US airline provides a meal, a hotel, and ground transport when you are stuck. They sit on the voluntary commitments layer, not on the federal refund rule, and the airline applies the label in the first instance. Weather visible from the terminal window is context, not a classification.'
sources:
  - dot-dashboard
  - dot-refunds
ruleSetRefs:
  - jurisdiction: us
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15.1'
  - 'AGENTS.md §1.3'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-12-11'
indexable: true
author: content-editorial-lead
topics:
  - united-states
  - cause
---

Almost every argument at a US gate is really an argument about one word. If the disruption is controllable, the airline's own published commitments generally put a meal, a hotel, and a ride to it on the table. If it is uncontrollable, most of that falls away and you are left with rebooking and, where the federal rule applies, your fare. The word is doing more work than any figure, and it is applied by the party with an interest in the answer.

## Where the label lives

The distinction is not part of the federal refund rule. It belongs to the layer of voluntary commitments that airlines publish and the government collects on a dashboard. That matters in two directions. It means the commitments are real and specific enough to hold an airline to in a conversation, and it means they can change without any change in the law. The categories the dashboard tracks, and what each airline has committed to, render from the rule set beside the date we last verified the source: {{rule:us:dashboard.commitmentCategories}}.

Because it is the commitments layer, this label does not produce a cash payment for delay. It decides care. People often go looking for the wrong outcome here and conclude the system failed them, when what the airline's own commitment described was a hotel and a sandwich, and nobody offered it.

## What tends to fall on each side

Broadly, controllable covers things arising from the airline's own operation and its own decisions: maintenance, crew scheduling, its own IT, fuelling, cleaning, aircraft swaps. Uncontrollable covers things the airline treats as external: weather, air traffic control instructions, security events, and similar. The authoritative list is the airline's own published commitment, and airlines do not all draw the line identically.

That last point is the reason to read the dashboard entry for the specific airline rather than trusting a general article, including this one.

## Weather does not settle it

This is the part where a confident-sounding article can cost you real money. A storm over the airport is context. It is not a classification, and it is not proof about your specific flight.

The same weather day produces controllable and uncontrollable disruptions side by side. An aircraft that could not reach the airport because of the storm is a different story from an aircraft that was already on the ground and had no crew within legal hours to fly it, even though both cancellations happened in a thunderstorm. Airlines know this distinction well. Passengers rarely do, which is why the first answer at the desk is so often "weather".

DelayPilot records what the airline stated as an airline-stated cause and what a data provider reported as a provider-stated cause, keeps observed weather as separate context, and never converts any of them into a determination. If you see weather on our screen next to your flight, that is us showing you the conditions, not us agreeing with the airline.

## What you still need to know

To make progress you need three things. The reason the airline recorded, in writing rather than spoken at a desk. The airline's own published commitment for that category, which you can read for yourself. And a record of what actually happened to you — how long you waited, whether you were offered anything, and what you had to buy.

If the airline's stated reason and the observable facts do not match — a cancellation attributed to weather on a clear evening when the inbound aircraft was late from another city — that mismatch is worth writing down. It is not proof of anything by itself, and it is exactly the kind of detail that a regulator's complaint process can act on.

## What to do now, in order

1. **Ask, at the desk, which category the airline has applied.** Ask it as a question about the airline's own commitment, not as an accusation.
2. **Get the reason in writing.** A chat transcript, an email, or the reason field in the app. Spoken answers at a desk evaporate.
3. **Ask for what the commitment covers by name.** "Your published commitment covers a hotel for a controllable overnight — can you arrange it, or should I book and send you the receipt?" is a better sentence than "what are you going to do for me?".
4. **Buy what is reasonable and keep receipts** if the airline will not arrange it. Reasonable is the operative word, and a modest receipted expense is the kind of ask a commitment is written to cover.
5. **Note the inbound aircraft's story if you can see it.** The flight that was supposed to become your flight is often the whole explanation.
6. **Escalate in writing** if the airline's own published commitment and its behaviour do not match. That gap, documented, is what a complaint is made of, and the regulator's complaint route is free.

## How this interacts with the refund layer

Keep the two separate in your own head and in your correspondence. Care is a commitments question. Getting your fare back is a federal-rule question, explained in [US refund rules](/guides/us-automatic-refund-rules/), and it turns on the event and on whether you accepted the alternative — not on the controllable label at all. A single email that mixes them invites a single answer that addresses neither.

## Sources

- `dot-dashboard` — the government's collection of airline customer-service commitments, and the authority for what each airline has committed to.
- `dot-refunds` — the separate federal refund layer, cited here only to keep the two apart.

Each claim is mapped to one of those entries in `apps/web/src/content/claim-map.json`. Neither has been opened and verified in the build environment that produced this page, so it is held at source review and is not published.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
