# DelayPilot Editorial Policy

**Owner:** `content-editorial-lead` · **Status:** binding on every content entry in
`apps/web/src/content/**` · **Last reviewed:** 2026-09-12 · **Next review:** 2027-03-11

**Precedence.** `AGENTS.md` > `DIRECTIVE.md` > this file. Where this file appears to permit something
either of those forbids, they win and this file is defective — report it, do not act on it.

**Scope.** This policy governs the guides, the passenger-rights explainers, and — when the reference
data exists — the airport, airline, and route entries. It does not govern in-product microcopy,
which belongs to `ux-copy-steward` (`docs/VOICE.md`), or the policy pages at `/privacy/`, `/terms/`,
`/editorial-policy/`, `/advertising-policy/` and `/affiliate-disclosure/`, which belong to
`trust-compliance-officer`. The public `/editorial-policy/` page is theirs to write; this document
is the source it summarises.

---

## 1. The one rule the rest of this file exists to enforce

A traveller reads DelayPilot standing at a gate, tired, minutes before an expensive and
irreversible decision. The failure mode that would destroy this product is not a missing article.
It is fluent, confident, plausible prose that states a right, a number, or a statistic that no
primary regulator source supports.

Everything below is a mechanism for making that specific failure hard to commit by accident.

Four operating habits follow from it:

1. **Answer first.** The direct answer occupies the opening. Context, history and "it depends" come
   after it.
2. **Cite primary.** A regulator's own page, identified by a registry id, or nothing.
3. **Date everything.** A claim without a verification date is an assertion.
4. **Leave the unknown visibly unknown.** Deleting a claim we cannot source is correct. Softening it
   into a hedge is not.

---

## 2. Workflow states

Seven states, in order. Each transition is a gate that something other than the author's confidence
has to open.

| State           | Meaning                                                                                           | Served?        | Indexed?       |
| --------------- | ------------------------------------------------------------------------------------------------- | -------------- | -------------- |
| `draft`         | Being written, or containing a claim not yet mapped to a source, or describing an unbuilt feature | No             | No             |
| `source_review` | Complete. Every external claim carries a proposed registry id. Awaiting verification              | No             | No             |
| `legal_review`  | Sources verified. Awaiting `regulatory-source-steward` sign-off on regulatory claims              | No             | No             |
| `publishable`   | Passes every gate. Not yet released                                                               | Yes, `noindex` | No             |
| `published`     | Released                                                                                          | Yes            | If `indexable` |
| `review_due`    | A cited source has passed its review interval                                                     | No             | No             |
| `stale`         | A cited source failed re-verification, or a rule set was superseded or withdrawn                  | No             | No             |

### 2.1 Gate: `draft` → `source_review`

- Every external claim in the body appears in `apps/web/src/content/claim-map.json` with a proposed
  `source_registry` id.
- No regulatory value appears as prose. Every one is a `{{rule:…}}` slot (§4).
- Frontmatter is complete and valid (§3).
- Word floor met: guide ≥ 900 body words, rights explainer ≥ 700, airport/airline/route ≥ 400 plus
  three real data fields.
- Forbidden-phrase lint clean (§6).
- The body opens with the answer, not a heading, not the title restated, not the `answerFirst`
  repeated verbatim.

`source_review` does **not** mean the claims are true. It means each one has a named place to be
checked and a reviewer's job is now to open that place. A proposed mapping written from memory is a
hypothesis, and the whole point of the gate is that somebody else tests it.

### 2.2 Gate: `source_review` → `legal_review`

- `regulatory-source-steward` has opened every cited source, recorded `lastVerifiedAt`, and either
  confirmed each mapped claim or rejected it.
- A rejected claim is **deleted**, not reworded. A claim that survives only as a hedge was never
  supported.
- Every rule slot in the entry resolves against a rule set that is `in_force` for the jurisdiction,
  or the slot is removed with the sentence around it.

### 2.3 Gate: `legal_review` → `publishable`

