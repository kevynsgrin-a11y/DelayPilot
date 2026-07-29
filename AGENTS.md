# AGENTS.md — DelayPilot Agent Constitution

**Status:** binding on every agent, subagent, workflow, and human contributor in this repository.
**Precedence:** `AGENTS.md` (this file) > `DIRECTIVE.md` > `docs/agents/ROSTER.md` > individual agent
charter in `.claude/agents/*.md` > local file conventions. If a charter appears to permit something
this file forbids, this file wins and the charter is defective — report it, do not act on it.

DelayPilot is consumer flight-disruption intelligence. People read it while standing at a gate,
tired, and about to make an expensive, irreversible decision. Everything below exists because a
plausible-sounding invention in this product costs a real traveler real money.

---

## 0. The one-paragraph brief

DelayPilot tells a traveler what is happening to their flight, how much to trust that information,
what may happen next, what to do now, and which passenger-rights rules _may_ apply — with sources,
versions, and timestamps attached to every claim. It is not an airline, airport, regulator, law
firm, claims company, or flight-data provider. It never files anything on a user's behalf.

---

## 1. Truth invariants (violating any of these is a release-blocking defect)

### 1.1 Never fabricate operational fact

No invented gate, terminal, estimate, cause, weather condition, cancellation reason, tail number,
probability, accuracy figure, user count, review score, savings claim, or partner relationship.
If the value is not present in a licensed provider response, a fixture explicitly labelled as such,
or user input, it is `unknown` — and `unknown` is a first-class, designed UI state, never a blank
or a zero.

### 1.2 Every displayed datum carries provenance

Use exactly these labels. Do not invent synonyms, do not soften them, do not omit them.

| Label                 | Meaning                                                                            |
| --------------------- | ---------------------------------------------------------------------------------- |
| `Live`                | A licensed provider returned a fresh response within its freshness threshold.      |
| `Cached`              | A prior licensed response, still inside the contractually permitted cache window.  |
| `Stale`               | Beyond the normal freshness threshold, still permitted to display, shown as stale. |
| `Demo`                | Fixture data. Must be accompanied by "Demo data — not a live flight."              |
| `Unavailable`         | No trustworthy response exists.                                                    |
| `Heuristic risk band` | No validated calibrated model is deployed for this assessment.                     |

Freshness (`updatedAt`, source id, and age) travels with the datum through every layer:
provider adapter → normalizer → repository → API response → component props → rendered UI.
An API shape that cannot express provenance is a defective contract.

### 1.3 Never overclaim legally

Permitted rights statuses: `likely_applies`, `may_apply`, `not_indicated`, `cannot_determine`,
`future_rule_not_active`. Permitted phrasing: "may apply", "estimated rights", "based on the facts
entered". Forbidden anywhere in code, copy, tests, fixtures, notifications, or documentation:
"you are owed", "guaranteed compensation", "legally entitled", "approved claim", "we will win",
"the airline must pay", "guaranteed connection", "your flight will be cancelled".

Contextual evidence is never legal cause. Nearby thunderstorms do not prove an extraordinary
circumstance. A provider's disruption reason string is an _airline-stated_ or _provider-stated_
cause, and must be rendered as such, never as a determination.

### 1.4 Never imply affiliation

No airline, airport, regulator, or data-provider logos, wordmarks, brand colours, or trade dress
without a verified written licence recorded in `docs/PROVIDER_LICENSING.md`. Text names and
IATA/ICAO identifiers are permitted where lawful and necessary. The independence disclaimer in
`DIRECTIVE.md §35` ships in the footer of every public page.

### 1.5 Fail closed

Missing credentials, missing licence policy, unapproved provider, unverified source, expired rule
set, or unavailable model ⇒ degrade to a designed, labelled state. Never substitute fixture data
for live data at runtime outside explicit demo mode. Production readiness must fail rather than
silently serve fixtures.

### 1.6 No placeholders in shipped surfaces

No `TODO`, `FIXME`, `coming soon`, lorem ipsum, dead buttons, fake charts, decorative-only numbers,
or empty routes in anything reachable by a user. Unfinished work lives on a branch, not behind a
disabled control. The only acceptable unresolved inputs are external ones (credentials, domains,
commercial licences, human legal review) — and each must have: a complete adapter, a validated
config contract, an `.env.example` entry, a demo fallback, a fail-closed production path, and
documented activation steps.

---

## 2. Privacy and safety invariants

- **No booking reference (PNR/record locator) anywhere in the launch experience.** Not as an input,
  not in a schema, not in a URL, not in a log, not in an analytics event.
- Never store or request passports, government IDs, Known Traveler Numbers, redress numbers,
  card numbers, or airline account credentials.
- Never read a user's email inbox, scrape an airline account, or authenticate as a user to a third
  party.
- Never submit a claim, complaint, refund request, rebooking, or purchase on a user's behalf.
- Never classify an emergency or give safety-critical aviation advice. Weather features describe
  _operational_ conditions only — never "unsafe", never "the airline must cancel".
- Logs, analytics, error reports, page titles, Open Graph tags, referrers, and URLs contain no
  email address, no display name, no itinerary detail, no receipt text, no notification payload,
  and no raw IP.
- Private routes (`/app/**`, `/auth/**`, `/checkout/**`, `/admin/**`) are `noindex, nofollow,
noarchive`, use opaque UUIDs, and are never stored in a shared cache.
- Secrets live in Wrangler secrets or the deployment secret store. Never in source, never in D1,
  never in KV, never in client bundles, never in a commit, never in a log line, never in a test
  fixture.

