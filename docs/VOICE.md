# DelayPilot voice

**Owner:** `ux-copy-steward` (`docs/agents/ROSTER.md §3`). **Binding on:** every string a user can
read — components, pages, layouts, notifications, error states, alt text, accessible names, page
titles, and article bodies.

**Precedence:** `AGENTS.md` > `DIRECTIVE.md` > this file. Where this file appears to permit
something either of those forbids, they win and this file is defective — report it.

**This file is one of four places in the repository permitted to write a forbidden phrase out in
full.** It publishes the ban, so the ban has to be readable here. See §7.

---

## 1. The voice

**Calm operational intelligence.** Direct, grounded, compassionate without sentimentality, precise
about uncertainty, action-oriented, plain-language, jargon-free (`DIRECTIVE.md §7`).

Second person. Present tense. Short sentences. In this order, every time:

> **What changed. What it means. What to do next.**

People read DelayPilot standing at a gate, tired, about to make an expensive and irreversible
decision. That is the whole design constraint. It produces four habits:

1. **Lead with the answer.** The first sentence of a result is the result. Reasoning is available;
   it is not the opening.
2. **Say what is not known, specifically.** "The gate has not been published yet" is information.
   "—" is a broken screen. `unknown` is a designed state (`AGENTS.md §1.1`), and every one of them
   has a sentence that names the missing fact.
3. **Never apologize for the airline, never editorialize about it, never perform empathy.** No
   "we're so sorry", no "unfortunately", no "ugh, airlines". A traveler in a disruption wants a
   next step, not a companion.
4. **Never manufacture urgency.** Urgency is permitted only beside an accurate, source-linked
   official deadline, and then the deadline does the work, not the adjective. Countdown pressure on
   a commercial upsell, an alarm tone in an `info` alert, and "before it is too late" are crisis
   exploitation.

### Shapes to reuse

- "Here is what changed."
- "Here is what may apply."
- "Here is the next useful step."
- "This assessment is based on data updated 4 minutes ago."
- "The disruption cause has not been verified."
- "Your connection has 18 minutes of estimated slack."
- "A cash refund may be available if you decline the changed itinerary."

(The numbers in those examples are illustrations of the SHAPE. No number is ever written into a
string — see §6.)

---

## 2. Provenance vocabulary — closed, exactly six words

`AGENTS.md §1.2`. Do not invent a synonym, do not soften one, do not omit one.

| Label                 | What it means                                                               |
| --------------------- | --------------------------------------------------------------------------- |
| `Live`                | A licensed provider answered inside the freshness threshold for that source |
| `Cached`              | A prior licensed response, still inside the permitted cache window          |
| `Stale`               | Past the normal freshness threshold, still displayed, displayed as stale    |
| `Demo`                | Fixture data. Always ships with "Demo data — not a live flight."            |
| `Unavailable`         | No trustworthy response exists                                              |
| `Heuristic risk band` | No validated calibrated model is deployed for this assessment               |

**Banned as substitutes:** "Fresh", "Recent", "Approximate", "Best guess", "Estimated risk",
"Approximately live", "Roughly current", "Verified", "Confirmed", "Official".

`Unavailable` never renders as a blank, a dash, or a zero. It renders a sentence naming the specific
missing fact and, where one exists, the next useful step. Those sentences live in
`provenance.unavailableReasons` so that one missing fact has one wording everywhere.

`Demo` never travels alone. `AGENTS.md §1.2` requires the label to be **accompanied by**
`results.demo` — "Demo data — not a live flight." The S3 review found the rule read two ways on the
rendered site, so it is now stated once, precisely:

- **Inside a bannered demonstration section** — one that opens with `cockpit.demoBanner`
  ("Demonstration itinerary") and `results.demo` **above** the panels — the section's caption
  accompanies every `Demo` chip beneath it. The homepage cockpit is built this way: banner and
  caption first, then thirteen labelled panels. Repeating the sentence on each one would turn it
  into wallpaper, which is the failure `§26` placement is trying to avoid in the other direction.
- **Anywhere else — every panel carrying a `Demo` chip carries the caption itself.** A demo segment
  card dropped into an explanatory page has no banner above it, so the chip is the only thing
  telling a reader the flight is not real, and a chip alone is a word, not a sentence.