- `regulatory-source-steward` sign-off recorded for regulatory claims.
- The content-quality gate (`pnpm quality`, owned by `seo-engineer`) reports zero failures for the
  entry: word count, source references, unique title/description/intent/opening, no placeholder
  token, no duplicate canonical, freshness, indexable flag, editorial status.
- Accessibility and voice review where the entry introduces a new component or string pattern.

### 2.4 Gate: `publishable` → `published`

**Only a human does this.** It is owner input I-6 in `docs/BUILD_PLAN.md §10`. No agent — including
the author — promotes an entry to `published`. A `publishable` entry is served with `noindex` and a
visible "Editorial status: awaiting final review · Reviewed &lt;date&gt;" line so that a reader is
never misled about what they are reading.

### 2.5 Demotion: `published` → `review_due` → `stale`

Demotion is automatic and is never argued with.

- A cited source whose `lastVerifiedAt` passes 180 days moves the entry to `review_due`.
- A superseded or withdrawn rule set, a failed re-verification, or a source whose content has
  materially changed moves the entry to `stale`.
- Both leave the sitemap **in the same build**. Neither is served.

The author demotes their own pages. Nobody argues a stale page back into the index; the way back is
re-verification, which is the same gate as the first time.

### 2.6 The serving rule

Implemented by the route shells (`frontend-ui-engineer`):

```
status ∈ {publishable, published}          → the page is emitted
status == published && indexable == true   → the page is indexable and may enter a sitemap
anything else                              → the page is not emitted at all
```

Only `published` enters a sitemap. Never `publishable`, never `review_due`, never `stale`
(`DIRECTIVE.md §18.6`).

---

## 3. Frontmatter contract

Files live at `apps/web/src/content/guides/<slug>.md` and
`apps/web/src/content/passenger-rights/{overview,us,eu,uk,canada}.md`. The file name is the slug:
kebab-case, stable, never recycled for different content. Plain Markdown (CommonMark + GFM tables).
No MDX, no raw HTML, no images.

| Field           | Required | Rule                                                                                            |
| --------------- | -------- | ----------------------------------------------------------------------------------------------- |
| `title`         | yes      | Unique across all entries                                                                       |
| `description`   | yes      | Unique, ≤ 160 characters                                                                        |
| `pageType`      | yes      | `guide` \| `rights-explainer`                                                                   |
| `status`        | yes      | One of the seven states                                                                         |
| `intent`        | yes      | One sentence, distinct from every other entry. If two entries share an intent, one is a doorway |
| `answerFirst`   | yes      | 2–4 sentences. The shell renders it as the lead; the body extends it and never repeats it       |
| `sources`       | yes      | Array of `source_registry` ids. `[]` only with non-empty `internalRefs`                         |
| `internalRefs`  | no       | Repo paths and sections, for product-internal claims                                            |
| `ruleSetRefs`   | no       | `{ jurisdiction, version }`. Required if and only if the body uses a `{{rule:…}}` slot          |
| `reviewedAt`    | yes      | Quoted `YYYY-MM-DD`                                                                             |
| `nextReviewDue` | yes      | Quoted `YYYY-MM-DD`, per §5                                                                     |
| `indexable`     | yes      | Boolean. Editorial intent for the index once published                                          |
| `author`        | yes      | A role, never a private individual. Currently `content-editorial-lead`                          |
| `topics`        | no       | Array of tags                                                                                   |
| `jurisdiction`  | rights   | `overview` \| `us` \| `eu` \| `uk` \| `canada`                                                  |

Dates are quoted strings so that YAML does not hand the collection schema a `Date` where it expects
a string. Minimum source counts: ≥ 2 registry ids for a regulatory or rights page that makes
external claims, ≥ 1 for an explanatory guide that does.

### 3.1 Body structure, every entry

1. The answer, as the opening paragraph. No heading above it, no throat-clearing, no restatement of
   the title, no "in today's fast-paced world".
