/**
 * The disposition of axe `incomplete` results — `docs/ACCESSIBILITY.md §16.4`, finding F47.
 *
 * Owner: qa-test-architect. The dispositions are `accessibility-lead`'s measurements, cited here;
 * nothing in this file decides whether a node passes, and nothing in it waives one.
 *
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * AN `incomplete` IS A RULE THAT STOPPED GATING.
 *
 * axe returns `incomplete` when it cannot decide. For `color-contrast` that happens when it cannot
 * resolve the background behind the text — and the practical consequence is that any gradient,
 * overlap or transparency behind body copy converts a VIOLATION into an INCOMPLETE, which is a
 * result nothing fails on. So the number is only as meaningful as the disposition attached to it,
 * and until §16.4 the disposition this runner printed was wrong.
 *
 * What it printed: `route × rule × runs`, pointing every one of the 20 results at §15.9 — the
 * z-index:-1 motif overlap. What §16.4 measured from rendered pixels, in both themes: 89 nodes per
 * theme in THREE classes, not one, and four of the five routes named contain no overlap-class node
 * at all. Since the count printed is `rule × runs`, the node population — the one quantity that
 * actually moved, 63 → 70 on `/` — was invisible in every line of the output.
 *
 * So this file does three things the old output could not:
 *
 *   1. classifies every node by the axe `message` that produced it, which is what distinguishes
 *      the three classes;
 *   2. carries the disposition PER CLASS, with the measurement behind it, so a reader of the output
 *      is told which pixels were measured and by whom rather than being pointed at a section that
 *      does not address their node;
 *   3. makes an UNKNOWN class blocking. A class nobody has dispositioned is a contrast question
 *      nobody has answered — the gate's job is to say so, not to add it to a total.
 *
 * A KNOWN class whose node count has changed is printed as a re-measurement request and does not
 * fail the run. That is a deliberate line and it is worth stating plainly: failing on growth would
 * turn "add one more `Demo` provenance chip" into a red build that only `accessibility-lead` can
 * clear, since the measurement is theirs and `docs/ACCESSIBILITY.md` is theirs — a cross-agent
 * deadlock on a node class already measured at 15.21:1. The count is recorded in `baseline.json`
 * and any change is printed, so it is visible rather than silent; that is the property F47 says is
 * missing. If `accessibility-lead` wants growth to block, it is one constant in `coverage.mjs`.
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 */

/**
 * @typedef {object} IncompleteClass
 * @property {string} id            stable key recorded in `baseline.json`
 * @property {RegExp} match         tested against the axe node message
 * @property {string} what          what the class physically is, in this build
 * @property {string} disposition   who measured it, how, and what the result was
 */

/**
 * The three classes measured on this tree. Counts in the prose are per run, per `§16.4`, and the
 * runner re-counts them every run rather than trusting these numbers.
 *
 * @type {IncompleteClass[]}
 */
export const INCOMPLETE_CLASSES = [
  {
    id: 'overlapped',
    match: /overlapped by another element/i,
    what: 'text over the `z-index: -1` ambient motif layer — the theme pills and the lookup card, `/` only',
    disposition:
      'measured from rendered pixels in both themes, §15.9 and re-measured in §16.4: worst 4.58:1 ' +
      'light, 5.27:1 dark, against a 4.5:1 floor with no large-text allowance. Zero below floor.',
  },
  {
    id: 'gradient',
    match: /background gradient/i,
    what: 'the `Demo` provenance chip, whose `repeating-linear-gradient` hatch sits behind the label',
    disposition:
      '§15.9 does NOT address this class — §16.4 does, and it is the majority of the nodes. ' +
      'Measured from pixels by forcing the glyphs transparent and diffing: 15.21:1 light, ' +
      "15.09:1 dark, which is §4.1's `--text-primary` on `--border-hairline` row. Zero below floor.",
  },
  {
    id: 'non-text',
    match: /only non-text characters/i,
    what: 'the `→` route arrows, every one of them `aria-hidden="true"`',
    disposition:
      '§16.4: decorative glyphs, out of the accessibility tree, and measured anyway — worst ' +
      '5.70:1 light, 5.27:1 dark. Zero below floor.',
  },
]

/** The id used for a node whose message matches no class above. Blocking — see the header. */
export const UNMEASURED = 'unmeasured'

/**
 * Classify one node's messages.
 *
 * @param {string} message the node's `any` / `all` / `none` messages, joined
 * @returns {string} a class id, or `UNMEASURED`
 */
export function classifyIncompleteNode(message) {
  for (const entry of INCOMPLETE_CLASSES) {
    if (entry.match.test(message)) return entry.id
  }
  return UNMEASURED
}

/**
 * The disposition line for a class id, for printing beside its count.
 *
 * @param {string} id
 * @returns {string}
 */
export function dispositionFor(id) {
  const entry = INCOMPLETE_CLASSES.find((candidate) => candidate.id === id)
  if (entry === undefined) {
    return (
      'NO DISPOSITION. This message class is not one of the three docs/ACCESSIBILITY.md §16.4 ' +
      'measured, so nobody has answered the contrast question it raises. axe returns `incomplete` ' +
      'instead of `violation` when it cannot resolve a background, so this is a rule that has ' +
      'stopped gating on these nodes. Owner: accessibility-lead — measure the nodes from pixels ' +
      'and rule on them; then this class joins INCOMPLETE_CLASSES with its measurement.'
    )
  }
  return `${entry.what} — ${entry.disposition}`
}