- **A provenance legend is not a panel.** A chip in a legend labels the vocabulary, not a datum, and
  is accompanied by `provenanceMeanings.demo`.

---

## 3. Legal vocabulary

**Permitted:** "may apply", "estimated rights", "based on the facts entered".

**The five rights statuses**, rendered exactly (`AGENTS.md §1.3`). A human label never upgrades its
status:

| Status                   | Human label             | Never                      |
| ------------------------ | ----------------------- | -------------------------- |
| `likely_applies`         | Likely applies          | "You qualify", "Approved"  |
| `may_apply`              | May apply               | "You are owed", "Eligible" |
| `not_indicated`          | Not indicated           | "Denied", "Rejected"       |
| `cannot_determine`       | Cannot determine        | "Unknown" alone, a blank   |
| `future_rule_not_active` | Future rule, not active | "Coming soon", "New rule"  |

**Cause is never a determination.** A reason string from a provider or an airline renders as
_airline-stated_ or _provider-stated_. Observed weather near an airport is context, never proof that
a disruption was outside an airline's control.

That rule travels with the sentence, not with a footnote. The weather-and-airspace panel has no feed
behind it in this deployment, so it renders `states.conditionsNotConnected`, which names the missing
fact — the feed, not the weather — and then states the rule in the panel itself:

> No weather or airspace feed is connected in this deployment, so operating conditions at the
> airports on this itinerary are unavailable. Conditions are context for a band and are never proof
> of a cause.

Saying nothing would read as "conditions are fine"; naming the weather would claim knowledge of it.
The next step goes underneath, from `unavailableReasons.weatherNotConnected`.

**Voluntary commitments are not rights.** US airline dashboard commitments render in their own
module with the sentence that says they are voluntary and separate from anything a regulator
requires.

---

## 4. The forbidden list

Case-insensitive, both spellings, hyphen and space variants. Forbidden **anywhere** in code, copy,
tests, fixtures, notifications, or documentation (`AGENTS.md §1.3`).

### 4.1 From `AGENTS.md §1.3` and `DIRECTIVE.md §7`

- "you are owed"
- "guaranteed compensation"
- "legally entitled"
- "approved claim"
- "we will win"
- "the airline must pay"
- "guaranteed connection"
- "your flight will be cancelled" / "your flight will be canceled"
- "we know the airline is at fault"
- "claim now before it is too late" — permitted **only** beside an accurate, source-linked official
  deadline, and then the deadline component carries it, not this sentence
- "AI-powered" as the value proposition
- "best" or "most accurate" without substantiation

### 4.2 Near misses — the same claim in different words, banned for the same reason

- "you're owed"
- "entitled to compensation"
- "we'll get you paid"
- "your claim is approved"
- "the airline owes you"
- "we guarantee"

### 4.3 Ticket-identifier vocabulary — `AGENTS.md §2`

Never as a label, a placeholder, help text, an error message, or an example:

- "booking reference"
- "record locator"
- "PNR"
- "confirmation code"
- "reservation code"

The one permitted mention is the negative one: `DIRECTIVE.md §7` fixes the trust line as
**"No booking code required"**, and `lookup.noBookingCode` says why in one sentence, because a
traveler trained by claims sites to expect that field needs to be told it is not coming rather than
left hunting for it. "Booking code" in that negative sentence is not on the banned list; the five
above are. That is not an allowlist entry and not a phrase exception — the token sequence is simply
not banned, so the trust line passes the lint everywhere, in every tree, with nothing exempted.
`lint.test.ts` asserts it in the copy tree, the content tree and the notification tree.

**Where the five are enforced.** This rule carries a `scope` (`forbiddenPhrases[].scope`), because
it bans a word rather than a claim, and a privacy page has to be able to name the field it promises
never to ask for. The scoped trees are:

| Tree                                    | Why it is in scope                                                   |
| --------------------------------------- | -------------------------------------------------------------------- |
| `apps/web/src/lib/copy/**`              | The in-product voice. A label, a placeholder or an error lives here. |
| `apps/web/src/content/**`               | Article bodies are the product speaking, so the same rule applies.   |
| `packages/notifications/src/templates/` | A message a traveler receives, held to the same rule as a screen.    |

