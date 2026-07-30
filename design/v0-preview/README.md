# v0 design preview — reference only, never shipped

This directory holds a v0-generated **Next.js** application. It is a **visual design source**, not
the product.

DelayPilot ships as **Astro + React islands on Cloudflare Workers** (`DIRECTIVE.md §11`). Nothing in
this directory is built, deployed, served, linted, or typechecked by the repository toolchain — it
is excluded in `eslint.config.js` and `.prettierignore`, and it is not a pnpm workspace member.

## Why it is kept

The v0 output is a genuinely useful starting point for the visual system. These components map
directly onto specified surfaces and are worth porting rather than re-inventing:

| v0 component | Ports to | Spec |
| --- | --- | --- |
| `components/provenance.tsx` | The provenance chip used by every data-bearing component | `AGENTS.md §1.2` |
| `components/segment-card.tsx` | Segment card | `DIRECTIVE.md §18.5` |
| `components/connection-cockpit.tsx` | Connection cockpit | `DIRECTIVE.md §18.5`, `§13` |
| `components/rights-card.tsx` | Rights card | `DIRECTIVE.md §18.5`, `§15` |
| `components/cockpit-panels.tsx` | Trip cockpit panels | `DIRECTIVE.md §18.5` |
| `components/flight-lookup-form.tsx` | Flight lookup | `DIRECTIVE.md §18.4` |
| `components/home-sections.tsx` | Homepage sections | `DIRECTIVE.md §18.3` |
| `components/status.tsx`, `logo.tsx`, `theme-toggle.tsx` | Primitives and brand marks | `DIRECTIVE.md §7` |

## Why it is not simply used

1. **Platform.** Next.js has no `ASSETS` binding, no D1, no KV, no Queues, no Workflows. The trip
   monitoring lifecycle, alert deduplication, rights versioning, and entitlement resolution all
   depend on them.
2. **Performance.** Public pages must ship near-zero JavaScript to hold LCP < 2.5s and
   Lighthouse ≥ 95 (`DIRECTIVE.md §22`). Astro's islands model is the reason those targets are
   reachable; a React app shell is not.
3. **Truth invariants.** v0 does not know `AGENTS.md`. Any mock flight number, gate, time, cause,
   probability, or rights conclusion in this directory is **generated fiction** and must be audited
   before any of it reaches a rendered surface.

## Porting rules

When lifting anything from here into `apps/web`:

- Every data-bearing component carries a provenance label from the exact six-value vocabulary —
  `Live` · `Cached` · `Stale` · `Demo` · `Unavailable` · `Heuristic risk band` — plus a freshness
  age. No exceptions, no tooltips hiding it.
- `unknown` renders as a designed state, never a blank, dash, or zero.
- No percentage for risk. There is no calibrated artifact, so risk is a qualitative band labelled
  `Heuristic risk band` with its factors named.
- Rights render as "may apply", never "you are owed". Statuses are limited to `likely_applies`,
  `may_apply`, `not_indicated`, `cannot_determine`, `future_rule_not_active`.
- Every demo panel says "Demo data — not a live flight."
- Contrast is **measured** in both themes, not eyeballed. Status is never conveyed by colour alone.
- No airline, airport, or regulator logo, wordmark, or trade dress.

## Images

The eight source PNGs in `public/images/` total ~12.7 MB (1.3–2.1 MB each) and are far outside
budget. Web-ready derivatives are generated into `apps/web/public/images/` as AVIF + WebP at 640px
and 1024px, with intrinsic dimensions emitted alongside so every `<img>` can reserve its box and
avoid CLS:

```bash
node scripts/assets/compress-images.mjs design/v0-preview/public/images apps/web/public/images
node scripts/assets/compress-images.mjs --check apps/web/public/images   # budgets only
```

Current result: **12.7 MB of source → 569 KB for the whole AVIF set**, largest single file 64 KB,
0 budget failures.

Note that these are photographs of people and travel scenes. `visual-asset-director`'s charter
requires image-sourcing licence hygiene: before any of them ship publicly, their provenance and
licence must be recorded, and `DIRECTIVE.md §7` prefers original route-line and radar-arc motifs
over stock photography for the brand surfaces.

## Running it

Standalone, outside the workspace:

```bash
cd design/v0-preview && npm install && npm run dev
```

It has its own `package.json`, `package-lock.json`, and `tsconfig.json` precisely so it cannot
interfere with the pnpm workspace again.
