/**
 * ProvenanceChip — the six labels of `AGENTS.md §1.2`, and only those six.
 *
 *   Live · Cached · Stale · Demo · Unavailable · Heuristic risk band
 *
 * No synonyms, no softening, no icon-only variant: every chip renders its label as visible text,
 * taken from `provenanceLabels`, which transcribes the constitution's table. A seventh variant is
 * a defect, not a feature.
 *
 * `Demo` is built from none of the status hues, because a Demo chip mistaken for `Live` is the most
 * expensive confusion this system can produce. What carries that separation, in order of how much
 * of the work each does: the word itself, a 2px DASHED boundary in --chip-demo-border (4.73:1 light
 * / 3.79:1 dark on a card, against Live's 1px solid), square corners where Live is a pill, and a
 * square hatched-swatch glyph where Live is a filled dot. The diagonal hatch on the fill is texture
 * only — it measures 1.24:1 / 1.14:1 and must not be counted as a signal (`docs/ACCESSIBILITY.md`
 * F11). Its caller must still ship the "Demo data — not a live flight." string alongside
 * (`AGENTS.md §1.2`); that sentence is copy, and copy is ux-copy-steward's.
 *
 * `freshness` is laid out to WRAP, never to truncate: "Updated 6 minutes ago from [source]" has to
 * survive at 375px, and an ellipsis in the middle of a timestamp is a dropped datum.
 */

import type { JSX } from 'react'
import { cx } from './class-names.ts'
import { Icon, type IconName } from './Icon.tsx'
import { type InterimProvenanceKind, provenanceLabels } from '../tokens/interim-contracts.ts'

const CHIP_ICON: Readonly<Record<InterimProvenanceKind, IconName>> = {
  live: 'provenance-live',
  cached: 'provenance-cached',
  stale: 'provenance-stale',
  demo: 'provenance-demo',
  unavailable: 'provenance-unavailable',
  heuristic: 'provenance-heuristic',
}

export interface ProvenanceChipProps {
  readonly kind: InterimProvenanceKind
  /**
   * Freshness, as supplied by the caller — an age, a source id, a timestamp. Never generated here:
   * a primitive that formatted a time would be deciding what "recent" means.
   */
  readonly freshness?: string
  readonly className?: string
}

export function ProvenanceChip({ kind, freshness, className }: ProvenanceChipProps): JSX.Element {
  return (
    <span className={cx('dp-chip', `dp-chip--${kind}`, className)} data-provenance={kind}>
      <Icon name={CHIP_ICON[kind]} decorative className="dp-chip__icon" />
      <span className="dp-chip__label">{provenanceLabels[kind]}</span>
      {freshness === undefined ? null : (
        <span className="dp-chip__freshness tnum">{freshness}</span>
      )}
    </span>
  )
}
