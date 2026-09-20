# docs/TESTING.md — what "passing" means in this repository

**Owner:** `qa-test-architect` (`docs/agents/ROSTER.md §3` — `tests/**`, `e2e/**`,
`vitest.workspace.*`, `playwright.config.*`, this file).
**Status:** the visual-overhaul session **S4** slice of `DIRECTIVE.md` Phase 12. Three of the eight
`§22` suites exist and run; the rest are named, owned and dated below rather than implied.

This document exists so that nobody has to guess what a green command certifies. Two rules govern
every line of it:

1. **A suite that was not executed is `Not run`** (`AGENTS.md §6`). Not "should pass", not "covered".
2. **A check that has never been watched to fail is not yet a check.** Every suite here has a
   seeded-violation proof: a documented way to make it fail on purpose, and a recorded run where it
   did. Those proofs are listed in §7.

---

## 1. Commands

`DIRECTIVE.md §25` lists eighteen commands. This is every one of them, with what it does **today**.

| Command                                                         | Runs                                                 | State                                                                        | Owner                        |
| --------------------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------- |
| `pnpm install --frozen-lockfile`                                | pnpm                                                 | Working                                                                      | `principal-architect`        |
| `pnpm format:check`                                             | `prettier --check .`                                 | Working                                                                      | `principal-architect`        |
| `pnpm lint`                                                     | `astro sync` + `eslint .` + `pnpm lint:copy`         | Working                                                                      | `principal-architect`        |
| `pnpm typecheck`                                                | `pnpm -r typecheck`                                  | Working                                                                      | `principal-architect`        |
| `pnpm test`                                                     | `vitest run` — unit, in-package                      | Working. **Does not include `tests/**` or `e2e/**`** — see §2.               | package owners               |
| `pnpm test:workers`                                             | —                                                    | **Loud stub, exit 1.** Phase 12, `qa-test-architect`. §8.                    | `qa-test-architect`          |
| `pnpm test:e2e`                                                 | `pnpm exec playwright test`                          | Working — 237 tests, 6 spec files, 3 projects; CI runs 168 of them. §4, §10. | `qa-test-architect`          |
| `pnpm test:a11y`                                                | `node tests/a11y/run-axe.mjs`                        | Working — 80 axe runs (88 with `--conditional`) + 100 regression checks. §3. | `qa-test-architect`          |
| `pnpm test:seo`                                                 | `node scripts/seo/test-seo.mjs`                      | `seo-engineer`, same session — not run by me                                 | `seo-engineer`               |
| `pnpm test:security`                                            | —                                                    | **Loud stub, exit 1.** Phase 12, `security-privacy-engineer`. §8.            | `security-privacy-engineer`  |
| `pnpm build`                                                    | `astro build` + `verify-dist` + `wrangler --dry-run` | Working                                                                      | `frontend-ui-engineer` / SRE |
| `pnpm quality`                                                  | chains twelve of the above                           | **Failing**, because `test:workers` and `test:security` are stubs            | `platform-release-sre`       |
| `pnpm dev` / `pnpm preview`                                     | Astro / Wrangler                                     | Working                                                                      | —                            |
| `pnpm smoke`                                                    | —                                                    | Loud stub, exit 1. Phase 13, `platform-release-sre`                          | `platform-release-sre`       |
| `pnpm deploy`                                                   | `wrangler deploy`                                    | **Blocked (external)** — no Cloudflare credentials                           | `platform-release-sre`       |
| `pnpm db:migrate:local` / `db:seed:local` / `db:migrate:remote` | —                                                    | Loud stubs, exit 1. Phase 3, `data-platform-engineer`                        | `data-platform-engineer`     |
| `pnpm model:validate`                                           | —                                                    | Loud stub, exit 1. Phase 6, `risk-modeling-scientist`                        | `risk-modeling-scientist`    |

### Running one suite locally

```bash
# Accessibility — the whole of docs/ACCESSIBILITY.md §12, served under the real CSP.
pnpm test:a11y                              # 20 routes × 4 = 80 axe runs + 100 regression checks
node tests/a11y/run-axe.mjs --conditional   # + /accessibility/ and /contact/ = the published 88
node tests/a11y/run-axe.mjs --routes=/ --seed-violation=live   # prove a check fails when it should

# Browser suites.
pnpm test:e2e                                        # all three projects
pnpm exec playwright test --project=desktop          # one project
pnpm exec playwright test csp-and-errors             # one spec
pnpm exec playwright test --project=visual           # visual regression only

# Serve the built site by hand, with the real _headers policy applied.
node tests/tools/serve-dist.mjs 4520
```

Every suite measures a **built** `apps/web/dist`. Run `pnpm build` first; there is no dev-server
mode, because a dev server does not serve `apps/web/public/_headers` and a CSP suite measured
without a CSP is worthless.

### `DP_DIST` — measure a snapshot, not a moving target

Other agents rebuild `apps/web/dist` in place. A sweep that globs it mid-build finds a truncated
page, or none, and reports something that is not a fact about the product. Every harness honours
`DP_DIST`:

```bash
cp -a apps/web/dist /tmp/dist-snapshot
DP_DIST=/tmp/dist-snapshot pnpm test:e2e
```

The a11y runner additionally **fails loudly (exit 2) when it finds zero routes**, and
`csp-and-errors.e2e.mjs` asserts the route list is non-empty and contains `/`, for the same reason:
a sweep over nothing passes every assertion below it.

### Ports

The QA harnesses use **4500–4599** so they never collide with `performance-engineer`'s Lighthouse
runs or a developer's `astro dev` on 4321. Playwright: 4530. `run-axe.mjs`: 4521, and 4522 for the
conditional build.

---

