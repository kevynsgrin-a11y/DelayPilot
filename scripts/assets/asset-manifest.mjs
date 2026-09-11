/**
 * The shipped brand-asset manifest: every file, its intrinsic dimensions, MIME type, PWA
 * `purpose`, and its byte budget.
 *
 * Owner: visual-asset-director (docs/agents/ROSTER.md §3, `scripts/assets/**`).
 *
 * This file is the published contract. `build-assets.mjs` writes exactly these paths,
 * `verify-assets.mjs` asserts every row (presence, dimensions, format, byte budget), and
 * `seo-engineer` / `frontend-ui-engineer` read it when wiring `<link rel="icon">`, the web app
 * manifest and the Open Graph metadata. A budget that lives in three places is a budget that is
 * wrong in two of them, so it lives here.
 *
 * WHERE THE BUDGETS COME FROM
 * The SVG, icon and Open Graph figures are the visual-asset-director charter's budget table,
 * unchanged. The two figures the charter does not fix are set here and justified in place: the
 * decorative motifs (`brand/motifs/**`), which the charter covers only as "original inline SVG or
 * pure CSS", and which are loaded on public marketing routes under ADR 0003 rule 2b. They are
 * counted against the marketing route's CSS+markup allowance, not the image allowance, because
 * they are inlined.
 *
 * `bytes` is a hard ceiling: exceeding it fails `verify-assets`, which fails the build. A budget
 * that only warns is a budget that gets ignored.
 */

const KB = 1024

/**
 * @typedef {object} AssetRecord
 * @property {string} path        Repository-relative path.
 * @property {string} url         Path as served from the site root.
 * @property {'svg'|'png'|'webp'|'ico'} kind
 * @property {string} mime
 * @property {number|null} width  Intrinsic width in px (null for scalable-only SVG).
 * @property {number|null} height Intrinsic height in px.
 * @property {number[]} [sizes]   ICO member sizes.
 * @property {'any'|'maskable'|null} purpose  Web app manifest `purpose`, where applicable.
 * @property {number} bytes       Hard byte ceiling.
 * @property {string} note
 */