`apps/web/src/content/**` was added in the S3 review, raised by `trust-compliance-officer`: §4.1 and
§4.2 fire repository-wide but §4.3 was scoped to the copy trees only, which left article bodies
covered by review and by the content lead's own grep rather than mechanically. The tree was scanned
before the scope was widened and produced zero hits, so the change adds enforcement and no backlog:

```
node apps/web/src/lib/copy/lint/cli.ts --only apps/web/src/content
forbidden-phrases: 27 files scanned under [apps/web/src/content], 0 skipped, 0 hit(s) in 0 file(s).
```

Everything outside those three trees — a privacy page, a terms page, an ADR, this file — may name
the five, and must, wherever the point of the sentence is that DelayPilot does not ask for one.

### 4.4 Urgency and dark patterns

Forbidden regardless of wording: countdown pressure on a commercial upsell, an alarm tone in an
`info` alert, a warning styled to look like a rights outcome, a commercial partner presented as the
remedy for a statutory right, and any commercial urgency on a crisis surface.

---

## 5. Fixed text — quote it, never improve it

These are transcribed byte for byte and `apps/web/src/lib/copy/copy.test.ts` re-reads `DIRECTIVE.md`
at test time and fails the build on a single changed character, **in either direction**. If one is
wrong, escalate to the orchestrator and change `DIRECTIVE.md`. Do not improve it in place.

- `DIRECTIVE.md §27` result microcopy → `apps/web/src/lib/copy/results.ts`
- `DIRECTIVE.md §26` disclaimers → `apps/web/src/lib/copy/disclaimers.ts`
- `DIRECTIVE.md §3.4` independence disclaimer → `disclaimers.independence`
- `DIRECTIVE.md §20` affiliate module block → `disclaimers.affiliateModule`
- `DIRECTIVE.md §7` promise, support line, trust line, CTAs → `home.ts`

### The freshness line is a shape, not a string

`§27` writes it as "Updated 6 minutes ago from [source]." — a number nobody measured and a
placeholder nobody filled. It ships as `results.freshness(ageMinutes, source)`:

| Input            | Output                                                    | Why                                                                        |
| ---------------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| `6, '[source]'`  | Updated 6 minutes ago from [source].                      | Reproduces `§27` byte for byte; the test asserts it                        |
| `1, 'faa-nas'`   | Updated 1 minute ago from faa-nas.                        | Pluralized                                                                 |
| `0, 'faa-nas'`   | Updated 0 minutes ago from faa-nas.                       | Keeps the `§27` shape. "Just now" is a softer claim than the data supports |
| `4.2, 'faa-nas'` | Updated 5 minutes ago from faa-nas.                       | Rounds **up**. Reporting data fresher than it is, is the costly direction  |
| `-3` or `NaN`    | The age of the latest response from faa-nas is not known. | A negative age is a clock disagreement, not freshness                      |

---

## 6. No number is written into a string

No percentage, minute count, amount, distance, or accuracy figure is hardcoded. Strings take
interpolated values that arrived carrying provenance and a calibration flag. `copy.test.ts` walks
every exported string and fails on a digit.

**The only exceptions, each enumerated in the test with its reason:**

| Where                                         | What                                        | Why it is not a measurement                    |
| --------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| `demo.flights`, `demo.airports`               | `DEMO 101`, `DEMO 202`, `DM1`, `DM2`, `DM3` | Synthetic identifiers (`DIRECTIVE.md §28`)     |
| `pages.accessibility.standard`                | `WCAG 2.2 Level AA`                         | The name of a published standard               |
| `pages.accessibility.lastVerified`            | the review date                             | Required by `docs/ACCESSIBILITY.md §13` item 1 |
| `pages.accessibility.knownIssues[].id`        | `F15`, `F22`, `F23`, `F24`                  | Finding identifiers                            |
| `pages.accessibility.knownIssues[].criterion` | success-criterion numbers                   | Identifiers of published criteria              |
| `pages.accessibility.environments[].version`  | tool versions                               | Required by `§13` item 4                       |

