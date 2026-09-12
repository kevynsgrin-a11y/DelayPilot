/**
 * `/theme-init.js` — the pre-paint theme script, served as an EXTERNAL same-origin file.
 *
 * The problem it solves: `apps/web/src/styles/tokens.css` selects a theme from
 * `prefers-color-scheme`, and an explicit choice is expressed as `data-theme` on `<html>`. A reader
 * who chose the non-system theme would therefore see one frame of the system theme before any
 * JavaScript ran — the "theme flash".
 *
 * The conventional fix is an inline `<script>` in `<head>`. The served policy is
 * `script-src 'self'` with NO 'unsafe-inline' (`apps/web/public/_headers`), so that script would be
 * refused; admitting it would mean adding a `'sha256-…'` source to a header file this session
 * cannot change, and coupling a production deploy to two other owners landing the exact same
 * string. This endpoint is the alternative that needs neither:
 *
 *   · it is a CLASSIC (non-module, non-deferred) script tag in `<head>`, so it blocks parsing and
 *     therefore runs BEFORE first paint — the property the fix actually depends on;
 *   · it is same-origin and external, which `script-src 'self'` already allows, unchanged;
 *   · it is one cached request of well under a kilobyte.
 *
 * It does exactly one thing and touches nothing else: read `dp-theme`, and if it is `light` or
 * `dark`, set the attribute the stylesheet's `[data-theme]` override reads. `system` is the absence
 * of the attribute, so there is nothing to write for it. Any storage failure (private mode, a
 * disabled storage partition) falls through silently to the system preference, which is a correct
 * rendering rather than an error.
 */

import type { APIRoute } from 'astro'

/**
 * The script source. Written as one expression with no build-time interpolation so that its bytes
 * — and therefore its SHA-256, should a future session ever need to inline it — are constant.
 */
const SOURCE = `(function () {
  try {
    var choice = localStorage.getItem('dp-theme')
    if (choice === 'light' || choice === 'dark') {
      document.documentElement.setAttribute('data-theme', choice)
    }
  } catch (error) {
    /* Storage unavailable: the system preference in tokens.css is already the right answer. */
  }
})()
`

export const GET: APIRoute = () =>
  new Response(SOURCE, {
    headers: {
      'Content-Type': 'text/javascript; charset=utf-8',
    },
  })
