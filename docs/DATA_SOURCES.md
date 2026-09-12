# DelayPilot data sources

**Owner:** `regulatory-source-steward` (`docs/agents/ROSTER.md §3`). **Registry:**
`data/rights/sources/registry.json`. **Review log:** `docs/RIGHTS_SOURCE_REVIEW.md`.
**Companion:** `docs/PROVIDER_LICENSING.md` for the licence record behind any live provider.

This file answers, per source: what DelayPilot uses it for, which surfaces it may feed, what version
or date is assumed, what cache window applies, what attribution ships with it, and whether it is
connected today.

> **State as of 2026-09-12: nothing is connected and nothing is verified.** No provider is licensed,
> the flight provider is `fixture`, and all 27 registry sources are `unreachable` because this build
> environment's network egress policy refused every fetch. Every "used for" below describes an
> intended use that is gated on a verification that has not happened, not a live integration.

---

## 1. How to read an entry

**Status vocabulary** (`AGENTS.md §6`): a source is _verified_ only if it was opened in a recorded
review cycle and the relied-on provision was read. Everything else is _not verified_. "Well known"
and "in the model's memory" are not statuses.

**Surfaces** use the `ProviderLicensePolicy` vocabulary: `public_page` · `authenticated_app` ·
`notification` · `evidence_packet` · `export`. A surface listed below is one the source _may_ feed
once verified and, where applicable, licensed — never one it feeds today.

**Cache windows.** `DIRECTIVE.md §11` gives KV the role of holding expiring provider responses and
`§16` sets the refresh cadence by proximity to an event, but **neither defines a numeric TTL for any
source in this list**. For a commercial provider the permitted window is a contractual input; for a
public API it is in that API's terms. Both are unread, so the window is _undefined_ rather than
defaulted. An undefined window is a reason to keep an adapter disabled, not a reason to pick a
number.

**Attribution.** Required wording comes from the source's own terms. Where those terms are unread,
the attribution string is unknown and no string may be shipped. Independent of any source's terms,
`AGENTS.md §1.4` applies everywhere: text names and IATA/ICAO identifiers are permitted, logos,
wordmarks, seals, crests, brand colours, and trade dress are not, and the independence disclaimer
ships in the footer of every public page (`DIRECTIVE.md §3.4`, where the verbatim text lives —
`AGENTS.md §1.4` cites it as `§35`, which does not resolve; see finding R-5).

**Regulatory sources are not runtime fetches.** A regulator's page never reaches a user through a
live request. Its content enters the product only as versioned rule data with effective dates
(`AGENTS.md §3.2`), which is why its freshness control is the review cadence, not a TTL.

## 2. Version and date assumptions

The only dated legal assertions in this repository come from the `DIRECTIVE.md §3.5` snapshot, which
is **dated 2026-07-17 and is explicitly an assertion to re-verify, not a fact to copy**. Each line
below is reproduced as an assumption with its verification state, and none of them may be written
into rule data in this state.

| Assumption (`DIRECTIVE.md §3.5`, snapshot 2026-07-17)                                                                                    | Verification state                                                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| The EU July 2026 reform received final Council clearance and enters into force 12 months and 20 days after Official Journal publication. | **Unverified.** No OJ citation exists in the registry, so `effectiveFrom` is `null` and the reform is `adopted_not_effective`.                |
| The DOT extended limited enforcement discretion on 2026-07-08 for certain renumbered flights through 2027-07-07.                         | **Unverified.** Typed `enforcement_notice`, modelled as guidance, never as repeal.                                                            |
| Canadian reforms are proposed, not in force.                                                                                             | **Unverified**, and treated as the conservative case: no Canadian set leaves `draft`.                                                         |
| US airline dashboard commitments are voluntary and distinct from statutory refund rights.                                                | **Unverified.** Typed `voluntary_commitment`, separate module.                                                                                |
| The compensation bands and thresholds in `DIRECTIVE.md §15.2`, `§15.3`, `§15.4`.                                                         | **Unverified.** Referenced by pointer and deliberately not copied here — a rule value expressed in two places is a defect (`AGENTS.md §3.2`). |

