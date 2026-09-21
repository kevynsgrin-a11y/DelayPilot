# docs/PERFORMANCE.md — budgets, baseline, and method

**Owner:** `performance-engineer` (`docs/agents/ROSTER.md §3`)
**Owned paths:** this file, `scripts/perf/**`, `perf.budgets.json`
**Status:** measured 2026-09-20, visual-overhaul session S4, on the 20 pre-rendered `DIRECTIVE §18.1`
routes. Nothing here is inherited from a document; every figure was produced by a command run in
that session, and every command is written down below so the figure can be produced again.

---

## 0. The one thing this document protects

The site ships **four external same-origin scripts totalling 2,050 bytes gzipped** and **hydrates
nothing**. React renders on the server; no `client:*` directive exists anywhere in
`apps/web/src/**`; there is not one `<astro-island>` element in the built output. Every good number
below follows from that single property.

It is also the property a well-meant change destroys in one line. One `client:load` on one
component pulls in the React runtime and the 2 KB never comes back. So `perf.budgets.json` budgets
the script count, the hydrated-island count and the inline-executable-script count **exactly, with
no headroom**, while byte budgets carry stated headroom. A budget that can absorb a regression is
decoration.

---

## 1. How to run everything

```bash
pnpm build                                     # apps/web/dist — the thing every budget measures
pnpm perf:budgets                              # = node scripts/perf/check-budgets.mjs
node scripts/perf/check-budgets.mjs --report   # every measurement, asserting nothing
node scripts/perf/lighthouse.mjs               # the Lighthouse gate, six routes, median of three
node scripts/perf/lighthouse.mjs --report      # same, asserting nothing
node scripts/perf/lighthouse.mjs --routes all  # all twenty routes
node scripts/perf/lighthouse.mjs --compress none        # the no-compression worst case
node scripts/perf/lighthouse.mjs --form-factor desktop  # 1440x900
node scripts/perf/interaction-latency.mjs               # INP, 375x667, 4x CPU throttle
node scripts/perf/interaction-latency.mjs --width 1440 --height 900
node scripts/perf/serve-dist.mjs --port 4610            # the build, under the real headers
```

`pnpm perf:budgets` is the only one wired into `package.json`, and `pnpm quality` **does not reach
it**: `quality` short-circuits at `pnpm test:workers`, a deliberate Phase 12 stub, before
`perf:budgets` runs (`docs/BUILD_PLAN.md §10`, "S4 opened"). Until the Workers pool lands, the perf
gates must be invoked individually and a report claiming `quality` covered them is wrong.

### What each script is