## 2. The runner split — and why `vitest.workspace.*` does not exist

`pnpm test` is `vitest run` at the root. `pnpm test:e2e` is Playwright. **Their file sets are
disjoint by construction**, and that is load-bearing:

- Vitest's default glob matches any file named `*.test.*` or `*.spec.*` at any depth.
- Every Playwright spec in this repository ends **`.e2e.mjs`**, which that glob cannot match, and
  `playwright.config.mjs` pins `testDir: './e2e'` with `testMatch: '**/*.e2e.mjs'`.

Without both halves, `playwright test` globs the repository root, picks up the workspace's Vitest
files, and the two `expect` implementations collide on `Symbol($$jest-matchers-object)` with an
opaque failure. **Rename a spec to `*.spec.mjs` and `pnpm test` will try to run a browser test in
Node.**

**There is no `vitest.workspace.ts`.** Vitest 4 removed workspace files — `vitest/dist` throws
"The `test.workspace` option was removed in Vitest 4. Please migrate to `test.projects`". Its
successor lives in a root `vitest.config.ts`, which `docs/agents/ROSTER.md §3` assigns to nobody.
Creating a file no tool reads would be a placeholder (`AGENTS.md §1.6`), so the `unit` / `property` /
`workers` project split is filed as a handoff to `principal-architect` instead (§9).

**`playwright.config.mjs`, not `.ts`.** A root-level `.ts` file breaks `pnpm lint`:
`eslint.config.js` runs typescript-eslint with `projectService: true`, there is no root
`tsconfig.json` for it to resolve against (only `tsconfig.base.json`, which the service does not
consider), and the parse fails with "was not found by the project service". `pnpm typecheck` is
`pnpm -r typecheck` and never reaches the root either, so a root `.ts` file would be typechecked by
nothing while breaking lint. JSDoc types in `.mjs` give the same editor safety with none of that.

Browser globals inside `page.evaluate` callbacks are declared per file with a narrow
`/* global document, … */` line, listing exactly what that file uses, rather than by widening
`eslint.config.js` for the whole repository.

---

## 3. `pnpm test:a11y` — `docs/ACCESSIBILITY.md §12`, executed

**Entry point:** `tests/a11y/run-axe.mjs` (plain `node`, no flags, exits non-zero on any failure).

### What a zero exit means

| Part                | Parameters                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------- |
| axe                 | axe-core **4.13.0**, tags `wcag2a` `wcag2aa` `wcag21a` `wcag21aa` `wcag22aa`, viewport 1440 × 900 |
| matrix              | every emitted route × `{light, dark}` × `{no-preference, reduce}` — four runs per route           |
| threshold           | **zero violations at any impact**, `minor` included. No rule disabled.                            |
| `best-practice`     | separate pass, **reported, non-blocking**                                                         |
| `incomplete`        | counted and printed, **never waived**                                                             |
| console / CSP       | zero console errors and zero CSP refusals, under the real served policy                           |
| non-axe regressions | the five `§12` assertions, on every route — `tests/a11y/regressions.mjs`                          |

Reduced motion is a **dimension of the sweep, not a variant of a theme**: ADR 0003 rule 4 makes it a
state the page can be wrong in.

### How axe gets into the page, and why it is not `AxeBuilder`

`@axe-core/playwright` injects through `page.evaluate`, which travels over CDP and is therefore
**not subject to the page's Content-Security-Policy**. Convenient — and it silently removes the
policy from the thing under test.

This runner keeps the method `docs/ACCESSIBILITY.md §12` records for the published baseline: axe is
served from a **same-origin URL through request interception** and loaded with an ordinary
`<script src>`, so `script-src 'self'` stays enforced for the whole run. §12 notes that an inline
injection "disables the CSP under test and the first attempt failed loudly, which is the behaviour
to keep". `@axe-core/playwright` is installed and deliberately unused. **No divergence from §12; no
handoff owed to `accessibility-lead` on this point.**

### The two conditional routes

`/accessibility/` and `/contact/` are emitted only when `PUBLIC_CONTACT_EMAIL` is set (owner input
**I-3**, `docs/BUILD_PLAN.md §10`). `--conditional` builds them into a **scratch `outDir` outside the
repository** with a reserved `example.invalid` address that is never committed and never printed,
sweeps them, and deletes the build. Without the flag the runner prints `Not run: the 8 conditional
runs` and names the flag — it never silently reports 80 as though it were 88.

### The five non-axe regression assertions

Each is a defect axe returned clean on, and each has been fixed exactly once.

| #   | Assertion                                                                                                      | Filed as   | Implementation            |
| --- | -------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------- |
| 1   | `document.scrollingElement.scrollWidth === window.innerWidth` at 320 px, every route                           | B8         | `checkReflow320`          |
| 2   | every `role="progressbar"`: `aria-label`, first clause of `aria-valuetext`, band word are three strings        | B9, F27    | `checkProgressBarStrings` |
| 3   | every `<table>` inside `role="region"` + `tabindex="0"` + a **resolving** `aria-labelledby`; `scope` on `<th>` | F31        | `checkTableRegions`       |
| 4   | no **rendered** `aria-busy` on a page that is not loading; no `aria-live` on a served route                    | F28, §15.7 | `checkBusyAndLiveRegions` |
| 5   | no accessible name ends with the word its own `<dt>` uses as a label                                           | F29, F39   | `checkLabelEchoes`        |

Notes on the two places the implementation is stricter or looser than a naive reading:

- **#4** also treats `role="alert"` and `role="status"` as live regions. `§15.15` measured zero of
  all three; a page that genuinely needs one is a design change `accessibility-lead` should review,
  and this check is what forces that review. It measures **rendered** elements, so the one
  `aria-busy="true"` inside `<div data-dp-state="searching" hidden>` on `/` is correctly ignored.
