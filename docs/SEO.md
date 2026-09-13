# docs/SEO.md — technical SEO contract

**Owner:** `seo-engineer` (`docs/agents/ROSTER.md §3`).
**Governs:** `apps/web/src/lib/seo/**`, `apps/web/public/robots.txt`, `apps/web/public/sitemap*`,
`apps/web/public/manifest.webmanifest`, `apps/web/public/_headers`, `scripts/seo/**`, and — when
they exist — `llms.txt`, `humans.txt`, `.well-known/security.txt`.
**Authority:** `AGENTS.md` §1.1, §1.4, §1.6, §2 · `DIRECTIVE.md` §18.1, §18.2, §19, §29.

This file records what the site currently asserts about itself, why, and what is deliberately not
asserted yet. Section 9 is the honest list of what is still missing.

**Status.** This is the S3 wave-2 state: twenty pages built, thirteen indexable, no canonical URL on
any page, no structured data, no IndexNow. `DIRECTIVE.md §19` is a Phase 11 deliverable and is not
met by this document — §9 enumerates every gap.

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
| `<link rel="canonical">`                                       | `new URL(Astro.url.pathname, Astro.site)`           | **only when `PUBLIC_SITE_URL` is set** — see the note below           |
| `<meta property="og:type" \| "og:site_name">`                  | fixed: `website`, `DelayPilot`                      | always                                                                |
| `<meta property="og:title" \| "og:description">`               | same strings as `<title>` / `description`           | always                                                                |
| `<meta property="og:url">`                                     | the canonical URL                                   | only with `PUBLIC_SITE_URL`                                           |
| `<meta property="og:image">` + `:alt`, `:width/:height`        | `/og/default-1200x630.png`, 1200×630                | only with `PUBLIC_SITE_URL` (a crawler cannot resolve a relative one) |
| `<meta name="twitter:card">`                                   | `summary_large_image` with an image, else `summary` | always                                                                |
| `<meta name="twitter:title" \| ":description">`                | same strings                                        | always                                                                |
| `<meta name="twitter:image">` + `:alt`                         | same image                                          | only with `PUBLIC_SITE_URL`                                           |
| `<meta name="theme-color">` ×2                                 | `#eef5fb` light, `#07111f` dark                     | always, one per `prefers-color-scheme`                                |
| `<link rel="icon">` svg + ico, `<link rel="apple-touch-icon">` | `scripts/assets/asset-manifest.mjs`                 | always                                                                |
| `<link rel="preload" as="font">` ×2                            | the two Geist `woff2` faces, `crossorigin`          | always                                                                |

**Why there is no canonical URL on any page today.** `PUBLIC_SITE_URL` is unset (owner input I-4),
so `Astro.site` is undefined and `astro.config.mjs` omits `site` entirely. BaseLayout therefore
omits the canonical, `og:url`, and every absolute image tag rather than emit them against a guessed
origin. A canonical pointing at a host nobody owns is worse than no canonical: it is a fabricated
value (`AGENTS.md §1.1`) that a crawler will act on. The absent tags are the designed state, and
they become present the moment the variable is configured — no code change.

**`og:image:alt`** is `DelayPilot — Stay ahead of flight disruptions.`, which is both strings baked
into the card artwork, as text. This closes `docs/ACCESSIBILITY.md` finding F22.

**What a title and a description may never contain** (`AGENTS.md §2`): an email address, a display
name, an itinerary detail, a flight number tied to a real traveler, receipt text, or any
ticket-identifier value. Titles and URLs carry no personal data. Nothing on this site generates a
title from user input, and nothing may start.

**Uniqueness.** Titles and descriptions are unique repo-wide. Today that holds by construction — one
`.astro` file per route, each with its own literal strings — and it is asserted by machine only when
`pnpm test:seo` lands (§9). The title shape is `<Page> — DelayPilot`.

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