/** @type {AssetRecord[]} */
export const ASSETS = [
  {
    path: 'apps/web/public/brand/mark.svg',
    url: '/brand/mark.svg',
    kind: 'svg',
    mime: 'image/svg+xml',
    width: 24,
    height: 24,
    purpose: null,
    bytes: 6 * KB,
    note: 'Master geometry. The only hand-authored artwork in the brand set. Inline it, do not <img> it: inside an <img> there is no inherited `color` and no page custom properties, so the strokes fall back to the UA default (black) and vanish on a dark surface, while the advance dot falls back to #087fbd, which is measured safe everywhere.',
  },
  {
    path: 'apps/web/public/brand/mark-mono.svg',
    url: '/brand/mark-mono.svg',
    kind: 'svg',
    mime: 'image/svg+xml',
    width: 24,
    height: 24,
    purpose: null,
    bytes: 6 * KB,
    note: 'Single-colour currentColor variant for print, email, watermark and the evidence packet. Inline only: in an <img> there is no inherited `color`, so currentColor falls back to the UA default (black) and the mark disappears on a dark surface.',
  },
  {
    path: 'apps/web/public/brand/logotype.svg',
    url: '/brand/logotype.svg',
    kind: 'svg',
    mime: 'image/svg+xml',
    width: 98.68,
    height: 24,
    purpose: null,
    bytes: 10 * KB,
    note: 'Mark plus the "DelayPilot" wordmark as outlines. Header and footer lockup. Inline only, for the same currentColor reason as mark.svg.',
  },
  {
    path: 'apps/web/public/brand/logotype-mono.svg',
    url: '/brand/logotype-mono.svg',
    kind: 'svg',
    mime: 'image/svg+xml',
    width: 98.68,
    height: 24,
    purpose: null,
    bytes: 10 * KB,
    note: 'Single-colour lockup for print and the evidence packet. Inline only, for the same currentColor reason as mark.svg.',
  },
  {
    path: 'apps/web/public/icons/favicon.svg',
    url: '/icons/favicon.svg',
    kind: 'svg',
    mime: 'image/svg+xml',
    width: 24,
    height: 24,
    purpose: null,
    bytes: 4 * KB,
    note: 'Legible reduction: radar arc dropped, route line and advance dot enlarged on an opaque ink plate. <link rel="icon" type="image/svg+xml">.',
  },
  {
    path: 'apps/web/public/icons/favicon.ico',
    url: '/favicon.ico',
    kind: 'ico',
    mime: 'image/x-icon',
    width: 48,
    height: 48,
    sizes: [16, 32, 48],
    purpose: null,
    bytes: 16 * KB,
    note: 'PNG-in-ICO, three members. Must also be served from the site root for legacy user agents.',
  },
  {
    path: 'apps/web/public/icons/icon-192.png',
    url: '/icons/icon-192.png',
    kind: 'png',
    mime: 'image/png',
    width: 192,
    height: 192,
    purpose: 'any',
    bytes: 8 * KB,
    note: 'Web app manifest, purpose "any". Rounded ink plate, normal padding.',
  },
  {
    path: 'apps/web/public/icons/icon-512.png',
    url: '/icons/icon-512.png',
    kind: 'png',
    mime: 'image/png',
    width: 512,
    height: 512,
    purpose: 'any',
    bytes: 24 * KB,
    note: 'Web app manifest, purpose "any". Also the install and splash source.',
  },
  {
    path: 'apps/web/public/icons/icon-192-maskable.png',
    url: '/icons/icon-192-maskable.png',
    kind: 'png',
    mime: 'image/png',
    width: 192,
    height: 192,
    purpose: 'maskable',
    bytes: 8 * KB,
    note: 'Background bleeds to all four edges; all meaning inside the centred 80%-diameter safe circle. Declare purpose "maskable" separately, never "any maskable".',
  },
  {
    path: 'apps/web/public/icons/icon-512-maskable.png',
    url: '/icons/icon-512-maskable.png',
    kind: 'png',
    mime: 'image/png',
    width: 512,
    height: 512,
    purpose: 'maskable',
    bytes: 24 * KB,
    note: 'As above at 512. Opaque, no transparency, no baked corner radius, no drop shadow.',
  },
  {
    path: 'apps/web/public/icons/apple-touch-icon-180.png',
    url: '/icons/apple-touch-icon-180.png',
    kind: 'png',
    mime: 'image/png',
    width: 180,
    height: 180,
    purpose: null,
    bytes: 16 * KB,
    note: 'Opaque, square, no alpha channel, no self-applied corner radius: iOS applies its own mask. <link rel="apple-touch-icon">.',
  },
  {
    path: 'apps/web/public/og/default-1200x630.png',
    url: '/og/default-1200x630.png',
    kind: 'png',
    mime: 'image/png',
    width: 1200,
    height: 630,
    purpose: null,
    bytes: 120 * KB,
    note: 'Brand-mark composition: mark, wordmark, promise line. No flight number, gate, time, statistic, screenshot or itinerary detail of any kind (AGENTS.md §1.1, §2).',
  },
  {
    path: 'apps/web/public/og/default-1200x630.webp',
    url: '/og/default-1200x630.webp',
    kind: 'webp',
    mime: 'image/webp',
    width: 1200,
    height: 630,
    purpose: null,
    bytes: 60 * KB,
    note: 'WebP sibling. Several crawlers still only fetch the PNG, so og:image points at the PNG and this is the <picture>/AVIF-class alternative for on-page use.',
  },
  {
    path: 'apps/web/public/brand/motifs/radar-arc.svg',
    url: '/brand/motifs/radar-arc.svg',
    kind: 'svg',
    mime: 'image/svg+xml',
    width: 240,
    height: 240,
    purpose: null,
    bytes: 4 * KB,
    note: 'Decorative concentric sweep. Inline only: CSS rotates #sweep. aria-hidden. Documented in scripts/assets/MOTIFS.md.',
  },
  {
    path: 'apps/web/public/brand/motifs/route-arcs.svg',
    url: '/brand/motifs/route-arcs.svg',
    kind: 'svg',
    mime: 'image/svg+xml',
    width: 480,
    height: 240,
    purpose: null,
    bytes: 4 * KB,
    note: 'Decorative. #route-1|2|3 are CSS offset-path sources for .packet travel. aria-hidden. Documented in scripts/assets/MOTIFS.md.',
  },
  {
    path: 'apps/web/public/brand/motifs/grid.svg',
    url: '/brand/motifs/grid.svg',
    kind: 'svg',
    mime: 'image/svg+xml',
    width: 240,
    height: 240,
    purpose: null,
    bytes: 4 * KB,
    note: 'Decorative operations-desk grid, tileable via <pattern>. aria-hidden. Documented in scripts/assets/MOTIFS.md.',
  },
  {
    path: 'apps/web/public/brand/motifs/route-globe.svg',
    url: '/brand/motifs/route-globe.svg',
    kind: 'svg',
    mime: 'image/svg+xml',
    width: 480,
    height: 480,
    purpose: null,
    bytes: 32 * KB,
    /*
     * 32 KB is the one budget not fixed by the charter table. It is set from what a 10° graticule
     * costs: ADR 0003 rule 6 adopts a build-time SVG orthographic globe, and the dispatch fixes the
     * graticule at 10°, which is 36 meridians and 17 parallels before back-hemisphere culling.
     * Rendered as 1-decimal polylines on a 480-unit canvas that measures in the low twenties of KB
     * and compresses to a few KB over the wire. It is inlined on one marketing route, counted
     * against that route's markup allowance, never render-blocking, and never on the cockpit path.
     */
    note: 'Generated by build-globe.mjs. Wireframe only: no coastlines, no borders, no codes, no labels. Caption in page copy must read "Illustrative route lines — not live traffic." (ADR 0003 rule 6). Documented in scripts/assets/MOTIFS.md.',
  },
]

/** Look a row up by repository-relative path. */
export function assetByPath(path) {
  const record = ASSETS.find((asset) => asset.path === path)
  if (!record) throw new Error(`no manifest record for ${path}`)
  return record
}

/** The subset a web app manifest `icons` array should carry. */
export const MANIFEST_ICONS = ASSETS.filter((asset) => asset.purpose !== null)
