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
| `scripts/validate-agents.mjs`                  | Structural validator for the charter set; runnable in CI.                                                                                |

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

| Decision              | Choice                                                                                          | Rationale                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Package manager       | pnpm workspaces                                                                                 | Directive-specified; strict node-linker keeps package boundaries honest.                          |
| Public site           | Astro, pre-rendered, React islands only where interactive                                       | SEO-first pages must not ship an app bundle.                                                      |
| Edge runtime          | Single Worker + Static Assets binding                                                           | One deployable product; avoids cross-origin auth and CORS complexity.                             |
| Router                | Hono or equivalent small typed router, verified against current Workers support at Phase 1      | Directive-specified; keeps cold start small.                                                      |
| Validation            | Zod schemas in `packages/contracts`, shared by Worker and client                                | One shape, two consumers; drift becomes a type error.                                             |
| System of record      | D1                                                                                              | Billing, entitlements, rights versions, and audit require relational integrity. KV is cache only. |
| Rights representation | Structured predicate rows with effective dates, never executable strings                        | Auditability and the ability to prove a future rule cannot fire early.                            |
| Risk output at launch | `Heuristic risk band`, no percentage                                                            | No validated artifact exists; `DIRECTIVE.md §13` forbids implying calibration.                    |
| Provider at launch    | `FixtureFlightProvider` active; live adapters implemented and failing closed                    | No commercial licence is present in this repository.                                              |
| Uploads               | `DOCUMENT_UPLOADS_ENABLED=false`                                                                | No malware-scanning pipeline exists; expense entry works without upload.                          |
| Time library          | Temporal or a verified IANA-correct library, decided at Phase 2 against current runtime support | Offsets are not zones; DST correctness is a tested requirement.                                   |
| Compatibility date    | Actual execution date at Phase 1, never copied from a document                                  | `DIRECTIVE.md §3.6`.                                                                              |

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
| Charters drift from the directive over time              | `scripts/validate-agents.mjs` in CI; ownership and invariant audits                                |
| Ads creep toward action controls                         | Placement conformance test + independent `trust-compliance-officer` review                         |
| "Passing" claimed without execution                      | `AGENTS.md §6` vocabulary; orchestrator re-runs gates itself                                       |

## 9. Next command

```
# Start Phase 1 in Claude Code
> Use the principal-architect subagent to execute DIRECTIVE.md Phase 1 (Foundation).
```

The orchestrator dispatch must state: the phase, its acceptance criteria, the upstream contracts now
available, and the verification commands expected back in the handoff report.
