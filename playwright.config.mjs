/**
 * Playwright configuration — `pnpm test:e2e`.
 *
 * Owner: qa-test-architect (`docs/agents/ROSTER.md §3`, `playwright.config.*`).
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * WHY `.mjs` AND NOT `.ts`
 *
 * A root-level `.ts` file breaks `pnpm lint`. `eslint.config.js` runs typescript-eslint with
 * `projectService: true`, which resolves every `.ts` file against the nearest `tsconfig.json`;
 * there is no `tsconfig.json` at the repository root (only `tsconfig.base.json`, which the service
 * does not consider), so a root `playwright.config.ts` fails to parse with "was not found by the
 * project service". `pnpm typecheck` is `pnpm -r typecheck`, which runs inside workspace packages
 * and never reaches the root either — so a TypeScript file here would be transpiled by Playwright's
 * loader and typechecked by nothing. `.mjs` with JSDoc types is the same safety with none of the
 * breakage. Adding a root `tsconfig.json` is `principal-architect`'s call, and it is filed as a
 * handoff rather than taken here.
 *
 * WHY `testDir` AND `testMatch` ARE BOTH NARROW
 *
 * With no constraint, `playwright test` globs from the repository root and collects the workspace's
 * Vitest `*.test.ts` files. Both runners then load their own `expect`, and the two implementations
 * collide on `Symbol($$jest-matchers-object)` with an opaque failure. The two file sets are kept
 * disjoint BY CONSTRUCTION: Vitest's default glob matches any file named `*.test.*` or `*.spec.*`
 * at any depth, and every file in this suite ends `.e2e.mjs`, which that glob cannot match. Rename
 * a spec to `*.spec.mjs` and `pnpm test` starts trying to run a browser test in Node.
 *
 * WHAT IS AND IS NOT COVERED BY THE BROWSER MATRIX
 *
 * Chromium 141.0.7390.37 is pre-installed at `/opt/pw-browsers`; `@playwright/test@1.56.1` is
 * pinned to match it. WebKit and Firefox are NOT installed and `playwright install` must not be run
 * here. The `DIRECTIVE.md §22` requirement of WebKit and Mobile Safari is therefore **Not run** in
 * this environment, not "passing on an emulation of it": the 375 px project below is Chromium with
 * a mobile viewport, which tests layout and touch-target geometry and proves nothing about WebKit's
 * rendering or its `<dialog>` behaviour. `docs/TESTING.md` records this as an open gap rather than
 * letting a green run imply coverage nobody has.
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 */
import { defineConfig, devices } from '@playwright/test'
import { DEFAULT_DIST } from './tests/tools/serve-dist.mjs'

/** In the 4500–4599 band the QA harnesses reserve, clear of perf and SEO measurement. */
export const E2E_PORT = 4530
export const BASE_URL = `http://127.0.0.1:${E2E_PORT}`

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.mjs',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  outputDir: './test-results/e2e',

  /*
   * NO RETRIES, ANYWHERE. A retry converts a real race into an intermittent green, and the agent
   * whose code contains the race never finds out. A flaky spec here is triaged to its owner with
   * input · expected · observed, and `waitForTimeout` is not a fix either.
   */
  retries: 0,
  forbidOnly: true,
  fullyParallel: true,
  workers: process.env['CI'] === undefined ? undefined : 2,
  timeout: 45_000,
  expect: { timeout: 10_000 },

  reporter: process.env['CI'] === undefined ? [['list']] : [['list'], ['github']],

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    /* Root in a container: Chromium's own sandbox cannot start. A property of the runner. */
    launchOptions: { args: ['--no-sandbox'] },
  },

  /*
   * The served build, with the real `_headers` policy replayed on every response. `astro preview`
   * would serve the same bytes with NO Content-Security-Policy, and a CSP suite measured without a
   * CSP is the kind of green this repository exists to refuse.
   */
  webServer: {
    command: `node tests/tools/serve-dist.mjs ${E2E_PORT} ${DEFAULT_DIST}`,
    url: `${BASE_URL}/`,
    /*
     * Never reuse. A leftover server from an earlier run may be serving a DIFFERENT build, and a
     * suite that silently measured the wrong `dist` is worse than one that refuses to start.
     */
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  projects: [
    {
      name: 'desktop',
      testIgnore: '**/visual.e2e.mjs',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-375',
      testIgnore: '**/visual.e2e.mjs',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'visual',
      testMatch: '**/visual.e2e.mjs',
      use: {
        ...devices['Desktop Chrome'],
        /* Viewport and theme are set per test; the project only fixes the rendering surface. */
        deviceScaleFactor: 1,
      },
    },
  ],
})