**No percentage, anywhere, in any channel** while no calibrated model is deployed — including the
accessible name of a meter, where a screen reader would otherwise compute one
(`packages/ui/src/primitives/ProgressBar.tsx`, `DIRECTIVE.md §18.5`).

---

## 7. The forbidden-phrase lint

`apps/web/src/lib/copy/lint/`. Owner: `ux-copy-steward`. Wiring into `pnpm lint` and CI:
`principal-architect` and `platform-release-sre`.

```bash
node apps/web/src/lib/copy/lint/cli.ts                  # the whole scanned tree
node apps/web/src/lib/copy/lint/cli.ts --only packages  # one subtree
node apps/web/src/lib/copy/lint/cli.ts --no-allowlist   # including the four definition files
```

Exit code is 1 if any hit survives the allowlist. There is no auto-fix and there will not be one:
the fix for an overclaim is a rewrite by someone who knows what the sentence was for.

### 7.1 What it matches

Case-insensitive, whitespace-normalized, and tolerant of:

| Variant                | Example that is caught                    |
| ---------------------- | ----------------------------------------- |
| hyphen and underscore  | `guaranteed-compensation`                 |
| line wrapping in prose | `the airline must` ⏎ `pay`                |
| markdown continuation  | `> we know the airline` ⏎ `> is at fault` |
| curly apostrophes      | `you’re owed`                             |
| camelCase identifiers  | `guaranteedConnection`                    |
| escape sequences       | `'Your flight will\nbe canceled'`         |
| capitals               | `LEGALLY ENTITLED`                        |

Matching is anchored on non-alphanumeric boundaries, so `bestseller` and
`unguaranteedcompensational` are not hits.

### 7.2 Scope

Scanned: `apps/**`, `packages/**`, `tests/**`, `e2e/**`, `data/**`, `docs/**`, `ml/**`, `scripts/**`,
and the text files at the repository root. Every text-bearing extension, fixtures and snapshots
included.

Skipped as build output or machine-written, not as an exemption: `node_modules`, `dist`, `build`,
`.astro`, `.wrangler`, `coverage`, `playwright-report`, `test-results`, lockfiles, `*.min.js`,
`*.map`, and `worker-configuration.d.ts` (emitted by `wrangler types`).

Not scanned by default, deliberately:

- `design/**` — v0-generated reference material, never built and never served, already excluded from
  ESLint and Prettier. **It contains real violations.** Anything ported out of it into `apps/**` or
  `packages/**` is scanned at its new path, which is the point. Check before porting:
  `node apps/web/src/lib/copy/lint/cli.ts --only design`.
- `.claude/**` — the agent charters, whose "You must not" sections quote the bans on purpose.
  `scripts/validate-build-system.mjs` already covers them with a prohibiting-context rule.

### 7.3 The allowlist — four entries, closed

The only files permitted to contain a forbidden phrase are the files whose job is to **define** the
ban. `lint.test.ts` asserts the length, so a fifth cannot arrive quietly.

| Entry                                  | Justification                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                            | The constitution. `§1.3` enumerates the phrases verbatim; a ban that cannot be written down cannot be enforced. |
| `DIRECTIVE.md`                         | The build directive. `§7` enumerates the "Never" list verbatim, for the same reason.                            |
| `docs/VOICE.md`                        | This file. It publishes the list for humans, so the list has to be readable here.                               |
| `apps/web/src/lib/copy/lint/fixtures/` | The lint's own fixtures. One exists precisely to contain a violation, so the scanner can be proven to fire.     |

**Adding a fifth entry to unblock someone's failing build is forbidden** by the owning charter. If
the copy is right and the rule is wrong, escalate to the orchestrator. If the rule is right, fix the
copy.

**The lint's own source needs no entry**, and that is deliberate: `forbidden-phrases.ts` stores every
phrase as a token array and no identifier or comment in the lint spells its phrase out. A lint that
has to exempt itself has already started down the road that ends in exempting everyone.

### 7.4 Phrase-level exceptions, and why they are not allowlist entries

Two rules carry a `notWhenPartOf` list: collocations in which the word is an ordinary term of art
rather than a value claim. They apply **identically in every file**, which is what makes them a
property of the phrase rather than a favour done to a path. Each is justified in the source:

