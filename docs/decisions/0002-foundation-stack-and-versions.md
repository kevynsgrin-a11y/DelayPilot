# ADR 0002 — Foundation stack and pinned versions

**Status:** accepted · **Date:** 2026-09-11 (records decisions taken at Phase 1, 2026-07-27, previously undocumented) · **Decider:** `principal-architect`
**Cited by:** `apps/web/astro.config.mjs:10`, `apps/edge/wrangler.jsonc:4`

## Context

Phase 1 pinned a toolchain and made four structural choices — no Astro adapter, deterministic CSS
output so the CSP can drop `'unsafe-inline'`, one canonical URL form, one Worker owning every dynamic
path — then shipped without recording any of them, so the two files citing this ADR pointed at
nothing. This is a backfill: every value below was read out of the repository on 2026-09-11 and cited
to its file rather than recalled (`AGENTS.md §1.1`, `§5.1`). Line numbers are as read that date, the
file plus named key being the citation of record if lines move; claims reported rather than checked
are labelled.

## Decision

### Workspace, package manager, Node

- pnpm workspaces over `apps/*` and `packages/*` (`pnpm-workspace.yaml:1-3`).
- `packageManager: pnpm@10.33.0` (`package.json:8`); `engines` `node >=22.12.0`, `pnpm >=10.0.0`
  (`:9-12`). CI reads both from the manifest, so a workflow cannot drift from the declared toolchain
  (`.github/workflows/ci.yml:90-103`).
- pnpm 10 runs no dependency lifecycle script unless allowlisted; `onlyBuiltDependencies` is exactly
  `esbuild` and `workerd` (`pnpm-workspace.yaml:5-9`) — the two platform binaries required, no more.
- Root ranges are exact, not caret, with one exception: `sharp: ^0.35.3` (`package.json:45`).

### TypeScript

- `typescript@6.0.3`, pinned identically at the root and in both apps (`package.json:46`,
  `apps/web/package.json:18`, `apps/edge/package.json:19`).
