/**
 * `/ga4.js` — the Google Analytics 4 bootstrap, served as an EXTERNAL same-origin file.
 *
 * The gtag.js loader (`https://www.googletagmanager.com/gtag/js?id=…`) only processes what is
 * pushed onto `window.dataLayer`; something on the page has to define `gtag()` and push the `js`
 * and `config` commands. Google's snippet does that with an inline `<script>`, which the served
 * `script-src` (no 'unsafe-inline', no hash sources — `apps/web/public/_headers`) refuses, so the
 * loader arrived and GA4 recorded nothing. This endpoint is the same pattern as `/theme-init.js`:
 * same-origin and external, so `script-src 'self'` admits it with no hash and no 'unsafe-inline'.
 *
 * The measurement ID is this site's own GA4 property. It is delivered in-page on purpose: GA4
 * tools configured at the Cloudflare edge (Zaraz) were measured to record no sessions, so the
 * in-page tag is the one that counts. BaseLayout loads gtag.js with the SAME ID.
 */

import type { APIRoute } from 'astro'

/** This site's GA4 measurement ID. BaseLayout's loader URL must carry the same value. */
export const GA4_MEASUREMENT_ID = 'G-PH0X9DNQ3J'

/**
 * The script source. No build-time interpolation beyond the constant ID, so its bytes are stable
 * from build to build.
 */
const SOURCE = `window.dataLayer = window.dataLayer || [];
function gtag() { window.dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "${GA4_MEASUREMENT_ID}");
`

export const GET: APIRoute = () =>
  new Response(SOURCE, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
    },
  })