2. What determines it.
3. What you still need to know — the named gaps, not a vague caveat.
4. The actions, ordered by time and reversibility. Reversible steps first; the step that closes
   options last.
5. `## Sources` — the cited registry ids as plain text. The shell renders authority, page title and
   verified date from the registry. For a product-internal entry this section lists the repo
   documents instead and says plainly that the page makes no external regulatory claim.
6. The `DIRECTIVE.md §26` disclaimer for the page's subject, verbatim, as the closing paragraph.

### 3.2 Which §26 disclaimer

Verbatim, never paraphrased, beside the content and not only in the footer:

| Subject                            | Closing paragraph                                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Any rights-bearing page            | Informational estimate, not legal advice. Eligibility depends on the full facts, current law, and the airline or regulator's determination. |
| A risk or prediction method        | This is an estimate, not an airline decision or safety forecast.                                                                            |
| A connection method                | Walking, security, immigration, baggage, gate-close rules, and airline assistance can change the outcome.                                   |
| Flight data, freshness, provenance | Flight information can change quickly. Confirm critical details with the operating airline and airport.                                     |

---

## 4. Citation rules

### 4.1 Primary sources only

Every citation resolves to a `source_registry` id from the `DIRECTIVE.md §33` list. The registry ids
currently available:

```
dot-refunds  dot-whats-new  dot-dashboard
eu-your-europe-air  eu-council-2026-07-13
uk-caa-delays
cta-delays-cancellations  cta-rebooking-refunds-compensation
awc-data-api  flightaware-aeroapi  faa-nas-status  bts-airlines-airports  icao-montreal
cf-static-assets  cf-workflows  cf-queues  cf-d1-migrations  cf-workers-best-practices
google-software-app-sd  google-spam-policies  google-adsense-placement  stripe-docs
```

Never cite, and never prefer over a regulator: a news summary, a law firm's blog, a claims company,
an aggregator, a forum, another travel site, or this model's memory. No bare URLs in a body — the
id resolves to authority, title and verified date through the registry, so a link that rots is
visible as a rotten registry entry rather than as a silently wrong sentence.

If a claim cannot be traced to a primary source, **delete the claim**. Do not soften it into a
hedge. A hedged unsourced claim is still an unsourced claim, and it is harder to find later.

### 4.2 The claim-to-source map

`apps/web/src/content/claim-map.json` holds, for every entry, each external claim and the registry
id a reviewer must open to confirm or reject it, plus that entry's rule slots. It is the input to
the `source_review` gate and the artifact `regulatory-source-steward` works from.

### 4.3 Internal references

An entry whose every claim is about DelayPilot's own behaviour has no external authority and cites
repository documents instead: `sources: []` with a non-empty `internalRefs`. Such an entry may reach
`publishable` without a source fetch.

Two hard limits on that allowance:

- It may state only what the product does **today, or as designed and enforced by a written
  invariant**. Describing an unbuilt feature as existing is a defect, not a style problem. Where a
  design is described before it is built, the entry says so in its first line and stays out of the
  index.
- The moment such an entry makes one external claim, it is not internal any more and the whole entry
  goes back to `source_review`.

### 4.4 The rule-slot mechanism

**No compensation amount, distance band, delay threshold, notice period, claim deadline, or
regulatory effective date is ever written as prose in a body.** A hardcoded figure in Markdown keeps
rendering confidently after the law changes and no reader can tell.

Instead the sentence is written around a slot:

```
{{rule:<jurisdiction>:<dotted.path>}}      jurisdiction ∈ us | eu | uk | canada
```

for example `{{rule:eu:compensation.bands}}` or `{{rule:us:enforcementDiscretion.window}}`.

Rules for slots:

- Every jurisdiction used in a slot is declared in `ruleSetRefs`, and every declared jurisdiction is
  used by at least one slot.
- The route shell resolves a slot from the rule set named in `ruleSetRefs`, and renders the value
  **beside its rule-set version and effective date**. A value without its version is not rendered.
