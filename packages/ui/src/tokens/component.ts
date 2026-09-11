/**
 * Layer 3 — component tokens.
 *
 * Every entry is an alias onto a SEMANTIC token, emitted as `var(--semantic-name)`. No literal
 * colour, no primitive ramp step. The layering rule is mechanical: `test/tokens.test.ts` fails if a
 * component token names anything that is not in semanticColors.
 *
 * Three families live here. Two are vocabularies the product fixes, not palettes:
 *
 *  - **Provenance chips** — the six `AGENTS.md §1.2` variants. `Live` is safe-toned with a filled
 *    dot; `Cached` is neutral (sunken surface, interactive boundary) so it cannot be read as a
 *    status; `Stale` is watch-toned and carries an age; `Demo` is deliberately built from none of
 *    the status hues — a 2px dashed boundary over a hatched fill — because a Demo chip mistaken for
 *    `Live` is the single most expensive confusion this system can produce; `Unavailable` and
 *    `Heuristic risk band` are both unknown-toned and are separated by glyph, width and label.
 *
 *  - **Severity** — `DIRECTIVE.md §16` maps `info`/`watch`/`urgent`/`resolved` onto the same four
 *    status tones. `info` takes the unknown tones because they are neutral slate, which is the
 *    right weight for a routine schedule or gate detail; it never introduces a fifth colour.
 *
 * The third family exists for a different reason. `--skeleton-bg` and `--progress-track-border`
 * name two surfaces that used to share one registry entry, which let a single measured pair be
 * declared decorative for the skeleton (true: a placeholder identifies nothing) while silently
 * carrying the scale of a meter (false: the unfilled part of a meter is what a reading is read
 * against). `docs/ACCESSIBILITY.md` B2 rejected that. Separate names mean the exemption in
 * `pairs.ts` reaches exactly one component, and the meter states its own 3:1 boundary.
 */

import { type SemanticColorName, semanticColors } from './semantic.ts'

export interface ComponentColor {
  readonly ref: SemanticColorName
  readonly note: string
}

const component = <T extends Record<string, ComponentColor>>(t: T): T => {
  for (const [name, entry] of Object.entries(t)) {
    if (!(entry.ref in semanticColors)) {
      throw new Error(
        `Component token --${name} names "${entry.ref}", which is not a semantic token. ` +
          `Components reference the semantic layer only.`,
      )
    }
  }
  return t
}

export const componentColors = component({
  // --- Provenance chips (AGENTS.md §1.2). Six variants, all with visible text. ---
  'chip-live-fg': { ref: 'status-safe-fg', note: 'Live: a licensed provider responded fresh.' },
  'chip-live-bg': { ref: 'status-safe-bg', note: 'Live fill.' },
  'chip-live-border': { ref: 'status-safe-border', note: 'Live boundary and filled dot.' },

  'chip-cached-fg': {
    ref: 'text-secondary',
    note: 'Cached: neutral, so it cannot read as a status.',
  },
  'chip-cached-bg': { ref: 'surface-sunken', note: 'Cached fill.' },
  'chip-cached-border': { ref: 'border-interactive', note: 'Cached boundary and hollow dot.' },

  'chip-stale-fg': {
    ref: 'status-watch-fg',
    note: 'Stale: past the freshness threshold, still shown.',
  },
  'chip-stale-bg': { ref: 'status-watch-bg', note: 'Stale fill.' },
  'chip-stale-border': { ref: 'status-watch-border', note: 'Stale boundary and half dot.' },

  'chip-demo-fg': {
    ref: 'text-primary',
    note: 'Demo: fixture data. Deliberately not status-toned.',
  },
  'chip-demo-bg': { ref: 'surface-card', note: 'Demo base fill, under the hatch.' },
  'chip-demo-border': {
    ref: 'border-interactive',
    note: 'Demo boundary: 2px dashed, never solid.',
  },
  'chip-demo-hatch': {
    ref: 'border-hairline',
    note: 'Demo diagonal hatch: texture, not signal. It measures 1.24:1 light / 1.14:1 dark on the chip fill, so what actually separates Demo from Live is the 2px DASHED --chip-demo-border (4.73:1 / 3.79:1), the square hatched-swatch glyph, the square corners and the word itself. Chosen so both text tones still clear 4.5:1 where a stripe falls under a glyph.',
  },

  'chip-unavailable-fg': {
    ref: 'status-unknown-fg',
    note: 'Unavailable: no trustworthy response.',
  },
  'chip-unavailable-bg': { ref: 'status-unknown-bg', note: 'Unavailable fill.' },
  'chip-unavailable-border': {
    ref: 'status-unknown-border',
    note: 'Unavailable boundary and slashed dot.',
  },

  'chip-heuristic-fg': {
    ref: 'status-unknown-fg',
    note: 'Heuristic risk band: no calibrated model is deployed. Never styled like a probability.',
  },
  'chip-heuristic-bg': { ref: 'status-unknown-bg', note: 'Heuristic risk band fill.' },
  'chip-heuristic-border': {
    ref: 'status-unknown-border',
    note: 'Heuristic risk band boundary and band glyph.',
  },

  // --- Severity (DIRECTIVE.md §16) mapped onto the four status tones. ---
  'severity-info-fg': { ref: 'status-unknown-fg', note: 'info → neutral slate.' },
  'severity-info-bg': { ref: 'status-unknown-bg', note: 'info fill.' },
  'severity-info-border': { ref: 'status-unknown-border', note: 'info boundary.' },

  'severity-watch-fg': { ref: 'status-watch-fg', note: 'watch → watch.' },
  'severity-watch-bg': { ref: 'status-watch-bg', note: 'watch fill.' },
  'severity-watch-border': { ref: 'status-watch-border', note: 'watch boundary.' },

  'severity-urgent-fg': { ref: 'status-critical-fg', note: 'urgent → critical.' },
  'severity-urgent-bg': { ref: 'status-critical-bg', note: 'urgent fill.' },
  'severity-urgent-border': { ref: 'status-critical-border', note: 'urgent boundary.' },

  'severity-resolved-fg': { ref: 'status-safe-fg', note: 'resolved → safe.' },
  'severity-resolved-bg': { ref: 'status-safe-bg', note: 'resolved fill.' },
  'severity-resolved-border': { ref: 'status-safe-border', note: 'resolved boundary.' },

  // --- Two surfaces that must not share one registry entry (ACCESSIBILITY.md B2). ---
  'skeleton-bg': {
    ref: 'surface-sunken',
    note: 'Skeleton block. The one genuinely decorative fill in the system: it reserves space, identifies nothing, and its accessible name is a VisuallyHidden string.',
  },
  'progress-track-border': {
    ref: 'border-interactive',
    note: 'The 1px outline of a ProgressBar track. The track fill is transparent; this boundary is what makes the unfilled part of the meter perceivable, and it is held to 3:1 on every surface in both themes.',
  },
})

export type ComponentColorName = keyof typeof componentColors

export const componentColorNames = Object.keys(componentColors) as ComponentColorName[]
