# docs/SEO.md — technical SEO contract

**Owner:** `seo-engineer` (`docs/agents/ROSTER.md §3`).
**Governs:** `apps/web/src/lib/seo/**`, `apps/web/public/robots.txt`, `apps/web/public/sitemap*`,
`apps/web/public/llms.txt`, `apps/web/public/humans.txt`, `apps/web/public/.well-known/**`,
`scripts/seo/**`, `docs/SEO.md`. Read-only here, and asserted rather than written:
`apps/web/public/manifest.webmanifest`, `apps/web/public/_headers`, `apps/web/public/ads.txt`.
**Authority:** `AGENTS.md` §1.1, §1.4, §1.5, §1.6, §2 · `DIRECTIVE.md` §18.1, §18.2, §19, §29.

This file records what the site currently asserts about itself, why, and what is deliberately not
asserted yet. Section 12 is the honest list of what is still missing.

**Status (S4).** Twenty pages built, thirteen indexable, thirteen in the sitemap. `pnpm test:seo`
exists and is green. The `PUBLIC_SITE_URL` production guard exists and fails a production build
with no origin. `llms.txt` and `humans.txt` ship. Structured-data builders and the IndexNow
submitter ship complete and inert: the first needs one line in a layout this owner does not write,
the second needs a key. No page carries a canonical URL, because `PUBLIC_SITE_URL` is still unset
(owner input I-4). `security.txt` is not published, because no monitored address exists (I-3).

---

## 1. The metadata head contract

Every public page renders through `apps/web/src/layouts/BaseLayout.astro` (owner:
`frontend-ui-engineer`). That layout owns the `<head>`; this section is the contract it implements,
not a second implementation of it.

| Tag                                                            | Source                                              | Condition                                                             |
| -------------------------------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------- |
| `<title>`                                                      | the page's `title` prop                             | always                                                                |
| `<meta name="description">`                                    | the page's `description` prop                       | always                                                                |
| `<meta name="robots" content="noindex">`                       | `robots` prop; `entryRobots()` for article routes   | only when the value is `noindex` — see §2                             |
| `<link rel="canonical">`                                       | `canonicalFor()` in `apps/web/src/lib/seo/site.ts`  | **only when `PUBLIC_SITE_URL` is set** — see the note below           |
| `<meta property="og:type" \| "og:site_name">`                  | fixed: `website`, `DelayPilot`                      | always                                                                |
| `<meta property="og:title" \| "og:description">`               | same strings as `<title>` / `description`           | always                                                                |
| `<meta property="og:url">`                                     | the canonical URL                                   | only with `PUBLIC_SITE_URL`                                           |
| `<meta property="og:image">` + `:alt`, `:width/:height`        | `/og/default-1200x630.png`, 1200×630                | only with `PUBLIC_SITE_URL` (a crawler cannot resolve a relative one) |
| `<meta name="twitter:card">`                                   | `summary_large_image` with an image, else `summary` | always                                                                |
| `<meta name="twitter:title" \| ":description">`                | same strings                                        | always                                                                |
| `<meta name="twitter:image">` + `:alt`                         | same image                                          | only with `PUBLIC_SITE_URL`                                           |
| `<meta name="theme-color">` ×2                                 | `#eef5fb` light, `#07111f` dark                     | always, one per `prefers-color-scheme`                                |
| `<link rel="icon">` svg + ico, `<link rel="apple-touch-icon">` | `scripts/assets/asset-manifest.mjs`                 | always                                                                |
| `<link rel="manifest">`                                        | `/manifest.webmanifest`                             | always                                                                |
| `<link rel="preload" as="font">` ×2                            | the two Geist `woff2` faces, `crossorigin`          | always                                                                |
| `<script type="application/ld+json">`                          | `pageSchemaJson()` in `lib/seo/schema.ts`           | **not yet wired** — §6.5                                              |
| `<meta name="google-site-verification">` / `msvalidate.01`     | `lib/seo/verification.ts`                           | only with the matching variable set — §10.3                           |

**Why there is no canonical URL on any page today.** `PUBLIC_SITE_URL` is unset (owner input I-4),
so `Astro.site` is undefined and `astro.config.mjs` omits `site` entirely. BaseLayout therefore
omits the canonical, `og:url`, and every absolute image tag rather than emit them against a guessed
origin. A canonical pointing at a host nobody owns is worse than no canonical: it is a fabricated
value (`AGENTS.md §1.1`) that a crawler will act on. The absent tags are the designed state, and
they become present the moment the variable is configured (§10.1).

**There is one origin, and it is resolved once.** `apps/web/src/lib/seo/site-url.mjs` holds the
rule; `site.ts` is its typed face for the rendering layer; `scripts/seo/*.mjs` import the same
module. No component, script or file builds a URL by concatenation. The resolver is plain
JavaScript with JSDoc types for one reason: the Astro layout, three Node scripts with no loader,
`astro.config.mjs` and the unit tests must all get the same answer, and that is the only file form
all five resolve with zero configuration (`allowJs` is on, so `astro check` still type-checks every
call site).