- **#5** runs twice: per definition-list row as `§12` words it, and page-wide over status pills as
  `§15.16` measured it (39 pills, 0 ending in a field label). F39 lived in `ItineraryTimeline`,
  outside any `<dl>`, so the row rule alone would have missed it exactly as the first review did.

---

## 4. `pnpm test:e2e` — Playwright

**Config:** `playwright.config.mjs`. **Retries: 0, everywhere** (see §6). `forbidOnly: true`.

### Projects

| Project      | Surface                                     | Covers        |
| ------------ | ------------------------------------------- | ------------- |
| `desktop`    | Chromium 141.0.7390.37, 1440 × 900          | 84 tests      |
| `mobile-375` | Chromium, 375 × 812, `isMobile`, `hasTouch` | 84 tests      |
| `visual`     | Chromium, viewport per test                 | 69 tests — §5 |

`desktop` + `mobile-375` = **168 tests**, and that pair is what CI runs. `visual` is a local and
pre-merge check by deliberate decision, for the reason in §5.

**WebKit and Mobile Safari are `Not run`.** Only Chromium is installed at `/opt/pw-browsers`, and
`playwright install` must not be run in this environment (`@playwright/test@1.56.1` is pinned to the
pre-installed revision). The `mobile-375` project is Chromium with a mobile viewport: it tests
layout, target geometry and the `<dialog>` drawer, and proves **nothing** about WebKit's rendering.
`DIRECTIVE.md §22`'s WebKit requirement is an open gap (§9), not something a green run here covers.

### Spec files

