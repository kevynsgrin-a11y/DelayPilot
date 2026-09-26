# docs/DEPLOYMENT.md — how DelayPilot reaches a browser

**Owner:** `platform-release-sre` (`docs/agents/ROSTER.md §3`)
**Owned paths:** this file, `vercel.json`, `apps/edge/wrangler.jsonc`, `.github/workflows/**`,
`packages/observability/**`, `docs/RUNBOOK.md`, `docs/ANALYTICS.md`
**Scope of this revision (2026-09-20, visual-overhaul session S4):** the response-header and cache
contract for the static web deployment, the verification that proves it is live, the settled Vercel
Root Directory (§2), and the gate list both workflows run before a deploy (§1.1). The Cloudflare
Worker deployment, the secret inventory, D1 migration procedure and the fifteen runbooks are
`DIRECTIVE.md` Phase 13 and are not in this document yet; `docs/RUNBOOK.md` does not exist.

---

## 0. The one thing this document protects

**A security header that is declared but not served protects nobody, and nothing in a build can
tell the difference.** Every gate in this repository — `apps/web/scripts/verify-dist.mjs`, the axe
runner, the Lighthouse harness, the Playwright CSP suite — reads the policy out of
`apps/web/public/_headers` and holds the build to it. All of them would have gone on passing
forever while the deployed site served no Content-Security-Policy at all, because the server that
actually serves `delaypilot.app` does not read that file and never has.

That is not hypothetical. It is what this repository did between the first `_headers` commit and
this change.

---

## 1. What serves the site today

| Surface                                         | Server                                         | Status                                                                             |
| ----------------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `delaypilot.app`, `www.delaypilot.app`          | Vercel project `delaypilot`, built from `main` | Live. Serves the pre-rendered `apps/web` build.                                    |
| `/api/**`, `/auth/**`, `/webhooks/**`, `/go/**` | Cloudflare Worker (`apps/edge`)                | Not deployed. `.github/workflows/deploy.yml` skips without Cloudflare credentials. |

Two consequences follow, and both are easy to forget:

1. **`/api/v1/health` is unreachable on the live site.** It is a Worker route and the Worker is not
   deployed. Any smoke test that probes it against `delaypilot.app` is testing a 404.
2. **`apps/web/public/_headers` is inert in production.** It is Cloudflare's static-assets header
   format. Vercel neither parses it nor applies it; the Astro build copies it into `apps/web/dist`
   like any other file in `public/`, so Vercel serves it as a static text file at `/_headers` while
   ignoring it as configuration. Reading the file on the live site tells you what the policy was
   supposed to be, not what you received.

### 1.1 What has to be green before anything deploys

`.github/workflows/deploy.yml` is two jobs. `guard` reads whether `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` exist; `deploy` runs only when both do, so an unarmed repository **skips**
rather than fails — a missing credential is a pending setup task, not a broken pipeline.

When it is armed, the `deploy` job runs the same eleven `DIRECTIVE.md §23` checks that
`.github/workflows/ci.yml` runs, in the same order, under identical step names, **before** it calls
`wrangler`:

| §23 | Check          | Command                          | §23 | Check               | Command             |
| --- | -------------- | -------------------------------- | --- | ------------------- | ------------------- |
| 1   | frozen install | `pnpm install --frozen-lockfile` | 9   | edge build          | `pnpm build`        |
| 2   | format         | `pnpm format:check`              | 13  | SEO validation      | `pnpm test:seo`     |
| 3   | lint           | `pnpm lint`                      | 14  | accessibility smoke | `pnpm test:a11y`    |
| 4   | typecheck      | `pnpm typecheck`                 | 15  | Playwright          | `pnpm test:e2e`     |
| 5   | unit           | `pnpm test`                      | 16  | bundle budgets      | `pnpm perf:budgets` |
| 8   | web build      | `pnpm build`                     |     |                     |                     |

Plus the four repo-local gates (`validate-build-system`, `validate-security-headers`,
`validate-contrast`, image budgets) and one deploy-only assertion: that the built homepage carries a
`rel="canonical"`, which proves `PUBLIC_SITE_URL` reached the build.

Two properties of that list are load-bearing and easy to erode:

- **The two workflows must assert the same standard.** A deploy that gates on less than the pull
  request did makes the deploy the real gate, and the weaker one. Add a check to one file and add
  it to the other in the same change.
