# ADR 0003 — Motion allowance on public marketing routes

**Status:** accepted · **Date:** 2026-09-11 · **Decider:** `build-orchestrator`, under repository-owner instruction · **Authored by:** `principal-architect`
**Amends:** `DIRECTIVE.md §7`, `.claude/agents/brand-design-director.md`, `.claude/agents/frontend-ui-engineer.md`
**Amended:** 2026-09-12 — rule 2c, to record how view transitions were actually implemented. Every
other rule is unchanged.

## Context

`DIRECTIVE.md §7` ends its visual concept with "motion only for state change"
(`DIRECTIVE.md:331-334`). Before this ADR the `brand-design-director` charter restated that rule and
forbade looping, auto-advancing carousels, attention pulses on critical states, parallax and
"anything that moves while the user is reading", alongside the `--motion-fast` / `--motion-base` /
`--motion-slow` tokens of 120/180/240 ms (that Motion section, now amended to reference this ADR, is
`.claude/agents/brand-design-director.md:146-159`). The only motion policy shipped today is the
global collapse under `prefers-reduced-motion: reduce` at `apps/web/src/styles/tokens.css:210-218`;
the named tokens are not yet emitted.

The repository owner's visual-overhaul audit of 2026-09-11 found the live site fully static — no
motion, no call to action, three routes — and proposed an "Operations Desk" concept needing
scroll-driven reveals, one ambient decorative motif and page transitions on the public routes. None
of those is a state change, so the base rule forbids all three. The question is therefore not "may
we animate" but "where is that written": left to individual charters, `brand-design-director`,
`frontend-ui-engineer` and `visual-asset-director` would each decide locally what counts as
decorative — a rule expressed in three places, which `AGENTS.md §3.2` defines as a defect. This ADR
is the single place; `DIRECTIVE §7` and both charters are amended in the same change to point here,
the amended `§7` **Motion** paragraph (`DIRECTIVE.md:351-367`) being the normative summary and this
the long form; where the two appear to differ, the narrower reading governs. The allowance stays
narrow because a surface that moves while a traveler reads a delay bills that cost to exactly the
person the product exists for.

## Decision

**1. Scope.** Only the pre-rendered public marketing routes of `DIRECTIVE §18.1`
(`DIRECTIVE.md:747-752`). Never inside a data-bearing component — trip cockpit, segment card,
connection cockpit, rights card, action checklist, evidence packet, flight-lookup result states,
provenance chips, status pills — never on a `§18.2` private route (`/app/**`, `/auth/**`,
`/checkout/**`, `/admin/**`, `DIRECTIVE.md:753-754`), never on an error, maintenance or status page.
Those keep the base rule unchanged: motion on state change only.

**2. Permitted on public marketing routes.**

a. **CSS scroll-driven entrance reveals.** Pure CSS (`animation-timeline: view()` or equivalent),
firing once per element as it enters the viewport, no re-trigger on scroll-up, opacity plus a
translate of at most 24 px, animating `transform` and `opacity` only, never a layout property. The
un-animated DOM is the final readable state: a browser without support renders finished content.

b. **Ambient decorative motion, on original SVG/CSS art only** — the hero "operations desk" backdrop
(radar-arc sweep, route-line packets, grid) and the build-time SVG route globe. Each is
`aria-hidden="true"`, carries no text and no data, at most two motifs per route, cycle at most 12 s,
low amplitude, paused off-screen, never behind body text in a way that changes a measured pair.

c. **Cross-document view transitions** between public routes: a cross-fade of at most
`--motion-base`, 180 ms (`.claude/agents/brand-design-director.md:146`), header persisted, off under
`prefers-reduced-motion: reduce` per rule 4.

_Amended 2026-09-12._ This rule first read "**Astro View Transitions** (`<ClientRouter />`) between
public routes … with Astro's own reduced-motion behaviour applying on top of rule 4". What ships is
the **native cross-document CSS View Transition API** and no router: `@view-transition { navigation:
auto }` declared in the stylesheet, `::view-transition-old(root)` and `::view-transition-new(root)`
bounded by `--motion-view-transition` — 180 ms, the same value as `--motion-base` — the header
persisted through a `view-transition-name` declared in the stylesheet rather than by a `transition:*`
directive, and `@view-transition { navigation: none }` inside the `prefers-reduced-motion: reduce`
block, so rule 4's collapse is stated directly instead of delegated to a router
(`apps/web/src/layouts/app.css` sections 19 and 20, `apps/web/src/styles/tokens.css:223`).

`<ClientRouter />` is **not** used, for a reason narrower than preference. Astro 7.1.4's own
configuration reference, read in the installed package, records the router as incompatible with
Content-Security-Policy — "Astro's view transitions using the `<ClientRouter />` are not supported,
but you can consider migrating to the browser native View Transition API instead", and
"`unsafe-inline` directives are incompatible with Astro's CSP implementation"
(`astro@7.1.4`, `astro/dist/types/public/config.d.ts:673` and `:675`). The policy this site serves —
`script-src 'self'; style-src 'self'`, no `'unsafe-inline'` and no hashes
(`apps/web/public/_headers:26`) — refuses the inline script and the per-page inline style that the
router and the `transition:*` directives emit. The router would not merely cost more; it would be
inert.

The amendment is **narrower** than the text it replaces: the same 180 ms cross-fade, the same
persisted header, the same reduced-motion collapse, with zero JavaScript where the original allowed
a router. The Context's "where the two appear to differ, the narrower reading governs" clause
resolves it, and rule 5's client-router line is a budget ceiling this implementation does not spend,
not an instruction to use one.

