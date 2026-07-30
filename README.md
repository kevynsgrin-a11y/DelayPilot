<h1 align="center">DelayPilot</h1>
<p align="center"><strong>Stay ahead of flight disruptions.</strong></p>
<p align="center">
Track a flight, understand connection risk, and see the refund, care, and rebooking rules that may
apply—before airport chaos makes the decision for you.
</p>
<p align="center"><sub>Source-linked status · Versioned passenger-rights rules · No booking code required</sub></p>

---

## What this repository currently contains

**The build system, not yet the product.** Phase 0 is complete: the constitution, the master build
directive, the specialist roster, and 25 runnable agent charters. Phases 1–14 build the application.

Being precise about this matters more than looking finished — the same discipline the product itself
requires (`AGENTS.md §1`).

| Present today                                                                        | Status         |
| ------------------------------------------------------------------------------------ | -------------- |
| `AGENTS.md` — invariants that override everything                                    | ✅             |
| `DIRECTIVE.md` — phased build directive + full product spec + release rubric         | ✅             |
| `docs/agents/ROSTER.md` — 25 agents, single-writer path ownership, reviewer pairings | ✅             |
| `.claude/agents/*.md` — runnable charters                                            | ✅             |
| `docs/BUILD_PLAN.md` — repo audit, decisions, sequencing, risk register              | ✅             |
| `scripts/validate-build-system.mjs` — structural + ownership + overclaim validator   | ✅             |
| Application code (`apps/`, `packages/`, `migrations/`, `ml/`)                        | ⬜ Phases 1–14 |

## What DelayPilot will do

For a traveler, without ever asking for a booking reference:

1. Find a flight and build a single- or multi-segment itinerary.
2. Distinguish a **protected through-ticket** connection from a **self-transfer**.
3. Show current status, schedule changes, gates and terminals where licensed data supports them.
4. Give a transparent delay, cancellation, and connection-risk assessment — with the live factors
   that drive it, and the freshness of each source.
5. Give source-linked passenger-rights guidance for the **US, EU, UK, and Canada**, versioned by
   effective date.
6. Give a prioritized action checklist during a disruption.
7. Monitor a saved trip and send deduplicated alerts.
8. Organize receipts and a factual disruption chronology into a printable evidence packet.

It never files a claim, never books or rebooks, never reads your email, never stores your passport,
and never tells you that you are owed money — only what **may** apply, under which rule version,
based on which facts.

## Principles you will see enforced everywhere in this codebase

- **Provenance on every datum.** `Live` · `Cached` · `Stale` · `Demo` · `Unavailable` ·
  `Heuristic risk band`. Nothing renders without it.
- **`unknown` is a designed state**, never a blank, a zero, or a guess.
- **No percentage without calibration.** With no validated model artifact, DelayPilot shows a
  heuristic band and names its factors.
- **Rules are versioned data, not prose in a component.** A future rule cannot bind an earlier
  event — that is a property test, not a convention.
- **Fail closed.** Missing credentials or an unapproved provider licence degrades to a labelled
  state; it never silently serves fixtures as live data.
- **Ads can never be mistaken for a product control**, and paid tiers see none.

## Architecture

```
apps/web      Astro public site (pre-rendered, SEO-first) + React islands for the app
apps/edge     Cloudflare Worker — /api/v1, /auth, /webhooks, Workflows, Queues, scheduled jobs
packages/     contracts · domain · providers · rights-engine · risk-engine · connection-engine
              notifications · billing · observability · ui
ml/           offline training, calibration, evaluation, model cards (Python)
data/         airports · airlines · rights sources and rule sets · fixtures · seeds
migrations/   ordered D1 migrations
docs/         architecture, data model, API, rights engine, privacy, security, runbooks, quality
```

Cloudflare Workers + Static Assets, D1 (system of record), KV (bounded cache), Queues + DLQ,
Workflows (trip monitoring), optional R2 (uploads disabled by default), Turnstile, Stripe.

## Quickstart

```bash
git clone <repo> && cd DelayPilot
node scripts/validate-build-system.mjs     # verify the agent system is intact
```

Then, in Claude Code:

```
> Use the principal-architect subagent to execute DIRECTIVE.md Phase 1 (Foundation).
```

Product commands land as their phases complete; the full list is in `DIRECTIVE.md §25`:

```bash
pnpm install --frozen-lockfile
pnpm dev                # web + edge, fixture provider, demo mode
pnpm db:migrate:local && pnpm db:seed:local
pnpm typecheck && pnpm lint && pnpm test && pnpm build
pnpm test:workers && pnpm test:e2e && pnpm test:a11y && pnpm test:seo && pnpm test:security
pnpm quality            # scored audit → docs/QUALITY_REPORT.md
```

## External inputs required before production

Every one has a complete adapter, a validated config contract, an `.env.example` entry, a labelled
demo path, and a fail-closed production path. None blocks development.

Cloudflare account and binding IDs · a purchased domain for `PUBLIC_SITE_URL` · flight-data provider
credentials **and the commercial licence permitting consumer display** · Stripe keys and Price IDs ·
email and VAPID keys · consent-management and AdSense slot IDs · affiliate agreements · human legal
and editorial sign-off · a historical on-time dataset before any model is called calibrated.

## Contributing

Read `AGENTS.md`, then `CLAUDE.md`. Work is dispatched to the agent that owns the paths
(`docs/agents/ROSTER.md §3`); never edit a path you do not own — file a handoff instead.

## Disclaimer

DelayPilot is an independent travel-information tool. It is not an airline, airport, government
agency, law firm, claims company, or flight-data provider. Guidance is informational and may not
reflect every fact in your case.