| Collocation        | Why it is not a claim                                                          |
| ------------------ | ------------------------------------------------------------------------------ |
| `best practice(s)` | A documentation genre — the Cloudflare "Workers Best Practices" page (`§33`)   |
| `best effort`      | A delivery-semantics term of art                                               |
| `next best action` | `DIRECTIVE.md §18.5` names a cockpit surface the "next-best-action card"       |
| `best cmap`        | `fontTools`' `getBestCmap()`, a third-party symbol that cannot be renamed here |

**What the lint cannot decide** is substantiation. `AGENTS.md §1.3` bans "best" and "most accurate"
_without substantiation_, and no regular expression can tell whether a measurement exists. The lint
therefore fires on every occurrence outside those four collocations, and the judgment about whether
a substantiated claim should be permitted stays a human review item — raised in the Phase 10 copy
review, resolved by rewriting or by escalation, never by a new allowlist entry.

### 7.5 Output

One line per hit: path, line, column, phrase, invariant; then the text as it really appears and the
one-line reason.

```
apps/web/src/pages/index.astro:60:35  you are owed  [AGENTS.md §1.3 — never overclaim legally]
    matched: "you are owed"  —  States an entitlement as settled. DelayPilot says "may apply" …
```

---

## 8. Disclaimer placement map

`DIRECTIVE.md §26` is titled "placed near the relevant result — **not only in the footer**". A
disclaimer that exists only in the footer has not been shown to the person reading the result it
qualifies. The machine-readable half of this table is `disclaimers.disclaimerPlacement`, and the
Phase 10 copy review is checked against it.