Platform and vendor documentation carries a second kind of assumption: the stack pinned in
`docs/decisions/0002-foundation-stack-and-versions.md` was chosen without a fetch of the vendor's
current documentation in this session, so every Cloudflare, Google, and Stripe behaviour the
repository relies on is an assumption until `DIRECTIVE.md §3.6` is satisfied at implementation time.

## 3. Regulatory sources

`DIRECTIVE.md §33` splits these in two, and the split is load-bearing. Entries 23–27 are the **legal
instruments**; entries 1–8 are the **regulators' explanations** of them. A legal value, threshold,
band, or effective date is published only when it cites both — an explanation alone is not a source
for a value, and an instrument read without its regulator's interpretation is how a plain-text
reading becomes a confident error. The pairing is tabulated in `data/rights/sources/README.md §2`.

Entry 13, `icao-montreal`, sits outside that pairing: it is a treaty source, and it has no
instrument-level citation yet because its registry URL is the organisation's site root (finding
R-3). Until that is resolved it cannot support an SDR limit either.

### The instruments (§33 entries 23–27)

All five are **not verified** (2026-09-12), registry status `unreachable`, cadence 90 days,
`evidenceClass: primary`, `citableForRuleValues: true`, and none has been opened. They share these
properties, so they are described once:

- **Surfaces:** `public_page`, `authenticated_app`, `evidence_packet`, `export` — as the citation of
  record beneath a rights outcome, always beside the regulator explanation it is paired with.
- **Cache window:** not a runtime fetch. An instrument enters the product only as versioned rule
  data with effective dates; the 90-day review cadence is the freshness control.
- **Version assumption:** none, and each carries a version trap that a verification must record —
  see the per-entry note below. Quoting an instrument without its version date is not a citation.
- **Attribution:** the publisher named as text with a link, and the version or currency date shown
  beside the quoted provision. No emblem, seal, crest, or royal arms (`AGENTS.md §1.4`).

| Registry id            | Instrument                                              | Publisher                                  | Used for                                                             | Version trap a verification must record                                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `eu-reg-261-2004`      | Regulation (EC) No 261/2004 (ELI `eli/reg/2004/261/oj`) | EUR-Lex, Publications Office of the EU     | Every EU value in `§15.2`, paired with `eu-your-europe-air`.         | An ELI URL resolves to the version current at fetch time; record which consolidated version was read. This is the regulation the 2026 reform amends — the reform is never read into this record.                           |
| `uk-reg-261-2004`      | Regulation (EC) No 261/2004 as it applies in UK law     | The National Archives, legislation.gov.uk  | Every UK261 value in `§15.3`, paired with `uk-caa-delays`.           | Record the point-in-time version and any outstanding effects or amendments shown as not yet applied. Sterling amounts and euro amounts are separate values from separate instruments; neither is converted into the other. |
| `ca-appr-sor-2019-150` | Air Passenger Protection Regulations, SOR/2019-150      | Justice Laws Website, Government of Canada | Every Canadian value in `§15.4`, paired with both `cta-*` records.   | Record the stated "last amended on" date and read the amendment list: an announced amendment is not in force until the consolidated text carries it — the mechanical form of "a proposal is not law".                      |
| `us-14cfr-260`         | 14 CFR Part 260, Refunds and Other Consumer Protections | eCFR, Office of the Federal Register       | The US statutory refund layer in `§15.1`, paired with `dot-refunds`. | eCFR "current" moves; the currency date is part of the citation. The 2026-07-08 enforcement discretion does not amend this part — guidance does not change a regulation's text.                                            |
| `us-14cfr-250`         | 14 CFR Part 250, Oversales                              | eCFR, Office of the Federal Register       | The US denied-boarding layer in `§15.1`, paired with `dot-refunds`.  | Amounts are periodically adjusted: record both the currency date and the most recent adjustment reflected in the text. Denied-boarding compensation is a separate right from a refund and is never blended with one.       |

