---
title: 'Is that a rule or a promise? Four questions that tell you'
description: 'Voluntary airline commitments and binding rules look identical on a help page. Four questions separate them before you need the difference.'
pageType: guide
status: source_review
intent: 'Give a reader a portable test for distinguishing a voluntary airline commitment from a binding regulatory obligation, rather than a list of which is which.'
answerFirst: 'A binding rule is written by a regulator, changes only through a public process, and is enforced by someone other than the airline. A voluntary commitment is written by the airline, can change when the airline decides, and is enforced mainly by reputation. Both are worth using; confusing them is what leaves people arguing for something nobody ever promised.'
sources:
  - dot-dashboard
  - dot-refunds
  - dot-whats-new
ruleSetRefs:
  - jurisdiction: us
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §15.1'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-10-12'
indexable: true
author: content-editorial-lead
topics:
  - united-states
  - methodology
---

On an airline's help page, a promise and an obligation are typeset identically. Both appear under a reassuring heading, both are phrased in the present tense, and neither tells you which one it is. The distinction only surfaces later, when you are trying to get something and the airline says no. These four questions separate them before that moment, and they work on any airline's page, in any country.

## Question one: who wrote the sentence?

If the words originate with a regulator — a rule, a regulation, a statutory instrument, an agency's own guidance page — you are reading an obligation. If the words originate with the airline and the government is merely collecting and publishing them, you are reading a commitment.

The US customer-service dashboard is a clear example of the second kind. It is published by the government, which makes it look statutory, and it reports what each airline has chosen to commit to, which makes it voluntary. Both things are true at once. The categories it tracks render from our rule set beside the date the source was last verified: {{rule:us:dashboard.commitmentCategories}}.

## Question two: can it change without anyone voting?

An obligation changes through a process with notice, comment, publication, and an effective date. A commitment changes when the airline updates its page.

This question has a practical edge, because it tells you how much a screenshot is worth. Screenshot a commitment on the day of your disruption: it is the version that was in force for you, and it may not be there in a month. An obligation does not need that treatment, because it has a version history and an effective date that anyone can check later. DelayPilot stores regulatory values in versioned rule sets with effective dates for exactly this reason, and renders them beside the version that produced them.

## Question three: who do you complain to?

If the answer is "the airline, and then the airline again", it is a commitment. If there is an outside body that takes complaints and can act on them, it is an obligation — or at least a commitment with a regulator watching.

Enforcement guidance sits in a strange third position here and is worth understanding on its own terms. When a regulator says where it will and will not direct enforcement attention, that is neither a rule change nor a promise by an airline. The obligation still exists; the regulator has described its own priorities. The 2026 US guidance on certain renumbered flights is of this kind, with a defined scope and window: {{rule:us:enforcementDiscretion.scope}}, {{rule:us:enforcementDiscretion.window}}. An article that reports it as a repeal is wrong, and an article that ignores it is unhelpful.

## Question four: what does it actually give you?

Commitments in the US tend to deliver care — meals, hotels, ground transport, rebooking. Obligations in the US tend to deliver your money back when a defined event occurs: {{rule:us:refund.triggers}}. Neither delivers a payment for the inconvenience of an ordinary delay, because no general US federal cash-compensation right for ordinary delays or cancellations exists to deliver it.

In the European, UK and Canadian frameworks, obligations reach further and can include fixed sums under defined conditions. That is a genuine difference between jurisdictions and not a difference in how well the airlines behave.

## Why the distinction is worth the effort

Because it changes what you ask for, who you ask, and what evidence you keep.

Asking an airline to honour its own published commitment is a conversation in which the airline's own words are the thing you are quoting, and one where escalation is largely about publicity and goodwill. Asking an airline to meet a regulatory obligation is a conversation with a third party available behind it, where the airline's words matter less than the rule and your dated facts.

People who conflate the two tend to bring the wrong argument to each. They quote a regulation at a hotel-voucher problem that a commitment would have solved in a sentence, or they accept an airline's "that is our policy" answer on a question where policy was never the governing thing.

## What you still need to know

Before you can classify a promise, you need its source. Not a summary, a news article, or a screenshot of a screenshot — the page it came from, on the day it applied to you, with its own words. That is also the reason DelayPilot cites only primary regulator sources and records the date each one was verified. A claim we cannot trace to the authority that made it is a claim we delete rather than soften.

## What to do now, in order

1. **Screenshot the airline's own commitment page on the day of your disruption.** It is the version that governs your situation and it is not archived for you.
2. **Ask the four questions above about the sentence you are relying on.** One pass through them tells you who you are really negotiating with.
3. **Split your correspondence.** One message about care, quoting the airline's own words. One message about the money, quoting the rule. Mixed messages get mixed answers.
4. **Keep receipts even when you expect the airline to arrange things directly.** Reimbursement of a modest documented expense is the ask a receipt can carry on its own.
5. **Escalate the obligation to the regulator, and the commitment to the airline's own complaints channel.** Sending each to the right place is what gets each one read by someone who can act on it.

## Sources

- `dot-dashboard` — the published airline commitments, and the example used throughout this page.
- `dot-refunds` — the federal refund obligation, cited to contrast with the commitments layer.
- `dot-whats-new` — the regulator's notices, including the 2026 enforcement-discretion guidance.

Each claim is mapped to one of those entries in `apps/web/src/content/claim-map.json`. None has been opened and verified in the build environment that produced this page, so it is held at source review and is not published.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
