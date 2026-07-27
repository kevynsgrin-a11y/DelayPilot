# DelayPilot — Master Build Directive (Claude Subagent Build System)

**Revision:** 1.0 · **Authored:** 2026-07-27 · **Executor:** Claude Code, orchestrating the subagent
roster in `docs/agents/ROSTER.md` · **Constitution:** `AGENTS.md`

This is an execution directive, not a proposal. It replaces the single-model build instruction with
a **phased, gated, multi-agent build**: each phase has named owning agents, a published contract,
an acceptance gate, and an independent reviewer. Nothing advances past a red gate.

---

# PART I — MANDATE

## 1. Product identity

| Field | Value |
| --- | --- |
| Product | DelayPilot |
| Repo slug | `delay-pilot` |
| Domain | Configured via `PUBLIC_SITE_URL`. Assume no domain is purchased. |
| Category | Consumer flight-disruption intelligence: connection-risk planning, passenger-rights guidance, itinerary monitoring, evidence organization |
| Launch market | United States, with rights modules for EU, UK, Canada |
| Revenue | Privacy-respectful display ads, disclosed contextual affiliates, one-time Trip Pass, Plus subscription, Family plan |
| Hosting | Cloudflare Workers + Static Assets, D1, KV, Queues, Workflows, optional R2, Turnstile, Workers observability |
| Quality bar | ≥ 95/100 under the Part IV rubric, with zero critical defects |

## 2. What a traveler must be able to do

1. Find a flight **without a booking reference**.
2. Build a single-flight or multi-segment itinerary.
3. Distinguish a protected through-ticket connection from a self-transfer.
4. See current status, schedule changes, gates and terminals where licensed data supports them.
5. See a transparent delay, cancellation, and connection-risk assessment.
6. See which live factors contribute to that assessment.
7. Get source-linked passenger-rights guidance for US / EU / UK / Canada.
8. Get a prioritized, time-sensitive action checklist during a disruption.
9. Save a trip and receive deduplicated alerts.
10. Organize receipts, notes, and a factual disruption chronology.
11. Generate a printable evidence packet — without DelayPilot acting as a lawyer or filing anything.
12. Upgrade to Trip Pass, Plus, or Family for monitoring, history, richer alerts, and an ad-free experience.

The result must feel calm, authoritative, useful, and premium. Not a flight-status clone, not an
affiliate landing page, not a legal lead-generation funnel, not an AI content farm.

## 3. Non-negotiable operating rules

`AGENTS.md` holds the full invariant set. The rules that most often get broken during a build:

**3.1 Execute without asking.** No agent asks the human to pick a framework, schema, palette,
provider, price label, or route name. Those decisions are in this document. Ambiguity inside a
phase is resolved by the orchestrator, not escalated to the user.

**3.2 Finish the job.** No pseudocode, dead controls, empty pages, `TODO`, lorem ipsum, fake charts,
or "coming soon". The only permitted unresolved inputs are external (Cloudflare IDs, a purchased
domain, provider credentials + licence, Stripe keys, email/push/SMS/CMP/ad/affiliate credentials,
human legal or editorial approval). Each requires: a complete adapter, a validated config contract,
an `.env.example` entry, a labelled demo path, a fail-closed production path, and documented
activation steps.

**3.3 Never fabricate live or legal facts.** See `AGENTS.md §1`. Provenance labels are exactly:
`Live`, `Cached`, `Stale`, `Demo`, `Unavailable`, `Heuristic risk band`.

**3.4 No false affiliation.** No airline/airport/regulator/provider logos without a verified licence.
Footer disclaimer, verbatim:

> DelayPilot is an independent travel-information tool. It is not an airline, airport, government
> agency, law firm, claims company, or flight-data provider. Guidance is informational and may not
> reflect every fact in your case.

**3.5 Current-law handling is mandatory.** The legal snapshot below is dated **2026-07-17** and must
be re-verified by `regulatory-source-steward` before any rule set is published.

- **EU:** the July 2026 reform received final Council clearance but enters into force 12 months and
  20 days after Official Journal publication. Status = `adopted_not_effective` until the OJ
  publication date and computed effective date are verified. Events before that date are assessed
  under the currently effective EC 261 framework. **Applying the reform early is a critical defect.**
- **US:** on 2026-07-08 the DOT extended limited enforcement discretion for certain renumbered
  flights through 2027-07-07. Model as *enforcement guidance*, never as repeal of the refund rule.
- **Canada:** proposed reforms are not law because a consultation document exists. Activate a
  Canadian rule version only after verifying it is in force.
- **US airline dashboard commitments** are voluntary and distinct from statutory refund rights.
  Present them in a separate module.
- A provider's disruption reason is not a proven legal cause. Nearby weather does not prove that a
  specific disruption was outside an airline's control.