The EU reform has **no** instrument record, because its Official Journal citation does not exist in
the registry. That is why `effectiveFrom` is `null` and the reform is `adopted_not_effective`.

### The regulator explanations, and the treaty source (§33 entries 1–8 and 13)

### `dot-refunds` — DOT refunds

- **Used for:** the US statutory refund layer (`DIRECTIVE.md §15.1`) — refund triggers, domestic and
  international thresholds, refund timing and method, and the treatment of a passenger declining a
  changed itinerary, credit, or voucher.
- **Surfaces:** `public_page`, `authenticated_app`, `evidence_packet`, `export` — as a cited source
  link beside a rights outcome. Never a `notification` on its own.
- **Version assumption:** none. The page's own last-updated date is unread.
- **Cache window:** not a runtime fetch; enters the product as versioned rule data. Review cadence
  90 days, shortened to an out-of-cycle review whenever `dot-whats-new` changes.
- **Attribution:** "U.S. Department of Transportation" as text, with a link to the page. No seal, no
  logo, no implication of endorsement.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`. Nothing derived from it
  is displayed.

### `dot-whats-new` — DOT What's New

- **Used for:** the `us_enforcement_discretion` layer (`DIRECTIVE.md §15.1`): the 2026-07-08 limited
  enforcement discretion for certain renumbered flights, running through 2027-07-07.
- **Surfaces:** `public_page`, `authenticated_app`, `evidence_packet`, `export`, as an annotation on
  a refund outcome — labelled guidance, never a right, never a suppression of a refund outcome.
- **Version assumption:** both dates are §3.5 snapshot assertions; the notice is unread.
- **Cache window:** not a runtime fetch. Review cadence 30 days — the shortest tier, because this is
  live guidance with an end date.
- **Attribution:** "U.S. Department of Transportation" as text, with a link.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`.

### `dot-dashboard` — DOT Airline Customer Service Dashboard

- **Used for:** the per-airline voluntary commitments module (`DIRECTIVE.md §15.1`) — meals, hotels,
  ground transport, and rebooking on controllable disruptions.
- **Surfaces:** `public_page`, `authenticated_app` in a module of its own, visually and structurally
  separate from any statutory outcome. Never blended into a rights card's conclusion.
- **Version assumption:** none. Commitments change without notice and each is per-airline.
- **Cache window:** not a runtime fetch. Review cadence 30 days.
- **Attribution:** "U.S. Department of Transportation" as text, with a link, plus the module's own
  standing line that these are voluntary airline commitments rather than legal obligations.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`.

### `eu-your-europe-air` — EU, Your Europe air passenger rights

- **Used for:** currently effective EC 261 (`DIRECTIVE.md §15.2`) — coverage cases, care at
  departure, cancellation choices, denied boarding, final-destination delay, protected connections,
  notice periods, the rerouting reduction, and the bands asserted in §15.2.
- **Surfaces:** `public_page`, `authenticated_app`, `evidence_packet`, `export`.
- **Version assumption:** none. The portal's last-checked date is unread.
- **Cache window:** not a runtime fetch. Review cadence 30 days, because this is the surface that
  changes when the reform enters into force.
- **Attribution:** "European Commission — Your Europe" as text, with a link. No EU emblem.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`.

### `eu-council-2026-07-13` — Council of the EU press release

- **Used for:** **nothing that produces a value.** It is context for the "current rules versus
  adopted reform" timeline and evidence that a legislative step occurred — it is marked secondary
  and non-citable, and it can never supply an effective date.
- **Surfaces:** `public_page` only, as a link inside the reform timeline, labelled as a press
  release. Never in an `evidence_packet` as authority for an outcome.