| Surface                                                                                        | Emitted? | Robots      | In sitemap? | Why                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------- | -------- | ----------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`, `/flight-status/`, `/delay-risk/`, `/connection-risk/`                                    | yes      | index       | yes         | Route shells with real explanatory content and a working demonstration.                                                                                                 |
| `/methodology/`, `/data-sources/`, `/about/`, `/guides/`                                       | yes      | index       | yes         | First-party explanation of how the product works and where data comes from.                                                                                             |
| `/privacy/`, `/terms/`, `/editorial-policy/`, `/advertising-policy/`, `/affiliate-disclosure/` | yes      | index       | yes         | Policy pages. Indexable because a reader looking for them should find them.                                                                                             |
| Guide entry at `publishable`                                                                   | yes      | **noindex** | **no**      | Served for review; not yet through `legal/factual review` to `published`.                                                                                               |
| Guide/rights entry at `draft`, `source_review`, `legal_review`, `review_due`, `stale`          | **no**   | —           | no          | No route is generated, so there is nothing to index or list.                                                                                                            |
| `/passenger-rights/`                                                                           | yes      | **noindex** | **no**      | The overview entry is `publishable`. Same rule, no exception for it.                                                                                                    |
| `404.html`                                                                                     | yes      | noindex     | **never**   | An error document is not an address to submit to a crawler.                                                                                                             |
| `/airlines/**`, `/airports/**`, `/routes/**`                                                   | **no**   | —           | no          | No reference data exists. A family differing only by an IATA token is a doorway page (`DIRECTIVE.md §19`); these stay unemitted, then `noindex`, until they pass §6.    |
| `/pricing/`, `/status/`, `/contact/`, `/accessibility/`                                        | **no**   | —           | no          | Upstream or configuration dependency absent (`routes.ts`).                                                                                                              |
| `/app/**`, `/auth/**`, `/checkout/**`, `/admin/**`                                             | **no**   | —           | never       | Private (`AGENTS.md §2`). Disallowed in `robots.txt` in advance; when one ships it carries `noindex, nofollow, noarchive` as a meta tag **and** an `X-Robots-Tag` (§9). |
| A live flight-instance page                                                                    | **no**   | —           | **never**   | Out of scope (`DIRECTIVE.md §9`), and demo state is never indexed as an individual flight page (§28).                                                                   |

**`Disallow` blocks the fetch, and a page a crawler may not fetch is a page whose `noindex` it can
never read.** That is why the five `publishable` guides and `/passenger-rights/` are _not_
disallowed in `robots.txt`: their meta tag is the mechanism, and blocking the fetch would defeat it.
`robots.txt` disallows only the four private prefixes, and never uses `Disallow: /` as a stand-in
for real gating.

---

## 3. The sitemap rule

**A URL belongs in `sitemap.xml` exactly when the build emits the page and the page's own robots
meta does not say `noindex`** — `404.html` excepted.

Equivalently, for article routes: `published && indexable`. A `publishable` page is served and not
listed. A `draft` page is neither.

- One flat `sitemap.xml`, thirteen entries. A sitemap index with per-page-type children arrives with
  the page types that would justify one (§9); an index over a single 13-URL child is ceremony.
- `<loc>` is absolute, lowercase, trailing-slashed, no query string, no fragment.
  `astro.config.mjs` sets `trailingSlash: 'always'`, so a slash-less URL redirects rather than
  resolves.
- **No `<lastmod>`, no `<changefreq>`, no `<priority>`.** A build timestamp asserts a content-change
  date that nothing established (`AGENTS.md §1.1`), and none of the thirteen listed pages is a
  content entry with an editorial `reviewedAt`. When an article reaches `published` it arrives with
  its own frontmatter `reviewedAt` as `<lastmod>` — a date a person set on purpose. `changefreq` and
  `priority` are hints no major engine consumes.
- **The absolute origin `https://delaypilot.app` is committed in three places and nowhere else:**
  `sitemap.xml`, the `Sitemap:` line in `robots.txt`, and `EXPECTED_ORIGIN` in
  `scripts/seo/verify-sitemap.mjs`. The third exists so the first two are checked rather than
  trusted. The sitemap protocol requires an absolute `<loc>`, which is why the domain appears here
  at all while no page carries a canonical.

**The check.** `node scripts/seo/verify-sitemap.mjs` reads `apps/web/dist` and fails on: an
indexable page missing from the sitemap; a listed URL the build does not emit; a listed URL that
carries `noindex`; a missing trailing slash; a non-lowercase path; a query string or fragment; a
foreign origin; a duplicate entry; a `dist/sitemap.xml` that differs from `public/sitemap.xml` (a
stale build); and a `robots.txt` whose `Sitemap:` line disagrees. It prints the page counts. It has
been exercised against each of those failures, not only against the green case.

---

## 4. The web app manifest

`apps/web/public/manifest.webmanifest`. Every field is derived from
`scripts/assets/asset-manifest.mjs` or decided here; `node scripts/seo/verify-manifest.mjs` proves
the derivation still holds.

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
the _fallback and the install-surface_ colour, and dark ink is the right one there: it is the colour
of the icon plate and of the splash, both of which are dark in both schemes because the icon art is.
A light `theme_color` would put a pale splash behind a dark icon.

**Absent on purpose:** `screenshots`, `shortcuts`, `related_applications`, `id`, `categories`,
`display_override`. Each asserts a surface, a route, or a distribution channel that does not exist
(`AGENTS.md §1.1`, §1.6). `verify-manifest.mjs` fails on any key outside the agreed set, so adding
one is a deliberate act with a recorded reason.

**Not yet linked.** No page references the manifest. The `<link rel="manifest">` belongs in
BaseLayout's head, which is `frontend-ui-engineer`'s file — handed off, not written here.

---

## 5. Content-Security-Policy

The policy is written twice, once in `apps/web/public/_headers` (mine) and once in
`SECURITY_HEADERS` in `apps/edge/src/index.ts` (`edge-api-engineer`'s), because static pages are
served from the edge asset cache without invoking the Worker and Worker responses never see
`_headers`. `node scripts/validate-security-headers.mjs` fails on drift between them.

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self';
connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

`img-src` lost its `data:` source in this wave. It was there for one thing: the
`<link rel="icon" href="data:,">` placeholder BaseLayout used to suppress the default
`/favicon.ico` request before an icon set existed. BaseLayout v2 links the real `/icons/*` files, and
`vite.build.assetsInlineLimit: 0` additionally stops Vite emitting any small asset as a `data:` URI.
Nothing in `apps/web/dist` requests a `data:` image, so the source was removed rather than carried
defensively.

**The policy is never widened by guesswork.** `apps/web/scripts/verify-dist.mjs` runs on every build,
refuses any inline `<script>`, inline `<style>` or `style="…"` attribute, and prints the exact
`'sha256-…'` source the header would have to carry for the element it found. A future inline element
fails the build with its own allowlist entry already computed. A `data:` or `'unsafe-inline'` source
added to turn a red build green is the failure mode that arrangement exists to prevent.

---

## 6. The content-quality gate

**Declared here, implemented in Phase 11.** These are the thresholds the
`content-editorial-lead` charter already cites against this file, published so that content is
written to a number rather than to a feeling. The gate reports and downgrades; it never edits
content.

### 6.1 Minimum original word count, by page type

| Page type                             | Floor                                    |
| ------------------------------------- | ---------------------------------------- |
| Guide / article                       | **900 words**                            |
| `passenger-rights` jurisdiction page  | **700 words**                            |
| Airport / airline / route page        | **400 words** _and_ ≥ 3 real data fields |
| Utility page (a tool, not an article) | **250 words** _and_ a working utility    |
| Homepage                              | exempt from the word count only          |

"Original" excludes navigation, header, footer, the independence disclaimer, the rights disclaimer,
quoted regulatory text, and any string shared across more than one page.

### 6.2 Source references

- Regulatory and rights pages: **≥ 2** source ids, each resolvable in `source_registry`.
- Explanatory guides: **≥ 1**.
- A bare URL is not a citation. A news summary is not an authority.

### 6.3 Freshness

A regulatory page fails when the newest `last_verified_at` among its cited sources is **older than
180 days**. Failing means `noindex` and out of the sitemap, not deleted: the page keeps serving with
its real reviewed date visible while `regulatory-source-steward` re-verifies.

### 6.4 Uniqueness and placeholders

- Title, meta description, and first paragraph unique across the whole site.
- No duplicate canonical anywhere: two pages emitting one canonical is a failure, not a warning.
- No placeholder token in a shipped surface: `TODO`, `FIXME`, `coming soon`, `lorem`, `TBD`, `XXX`,
  `{{`.
- **`{{rule:<jurisdiction>:<dotted.path>}}` is not a placeholder.** It is a resolved slot: the
  mechanism that keeps time-sensitive regulatory values out of article prose and inside versioned
  rule data (`AGENTS.md §3.2`). `apps/web/src/components/rule-slots.ts` fails the build closed if one
  is still unresolved when the page is _served_, which is the real defect. The gate's placeholder
  check must exempt the `{{rule:…}}` form specifically and must not simply exempt `{{`.

### 6.5 Metadata and privacy

- `indexable` flag present; editorial status present and one of the seven recognized values.
- No private data anywhere in the page or its metadata: no email address, no ticket-identifier
  value, no itinerary detail, no receipt text (`AGENTS.md §2`).
- No unlicensed live provider data rendered on a public page (`AGENTS.md §1.5`).

### 6.6 Consequence

A page failing any check is forced `noindex` and excluded from the sitemap. The gate prints the
page, the failing check, and the offending value, and reports the count of pages downgraded. A
threshold is never lowered, a page type never exempted, and a failing URL never allowlisted, to make
an exit gate green: a failing page being `noindex` **is** the design.

---

## 7. Public-root files

| File                                         | State                                               | Notes                                                                                                                                                                                                   |
| -------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `robots.txt`                                 | shipped                                             | §2. `Sitemap:` absolute, four private prefixes disallowed, no blanket disallow.                                                                                                                         |
| `sitemap.xml`                                | shipped                                             | §3. Thirteen URLs.                                                                                                                                                                                      |
| `manifest.webmanifest`                       | shipped, **not yet linked**                         | §4. Needs `<link rel="manifest">` in BaseLayout.                                                                                                                                                        |
| `_headers`                                   | shipped                                             | §5.                                                                                                                                                                                                     |
| `ads.txt`                                    | **absent** — `monetization-partnerships-engineer`'s | Must read exactly `google.com, pub-9029421562757873, DIRECT, f08c47fec0942fa0`. I assert it in `pnpm test:seo`; I never author it.                                                                      |
| `.well-known/security.txt` + `/security.txt` | **absent** — Phase 11                               | RFC 9116 `Contact`, `Expires` (a real future date), `Policy`, `Preferred-Languages`; a role address, never a person's inbox. Blocked on a contact address.                                              |
| `humans.txt`                                 | **absent** — Phase 11                               | Credits roles, never private individuals.                                                                                                                                                               |
| `llms.txt`                                   | **absent** — Phase 11                               | Describes what DelayPilot is and links methodology, data sources, editorial policy. States no accuracy figure, no user count, no provider name that is not licensed, no capability that is not shipped. |
| IndexNow key file                            | **absent** — Phase 11                               | Key from validated config; the submitter no-ops with a clear log line when it is absent.                                                                                                                |
| `/favicon.ico` at the site root              | **absent** — see §9                                 | `asset-manifest.mjs` records its url as `/favicon.ico`, but the file sits at `/icons/favicon.ico`.                                                                                                      |

---

## 8. Verification

```bash
pnpm --filter @delaypilot/web build     # astro build → prune-dist → verify-dist (0 findings)
node scripts/seo/verify-manifest.mjs    # manifest vs scripts/assets/asset-manifest.mjs, icon files exist
node scripts/seo/verify-sitemap.mjs     # sitemap vs dist: membership, noindex, slashes, duplicates, origin
node scripts/validate-security-headers.mjs   # _headers vs apps/edge SECURITY_HEADERS
npx prettier --check <changed files>
pnpm lint                               # eslint + the forbidden-phrase lint
```

`verify-sitemap.mjs` reads `apps/web/dist`, so it runs **after** a build, never before. Proposed root
script (`principal-architect` owns `package.json`):

```json
"seo:verify": "node scripts/seo/verify-manifest.mjs && node scripts/seo/verify-sitemap.mjs"
```

CI order (`platform-release-sre` owns `.github/workflows/**`): `build` → `seo:verify`. It must not
run before `build`, and it must not be folded into the build script — `apps/web`'s `build` belongs to
`frontend-ui-engineer`.

---

## 9. Not done yet

**Phase 11 (`DIRECTIVE.md §19`), all mine:**

1. **`PUBLIC_SITE_URL` resolver** at `apps/web/src/lib/seo/site.ts`, resolved once, used by every
   absolute URL on the site. A production build **fails** with a named error when it is missing,
   empty, not an absolute `https://` origin, or still an example value (`example.com`,
   `your-domain`, `localhost`, `changeme`). Dev and test fall back to `http://localhost:4321`. This
   also retires the three hard-coded copies of `https://delaypilot.app` in §3.
   Needs `.env.example` keys from `principal-architect`: `PUBLIC_SITE_URL`, `INDEXNOW_KEY`,
   `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION`.
2. **The content-quality gate** of §6, as `scripts/seo/`, wired into `pnpm quality`, printing the
   count of pages downgraded to `noindex`.
3. **`pnpm test:seo`** — currently a deliberate exit-1 stub. Suites: canonical uniqueness,
   title/description uniqueness, private-route `noindex`, structured-data allowlist, sitemap purity,
   and the verbatim `ads.txt` line.
4. **Structured data**, allowlist only and only where visible content supports it: `Organization`,
   `WebSite`, `WebApplication` (`applicationCategory: TravelApplication`), `BreadcrumbList` where a
   breadcrumb is rendered, `Article` on guides and rights explainers, `FAQPage` only for FAQs whose
   question and answer text byte-match the DOM, `ItemList` for meaningful rendered lists. **Nothing
   else** — no `Flight`, `Offer`, `Product`, `AggregateOffer`, and no airline `Organization` (it
   would imply affiliation, `AGENTS.md §1.4`). Never `aggregateRating`, `review`, `ratingValue`,
   `reviewCount`, `offers.price`, `availability`, `award`, or `userInteractionCount` — not "for rich
   results", not with a seed value. Requires re-reading the current Google structured-data and
   spam-policy documentation (`DIRECTIVE.md §33` items 19–20) at execution time; training memory is
   not a source (`AGENTS.md §5.1`).
5. **`X-Robots-Tag: noindex, nofollow, noarchive`** on the `/app/**`, `/auth/**`, `/checkout/**` and
   `/admin/**` prefixes, in both `_headers` and the Worker, in the same change that ships the first
   private route. None is served today, so the header would currently apply to nothing.
6. **`security.txt`, `humans.txt`, `llms.txt`, the IndexNow key file**, and the Search Console / Bing
   verification placeholders, wired through validated config. `security.txt` is blocked on a role
   contact address.
7. **IndexNow submitter** — submits only gate-passing `published` URLs; never a private route, never
   a flight instance; no-ops with a clear log line when the key is absent.
8. **Sitemap index with per-page-type children** (core, `passenger-rights`, `guides`, `airports`,
   `airlines`, `routes`), generated at build from the gate's output, when those page types exist.

**S4:**

- Generate `sitemap.xml` at build rather than maintain it by hand, once the resolver exists.
- `hreflang`: **not at launch.** There are no translations. It is emitted only if a real translated
  route exists.
- Open Graph per-page images, if and only if real per-page artwork exists. The shared card is
  correct until then.
- Hand `verify-sitemap.mjs` and `verify-manifest.mjs` to the `pnpm test:seo` harness so there is one
  SEO command rather than three.
