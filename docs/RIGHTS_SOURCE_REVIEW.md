# DelayPilot rights source review

**Owner and reviewer:** `regulatory-source-steward` (`docs/agents/ROSTER.md §3`).
**Registry under review:** `data/rights/sources/registry.json` (27 records, `DIRECTIVE.md §33`).
**Cycle:** 2026-09-12 · visual-overhaul session S3 · branch `claude/intelligent-knuth-d3s8za`.

## The gate this cycle holds

**No source in this registry has been opened, so nothing in it is verified.** Every one of the 27
canonical URLs in `DIRECTIVE.md §33` was requested in this session and every request was refused by
the build environment's network egress proxy before any connection to the publisher was made. The
records exist, the ids are stable and citable by other agents, and the fetch outcomes are recorded —
but `lastVerifiedAt` is `null` on all 27, `status` is `unreachable` on all 27, and not one legal
provision has been read.

Consequently, until a cycle with real fetches runs:

- **No rule set may leave `draft`.** A transition to `in_force` requires at least one `active`
  registry source behind every rule value, each inside its review window. Zero records are `active`.
- **No content page may pass source review.** A rights guide, airport page, airline page, or route
  page cites source ids; a citation to an unverified record is not a citation, and
  `content-editorial-lead` must hold those pages in a pre-published state.
- **No effective date may be populated anywhere**, including the EU reform's, and no date from the
  `DIRECTIVE.md §3.5` snapshot may be copied into rule data as though it were established.
- **`/api/v1/readiness` must fail its in-force rule-set check**, and the `rights-rule freshness`
  metric must read as zero verified sources rather than as absent.

This is the designed failure mode, not a degraded one: `AGENTS.md §1.5` requires failing closed on
an unverified source, and `AGENTS.md §1.1` forbids substituting recall for a source. A steward who
wrote down remembered thresholds here would have produced something worse than an empty registry,
because it would look verified.

## The blocker, and the two remedies

Confirmed in this session at the tool layer, at the transport layer, and in the proxy's own log:

| Layer             | Command or tool                                  | Result                                                                                       |
| ----------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Agent tool        | `WebFetch` against each of the 27 canonical URLs | `EGRESS_BLOCKED: Access to <host> is blocked by the network egress proxy.` — 27 of 27        |
| Transport         | `curl https://www.transportation.gov/...`        | `curl: (56) CONNECT tunnel failed, response 403`                                             |
| Proxy self-report | `curl "$HTTPS_PROXY/__agentproxy/status"`        | `connect_rejected` — `"gateway answered 403 to CONNECT (policy denial or upstream failure)"` |

The proxy's `noProxy` list covers package registries only (`registry.npmjs.org`, `jsr.io`,
`pypi.org`, `index.crates.io`, `proxy.golang.org` and the like). No regulator, vendor, or platform
host in `DIRECTIVE.md §33` is reachable from this environment. This is an environment policy, not a
publisher outage, and no publisher should be recorded as being down on this evidence.

**Remedy A — grant egress.** Add the `DIRECTIVE.md §33` hosts to the environment's network policy
allowlist and re-run this steward. The hosts are: `www.transportation.gov`, `europa.eu`,
`www.consilium.europa.eu`, `www.caa.co.uk`, `protection-passager-passenger.otc-cta.gc.ca`,
`aviationweather.gov`, `www.flightaware.com`, `nasstatus.faa.gov`, `www.bts.gov`, `www.icao.int`,
`developers.cloudflare.com`, `developers.google.com`, `support.google.com`, `docs.stripe.com`,
`eur-lex.europa.eu`, `www.legislation.gov.uk`, `laws-lois.justice.gc.ca`, `www.ecfr.gov` — 18 hosts
for 27 URLs.

**Remedy B — run locally.** Run `regulatory-source-steward` on a machine with egress, and commit the
resulting `registry.json` and the review cycle it produces. The registry is plain JSON and the
review log is plain Markdown; both are reviewable in a diff by a human who can open the same URLs.

Either remedy produces the same artifact: 27 records with a real `lastVerifiedAt`, a checksum or a
quoted provision, and a `nextReviewDue`. Neither can be simulated from inside this session.

## Determinations recorded this cycle

### EU — the reform stays `adopted_not_effective`, `effectiveFrom` stays `null`

The arithmetic is recorded now so that it cannot be improvised later under time pressure:

```
entry into force = Official Journal publication date + 12 months + 20 days
effectiveFrom    = null   (no OJ publication date is verified, so the sum has no first term)
```