- `tsconfig.base.json:19-26` sets all eight flags required by `AGENTS.md §3.1`: `strict`,
  `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
  `useUnknownInCatchVariables`, `noFallthroughCasesInSwitch`, `noImplicitReturns`, `noPropertyAccessFromIndexSignature`.
- Four further flags go beyond that mandate because dead code hides unfinished work:
  `noUnusedLocals`, `noUnusedParameters`, `allowUnreachableCode: false`, `allowUnusedLabels: false`
  (`:28-32`). Module settings are ES2023 / ESNext / bundler with `isolatedModules`,
  `verbatimModuleSyntax` and `noEmit` (`:6-15`). Every package tsconfig extends this file; relaxing a
  flag downstream is a release-blocking defect (`:3`).

### `apps/web` — pre-rendered Astro, no adapter

`astro@7.1.4` with `@astrojs/check@0.9.10`; `typecheck` is `astro check` (`apps/web/package.json:9-17`).

- **No Cloudflare adapter is configured.** The site is fully pre-rendered; `apps/edge`, one Worker,
  serves that output via `ASSETS` and owns `/api/*`, `/auth/*`, `/webhooks/*` and authenticated
  behaviour (`astro.config.mjs:6-10`; `wrangler.jsonc:67-73`). An adapter would add a second server
  to deploy with no dynamic route left to serve.
- `trailingSlash: 'always'` with `build.format: 'directory'` (`astro.config.mjs:22-24`), matched by
  `html_handling: "auto-trailing-slash"` (`wrangler.jsonc:70`) — one canonical URL form, as §19 needs.
- `build.inlineStylesheets: 'never'` (`astro.config.mjs:43`). The default `'auto'` inlines
  stylesheets under roughly 4 kB, so whether an inline `<style>` exists depends on that day's CSS
  size, and an inline `<style>` forces `style-src 'unsafe-inline'`. `'never'` makes the output
  deterministic, which is what lets `apps/web/public/_headers` and `apps/edge/src/index.ts` drop
  `'unsafe-inline'` (`:26-42`). **Standing rule:** returning it to `'auto'` means restoring
  `'unsafe-inline'` in both policy files, and `scripts/validate-security-headers.mjs` cannot see it.
- `site` comes from `PUBLIC_SITE_URL` and is left undefined when absent, so no example or invented
  domain leaks into a canonical URL (`:12-20`); the deploy workflow supplies it then asserts the built
  homepage carries a canonical (`deploy.yml:141-159`).

### `apps/edge` — Hono on Wrangler

`hono@4.12.32`, `wrangler@4.114.0` (`apps/edge/package.json:15-21`). Every key in `wrangler.jsonc`
was checked against the schema shipped by the installed Wrangler, `node_modules/wrangler/config-schema.json`,
referenced as the config's `$schema` (`:1-5`).

- `compatibility_date: "2026-07-27"` — the actual execution date of the build that set it, never a
  value copied from a document (`:39-41`).
- `compatibility_flags: ["nodejs_compat"]` for `node:crypto`, `node:buffer`, `AsyncLocalStorage`
  (`:43-47`). No arbitrary Node API is licensed: `AGENTS.md §3.1` still applies, enforced in `eslint.config.js`.
- `workers_dev: false`, `preview_urls: false` (`:32-33`). Both default true; left alone, every deploy
  would publish further public, crawlable copies of the same pages at unintended origins (`:10-23`).
- Routes `delaypilot.app` and `www.delaypilot.app` as Workers Custom Domains, served proxied (`:34-37`).
- Assets: `directory: "../web/dist"`, `binding: "ASSETS"`, `run_worker_first` limited to `/api/*`,
  `/auth/*`, `/webhooks/*`, `/go/*`, `not_found_handling: "none"` until a 404 page exists (`:55-73`).

### Toolchain gates

ESLint 10.8.0 with `typescript-eslint` 8.65.0, `@eslint/js` 10.0.1, `eslint-plugin-astro` 3.0.1,
`eslint-config-prettier` 10.1.8; Prettier 3.9.6 with `prettier-plugin-astro` 0.14.1; Vitest 4.1.10 (`package.json:36-49`).

`.github/workflows/ci.yml` is **a subset of the eighteen checks in DIRECTIVE §23, not full CI**, as
its own header says (`:1-8`). Present: checks 1 (frozen-lockfile install), 2 (format), 3 (lint), 4
(typecheck), 8 (web build), 9 (edge build) (`:10-16`). Checks 5, 6, 7 and 10–18 are absent with the
phase that adds each (`:18-33`); their scripts exit 1 on purpose rather than report a false green
(`package.json:19-33`), and there is no deploy job (`:43-48`). Four repo-local gates run alongside
and substitute for none of the eighteen: `validate-build-system.mjs`, `validate-security-headers.mjs`,
`validate-contrast.mjs`, `compress-images.mjs --check` (`:120-138`).

### Hosting reality on 2026-09-11 (reported, not verified live)

`.github/workflows/deploy.yml:3-8` records that an external pre-launch audit found `delaypilot.app`
served by a Vercel deployment unrelated to this repository, while the Worker this repository builds
had never been deployed. The repository owner's visual-overhaul audit of 2026-09-11 adds that the
Vercel project builds from `main` with its project root set to `apps/web`. The repository holds no
Vercel configuration recording that root: the only Vercel file is the root `vercel.json`, and there
is no `apps/web/vercel.json`. If that root is accurate, only files under `apps/web/` reach production
today — `apps/web/public/**` ships, while root-level `vercel.json`, `_headers` and any root-level
`sitemap.xml` or `public/sitemap.xml` are inert there (the latter two existed while this ADR was
drafted and were being removed by a concurrent change). The target is the Worker via `deploy.yml`,
unarmed: without `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` the job skips with a notice
rather than failing, a missing credential being a pending setup task and not a broken pipeline
(`:10-23`, `:68-87`). The first successful run performs the DNS cutover and is not reversible by
`git revert`, which restores the file and not the records (`:28-34`; `wrangler.jsonc:25-30`).

## Alternatives considered

**The Cloudflare Astro adapter.** Rejected: a second server to build, deploy and keep in version
lockstep, with no dynamic route to serve — `apps/edge` owns every one (`astro.config.mjs:6-10`).

**Ship the Next.js application in `design/v0-preview`.** Rejected on the grounds in
`design/v0-preview/README.md:26-36`: no `ASSETS` binding, D1, KV, Queues or Workflows, which the
monitoring lifecycle and rights versioning depend on; public pages must ship near-zero JavaScript for
the §22 targets; and its mock flight numbers, gates, causes and probabilities are generated fiction
(`AGENTS.md §1.1`). It stays a reference, outside lint, typecheck and the workspace (`:1-8`).

**A Tailwind build step for the token layer.** Not adopted at Phase 1: tokens were lifted from the v0
Tailwind v4 source as plain custom properties so no build step enters a near-zero-JS surface
(`apps/web/src/styles/tokens.css:1-7`).

## Consequences

**Positive.** The CSP can omit `'unsafe-inline'` because the stylesheet output is deterministic. One
build artifact, one deploy, one canonical URL form. A missing `PUBLIC_SITE_URL` yields no canonical
rather than a wrong one, and no invented resource id sits in `wrangler.jsonc`, so deploy fails closed.

**Negative.** Every page pays one extra request for an external stylesheet; exact pins make upgrades
explicit work; a reader who misses the CI header could mistake a green run for full §23 coverage; and
production is not yet served by what this repository builds.

**Defect found while writing this ADR.** `.github/workflows/ci.yml:5` says the workflow runs "two
repo-local gates"; four run (`:120-138`). Owner: `platform-release-sre`; filed as a handoff.

## Compliance

- `pnpm install --frozen-lockfile` — the pins above are what the lockfile resolves.
- `pnpm typecheck`, `pnpm lint`, `pnpm format:check` — the strict-flag contract, ESLint and Prettier versions above.
- `pnpm build` — `astro build`, then `wrangler deploy --dry-run --outdir dist` (`package.json:24`).
- `node scripts/validate-build-system.mjs` — charter structure, ownership collisions, overclaim lint.