| Spec                         | Tests | What it proves                                                                                                                                                |
| ---------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/csp-and-errors.e2e.mjs` | 44    | every route: 200, the served CSP header **equals** `_headers`, zero CSP violations, zero console/page errors, zero cross-origin requests, manifest loads      |
| `e2e/hidden-states.e2e.mjs`  | 40    | every element carrying `hidden` computes `display: none`                                                                                                      |
| `e2e/keyboard-walk.e2e.mjs`  | 18    | full Tab walk on five routes: no stop without a focus indicator, nothing obscured, no trap; skip link; mega-nav Enter/Escape; modal drawer + inert background |
| `e2e/lookup-states.e2e.mjs`  | 10    | `§17` `initial` · `invalid flight` · `searching` · `provider unavailable`, driven through the UI; provenance vocabulary; `§28` demo sentence; `§3.4` footer   |
| `e2e/ad-placement.e2e.mjs`   | 56    | `§20`'s five positional prohibitions + `AGENTS.md §4`'s two container rules, in the live DOM, with a seeded proof per clause                                  |
| `e2e/visual.e2e.mjs`         | 69    | §5                                                                                                                                                            |

Shared code: `e2e/harness.mjs` (fixtures), `e2e/pages/keyboard.mjs`, `e2e/pages/ad-placement.mjs`.

### What the shared fixture does to every page load

Ads and analytics hosts are **blocked** — `DIRECTIVE.md §20` requires ads disabled in test and
screenshot modes — and every blocked or cross-origin request is **recorded**, so the day this build
starts making one, a spec says so. CSP violations, console errors and page errors are collected from
an init script that runs **before the first byte**, because a `securitypolicyviolation` fired during
parse is exactly the one a listener attached after `goto` would miss.

### `§20` ad placement — why it is checked twice

`apps/web/scripts/verify-dist.mjs` already decides the same five clauses by **byte offset** in the
emitted HTML, at build time. That is the right tool for a build gate and it is not re-implemented
here. It is the wrong tool for two clauses once CSS exists: "above the primary search" is a question
about what a reader meets first, and `order`, `grid-area`, `position: sticky` or
`flex-direction: column-reverse` can all paint a slot above a form that follows it in the source;
"adjacent" is about perceived separation, and 600 characters of markup is not a distance a person
experiences — 600 pixels is. So the same questions are asked of the rendered page: document order
**and** painted geometry for clause 1, `closest()` for clauses 2–4, and pixels plus structural
boundaries for clause 5.

**No ad slot is rendered anywhere in this build** (`AdSlotShell` returns `null` until a consent
platform and a slot id exist), so the per-route assertions run over zero slots. That is why the same
spec seeds a real slot into each of the six forbidden positions and asserts the matching clause
fires, plus one permitted position that must fire nothing.

### What the browser suites deliberately do not cover

- **Focus order against reading order**, and **accessible-name quality**. Both need a human
  judgement about meaning (`docs/ACCESSIBILITY.md §12`); a test asserting today's order would be a
  snapshot of markup dressed up as a rule.
- **Focus-ring contrast.** `accessibility-lead` measured it from rendered pixels (§15.15: tightest
  3.52:1). The walk asserts the ring is _drawn_; a token change is their gate, not this one's.
- **Screen readers.** None is installed and none is installable here. VoiceOver + Safari and
  NVDA + Firefox are `Not run`.
- **Tab-stop counts.** Measured and reported as annotations, never asserted — adding a link must not
  fail a suite.

Measured on this tree (Chromium, both projects): `/` 47 stops desktop / 42 mobile, `/flight-status/`
26 / 21, `/connection-risk/` 24 / 19, `/passenger-rights/` 22 / 17, `/404.html` 30 / 25; **0 without
a focus indicator, 0 obscured, 0 traps** in all ten walks. The homepage's 47 against
`accessibility-lead`'s hand-counted 44 is the `<input type="date">`: Chromium gives it three
internal segment stops plus one on its closed-shadow picker indicator, which a human counting
controls counts once. 47 − 3 = 44. That fourth stop is the one place `document.activeElement`
matches `:focus-within` and not `:focus`; the walk records it as browser-internal and excludes it
from the indicator assertion, because the page cannot select, style or own it.

---

## 5. Visual regression

**68 committed baselines, 5.4 MB, under `e2e/__screenshots__/visual/`.**

| Set                | Matrix                                                         | Frames |
| ------------------ | -------------------------------------------------------------- | ------ |
| Breakpoint frames  | 6 routes × {375, 768, 1024, 1440} × {light, dark}              | 48     |
| Reduced motion     | `/` × 4 widths × {light, dark} — **its own state**             | 8      |
| `§17` state panels | 3 cockpit panels × {375, 1440} × {light, dark}, element-scoped | 12     |

The six routes are `/`, `/flight-status/`, `/connection-risk/`, `/delay-risk/`,
`/passenger-rights/`, `/404.html` — chosen in `tests/tools/routes.mjs`, where each entry records the
`§17` states it carries. The three panels are `article.dpp-segment` (demo · delayed),
`section.dpp-connection` (protected · heuristic risk band), `section.dpp-rights` (may apply · cause
unknown).

**Frames are the first screen, not the whole page.** A full-page homepage baseline is a 2 MB PNG
that changes whenever any of fifteen sections moves; eight of them would be 16 MB in a repository
whose entire tracked tree is 20 MB. The breakpoints decide the header, the hero and the primary
lookup, which is what a reader meets, and the three element-scoped panels cover the states further
down without paying for the scroll between them.

**Reduced motion is a separate state, not a flag.** `animations: 'disabled'` (Playwright's default
for `toHaveScreenshot`) cancels ambient motifs and fast-forwards finite animations so a frame is not
a photograph of an arbitrary moment; `prefers-reduced-motion: reduce` changes **which CSS applies**.
They are orthogonal, so both dimensions exist. A computed-style assertion additionally proves **zero
animations are running** under `reduce` on all six routes — a stronger claim than a photograph.

**Tolerance: `maxDiffPixels: 0`**, because two consecutive runs of this suite on this toolchain
produce byte-identical PNGs, so any non-zero diff is a real change in the product rather than noise
this suite would be hiding by rounding it away. Current fingerprint of the committed set: md5 of the
md5s of all 68 files, `4842f7045c4008d1ea7c4d0a97a42757` (it was
`f25015c2b9b37a6a698a82297f42edf3` before the twelve-frame rebaseline recorded in §11). A different
OS, GPU or Chromium revision will need a deliberate rebaseline; the baselines are valid for the
pinned toolchain and nothing else.

**Never widen the tolerance to clear a failure.** `maxDiffPixels: 0` is the only reason a green run
here means anything; a `maxDiffPixelRatio` large enough to absorb the re-rasterisation in §11 would
also absorb a provenance chip changing colour or a state label losing a word. A rebaseline records a
change someone inspected. A widened tolerance hides every future one, silently, forever.

### Element-scoped frames measure the document above them as well

The twelve `§17` panel frames are captured with `expect(locator).toHaveScreenshot()`, so the PNG is
`ceil(top + height) − floor(top)` device rows of a box whose height is fractional — 691.515625 px
for `article.dpp-segment` at 1440, 1286.625 px for `section.dpp-connection`, 1222.828125 px for
`section.dpp-rights`. Change the height of anything **above** the panel and the panel's `top` lands
on a different fraction, the same box spans a different number of integer rows, and every glyph in
it re-rasterises. The panel itself need not change by one pixel — in §11 it did not, to the sixth
decimal — and the frame still fails.

So when a layout change lands, the frames it can disturb are not only the ones showing the changed
element. **Full-page frames are safe if the change is below the fold; element-scoped frames are
never safe if the change is anywhere above them in the document.** Check both, and check them with
the panel's own measured `getBoundingClientRect()` rather than by eye.

### The `visual` project is deliberately excluded from runner CI

`.github/workflows/ci.yml` runs `pnpm test:e2e --project=desktop --project=mobile-375` — 168 of the
237 tests — and **not** `visual` (69). The decision is recorded here so it is findable from the
suite and not only from the workflow.

These 68 baselines were generated in this development container, on its fonts, its GPU-less
rasterisation and its Chromium 141.0.7390.37. `maxDiffPixels: 0` is defensible **because** two runs
on that toolchain are byte-identical. The same zero tolerance on a GitHub-hosted `ubuntu-latest`
image turns font hinting into a test failure, and a suite that fails for reasons unrelated to the
change under review gets muted — which is worse than not having it. So `visual` stays a local and
pre-merge check, run by whichever agent changed the surface:

```bash
pnpm exec playwright test --project=visual            # all 69 frames
pnpm exec playwright test --project=visual -g "home"  # one set
```

Making it a CI gate needs a runner whose rendering the baselines were generated on — a container
action, or a self-hosted image pinned to the same Chromium build and the same font set. That is a
real option and it is not free; it is open on me, not on `platform-release-sre`, who has said it
will wire whatever lands.

### Updating a baseline

```bash
pnpm exec playwright test --project=visual --update-snapshots=changed -g "home 1440 light"
```

**Never a blanket `--update-snapshots`.** A diff is a finding for the owning agent first
(`frontend-ui-engineer` for layout, `brand-design-director` for tokens). The baseline moves only
after that agent has agreed the new rendering is the intended one, and the commit that moves it says
which change it belongs to. A rebaseline in a commit that changes nothing else is a red flag, not
housekeeping.

---

## 6. Flake policy

**`retries: 0` in `playwright.config.mjs`, and it stays there.** A retry converts a real race into an
intermittent green and the agent whose code contains the race never finds out.

Forbidden as flake cures: `test.retry`, `page.waitForTimeout`, raising the global timeout, and
`test.skip` on anything other than a surface that genuinely does not exist at that viewport. When a
spec flakes, the cause is one of: an unawaited promise, an unseeded RNG, a real clock, shared state
between tests, or a directory being rewritten underneath the run. The last one is real here — see
`DP_DIST` in §1.

Two mechanisms replace waiting:

- Transient states are observed **synchronously inside the page**. The lookup's `searching` state is
  read in the same `page.evaluate` that calls `requestSubmit()`; polling for it from the test side
  would be a race by construction.
- `reuseExistingServer: false`. A leftover server from an earlier run may be serving a different
  build, and a suite that silently measured the wrong `dist` is worse than one that refuses to start.

---

## 7. Proof that each check can fail

Every one of these was executed in the S4 session. A check nobody has watched fail is not a check.

| Check                     | How to make it fail                                                       | Observed                                                   |
| ------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| axe itself                | `node tests/a11y/run-axe.mjs --routes=/ --seed-violation=axe`             | `image-alt (critical) × 4 runs`, exit 1                    |
| reflow at 320             | `--seed-violation=reflow`                                                 | `scrollWidth=900 against innerWidth=320`, exit 1           |
| progressbar three strings | `--seed-violation=progressbar`                                            | `aria-label and aria-valuetext first clause are the same`  |
| table region              | `--seed-violation=table`                                                  | `not inside role="region"` + `1 of 1 <th> carry no scope`  |
| live region               | `--seed-violation=live`                                                   | `1 aria-live region(s): div[aria-live="polite"]`           |
| label echo                | `--seed-violation=label-echo`                                             | `"Delayed Status" sits under <dt>Status</dt>`              |
| clean control             | `node tests/a11y/run-axe.mjs --routes=/`                                  | exit 0                                                     |
| CSP detector              | built in — `csp-and-errors.e2e.mjs` appends an inline `<script>`          | `script-src` refusal recorded; the script did not execute  |
| focus-indicator detector  | built in — `keyboard-walk.e2e.mjs` loads a same-origin ring-stripping CSS | stops without an indicator > 0                             |
| each `§20` clause         | built in — `ad-placement.e2e.mjs` seeds a slot into each position         | all six clauses fire; the permitted position fires nothing |
| visual baselines          | any pixel change — observed for real, not seeded                          | 12 of 69 failed on a 1-device-row shift; §11               |

The a11y seeds live in `SEEDS` in `tests/a11y/run-axe.mjs`; an unknown name exits 2 with the list.

---

## 8. The suites that are still loud stubs

Both exit 1 with a message naming their owner and phase. `AGENTS.md §6`: a stub reporting a false
green is worse than a failure.

| Command              | Owner                       | Phase | Will cover                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| -------------------- | --------------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test:workers`  | `qa-test-architect`         | 12    | `@cloudflare/vitest-pool-workers` with D1/KV/Queues bindings and isolated per-test storage: migrations from empty, repositories, magic-link auth, CSRF, session expiry, trip CRUD, the `§16` Workflow, queue delivery, DLQ, Stripe and provider webhooks, deletion/export jobs, entitlements, admin authorization, and `Idempotency-Key` on every mutation. **Blocked until Phases 3 and 7 land** — there is no migration, no repository and no route to test. |
| `pnpm test:security` | `security-privacy-engineer` | 12    | `§22`'s fifteen cases: IDOR · CSRF · XSS · SQL injection · rate limit · enumeration · magic-link replay · expired token · forged webhook · duplicate webhook · `/go` allowlist · upload rejection · cache leak · CSP · secret scan. The case list is theirs; the harness is mine to wire. **Blocked until Phase 7** for everything except CSP and the secret scan.                                                                                             |

