# DelayPilot — Quality Report

Owner: `release-auditor` (`docs/agents/ROSTER.md §3`). This is the only file this agent writes, and
it fixes nothing. Every finding below is a deduction plus a handoff, never a patch.

Scored against `DIRECTIVE.md` Part IV §30 (rubric and release gate), §31 (definition of done) and
§32 (final report contract), with `AGENTS.md` held in full.

**Rounds are appended, never overwritten.** A prior round's findings stay exactly as they were
recorded, including the ones that turned out to be wrong.

---

## Round 1 — S4 close-out audit — 2026-09-20

| Field                | Value                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Round                | 1                                                                                         |
| Date                 | 2026-09-20                                                                                |
| Branch               | `claude/intelligent-knuth-d3s8za`                                                         |
| Tree audited         | `49be154` for every executed gate; tip moved to `b92a884` mid-audit (docs-only, see §1.4) |
| Base                 | `origin/main` = `b3e6aae`                                                                 |
| Scope                | S4: ten commits on top of `origin/main`                                                   |
| **Score**            | **48.0 / 100**                                                                            |
| **Critical defects** | **2**                                                                                     |
| **Verdict**          | **RED**                                                                                   |

### 1.1 The verdict in one paragraph

**RED, and the red is not S4's fault.** S4 produced more executed evidence per claim than any session recorded in this repository:
four loud stubs became four real gates, two live defects on `main` were closed, and one finding
(F-QA-2) changed how this repository should think about every negative test it owns. I re-ran every
gate myself and every one that S4 claims passes, passes in front of me. The score is 48 because the
rubric scores a _product_ and nine of ten workspace packages are 12-line shells: there is no rights
engine, no risk engine, no connection engine, no provider adapter, no migration, no API beyond a
liveness probe. That is the declared state of the phase plan, not a regression. The two criticals
are both operational and both concern the same root cause — **there is no enforced path between a
green check and the thing users receive**: `main` is unprotected with required status checks `off`,
and the deployed origin is serving a build with no Content-Security-Policy at all because the fix
that closes it has never reached the branch that deploys. Everything a traveler actually reads is
clean: zero fabricated operational values, zero uncalibrated percentages, zero forbidden legal
phrases, zero visible placeholders, zero dead controls, zero PNR surface.

### 1.2 Release-gate clauses, each answered

| Gate clause (`DIRECTIVE.md §30`)                                                            | Result                                                                            |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Score ≥ 95 / 100                                                                            | **No** — 48.0                                                                     |
| No critical security/privacy/legal/billing/accessibility/data-licensing/rights-engine issue | **No** — 2 criticals, both security/operations (C-1, C-2)                         |
| No broken control                                                                           | **Yes** — every control in the build was exercised; see §5.3                      |
| No fake live data                                                                           | **Yes** — verified by census, see §5.1                                            |
| No visible production placeholder                                                           | **Yes** — verified, see §5.3                                                      |
| All required checks passing                                                                 | **Unsatisfiable** — no check is required; `main` enforcement level is `off` (C-1) |

---

## 2. Commands executed by me, this session

Every result below was produced in this session. Nothing here is quoted from a handoff report or a
commit message. `AGENTS.md §6` vocabulary throughout.

### 2.1 The `DIRECTIVE.md §25` set

| Command                          | Result                 | Evidence                                                                                                                                                                      |
| -------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile` | **Passing**            | `Lockfile is up to date, resolution step is skipped / Already up to date / Done in 4.9s`                                                                                      |
| `pnpm format:check`              | **Passing**            | `All matched files use Prettier code style!`                                                                                                                                  |
| `pnpm lint`                      | **Passing**            | eslint clean; `forbidden-phrases: 302 files scanned … 0 hit(s) in 0 file(s)`                                                                                                  |
| `pnpm typecheck`                 | **Passing**            | `pnpm -r typecheck`, exit 0                                                                                                                                                   |
| `pnpm test`                      | **Passing**            | `Test Files 18 passed (18) / Tests 888 passed (888) / Duration 2.56s`                                                                                                         |
| `pnpm test:workers`              | **Failing** (stub)     | `pnpm test:workers is not implemented yet. Owner: qa-test-architect, DIRECTIVE.md Phase 12.`                                                                                  |
| `pnpm test:e2e`                  | **Passing**            | `1 skipped / 236 passed (1.7m)` — 84 desktop + 84 mobile-375 + 69 visual                                                                                                      |
| `pnpm test:a11y`                 | **Passing**            | `92 axe run(s) (80 route + 12 state), 135 regression assertion(s), 121s. Passing — 0 violations at any impact, 0 console errors, 0 regression findings, 0 coverage findings.` |
| `pnpm test:seo`                  | **Passing**            | `20 page(s) in apps/web/dist — 13 indexable, 7 noindex`, 0 findings                                                                                                           |
| `pnpm test:security`             | **Failing** (stub)     | `pnpm test:security is not implemented yet. Owner: security-privacy-engineer, Phase 12.`                                                                                      |
| `pnpm build`                     | **Passing**            | `verify-dist --self-test: 32 check(s) behave as specified. / verify-dist: 20 page(s) and 4 chunk(s) checked, 0 findings.` + edge dry-run                                      |
| `pnpm quality`                   | **Failing**            | halts at the **first** stub: `test:workers` → `ELIFECYCLE Command failed with exit code 1`                                                                                    |
| `pnpm model:validate`            | **Failing** (stub)     | `pnpm model:validate is not implemented yet. Owner: risk-modeling-scientist, Phase 6.`                                                                                        |
| `pnpm db:migrate:local`          | **Failing** (stub)     | `No migration exists in migrations/ yet, so a green result here would be meaningless.`                                                                                        |
| `pnpm db:seed:local`             | **Failing** (stub)     | `pnpm db:seed:local is not implemented yet. Owner: data-platform-engineer, Phase 3.`                                                                                          |
| `pnpm preview`                   | **Passing**            | `[wrangler:info] ✨ Parsed 1 valid header rule. / [wrangler:info] Ready on http://localhost:8787`                                                                             |
| `pnpm smoke`                     | **Failing** (stub)     | `pnpm smoke is not implemented yet. Owner: platform-release-sre, Phase 13.`                                                                                                   |
| `pnpm db:migrate:remote`         | **Blocked (external)** | needs a real Cloudflare D1 database id (`CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`)                                                                                      |
| `pnpm deploy`                    | **Not run**            | a deploy is a production action and is the owner's, not the auditor's                                                                                                         |
| `pnpm dev`                       | **Not run**            | long-running dev server; `pnpm preview` was run instead and is the stronger check                                                                                             |

**A note on `pnpm quality`.** It is Failing, and it fails **earlier than reported elsewhere**: the
chain is `… && pnpm build && pnpm seo:verify && pnpm test:workers && …`, so it short-circuits at
`test:workers` and **never evaluates** `test:e2e`, `test:a11y`, `test:seo`, `perf:budgets` or
`test:security`. Describing it as "failing at two Phase 12 stubs" overstates what it proves: it
reaches one. Each downstream gate was therefore run individually, above.

### 2.2 Gates outside `§25` that I also executed

| Command                                                  | Result      | Evidence                                                                                                                                          |
| -------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm seo:verify`                                        | **Passing** | `verify-sitemap: 20 page(s) … 13 sitemap entr(ies), all present in the build, all indexable`                                                      |
| `pnpm perf:budgets`                                      | **Passing** | `perf budgets: 136 checks passed across 20 routes … javascript 2050 B gz in 4 external scripts, 0 hydrated islands, 0 inline executable scripts.` |
| `node scripts/perf/lighthouse.mjs`                       | **Passing** | 6 routes; 4 indexable routes at `perf 100 a11y 100 bp 100 seo 100`; LCP 1202–1503 ms, CLS 0, TBT 0                                                |
| `node scripts/perf/interaction-latency.mjs`              | **Passing** | 375×667, CPU ×4 — `worst INP: 96 ms worst event-to-paint: 86 ms target: INP < 200 ms`                                                             |
| `node scripts/validate-security-headers.mjs --self-test` | **Passing** | `Self-test passed: 6 seeded divergence(s) caught, live policy clean.`                                                                             |
| `node scripts/seo/test-seo.mjs --self-test`              | **Passing** | `test-seo --self-test: 46 check(s) behave as specified.`                                                                                          |
| `node apps/web/scripts/verify-dist.mjs --self-test`      | **Passing** | `verify-dist --self-test: 32 check(s) behave as specified.`                                                                                       |
| `node scripts/validate-build-system.mjs`                 | **Passing** | `Charters validated: 25 / 0 error(s), 0 warning(s)`                                                                                               |
| `node apps/web/src/lib/copy/lint/cli.ts`                 | **Passing** | `302 files scanned … 0 hit(s) in 0 file(s)`                                                                                                       |
| `pnpm exec playwright test --project=visual`             | **Passing** | 69 frames, included in the 236 above                                                                                                              |

### 2.3 What I could not run

| Item                                                                                          | State                  | Why                                                                    |
| --------------------------------------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------- |
| `curl -I https://delaypilot.app/`                                                             | **Blocked (external)** | `curl: (56) CONNECT tunnel failed, response 403` — proxy policy denial |
| `WebFetch https://delaypilot.app/`                                                            | **Blocked (external)** | `{"error_type":"EGRESS_BLOCKED","domain":"delaypilot.app"}`            |
| `curl -I https://delaypilot.vercel.app/`                                                      | **Blocked (external)** | `curl: (56) CONNECT tunnel failed, response 403`                       |
| `curl -I https://www.delaypilot.app/`                                                         | **Blocked (external)** | same                                                                   |
| `curl -I https://delaypilot-git-claude-intellig-51e571-kevynsgrin-a11ys-projects.vercel.app/` | **Blocked (external)** | same — this is the exact host the owner must probe                     |
| WebKit / Mobile Safari Playwright projects                                                    | **Not run**            | only Chromium is installed in this environment                         |
| `pnpm db:migrate:remote`, `pnpm deploy`                                                       | **Blocked (external)** | Cloudflare account id + API token                                      |

