// @ts-check
import { defineConfig } from 'astro/config'

/**
 * DelayPilot public site.
 *
 * The site is fully pre-rendered. `apps/edge` (a single Cloudflare Worker) serves this build output
 * through its `ASSETS` binding and owns every dynamic path — `/api/*`, `/auth/*`, `/webhooks/*` and
 * the authenticated app behaviour. That is why no Cloudflare *adapter* is configured here: there is
 * no second server to deploy. See docs/decisions/0002-foundation-stack-and-versions.md.
 *
 * `site` is read from PUBLIC_SITE_URL and is deliberately left undefined when that variable is
 * absent, so that no example or invented domain can leak into a canonical URL. The production build
 * guard that turns a missing or example PUBLIC_SITE_URL into a hard build failure is owned by
 * seo-engineer (DIRECTIVE.md Phase 11, section 19).
 */
const site = process.env['PUBLIC_SITE_URL']

export default defineConfig({
  ...(site === undefined || site === '' ? {} : { site }),
  outDir: './dist',
  trailingSlash: 'always',
  build: {
    format: 'directory',

    /**
     * Never inline a stylesheet into the HTML.
     *
     * Astro's default is 'auto', which inlines any stylesheet under ~4kB. That is a performance
     * win in isolation, but it makes the presence of an inline <style> depend on how large the CSS
     * happens to be on a given day — and an inline <style> requires `style-src 'unsafe-inline'` in
     * the Content-Security-Policy shipped by apps/web/public/_headers and apps/edge/src/index.ts.
     *
     * Pinning this to 'never' makes the output deterministic, which is what lets that CSP drop
     * 'unsafe-inline' entirely rather than carry it defensively against a future small stylesheet.
     * Trading one cached external request for a strictly stronger script/style policy is the right
     * side of that trade for a site whose whole value proposition is being trustworthy.
     *
     * If this is ever set back to 'auto', the CSP in BOTH policy files must regain 'unsafe-inline'
     * or every page will render unstyled. scripts/validate-security-headers.mjs keeps the two
     * policies in step with each other, but it cannot know about this setting.
     */
    inlineStylesheets: 'never',
  },
})
