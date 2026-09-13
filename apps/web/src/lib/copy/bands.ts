/**
 * Band words and meter readings. Owner: `ux-copy-steward`.
 *
 * These are the strings `packages/ui` `ProgressBar` and `StatusPill` take as `bandLabel` and
 * `valueText`. The primitive never edits copy — it joins the two with a separator and puts the
 * result in `aria-valuetext` — so the two strings have to make a readable sentence TOGETHER.
 *
 * F24 (`docs/ACCESSIBILITY.md §2.2`). The Phase 9 reviewer rendered the unknown state and got
 * `aria-valuetext="Unknown, Unknown"`. `unknown` is a designed state (`AGENTS.md §1.1`) and
 * stuttering it is a poor rendering of the one state a traveler most needs to trust. The fix is
 * here, in the strings, and it is a rule rather than a patch:
 *
 *   **No `valueText` may ever equal its `bandLabel`, in any state.**
 *
 * So an unknown reading names the missing quantity — "Slack unknown", "Delay unknown" — and the
 * band stays "Unknown". The announcement becomes "Slack unknown, Unknown": the fact first, the band
 * second, no repetition. `copy.test.ts` asserts the rule across every band and every null
 * combination, so a future string cannot re-introduce the collision.
 *
 * The S3 review extended that rule (`docs/VOICE.md §9.1`): a reading may not equal the meter's
 * accessible NAME either. `ProgressBar` renders `label` as `aria-label` and `valueText` as both the
 * visible readout and half of `aria-valuetext`, so passing one string as both makes a screen reader
 * say the same phrase twice in one announcement — the F24 defect wearing different clothes.
 *
 * THE READING NAMES THE QUANTITY THE BAR DRAWS, IN THE BAR'S DIRECTION. A meter that fills required
 * of available takes `requiredOfAvailableText`. Words that state the inverse of the bar beside them
 * are worse than no words: the picture and the sentence disagree, and the reader has no way to tell
 * which one is wrong.
 *
 * NO NUMBER IS WRITTEN INTO A STRING. Every figure below arrives as an argument, from a value that
 * carried provenance and a calibration flag to get here (`AGENTS.md §1.1`, §1.2). There is no
 * percentage, in any channel, on any meter — the band IS the output when no calibrated model is
 * deployed (`DIRECTIVE.md §18.5`).
 */

/** The five result bands of `DIRECTIVE.md §17` / `§27`. */
export type Band = 'on_track' | 'watch' | 'at_risk' | 'disrupted' | 'unknown'

export const bandOrder: readonly Band[] = ['on_track', 'watch', 'at_risk', 'disrupted', 'unknown']

const BAND_LABELS: Readonly<Record<Band, string>> = {
  on_track: 'On track',
  watch: 'Watch',
  at_risk: 'At risk',
  disrupted: 'Disrupted',
  unknown: 'Unknown',
}

/** The band as a visible word. Never carried by hue alone (`DIRECTIVE.md §7`). */
export function bandLabel(band: Band): string {
  return BAND_LABELS[band]
}

const BAND_DESCRIPTIONS: Readonly<Record<Band, string>> = {
  on_track: 'No major disruption signal is visible right now.',
  watch: 'Conditions are changing. Review the factors and keep alerts on.',
  at_risk: 'Your itinerary has less room for recovery. Here are the most useful steps now.',
  disrupted: 'A material disruption is confirmed. Start with the action checklist below.',
  unknown: 'We do not have enough fresh information to make a reliable assessment.',
}

/**
 * The `DIRECTIVE.md §27` sentence for a band, so a caller cannot pair the wrong band with the
 * wrong result line. The five strings are identical to `results.onTrack` … `results.unknown` and
 * `copy.test.ts` asserts that identity in both directions.
 */
export function bandDescription(band: Band): string {
  return BAND_DESCRIPTIONS[band]
}

function minutesPhrase(value: number): string {
  const whole = Math.round(Math.abs(value))
  return `${String(whole)} ${whole === 1 ? 'minute' : 'minutes'}`
}

/**
 * A duration in minutes, as a phrase. THE ONLY PLACE THE WORDS "minute" AND "minutes" ARE WRITTEN.
 *
 * It exists because the adapter was writing them: `pattern-copy.ts` carried its own `minutesWord`
 * helper, which put two rendered words outside this module and outside one owner's hands. An
 * adapter may compose copy exports; it may not author them (`docs/VOICE.md §12`).
 *
 * @param minutes a duration — the transfer components, the available window, the required time
 *
 * A NEGATIVE DURATION IS SPELLED, NEVER DRAWN. `-18` renders "minus 18 minutes", not "-18 minutes".
 * A hyphen-minus is one glyph that assistive technology may drop or read inconsistently, and the
 * value it flips is usually the one that decides whether a connection works. No reading from this
 * module ever depends on it.
 *
 * A signed quantity should not arrive here at all — the only one on the connection surface is
 * slack, and slack has its own sentence in `slackMinutesText`. This branch is the floor under a
 * mis-routed value, not the intended path. A copy function never throws inside a render.
 */
