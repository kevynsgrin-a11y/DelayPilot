# DelayPilot Build Plan

**Phase 0 deliverable.** Owner: `build-orchestrator`. Authored 2026-07-27.
Governed by `AGENTS.md`; sequenced by `DIRECTIVE.md` Part II; staffed from `docs/agents/ROSTER.md`.

---

## 1. Repository audit (state at Phase 0)

| Check                         | Result                                                                            |
| ----------------------------- | --------------------------------------------------------------------------------- |
| Working tree                  | `/home/user/DelayPilot`, git repo, remote `origin` → `kevynsgrin-a11y/DelayPilot` |
| Commits                       | **None.** Repository was empty apart from `.git`.                                 |
| Branch                        | `claude/inkling-multimodal-subagents-stn4l5` (designated development branch)      |
| Existing source               | None — no package manifest, no migrations, no config, no README                   |
| Existing conflicts to migrate | None                                                                              |
| Toolchain present             | Node v22.22.2, pnpm 10.33.0, npm 10.9.7, Python 3.11.15                           |

_2026-09-11:_ the branch row above is superseded by decision D1 in §10 — `main` is the integration
branch and `claude/inkling-multimodal-subagents-stn4l5` is retired.

**Consequence:** this is a greenfield build. `DIRECTIVE.md §1.1`'s "preserve sound existing code"
clause has no work to do; nothing is at risk of being destroyed. Every decision below is made fresh
and recorded here rather than inherited.

## 2. What Phase 0 produced

| Artifact                                       | Purpose                                                                                                                                  |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `AGENTS.md`                                    | The constitution. Truth, privacy, engineering, and monetization invariants that override every other instruction.                        |
| `DIRECTIVE.md`                                 | The master build directive re-authored as a phased, gated, multi-agent execution plan plus the full product and technical specification. |
| `docs/agents/ROSTER.md`                        | 1 orchestrator + 24 specialists, single-writer path ownership, handoff graph, reviewer pairings.                                         |
| `docs/agents/CHARTER_TEMPLATE.md`              | The mandatory charter shape.                                                                                                             |
| `.claude/agents/*.md`                          | 25 runnable charters — the build system itself.                                                                                          |
| `docs/BUILD_PLAN.md`                           | This file.                                                                                                                               |
| `docs/decisions/0001-subagent-build-system.md` | ADR recording why the build is organized this way.                                                                                       |
| `scripts/validate-build-system.mjs`            | Structural validator for the charter set; runnable in CI.                                                                                |

## 3. Why a multi-agent build rather than one long linear pass

Three properties of DelayPilot make single-pass authoring unsafe:

1. **Asymmetric failure cost.** A wrong hex value is cosmetic. A wrong EC 261 effective date, a
   fabricated gate number, or a percentage from an uncalibrated model is the product failing at the
   exact moment a traveler depends on it. Those surfaces need dedicated owners and _separate_
   reviewers — an agent cannot audit its own overclaim.
2. **Breadth exceeds coherent single-context authorship.** The scope spans design tokens, Cloudflare
   Workflows, regulatory rule modelling, calibration statistics, SEO gating, and ad-placement policy.
   Depth in each is a specialist's job; consistency across them is the orchestrator's.
3. **Concurrency needs a safety property, not optimism.** Single-writer path ownership
   (`ROSTER.md §3`) is what makes parallel dispatch safe. Without it, parallel agents silently
   clobber each other; with it, the disjointness check is mechanical.

## 4. Decisions taken now (so no phase stalls on them)

| Decision              | Choice                                                                                          | Rationale                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Package manager       | pnpm workspaces                                                                                 | Directive-specified; strict node-linker keeps package boundaries honest.                                                          |
| Public site           | Astro, pre-rendered, React islands only where interactive                                       | SEO-first pages must not ship an app bundle.                                                                                      |
| Edge runtime          | Single Worker + Static Assets binding                                                           | One deployable product; avoids cross-origin auth and CORS complexity.                                                             |
| Router                | Hono or equivalent small typed router, verified against current Workers support at Phase 1      | Directive-specified; keeps cold start small.                                                                                      |
| Validation            | Zod schemas in `packages/contracts`, shared by Worker and client                                | One shape, two consumers; drift becomes a type error.                                                                             |
| System of record      | D1                                                                                              | Billing, entitlements, rights versions, and audit require relational integrity. KV is cache only.                                 |
| Rights representation | Structured predicate rows with effective dates, never executable strings                        | Auditability and the ability to prove a future rule cannot fire early.                                                            |
| Risk output at launch | `Heuristic risk band`, no percentage                                                            | No validated artifact exists; `DIRECTIVE.md §13` forbids implying calibration.                                                    |
| Provider at launch    | `FixtureFlightProvider` active; live adapters implemented and failing closed                    | No commercial licence is present in this repository.                                                                              |
| Uploads               | `DOCUMENT_UPLOADS_ENABLED=false`                                                                | No malware-scanning pipeline exists; expense entry works without upload.                                                          |
| Time library          | Temporal or a verified IANA-correct library, decided at Phase 2 against current runtime support | Offsets are not zones; DST correctness is a tested requirement.                                                                   |
| Compatibility date    | Actual execution date at Phase 1, never copied from a document                                  | `DIRECTIVE.md §3.6`.                                                                                                              |
| Integration branch    | `main` (D1, 2026-09-11)                                                                         | `main` is what deploys; the old dev branch fell behind it and a session based on it regresses production. See §10.                |
| Marketing motion      | ADR 0003 narrow allowance on §18.1 public routes only; state-change-only everywhere else        | The live site is static because nothing on it changes state; the allowance is CSS-only and collapses under reduced motion.        |
| Route globe           | Option A — build-time SVG orthographic projection, CSS-animated; no WebGL, no map SDK           | `DIRECTIVE.md §11` forbids a map SDK; §7 forbids canvas-only visualization. Option B (`cobe`) needs a new ADR and owner approval. |
| Homepage imagery      | Original SVG/CSS "operations desk" art; no raster on `/`, tool routes, or cockpit views         | `visual-asset-director` charter; LCP element is headline + lookup form. Photography only on editorial routes, licence-recorded.   |
| v0 derivative images  | Removed from `apps/web/public/images/`; sources stay reference-only in `design/v0-preview/`     | AI-generated aircraft/uniform imagery invents liveries and trade dress (`AGENTS.md §1.4`); no licence record can exist for it.    |

## 5. Sequencing and parallelism