`eu-council-2026-07-13` is a **press release** and is marked `evidenceClass: "secondary"` and
`citableForRuleValues: false`. Final clearance by the Council is a step in a legislative process; it
is not entry into force, and it can never supply the OJ publication date the arithmetic needs. The
registry contains **no** OJ citation at all — that gap is finding R-4 below, and it is a hard
prerequisite for any EU effective date.

Until that date is verified and recorded here with its arithmetic, every EU-jurisdiction event is
assessed under currently effective EC 261, and the reform is surfaced only as
`future_rule_not_active`. Applying it early is a critical defect (`DIRECTIVE.md §3.5`,
`CLAUDE.md` mistake 4).

### US — the July 2026 notice is guidance, typed `enforcement_notice`

`dot-whats-new` is typed `enforcement_notice` and carries the limited enforcement discretion
announced 2026-07-08 for certain renumbered (flight-number-only) flights, running through
2027-07-07. It belongs in the `us_enforcement_discretion` layer of `DIRECTIVE.md §15.1`, annotated
as guidance. It is not a repeal: it never changes `effectiveFrom` or `effectiveTo` on the statutory
refund set, never suppresses a refund outcome, and never becomes a compensation right of its own.
Both dates are `DIRECTIVE.md §3.5` snapshot assertions dated 2026-07-17 and are **unverified** —
the notice was not readable this cycle, so the rule data may not assert either date yet.

### Canada — a proposal is not law

`cta-delays-cancellations` and `cta-rebooking-refunds-compensation` are both unverified, so no
Canadian rule version may leave `draft`. When they are readable, two things must be confirmed
before any Canadian set is published: that the obligations relied on are actually in force, and the
official large versus small airline classification — which must come from the CTA, never from an
airline's description of itself, and never from a consultation document or gazette proposal.

### US airline dashboard commitments — `voluntary_commitment`

`dot-dashboard` is typed `voluntary_commitment`. These are per-airline promises, changeable without
notice, and they live in their own module. They are never blended into a statutory outcome and are
never presented as a legal right.

## Findings raised to other owners

Each is a defect in the source list itself, found by working through it. None is patched here; the
registry is the steward's, the directive and the rule sets are not.

| Id  | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Owner                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| R-1 | **Accepted and closed 2026-09-12.** `DIRECTIVE.md §33` now carries entries 23–27 (the instruments) and the pair rule. Original finding: the §33 list contained **no primary legal text** for any jurisdiction — only the regulators' consumer-facing explanations of their own rules. A regulator page is a sound source for what a regulator says, but a rule value's legal text lives in the instrument. Before any US, EU, UK, or Canadian value is published, the list needs the instrument-level citations to sit beside the guidance pages.                                                                                                                                                                                                                                                                         | `build-orchestrator` → `DIRECTIVE.md §33`                                                                   |
| R-2 | `faa-nas-status` is an operational status site, not developer documentation, and the list carries no URL for its terms of use or its machine-readable feed. Both are needed before `nas_events` ingests anything.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `build-orchestrator`, `integrations-provider-engineer`                                                      |
| R-3 | `icao-montreal` points at the organisation's site root. A site root is not a provision-level citation and cannot support an SDR limit or its effective date; a verification cycle must resolve it to the specific limits-revision document and record that as `canonicalUrl`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `regulatory-source-steward` (next cycle)                                                                    |
| R-4 | No Official Journal citation exists in the registry, so the EU effective-date arithmetic has no first term. Adding one is a prerequisite for the EU set ever leaving `adopted_not_effective`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | `regulatory-source-steward` (next cycle), `build-orchestrator`                                              |
| R-5 | **Closed on the orchestrator's side 2026-09-12** — `AGENTS.md §1.4` now cites `DIRECTIVE.md §3.4`; `.env.example` goes to `principal-architect` in wave 2. Original finding: two cross-references in the repository do not resolve. `AGENTS.md §1.4` and several files cite `DIRECTIVE.md §35` for the independence disclaimer, and `.env.example:70` cites `DIRECTIVE.md §11.1` for the AviationWeather.gov User-Agent requirement; `DIRECTIVE.md` ends at §33 and has neither section. Both underlying requirements are real — the disclaimer text is at `§3.4` and the User-Agent entry is in `.env.example` — but a citation that does not resolve cannot be checked by a reviewer. Corrected where this steward owns the file (`docs/PROVIDER_LICENSING.md §3.4`, `docs/DATA_SOURCES.md`); reported everywhere else. | `build-orchestrator` (`AGENTS.md`, `.env.example`); already noted in the `trust-compliance-officer` charter |

