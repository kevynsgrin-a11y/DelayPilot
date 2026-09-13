/**
 * ascii-punctuation — a fixed sentence stays byte-exact through a Markdown body.
 *
 * Owner: `frontend-ui-engineer`. Registered as an Astro integration in `apps/web/astro.config.mjs`.
 *
 * FINDING: copy review F-3 / trust sweep F1. `DIRECTIVE.md §26` writes the rights disclaimer with an
 * ASCII apostrophe — "the airline or regulator's determination" — and `docs/VOICE.md §11` fixes
 * ASCII as this product's typography rule. Astro's Markdown processor applies smart punctuation by
 * default, which rewrote that apostrophe to U+2019 in every Markdown body at build time. Two served
 * routes had already drifted (`/passenger-rights/`, `/guides/saving-receipts-and-evidence/`) and all
 * twenty content entries would have followed as they published.
 *
 * A sentence `copy.test.ts` asserts byte for byte against `DIRECTIVE.md` must not be silently
 * retyped between the source and the pixel. A disclaimer that is nearly the required text is not the
 * required text, and the reader it is written for has no way to tell which one they are looking at.
 *
 * NOTHING IS LOST BY TURNING IT OFF. Smart punctuation's transformations are curly quotes,
 * en/em dashes from `--`/`---`, and ellipses from `...`. `docs/VOICE.md §11` writes apostrophes as
 * ASCII and the em dash as the literal character, so no body ever depended on one.
 *
 * WHY AN INTEGRATION RATHER THAN `markdown: { smartypants: false }`. That option still works and was
 * the first implementation, but Astro 7 deprecates it in favour of the processor's own flag and
 * prints a warning on every build and every `astro check`:
 *
 *     `markdown.smartypants` is deprecated. Move it onto your processor instead (e.g.
 *     `satteri({ features: { gfm: false, smartPunctuation: false } })` …). Will be removed in a
 *     future major.
 *
 * Calling `satteri()` directly would mean adding `@astrojs/markdown-satteri` to
 * `apps/web/package.json`, which is not this pass's change to make. `satteri()` creates its
 * `features` object as a plain mutable bag for exactly this case — its own source says "Default to
 * `{}` so integrations can write `options.features.gfm = false` without an `??=` check" — so the
 * flag is set there, on the supported API, with no new dependency and no deprecation warning.
 *
 * `apps/web/scripts/verify-dist.mjs` holds the result at the pixel: every fixed sentence in
 * `lib/copy/disclaimers.ts` and `results.demo` must appear byte-exact on any page whose text carries
 * its opening words. So if this flag ever stops being honoured, the BUILD fails rather than the
 * disclaimer quietly changing.
 */

/**
 * @returns {import('astro').AstroIntegration}
 */
export function asciiPunctuation() {
  return {
    name: 'delaypilot:ascii-punctuation',
    hooks: {
      'astro:config:setup': ({ config }) => {
        const features = config.markdown?.processor?.options?.features

        if (features === null || typeof features !== 'object') {
          throw new Error(
            'delaypilot:ascii-punctuation could not register: config.markdown.processor.options.' +
              "features is not an object. Astro's Markdown processor has changed shape, and the " +
              'DIRECTIVE.md §26 disclaimers in apps/web/src/content/** would ship with their ASCII ' +
              'apostrophes rewritten to U+2019 (copy review F-3, trust sweep F1). Fix the ' +
              'registration rather than removing the check.',
          )
        }

        features.smartPunctuation = false
      },
    },
  }
}

export default asciiPunctuation
