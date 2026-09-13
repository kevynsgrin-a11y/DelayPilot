/**
 * Content collections — the schema, and the rule that decides what is served.
 *
 * Owner of this file: `frontend-ui-engineer` (the shell). Owner of every entry it loads:
 * `content-editorial-lead` (`apps/web/src/content/**`). The split is deliberate: the serving rule
 * is a release gate, not an editorial preference, so it lives with the route shells that enforce it
 * and not with the prose it judges.
 *
 * THE SERVING RULE (`DIRECTIVE.md §18.6`, S3 dispatch):
 *
 *   status ∈ { publishable, published }   → the page is emitted
 *   published && indexable                → `robots: index` (and the sitemap, in S4)
 *   anything else                         → the page is NOT emitted, and nothing links to it
 *
 * A `publishable` page is served with `noindex` and says so in its header: "Editorial status:
 * awaiting final review". That is the honest position for prose that has passed source review but
 * not the owner's read — it is reachable by someone who was given the link, and it is invisible to
 * a search engine.
 *
 * An entry in `draft`, `source_review`, `legal_review`, `review_due` or `stale` produces NO route.
 * `/guides/` and `/passenger-rights/<jurisdiction>/` exist only when at least one such entry is
 * served, and the header omits a menu whose group has no served items, because a link to a page
 * that does not exist is a dead control (`AGENTS.md §1.6`).
 */

import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
// `z` re-exported from 'astro:content' is deprecated; the supported import is 'astro/zod'.
import { z } from 'astro/zod'

/** The editorial workflow of `DIRECTIVE.md §18.6`, in order. */
export const editorialStatuses = [
  'draft',
  'source_review',
  'legal_review',
  'publishable',
  'published',
  'review_due',
  'stale',
] as const

export const jurisdictions = ['overview', 'us', 'eu', 'uk', 'canada'] as const

export type Jurisdiction = (typeof jurisdictions)[number]

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Dates are ISO calendar dates, YYYY-MM-DD.')

const base = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pageType: z.enum(['guide', 'rights-explainer']),
  status: z.enum(editorialStatuses),
  intent: z.string().min(1),
  /** The answer-first lead paragraph. Rendered before the body, never after it. */
  answerFirst: z.string().min(1),
  /** Registry ids from `data/rights/sources/**`. Never a bare URL, never an invented authority. */
  sources: z.array(z.string()),
  /**
   * Registry ids whose `citableForRuleValues` is false — a press release, a news summary, anything
   * that reports on a rule without being the rule. They are rendered SEPARATELY from `sources` and
   * labelled as context rather than authority, and they never satisfy the citation requirement
   * below: a page whose only citation is a press release has not been sourced (`DIRECTIVE.md §3.5`,
   * "a news summary never outranks the regulator").
   */
  contextSources: z.array(z.string()).optional(),
  internalRefs: z.array(z.string()).optional(),
  ruleSetRefs: z.array(z.object({ jurisdiction: z.string(), version: z.string() })).optional(),
  reviewedAt: isoDate,
  nextReviewDue: isoDate,
  indexable: z.boolean(),
  author: z.string().min(1),
  topics: z.array(z.string()).optional(),
})

/**
 * A page must cite something. `sources` may be empty only when `internalRefs` is not, so a page
 * that rests entirely on this repository's own documents still says which documents.
 */
const cited = base.refine(
  (entry) => entry.sources.length > 0 || (entry.internalRefs?.length ?? 0) > 0,
  { message: 'An entry with no `sources` must list at least one `internalRefs` entry.' },
)

const guides = defineCollection({
  loader: glob({ base: './src/content/guides', pattern: '**/*.md' }),
  schema: cited,
})

const passengerRights = defineCollection({
  loader: glob({ base: './src/content/passenger-rights', pattern: '**/*.md' }),
  schema: base
    .extend({ jurisdiction: z.enum(jurisdictions) })
    .refine((entry) => entry.sources.length > 0 || (entry.internalRefs?.length ?? 0) > 0, {
      message: 'An entry with no `sources` must list at least one `internalRefs` entry.',
    }),
})

export const collections = { guides, passengerRights }