- **The deploy is the only place the gates measure the production-shaped build.** `PUBLIC_SITE_URL`
  is set in `deploy.yml` and nowhere else, so canonical tags, `og:url` and the JSON-LD blocks exist
  only in that output — the heavier tree every budget in `perf.budgets.json` was set against
  (`docs/PERFORMANCE.md §3.1a`).

Seven §23 checks are still absent from both workflows (6 property, 7 Workers integration, 10
migration validation, 11 rights-rule validation, 12 content-quality gate, 17 dependency audit, 18
secret scan). The header comment of `ci.yml` names the phase and owner of each. The Playwright
`visual` project is also excluded from both, deliberately: its 68 baselines were generated on the
development container's rendering at `maxDiffPixels: 0` and are valid for that toolchain and
nothing else (`docs/TESTING.md §5`), so it stays a local and pre-merge check.

---

## 2. Where the Vercel configuration lives, and why there are two copies

Vercel reads `vercel.json` from the project's configured **Root Directory**, not from the
repository root.

### 2.1 Settled: the Root Directory is `apps/web`

**`apps/web/vercel.json` is the file the platform reads. The repository-root `vercel.json` is
inert.** This is no longer an inference from a symptom.

The evidence is Vercel's own integration metadata. The `vercel[bot]` comment on
[PR #21](https://github.com/kevynsgrin-a11y/DelayPilot/pull/21) carries a base64 `[vc]:` blob;
decoded, it reads:

```json
{
  "isMonorepo": true,
  "projects": [
    {
      "name": "delaypilot",
      "projectId": "prj_cw05bF1hLnrxJV7tqOJ84Frt1x8g",
      "rootDirectory": "apps/web"
    }
  ]
}
```

That `projectId` is the same one the Vercel API returns for the project named `delaypilot`. The
blob is written by Vercel's GitHub integration from the project's actual settings, so it is a
reading of the setting rather than a report about it.

Three things follow.

1. **`docs/decisions/0002-foundation-stack-and-versions.md` was right.** Its "Hosting reality on
   2026-09-11 (reported, not verified live)" section recorded the Root Directory as `apps/web` from
   the owner's audit. It is now verified.
2. **The original header finding is explained end to end.** The old root `vercel.json` declared
   four headers and Vercel never read them. That is exactly why the probe recorded in
   [PR #16](https://github.com/kevynsgrin-a11y/DelayPilot/pull/16) —
   `curl -I https://delaypilot.app/` — returned `strict-transport-security` and nothing else: no
   `X-Frame-Options`, no `X-Content-Type-Options`, no `Referrer-Policy`, no `Permissions-Policy`,
   no CSP. HSTS was the one header Vercel adds itself. PR #16's fix added `apps/web/vercel.json`,
   but it merged into the retired branch `claude/inkling-multimodal-subagents-stn4l5`, so it never
   reached `main`.
3. **Both copies stay, and the reason has changed.** See §2.2.

**Provenance of this subsection.** The decode above was performed by the coordinating session of
2026-09-20 and is recorded here rather than re-derived: GitHub API access is not enabled in the
agent session that wrote this file, so nothing here was fetched by it (`AGENTS.md §6`). To re-check
it yourself, read the `vercel[bot]` comment on PR #21 and decode the `[vc]:` payload:

```bash
gh pr view 21 --repo kevynsgrin-a11y/DelayPilot --json comments \
  --jq '.comments[] | select(.author.login == "vercel") | .body' \
  | grep -o '\[vc\]: #[^ ]*' | sed 's/.*data=//' | base64 -d
```

### 2.2 The second copy is a guard, not an unresolved question

**Do not delete `vercel.json` because it is inert.** It is inert _today_, under the current setting,
and that setting is one dashboard field away from changing. Whoever flips the Root Directory back
to the repository root would, with only one copy on disk, silently un-protect the entire site — and
no local check would notice, because every build gate reads `apps/web/public/_headers` and none of
them reads what Vercel serves.

So the same configuration is committed at both paths, and
`scripts/validate-security-headers.mjs` holds them byte-identical:

| Path                   | Role today                                    | Read when Root Directory is |
| ---------------------- | --------------------------------------------- | --------------------------- |
| `apps/web/vercel.json` | **Live.** This is the served policy.          | `apps/web` — current        |
| `vercel.json`          | **Guard copy.** Inert, deliberately retained. | the repository root         |

The parity check is what makes the guard copy safe rather than a liability: a second file that
could drift from the live one would be worse than no second file, because it would look
authoritative while being wrong. Because the two cannot drift, the served policy is the same under
either setting and no reviewer has to know which one is live to review the change.

**Do not weaken the four-way check to accommodate this** (`§3`). Removing `vercel.json` from
`VERCEL_FILES` and leaving the file on disk is the worst of both worlds.

### 2.3 How to re-check the setting if it is ever changed

Not a pending task — a procedure for the next time someone touches the project configuration.

```bash
# Dashboard: project `delaypilot` → Settings → Build and Deployment → Root Directory.
vercel project inspect delaypilot           # CLI, authenticated to team kevynsgrin-a11ys-projects
```

If the answer is no longer `apps/web`, update the table in §2.2, update `§3`'s row 3/4 note, and
re-run `node scripts/validate-security-headers.mjs`. The set of committed copies does not change:
whichever one is inert stays, for the reason in §2.2.

---

## 3. One policy, four declarations

The same security policy is written in four places because three different servers read three
different formats and none of them reads another's.

| #   | File                                          | Applies to                                                                    |
| --- | --------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | `apps/web/public/_headers`                    | Cloudflare static assets. **The reference copy** — every build gate reads it. |
| 2   | `apps/edge/src/index.ts` → `SECURITY_HEADERS` | Cloudflare Worker responses, which never see `_headers`.                      |
| 3   | `apps/web/vercel.json`                        | **Vercel. This is the live one** — Root Directory is `apps/web` (§2.1).       |
| 4   | `vercel.json`                                 | Vercel, if Root Directory is ever set back to the repository root (§2.2).     |

`node scripts/validate-security-headers.mjs` fails the build on any drift between them. It runs in
both workflows, under the same step name — `.github/workflows/ci.yml` and
`.github/workflows/deploy.yml` → "Validate security-header parity".

`node scripts/validate-security-headers.mjs --self-test` proves the checker fires: it reads the
four real files, asserts the live policy passes, then seeds one divergence at a time in memory and
asserts each is rejected. It modifies nothing on disk.

### 3.1 The headers

Values are byte-identical across all four files. The reasoning for each CSP directive — and the
conditions under which `'unsafe-inline'` would have to come back — is documented once, in the
comment block of `apps/web/public/_headers`. Do not restate it; do not widen a directive to make a
build green.

| Header                      | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `X-Content-Type-Options`    | `nosniff`                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `X-Frame-Options`           | `DENY`                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `Permissions-Policy`        | `geolocation=(), camera=(), microphone=(), payment=()`                                                                                                                                                                                                                                                                                                                                                                                                          |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `Content-Security-Policy`   | `default-src 'self'; script-src 'self' https://www.googletagmanager.com https://static.cloudflareinsights.com; style-src 'self'; img-src 'self' https://*.google-analytics.com https://*.googletagmanager.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://cloudflareinsights.com; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` |

### 3.2 Framing: `DENY`, not `SAMEORIGIN`

The repository previously disagreed with itself: `apps/web/public/_headers` set
`frame-ancestors 'none'` and `X-Frame-Options: DENY`, while the root `vercel.json` set
`X-Frame-Options: SAMEORIGIN`. **`DENY` and `frame-ancestors 'none'` are correct and both files now
say so**, because DelayPilot has no embed surface and frames none of its own pages, while its
private routes (`/app/**`, `/auth/**`, `/checkout/**`, `/admin/**`) must never be framable at all —
`SAMEORIGIN` was the weaker default of a file nothing read, not a decision anyone took.

---

## 4. Cache policy

`docs/PERFORMANCE.md §7` finding P-1 measured Lighthouse `cache-insight` at **0** with **49,126
bytes** of estimated waste on `/`: all seven static assets reported `cacheLifetimeMs: 0`, because
no file in the repository declared a `Cache-Control` header for a static asset. The rules below are
declared in `vercel.json` (both copies).

| Source pattern          | `Cache-Control`                       | Why that value                                                                                           |
| ----------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `/_astro/:path*`        | `public, max-age=31536000, immutable` | Astro content-hashes these filenames. A change produces a new URL, so the old one can never be wrong.    |
| `/fonts/:path*`         | `public, max-age=31536000, immutable` | Immutable subsets. **A new subset must be a new filename** — see the contract below.                     |
| `/icons/:path*`         | `public, max-age=604800`              | Not content-hashed. A week is short enough that a corrected icon lands without a filename change.        |
| `/og/:path*`            | `public, max-age=604800`              | Same class.                                                                                              |
| `/brand/:path*`         | `public, max-age=604800`              | Same class.                                                                                              |
| `/favicon.ico`          | `public, max-age=604800`              | Same class; the root copy of `/icons/favicon.ico`.                                                       |
| `/theme-init.js`        | `public, max-age=3600`                | **Not** content-hashed and it runs before first paint. `immutable` would strand a fix for a year.        |
| `/manifest.webmanifest` | `public, max-age=3600`                | Not hashed; a wrong manifest should be correctable within an hour.                                       |
| `/robots.txt`           | `public, max-age=3600`                | A crawler directive that may need to change quickly.                                                     |
| `/sitemap.xml`          | `public, max-age=3600`                | Same; a removed route should stop being advertised quickly.                                              |
| `/llms.txt`             | `public, max-age=3600`                | Same class.                                                                                              |
| `/humans.txt`           | `public, max-age=3600`                | Same class.                                                                                              |
| `/_headers`             | `public, max-age=3600`                | Served publicly by Vercel as a text file; also carries `X-Robots-Tag: noindex` (§6).                     |
| `/app/:path*`           | `private, no-store`                   | `AGENTS.md §2`. Declared before the route exists so it cannot be forgotten on the day it lands.          |
| `/auth/:path*`          | `private, no-store`                   | Same.                                                                                                    |
| `/checkout/:path*`      | `private, no-store`                   | Same.                                                                                                    |
| `/admin/:path*`         | `private, no-store`                   | Same.                                                                                                    |
| `/api/:path*`           | `private, no-store`                   | Same. The Worker already sets `no-store` on API responses; this covers the Vercel side of the same path. |

### 4.1 Why the rules are disjoint, and why that is enforced

Vercel applies **every** matching header rule. No Vercel documentation reachable from the build
environment defines which value wins when two rules set the same key, and an undefined
`Cache-Control` on a private route is a privacy defect, not a performance question. So no two
`Cache-Control` rules may match the same request, and `scripts/validate-security-headers.mjs`
proves it: every `Cache-Control` source must be written as `/exact/path` or `/prefix/:path*`, the
checker rejects anything outside that grammar, and it rejects any overlapping pair. The site-wide
security block sets no `Cache-Control` at all, which is what makes it safe for it to match
everything.

The prefix form matters. Under path-to-regexp — the matcher Vercel compiles `source` with —
`/api/:path*` matches `/api`, `/api/` and `/api/v1/health` but not `/apiary`, and `/favicon.ico`
matches only `/favicon.ico` because the dot is escaped. Verified against the `path-to-regexp@6.3.0`
copy in this repository's `node_modules`; the version Vercel runs was not verifiable from the build
environment (see §7).

### 4.2 What may never gain a shared-cache directive

- **No route that renders provider data** may carry `s-maxage` or `stale-while-revalidate` without
  the licensed cache window from `docs/PROVIDER_LICENSING.md` behind it. Past its freshness
  threshold a datum is `Cached` or `Stale` with its age shown, never `Live` (`AGENTS.md §1.2`), so a
  shared cache that outlives the window changes the provenance label the traveler is owed. No route
  renders provider data today. That is why the rules above are safe now and would not be later.
- **`/app/**`, `/auth/**`, `/checkout/**`, `/admin/**` and any authenticated API path** may never
  carry `public`, `s-maxage`, `stale-while-revalidate` or `immutable` at all (`AGENTS.md §2`). The
  parity check fails the build if one of them does, and fails it if one of them loses its rule.

### 4.3 The HTML documents line is deliberately not implemented

P-1 also proposes `public, max-age=0, s-maxage=<ttl>, stale-while-revalidate=<swr>` on HTML
documents. It is **not** in `vercel.json`, for two reasons, neither of which is a judgement about
whether it would help:

1. "HTML documents" cannot be written as a source pattern disjoint from the asset rules without a
   negative-lookahead regex, and §4.1 is the reason that matters.
2. Vercel's treatment of `s-maxage` and `stale-while-revalidate` on a **static** file — whether the
   directives are served through to the browser, consumed by the CDN, or rewritten — could not be
   verified against Vercel's documentation from this build environment (§7). `AGENTS.md §5.1`
   forbids taking a platform fact from memory.

The measured waste in P-1 is entirely in the seven static assets, all of which are covered above.
When vercel.com is reachable, verify the static-file `Cache-Control` semantics, then add one rule
per **enumerated** HTML path class rather than a catch-all, and re-run the parity check — it will
reject an overlapping pattern on sight.

### 4.4 Contract: an immutable filename must change when its bytes change

`/_astro/*` satisfies this by construction — Astro content-hashes it. `/fonts/*` does not: the
build emits `geist-sans-latin-400.woff2` and `geist-sans-latin-600.woff2` at fixed names. With
`immutable, max-age=31536000`, re-subsetting a font **under the same filename** strands returning
visitors on the old file for up to a year, and no deploy fixes it. A new subset must ship under a
new filename. Owner of that constraint: `brand-design-director` (`apps/web/public/fonts/**`).

---

## 5. Verifying that any of this is live

Local checks prove the declarations agree. They cannot prove what a server sent.

```bash
node --input-type=module -e "import('node:fs').then(fs=>{JSON.parse(fs.readFileSync('vercel.json','utf8'));console.log('ok')})"
node scripts/validate-security-headers.mjs              # the four declarations agree
node scripts/validate-security-headers.mjs --self-test  # and the checker fires on drift
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test
```

**The live check is a separate, mandatory step, and it belongs on the preview deployment.** Merging
to `main` is a production deploy (`docs/BUILD_PLAN.md §10`, decision D1), so a header change is
verified **before** the pull request merges, not after. Every branch gets a preview at
`https://delaypilot-git-<branch>-kevynsgrin-a11ys-projects.vercel.app` (`docs/BUILD_PLAN.md §10`,
input I-7).

```bash
PREVIEW=https://delaypilot-git-<branch>-kevynsgrin-a11ys-projects.vercel.app

# 1. The six security headers are present on an HTML document.
curl -sI "$PREVIEW/" | grep -iE 'content-security-policy|x-frame-options|x-content-type-options|referrer-policy|permissions-policy|strict-transport-security'

# 2. The CSP is byte-identical to the one the build is verified against.
diff <(curl -sI "$PREVIEW/" | grep -i '^content-security-policy:' | cut -d' ' -f2- | tr -d '\r') \
     <(grep -i 'Content-Security-Policy:' apps/web/public/_headers | cut -d':' -f2- | sed 's/^ *//')

# 3. Long-lived caching reaches the content-hashed assets.
curl -sI "$PREVIEW/_astro/BaseLayout.TsEFhHoJ.css" | grep -i cache-control   # public, max-age=31536000, immutable
curl -sI "$PREVIEW/fonts/geist-sans-latin-400.woff2" | grep -i cache-control # public, max-age=31536000, immutable
curl -sI "$PREVIEW/theme-init.js" | grep -i cache-control                    # public, max-age=3600

# 4. Exactly one Cache-Control header comes back on each. Two means a rule overlap reached production.
curl -sI "$PREVIEW/_astro/BaseLayout.TsEFhHoJ.css" | grep -ci '^cache-control:'  # expect 1

# 5. Nothing is broken by the policy: load the page in a browser with the console open and
#    confirm zero CSP violation reports on /, /flight-status/, /connection-risk/ and a /guides/ page.
```

If step 1 returns only `strict-transport-security`, the configuration is in the file Vercel is not
reading — go to §2.3 and re-check the Root Directory. That is the exact symptom recorded in PR #16,
and §2.1 now explains it.

The asset filename in step 3 is the one measured on 2026-09-20
(`perf.budgets.json → measurement.takenFrom`). It changes whenever the stylesheet changes; take the
current one from `apps/web/dist/_astro/` or from the page source.

---

## 6. `/_headers` is served publicly, and stays where it is

`apps/web/public/_headers` is copied into `apps/web/dist` by the build, so Vercel serves it at
`/_headers` as a static text file while ignoring it as configuration.

**Decision: keep the file at `apps/web/public/_headers`.** It is the single source of the policy
string for six consumers — `apps/web/scripts/verify-dist.mjs`, `scripts/perf/serve-dist.mjs`,
`scripts/perf/lighthouse.mjs`, `tests/tools/serve-dist.mjs`, `tests/a11y/run-axe.mjs` and
`playwright.config.mjs` — each of which reads the policy from that path rather than restating it.
Moving it would be a change in `apps/web/**`, which `platform-release-sre` does not own, and would
turn one source of truth into a migration across six readers for a file whose entire content is a
policy every response already advertises in full. It contains no secret and discloses nothing that
`curl -I` does not.

What it costs is a file that could be indexed or mistaken for live configuration. Both are handled:
`vercel.json` serves `/_headers` with `X-Robots-Tag: noindex`, and this section is the record that
it is a build artefact rather than a control surface. The file's own comment block still asserts
"Cloudflare parses this file rather than serving it; it never appears as a public asset" — true of
Cloudflare, false of the server that actually runs the site. Correcting that sentence is a handoff
to the owner of `apps/web/public/**`.

**The repository-root `_headers` file is deleted.** It was a weaker duplicate
(`X-Frame-Options: SAMEORIGIN`, no CSP, `max-age=31536000`), no tool read it, no server read it, and
`docs/BUILD_PLAN.md §10` had already recorded it as dead. The only thing that touched it was the
copy lint's repository-root sweep, which simply has one fewer file to scan.

---

## 7. Rollback

A header change is reversible by content, and the deployment is reversible by promotion. Both,
in order of preference:

1. **Revert the configuration.** `git revert <sha>` on the commit that changed `vercel.json` and
   `apps/web/vercel.json`, then let the branch deploy. `node scripts/validate-security-headers.mjs`
   must pass on the reverted tree — if it fails, the revert has put the four declarations out of
   step and the fix is to revert all four together, never to relax one.
2. **Promote the previous deployment.** In the Vercel dashboard, project `delaypilot` →
   Deployments → the last known-good deployment → Promote to Production. This restores the previous
   build and its headers in one step, without waiting for a build.
3. **Never "fix forward" by widening the policy.** If a route breaks under the CSP, the break is a
   finding about that route: the build is verified against this exact policy by
   `apps/web/scripts/verify-dist.mjs`, which prints the precise `sha256-...` source any inline
   element would need. A policy widened to turn a page green is the failure mode the whole
   arrangement exists to prevent (`apps/web/public/_headers`, "HOW TO CHANGE THIS POLICY WITHOUT
   GUESSING").

A cache rollback has a tail the code does not: an asset already served with
`max-age=31536000, immutable` stays in browser caches until it expires. Reverting the rule does not
recall it. That is why `immutable` is restricted to content-hashed and new-filename-per-change
assets (§4.4) — for those, the recall mechanism is the new URL.

Worker rollback, D1 migration rollback and the fifteen incident runbooks are Phase 13
(`DIRECTIVE.md §21`, `docs/RUNBOOK.md`).

---

## 8. External blockers

Each is a named credential or setting, not a task.

| Blocker                                                             | Needed for                                                                                                      |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| A reachable preview or production URL                               | Every check in §5. Outbound HTTPS to `delaypilot.app` and `*.vercel.app` is refused by this environment's proxy |
| Reachable `vercel.com` documentation                                | Verifying static-file `Cache-Control` semantics before the §4.3 HTML rule can be written                        |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, the D1 database id | `pnpm deploy`, `pnpm db:migrate:remote`, and any claim that the Worker is running                               |

**Resolved 2026-09-20.** "Vercel dashboard or CLI access, to read the Root Directory setting" was
listed here. It is settled by §2.1 — the setting is `apps/web`, read from Vercel's own integration
metadata. Dashboard access is no longer needed to answer the question, and the second `vercel.json`
is retained on purpose (§2.2) rather than waiting on anyone to delete it.

---

## 9. Change log

| Date       | Change                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-09-20 | Document created. Security policy ported into `vercel.json` and `apps/web/vercel.json`; `X-Frame-Options` conflict resolved to `DENY`; P-1 asset cache matrix added with the private-prefix guard; repository-root `_headers` deleted; `scripts/validate-security-headers.mjs` extended to a four-way check with a seeded-drift self-test. Live effect not verified — see §8.                                                                    |
| 2026-09-20 | §2 rewritten: the Vercel Root Directory is settled at `apps/web` from the `vercel[bot]` `[vc]:` metadata on PR #21, so `apps/web/vercel.json` is live and the root copy is a deliberate guard rather than an open question; the dashboard-access blocker is resolved. §1.1 added: `deploy.yml` split into a `guard` job and a `deploy` job and brought to the same eleven §23 checks `ci.yml` now runs. Live effect still not verified — see §8. |