**What a title and a description may never contain** (`AGENTS.md §2`): an email address, a display
name, an itinerary detail, a flight number tied to a real traveler, receipt text, or any
ticket-identifier value. Titles and URLs carry no personal data. Nothing on this site generates a
title from user input, and nothing may start. `pnpm test:seo` scans every emitted title,
description, Open Graph tag, canonical and sitemap URL for an address and for ticket vocabulary.

**Uniqueness and length.** Titles and descriptions are unique repo-wide and asserted by machine
(§9). The title shape is `<Page> — DelayPilot`.

| Field       | Rule                                                   | Today                   |
| ----------- | ------------------------------------------------------ | ----------------------- |
| title       | unique, non-empty, names the site, **≤ 80** characters | 20 unique, longest 71   |
| description | unique, non-empty, **50–200** characters, ≠ the title  | 20 unique, range 78–181 |

The bounds are the point at which the field stops doing its job rather than a style preference:
past 80 characters the distinguishing half of a title is invisible in every result listing, and
past 200 a description is certainly truncated. They are declared here so content is written to a
number; they are never relaxed to turn a red gate green.

---

## 2. Robots and the indexability decision table

There is exactly one rule, and `apps/web/src/components/routes.ts` is where it lives for article
routes:

```
status ∈ { publishable, published }   → the route is emitted at all
status === published && indexable     → entryRobots() returns 'index'
anything else that is emitted         → entryRobots() returns 'noindex'
```

Route shells (`/`, `/flight-status/`, the policy pages) are not content entries and pass their own
`robots` prop, which defaults to `index`.