- An entry containing an unresolvable slot cannot be served. While no rule set is `in_force`, every
  entry containing a slot stays at `draft` or `source_review` by construction.
- Named frameworks and their structure may be described in words: EC 261, UK261, APPR, the DOT
  refund rule, the Montreal Convention, "distance bands", "notice periods", "arrival delay at the
  final destination". It is the _values_ that are forbidden, not the concepts.

---

## 5. Review cadence

`nextReviewDue` is set from the most volatile thing the entry cites.

| Entry cites                                                  | Interval |
| ------------------------------------------------------------ | -------- |
| The EU 2026 reform, the DOT notices page, or either CTA page | 30 days  |
| Any other regulatory or external-authority source            | 90 days  |
| Only repository documents (product-internal)                 | 180 days |

Independently of `nextReviewDue`, the `source.review_due` queue job (`DIRECTIVE.md §16`) reads
`apps/web/src/content/review-register.json` and demotes any entry whose cited source's
`lastVerifiedAt` has passed 180 days. The register carries, per entry: slug, route, page type,
status, indexable, whether it is served, whether it may enter a sitemap, `reviewedAt`,
`nextReviewDue`, cited source ids, internal refs, rule-set refs, rule slots, and claim count.

A review is not a glance. It is: open each cited source, confirm the claim still holds, record the
new `lastVerifiedAt`, re-run the quality gate, and either refresh `reviewedAt` or demote.

---

## 6. Language rules

### 6.1 Forbidden, everywhere

From `AGENTS.md §1.3` and `DIRECTIVE.md §7`: "you are owed" · "guaranteed compensation" · "legally
entitled" · "approved claim" · "we will win" · "the airline must pay" · "guaranteed connection" ·
"your flight will be cancelled/canceled" · "we know the airline is at fault" · "claim now before it
is too late" (absent an accurate, source-linked official deadline) · "AI-powered" as the value
proposition · "best" or "most accurate" without substantiation.

Near-misses treated as violations because they carry the same meaning: "entitled", "entitlement",
"owed", "due to you", "will be paid", "guarantee" in any form, "approved". Permitted phrasing is
"may apply", "may be available", "may qualify", "can require".

Rights statuses are limited to the five in `AGENTS.md §1.3`: `likely_applies`, `may_apply`,
`not_indicated`, `cannot_determine`, `future_rule_not_active`.

### 6.2 Booking-reference vocabulary

No body contains "booking reference", "booking code", "record locator", "PNR", or "confirmation
code". `AGENTS.md §2` bars the field from the product entirely, and content does not teach a
vocabulary the product refuses to accept. Where the point is that none is needed, say what _is_
needed: a carrier, a flight number, and a date.

### 6.3 Cause language

An airline's or provider's stated disruption reason is an **airline-stated** or **provider-stated**
cause, rendered as such, never as a determination. Observed weather and airspace status are
**context**. Nearby weather never proves an extraordinary circumstance, a within-control
classification, or anything else. Only a verified authority finding is a finding, and it is stored
in its own field.

### 6.4 Jurisdiction-specific rules

**United States.** Five layers, written as five separate things: the federal refund rule; voluntary
dashboard commitments; denied-boarding rules; enforcement discretion; the contract of carriage.
Never state or imply a general US federal cash-compensation right for an ordinary delay or
cancellation. The 2026 enforcement-discretion notice is written as enforcement guidance with a
defined scope and window, never as repeal.

**European Union.** Only the currently effective EC 261 is applied. Bands, distance boundaries, the
rerouting reduction, notice periods and delay thresholds render from the rule set. Extraordinary
circumstances is an airline assertion subject to determination.

**The EU 2026 reform.** Stored as `adopted_not_effective` until `regulatory-source-steward` verifies
the Official Journal publication date and the computed effective date. Described side by side with
the rule in force, applied to nothing — not early, not retroactively. **Applying it early is a
critical defect.**

