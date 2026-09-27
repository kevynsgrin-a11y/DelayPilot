/**
 * The GA4 loader, answered locally in every browser-driven check.
 *
 * Every page carries Google's gtag.js loader for this site's own GA4 property (BaseLayout; the
 * same-origin bootstrap is `apps/web/src/pages/ga4.js.ts`). Letting a test browser fetch the real
 * loader would send page views from CI into the production property and make every run depend on a
 * third-party network. Answering it with an empty script keeps runs deterministic and offline, and
 * because request interception happens AFTER the browser has applied the served CSP, a policy that
 * refused the loader still surfaces as a CSP violation.
 */

/** The exact loader URL BaseLayout emits. A second tag or a different ID is not stubbed. */
export const GA4_LOADER_URL = 'https://www.googletagmanager.com/gtag/js?id=G-PH0X9DNQ3J'

/**
 * Answer the GA4 loader with an empty script on a page or a browser context.
 *
 * @param {import('@playwright/test').Page | import('@playwright/test').BrowserContext} target
 */
export async function stubAnalytics(target) {
  await target.route(
    (url) => url.href === GA4_LOADER_URL,
    (route) => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
  )
}
