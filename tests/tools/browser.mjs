/**
 * Chromium for the standalone (non-Playwright-runner) harnesses.
 *
 * Owner: qa-test-architect.
 *
 * `tests/a11y/run-axe.mjs` is a plain `node` script, not a Playwright test file, so it drives the
 * browser through the `playwright` library directly. The browser binary is PRE-INSTALLED at
 * `/opt/pw-browsers` and `@playwright/test@1.56.1` is pinned to match it; `playwright install`
 * must never be run here — it would download a second copy or a mismatched revision.
 *
 * `--no-sandbox` is passed because this environment runs as root inside a container, where
 * Chromium's own sandbox cannot start. That is a property of the runner, not of the product.
 */
import { chromium } from '@playwright/test'

/** @returns {Promise<import('@playwright/test').Browser>} */
export function launchChromium() {
  if (process.env['PLAYWRIGHT_BROWSERS_PATH'] === undefined) {
    console.warn(
      'PLAYWRIGHT_BROWSERS_PATH is unset; Playwright will look in its default cache. If the launch ' +
        'fails, set it to the directory holding the pre-installed browsers rather than running ' +
        '`playwright install`.',
    )
  }
  return chromium.launch({ args: ['--no-sandbox'] })
}

/**
 * The four combinations `docs/ACCESSIBILITY.md §12` requires of every route: both themes, both
 * motion preferences. Reduced motion is a state a page can be WRONG in (ADR 0003 rule 4), which is
 * why it is a dimension of the sweep rather than a variant of one theme.
 *
 * @type {{ colorScheme: 'light' | 'dark', reducedMotion: 'no-preference' | 'reduce' }[]}
 */
export const CONTEXT_MATRIX = [
  { colorScheme: 'light', reducedMotion: 'no-preference' },
  { colorScheme: 'light', reducedMotion: 'reduce' },
  { colorScheme: 'dark', reducedMotion: 'no-preference' },
  { colorScheme: 'dark', reducedMotion: 'reduce' },
]