```
P0 Audit/plan          ── orchestrator
P1 Foundation          ── principal-architect → platform-release-sre
P2 Contracts/domain    ── principal-architect ∥ security-privacy-engineer
P3 Data platform       ── data-platform-engineer
P4 Providers/weather   ── integrations-provider-engineer
P5 Sources → rights    ── regulatory-source-steward → rights-rules-engineer
P6 Risk ∥ Connection   ── risk-modeling-scientist ∥ connection-risk-engineer
P7 Edge API/auth       ── edge-api-engineer
P8 Workflows ∥ Billing ── workflows-notifications-engineer ∥ billing-entitlements-engineer
P9 Design → Assets     ── brand-design-director → visual-asset-director
P10 Frontend ∥ Copy    ── frontend-ui-engineer ∥ ux-copy-steward
P11 SEO ∥ Content ∥ Money ── seo-engineer ∥ content-editorial-lead ∥ monetization-partnerships-engineer
P12 Quality sweep      ── qa ∥ a11y ∥ perf ∥ security
P13 Ops/docs           ── platform-release-sre + all agents' own docs
P14 Audit gate         ── release-auditor (loop until ≥95/100)
```

**Available concurrency.** P2 crypto, P6 (two engines), P8 (two subsystems), P10 (UI and copy),
P11 (three growth tracks), and P12 (four quality tracks) run in parallel. P9 design tokens can start
as early as P3 since its paths are disjoint from all backend work — the orchestrator should pull it
forward if backend phases are the critical path.

**Hard serializations** (do not parallelize these):

- Contracts before every consumer of contracts.
- Source verification before rule-set publication.
- Rule sets before any rights UI.
- Design tokens before UI primitives before page composition.
- Everything before the release audit.

## 6. Gate discipline

Every phase exit gate is executed by the orchestrator, not self-reported by the owning agent
(`AGENTS.md §6`). A red gate produces a scoped fix dispatch to the owning agent and a re-run of the
same gate. A gate is never waived, deferred to a later phase, or satisfied by a lowered threshold.

The four gates that most commonly get rationalized away, and therefore get extra scrutiny:

1. **Phase 5** — the golden rights matrix. Full pass or the phase is red.
2. **Phase 6** — no percentage without a calibrated artifact.
3. **Phase 9** — measured contrast in both themes, not visual judgment.
4. **Phase 11** — automated proof that no ad renders in a forbidden position.

## 7. Known external blockers (cannot be resolved from code)

Each has a complete adapter, a validated config contract, an `.env.example` entry, a demo path, and
a fail-closed production path. None blocks any phase from completing.

| Blocker                                                | Blocks                                                | Activation                                           |
| ------------------------------------------------------ | ----------------------------------------------------- | ---------------------------------------------------- |
| Cloudflare account + binding IDs                       | Remote deploy only                                    | `docs/DEPLOYMENT.md`                                 |
| Purchased domain + `PUBLIC_SITE_URL`                   | Production SEO build                                  | Set env; build fails on an example value             |
| Flight provider credentials **and commercial licence** | `Live` data; fixtures cover the product               | `docs/PROVIDER_LICENSING.md` + licence policy record |
| Stripe keys + Price IDs                                | Real purchases; demo billing state otherwise          | `docs/MONETIZATION.md`                               |
| Email + VAPID keys                                     | Real delivery; queued and inspectable otherwise       | `docs/DEPLOYMENT.md`                                 |
| CMP + AdSense slot IDs                                 | Ad fill; slots collapse cleanly otherwise             | `docs/ADVERTISING.md`                                |
| Affiliate agreements                                   | Partner modules stay disabled                         | `docs/AFFILIATES.md`                                 |
| Human legal/editorial review                           | `published` editorial status and rule-set publication | `docs/EDITORIAL_POLICY.md`                           |
| Historical on-time dataset                             | A calibrated model; heuristic band ships meanwhile    | `docs/MODEL_TRAINING.md`                             |

## 8. Risk register

| Risk                                                     | Mitigation                                                                                         |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| An agent invents a plausible statistic to fill a UI slot | `unknown`/`Unavailable` are designed states; `release-auditor` hunts fabrications specifically     |
| The EU 2026 reform gets applied early                    | Stored as `adopted_not_effective`; property test proves a future rule cannot bind an earlier event |
| Provider licence terms exceeded by caching or display    | `ProviderLicensePolicy` guard; readiness fails closed; steward reviews                             |
| Parallel agents collide on files                         | Single-writer ownership + disjointness check before every parallel dispatch                        |
| Charters drift from the directive over time              | `scripts/validate-build-system.mjs` in CI; ownership and invariant audits                          |
| Ads creep toward action controls                         | Placement conformance test + independent `trust-compliance-officer` review                         |
| "Passing" claimed without execution                      | `AGENTS.md §6` vocabulary; orchestrator re-runs gates itself                                       |

## 9. Next command

Phase 0 and Phase 1 are complete and merged. Phase 1 delivered the pnpm workspace, strict
TypeScript configuration, ten package skeletons, the Astro site, and the edge Worker with
`/api/v1/health`; `pnpm build`, `typecheck`, `lint`, and `format:check` all pass.

Two tracks are open. They touch disjoint paths (§5, §10) and may run on separate branches from
`origin/main` at the same time.

**Visual overhaul, session S4** — run only after PR C (S3, §10) is merged to `main`:

```
> Use the seo-engineer subagent to execute DIRECTIVE.md Phase 11 (technical SEO) as visual-overhaul
  session S4: structured data limited to visible content, the production build guard on
  PUBLIC_SITE_URL, security.txt / humans.txt / llms.txt, IndexNow key support, and pnpm test:seo; in
  parallel use the performance-engineer subagent for the budget harness and Lighthouse gate
  (scripts/perf/**, perf.budgets.json, lighthouserc.json, docs/PERFORMANCE.md) against the measured
  S3 baseline in docs/BUILD_PLAN.md §10, the accessibility-lead subagent for pnpm test:a11y (the axe
  spec in docs/ACCESSIBILITY.md §12 over every served route in both themes, reduced motion, 200 %
  zoom) and the review of the accessibility statement prose, and the qa-test-architect subagent for
  pnpm test:e2e from the three S3 Playwright harnesses (CSP-header injection, keyboard walk,
  screenshots) plus visual regression at 375/768/1024/1440 in both themes with the reduced-motion
  frame as its own state. Reviewer: release-auditor (read-only). Consume the S3 handoffs in §10.
```

**Visual overhaul, session S3** — delivered (PR C, §10); the dispatch that ran is kept for the
record:

