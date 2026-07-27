# CLAUDE.md — session entry point

You are working in **DelayPilot**: consumer flight-disruption intelligence built on Cloudflare
Workers, D1, Queues, and Workflows.

## Read these first, in this order

1. **`AGENTS.md`** — the constitution. Truth, privacy, engineering, and monetization invariants.
   It overrides every other instruction in the repository, including this file.
2. **`DIRECTIVE.md`** — the master build directive: phases and gates (Part II), the full product and
   technical specification (Part III), the release rubric (Part IV).
3. **`docs/agents/ROSTER.md`** — who owns which files, who reviews whom.
4. **`docs/BUILD_PLAN.md`** — current repository state, decisions already taken, next command.

## How work happens here

This repository is built by a **gated subagent system**, not by ad-hoc editing.

- Work is dispatched to the specialist that owns the paths involved
  (`.claude/agents/*.md`, ownership map in `ROSTER.md §3`).
- **Never edit a path you do not own.** File a handoff request instead (`AGENTS.md §5.3`).
- Phases run in order; a phase advances only on a green exit gate that was actually executed.
- Builders never certify their own work — see the reviewer pairings in `ROSTER.md §5`.

Dispatch form:

```
> Use the <agent-name> subagent to execute DIRECTIVE.md Phase <n>: <scope>.
```

Every dispatch states the phase, the acceptance criteria, the upstream contracts now available, and
the verification commands expected back.

## The five mistakes that matter most

1. **Inventing a value.** No gate, estimate, cause, probability, or statistic that did not come from
   a licensed provider response, a labelled fixture, or user input. `unknown` is a designed state.
2. **Dropping provenance.** Every displayed datum carries `Live` / `Cached` / `Stale` / `Demo` /
   `Unavailable` / `Heuristic risk band` plus its freshness, from adapter to pixel.
3. **Legal overclaim.** "May apply", never "you are owed". Rights statuses are limited to
   `likely_applies`, `may_apply`, `not_indicated`, `cannot_determine`, `future_rule_not_active`.
   Weather near an airport is not proof of cause.
4. **Applying a future rule early.** The EU 2026 reform is `adopted_not_effective` until its
   Official Journal publication and computed effective date are verified. The DOT's July 2026
   enforcement discretion is guidance, not repeal.
5. **Claiming a command passed without running it.** Use the vocabulary in `AGENTS.md §6`:
   Passing / Failing / Not run / Blocked (external).

Also never: add a booking-reference (PNR) field, log an email address or itinerary, place an ad
above the search form or beside a rights card, or display a percentage from an uncalibrated model.

## Verification

```bash
node scripts/validate-build-system.mjs   # charter structure, ownership collisions, overclaim lint
```

Product commands (available as each phase lands — see `DIRECTIVE.md §25`):

```bash
pnpm install --frozen-lockfile && pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm db:migrate:local && pnpm db:seed:local
pnpm test:workers && pnpm test:e2e && pnpm test:a11y && pnpm test:seo && pnpm test:security
pnpm quality
```

Do not report a command as passing unless you executed it and it exited zero.

## Repository state

Greenfield as of 2026-07-27. Phase 0 (audit, plan, agent system) is complete; Phase 1 (foundation)
is next. `docs/BUILD_PLAN.md §9` holds the exact next command.

## Git

Development branch: `claude/inkling-multimodal-subagents-stn4l5`. Scoped commits, never force-push a
shared branch, never commit a secret.