`pnpm quality` chains both, so **`pnpm quality` is Failing by design** until they land. That is the
correct state: it fails at a stub that says why, not at an invented green.

---

## 9. `DIRECTIVE.md §22` coverage map

`Exists` = a named file runs today. `Not run` = no implementation. No cell is left blank.

### §22 Unit

Owned by the package that owns the code (`ROSTER.md §3`), not by this file. Today `pnpm test` runs
**18 files, 888 tests** across `packages/ui`, `apps/web/src/lib/copy`, `apps/web/src/lib/seo` and
`apps/web/test`. Every `§13` formula — Haversine, distance bands, delay arithmetic, Beta-Binomial,
calibration metrics, connection slack, Monte Carlo determinism, freshness weight, confidence, alert
fingerprints, entitlements, encryption envelopes, rule predicates, provider normalization — is
**Not run**, because `packages/domain`, `packages/rights-engine`, `packages/connection-engine` and
`packages/providers` are Phase 2 and later. `principal-architect` owns the first of them.

### §22 Property · Provider contract · Rights golden · Integration

**Not run.** All four need contracts that do not exist yet (Phases 2, 4, 5, 7). `tests/property/**`,
`tests/workers/**` and the provider-contract table are mine to build in the phase that supplies
their inputs; the rights golden matrix is `rights-rules-engineer`'s to write and mine to wire into
CI.

### §22 E2E — the 20 named flows