R-1 was the consequential one, and it is resolved. It did not block this cycle — nothing is
verifiable here anyway — but it would have blocked a publication cycle that believed itself
complete.

### Cycle amendment, 2026-09-12

`build-orchestrator` accepted R-1 and open risk 1 the same day. Two things changed mid-cycle:

- `DIRECTIVE.md §33` gained entries 23–27, the legal instruments themselves, plus the rule that a
  legal value is published only when traced to an instrument-level entry **and** the regulator
  explanation that interprets it. The five records were added to the registry in the same
  fail-closed shape as the original 22, each with its own fetch attempted by this steward and
  denied; they appear as entries 23–27 below. The registry is now 27 records, cadence
  `{30: 6, 90: 8, 180: 13}`, 13 of them citable for rule values, 0 verified.
- `press_release` is ratified as the ninth `type`, defined as always `evidenceClass: secondary` and
  `citableForRuleValues: false`, and `evidenceClass` / `citableForRuleValues` are now charter
  fields. `eu-council-2026-07-13` is unchanged, which was the point of raising it.

Neither change moves any verdict: five more unverified records is five more reasons publication is
refused, not fewer.

## Publication verdicts

| Rule set submitted | Verdict                                                                                            |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| None               | `rights-rules-engineer` was not dispatched in S3 and `data/rights/rulesets/**` does not exist yet. |

**Standing verdict for the next submission, whenever it comes:** publication is **refused** on the
current registry, for every jurisdiction, on the single ground that no source is verified. The
verdict changes only after a fetch-bearing cycle, never after a re-reading of this one.

The `sourceIds` cross-check required by the charter was run and is reported under Verification in
the handoff; it passes vacuously, because there are no rule sets to cross-check yet.

## Per-source entries — cycle 2026-09-12

Every entry below has the same fetch outcome for the same reason, and each is recorded individually
rather than collapsed, because the next cycle overwrites them one at a time as each URL is actually
opened. `Provision relied on` is the field that matters: it is empty on all 27, and an empty
provision is what "not verified" means in practice.

Common to all 27: **Reviewer** `regulatory-source-steward`, 2026-09-12. **Proof artifact:** none —
no checksum, no `ETag`, no quoted text. **Currency finding:** none — the page's own published or
last-updated date was not read. **Next review due:** not set; a due date presupposes a verification.

### 1. `dot-refunds` — U.S. Department of Transportation, Office of Aviation Consumer Protection

- **URL:** https://www.transportation.gov/individuals/aviation-consumer-protection/refunds
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.transportation.gov is blocked by the network egress proxy.`
- **Provision relied on:** none. The page was not opened; no refund trigger, threshold, timing, or method has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** open it, quote the refund triggers and the domestic and international thresholds together with the page's own last-updated date, and pair it with the instrument-level citation finding R-1 requires before any `DIRECTIVE.md §15.1` value is published. Re-verify out of cycle whenever `dot-whats-new` changes.

### 2. `dot-whats-new` — U.S. Department of Transportation, Office of Aviation Consumer Protection

- **URL:** https://www.transportation.gov/airconsumer/latest-news
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.transportation.gov is blocked by the network egress proxy.`
- **Provision relied on:** none. The 2026-07-08 enforcement discretion notice has not been read; its scope and end date are snapshot assertions, not findings.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** locate the notice itself rather than the news index entry, quote which renumbered flights it covers and the end date it states, and confirm 2027-07-07 instead of inheriting it from `DIRECTIVE.md §3.5`. Record it as guidance in the `us_enforcement_discretion` layer; it never edits the statutory set's effective window.

### 3. `dot-dashboard` — U.S. Department of Transportation, Office of Aviation Consumer Protection

- **URL:** https://www.transportation.gov/airconsumer/airline-customer-service-dashboard
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.transportation.gov is blocked by the network egress proxy.`
- **Provision relied on:** none. No airline's commitment has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** capture the commitment matrix per airline with the page's own date. Each airline's row is a separate value in the voluntary module; the page changes without notice, which is why the cadence is 30 days and why no commitment may be cached into a statutory outcome.

### 4. `eu-your-europe-air` — European Commission, Your Europe portal

- **URL:** https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to europa.eu is blocked by the network egress proxy.`
- **Provision relied on:** none. No EC 261 coverage case, care obligation, threshold, or band has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** open it, quote the currently effective provision behind each `DIRECTIVE.md §15.2` case, record the page's own last-checked date, note whether it has begun describing the reform as upcoming, and add the EUR-Lex citation finding R-1 requires. The reform is never read into the rule data from this page.

