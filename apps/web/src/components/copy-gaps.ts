/**
 * The three strings `apps/web/src/lib/copy/**` still does not export.
 *
 * Owner of the words: `ux-copy-steward` (`docs/agents/ROSTER.md §3`). Owner of this file:
 * `frontend-ui-engineer`, as the one place the remaining gap is visible instead of scattered as
 * literals through the components that need them.
 *
 * It started with ten groups. The copy module landed during this session and every page heading,
 * section body, `§17` state sentence, segment status word, confidence word, transfer-table column,
 * action label, evidence heading, timeline role and footer link now comes from `lib/copy` directly.
 * What is left is three things nothing in the contract covers yet, each named with the export it is
 * asked for. Every one is listed in the handoff report, and this file disappears when they land.
 *
 * Nothing here is a placeholder: each string renders, reads correctly, and states only what is true
 * of this build.
 */

/**
 * REQUEST `states.conditionsNotConnected` (or `cockpit.unknown.conditions`).
 *
 * The `§18.5` weather-and-airspace panel has no feed behind it in this deployment, so it renders
 * the unavailable state — and an unavailable state needs a sentence naming the specific missing
 * fact. `provenance.unavailableReasons` covers a provider, a rule set and a model, but not a
 * weather or airspace feed. The second sentence is the `AGENTS.md §1.3` rule that has to travel
 * with any mention of conditions: context, never cause.
 */
export const conditionsNotConnected =
  'No weather or airspace feed is connected in this deployment, so operating conditions at either airport are unavailable. Conditions are context for a band and are never proof of a cause.'

/**
 * REQUEST `disclaimers.labels` — the accessible name of each `§26` note.
 *
 * Each disclaimer renders inside `role="note"`, which needs a name, or a screen-reader user hears a
 * qualifying sentence with no indication of what it qualifies. The sentences themselves are fixed
 * text and come from `disclaimers`; only these four names are missing. They are not headings and
 * are not rendered visually — the visible context is the panel the note sits in.
 */
export const disclaimerLabels = {
  flightData: 'Flight data disclaimer',
  prediction: 'Prediction disclaimer',
  connection: 'Connection disclaimer',
  rights: 'Passenger rights disclaimer',
} as const

/**
 * REQUEST `pages.article.notYetVerified` and `pages.article.internalRefsHeading`.
 *
 * The article source block renders each registry record's authority, canonical address and
 * `lastVerifiedAt`. Every record in this build carries a NULL verification date — no source could
 * be opened this session — and that null has to render as words rather than be hidden, or an
 * unverified citation is presented as a verified one. `internalRefs` are repository documents and
 * get their own heading, because listing them under "Sources" beside regulators would imply they
 * are the same kind of thing.
 */
export const sourceBlockLabels = {
  notYetVerified: 'Not yet verified against the publisher',
  internalRefsHeading: 'Repository references',
  /**
   * REQUEST `pages.article.contextHeading` / `contextIntro` / `contextNote`.
   *
   * A registry record whose `citableForRuleValues` is false reports ON a rule without being it — a
   * press release, a news summary. It is shown so a reader can follow the story, and it is labelled
   * so nobody mistakes it for the instrument (`DIRECTIVE.md §3.5`).
   */
  contextHeading: 'Context',
  contextIntro:
    'Published material that reports on a rule without being the rule. Shown for background; no value on this page is taken from it.',
  contextNote: 'Context source, not an authority',
} as const