| Flow                                                                                                                                                                                                                                                                                                              | Spec                                                                       | State                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| anonymous lookup                                                                                                                                                                                                                                                                                                  | `e2e/lookup-states.e2e.mjs`                                                | **Exists** — resolves to `provider unavailable`, which is the honest terminal state until Phase 4                                                                                                                |
| demo itinerary                                                                                                                                                                                                                                                                                                    | `e2e/lookup-states.e2e.mjs` (demo sentence), `e2e/visual.e2e.mjs` (panels) | **Partial** — the cockpit is asserted, the "open the demonstration" journey is not yet a flow                                                                                                                    |
| provider outage                                                                                                                                                                                                                                                                                                   | `e2e/lookup-states.e2e.mjs`                                                | **Exists** — labelled `Unavailable`, no percentage, no gate, no terminal                                                                                                                                         |
| mobile navigation                                                                                                                                                                                                                                                                                                 | `e2e/keyboard-walk.e2e.mjs` (drawer, 375 project)                          | **Exists**                                                                                                                                                                                                       |
| account creation · save trip · add connection · mark self-transfer · view rights · enable email alert · push permission · purchase Trip Pass · open billing portal · generate evidence packet · invite family member · delete trip · export account · request deletion · admin source review · offline saved trip | —                                                                          | **Not run.** Sixteen flows. None of the surfaces exists: no auth, no trip, no billing, no admin, no service worker. A spec against a route that is not emitted would fail for the wrong reason (`AGENTS.md §6`). |

### §22 Accessibility

| Case                       | Where                                                   | State                                    |
| -------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| axe on every primary route | `tests/a11y/run-axe.mjs`                                | **Exists** — 88 runs                     |
| keyboard-only flows        | `e2e/keyboard-walk.e2e.mjs`                             | **Exists** — 10 walks                    |
| focus order                | manual, `docs/ACCESSIBILITY.md §10`                     | Not automatable — see §4                 |
| dialogs                    | `e2e/keyboard-walk.e2e.mjs` (drawer)                    | **Exists**                               |
| live regions               | `tests/a11y/regressions.mjs` #4                         | **Exists** — asserts there are none      |
| error handling             | `e2e/lookup-states.e2e.mjs` (error summary + focus)     | **Exists**                               |
| reduced motion             | `run-axe.mjs` matrix + `visual.e2e.mjs` animation check | **Exists**                               |
| 200 % zoom                 | `docs/ACCESSIBILITY.md §15.15`, measured by hand        | **Not run** here — reflow at 320 is      |
| high contrast              | —                                                       | **Not run**                              |
| mobile touch targets       | `docs/ACCESSIBILITY.md §15.16`, measured by hand        | **Not run** here                         |
| screen-reader names        | —                                                       | **Not run** — no screen reader installed |

### §22 Visual regression

**Exists** — §5 — **and it is not a CI gate.** The 69 frames run locally and pre-merge only, for
the toolchain reason in §5; a coverage map that let "Exists" be read as "CI enforces it" would be
the kind of green this document exists to refuse. 375 / 768 / 1024 / 1440, light and dark, plus
reduced motion as its own state, over the six routes and three state panels this tree can reach. The `§17` states that need a contract, a
provider, a trip or a session — `already missed`, `offline`, `error boundary`, `maintenance`,
`consent required`, `ad blocked`, all of Trip, Billing beyond `not configured`, and Notifications —
are **Not run**, and a baseline of a state nobody can reach would certify nothing.

### §22 Security · Performance

**Not run** here. Security is §8. Performance (bundle budgets, Lighthouse, CWV) is
`performance-engineer`'s, delivered in the same session under `scripts/perf/**`.

---

## 10. `DIRECTIVE.md §23` — CI check order

`.github/workflows/ci.yml` (owner: `platform-release-sre`) runs **eleven of the eighteen**, plus
four repo-local gates that substitute for none of them. `.github/workflows/deploy.yml` re-runs the
same eleven under the same step names before it calls Wrangler, because it can be triggered by
`workflow_dispatch` and must not assume a CI run happened on the same commit; the two lists must be
changed together. Measured runtimes below are from this session, on this machine, against a 20-route
build — a hosted runner is slower.

| #   | Check                  | Command                          | In CI | Runtime                                  | Gates merge on                                            |
| --- | ---------------------- | -------------------------------- | ----- | ---------------------------------------- | --------------------------------------------------------- |
| 1   | frozen-lockfile        | `pnpm install --frozen-lockfile` | yes   | ~8 s                                     | a lockfile that does not match `package.json`             |
| 2   | format                 | `pnpm format:check`              | yes   | ~10 s                                    | any unformatted file                                      |
| 3   | lint                   | `pnpm lint`                      | yes   | ~40 s                                    | an ESLint error or a forbidden phrase (298 files, 0 hits) |
| 4   | typecheck              | `pnpm typecheck`                 | yes   | ~60 s                                    | any TS or `astro check` error                             |
| 5   | unit                   | `pnpm test`                      | yes   | ~3 s                                     | 18 files, 888 tests, 0 skipped, 0 `.only`                 |
| 6   | property               | `pnpm test`                      | no    | —                                        | Phase 2                                                   |
| 7   | Workers integration    | `pnpm test:workers`              | no    | —                                        | stub, §8                                                  |
| 8   | web build              | `pnpm build`                     | yes   | ~40 s                                    | `verify-dist` findings                                    |
| 9   | edge build             | `pnpm build`                     | yes   | ~10 s                                    | `wrangler deploy --dry-run`                               |
| 10  | migration validation   | `pnpm db:migrate:local`          | no    | —                                        | Phase 3                                                   |
| 11  | rights-rule validation | —                                | no    | —                                        | Phase 5                                                   |
| 12  | content-quality gate   | —                                | no    | —                                        | Phase 11                                                  |
| 13  | SEO validation         | `pnpm test:seo`                  | yes   | ~15 s                                    | nine suites over the built `apps/web/dist`                |
| 14  | accessibility smoke    | `pnpm test:a11y`                 | yes   | **109 s** (80 runs) / 122 s + build (88) | one axe violation at any impact; CI runs the 80-run sweep |
| 15  | Playwright             | `pnpm test:e2e`                  | yes   | **~126 s** (237 tests, 2 workers)        | **168 of 237** — `desktop` + `mobile-375`; `visual` is §5 |
| 16  | bundle budgets         | `pnpm perf:budgets`              | yes   | ~5 s                                     | `perf.budgets.json` script/island counts and byte budgets |
| 17  | dependency audit       | —                                | no    | —                                        | `security-privacy-engineer`                               |
| 18  | secret scan            | `pnpm test:security`             | no    | —                                        | stub, §8                                                  |