| Disclaimer                | Renders inside                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flightData` (`§26`)      | the flight-status surface · every segment card · the lookup result states · any notification carrying a status change                                                     |
| `prediction` (`§26`)      | the delay and cancellation assessment block, adjacent to the band · the `/delay-risk/` explainer. Always alongside `Heuristic risk band` while no calibrated model exists |
| `connection` (`§26`)      | the connection cockpit, next to slack and the transfer components · the `/connection-risk/` explainer                                                                     |
| `rights` (`§26`)          | every rights card · every rights explainer · the evidence packet                                                                                                          |
| `affiliate` (`§26`)       | a single affiliate link outside a module                                                                                                                                  |
| `affiliateModule` (`§20`) | inside every affiliate module, **above** the links                                                                                                                        |
| `independence` (`§3.4`)   | the footer of **every** public page                                                                                                                                       |

**The footer disclaimer does not substitute for any of the other six, and none of them substitutes
for it.** `copy.test.ts` asserts that no `§26` disclaimer's placement mentions the footer.

### 8.1 Every note has a name

`packages/ui/src/patterns/atoms.tsx` renders each `§26` disclaimer inside `role="note"`. A note with
no accessible name announces a qualifying sentence with nothing to attach it to: a screen-reader
user hears "This is an estimate, not an airline decision or safety forecast" and cannot tell which
estimate. `disclaimers.labels` supplies the name.

| Note                 | Accessible name             |
| -------------------- | --------------------------- |
| `flightData` (`§26`) | Flight data disclaimer      |
| `prediction` (`§26`) | Prediction disclaimer       |
| `connection` (`§26`) | Connection disclaimer       |
| `rights` (`§26`)     | Passenger rights disclaimer |

Short noun phrases, distinct from one another — "Prediction disclaimer" and "Connection disclaimer"
appear on the same page and must not sound alike heard once, at speed. They are **not** headings,
they are not rendered visually, and they never restate or soften the sentence inside the note.

Four, not seven: the independence disclaimer is footer content inside the already-named
`contentinfo` landmark, and the two affiliate strings would be named by their module's own heading —
no affiliate module ships in this release.

In this release the surfaces are: the homepage source section and lookup (flight data), the
delay-risk explainer and the demo assessment block (prediction), the connection cockpit and the
connection-risk explainer (connection), the rights explainer and every rights card (rights), the
footer on every page (independence). No affiliate module ships — there is no agreement — so the two
affiliate strings exist as constants and render nowhere.

---

## 9. Three rules the reviews produced

### 9.1 F24 — a reading never equals its band

`packages/ui/src/primitives/ProgressBar.tsx` announces `` `${valueText}, ${bandLabel}` `` in
`aria-valuetext`, because `role="progressbar"` drops its own children from the accessibility tree.
The primitive must not edit copy, so the two strings have to read as a sentence **together**. The
Phase 9 reviewer rendered the unknown state and got `aria-valuetext="Unknown, Unknown"`
(`docs/ACCESSIBILITY.md §2.2`, F24).

> **Rule: no `valueText` may ever equal its `bandLabel`, in any state.**

An unknown reading names the missing quantity; the band stays the band word:

| State                     | `valueText`                         | `bandLabel` | Announced as                               |
| ------------------------- | ----------------------------------- | ----------- | ------------------------------------------ |
| both times known          | `44 of 51 minutes`                  | `Watch`     | 44 of 51 minutes, Watch                    |
| both unknown              | `Slack unknown`                     | `Unknown`   | Slack unknown, Unknown                     |
| required time unknown     | `Required transfer time unknown`    | `Unknown`   | Required transfer time unknown, Unknown    |
| available time unknown    | `Available connection time unknown` | `Unknown`   | Available connection time unknown, Unknown |
| delay unknown             | `Delay unknown`                     | `Unknown`   | Delay unknown, Unknown                     |
| no delay against schedule | `No delay reported`                 | `On track`  | No delay reported, On track                |

`copy.test.ts` asserts the rule across every band, every null combination, and every segment status
word, so a future string cannot re-introduce the collision.

Note the second row of that table: `No delay reported` is a statement about the flight, and
`Delay unknown` is a statement about our information. Rendering the second as the first is the
fabrication in `AGENTS.md §1.1`.

**The S3 review extended the rule to the meter's name.** `ProgressBar` renders three caller strings:
`label` as `aria-label`, and `valueText` as both the visible readout and the first half of
`aria-valuetext`. Passing one string as two of the three says the same phrase twice in a single
announcement — the same defect as F24, in a different slot. The rendered homepage carried
`aria-label="Risk band"` beside `aria-valuetext="Risk band, Disrupted"`.

> **Rule: a meter's reading may equal neither its band label nor its accessible name.**

A band meter has one datum and three slots, so the three take different registers: the **name** is
the surface (`cockpit.headings.assessment` — "Delay and cancellation assessment"), the **reading**
is the quantity (`cockpit.assessment.bandLabel` — "Risk band"), and the **band label** is the value
(`bandLabel(band)` — "Disrupted"). Announced: _Delay and cancellation assessment, Risk band,
Disrupted._ Nothing is repeated and no number is invented for a meter that has none.

A `§27` result sentence is never a reading. It is the paragraph a reader gets after the meter, not
the words inside it: put through `valueText` it renders "Conditions are changing. Review the factors
and keep alerts on., Watch", a full stop followed by a comma, and it duplicates the tile that
already carries the sentence.

### 9.2 F17 — every new tab announces itself

`Link` with `external` sets `target="_blank"` and gives no warning (`docs/ACCESSIBILITY.md §2.2`,
F17). Every such link renders `nav.newTab` — **"opens in a new tab"** — in a visually-hidden span
**inside** the link element, so it becomes part of the accessible name:

> Council of the EU press release (opens in a new tab)

Lower case, no leading capital, no full stop: it is a suffix to the link text, not a sentence. Never
a sibling of the link, never a `title` attribute, never an icon alone.

### 9.3 The reading names the quantity the bar draws, in the bar's direction

Raised in the S3 copy follow-up, from the rendered demonstration cockpit.

> **Rule: a meter's reading states the same ratio the bar fills, in the same order.**

`packages/ui/src/patterns/ConnectionCockpit.tsx` fills its meter `value={requiredMinutes}` of
`max={availableMinutes}` — how much of the window the transfer eats, so a nearly-full bar means
nearly no room. The demonstration itinerary needs 44 minutes inside a 51-minute window: a bar at
86 %. Read with the arguments the other way round, the words beside it said **"51 of 44 minutes"** —
fifty-one minutes needed out of forty-four available, the exact inverse of the picture and of the
seven minutes of slack in the row below it. A tired reader at a gate has no way to tell which of the
two is wrong.

| Bar fills             | Function                                       | Reading            |
| --------------------- | ---------------------------------------------- | ------------------ |
| required of available | `requiredOfAvailableText(required, available)` | `44 of 51 minutes` |

The three unknown branches are **not** swapped with the arguments. Which quantity is missing does not
depend on which way the bar fills, so `Required transfer time unknown` stays
`Required transfer time unknown`, and F24 still holds — no branch returns the bare word.

#### The inverse reading was retired, and why

A second function, `slackValueText(available, required)`, rendered the other direction —
"18 of 45 minutes", eighteen of the forty-five you need. It shipped in S2 as the connection meter's
reading, was found to contradict the bar it sat under, and was superseded by
`requiredOfAvailableText` in the S3 fix. The Phase 10 review found it had **zero product callers**:
`grep -rn slackValueText apps packages docs e2e tests` returned only its own definition, its own
tests, and three comments describing it.

It is deleted, with its tests, as of the S3 copy review. The reasoning, recorded because the other
decision was available:

- **No named future caller exists.** Nothing in `DIRECTIVE.md §18.5` or the §17 state matrix asks
  for a meter that fills available of required, and no agent has requested one. "Someone might
  want it" is not a caller.
- **Keeping it was the more expensive option.** An exported reading with no call site is a string a
  future author can reach for by name, and its name — `slackValueText` — reads like the obvious
  choice for a slack meter, which is exactly how the inverted reading got onto the cockpit in the
  first place. The defect was a plausible-looking function being available.
- **Restoring it is cheap.** If a surface ever draws a bar in that direction, the function is four
  lines and its unknown branches are already specified above. Re-deriving it costs less than the
  risk of leaving a loaded name in the export list.

Ask `ux-copy-steward` for the string; do not reintroduce it locally, and do not wrap
`requiredOfAvailableText` with the arguments swapped — a swap is what produced the original defect,
and a swap is invisible at the call site.

---

## 10. Notifications (`DIRECTIVE.md §16`)

Not built in this release — no notification system exists — so
`packages/notifications/src/templates/**` is empty and no template copy has been written. The rules
are recorded here so the templates are not designed twice.

**The tone ladder:** `info` informative → `watch` attentive → `urgent` directive → `resolved`
closing. Never panicked, at any rung.

**Every message carries:** the flight number and date · what changed · source freshness · the next
useful action · a deep link · the uncertainty where it matters.

**No message contains:** a ticket identifier · a full email address · payment information · receipt
contents · a legal guarantee · alarming language the data does not support.

**Subject lines state the change, not the emotion.** "DL123 · new departure estimate 19:42 JFK", not
"Bad news about your flight".

Quiet-hours, suppressed-duplicate, escalation, and resolution messages each get their own string.
Marketing unsubscribe copy is separate from operational messages and never shares a template.

---

## 11. Spelling and typography

- **American spelling** in DelayPilot's own prose: "canceled", "traveler", "labeled", "modeled",
  "color", "judgment", "license" (noun and verb), "favorable", "afterward".
- **Except inside fixed text.** `§26` and `§27` are transcribed exactly as `DIRECTIVE.md` writes
  them. `DIRECTIVE.md` itself uses both spellings of "cancel(l)ed" in different places, and the lint
  bans both spellings of the forbidden phrase for that reason.
- **Apostrophes are ASCII** (`'`), matching `DIRECTIVE.md`. The lint folds curly ones, so a pasted
  `’` is still caught, but authored copy uses the straight form so that quoted directive text and
  surrounding prose look the same on screen.
- **Em dash** `—` for a break in a sentence. `DIRECTIVE.md §7` writes the support line with an
  unspaced em dash and that is transcribed as-is.
- **Middle dot** `·` separates items on one line (the trust line, the affiliate disclosure).
- **Titles** end ` — DelayPilot`. The homepage is the one exception and leads with the brand.
- **Sentence case** for headings, labels, and buttons. Not Title Case, not ALL CAPS.
- **No exclamation marks.** Not one.
- **Times** always carry the airport code and the time zone (`AGENTS.md §3.3`).

---

## 12. Where the strings live

`apps/web/src/lib/copy/` — `index.ts` re-exports everything.

| Module           | Holds                                                                         |
| ---------------- | ----------------------------------------------------------------------------- |
| `disclaimers.ts` | The seven fixed disclaimers and the placement map                             |
| `results.ts`     | `§27` microcopy; `freshness()` and `freshnessUnknown()`                       |
| `provenance.ts`  | The six labels, their meanings, and the `unavailable` reasons                 |
| `bands.ts`       | Band words, the two meter readings, `delayValueText()` — §9.1 and §9.3        |
| `nav.ts`         | Header, footer, menus, skip link, `newTab`, theme, `copyright(year)`          |
| `home.ts`        | The homepage in the `§18.3` order                                             |
| `lookup.ts`      | The `§18.4` form, its validation, and its `§17` states                        |
| `cockpit.ts`     | The `§18.5` trip cockpit, per-field unknowns included                         |
| `chronology.ts`  | The `§28` alert timeline, five steps, no clock times                          |
| `pages.ts`       | Per-route metadata and body copy; the accessibility statement; article chrome |
| `states.ts`      | The `§17` general states                                                      |
| `demo.ts`        | The `§28` synthetic identifiers                                               |
| `lint/`          | The forbidden-phrase scanner, its fixtures, and its tests                     |

**No component, page, or layout holds a literal.** If a string is missing, it is requested by name
in a handoff to `ux-copy-steward`, not invented in place. The slot renders the closest existing
string until the real one lands.

That is how `states.conditionsNotConnected`, `disclaimers.labels` and the `pages.article`
source-block strings — `notYetVerified`, `internalRefsHeading`, `contextHeading`, `contextIntro`,
`contextNote` — arrived: `frontend-ui-engineer` filed the gap list as a handoff naming each export,
`ux-copy-steward` wrote them here, and the adapter in `apps/web/src/components/pattern-copy.ts` now
consumes them. The request carried a test asserting the copy module still lacked each export, so the
gap could not quietly outlive the string that closed it.

### 12.1 The two carve-outs, and their limits

"No page holds a literal" governs the **product's own voice**: chrome, labels, states, results,
disclaimers. Two bodies of prose are not that, and both are named here so the rule is not quietly
widened or quietly abandoned.

| Carve-out                                          | Owner                      | What it covers                         |
| -------------------------------------------------- | -------------------------- | -------------------------------------- |
| `apps/web/src/content/**` article bodies           | `content-editorial-lead`   | Guides and rights explainers           |
| The five `apps/web/src/pages/*.astro` policy pages | `trust-compliance-officer` | Privacy, terms, and the three policies |

An article body is the document. A policy page is the policy — its sentences are the commitment the
company is making, they are reviewed and dated as a unit, and routing them through a copy module
would put an editor between the owner and the words they are accountable for. `ROSTER.md §3`
shared-surface note 4 already assigns the five pages to `trust-compliance-officer` while the route
tree around them stays with `frontend-ui-engineer`; this is the copy half of that split.

**The carve-out is about the body, not the page.** Both owners still take every one of these from
the copy module, and a literal copy of one is a defect at the same severity as a literal anywhere
else, because a fixed sentence that is transcribed instead of imported is a fixed sentence that will
drift:

1. Every `§26` disclaimer — `disclaimers.*`, never retyped.
2. Every `§27` result string — `results.*`.
3. The `§3.4` independence disclaimer — from `SiteFooter`, on every page, not restated in the body.
4. The six provenance labels and the five rights-status labels — `provenanceLabels`,
   `cockpit.rights.statusLabels`.
5. Every shared UI string: navigation, footer groups, the reviewed line, the source block, the
   `opens in a new tab` suffix, and any heading that appears on more than one of the five pages.

A heading repeated verbatim across all five policy pages is chrome, not policy, and belongs here.

**And the fixed text must survive the renderer.** An article body that types a `§26` disclaimer into
markdown gets it back with the apostrophes curled, which is no longer byte-exact. Fixed text is
rendered from the constant, or the markdown pipeline is configured not to rewrite punctuation
(§11). Either is acceptable; transcription plus a smart-quote pass is not.