- **Version assumption:** the 2026-07-13 clearance date is a §3.5 snapshot assertion, unread.
- **Cache window:** not a runtime fetch. Review cadence 30 days as part of the OJ watch.
- **Attribution:** "Council of the European Union, press release" as text, with a link, and the word
  _press release_ on the face of the link so no reader mistakes it for the law.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`. Entry into force is OJ
  publication plus 12 months and 20 days; no OJ citation exists, so `effectiveFrom` stays `null`.

### `uk-caa-delays` — UK CAA flight delays

- **Used for:** UK261 (`DIRECTIVE.md §15.3`) — scope by origin, destination and carrier, care
  thresholds, the refund choice after a qualifying long delay, cancellation, protected missed
  connections, extraordinary circumstances, and the fixed bands asserted in §15.3.
- **Surfaces:** `public_page`, `authenticated_app`, `evidence_packet`, `export`.
- **Version assumption:** none. The CAA's own last-updated date is unread.
- **Cache window:** not a runtime fetch. Review cadence 90 days.
- **Attribution:** "UK Civil Aviation Authority" as text, with a link. No CAA logo.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`.

### `cta-delays-cancellations` — CTA flight delays and cancellations

- **Used for:** APPR structure (`DIRECTIVE.md §15.4`) — the three cause categories, notice timing,
  arrival delay, rebooking versus refund, and the claim deadline.
- **Surfaces:** `public_page`, `authenticated_app`, `evidence_packet`, `export`.
- **Version assumption:** none, and in-force status is itself unverified. A consultation document on
  the same site is not a change in the law.
- **Cache window:** not a runtime fetch. Review cadence 30 days.
- **Attribution:** "Canadian Transportation Agency" as text, with a link. No Government of Canada
  wordmark or Canada wordmark.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`.

### `cta-rebooking-refunds-compensation` — CTA rebooking, refunds, compensation

- **Used for:** the official large versus small airline classification and the within-control,
  non-safety compensation amounts asserted in `DIRECTIVE.md §15.4`, plus rebooking and refund
  obligations.
- **Surfaces:** `public_page`, `authenticated_app`, `evidence_packet`, `export`.
- **Version assumption:** none. The airline-size input must resolve to this source, never to a
  carrier's description of itself.
- **Cache window:** not a runtime fetch. Review cadence 30 days.
- **Attribution:** "Canadian Transportation Agency" as text, with a link.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`.

### `icao-montreal` — ICAO, Montreal Convention liability limits

- **Used for:** `DIRECTIVE.md §15.5` — current SDR liability limits, the effective date of the last
  revision, and limitation periods, as informational and source-linked content only.
- **Surfaces:** `public_page`, `authenticated_app` as an informational card. Never an
  `evidence_packet` conclusion, never a payout figure, never mixed with EC261, UK261, or APPR fixed
  compensation.
- **Version assumption:** none, and the registry URL is the organisation's site root rather than a
  provision-level citation (finding R-3).
- **Cache window:** not a runtime fetch. Review cadence 90 days.
- **Attribution:** "International Civil Aviation Organization" as text, with a link. No ICAO emblem.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`.

## 4. Operational data sources

These are the only sources in this list that would be fetched at runtime. All four are disabled.

### `awc-data-api` — AviationWeather.gov Data API

- **Used for:** observational and forecast weather context feeding `weather_snapshots`
  (`DIRECTIVE.md §12`) and the `§13` heuristic inputs: visibility, ceiling, wind, gust, phenomena,
  and flight category.
- **Surfaces:** `public_page`, `authenticated_app`, `notification` — always as _operational context_
  with its own `Live` / `Cached` / `Stale` / `Unavailable` label and observation time. **Never** in
  an `evidence_packet` as a cause: weather near an airport is not proof that a disruption was
  outside an airline's control (`AGENTS.md §1.3`), and no weather condition is ever described as
  unsafe (`AGENTS.md §2`).
- **Version assumption:** none. The API version, product set, and field semantics are unread.
- **Cache window:** **undefined.** `DIRECTIVE.md §11`/`§16` define no numeric TTL, and the service's
  own guidance is unread. Until it is read, `maxCacheSeconds` and `staleIfErrorSeconds` have no
  values and the adapter stays disabled rather than guessing one.
- **Attribution:** **unknown — required wording has not been read.** No attribution string may ship
  until `docs/PROVIDER_LICENSING.md §3.4` records it from the source's own terms.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`, adapter disabled.
  **Before any production use** this source requires an identifying `User-Agent` set to a real
  contact address (`AVIATIONWEATHER_USER_AGENT` in `.env.example`; `DIRECTIVE.md` Phase 4 adds
  204 handling, a product-appropriate TTL, a parser version, and a checksum). A placeholder
  contact string is not an identification; an unset one means the adapter must not run at all.
  No key is required, but requiring no key is not the same as having verified terms.

