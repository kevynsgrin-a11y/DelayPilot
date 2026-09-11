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

**Visual overhaul, session S2** — run only after PR A (§10) is merged to `main`:

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

| Session | Dispatch                                                                                                                                                                                    | Disjointness (owned globs)                                                                                                                                                                                                                                             | Output                                                                                                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1      | orchestrator (base branch, `DIRECTIVE.md §7`, charters, this file) · `principal-architect` (ADR 0002, 0003) · `visual-asset-director` (image quarantine) · `seo-engineer` (sitemap, robots) | `docs/decisions/**` ∩ {`apps/web/public/images/**`, `scripts/assets/**`, `design/**`} ∩ {`sitemap*`, `apps/web/public/robots.txt`} ∩ orchestrator paths = ∅                                                                                                            | PR A (this change)                                                                                                                                                                    |
| S2      | `brand-design-director` ∥ `visual-asset-director`; reviewer `accessibility-lead`                                                                                                            | {`apps/web/src/styles/**`, `packages/ui/src/primitives/**`, `packages/ui/src/tokens/**`, `apps/web/public/fonts/**`} ∩ {`apps/web/public/brand/**`, `icons/**`, `og/**`, `scripts/assets/**`, `design/**`} = ∅                                                         | PR B: tokens, Geist self-hosted, motion tokens, primitives, SVG motif library, mark, icon set, OG pipeline, `asset-licenses.json`                                                     |
| S3      | `frontend-ui-engineer` ∥ `ux-copy-steward` ∥ `content-editorial-lead` ∥ `trust-compliance-officer`                                                                                          | {components, islands, layouts, page shells, `packages/ui/src/patterns/**`} ∩ `apps/web/src/lib/copy/**` ∩ {`src/content/**`, guides + passenger-rights bodies} ∩ five policy pages = ∅ — the `pages/**` carve-outs are serialized as the orchestrator charter requires | PR C: BaseLayout v2, View Transitions, nav, homepage in the §18.3 order, demo cockpit, route globe, chronology, every contract-free §18.1 route                                       |
| S4      | `seo-engineer` ∥ `performance-engineer` ∥ `accessibility-lead` ∥ `qa-test-architect`                                                                                                        | {`src/lib/seo/**`, `sitemap*`, `robots.txt`, `scripts/seo/**`} ∩ {`scripts/perf/**`, `perf.budgets.json`, `lighthouserc.json`, `docs/PERFORMANCE.md`} ∩ `docs/ACCESSIBILITY.md` ∩ {`tests/**`, `e2e/**`, `playwright.config.*`} = ∅                                    | PR D: sitemap index, manifest and OG wiring, structured data, budget and Lighthouse harness, axe + reduced-motion + 200 % zoom, visual regression at 375/768/1024/1440 in both themes |
| S5      | `trust-compliance-officer` → `release-auditor` (review only)                                                                                                                                | read-only                                                                                                                                                                                                                                                              | PR E: `docs/QUALITY_REPORT.md` scoring the visual-design (15), accessibility/performance (10), and SEO (5) rows                                                                       |

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