### 5. `eu-council-2026-07-13` — Council of the European Union

- **URL:** https://www.consilium.europa.eu/en/press/press-releases/2026/07/13/council-gives-final-clearance-for-stronger-air-passenger-rights/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.consilium.europa.eu is blocked by the network egress proxy.`
- **Provision relied on:** none — and none ever will be. This is a press release, marked secondary and non-citable; it is not permitted to be the source behind any value, amount, threshold, or date.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.** The verdict is immaterial to any rule value, because a verified press release would still be uncitable.
- **Next action:** open it only to confirm what it is and to follow any pointer it gives to the adopted text. The EU action that matters is finding the Official Journal citation (finding R-4); re-reading this release can never produce an effective date.

### 6. `uk-caa-delays` — UK Civil Aviation Authority

- **URL:** https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/delays/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.caa.co.uk is blocked by the network egress proxy.`
- **Provision relied on:** none. No UK261 scope test, care threshold, or band has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** open it, quote the scope by origin, destination and carrier, the care thresholds, the refund choice after a qualifying long delay, and the fixed bands, with the CAA's own last-updated date; add the retained-law citation per finding R-1. Confirm separately that a separate-ticket self-transfer is treated as outside a protected through journey.

### 7. `cta-delays-cancellations` — Canadian Transportation Agency

- **URL:** https://protection-passager-passenger.otc-cta.gc.ca/en/when-an-issue-happens/flight-delays-and-cancellations
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to protection-passager-passenger.otc-cta.gc.ca is blocked by the network egress proxy.`
- **Provision relied on:** none. No APPR obligation has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** open it and confirm in-force status explicitly before anything else — a reform consultation published on the same site is not a change in the law — then quote the three cause categories, the notice timing, and the arrival-delay thresholds.

### 8. `cta-rebooking-refunds-compensation` — Canadian Transportation Agency

- **URL:** https://protection-passager-passenger.otc-cta.gc.ca/en/refunds-and-compensation/flight-delays-cancellations-rebooking-refunds-compensation
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to protection-passager-passenger.otc-cta.gc.ca is blocked by the network egress proxy.`
- **Provision relied on:** none. Neither the large versus small airline classification nor any compensation amount has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** open it, quote the classification test and the within-control non-safety amounts, and record where the CTA publishes the current airline classification so that the size input is resolved from the regulator rather than from a carrier's own description.

### 9. `awc-data-api` — NOAA / National Weather Service, Aviation Weather Center

- **URL:** https://aviationweather.gov/data/api/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to aviationweather.gov is blocked by the network egress proxy.`
- **Provision relied on:** none. The terms of use, the identifying User-Agent requirement, and the request-rate guidance are all unread.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** read the terms, the contact-identification requirement behind `AVIATIONWEATHER_USER_AGENT`, and the rate guidance; then complete `docs/PROVIDER_LICENSING.md §3.4` with the required attribution string and the rate limit. Public availability is not verified terms: the adapter stays disabled until that section is complete, and the licence-denial path needs a test before the phase is certified.

### 10. `flightaware-aeroapi` — FlightAware LLC

- **URL:** https://www.flightaware.com/commercial/aeroapi/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.flightaware.com is blocked by the network egress proxy.`
- **Provision relied on:** none. No endpoint, unit, or term has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** read the current endpoints and call-budget units for the adapter contract. The licence does not come from this page under any circumstances: caching, redistribution, raw-payload retention, derivative use, and attribution come from an executed agreement, and none exists, so the provider stays `unlicensed` and the adapter fails closed to `Unavailable` rather than to fixtures.

### 11. `faa-nas-status` — U.S. Federal Aviation Administration

- **URL:** https://nasstatus.faa.gov/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to nasstatus.faa.gov is blocked by the network egress proxy.`
- **Provision relied on:** none. Neither the terms nor the event feed has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** resolve finding R-2 first — locate the terms-of-use page and the machine-readable feed, which the §33 list does not name — then verify both. An NAS event is operational context and is never recorded as legal cause.

### 12. `bts-airlines-airports` — U.S. Bureau of Transportation Statistics

