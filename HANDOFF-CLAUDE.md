# HANDOFF → Claude: DelayPilot — monorepo audit + the CI-that-tests-nothing anomaly

**Created:** 2026-10-02 by ZCode (fleet audit 2026-10-01). **Branch:** `handoff/claude-audit`
(cut from `claude/inkling-multimodal-subagents-stn4l5`, the checkout's working branch).
**The loop:** you audit + advise → write `RECOMMENDATIONS-CLAUDE.md` (spec at bottom) →
Kevyn feeds it to ZCode for execution. You advise; you do not execute, merge, or deploy.

## What this build is

"Stay ahead of flight disruptions": track a flight, understand connection risk, and see
the refund/care/rebooking rules that may apply — **source-linked status, versioned
passenger-rights rules, no booking code required**. pnpm monorepo: `apps/web` +
`apps/edge`, packages for `billing`, `connection-engine`, `contracts`, `domain`,
`notifications`, `observability`, `providers`; plus `design/` and `scripts/`.

## Where the intent lives

`DIRECTIVE.md`, `docs/BUILD_PLAN.md`, `CLAUDE.md`, `AGENTS.md`, `README.md` — a full
intent set; read DIRECTIVE + BUILD_PLAN before touching anything.

## Verified current status + THE ANOMALY

**Zero test files anywhere** — yet a `ci.yml` workflow exists that the fleet CI map
scored as "runs tests". A CI gate that runs no tests is worse than none: it stamps green
on anything. First audit task: read `.github/workflows/ci.yml`, determine what it
actually executes, and reconcile the gap (the npm-test-missing case: does it pass
vacuously or fail?).

Then:
1. **contracts + domain audit**: the versioned passenger-rights rules are the product's
   differentiator — how are rule versions sourced, dated, and rendered? Is the
   "source-linked" promise enforced in code or aspirational copy?
2. **connection-engine**: the risk math — inputs, weights, determinism. This is the
   piece users will rely on at an airport; spec its golden-case suite first.
3. **Test strategy for the monorepo**: which packages get suites in what order
   (contracts → connection-engine → domain → providers-with-mock-fetch), file names,
   and the pnpm-compatible runner setup (workspace `pnpm -r test`?).
4. **CI fix**: replace the vacuous gate with the fleet-standard workflow (see any
   `ci/run-tests` branch from 2026-10-02 for the house pattern) pointed at real suites.
5. **Branch state**: work sits on a claude/inkling branch — check divergence from main
   and recommend consolidation before new work piles on.

## Fleet constraints

Public site (delаypilot.app) — no deploys. Never merge. pnpm house style here. Secrets
via vault. tsx + node:assert convention.

## Deliverable spec

`RECOMMENDATIONS-CLAUDE.md` in repo root (this branch): `## Verdict` · `## Findings`
(P1/P2/P3 with file:line, CI anomaly first) · `## Execution plan` (ordered; branch
names, test files, verification commands) · `## Operator decisions needed`.