| Script                                 | What it does                                                                                                                                                                              |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/perf/lib/measure-dist.mjs`    | Reads `apps/web/dist` and returns a measured resource graph: every file's gzip and brotli size, and per route the document, its critical path, its request count and its inline elements. |
| `scripts/perf/check-budgets.mjs`       | Asserts that graph against `perf.budgets.json`. Exits non-zero naming the budget, the measured value, the overage and the owning agent.                                                   |
| `scripts/perf/serve-dist.mjs`          | Serves `apps/web/dist` under the `/*` block of `apps/web/public/_headers`, with CDN-style content encoding. Used by both measurement scripts.                                             |
| `scripts/perf/lighthouse.mjs`          | Lighthouse 13 against that server; asserts the `DIRECTIVE §22` categories and the lab Core Web Vitals; writes JSON.                                                                       |
| `scripts/perf/interaction-latency.mjs` | Event Timing INP on the real controls, under a CPU throttle. Reports; not a CI gate yet — see §7, finding P-4.                                                                            |

### There is no `lighthouserc.json`, on purpose

`docs/agents/ROSTER.md §3` reserves the filename for this agent, and the file is deliberately not
created. `lighthouserc.json` is the configuration format of `@lhci/cli`, and this repository pins
plain `lighthouse@13.5.0` as a direct dev dependency precisely so that the measured version is the
one the manifest names. A `lighthouserc.json` sitting in the root that no installed tool reads is
worse than no file: it looks authoritative, it drifts, and the first person to change a threshold
changes it in the file that does nothing. Every threshold lives in `perf.budgets.json →
lighthouse.gates`, which `scripts/perf/lighthouse.mjs` actually reads.
**Handoff:** `build-orchestrator` should replace the `lighthouserc.json` cell in `ROSTER.md §3` with
`scripts/perf/**` and `perf.budgets.json`, which is what is owned.

---

## 2. Measurement method, precisely enough to reproduce

### 2.1 The wire model

Every byte budget is a **payload** size, computed from the built file:

- **gzip level 9** of the contents for content types a CDN compresses: `html`, `css`, `js`, `mjs`,
  `json`, `map`, `svg`, `txt`, `xml`, `webmanifest`.
- **the byte length unchanged** for content types a CDN does not re-encode: `woff2` (which carries
  brotli inside the format), `png`, `webp`, `avif`, `jpg`, `ico`.

gzip level 9 is the unit because every budget in `.claude/agents/performance-engineer.md:80-85` is
stated in gzipped kilobytes, because it is reproducible from the Node standard library with no
pinned tool, and because it is an **upper bound** on brotli, which is what a browser negotiating
`br` actually receives. Brotli quality 11 is measured next to every figure and reported, never
gated.

Lighthouse's `transferSize` additionally counts response headers. `scripts/perf/lighthouse.mjs`
reconciles the two and reports the residual, so the static model is checked against the browser
rather than merely being self-consistent. On the 2026-09-20 baseline the residual was **5,328 B
over 8 requests on `/` and 4,644 B over 7 requests elsewhere — 663 to 666 bytes per response**,
which is the `_headers` security policy (the CSP line alone is about 250 bytes) plus the status
line. The request counts matched the model exactly on all six audited routes.

### 2.2 The critical path

"Critical path" is the document plus every same-origin subresource a browser fetches before the
page is rendered and interactive: stylesheets, scripts, and preloaded fonts. Icons, the web
manifest and the Open Graph images are measured but held out, because none is on the path to first
paint and a headless browser does not request them. This is verified, not assumed: the Lighthouse
network log recorded exactly the eight critical requests the model predicts for `/` and the seven
it predicts for every other route.

Lighthouse injects one `data:image/svg+xml` probe of its own during a run. It is excluded from
every total. No file in `apps/web/dist` contains a `data:` URI — `apps/web/scripts/verify-dist.mjs`
fails the build on one — so anything with a `data:` URL belongs to the tool, not to DelayPilot.

### 2.3 What is served during a measurement

`scripts/perf/serve-dist.mjs`, which parses the `/*` block of `apps/web/public/_headers` and
applies it to every response. The policy is never restated in the server; if the CSP changes in
`_headers`, the measurement changes with it. Verified on 2026-09-20 against the S3 session's
scratch server: the six security headers are byte-identical.

Measuring without the real Content-Security-Policy measures a site we do not ship. The same logic
applies to compression, so the server negotiates `content-encoding` (brotli, then gzip, then
identity) for text content types and never for `woff2`, `png`, `ico` or `webp`.

**The compression assumption, stated plainly.** Both Cloudflare and Vercel compress static text
assets by default; no file in this repository enables or configures it. That could not be verified
against the live origin from this environment — `curl -I https://delaypilot.app/` is refused by the
proxy with `CONNECT` 403, the same egress block recorded in `docs/BUILD_PLAN.md §10`. Rather than
gate on an unverifiable assumption, **both conditions were measured**, and the `DIRECTIVE §22`
gates are met under both (§4). The pass therefore does not depend on the assumption. One
`curl -sI -H 'Accept-Encoding: br' https://delaypilot.app/` closes it the moment egress allows.

`Cache-Control` is deliberately **not** synthesised by the server: no file in this repository
declares one for a static asset, so the measurement shows the real, missing policy and Lighthouse's
`cache-insight` reports it. That is finding P-1.

### 2.4 Lighthouse conditions

| Setting     | Value                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------- |
| Tool        | `lighthouse@13.5.0`, Node API, a direct dev dependency                                       |
| Browser     | Chromium 141.0.7390.37 at `/opt/pw-browsers/chromium-1194`                                   |
| Launch      | `@playwright/test@1.56.1` with `--remote-debugging-port`; the port is handed to the Node API |
| Server      | `scripts/perf/serve-dist.mjs`, `_headers` applied, `--compress auto`                         |
| Form factor | mobile, **375 × 667 at DPR 2** — the narrowest `DIRECTIVE §18.7` breakpoint                  |
| Throttling  | Lighthouse **simulated**: 150 ms RTT, 1,638.4 Kbps, **4× CPU slowdown**                      |
| State       | cold — a fresh Lighthouse run per sample, no warm cache carried between runs                 |
| Samples     | **3 runs per route**; the reported run is the one whose LCP is the median LCP                |
| Machine     | `benchmarkIndex` 1,688–1,694 across the session                                              |

`chrome-launcher` is a transitive of `lighthouse`, not a root dependency, so a root-level script
cannot import it under pnpm's strict linking. Hence Playwright. **`playwright install` is never run
here**; the pin to 1.56.1 exists because `playwright-core@1.56.1` declares chromium revision 1194,
which is the revision this environment has.

**Why one whole run and not a per-metric median.** A per-metric median is a page load that never
happened; its LCP came from one run and its CLS from another. The representative run is the single
load whose LCP sits at the median, so the reported score, LCP, CLS and TBT all describe the same
load. Minima and maxima across the three runs are recorded in the JSON report as `spread`.

---

## 3. Baseline — bytes, 2026-09-20

Measured from one frozen copy of `apps/web/dist`, fingerprint
`sha256 28f14da706e02c6a869f0fb8ca8e35d17c395603471f1afb87f279745ac49f89` over
`find . -type f | sort | xargs sha256sum`, 52 files, HEAD `4725e28` on
`claude/intelligent-knuth-d3s8za`. The freeze matters: `apps/web/dist` was rebuilt underneath this
work twice while the parallel `seo-engineer` landed structured data, and an average of builds that
were passing through is not a measurement of anything.

### 3.1 Shared assets — fetched once, paid for on every route

| Asset                                   | Raw    | gzip-9     | brotli-11 |
| --------------------------------------- | ------ | ---------- | --------- |
| `_astro/BaseLayout.TsEFhHoJ.css`        | 65,907 | 10,948     | 9,663     |
| `fonts/geist-sans-latin-400.woff2`      | 16,324 | —          | —         |
| `fonts/geist-sans-latin-600.woff2`      | 16,804 | —          | —         |
| `_astro/LookupForm...js`                | 2,298  | 944        | 803       |
| `_astro/SiteHeader...js`                | 1,399  | 530        | 444       |
| `_astro/ThemeToggle...js`               | 619    | 350        | 277       |
| `theme-init.js`                         | 321    | 226        | 162       |
| **All JavaScript**                      | 4,637  | **2,050**  | 1,686     |
| **All fonts** (woff2, never re-encoded) | 33,128 | **33,128** | 33,128    |

Two font faces, one family, `woff2` only, Latin subset: 33,128 B against the 45 KB ceiling in
`DIRECTIVE §7` and `.claude/agents/performance-engineer.md:99`.

### 3.1a The local build is lighter than the production build, and the budgets are set on the heavy one

`apps/web/src/lib/seo/site.ts` resolves the site URL from `PUBLIC_SITE_URL`; without it the URL is
`undefined` and the tags that need an absolute URL — including the JSON-LD block — are omitted.
`PUBLIC_SITE_URL` is owner input **I-4** (`docs/BUILD_PLAN.md §10`) and is set in the deployment
environment, not locally. So `pnpm build` on a developer machine produces a **lighter** document
than the one production serves, and a budget set from a local build would be measuring the wrong
site.

Both states were measured in this session, because the tree happened to pass through both:

| State                                   | `/` doc gz | all documents gz | build gz   |
| --------------------------------------- | ---------- | ---------------- | ---------- |
| With structured data (production shape) | 28,182     | 154,507          | 270,163    |
| Without structured data (local default) | 27,999     | 151,979          | 267,635    |
| **Delta charged to structured data**    | **+183**   | **+2,528**       | **+2,528** |

Thirteen routes carried a JSON-LD block in the heavier build: 461 raw bytes on twelve of them and
1,416 on `/guides/`. **Every budget in `perf.budgets.json` is set against the heavier, production-
shaped tree**, so a local green result is a conservative one. When `PUBLIC_SITE_URL` lands and the
remaining routes gain their markup, re-run `node scripts/perf/check-budgets.mjs --report` and
record the new figures here rather than assuming this delta scales.

### 3.2 Per route

`doc raw` / `doc gz` / `doc br` are the HTML document. `critical gz` is the document plus the
stylesheet, the scripts and the two preloaded fonts.

| Route                                                      | doc raw | doc gz | doc br | critical gz | reqs |
| ---------------------------------------------------------- | ------- | ------ | ------ | ----------- | ---- |
| `/`                                                        | 144,843 | 28,182 | 20,889 | 74,308      | 8    |
| `/404.html`                                                | 13,132  | 3,619  | 2,872  | 48,801      | 7    |
| `/about/`                                                  | 15,676  | 4,629  | 3,635  | 49,811      | 7    |
| `/advertising-policy/`                                     | 20,862  | 6,761  | 5,339  | 51,943      | 7    |
| `/affiliate-disclosure/`                                   | 19,571  | 6,183  | 4,874  | 51,365      | 7    |
| `/connection-risk/`                                        | 45,935  | 7,266  | 5,797  | 52,448      | 7    |
| `/data-sources/`                                           | 21,518  | 5,797  | 4,588  | 50,979      | 7    |
| `/delay-risk/`                                             | 22,559  | 5,539  | 4,419  | 50,721      | 7    |
| `/editorial-policy/`                                       | 32,731  | 11,113 | 8,918  | 56,295      | 7    |
| `/flight-status/`                                          | 44,608  | 7,105  | 5,617  | 52,287      | 7    |
| `/guides/`                                                 | 16,644  | 4,596  | 3,642  | 49,778      | 7    |
| `/guides/data-freshness-and-provider-limits/`              | 22,447  | 7,320  | 5,824  | 52,502      | 7    |
| `/guides/how-delaypilot-estimates-connection-risk/`        | 21,395  | 7,092  | 5,605  | 52,274      | 7    |
| `/guides/how-delaypilot-estimates-disruption-risk/`        | 21,560  | 7,194  | 5,702  | 52,376      | 7    |
| `/guides/minimum-connection-time-vs-realistic-connection/` | 20,905  | 6,779  | 5,357  | 51,961      | 7    |
| `/guides/saving-receipts-and-evidence/`                    | 21,276  | 7,072  | 5,571  | 52,254      | 7    |
| `/methodology/`                                            | 25,911  | 6,803  | 5,419  | 51,985      | 7    |
| `/passenger-rights/`                                       | 24,618  | 7,907  | 6,270  | 53,089      | 7    |
| `/privacy/`                                                | 22,038  | 7,086  | 5,700  | 52,268      | 7    |
| `/terms/`                                                  | 20,483  | 6,464  | 5,109  | 51,646      | 7    |

Totals: **154,507 B gz of documents**, **270,163 B gz for the whole build**, 52 files, 20 routes,
0 hydrated islands, 0 inline executable scripts, 0 inline `<style>` elements, 0 `<img>` elements on
any route (every graphic is inline SVG).

The homepage's 144,843 raw bytes are almost entirely inline SVG and server-rendered markup — the
route globe, the radar and route-line motifs, the scroll-scrubbed chronology and the §28
demonstration cockpit. They compress to 20,889 B brotli, which is why a document that reads as
enormous costs 8 requests and 1.36 s.

---

## 4. Baseline — Core Web Vitals, 2026-09-20

Six routes, median of three runs each, conditions in §2.4. Full JSON in the report the runner
writes (`lighthouse-report.json`, already covered by `.gitignore`'s `lighthouse-report*.json`).

### 4.1 Gate condition — mobile 375 × 667, compression on

| Route                                         | perf | a11y | b-p | SEO  | LCP ms | LCP spread  | FCP ms | CLS | TBT ms | reqs | transfer |
| --------------------------------------------- | ---- | ---- | --- | ---- | ------ | ----------- | ------ | --- | ------ | ---- | -------- |
| `/`                                           | 100  | 100  | 100 | 100  | 1,358  | 1,354–1,726 | 1,128  | 0   | 0      | 8    | 70,694   |
| `/connection-risk/`                           | 100  | 100  | 100 | 100  | 1,207  | 1,203–1,219 | 907    | 0   | 0      | 7    | 54,115   |
| `/flight-status/`                             | 100  | 100  | 100 | 100  | 1,206  | 1,205–1,206 | 967    | 0   | 0      | 7    | 53,935   |
| `/editorial-policy/`                          | 100  | 100  | 100 | 100  | 1,203  | 1,202–1,208 | 903    | 0   | 0      | 7    | 57,236   |
| `/passenger-rights/`                          | 100  | 100  | 100 | 63 ¹ | 1,207  | 1,206–1,210 | 955    | 0   | 0      | 7    | 54,588   |
| `/guides/data-freshness-and-provider-limits/` | 100  | 100  | 100 | 63 ¹ | 1,205  | 1,203–1,217 | 905    | 0   | 0      | 7    | 54,142   |

¹ Both routes carry `<meta name="robots" content="noindex">` by editorial decision — they are
`publishable`, not `published` (`docs/EDITORIAL_POLICY.md`, the S3 serving rule). Lighthouse scores
`is-crawlable` 0 and the category drops to 63 with no defect present. **The only failing SEO audit
on either route is `is-crawlable`** — measured, not assumed. So `perf.budgets.json` removes the
category-score gate for those two routes and asserts the thing that means something instead:
`failingSeoAudits <= 0` with `is-crawlable` allowed. When the routes publish, the override is
deleted, not edited.

### 4.2 Worst case — mobile 375 × 667, compression **off**

The platform-independent floor. Every route still clears `DIRECTIVE §22`.

| Route                                         | perf | LCP ms | CLS | TBT ms | transfer |
| --------------------------------------------- | ---- | ------ | --- | ------ | -------- |
| `/`                                           | 96   | 2,408  | 0   | 0      | 253,577  |
| `/connection-risk/`                           | 98   | 1,963  | 0   | 0      | 151,731  |
| `/flight-status/`                             | 98   | 1,957  | 0   | 0      | 150,404  |
| `/editorial-policy/`                          | 99   | 1,806  | 0   | 0      | 138,527  |
| `/passenger-rights/`                          | 99   | 1,803  | 0   | 0      | 130,414  |
| `/guides/data-freshness-and-provider-limits/` | 99   | 1,804  | 0   | 0      | 128,243  |

### 4.3 Desktop 1440 × 900, compression on, median of two

| Route                                         | perf | a11y | b-p | LCP ms | CLS |
| --------------------------------------------- | ---- | ---- | --- | ------ | --- |
| `/`                                           | 99   | 100  | 100 | 779    | 0   |
| `/connection-risk/`                           | 100  | 100  | 100 | 330    | 0   |
| `/flight-status/`                             | 100  | 100  | 100 | 351    | 0   |
| `/editorial-policy/`                          | 100  | 100  | 100 | 302    | 0   |
| `/passenger-rights/`                          | 100  | 100  | 100 | 290    | 0   |
| `/guides/data-freshness-and-provider-limits/` | 100  | 100  | 100 | 303    | 0   |

### 4.4 CLS

**Zero.** Not "under 0.1" — exactly 0.0000 on all 18 mobile runs at 375 and all 12 desktop runs at
1440, in both the compressed and the uncompressed condition. `cls-culprits-insight` scores 1,
`unsized-images` scores 1, and there are no `<img>` elements to be unsized. The font swap
contributes nothing measurable, which is what the metric-matched fallback in
`apps/web/src/styles/tokens.css` is for, and the ADR 0003 motion allowance contributes nothing,
which is rule 3's requirement ("any motion that contributes to CLS" is forbidden) discharged by
measurement rather than by assertion.

Two things this does **not** yet prove, and neither should be read as proven:

- There are no ad slots in the build to fill or leave unfilled, so "CLS 0 with slots filled and
  unfilled" is **not run**, not passed (§6).
- The `DIRECTIVE §17` async-data states — `stale`, `provider unavailable`, `rate limited`, `partial
data`, `conflicting providers`, `insufficient data`, `ad blocked` — are static server-rendered
  markup today, so no state _transitions_ under a finger. The transition CLS test arrives with the
  live cockpit (§6).

### 4.5 INP, measured on the real controls

`node scripts/perf/interaction-latency.mjs`. Event Timing API, entries grouped by `interactionId`,
maximum duration per interaction. Chromium quantises Event Timing durations to 8 ms and clamps the
observer threshold to a 16 ms floor, so every figure is a multiple of 8.

| Interaction                                         | 375 × 667, CPU ×4 | 1440 × 900, CPU ×4 |
| --------------------------------------------------- | ----------------- | ------------------ |
| Open the mobile navigation drawer                   | 120 ms            | —                  |
| Close the mobile navigation drawer                  | 112 ms            | —                  |
| Open a mega-nav disclosure                          | —                 | 56 ms              |
| Close the mega-nav disclosure (Escape)              | —                 | 56 ms              |
| **Choose the dark theme**                           | **144 ms**        | **192 ms**         |
| Submit the lookup with nothing entered (validation) | 80 ms             | 104 ms             |
| Type a letter into the airline combobox             | 24 ms             | 48 ms              |
| Type a flight number                                | 48 ms             | 48 ms              |
| Submit the lookup with a flight number entered      | 64 ms             | 88 ms              |

Worst: **192 ms against a 200 ms target**, on the theme control at 1440 under a 4× CPU throttle.
Four repeat runs at 1440 gave 192 / 160 / 176 / 176 ms. This is finding **P-4**.

---

## 5. The budgets, and why each number is where it is

Full manifest with a `why` string on every entry: `perf.budgets.json`.

### 5.1 The headroom rule

Two kinds of number, two kinds of headroom.

- **Deterministic measurements — bytes, counts, CLS.** The same input produces the same output, so
  there is no noise to absorb. Headroom here is an allowance for _planned_ growth, and it is stated
  per budget. Anything that must not change at all (script count, island count, font face count)
  gets none.
- **Noisy measurements — Lighthouse scores and LCP timing.** Tightening these to the measurement
  buys a build that fails on a slow CI runner while nothing has regressed. They stay at the
  `DIRECTIVE §22` release contract, and the early warning for them lives in the byte budgets —
  which is legitimate here specifically because a site that ships 2 KB of JavaScript and blocks on
  nothing has an LCP that is a function of transferred bytes and round trips. If that ever stops
  being true, this rule stops being true with it.

### 5.2 Global budgets

| Budget                     | Measured | Budget   | Headroom           | Owner if breached       |
| -------------------------- | -------- | -------- | ------------------ | ----------------------- |
| `hydratedIslands`          | 0        | 0        | none, deliberately | `frontend-ui-engineer`  |
| `inlineExecutableScripts`  | 0        | 0        | none, deliberately | `frontend-ui-engineer`  |
| `inlineStyleElements`      | 0        | 0        | none, deliberately | `brand-design-director` |
| `scriptFileCount`          | 4        | 4        | none, deliberately | `frontend-ui-engineer`  |
| `scriptWireBytesTotal`     | 2,050    | 2,400    | 17.1%              | `frontend-ui-engineer`  |
| `largestScriptWireBytes`   | 944      | 1,200    | 27.1%              | `frontend-ui-engineer`  |
| `stylesheetFileCount`      | 1        | 1        | none               | `brand-design-director` |
| `stylesheetWireBytesTotal` | 10,948   | 13,000   | 18.7%              | `brand-design-director` |
| `fontFileCount`            | 2        | 2        | none               | `brand-design-director` |
| `fontWireBytesTotal`       | 33,128   | 34,000   | 2.6%               | `brand-design-director` |
| `fontFormats`              | `.woff2` | `.woff2` | exact              | `brand-design-director` |
| `largestImageWireBytes`    | 16,248   | 20,000   | 23.1%              | `visual-asset-director` |
| `imageWireBytesTotal`      | 56,912   | 64,000   | 12.5%              | `visual-asset-director` |
| `documentWireBytesTotal`   | 154,507  | 175,000  | 13.3%              | `frontend-ui-engineer`  |
| `buildWireBytesTotal`      | 270,163  | 300,000  | 11.0%              | `frontend-ui-engineer`  |
| `routeCount`               | 20       | ≥ 20     | floor              | `frontend-ui-engineer`  |

`routeCount` is the only floor in the manifest, and it exists because a build that emits fewer
routes than it did is the cheapest possible way to make every byte budget pass.

`inlineExecutableScripts` counts `<script>` elements with a body whose `type` is empty, `module`,
`text/javascript`, `application/javascript` or `importmap`. An inline `application/ld+json` data
block is **not** counted: it is not executable, search engines require it in the page, and its
bytes land in the document budget, which is where they belong. The baseline has 13 such data blocks
(461 B raw on twelve routes, 1,416 B on `/guides/`) and 0 executable inline scripts. This is not a
restatement of the CSP rule — that rule lives in `apps/web/public/_headers` and is enforced on every
build by `apps/web/scripts/verify-dist.mjs`. It is byte accounting: bytes inside a `<script>`
element are JavaScript no per-file budget can see.

### 5.3 Per-route budgets

Three classes. Each class ceiling is sized to its heaviest member, so an ordinary editorial edit
does not fail a build; drift across all routes at once is caught by `documentWireBytesTotal`.

| Class     | Routes                                                 | doc gz (worst → budget)  | critical gz (worst → budget) | total gz (worst → budget) | reqs | render-blocking | preloads |
| --------- | ------------------------------------------------------ | ------------------------ | ---------------------------- | ------------------------- | ---- | --------------- | -------- |
| `home`    | `/`                                                    | 28,182 → 34,000 (+20.6%) | 74,308 → 81,000              | 76,949 → 84,000           | 8    | 2               | 2        |
| `tool`    | `/flight-status/`, `/delay-risk/`, `/connection-risk/` | 7,266 → 9,000 (+23.9%)   | 52,448 → 55,000              | 55,089 → 58,000           | 7    | 2               | 2        |
| `content` | the 16 editorial, policy, guide and 404 routes         | 11,113 → 13,500 (+21.5%) | 56,295 → 59,500              | 58,936 → 62,500           | 7    | 2               | 2        |

The document budget always binds before the critical-path budget, by construction: each class's
critical headroom is its document headroom plus about 1 KB. That is intentional — the critical-path
budget then only fires when a **new shared resource** appears, which is a different defect and
deserves its own message.

`renderBlockingCount` is 2 everywhere: `/theme-init.js`, a classic script in `<head>` that blocks
deliberately so the theme is applied pre-paint and there is no flash, and the stylesheet. Module
scripts are deferred by default and do not block. `preloadCount` is 2 everywhere, both font faces,
at the ceiling `.claude/agents/performance-engineer.md:107` sets.

An unbudgeted route **fails the gate** (`unbudgetedRoutes: "fail"`). A new route cannot arrive
unmeasured.

### 5.4 Lighthouse gates

| Gate            | Threshold | Source                                                         |
| --------------- | --------- | -------------------------------------------------------------- |
| `performance`   | ≥ 95      | `DIRECTIVE §22`                                                |
| `accessibility` | 100       | `DIRECTIVE §22`                                                |
| `bestPractices` | 100       | `DIRECTIVE §22`                                                |
| `seo`           | 100       | `DIRECTIVE §22`, with the two `noindex` overrides in §4.1      |
| `lcpMs`         | ≤ 2,500   | `DIRECTIVE §22`, left at the ceiling — see §5.1                |
| `clsScore`      | ≤ 0.02    | **tightened** from the 0.1 ceiling; measured 0 on 30 runs      |
| `tbtMs`         | ≤ 150     | **tightened**; measured 0 on every run. The lab proxy for INP. |

`performance` stays at 95 rather than 100 because `first-contentful-paint` scores 0.99 on `/` at
this machine speed, so a gate at 100 would fail on a rounding boundary. The tight, noise-free
early warning is the byte budget.

Lighthouse 13 also emits an `agentic-browsing` category (scored 100 on every route here). It is
recorded in the JSON report and not gated: `DIRECTIVE §22` names four categories, and adding a
fifth is a product decision, not a measurement.

### 5.5 Proof that the gates fail

Both gates were made to fail on purpose in this session, against scratch copies, and the real
output is quoted in the handoff report.

- `check-budgets.mjs` against a dist with a 40 KB fifth script, two inline executable scripts, two
  `<astro-island>` elements and an unbudgeted `/app/trips/` route: **10 of 137 checks over budget,
  exit 1**, each naming the measured value, the overage and the owning agent.
- `check-budgets.mjs` against a dist with 4,000 random words appended to `/connection-risk/`:
  `documentWireBytes` 28,769 against a 9,000 budget, **exit 1**.
- `lighthouse.mjs --budgets <scratch manifest>` with `lcpMs` set to 300 ms and the `noindex`
  overrides removed: **3 thresholds failed, exit 1**, the SEO failure naming `is-crawlable (score
0, weight 4.04)` as the only failing audit.

---

## 6. Deliberately out of scope until a later phase

Nothing in this list is a gap to be filled by estimating. Each is a measurement that cannot be
taken because the thing to measure does not exist yet.

| Item                                                                                                             | Why not now                                                                                                                                   | Arrives with          |
| ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| `/app/**` shell budget (≤ 160 KB JS, ≤ 40 KB CSS, ≤ 500 KB total)                                                | No `/app/**` route is built. `DIRECTIVE §18.2` private routes are Phase 10.                                                                   | Phase 10              |
| App-route Lighthouse gate (≥ 90 perf, a11y 100)                                                                  | Same.                                                                                                                                         | Phase 10              |
| Lazy-chunk budget (≤ 60 KB gz per chunk)                                                                         | There are no lazy chunks: nothing hydrates and nothing code-splits. The budget is in the charter and will be added when a seam exists.        | Phase 10              |
| Cockpit INP — choosing a candidate, expanding a segment card, toggling monitoring, checking off a checklist item | Those controls do not exist. Approximating them with the controls that do exist would be reporting a number that was not taken.               | Phase 10              |
| Ad-slot CLS, filled and unfilled                                                                                 | No ad slot ships. `AdSlotShell.enabled` is inert pending the consent gate (`docs/BUILD_PLAN.md §10`, S4 handoffs).                            | Phase 11 monetization |
| §17 state-transition CLS                                                                                         | Every §17 state is static server-rendered markup today; nothing transitions under a finger. The end states are measured; transitions are not. | Phase 10              |
| D1 query plans, `EXPLAIN QUERY PLAN`, N+1 trip loading                                                           | `migrations/` is empty; `pnpm db:migrate:local` is a deliberate exit-1 stub. There is no query to plan.                                       | Phase 3               |
| Field Core Web Vitals at p75                                                                                     | Field data needs the beacon in §8 and real traffic. Every CWV figure here is **lab**, and is labelled lab throughout.                         | Phase 13              |
| Provider TTL / `stale-while-revalidate` policy                                                                   | No provider adapter exists and `docs/PROVIDER_LICENSING.md` records no licensed cache window to sit inside.                                   | Phase 4               |

---

## 7. Open findings

Each is measured, owned by a named agent, and is **not** fixed here: `scripts/perf/**` is this
agent's only tree and a fix in someone else's package is an ownership violation
(`AGENTS.md §3.5`).

### P-1 — No `Cache-Control` on any static asset · owner `platform-release-sre`

**Measured.** Lighthouse `cache-insight` scores **0** with **49,126 bytes** of estimated waste on
`/`. All seven static assets report `cacheLifetimeMs: 0`: both font faces (17,424 and 16,944 B),
the stylesheet (10,340 B) and all four scripts. No file in the repository declares a
`Cache-Control` header for a static asset — not `apps/web/public/_headers`, not the root `_headers`,
not `vercel.json`. The Worker sets `no-store` on API responses only, which is correct.

**Why it matters.** `_astro/BaseLayout.TsEFhHoJ.css` and the three `_astro/*.js` chunks are
**content-hashed**: their URL changes when their content changes, so they are the textbook case for
`public, max-age=31536000, immutable`. The font files are immutable subsets. Today a returning
traveler re-downloads 46 KB of assets that cannot have changed. This is the single largest
measurable win available in the build, and it is a header, not a code change.

**Required change**, by path class:

| Path                            | Proposed                                                          | Test                                                                 |
| ------------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| `/_astro/*`                     | `public, max-age=31536000, immutable`                             | content-hashed filename — a change produces a new URL                |
| `/fonts/*.woff2`                | `public, max-age=31536000, immutable`                             | immutable subset; a new subset is a new file                         |
| `/icons/*`, `/og/*`, `/brand/*` | `public, max-age=604800`                                          | not hashed; a week is safe                                           |
| `/theme-init.js`                | `public, max-age=3600`                                            | **not** content-hashed, so `immutable` would strand a fix for a year |
| HTML documents                  | `public, max-age=0, s-maxage=<ttl>, stale-while-revalidate=<swr>` | editorially static, reviewed date shown — but see the caution below  |

**Caution on the HTML line, and it is the important part.** `s-maxage` plus
`stale-while-revalidate` is permitted on a pre-rendered public page only where an older answer is
still **semantically** honest and **contractually** permitted. Today the `§18.1` routes carry no
live provider data, so the semantic test passes. The moment any of these routes renders a datum
with a provenance label, SWR changes what the traveler sees and therefore changes the label:
past the freshness threshold the datum is `Cached` or `Stale` with its age shown, never `Live`
(`AGENTS.md §1.2`). **No SWR may be added to a route that renders provider data without the
licensed cache window from `docs/PROVIDER_LICENSING.md` behind it.** Nothing under `/app/**`,
`/auth/**`, `/checkout/**`, `/admin/**` or any authenticated `/api/v1` response may carry
`s-maxage` at all; those are `private, no-store` (`AGENTS.md §2`).

Also note: `apps/web/public/_headers` is Cloudflare's format. If production is served by Vercel —
which `docs/BUILD_PLAN.md §10` input I-7 says it is — Vercel does not read that file, and the
headers actually shipped are the four weaker ones in the root `vercel.json`, with no CSP at all.
That needs resolving before any cache policy is written, because it decides which file to write it
in. Raised to `platform-release-sre` as part of this finding; it is also a security question for
`security-privacy-engineer`.

### P-2 — `not_found_handling: "none"` while `404.html` exists · owner `platform-release-sre`

`apps/edge/wrangler.jsonc:71` sets `"not_found_handling": "none"` with a comment saying it becomes
`"404-page"` once `frontend-ui-engineer` adds a 404 route. `apps/web/dist/404.html` exists and is
measured above (3,619 B gz). Until the setting changes, every unmatched request invokes the Worker
instead of being served from the edge asset cache — the exact cost the same file's `run_worker_first`
comment is written to avoid. `run_worker_first` itself is correct: `["/api/*", "/auth/*",
"/webhooks/*", "/go/*"]`, four dynamic prefixes, no Worker in front of static assets. Confirmed, no
finding there.

### P-3 — `/theme-init.js` costs 412 ms of render-blocking time · owners `frontend-ui-engineer`, `platform-release-sre`

**Measured.** Lighthouse `render-blocking-insight` scores 0.5 and attributes **412 ms** to
`/theme-init.js` and 262 ms to the stylesheet. 412 ms for 321 raw bytes is a network round trip,
not a parse: it is a whole separate request on the critical path for a script that only sets an
attribute on `<html>` before first paint.

It cannot simply be inlined: the served CSP is `script-src 'self'` with no `'unsafe-inline'` and no
hash sources, and `apps/web/scripts/verify-dist.mjs` fails the build on any inline script — while
helpfully printing the exact `sha256-...` source the header would need. So the two honest options
are (a) leave it, which is defensible today because LCP is 1.36 s with 1.14 s of margin, or (b)
inline it and add the printed hash to the CSP in **both** `apps/web/public/_headers` and the
`SECURITY_HEADERS` object in `apps/edge/src/index.ts`, which `scripts/validate-security-headers.mjs`
checks for drift. Not this agent's call, and not a change to make for a number that is already
passing. Note that P-1 removes most of this cost for returning visitors; the 412 ms is a
first-visit cost.

### P-4 — The theme switch is the slowest interaction on the site · owners `brand-design-director`, `frontend-ui-engineer`

**Measured.** INP **192 ms against a 200 ms target** at 1440 × 900 under a 4× CPU throttle; four
runs gave 192 / 160 / 176 / 176 ms. At 375 × 667 the same interaction measures 144 ms. Every other
interaction on the site is between 24 and 120 ms.

The cost scales with viewport, not with the constant work in the handler, which points at the
style recalculation: the handler sets `data-theme` on `<html>`, and the whole 65,907-byte
stylesheet is re-evaluated against the whole rendered tree. `localStorage.setItem` is in the same
handler and is main-thread synchronous, but it is viewport-independent and cannot explain the
375→1440 difference.

This is why `interaction-latency.mjs` is **not** wired into CI yet: a gate at 200 ms against a
192 ms measurement fails on noise about a quarter of the time while nothing has regressed. Reduce
the recalculation first — narrowing the theme-dependent selectors, or moving the theme switch onto
a smaller set of custom properties — then gate. Recorded in `perf.budgets.json →
lighthouse.interactionLatency` with `gatedInCi: false` and this reason.

### P-5 — 20.7 KB gz of brand SVG ships but is referenced by nothing · owner `visual-asset-director`

**Measured.** `brand/motifs/route-globe.svg` (9,523 B gz), `brand/mark.svg` (2,962), both logotypes
(2,193 + 2,171), `route-arcs.svg` (1,251), `radar-arc.svg` (1,009), `grid.svg` (961) and
`mark-mono.svg` (618) are emitted into `apps/web/dist` and referenced by **no** page: the motifs are
inlined into the HTML at build time. They cost nothing on the wire, because no browser requests
them, and they are 20.7 KB of the 270 KB deploy. Two legitimate answers — they are standalone assets
for press, social or download and should be documented as such, or they are dead build output and
should stop being copied. Either is fine; "nobody looked" is not. Same question for the duplicated
`favicon.ico` at both `/favicon.ico` and `/icons/favicon.ico` (841 B each, byte-identical).

### P-6 — Both font faces are preloaded · owner `brand-design-director` (informational)

`.claude/agents/performance-engineer.md:99` says to preload "only the face used by the LCP text".
Both the 400 and the 600 face are preloaded, which is 2 of the 2 permitted `<link rel=preload>`
slots spent on fonts and 33,128 bytes started at highest priority. Measured impact today: none
worth acting on — `font-display-insight` scores 1, CLS is 0, and LCP is 1.36 s. Recorded rather
than raised as a defect, because dropping one preload would need the LCP element's face identified
first, and the measured cost of being wrong is larger than the measured cost of the second preload.

### P-7 — Unused CSS is measurable but not currently a defect · owner `brand-design-director` (informational)

Under the uncompressed condition Lighthouse's `unused-css-rules` estimated 31 KiB of savings on `/`
out of the 65,907-byte stylesheet. Under the gate condition it scores 1. One stylesheet serves all
20 routes, so "unused on this route" is the expected shape of a shared sheet and is the reason it
is cacheable at all. Worth a look when the `/app/**` shell lands and the sheet plausibly splits;
not worth a change now.

---

## 8. The Core Web Vitals beacon spec — for `platform-release-sre`

Field CWV is a `DIRECTIVE §21` metric and cannot be produced in a lab. This is the contract for the
beacon that produces it. It is **not implemented here**: `packages/observability/**` and the
deployment are `platform-release-sre`'s.

**Endpoint.** `POST /api/v1/vitals`, `content-type: application/json`, `cache-control: no-store`,
no authentication, no cookie read, no `Set-Cookie`. Responds `204`.

**Payload — exactly these fields, and no others.**

```jsonc
{
  "metric": "LCP", // "LCP" | "INP" | "CLS" | "FCP" | "TTFB"
  "value": 1358.2, // number; milliseconds, except CLS which is unitless
  "rating": "good", // "good" | "needs-improvement" | "poor"
  "routeTemplate": "/guides/[slug]", // NEVER the resolved URL
  "navigationType": "navigate", // "navigate" | "reload" | "back-forward" | "prerender"
  "deviceClass": "mobile", // "mobile" | "desktop" — from the matched breakpoint, not a UA parse
  "deploymentVersion": "b3e6aae",
}
```

**The route-template rule is the privacy rule.** The beacon carries
`/app/trips/[tripId]`, never `/app/trips/8f1c…`. No resolved private URL, no `tripId`, no flight
number, no airline, no airport pair, no date, no itinerary detail, no referrer, no user agent
string, no IP — `AGENTS.md §2`. A beacon that cannot be sent without one of those is a defective
contract, not a reason to relax the rule. Private routes are `noindex` and never enter a shared
cache; the beacon must not become the thing that leaks what the URL does not.

**Sampling.** 100% on `DIRECTIVE §18.1` public routes (traffic is low and the population is the
whole point); 100% on `/app/**` until volume justifies less. Revisit at 10,000 sessions/day, and
record the change here with the volume that triggered it. Sampling is decided per **session**, not
per metric, so a sampled session reports every metric or none — otherwise the p75 is computed over
a population that differs per metric.

**Transport.** `navigator.sendBeacon` on `visibilitychange → hidden`, with a `fetch(..., {keepalive:
true})` fallback. Never on `unload`. Never a timer. The listener is passive and does no work in the
handler beyond queueing — the beacon must not itself become an INP contribution.

**Weight.** Whatever ships counts against `scriptWireBytesTotal` (2,400 B) and `scriptFileCount`
(4). `web-vitals` is roughly 1.5 KB gz, which does **not** fit inside the current budget alongside
the four existing scripts. So the beacon needs an orchestrator decision that raises both budgets
with the measured chunk size recorded here — or a hand-rolled `PerformanceObserver` that fits.
Do not land it by editing the budget upward to make the build green.

**Aggregation.** p75 per metric per `routeTemplate` per `deviceClass` over a 28-day trailing window,
which is the Chrome UX Report convention and keeps the field number comparable to the one Google
publishes. The `DIRECTIVE §22` targets — LCP < 2.5 s, INP < 200 ms, CLS < 0.1 — are **p75 field**
targets. Every number in §4 of this document is lab, and a lab number must never be reported as
though it were field.

---

## 9. Known variance of this environment

- **Machine.** Lighthouse `benchmarkIndex` 1,688–1,694 across this session. A materially different
  index on another machine moves the CPU-bound numbers; the network-bound ones are simulated and
  travel better.
- **LCP.** Tight on 16 of 18 mobile runs (`/connection-risk/` spanned 1,203–1,219 ms). `/` is the
  noisy one: 1,354–1,726 ms, a 27% spread, which is why the gate is not tightened to it.
- **CLS and TBT.** No variance observed at all. Exactly 0 on every run of every condition.
- **Event Timing.** Chromium quantises interaction durations to 8 ms and clamps the observer's
  `durationThreshold` to a 16 ms floor. An interaction faster than 16 ms produces no entry — that is
  a measurement ("under the floor"), not a missing one.
- **The build moves.** `apps/web/dist` was rebuilt three times underneath this session by the
  parallel `seo-engineer`, and passed through both of the states in §3.1a. Every figure in §3 and §4
  comes from one frozen copy, fingerprinted in
  `perf.budgets.json → measurement.takenFrom.distFingerprint`. `check-budgets.mjs` and the
  Lighthouse gate were both re-run against the live `apps/web/dist` afterwards and both passed, so
  the budgets hold on the moving tree as well as on the frozen one.
- **The environment changes the build.** See §3.1a: `PUBLIC_SITE_URL` adds about 2.5 KB gz of
  structured data across the build. A figure taken without it is not comparable to one taken with
  it, and the state must be recorded alongside any future measurement.
- **Egress.** Outbound HTTPS to `delaypilot.app` is refused by the proxy (`CONNECT` 403), so no
  claim in this document is based on the live origin. The compression assumption in §2.3 is the
  only place that matters, and §4.2 measures the case where it is false.

---

## 10. Change log

| Date       | Change                                                                                                                                                              |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-20 | First version. Budget manifest, four scripts under `scripts/perf/**`, byte and CWV baseline on the 20 S3 routes, findings P-1…P-7, the CWV beacon spec. Session S4. |
