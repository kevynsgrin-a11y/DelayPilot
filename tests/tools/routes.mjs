/**
 * The route inventory every browser suite sweeps.
 *
 * Owner: qa-test-architect.
 *
 * DERIVED FROM THE BUILD, NEVER TYPED BY HAND. `DIRECTIVE.md §18.1` lists more public routes than
 * this tree emits — `/pricing/`, `/status/`, the `airlines` / `airports` / `routes` families and
 * every `§18.2` private route wait for their phases (`docs/BUILD_PLAN.md §10`). A hand-written list
 * would do one of two wrong things: name a route that does not exist and fail for the wrong reason,
 * or silently stop covering a route somebody adds. Walking `dist` for `*.html` does neither: a new
 * route joins every sweep on the build that emits it, and `docs/TESTING.md` records the count each
 * suite actually measured so a drop is visible.
 *
 * `/404.html` is included deliberately. It is a served surface a reader reaches on a bad day, and
 * `DIRECTIVE.md §17` lists `error boundary` among the states that must be implemented and tested.
 */
import { readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { DEFAULT_DIST } from './serve-dist.mjs'

/**
 * Every emitted HTML file under `dist`, as a request path.
 *
 * @param {string} [dist]
 * @returns {string[]} e.g. `['/', '/404.html', '/about/', …]`, sorted
 */
export function emittedRoutes(dist = DEFAULT_DIST) {
  const root = resolve(dist)
  /** @param {string} dir @returns {string[]} */
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = join(dir, entry.name)
      if (entry.isDirectory()) return walk(full)
      return entry.name.endsWith('.html') ? [full] : []
    })

  return walk(root)
    .map((file) => file.slice(root.length).replace(/index\.html$/, ''))
    .map((path) => (path === '' ? '/' : path))
    .sort()
}

/**
 * The two routes emitted only when `PUBLIC_CONTACT_EMAIL` is set (owner input I-3,
 * `docs/BUILD_PLAN.md §10`). They are not in the normal build, so they are swept from a scratch
 * build with a scratch address — see `tests/a11y/conditional-build.mjs`.
 */
export const CONDITIONAL_ROUTES = ['/accessibility/', '/contact/']

/**
 * The routes whose rendered state is worth a committed visual baseline.
 *
 * One route per `§17` state family that this tree can actually reach, chosen so the eight shots a
 * state costs buy a state nothing else covers. `docs/TESTING.md` maps each entry to the states it
 * carries; a route not listed here is still swept by axe, the CSP pass and the keyboard walk.
 *
 * @type {{ name: string, path: string, states: string }[]}
 */
export const VISUAL_ROUTES = [
  {
    name: 'home',
    path: '/',
    states:
      'demo · stale · provider unavailable · partial data · conflicting providers · heuristic risk band · connection protected · rights cause unknown · billing not configured · skeleton',
  },
  {
    name: 'flight-status',
    path: '/flight-status/',
    states: 'searching · no match · invalid flight · multiple matches · rate limited · empty',
  },
  {
    name: 'connection-risk',
    path: '/connection-risk/',
    states: 'connection protected · self-transfer · unknown topology · insufficient data',
  },
  { name: 'delay-risk', path: '/delay-risk/', states: 'heuristic risk band · unknown' },
  {
    name: 'passenger-rights',
    path: '/passenger-rights/',
    states: 'rights covered · cause unknown · future rule · prose table region',
  },
  { name: 'not-found', path: '/404.html', states: 'error boundary' },
]