```
> Use the frontend-ui-engineer subagent to execute DIRECTIVE.md Phase 10 (Frontend) as
  visual-overhaul session S3: BaseLayout v2 on the S2 tokens and primitives (Geist preload, icon set
  and manifest links, theme-toggle island as an external same-origin script, View Transitions per
  ADR 0003), the mega-nav, the homepage in the §18.3 order with the demo cockpit island, the SVG
  route globe with its required caption, the scroll-scrubbed chronology, and every contract-free
  §18.1 route in docs/BUILD_PLAN.md §10; in parallel use the ux-copy-steward subagent for
  apps/web/src/lib/copy/** (including the ProgressBar band labels and the "opens in a new tab"
  string), the content-editorial-lead subagent for /guides/ and /passenger-rights/ bodies, and the
  trust-compliance-officer subagent for the five policy pages. Reviewers: accessibility-lead and
  ux-copy-steward. Consume the S2 handoffs listed in §10 before starting.
```

**Visual overhaul, session S2** — delivered; the dispatch that ran is kept for the record:

```
> Use the brand-design-director subagent to execute DIRECTIVE.md Phase 9 (Design system) as
  visual-overhaul session S2: token layers with measured contrast in both themes, Geist self-hosted
  (one family, two faces, ≤ 45 KB, metric-matched fallback, zero CLS), the 1.2-ratio type scale with
  tabular numerals, motion tokens including the ADR 0003 allowance and its reduced-motion collapse,
  and the packages/ui primitives. Once tokens land, use the visual-asset-director subagent in
  parallel for the original mark, favicon/PWA/OG icon set derived by script, the inline-SVG motif
  library (radar arc, route lines, packets, grid, route globe), and scripts/assets/asset-licenses.json.
  Reviewer: accessibility-lead.
```

**Backend track, Phase 2** — unchanged:

```
> Use the principal-architect subagent to execute DIRECTIVE.md Phase 2 (Contracts and domain).
```

The orchestrator dispatch must state: the phase, its acceptance criteria, the upstream contracts now
available, and the verification commands expected back in the handoff report.

## 10. Visual overhaul — Phases 9→11 pulled forward (2026-09-11)

**Trigger.** An owner-commissioned external audit of the live site (fetched 2026-09-11) found it
honest but invisible: three routes, no call to action, no product surface, no motion, no imagery,
no favicon or Open Graph image, and five P0 findings. §5 already permits pulling Phase 9 forward
because its paths are disjoint from backend work; the same disjointness holds for every Phase 10
and 11 path this overhaul touches, so the backend track (Phase 2) keeps its own next command.

**Decisions.** Owner inputs I-1 and I-2 were resolved by the orchestrator under `DIRECTIVE.md §3.1`
with the audit's recommended defaults; each is reversible by a one-line change.

| Input                | Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Recorded in                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| I-1 / D1 base branch | `main` is the integration branch. Every session branches from `origin/main` and opens a draft PR against `main`. The old dev branch is retired.                                                                                                                                                                                                                                                                                                                | `CLAUDE.md` Git; §4                                                                  |
| I-2 motion allowance | Adopted, narrowly: CSS scroll-driven reveals, ≤ 2 ambient decorative motifs, ≤ 180 ms view transitions, a scroll-scrubbed demo chronology — §18.1 public routes only, never in a data-bearing component.                                                                                                                                                                                                                                                       | `docs/decisions/0003-marketing-motion-allowance.md`; `DIRECTIVE.md §7`; two charters |
| I-2 route globe      | Option A (build-time SVG). Option B (`cobe` WebGL) not adopted; needs a new ADR and explicit owner approval.                                                                                                                                                                                                                                                                                                                                                   | ADR 0003                                                                             |
| I-2 Preact-compat    | Deferred until a measured React lazy chunk exceeds 60 KB gz.                                                                                                                                                                                                                                                                                                                                                                                                   | ADR 0003                                                                             |
| ADR 0002 backfill    | `apps/web/astro.config.mjs` and `apps/edge/wrangler.jsonc` cited an ADR that did not exist; it now records the Phase 1 stack and the interim Vercel hosting reality.                                                                                                                                                                                                                                                                                           | `docs/decisions/0002-foundation-stack-and-versions.md`                               |
| P0-1 sitemap         | Served sitemap reduced to the three routes that exist, trailing slashes matching `trailingSlash: 'always'`; two unserved root copies deleted; `robots.txt` names the sitemap.                                                                                                                                                                                                                                                                                  | `apps/web/public/sitemap.xml`, `apps/web/public/robots.txt`                          |
| P0-2 images          | 40 files removed from `apps/web/public/images/` (32 v0-derived AVIF/WebP derivatives plus 8 dimension records); the CI budget check now reports an absent directory honestly and passes. Severity is higher than the audit stated: besides the §1.4 trade dress, two images bake a real carrier's flight designator with an invented `DELAYED` / `ON TIME` status into the pixels — §1.1 fabricated operational fact beyond the reach of any provenance label. | `scripts/assets/compress-images.mjs`, `design/v0-preview/README.md`                  |

**P0-5 (security headers not live) is deliberately not in this change.** Its fix is the open
[PR #16](https://github.com/kevynsgrin-a11y/DelayPilot/pull/16) (`gscops/vercel-headers-apps-web`,
adds `apps/web/vercel.json`). That PR currently targets the retired branch
`claude/inkling-multimodal-subagents-stn4l5`; it must be retargeted to `main` before merging or the
fix never reaches the deployment that serves the domain. The overhaul never touches `vercel.json`.

**Session sequence.** One draft PR per session; the owner reviews and merges between sessions;
merging to `main` deploys. Disjointness is proved per batch below (`ROSTER.md §3` globs).

