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

**The derivatives were deleted on 2026-09-11. Nothing in `public/images/` ships.**

The eight source PNGs here are **AI-generated**, not photographs. A contact-sheet review of all
eight found:

- a legible airline wordmark on a departure board, a gate sign, and a baggage cart
  (`frustrated-waiting.png`);
- an airline wordmark and roundel on a customer-service desk sign, a standing sign, and a crew
  uniform badge (`rights-empowered.png`);
- carrier liveries on parked aircraft, including a fuselage wordmark
  (`hero-traveler.png`, `monitoring-peace.png`, `connection-stress.png`, `success-boarding.png`);
- crew uniforms and a cabin product rendered in a recognizable carrier's trade dress
  (`success-boarding.png`, `business-comfort.png`);
- invented flight numbers carrying a real carrier's designator shown as `DELAYED` / `ON TIME`
  (`frustrated-waiting.png`, `rights-empowered.png`).

That is three separate invariant breaches, which is why the derivatives are gone rather than
merely unreferenced:

1. **`AGENTS.md §1.4` — never imply affiliation.** A wordmark, roundel, livery, uniform, or cabin
   trade dress belonging to a real carrier may not appear without a verified written licence
   recorded in `docs/PROVIDER_LICENSING.md`. DelayPilot is not an airline and must never look like
   one is behind it.
2. **`visual-asset-director` charter — no AI-generated aircraft or airport imagery.** Generated
   imagery invents liveries and registrations, which is fabricated operational imagery. It also
   cannot be licensed: there is no rights-holder to license from, and no defensible claim to the
   marks it reproduces.
3. **`AGENTS.md §1.1` — never fabricate operational fact.** A board reading a real carrier's flight
   number as `DELAYED` is an invented operational claim baked into pixels, where no provenance
   label can reach it.

No licence record exists for any of them, and none can be created.

### Why the sources stay here

`design/v0-preview/` is reference-only: it is not built, deployed, served, linted, or typechecked,
and it is not a pnpm workspace member. Keeping the sources here preserves the composition and
lighting notes that are genuinely useful when briefing original art, while placing them outside
every served path. That separation *is* the quarantine — deleting the sources too would lose the
reference without improving the shipped surface.

### The rule

**Nothing in this directory may be regenerated, copied, converted, or derived into any served path
— `apps/web/public/` or otherwise — unless a verified licence record for that specific asset exists
in `scripts/assets/asset-licenses.json`**, carrying path, source, licence id, licence URL, permitted
commercial use, modification rights, attribution, and verification date.

For the AI-generated aircraft, airport, uniform, and cabin imagery in this directory, that record
**cannot exist**. These eight files are therefore permanently ineligible to ship, in any format, at
any size, cropped or uncropped. If a surface needs art, `visual-asset-director` draws original
route-line and radar-arc geometry (`DIRECTIVE.md §7`) — that is the intended answer, not a
better-licensed photograph.

### Using the compression script

`scripts/assets/compress-images.mjs` is still the tool for AVIF + WebP derivation at responsive
widths with per-file byte budgets and intrinsic dimensions emitted alongside (so every `<img>` can
reserve its box and avoid CLS). When run against this directory for inspection, it **must** target a
non-served scratch directory — never `apps/web/public/**`:

```bash
# Inspection only. Output goes to an untracked scratch path, never a served directory.
node scripts/assets/compress-images.mjs design/v0-preview/public/images /tmp/delaypilot-image-scratch

# Budget check. Passes with "Checked 0 emitted image(s)" while no derivatives are shipped.
node scripts/assets/compress-images.mjs --check apps/web/public/images
```

The `--check` invocation is what CI runs. `apps/web/public/images/` does not exist, and the script
treats an absent directory as an honest empty result rather than an error — so the check stays green
precisely because no raster derivatives ship.

## Running it

Standalone, outside the workspace:

```bash
cd design/v0-preview && npm install && npm run dev
```

It has its own `package.json`, `package-lock.json`, and `tsconfig.json` precisely so it cannot
interfere with the pnpm workspace again.