---

## 3. Engineering invariants

### 3.1 TypeScript

`strict` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
`useUnknownInCatchVariables`, `noFallthroughCasesInSwitch`, `noImplicitReturns`,
`noPropertyAccessFromIndexSignature`.

Banned: unbounded `any`; `as unknown as` double casts; hand-written Cloudflare `Env` interfaces
(generate with `wrangler types`); mutable request state in module scope; floating promises;
`Math.random()` for identifiers, tokens, or anything security-adjacent (use `crypto`);
`passThroughOnException`; non-timing-safe secret comparison; Node-only APIs without verified
Workers support.

### 3.2 Boundaries

Business rules live in `packages/*`, never in components, route handlers, or SQL. A rule expressed
in two places is a defect. Time-sensitive regulatory prose lives in versioned rule data with
effective dates — never inline in a React component or an article body.

### 3.3 Time

Persist instants as UTC. Persist IANA time-zone identifiers for airports separately. Derive service
dates in origin-local time. Never derive a zone from a numeric offset. Every displayed time is
labelled with airport code and zone. DST gaps, DST folds, overnight flights, and date-line crossings
are tested cases, not edge cases.

### 3.4 Determinism

Rights evaluation, risk banding, connection maths, and alert fingerprinting are pure functions over
explicit inputs. Randomness is seeded in tests. Two runs over the same inputs produce byte-identical
outputs. Every assessment is snapshotted immutably with the rule-set/model version that produced it.

### 3.5 Single-writer file ownership

Every path has exactly one owning agent (`docs/agents/ROSTER.md §3`). Do not edit another agent's
paths. Need a change there? Emit a **handoff request** (§5) and keep working on what you own.
Shared-surface exceptions are enumerated in the roster and require the owner's contract to be
followed exactly.

---

## 4. Monetization invariants

- Ads must never be confusable with a flight, refund, rebooking, claim, contact, or safety control.
  Forbidden above the primary search, inside forms, between a warning and its action, inside or
  adjacent to a rights card or action checklist, and on auth / checkout / account / admin / privacy
  / terms / error / status pages.
- Ad slots reserve their dimensions (zero CLS), are labelled, never timer-refresh, never refresh on
  background polling, and load only after required consent.
- Paid surfaces (Trip Pass–covered trip, Plus, Family) are entirely ad-free.
- Itinerary data is never passed to ad targeting or affiliate parameters.
- Every affiliate link: `rel="sponsored nofollow"`, a plain-language disclosure in the module, a
  validated redirect allowlist, no cloaking of the merchant, disabled until a real agreement exists.
- Utility and official rights information always precede any commercial suggestion. Never present a
  commercial partner as the remedy for a statutory right.

---

## 5. Agent operating protocol

### 5.1 Before writing anything

1. Read `AGENTS.md`, `DIRECTIVE.md` (your sections), your charter, and `docs/agents/ROSTER.md §3`.
2. Read the current contents of every file you intend to change. Never overwrite unread work.
3. Verify external platform facts against **current primary documentation** (Cloudflare, provider,
   regulator) at execution time. Training memory is not a source. Record version assumptions in
   `docs/DATA_SOURCES.md` or an ADR.
4. If your task depends on an unbuilt upstream contract, consume the contract from
   `packages/contracts` — do not invent a parallel shape.

### 5.2 While working

- Small, coherent, scoped commits. Never force-push a shared branch.
- Extend tests with the code, in the same change, not "later".
- If you discover a defect you do not own, file it in your handoff report; do not silently patch
  across an ownership boundary.
- If a requirement is genuinely impossible without an external credential, implement the complete
  adapter, wire the demo path, document the activation steps, and say so plainly. Do not fake it.

### 5.3 Handoff report (required output of every agent run)

Return, in this order:

1. **Delivered** — files created/changed, one line each.
2. **Verified** — the exact commands run and their real results. Never claim a command passed
   unless it was executed and passed.
3. **Contracts published** — new/changed types, routes, tokens, events, or config other agents
   consume.
4. **Handoff requests** — `to: <agent>` + the precise change needed + why it is theirs.
5. **Open risks** — including any invariant you could not fully satisfy and why.
6. **External blockers** — the exact credential, licence, or human approval required.

### 5.4 Definition of done for any agent run

- Owned scope complete, with no placeholder reachable by a user.
- `pnpm typecheck` and `pnpm lint` pass for touched packages.
- Tests for owned logic pass, including the invariants above where applicable.
- No secret, no PNR, no personal data introduced into logs, URLs, analytics, or fixtures.
- Handoff report written.

---

## 6. Verification vocabulary

Report results with exactly these words:

- **Passing** — the command was executed in this session and exited zero. Quote the command.
- **Failing** — executed, non-zero. Quote the command and the real error.
- **Not run** — not executed. Say why.
- **Blocked (external)** — cannot run without a named external credential. Name it.

"Should work", "presumably passes", and "I have implemented it correctly" are not verification.

---

## 7. Escalation

Stop and escalate to the orchestrator (rather than deciding alone) when:

- A change would weaken a truth, privacy, or monetization invariant.
- Two agents' contracts genuinely conflict.
- A regulator source appears to have changed the law.
- A provider licence does not clearly permit an intended use.
- Achieving a target would require displaying an unvalidated number as if it were validated.

Never resolve any of these by lowering the standard silently.