| Session | Dispatch                                                                                                                                                                                    | Disjointness (owned globs)                                                                                                                                                                                                                                             | Output                                                                                                                                                                                                                                                                                                                                              |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1      | orchestrator (base branch, `DIRECTIVE.md §7`, charters, this file) · `principal-architect` (ADR 0002, 0003) · `visual-asset-director` (image quarantine) · `seo-engineer` (sitemap, robots) | `docs/decisions/**` ∩ {`apps/web/public/images/**`, `scripts/assets/**`, `design/**`} ∩ {`sitemap*`, `apps/web/public/robots.txt`} ∩ orchestrator paths = ∅                                                                                                            | PR A (this change)                                                                                                                                                                                                                                                                                                                                  |
| S2      | `brand-design-director` ∥ `visual-asset-director`; reviewer `accessibility-lead`                                                                                                            | {`apps/web/src/styles/**`, `packages/ui/src/primitives/**`, `packages/ui/src/tokens/**`, `apps/web/public/fonts/**`} ∩ {`apps/web/public/brand/**`, `icons/**`, `og/**`, `scripts/assets/**`, `design/**`} = ∅                                                         | Delivered — merged in [PR #17](https://github.com/kevynsgrin-a11y/DelayPilot/pull/17) together with S1 (the owner merged before the review closed); the review loop is [PR #18](https://github.com/kevynsgrin-a11y/DelayPilot/pull/18) and the close-out [PR #19](https://github.com/kevynsgrin-a11y/DelayPilot/pull/19). See "S2 delivered" below. |
| S3      | `frontend-ui-engineer` ∥ `ux-copy-steward` ∥ `content-editorial-lead` ∥ `trust-compliance-officer`                                                                                          | {components, islands, layouts, page shells, `packages/ui/src/patterns/**`} ∩ `apps/web/src/lib/copy/**` ∩ {`src/content/**`, guides + passenger-rights bodies} ∩ five policy pages = ∅ — the `pages/**` carve-outs are serialized as the orchestrator charter requires | Delivered — PR C (this session; see "S3 delivered" below).                                                                                                                                                                                                                                                                                          |
| S4      | `seo-engineer` ∥ `performance-engineer` ∥ `accessibility-lead` ∥ `qa-test-architect`                                                                                                        | {`src/lib/seo/**`, `sitemap*`, `robots.txt`, `scripts/seo/**`} ∩ {`scripts/perf/**`, `perf.budgets.json`, `lighthouserc.json`, `docs/PERFORMANCE.md`} ∩ `docs/ACCESSIBILITY.md` ∩ {`tests/**`, `e2e/**`, `playwright.config.*`} = ∅                                    | PR D: sitemap index, manifest and OG wiring, structured data, budget and Lighthouse harness, axe + reduced-motion + 200 % zoom, visual regression at 375/768/1024/1440 in both themes                                                                                                                                                               |
| S5      | `trust-compliance-officer` → `release-auditor` (review only)                                                                                                                                | read-only                                                                                                                                                                                                                                                              | PR E: `docs/QUALITY_REPORT.md` scoring the visual-design (15), accessibility/performance (10), and SEO (5) rows                                                                                                                                                                                                                                     |

**Routes that stay out of navigation until their upstream exists** — shipping them empty would
violate `AGENTS.md §1.6`: `/pricing/` (Phase 8 billing), `/airlines/`, `/airports/`, `/routes/`
(Phase 3 data), `/status/` (`/api/v1/health` is unreachable on the Vercel deployment), the affiliate
module (no agreement), and `/contact/` until I-3 supplies a real address.

**Owner inputs still open.**

| Id                    | Input                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Needed by        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| GitHub default branch | Switch the repository default from the retired dev branch to `main`                                                                                                                                                                                                                                                                                                                                                                                                                  | now              |
| PR #16                | Retarget to `main`, then merge (P0-5)                                                                                                                                                                                                                                                                                                                                                                                                                                                | before S2 merges |
| I-3                   | A real contact address for `/contact/` (no placeholder is permitted)                                                                                                                                                                                                                                                                                                                                                                                                                 | S3               |
| I-4                   | `PUBLIC_SITE_URL=https://delaypilot.app` in the deployment environment; canonical, `og:url`, absolute OG image URLs stay omitted until then                                                                                                                                                                                                                                                                                                                                          | S4               |
| I-5                   | Approval of any photo shortlist (source URL + licence per image); S2 ships SVG/CSS art without it                                                                                                                                                                                                                                                                                                                                                                                    | S2, optional     |
| I-6                   | Flip guides from `publishable` to `published` after the owner's read (human review is an external blocker)                                                                                                                                                                                                                                                                                                                                                                           | after S5         |
| I-7                   | Resolved 2026-09-11 by the Vercel bot's comment on PR #17: the site is the project `delaypilot` in the Vercel team `kevynsgrin-a11ys-projects`, and every branch gets a preview at `delaypilot-git-<branch>-kevynsgrin-a11ys-projects.vercel.app`. The audit's statement that the project was not in that team was wrong. Previews could not be fetched from the S1 session (egress to `vercel.app` is denied there), so preview-URL checks are the owner's until S4 adds a harness. | resolved         |

**S1 gate verdicts** (orchestrator-executed, `AGENTS.md §6` vocabulary):

| Command                                                                                                                                  | Result                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm install --frozen-lockfile`                                                                                                         | **Passing** — `Done in 7.7s using pnpm v10.33.0`, exit 0, lockfile unchanged.                                                                                                                          |
| `pnpm format:check`                                                                                                                      | **Passing** — `All matched files use Prettier code style!`, exit 0.                                                                                                                                    |
| `pnpm lint`                                                                                                                              | **Passing** — `eslint .`, exit 0, no output.                                                                                                                                                           |
| `pnpm typecheck`                                                                                                                         | **Passing** — `pnpm -r typecheck` exit 0; `apps/web` `astro check`: 0 errors, 0 warnings, 0 hints.                                                                                                     |
| `pnpm build`                                                                                                                             | **Passing** — `@delaypilot/web`: 3 pages built (`/`, `/privacy/`, `/terms/`); `@delaypilot/edge`: `wrangler deploy --dry-run` exit 0.                                                                  |
| `node scripts/validate-build-system.mjs`                                                                                                 | **Passing** — `Charters validated: 25`, `0 error(s), 0 warning(s)`.                                                                                                                                    |
| `node scripts/validate-security-headers.mjs`                                                                                             | **Passing** — `Security-header parity check passed (6 headers, 2 policies).`                                                                                                                           |
| `node scripts/validate-contrast.mjs`                                                                                                     | **Passing** — `Contrast check passed: 44 pairs measured across 2 themes. Tightest pair: light --status-critical on --background at 4.50:1`.                                                            |
| `node scripts/assets/compress-images.mjs --check apps/web/public/images`                                                                 | **Passing** — `Checked 0 emitted image(s) in apps/web/public/images (directory absent — no raster derivatives are shipped)`, exit 0.                                                                   |
| `pnpm test`, `pnpm test:workers`, `pnpm test:e2e`, `pnpm test:a11y`, `pnpm test:seo`, `pnpm test:security`, `pnpm quality`, `pnpm smoke` | **Not run** — no test file exists yet and each `test:*` script is a deliberate exit-1 stub until its owning phase lands (Phases 2, 11, 12, 13); a run would report a failure unrelated to this change. |

Reviewer for S1: the repository owner, at PR A. Every command above was executed by the orchestrator in the S1 session on 2026-09-11 after all four owner groups had delivered.

**S2 delivered (2026-09-11).** `brand-design-director` and `visual-asset-director` ran in parallel
on disjoint paths (proof above) and both halves landed in [PR #17](https://github.com/kevynsgrin-a11y/DelayPilot/pull/17)
on top of S1, which the owner merged as one PR. What landed: the typed token source in
`packages/ui/src/tokens` with a measured pair registry (94 pairs at merge, 103 after the review
loop), the generated `apps/web/src/styles/tokens.css` with a drift test and the `[data-theme]`
override, Geist Sans 400/600 self-hosted (33,128 B) with computed metric-matched fallbacks, 28
primitives with markup-contract tests, the original mark and every derived icon, OG and motif asset
with a byte-reproducible pipeline, `scripts/assets/asset-licenses.json`, and the owner's concept
boards under `design/concepts/2026-09-11-homepage/`.

**S2 gate verdicts** (orchestrator-executed on the final S2 tree, then again on the review-loop tree):

| Command                                                                  | Result                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install --frozen-lockfile`                                         | **Passing**                                                                                                                                                                                                                                    |
| `pnpm --filter @delaypilot/ui tokens:build`                              | **Passing** — `103 registered pairs x 2 themes = 206 measurements, 0 failing, 0 unmeasured.` Tightest light `--status-watch-border` on `--surface-sunken` 3.12:1; tightest dark `--text-disabled` on `--surface-elevated` 3.30:1 (floors 3:1). |
| `pnpm format:check` / `pnpm lint` / `pnpm typecheck`                     | **Passing**                                                                                                                                                                                                                                    |
| `pnpm test`                                                              | **Passing** — `Test Files 4 passed (4)`, `Tests 379 passed (379)` (contrast registry, token drift, primitive contracts, asset verification).                                                                                                   |
| `pnpm build`                                                             | **Passing** — 3 pages; `wrangler deploy --dry-run` exit 0.                                                                                                                                                                                     |
| `node scripts/validate-build-system.mjs`                                 | **Passing** — 25 charters, 0 errors.                                                                                                                                                                                                           |
| `node scripts/validate-security-headers.mjs`                             | **Passing**                                                                                                                                                                                                                                    |
| `node scripts/validate-contrast.mjs`                                     | **Passing** — 44 pairs; tightest dark `--status-unknown` on `--surface-raised` 4.55:1.                                                                                                                                                         |
| `node scripts/assets/verify-assets.mjs`                                  | **Passing** — `174/174 checks passed.`                                                                                                                                                                                                         |
| `node scripts/assets/compress-images.mjs --check apps/web/public/images` | **Passing** — directory absent, 0 images.                                                                                                                                                                                                      |
| `pnpm test:*`, `pnpm quality`, `pnpm smoke`                              | **Not run** — deliberate exit-1 stubs until their owning phases.                                                                                                                                                                               |
| Browser rendering at 375/768/1024/1440, screen readers, Lighthouse, CWV  | **Not run** — no browser or assistive technology in the build environment; Phase 12 / S4.                                                                                                                                                      |

**Phase 9 review** (`accessibility-lead`, `docs/ACCESSIBILITY.md`). First verdict: **BLOCKED — 6
blockers**, all in `brand-design-director`'s paths (combobox active-option indicator at 1.12:1;
invisible ProgressBar track; meter value and band only in ARIA; every Skeleton a live region;
Tooltip neither dismissible nor hoverable; DataTable scroll container not keyboard-operable), plus
17 non-blocking findings. The exit gate as worded was met: the reviewer re-measured every registry
pair independently and agreed with `CONTRAST.md` on every row, and confirmed the mark legible at
16 px by pixel analysis. Fix dispatch closed all six and thirteen of the findings (F7–F14, F16–F21);
the orchestrator re-ran every gate above. Re-review verdict: **GREEN**. The re-review verified B1–B6 closed and raised B7 (the band word sat inside a presentational `role="progressbar"` subtree, SC 1.3.1); the fix folds the band into `aria-valuetext` — the reviewer judged the `aria-describedby` alternative it had offered wrong, because without `aria-valuetext` a screen reader speaks a computed percentage, the precision defect §18.5 forbids — and the third pass returned GREEN. Twenty-four findings in total; four stay open with named owners (F15, F22, F23, F24 below). A green Phase 9 gate certifies no route: every Phase 12 cell is Not run and the accessibility statement must say partially conformant until then.

