// @ts-check
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import { asciiPunctuation } from './src/lib/markdown/ascii-punctuation.mjs'
import { proseTables } from './src/lib/markdown/prose-tables.mjs'

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
 *
 * ---------------------------------------------------------------------------------------------
 * WHY THERE IS NO `client:*` DIRECTIVE ANYWHERE IN THIS APP, AND NO `security.csp` BLOCK.
 *
 * apps/web/public/_headers serves `script-src 'self'; style-src 'self'` with NO 'unsafe-inline'.
 * Astro injects, for every hydrated island, one inline <style> (ISLAND_STYLES) and two inline
 * <script> elements — the directive script and the island runtime (see `getPrescripts` in
 * astro/dist/runtime/server/scripts.js). Under that policy all three are refused, so a hydrated
 * island would render unstyled and dead unless the SERVED header gained a matching sha256
 * allowlist. A <meta http-equiv> policy emitted by Astro's `security.csp` cannot rescue that:
 * multiple policies are enforced as an intersection, so the header's hash-free `script-src 'self'`
 * still blocks the inline script whatever the meta says.
 *
 * `_headers` belongs to seo-engineer and cannot change in this wave, and merging to `main` is a
 * production deploy. So this app ships ZERO hydrated islands: React is used for server rendering
 * only, and every interaction is an Astro <script> module, which Vite emits as an external
 * same-origin file that `script-src 'self'` already allows. `apps/web/scripts/verify-dist.mjs`
 * asserts that property on every built page, so a future `client:*` directive fails the build
 * rather than the deployment.
 * ---------------------------------------------------------------------------------------------
 */
const site = process.env['PUBLIC_SITE_URL']

export default defineConfig({
  ...(site === undefined || site === '' ? {} : { site }),
  outDir: './dist',
  trailingSlash: 'always',

  /**
   * React renders `packages/ui` primitives and `packages/ui/src/patterns` on the server. No
   * `client:*` directive is used (see above), so `@astrojs/react` contributes no client runtime
   * and no inline bootstrap to any page.
   *
   * TWO MARKDOWN CORRECTIONS SIT BESIDE IT, BOTH AS INTEGRATIONS.
   *
   * Astro 7's default Markdown processor is Sätteri, and its extension points are the processor's
   * own `options` bag rather than `markdown.rehypePlugins` (which now throws unless
   * `@astrojs/markdown-remark` is installed) or `markdown.smartypants` (deprecated, and it warns on
   * every build and every `astro check`). Both files below mutate `config.markdown.processor.options`
   * in `astro:config:setup`, which is what the processor's own source says that bag is for, and both
   * FAIL CLOSED if that shape ever changes.
   *
   * · `asciiPunctuation` — `DIRECTIVE.md §26` fixed text keeps its ASCII apostrophes through a
   *   Markdown body (copy review F-3, trust sweep F1). Smart punctuation was rewriting the rights
   *   disclaimer's "regulator's" to U+2019 on two served routes and would have reached all twenty
   *   content entries as they published.
   * · `proseTables` — every Markdown table gets the scroll container, the `scope` attributes and
   *   the row-header column a `DataTable` has (`docs/ACCESSIBILITY.md` F31).
   *
   * The reasoning for each, and what each deliberately does not do, is in its own docblock.
   * `apps/web/scripts/verify-dist.mjs` holds both results at the pixel.
   */
  integrations: [react(), asciiPunctuation(), proseTables()],

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

  vite: {
    build: {
      /**
       * Never inline anything into the HTML.
       *
       * Astro inlines a bundled `<script>` chunk when it has no imports and is smaller than Vite's
       * `assetsInlineLimit` (default 4096 bytes) — see `shouldInlineScriptChunk` in
       * astro/dist/core/build/plugins/plugin-scripts.js. Every script in this app is smaller than
       * that, so with the default the theme control and the navigation shipped as INLINE
       * `<script type="module">` elements, which `script-src 'self'` refuses: the menus would not
       * open and the theme control would not work on the deployed site.
       *
       * Zero also stops Vite emitting a small asset as a `data:` URI, which is what lets
       * seo-engineer drop `img-src data:` from the CSP once the placeholder favicon link is gone.
       *
       * This is the script-side companion to `build.inlineStylesheets: 'never'` above. Raising it
       * re-breaks both, silently, on whichever script happens to be small that day.
       */
      assetsInlineLimit: 0,
    },
  },

  /*
   * WHY `packages/ui/src/patterns` IS IMPORTED BY RELATIVE PATH, NOT BY AN ALIAS.
   *
   * The patterns are frontend-ui-engineer's half of @delaypilot/ui (docs/agents/ROSTER.md §3), and
   * the package's `exports` map — brand-design-director's file — does not list them. A Vite alias
   * plus a tsconfig `paths` entry would cover Astro and `astro check`, but NOT the repository test
   * runner: `pnpm test` is a bare `vitest run` from the root with no config file, so it resolves
   * nothing this file declares, and every test that touched the demo fixture failed to resolve.
   *
   * A relative specifier is resolved identically by Astro, Vite, tsc and Vitest with zero
   * configuration in any of them. It is less pretty and it is correct in one more place than the
   * alias was, which is the trade that matters. When the exports map gains a `./patterns` entry,
   * these become bare specifiers again in one pass.
   */
})