export function minutesText(minutes: number): string {
  const whole = Math.round(minutes)
  return whole < 0 ? `minus ${minutesPhrase(whole)}` : minutesPhrase(whole)
}

/**
 * The Slack row's reading: available time minus required transfer time, in words.
 *
 * WHY THIS IS NOT `minutesText`. Slack is the one signed quantity on the connection surface and the
 * most consequential value on it — negative slack means the connection does not work as scheduled.
 * Rendered through the shared duration helper it read "-18 minutes", which put the entire meaning
 * of the row on a single hyphen: drop the glyph and "18 minutes" says the opposite of the truth, to
 * the reader least able to check it. So the sign is carried by a word.
 *
 * @param minutes slack in minutes, or `null` when either input to it is unknown
 *
 * | Input | Reading             | Why                                                        |
 * | ----- | ------------------- | ---------------------------------------------------------- |
 * | `18`  | 18 minutes of slack | The quantity first, matching the tabular column it sits in |
 * | `0`   | No slack            | Exactly none, and known to be none. Not "0 minutes"        |
 * | `-18` | 18 minutes short    | Short of what the transfer needs. No glyph carries it      |
 * | `null`| Slack unknown       | A statement about our information, not about the transfer  |
 *
 * `null` is not zero (`AGENTS.md §1.1`): "No slack" says the connection has none, "Slack unknown"
 * says we do not know. The `null` branch is worded identically to `requiredOfAvailableText(null,
 * null)` so the meter and the row beneath it name the same missing fact the same way.
 *
 * No branch equals a band label or a meter name (F24, `docs/VOICE.md §9.1`), and no branch writes a
 * number into a string — every figure arrives as the argument.
 */
export function slackMinutesText(minutes: number | null): string {
  if (minutes === null) return 'Slack unknown'
  const whole = Math.round(minutes)
  if (whole === 0) return 'No slack'
  if (whole < 0) return `${minutesPhrase(whole)} short`
  return `${minutesPhrase(whole)} of slack`
}

/**
 * THE READING NAMES THE QUANTITY THE BAR DRAWS, IN THE BAR'S DIRECTION.
 *
 * `ConnectionCockpit` fills its meter `value={requiredMinutes}` of `max={availableMinutes}` — how
 * much of the window the transfer eats, so a nearly-full bar means nearly no room. A reading that
 * says the other ratio beside it contradicts the picture: on the demonstration itinerary, 44
 * minutes required inside a 51-minute window drew a bar at 86 % under the words "51 of 44 minutes",
 * which a tired reader can only take as fifty-one minutes needed out of forty-four available — the
 * exact inverse of the seven minutes of slack stated in the row below.
 *
 * So this is the reading for that meter: required first, available second, "44 of 51 minutes". It
 * is written out rather than wrapped around an inverse function with the arguments swapped, because
 * a swap is what produced the defect and a swap is invisible at the call site. The inverse reading
 * was retired in the S3 review for want of a caller (`docs/VOICE.md §9.3`).
 *
 * @param requiredMinutes the transfer time this connection needs — what the bar fills TO
 * @param availableMinutes the time between gate-in and gate-close — what the bar fills WITHIN
 *
 * The three unknown branches name WHICH quantity is missing, and are deliberately NOT swapped with
 * the arguments: "Required transfer time unknown" is true regardless of which ratio the bar draws,
 * and rewording it by direction would name the wrong missing fact. No branch returns a bare
 * "Unknown", and none equals a band label (F24).
 */
export function requiredOfAvailableText(
  requiredMinutes: number | null,
  availableMinutes: number | null,
): string {
  if (requiredMinutes === null && availableMinutes === null) return 'Slack unknown'
  if (requiredMinutes === null) return 'Required transfer time unknown'
  if (availableMinutes === null) return 'Available connection time unknown'
  // Through `minutesText`, not the private helper: a window that somehow arrives negative is
  // spelled rather than drawn, for the reason in that function's note.
  return `${String(Math.round(requiredMinutes))} of ${minutesText(availableMinutes)}`
}

/**
 * The delay reading for a segment.
 *
 * @param minutes the delay against schedule, or `null` when none has been reported
 * @param estimated `true` when the figure is derived rather than observed. An estimate says so in
 *   the reading itself; a label that only appears elsewhere on the page is a label a reader can
 *   miss (`AGENTS.md §1.2`).
 *
 * `null` is not zero. "No delay reported" is a statement about the flight; "Delay unknown" is a
 * statement about our information. Rendering the second as the first is the fabrication in
 * `AGENTS.md §1.1`.
 */
export function delayValueText(minutes: number | null, estimated = false): string {
  if (minutes === null) return 'Delay unknown'
  const whole = Math.round(minutes)
  if (whole === 0) return estimated ? 'No delay estimated' : 'No delay reported'
  if (whole < 0) {
    const ahead = minutesPhrase(Math.abs(whole))
    return estimated ? `Estimated ${ahead} ahead of schedule` : `${ahead} ahead of schedule`
  }
  const late = minutesPhrase(whole)
  return estimated ? `Estimated delay ${late}` : `Delayed ${late}`
}