d. **A scroll-scrubbed demonstration chronology** — the `§28` demo itinerary
(`DIRECTIVE.md:1018-1027`) advancing scheduled → delayed inbound → connection watch → cancellation →
"rights may apply" as the user scrolls. The base DOM is a complete, readable, correctly ordered list
and the scroll animation is purely additive. Every panel still carries "Demo data — not a live
flight." (`AGENTS.md §1.2`).

e. **CSS-only depth** — perspective tilt, layered parallax — on decorative layers only, driven by
scroll timelines, never by a JavaScript scroll listener.

**3. Still forbidden everywhere.** Auto-advancing carousels (also barred by the `§7` accessibility
floor, `DIRECTIVE.md:369-373`); attention pulses on `watch` or `critical` states; motion on a data
poll or re-render; loops inside a data-bearing component; motion a user must wait through before
content is readable; JavaScript scroll or `rAF` handlers for decoration; animated layout properties;
any motion that contributes to CLS.

**4. Reduced motion.** Under `prefers-reduced-motion: reduce` every item in rule 2 collapses:
reveals are instant, ambient motifs render a single static frame, view transitions are off, the
chronology shows the full list, depth layers are flat. The state change itself is never removed.

**5. Budgets unchanged.** Everything in rule 2 is CSS; the only JavaScript it introduces is Astro's
client router, counted inside the existing marketing-route budget — initial JS ≤ 30 KB gz,
CSS ≤ 25 KB gz, total ≤ 300 KB (`.claude/agents/performance-engineer.md:82`) — against
LCP < 2.5 s p75, CLS < 0.1, INP < 200 ms (`DIRECTIVE.md:943-945`; `performance-engineer.md:74-77`).
The demo cockpit island is a state-change island and follows the base rule, not this allowance.

**6. Route globe: Option A only.** A build-time-rendered SVG orthographic projection, CSS-animated
arc draw-in and packet motion, captioned "Illustrative route lines — not live traffic.", no IATA
codes on the globe. **Option B — the `cobe` WebGL globe, sized by the audit at roughly 5 KB gz,
loaded `client:visible`, with the SVG globe as the no-WebGL, reduced-motion and `noscript` fallback —
is not adopted**; it needs a new ADR, a chunk size measured from a real build, and owner approval.

**7. Preact-compat: deferred.** Decided only if a _measured_ React lazy chunk exceeds the 60 KB gz
per-chunk budget (`.claude/agents/performance-engineer.md:85`), and the ADR that decides it records
that measurement.

**8. Photography is outside this ADR.** The `visual-asset-director` charter is unchanged: no
decorative raster on `/`, `/flight-status/`, `/connection-risk/` or any cockpit view, no AI-generated
aircraft or airport imagery (`visual-asset-director.md:41-52`), licence-recorded photography on
editorial routes only, drawing still preferred to photographing (`:130-135`).

## Alternatives considered

**Keep "state change only" everywhere.** Rejected: it is the root cause the audit identified. The
marketing surface had no way to demonstrate what the product does before a traveler has a disruption
to look up, so the rule's cost was being paid entirely on the pages where the risk it guards against
does not exist.

**A Three.js or WebGL hero.** Rejected. `DIRECTIVE §11` bars adding a large framework, charting
library or map SDK out of familiarity (`DIRECTIVE.md:432-433`); the audit sizes the library alone at
roughly 150 KB gz against a 60 KB gz lazy-chunk budget; and the `§7` floor forbids a canvas-only
visualization (`DIRECTIVE.md:372-373`).

**Stock or AI-generated video.** Rejected. The `visual-asset-director` charter bars AI-generated
aircraft and airport imagery as fabricated operational imagery (`visual-asset-director.md:41-45`),
auto-advancing media is forbidden by the `§7` floor, and the weight is outside the 300 KB budget.

**A JavaScript scroll-animation library.** Rejected: it spends the initial-JS budget on decoration
and puts a scroll handler on the main thread, the INP target's most common failure mode.

## Consequences

**Positive.** One written rule instead of three local interpretations. Reveals and motifs are CSS,
so they cost no JavaScript and degrade to finished content, and motion inside a data-bearing
component can no longer be justified without amending this file.

**Negative.** The boundary between "data-bearing component" and "marketing surface" is judged per
component, and a homepage embedding a demo cockpit puts both on one page. It is a review item, not a
lint rule, so it needs named reviewers:

- `accessibility-lead` verifies the rule 4 collapse on every permitted item, and that no ambient
  motif sits behind text at a contrast pair measured without it.
- `performance-engineer` verifies rule 5: client router inside the initial-JS budget, no CLS
  contribution from reveals or motifs.
- `release-auditor` verifies rule 1: no motion from this allowance appears inside a data-bearing
  component, on a `§18.2` route, or on an error, maintenance or status page.

## Compliance

- `pnpm test:a11y` — reduced-motion pass over every permitted item (Phase 12; a deliberate stub
  until then, `package.json:21`).
- Playwright visual regression at 375 / 768 / 1024 / 1440 px in both themes (`DIRECTIVE.md:937`),
  with the reduced-motion frame captured as its own state.
- Bundle budget check against `.claude/agents/performance-engineer.md:82` and `:85`.
- `node scripts/validate-build-system.mjs` — the charters amended alongside this ADR must still
  pass structure and overclaim lint.