- **URL:** https://www.bts.gov/topics/airlines-and-airports-0
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.bts.gov is blocked by the network egress proxy.`
- **Provision relied on:** none. No dataset, publication lag, or revision policy has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** read the publication lag, the revision policy, and the coverage caveats before any figure derived from this source is displayed or used for training. How a statistic must be described is part of the source, not a presentation choice made later.

### 13. `icao-montreal` — International Civil Aviation Organization

- **URL:** https://www.icao.int/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.icao.int is blocked by the network egress proxy.`
- **Provision relied on:** none. No SDR limit, revision date, or limitation period has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** resolve finding R-3 — replace the site root with the specific limits-revision document and record that as `canonicalUrl` — then quote the current SDR limits and their effective date. An SDR limit is informational only and is never converted into a local-currency payout or an eligibility determination.

### 14. `cf-static-assets` — Cloudflare, Inc.

- **URL:** https://developers.cloudflare.com/workers/static-assets/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to developers.cloudflare.com is blocked by the network egress proxy.`
- **Provision relied on:** none. No configuration key or behaviour has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** re-verify at implementation time as `DIRECTIVE.md §3.6` requires, and record the version assumption in `docs/DATA_SOURCES.md`. Consumers: `platform-release-sre` and `edge-api-engineer` for the `ASSETS` binding and `run_worker_first` patterns in `apps/edge/wrangler.jsonc`.

### 15. `cf-workflows` — Cloudflare, Inc.

- **URL:** https://developers.cloudflare.com/workflows/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to developers.cloudflare.com is blocked by the network egress proxy.`
- **Provision relied on:** none. Step semantics, durability guarantees, and limits are unread.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** re-verify before Phase 8 (`workflows-notifications-engineer`), and confirm that the `DIRECTIVE.md §16` lifecycle checkpoints are expressible in the current Workflows primitives rather than assuming they are.

### 16. `cf-queues` — Cloudflare, Inc.

- **URL:** https://developers.cloudflare.com/queues/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to developers.cloudflare.com is blocked by the network egress proxy.`
- **Provision relied on:** none. Batching, retry, dead-letter configuration, and limits are unread.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** re-verify before Phase 8. This is also the source behind `source.review_due`, the queue job that surfaces this registry's own overdue entries, so its retry and DLQ semantics are a steward concern and not only a platform one.

### 17. `cf-d1-migrations` — Cloudflare, Inc.

- **URL:** https://developers.cloudflare.com/d1/reference/migrations/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to developers.cloudflare.com is blocked by the network egress proxy.`
- **Provision relied on:** none. No command or naming convention has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** re-verify before Phase 3 (`data-platform-engineer`), which creates the `source_registry` table this registry seeds.

### 18. `cf-workers-best-practices` — Cloudflare, Inc.

- **URL:** https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to developers.cloudflare.com is blocked by the network egress proxy.`
- **Provision relied on:** none.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** re-verify before Phase 7 (`edge-api-engineer`). It is the vendor-side half of the `AGENTS.md §3.1` bans on module-scope request state and unbounded post-response work.

### 19. `google-software-app-sd` — Google LLC, Search Central

- **URL:** https://developers.google.com/search/docs/appearance/structured-data/software-app
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to developers.google.com is blocked by the network egress proxy.`
- **Provision relied on:** none. Required properties and eligibility caveats are unread.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** re-verify before structured data ships in Phase 11 (`seo-engineer`), confirming that the type applies to DelayPilot at all rather than assuming it. Markup asserting a rating, review count, or install count the product does not have is a fabricated operational fact under `AGENTS.md §1.1`.

### 20. `google-spam-policies` — Google LLC, Search Central

- **URL:** https://developers.google.com/search/docs/essentials/spam-policies
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to developers.google.com is blocked by the network egress proxy.`
- **Provision relied on:** none.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** re-verify before any programmatic airport, airline, or route page enters the sitemap (`seo-engineer`, Phase 11); it defines the content-quality gate those pages must clear.

### 21. `google-adsense-placement` — Google LLC, AdSense

- **URL:** https://support.google.com/adsense/answer/1346295
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to support.google.com is blocked by the network egress proxy.`
- **Provision relied on:** none.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** re-verify before any ad slot is enabled (`monetization-partnerships-engineer`). `AGENTS.md §4` is stricter and binding regardless of what this source permits; this source can only add constraints to DelayPilot's own placement rules.

### 22. `stripe-docs` — Stripe, Inc.