**Handoffs carried into S3/S4** (from the S2 and review reports; each is the named owner's):

| To                              | Item                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend-ui-engineer` (S3)     | Font preload links; replace the `data:,` favicon link with the icon set; theme-toggle island as an external same-origin script (CSP has no `unsafe-inline`); `aria-busy` on loading regions (B4's other half); implement the Combobox keyboard contract published in its docblock; supply `bandLabel` and `newTab` strings; `inert` behind open modals (F15); define `--brand-mark-accent` per theme, never globally, and register the pair (F23); route-globe caption "Illustrative route lines — not live traffic." in page copy (ADR 0003 rule 6); replace, not extend, the legacy page layer in `tokens.css`; inline the mark and motifs, never via `<img>`. |
| `ux-copy-steward` (S3)          | The "opens in a new tab" string; ProgressBar band words per band; the §17 `unknown` strings so `valueText` and `bandLabel` never announce as "Unknown, Unknown" (F24).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `seo-engineer` (S3/S4)          | Icon and manifest wiring from `scripts/assets/asset-manifest.mjs` (maskable entries as separate objects, `theme-color #07111f`); `og:image:alt` = "DelayPilot — Stay ahead of flight disruptions." (F22); drop `img-src data:` from the CSP once the placeholder favicon link is gone.                                                                                                                                                                                                                                                                                                                                                                           |
| `qa-test-architect` (S4)        | Lock the axe assertion spec in `docs/ACCESSIBILITY.md §12` into CI; visual regression at 375/768/1024/1440 in both themes with the reduced-motion frame as its own state.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `principal-architect` (Phase 2) | Publish `StatusTone`, `Severity`, `ProvenanceKind` from `packages/contracts`; delete `packages/ui/src/tokens/interim-contracts.ts` then. Wire `node scripts/assets/verify-assets.mjs` into the §23 check order.                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `platform-release-sre`          | `.github/workflows/ci.yml` header says "two repo-local gates"; the job runs four.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `trust-compliance-officer` (S5) | `scripts/assets/asset-licenses.json` statement block for the no-false-affiliation review.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |

**S3 delivered (2026-09-12).** The §9 dispatch ran as three waves on disjoint paths. Wave 1: the four
dispatched owners plus two the orchestrator added under `DIRECTIVE.md §3.1` — `brand-design-director`,
because the served Content-Security-Policy (`style-src 'self'`, no `'unsafe-inline'`) discards inline
`style` attributes and five S2 primitives drew their geometry with them, and
`regulatory-source-steward`, because the content charter cannot cite a source that has no registry
record. Wave 2: `principal-architect` (env contract, lint wiring, ADR 0003 amendment), `seo-engineer`,
`edge-api-engineer`, and the `trust-compliance-officer` and `ux-copy-steward` follow-ups; then
`brand-design-director` (legacy page layer) and `frontend-ui-engineer` (integration). Wave 3: the
independent reviews (below). One scoped commit per owner; the orchestrator re-ran every gate on the
tree before each commit.

| Owner                                | Landed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `frontend-ui-engineer`               | Twenty pre-rendered routes: the homepage in the §18.3 order (pricing cards and the affiliate module omitted, see decisions), the §28 demonstration cockpit in the §18.5 order, `/flight-status/`, `/delay-risk/`, `/connection-risk/`, `/methodology/`, `/data-sources/`, `/about/`, the `/guides/` and `/passenger-rights/` shells over the content collection, a 404; BaseLayout v2 (v1-compatible), the mega-nav and mobile drawer, the theme control, the lookup with the Combobox keyboard reducer; the pattern layer under `packages/ui/src/patterns/`; `apps/web/scripts/verify-dist.mjs` inside `pnpm build`. Zero hydrated islands: React renders on the server only and the four scripts are external same-origin modules (2.2 KB gz). |
| `ux-copy-steward`                    | `apps/web/src/lib/copy/**` — every S3 string, the §26/§27 constants byte-checked against the directive at test time, the six provenance labels, the F24 band strings, the `newTab` string, the accessibility-statement prose; `docs/VOICE.md`; the forbidden-phrase lint with its seeded-violation proof, now run by `pnpm lint`.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `content-editorial-lead`             | `docs/EDITORIAL_POLICY.md`; 25 collection entries — six `publishable` (the passenger-rights overview and five product-internal guides), eighteen regulatory entries held at `source_review` with a 117-claim map, one `draft`; every regulatory value a `{{rule:…}}` slot, never prose; `review-register.json`.                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `trust-compliance-officer`           | The five policy pages rewritten or added, stating only what the product does today; liability and governing law deliberately unwritten pending legal review.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `brand-design-director`              | Every primitive renders with no inline `style` attribute (data attributes, classes, an SVG `<rect>` fill for the meter); `ProgressBar` accepts `null` as an unknown reading; the reviewed progressbar contract is byte-unchanged; the legacy page layer removed from `tokens.css` once nothing used it.                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `regulatory-source-steward`          | `data/rights/sources/registry.json` — all 27 §33 entries, every one `unreachable` with its verbatim fetch outcome, `lastVerifiedAt` null; `docs/RIGHTS_SOURCE_REVIEW.md`, `docs/DATA_SOURCES.md`; the `evidenceClass` / `citableForRuleValues` fields.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `principal-architect`                | `PUBLIC_CONTACT_EMAIL` in `.env.example`; `pnpm lint` = eslint + the copy lint; ADR 0003 rules 2c and 5 amended (native cross-document CSS View Transitions, no JavaScript).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `seo-engineer` / `edge-api-engineer` | CSP `img-src` tightened to `'self'` in both `_headers` and the Worker; `manifest.webmanifest`; `sitemap.xml` and `robots.txt` for the served, indexable routes; `scripts/seo/verify-sitemap.mjs`; `docs/SEO.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `build-orchestrator`                 | `DIRECTIVE.md §33` entries 23–27 (the legal instruments) and the instrument-plus-explanation rule; `AGENTS.md §1.4` and two charters corrected; `scripts/validate-build-system.mjs` overclaim pass narrowed to the charters with no banned string of its own; this record.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

**S3 decisions** (`DIRECTIVE.md §3.1`; each reversible by the change named):

| Decision                                                                                                                                                                                                                                                                                                                                             | Recorded in                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Scope is the contract-free §18.1 routes. `/pricing/`, `/airlines/**`, `/airports/**`, `/routes/**`, `/status/` and every §18.2 route wait for their phases; the homepage omits the pricing cards (no purchase path exists) and the affiliate module (no agreement) and keeps every other §18.3 section in order.                                     | `apps/web/src/pages/index.astro`, `apps/web/scripts/verify-dist.mjs`                                     |
| `/contact/` and `/accessibility/` are emitted only when `PUBLIC_CONTACT_EMAIL` is set (I-3); no placeholder address anywhere.                                                                                                                                                                                                                        | `.env.example`, `apps/web/src/components/routes.ts`                                                      |
| The served CSP is the law. No page hydrates, so the policy needs no hash; `verify-dist.mjs` fails the build on any inline script or style and prints the hash a future one would need; `img-src data:` is gone with the empty-data-URI favicon.                                                                                                      | `apps/web/public/_headers`, `apps/edge/src/index.ts`, `apps/web/astro.config.mjs`                        |
| View Transitions are the native cross-document CSS API; Astro's client router is not used (unsupported under its CSP hashing; it emits inline scripts).                                                                                                                                                                                              | ADR 0003 rules 2c and 5; `DIRECTIVE.md §7`; two charters                                                 |
| Demo values are labelled fixture times and minutes; no gate, terminal, probability, percentage, price or statistic; the rights card shows statuses under "Demo rule set" with no amounts. The fixture is interim in `apps/web/src/demo/` until Phase 4.                                                                                              | `apps/web/src/demo/itinerary.ts`, `apps/web/test/demo-itinerary.test.ts`                                 |
| Serving rule: `publishable` and `published` entries are emitted; `publishable` pages carry `noindex` and their editorial status; only `published && indexable` is indexable and listed in the sitemap; entries with an unresolved `{{rule:…}}` slot are never emitted. Product-internal guides may cite `internalRefs` instead of a registry source. | `docs/EDITORIAL_POLICY.md`, `apps/web/src/components/routes.ts`, `apps/web/src/components/rule-slots.ts` |
| A legal value cites its instrument (§33 entries 23–27) and the regulator explanation that interprets it; a press release is `secondary` and never citable for a value or a date.                                                                                                                                                                     | `DIRECTIVE.md §33`, `data/rights/sources/README.md`                                                      |
| One forbidden-phrase lint: `apps/web/src/lib/copy/lint/` (closed four-entry allowlist) over the whole tree via `pnpm lint`; the build-system validator's pass covers only `.claude/agents/**`.                                                                                                                                                       | `scripts/validate-build-system.mjs`, root `package.json`                                                 |
| `rights-rules-engineer` was not dispatched: no rule set can reach `in_force` while no source can be verified (below).                                                                                                                                                                                                                                | this record                                                                                              |

**Blocked (external) — network egress.** The build environment's proxy refuses every regulator,
legislative and platform host (`EGRESS_BLOCKED` from the fetch tool; `CONNECT` 403 from the proxy):
0 of 27 sources verified, so no rule set can leave `draft`, no regulatory content can pass source
review, and the four jurisdiction explainers and fourteen regulatory guides are complete but
unserved. New owner input:

| Id  | Input                                                                                                                                                                                                               | Needed by                                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| I-8 | Allow egress to the 18 hosts listed in `docs/RIGHTS_SOURCE_REVIEW.md` in the environment's network policy and re-run `regulatory-source-steward`, or run it locally with egress and commit the registry it produces | before any rule set or rights page publishes |

I-3 now also gates `/accessibility/`; I-6 applies to the six `publishable` entries; I-4 is unchanged.

**S3 review round (2026-09-12)** — three independent reviews of the wave 1–2 tree (`b277b9b`):

| Review                       | Reviewer                   | Verdict                                                                                                                                                     | Findings                                                                                                                                                 |
| ---------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Copy review (Phase 10)       | `ux-copy-steward`          | PASS WITH FINDINGS                                                                                                                                          | F-1…F-15: 3 high (bare `Demo` chips, the `/delay-risk/` meter, the §26 apostrophe rewritten by the renderer), 5 medium, 7 low                            |
| Conformance sweep (Phase 11) | `trust-compliance-officer` | Legal overclaim **fail**, disclaimers **fail**; false affiliation, ad placement, affiliate disclosure, dark patterns **pass**; zero critical findings       | F1–F7: F1–F4 major (the same apostrophe drift; a regulatory interval in the demo fixture; a press release under "Official sources"; bare `Demo` chips)   |
| Accessibility (Phase 10)     | `accessibility-lead`       | **BLOCKED** — B8 (SC 1.4.10, sideways scroll at 320 px on `/` and `/connection-risk/`), B9 (the `/delay-risk/` meter announced as a connection measurement) | F25–F38; 88 axe runs across 20 routes × 2 themes × 2 motion preferences, 0 violations; F22 and F24 closed, F15 closed on every shipped surface; F23 open |

Full text: `docs/VOICE.md` (copy), the trust sweep's handoff in this session's record, and
`docs/ACCESSIBILITY.md §15`.

**Fix-loop decisions** (`DIRECTIVE.md §3.1`; each reversible by the change named):

| Decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Recorded in                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| The `Demo` sentence is per panel. `DIRECTIVE.md §28` ("every demo panel says…") and `AGENTS.md §1.2` govern; the bannered-section exemption `docs/VOICE.md §2` had allowed is withdrawn. `SegmentCard` gains `demoCaption`; every panel in the demonstration cockpit that shows a demo value carries the sentence beside its chip; `verify-dist` fails the build on a bare `Demo` chip.                                                                                                                 | `docs/VOICE.md §2`, `packages/ui/src/patterns/SegmentCard.tsx`, `apps/web/src/components/DemoCockpit.astro`, `verify-dist.mjs` |
| Fixed sentences survive the renderer: smart punctuation is disabled through the supported extension point (an `astro:config:setup` integration, since Astro 7 deprecates the `markdown.smartypants` flag), closing all 20 content entries at once; `verify-dist` asserts the six §26 sentences and the demo sentence byte-exact in `dist`; no Markdown body is retyped.                                                                                                                                 | `apps/web/src/lib/markdown/ascii-punctuation.mjs`, `apps/web/astro.config.mjs`, `apps/web/scripts/verify-dist.mjs`             |
| Evidence class reaches the pixel: a rights assessment carries `contextSources` apart from `sources`; `RightsCard` renders them labelled and unlinked, as `ArticleLayout` already does; the demo fixture's source helper reads the class from the registry so a secondary record cannot land under "Official sources".                                                                                                                                                                                   | `packages/ui/src/patterns/types.ts`, `RightsCard.tsx`, `apps/web/src/demo/itinerary.ts`                                        |
| The regulatory interval in the demo fixture is removed. The number returns only from a rule set citing a verified Official Journal record.                                                                                                                                                                                                                                                                                                                                                              | `apps/web/src/demo/itinerary.ts`                                                                                               |
| Meters are labelled by their section heading and read the band label; no new string (B9, copy F-2, F-4, F27 close together).                                                                                                                                                                                                                                                                                                                                                                            | `apps/web/src/pages/delay-risk.astro`, `DemoCockpit.astro`                                                                     |
| `apps/web/astro.config.mjs` and a new `apps/web/src/lib/markdown/**` are `frontend-ui-engineer`'s for the renderer changes above (an ownership gap in `ROSTER.md §3`; the table gains both rows in S4).                                                                                                                                                                                                                                                                                                 | this record                                                                                                                    |
| Policy-page chrome comes from the copy module (`pages.policy.relatedHeading`; link labels from `nav.footer.links`); the per-page descriptions stay policy body under `docs/VOICE.md §12.1`.                                                                                                                                                                                                                                                                                                             | the five policy pages, `apps/web/src/lib/copy/pages.ts`                                                                        |
| Spelling ruling (`docs/VOICE.md §11.1`, five clauses): American governs the content tree; the sweep is a dedicated S4 pass and British spelling in a served body is a recorded divergence until then, not a gate failure; slugs are exempt permanently (a URL is an identifier fixed by `DIRECTIVE.md §18.6`); titles follow §18.6 where it names them; quoted material is never converted.                                                                                                             | `docs/VOICE.md §11.1`                                                                                                          |
| Rendered text is checked for run-together words. During its F-13 verification `trust-compliance-officer` found that the Astro compiler drops the space between a line-ending text node and an element that opens the next line ("Reviewed12 September 2026" on six article routes; "required.A flight number" under the §7 trust line on `/` and `/flight-status/`; eight joins on the policy pages). Every join gets an explicit JSX space and `verify-dist` fails the build on the pattern site-wide. | `apps/web/scripts/verify-dist.mjs`, `ArticleLayout.astro`, `LookupForm.astro`, `flight-status.astro`, the five policy pages    |
| An unmeasured superlative is a statistic with the number taken out: 61 lines across 24 content entries reworded; the rule is `docs/EDITORIAL_POLICY.md §7.1`.                                                                                                                                                                                                                                                                                                                                           | `docs/EDITORIAL_POLICY.md §7.1`, `apps/web/src/content/review-register.json → editorialActions`                                |

**Fix-loop outcome.** Every finding routed to a builder landed in one pass per owner: copy F-1…F-15, trust F1–F6 (F7 is Phase 11 monetization work, recorded below), accessibility B8, B9, F25–F35, F37, F38 (F36, the statement text, is revised and awaits the reviewer), and the run-together-words defect. Scoped commits, one per owner, in this order: `ux-copy-steward`, `content-editorial-lead`, `accessibility-lead`, `trust-compliance-officer`, `brand-design-director`, `frontend-ui-engineer`. Re-review dispatched on the frontend commit to `accessibility-lead` (B8 and B9 by measurement, F25–F38 status, the statement), `ux-copy-steward` (F-1…F-12 in the built tree) and `trust-compliance-officer` (F1–F6 and the join sweep); their verdicts are appended below when they return.

**Gate verdicts on the final tree** (orchestrator-run, `AGENTS.md §6`):

| Command                                                                                         | Result                                                                                                                   |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `pnpm format:check`                                                                             | Passing                                                                                                                  |
| `pnpm lint` (astro sync + eslint + `pnpm lint:copy`)                                            | Passing — 256 files scanned, 0 forbidden-phrase hits                                                                     |
| `pnpm typecheck`                                                                                | Passing — 0 errors                                                                                                       |
| `pnpm test`                                                                                     | Passing — 15 files, 760 tests                                                                                            |
| `pnpm build`                                                                                    | Passing — 20 pages; `verify-dist --self-test` 15 checks behave as specified; `verify-dist` 0 findings; wrangler dry-run  |
| `pnpm seo:verify`                                                                               | Passing — 13 indexable, 7 noindex, 13 sitemap entries, 0 duplicates                                                      |
| `node scripts/validate-build-system.mjs`                                                        | Passing — 0 errors, 0 warnings                                                                                           |
| `node scripts/validate-security-headers.mjs`                                                    | Passing — 6 headers, 2 policies                                                                                          |
| `node scripts/validate-contrast.mjs`                                                            | Passing — tightest pair 4.55:1                                                                                           |
| `node scripts/assets/verify-assets.mjs`                                                         | Passing — 198/198                                                                                                        |
| `node scripts/assets/compress-images.mjs --check apps/web/public/images`                        | Passing — no raster derivatives shipped                                                                                  |
| Browser measurements (owner-run by `frontend-ui-engineer`, re-measured by `accessibility-lead`) | 88 axe runs, 0 violations; 88 loads, 0 CSP violations; 40 reflow measurements at 320/375 px, 0 overflow; apostrophe 0x27 |
| `pnpm test:e2e`, `test:a11y`, `test:seo`, `test:security`, `test:workers`, `quality`, `smoke`   | Not run — deliberate exit-1 stubs until Phases 11–13                                                                     |
| Source verification (`regulatory-source-steward`)                                               | Blocked (external) — I-8                                                                                                 |

**S4 handoffs** (consume before starting S4; owners per `ROSTER.md §3`):

- `platform-release-sre` — the root `_headers` file is dead and weaker than `apps/web/public/_headers`; CI gains the `forbidden-phrases` and `SEO validation` steps (`pnpm lint:copy`, `pnpm seo:verify`) and the axe sweep parameters from `docs/ACCESSIBILITY.md §12`.
- `qa-test-architect` — lock `docs/ACCESSIBILITY.md §12` into `pnpm test:a11y` (88 runs, zero violations at any impact) with a `scrollingElement.scrollWidth === innerWidth` assertion at 320 px on `/` and `/connection-risk/`; the `test:e2e` placement suite asserts the five positional `§20` prohibitions and, once built, consent defaults and the cancel flow; `pnpm test:e2e` from the three S3 Playwright harnesses.
- `principal-architect` — the pattern-layer types (`Provenance`, `Segment`, `ConnectionAssessment`, `RightsAssessment` with `contextSources`) move into `packages/contracts` as Zod schemas in Phase 2; `@delaypilot/ui` gains a `./patterns` export so the relative imports become bare specifiers; `ROSTER.md §3` gains rows for `apps/web/astro.config.mjs` and `apps/web/src/lib/markdown/**`.
- `integrations-provider-engineer` — `apps/web/src/demo/itinerary.ts` is the interim §28 fixture; the `FixtureFlightProvider` replaces it in Phase 4 and must cover every §17 state it renders.
- `monetization-partnerships-engineer` — `AdSlotShell.enabled` needs the consent gate and the local/test/screenshot/demo-review gate behind it; `ads.txt`, the placement tests and the `/advertising-policy/` rewrite land in the same change that enables advertising; the reserved position inside the demo cockpit is inert.
- `rights-rules-engineer` — 46 `{{rule:<jurisdiction>:<path>}}` slot paths in the content tree name the values the rule sets must publish.
- `regulatory-source-steward` — 117 claims in `claim-map.json` (111 primary, 3 secondary, 4 unsourced) wait on I-8; `citableForRuleValues` now has a rendering channel (`contextSources`) and every consumer must use it.
- `content-editorial-lead` — the editorial-independence clause; the hedged-majority quantifiers the F-14 sweep deliberately left ("most people", "most policies require"); the spelling sweep per the §11.1 ruling; captions for the two prose tables (`/passenger-rights/`, `/guides/data-freshness-and-provider-limits/`) so `prose-tables.mjs` can name the region by its caption instead of the preceding heading.
- `security-privacy-engineer` — `docs/PRIVACY.md` (the `/privacy/` page states the current posture; the document behind it does not exist yet).
- `brand-design-director` — F23 (the fallback pair) stays open by decision; `Callout` heading level and the `info` glyph landed in this session's fix loop; a view on `.dpx-hero__availability` now spanning the left column at ≥ 1024 px (the F35 fix) and on whether `Disclaimer` adopts the `info` glyph.
- `frontend-ui-engineer` — the page-level provenance chip on the homepage (`index.astro`) now sits beside twelve panel-level chips and may be redundant; the route-timeline panel's chip was added on the per-panel rule and can come out if the trust reviewer rules the timeline is not a value panel.
- `visual-asset-director` — `design/**` carries 11 copy-lint hits (negations, reference only, excluded by documented reason) and the route-globe SVG carries the attributes the inliner adds (F38 source side).
- `ux-copy-steward` — F36's statement sentences are re-reviewed by `accessibility-lead` before `/accessibility/` publishes (I-3); the rank-claim lint rules are live.
- `seo-engineer` — one `description` changed (`guides/flight-cancelled-what-to-do`); the noindex list and sitemap set are unchanged; `<link rel="canonical">` on every page waits on I-4.
