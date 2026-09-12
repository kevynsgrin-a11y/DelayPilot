---
title: 'The 2026 EU reform: adopted is not the same as in effect'
description: 'A reform of the EU air passenger rules was cleared in 2026. It has not taken effect, does not apply to a flight today, and will not apply backwards.'
pageType: guide
status: source_review
intent: 'Show the adopted and in-force EU rules side by side so a reader can see that a cleared reform changes nothing about a flight taken before its effective date.'
answerFirst: 'The reform of the EU air passenger rules received final clearance from the Council in 2026, and clearance is not the same thing as being in effect. Its effective date is computed from the day it appears in the Official Journal, and DelayPilot has not verified that day. Until we have, the rule applied to your flight is the one already in force, and the reform is applied to nothing — not early, and not backwards.'
sources:
  - eu-council-2026-07-13
  - eu-your-europe-air
ruleSetRefs:
  - jurisdiction: eu
    version: none-in-force
internalRefs:
  - 'DIRECTIVE.md §3.5'
  - 'DIRECTIVE.md §15.2'
  - 'AGENTS.md §1.3'
reviewedAt: '2026-09-12'
nextReviewDue: '2026-10-12'
indexable: true
author: content-editorial-lead
topics:
  - european-union
  - ec261
  - rule-versions
---

There is a moment in the life of every European rule when it exists, is finished, has been reported everywhere, and still does not govern anything. That is where the 2026 reform of the air passenger rules sits. Understanding this one distinction protects you from the two errors that will be everywhere over the coming year: applying the new rule to a flight it does not reach, and assuming the old rule stopped working the day the news broke.

## Three dates, three different meanings

| Stage                       | What it means                                                                      | Status in DelayPilot                          |
| --------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------- |
| Adoption or final clearance | The institutions have agreed the text. Nothing has changed for a passenger yet.    | Recorded: {{rule:eu:reform.adoptedOn}}        |
| Publication                 | The text appears in the Official Journal. The clock for entry into force starts.   | {{rule:eu:reform.officialJournalPublishedOn}} |
| Entry into force            | Computed from publication plus a defined offset. Only now does it govern anything. | {{rule:eu:reform.effectiveFrom}}              |

The offset between publication and entry into force is itself part of the instrument, and it is a rule-set value rather than something we will paraphrase: {{rule:eu:reform.entryIntoForceOffset}}.

Only the first of those three has been reported to us. Until a reviewer opens the Official Journal record and confirms the publication date, the second and third are unknown — and an unknown date is shown as unknown, never estimated.

## Side by side: what governs today, and what will

| Question                       | Rule in force today                     | Adopted reform                                 |
| ------------------------------ | --------------------------------------- | ---------------------------------------------- |
| Status                         | `in_force`                              | `adopted_not_effective`                        |
| Version applied to your flight | {{rule:eu:current.version}}             | Not applied                                    |
| Effective from                 | {{rule:eu:current.effectiveFrom}}       | {{rule:eu:reform.effectiveFrom}}               |
| Compensation structure         | {{rule:eu:compensation.bands}}          | {{rule:eu:reform.compensation.bands}}          |
| Delay thresholds               | {{rule:eu:delay.compensationThreshold}} | {{rule:eu:reform.delay.compensationThreshold}} |
| Care obligations               | {{rule:eu:care.thresholds}}             | {{rule:eu:reform.care.thresholds}}             |

Both columns render from versioned rule data. Neither column is typed into this article, because an article that hardcodes a figure keeps displaying it long after the figure has changed, and the reader has no way to tell.

## Why applying it early would be a serious error

The rule that governs a disruption is the rule in force on the date of the disruption. That is not a DelayPilot convention; it is how these instruments work, and it cuts both ways.

If the reform changes an outcome in a passenger's favour, applying it to a flight that took place before its effective date would tell someone they have a claim they do not have — sending them into a complaint process they will lose, possibly at their own cost. If the reform narrows something, applying it early would talk someone out of a claim the rule in force still supports. Both failures land on the traveller.

DelayPilot treats early application of an adopted-but-not-effective rule as a critical defect, stores the reform with the status `adopted_not_effective`, and reports any assessment touching it as `future_rule_not_active`. A page that shows you the future rule is doing something useful. A page that applies it is doing something harmful while looking identical.

## What to be sceptical of over the coming year

Articles that describe the reform in the present tense. "The new rules give passengers…" is a sentence about a future state written as if it were today.

Summaries of summaries. A news outlet reporting a press release reporting a legislative text is three steps from the instrument, and each step drops a condition. DelayPilot cites the Council's own release for the fact of clearance and the EU's own passenger-rights material for the rule in force, and nothing else.

Claims companies advertising against the new thresholds. The thresholds that matter for a flight you have already taken are the ones that were in force when you took it.

Any effective date presented with confidence before the Official Journal record exists. That includes ours: our effective-date field is empty and shown as unknown until a reviewer confirms it.

## What you still need to know

For a flight that has already happened, the reform changes nothing and you can stop reading here. For a flight you are about to take, the practical question is which version will be in force on your travel date, and that cannot be answered until publication is verified. Check the effective-date field on this page rather than an article's headline, and treat an empty field as genuinely empty rather than as "soon".

## What to do now, in order

1. **Establish your travel date first.** It, and not today's news, selects the rule version that governs your situation.
2. **For a past flight, use the rule in force then** — the walkthrough in [EU rights under the rule in force](/guides/eu-rights-under-the-current-rule/) is the one that applies.
3. **Keep the same five facts either way.** Operating carrier, reservation topology, notice, actual arrival time, stated cause. The reform does not make evidence less necessary.
4. **Do not delay a claim to wait for a better rule.** Time limits run under the rule in force, and waiting for a future rule that will not reach your flight is a way of losing both.
5. **Re-check this page after publication is verified.** It carries our shortest review interval, and the effective date will appear here beside its version when a reviewer has confirmed it.

## Sources

- `eu-council-2026-07-13` — the Council's own release announcing final clearance; the primary record of adoption.
- `eu-your-europe-air` — the official EU material describing the rules in force.

Each claim is mapped to one of those entries in `apps/web/src/content/claim-map.json`. Neither has been opened and verified in the build environment that produced this page, so it is held at source review and is not published. No date, threshold, or figure in either column above is written into this text.

Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination.