Checks 5, 13, 14, 15 and 16 were added in `acd1ec6`. Check 15 is **Passing** on this tree: the one
real product defect it was red on (F-QA-1) is fixed and closed in §11.

### `playwright install`: correct here, wrong on a runner

§13 says **never run `playwright install` here**, and that is true **of this development container
and nowhere else**. It ships Chromium 141.0.7390.37 at `/opt/pw-browsers/chromium-1194` with
`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`, and `@playwright/test@1.56.1` is pinned to exactly that
revision; a download here would produce a second copy, or a mismatched one.

A GitHub-hosted `ubuntu-latest` runner has no such directory and no pre-installed browser, so
carrying that sentence there produces a workflow whose `chromium.launch()` has nothing to launch.
**On a runner, `playwright install chromium` _is_ the pinned path**: the revision it downloads is
resolved from the pinned `@playwright/test` version in `package.json` — the same pinning discipline
this container expresses by a different mechanism. Both workflows therefore leave
`PLAYWRIGHT_BROWSERS_PATH` unset, install **Chromium only**, and cache `~/.cache/ms-playwright`
keyed on the exact pinned version **with no `restore-keys`**, because a prefix cache hit would hand
the run the wrong Chromium. `tests/tools/browser.mjs` warns when the variable is unset; on a runner
that warning is the expected state, not a failure. The reasoning is also recorded in the `ci.yml`
header, which is the file a contributor reads first.

WebKit and Firefox are installed in neither place and stay **Not run** (§4).

---

## 11. Findings from this session

Filed, not fixed. A QA agent that patched product code to turn its own suite green would have
removed the only reason to trust the suite. **Open: none.** The one finding below is closed.

### F-QA-1 — the homepage renders a `hidden` provider-unavailable panel — **CLOSED**

