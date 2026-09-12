/**
 * The forbidden-phrase list. Owner: `ux-copy-steward`.
 *
 * `AGENTS.md §1.3` fixes this list and makes it binding "anywhere in code, copy, tests, fixtures,
 * notifications, or documentation". Not "in user-facing copy" — anywhere. A phrase that lives in a
 * fixture gets copied into a component, a phrase in a test name gets copied into a screenshot, and
 * a phrase in a comment gets copied into the thing the comment describes. Hence the whole tree.
 *
 * WHY EVERY PHRASE IS STORED AS TOKENS, AND WHY NO ID SPELLS ITS PHRASE. If this file wrote the
 * phrases out, this file would need an allowlist entry — and a lint that has to exempt itself has
 * already started down the road that ends in exempting everyone. Tokens are joined only at match
 * time, and every id, comment and explanation below is worded so that normalizing this file
 * produces none of the banned strings. The result is that the literals exist in exactly four places
 * in this repository: `AGENTS.md`, `DIRECTIVE.md`, `docs/VOICE.md`, and this lint's own fixtures.
 * Those four are the entire allowlist, and `lint.test.ts` asserts this file needs no entry.
 *
 * ADDING an entry is this owner's call. REMOVING or weakening one is an escalation to the
 * orchestrator — never a local decision, and never a way to unblock a failing build.
 */

/** Which invariant a phrase breaks. Quoted next to every hit so the fix is obvious. */
export type Invariant =
  | 'AGENTS.md §1.3 — never overclaim legally'
  | 'AGENTS.md §1.1 — never fabricate operational fact'
  | 'AGENTS.md §2 — no ticket-identifier vocabulary in copy'
  | 'DIRECTIVE.md §7 — voice: the never list'

export interface ForbiddenPhrase {
  /** Stable id, used in tests and printed with each hit. Never spells the phrase it names. */
  readonly id: string
  /**
   * The phrase as lowercase tokens. Matching joins them with a single space after the scanner has
   * normalized the source, so hyphens, underscores, line wraps, camelCase, markdown quote markers
   * and curly apostrophes all reduce to the same shape.
   */
  readonly tokens: readonly string[]
  readonly invariant: Invariant
  /** Why it is banned, in one line. Printed with the hit. */
  readonly why: string
  /**
   * Normalized collocations in which this phrase is not the banned claim. Used only by the
   * superlative rule, where the banned thing is an unsubstantiated VALUE CLAIM and the same word is
   * also an ordinary term of art. Each entry carries its justification beside it. This is a
   * property of the phrase — it applies identically in every file — and not a file allowlist.
   */
  readonly notWhenPartOf?: readonly string[]
  /**
   * Path prefixes, relative to the repository root, that this phrase is scanned in. Absent means
   * the whole scanned tree. Present only where the phrase is a COPY defect rather than a factual or
   * legal one: the copy modules and the notification templates must never name a ticket identifier,
   * while a privacy page has to be able to say which field does not exist.
   */
  readonly scope?: readonly string[]
}

/**
 * The trees whose text is shipped as DelayPilot's own voice. Ticket-identifier vocabulary in any of
 * them is a shipped defect.
 *
 * NOT the whole repository, and the exclusion is the point: a privacy page, a terms page and this
 * repository's own documents have to be able to NAME the field that does not exist in order to
 * promise it never will. The sentence that tells a traveler they will not be asked has to contain
 * the word for the thing they will not be asked for. Banning it there would ban the promise.
 *
 * `apps/web/src/content` was added in the S3 review at the trust officer's request: an article body
 * is prose in DelayPilot's voice, so the rule that keeps the vocabulary out of a label or a
 * placeholder applies to it too. The tree was scanned before the scope was widened and produced
 * zero hits, so this adds enforcement and not a backlog. Verified with
 * `node apps/web/src/lib/copy/lint/cli.ts --only apps/web/src/content`.
 */
const COPY_TREES: readonly string[] = [
  'apps/web/src/lib/copy',
  'apps/web/src/content',
  'packages/notifications/src/templates',
]