**United Kingdom.** UK261 per the CAA's own guidance, as a framework separate from the EU one. A
separate-ticket self-transfer is never a protected through journey.

**Canada.** APPR's three control categories, and the large-versus-small carrier classification taken
from the official source. Proposed reforms are not law and are never written as law.

---

## 7. No invented statistics

No on-time percentage, average delay, "most delayed airport", passenger count, success rate,
claim-approval figure, satisfaction score, or savings claim unless it comes from a cited primary
source with a date, or from the Beta-Binomial smoothed estimator `p̂ = (k+α)/(n+α+β)` with the
sample size and a sufficiency note shown, suppressed or widened for small cohorts
(`DIRECTIVE.md §13`).

Specifically forbidden: a round number recalled from memory; a figure from a news summary presented
as a regulator's; a percentage from an uncalibrated model; a raw ratio over a small sample; a
"typical" or "average" figure with no measurement behind it; any number whose purpose is to look
authoritative.

`unknown` is a designed state, not a gap to fill. A sentence that needs a statistic it does not have
is a sentence that gets deleted.

---

## 8. Corrections and retractions

Errors are fixed in public. The procedure is the same whoever finds it.

| Severity     | Definition                                                                                                                                                 | Response                                                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Critical** | A statement of a right, obligation, amount, deadline or threshold that is wrong; a future rule applied early; a general US cash-compensation right implied | Demote to `stale` in the current build, out of the sitemap immediately. Fix, re-run both review gates, republish with a dated correction note |
| **Material** | A claim that overstates certainty, a missing condition, a mis-attributed cause, a broken source mapping                                                    | Demote to `review_due`. Fix and re-run the source gate. Dated correction note on the entry                                                    |
| **Minor**    | Typography, a broken internal link, an unclear sentence with no change of meaning                                                                          | Fix in place. Logged in the entry's history, no correction note                                                                               |

Rules that do not bend:

- A correction note names what was wrong, what it now says, and the date. It does not explain the
  error away.
- Corrected text never silently replaces wrong text on a rights-bearing page. If someone may have
  acted on the wrong version, the note says so.
- **Retraction** — for a claim that should never have been published and cannot be repaired — removes
  the claim, keeps the page at a URL that explains the removal, and never leaves a rewritten page at
  a URL that once said something materially different about a right.
- A source that has changed under us is a correction trigger, not a reason to argue that the old
  wording was defensible.

---

## 9. AI disclosure

**Stated plainly:** DelayPilot's articles are drafted with large-language-model assistance under a
named editorial role, and every external claim is gated on a human-verifiable primary source before
publication. Authorship is attributed to a role (`content-editorial-lead`), never to a private
individual and never to a fictional named person with a fabricated biography.

What that disclosure commits us to:

- No fabricated expert, byline, headshot, credential, or quote.
- No generated statistic, review, rating, testimonial, or user count.
- Model output is a draft. The source-review and legal/factual-review gates are what make it
  publishable, and neither can be passed by the model that wrote the draft.
- "AI-powered" is never the value proposition (`DIRECTIVE.md §7`). What is trustworthy here is the
  sourcing discipline, not the drafting tool.
- Structured data reflects only what is visibly on the page. No `Article` author markup naming a
  person who does not exist; no ratings, reviews, prices or awards that were never earned
  (`DIRECTIVE.md §19`).

---

## 10. Airport, airline and route content contracts

These three families exist as typed contracts now and as entries only when the reference data does.
**No seed entries are created while `data/airports/**` and `data/airlines/**` are empty**: a page
generated from a token and a template is a doorway page under `DIRECTIVE.md §19` and a placeholder
under `AGENTS.md §1.6`. All three families ship `noindex` and stay `noindex` until the entry carries
real, current, source-backed content that passes the content-quality gate.

**The identity test, applied to every entry in all three families:** if two entries would read
identically after swapping the airport or airline code, neither is publishable.

Floors: ≥ 400 body words **plus three real data fields** per entry.

### 10.1 Airport entries