|                                  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owner**                        | `frontend-ui-engineer` (`apps/web/src/layouts/**`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **File**                         | `apps/web/src/layouts/app.css:1883` — `.dpp-state { display: grid; gap: … }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **Input**                        | `GET /`, any viewport, either theme, no interaction                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| **Expected**                     | `<div class="dpp-state" data-dp-state="unavailable" hidden>` is not rendered. `LookupForm.astro:139` writes `hidden` for exactly this reason, and the island's `show()` toggles the attribute.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| **Observed**                     | The element computes `display: grid` and paints at **446 × 408 px** at 1440 and **293 × 502 px** at 375. `.dpp-state` sets `display` unconditionally, and an author rule outranks the user-agent `[hidden] { display: none }`, so the attribute has no effect. A reader landing on `/` is shown "Unavailable — No licensed flight-data provider is connected…" before typing anything.                                                                                                                                                                                                                                                                                        |
| **Failing tests**                | `e2e/hidden-states.e2e.mjs` `/` and `e2e/lookup-states.e2e.mjs` `initial`, in both projects — 4 of 237                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Why nothing caught it before** | The markup is correct, so `verify-dist.mjs` passes; the resulting page is perfectly accessible, so all 88 axe runs pass; the element is `tabindex="-1"`, so the keyboard walk never lands on it. It is only visible to a check that reads **computed style**. This is the single clearest argument for running a browser in CI.                                                                                                                                                                                                                                                                                                                                               |
| **Suggested fix**                | One rule, e.g. `.dpp-state[hidden] { display: none }`, beside the existing `.dpx-lookup__result[hidden]` and `.dpx-errors[hidden]` rules at `app.css:1022` and `:1030`. The same class of bug is prevented site-wide by `hidden-states.e2e.mjs`.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Second symptom**               | The `initial` note (`<p data-dp-state="initial">`) and the `unavailable` card are on screen **at the same time**, so the page presents two mutually exclusive `§17` states at once, and the state change a reader is supposed to perceive after submitting has already happened before they type.                                                                                                                                                                                                                                                                                                                                                                             |
| **After the fix**                | The panel sits below the fold at both baselined widths, so the `home-*` visual baselines are **expected to be unaffected**. Confirm rather than assume: `pnpm exec playwright test --project=visual -g "home"`. If a frame does move, rebaseline with `--update-snapshots=changed` in the same commit as the fix and say so in the message.                                                                                                                                                                                                                                                                                                                                   |
| **Fixed in**                     | `27764f3`, `frontend-ui-engineer`. Not the suggested rule: a single site-wide reset at the top of the cascade, `[hidden] { display: none !important }`, and the removal of all four per-component `[hidden]` rules it replaces. `!important` is load-bearing — `[hidden]` has specificity (0,1,0), identical to a single class, so without it the reset wins or loses on where the next author happens to put their rule, which is not a reset. Three of the four removed rules guarded elements that never set `display` at all, which is the evidence the per-component pattern was applied by reflex rather than by measurement — and exactly how `.dpp-state` was missed. |
| **Verified**                     | `e2e/hidden-states.e2e.mjs` + `e2e/lookup-states.e2e.mjs`: 4 failures → **50 passed**. `e2e/hidden-states.e2e.mjs` now sweeps every emitted route for any `[hidden]` element whose computed `display` is not `none`, so the guarantee is site-wide rather than four hand-placed rules. Measured in this session against the pre-fix and post-fix builds side by side: `[hidden]` elements painting on `/` went `["div.dpp-state"]` → `[]`.                                                                                                                                                                                                                                    |

#### What the original entry got half-right, and the lesson

The **After the fix** row predicted the `home-*` frames would be unaffected. That was correct and it
was confirmed rather than assumed — all 8 `home-*` frames and all 48 breakpoint frames passed
untouched. What it did not anticipate is the set it said nothing about: the **twelve `§17`
state-panel frames**, which are element-scoped and therefore sensitive to document height **above**
them, not only to the element they photograph. Removing the wrongly visible panel dropped `/`'s
`scrollHeight` by exactly that panel's height — measured 19472 → 19064 at 1440 (−408) and
33346 → 32844 at 375 (−502) — so every panel below it started at a different fraction of a pixel.

**The rule to carry forward: a full-page frame is safe from a change below its fold; an
element-scoped frame is never safe from a change anywhere above it in the document.** §5 now states
this, with the arithmetic.

#### Ruling on the twelve moved baselines

`frontend-ui-engineer` left `e2e/__screenshots__/**` untouched and recommended a rebaseline. The
ruling is mine, and it was reached by measurement rather than by agreement:

1. **Nothing that produces content changed.** `git diff 80f71b5..HEAD -- apps/web packages/ui data`
   is six files. Only two reach the browser: `app.css` (one `[hidden]` reset in, four redundant
   rules out) and `BaseLayout.astro` (`<head>` only — meta tags and one
   `type="application/ld+json"` data block, neither of which renders). No component, no token, no
   copy, no demo data.
2. **The panels did not change size.** Measured against a reconstructed pre-fix build served beside
   the post-fix one: `article.dpp-segment` 691.515625 px at 1440 in both;
   `section.dpp-connection` 1286.625 px in both; `section.dpp-rights` 1222.828125 px in both.
   Identical to the sixth decimal, at 375 as well. Only `top` moved — by −408.3906/−408.3907 at
   1440 and −502.0156/−502.0157 at 375. **Fractional**, which is the whole mechanism.
3. **The ±1 px is fully explained, with no residual.** A fractional-height box at a new fractional
   offset spans a different number of integer device rows:
   `ceil(top + height) − floor(top)` predicts **12 of 12** frame heights exactly — both the old
   value and the new one. `segment` 693 → 692, `rights` 1224 → 1223, `connection` 1287 → **1288**
   (it grew; a uniform "everything shrank" story would not have predicted that). All six 375 frames
   are predicted unchanged, and all six are unchanged.
4. **No content moved, vanished or was truncated.** Every leaf text node inside all three panels is
   identical across the two builds in count (58 / 71 / 42), tag, class, text, height, and offset
   **relative to the panel's own top**. Provenance chips identical. `Demo data — not a live flight.`
   appears 16 times on `/` in both, byte-identical, so every `Demo` chip still carries its `§28`
   sentence. Card borders and corner radii are present on all four edges of both the old and the new
   frame — nothing is clipped.
5. **Read, not skimmed.** Three diffs inspected directly plus a 3× magnified before/after of the one
   region that redraws visibly (`Rebooking · Cannot determine` at 375): same words, same chip, same
   position; only glyph anti-aliasing differs.

**Verdict: the baselines were photographed through the defect; the new rendering is the correct
one.** Rebaselined with `--update-snapshots=changed -g "§17 state panels"` on the pinned toolchain
this set was generated on (Chromium 141.0.7390.37 at `/opt/pw-browsers/chromium-1194`,
`@playwright/test@1.56.1`, Node 22.22.2) — confirmed before rebaselining, per §5's rule that a
baseline is valid for the pinned toolchain and nothing else. Exactly 12 files rewritten, none added,
none deleted, and the other 56 byte-identical to their previous contents. The tolerance was **not**
touched: `maxDiffPixels: 0` stands.

---

## 12. Fixture discipline

No fixture was added in this session; `apps/web/src/demo/itinerary.ts` (owner:
`frontend-ui-engineer`, interim until Phase 4) is the only demonstration data the browser suites
read, and they read it through the rendered page rather than importing it.

The rules every future fixture is held to:

- **Deterministic, redacted, labelled.** Synthetic carrier and flight identifiers only. Never a real
  flight number paired with invented live detail (`DIRECTIVE.md §28`, `AGENTS.md §1.1`).
- **No real email, card, token, provider key, unredacted licensed payload — and no PNR anywhere,
  test data included** (`AGENTS.md §2`).
- Shared fixtures live in `data/fixtures/**`, owned by `integrations-provider-engineer`. Request
  additions by handoff; only test-local factories belong under `tests/**`.
- The one address this suite needs — the `PUBLIC_CONTACT_EMAIL` for the conditional a11y build — is a
  reserved `example.invalid` value, generated at run time, never committed and never printed.
- Freeze the clock and seed every RNG. This tree's pages are statically rendered with baked
  timestamps, so no clock freezing is needed yet; the moment a live time reaches the DOM it will be.

---

## 13. Environment

| Fact                       | Value                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------ |
| Node                       | 22.x (`engines.node >= 22.12.0`)                                                                       |
| Playwright                 | `@playwright/test@1.56.1`, pinned to the pre-installed browser revision                                |
| Chromium                   | 141.0.7390.37 at `/opt/pw-browsers/chromium-1194`                                                      |
| `PLAYWRIGHT_BROWSERS_PATH` | `/opt/pw-browsers` — **never run `playwright install` _here_.** On a runner it is the pinned path; §10 |
| axe-core                   | 4.13.0 exactly (the version the published baseline was measured with)                                  |
| `@axe-core/playwright`     | 4.13.0, installed and deliberately unused — §3                                                         |
| Chromium sandbox           | `--no-sandbox`, because this container runs as root. A property of the runner, not the product.        |
| Ports                      | 4500–4599 reserved for QA harnesses                                                                    |
