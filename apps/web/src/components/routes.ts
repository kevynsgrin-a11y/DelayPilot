/**
 * The route inventory — what this build actually emits, computed once and read by every shell.
 *
 * `AGENTS.md §1.6` forbids a dead control, and the most common dead control on a marketing site is
 * a navigation link to a page that was not generated. Three things can suppress a route here:
 *
 *   1. **Editorial status.** A guide or rights entry is served only at `publishable` or
 *      `published` (`content.config.ts`). Nothing else produces a route, so nothing else is linked.
 *   2. **Configuration.** `/contact/` and `/accessibility/` are emitted only when
 *      `PUBLIC_CONTACT_EMAIL` is set at build time. The accessibility statement shares the
 *      condition because `docs/ACCESSIBILITY.md §13` item 5 requires it to carry a feedback route
 *      that reaches a person; a statement that cannot be replied to is an accessibility barrier of
 *      its own. With the variable unset, BOTH routes are absent from the build and from every menu
 *      — that is the designed state, not a gap.
 *   3. **Upstream.** `/pricing/`, `/airlines/**`, `/airports/**`, `/routes/**` and `/status/` need
 *      billing, reference data and a reachable health endpoint. None exists, so none is emitted and
 *      none is linked (`docs/BUILD_PLAN.md §10`).
 *
 * Every consumer imports from here rather than hard-coding an href, so adding a route is one edit.
 */

import { getCollection, type CollectionEntry } from 'astro:content'
import type { Jurisdiction } from '../content.config.ts'

/** Statuses that produce a route. */
const SERVED = new Set(['publishable', 'published'])

/** Statuses that additionally allow indexing. `publishable` is served but `noindex`. */
const INDEXABLE = 'published'

export type GuideEntry = CollectionEntry<'guides'>
export type RightsEntry = CollectionEntry<'passengerRights'>

export const isServed = (entry: GuideEntry | RightsEntry): boolean => SERVED.has(entry.data.status)

export const isIndexable = (entry: GuideEntry | RightsEntry): boolean =>
  entry.data.status === INDEXABLE && entry.data.indexable

/** The `robots` value a served entry gets. `publishable` is deliberately not indexed. */
export const entryRobots = (entry: GuideEntry | RightsEntry): 'index' | 'noindex' =>
  isIndexable(entry) ? 'index' : 'noindex'

/** Guides that produce a route, sorted for a stable build (`AGENTS.md §3.4`). */
export async function servedGuides(): Promise<GuideEntry[]> {
  const entries = await getCollection('guides', isServed)
  return entries.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
}

/** Passenger-rights entries that produce a route, in jurisdiction order. */
export async function servedRights(): Promise<RightsEntry[]> {
  const entries = await getCollection('passengerRights', isServed)
  const order: readonly Jurisdiction[] = ['overview', 'us', 'eu', 'uk', 'canada']
  return entries.sort(
    (a, b) => order.indexOf(a.data.jurisdiction) - order.indexOf(b.data.jurisdiction),
  )
}

/** The jurisdiction pages that exist, excluding the overview (which is the index itself). */
export async function servedJurisdictions(): Promise<RightsEntry[]> {
  const entries = await servedRights()
  return entries.filter((entry) => entry.data.jurisdiction !== 'overview')
}

/** True when the `overview` entry is served, which is what makes `/passenger-rights/` exist. */
export async function hasRightsOverview(): Promise<boolean> {
  const entries = await servedRights()
  return entries.some((entry) => entry.data.jurisdiction === 'overview')
}

/**
 * The contact address, or undefined.
 *
 * Read through the index signature because `PUBLIC_CONTACT_EMAIL` is not part of Astro's own
 * `ImportMetaEnv`, and `noPropertyAccessFromIndexSignature` (`AGENTS.md §3.1`) forbids dotting into
 * one. An empty string counts as unset: a variable exported as `PUBLIC_CONTACT_EMAIL=` is a
 * variable someone has not filled in yet.
 */
const rawContact: unknown = import.meta.env['PUBLIC_CONTACT_EMAIL']

export const contactEmail: string | undefined =
  typeof rawContact === 'string' && rawContact.trim() !== '' ? rawContact.trim() : undefined

/** Whether `/contact/` and `/accessibility/` are emitted at all in this build. */
export const contactRoutesEnabled = contactEmail !== undefined

/** Routes this build always emits. Used by the dead-link check in `scripts/verify-dist.mjs`. */
export const alwaysEmitted = [
  '/',
  '/flight-status/',
  '/delay-risk/',
  '/connection-risk/',
  '/methodology/',
  '/data-sources/',
  '/about/',
  '/privacy/',
  '/terms/',
] as const