| Surface                                                                                        | Emitted? | Robots      | In sitemap? | Why                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------- | -------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`, `/flight-status/`, `/delay-risk/`, `/connection-risk/`                                    | yes      | index       | yes         | Route shells with real explanatory content and a working demonstration.                                                                                                  |
| `/methodology/`, `/data-sources/`, `/about/`, `/guides/`                                       | yes      | index       | yes         | First-party explanation of how the product works and where data comes from.                                                                                              |
| `/privacy/`, `/terms/`, `/editorial-policy/`, `/advertising-policy/`, `/affiliate-disclosure/` | yes      | index       | yes         | Policy pages. Indexable because a reader looking for them should find them.                                                                                              |
| Guide entry at `publishable`                                                                   | yes      | **noindex** | **no**      | Served for review; not yet through `legal/factual review` to `published`.                                                                                                |
| Guide/rights entry at `draft`, `source_review`, `legal_review`, `review_due`, `stale`          | **no**   | —           | no          | No route is generated, so there is nothing to index or list.                                                                                                             |
| `/passenger-rights/`                                                                           | yes      | **noindex** | **no**      | The overview entry is `publishable`. Same rule, no exception for it.                                                                                                     |
| `404.html`                                                                                     | yes      | noindex     | **never**   | An error document is not an address to submit to a crawler.                                                                                                              |
| `/airlines/**`, `/airports/**`, `/routes/**`                                                   | **no**   | —           | no          | No reference data exists. A family differing only by an IATA token is a doorway page (`DIRECTIVE.md §19`); these stay unemitted, then `noindex`, until they pass §7.     |
| `/pricing/`, `/status/`, `/contact/`, `/accessibility/`                                        | **no**   | —           | no          | Upstream or configuration dependency absent (`routes.ts`).                                                                                                               |
| `/app/**`, `/auth/**`, `/checkout/**`, `/admin/**`                                             | **no**   | —           | never       | Private (`AGENTS.md §2`). Disallowed in `robots.txt` in advance; when one ships it carries `noindex, nofollow, noarchive` as a meta tag **and** an `X-Robots-Tag` (§12). |
| A live flight-instance page                                                                    | **no**   | —           | **never**   | Out of scope (`DIRECTIVE.md §9`), and demo state is never indexed as an individual flight page (§28).                                                                    |

**`Disallow` blocks the fetch, and a page a crawler may not fetch is a page whose `noindex` it can
never read.** That is why the five `publishable` guides and `/passenger-rights/` are _not_
disallowed in `robots.txt`: their meta tag is the mechanism, and blocking the fetch would defeat it.
`robots.txt` disallows only the four private prefixes, and never uses `Disallow: /` as a stand-in
for real gating. `pnpm test:seo` fails on a blanket disallow, on a missing private prefix, on a
robots directive this site does not issue, and on a private route that is emitted without all three
of `noindex, nofollow, noarchive`.

---

## 3. The sitemap rule

**A URL belongs in `sitemap.xml` exactly when the build emits the page and the page's own robots
meta does not say `noindex`** — `404.html` excepted.

Equivalently, for article routes: `published && indexable`. A `publishable` page is served and not
listed. A `draft` page is neither.

- One flat `sitemap.xml`, thirteen entries. A sitemap index with per-page-type children arrives with
  the page types that would justify one (§12); an index over a single 13-URL child is ceremony.
- `<loc>` is absolute, lowercase, trailing-slashed, no query string, no fragment.
  `astro.config.mjs` sets `trailingSlash: 'always'`, so a slash-less URL redirects rather than
  resolves.
- **No `<lastmod>`, no `<changefreq>`, no `<priority>`.** A build timestamp asserts a content-change
  date that nothing established (`AGENTS.md §1.1`), and none of the thirteen listed pages is a
  content entry with an editorial `reviewedAt`. When an article reaches `published` it arrives with
  its own frontmatter `reviewedAt` as `<lastmod>` — a date a person set on purpose. `changefreq` and
  `priority` are hints no major engine consumes.
- **The absolute origin is stated once, in code.** `COMMITTED_ORIGIN` in
  `apps/web/src/lib/seo/site-url.mjs` is `https://delaypilot.app`; `sitemap.xml` and the `Sitemap:`
  line in `robots.txt` write it because the sitemap protocol has no relative form, and both are
  checked against the resolver rather than against each other. With `PUBLIC_SITE_URL` set, the
  configured origin takes over and the same check runs against that — which means a build claiming
  an origin the sitemap does not use fails loudly instead of shipping two answers.

**The check.** `node scripts/seo/verify-sitemap.mjs` reads `apps/web/dist` and fails on: an
indexable page missing from the sitemap; a listed URL the build does not emit; a listed URL that
carries `noindex`; a missing trailing slash; a non-lowercase path; a query string or fragment; a
foreign origin; a duplicate entry; a `dist/sitemap.xml` that differs from `public/sitemap.xml` (a
stale build); and a `robots.txt` whose `Sitemap:` line disagrees. `pnpm test:seo` runs it as one of
its suites and adds the checks in §9.

---

## 4. The web app manifest

`apps/web/public/manifest.webmanifest` (owned here, verified by
`node scripts/seo/verify-manifest.mjs`). Every field is derived from
`scripts/assets/asset-manifest.mjs` or decided here.

| Field                 | Value                               | Reasoning                                                                                                                                                                                                                                                                                                                      |
| --------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name` / `short_name` | `DelayPilot`                        | Ten characters; no truncation, so no second string to keep in step.                                                                                                                                                                                                                                                            |
| `description`         | `Stay ahead of flight disruptions.` | The `DIRECTIVE.md §7` promise line, unchanged. It describes what the product does and claims no figure, no provider, and no capability that is not shipped.                                                                                                                                                                    |
| `start_url` / `scope` | `/`                                 | The whole site is the scope. There is no app shell to scope to yet.                                                                                                                                                                                                                                                            |
| `display`             | **`browser`**                       | There is no service worker and no offline shell — `DIRECTIVE.md §29` is a later phase. `standalone` would install a chromeless window that goes blank the first time it is opened without a network: an install that is broken by design. It becomes `standalone` in the same change that ships the offline shell.             |
| `theme_color`         | `#07111f`                           | The S2 handoff's value, and `--color-ink-950`, which is the plate every raster icon is drawn on (`scripts/assets/brand-colors.mjs`).                                                                                                                                                                                           |
| `background_color`    | `#07111f`                           | The splash screen is painted before any CSS loads. Matching it to the icon plate means the icon sits on its own colour rather than inside a bright ring.                                                                                                                                                                       |
| `icons`               | the four `MANIFEST_ICONS` records   | `192` and `512` at `purpose: "any"`, `192` and `512` at `purpose: "maskable"`, as **four separate objects**. Never the combined `"any maskable"`: that lets a browser choose the edge-to-edge maskable art for a context that does not mask it, and the artwork looks wrong (the record note in `asset-manifest.mjs` says so). |

**Light and dark.** A manifest carries one `theme_color`; it has no media-query form. BaseLayout
emits two `<meta name="theme-color">` tags, one per `prefers-color-scheme`, and in browsers that
honour the meta tag it is the meta tag that paints the browser UI. So the single manifest value is
the _fallback and the install-surface_ colour, and dark ink is the right one there.

**Absent on purpose:** `screenshots`, `shortcuts`, `related_applications`, `id`, `categories`,
`display_override`. Each asserts a surface, a route, or a distribution channel that does not exist
(`AGENTS.md §1.1`, §1.6). `verify-manifest.mjs` fails on any key outside the agreed set.

---

## 5. Content-Security-Policy

The policy is written twice, once in `apps/web/public/_headers` (`platform-release-sre` /
`frontend-ui-engineer` surface, asserted here) and once in `SECURITY_HEADERS` in
`apps/edge/src/index.ts` (`edge-api-engineer`'s), because static pages are served from the edge
asset cache without invoking the Worker and Worker responses never see `_headers`.
`node scripts/validate-security-headers.mjs` fails on drift between them.

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self';
connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

**The policy is never widened by guesswork.** `apps/web/scripts/verify-dist.mjs` runs on every build,
refuses any inline `<script>`, inline `<style>` or `style="…"` attribute, and prints the exact
`'sha256-…'` source the header would have to carry for the element it found. A `data:` or
`'unsafe-inline'` source added to turn a red build green is the failure mode that arrangement exists
to prevent. The one narrow exception S4 asks for is §6.2, and it is measured rather than assumed.

---

## 6. Structured data

### 6.1 The rule, and what could be verified at execution time

A structured-data property whose value is not rendered in the visible DOM of the same page is a
fabricated value in machine-readable form. That is `AGENTS.md §1.1`, and it does not depend on any
search engine's policy.

Google's own guidance says the same in its own words. `DIRECTIVE.md §33` items 19–20 were read on
**2026-09-20** through search, because this build environment's proxy refuses
`developers.google.com` outright (`CONNECT` 403 — the same block that holds `regulatory-source-steward`
at I-8), so the pages themselves could not be fetched. What the search index returned from the
General Structured Data Guidelines (documentation last updated 2026-07-10): _"Don't mark up content
that is not visible to readers of the page"_; structured-data items must represent the content
visible to users; _"Don't use structured data to deceive or mislead users. Don't impersonate any
person or organization, or misrepresent your ownership, affiliation, or primary purpose."_ From the
spam policies: doorway abuse covers pages generated to rank for similar queries that funnel users
elsewhere, and scaled content abuse covers many pages generated for ranking rather than for people.

**This is a search-mediated read of a primary source, not a fetch of it.** It is recorded as such.
Nothing in the design below depends on a rich-result eligibility requirement, precisely because that
is the part of the documentation most likely to have changed since the index was built: the site
emits an honest description of itself, and does not chase a result format.

### 6.2 JSON-LD and the served CSP, measured

A `<script type="application/ld+json">` block is a data block, not executable script. That claim was
measured rather than assumed, under the real policy, with the static server that applies
`apps/web/public/_headers` and Chromium 1194:

| Case                                                                                                  | CSP violations | Console errors | Result                                                  |
| ----------------------------------------------------------------------------------------------------- | -------------- | -------------- | ------------------------------------------------------- |
| A JSON-LD block injected into a built page                                                            | **0**          | **0**          | element present in the DOM, `JSON.parse` succeeds       |
| An executable inline `<script>` in the same page (control)                                            | **1**          | **1**          | `script-src-elem`, `blockedURI: inline`, refusal logged |
| 13 real builder blocks over 5 routes (`/`, `/about/`, `/guides/`, `/methodology/`, `/flight-status/`) | **0**          | **0**          | all five `200`, all five blocks parsed                  |

The control is what makes the first row meaningful: the probe detects a violation when there is one.

`apps/web/scripts/verify-dist.mjs` nevertheless fails the build on a JSON-LD block — measured: 13
findings, one per page, each printing a `sha256` the header would need. That guard is
`frontend-ui-engineer`'s file, and the exception it needs is one type-scoped line, handed off with
the measurement above rather than requested on the strength of an argument (§6.5).

### 6.3 What may be emitted, and what may not

Builders: `apps/web/src/lib/seo/schema.ts`. Policy and validator:
`apps/web/src/lib/seo/schema-policy.mjs`, imported by the builders, by their tests, and by the dist
scanner in `pnpm test:seo`, so there is one list rather than three.

| Type                                           | Status                      | Backed by                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Organization`                                 | **emitted**                 | the mark and wordmark inlined in the header, and "DelayPilot" as text on every page                                                                                                                                                                                                                                                                                                                  |
| `WebSite`                                      | **emitted**                 | the same lockup; `inLanguage` matches `<html lang="en">`                                                                                                                                                                                                                                                                                                                                             |
| `ImageObject`                                  | **emitted**, as `logo` only | `/icons/icon-512.png`, the raster of that same mark (`scripts/assets/asset-manifest.mjs`)                                                                                                                                                                                                                                                                                                            |
| `Article`                                      | **built, unused**           | a guide's visible `<h1>` and its "Reviewed <date>" line. No guide is indexable yet (§2), and structured data is emitted on indexable pages only                                                                                                                                                                                                                                                      |
| `ItemList` / `ListItem`                        | **built, ready**            | `/guides/` renders five cards; each `name` is that card's visible link text                                                                                                                                                                                                                                                                                                                          |
| `BreadcrumbList`                               | **refused**                 | no page renders a breadcrumb trail                                                                                                                                                                                                                                                                                                                                                                   |
| `FAQPage`                                      | **refused**                 | no page renders a question-and-answer block to byte-match                                                                                                                                                                                                                                                                                                                                            |
| `WebApplication` / `SoftwareApplication`       | **refused**                 | the flight lookup reports the provider-unavailable state by design — no licensed provider is connected — so an application claim would assert a capability that is not shipped. Google's software-app rich result additionally requires `offers`, `aggregateRating` and `review`, all three of which this site is forbidden to fabricate, so the markup could never produce the result it exists for |
| `Flight`, `Offer`, `Product`, `AggregateOffer` | **never**                   | a live flight instance is out of scope, and nothing is for sale                                                                                                                                                                                                                                                                                                                                      |
| An airline as an `Organization`                | **never**                   | it would imply affiliation (`AGENTS.md §1.4`)                                                                                                                                                                                                                                                                                                                                                        |

Refused types are not silently dropped: the validator names the condition that would make each one
honest, so a future contributor gets the reason rather than a bare refusal.

**Properties that may never appear, at any depth, with any value** — including a seed value and
"just for rich results". Each carries its reason in `schema-policy.mjs`.

Three families are refused **by the shape of the name**, so a spelling this list has never seen is
refused too: any property whose name contains `rating` in any case, any property beginning
`review`, and any property whose name contains `price`. That covers the aggregate, the value, the
count and the bounds of a rating; a review and a count of reviews; and a price in any currency or
specification.

The remaining refusals are by exact name: `offers` · `availability` · `award` · `awards` ·
`interactionCount` · `userInteractionCount` · `interactionStatistic` · `sameAs` ·
`potentialAction` · `email` · `telephone` · `faxNumber` · `address` · `founder` · `foundingDate` ·
`numberOfEmployees` · `duns` · `taxID` · `vatID` · `leiCode` · `memberOf` · `parentOrganization` ·
`subOrganization` · `brand` · `sponsor` · `funder` · `airline` · `flightNumber` ·
`departureAirport` · `arrivalAirport`.

Three of those deserve their own sentence. `sameAs` is an identity claim about a profile elsewhere
and none is verified. `potentialAction` would be a `SearchAction`, and this site has no search
endpoint to declare. `email` would put an address into markup, which `AGENTS.md §2` forbids
independently of anything SEO.

**No `datePublished` and no `author`.** No content entry records a publication date, and no article
page displays its author, so an `Article` node carries `headline`, `url`, `mainEntityOfPage`,
`dateModified`, `inLanguage`, `isPartOf` and `publisher` and nothing else. A date invented to fill a
recommended field is the same defect as an invented gate number.

### 6.4 How it is enforced

- The builders validate their own output and **throw** on a violation, so a bad node fails the build
  rather than shipping (`AGENTS.md §1.5`).
- `apps/web/src/lib/seo/schema.test.ts` greps the richest graph the builders can produce for every
  property in the charter's definition of done, and asserts each refused type reports its condition.
- `pnpm test:seo` parses every emitted block out of `dist` and fails on: invalid JSON, a context
  that is not `https://schema.org`, a type outside the allowlist, a forbidden property, a property
  with no value, a URL on a foreign origin, a block on a `noindex` page, and **any prose string the
  page's visible text does not contain**.

### 6.5 Where it renders — open handoff

The `<head>` is `apps/web/src/layouts/BaseLayout.astro`, which this owner does not write. The
integration is two lines there plus one type-scoped exception in `verify-dist.mjs`; both are in the
S4 handoff. Until they land, `pnpm test:seo` reports `0 JSON-LD blocks` and stays green — the
builders are covered by their own tests, and by an end-to-end run that injected their real output
into `dist` and passed both the gate and the browser measurement above.

---

## 7. The content-quality gate

**Declared here, implemented in Phase 11's content wave.** These are the thresholds the
`content-editorial-lead` charter already cites against this file, published so that content is
written to a number rather than to a feeling. The gate reports and downgrades; it never edits
content.

### 7.1 Minimum original word count, by page type

| Page type                             | Floor                                    |
| ------------------------------------- | ---------------------------------------- |
| Guide / article                       | **900 words**                            |
| `passenger-rights` jurisdiction page  | **700 words**                            |
| Airport / airline / route page        | **400 words** _and_ ≥ 3 real data fields |
| Utility page (a tool, not an article) | **250 words** _and_ a working utility    |
| Homepage                              | exempt from the word count only          |

"Original" excludes navigation, header, footer, the independence disclaimer, the rights disclaimer,
quoted regulatory text, and any string shared across more than one page.

### 7.2 Source references

- Regulatory and rights pages: **≥ 2** source ids, each resolvable in `source_registry`.
- Explanatory guides: **≥ 1**.
- A bare URL is not a citation. A news summary is not an authority.

### 7.3 Freshness

A regulatory page fails when the newest `last_verified_at` among its cited sources is **older than
180 days**. Failing means `noindex` and out of the sitemap, not deleted: the page keeps serving with
its real reviewed date visible while `regulatory-source-steward` re-verifies. Today every registry
record is `unreachable` with a null `lastVerifiedAt` (I-8), which is why no regulatory page is
`published` and none is in the sitemap.

### 7.4 Uniqueness and placeholders

- Title, meta description, and first paragraph unique across the whole site. The title and
  description halves are enforced today by `pnpm test:seo` over the built output (§1, §9).
- No duplicate canonical anywhere: two pages emitting one canonical is a failure, not a warning.
- No placeholder token in a shipped surface: `TODO`, `FIXME`, `coming soon`, `lorem`, `TBD`, `XXX`,
  `{{`.
- **`{{rule:<jurisdiction>:<dotted.path>}}` is not a placeholder.** It is a resolved slot: the
  mechanism that keeps time-sensitive regulatory values out of article prose and inside versioned
  rule data (`AGENTS.md §3.2`). `apps/web/src/components/rule-slots.ts` fails the build closed if one
  is still unresolved when the page is _served_. The gate's placeholder check must exempt the
  `{{rule:…}}` form specifically and must not simply exempt `{{`.

### 7.5 Metadata and privacy

- `indexable` flag present; editorial status present and one of the seven recognized values.
- No private data anywhere in the page or its metadata: no email address, no ticket-identifier
  value, no itinerary detail, no receipt text (`AGENTS.md §2`). The metadata half is enforced today
  (§9, `privacy` suite).
- No unlicensed live provider data rendered on a public page (`AGENTS.md §1.5`).

### 7.6 Consequence

A page failing any check is forced `noindex` and excluded from the sitemap. The gate prints the
page, the failing check, and the offending value, and reports the count of pages downgraded. A
threshold is never lowered, a page type never exempted, and a failing URL never allowlisted, to make
an exit gate green: a failing page being `noindex` **is** the design.

---

## 8. Public-root files

| File                                         | State                                               | Notes                                                                                                                                                                                                                               |
| -------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `robots.txt`                                 | shipped                                             | §2. `Sitemap:` absolute, four private prefixes disallowed, no blanket disallow.                                                                                                                                                     |
| `sitemap.xml`                                | shipped                                             | §3. Thirteen URLs.                                                                                                                                                                                                                  |
| `manifest.webmanifest`                       | shipped and linked                                  | §4.                                                                                                                                                                                                                                 |
| `_headers`                                   | shipped                                             | §5. Not this owner's file; asserted, not written.                                                                                                                                                                                   |
| `llms.txt`                                   | **shipped (S4)**                                    | What the site is, what it refuses to do, how a value is labelled, and a link per indexable page. Every link is checked against the build; an external link is refused, because a citation belongs on the page that makes the claim. |
| `humans.txt`                                 | **shipped (S4)**                                    | Credits roles, never private individuals. Names the typeface licence and the standards actually used.                                                                                                                               |
| `ads.txt`                                    | **absent** — `monetization-partnerships-engineer`'s | Must read exactly `google.com, pub-9029421562757873, DIRECT, f08c47fec0942fa0`. Asserted byte-exact by `pnpm test:seo` when present; never authored here.                                                                           |
| `.well-known/security.txt` + `/security.txt` | **not published** — blocked on I-3                  | The generator ships (`scripts/seo/generate-security-txt.mjs`); the file does not, because RFC 9116 requires a `Contact` and no monitored address exists. §10.4.                                                                     |
| IndexNow key file                            | **not published** — no key                          | `scripts/seo/indexnow.mjs --write-key` writes it when `INDEXNOW_KEY` exists. §10.2.                                                                                                                                                 |
| `/favicon.ico` at the site root              | shipped                                             | Byte-identical root copy of `/icons/favicon.ico` (`scripts/assets/asset-manifest.mjs`).                                                                                                                                             |

---

## 9. `pnpm test:seo`

`node scripts/seo/test-seo.mjs`, over `apps/web/dist` and the public-root files beside it. It reads
what the build emitted and never re-derives the serving rule: indexability is decided by
`routes.ts` and by each page's own `robots` prop, and this runner reads the rendered result.

**It fails, it does not warn.** Every finding names the page, the check and the offending value, and
any finding is exit 1. There is no severity ladder and no allowlist.

| Suite          | What it asserts                                                                                                                                                                                                                                                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `site-url`     | the resolver still refuses the `.env.example` value; every absolute origin in `sitemap.xml`, `robots.txt` and `llms.txt` is the resolved origin                                                                                                                                                                                                                           |
| `canonical`    | one self-referencing canonical per addressable page — absolute, https, lower case, trailing slash, no query or fragment, unique site-wide — **or**, with no `PUBLIC_SITE_URL`, none anywhere. A mixture is the failure. `404.html` carries none either way: it is served on a 404 response, so any self-reference it wrote would name an address the site does not serve. |
| `title`        | one non-empty unique `<title>` per page, ≤ 80 characters, naming the site, matching `og:title` and `twitter:title`                                                                                                                                                                                                                                                        |
| `description`  | one non-empty unique description per page, 50–200 characters, not equal to the title, matching its Open Graph twins                                                                                                                                                                                                                                                       |
| `robots`       | every directive is one this site issues; the error document is `noindex`; a private route carries all three of `noindex, nofollow, noarchive`; `robots.txt` disallows the four private prefixes and blankets nothing                                                                                                                                                      |
| `sitemap`      | membership is exactly the indexable set; no `noindex`, no error document, no private prefix, no flight-designator path, no duplicate, no foreign origin, well-formed `urlset`                                                                                                                                                                                             |
| `schema`       | §6.4                                                                                                                                                                                                                                                                                                                                                                      |
| `public-root`  | the five root files are served and byte-identical to source; `llms.txt` links resolve to indexable pages; `security.txt` (if present) carries `Contact` and a future `Expires`, both copies identical; `ads.txt` (if present) is the §20 line verbatim; the IndexNow key file exists iff a key is configured                                                              |
| `verification` | a verification meta tag appears iff its variable is set, and matches it                                                                                                                                                                                                                                                                                                   |
| `privacy`      | no address, no ticket-identifier vocabulary and no query string in any emitted title, description, Open Graph tag, canonical or sitemap URL                                                                                                                                                                                                                               |
| `composed`     | `verify-manifest.mjs` and `verify-sitemap.mjs` run as child processes and appear as suites                                                                                                                                                                                                                                                                                |

**Composition, not supersession.** `pnpm seo:verify` is wired into CI and into the root
`package.json`, and both scripts hold rules that are theirs (the manifest derivation, the sitemap's
two-way membership check). `test:seo` runs them rather than restating them: `seo:verify` stays the
fast subset, `test:seo` is the superset, and neither duplicates the other's rule.

**`node scripts/seo/test-seo.mjs --self-test`** runs every check against a synthetic site model with
one seeded violation each, and fails if a check does not fire. 45 checks today, plus the assertion
that the clean model produces no findings. A check that never fires is indistinguishable from a
build with no defects.

---

## 10. Activation steps

### 10.1 `PUBLIC_SITE_URL` (owner input I-4)

1. Set `PUBLIC_SITE_URL=https://delaypilot.app` in the deployment's build environment (no trailing
   path, no query, no fragment; `https` only).
2. Rebuild. Every page gains `<link rel="canonical">`, `og:url`, the absolute `og:image` and
   `twitter:image`, and the Twitter card becomes `summary_large_image` — no code change.
3. `pnpm test:seo` then asserts the canonical on every page instead of asserting its absence.

**One thing must land in the same change, and it was measured rather than predicted.** A build with
`PUBLIC_SITE_URL=https://delaypilot.app` was run on 2026-09-20: all twenty pages emitted a
canonical, an `og:url` and an absolute `og:image`, and nineteen of them were correct self-references
with no duplicate and no drift. The twentieth was `404.html`, which emitted
`https://delaypilot.app/404/` — an address the site does not serve, because `404.astro` is built to
`/404.html` and served on a 404 response. `pnpm test:seo` fails that case by name
(`canonical.on-error-document`). The fix is one condition in BaseLayout, and it is in the S4 handoff
to `frontend-ui-engineer`: omit the canonical, `og:url` and `og:image` for the error document.

**The production guard.** `node scripts/seo/site-url-guard.mjs` exits non-zero with a named
`SiteUrlConfigError` when a **production** build has no usable origin — missing, empty, not https,
carrying a path, query, fragment or credentials, an IP literal, a host with no dot, or a host
carrying a placeholder label (`example`, `invalid`, `test`, `localhost`, `changeme`, `your-domain`,
and the rest of the list in `site-url.mjs`). `https://example.invalid`, the literal in
`.env.example`, is refused by name in a unit test.

A build is **production** when, in order: `SEO_REQUIRE_SITE_URL` is `1`/`true` (or `0`/`false` to
force it off); otherwise `VERCEL_ENV === 'production'`; otherwise a Cloudflare build of branch
`main` (`CF_PAGES_BRANCH` / `WORKERS_CI_BRANCH`, decision D1). Anything else — a laptop, a
pull-request check, a preview deployment — is not, and exits zero with a line saying which tags were
omitted and why. **`NODE_ENV` is deliberately not read**: it is `production` for every optimized
build including a preview of the same commit, so it cannot tell the deployment that owns the domain
from one that does not.

Measured behaviour, 2026-09-20:

| Environment                                                        | Exit | Output                                    |
| ------------------------------------------------------------------ | ---- | ----------------------------------------- |
| no signal, no value                                                | 0    | "not a production build and it continues" |
| `--production`, no value                                           | 1    | `SiteUrlConfigError [missing]`            |
| `VERCEL_ENV=production`, `PUBLIC_SITE_URL=https://example.invalid` | 1    | `SiteUrlConfigError [placeholder-host]`   |
| `VERCEL_ENV=preview`, no value                                     | 0    | continues                                 |
| `VERCEL_ENV=production`, `PUBLIC_SITE_URL=https://delaypilot.app`  | 0    | names the origin                          |

**It reaches the build through one line, in a file this owner does not own** (open handoff):

```jsonc
// apps/web/package.json — "build", first step (owner: frontend-ui-engineer)
"build": "node ../../scripts/seo/site-url-guard.mjs && astro build && node scripts/prune-dist.mjs && node scripts/verify-dist.mjs --self-test && node scripts/verify-dist.mjs"
```

Equivalently in the root `package.json` `build` script (`principal-architect`). Until one of those
lands, the guard is a standalone command and CI can run it directly.

### 10.2 IndexNow

1. Generate a key: 8 to 128 characters of `a-z`, `A-Z`, `0-9`, `-`.
2. `INDEXNOW_KEY=<key>` in the environment (already in `.env.example`).
3. `node scripts/seo/indexnow.mjs --write-key` writes `apps/web/public/<key>.txt`. The key file
   **must** sit at the site root: IndexNow scopes a key file to its own directory, so a key under
   `/.well-known/` would authorize only URLs under `/.well-known/`.
4. `node scripts/seo/indexnow.mjs` prints the payload it would submit (a dry run).
   `--submit` sends it. Nothing submits without that flag, and the script is not wired into any
   build: a build that reaches out to a third party can fail for a reason that has nothing to do
   with the code.
5. What it may submit: only URLs already in `sitemap.xml` — the gate's own output — re-filtered here
   for origin, private prefixes and flight-designator paths.

With no key, every mode prints one line and exits 0. That is the designed inert state.

### 10.3 Search Console and Bing verification

DNS is the better route where the owner holds the zone: a TXT record verifies every protocol and
subdomain at once and survives a redeploy that loses an environment variable.

Where DNS is not available: set `GOOGLE_SITE_VERIFICATION` / `BING_SITE_VERIFICATION`.
`apps/web/src/lib/seo/verification.ts` validates each token (8–128 characters of
`A-Za-z0-9_-.:=`, so nothing can break out of the attribute it is written into) and exposes it, or
`undefined`. BaseLayout renders `<meta name="google-site-verification">` and
`<meta name="msvalidate.01">` when they are defined — the render line is in the S4 handoff.
`pnpm test:seo` fails if a token is configured and no page carries the tag, so a verification that
silently never completes is a loud failure instead.

### 10.4 `security.txt` (owner input I-3)

1. Set `PUBLIC_CONTACT_EMAIL` to a monitored role address (the same variable that gates `/contact/`
   and `/accessibility/`).
2. `node scripts/seo/generate-security-txt.mjs` writes `.well-known/security.txt` and the legacy
   root copy, byte-identical: `Contact`, `Expires` (one year out), `Preferred-Languages: en`, and a
   `Canonical` line per location.
3. Regenerate before `Expires`. `pnpm test:seo` fails once that date is in the past, because an
   expired file tells a finder the channel is unmaintained.

`Policy`, `Encryption`, `Acknowledgments`, `Hiring` and `CSAF` are omitted: each would name a page,
a key or a programme that does not exist. Nothing is published today, because a security address
that reaches nobody tells a finder their report was received when it was not.

---

## 11. Verification

```bash
pnpm --filter @delaypilot/web build          # astro build → prune-dist → verify-dist (0 findings)
node scripts/seo/site-url-guard.mjs          # 0 locally; 1 in a production build with no origin
node scripts/seo/test-seo.mjs                # the exit gate (pnpm test:seo)
node scripts/seo/test-seo.mjs --self-test    # prove each check fires
pnpm seo:verify                              # manifest + sitemap, the fast subset
node scripts/validate-security-headers.mjs   # _headers vs apps/edge SECURITY_HEADERS
pnpm lint                                    # eslint + the forbidden-phrase lint
pnpm test                                    # includes apps/web/src/lib/seo/*.test.ts
```

Everything that reads `apps/web/dist` runs **after** a build, never before. CI order
(`platform-release-sre` owns `.github/workflows/**`): `build` → `content-quality gate` →
`SEO validation`. `SEO validation` should become `pnpm test:seo`, with `pnpm seo:verify` kept only
if a faster pre-check is wanted; it must not run before `build`, and it must not be folded into
`apps/web`'s `build` script.

---

## 12. Not done yet

1. **The canonical URL on every page** — one variable away (§10.1, I-4), plus the error-document
   condition in BaseLayout that must land with it.
2. **The JSON-LD element in BaseLayout** and the type-scoped `verify-dist.mjs` exception (§6.5).
   Both are `frontend-ui-engineer`'s, both are in the S4 handoff with the measurement behind them.
3. **The content-quality gate of §7 as a script** wired into `pnpm quality`, printing the count of
   pages downgraded to `noindex`. The metadata half (uniqueness, length, privacy) is enforced today
   by `pnpm test:seo`; the word-count, citation and freshness halves read
   `apps/web/src/content/**` and `data/rights/sources/**` and wait on the content wave. Freshness
   has nothing to measure while every registry record is unverified (I-8).
4. **`X-Robots-Tag: noindex, nofollow, noarchive`** on `/app/**`, `/auth/**`, `/checkout/**`,
   `/admin/**`, in both `_headers` and the Worker, in the same change that ships the first private
   route. None is served today, so the header would currently apply to nothing. The meta-tag half is
   already asserted by `pnpm test:seo` for any private route that appears.
5. **A sitemap index with per-page-type children** (core, `passenger-rights`, `guides`, `airports`,
   `airlines`, `routes`), generated at build from the gate's output, when those page types exist.
6. **Generating `sitemap.xml` at build** rather than maintaining it by hand. The verifier makes the
   hand-maintained file safe; the generator makes it automatic. It needs the build hook of §10.1.
7. **`hreflang`: not at launch.** There are no translations. It is emitted only if a real translated
   route exists.
8. **Open Graph per-page images**, if and only if real per-page artwork exists. The shared card is
   correct until then.
9. **`Article` markup has no live call site** until a guide reaches `published` (I-6), because
   structured data is emitted on indexable pages only.