I confirmed the egress denial rather than assuming it, as instructed. The proxy's own status
endpoint reports `connect_rejected … gateway answered 403 to CONNECT (policy denial …)`.

---

## 3. Rubric scorecard — all ten rows, with arithmetic

| #   | Area                             | Max | Deductions                                           | Score    |
| --- | -------------------------------- | --- | ---------------------------------------------------- | -------- |
| 1   | Architecture and maintainability | 10  | Q4-01 −3                                             | **7.0**  |
| 2   | Core product completeness        | 15  | Q4-02 −12                                            | **3.0**  |
| 3   | Data and rights correctness      | 15  | Q4-03 −5, Q4-04 −3                                   | **7.0**  |
| 4   | Algorithms and model integrity   | 10  | Q4-05 −5, Q4-06 −2                                   | **3.0**  |
| 5   | Visual design and UX             | 15  | Q4-07 −4, Q4-08 −1                                   | **10.0** |
| 6   | Accessibility and performance    | 10  | Q4-09 −1, Q4-10 −0.5, Q4-11 −1, Q4-12 −0.5, Q4-13 −1 | **6.0**  |
| 7   | Security and privacy             | 10  | Q4-14 −3, Q4-15 −2, Q4-16 −1                         | **4.0**  |
| 8   | SEO and content quality          | 5   | Q4-18 −1, Q4-19 −0.5, Q4-20 −0.5                     | **3.0**  |
| 9   | Monetization integrity           | 5   | Q4-21 −1, Q4-22 −1, Q4-23 −0.5                       | **2.5**  |
| 10  | Testing and operations           | 5   | Q4-24 −1, Q4-25 −1, Q4-26 −0.5                       | **2.5**  |
|     | **Total**                        | 100 |                                                      | **48.0** |

No root cause is deducted in more than one row. Where a defect touches several rows it is scored in
the row that owns it and cross-referenced from the others.

### 3.1 Why each row scored what it did

