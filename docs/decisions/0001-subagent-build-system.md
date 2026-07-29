# ADR 0001 — Build DelayPilot with a gated subagent system

**Status:** accepted · **Date:** 2026-07-27 · **Decider:** `build-orchestrator`
**Supersedes:** the single-model, single-pass build instruction

## Context

DelayPilot's specification spans design tokens, Cloudflare Workers/D1/Queues/Workflows, licensed
flight-data integration, aviation weather parsing, four jurisdictions of passenger-rights law,
calibration statistics, SEO gating, ad-placement policy, billing entitlements, and a WCAG 2.2 AA
accessibility floor. The release bar is ≥ 95/100 with zero critical defects in security, privacy,
legal accuracy, billing, accessibility, data licensing, or the rights engine.

Two properties of the problem drive this decision:

1. **Failure is asymmetric.** Most defects are cosmetic. A small set — a fabricated gate number, a
   percentage from an uncalibrated model, an EC 261 reform applied before its effective date, an ad
   rendered beside a refund control — are product-destroying and legally hazardous. They are also
   the defects a _builder_ is least able to see in its own output, because each one is produced by
   the same instinct that makes the rest of the work look finished.
2. **Breadth exceeds coherent single-context authorship.** Doing regulatory rule modelling _and_
   calibration statistics _and_ ad policy well in one continuous pass means each is done at the
   quality of a generalist skimming a specification.

## Decision

Organize the build as **1 orchestrator + 24 specialist agents** with:

- **Single-writer path ownership** (`docs/agents/ROSTER.md §3`). Every path has exactly one owning
  agent. Cross-boundary changes are handoff requests, never direct edits.
- **Phase gates** (`DIRECTIVE.md` Part II §5). Fourteen phases, each with an entry condition,
  named owners, a published contract, exit-gate commands, and an independent reviewer.
- **Builder/reviewer separation** (`ROSTER.md §5`). The agent that writes the rights engine is not
  the agent that certifies its sources. The agent that ships ads is not the agent that certifies ad
  policy. Nothing self-certifies.
- **A constitution that outranks every charter** (`AGENTS.md`). Invariants live in one place; a
  charter that contradicts them is defective by construction.
- **Orchestrator-executed gates.** Gate commands are run by the orchestrator, not self-reported by
  the owning agent, with a fixed verification vocabulary (`AGENTS.md §6`).

## Alternatives considered

**One long linear pass.** Rejected: no independent review of the legally dangerous surfaces, and
quality decays across a specification this wide as context fills.

**Ad-hoc parallel agents without ownership rules.** Rejected: concurrent writers silently clobber
each other, and "who owns this file" becomes a per-dispatch judgment call that eventually fails.

**Layer-based split (frontend / backend / infra).** Rejected: the highest-risk concerns — rights
correctness, provenance, calibration honesty, ad placement — cut _across_ layers. Splitting by
layer distributes each risk across several owners, which is the same as owning it nowhere.

**Human review gates between phases.** Rejected for the build itself (the directive requires
execution without pausing for approval), but retained where it is genuinely required: editorial
`published` status and rights rule-set publication both need named human sign-off.

## Consequences

**Positive.** Dangerous surfaces get dedicated owners and separate auditors. Parallelism is safe
because disjointness is mechanically checkable. Gate results are evidence, not assertion. The
roster is legible: any contributor can see who owns a file and who reviews it.

**Negative.** Higher coordination overhead — contracts must exist before dependents start, and
handoffs add latency versus editing across a boundary. More total tokens than a linear build. The
roster and charters are themselves artifacts that can drift from the directive.

**Mitigations.** `packages/contracts` is published in Phase 2, before any consumer runs.
`scripts/validate-build-system.mjs` checks charter structure, ownership collisions, and overclaim
phrases in CI. `release-auditor` re-verifies claims by execution rather than trusting handoff
reports.

## Compliance

- `scripts/validate-build-system.mjs` must pass in CI.
- Every parallel dispatch requires a disjointness check over owned path sets.
- Every phase advance requires a gate result the orchestrator executed itself.
- Any invariant conflict escalates to the orchestrator rather than being resolved locally
  (`AGENTS.md §7`).
