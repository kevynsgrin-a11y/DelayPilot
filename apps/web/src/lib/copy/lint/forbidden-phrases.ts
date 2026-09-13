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

/**
 * AN ELASTIC JOIN: up to two inserted words are tolerated at this position in a token array.
 *
 * WHY IT EXISTS. `trust-compliance-officer`'s S3 re-check probed the §1.3 rules with ONE WORD
 * INSERTED at a join and defeated five of eight: `airline-debt-asserted`,
 * `airline-obligation-to-pay`, `connection-guarantee`, `fault-asserted` and both
 * `predicted-cancellation` spellings all went quiet when an adjective was put in front of the noun
 * or an adverb in front of the verb. Two of those are not hypothetical. The adjective this product
 * itself puts in front of that noun is fixed in the `§26` flight-data disclaimer and appears on
 * three shipped surfaces, so the single most likely way for a real author to write the banned claim
 * was the one spelling the rule could not see. A ban a modifier defeats is a ban on one sentence,
 * not on a claim. The six probes and their quiet counterparts are in the fixtures, where the
 * literals belong.
 *
 * WHY TWO WORDS AND NOT MORE. Two covers every modifier an author reaches for — an article, an
 * adjective, an adverb, or a pair of adjectives — and stops well short of spanning a clause. It is
 * bounded, so the pattern cannot backtrack.
 *
 * WHY IT DOES NOT LEAK ACROSS A SENTENCE. A gap matches only word characters and single spaces, so
 * it stops at the first character that is neither — and the normalizer leaves a comma, a colon, a
 * semicolon, a bracket, a quotation mark, an exclamation mark and a question mark exactly where the
 * author put them.
 *
 * The full stop was the exception, and it was a real one. `trust-compliance-officer` F15: `.` folded
 * to a space like every other separator, so two sentences became one and a claim could be assembled
 * from the end of one and the start of the next — a hit on a page saying the opposite of the claim.
 * This docblock asserted a guarantee the code did not have. `scan.ts` now KEEPS a `.` that ends a
 * sentence and folds every other one, so the guarantee is real and the dotted forms that are not
 * sentence ends still fold. See `endsSentence`.
 *
 * WHY A SENTINEL IN THE ARRAY RATHER THAN A LIST OF INDEXES. An index list rots the moment someone
 * edits a token array; a marker sitting at the join it describes cannot. `*` and `+` are safe as
 * markers because the normalizer folds both to a space, so no real token can ever equal either.
 *
 * A GAP MAY FIRE ON A NEGATION, AND WHETHER THAT IS RIGHT IS DECIDED PER RULE, never assumed. For
 * every rule below except one, the negated form is still a determination or still a prediction
 * stated as fact, so firing is the rule working. The exception is `bare-guarantee`, whose negated
 * form is the honest hedge — it takes `GAP_NO_NEGATION` instead.
 */
export const GAP = '*'

/**
 * An elastic join that a NEGATOR closes. Same two-word width as `GAP`, except that the match is
 * abandoned if any inserted word is "not", "cannot", "never", "no", "neither", "nor", or anything
 * ending in "n't".
 *
 * IT EXISTS BECAUSE ONE RULE'S SLOT CHANGES THE MEANING OF THE SENTENCE, and that is the whole
 * discriminator between the two markers:
 *
 * | Marker             | What the slot takes                  | What the modified sentence is |
 * | ------------------ | ------------------------------------ | ----------------------------- |
 * | `GAP`              | an article, an adjective, an adverb  | still the banned claim        |
 * | `GAP_NO_NEGATION`  | an intensifier — or a negator        | the claim, or the honest hedge |
 *
 * `bare-guarantee` was left rigid for exactly this reason: a plain gap would have caught the hedge
 * this product SHOULD write. `trust-compliance-officer` F14 agreed with the reasoning and then
 * showed what it was costing — the modal and emphatic forms of the promise were reachable, and the
 * word that makes a promise emphatic sits in the same slot as the word that makes it a hedge. So
 * the slot stays, and it is taught to tell them apart. That is a property of the phrase, not a
 * favour done to a path: it applies identically in every file.
 */
export const GAP_NO_NEGATION = '+'

/** Either elastic marker. Neither can collide with a real token: both fold to a space. */
export const isGap = (token: string): boolean => token === GAP || token === GAP_NO_NEGATION