### `flightaware-aeroapi` — FlightAware AeroAPI

- **Used for:** flight status, schedules, and disruption reason strings behind `flight_instances`
  and `flight_status_snapshots` (`DIRECTIVE.md §12`), when and only when licensed.
- **Surfaces:** none permitted today. Once a written agreement exists, each surface is enumerated in
  `ProviderLicensePolicy.permittedSurfaces` — not inferred from the product page.
- **Version assumption:** none. Endpoints and call-budget units are unread.
- **Cache window:** **undefined and contractual.** Caching, raw-payload retention, derivative use,
  and redistribution are agreement terms; no agreement exists.
- **Attribution:** unknown; a vendor product page is not a licence and cannot supply it.
- **Status:** **not licensed** (`docs/PROVIDER_LICENSING.md §3.1`). `AEROAPI_KEY` alone does not
  enable it. The adapter fails closed to `Unavailable` — never to fixtures outside explicit demo
  mode (`AGENTS.md §1.5`).

### `faa-nas-status` — FAA NAS Status

- **Used for:** `nas_events` (`DIRECTIVE.md §12`) — ground stops, ground delay programs, airspace
  flow programs, and airport closures, as operational context for the `§13` heuristic band.
- **Surfaces:** `public_page`, `authenticated_app`, `notification` as labelled context with its own
  freshness. Never a legal cause in an `evidence_packet`.
- **Version assumption:** none. Neither the terms nor a machine-readable feed has been identified
  (finding R-2).
- **Cache window:** **undefined**; no TTL is defined in `§11`/`§16` and the source's guidance is
  unread.
