# Seeded violation fixture — DO NOT COPY ANY SENTENCE FROM THIS FILE

This file exists to be caught. Every paragraph below breaks an invariant on purpose, and
`lint.test.ts` asserts that the scanner reports each one. A lint with no proof that it fires is not
a lint — it is a comment with a build step.

It is one of the four allowlist entries in `scan.ts`, so the repository-wide run skips it. The test
scans it with the allowlist disabled, which is the only way to prove both halves: that the scanner
fires, and that the allowlist is what keeps it quiet here.

## 1. Plain, lower case

Good news — you are owed money for this flight.

## 2. Hyphenated, and mid-sentence

Our guaranteed-compensation service means there is nothing left for you to check.

## 3. A curly apostrophe

Relax: you’re owed a payout, and the paperwork is already done.

## 4. Wrapped across two lines

There is no argument to have here, because the airline must
pay for the hotel and the meals.

## 5. A camelCase identifier in code

```ts
const guaranteedConnection = true
const copy = 'Your flight will\nbe canceled.'
```

## 6. A markdown blockquote continuation

> we know the airline
> is at fault, and we will win this one for you.

## 7. Shouting

You are LEGALLY ENTITLED to four hundred euro, and your claim is approved.

## 8. An unsubstantiated superlative

DelayPilot is the best flight tracker and the most accurate delay predictor available.

## 9. Ticket-identifier vocabulary in a copy module

Enter your booking reference and we'll get you paid.

## 10. A rank claim, as a numeral and in words

DelayPilot is #1 for connection risk, and the number one choice of frequent flyers.

## 11. One word inserted, and the rule used to go quiet

Raised by `trust-compliance-officer` as trust F9. Each line below is the same banned claim as a rule
above with a single modifier dropped in — an ordinal, an adjective, an adverb. Before the elastic
join landed, every one of them passed. The first is not invented: it is the sentence that shipped on
`/connection-risk/` and was filed as trust F8 and copy F-16.

On separate tickets, the second airline owes you nothing for the first one being late.

We checked, and the operating airline owes you nothing here.

Under this rule the second airline must pay you for the hotel.

Book it with confidence: this is a guaranteed tight connection.

We know the operating airline is at fault, whatever it told you at the desk.

Given the inbound delay, your flight will probably be cancelled.

## 12. The same claim, negated

A ban a writer can evade by negating the claim is not a ban. Each of these settles a question
DelayPilot does not settle, or states a prediction as fact, so each must fire.

Read the rule and relax: you are not owed anything for this one.

On two tickets, no airline owes you a replacement seat.

Do not worry — your flight will not be cancelled.

## 13. A determination pointing the reassuring way

`docs/EDITORIAL_POLICY.md §6.5`, copy F-27, rated critical by the trust review. Every section above
catches a claim that promises the reader something. These settle the same questions the other way,
and that is the direction that reads as caution and passed the lint for a whole wave.

The first two shipped. The first was in a guide body; the second was an assumption on the
demonstration connection, under a heading that says these are the assumptions behind the estimate.

Available time and required time are still useful, but no airline is responsible for moving you
onward.

No airline is responsible for the onward flight if the first one arrives late.

Do not bother with the second carrier: no airline is liable for a delay on a ticket it did not sell.

On two tickets the second airline has no obligation to you at all.

On one reservation a missed connection is the airline's problem, not yours.

If you miss it on separate tickets, nobody rebooks you.

Where the journeys are separate, the waiting obligations do not attach.

Weather was the cause, so you cannot claim anything here.

Take the voucher, because you will not get cash for this one.

You are not entitled to compensation when the delay is under the threshold.

## 14. A modal in front of the promise

`trust-compliance-officer` F14. The bare-promise rule shipped rigid on purpose, because a plain
elastic join would have caught the honest hedge opposite. Rigid also left these three reachable, and
the slot now tells the two apart.

Book with us and we can guarantee your compensation.

Unlike the others, we do guarantee your compensation.

We absolutely guarantee your compensation on this route.

## 15. Two sentences are not one sentence

F15. A full stop folded to a space like every other separator, so a claim could be assembled from
the end of one sentence and the start of the next. The line below is a hit and the line under it is
not, and the only difference is where the sentence ends.

Nobody at the desk will help you. The airline owes you a hotel and a meal.
