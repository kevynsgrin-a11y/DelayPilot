<h1 align="center">DelayPilot</h1>
<p align="center"><strong>Stay ahead of flight disruptions.</strong></p>
<p align="center">
Track a flight, understand connection risk, and see the refund, care, and rebooking rules that may
apply—before airport chaos makes the decision for you.
</p>
<p align="center"><sub>Source-linked status · Versioned passenger-rights rules · No booking code required</sub></p>

---

## What this repository currently contains

**The build system and an empty foundation — not the product.** Phases 0 and 1 of 14 are complete:
the constitution, the master build directive, the specialist roster, 25 runnable agent charters, and
a workspace that installs, typechecks, lints, and builds. Phases 2–14 build the application.

Nothing a traveler would use exists yet: there is no flight lookup, no rights engine, no connection
assessment, no trip cockpit, and no database. `apps/web` serves one minimal homepage and `apps/edge`
answers one health endpoint.

Being precise about this matters more than looking finished — the same discipline the product itself
requires (`AGENTS.md §1`).

| Present today                                                                                      | Status          |
| -------------------------------------------------------------------------------------------------- | --------------- |
| `AGENTS.md` — invariants that override everything                                                  | ✅ Phase 0      |
| `DIRECTIVE.md` — phased build directive + full product spec + release rubric                       | ✅ Phase 0      |
| `docs/agents/ROSTER.md` — 25 agents, single-writer path ownership, reviewer pairings               | ✅ Phase 0      |
| `.claude/agents/*.md` — runnable charters                                                          | ✅ Phase 0      |
| `docs/BUILD_PLAN.md` — repo audit, decisions, sequencing, risk register                            | ✅ Phase 0      |
| `scripts/validate-build-system.mjs` — structural + ownership + overclaim validator                 | ✅ Phase 0      |
| pnpm workspace, strict TypeScript base config, ESLint + Prettier gates, `.env.example`             | ✅ Phase 1      |
| `apps/web` — Astro, pre-rendered; one minimal homepage (full homepage is Phase 10)                 | ✅ Phase 1      |
| `apps/edge` — Worker + Hono, `/api/v1/health`, RFC 9457 problems, `ASSETS` fallthrough             | ✅ Phase 1      |
| `packages/*` — ten package skeletons that build and typecheck, no logic yet                        | ✅ Phase 1      |
| [`design/v0-preview/`](design/v0-preview/README.md) — v0 design reference, never built or deployed | reference only  |
| Contracts and domain utilities (`packages/contracts`, `packages/domain`)                           | ⬜ Phase 2      |
| `migrations/` (D1 schema) and `data/` (reference data, rights rule sets, fixtures)                 | ⬜ Phase 3      |
| Providers, engines, edge API, auth, notifications, billing, UI, SEO                                | ⬜ Phases 4–11  |
| `ml/` (calibration, evaluation, model cards)                                                       | ⬜ Phase 6      |
| Test suites, operations docs, release gate                                                         | ⬜ Phases 12–14 |

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

The target layout. Directories arrive with their phase — see the status table above for what exists
today.

```
apps/web      Astro public site (pre-rendered, SEO-first) + React islands for the app
apps/edge     Cloudflare Worker — /api/v1, /auth, /webhooks, Workflows, Queues, scheduled jobs
packages/     contracts · domain · providers · rights-engine · risk-engine · connection-engine
              notifications · billing · observability · ui
ml/           offline training, calibration, evaluation, model cards (Python)
data/         airports · airlines · rights sources and rule sets · fixtures · seeds
migrations/   ordered D1 migrations
design/       visual design reference (v0 Next.js output) — never built, linted, or deployed
docs/         architecture, data model, API, rights engine, privacy, security, runbooks, quality
```

Cloudflare Workers + Static Assets, D1 (system of record), KV (bounded cache), Queues + DLQ,
Workflows (trip monitoring), optional R2 (uploads disabled by default), Turnstile, Stripe.

## Quickstart

Requires Node ≥ 22.12 and pnpm ≥ 10.

```bash
git clone <repo> && cd DelayPilot
pnpm install --frozen-lockfile
```

These exit zero today:

```bash
node scripts/validate-build-system.mjs     # charter structure, ownership, overclaim lint
pnpm format:check && pnpm lint && pnpm typecheck && pnpm build
```

`pnpm dev` starts both long-running servers — Astro on `:4321`, `wrangler dev` on `:8787`, where
`GET /api/v1/health` answers.

Then, in Claude Code:

```
> Use the principal-architect subagent to execute DIRECTIVE.md Phase 2 (Contracts and domain).
```

The rest of `DIRECTIVE.md §25` exits non-zero on purpose until the phase that owns it lands. A stub
that reports a false green is worse than a failure (`AGENTS.md §6`):

```bash
pnpm test                                        # no suites yet — Phase 2 onward
pnpm db:migrate:local && pnpm db:seed:local      # Phase 3
pnpm model:validate                              # Phase 6
pnpm test:seo                                    # Phase 11
pnpm test:workers && pnpm test:e2e && pnpm test:a11y && pnpm test:security   # Phase 12
pnpm smoke                                       # Phase 13
pnpm quality            # the full scored audit → docs/QUALITY_REPORT.md
```

## External inputs required before production

Each will ship with a complete adapter, a validated config contract, an `.env.example` entry, a
labelled demo path, and a fail-closed production path. None blocks development. `.env.example`
already enumerates every key by name and shape, with no values.

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