**3.6 Build against current primary documentation.** Before implementing any platform API, the
owning agent fetches current docs (Cloudflare Workers best practices, Workers types, the installed
Wrangler schema, Static Assets, D1, Queues, Workflows, KV, R2, Turnstile, the Workers test pool, and
every enabled provider's API). Set `compatibility_date` to the actual execution date. Generate
bindings with `wrangler types` — never hand-write `Env`.

**3.7 Protect secrets and user data.** See `AGENTS.md §2`. Most consequential: **no PNR anywhere**,
no inbox access, no ID storage, no filing on the user's behalf, no raw email or itinerary in logs.

---

# PART II — THE SUBAGENT BUILD SYSTEM

## 4. How the build runs

The `build-orchestrator` executes phases in order. For each phase it:

1. Confirms the **entry gate** (prior contracts published and verified).
2. Dispatches the phase's owning agents — **in parallel where paths do not overlap**, since
   single-writer ownership (`ROSTER.md §3`) makes concurrency safe.
3. Collects handoff reports (`AGENTS.md §5.3`).
4. Runs the **exit gate** commands itself and records real results.
5. Dispatches the phase's independent reviewer (`ROSTER.md §5`).
6. Advances only on a green gate. A red gate produces a fix dispatch to the owning agent, never a
   lowered standard and never a "we'll fix it in a later phase".

**Parallelism law.** Two agents may run concurrently if and only if their owned path sets are
disjoint and neither consumes a contract the other is currently changing.

**Contract-first law.** No agent begins until the contracts it consumes exist in
`packages/contracts`. If a needed type is missing, that is a handoff to `principal-architect`, not
an invitation to invent a local shape.

## 5. Phase plan

Each phase lists: owners → deliverable → exit gate → reviewer.

### Phase 0 — Audit and plan
- **Owners:** `build-orchestrator`
- **Deliverable:** repository audit; `docs/BUILD_PLAN.md` (state, decisions, sequencing, risks);
  branch and commit conventions confirmed.
- **Exit gate:** plan committed; roster and charters present and frontmatter-valid.
- **Reviewer:** none (self-evident artifacts).

### Phase 1 — Foundation
- **Owners:** `principal-architect` → then `platform-release-sre` (bindings, CI skeleton)
- **Deliverable:** pnpm workspace; strict `tsconfig.base.json`; lint/format; package skeletons for
  `contracts`, `domain`, `providers`, `risk-engine`, `rights-engine`, `connection-engine`,
  `notifications`, `billing`, `observability`, `ui`; `apps/web` (Astro) and `apps/edge` (Worker);
  `wrangler.jsonc` with all bindings from §11; generated `worker-configuration.d.ts`;
  `.env.example`; `docs/ARCHITECTURE.md`; ADR 0001.
- **Exit gate:** `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm build`,
  `wrangler types` all pass.
- **Reviewer:** `security-privacy-engineer` (no secrets committed; strict flags on).

### Phase 2 — Contracts and domain
- **Owners:** `principal-architect`; `security-privacy-engineer` (crypto envelopes, identifier HMAC)
- **Deliverable:** every shared Zod schema and type in §12–§13 (flights, segments, snapshots,
  provenance, assessments, rights, connection, entitlements, alerts, problem responses);
  pure domain utilities — time-zone handling, Haversine, delay arithmetic, freshness weighting,
  confidence index; AES-GCM envelope + HMAC identifier module with versioning and rotation.
- **Exit gate:** `pnpm test --filter contracts --filter domain` green, including property tests for
  Haversine symmetry/non-negativity, DST folds, and envelope tamper detection.
- **Reviewer:** `qa-test-architect`.

### Phase 3 — Data platform
- **Owners:** `data-platform-engineer`
- **Deliverable:** all D1 migrations for §12; typed repositories with no dynamic SQL; airport and
  airline reference seeds with IANA zones; retention/deletion/export job repositories.
- **Exit gate:** `pnpm db:migrate:local` and `pnpm db:seed:local` succeed; repository integration
  tests pass under the Workers test pool; authorization tests prove user A cannot read user B.
- **Reviewer:** `security-privacy-engineer`.

### Phase 4 — Providers, weather, airspace
- **Owners:** `integrations-provider-engineer`
- **Deliverable:** `FlightDataProvider` interface + capability flags; `FixtureFlightProvider`
  (complete, deterministic, covering every state in §17); AeroAPI / Cirium / OAG adapters that
  fail closed without credentials and licence policy; `ProviderLicensePolicy` guard;
  AviationWeather.gov adapter (METAR/TAF/SIGMET, 204 handling, product-appropriate TTL, parser
  version, checksum); FAA NAS adapter boundary; reliability layer (timeout, jittered retry,
  circuit breaker, concurrency cap, cost budget, cache, stale-if-error, health persistence).
- **Exit gate:** provider contract tests pass against recorded redacted fixtures for codeshare,
  no-result, multi-candidate, cancellation, diversion, gate change, 204, malformed payload,
  timeout, 429, 500, stale fallback, licence rejection.
- **Reviewer:** `regulatory-source-steward` (licence policy correctness).

### Phase 5 — Rights engine and source registry
- **Owners:** `regulatory-source-steward` (registry, verification, effective dates) → then
  `rights-rules-engineer` (engine, rule sets)
- **Deliverable:** source registry seeded and verified from §20; versioned rule sets for US, EU, UK,
  Canada with `status` ∈ {`draft`, `review`, `in_force`, `adopted_not_effective`, `superseded`,
  `withdrawn`}; structured predicates (no executable strings); immutable assessment snapshots;
  the EU 2026 reform stored as `adopted_not_effective`; DOT July 2026 enforcement discretion modelled
  as guidance; golden test matrix from §15.6.
- **Exit gate:** the complete golden matrix passes; property tests prove a rule set outside its
  effective window can never activate and a future rule can never apply to an earlier event.
- **Reviewer:** `trust-compliance-officer` (no legal overclaim in any output string).

### Phase 6 — Risk and connection engines
- **Owners:** `risk-modeling-scientist`, `connection-risk-engineer` (parallel; disjoint paths)
- **Deliverable:** offline `ml/` pipeline (ingest → validate → normalize → leakage check → train →
  calibrate → evaluate → export → model card → drift baseline → checksum); model registry;
  **shipped heuristic band** with disclosed factors while no validated artifact exists;
  connection engine — window, transfer decomposition, slack, seeded Monte Carlo with convergence
  checks, qualitative band when distributions are unvalidated.
- **Exit gate:** `pnpm model:validate` passes; monotonicity property tests hold (more window ⇒ never
  more miss risk; more transfer time ⇒ never less); no percentage is emitted without a calibrated
  artifact.
- **Reviewer:** `release-auditor` (numbers integrity), `risk-modeling-scientist` reviews connection.

### Phase 7 — Edge API and auth
- **Owners:** `edge-api-engineer`
- **Deliverable:** the complete route surface in §14; middleware — request ID, structured logging,
  strict CORS, CSRF for cookie mutations, idempotency keys, rate limiting, Turnstile, RFC 9457
  problem responses, ETags, cache-control by privacy class; passwordless magic-link auth with
  one-time hashed tokens, no enumeration, session rotation, logout-all; admin API behind role +
  Cloudflare Access.
- **Exit gate:** Workers integration tests pass for auth, CSRF, session expiry, trip CRUD,
  idempotency, rate limits, IDOR rejection.
- **Reviewer:** `security-privacy-engineer`.

### Phase 8 — Monitoring, notifications, billing
- **Owners:** `workflows-notifications-engineer`, `billing-entitlements-engineer` (parallel)
- **Deliverable:** trip-monitoring Workflow with the §16 lifecycle; typed idempotent queue jobs with
  DLQ; cost-aware refresh policy that coalesces users on the same public flight; alert evaluation
  with HMAC fingerprint deduplication, severity escalation, resolution events, quiet hours; email +
  web-push adapters (SMS adapter present, disabled); Stripe Checkout/Portal, signature-verified
  idempotent webhooks, entitlement resolution, Trip Pass window, Family seats, reconciliation,
  billing audit.
- **Exit gate:** queue delivery + DLQ + duplicate-delivery tests pass; forged and replayed Stripe
  webhooks rejected; duplicate alert events produce exactly one delivery.
- **Reviewer:** `security-privacy-engineer` (webhooks, entitlement trust boundary).

### Phase 9 — Design system and assets
- **Owners:** `brand-design-director` → `visual-asset-director` (parallel after tokens land)
- **Deliverable:** design tokens (§7) with measured contrast, light + dark; typography scale with
  tabular numerals; motion language honouring `prefers-reduced-motion`; UI primitives; original SVG
  mark plus favicon, maskable PWA icon, Apple touch icon, OG mark, monochrome variant — all from one
  geometry; asset pipeline with compression budgets.
- **Exit gate:** every token pair used for text/UI meets WCAG 2.2 AA in both themes, verified by a
  contrast test, not by eye; mark legible at 16 px.
- **Reviewer:** `accessibility-lead`.

### Phase 10 — Frontend: public site and application
- **Owners:** `frontend-ui-engineer`, with `ux-copy-steward` (strings) in parallel
- **Deliverable:** public routes (§18.1) including homepage in the §18.3 order; flight lookup (no PNR
  field); trip cockpit; segment, connection, rights, action-checklist, evidence, source/freshness
  components; **every state in §17 implemented and reachable**; demo mode fully labelled;
  responsive behaviour per §19; PWA shell and offline saved-trip snapshot.
- **Exit gate:** `pnpm build` green; every §17 state has a rendered story/fixture; no route renders a
  placeholder; Playwright smoke of the 20 flows in §22.6 passes.
- **Reviewer:** `accessibility-lead` + `ux-copy-steward`.

### Phase 11 — SEO, content, monetization
- **Owners:** `seo-engineer`, `content-editorial-lead`, `monetization-partnerships-engineer` (parallel)
- **Deliverable:** metadata system, canonicals, robots, sitemaps, structured data limited to visible
  content, content-quality gate, `ads.txt` / `security.txt` / `llms.txt`, IndexNow; the 20 launch
  articles in §18.6 with editorial states and citations; airport/airline/route templates gated to
  `noindex` until the quality gate passes; AdSense integration with placement policy enforced in
  code, consent gating, premium suppression, affiliate registry + disclosed redirect service, all
  partners disabled until configured.
- **Exit gate:** `pnpm test:seo` passes (canonical uniqueness, title/description uniqueness, no
  private route indexable, sitemap contains only `published` + gate-passing pages); an automated
  placement test proves no ad renders in a forbidden position.
- **Reviewer:** `trust-compliance-officer`.

### Phase 12 — Quality sweep
- **Owners:** `qa-test-architect`, `accessibility-lead`, `performance-engineer`,
  `security-privacy-engineer` (parallel)
- **Deliverable:** complete unit/property/contract/integration/E2E/visual/security suites (§22);
  axe on every primary route; keyboard-only flows; 200 % zoom; performance budgets, CWV
  instrumentation, Lighthouse gates; threat model, CSP/headers, SSRF allowlist, upload safety
  (disabled by default), retention/export/deletion verification.
- **Exit gate:** the full §25 command list executed with real results; a11y 100, public performance
  ≥ 95, app performance ≥ 90.
- **Reviewer:** `release-auditor`.

### Phase 13 — Operations and documentation
- **Owners:** `platform-release-sre`, then every agent for its own doc
- **Deliverable:** CI with the §23 checks; preview and production deploy paths; migration
  application and record; structured logs, metrics, `/health` and `/readiness`; the runbook set;
  rollback commands; every document in §24 current.
- **Exit gate:** CI green on the branch; `pnpm preview` serves a production build locally;
  `pnpm smoke` passes against the local preview.
- **Reviewer:** `release-auditor`.

### Phase 14 — Audit and release gate
- **Owners:** `release-auditor`
- **Deliverable:** `docs/QUALITY_REPORT.md` — scored against the Part IV rubric, with every deduction
  itemized, evidence-linked, and assigned to an owning agent.
- **Exit gate:** ≥ 95/100 with no critical security, privacy, legal, billing, accessibility,
  licensing, or rights-engine defect. Below that, the orchestrator dispatches fixes and re-audits.
  **Loop until green or the only blocker is a named external credential.**

## 6. Cross-phase standing assignments

| Concern | Standing owner | Cadence |
| --- | --- | --- |
| Forbidden-phrase lint (legal overclaim, fake certainty) | `ux-copy-steward` | every phase touching strings |
| Source re-verification | `regulatory-source-steward` | Phase 5, and before any release |
| Ad placement conformance | `trust-compliance-officer` | Phases 11–14 |
| Bundle and CWV budgets | `performance-engineer` | Phases 10–14 |
| Invariant regression | `release-auditor` | Phases 12–14 |

---

# PART III — PRODUCT AND TECHNICAL SPECIFICATION

## 7. Brand, voice, and visual system

**Promise:** Stay ahead of flight disruptions.
**Support:** Track a flight, understand connection risk, and see the refund, care, and rebooking
rules that may apply—before airport chaos makes the decision for you.
**Trust line:** Source-linked status · Versioned passenger-rights rules · No booking code required
**Primary CTA:** Track a flight · **Secondary CTA:** Try the demo

**Voice:** calm operational intelligence. Direct, grounded, compassionate without sentimentality,
precise about uncertainty, action-oriented, plain-language, jargon-free.

Never: "Guaranteed compensation" · "Guaranteed connection" · "Your flight will be canceled" ·
"We know the airline is at fault" · "Claim now before it is too late" (unless an accurate,
source-linked official deadline is shown) · "AI-powered" as the value proposition · "best"/"most
accurate" without substantiation.

Prefer: "Here is what changed." · "Here is what may apply." · "Here is the next useful step." ·
"This assessment is based on data updated 4 minutes ago." · "The disruption cause has not been
verified." · "Your connection has 18 minutes of estimated slack." · "A cash refund may be available
if you decline the changed itinerary."

**Visual concept:** an airline operations desk translated into a calm consumer cockpit. Deep
ink/navy surfaces, cloud-white content, electric sky-blue accent, warm amber watch states,
restrained red critical states, clear green on-track states, fine route-line and radar-arc motifs,
tabular numerals, generous spacing, strong hierarchy, soft-but-not-toy radii, thin crisp borders,
motion only for state change.

**Seed tokens** (adjust only to satisfy measured contrast; never ship an unmeasured pair):

```
--ink-1000:#050b16  --ink-950:#07111f  --ink-900:#0b1728  --ink-800:#13243a
--cloud-50:#f8fbff  --cloud-100:#eef5fb --cloud-200:#dce8f2
--slate-500:#62758a --slate-700:#34465a
--sky-400:#31c5ff   --sky-500:#0ba8ea   --sky-600:#087fbd
--safe-500:#168f6a  --watch-500:#d99014 --critical-500:#d9485f --unknown-500:#738197
```

**Typography:** a legally distributable web font (Geist or Inter) via package or privacy-respecting
self-hosted build, with robust system fallbacks and tabular numerals for times, flight numbers, and
countdowns. **Logo:** original SVG combining a directional route line, a subtle radar arc, and a
forward-motion cue — never a copied wing, airport glyph, or clip-art plane.

**Accessibility floor:** WCAG 2.2 AA. Full keyboard operation, visible focus, semantic landmarks,
labelled forms, accessible error summaries, `aria-live` only for meaningful changes, reduced motion,
never colour alone, minimum touch targets, screen-reader-sane itinerary order, accessible chart and
route-diagram text equivalents, labelled icon-only buttons, correct dialog focus trap/restore, no
auto-advancing carousel, no canvas-only visualization.

## 8. Users and jobs

Traveler checking before leaving home · connecting passenger watching risk · self-transfer traveler ·
family member monitoring someone else · disrupted passenger choosing travel vs rebooking vs refund ·
traveler organizing evidence · frequent traveler wanting persistent monitoring · research visitor
landing on a rights guide.

Jobs: *Tell me what is happening · how reliable it is · what may happen next · what to do now · what
rights may apply · help me preserve evidence without legal promises · alert me only when something
meaningful changes.*

## 9. Scope

**In scope for launch:** flight lookup, demo mode, itinerary builder, multi-segment trips,
through-ticket vs self-transfer, provider abstraction, normalized timeline, delay/cancellation
assessment, connection assessment, weather factors, US/EU/UK/CA rights, verified airline voluntary
commitments, action checklist, passwordless accounts, anonymous use, saved trips, email + web push,
Trip Pass, Plus, Family (functional shared-trip invitations), billing portal, expense metadata,
printable evidence packet, public SEO pages, advertising, affiliates, admin console, provider-health
dashboard, observability, tests, deployment docs, fixtures.

**Explicitly out of scope (architect extension points, keep disabled):** airline account login,
automatic PNR import, automatic rebooking, ticket sales, claim submission, legal representation,
contingency-fee services, passport storage, government travel authorization, turn-by-turn airport
navigation, crowdsourced security-line times presented as authoritative, unlicensed scraping,
public indexing of live flight-instance pages, gambling/speculative travel products, automatic
purchase of hotels/cars/insurance/flights.

## 10. Business model

Plans are **data-driven entitlements**. No plan string or price literal in a component.

| Plan | Default display price | Entitlements |
| --- | --- | --- |
| Free | — | Anonymous lookup, basic timeline, basic assessment, source-linked rights estimate, 1 active saved trip after signup, limited email alerts, ads on eligible surfaces, no card required |
| Trip Pass | `$19 one time` | 1 monitored itinerary, monitoring from purchase → 30 days after final scheduled arrival (configurable), email + push, full connection and rights detail, evidence timeline, printable packet, ad-free for that trip, no auto-renewal |
| Plus | `$6.99/month` or `$49/year` | 5 active trips, 12 months history, email + push, multiple saved travelers (no identity documents), risk-factor history, evidence packets, saved preferences, ad-free authenticated experience, member discounts only when real and contracted |
| Family | `$79/year` | 6 members, shared monitoring, 10 active trips, per-traveler quiet hours and preferences, shared emergency contact notes (no medical or government ID), ad-free |
| Professional | not marketed at launch | Interfaces only: team dashboard, API access, travel-manager workflows, batch monitoring, SLA reporting |

**Billing rules:** Stripe Checkout + Customer Portal + signature-verified webhooks; Price IDs in
config or plan records; idempotent event processing; verify signatures against the raw body;
scheduled reconciliation; cancel-at-period-end; immediate entitlement removal on qualifying refunds;
never trust a client-supplied plan; complete audit without card data; graceful "billing not
configured" demo state; purchase controls hidden in production when Stripe config is incomplete;
test clocks or test-mode fixtures in automated billing tests.

## 11. Platform architecture

**Stack** (pin current stable, mutually compatible versions verified at execution time): pnpm
workspaces · TypeScript strict · Astro for pre-rendered SEO-first pages · React islands for
interactive tools and the authenticated app · custom design tokens with Tailwind or equivalent ·
headless primitives only where they materially improve behaviour · Cloudflare Worker for APIs ·
Workers Static Assets · Hono or an equivalently small typed router · Zod · D1 · KV · Queues + DLQ ·
Workflows · optional R2 (disabled) · Turnstile · Stripe · provider abstraction · Vitest + Workers
test pool · Playwright · axe-core · fast-check.

Do not add a large framework, state library, charting library, map SDK, or design system out of
familiarity.

**Repository layout:** as in `docs/agents/ROSTER.md §3` — `apps/{web,edge}`, `packages/{contracts,
domain,providers,risk-engine,rights-engine,connection-engine,notifications,billing,observability,
ui}`, `ml/`, `data/`, `migrations/`, `scripts/`, `docs/`, `.github/`.

**Deployment shape:** static assets from `apps/web` served via the `ASSETS` binding; the Worker
serves `/api/*`, `/auth/*`, `/webhooks/*`, and protected app behaviour; selective `run_worker_first`
patterns rather than fronting every asset; public pages cacheable at the edge; authenticated
responses never in a shared cache; `ctx.waitUntil()` for bounded post-response work; durable or
retryable work on Queues/Workflows; bindings instead of the Cloudflare REST API; structured
observability with a deliberate sampling rate; committed non-secret binding types; valid
`wrangler.jsonc`; ordered, source-controlled migrations.

**Bindings — required:** `DB` (D1), `CACHE` (KV), `ALERT_QUEUE`, `ALERT_QUEUE_DLQ`,
`TRIP_MONITOR_WORKFLOW`, `ASSETS`, `RATE_LIMITER` (if supported), `TURNSTILE_SECRET_KEY`,
`TURNSTILE_SITE_KEY`, `ENCRYPTION_PRIMARY_KEY`, `HMAC_IDENTIFIER_KEY`, `SESSION_SIGNING_KEY`.
**Conditional:** `DOCUMENTS` (R2, off), `ANALYTICS`, `AI` (never for legal or safety determinations),
`EMAIL_PROVIDER_*`, `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`, `SMS_PROVIDER_*` (off),
`STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`/Price IDs, flight-provider credentials, CMP identifiers,
ad slot IDs, affiliate IDs.

**Resource roles:** D1 is the system of record (accounts, trips, segments, assessments, rules,
entitlements, billing, audit). KV holds expiring provider responses, idempotency markers, public
reference caches, feature snapshots, rate-limit support — never the truth for billing or rights
versions. Queues run refresh, notification, review-reminder, and analytics fan-out. Workflows
coordinate monitored-trip lifecycles. R2 holds only approved bounded file types when uploads are
explicitly enabled. Analytics receives no direct personal identifiers.

## 12. Domain model (D1)

Opaque UUIDs from Web Crypto. Instants stored UTC. Airport IANA zones stored separately. Every
mutable table carries `created_at`/`updated_at`; user-owned records support deletion and retention.

**Identity:** `users` (email HMAC + encrypted email — never plaintext in an index, locale, home zone,
account state, terms/privacy versions accepted, deletion-requested), `magic_links` (hashed one-time
token, purpose, expiry, consumed, request fingerprint), `sessions` (hashed token, expiry, last seen,
hashed UA family, coarse network fingerprint where lawful, revoked), `family_memberships` (role,
invitation state + hashed token, unique active membership), `admin_roles`.

**Trips:** `trips` (owner nullable only for short-lived anonymous state, status, endpoints, UTC
bounds, booking topology ∈ {`through_ticket`,`self_transfer`,`mixed`,`unknown`}, monitoring state and
window, entitlement snapshot, encrypted private note, anonymous expiry, soft delete),
`trip_members` (owner/editor/viewer, notification preference, unique membership),
`trip_segments` (ordered sequence, marketing + operating carrier, flight number, provider canonical
id, origin-local service date, IATA/ICAO + IANA zones for both endpoints, scheduled gate
departure/arrival, current estimated/actual, terminal/gate with source attribution, status, ticket
group id that reveals no PNR, self-transfer flag, bag-recheck requirement, mobility buffer, last
refresh, deleted).

**Operational:** `flight_instances` (canonical + provider namespace/id, carriers, number, endpoints,
service date, schedule, equipment where licensed, codeshare group, first/last seen, licence key),
`flight_status_snapshots` (append-only; provider event id, observed-at and provider-generated-at,
normalized status, scheduled/estimated/actual, terminal/gate/carousel, licensed delay codes,
diversion, cancellation, raw checksum, raw payload only where the licence permits, freshness and
confidence, unique idempotency constraint).

**Context:** `weather_snapshots` (station, product, issued/observed, normalized visibility, ceiling,
wind, gust, phenomena, flight category, source URL + checksum, parser version, expiry),
`nas_events` (source event id, airport/region, type, window, severity, source, last verified, status).

**Assessment:** `model_versions` (semver, target, horizon, training window, feature schema version,
calibration method, validation metrics, artifact checksum, active, approved, model-card path),
`disruption_predictions` (segment, model or heuristic version, horizon, bands or calibrated
probabilities, cancellation probability, delay quantiles, confidence, feature snapshot checksum, top
factors, freshness, status ∈ {calibrated, heuristic, unavailable}),
`connection_assessments` (inbound/outbound segments, connection type, window, transfer distribution,
slack, miss probability only if calibrated, heuristic band otherwise, confidence, assumptions,
source and model versions).

**Rights and evidence:** `source_registry` (authority, jurisdiction, canonical URL, type, published/
effective date, last verified, next review due, checksum/ETag, status, notes),
`rights_rule_sets` (jurisdiction, version, status, effective from/to, source ids, reviewer, approved,
checksum), `rights_rules` (structured coverage/timing/distance/cause/notice/airline-size predicates,
outcome type, amount + currency or care entitlement, reduction rules, required evidence, explanation
template, priority — **never executable strings**), `rights_assessments` (immutable: event facts,
rule-set version, coverage result, per-right status, amount range, assumptions, missing inputs,
source ids, disclaimer version), `expenses`, `documents` (only when uploads enabled),
`claim_packets` (factual packet — never a legal demand letter).

**Alerts:** `alert_subscriptions` (channels, severity threshold, quiet hours, zone, entitlement
snapshot), `alert_events` (canonical fingerprint, old/new state, severity, source, dedupe window,
escalation parent), `notification_deliveries` (channel, template version, provider message id,
attempts, status, error category, next retry, timestamps where lawful, payload checksum — never
plaintext sensitive content).

**Commerce and platform:** `plans`, `plan_capabilities`, `entitlements`, `subscriptions`,
`one_time_purchases`, `stripe_events` (unique event id), `billing_audit_events`, `provider_health`,
`provider_request_ledger`, `idempotency_keys`, `feature_flags`, `content_entries`, `content_sources`,
`consent_events`, `audit_events`, `deletion_jobs`, `export_jobs`.

## 13. Algorithms

All formulas live in pure, tested packages with documented units, input validation, and property
tests.

**Great-circle distance** — Haversine, `R = 6371.0088 km`, clamp `a` to `[0,1]`, validate lat/lon,
return kilometres. Test same-point, near-antipodal, date-line, short-haul, known airport pairs. Use
for rights bands only where the governing rule calls for great-circle distance.

**Delays** — `departureDelayMinutes = (actualOrEstimatedDeparture − scheduledDeparture)/60000`;
`arrivalDelayMinutes` likewise. Actual when final, estimated only when labelled. Preserve the
distinction between segment delay and journey (final-destination) delay.

**Smoothed historical rates** — Beta-Binomial posterior mean `p̂ = (k+α)/(n+α+β)`, hyperparameters
by empirical Bayes when data supports it. Never pick a confident prior for cosmetic stability.
Display sample sufficiency; suppress or widen for small cohorts.

**Disruption models** — regularized logistic `p = σ(β₀ + Σβⱼxⱼ)` with explicit missing-value
handling, horizon-specific training, time-based holdouts, and airport/route/carrier group tests for
memorization. No post-event leakage. Coefficients are not causal conclusions. A compact logistic or
GAM is preferred for launch; a tree model ships only if efficiently servable, honestly explainable,
and calibrated.

**Delay distribution** — validated quantiles (median, p80, p90). No expected-minutes value without
measured calibration and an error summary.

**Calibration** — Platt or isotonic on a split separate from final evaluation. Report Brier,
ECE `Σ (|Bₘ|/N)·|acc(Bₘ) − conf(Bₘ)|`, ROC AUC, PR AUC, log loss, calibration slope/intercept,
confusion matrices at operational thresholds, and performance sliced by airport size, carrier, route
frequency, season, and horizon. "Calibrated" requires passing a pre-declared gate.

**Freshness weight** — `w = exp(−ln2 · a/h)` with matching units. Never use it to hide staleness;
always show the timestamp and stale state.

**Confidence** — separate from risk. `C = 100·clip(w_c·c + w_f·f + w_a·a + w_m·m + w_s·s, 0, 1)`
over coverage, freshness, provider agreement, model support, and sample sufficiency, with documented
weights summing to 1. Display Low/Medium/High. Never call it a statistical confidence interval.

**Connection** — window `W = t_gateClose − t_gateIn`; if the airline's gate-close rule is unknown,
estimate from scheduled departure minus a configurable, clearly labelled buffer and never present
the estimate as policy. Transfer
`T = T_deplane + T_walk + T_security + T_immigration + T_bag + T_mobility + T_uncertainty`;
slack `S = W − T`. Show each component and whether it is measured, policy-derived, airport-derived,
or estimated.

**Misconnection probability** — only with validated distributions: `P_miss = P(D + T > W)`, Monte
Carlo `p̂ = (1/N)·Σ 1(Dᵢ + Tᵢ > W)` with seeded sampling in tests, sufficient samples for the
displayed precision, convergence and sensitivity checks, and documented correlation assumptions.
Without validated distributions, show available time, required time, slack, a qualitative band, and
the assumptions — no percentage. A self-transfer is never "protected" merely because it looks
feasible.

**Action urgency** — keep event probabilities distinct; never collapse into one opaque score. An
internal ranking may use `U = p_cancel·c_cancel + p_miss·c_miss + p_delay60·c_delay` with normalized
operational-impact weights. Used to order actions only; never displayed as a probability.

**Alert fingerprint** —
`F = HMAC_K(userId ‖ tripId ‖ segmentId ‖ eventType ‖ normalizedNewState ‖ timeBucket)` via Web
Crypto HMAC-SHA-256. No resend inside the dedupe window; immediate escalation on rising severity;
resolution event when a critical state clears; suppress sub-threshold estimate churn; respect quiet
hours except for user-selected critical alerts; no plaintext sensitive payload in the fingerprint.

**Provider agreement** — compare normalized fields, never blindly average incompatible timestamps.
On conflict: show the newest high-quality source, expose the conflict, lower confidence, retain both
snapshots, and never invent an undocumented tie-breaker.

## 14. API surface

Version under `/api/v1`. Shared runtime schemas. RFC 9457-compatible problem responses with a stable
code, human-safe message, request id, retryability, and field errors — never a secret or stack
trace. Request ids, structured logs, strict CORS, CSRF on cookie-authenticated mutations, idempotency
keys on payment/trip/alert mutations, ETags where useful, privacy-correct cache headers, rate-limit
headers where supported, and **no personally identifying fields in URLs**.

```
GET    /api/v1/health                         GET    /api/v1/readiness
GET    /api/v1/config/public                  GET    /api/v1/providers/status
GET    /api/v1/airports/search                GET    /api/v1/airlines/search
POST   /api/v1/flights/resolve                GET    /api/v1/flights/:flightId/status
GET    /api/v1/flights/:flightId/timeline     POST   /api/v1/connections/assess
POST   /api/v1/rights/assess                  POST   /api/v1/demo/reset

POST   /api/v1/trips                          GET    /api/v1/trips
GET    /api/v1/trips/:tripId                  PATCH  /api/v1/trips/:tripId
DELETE /api/v1/trips/:tripId
POST   /api/v1/trips/:tripId/segments
PATCH  /api/v1/trips/:tripId/segments/:segmentId
DELETE /api/v1/trips/:tripId/segments/:segmentId
POST   /api/v1/trips/:tripId/refresh          GET    /api/v1/trips/:tripId/timeline
GET    /api/v1/trips/:tripId/assessment
POST   /api/v1/trips/:tripId/monitoring       DELETE /api/v1/trips/:tripId/monitoring
POST   /api/v1/trips/:tripId/invitations      POST   /api/v1/trips/:tripId/expenses
GET    /api/v1/trips/:tripId/claim-packet     POST   /api/v1/trips/:tripId/claim-packet

POST   /auth/magic-link/request               POST   /auth/magic-link/consume
POST   /auth/logout
GET    /api/v1/me                             PATCH  /api/v1/me
GET    /api/v1/me/sessions                    DELETE /api/v1/me/sessions/:sessionId
GET    /api/v1/me/export                      POST   /api/v1/me/export
POST   /api/v1/me/delete

POST   /api/v1/billing/checkout/trip-pass     POST   /api/v1/billing/checkout/subscription
POST   /api/v1/billing/portal                 GET    /api/v1/billing/status
POST   /webhooks/stripe                       POST   /webhooks/flight/:provider
```

Flight webhooks use provider-specific signature verification and replay protection. There is no
generic unauthenticated ingestion endpoint. Admin APIs sit behind Cloudflare Access **and** an
application admin role, expose no secret values, require confirmation for destructive actions, audit
every mutation, and offer neither impersonation nor an arbitrary SQL console.

## 15. Rights engine

Deterministic, versioned, source-linked, and fully independent of the predictive model.

**Inputs:** event date · origin/destination · operating and marketing carrier · carrier regulatory
status · journey topology · scheduled and actual/estimated times · event type (delay, cancellation,
denied boarding, downgrade) · notice timing · passenger's travel choice · disruption cause and its
source · airline size · replacement itinerary · distance · expenses · single-reservation flag.

**Outputs:** jurisdiction coverage · possible refund · possible rebooking · possible duty of care ·
possible compensation · required conditions · missing facts · official source links · rule-set
version · disclaimer version. Statuses: `likely_applies`, `may_apply`, `not_indicated`,
`cannot_determine`, `future_rule_not_active`.

**15.1 United States.** Model as five separate layers: statutory/regulatory refund rules; airline
voluntary dashboard commitments; denied-boarding rules; enforcement discretion; contract-of-carriage
terms (only from a reviewed source). Refund logic covers cancellation, significant schedule change,
significant delay, the passenger declining the changed itinerary/credit/voucher, refund timing and
method where verified, domestic vs international thresholds, changed endpoints, added connections,
cabin downgrade, accessibility accommodation changes, and the July 2026 enforcement discretion for
flight-number-only changes. **Never state a general US federal cash-compensation right for ordinary
delays or cancellations.** Meals, hotels, ground transport, and rebooking may be voluntary and
controllable-disruption-specific.

**15.2 European Union.** Apply currently effective EC 261 until the reform's verified effective date.
Coverage distinguishes intra-EU, EU-departing, EU-arriving on an EU carrier, single-reservation
multi-segment journeys, non-EU carrier limits, and final-destination delay. Compensation bands —
subject to every condition and extraordinary-circumstance analysis — are €250 / €400 / €600, with
correct distance and delay thresholds and the possible 50 % rerouting reduction. Model care at
departure, reimbursement after long delay, cancellation choices, denied boarding, final-arrival
delay, missed protected connection, extraordinary circumstances, and notice periods separately.
Ship a public "current rules vs adopted reform" timeline that never applies the future rule early.

**15.3 United Kingdom.** UK261 per current CAA guidance: scope by origin/destination/carrier, care
thresholds, refund choice after a qualifying long delay, cancellation, protected missed connections,
extraordinary circumstances, and fixed bands — £220 under 1,500 km; £350 for 1,500–3,500 km;
£260 or £520 for longer flights depending on arrival delay. Verify before activation. A separate-
ticket self-transfer is never a protected through journey.

**15.4 Canada.** APPR: within airline control · within control but required for safety · outside
control; large vs small airline; notice timing; arrival delay; rebooking vs refund; claim deadline.
Qualifying within-control, non-safety bands — large airline CAD 400 (3–6 h) / 700 (6–9 h) /
1,000 (9 h+); small airline CAD 125 / 250 / 500. Verify airline-size classification from the official
source. Do not activate proposed reforms before they are in force.

**15.5 Montreal Convention / baggage.** Informational, source-linked, only if implementable
accurately: current SDR limits, effective dates, the role of facts and limitation periods. Never
convert SDR into a guaranteed local-currency payout, never determine eligibility, never mix baggage
liability with EC261/UK261/APPR fixed compensation.

**Cause handling.** Represent airline-stated, provider-stated, observed weather/NAS context,
user-reported, and verified authority findings as distinct fields. Never silently convert context
into legal cause. When cause is unknown, name which outcomes depend on it and request the airline's
written explanation.

**15.6 Golden test matrix** (no rights change merges without all of it passing): cancellation with
refund choice · accepted rebooking · domestic significant change · international significant change ·
flight-number-only change during DOT enforcement discretion · EU 1,499 km vs 1,501 km · EU final-
destination protected connection · EU separate-ticket connection · UK 3–4 h long-haul · UK > 4 h
long-haul · Canadian large vs small airline · Canadian safety-related vs within-control · unknown
cause · extraordinary circumstances · rule effective-date boundary · superseded rule ·
adopted-not-effective rule · event crossing midnight · date-line itinerary.

## 16. Monitoring, notifications

**Lifecycle checkpoints** (cost-adjusted): trip saved (resolve segments) · T−72 h schedule/major
change · T−24 h schedule + weather + status · T−6 h increased monitoring · T−2 h active departure
monitoring · boarding/departure window (provider push or bounded polling) · in flight (arrival +
connection) · post-arrival chronology finalization · T+24 h reconciliation · T+30 d retention and
entitlement handling.

**Refresh policy:** slow far out, faster only near a relevant event, stop on finalized segments,
back off on provider errors, **coalesce all users following the same public flight into one provider
refresh** then fan out normalized events, respect provider TTL and call budgets, keep user-specific
actions separate from public refresh state.

**Queue jobs** (typed, idempotent, schema-validated, retry-aware, observable, DLQ-capable,
duplicate-safe): `flight.refresh`, `flight.reconcile`, `trip.reassess`, `rights.reassess`,
`alert.evaluate`, `notification.email`, `notification.push`, `notification.sms`, `billing.reconcile`,
`source.review_due`, `privacy.delete`, `privacy.export`, `document.scan`.

**Severity:** `info` (schedule/gate detail) · `watch` (meaningful delay or shrinking slack) ·
`urgent` (cancellation, diversion, likely misconnection, major schedule change, time-sensitive
rights/action change) · `resolved`.

Every notification includes flight + date, what changed, source freshness, the next useful action,
a deep link, and uncertainty where relevant. None includes a booking reference, a full email
address, payment information, receipt contents, legal guarantees, or alarming language unsupported
by data. Per-channel opt-in, quiet hours in the user's zone, urgent override only by explicit
permission, one-click marketing unsubscribe separate from operational messages, family-member
permissions, bounce and complaint suppression.

## 17. UI state matrix (all implemented, all tested)

**Flight data:** initial · searching · multiple matches · no match · invalid flight · scheduled ·
delayed · canceled · diverted · returned · departed · landed · stale · provider unavailable ·
rate limited · demo · partial data · conflicting providers.
**Trip:** anonymous · saved · monitoring pending/active/paused/completed · entitlement expired ·
shared read-only · shared editable · deleted.
**Connection:** none · protected · self-transfer · mixed ticket · unknown topology · ample slack ·
watch · high risk · likely missed · already missed · insufficient data.
**Rights:** covered · possibly covered · not covered · cause unknown · notice unknown · future rule ·
stale rule review · official source unavailable · assessment changed after new facts.
**Billing:** free · Trip Pass available · checkout · purchased · subscription active · payment
failed · canceled at period end · expired · refunded · Stripe unavailable · billing not configured.
**Notifications:** permission prompt · denied · email unverified · push enabled · quiet hours ·
delivery failure · suppressed duplicate · escalation · resolved.
**General:** offline · slow network · unsupported browser · empty · skeleton · error boundary ·
maintenance · consent required · ad blocked · affiliate unavailable.

## 18. Frontend

**18.1 Public routes:** `/` `/flight-status/` `/delay-risk/` `/connection-risk/`
`/passenger-rights/{,us,eu,uk,canada}/` `/airlines/{,[slug]}` `/airports/{,[slug]}`
`/routes/{,[origin]-[destination]}` `/guides/{,[slug]}` `/methodology/` `/data-sources/` `/pricing/`
`/about/` `/editorial-policy/` `/privacy/` `/terms/` `/affiliate-disclosure/` `/advertising-policy/`
`/contact/` `/status/`.

**18.2 Private routes** (all `noindex`): `/app/`, `/app/trips/`, `/app/trips/[tripId]/`,
`/app/alerts/`, `/app/family/`, `/app/billing/`, `/app/settings/`, `/auth/`, `/checkout/`, `/admin/`.

**18.3 Homepage order:** compact header → hero with primary lookup → trust line and source/freshness
explanation → interactive demo result → "What DelayPilot tells you" → connection-risk explainer →
passenger-rights explainer → monitoring/alert demonstration → pricing cards → source and methodology
strip → selected guides → restrained affiliate module → footer. **No ad above or inside the primary
search form.**

**18.4 Flight lookup:** airline name/code + flight number + date + optional endpoint disambiguation;
alternate route+date+approximate-time mode; keyboard-friendly comboboxes, visible examples, inline
validation, no forced account, **no PNR field**, loading skeleton, candidate chooser, route
confirmation, demo shortcut, provider-unavailable and stale states.

**18.5 Trip cockpit:** title/date/travelers/monitoring state → overall status → horizontal itinerary
(desktop) / vertical timeline (mobile) → segment cards → latest meaningful change → next-best-action
card → delay/cancellation assessment → connection assessment → weather and airspace factors →
rights estimate → evidence and receipt organizer → alert settings → source/freshness panel →
upgrade prompt only after value is shown → at most one eligible free-user ad, only after the
complete action area.

**Segment card:** airline + flight, endpoints, scheduled vs current times with zone labels, status,
gate/terminal when available, delay, provider source, last updated, confidence, expandable
operational detail.

**Connection cockpit:** protected/self-transfer badge, inbound gate-in estimate, next gate-close
estimate, available minutes, estimated required minutes, slack, transfer components, band or
validated probability, assumptions, missing data, actions. Self-transfer prominently explains
baggage, immigration, and recheck risk. **No speedometer implying false precision.**

**Rights card:** jurisdiction · rule-set date/version · "What may apply" · "What we still need to
know" · refund · rebooking · care · compensation · deadline · evidence checklist · official source
links · current-vs-future rule notice · disclaimer. Answer-first, with expandable reasoning.

**Action checklist:** prioritized by time and reversibility; jurisdiction-aware; source-linked.
Never link a commercial affiliate as the primary route to a statutory right.

**Evidence packet:** print-optimized, factual — trip and segment summary, original schedule,
status-change chronology, user-entered airline messages, receipts/expense table, rights assessment
with source version, missing evidence, official source URLs, disclaimer. Save-as-PDF via print,
JSON/CSV export where useful, regenerate after edits. **Never auto-emailed or auto-submitted.**

**18.6 Launch editorial set** (20 articles): flight cancelled — what to do · US automatic refund
rules · controllable vs uncontrollable US disruption · voluntary commitments vs legal rights · EU
rights under the current rule · the 2026 EU reform timeline (adopted vs effective) · UK261 delay and
cancellation · Canada APPR delay and cancellation · missed connection on one ticket · self-transfer
risk · saving receipts and evidence · what an FAA ground stop means · METAR/TAF terms · minimum
connection time vs a realistic connection · when a schedule change may qualify for a refund · how
DelayPilot estimates disruption risk · how it estimates connection risk · data freshness and
provider limits · family monitoring without sharing a password · travel-insurance timing and
pre-existing-disruption caution.

Editorial workflow: draft → source review → legal/factual review → publishable → published →
review due → stale. **Only `published` enters the sitemap.**

**18.7 Responsive rules.** *Mobile:* primary lookup visible without scrolling past marketing;
vertical itinerary; sticky bottom bar only when it covers nothing; no dense two-column cards;
legible times and codes; drawers instead of side panels; connection action above monetization;
44×44 px minimum targets. *Tablet:* two-column results where appropriate; single logical form
reading order. *Desktop:* bounded readable width; 12-column cockpit with 8 columns for
action/itinerary and 4 for source/alerts/secondary; hierarchy and whitespace over a wall of equal
cards.

## 19. SEO and content

Earn traffic through utility, first-party explanation, transparent methodology, and source-backed
current guidance. **No doorway pages** and no page families differing only by an airport or airline
token. Every indexable page needs a distinct intent, an answer-first introduction, meaningful
original content, a working utility or real data, source attribution, a reviewed date, a canonical
URL, unique title and description, internal links, no placeholders, and no invented statistics.

Deliver: title templates, descriptions, canonicals, Open Graph, Twitter cards, theme colour, icons,
manifest, hreflang **only if translations truly exist**, robots directives, sitemap index and
children, optional regulatory-update feed, Search Console and Bing verification placeholders,
IndexNow key support, `robots.txt`, `sitemap.xml`, `ads.txt`, `security.txt`, `humans.txt`, optional
accurate `llms.txt`. **Production builds fail if `PUBLIC_SITE_URL` is missing or still an example.**

Structured data only where visible content supports it: `Organization`, `WebSite`, `WebApplication`/
`SoftwareApplication` (`applicationCategory: TravelApplication`), `BreadcrumbList`, `Article`,
`FAQPage` for visible FAQs, `ItemList` for meaningful lists. Never fake ratings, reviews, prices,
user counts, awards, or availability.

**Content-quality gate** (build-time): minimum original word count by page type · required source
references · unique title/description/introduction · no placeholder tokens · no duplicate canonical ·
data freshness · indexable flag · editorial status · no private data · no unlicensed live data.
Failing pages are `noindex` and excluded from the sitemap.

Airport, airline, and route pages ship as templates with data contracts, and stay `noindex` until
they carry real, current, source-backed content. Airline pages carry no unauthorized logo. Route
pages carry no live fare scraping.

## 20. Monetization surfaces

**AdSense publisher:** `ca-pub-9029421562757873`.
**`ads.txt`:** `google.com, pub-9029421562757873, DIRECT, f08c47fec0942fa0`.
Slot IDs live in configuration; unfilled manual slots collapse without leaving holes.

**Permitted placements:** homepage after the complete demo and first explanatory section · guide
mid-article after substantial content · guide end · airport/airline page after the main answer ·
free trip result only after the complete action checklist, with strong separation.
**Forbidden:** above the primary search · inside forms · between a warning and its action · inside a
rights card · adjacent to "Contact airline"/"Request refund"/"Save evidence" · on auth, checkout,
account, admin, privacy, terms, error, or status pages · on any paid authenticated experience.

Ads reserve dimensions, are labelled, never timer-refresh, never refresh on background polling, load
only after required consent, and are disabled in local/test/screenshot/demo-review modes. Itinerary
details never reach ad targeting.

**Affiliate categories** (all disabled until a real agreement and URL exist): eSIM · airport lounges ·
nearby hotels · rental cars · ground transport · luggage trackers · travel accessories · travel
insurance · replacement travel search · travel credit cards (only after compliance approval).
Every link `rel="sponsored nofollow"`, every module disclosed, clicks tracked without itinerary
detail, redirects through a validated allowlist, merchant identity never cloaked, never implied
official, never ranked purely by commission without disclosure. No travel-insurance link presented
as covering a disruption already underway; no credit-card promotion in a crisis action card.

> Partner link · DelayPilot may earn a commission if you purchase. This does not change our
> operational or passenger-rights assessment.

## 21. Analytics, observability, admin

**Analytics** — privacy-minimized events: page viewed · flight search started · flight resolved ·
demo used · trip saved · connection assessed · rights assessed · alert enabled · Trip Pass checkout
started · Trip Pass purchased · subscription started · claim packet generated · affiliate module
viewed · affiliate link clicked · eligible ad slot viewable · provider failure · notification
delivered. **Never** email, name, PNR, exact itinerary, receipt text, claim content, raw IP, or
provider secrets. Data dictionary in `docs/ANALYTICS.md`. Feature flags, not an A/B framework, at
launch.

**Logs** (JSON): timestamp, severity, event, request id, route, method, status, duration, provider,
cache outcome, queue/workflow id, error category, deployment version — never personal content.

**Metrics:** API latency and error rate · provider success/latency/cost units · cache hit rate ·
stale serves · queue lag · DLQ depth · workflow failures · notification success · model availability ·
rights-rule freshness · billing webhook failures · auth abuse · Turnstile failures · content review
due · Core Web Vitals.

**Health:** `/api/v1/health` is liveness only. `/api/v1/readiness` checks bindings, migration status,
selected provider policy, queue/workflow configuration, encryption key version, in-force rule sets,
and Stripe/email readiness when enabled — with detail protected in production.

**Runbooks:** provider outage · incorrect flight status · rights-rule correction · compromised
provider key · Stripe webhook backlog · queue DLQ · stuck workflow · notification incident · privacy
deletion failure · suspected account takeover · accidental data logging · bad deployment rollback ·
model rollback · ad-policy issue · affiliate redirect issue.

**Admin console modules:** overview · provider health · provider cost ledger · queue/workflow health ·
notification failures · rights-source review · rule-set diff and publication · content review ·
affiliate registry · ad configuration · plan/entitlement mapping · feature flags · privacy jobs ·
audit log · model registry and drift · demo-fixture management.

## 22. Testing

**Unit:** every formula · date/time conversion · Haversine · distance bands · delay arithmetic ·
smoothing · calibration metrics · connection slack · Monte Carlo determinism · confidence · alert
fingerprints · state transitions · entitlements · encryption envelopes · rule predicates · source
version selection · provider normalization · content-quality gate.

**Property:** Haversine symmetric, non-negative, ~0 at a point · a rule set outside its effective
period can never activate · a future rule can never apply to an earlier event · more connection
window never increases miss risk · more transfer time never decreases it · probabilities stay in
`[0,1]` · confidence stays in `[0,100]` · duplicate alert events yield one delivery · encryption
round-trips and detects tampering · user A cannot access user B's trip.

**Provider contract:** codeshare · no result · multiple candidates · cancellation · diversion · gate
change · delayed estimate · weather 204 · malformed payload · timeout · 429 · 500 · stale fallback ·
licence rejection.

**Rights golden:** the complete §15.6 matrix plus official examples.

**Integration (Workers pool):** D1 migrations · repositories · auth · CSRF · session expiry · trip
CRUD · monitoring workflow · queue delivery · DLQ · Stripe webhook · provider webhook · deletion and
export · entitlements · admin authorization.

**E2E (Playwright), 20 flows:** anonymous lookup · demo itinerary · account creation · save trip ·
add connection · mark self-transfer · view rights · enable email alert · push permission accept or
graceful reject · purchase test Trip Pass · open billing portal · generate evidence packet · invite
family member · delete trip · export account · request deletion · admin source review · mobile
navigation · offline saved trip · provider outage.

**Accessibility:** axe on every primary route · keyboard-only flows · screen-reader names · focus
order · dialogs · live regions · error handling · reduced motion · 200 % zoom · high contrast ·
mobile touch targets.

**Visual regression:** 375 / 768 / 1024 / 1440 px, light and dark, every major state.

**Security:** IDOR · CSRF · XSS · SQL injection · rate limit · enumeration · magic-link replay ·
expired token · forged webhook · duplicate webhook · redirect allowlist · upload rejection · cache
leak · CSP · secret scan.

**Performance:** bundle budgets · public Lighthouse ≥ 95/100/100/100 · app Lighthouse ≥ 90 with a11y
100 · API load smoke · provider coalescing · queue burst · D1 query plans · no N+1 trip loading ·
zero ad and font CLS. Targets: LCP < 2.5 s p75, INP < 200 ms, CLS < 0.1.

## 23. CI/CD

Required checks, in order: frozen-lockfile install · format · lint · typecheck · unit · property ·
Workers integration · web build · edge build · migration validation · rights-rule validation ·
content-quality gate · SEO validation · accessibility smoke · Playwright · bundle budgets ·
dependency audit · secret scan.

Deployment: preview per PR where credentials permit · production only from the protected branch ·
safe ordered D1 migrations with a migration record · Worker and assets deployed together · smoke
tests · verification of canonical URL, robots, sitemap, `ads.txt`, health, app, and API · documented
rollback. Never force-push a shared branch. Never deploy secrets from a forked PR.

## 24. Documentation set

`README.md` · `AGENTS.md` · `DIRECTIVE.md` · `docs/BUILD_PLAN.md` · `docs/agents/ROSTER.md` ·
`docs/ARCHITECTURE.md` · `docs/DATA_MODEL.md` · `docs/API.md` · `docs/DATA_SOURCES.md` ·
`docs/PROVIDER_LICENSING.md` · `docs/RIGHTS_ENGINE.md` · `docs/RIGHTS_SOURCE_REVIEW.md` ·
`docs/CONNECTION_ENGINE.md` · `docs/MODEL_CARD.md` · `docs/MODEL_TRAINING.md` · `docs/PRIVACY.md` ·
`docs/SECURITY.md` · `docs/THREAT_MODEL.md` · `docs/MONETIZATION.md` · `docs/ADVERTISING.md` ·
`docs/AFFILIATES.md` · `docs/SEO.md` · `docs/EDITORIAL_POLICY.md` · `docs/ANALYTICS.md` ·
`docs/ACCESSIBILITY.md` · `docs/PERFORMANCE.md` · `docs/DEPLOYMENT.md` · `docs/RUNBOOK.md` ·
`docs/QUALITY_REPORT.md` · `docs/decisions/*.md` · `.env.example`.

The README quickstart must work from a clean clone and document: install · local D1 · migrations ·
seeds · fixture mode · local Worker · web dev · tests · model training · Stripe CLI · queue testing ·
Workflow testing · production secrets · deploy · rollback.

## 25. Verification commands

```
pnpm install --frozen-lockfile   pnpm format:check   pnpm lint        pnpm typecheck
pnpm test                        pnpm test:workers   pnpm test:e2e    pnpm test:a11y
pnpm test:seo                    pnpm test:security  pnpm build       pnpm quality
pnpm dev                         pnpm preview        pnpm smoke       pnpm deploy
pnpm db:migrate:local            pnpm db:seed:local  pnpm db:migrate:remote
pnpm model:validate
```

**No command may be reported as passing unless it was executed and passed** (`AGENTS.md §6`).

## 26. Required disclaimers, placed near the relevant result — not only in the footer

- **Flight data:** Flight information can change quickly. Confirm critical details with the
  operating airline and airport.
- **Prediction:** This is an estimate, not an airline decision or safety forecast.
- **Connection:** Walking, security, immigration, baggage, gate-close rules, and airline assistance
  can change the outcome.
- **Rights:** Informational estimate, not legal advice. Eligibility depends on the full facts,
  current law, and the airline or regulator's determination.
- **Affiliate:** Partner link · DelayPilot may earn a commission if you purchase. This does not
  change our assessment.

## 27. Result microcopy

**On track:** No major disruption signal is visible right now.
**Watch:** Conditions are changing. Review the factors and keep alerts on.
**At risk:** Your itinerary has less room for recovery. Here are the most useful steps now.
**Disrupted:** A material disruption is confirmed. Start with the action checklist below.
**Unknown:** We do not have enough fresh information to make a reliable assessment.
**Protected:** These segments appear to be on one protected itinerary. Confirm this on your ticket.
**Self-transfer:** Separate tickets usually leave rebooking and baggage recovery to you. Build in
more time and verify each airline's rules.
**Topology missing:** Tell us whether both flights are on one reservation. That changes the
connection and passenger-rights analysis.
**Rights:** Based on the facts entered and the rule version shown below, these rights may apply. The
airline or regulator may reach a different conclusion after reviewing the full circumstances.
**Freshness:** Updated 6 minutes ago from [source].
**Stale:** The latest source response is older than expected. Treat this as context, not
confirmation.
**Demo:** Demo data — not a live flight.

## 28. Demo mode

The site must be polished without paid credentials. Ship a deterministic fictional itinerary using
clearly synthetic identifiers or an explicit "Demonstration itinerary" banner, covering: an on-time
segment · a delayed inbound segment · a tightening protected connection · a self-transfer comparison ·
a cancellation state · a US refund example · an EU rights example · a stale-provider state · a
partial-data state · a Trip Pass upgrade · an alert timeline. **Never a real flight number with fake
live details.** Every demo panel says "Demo data — not a live flight." Demo state is never indexed
as an individual flight page.

## 29. PWA and offline

Manifest, installable icons, service worker, offline shell, offline access to the last explicitly
saved trip snapshot, an offline passenger-rights emergency checklist, locally queued notes that sync
after reconnect, and a web-push subscription flow. Never cache auth responses, checkout, admin,
private API responses in a shared cache, provider secrets, or unbounded licensed payloads. Offline
state must be unmistakable.

---

# PART IV — QUALITY GATE

## 30. Rubric (100 points)

| Area | Pts | Criteria |
| --- | --- | --- |
| Architecture and maintainability | 10 | Coherent boundaries · strict types · current Cloudflare practice · migration discipline · no duplicated business rules · no dead architecture |
| Core product completeness | 15 | Lookup · itinerary · status · connection · rights · actions · monitoring · evidence · billing · family sharing · admin |
| Data and rights correctness | 15 | Provenance · freshness · licence guard · versioned rules · effective dates · official sources · no legal overclaim |
| Algorithms and model integrity | 10 | Correct formulas · validation · calibration gates · no leakage · no fake probabilities · model card |
| Visual design and UX | 15 | Original brand · professional hierarchy · responsive · complete states · clear uncertainty · no template feel · no panic language |
| Accessibility and performance | 10 | WCAG 2.2 AA · tested keyboard · Lighthouse · Core Web Vitals · bundle budgets · no ad CLS |
| Security and privacy | 10 | Threat model · auth · encryption · authorization · retention · no PNR · safe logs · webhooks · abuse protection |
| SEO and content quality | 5 | Indexable utility · source-backed content · content gate · structured data · sitemap/canonical/noindex correctness |
| Monetization integrity | 5 | Ads separated from controls · `ads.txt` · premium suppression · disclosed affiliates · Stripe entitlements · no crisis exploitation |
| Testing and operations | 5 | Unit/property/integration/E2E/a11y/visual/security · CI · observability · runbooks · rollback |

**Release gate:** ≥ 95/100 · no critical security, privacy, legal, billing, accessibility,
data-licensing, or rights-engine issue · no broken control · no fake live data · no visible
production placeholder · all required checks passing. `release-auditor` writes the scored audit to
`docs/QUALITY_REPORT.md` and the orchestrator loops fix-and-re-audit until green or the only
remaining blocker is a named external credential.

## 31. Definition of done

Clean-clone install works · public site and app build · Worker builds with generated binding types ·
local D1 migrations run · demo mode complete and labelled · live adapters fail closed without
credentials · lookup, trips, connections, rights, alerts, evidence packets, auth, billing, and admin
implemented · rule versions source-linked and tested · the EU 2026 reform not applied prematurely ·
DOT enforcement discretion represented as guidance · no fake probability shown · no private itinerary
indexable or in analytics · ads unmistakable for product controls · paid tiers ad-free · affiliate
links disclosed and disabled until configured · accessibility, performance, security, SEO, and visual
checks pass · documentation current · audit ≥ 95/100 with no critical defect · production deployment
verified if credentials existed, otherwise exact commands and prerequisites documented.

## 32. Final report contract

On completion, report: product completion summary · architecture summary · user flows completed ·
data-provider state (live/fixture/mixed) · rights rule versions and review date · algorithm and model
state · privacy/security summary · monetization implementation · SEO/indexing implementation · test
commands with **actual** results · quality score and remaining deductions · deployment URL **only if
independently verified** · exact remaining external credentials or human approvals · the exact next
command for the repository owner.

Never claim a live URL, provider integration, calibrated model, legal review, ad approval, affiliate
relationship, or production billing state that was not verified.

## 33. Regulatory and platform source list

Seed `source_registry` with these; `regulatory-source-steward` opens each, confirms currency,
records `last_verified_at` and a checksum or review note, and updates rule data and tests before any
publication. Never prefer a news summary over a primary regulator source. Never auto-publish a
regulatory diff.

1. DOT — Refunds · https://www.transportation.gov/individuals/aviation-consumer-protection/refunds
2. DOT — What's New (incl. 2026-07-08 enforcement discretion) · https://www.transportation.gov/airconsumer/latest-news
3. DOT — Airline Customer Service Dashboard · https://www.transportation.gov/airconsumer/airline-customer-service-dashboard
4. EU — Your Europe, Air Passenger Rights · https://europa.eu/youreurope/citizens/travel/passenger-rights/air/index_en.htm
5. Council of the EU — 2026-07-13 final clearance · https://www.consilium.europa.eu/en/press/press-releases/2026/07/13/council-gives-final-clearance-for-stronger-air-passenger-rights/
6. UK CAA — Flight Delays · https://www.caa.co.uk/air-passengers/travel-problems-and-rights/flight-delays-and-cancellations/delays/
7. CTA — Flight Delays and Cancellations · https://protection-passager-passenger.otc-cta.gc.ca/en/when-an-issue-happens/flight-delays-and-cancellations
8. CTA — Rebooking, Refunds, Compensation · https://protection-passager-passenger.otc-cta.gc.ca/en/refunds-and-compensation/flight-delays-cancellations-rebooking-refunds-compensation
9. AviationWeather.gov Data API · https://aviationweather.gov/data/api/
10. FlightAware AeroAPI · https://www.flightaware.com/commercial/aeroapi/
11. FAA NAS Status · https://nasstatus.faa.gov/
12. BTS — Airlines and Airports · https://www.bts.gov/topics/airlines-and-airports-0
13. ICAO — Montreal Convention liability limits · https://www.icao.int/
14. Cloudflare Workers Static Assets · https://developers.cloudflare.com/workers/static-assets/
15. Cloudflare Workflows · https://developers.cloudflare.com/workflows/
16. Cloudflare Queues · https://developers.cloudflare.com/queues/
17. Cloudflare D1 Migrations · https://developers.cloudflare.com/d1/reference/migrations/
18. Cloudflare Workers Best Practices · https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
19. Google — Software Application structured data · https://developers.google.com/search/docs/appearance/structured-data/software-app
20. Google — Spam policies · https://developers.google.com/search/docs/essentials/spam-policies
21. Google AdSense — Ad placement policies · https://support.google.com/adsense/answer/1346295
22. Stripe docs · https://docs.stripe.com/

Add registry placeholders for the current official developer documentation of any enabled Cirium or
OAG adapter.
