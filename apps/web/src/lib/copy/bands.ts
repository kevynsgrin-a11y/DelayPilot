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
  const whole = Math.round(value)
  return `${String(whole)} ${whole === 1 || whole === -1 ? 'minute' : 'minutes'}`
}

/**
 * The connection meter reading: how much of the required transfer time the available time covers.
 *
 * "18 of 45 minutes" when both are known. When one is missing, the reading names WHICH one is
 * missing rather than collapsing both into a single vague word — a traveler who knows the required
 * time is unknown can go and ask for it, and a traveler who reads only "Slack unknown" cannot.
 *
 * None of the four return values equals any band label (F24).
 */
export function slackValueText(
  availableMinutes: number | null,
  requiredMinutes: number | null,
): string {
  if (availableMinutes === null && requiredMinutes === null) return 'Slack unknown'
  if (requiredMinutes === null) return 'Required transfer time unknown'
  if (availableMinutes === null) return 'Available connection time unknown'
  return `${String(Math.round(availableMinutes))} of ${minutesPhrase(requiredMinutes)}`
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