| May appear                                                                      | Must not appear                                |
| ------------------------------------------------------------------------------- | ---------------------------------------------- |
| Airport name; IATA and ICAO codes; IANA time zone                               | Invented on-time or delay statistics           |
| Terminal list; official airport and authority links                             | Security wait times presented as authoritative |
| The weather station used, and what METAR and TAF mean at this airport           | Live provider data on a public page            |
| Typical transfer considerations, each with its derivation class                 | A "top delays" list with no cited source       |
| Links to the relevant rights explainer and the connection tool; a reviewed date | Any claim about an airline's performance there |

### 10.2 Airline entries

| May appear                                                                      | Must not appear                                                     |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Legal and trading name as text; IATA and ICAO codes                             | Any logo, wordmark, brand colour or trade dress (`AGENTS.md §1.4`)  |
| Which jurisdictions' rules typically apply to its flights, as a structural test | Any claim about the airline's fault, reliability or claim behaviour |
| Voluntary-commitment status, cited to `dot-dashboard` with a verified date      | A compensation promise of any kind                                  |
| Links to the airline's own official pages; a reviewed date                      | A "best airlines" comparison with no cited methodology              |

### 10.3 Route entries

| May appear                                                                                 | Must not appear                                                                                                |
| ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Origin and destination with codes and IANA zones                                           | Live or scraped fares; price predictions                                                                       |
| Great-circle distance from the shared Haversine utility (`R = 6371.0088 km`), units stated | "Cheapest day to fly"                                                                                          |
| Which EU and UK distance bands that distance falls into, and why that matters              | Schedule tables presented as authoritative                                                                     |
| Typical connection considerations; links to both airport entries and the connection tool   | A historical performance rate without `p̂ = (k+α)/(n+α+β)`, the sample size, and a suppression or widening note |

---

## 11. Session note — S3, 2026-09-12: source verification is Blocked (external)

The build environment for this session has no outbound HTTPS to any host except the npm registry.
Every `DIRECTIVE.md §33` regulator host was refused at the proxy (verified this session against
`transportation.gov`; the orchestrator verified `europa.eu`, `caa.co.uk`, `otc-cta.gc.ca` and
`icao.int`). `regulatory-source-steward` is therefore seeding `data/rights/sources/**` with every
§33 entry at `status: unreachable`, `lastVerifiedAt: null`, and **no rule set exists or can reach
`in_force`.**

Consequences, applied honestly rather than worked around:

- No entry resting on a regulatory claim can pass `source_review` here. The 18 entries in that state
  are complete, answer-first, within their word floors, and carry a full claim-to-source map. They
  are not served and not indexed.
- Every entry containing a `{{rule:…}}` slot is held at `draft` or `source_review` by the rule in
  §4.4, because no rule set can resolve a slot.
- Six product-internal entries reached `publishable` under §4.3. They are served with `noindex` and
  await owner input I-6.
- One entry (`guides/family-monitoring-without-sharing-a-password`) stays at `draft` and
  `indexable: false` because it describes a Phase 8 feature that does not exist.

**What unblocks it:** the owner grants egress to the §33 hosts in the environment's network policy,
or `regulatory-source-steward` runs on a host with access. Then: verify each source, record
`lastVerifiedAt`, confirm or reject each mapped claim, publish rule sets for the four jurisdictions,
and re-run this workflow from `source_review`. Nothing in the content needs rewriting for that to
happen — the claim map and the slot inventory are the work order.

---

## 12. Verification

```bash
pnpm format:check          # Prettier, proseWrap: preserve
pnpm lint
pnpm typecheck
pnpm test
pnpm build                 # the content collection must compile
pnpm quality               # content-quality gate (seo-engineer)
pnpm test:seo              # only published + gate-passing entries in a sitemap
```

A command is reported with the `AGENTS.md §6` vocabulary — **Passing**, **Failing**, **Not run**,
**Blocked (external)** — and never as passing unless it was executed and exited zero.