export interface ForbiddenPhrase {
  /** Stable id, used in tests and printed with each hit. Never spells the phrase it names. */
  readonly id: string
  /**
   * The phrase as lowercase tokens. Matching joins them with a single space after the scanner has
   * normalized the source, so hyphens, underscores, line wraps, camelCase, markdown quote markers
   * and curly apostrophes all reduce to the same shape.
   *
   * A `GAP` or `GAP_NO_NEGATION` entry is not a token: it marks the join before the next token as
   * elastic, tolerating up to two inserted words there. Neither may be first or last, and two may
   * not sit next to each other; `lint.test.ts` asserts all three.
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
 * Every tree a sentence a traveler reads can originate in. Wider than `COPY_TREES`, which is the
 * product's authored voice: this adds the route shells, the pattern layer, the layouts and the `§28`
 * fixture, because a rendered sentence has come out of each of them at least once.
 *
 * IT EXISTS FOR THE NEGATIVE-DETERMINATION RULES BELOW, AND THE REASON IS NOT THE ONE `COPY_TREES`
 * HAS. `§4.3`'s scope is justified by the rule banning a WORD, which a privacy page must be able to
 * name. These rules ban a CLAIM, and by that reasoning they should be unscoped like every other
 * `§1.3` rule.
 *
 * They are scoped anyway, because this class differs from every other in one measurable way: its
 * canonical examples are already published, in full, in files whose job is to record that the claim
 * is banned. `docs/EDITORIAL_POLICY.md §6.5` tabulates four of them so an editor can recognize the
 * shape; `docs/BUILD_PLAN.md` records the finding that produced the rules; and a fixture test
 * asserts, by regular expression, that the sentence is absent from the demonstration itinerary.
 * None of the three makes the claim. All three would fire.
 *
 * The alternative was a fifth allowlist entry, which the owning charter forbids outright and which
 * would not even have worked: the fixture test is the frontend's to keep or retire at its own
 * discretion, so an unscoped rule's cleanliness would depend on a choice this owner does not make.
 * A rule that another agent can turn red by a legitimate decision is a rule that gets switched off.
 *
 * The scope is drawn where the harm is. A determination in any of these trees reaches a reader at a
 * gate; a determination quoted in a policy document, a build record or a test is being exhibited so
 * that it can be refused. `lint.test.ts` pins the list, so widening it is a visible edit.
 */
const VOICE_TREES: readonly string[] = [
  'apps/web/src/lib/copy',
  'apps/web/src/content',
  'apps/web/src/components',
  'apps/web/src/demo',
  'apps/web/src/layouts',
  'apps/web/src/pages',
  'packages/ui/src/patterns',
  // Not built yet, and listed anyway. A rights assessment, a risk band and a connection result are
  // the three surfaces where this class is most likely to be authored, because each is a sentence
  // about what a rule does — and the cheapest moment to have the rule in place is before the first
  // line is written, not after a reviewer finds it in a rendered card
  // (`trust-compliance-officer` F16). `packages/notifications/src/templates` was already here on
  // exactly that reasoning.
  'packages/connection-engine/src',
  'packages/notifications/src/templates',
  'packages/rights-engine/src',
  'packages/risk-engine/src',
  'data/rights/rulesets',
]

/** Shared by the negative-determination rules, so one class has one explanation. */
const DETERMINATION_INVARIANT = 'AGENTS.md §1.3 — never overclaim legally' as const

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
    tokens: ['you', 'are', GAP, 'owed'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'States an entitlement as settled. DelayPilot says "may apply" and names the rule version.',
  },
  {
    id: 'compensation-guarantee',
    tokens: ['guaranteed', GAP, 'compensation'],
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
    tokens: ['approved', GAP, 'claim'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'DelayPilot never files a claim and never learns the outcome of one.',
  },
  {
    id: 'promise-to-win',
    tokens: ['we', 'will', GAP, 'win'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'DelayPilot is not a claims company and represents nobody.',
  },
  /**
   * THE LEADING ARTICLE IS GONE FROM THIS RULE AND FROM `airline-debt-asserted`.
   *
   * Both used to open with the definite article, which made the whole ban evadable by naming WHICH
   * carrier — an ordinal or the house adjective in front of the noun and the rule went quiet.
   * Anchoring on the noun instead of on the determiner catches every determiner at once ("an",
   * "that", "this", "each", "no") and every modifier in front of it, and the elastic join then
   * covers a modifier on the verb. This is the shape the trust re-check asked for, and it is
   * strictly stronger than bounding a gap after an article that need not be there at all.
   */
  {
    id: 'airline-obligation-to-pay',
    tokens: ['airline', GAP, 'must', 'pay'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'An obligation only a regulator or a court can state.',
  },
  {
    id: 'connection-guarantee',
    tokens: ['guaranteed', GAP, 'connection'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'No connection is certain. The product publishes slack and a band, not a promise.',
  },
  {
    id: 'predicted-cancellation-double-l',
    tokens: ['your', 'flight', GAP, 'will', GAP, 'be', 'cancelled'],
    invariant: 'AGENTS.md §1.1 — never fabricate operational fact',
    why: 'A prediction stated as fact about a named flight. Both spellings are banned, and a hedging adverb does not make it an estimate.',
  },
  {
    id: 'predicted-cancellation-single-l',
    tokens: ['your', 'flight', GAP, 'will', GAP, 'be', 'canceled'],
    invariant: 'AGENTS.md §1.1 — never fabricate operational fact',
    why: 'A prediction stated as fact about a named flight. Both spellings are banned, and a hedging adverb does not make it an estimate.',
  },
  {
    id: 'fault-asserted',
    tokens: ['we', 'know', GAP, 'airline', 'is', GAP, 'at', 'fault'],
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
    tokens: ["you're", GAP, 'owed'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'The contracted spelling of an entitlement stated as settled.',
  },
  {
    id: 'entitlement-to-compensation',
    tokens: ['entitled', 'to', GAP, 'compensation'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'A determination. Say that compensation may apply, under which rule version.',
  },
  {
    id: 'payout-promise',
    tokens: ["we'll", 'get', 'you', GAP, 'paid'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'DelayPilot never acts on a traveler behalf and never handles a payout.',
  },
  {
    id: 'claim-outcome-asserted',
    tokens: ['your', GAP, 'claim', 'is', GAP, 'approved'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'DelayPilot does not file claims and cannot know their outcome.',
  },
  {
    id: 'airline-debt-asserted',
    tokens: ['airline', GAP, 'owes', 'you'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'An obligation stated as established fact, in either direction. Adding a negative object to this claim does not change what it is — it still settles a question only a regulator or a court settles — and a ban a writer can evade by negating the claim is not a ban.',
  },
  /**
   * THE ONE RULE WHOSE SLOT DECIDES WHETHER THE SENTENCE IS A CLAIM OR A HEDGE.
   *
   * A sentence of the form "we cannot <this verb> that the gate will not change" is one DelayPilot
   * SHOULD write: it is the honest hedge, in this product's own voice. A plain `GAP` fires on it,
   * and a rule that flags the correct sentence is a rule somebody switches off. So this rule shipped
   * rigid, with that reasoning recorded.
   *
   * `trust-compliance-officer` F14 agreed with the reasoning and priced it: rigid also left the
   * modal and the emphatic forms of the promise reachable, because the word that makes a promise
   * emphatic sits in the same slot as the word that makes it a hedge. The slot is now
   * `GAP_NO_NEGATION`, which tells them apart — three banned forms hit, three honest hedges stay
   * quiet, and all six are pinned in the fixtures.
   *
   * Every gap above was chosen by the same test: does the modified or negated form read as
   * something this product would honestly say? For the §1.3 claims whose negations a reviewer
   * raised, the answer is no — each remains either a determination DelayPilot does not make or a
   * prediction stated as fact, so firing on those is the rule working. This is the one rule where
   * the answer is yes, which is why it is the one rule with a negation-aware slot.
   */
  {
    id: 'bare-guarantee',
    tokens: ['we', GAP_NO_NEGATION, 'guarantee'],
    invariant: 'AGENTS.md §1.3 — never overclaim legally',
    why: 'DelayPilot guarantees no operational and no legal outcome. A modal or an intensifier in front of the verb is still the promise; a negator in the same slot is the honest hedge and is not a hit.',
  },

  /* ── A determination has no safe direction ──────────────────────────────────────────────────
   *
   * `docs/EDITORIAL_POLICY.md §6.5`, raised as copy F-27 and rated critical by
   * `trust-compliance-officer`. Every rule above catches a claim that promises the reader
   * something. This class catches the same claim settled the other way — and the other way is the
   * one that passed `pnpm lint` for an entire wave, in two shipped surfaces at once, because it
   * reads as caution rather than as a promise.
   *
   * The two sentences that shipped are in the violating fixture with their hedged replacements
   * opposite. One told a reader which carrier was answerable for a missed connection and one told
   * them that none was; a reviewer reading either stops asking, and the cost of that is the whole
   * reason this product exists.
   *
   * THE ANCHOR IS THE SUBJECT, NOT THE NEGATION. Anchoring on "not" or "no" would catch the four
   * examples and nothing else, because the negation is the most variable word in the sentence: it
   * moves, it becomes a prefix, it becomes "nothing", it disappears into "cannot". Anchoring on the
   * carrier or on the traveler and leaving the verb phrase elastic catches the claim in both
   * directions with one rule each — which is the point, because `AGENTS.md §1.3` bans the
   * determination and not its sign.
   *
   * A STATEMENT ABOUT DELAYPILOT'S OWN BEHAVIOUR IS NOT A DETERMINATION, and `§6.5` says so
   * explicitly. Nothing here is anchored on this product's name, so "DelayPilot never marks a
   * separate-ticket connection as protected" stays flat, as it should — hedging a fact about the
   * product would be the overclaim, pointing the third way.
   */
  {
    id: 'carrier-responsibility-determined',
    tokens: ['airline', GAP, 'is', GAP, 'responsible'],
    invariant: DETERMINATION_INVARIANT,
    why: 'Settles who is answerable for a disruption. That is the airline or the regulator to decide, in either direction, and a negative answer is still an answer.',
    scope: VOICE_TREES,
  },
  {
    id: 'carrier-responsibility-determined-plural',
    tokens: ['airlines', GAP, 'are', GAP, 'responsible'],
    invariant: DETERMINATION_INVARIANT,
    why: 'The plural spelling of the same determination. A claim about carriers in general is a claim about the reader carrier.',
    scope: VOICE_TREES,
  },
  {
    id: 'carrier-liability-determined',
    tokens: ['airline', GAP, 'is', GAP, 'liable'],
    invariant: DETERMINATION_INVARIANT,
    why: 'Liability is a finding, not an assessment. DelayPilot reports which rules may apply and stops there.',
    scope: VOICE_TREES,
  },
  {
    id: 'carrier-liability-determined-plural',
    tokens: ['airlines', GAP, 'are', GAP, 'liable'],
    invariant: DETERMINATION_INVARIANT,
    why: 'The plural spelling of the same finding.',
    scope: VOICE_TREES,
  },
  {
    id: 'carrier-obligation-determined',
    tokens: ['airline', GAP, 'has', GAP, 'obligation'],
    invariant: DETERMINATION_INVARIANT,
    why: 'Whether a duty attaches turns on the full facts and on the framework. Say which rules may apply under the rule version shown.',
    scope: VOICE_TREES,
  },
  {
    id: 'carrier-obligation-determined-plural',
    tokens: ['airlines', GAP, 'have', GAP, 'obligation'],
    invariant: DETERMINATION_INVARIANT,
    why: 'The plural spelling of the same duty claim.',
    scope: VOICE_TREES,
  },
  {
    id: 'carrier-problem-assigned',
    tokens: ["airline's", 'problem'],
    invariant: DETERMINATION_INVARIANT,
    why: 'Assigns the disruption to a party. `docs/EDITORIAL_POLICY.md §6.5` names this shape as the same defect pointing the reassuring way, and it was live in this module when the rule landed.',
    scope: VOICE_TREES,
  },
  {
    id: 'rebooking-outcome-denied',
    tokens: ['nobody', GAP, 'rebooks', 'you'],
    invariant: DETERMINATION_INVARIANT,
    why: 'A determination written as a promise about the future. Say what the rules usually do and what nothing assumes.',
    scope: VOICE_TREES,
  },
  {
    id: 'duty-detachment-determined',
    tokens: ['obligations', GAP, 'do', 'not', 'attach'],
    invariant: DETERMINATION_INVARIANT,
    why: 'Applies a rule to facts DelayPilot has not seen. Which duties attach is the airline or the regulator to decide.',
    scope: VOICE_TREES,
  },
  {
    id: 'claim-possibility-denied',
    tokens: ['you', GAP, 'cannot', 'claim'],
    invariant: DETERMINATION_INVARIANT,
    why: 'Closes a route the reader may still have. Anchored on the traveler, so a statement about what DelayPilot itself cannot do stays flat.',
    scope: VOICE_TREES,
  },
  {
    id: 'outcome-denied',
    tokens: ['you', 'will', 'not', GAP, 'get'],
    invariant: DETERMINATION_INVARIANT,
    why: 'A prediction of a negative outcome stated as fact, which is the same fabrication as predicting a positive one.',
    scope: VOICE_TREES,
  },
  {
    id: 'entitlement-denied',
    tokens: ['not', 'entitled', 'to'],
    invariant: DETERMINATION_INVARIANT,
    why: 'The mirror of the banned entitlement claim. Neither direction is DelayPilot to state; the permitted register is "may apply".',
    scope: VOICE_TREES,
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

/**
 * The phrase as a human reads it, for the CLI output. Built at call time, never stored.
 *
 * An elastic join prints as `*`, and a negation-aware one as `*+`, so a reader of a hit can see
 * which joins were allowed to stretch. The hit also carries the text as it really appears, which is
 * the thing to read first; this line is the pattern, not the sentence.
 */
export function phraseText(phrase: ForbiddenPhrase): string {
  return phrase.tokens.map((token) => (token === GAP_NO_NEGATION ? '*+' : token)).join(' ')
}