- **Attribution:** "U.S. Federal Aviation Administration" as text, with a link. Any further
  requirement is unread. No FAA seal.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`, adapter disabled.

### `bts-airlines-airports` — BTS airlines and airports

- **Used for:** historical on-time performance reference — the offline training and validation
  inputs in `docs/MODEL_TRAINING.md` and the baseline rates behind the `§13` heuristic band.
- **Surfaces:** `public_page` only, and only as a clearly dated historical statistic with its period
  and source named. Never a prediction, never a per-flight claim, and never a percentage from an
  uncalibrated model (`AGENTS.md §1.1`, `CLAUDE.md`).
- **Version assumption:** none. Publication lag, revision policy, and coverage caveats are unread,
  and all three govern how a figure must be described.
- **Cache window:** not a runtime fetch in the launch design; data would be ingested offline.
- **Attribution:** "U.S. Bureau of Transportation Statistics" as text, with the dataset name and
  period, and a link.
- **Status:** **not verified** (2026-09-12), registry status `unreachable`. No figure from this
  source appears anywhere in the product.

## 5. Platform and vendor documentation

None of these feeds a user-visible datum; they constrain how DelayPilot is built. None may ever be
the source behind a rule value (`citableForRuleValues: false`). All carry a 180-day cadence and all
are unverified as of 2026-09-12 with registry status `unreachable`, which means every behaviour
below is an assumption from `docs/decisions/0002-foundation-stack-and-versions.md` rather than a
fetched fact — `DIRECTIVE.md §3.6` requires the owning agent to re-verify at implementation time.

| Registry id                 | Used for                                                                                                                           | Consumer                                    |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `cf-static-assets`          | The `ASSETS` binding, selective `run_worker_first` patterns, asset configuration in `apps/edge/wrangler.jsonc` (`§11`).            | `platform-release-sre`, `edge-api-engineer` |
| `cf-workflows`              | `TRIP_MONITOR_WORKFLOW` step semantics, durability, retries, and limits behind the `§16` lifecycle checkpoints.                    | `workflows-notifications-engineer`          |
| `cf-queues`                 | `ALERT_QUEUE` / `ALERT_QUEUE_DLQ` batching, retry and dead-letter configuration for the `§16` jobs, including `source.review_due`. | `workflows-notifications-engineer`          |
| `cf-d1-migrations`          | Ordered, source-controlled migrations carrying the `§12` model, including the `source_registry` table this registry seeds.         | `data-platform-engineer`                    |
| `cf-workers-best-practices` | The vendor-side half of the `AGENTS.md §3.1` bans: module-scope request state, `ctx.waitUntil`, subrequest and CPU budgets.        | `edge-api-engineer`                         |
| `google-software-app-sd`    | `§19` structured data: required and recommended properties, and whether the type is eligible at all.                               | `seo-engineer`                              |
| `google-spam-policies`      | The `§19` content-quality gate deciding which programmatic pages may be indexed.                                                   | `seo-engineer`, `content-editorial-lead`    |
| `google-adsense-placement`  | Publisher placement rules alongside the stricter `AGENTS.md §4` rules, which bind regardless.                                      | `monetization-partnerships-engineer`        |
| `stripe-docs`               | `§10`/`§20` Checkout and Billing integration, webhook signature verification, event idempotency for `stripe_events`.               | `billing-entitlements-engineer`             |

**Attribution for this group:** none is displayed. They are build-time references, not content.
Cloudflare, Google, and Stripe names appear in documentation and configuration only — never as a
badge, logo, or claimed partnership on a user-facing surface (`AGENTS.md §1.4`).

**Surfaces:** none. A platform document never reaches a user.

## 6. What is connected today

| Question                                          | Answer                                                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Which providers are live?                         | None. `FLIGHT_PROVIDER` stays `fixture`; every adapter fails closed to `Unavailable` in production.      |
| Which sources are verified?                       | None. 0 of 27; all `unreachable` as of 2026-09-12.                                                       |
| Which rule sets are in force?                     | None. `data/rights/rulesets/**` does not exist, and no set could be published against this registry.     |
| What may a user see attributed to a source today? | Nothing. Demo fixtures carry the `Demo` label and the line "Demo data — not a live flight."              |
| What unblocks all of this?                        | Network egress to the `§33` hosts, then a verification cycle; and, for providers, an executed agreement. |

## 7. Rules that outlive any individual source

1. **Primary only.** A press release, news article, law-firm post, claims-company page, aggregator,
   or encyclopedia entry is never the source behind a value, amount, threshold, or date. Search is
   for locating a regulator's own URL, never for the value itself.
2. **Opened, or not verified.** `lastVerifiedAt` means a fetch happened in a recorded cycle and the
   provision was read. There is no lower-confidence publication tier.
3. **Provenance travels.** Every displayed datum carries `Live` / `Cached` / `Stale` / `Demo` /
   `Unavailable` / `Heuristic risk band` plus its freshness and source id, from adapter to pixel.
4. **Context is not cause.** Weather and NAS events describe operating conditions. A provider's
   reason string is an airline-stated or provider-stated cause, rendered as such.
5. **Fail closed.** An unverified source, an expired rule set, a missing licence, or an undefined
   cache window degrades to a designed, labelled state. Production readiness fails rather than
   quietly serving fixtures.