**Row 1 — 7.0.** All eight `AGENTS.md §3.1` strict flags are on in `tsconfig.base.json:` — `strict`,
`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
`useUnknownInCatchVariables`, `noFallthroughCasesInSwitch`, `noImplicitReturns`,
`noPropertyAccessFromIndexSignature`, plus `verbatimModuleSyntax` and `noUnusedLocals`.
`apps/edge/worker-configuration.d.ts` is generated, not hand-written. No business rule is expressed
twice, because no business rule is expressed once. Deducted only for dead architecture (Q4-01).

**Row 2 — 3.0.** Of the eleven capabilities the row names, zero are functionally implemented. The
3.0 is credit for the parts that _are_ real and honestly labelled: a lookup form with a full §17
error/searching/unavailable state machine, a demonstration cockpit with segment, connection, rights
and action-checklist surfaces, all provenance-labelled, all gated.

**Row 3 — 7.0.** The highest-value half of this row is clean and I verified it by census, not by
reading a doc: all six provenance labels used exactly as `AGENTS.md §1.2` writes them, no synonyms;
`Live` and `Cached` chips exist **only** inside `<ul data-provenance-legend>` where they label the
vocabulary, never a datum; zero forbidden legal phrases; zero compensation amounts rendered
anywhere; the five permitted rights statuses used and no sixth. Deducted for the absent rule engine
and the unverified source registry.

**Row 4 — 3.0.** Nothing computes, but nothing lies. Zero numeric percentages appear in rendered
text on any of the 20 routes. `Heuristic risk band` is used ten times as the label. The connection
surfaces render minutes and a qualitative band (`aria-valuetext="44 of 51 minutes, Watch"`), never a
probability, and the prose says so: "no validated calibrated model is deployed, so DelayPilot shows
the band and the factors behind it and no probability."

**Row 5 — 10.0.** Original brand only — `apps/web/public/brand/` holds DelayPilot's own mark and
logotype and there is no third-party logo, wordmark or image reference anywhere in `dist`.
Responsive behaviour is baselined at 375/768/1024/1440 in both themes plus a reduced-motion state,
69 frames. Uncertainty is a first-class design: 34 `data-state="unknown"` renders with designed
prose ("The gate has not been published yet"), not blanks. Deducted for §17 and §18.1 coverage.

**Row 6 — 6.0.** 92 axe runs, 0 violations at any impact; 32 `incomplete` nodes classified into
three named classes and pixel-measured, none below floor. Keyboard walk on every route in both CI
projects. Lighthouse measured by me at 100/100/100/100 on all four indexable routes in the gate's
route set. CLS exactly 0. Deducted for measurement fidelity and for gates that exist but do not gate.

**Row 7 — 4.0.** The header work is real and I observed it from a server (§6.2) — but only on the
Cloudflare path, and three of the §24 security documents do not exist. `pnpm test:security` is a
stub, so IDOR, CSRF, forged-webhook and redirect-allowlist have never been exercised. Privacy is
genuinely clean: no PNR field, column, parameter or log anywhere; the only occurrences of "booking
reference" in the repository are the policy pages promising never to ask for one.

**Row 8 — 3.0.** Titles and descriptions unique across 20 pages; sitemap exactly the indexable set;
structured data allowlisted and backed by visible text; `noindex` correct on all seven gated pages.
Deducted for the content gate that does not exist, the canonical that has never been exercised, and
one stale documentation claim.

**Row 9 — 2.5.** The honest current state is asserted rather than assumed: `e2e/ad-placement.e2e.mjs`
has a test literally named _"no ad slot is rendered anywhere in this build — the honest current
state"_, and two independent detectors (byte-offset in `verify-dist.mjs`, DOM+geometry in
`e2e/pages/ad-placement.mjs`) stand ready. Deducted because one of them is half-inert and `ads.txt`
does not exist.

**Row 10 — 2.5.** 888 unit tests, 237 Playwright tests, 92 axe runs, 136 budget checks, 84
self-test checks across three harnesses — and none of it is required to merge.

---

## 4. Deduction register

Each record: rubric row · points · severity · evidence I produced · required fix · owning agent ·
the re-audit check. Format follows `docs/TESTING.md §11` (input · expected · observed).

### Q4-01 · Row 1 · −3 · major · Dead architecture: ten declared packages, five declared bindings, zero implementations

- **Input** — `find packages/*/src -name '*.ts'` line counts; `ls migrations/`; the binding table
  printed by `pnpm build`.
- **Expected** — declared workspace packages and Cloudflare bindings correspond to code that uses
  them.
- **Observed** — nine of ten `packages/*/src` trees are a single 12-line file
  (`billing`, `connection-engine`, `contracts`, `domain`, `notifications`, `observability`,
  `providers`, `rights-engine`, `risk-engine`); only `packages/ui` (61 files) is real.
  `apps/edge/src` is one 167-line `index.ts`. `migrations/` **does not exist**. `pnpm build` prints
  bindings for `env.DB (delaypilot)` D1, `env.CACHE` KV, `env.ALERT_QUEUE`, `env.ALERT_QUEUE_DLQ`,
  and `env.RATE_LIMITER (60 requests/60s)` — no code reads any of them and no migration defines the
  D1 schema.
- **Note** — this is sanctioned Phase-1 scaffolding (`ROSTER.md §3`, shared-surface exception 1).
  The rubric scores what exists, and "no dead architecture" is a named criterion, so it is deducted
  once here and cross-referenced, not repeated.
- **Required fix** — Phases 2–3 land `packages/contracts`, `packages/domain` and `migrations/**`.
- **Owner** — `principal-architect` (topology, contracts); `data-platform-engineer` (migrations).
- **Re-audit** — `ls migrations/` returns at least one migration **and** `pnpm db:migrate:local`
  exits 0.

### Q4-02 · Row 2 · −12 · major · Eleven named capabilities, none implemented

- **Input** — `apps/edge/src` tree; `curl http://localhost:8787/api/v1/health` against `pnpm preview`.
- **Expected** — lookup · itinerary · status · connection · rights · actions · monitoring · evidence
  · billing · family sharing · admin.
- **Observed** — the entire API surface is `{"status":"ok","service":"delaypilot-edge","time":…}`
  plus a static-asset fallthrough. The homepage cockpit renders
  `<dd class="dpp-row__value">Not available in this deployment</dd>` for Monitoring, which is the
  correct designed state and also the measure of the gap. No trip, rights, connection, alert,
  evidence, billing, family or admin route exists.
- **Required fix** — Phases 4–8.
- **Owner** — `build-orchestrator` (sequencing), then the phase owners.
- **Re-audit** — the §22.6 flows in §4.10 below become runnable.

### Q4-03 · Row 3 · −5 · major · No versioned rule data, no licence guard, no provider adapter

- **Input** — `ls data/rights/rulesets/`; `packages/rights-engine/src`; `packages/providers/src`.
- **Expected** — versioned rule sets with effective dates, a licence policy guard, normalized
  adapters.
- **Observed** — none exist. Rights prose on `/passenger-rights/` and `/methodology/` is editorial
  content, correctly `noindex` and correctly hedged, but no rule set can be selected, versioned or
  snapshotted.
- **Required fix** — Phase 4 and Phase 5.
- **Owner** — `rights-rules-engineer`, `integrations-provider-engineer`.
- **Re-audit** — the §15.6 golden matrix runs and `data/rights/rulesets/**` carries effective dates.

### Q4-04 · Row 3 · −3 · major · The source registry is entirely unverified

- **Input** — `docs/BUILD_PLAN.md:386` (input I-8); `docs/SEO.md §7.3`.
- **Expected** — `source_registry` records carry a `last_verified_at` and a checksum.
- **Observed** — _"Today every registry record is `unreachable` with a null `lastVerifiedAt` (I-8),
  which is why no regulatory page is `published` and none is in the sitemap."_ The consequence is
  visible in the build: `/passenger-rights/` ships `noindex`, and `dpp-rights__source-offline`
  appears nine times in `dist`. **The handling is correct** — the product degrades to a labelled
  state rather than inventing currency — but the row cannot score a criterion nothing has satisfied.
- **Required fix** — owner input I-8 (egress to the 18 regulator hosts), then re-run the steward.
- **Owner** — `regulatory-source-steward`; unblocked only by the repository owner.
- **Re-audit** — `docs/RIGHTS_SOURCE_REVIEW.md` carries a non-null `lastVerifiedAt` per source.

### Q4-05 · Row 4 · −5 · major · No formula, therefore no property to assert

- **Input** — `packages/risk-engine/src`, `packages/connection-engine/src` (12 lines each).
- **Expected** — `P_miss = P(D + T > W)`, Haversine, slack `S = W − T`, seeded Monte Carlo, plus the
  §22 monotonicity properties: more window never increases miss risk; more transfer time never
  decreases it.
- **Observed** — no implementation, so neither property is asserted anywhere. The 888 passing unit
  tests cover copy, SEO, site-URL resolution and UI patterns; none covers a risk or connection
  formula.
- **Required fix** — Phase 6.
- **Owner** — `risk-modeling-scientist`, `connection-risk-engineer`.
- **Re-audit** — both monotonicity properties present as executable property tests and passing.

### Q4-06 · Row 4 · −2 · major · No model card, no model-validation gate

- **Input** — `ls docs/MODEL_CARD.md docs/MODEL_TRAINING.md`; `pnpm model:validate`.
- **Expected** — `§24` names both documents; `§25` names the command.
- **Observed** — both files absent; the command is a loud stub that exits 1.
- **Required fix** — Phase 6 ships the offline pipeline, the registry and both documents.
- **Owner** — `risk-modeling-scientist`.
- **Re-audit** — `pnpm model:validate` exits 0 and emits no uncalibrated percentage.

### Q4-07 · Row 5 · −4 · major · The §17 state matrix renders 11 of roughly 70 states

- **Input** — census of `data-state` / `data-dp-state` attributes across all 20 emitted pages.
- **Expected** — `DIRECTIVE.md §17`: "all implemented, all tested".
- **Observed** — eleven distinct values ship: `initial`, `searching`, `unavailable`,
  `billing_not_configured`, `empty`, `invalid_flight`, `multiple_matches`, `no_match`,
  `provider_unavailable`, `rate_limited`, `unknown`. The Trip, Billing and Notification families
  have no surface at all; Connection and Rights have demonstration panels rather than states.
- **Required fix** — the remaining families land with their phases.
- **Owner** — `frontend-ui-engineer`.
- **Re-audit** — the census returns every §17 value, and `tests/a11y/states.mjs` drives each one.

### Q4-08 · Row 5 · −1 · minor · Six §18.1 public routes are not emitted

- **Input** — `find apps/web/dist -name '*.html'` (20 pages).
- **Expected** — `/passenger-rights/{us,eu,uk,canada}/`, `/airlines/{,[slug]}`,
  `/airports/{,[slug]}`.
- **Observed** — none exist. `/passenger-rights/` exists as a single `noindex` page.
- **Required fix** — the jurisdiction and directory routes land with Phase 11's content wave.
- **Owner** — `frontend-ui-engineer` (shells), `content-editorial-lead` (bodies).
- **Re-audit** — the routes are emitted and each passes the content gate before it is indexable.

### Q4-09 · Row 6 · −1 · major · `name()` in the a11y regression runner is neither the accessible-name algorithm nor the rendered text

- **Input** — `tests/a11y/regressions.mjs:541`; measured in Chromium against the served build.
- **Expected** — a check that reports what a reader or a screen reader receives.
- **Observed** — `const name = (element) => (element.getAttribute('aria-label') ?? element.textContent ?? '')`.
  `textContent` ignores layout. Measured on `/flight-status/`, on
  `<dd class="dpp-row__value"><span>Scheduled</span><span class="dpp-row__note">Updated 96 minutes ago from Second demonstration fixture.</span></dd>`
  where `.dpp-row__note { … display: block }`:

  ```
  textContent: "ScheduledUpdated 96 minutes ago from Second demonstration fixture."
  innerText  : "Scheduled Updated 96 minutes ago from Second demonstration fixture."
  ```

  Seven `dd.dpp-row__value` elements on that one route report a `textContent` the page does not
  render. **At least two of the 24 observations currently awaiting `accessibility-lead`'s ruling are
  artifacts of the measurement, not defects of the product** — specifically the two
  `"ScheduledUpdated …" / "Updated 96 minutes ago from Second demonstration fixture."` lines under
  `<dt>Second demonstration fixture</dt>`. A ruling should not be made on them as they stand.

- **Required fix** — compute the name the way the platform does, or state in the runner that the
  pass is a `textContent` heuristic and filter block-level joins out of the observation list before
  it is handed to a reviewer.
- **Owner** — `qa-test-architect`; the §12 item 5 **ruling** remains `accessibility-lead`'s.
- **Re-audit** — re-run `pnpm test:a11y` and confirm no observation names a string that differs from
  the element's `innerText`.

### Q4-10 · Row 6 · −0.5 · minor · A zero-population gating pass is reported and the run still exits 0

- **Input** — `pnpm test:a11y`.
- **Expected** — a check that cannot fail does not contribute to a green verdict.
- **Observed** — the runner prints, correctly and prominently:

  ```
  1 check population(s) are ZERO on every surface in this run, so those assertions cannot fail here. This is not a pass:
    label-echo / dl-named-value — 0 across 23 surface(s)
  ```

  and then exits 0 with `Passing`. The `named` column is `0` on all 23 surfaces while `dl-rows` is
  243 and `pills` is 333. The disclosure is excellent — it is the
  piece of S4 that generalises furthest — but the suite still certifies itself green while one of
  its passes is inert.

- **Required fix** — a documented decision: either the zero population is expected (say so, and
  exempt it by name), or it fails the run. Silence in the exit code is the thing F46 exists to
  prevent.
- **Owner** — `qa-test-architect`; ruling `accessibility-lead`.
- **Re-audit** — `pnpm test:a11y` either names the exemption or exits non-zero on a zero population.

### Q4-11 · Row 6 · −1 · major · The Lighthouse gate is not wired into `pnpm quality` or CI

- **Input** — `package.json` scripts; `.github/workflows/ci.yml`; `node scripts/perf/lighthouse.mjs`.
- **Expected** — `DIRECTIVE.md §22` makes public Lighthouse ≥ 95/100/100/100 a performance
  requirement; §23 makes the check set the CI contract.
- **Observed** — `scripts/perf/lighthouse.mjs` exists, works, and **passes** when run by hand (I ran
  it: four indexable routes at `perf 100 a11y 100 bp 100 seo 100`). It appears in neither `quality`
  nor `ci.yml`; `grep -n lighthouse .github/workflows/ci.yml` returns nothing. A gate nobody runs is
  a measurement, not a gate.
- **Two sub-observations, neither deducted, both worth recording.**
  1. `/passenger-rights/` and `/guides/data-freshness-and-provider-limits/` score `seo 63`. The
     manifest replaces the category gate for those routes with a **stronger** assertion —
     `failingSeoAudits ≤ 0 allow: ["is-crawlable"]` — with the reason, the owner, the measurement
     date and the instruction _"When the route publishes, delete this override rather than editing
     the number."_ That is a tightened gate, not a softened one, and I am recording it so no later
     round mistakes the 63 for a defect.
  2. The default run covers 6 of 20 routes. `--routes all` exists.
- **Required fix** — add the Lighthouse gate to CI (it needs the Chromium that CI already installs).
- **Owner** — `platform-release-sre` (`.github/workflows/**`), `performance-engineer` (thresholds).
- **Re-audit** — `grep lighthouse .github/workflows/ci.yml` matches and the step is green.

### Q4-12 · Row 6 · −0.5 · minor · Twelve contrast nodes exposed by the state sweep have never been measured

- **Input** — `pnpm test:a11y`; `docs/TESTING.md §11` F-QA-3.
- **Expected** — every `incomplete` contrast node covered by the pixel measurement in
  `docs/ACCESSIBILITY.md §16.4`.
- **Observed** — `/ [error summary]` returns 36 `overlapped`-class nodes against the served route's
  29, and `/ [provider unavailable]` returns 34 — twelve nodes, both themes, outside every
  measurement. The runner re-derives and prints the delta every run and refuses to silence it in
  `baseline.json`, which is the right handling; the measurement is still owed.
- **Required fix** — measure the 12 nodes from rendered pixels and record them in
  `docs/ACCESSIBILITY.md §16.4`.
- **Owner** — `accessibility-lead`.
- **Re-audit** — `pnpm test:a11y` no longer prints an open re-measurement request.

### Q4-13 · Row 6 · −1 · major · Two of three rendering engines are unswept

- **Input** — `pnpm test:e2e`; `playwright.config.mjs`.
- **Expected** — WCAG conformance and responsive behaviour are claims about browsers, plural.
- **Observed** — only Chromium is installed here and CI installs _only_ Chromium by design
  (`- name: Install the pinned Chromium (only Chromium)`). WebKit and Mobile Safari are **Not run**
  anywhere, by anyone. iOS Safari is the single most common mobile browser for the audience this
  product describes — a traveler standing at a gate.
- **Required fix** — add a WebKit project, or record an explicit orchestrator decision not to, with
  the risk stated.
- **Owner** — `qa-test-architect` (projects), `platform-release-sre` (CI runners).
- **Re-audit** — a WebKit project runs green, or a dated decision exists.

### Q4-14 · Row 7 · −3 · major · Three of the four §24 security and privacy documents do not exist

- **Input** — `ls docs/`.
- **Expected** — `docs/SECURITY.md`, `docs/THREAT_MODEL.md`, `docs/PRIVACY.md`.
- **Observed** — all three absent. Sixteen of the thirty-one §24 documents are absent in total:
  `ARCHITECTURE`, `DATA_MODEL`, `API`, `RIGHTS_ENGINE`, `CONNECTION_ENGINE`, `MODEL_CARD`,
  `MODEL_TRAINING`, `PRIVACY`, `SECURITY`, `THREAT_MODEL`, `MONETIZATION`, `ADVERTISING`,
  `AFFILIATES`, `ANALYTICS`, `RUNBOOK` — and `QUALITY_REPORT`, which this file closes.
  The _user-facing_ privacy page `apps/web/src/pages/privacy.astro` is real and detailed; the
  engineering threat model is not.
- **Required fix** — the threat model is a Phase-7 prerequisite, not a Phase-13 write-up.
- **Owner** — `security-privacy-engineer`.
- **Re-audit** — all three files exist and `docs/THREAT_MODEL.md` enumerates the §22 security cases.

### Q4-15 · Row 7 · −2 · major · `pnpm test:security` has never exercised a single case

- **Input** — `pnpm test:security`.
- **Expected** — IDOR · CSRF · XSS · SQL injection · rate limit · enumeration · magic-link replay ·
  expired token · forged webhook · duplicate webhook · redirect allowlist · upload rejection · cache
  leak · CSP · secret scan.
- **Observed** — `pnpm test:security is not implemented yet. … Failing loudly rather than reporting
a false green.` Exits 1. Failing loudly is the right stub behaviour and is not itself the
  deduction; the absence of the coverage is.
  Partial credit is genuine: `e2e/csp-and-errors.e2e.mjs` asserts every route loads clean under the
  served CSP and carries its own seeded-inline-script self-test, and it runs in CI.
- **Required fix** — Phase 12.
- **Owner** — `security-privacy-engineer`.
- **Re-audit** — `pnpm test:security` exits 0 with IDOR, CSRF, forged-webhook and redirect-allowlist
  cases rejected.

### Q4-16 · Row 7 · −1 · minor · The private-route no-store rule is declared on one of two serving paths, and `_headers` has no owner

- **Input** — `apps/web/public/_headers`; `scripts/validate-security-headers.mjs` check E;
  `grep -o 'apps/web/public/[^,]*' docs/agents/ROSTER.md`.
- **Expected** — the checker's own stated rationale: _"Declaring the rule before the routes exist is
  the point — the guard cannot be forgotten on the day they land."_
- **Observed** — two things.
  1. Check E validates `/app`, `/auth`, `/checkout`, `/admin`, `/api` `Cache-Control` rules **in
     `vercel.json` only**. `apps/web/public/_headers` contains exactly one block, `/*`, and no
     `Cache-Control` at all. On the Cloudflare path the guard is satisfied today only incidentally,
     by the Worker: I probed `GET /app/` on `pnpm preview` and got `404` + `Cache-Control: no-store`
     from `apps/edge/src/index.ts:163`. The day a private route ships as a _static asset_, the
     declared guard is absent on that path and no check notices.
  2. `apps/web/public/_headers` **appears in no row of `docs/agents/ROSTER.md §3`**. It is the
     reference security policy that `apps/web/scripts/verify-dist.mjs`,
     `scripts/perf/serve-dist.mjs`, `tests/tools/serve-dist.mjs` and `tests/a11y/run-axe.mjs` all
     read rather than restate. The one file four gates depend on has no single writer, after a
     commit in this very branch (`86d5073`) whose subject is "five paths that were load-bearing and
     unowned".
- **Required fix** — (a) extend check E to `_headers`, or record why the Worker discharges it;
  (b) give `apps/web/public/_headers` an owner row.
- **Owner** — `platform-release-sre` (the checker); `build-orchestrator` (`docs/agents/**`).
- **Re-audit** — `grep '_headers' docs/agents/ROSTER.md` matches an ownership row, and the seeded
  divergence list gains a `_headers` private-cache case.

### Q4-18 · Row 8 · −1 · major · The content-quality gate does not exist, and an unreviewed page can be made indexable with nothing firing

- **Input** — I copied `apps/web/dist` and `apps/web/public` to a scratch tree, removed
  `<meta name="robots" content="noindex">` from `/guides/saving-receipts-and-evidence/`, added its
  URL to `sitemap.xml`, and ran `collectSite` + `runSuites` from `scripts/seo/test-seo.mjs` over the
  result.
- **Expected** — `DIRECTIVE.md §23` lists "content-quality gate" as a required check; §19 requires
  templates to stay `noindex` until they carry real source-backed content.
- **Observed** — **`findings: 0`**. The page has not been through `legal/factual review`, cites no
  verified source (every registry record is `unreachable`, Q4-04), and the suite is silent. What
  `test:seo` enforces is _consistency_ between the robots meta and the sitemap — genuinely valuable,
  and it caught six of six other seeded violations I threw at it (duplicate title, missing
  description, indexable `/app/**` route, a `Product`/`aggregateRating` JSON-LD block, a stale
  public-root copy, a sitemap/robots mismatch). It does not enforce whether a page _earned_
  indexability.
- **Note** — `docs/SEO.md §12` item 3 states this honestly and in advance. The deduction is for the
  missing check, not for a concealed one.
- **Required fix** — §7's thresholds as a script, wired into `pnpm quality` and CI, printing the
  count of pages downgraded to `noindex`.
- **Owner** — `seo-engineer` (script), `content-editorial-lead` (thresholds and review states).
- **Re-audit** — re-run my seed above; the gate must report a finding.

### Q4-19 · Row 8 · −0.5 · minor · Canonical and `og:url` are absent from 20 of 20 pages, so the criterion has never been exercised

- **Input** — `collectSite()` over `apps/web/dist`.
- **Expected** — unique canonicals; `og:url` per page.
- **Observed** — `with canonical: 0`, `with og:url: 0`. The runner reports it honestly:
  `canonical 0 page(s) carry one (PUBLIC_SITE_URL unset: the designed absent state, owner input I-4)`.
  This is a correctly-handled external blocker (it passes all six parts of the `AGENTS.md §1.6`
  test, §7.1 below) and is **not** a defect. It is deducted at half a point only because the row's
  "canonical correctness" criterion has no evidence behind it in either direction.
- **Required fix** — owner input I-4.
- **Owner** — repository owner; verified by `seo-engineer`.
- **Re-audit** — with `PUBLIC_SITE_URL` set, `pnpm test:seo` reports 20 unique canonicals.

### Q4-20 · Row 8 · −0.5 · minor · `docs/SEO.md §12` item 10 describes a defect this branch already fixed

- **Input** — `docs/SEO.md §12` item 10 at `HEAD`; `git show 3aca609 -- .env.example`.
- **Expected** — documentation in a branch describes that branch.
- **Observed** — §12 item 10 reads _"The `SEO_REQUIRE_SITE_URL` comment in `.env.example` **still
  describes** the pre-2026-09-20 fail-open … Until it lands, §10.1 above is the authoritative
  description."_ Commit `3aca609`, in this same branch, landed exactly that correction:
  `.env.example` now reads _"The vocabulary is CLOSED … Anything else — `yes`, `on`, `Y` — is
  refused … the build stops with `SiteUrlConfigError [invalid-switch]`."_ A reader following the
  document is sent to look for an open handoff that is closed.
- **Required fix** — delete or close item 10.
- **Owner** — `seo-engineer`.
- **Re-audit** — `docs/SEO.md §12` no longer claims the `.env.example` comment is uncorrected.

### Q4-21 · Row 9 · −1 · major · `verify-dist.mjs` cannot see an ad slot placed immediately **above** a rights card — the shape a real ad unit has

- **Input** — three seeds into a scratch `apps/web` tree holding a real copy of `dist`, run through
  the real `apps/web/scripts/verify-dist.mjs`.

  | Seed                                                                                              | Result                                                 |
  | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
  | `<div data-ad-placement=…></div>` immediately **after** `</section>` of `.dpp-rights`             | **exit 1** — "an ad slot is adjacent to a rights card" |
  | `<img data-ad-placement=… >` (void, no closing tag) immediately **before** the rights `<section>` | **exit 1** — same finding                              |
  | `<div data-ad-placement=…></div>` immediately **before** the rights `<section>`                   | **exit 0 — `0 findings`**                              |

- **Expected** — `AGENTS.md §4` forbids a slot "inside or adjacent to a rights card or action
  checklist", in both document directions. `DIRECTIVE.md §20` agrees.
- **Observed** — `apps/web/scripts/verify-dist.mjs`, `adjacentTo()`:

  ```js
  const slotEnd = html.indexOf('>', offset)
  return slotEnd !== -1 && slotEnd < start && isBlank(html.slice(slotEnd + 1, start))
  ```

  In the "slot precedes container" branch the slot's end is taken as the end of its **opening tag**,
  so the slot's own `</div>` falls inside the gap, `isBlank()` returns false, and the clause never
  fires. Every real ad unit is a container element — AdSense's documented shape is
  `<ins class="adsbygoogle">…</ins>` — so the clause is inert in the before-direction for every slot
  the product would actually emit. The self-test's "ad adjacent to a rights card" case uses
  `${RIGHTS}\n  ${AD}`, the **after** direction only, so it is green while half the rule is dead.

- **This is the F-QA-2 shape, one file over.** A seeded proof shows the wiring; only the shape the
  product emits shows the coverage.
- **Mitigation, measured, not assumed** — the independent DOM detector in
  `e2e/pages/ad-placement.mjs:176` tests `previousElementSibling === slot || nextElementSibling === slot`
  and **does** catch it. I inserted the same slot before `.dpp-rights` in Chromium and ran
  `auditAdPlacement`: `violations: 1 — inside a rights card | div is an immediate sibling of a rights
card`. That detector runs in CI. Severity is therefore major, not critical — and the comment in
  `e2e/pages/ad-placement.mjs:22` that "the two checks agree today because nothing is placed" is now
  known to be false.
- **Required fix** — compute the slot's element end (the file already has `closingIndex()` and uses
  it four lines earlier for the named-control pass).
- **Owner** — `frontend-ui-engineer` (`apps/web/scripts/**`, `ROSTER.md §3`).
- **Re-audit** — seed a `<div data-ad-placement>…</div>` immediately before the rights `<section>`;
  `verify-dist` must exit 1.

### Q4-22 · Row 9 · −1 · major · `ads.txt` does not exist

- **Input** — `ls apps/web/public/ads.txt`; `pnpm test:seo` public-root line.
- **Expected** — `apps/web/public/ads.txt` containing exactly
  `google.com, pub-9029421562757873, DIRECT, f08c47fec0942fa0`.
- **Observed** — absent. `test:seo` reports it: `ads.txt absent (monetization-partnerships-engineer)`.
  The absence is disclosed and attributed, which is why this is major rather than critical; the file
  is named in the rubric row and in `DIRECTIVE.md §23`'s deploy verification list.
- **Required fix** — ship the file, or record a dated decision not to publish a seller declaration
  while no ad serves, with the deploy-verification step adjusted to match.
- **Owner** — `monetization-partnerships-engineer`.
- **Re-audit** — `curl https://delaypilot.app/ads.txt` returns the exact line, or the decision exists.

### Q4-23 · Row 9 · −0.5 · minor · The three §24 monetization documents do not exist

- **Observed** — `docs/MONETIZATION.md`, `docs/ADVERTISING.md`, `docs/AFFILIATES.md` all absent.
  The user-facing `advertising-policy.astro` and `affiliate-disclosure.astro` pages are real and
  carry the §26 affiliate sentence; the engineering policy documents that the ad code is supposed to
  be reviewed against are not.
- **Owner** — `monetization-partnerships-engineer`.
- **Re-audit** — all three exist and `docs/ADVERTISING.md` enumerates the §20 placement clauses the
  two detectors implement.

### Q4-24 · Row 10 · −1 · **critical (C-1)** · `main` is unprotected and no status check is required, while merging to `main` is a production deploy

- **Input** — `curl https://api.github.com/repos/kevynsgrin-a11y/DelayPilot/branches/main`, run by
  me this session.
- **Expected** — `DIRECTIVE.md §23`: "production only from the protected branch".
- **Observed** —

  ```json
  {
    "name": "main",
    "protected": false,
    "protection": {
      "enabled": false,
      "required_status_checks": { "enforcement_level": "off", "contexts": [], "checks": [] }
    }
  }
  ```

  `.github/workflows/ci.yml:170` carries the comment _"RENAMING THIS JOB CHANGES THE
  REQUIRED-STATUS-CHECK NAME in branch protection for `main`"_ — protection the repository does not
  have. `docs/DEPLOYMENT.md` contains no occurrence of "branch protection", "protected branch" or
  "required status check". Eleven CI checks run and none of them can stop a merge; decision D1 makes
  that merge a production deploy.

- **Why this is critical rather than major** — the harm is not hypothetical. It is the mechanism by
  which the header defect in C-2 survived nine days after being correctly diagnosed and "fixed".
  The release gate's clause "all required checks passing" cannot be satisfied at all while no check
  is required.
- **Required fix** — enable branch protection on `main` with the `Verify (11 of the 18 DIRECTIVE.md
§23 checks)` job as a required status check, and document it in `docs/DEPLOYMENT.md`.
- **Owner** — repository owner (the setting); `platform-release-sre` (the documentation and the
  job-name contract).
- **Re-audit** — the API returns `"protected": true` with that context listed.

### Q4-25 · Row 10 · −1 · major · Seven of the eighteen §23 required checks are absent from CI

- **Input** — `.github/workflows/ci.yml`, read step by step.
- **Observed** — CI runs 11: frozen-lockfile install, format, lint, typecheck, unit, web build, edge
  build, SEO validation, accessibility smoke, Playwright, bundle budgets (plus three unnumbered
  extras: build-system validation, security-header parity, contrast and image budgets). Absent:
  **property tests** (no distinct step), **Workers integration**, **migration validation**,
  **rights-rule validation**, **content-quality gate**, **dependency audit**, **secret scan**. The
  job title says `Verify (11 of the 18 DIRECTIVE.md §23 checks)` — the claim is accurate and I
  verified it rather than accepted it.
- **Also recorded, not separately deducted** — the `visual` Playwright project is excluded from CI
  by design: `pnpm test:e2e --project=desktop --project=mobile-375`, commented
  `visual is a local check`. That is **69 of 237 tests**, and `docs/TESTING.md §5`/§9 say so
  plainly (_"Exists — §5 — and it is not a CI gate"_). Visual regression therefore exists and is not
  CI-enforced; row 10 is scored on that basis rather than on the existence of 69 baselines.
- **Required fix** — the four checks whose subject matter exists (property, dependency audit, secret
  scan, content gate) can land now; three wait on their phases.
- **Owner** — `platform-release-sre`, with `qa-test-architect` and `security-privacy-engineer`.
- **Re-audit** — the CI job name states a larger fraction and the steps exist.

### Q4-26 · Row 10 · −0.5 · minor · No runbook, no rollback procedure, no analytics document; `pnpm smoke` is a stub

- **Observed** — `docs/RUNBOOK.md` and `docs/ANALYTICS.md` absent. `pnpm smoke` exits 1 with an
  honest stub message. `deploy.yml` does contain a real post-deploy smoke step that retries
  `/api/v1/health` five times and asserts all six security headers on the deployed homepage — good
  work, and it has never executed, because the job is gated on
  `needs.guard.outputs.armed == 'true'` and no Cloudflare credential exists.
- **Owner** — `platform-release-sre`.
- **Re-audit** — `docs/RUNBOOK.md` exists with a rollback procedure, and `pnpm smoke` exits 0
  against a running preview.

---

## 5. Critical-defect list

Criticals block the release regardless of score.

### C-1 — `main` is an unprotected production deploy path with zero required checks

Full record at **Q4-24**. Category: security / operations. Owner: repository owner +
`platform-release-sre`.

### C-2 — The deployed origin serves no Content-Security-Policy, and the fix has never reached the deploying branch

- **Input** — `git show origin/main:apps/web/vercel.json`; `git show origin/main:vercel.json`;
  the decoded Vercel integration metadata (below).
- **Expected** — `delaypilot.app` serves the six-header policy.
- **Observed** — three facts, each verified by me this session.
  1. `git show origin/main:apps/web/vercel.json` → **file does not exist on `origin/main`**.
  2. `origin/main`'s root `vercel.json` declares four headers — `X-Frame-Options`,
     `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security` — and **no CSP** and
     no `Permissions-Policy`. Its `X-Frame-Options` is `SAMEORIGIN`, not `DENY`.
  3. Vercel's Root Directory is `apps/web`. `docs/DEPLOYMENT.md §2.1` states this and says the
     writing session could not fetch the evidence. **I fetched it.** From the `vercel[bot]` comment
     on PR #21 via the GitHub API, the `[vc]:` payload decodes to:

     ```json
     {
       "isMonorepo": true,
       "type": "github",
       "projects": [
         {
           "name": "delaypilot",
           "projectId": "prj_cw05bF1hLnrxJV7tqOJ84Frt1x8g",
           "previewUrl": "delaypilot-git-claude-intellig-51e571-kevynsgrin-a11ys-projects.vercel.app",
           "nextCommitStatus": "DEPLOYED",
           "rootDirectory": "apps/web"
         }
       ]
     }
     ```

  Taken together: the production build reads `apps/web/vercel.json`, that file is absent from the
  deployed branch, and the repository-root file Vercel does not read is the only one that carries
  any header at all. The live origin is protected by whatever Vercel adds of its own accord.
  This matches the `curl -I https://delaypilot.app/` probe recorded on PR #16, which returned
  `strict-transport-security` and nothing else.

- **Status of the fix** — S4 closes it correctly. `apps/web/vercel.json` and the repository-root
  copy both now carry all six headers; `node scripts/validate-security-headers.mjs --self-test`
  passes with `6 seeded divergence(s) caught, live policy clean`; and I observed the policy from a
  real server on the **Cloudflare** path (§6.2). The fix is **unshipped** and the **Vercel**
  response has still been observed by nobody.
- **Why it is critical anyway** — the gate scores the state of the product, and the product users
  receive today has no CSP, no `Permissions-Policy`, and `X-Frame-Options: SAMEORIGIN`. It clears
  only when the fix is on the branch that deploys and a response has been read.
- **Owner** — `platform-release-sre`; shipping it is the repository owner's merge.
- **Re-audit** — `curl -sSI https://delaypilot.app/ | grep -i -E 'content-security-policy|permissions-policy|x-frame-options'`
  returns all three with the values in `apps/web/vercel.json`.

### Criticals I looked for and did not find

Recorded as negatives because a negative result is a result:

- No fabricated operational fact (§5.1).
- No uncalibrated percentage anywhere in the UI (§5.2).
- No legal overclaim, no compensation figure presented as owed (§5.4).
- No visible production placeholder, no dead control (§5.3).
- No indexable private route (§5.6).
- No PNR field, column, URL parameter, log field or analytics property (§5.8).
- No ad adjacent to a control — because no ad ships, asserted rather than assumed (§5.5).

---

## 6. Hunt-list sweep

All seven categories swept. Negative results are stated.

### 6.1 Fabricated live data — **clean**

- `Math.random()` across `apps/`, `packages/`, `scripts/`, `tests/`, `e2e/`: **0 occurrences**.
- Provenance census over all 20 built pages:

  | `data-provenance` | count | chip label            |
  | ----------------- | ----- | --------------------- |
  | `demo`            | 28    | `Demo`                |
  | `heuristic`       | 10    | `Heuristic risk band` |
  | `unavailable`     | 6     | `Unavailable`         |
  | `stale`           | 4     | `Stale`               |
  | `live`            | 2     | `Live`                |
  | `cached`          | 2     | `Cached`              |

  All six labels used, spelled exactly as `AGENTS.md §1.2` writes them, no synonyms, none softened.

- **I read the demo gate rather than trusting its name.** Every `Live` and `Cached` chip in the
  build sits inside `<ul class="dpx-provenance-legend" data-provenance-legend>` on `/` and
  `/data-sources/`, where it labels the vocabulary and is accompanied by its `provenanceMeanings`
  sentence. **No `Live` or `Cached` chip labels a datum anywhere.** The numbers that do render —
  `Estimated delay 47 minutes`, `08:20`, `DM1`, `DM2` — are fixture values behind a `Demo` chip with
  `Demo data — not a live flight.` in the same panel, using the synthetic identifiers `§28` requires.
- I proved the demo-caption check fires on the real markup: deleting the §28 sentence from
  `/flight-status/` in a scratch copy produced `verify-dist: 7 finding(s)` and exit 1.

### 6.2 Fake probabilities — **clean**

- Rendered text of all 20 pages searched for `\d+%`, "chance", "odds", "likelihood", "probabilit\*":
  **zero numeric percentages**, **zero** "chance", **zero** "odds". "probability" appears 28 times
  and every occurrence is the product saying it is _not_ showing one — _"no validated calibrated
  model is deployed, so DelayPilot shows the band and the factors behind it and no probability."_
  "likely" appears 7 times, all as the `likely_applies` status.
- Every `aria-value*` attribute in the build: `aria-valuetext="44 of 51 minutes, Watch"`,
  `"69 of 51 minutes, At risk"`, `"Risk band, Disrupted"`, `"Risk band, Watch"`,
  `"Slack unknown, Unknown"`. Minutes and bands; no probability, no confidence interval.
- `P_miss = P(D + T > W)` is not emitted, and correctly so — there is no validated distribution.
  The monotonicity properties are **not asserted** because there is no implementation to assert
  against (Q4-05).

### 6.3 Visible placeholders — **clean**

- `TODO`, `FIXME`, `coming soon`, `lorem`, `Example Domain`, `example.com`, `XXX`, `TBD`, `{{`
  across all built HTML: **0** each. `placeholder` and `disabled` each match once, both in
  editorial prose on the policy pages, neither a UI state.
- **What grep misses, checked separately.** Five distinct `<button>` shapes ship; every one carries
  a real target (`type="submit"`, `data-dp-drawer-open`, `data-dp-drawer-close`,
  `data-dp-menu-trigger` ×2) and every one is exercised by `e2e/keyboard-walk.e2e.mjs` in both CI
  projects. One `disabled` occurrence, in prose. No chart is drawn from constants — the progress
  meters carry measured `aria-valuenow`/`aria-valuemax` pairs. No route renders an empty shell:
  `verify-dist` checks 20 pages and `test:seo` finds `visibleText === ""` on 0 of 20.
- The `[hidden]` regression that S4 fixed is really fixed: `[hidden]{display:none!important}` is in
  the shipped CSS and `e2e/hidden-states.e2e.mjs` sweeps every route for any `[hidden]` element whose
  computed `display` is not `none` — 107 elements across 23 surfaces, all `none`.

### 6.4 Legal overclaim — **clean**

- All eight forbidden phrases, across source **and** built output: **0 hits**. The only matches
  anywhere in the repository are inside `apps/web/src/lib/copy/lint/fixtures/violating/`, which is
  the lint's own negative fixture and is allowlisted.
- I proved the lint fires on real product markup rather than only on its fixtures: I copied
  `apps/web/src/components/DemoCockpit.astro` into a scratch root, seeded one sentence, and ran the
  real CLI — `DemoCockpit.astro:402:4 <the §1.3 entitlement pattern> [AGENTS.md §1.3 — never
overclaim legally]`, exit 1. Its scan roots cover `.astro`, `.ts`, `.tsx`, `.html` and 30 other extensions, 302 files.
- Rights statuses: `likely_applies`, `may_apply`, `not_indicated`, `cannot_determine`,
  `future_rule_not_active` — all five present, no sixth.
- EU 2026 reform: stored and described as not in force. `/passenger-rights/` carries
  `adopted_not_effective`; `/` and `/terms/` say "not yet in force"; `/methodology/` frames it as
  "Current rule and adopted reform" and names the Official Journal condition. **No early activation.**
- **No compensation band is rendered anywhere.** A search of all built pages for `€250`/`€400`/`€600`,
  `£220`/`£350`/`£520`, and `CAD 400/700/1,000` patterns returns **zero matches**. There is nothing
  to present as owed because nothing is presented at all.
- Provider disruption reasons: none render, because no provider is connected. Weather is not
  converted into an extraordinary circumstance anywhere — `/flight-status/` ships
  `The disruption cause has not been verified.` as a designed `unknown` state.

### 6.5 Ads adjacent to controls — **clean in the product, one inert clause in a gate**

- **Zero ad slots in the build**: `data-ad-placement` and `dp-ad-slot` each match 0 times across all
  20 pages, and `e2e/ad-placement.e2e.mjs` asserts it as a named test rather than assuming it.
- No paid surface exists yet, so ad-free-by-plan is untestable; no timer refresh, no background-poll
  refresh, no itinerary field reaching an ad or affiliate parameter — all vacuously true, and I am
  recording them as vacuous rather than as passes.
- Affiliate: `affiliate-disclosure.astro` carries the §26 affiliate sentence and states plainly that
  there are no partners and nothing is earned. No affiliate link ships, so `rel="sponsored nofollow"`
  has a population of zero.
- `ads.txt`: **absent** → Q4-22.
- `verify-dist.mjs` before-direction adjacency: **inert** → Q4-21.

### 6.6 Indexable private routes — **clean, with a population of zero**

- `pnpm test:seo` reports `sitemap 13 entr(ies) = the indexable set, 0 noindex, 0 private, 0 flight
instances`. **There are no private routes in the build** — no `/app/**`, `/auth/**`, `/checkout/**`
  or `/admin/**` page exists — so "no private route is indexable" is true and examines nothing.
- The check is not vacuous _by construction_, which I verified: I created `/app/index.html` in a
  scratch dist and the suite produced three findings —
  `robots.private-route-indexable: a private route (AGENTS.md §2) is missing "noindex" … "nofollow" …
"noarchive"`.
- `X-Robots-Tag` on those prefixes is not served by either path today. `docs/SEO.md §12` item 4
  states this and correctly notes the header would currently apply to nothing.
- Sitemap: 13 entries, all absolute `https://delaypilot.app` URLs with a trailing slash, 0
  duplicates, all present in the build, all indexable. Titles and descriptions unique, 20 of 20.
  No live flight-instance page exists; no demo state is indexed as a flight page.

### 6.7 Unverified command-pass claims — **no discrepancy found**

I re-ran every gate the S4 commit messages assert. Each claim held:

| Commit    | Claim                                                        | My result                                                                         |
| --------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------- |
| `903db2a` | four loud stubs replaced by real scripts                     | confirmed — `test:a11y`, `test:e2e`, `test:seo`, `perf:budgets` all run and pass  |
| `f72341d` | "a real `test:seo`"                                          | confirmed — 46 self-test checks, and 7 of 7 of my own real-dist seeds fired       |
| `79f68dd` | "136 checks", budgets that "prove they fail"                 | confirmed — 136 passed; my four seeds produced 1, 1, 7 and 7 breaches, exit 1     |
| `bd90057` | header policy declared where the platform reads it           | confirmed in the files; **unobserved on the Vercel response** (C-2)               |
| `80f71b5` | browser suites that run on the built site                    | confirmed — 236 passed, 1 skipped                                                 |
| `1bc93a7` | the guard no longer skips itself on a mistyped switch        | confirmed via `3aca609`'s corrected `.env.example` wording                        |
| `acd1ec6` | CI runs the gates S4 built                                   | confirmed — 11 numbered steps plus four unnumbered validators                     |
| `2655763` | the CI header stops asserting things that stopped being true | confirmed — job name reads `Verify (11 of the 18 DIRECTIVE.md §23 checks)`        |
| `27764f3` | the hidden attribute works again                             | confirmed — `[hidden]{display:none!important}` in shipped CSS; 107 elements swept |
| `49be154` | a check inert since it was written, now closed               | confirmed — 243 rows and 111 label words examined per run, up from 0 of 120       |

**One documentation discrepancy**, not a command claim: `docs/SEO.md §12` item 10 contradicts
`.env.example` at `HEAD` → Q4-20.

### 6.8 The standing sweep

| Item                                                               | Result                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No PNR anywhere                                                    | **Clean** — 0 fields, columns, parameters, logs. Only policy-page promises never to ask for one.                                                                                                                                                                                                                                                                   |
| No email / name / itinerary / receipt / raw IP in logs, titles, OG | **Clean** — `test:seo` `privacy.email-in-metadata`, `privacy.ticket-identifier`, `privacy.query-in-url` all present and self-tested; 0 findings on the real build                                                                                                                                                                                                  |
| Independence disclaimer in every public footer                     | **Present on 20 of 20**, and the presence is asserted: deleting it produced 19 findings and exit 1. **But** the assertion is `html.includes(INDEPENDENCE)` anywhere in the document, not in the footer, so on `/terms/` — which quotes the sentence in a `<blockquote>` — the footer copy is unguarded. Recorded under §6.9.                                       |
| §26 disclaimers near their results                                 | **Present today** — both rights cards carry the rights sentence inside the card. **Not asserted** — see §6.9.                                                                                                                                                                                                                                                      |
| Six provenance labels, no invented synonyms                        | **Clean** (§6.1)                                                                                                                                                                                                                                                                                                                                                   |
| Every §17 state reachable and rendered                             | **11 of ~70** → Q4-07                                                                                                                                                                                                                                                                                                                                              |
| All 20 §22.6 E2E flows present and asserting                       | **Approximately 3 of 20** partially: anonymous lookup (form + states, no backend), provider outage (the `unavailable` state), mobile navigation (drawer). Account, trip, connection, rights, alerts, Trip Pass, billing portal, evidence packet, family, delete, export, deletion request, admin source review, offline saved trip: **absent**. Folded into Q4-02. |
| No unlicensed logo beside an airline/airport/regulator name        | **Clean** — `apps/web/public/brand/` holds only DelayPilot's own mark and logotype; zero third-party image references in `dist`                                                                                                                                                                                                                                    |

### 6.9 One more gate gap found while sweeping: the §26 disclaimers are detected for drift, never for presence

- **Input** — I deleted the rights disclaimer from all five pages that carry it, in a scratch copy of
  the real `dist`, and ran the real `verify-dist.mjs`.
- **Expected** — a finding. `DIRECTIVE.md §26` requires the five sentences "placed near the relevant
  result — not only in the footer".
- **Observed** — **`verify-dist: 20 page(s) and 4 chunk(s) checked, 0 findings`**, exit 0. The cause
  is `checkFixedSentences()`:

  ```js
  const opening = sentence.split(' ').slice(0, 6).join(' ')
  if (!text.includes(opening) || text.includes(sentence)) continue
  ```

  The check is _conditional on the sentence already being roughly present_. It is a character-drift
  detector — and an excellent one; it catches a curly apostrophe — but it asserts nothing about
  presence. Rewording the sentence on five pages also produced 0 findings. Only
  `apps/web/test/patterns.test.tsx:429` asserts the rights sentence at all, and it asserts it in a
  component unit test, not in the built page.

- **Combined with the footer-scope finding above**: the two sentence guarantees the product most
  depends on are, respectively, unasserted and asserted with the wrong scope.
- **Severity** — major as a _gate_ gap; **not** a live product defect: both rights cards, both
  `dpp-actions` checklists and the four `flightData`/`prediction`/`connection` surfaces carry their
  sentences today, which I verified by extracting each `.dpp-rights` section and searching inside it.
- **Required fix** — assert presence per surface class, and scope the independence check to the
  footer element rather than to the document.
- **Owner** — `frontend-ui-engineer` (`apps/web/scripts/**`). Placement conformance is
  `trust-compliance-officer`'s to rule on.
- **Re-audit** — delete the rights sentence from `/passenger-rights/` in a dist copy; `verify-dist`
  must exit 1. Delete only the `<p class="dpx-footer__disclaimer">` from `/terms/`; it must exit 1.
- **Deduction id** — folded into **Q4-21**'s row as a second finding under the same owner and file;
  scored there, not twice.

---

## 7. Fixture-fidelity audit — "which checks prove they can fail against a fixture the product does not produce?"

This is F-QA-2's question asked of every self-testing harness in the repository. Each answer below
was **measured**, by seeding a defect into a copy of the real build or the real source and running
the real checker, never by reading the checker and reasoning about it.

| Harness                                      | Self-test fixture                                                              | Fidelity to the product                                      | Verdict                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/validate-security-headers.mjs`      | **the four real files on disk**, mutated in memory                             | perfect — the fixture _is_ the product                       | **Sound.** It even refuses a vacuous seed: `if (JSON.stringify(seeded) === JSON.stringify(base))` → _"the seed changed nothing; the case is vacuous."_ This is the model the others should copy.                                                                                                                          |
| `apps/web/src/lib/copy/lint`                 | markdown fixtures **plus** a full scan of 302 real files                       | high                                                         | **Sound.** Proven: seeded one §1.3 entitlement phrase into a real `.astro` component → hit, exit 1.                                                                                                                                                                                                                       |
| `scripts/perf/check-budgets.mjs`             | none; 136 assertions over the real `dist`                                      | high — detects `<astro-island`, the tag Astro actually emits | **Sound.** Proven: 4 seeds (island, inline script, +300 KB JS, +300 KB CSS) → 1, 1, 7, 7 breaches, exit 1. Also rejects unknown CLI options with exit 2.                                                                                                                                                                  |
| `scripts/seo/test-seo.mjs`                   | `sampleModel()` — a **hand-built 4-page object literal**, not parsed from HTML | **the extractor is never exercised by the self-test**        | **Sound in practice, structurally fragile.** 46 checks pass on a synthetic model that `parsePage()` never produced. I closed the gap empirically: 7 of 7 seeds into the **real** `dist` fired correctly. The risk stands — a change to `parsePage()`'s regexes would leave all 46 green while the suite examined nothing. |
| `apps/web/scripts/verify-dist.mjs`           | 32 inline HTML string fixtures                                                 | **mixed**                                                    | **One clause inert.** Containers (`<section class="dp-card dp-card--raised dpp-rights ">`, `<div class="dpp-state …">`, `<form data-dp-lookup>`) match the product exactly, and I verified each. But the adjacency fixture tests one direction only → **Q4-21**, and `checkFixedSentences` tests drift only → **§6.9**.   |
| `tests/a11y/regressions.mjs` + `run-axe.mjs` | 8 `--seed-violation` init scripts injected into the live DOM                   | **high, and deliberately repaired this session**             | **Sound.** The `label-echo` seed was rewritten to be a status pill rather than a bare span _because_ the old seed proved a mechanism the product never used. This is the fix F-QA-2 produced.                                                                                                                             |
| `e2e/pages/ad-placement.mjs`                 | slots seeded into the **live DOM** against real `.dpp-rights` / `.dpp-actions` | high — geometry and CSS pixels, not bytes                    | **Sound**, and strictly stronger than the byte-offset detector. It catches the case Q4-21 misses.                                                                                                                                                                                                                         |
| `e2e/csp-and-errors.e2e.mjs`                 | a seeded inline `<script>` in a real page under the real served policy         | high                                                         | **Sound.**                                                                                                                                                                                                                                                                                                                |
| `e2e/keyboard-walk.e2e.mjs`                  | a real focus ring removed at runtime                                           | high                                                         | **Sound.**                                                                                                                                                                                                                                                                                                                |

### 7.1 Two structural lessons for the orchestrator

1. **The strongest self-test reads the product and mutates it; the weakest builds its own world.**
   `validate-security-headers.mjs` seeds into the bytes on disk and refuses a no-op seed.
   `test-seo.mjs` builds a four-page object literal. Both report the same word. Only one of them
   would notice if the thing that produces the model stopped producing it.
2. **A vacuity guard is cheap and nobody else has one.** One harness in nine asserts that its seed
   actually changed something. Adding that single line to the other eight would have caught F-QA-2
   on the day it was written, and would catch Q4-21 today.

---

## 8. Population census — where a check matched nothing

`F46`'s argument, applied across the gates. A check that matched zero elements prints the same word
as a check that passed.

| Gate                                    | Reports populations?                                                                       | Populations that are zero                                                                                                                                                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/a11y/run-axe.mjs`                | **Yes**, per check per route, with a floor check and an explicit "this is not a pass" line | `label-echo / dl-named-value` = 0 across 23 surfaces (reported; run still exits 0 → Q4-10). `live` = 0, which for a forbidding rule is the pass.                                                              |
| `scripts/seo/test-seo.mjs`              | **Partly** — a per-suite summary line, no per-check counts                                 | **canonical = 0 of 20** (disclosed, I-4). **og:url = 0 of 20.** **private routes = 0** — "no private route indexable" examines nothing. `ads.txt`, `security.txt`, IndexNow key all absent and each is named. |
| `apps/web/scripts/verify-dist.mjs`      | **No** — prints `20 page(s) and 4 chunk(s) checked` only                                   | **ad slots = 0**, so all seven positional clauses examine nothing. `data-fixture` = 22 and `data-provenance="demo"` = 28, both real. §26 drift = only reaches sentences already present (§6.9).               |
| `scripts/perf/check-budgets.mjs`        | **Partly** — a three-line summary, no per-check counts                                     | none zero: 20 routes, 4 scripts, 2 font faces, 1 stylesheet all measured                                                                                                                                      |
| `scripts/validate-security-headers.mjs` | **Yes** — `6 headers, 4 policies` and the compared file list                               | none zero                                                                                                                                                                                                     |
| `e2e/ad-placement.e2e.mjs`              | **Yes** — asserts the zero explicitly as a named test                                      | ad slots = 0, **asserted rather than assumed**, which is the right handling of a zero population                                                                                                              |
| `apps/web/src/lib/copy/lint`            | **Yes** — `302 files scanned, 5 skipped`                                                   | none zero                                                                                                                                                                                                     |

**Recommendation to `build-orchestrator` (not a deduction):** the a11y runner's population table and
its zero-population floor check are the pattern the other gates should copy. Porting those two lines
to `verify-dist.mjs` and `test-seo.mjs` would convert three currently-silent zeros into printed ones.

---

## 9. What CI actually enforces

Scored on this basis, not on what exists in the tree.

| Layer                                                                                               | Exists    | Runs in CI       | Can block a merge           |
| --------------------------------------------------------------------------------------------------- | --------- | ---------------- | --------------------------- |
| format, lint, typecheck, unit (888)                                                                 | yes       | yes              | **no** (C-1)                |
| web build + edge build                                                                              | yes       | yes              | **no**                      |
| `verify-dist` 32 self-tests + 20 pages                                                              | yes       | yes (in `build`) | **no**                      |
| security-header parity (6 seeded)                                                                   | yes       | yes              | **no**                      |
| contrast + image budgets                                                                            | yes       | yes              | **no**                      |
| `test:seo` (46 self-tests)                                                                          | yes       | yes              | **no**                      |
| `test:a11y` (92 axe runs, 135 assertions)                                                           | yes       | yes              | **no**                      |
| Playwright desktop + mobile-375 (168)                                                               | yes       | yes              | **no**                      |
| Playwright **visual** (69)                                                                          | yes       | **no**           | no                          |
| `perf:budgets` (136)                                                                                | yes       | yes              | **no**                      |
| Lighthouse gate                                                                                     | yes       | **no**           | no                          |
| interaction latency                                                                                 | yes       | **no**           | no (deliberately not gated) |
| `test:workers`, `test:security`, `smoke`, `model:validate`, `db:migrate:local`                      | **stubs** | no               | no                          |
| property, migration validation, rights-rule validation, content gate, dependency audit, secret scan | **no**    | no               | no                          |

237 Playwright tests exist; 168 run in CI; **0 can block a merge**.

---

## 10. External blockers, each against the six-part `AGENTS.md §1.6` test

| Blocker                                                               | Adapter                                                                   | Config contract                                             | `.env.example`                        | Demo path                                                          | Fail-closed                                      | Activation steps            | Verdict                                                                                                                                                       |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **I-4** `PUBLIC_SITE_URL`                                             | ✅ `apps/web/src/lib/seo/site-url.mjs` (358 lines) + `site-url-guard.mjs` | ✅ closed vocabulary, `SiteUrlConfigError [invalid-switch]` | ✅ documented, corrected in `3aca609` | ✅ canonical/og:url omitted, labelled as the designed absent state | ✅ `site-url-guard.mjs` fails a production build | ✅ `docs/SEO.md §10.1`      | **Passes 6/6 — legitimate blocker**                                                                                                                           |
| **I-3** `PUBLIC_CONTACT_EMAIL`                                        | ✅ `routes.ts` conditional emission                                       | ✅                                                          | ✅                                    | ✅ `/contact/` and `/accessibility/` simply do not exist           | ✅ no placeholder address is permitted           | ✅                          | **Passes 6/6**                                                                                                                                                |
| **I-8** egress to 18 regulator hosts                                  | ✅ registry shape exists                                                  | ✅                                                          | n/a                                   | ✅ `dpp-rights__source-offline` renders 9×                         | ✅ nothing publishes while `unreachable`         | ✅ `docs/BUILD_PLAN.md:386` | **Passes — but see Q4-04: it gates the whole rights surface**                                                                                                 |
| **I-6** human editorial review to publish guides                      | ✅ editorial states                                                       | ✅                                                          | n/a                                   | ✅ `publishable` pages serve `noindex`                             | ✅                                               | ✅                          | **Passes 6/6 — human approval, correctly modelled**                                                                                                           |
| **Cloudflare account id + API token**                                 | ✅ `deploy.yml` guard job publishes `armed`                               | ✅                                                          | ✅                                    | ✅ the whole deploy job is skipped                                 | ✅                                               | ✅                          | **Passes 6/6**                                                                                                                                                |
| **Egress to `delaypilot.app` / `*.vercel.app` from this environment** | n/a                                                                       | n/a                                                         | n/a                                   | n/a                                                                | n/a                                              | ✅ §10.1 below              | **Environmental, not a product blocker. Owner-verifiable.**                                                                                                   |
| **Branch protection on `main`**                                       | —                                                                         | —                                                           | —                                     | —                                                                  | —                                                | ❌ not documented anywhere  | **Fails — this is C-1, not an external blocker.** A GitHub setting the owner can change in thirty seconds is not the same kind of thing as a paid credential. |

### 10.1 The exact command the owner must run before merging

Egress to the deployed origin is denied in every agent session in this repository, so this cannot be
closed by any agent. It closes with one command, against the preview host I decoded from Vercel's
own metadata in §5 C-2:

```bash
# On the Vercel preview for this branch, before merging:
curl -sSI https://delaypilot-git-claude-intellig-51e571-kevynsgrin-a11ys-projects.vercel.app/ \
  | grep -i -E 'content-security-policy|strict-transport-security|x-frame-options|x-content-type-options|referrer-policy|permissions-policy'
```

Expected: six lines, with `content-security-policy: default-src 'self'; script-src 'self'; …` and
`x-frame-options: DENY`. Anything fewer means `apps/web/vercel.json` is not the file Vercel read,
and C-2 is not closed.

### 10.2 What I _was_ able to observe from a server

Not nothing — and it is worth recording precisely what it does and does not prove.

`pnpm preview` starts the real Worker with the real static-asset pipeline, and wrangler logs
`✨ Parsed 1 valid header rule.` — it reads `apps/web/public/_headers` the way Cloudflare does.
`curl -D - http://localhost:8787/` returned:

```
HTTP/1.1 200 OK
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
content-security-policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
permissions-policy: geolocation=(), camera=(), microphone=(), payment=()
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
x-frame-options: DENY
```

and `GET /api/v1/health` returned the same six plus `Cache-Control: no-store` and
`{"status":"ok","service":"delaypilot-edge","time":"2026-09-20T18:21:12.605Z"}`.

**This is the first time any of the six headers has been observed leaving a server rather than
inferred from four files agreeing with each other.** It proves the `_headers` half and the Worker
half. It proves **nothing** about Vercel, which is what serves `delaypilot.app`, ignores `_headers`
entirely, and reads only `apps/web/vercel.json`. C-2 stands.

---

## 11. Phase review verdicts

Never a conditional pass.

### Phase 6 — numbers integrity — **GREEN (vacuously), with one standing condition**

There are no numbers to get wrong, and the build says so in its own copy rather than filling the
space. Zero percentages, zero probabilities, `Heuristic risk band` used correctly ten times, minutes
and bands in every `aria-valuetext`, and `P_miss` not emitted. **Condition**: this verdict is about
absence. The moment `packages/risk-engine` or `packages/connection-engine` emits a value, this phase
must be re-reviewed against a calibrated artifact with a checksum and a passing calibration gate —
and the monotonicity properties (Q4-05) must assert before, not after.

**To `risk-modeling-scientist` and `connection-risk-engineer`:** nothing to remediate this round.
Q4-05 and Q4-06 are yours and are unbuilt-phase deductions, not defects.

### Phase 12 — quality sweep — **RED, four blockers**

1. `pnpm test:workers` and `pnpm test:security` are stubs; the phase's two headline commands have
   never run (Q4-15).
2. Seven of eighteen §23 checks are absent from CI (Q4-25).
3. WebKit and Mobile Safari are unswept (Q4-13).
4. Two gate clauses are inert against the shape the product emits: `verify-dist` adjacency (Q4-21)
   and `checkFixedSentences` presence (§6.9).

### Phase 13 — operations — **RED, three blockers**

1. `main` is unprotected with required checks `off` (C-1).
2. The deployed origin has no CSP and the fix is unshipped (C-2).
3. `docs/RUNBOOK.md` does not exist; `pnpm smoke` is a stub; the deploy workflow's smoke step has
   never executed (Q4-26).

---

## 12. Handoffs, grouped by owning agent

This is the fix dispatch for `build-orchestrator`.

| Agent                                | Deductions                                                                                                                                                                                                                             |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **repository owner** (human)         | **C-1** (branch protection), **C-2** (merge + verify the header response, §10.1), I-3, I-4, I-6, I-8                                                                                                                                   |
| `platform-release-sre`               | **C-1** (documentation + job-name contract), **C-2**, Q4-16, Q4-25, Q4-26, Q4-11 (CI wiring)                                                                                                                                           |
| `frontend-ui-engineer`               | **Q4-21** (ad adjacency, before-direction), **§6.9** (§26 presence + footer scope), Q4-07, Q4-08                                                                                                                                       |
| `qa-test-architect`                  | **Q4-09** (`name()` fidelity), Q4-10, Q4-13, Q4-15 (harness side)                                                                                                                                                                      |
| `accessibility-lead`                 | **Q4-12** (12 unmeasured nodes), the open §12 item 5 ruling — see the note below                                                                                                                                                       |
| `seo-engineer`                       | **Q4-18** (content gate), Q4-20 (stale §12 item 10), Q4-19 (after I-4)                                                                                                                                                                 |
| `security-privacy-engineer`          | **Q4-14** (three absent documents), **Q4-15**                                                                                                                                                                                          |
| `monetization-partnerships-engineer` | **Q4-22** (`ads.txt`), Q4-23                                                                                                                                                                                                           |
| `risk-modeling-scientist`            | Q4-05, Q4-06                                                                                                                                                                                                                           |
| `connection-risk-engineer`           | Q4-05                                                                                                                                                                                                                                  |
| `rights-rules-engineer`              | Q4-03                                                                                                                                                                                                                                  |
| `regulatory-source-steward`          | Q4-04 (blocked on I-8)                                                                                                                                                                                                                 |
| `principal-architect`                | Q4-01                                                                                                                                                                                                                                  |
| `data-platform-engineer`             | Q4-01 (migrations)                                                                                                                                                                                                                     |
| `build-orchestrator`                 | Q4-02 (phase sequencing), Q4-16b (`_headers` has no owner row)                                                                                                                                                                         |
| `trust-compliance-officer`           | **Ruling requested**: does `DIRECTIVE.md §26` require the five sentences to be _asserted_ per surface class, or is present-today sufficient? §6.9 is scored as a gate gap on that assumption; a different ruling changes its severity. |

### A note to `accessibility-lead` before the §12 item 5 ruling

Do not rule on the 24 observations as they stand. Two of them —
`"ScheduledUpdated 96 minutes ago from Second demonstration fi"` and
`"Updated 96 minutes ago from Second demonstration fixture."` under
`<dt>Second demonstration fixture</dt>` on `/flight-status/` — are artifacts of the runner's
`textContent` name computation, not of the product. The rendered `innerText` is
`"Scheduled Updated 96 minutes ago from Second demonstration fixture."`, with the space, because
`.dpp-row__note` is `display: block`. Measured in Chromium this session; see Q4-09. Ask
`qa-test-architect` to close Q4-09 first, then rule on whatever survives.

---

## 13. Round 1 close

- Ten rubric rows scored with per-row arithmetic: **§3**.
- Every deduction itemized with id, row, points, severity, evidence, required fix, owner and
  re-audit check: **§4**.
- Every §25 command executed by me or explicitly marked Not run / Blocked (external) with a reason:
  **§2**.
- All seven hunt-list categories swept, including negative results: **§6**.
- Critical-defect list, with the criticals I looked for and did not find: **§5**.
- Every external blocker named and run through the six-part test: **§10**.
- Verdict: **RED**, 48.0 / 100, 2 criticals.
- Product files changed by this audit: **zero**. The working tree is clean at `b92a884`; the only
  additions are this file and ignored local artifacts (`lighthouse-report*.json`, `test-results/`).

**The next command for the orchestrator** is not a fix. It is C-1: enable branch protection on
`main` with `Verify (11 of the 18 DIRECTIVE.md §23 checks)` required. Everything else in this report
is a defect that a working gate would have caught. C-1 is the reason the gate is not working.