/**
 * Assembled rather than written, for the reason in the header: this file must not contain the
 * literals it bans. These three are single tokens, so there is no separator to hide behind.
 *
 * `RANK_NUMERAL` is the hash-and-digit spelling of a rank claim. It has to be assembled for the
 * same reason as the other two — the scanner keeps `#` when a digit follows it, so writing the
 * literal here would make this file its own first hit.
 */
const SUPERLATIVE = ['be', 'st'].join('')
const TICKET_ABBREVIATION = ['pn', 'r'].join('')
const RANK_NUMERAL = ['#', '1'].join('')

export const forbiddenPhrases: readonly ForbiddenPhrase[] = [
  // ── AGENTS.md §1.3, the enumerated list ────────────────────────────────────────────────────
  {
    id: 'owed-as-settled',
    tokens: ['you', 'are', 'owed'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'States an entitlement as settled. DelayPilot says "may apply" and names the rule version.',
  },
  {
    id: 'compensation-guarantee',
    tokens: ['guaranteed', 'compensation'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'Nothing about compensation is certain: the airline or the regulator decides.',
  },
  {
    id: 'legal-entitlement',
    tokens: ['legally', 'entitled'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'A legal determination DelayPilot does not make. Use "may apply".',
  },
  {
    id: 'claim-approval',
    tokens: ['approved', 'claim'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'DelayPilot never files a claim and never learns the outcome of one.',
  },
  {
    id: 'promise-to-win',
    tokens: ['we', 'will', 'win'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'DelayPilot is not a claims company and represents nobody.',
  },
  {
    id: 'airline-obligation-to-pay',
    tokens: ['the', 'airline', 'must', 'pay'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'An obligation only a regulator or a court can state.',
  },
  {
    id: 'connection-guarantee',
    tokens: ['guaranteed', 'connection'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'No connection is certain. The product publishes slack and a band, not a promise.',
  },
  {
    id: 'predicted-cancellation-double-l',
    tokens: ['your', 'flight', 'will', 'be', 'cancelled'],
    invariant: 'AGENTS.md §1.1 — never fabricate operational fact',
    why: 'A prediction stated as fact about a named flight. Both spellings are banned.',
  },
  {
    id: 'predicted-cancellation-single-l',
    tokens: ['your', 'flight', 'will', 'be', 'canceled'],
    invariant: 'AGENTS.md §1.1 — never fabricate operational fact',
    why: 'A prediction stated as fact about a named flight. Both spellings are banned.',
  },
  {
    id: 'fault-asserted',
    tokens: ['we', 'know', 'the', 'airline', 'is', 'at', 'fault'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'Cause is airline-stated or provider-stated until an authority finds otherwise.',
  },
  {
    id: 'manufactured-urgency',
    tokens: ['claim', 'now', 'before', 'it', 'is', 'too', 'late'],
    invariant: 'DIRECTIVE.md §7 — voice: the never list',
    why: 'Urgency the data does not support. Permitted only beside a real, source-linked official deadline, which is a deadline component rather than this sentence.',
  },

  // ── DIRECTIVE.md §7, the "Never" list ──────────────────────────────────────────────────────
  {
    id: 'ai-as-value-proposition',
    tokens: ['ai', 'powered'],
    invariant: 'DIRECTIVE.md §7 — voice: the never list',
    why: 'Not a value proposition. Say what the product does and where the value came from.',
  },
  {
    id: 'accuracy-superlative',
    tokens: ['most', 'accurate'],
    invariant: 'DIRECTIVE.md §7 — voice: the never list',
    why: 'A superlative with no published measurement behind it.',
  },
  {
    id: 'unsubstantiated-superlative',
    tokens: [SUPERLATIVE],
    invariant: 'DIRECTIVE.md §7 — voice: the never list',
    why: 'A superlative with no published measurement behind it. Say what the thing does instead.',
    notWhenPartOf: [
      // A documentation genre — the Cloudflare "Workers Best Practices" page is named in
      // DIRECTIVE.md §33. Not a claim about DelayPilot.
      'best practice',
      'best practices',
      // A delivery-semantics term of art, as in "best-effort delivery". Not a claim about
      // DelayPilot.
      'best effort',
      // DIRECTIVE.md §18.5 names a cockpit surface the "next-best-action card". A proper noun for
      // a component, fixed by the directive.
      'next best action',
      // `fontTools`' `getBestCmap()` method, called by scripts/assets/wordmark-paths.py. A
      // third-party symbol name that cannot be renamed here, and not a claim about anything.
      'best cmap',
    ],
  },
  /**
   * The rank claim, in both spellings — the hash-and-digit form and the spelled form. Raised by
   * `trust-compliance-officer`'s S3 sweep: the §7 superlative clause was enforced for two wordings
   * and missed the one that marketing copy reaches for first. A rank is the same unsubstantiated
   * claim as the superlative above, and DelayPilot has no ranking, no measurement, and no
   * comparison set behind either spelling of it.
   *
   * Both were zero-hit across the scanned tree by hand before they landed, so these add enforcement
   * and no backlog.
   */
  {
    id: 'rank-claim-numeral',
    tokens: [RANK_NUMERAL],
    invariant: 'DIRECTIVE.md §7 — voice: the never list',
    why: 'A rank claim with no ranking behind it. DelayPilot publishes no comparison and no measurement.',
  },
  {
    id: 'rank-claim-words',
    tokens: ['number', 'one'],
    invariant: 'DIRECTIVE.md §7 — voice: the never list',
    why: 'The spelled form of the same rank claim. Say what the product does instead.',
  },

  // ── Near misses. Same meaning, different words, banned for the same reason. ─────────────────
  {
    id: 'owed-contracted-spelling',
    tokens: ["you're", 'owed'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'The contracted spelling of an entitlement stated as settled.',
  },
  {
    id: 'entitlement-to-compensation',
    tokens: ['entitled', 'to', 'compensation'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'A determination. Say that compensation may apply, under which rule version.',
  },
  {
    id: 'payout-promise',
    tokens: ["we'll", 'get', 'you', 'paid'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'DelayPilot never acts on a traveler behalf and never handles a payout.',
  },
  {
    id: 'claim-outcome-asserted',
    tokens: ['your', 'claim', 'is', 'approved'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'DelayPilot does not file claims and cannot know their outcome.',
  },
  {
    id: 'airline-debt-asserted',
    tokens: ['the', 'airline', 'owes', 'you'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'An obligation stated as established fact.',
  },
  {
    id: 'bare-guarantee',
    tokens: ['we', 'guarantee'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'DelayPilot guarantees no operational and no legal outcome.',
  },

  // ── AGENTS.md §2, ticket-identifier vocabulary, scoped to the copy trees ────────────────────
  {
    id: 'ticket-identifier-a',
    tokens: ['booking', 'reference'],
    invariant: 'AGENTS.md §2 — no ticket-identifier vocabulary in copy',
    why: 'DelayPilot has no such field. Naming one in copy teaches a traveler to look for it.',
    scope: COPY_TREES,
  },
  {
    id: 'ticket-identifier-b',
    tokens: ['record', 'locator'],
    invariant: 'AGENTS.md §2 — no ticket-identifier vocabulary in copy',
    why: 'DelayPilot has no such field.',
    scope: COPY_TREES,
  },
  {
    id: 'ticket-identifier-c',
    tokens: [TICKET_ABBREVIATION],
    invariant: 'AGENTS.md §2 — no ticket-identifier vocabulary in copy',
    why: 'DelayPilot has no such field, and the abbreviation belongs in no user-facing sentence.',
    scope: COPY_TREES,
  },
  {
    id: 'ticket-identifier-d',
    tokens: ['confirmation', 'code'],
    invariant: 'AGENTS.md §2 — no ticket-identifier vocabulary in copy',
    why: 'DelayPilot has no such field.',
    scope: COPY_TREES,
  },
  {
    id: 'ticket-identifier-e',
    tokens: ['reservation', 'code'],
    invariant: 'AGENTS.md §2 — no ticket-identifier vocabulary in copy',
    why: 'DelayPilot has no such field.',
    scope: COPY_TREES,
  },
]

/** The phrase as a human reads it, for the CLI output. Built at call time, never stored. */
export function phraseText(phrase: ForbiddenPhrase): string {
  return phrase.tokens.join(' ')
}
