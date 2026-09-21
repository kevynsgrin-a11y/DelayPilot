#!/usr/bin/env node
/**
 * site-url-guard — the `DIRECTIVE.md §19` production build guard on `PUBLIC_SITE_URL`.
 *
 * Owner: seo-engineer (docs/agents/ROSTER.md §3, `scripts/seo/**`).
 *
 * WHAT IT DOES. Exits non-zero, with a named error, when a PRODUCTION build has no usable public
 * origin: missing, empty, not https, carrying a path/query/fragment/credentials, or still holding
 * an example value such as the `https://example.invalid` shipped in `.env.example`. A local build,
 * a pull-request check and a preview deployment exit zero and say what was omitted and why.
 *
 * WHY IT IS A SEPARATE SCRIPT RATHER THAN A LINE IN `astro.config.mjs`. Two reasons, and the
 * second is the one that matters. `astro.config.mjs` belongs to `frontend-ui-engineer`
 * (`ROSTER.md §3`), so this owner cannot write it. And Vite exposes only prefixed variables to
 * anything inside the app, so `VERCEL_ENV` — the only signal that separates a production
 * deployment from a preview of the same commit — is not visible there at all. The decision has to
 * be made in a plain Node process that can read the whole environment, which is this one.
 *
 * HOW IT REACHES THE BUILD. One line in the build script, handed off to the owner of the file that
 * holds it (`docs/SEO.md §10`). Until that lands, run it directly:
 *
 *   node scripts/seo/site-url-guard.mjs              # reports; fails only if this is production
 *   node scripts/seo/site-url-guard.mjs --production # forces the production rule, for CI
 *
 * The rule itself lives in `apps/web/src/lib/seo/site-url.mjs` and is not restated here: the
 * layout, the scripts and the tests must all get the same answer (`AGENTS.md §3.2`).
 */

import process from 'node:process'

import {
  PRODUCTION_SWITCH_VAR,
  SiteUrlConfigError,
  readProductionSwitch,
  resolveSiteUrl,
} from '../../apps/web/src/lib/seo/site-url.mjs'

const forced = process.argv.includes('--production')
const env = forced ? { ...process.env, SEO_REQUIRE_SITE_URL: '1' } : process.env

/**
 * Which signal decided this is (or is not) a production build, for the log line.
 *
 * It asks `readProductionSwitch` rather than re-reading the variable itself, so the line names the
 * signal that actually decided: a blank `SEO_REQUIRE_SITE_URL` decides nothing and must not be
 * reported as though it did. That function throws on a value outside its vocabulary, but this
 * runs only after `resolveSiteUrl` has already read the same switch, so by here it is valid.
 */
function signal() {
  if (forced) return '--production'
  if (readProductionSwitch(process.env) !== undefined)
    return `${PRODUCTION_SWITCH_VAR}=${process.env[PRODUCTION_SWITCH_VAR]}`
  if (process.env['VERCEL_ENV'] !== undefined && process.env['VERCEL_ENV'] !== '')
    return `VERCEL_ENV=${process.env['VERCEL_ENV']}`
  const branch = process.env['CF_PAGES_BRANCH'] ?? process.env['WORKERS_CI_BRANCH']
  if (branch !== undefined && branch !== '') return `Cloudflare branch ${branch}`
  return 'no production signal in the environment'
}

try {
  const resolved = resolveSiteUrl({ env, mode: 'build' })
  if (resolved.origin === undefined) {
    console.log(
      `site-url-guard: no PUBLIC_SITE_URL. ${signal()}, so this is not a production build and it ` +
        `continues.\n  Every absolute tag — canonical, og:url, og:image, twitter:image — is ` +
        `OMITTED rather than stamped against a guessed host (AGENTS.md §1.1). Set PUBLIC_SITE_URL ` +
        `to see them: docs/SEO.md §10.`,
    )
  } else {
    console.log(
      `site-url-guard: PUBLIC_SITE_URL = ${resolved.origin} (${signal()}). Canonical, og:url and ` +
        `the absolute image tags are emitted from this origin.`,
    )
  }
} catch (error) {
  if (error instanceof SiteUrlConfigError) {
    console.error(`\n${error.name} [${error.code}]\n\n${error.message}\n`)
    process.exit(1)
  }
  throw error
}