- **URL:** https://docs.stripe.com/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to docs.stripe.com is blocked by the network egress proxy.`
- **Provision relied on:** none.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** re-verify before Phase 8 billing work (`billing-entitlements-engineer`) and record the pinned API version assumption in `docs/DATA_SOURCES.md`. Prices, plan names, and tax treatment come from the owner's configured Price IDs, never from documentation examples.

### The instruments — §33 entries 23–27, added mid-cycle

Each was fetched by this steward on 2026-09-12 after the amendment above, with the same reviewer,
the same absence of a proof artifact, and the same absent currency finding as entries 1–22.

### 23. `eu-reg-261-2004` — Regulation (EC) No 261/2004, EUR-Lex

- **URL:** https://eur-lex.europa.eu/eli/reg/2004/261/oj
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to eur-lex.europa.eu is blocked by the network egress proxy.`
- **Provision relied on:** none. No article of the Regulation has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** open it, record which consolidated version the ELI URL resolved to, and quote the articles behind each `DIRECTIVE.md §15.2` value. Publish only in pair with `eu-your-europe-air`. The July 2026 reform amends this instrument and is never read into this record.

### 24. `uk-reg-261-2004` — Regulation (EC) No 261/2004 as it applies in UK law

- **URL:** https://www.legislation.gov.uk/eur/2004/261
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.legislation.gov.uk is blocked by the network egress proxy.`
- **Provision relied on:** none.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** open it, record the point-in-time version and any outstanding effects or amendments shown as not yet applied, and quote the provisions behind each `§15.3` value. Publish only in pair with `uk-caa-delays`. The sterling amounts are their own values, never a conversion of the euro ones.

### 25. `ca-appr-sor-2019-150` — Air Passenger Protection Regulations, SOR/2019-150

- **URL:** https://laws-lois.justice.gc.ca/eng/regulations/SOR-2019-150/
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to laws-lois.justice.gc.ca is blocked by the network egress proxy.`
- **Provision relied on:** none. Neither the carrier-size definitions nor any amount has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** open it, record the stated "last amended on" date, read the amendment list, and quote the sections behind each `§15.4` value. This record is where "a proposal is not law" becomes mechanical: an announced amendment is not in force until the consolidated text carries it. Publish only in pair with the two `cta-*` records.

### 26. `us-14cfr-260` — 14 CFR Part 260, Refunds and Other Consumer Protections

- **URL:** https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-260
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.ecfr.gov is blocked by the network egress proxy.`
- **Provision relied on:** none. The definitions of significant delay and significant change are unread.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** open it, record the eCFR currency date as part of the citation, and quote the sections behind each `§15.1` refund value. Publish only in pair with `dot-refunds`. Confirm on the face of the text that the 2026-07-08 enforcement discretion has not amended this part — guidance does not change a regulation's text.

### 27. `us-14cfr-250` — 14 CFR Part 250, Oversales

- **URL:** https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-250
- **Fetch, 2026-09-12 (WebFetch):** `EGRESS_BLOCKED: Access to www.ecfr.gov is blocked by the network egress proxy.`
- **Provision relied on:** none. No denied-boarding amount, cap, or exception has been read.
- **Verdict:** not verified — **Blocked (external): network egress policy of the build environment.**
- **Next action:** open it, record the currency date and the most recent adjustment reflected in the text, and quote the denied-boarding formula, caps, timing, and exceptions. These amounts are periodically adjusted, which makes this the likeliest US value to go stale without anyone noticing. Denied boarding stays a separate right from a refund.

## Next cycle

Ordered, so that a later session does not have to rediscover the order:

1. Resolve the egress blocker by Remedy A or Remedy B. Nothing below is possible first.
2. Fetch all 27, record each outcome, and follow any redirect as a finding rather than silently.
3. Resolve findings R-2, R-3, R-4 — the FAA terms and feed, the ICAO limits document, the OJ
   citation. R-1 is closed: §33 now carries the instruments, and every legal value must cite an
   instrument-level record **and** its paired regulator explanation.
4. Record `lastVerifiedAt`, a checksum or a quoted provision, and `nextReviewDue` per record; flip
   `status` to `active` only for records that were actually opened and read.
5. Complete `docs/PROVIDER_LICENSING.md §3.4` and `§3.5` from the verified terms, and confirm the
   licence-denial path has a test before certifying any provider phase.
6. Hand `rights-rules-engineer` the verified values, the source ids, and the computed effective
   dates; review the rule sets and the `§15.6` golden matrix; then, and only then, record a
   publication verdict per set with a named reviewer and an approval timestamp.
