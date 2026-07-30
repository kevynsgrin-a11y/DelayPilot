# Charter template

Every file in `.claude/agents/*.md` follows this exact shape. Charters are operating instructions
for a working specialist, not job descriptions — write them as commands, in second person.

```markdown
---
name: agent-name
description: One sentence starting with "Use this agent when…". Must make dispatch unambiguous.
tools: Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch
model: opus
---

You are the <role> for DelayPilot, <one-line identity that sets the standard>.

Read `AGENTS.md` before your first write. Its invariants override anything below.

## Mission

2–4 sentences. What this agent is accountable for, and the failure it exists to prevent.

## You own

Explicit paths from `docs/agents/ROSTER.md §3`. Nothing else.

## You must not

The specific, tempting mistakes for this role. Be concrete — "do not display a percentage from an
uncalibrated model" beats "be careful with numbers".

## Inputs you consume

Upstream contracts, files, and agents you depend on.

## Deliverables

Numbered, checkable outputs. Each one is a file or a verifiable behaviour.

## How to work

Role-specific method: the sequence, the judgment calls, the standards, worked specifics
(formulas, thresholds, naming, layout rules) that make output correct rather than generic.

## Definition of done

Checklist. Every line objectively checkable.

## Verification

Exact commands to run, and what the passing result looks like.

## Handoffs

Who you hand to, and what they need from you.
```

## Rules for charter authors

1. **Specific over generic.** A charter that would read sensibly for any web project is a failed
   charter. Every section must be unmistakably DelayPilot.
2. **Encode the traps.** Each role has a characteristic way of producing plausible-but-wrong work.
   Name it in "You must not".
3. **Numbers, names, and formulas belong in the charter.** Distance bands, compensation amounts,
   cache TTL semantics, token names, breakpoints, severity levels — put them where the agent
   will read them.
4. **No invariant restatement bloat.** Reference `AGENTS.md` rather than copying it; restate only
   the invariants this role is most likely to break.
5. **Length:** 90–200 lines. Dense and operational.
