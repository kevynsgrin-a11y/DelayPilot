# DelayPilot accessibility conformance

**Owner:** `accessibility-lead`. This is the only file this agent writes; every defect below is a
finding filed against another agent's path, never a patch (`AGENTS.md §3.5`).

**Standard:** WCAG 2.2 Level AA (`DIRECTIVE.md §7` accessibility floor). Two DelayPilot rules are
stricter than WCAG and are applied throughout: the 3:1 large-text allowance of SC 1.4.3 is never
used, and the touch-target floor is 44 × 44 px, not the 24 × 24 px of SC 2.5.8 (`DIRECTIVE.md §18.7`).

**Reviewed:** 2026-09-11, in three passes. **Branch:** `claude/intelligent-knuth-d3s8za`.
**This revision describes the tree at `9dd1f75`.**

| Pass                        | Tree      | Verdict                                                           |
| --------------------------- | --------- | ----------------------------------------------------------------- |
| First                       | `159ef48` | BLOCKED — 6 blockers, 17 findings                                 |
| Re-review after remediation | `63005a3` | BLOCKED — 1 blocker (B7, created by the fix for B3); B1–B6 closed |
| B7 re-review                | `9dd1f75` | **GREEN**                                                         |

The first pass read the artefacts from the working tree; they were committed during it as `4491ab6`
(design system), `0977dc9` (mark and asset pipeline) and `159ef48` (concept boards), merged at
`2053e95`, byte-identical before and after. `brand-design-director` then closed the six blockers and
thirteen findings in `363bce7`, `visual-asset-director` closed one in `63005a3`, and B7 was closed in
`9dd1f75`. Every claim made by those agents about their own fixes was re-verified here from the code,
from rendered markup and by re-measuring the ratios; none was accepted on the strength of a report.

**Scope of this revision: DIRECTIVE.md Phase 9 only** — design tokens, measured contrast, the focus
system, reduced motion, the accessible semantics of the `@delaypilot/ui` primitives as rendered
markup, the brand mark's legibility, and the motif text-equivalent inventory. Route-level axe,
per-route keyboard passes, screen-reader passes, 200 % zoom and text-spacing passes are **Phase 12**
and are recorded below as `Not run` with the reason. Nothing in this document certifies a route.

---

## 1. Verdict — Phase 9

> **VERDICT: GREEN.** Phase 9 passes its exit gate with no open blocker. Scope is Phase 9 only —
> tokens, contrast, focus, reduced motion, primitive semantics, the mark and the motifs. This is not
> a conformance claim for any route; that is Phase 12, and §10.2 records every one of those cells as
> `Not run` with its reason.

The exit gate as written — "every token pair used for text/UI meets WCAG 2.2 AA in both themes,
verified by a contrast test, not by eye; mark legible at 16 px" — is met, and is met by a registry
that covers what the components actually render:

- I re-measured **101 unique rendered pairs in both themes, 202 measurements, zero below floor**,
  from the shipped stylesheet, with an implementation of the WCAG 2.2 arithmetic written from the
  definitions rather than borrowed from the builder (§4). The registry grew from 94 to 103 entries
  and now contains every pair my re-derivation from `primitives.css` produces.
- The mark artwork is byte-identical to the first pass, so the 16 px legibility decision in §8
  stands unaltered.
- Every primitive that carries a status, a severity, a band or a provenance value delivers it in
  **both** channels — as visible text with a non-colour cue, and in the accessibility tree.

It took three passes to get here. Seven blockers were raised and closed: six in the first pass, and
one (B7) created by the fix for another, which is the ordinary way a fix goes wrong and the reason
the reviewer looks again rather than accepting a report.

Four findings remain open by design, all of them belonging to later phases and other owners — F15,
F22, F23, and F24 raised at the B7 re-review. None is a Phase 9 defect and none blocks this gate.

### Status of the blockers

| #                                 | Status                                  | Verified how                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1 active combobox option         | **Resolved 2026-09-11**                 | Rule read at `primitives.css:548`; inversion to `--accent-bg` / `--text-on-accent` re-measured at **5.72:1 light, 9.04:1 dark** against the listbox fill and **5.09 / 8.01** against an adjacent selected row; label on the fill 5.72 / 9.90. Selected-vs-active precedence confirmed by specificity (both (0,2,0)) and source order (536 before 548), and by rendering an option that is both.                                                                                                                                  |
| B2 ProgressBar track              | **Resolved 2026-09-11**                 | Track fill is now `transparent` with a 1px `--progress-track-border` outline; re-measured **4.30 / 4.73 / 4.56 / 3.80 light** and **4.15 / 3.79 / 3.30 / 3.99 dark** across base, card, elevated and sunken. The pair is registered as `ui-boundary`; the skeleton keeps its exemption under a new `--skeleton-bg` name, narrowed in writing to the skeleton alone.                                                                                                                                                              |
| B3 ProgressBar readout            | **Resolved 2026-09-11**, but see **B7** | Rendered markup now carries `<span class="dp-progress__value">18 of 45 minutes</span>` and a `dp-progress__band` with a triangle glyph and the word `Watch`. `bandLabel` is a required prop. The visual channel is fixed; the programmatic one is B7.                                                                                                                                                                                                                                                                            |
| B4 Skeleton live region           | **Resolved 2026-09-11**                 | Default render contains no `role="status"`, no `aria-live`, no `role="alert"` — confirmed from markup. `live` is opt-in, documented as "at most one per view", with `aria-busy` on the region named as the correct wiring. Two tests lock both directions.                                                                                                                                                                                                                                                                       |
| B5 Tooltip                        | **Resolved 2026-09-11**                 | Escape is now bound to `document` in the capture phase while open and unbound on close (`bindTooltipDismiss`), so a hover-opened tooltip is dismissible with focus elsewhere; `stopPropagation` keeps a tooltip inside a dialog from closing the dialog too. The 8px dead gap is bridged by `.dp-tooltip__bubble::before` at `inset-block-start: 100%; block-size: var(--space-8)`, which is exactly the gap.                                                                                                                    |
| B6 DataTable scroll container     | **Resolved 2026-09-11**                 | Rendered markup: `<div class="dp-table" role="region" aria-labelledby="…" tabindex="0">` with the `<caption>` carrying the referenced id. Applied unconditionally, as specified.                                                                                                                                                                                                                                                                                                                                                 |
| B7 ProgressBar band not announced | **Resolved 2026-09-11**                 | Rendered three fixture states myself: `aria-valuetext="18 of 45 minutes, Watch"`, `"44 of 45 minutes, Critical"`, `"Unknown, Unknown"`. The band now reaches the accessibility tree, the visible readout still carries both strings (B3 holds), and the joined string is the caller's copy plus a separator — nothing is composed by the primitive. The test asserts both channels: strip every `aria-*` and both words survive as text, then read `aria-valuetext` back and require it to be exactly `18 of 45 minutes, Watch`. |

### B1 — The active option in a combobox has no perceivable indicator — RESOLVED 2026-09-11

The finding as originally written is kept below as the record; the fix and my re-verification of
it are in the status table above.

|       |                                                                                                                                    |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| File  | `packages/ui/src/primitives/primitives.css:528-532` (`.dp-combobox__option.is-active, .dp-combobox__option[aria-selected='true']`) |
| SC    | 2.4.7 Focus Visible (AA); 1.4.11 Non-text Contrast (AA)                                                                            |
| Owner | `brand-design-director`                                                                                                            |

**Observed.** The rule sets `background-color: var(--accent-subtle-bg)` and
`color: var(--text-primary)`. The option's text colour is already `--text-primary` by inheritance,
so the colour declaration changes nothing, and the tint is the whole indicator. Measured:

- light `#e5f4fd` on `#ffffff` = **1.12:1**
- dark `#062438` on `#0b1728` = **1.12:1**

`Combobox.tsx` implements the `aria-activedescendant` pattern, so DOM focus never leaves the input.
That tint is therefore the _only_ visual signal of which option Enter will commit. At 1.12:1 there is
effectively no signal. This is the product's primary entry point — the flight lookup — and it is the
one control a traveler uses under time pressure.

**Required.** The active option must carry an indicator measuring ≥ 3:1 against both the listbox fill
and an adjacent inactive row. A tint alone cannot reach that without failing SC 1.4.3 for the text on
top of it, so the indicator must be a shape: a 2px `--border-accent` inline-start bar, a full
`--accent-bg` / `--text-on-accent` inversion, or an equivalent. Register the resulting pair in
`pairs.ts` with usage `ui-boundary`.

### B2 — The ProgressBar track is invisible, so the meter has no scale — RESOLVED 2026-09-11

The finding as originally written is kept below as the record; the fix and my re-verification of
it are in the status table above.

|       |                                                                                                                                                                                  |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| File  | `packages/ui/src/primitives/primitives.css:957-963` (`.dp-progress__track`); `packages/ui/src/tokens/pairs.ts` (the `--surface-sunken` on `--surface-card` decorative exemption) |
| SC    | 1.4.11 Non-text Contrast (AA), "Graphical Objects"                                                                                                                               |
| Owner | `brand-design-director`                                                                                                                                                          |

**Observed.** The track is `background-color: var(--surface-sunken)`. Measured against the surfaces a
meter sits on:

| track vs             |  light |   dark |
| -------------------- | -----: | -----: |
| `--surface-card`     | 1.24:1 | 1.05:1 |
| `--surface-base`     | 1.13:1 | 1.04:1 |
| `--surface-elevated` | 1.19:1 | 1.20:1 |

Only the filled portion is perceivable. The unfilled portion of a meter is the part that carries the
scale: without it, a 40 % reading and a 90 % reading are two coloured bars of different lengths with
nothing to be different _from_. SC 1.4.11 covers "parts of graphics required to understand the
content", and for the connection-slack meter that is exactly what the track is.

This is the one decorative exemption in `pairs.ts` I reject. The written reason — _"A skeleton
carries no information — its accessible name is a VisuallyHidden 'Loading' string, and it is never
the only route to the content"_ — is correct **for the skeleton**. The same token pair is also the
ProgressBar track (line 962) and the Switch OFF track (line 635), and the reason does not reach
either. A single pair cannot be simultaneously exempt and load-bearing; the meter track needs its own
token. (The Switch is fine as shipped: its `--border-interactive` boundary measures 4.73:1 light /
3.79:1 dark on a card, so the control is identifiable even though its fill is not.)

**Required.** Give `.dp-progress__track` a boundary or fill reaching ≥ 3:1 against `--surface-card`,
`--surface-base` and `--surface-elevated` in both themes — a 1px `--border-interactive` outline on
the track is sufficient and is already a measured pair. Then register the track pair in `pairs.ts`
with usage `ui-boundary`, leaving the skeleton exemption in place with its narrowed reason.

### B3 — The ProgressBar's value and band exist only in ARIA — RESOLVED 2026-09-11

The finding as originally written is kept below as the record; the fix and my re-verification of
it are in the status table above.

|       |                                                                |
| ----- | -------------------------------------------------------------- |
| File  | `packages/ui/src/primitives/ProgressBar.tsx:30-60`             |
| SC    | 1.4.1 Use of Color (A); `DIRECTIVE.md §7` "never colour alone" |
| Owner | `brand-design-director`                                        |

**Observed.** Rendered markup, from a real render of the primitive:

```html
<div
  class="dp-progress dp-progress--watch"
  role="progressbar"
  aria-label="Connection slack used"
  aria-valuemin="0"
  aria-valuemax="45"
  aria-valuenow="18"
  aria-valuetext="18 of 45 minutes"
>
  <span class="dp-progress__track"
    ><span class="dp-progress__fill" style="--dp-progress-fraction:0.4"></span
  ></span>
</div>
```

There is no text node anywhere in the component. `label` and `valueText` are required props, but both
land only in ARIA attributes, which are exposed to assistive technology and to nothing else. The band
(`safe` / `watch` / `critical` / `unknown`) is applied solely as the fill's hue by
`.dp-progress--{band} .dp-progress__fill`. A sighted user with a colour-vision deficiency, or anyone
reading in glare at a gate, gets a coloured bar of indeterminate extent (see B2) and no number.

The docblock states _"`valueText` is required so the meter is always readable as words"_. It is not:
`aria-valuetext` is not visible. `packages/ui/test/primitives.test.tsx:401-417` ("is a linear meter
with a text value, never a gauge") asserts only `aria-valuetext`, so the test does not catch this.

**Required.** Match the contract StatusPill already sets — it requires a _visible_ `label` for exactly
this reason. Render `valueText` as visible text inside the component (or require a visible-value slot
the caller must fill), and give the band a non-colour cue: the band name as a word, or a threshold
tick on the track. Update the test to assert the string appears outside an ARIA attribute.

### B4 — Every Skeleton is a live region — RESOLVED 2026-09-11

The finding as originally written is kept below as the record; the fix and my re-verification of
it are in the status table above.

|       |                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------- |
| File  | `packages/ui/src/primitives/Skeleton.tsx:28-44` (`role="status"` at line 40)                        |
| SC    | 4.1.3 Status Messages (AA), misapplied; `DIRECTIVE.md §7` "`aria-live` only for meaningful changes" |
| Owner | `brand-design-director`                                                                             |

**Observed.** `role="status"` is hard-coded on the skeleton element, with no prop to opt out:

```html
<span
  class="dp-skeleton dp-skeleton--control"
  style="inline-size:12rem;block-size:1.5rem"
  role="status"
>
  <span class="dp-visually-hidden">Loading flight status</span>
</span>
```

`role="status"` carries an implicit `aria-live="polite"`. The cockpit of `DIRECTIVE.md §18.5` renders
a whole grid of placeholders; with this primitive that is one polite announcement per placeholder,
queued, every time a panel reloads — including on a background poll that returns identical data. A
skeleton → content swap is not a change in the recommended action, and announcing it is the exact
chatter this floor exists to prevent.

**Required.** The loading _region_ carries `aria-busy="true"`; the skeleton itself carries no live
role. Keep the VisuallyHidden label (it is a useful name for the placeholder) but drop `role="status"`
or make it opt-in via an explicit prop that the composing pattern sets at most once per view. Add a
test asserting the default render contains no `role="status"`, `aria-live` or `role="alert"`.

### B5 — The Tooltip is neither dismissible nor hoverable — RESOLVED 2026-09-11

The finding as originally written is kept below as the record; the fix and my re-verification of
it are in the status table above.

|       |                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------- |
| File  | `packages/ui/src/primitives/Tooltip.tsx:22-53`; `packages/ui/src/primitives/primitives.css:779-791` |
| SC    | 1.4.13 Content on Hover or Focus (AA)                                                               |
| Owner | `brand-design-director`                                                                             |

**Observed.** SC 1.4.13 requires all three of dismissible, hoverable and persistent. Two fail.

_Dismissible._ The Escape handler is `onKeyDown` on the wrapper `<span>`. React delivers that only
for events whose target is inside the span. When the tooltip was opened by `onPointerEnter` — the
hover case the SC is written about — keyboard focus is elsewhere, the keydown target is elsewhere, and
Escape never reaches the handler. The exception for content that "does not obscure or replace other
content" does not apply: `.dp-tooltip__bubble` is `position: absolute; z-index: 40` and overlays
whatever is above the trigger.

_Hoverable._ `.dp-tooltip__bubble` is positioned at `inset-block-end: calc(100% + var(--space-8))`,
so its bottom edge sits 8px above the top edge of the wrapper. That 8px belongs to neither the
trigger nor the bubble. Moving the pointer from trigger to bubble crosses it, `pointerleave` fires on
the wrapper, `setOpen(false)` runs and the bubble is removed before the pointer arrives. The content
cannot be reached with the mouse, which also means it cannot be selected, magnified or read with a
screen magnifier that follows the pointer.

**Required.** Move the Escape listener to `document` while open (removing it on close). Close the 8px
gap so the trigger and the bubble form one continuous hover target — padding on the bubble, or a
transparent bridge element — keeping the visual offset.

### B6 — The DataTable's scroll container is not keyboard operable — RESOLVED 2026-09-11

The finding as originally written is kept below as the record; the fix and my re-verification of
it are in the status table above.

|       |                                                                                                       |
| ----- | ----------------------------------------------------------------------------------------------------- |
| File  | `packages/ui/src/primitives/DataTable.tsx:33-41`; `packages/ui/src/primitives/primitives.css:876-882` |
| SC    | 2.1.1 Keyboard (A)                                                                                    |
| Owner | `brand-design-director`                                                                               |

**Observed.** `.dp-table` sets `overflow-x: auto` and the wrapper `<div>` receives no `tabindex`, no
`role` and no accessible name. Firefox and Chrome make scroll containers keyboard focusable by
default; Safari does not. On Safari — the browser half of the screen-reader pass runs on — a
keyboard-only user cannot scroll the receipts table, the status-change chronology or the transfer
breakdown horizontally, so columns past the fold are unreachable without a pointer. My charter names
all three of those tables specifically.

**Required.** When the container scrolls, expose it as a focusable region: `tabindex="0"`,
`role="region"` and an accessible name taken from the caption (`aria-labelledby` pointing at the
`<caption>`, which already exists and is required). Applying it unconditionally is acceptable and is
what the W3C tables tutorial recommends; a conditional implementation must not depend on a resize
listener that never fires on first paint.

### B7 — The ProgressBar's band word is visible but not in the accessibility tree — RESOLVED 2026-09-11

The finding as originally written is kept below as the record. My re-verification, and my judgement
of how it was fixed, are immediately after it.

|        |                                                                                |
| ------ | ------------------------------------------------------------------------------ |
| File   | `packages/ui/src/primitives/ProgressBar.tsx:76-89` (docblock claim at line 21) |
| SC     | 1.3.1 Info and Relationships (A)                                               |
| Owner  | `brand-design-director`                                                        |
| Raised | 2026-09-11, re-review. New — created by the fix for B3.                        |

**Observed.** The fix for B3 is correct as far as the eye goes: `valueText` and `bandLabel` are now
real text nodes. But they sit **inside** the element carrying `role="progressbar"`, and
`progressbar` is one of the WAI-ARIA roles whose children are presentational — browsers apply
`role="presentation"` to every descendant, so no text inside it reaches the accessibility tree. Only
the accessible name and the value do.

The primitive's own docblock states the consequence it then does not deliver:

> `role="progressbar"` has presentational children in WAI-ARIA 1.2, so the visible readout inside it
> is shown to the eye without being announced a second time; assistive technology reads `aria-label`
> and `aria-valuetext`, **which carry the same strings**.

They do not carry the same strings. From the rendered markup:

```html
<div role="progressbar" aria-label="Connection slack used" … aria-valuetext="18 of 45 minutes">
  <p class="dp-progress__readout">
    <span class="dp-progress__value">18 of 45 minutes</span>
    <span class="dp-progress__band"><svg aria-hidden="true">…</svg>Watch</span>
  </p>
</div>
```

`aria-label` carries `label`. `aria-valuetext` carries `valueText`. **`bandLabel` is carried by
nothing.** A sighted reader gets "18 of 45 minutes — ⚠ Watch"; a screen-reader user gets
"Connection slack used, 18 of 45 minutes" and never learns the band. The glyph is `aria-hidden`, the
hue is not programmatic, and the word is inside a presentational subtree, so all three of the band's
signals stop at the accessibility tree.

`bandLabel` is a **required** prop — the design itself asserts the band is essential information. On
the connection cockpit's slack meter the band is the recommended-action signal: it is the part that
says whether to run. Information presented visually that is not programmatically determinable is SC
1.3.1, and Level A failures are inside Level AA conformance.

This is not a regression against the first pass — the band was never announced — but it is now a
live defect rather than a latent one, because the band has become a rendered, required,
first-class signal that reaches only one of the two channels.

**Required.** Put the band in the accessibility tree, in the same primitive:

- fold it into the announced value, e.g. `aria-valuetext={`${valueText}, ${bandLabel}`}`, which is
  one line and needs no new prop; **or**
- move `.dp-progress__readout` out of the `role="progressbar"` element and associate it with
  `aria-describedby`, which also stops the string being duplicated between the DOM and an attribute.

Then correct the docblock sentence quoted above, and extend the B3 test so it asserts that
`bandLabel` appears in an ARIA attribute as well as in a text node — the current test asserts only
the text node, which is why the gap survived the fix.

#### B7 resolution — verified 2026-09-11, and a note on the choice

`aria-valuetext` now carries `` `${valueText}, ${bandLabel}` ``. I rendered three fixture states
myself rather than reading the report: `"18 of 45 minutes, Watch"`, `"44 of 45 minutes, Critical"`,
`"Unknown, Unknown"`. The band is in the accessibility tree; the visible readout still carries both
strings, so B3 holds; and the joined value is the caller's two strings plus a separator — the
primitive composes no prose of its own, which matters because those words are copy.

**On the option taken.** My "Required" offered two fixes and presented them as equals. The builder
took the first and rejected the second — moving the readout out of the progressbar and pointing
`aria-describedby` at it — for a reason I had not seen and that is correct:

> It forces a choice between announcing the value twice (once as `aria-valuetext`, once as
> description text) and dropping `aria-valuetext` altogether, at which point assistive technology
> computes and announces a PERCENTAGE from valuenow/valuemin/valuemax.

That second branch is the decisive one. With `aria-valuetext` absent, screen readers fall back to
the value derived from `aria-valuenow` against `aria-valuemin`/`aria-valuemax` and speak a
percentage. A connection-slack estimate spoken as "40 percent" is a published precision the
connection engine does not have — the same defect as the dial this primitive was written to refuse
(`DIRECTIVE.md §18.5`, `AGENTS.md §1.1`). My alternative would have introduced a truth defect while
closing an accessibility one. **The rejection is right, it is recorded in the file, and I am
recording here that the reviewer's second option was the worse one.**

The test now covers both directions in one place: strip every `aria-*` attribute and require both
words to survive as text (B3), then read `aria-valuetext` back and require it to be exactly
`18 of 45 minutes, Watch` (B7). A fix that satisfies one channel and empties the other now fails.

One thing the fix surfaces, which is copy rather than code — see **F24**.

---

## 2. Findings that do not block Phase 9

Numbered continuously with the blockers. Each is a real defect or a hardening request; none is a
Level A or AA failure in the code as shipped today.

### 2.1 Status after the 2026-09-11 remediation

Thirteen of the seventeen are closed. The three left open belong to other agents and to later
phases, exactly as they were filed; one is closed but worth re-reading because the fix reshaped an
API.

| #                                             | Status                            | What I verified                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F7 Toast severity fill                        | **Closed**                        | `background-color: var(--surface-elevated)` removed from `.dp-toast`, so the severity modifiers are no longer overridden. Rendered `dp-toast--urgent` confirmed; all four severity fills were already registered and pass.                                                                                                                                                                                            |
| F8 Switch accessible name                     | **Closed**                        | `aria-labelledby` now points at the label span alone; rendered name is "Monitoring", state is `aria-checked` only. `aria-label` and `aria-labelledby` are omitted from the prop type so a caller cannot re-break it. SC 2.5.3 still satisfied.                                                                                                                                                                        |
| F9 `--accent-bg` unregistered                 | **Closed**                        | Registered as `ui-boundary` on all four surfaces, plus a new pair against `--accent-subtle-bg`. Re-measured 5.20 / 5.72 / 5.51 / 4.59 light and 9.90 / 9.04 / 7.87 / 9.52 dark.                                                                                                                                                                                                                                       |
| F10 dark hairline at 1.00:1                   | **Closed**                        | Recorded as deliberate in the registry's exemption text, and compensated: `:where(.dp-dialog, .dp-drawer) :is(.dp-card, .dp-table, .dp-disclosure)` takes `--border-emphasis`. Rule sits at `primitives.css:1216`, after all three targets, so it wins; 1.46 light / 1.61 dark, still decorative.                                                                                                                     |
| F11 Demo hatch over-credited                  | **Closed**                        | Both docblocks and the component-token note rewritten to credit the word, the 2px dashed boundary, the square corners and the glyph, and to record the hatch at 1.24 / 1.14 as texture that nothing may depend on.                                                                                                                                                                                                    |
| F12 dialog inset ring at 2.89:1               | **Closed**                        | `outline-offset` moved from `-2px` to `calc(-1 * var(--space-4))`. With a 1px border and 24px padding the 2px ring now sits wholly inside the padding, so both neighbours are `--surface-elevated`: 4.23 light, 7.87 dark.                                                                                                                                                                                            |
| F13 ad slot landmark                          | **Closed**                        | `<aside aria-label>` replaced by `<div role="group" aria-labelledby>`; rendered markup confirmed. `group` is not a landmark, and the name still comes from the visible "Advertisement" label.                                                                                                                                                                                                                         |
| F14 hard-coded dialog `h2`                    | **Closed**                        | `headingLevel?: 2 \| 3 \| 4` on both Dialog and Drawer, defaulting to 2.                                                                                                                                                                                                                                                                                                                                              |
| F16 Combobox keyboard docblock                | **Closed, and better than asked** | The false claim is removed and the contract is published in the file: ArrowDown/Up, Home/End, Enter (and what Enter must do when nothing is active), Escape's two stages, Tab, no trap, and the requirement that `activeOptionId` always names a rendered option. This is the contract Phase 10 will be tested against.                                                                                               |
| F17 external link with no warning             | **Closed — API changed**          | `external?: boolean` is gone; `newTab?: string` both opens the tab and supplies the announcement, so the two cannot be separated. Rendered: `rel="noopener noreferrer" target="_blank"` plus a VisuallyHidden "opens in a new tab". No `external={…}` call sites remain in the repository. **Consumers written against the old prop will not compile** — that is the intent, and it is worth knowing before Phase 10. |
| F18 reduced-motion delays                     | **Closed**                        | `animation-delay: 0ms !important` and `transition-delay: 0ms !important` added to the reset, and asserted by test.                                                                                                                                                                                                                                                                                                    |
| F19 layout-transition regex                   | **Closed**                        | Widened to `/transition(-property)?:[^;]*\b(all\|width\|…)\b/` and extended with a second assertion refusing `transition: var(…)`, which cannot be read statically.                                                                                                                                                                                                                                                   |
| F20 legacy `.chip` nowrap                     | **Closed**                        | `white-space: normal` with `overflow-wrap: anywhere`, matching `.dp-chip`. The 1.4.10 risk is gone whether or not section 10 of `tokens.css` is deleted in Phase 10.                                                                                                                                                                                                                                                  |
| F21 rounded ratios in the mark evidence       | **Closed**                        | The evidence and `mark.svg`'s comment are regenerated with the truncating arithmetic. Every corrected figure now matches my own independent measurement exactly: 15.08, 4.48, 4.09, 9.90 / 9.04 / 7.87, 5.72 / 5.51 / 5.20, 1.80, 2.73. The artwork is byte-identical — only comments changed — so §8 stands.                                                                                                         |
| F15 background not inert                      | **Open**                          | Unchanged and correctly left: it is `frontend-ui-engineer`'s composition work in Phase 10.                                                                                                                                                                                                                                                                                                                            |
| F22 `og:image:alt`                            | **Open**                          | Unchanged. `seo-engineer`, Phase 11.                                                                                                                                                                                                                                                                                                                                                                                  |
| F23 `--brand-mark-accent` guard               | **Open**                          | Unchanged. `frontend-ui-engineer` when the property is first defined, then `brand-design-director` to register the pair. Still undefined, so the compliant fallback renders.                                                                                                                                                                                                                                          |
| F24 `unknown` announces as "Unknown, Unknown" | **Open**                          | Raised 2026-09-11 at the B7 re-review. `ux-copy-steward`, Phase 10.                                                                                                                                                                                                                                                                                                                                                   |

### 2.2 The findings as filed

|   # | File                                                                     | SC / rule                             | Observed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Required                                                                                                                                                                                                                                                                          | Owner                                                             |
| --: | ------------------------------------------------------------------------ | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
|  F7 | `packages/ui/src/primitives/primitives.css:1068-1071`                    | none (correctness)                    | `.dp-toast { background-color: var(--surface-elevated) }` is declared **after** `.dp-toast--{severity}` at equal specificity (0,1,0), so a Toast's severity fill never renders. The registry's `where` string for those pairs ("Callout/Toast title on the _tone_ fill") describes a pair the Toast does not produce. The pairs it _does_ produce are all registered and pass, so contrast conformance is unaffected — but the severity signal on a Toast is reduced to a 1px border and the icon shape.                                | Either restore the severity fill (move the `.dp-toast` rule above the modifiers, or raise its specificity) or amend the registry's `where` to stop claiming a pair that is not rendered.                                                                                          | `brand-design-director`                                           |
|  F8 | `packages/ui/src/primitives/Switch.tsx:37-52`                            | 4.1.2 Name, Role, Value (A)           | The switch's accessible name is computed from its contents and therefore **includes the state word**: "Monitoring On" → "Monitoring Off". The state is already exposed correctly through `aria-checked`, so it is announced twice, and a name that mutates on toggle is announced by some screen readers as a name change rather than a state change. SC 2.5.3 Label in Name still passes (the visible label is a substring).                                                                                                           | Name the control from the label span only (`aria-labelledby`), leaving `.dp-switch__state` as visible text outside the accessible name.                                                                                                                                           | `brand-design-director`                                           |
|  F9 | `packages/ui/src/tokens/pairs.ts`                                        | gate completeness                     | `--accent-bg` is used as a component _fill boundary_ — the primary Button, the checked Checkbox box, the checked Switch track — and is not registered as a `ui-boundary` pair. I measured it: 5.20 / 5.72 / 5.51 / 4.59 light and 9.90 / 9.04 / 7.87 / 9.52 dark. It passes everywhere, so this is a registry gap, not a failure. An unregistered pair is an unmeasured pair, and the gate is about the registry.                                                                                                                       | Register `--accent-bg` on the four surfaces with usage `ui-boundary`.                                                                                                                                                                                                             | `brand-design-director`                                           |
| F10 | `apps/web/src/styles/tokens.css` (dark block)                            | none (design)                         | `--border-hairline` and `--surface-elevated` are **the same value** in dark (`#13243a`), measured 1.00:1. A `.dp-card`, `.dp-disclosure` or `.dp-table` rendered inside a Dialog or Drawer therefore has no visible edge in dark mode. Not a WCAG failure — each of those is identified by its text, its `<summary>` control or its caption — but a hairline that is arithmetically absent is worth a decision rather than a coincidence.                                                                                               | Either give the dark theme a hairline distinct from `--surface-elevated`, or record the collision in `CONTRAST.md` as intentional.                                                                                                                                                | `brand-design-director`                                           |
| F11 | `packages/ui/src/primitives/primitives.css:385-398`                      | none (design claim)                   | The Demo chip's hatch is `--chip-demo-hatch` = `--border-hairline` over `--chip-demo-bg` = `--surface-card`: **1.24:1 light, 1.14:1 dark**. The docblock presents the hatch as one of the signals that makes Demo unmistakable from Live. It is not perceivable enough to be relied on. The chip is still safely distinguished — 2px dashed `--border-interactive` boundary (4.73:1 / 3.79:1 on a card), a square hatched-swatch glyph, square corners, and the literal word `Demo` — so this is a claim to correct, not a failure.     | Either strengthen the hatch to ≥ 3:1 or amend the docblock to credit the dashed boundary and the glyph, which are what actually carry it.                                                                                                                                         | `brand-design-director`                                           |
| F12 | `packages/ui/src/primitives/primitives.css:711-716`                      | 1.4.11 (AA), marginal                 | The Dialog/Drawer focus ring is drawn at `outline-offset: calc(-1 * var(--focus-ring-offset))`, i.e. 2px inside the panel edge, where one adjacent colour is the panel's own `--border-emphasis`: **2.89:1 in light** (dark is 4.86:1). The ring's other adjacent colour, `--surface-elevated`, is 4.23:1, and the panel itself is focused only transiently (focus moves to the first focusable child on open), so this does not fail AA in practice. Recording it because it is the only measured value below 3:1 in the focus system. | Increase the inset so the ring's neighbours are both `--surface-elevated`, or lighten `--border-emphasis` in light.                                                                                                                                                               | `brand-design-director`                                           |
| F13 | `packages/ui/src/primitives/AdSlot.tsx:32-41`                            | axe `landmark-unique` (best practice) | `<aside aria-label="Advertisement">` is a `complementary` landmark. `<aside>` with an accessible name is a landmark regardless of nesting, so two ad slots on one page produce two identically named landmarks. This will fail the axe best-practice ruleset in Phase 12 and clutters the landmark list a screen-reader user navigates by.                                                                                                                                                                                              | Use a non-landmark element (`<div>`) with the visible "Advertisement" label programmatically associated, or make each slot's name unique. Also relevant to `monetization-partnerships-engineer` for the Phase 11 placement rules.                                                 | `brand-design-director`                                           |
| F14 | `packages/ui/src/primitives/Dialog.tsx:69-71`                            | axe `heading-order` (best practice)   | The dialog title is a hard-coded `<h2>`. A dialog opened from a section under an `<h3>` produces a heading-order violation on the page.                                                                                                                                                                                                                                                                                                                                                                                                 | Accept a heading level prop, defaulting to `h2`.                                                                                                                                                                                                                                  | `brand-design-director`                                           |
| F15 | `packages/ui/src/primitives/Dialog.tsx` / `Drawer.tsx`                   | 1.3.2, 2.4.3 (A)                      | Background content is not made inert while a modal is open. `aria-modal="true"` is set and is honoured by current screen readers, and `use-focus-trap.ts` contains Tab, so this is acceptable practice today. It is not belt-and-braces: pointer users can still click through to background controls, and the page behind still scrolls.                                                                                                                                                                                               | In Phase 10, apply `inert` to the background container (or `aria-hidden` plus a scroll lock) when a modal is open. Recorded here so the Phase 12 review does not rediscover it.                                                                                                   | `frontend-ui-engineer` (composition)                              |
| F16 | `packages/ui/src/primitives/Combobox.tsx:4-6`                            | documentation                         | The docblock claims the primitive "owns the roles, the ids and the **keyboard contract** of a combobox". It owns the roles and the ids; there is no key handling in the file at all. Arrow keys, Enter, Escape, Home/End and the no-trap guarantee are entirely the caller's. A consumer who trusts the docblock will ship a combobox with no keyboard operation.                                                                                                                                                                       | Correct the docblock, and publish the keyboard contract the caller must implement so `frontend-ui-engineer` and I are testing the same thing in Phase 10.                                                                                                                         | `brand-design-director`                                           |
| F17 | `packages/ui/src/primitives/Link.tsx:58`                                 | 3.2.5 (AAA) / G201                    | `external` adds `target="_blank"` with no programmatic or visible indication that a new tab will open. Not an AA failure; it is the single most common complaint from screen-reader users in published surveys.                                                                                                                                                                                                                                                                                                                         | Append a VisuallyHidden "opens in a new tab" string, or an icon with that accessible name, when `external` is set. Copy is `ux-copy-steward`'s.                                                                                                                                   | `brand-design-director` + `ux-copy-steward`                       |
| F18 | `apps/web/src/styles/tokens.css:831-851` (reduced-motion block)          | hardening                             | The reset collapses `animation-duration`, `animation-iteration-count`, `transition-duration`, `scroll-behavior` and `view-transition-name`, which is correct and which I verified (§6). It does not zero `animation-delay` or `transition-delay`. A delayed entrance reveal under `prefers-reduced-motion: reduce` would still make a user wait before content is readable — forbidden by `DIRECTIVE.md §7` and ADR 0003 rule 3. No delay is used today.                                                                                | Add `animation-delay: 0ms !important; transition-delay: 0ms !important` to the reset before Phase 10 writes the first reveal.                                                                                                                                                     | `brand-design-director`                                           |
| F19 | `packages/ui/test/tokens.test.ts:353-358`                                | test coverage                         | The "never transitions a layout property" regex matches a named-property list. It would not catch `transition: all`, `transition-property: width`, or a layout property reached through a custom property. No such declaration exists today.                                                                                                                                                                                                                                                                                            | Extend the assertion to reject `all` and to scan `transition-property`.                                                                                                                                                                                                           | `brand-design-director`, with `qa-test-architect` for the CI lock |
| F20 | `apps/web/src/styles/tokens.css:746` (`.chip`, legacy page layer)        | 1.4.10 Reflow (AA), latent            | The pre-Phase-10 `.chip` sets `white-space: nowrap`. The replacement primitive `.dp-chip` correctly uses `white-space: normal` with `overflow-wrap: anywhere`, because "Updated 6 minutes ago from …" must wrap rather than truncate. The legacy class carries only short labels today, so nothing overflows at 320 CSS px — it becomes a defect the moment a freshness string is put in one.                                                                                                                                           | No change needed if section 10 of `tokens.css` is deleted in Phase 10 as its own comment promises. Confirm at the Phase 10 review.                                                                                                                                                | `brand-design-director`                                           |
| F21 | `design/evidence/s2-mark/README.md §3`                                   | method consistency                    | The mark evidence rounds ratios (`4.49`, `2.74`, `5.52`); `CONTRAST.md` truncates by policy so a 2.995 can never print as `3.00` beside a 3:1 floor. My independent measurement of the same pairs gives `4.48`, `2.73`, `5.51`. No value crosses a threshold either way today, so no conclusion changes.                                                                                                                                                                                                                                | Truncate in the asset evidence too, for the same reason the token layer does.                                                                                                                                                                                                     | `visual-asset-director`                                           |
| F22 | `apps/web/public/og/default-1200x630.png`                                | 1.1.1 (A), Phase 11                   | The Open Graph card bakes "DelayPilot" and "Stay ahead of flight disruptions." as outlined text in a raster. That is correct for an OG card, but the page that references it must publish `og:image:alt` carrying both strings, or the card is imageless text for every social client that reads it aloud.                                                                                                                                                                                                                              | Set `og:image:alt` to "DelayPilot — Stay ahead of flight disruptions." in the head contract.                                                                                                                                                                                      | `seo-engineer`                                                    |
| F23 | `apps/web/public/brand/mark.svg` (the advance-dot `circle`)              | contract guard                        | The advance dot reads `var(--brand-mark-accent, #087fbd)`. `--brand-mark-accent` is **not declared anywhere** in `tokens.css`, so every use renders the fallback, which I measured at ≥ 3.52:1 on all eight surfaces in both themes — compliant. The risk is the opposite direction: if the property is ever defined globally to either theme accent, the mark drops to 1.80:1 (light surface with the dark accent) or 2.73:1 (dark elevated with the light accent).                                                                    | When `frontend-ui-engineer` defines `--brand-mark-accent`, it must be defined **per theme, never globally**, and the pair must be added to `pairs.ts`. Recorded so the Phase 10 review checks for it.                                                                             | `frontend-ui-engineer`, then `brand-design-director`              |
| F24 | `packages/ui/src/primitives/ProgressBar.tsx` — the strings, not the code | 1.3.1 / accessible-name quality       | The B7 fix joins `valueText` and `bandLabel` with a separator, which is correct. But the `unknown` state of `DIRECTIVE.md §17` will naturally supply the same word for both, and the primitive then announces **"Unknown, Unknown"**. I rendered it: `aria-valuetext="Unknown, Unknown"`. `unknown` is a designed state (`AGENTS.md §1.1`), and stuttering it is a poor rendering of a state that has to be trusted. The primitive is not at fault — it must not edit copy.                                                             | When the §17 state strings are written, `valueText` and `bandLabel` for `unknown` must not be the same word: e.g. valueText "Slack unknown" with bandLabel "Unknown", so the announcement reads "Slack unknown, Unknown" or better. Check every §17 state for the same collision. | `ux-copy-steward`                                                 |

---

## 3. What passed, explicitly

Recorded so the Phase 12 review does not re-litigate settled ground.

- **Provenance vocabulary.** `packages/ui/src/tokens/interim-contracts.ts` transcribes exactly the six
  `AGENTS.md §1.2` labels — `Live`, `Cached`, `Stale`, `Demo`, `Unavailable`, `Heuristic risk band` —
  and `ProvenanceChip` renders each as visible text next to a distinct glyph. There is no icon-only
  variant and no seventh value. Verified from rendered markup, not from the source.
- **`unknown` is a designed state.** `StatusPill` renders `unknown` at full strength with its own
  silhouette (square + question mark) and a required visible label. Not a dash, not a blank, not
  faded. An empty cell announces nothing; this one announces "Unknown".
- **Four status silhouettes.** Circle + check, triangle + exclamation, octagon + cross, square +
  question. Distinct in outline, so they survive greyscale and a 16px render. Colour is never the only
  signal on a StatusPill, a Callout or a Toast.
- **`Demo` cannot be mistaken for `Live`.** Different word, different glyph (hatched square vs filled
  circle), different corner radius, different border style and weight (2px dashed vs 1px solid).
- **`Heuristic risk band` is not styled like a probability.** Neutral tone, an interval glyph, wider
  padding, square corners, no percentage anywhere in the primitive.
- **ProgressBar is a linear meter.** No gauge, no dial, no needle, no indeterminate looping variant.
  (Its text and track are B2/B3, but the shape is right.)
- **Toast severity routing.** `role="alert"` only for `urgent`; `role="status"` for `info`, `watch`
  and `resolved`. No auto-dismiss timer, so a message cannot vanish before it is read.
- **Real tables.** `DataTable` emits `<caption>`, `<th scope="col">` and `<th scope="row">` with
  tabular figures on numeric columns. No layout table, no `role="table"` on a `div` grid.
- **Native elements where they exist.** `<details>/<summary>` for disclosure, a real
  `<input type="checkbox">` behind the drawn box, a real `<select>`, `<button type="button">` by
  default. Keyboard operation and find-in-page come free and cannot be broken by a prop.
- **Icon-only controls cannot be built unnamed.** `Button` and `Link` are discriminated unions in
  which the `iconOnly: true` branch requires `aria-label`. This is enforced by the type system, not by
  a lint rule.
- **Icons are either hidden or named.** `Icon` has no third state: `decorative` gives
  `aria-hidden="true"` with no role; otherwise `role="img"` with a `<title>`.
- **Field wiring.** Persistent visible `<label>` bound by `htmlFor`, `aria-describedby` covering hint
  and error in reading order, `aria-invalid` on the control, and the error rendered as text — not as a
  colour change.
- **44 × 44 px targets in the primitives.** `--target-min: 2.75rem` is applied as `min-block-size`
  and, where relevant, `min-inline-size` to Button, icon-only Button, standalone Link, Input, Select,
  Combobox input, combobox option, the whole Checkbox/Radio row (the native input is
  `position: absolute; inset: 0`, so the target is the full label), the Switch control, each Tab and
  each `<summary>`. The one gap recorded in the first pass — `.dp-tabs__tab` had no
  `min-inline-size`, so a one-character label would have drawn a ~30px target — was closed in the
  remediation; both axes now take `--target-min`.
- **Tabs.** Roving tabindex, arrows, Home/End, `aria-selected`, `aria-controls`, and selection marked
  by an underline as well as by colour.
- **Focus trap.** `use-focus-trap.ts` moves focus in on open, cycles Tab and Shift+Tab inside, and —
  the step most implementations skip — restores focus to the invoking element on close.
- **No `outline: none` without a replacement.** Exactly one occurrence, at `primitives.css:610`, on the
  visually hidden native input of a Checkbox/Radio, with the ring redrawn on the sibling box that a
  sighted user is actually looking at.
- **No canvas.** There is no `<canvas>` anywhere in the design system or the asset pipeline.
- **No keyframes, no loops, no shimmer, no pulse.** Asserted by test and confirmed by reading the CSS.

---

## 4. Re-measured contrast — both themes

**Method.** I did not read the builder's table and I did not import the builder's code. I parsed the
hexes out of the shipped stylesheet `apps/web/src/styles/tokens.css` — the light `:root` block, the
`@media (prefers-color-scheme: dark)` block, the two `[data-theme]` override blocks and the component
layer, resolving `var()` chains — and computed WCAG 2.2 relative luminance and contrast ratio from
the definitions in an independent script. Ratios are truncated, never rounded. The pair list was
rebuilt from `packages/ui/src/primitives/primitives.css` by extracting every
`color` / `background-color` / `border-color` / `outline` declaration per rule, so it describes what
renders rather than what is registered.

**Theme parity.** `:root[data-theme='dark']` is identical to the `@media (prefers-color-scheme: dark)`
block across all 49 declarations, and `:root[data-theme='light']` is identical to the default `:root`
light block across all 49. An explicit theme choice cannot therefore ship an unmeasured colour.

**Result, re-measured after the remediation (2026-09-11).** 101 unique rendered pairs × 2 themes =
**202 measurements, zero below floor**, in either theme.

The first pass measured 97 pairs and found 13 failures, every one of them in the 12 pairs the
registry did not contain. The remediation added nine registry entries (`--accent-bg` on four
surfaces and on `--accent-subtle-bg`, `--border-accent` on `--accent-subtle-bg`, and three
`--accent-subtle-bg` decorative rows), split `--surface-sunken` into `--skeleton-bg` and
`--progress-track-border`, and changed the rules that produced the failures. Re-deriving the pair
list from the new `primitives.css` produces nothing the registry does not now hold: the registry is
103 pairs, my derivation is 101 (the registry carries two `--border-hairline` rows for surfaces no
component currently pairs them with).

My numbers agree with `packages/ui/src/tokens/CONTRAST.md` to the second decimal on every shared row,
and with `node scripts/validate-contrast.mjs` on its tightest pair (dark `--status-unknown` on
`--surface-raised`, 4.55:1). Three independent implementations agreeing is the point of measuring.

**Tightest passing margins** — the rows with the least headroom, worth knowing before any token moves:

| Theme | Pair                                           | Ratio | Floor | Margin |
| ----- | ---------------------------------------------- | ----: | ----: | -----: |
| light | `--status-watch-fg` on `--surface-sunken`      |  4.55 |   4.5 |  +0.05 |
| light | `--status-critical-fg` on `--surface-sunken`   |  4.55 |   4.5 |  +0.05 |
| light | `--text-secondary` on `--surface-sunken`       |  4.58 |   4.5 |  +0.08 |
| light | `--status-watch-border` on `--surface-sunken`  |  3.12 |     3 |  +0.12 |
| dark  | `--status-safe-fg` on `--surface-elevated`     |  4.55 |   4.5 |  +0.05 |
| dark  | `--status-critical-fg` on `--surface-elevated` |  4.55 |   4.5 |  +0.05 |
| dark  | `--status-unknown-fg` on `--surface-elevated`  |  4.55 |   4.5 |  +0.05 |
| dark  | `--text-disabled` on `--surface-elevated`      |  3.30 |     3 |  +0.30 |
| dark  | `--border-interactive` on `--surface-elevated` |  3.30 |     3 |  +0.30 |

Nine pairs sit within 0.10 of their floor. A one-step ramp change anywhere near `--surface-sunken`
(light) or `--surface-elevated` (dark) will break one of them, which is the argument for the CI gate
rather than a one-time measurement. The remediation did not move any of these: the tightest values
are identical before and after, and `pnpm --filter @delaypilot/ui tokens:build` still reports
`Tightest light: --status-watch-border on --surface-sunken at 3.12:1` and
`Tightest dark: --text-disabled on --surface-elevated at 3.30:1`.

### 4.1 The full table

Re-measured 2026-09-11 against the tree at `63005a3`. Foreground and background are semantic token
names; the theme columns give the literal hexes that token resolves to in that theme, as read from
the shipped stylesheet. No row fails in either theme.

#### Text — SC 1.4.3, floor 4.5:1

| Foreground             | Background             | Light              | ratio | Dark               | ratio | Result | Where it renders                                                                                                  |
| ---------------------- | ---------------------- | ------------------ | ----: | ------------------ | ----: | ------ | ----------------------------------------------------------------------------------------------------------------- |
| `--text-primary`       | `--surface-base`       | #07111f on #eef5fb | 17.21 | #f8fbff on #050b16 | 18.98 | pass   | Body copy, headings, table cells, input value, control labels; also the visible ProgressBar readout (valueText)   |
| `--text-primary`       | `--surface-card`       | #07111f on #ffffff | 18.93 | #f8fbff on #0b1728 | 17.33 | pass   | Body copy, headings, table cells, input value, control labels; also the visible ProgressBar readout (valueText)   |
| `--text-primary`       | `--surface-elevated`   | #07111f on #f8fbff | 18.24 | #f8fbff on #13243a | 15.08 | pass   | Body copy, headings, table cells, input value, control labels; also the visible ProgressBar readout (valueText)   |
| `--text-primary`       | `--surface-sunken`     | #07111f on #dce8f2 | 15.21 | #f8fbff on #07111f | 18.24 | pass   | Body copy, headings, table cells, input value, control labels; also the visible ProgressBar readout (valueText)   |
| `--text-secondary`     | `--surface-base`       | #58687b on #eef5fb |  5.18 | #7a8da1 on #050b16 |  5.77 | pass   | Supporting copy, freshness string, hint, switch state word, ad label                                              |
| `--text-secondary`     | `--surface-card`       | #58687b on #ffffff |  5.70 | #7a8da1 on #0b1728 |  5.26 | pass   | Supporting copy, freshness string, hint, switch state word, ad label                                              |
| `--text-secondary`     | `--surface-elevated`   | #58687b on #f8fbff |  5.49 | #7a8da1 on #13243a |  4.58 | pass   | Supporting copy, freshness string, hint, switch state word, ad label                                              |
| `--text-secondary`     | `--surface-sunken`     | #58687b on #dce8f2 |  4.58 | #7a8da1 on #07111f |  5.54 | pass   | Supporting copy, freshness string, hint, switch state word, ad label                                              |
| `--text-accent`        | `--surface-base`       | #076ca1 on #eef5fb |  5.20 | #31c5ff on #050b16 |  9.90 | pass   | Link, ghost button label                                                                                          |
| `--text-accent`        | `--surface-card`       | #076ca1 on #ffffff |  5.72 | #31c5ff on #0b1728 |  9.04 | pass   | Link, ghost button label                                                                                          |
| `--text-accent`        | `--surface-elevated`   | #076ca1 on #f8fbff |  5.51 | #31c5ff on #13243a |  7.87 | pass   | Link, ghost button label                                                                                          |
| `--text-accent`        | `--surface-sunken`     | #076ca1 on #dce8f2 |  4.59 | #31c5ff on #07111f |  9.52 | pass   | Link, ghost button label                                                                                          |
| `--text-inverse`       | `--surface-inverse`    | #f8fbff on #0b1728 | 17.33 | #07111f on #eef5fb | 17.21 | pass   | Tooltip bubble text                                                                                               |
| `--text-on-accent`     | `--accent-bg`          | #ffffff on #076ca1 |  5.72 | #050b16 on #31c5ff |  9.90 | pass   | Primary button label / checkbox mark / switch knob; also label of the ACTIVE combobox option on its inverted fill |
| `--text-on-accent`     | `--accent-bg-hover`    | #ffffff on #066293 |  6.61 | #050b16 on #55cfff | 11.02 | pass   | Primary button label / checkbox mark / switch knob                                                                |
| `--text-on-accent`     | `--accent-bg-active`   | #ffffff on #065781 |  7.81 | #050b16 on #0ba8ea |  7.32 | pass   | Primary button label / checkbox mark / switch knob                                                                |
| `--text-primary`       | `--accent-subtle-bg`   | #07111f on #e5f4fd | 16.85 | #f8fbff on #062438 | 15.36 | pass   | Text on active combobox option / accent badge area                                                                |
| `--text-accent`        | `--accent-subtle-bg`   | #076ca1 on #e5f4fd |  5.09 | #31c5ff on #062438 |  8.01 | pass   | Accent badge label, ghost button label on hover                                                                   |
| `--text-primary`       | `--border-hairline`    | #07111f on #dce8f2 | 15.21 | #f8fbff on #13243a | 15.08 | pass   | Demo chip label over a hatch stripe                                                                               |
| `--text-secondary`     | `--border-hairline`    | #58687b on #dce8f2 |  4.58 | #7a8da1 on #13243a |  4.58 | pass   | Demo chip freshness over a hatch stripe                                                                           |
| `--status-safe-fg`     | `--status-safe-bg`     | #127456 on #e6f2f3 |  5.01 | #189d74 on #082023 |  4.92 | pass   | StatusPill "safe" label + glyph on its own fill                                                                   |
| `--text-primary`       | `--status-safe-bg`     | #07111f on #e6f2f3 | 16.55 | #f8fbff on #082023 | 16.30 | pass   | Callout/Toast title on the safe fill                                                                              |
| `--text-secondary`     | `--status-safe-bg`     | #58687b on #e6f2f3 |  4.98 | #7a8da1 on #082023 |  4.95 | pass   | Callout/Toast body on the safe fill                                                                               |
| `--status-safe-fg`     | `--surface-base`       | #127456 on #eef5fb |  5.21 | #189d74 on #050b16 |  5.73 | pass   | Inline safe text/glyph + ProgressBar safe fill on a bare surface                                                  |
| `--status-safe-fg`     | `--surface-card`       | #127456 on #ffffff |  5.74 | #189d74 on #0b1728 |  5.23 | pass   | Inline safe text/glyph + ProgressBar safe fill on a bare surface                                                  |
| `--status-safe-fg`     | `--surface-elevated`   | #127456 on #f8fbff |  5.53 | #189d74 on #13243a |  4.55 | pass   | Inline safe text/glyph + ProgressBar safe fill on a bare surface                                                  |
| `--status-safe-fg`     | `--surface-sunken`     | #127456 on #dce8f2 |  4.61 | #189d74 on #07111f |  5.51 | pass   | Inline safe text/glyph + ProgressBar safe fill on a bare surface                                                  |
| `--status-watch-fg`    | `--status-watch-bg`    | #8d5d0d on #f6f2ec |  5.08 | #d99014 on #272016 |  6.09 | pass   | StatusPill "watch" label + glyph on its own fill                                                                  |
| `--text-primary`       | `--status-watch-bg`    | #07111f on #f6f2ec | 16.97 | #f8fbff on #272016 | 15.51 | pass   | Callout/Toast title on the watch fill                                                                             |
| `--text-secondary`     | `--status-watch-bg`    | #58687b on #f6f2ec |  5.11 | #7a8da1 on #272016 |  4.71 | pass   | Callout/Toast body on the watch fill                                                                              |
| `--status-watch-fg`    | `--surface-base`       | #8d5d0d on #eef5fb |  5.15 | #d99014 on #050b16 |  7.45 | pass   | Inline watch text/glyph + ProgressBar watch fill on a bare surface                                                |
| `--status-watch-fg`    | `--surface-card`       | #8d5d0d on #ffffff |  5.66 | #d99014 on #0b1728 |  6.80 | pass   | Inline watch text/glyph + ProgressBar watch fill on a bare surface                                                |
| `--status-watch-fg`    | `--surface-elevated`   | #8d5d0d on #f8fbff |  5.46 | #d99014 on #13243a |  5.92 | pass   | Inline watch text/glyph + ProgressBar watch fill on a bare surface                                                |
| `--status-watch-fg`    | `--surface-sunken`     | #8d5d0d on #dce8f2 |  4.55 | #d99014 on #07111f |  7.16 | pass   | Inline watch text/glyph + ProgressBar watch fill on a bare surface                                                |
| `--status-critical-fg` | `--status-critical-bg` | #c32841 on #f6edf2 |  4.94 | #de6275 on #271522 |  5.02 | pass   | StatusPill "critical" label + glyph on its own fill                                                               |
| `--text-primary`       | `--status-critical-bg` | #07111f on #f6edf2 | 16.51 | #f8fbff on #271522 | 16.63 | pass   | Callout/Toast title on the critical fill                                                                          |
| `--text-secondary`     | `--status-critical-bg` | #58687b on #f6edf2 |  4.97 | #7a8da1 on #271522 |  5.05 | pass   | Callout/Toast body on the critical fill                                                                           |
| `--status-critical-fg` | `--surface-base`       | #c32841 on #eef5fb |  5.15 | #de6275 on #050b16 |  5.73 | pass   | Inline critical text/glyph + ProgressBar critical fill on a bare surface                                          |
| `--status-critical-fg` | `--surface-card`       | #c32841 on #ffffff |  5.67 | #de6275 on #0b1728 |  5.23 | pass   | Inline critical text/glyph + ProgressBar critical fill on a bare surface                                          |
| `--status-critical-fg` | `--surface-elevated`   | #c32841 on #f8fbff |  5.46 | #de6275 on #13243a |  4.55 | pass   | Inline critical text/glyph + ProgressBar critical fill on a bare surface                                          |
| `--status-critical-fg` | `--surface-sunken`     | #c32841 on #dce8f2 |  4.55 | #de6275 on #07111f |  5.50 | pass   | Inline critical text/glyph + ProgressBar critical fill on a bare surface                                          |
| `--status-unknown-fg`  | `--status-unknown-bg`  | #5b677b on #edf1f7 |  5.04 | #7f8ba0 on #171e2b |  4.85 | pass   | StatusPill "unknown" label + glyph on its own fill                                                                |
| `--text-primary`       | `--status-unknown-bg`  | #07111f on #edf1f7 | 16.70 | #f8fbff on #171e2b | 16.09 | pass   | Callout/Toast title on the unknown fill                                                                           |
| `--text-secondary`     | `--status-unknown-bg`  | #58687b on #edf1f7 |  5.03 | #7a8da1 on #171e2b |  4.89 | pass   | Callout/Toast body on the unknown fill                                                                            |
| `--status-unknown-fg`  | `--surface-base`       | #5b677b on #eef5fb |  5.20 | #7f8ba0 on #050b16 |  5.72 | pass   | Inline unknown text/glyph + ProgressBar unknown fill on a bare surface                                            |
| `--status-unknown-fg`  | `--surface-card`       | #5b677b on #ffffff |  5.72 | #7f8ba0 on #0b1728 |  5.22 | pass   | Inline unknown text/glyph + ProgressBar unknown fill on a bare surface                                            |
| `--status-unknown-fg`  | `--surface-elevated`   | #5b677b on #f8fbff |  5.51 | #7f8ba0 on #13243a |  4.55 | pass   | Inline unknown text/glyph + ProgressBar unknown fill on a bare surface                                            |
| `--status-unknown-fg`  | `--surface-sunken`     | #5b677b on #dce8f2 |  4.59 | #7f8ba0 on #07111f |  5.50 | pass   | Inline unknown text/glyph + ProgressBar unknown fill on a bare surface                                            |

#### Inactive control text — exempt from 1.4.3, held to 3:1

| Foreground        | Background           | Light              | ratio | Dark               | ratio | Result | Where it renders                                               |
| ----------------- | -------------------- | ------------------ | ----: | ------------------ | ----: | ------ | -------------------------------------------------------------- |
| `--text-disabled` | `--surface-base`     | #62758a on #eef5fb |  4.30 | #62758a on #050b16 |  4.15 | pass   | Disabled control label (exempt from 1.4.3; held to 3:1 anyway) |
| `--text-disabled` | `--surface-card`     | #62758a on #ffffff |  4.73 | #62758a on #0b1728 |  3.79 | pass   | Disabled control label (exempt from 1.4.3; held to 3:1 anyway) |
| `--text-disabled` | `--surface-elevated` | #62758a on #f8fbff |  4.56 | #62758a on #13243a |  3.30 | pass   | Disabled control label (exempt from 1.4.3; held to 3:1 anyway) |
| `--text-disabled` | `--surface-sunken`   | #62758a on #dce8f2 |  3.80 | #62758a on #07111f |  3.99 | pass   | Disabled control label (exempt from 1.4.3; held to 3:1 anyway) |

#### Non-text contrast — SC 1.4.11, floor 3:1

| Foreground                 | Background             | Light              | ratio | Dark               | ratio | Result | Where it renders                                                                                                            |
| -------------------------- | ---------------------- | ------------------ | ----: | ------------------ | ----: | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| `--status-safe-border`     | `--surface-base`       | #168f6a on #eef5fb |  3.69 | #168f6a on #050b16 |  4.85 | pass   | StatusPill "safe" boundary on a bare surface                                                                                |
| `--status-safe-border`     | `--surface-card`       | #168f6a on #ffffff |  4.06 | #168f6a on #0b1728 |  4.42 | pass   | StatusPill "safe" boundary on a bare surface                                                                                |
| `--status-safe-border`     | `--surface-elevated`   | #168f6a on #f8fbff |  3.91 | #168f6a on #13243a |  3.85 | pass   | StatusPill "safe" boundary on a bare surface                                                                                |
| `--status-safe-border`     | `--surface-sunken`     | #168f6a on #dce8f2 |  3.26 | #168f6a on #07111f |  4.66 | pass   | StatusPill "safe" boundary on a bare surface                                                                                |
| `--status-safe-border`     | `--status-safe-bg`     | #168f6a on #e6f2f3 |  3.55 | #168f6a on #082023 |  4.16 | pass   | StatusPill "safe" dot/icon stroke on its own fill                                                                           |
| `--status-watch-border`    | `--surface-base`       | #b07510 on #eef5fb |  3.53 | #d99014 on #050b16 |  7.45 | pass   | StatusPill "watch" boundary on a bare surface                                                                               |
| `--status-watch-border`    | `--surface-card`       | #b07510 on #ffffff |  3.89 | #d99014 on #0b1728 |  6.80 | pass   | StatusPill "watch" boundary on a bare surface                                                                               |
| `--status-watch-border`    | `--surface-elevated`   | #b07510 on #f8fbff |  3.74 | #d99014 on #13243a |  5.92 | pass   | StatusPill "watch" boundary on a bare surface                                                                               |
| `--status-watch-border`    | `--surface-sunken`     | #b07510 on #dce8f2 |  3.12 | #d99014 on #07111f |  7.16 | pass   | StatusPill "watch" boundary on a bare surface                                                                               |
| `--status-watch-border`    | `--status-watch-bg`    | #b07510 on #f6f2ec |  3.48 | #d99014 on #272016 |  6.09 | pass   | StatusPill "watch" dot/icon stroke on its own fill                                                                          |
| `--status-critical-border` | `--surface-base`       | #d9485f on #eef5fb |  3.78 | #d9485f on #050b16 |  4.73 | pass   | StatusPill "critical" boundary on a bare surface                                                                            |
| `--status-critical-border` | `--surface-card`       | #d9485f on #ffffff |  4.16 | #d9485f on #0b1728 |  4.31 | pass   | StatusPill "critical" boundary on a bare surface                                                                            |
| `--status-critical-border` | `--surface-elevated`   | #d9485f on #f8fbff |  4.01 | #d9485f on #13243a |  3.75 | pass   | StatusPill "critical" boundary on a bare surface                                                                            |
| `--status-critical-border` | `--surface-sunken`     | #d9485f on #dce8f2 |  3.34 | #d9485f on #07111f |  4.54 | pass   | StatusPill "critical" boundary on a bare surface                                                                            |
| `--status-critical-border` | `--status-critical-bg` | #d9485f on #f6edf2 |  3.63 | #d9485f on #271522 |  4.14 | pass   | StatusPill "critical" dot/icon stroke on its own fill                                                                       |
| `--status-unknown-border`  | `--surface-base`       | #738197 on #eef5fb |  3.59 | #738197 on #050b16 |  4.98 | pass   | StatusPill "unknown" boundary on a bare surface                                                                             |
| `--status-unknown-border`  | `--surface-card`       | #738197 on #ffffff |  3.95 | #738197 on #0b1728 |  4.55 | pass   | StatusPill "unknown" boundary on a bare surface                                                                             |
| `--status-unknown-border`  | `--surface-elevated`   | #738197 on #f8fbff |  3.80 | #738197 on #13243a |  3.96 | pass   | StatusPill "unknown" boundary on a bare surface                                                                             |
| `--status-unknown-border`  | `--surface-sunken`     | #738197 on #dce8f2 |  3.17 | #738197 on #07111f |  4.79 | pass   | StatusPill "unknown" boundary on a bare surface                                                                             |
| `--status-unknown-border`  | `--status-unknown-bg`  | #738197 on #edf1f7 |  3.48 | #738197 on #171e2b |  4.22 | pass   | StatusPill "unknown" dot/icon stroke on its own fill                                                                        |
| `--border-interactive`     | `--surface-base`       | #62758a on #eef5fb |  4.30 | #62758a on #050b16 |  4.15 | pass   | Input/select/checkbox/radio/switch-track/secondary-button/listbox boundary                                                  |
| `--border-interactive`     | `--surface-card`       | #62758a on #ffffff |  4.73 | #62758a on #0b1728 |  3.79 | pass   | Input/select/checkbox/radio/switch-track/secondary-button/listbox boundary                                                  |
| `--border-interactive`     | `--surface-elevated`   | #62758a on #f8fbff |  4.56 | #62758a on #13243a |  3.30 | pass   | Input/select/checkbox/radio/switch-track/secondary-button/listbox boundary                                                  |
| `--border-interactive`     | `--surface-sunken`     | #62758a on #dce8f2 |  3.80 | #62758a on #07111f |  3.99 | pass   | Input/select/checkbox/radio/switch-track/secondary-button/listbox boundary                                                  |
| `--border-accent`          | `--surface-base`       | #087fbd on #eef5fb |  3.99 | #31c5ff on #050b16 |  9.90 | pass   | Selected tab underline, accent badge boundary; also the SELECTED bar vs the listbox fill / surfaces                         |
| `--border-accent`          | `--surface-card`       | #087fbd on #ffffff |  4.39 | #31c5ff on #0b1728 |  9.04 | pass   | Selected tab underline, accent badge boundary; also the SELECTED bar vs the listbox fill / surfaces                         |
| `--border-accent`          | `--surface-elevated`   | #087fbd on #f8fbff |  4.23 | #31c5ff on #13243a |  7.87 | pass   | Selected tab underline, accent badge boundary; also the SELECTED bar vs the listbox fill / surfaces                         |
| `--border-accent`          | `--surface-sunken`     | #087fbd on #dce8f2 |  3.52 | #31c5ff on #07111f |  9.52 | pass   | Selected tab underline, accent badge boundary; also the SELECTED bar vs the listbox fill / surfaces                         |
| `--accent-bg`              | `--surface-base`       | #076ca1 on #eef5fb |  5.20 | #31c5ff on #050b16 |  9.90 | pass   | ACTIVE combobox option (inverted) vs the listbox fill; also primary Button fill, checked Checkbox box, checked Switch track |
| `--accent-bg`              | `--surface-card`       | #076ca1 on #ffffff |  5.72 | #31c5ff on #0b1728 |  9.04 | pass   | ACTIVE combobox option (inverted) vs the listbox fill; also primary Button fill, checked Checkbox box, checked Switch track |
| `--accent-bg`              | `--surface-elevated`   | #076ca1 on #f8fbff |  5.51 | #31c5ff on #13243a |  7.87 | pass   | ACTIVE combobox option (inverted) vs the listbox fill; also primary Button fill, checked Checkbox box, checked Switch track |
| `--accent-bg`              | `--surface-sunken`     | #076ca1 on #dce8f2 |  4.59 | #31c5ff on #07111f |  9.52 | pass   | ACTIVE combobox option (inverted) vs the listbox fill; also primary Button fill, checked Checkbox box, checked Switch track |
| `--accent-bg`              | `--accent-subtle-bg`   | #076ca1 on #e5f4fd |  5.09 | #31c5ff on #062438 |  8.01 | pass   | ACTIVE combobox option vs a SELECTED row immediately above or below it                                                      |
| `--border-accent`          | `--accent-subtle-bg`   | #087fbd on #e5f4fd |  3.90 | #31c5ff on #062438 |  8.01 | pass   | 2px inline-start bar marking the SELECTED combobox option, on its own tint                                                  |
| `--progress-track-border`  | `--surface-base`       | #62758a on #eef5fb |  4.30 | #62758a on #050b16 |  4.15 | pass   | the 1px ProgressBar track outline that carries the meter scale                                                              |
| `--progress-track-border`  | `--surface-card`       | #62758a on #ffffff |  4.73 | #62758a on #0b1728 |  3.79 | pass   | the 1px ProgressBar track outline that carries the meter scale                                                              |
| `--progress-track-border`  | `--surface-elevated`   | #62758a on #f8fbff |  4.56 | #62758a on #13243a |  3.30 | pass   | the 1px ProgressBar track outline that carries the meter scale                                                              |
| `--progress-track-border`  | `--surface-sunken`     | #62758a on #dce8f2 |  3.80 | #62758a on #07111f |  3.99 | pass   | the 1px ProgressBar track outline that carries the meter scale                                                              |

#### Focus indicator — SC 1.4.11 / 2.4.11, floor 3:1, both adjacent colours

| Foreground     | Background           | Light              | ratio | Dark               | ratio | Result | Where it renders                                                         |
| -------------- | -------------------- | ------------------ | ----: | ------------------ | ----: | ------ | ------------------------------------------------------------------------ |
| `--focus-ring` | `--surface-base`     | #087fbd on #eef5fb |  3.99 | #31c5ff on #050b16 |  9.90 | pass   | Focus ring vs the surface behind the control (outer adjacent colour)     |
| `--focus-ring` | `--surface-card`     | #087fbd on #ffffff |  4.39 | #31c5ff on #0b1728 |  9.04 | pass   | Focus ring vs the surface behind the control (outer adjacent colour)     |
| `--focus-ring` | `--surface-elevated` | #087fbd on #f8fbff |  4.23 | #31c5ff on #13243a |  7.87 | pass   | Focus ring vs the surface behind the control (outer adjacent colour)     |
| `--focus-ring` | `--surface-sunken`   | #087fbd on #dce8f2 |  3.52 | #31c5ff on #07111f |  9.52 | pass   | Focus ring vs the surface behind the control (outer adjacent colour)     |
| `--focus-ring` | `--focus-ring-halo`  | #087fbd on #ffffff |  4.39 | #31c5ff on #050b16 |  9.90 | pass   | Focus ring vs the halo that fills the 2px offset (inner adjacent colour) |

#### Decorative — no threshold, measured and recorded with the reason

| Foreground           | Background           | Light              | ratio | Dark               | ratio | Result | Where it renders                                                                  |
| -------------------- | -------------------- | ------------------ | ----: | ------------------ | ----: | ------ | --------------------------------------------------------------------------------- |
| `--border-emphasis`  | `--surface-elevated` | #c3d4e2 on #f8fbff |  1.46 | #34465a on #13243a |  1.61 | pass   | nested card/table/disclosure edge inside a dialog or drawer (F10 fix)             |
| `--skeleton-bg`      | `--surface-card`     | #dce8f2 on #ffffff |  1.24 | #07111f on #0b1728 |  1.05 | pass   | skeleton fill, claimed decorative                                                 |
| `--accent-subtle-bg` | `--surface-base`     | #e5f4fd on #eef5fb |  1.02 | #062438 on #050b16 |  1.23 | pass   | accent tint, claimed reinforcement-only (selected row, ghost hover, accent Badge) |
| `--accent-subtle-bg` | `--surface-card`     | #e5f4fd on #ffffff |  1.12 | #062438 on #0b1728 |  1.12 | pass   | accent tint, claimed reinforcement-only (selected row, ghost hover, accent Badge) |
| `--accent-subtle-bg` | `--surface-elevated` | #e5f4fd on #f8fbff |  1.08 | #062438 on #13243a |  1.01 | pass   | accent tint, claimed reinforcement-only (selected row, ghost hover, accent Badge) |
| `--accent-subtle-bg` | `--surface-sunken`   | #e5f4fd on #dce8f2 |  1.10 | #062438 on #07111f |  1.18 | pass   | accent tint, claimed reinforcement-only (selected row, ghost hover, accent Badge) |

### 4.2 The decorative exemptions, judged independently

A decorative classification is a claim that nothing is identified by seeing the pair, and it is the
only class in the registry with no threshold — so each one is a claim I check against every rule in
`primitives.css` that uses it, rather than a place to put an inconvenient number.

The first pass found nine and rejected one. The registry now holds **twelve**: the nine, minus the
ProgressBar's share of `--surface-sunken`, plus three new `--accent-subtle-bg` rows that the
combobox rework created.

| Pair                                           | Measured (light / dark) | Reason given                                                                        | My verdict                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---------------------------------------------- | ----------------------: | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--border-hairline` on `--surface-base`        |             1.13 / 1.25 | Hairline between non-interactive regions                                            | **Accepted.** Card edges, section rules, list dividers. Nothing is identified by it.                                                                                                                                                                                                                                                                                                                                                                                              |
| `--border-hairline` on `--surface-card`        |             1.24 / 1.14 | as above                                                                            | **Accepted.** Also the Demo-chip hatch — no longer over-credited anywhere in the source (F11 closed).                                                                                                                                                                                                                                                                                                                                                                             |
| `--border-hairline` on `--surface-elevated`    |         1.19 / **1.00** | as above, now recording the dark collision explicitly                               | **Accepted.** The 1.00:1 identity in dark is stated in the exemption text as deliberate and is compensated by the nested-elevation rule (F10 closed).                                                                                                                                                                                                                                                                                                                             |
| `--border-emphasis` on the four surfaces       |   1.37–1.51 / 1.61–2.03 | A heavier hairline; no control is identified by it                                  | **Accepted.** It is now also the nested card/table/disclosure edge inside a dialog — still decorative, because each of those is identified by its text, its `<summary>` or its `<caption>`.                                                                                                                                                                                                                                                                                       |
| `--skeleton-bg` on `--surface-card`            |             1.24 / 1.05 | A skeleton carries no information; reason narrowed in writing to the skeleton alone | **Accepted — the first-pass rejection is discharged.** The pair no longer does double duty: the meter track is a measured 3:1 boundary and the Switch OFF track is identified by `--border-interactive`, both stated in the exemption text.                                                                                                                                                                                                                                       |
| `--accent-subtle-bg` on base / card / elevated |   1.02–1.12 / 1.01–1.23 | Reinforcement, never the indicator                                                  | **Accepted.** I checked each of the three uses. Selected combobox row: the indicator is the 2px `--border-accent` bar, 3.90:1 on this tint and 3.52:1 or better on every surface, plus `aria-selected`. Accent Badge: identified by its `--border-accent` boundary. Ghost-button hover fill: identifies nothing, since the control is identified by its label whether the pointer is there or not. And the ACTIVE option deliberately does not use this tint at all — it inverts. |
| `--surface-card` on `--surface-base`           |             1.10 / 1.09 | Elevation, not identification; the card also carries a hairline                     | **Accepted.**                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

The `--border-interactive` / `--border-accent` split the exemptions lean on is real and is respected
in the CSS: every interactive boundary and every state indicator I traced now uses one of those two,
or `--accent-bg`, all of which clear 3:1 on all four surfaces in both themes.

---

## 5. Focus system

**Specification as built** (`apps/web/src/styles/tokens.css:550-554`):

```css
:where(a, button, input, select, textarea, summary, [tabindex], [contenteditable]):focus-visible {
  outline: var(--focus-ring-width) solid var(--focus-ring); /* 2px */
  outline-offset: var(--focus-ring-offset); /* 2px */
  box-shadow: 0 0 0 var(--focus-ring-offset) var(--focus-ring-halo);
}
```

| Check                                                              | Result                       | Evidence                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ring vs the surface behind the control (outer adjacent colour)     | **Passing**                  | 3.99 / 4.39 / 4.23 / 3.52 light; 9.90 / 9.04 / 7.87 / 9.52 dark. §4.1.                                                                                                                                                                                                                                                                               |
| Ring vs the halo that fills the 2px offset (inner adjacent colour) | **Passing**                  | 4.39 light, 9.90 dark. The halo is why the ring never has to be measured against an accent or status fill: it never touches one.                                                                                                                                                                                                                     |
| Selector reaches every interactive element in the system           | **Passing**                  | Anchors, buttons, inputs, selects, textareas, `<summary>`, anything with `[tabindex]` — which covers the `tabIndex={-1}` dialog panel and the `tabIndex={0}` tab panel — and `[contenteditable]` for the Phase 10 evidence editor.                                                                                                                   |
| `outline: none` without a replacement                              | **Passing**                  | One occurrence, documented, with the ring redrawn on the sibling box (§3).                                                                                                                                                                                                                                                                           |
| A component rule silently overriding the ring                      | **Passing**                  | `:where()` contributes zero specificity, so the rule is (0,1,0) and a component rule could beat it. I checked every `outline` and `box-shadow` declaration in `primitives.css`: the only overrides are the two deliberate ones (`.dp-choice__input:focus-visible`, `.dp-dialog/.dp-drawer:focus-visible`), both at (0,2,0), both with a replacement. |
| Ring drawn inside the panel edge on Dialog/Drawer                  | **Passing** since 2026-09-11 | Deliberate, so a full-width drawer cannot push the ring off-screen. The inset moved from `-2px` to `calc(-1 * var(--space-4))`, so the 2px ring now sits wholly within the 24px padding and both neighbours are `--surface-elevated`: 4.23:1 light, 7.87:1 dark. F12 closed.                                                                         |
| Ring clipped by a scrolling ancestor                               | **Not run**                  | `.dp-table`, `.dp-combobox__listbox` and `.dp-ad-slot__frame` clip overflow; a focused control at the edge of one of them will have part of its 2px ring cut. SC 2.4.11 (AA) permits partial obscuring, so this is a Phase 12 observation, not a finding. Needs a browser.                                                                           |
| SC 2.4.11 against sticky headers and the mobile bottom bar         | **Not run**                  | No sticky element exists yet. Phase 10 builds them; Phase 12 tests them.                                                                                                                                                                                                                                                                             |

---

## 6. Reduced motion

**Verified in `apps/web/src/styles/tokens.css:831-851` and `packages/ui/src/primitives/primitives.css`.**

| Requirement (`DIRECTIVE.md §7`, ADR 0003 rule 4)       | Result                       | Evidence                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Every duration token collapses                         | **Passing**                  | `--motion-fast`, `--motion-base`, `--motion-slow`, `--motion-reveal`, `--motion-view-transition` → `1ms`; `--motion-reveal-distance` → `0px`; `--motion-ambient-cycle` → `0s`. The two easing tokens are not durations.                                                                                                                                                                |
| Every transition collapses even if it is not tokenised | **Passing**                  | `*, *::before, *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; transition-duration: 1ms !important; scroll-behavior: auto !important; view-transition-name: none !important }`.                                                                                                                                                                |
| The state change itself survives                       | **Passing**                  | Nothing is set to `display: none`, `opacity: 0` or `transform: none` in the reduced-motion block. The nine transitions in `primitives.css` are on `background-color`, `border-color`, `color`, `translate`, `rotate` and `scale`; under reduce they land on the same end state instantly. The switch knob still moves, the disclosure marker still points down, the meter still fills. |
| No keyframe anywhere                                   | **Passing**                  | No `@keyframes` and no `animation`/`animation-name` in either stylesheet. Locked by `packages/ui/test/tokens.test.ts:347-351`.                                                                                                                                                                                                                                                         |
| No layout property animated                            | **Passing**                  | No `width`, `height`, `inline-size`, `block-size`, `padding`, `margin` or `inset` in any `transition`. The ProgressBar scales rather than resizing and the Disclosure rotates its marker rather than animating a height — both documented as deliberate. Locked by `tokens.test.ts:353-358`; see F19 for the gap in that regex.                                                        |
| No loop, pulse or shimmer                              | **Passing**                  | The Skeleton explicitly does not shimmer; nothing pulses on `watch` or `critical`.                                                                                                                                                                                                                                                                                                     |
| No auto-advancing carousel                             | **Passing**                  | No carousel primitive exists.                                                                                                                                                                                                                                                                                                                                                          |
| ADR 0003 token ceilings                                | **Passing**                  | `--motion-reveal-distance: 16px` ≤ the 24px cap (rule 2a); `--motion-ambient-cycle: 12s` ≤ the 12s cap (rule 2b); `--motion-view-transition: 180ms` = `--motion-base`, the cap in rule 2c.                                                                                                                                                                                             |
| Delays                                                 | **Passing** since 2026-09-11 | `animation-delay: 0ms !important` and `transition-delay: 0ms !important` added to the reset and asserted by test. F18 closed.                                                                                                                                                                                                                                                          |
| Motion baked into an asset                             | **Passing**                  | No SMIL in any brand or motif SVG (`<animate>`, `<animateTransform>`, `<animateMotion>`, `<set>`: zero occurrences). Every motif ships its static frame as authored, so the reduced-motion frame is correct with no CSS at all.                                                                                                                                                        |

---

## 7. Primitive semantics — as rendered

Every row below was checked against **rendered markup**, produced by running each primitive through
`react-dom/server` from a scratchpad outside the repository, not by reading JSX.

| Primitive            | Role / semantics                                                                                                                                   | Result                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `Icon`               | `aria-hidden="true"` + no role, or `role="img"` + `<title>`; no third state                                                                        | Passing                            |
| `StatusPill`         | Required visible label, distinct silhouette per tone, tone as reinforcement                                                                        | Passing                            |
| `ProvenanceChip`     | All six `AGENTS.md §1.2` labels as visible text, distinct glyph each, freshness wraps instead of truncating                                        | Passing                            |
| `Badge`              | Deliberately not status-toned, so it cannot be mistaken for a StatusPill or a chip                                                                 | Passing                            |
| `Button`             | `type="button"` default; `aria-label` required by the type system on icon-only                                                                     | Passing                            |
| `Link`               | Real anchor; `newTab` opens the tab, sets `rel="noopener noreferrer"` and renders the VisuallyHidden announcement — one prop, both effects         | Passing (F17 closed)               |
| `Field`              | Persistent `<label>`, `aria-describedby` in reading order, `aria-invalid`, error as text                                                           | Passing                            |
| `Input` / `Select`   | Native elements, visible boundary at 4.73:1 / 3.79:1, 44px min height, decorative chevron hidden                                                   | Passing                            |
| `Combobox`           | ARIA shell as before, plus an inverted ACTIVE option and a bar-marked SELECTED option, correct at equal specificity when an option is both         | Passing (B1, F16 closed)           |
| `Checkbox` / `Radio` | Native input covering the full row; `aria-checked="mixed"` consistent with the DOM `indeterminate` property; focus ring redrawn on the visible box | Passing                            |
| `Switch`             | `role="switch"` + `aria-checked`, named by `aria-labelledby` from the label alone, state a visible word outside the name                           | Passing (F8 closed)                |
| `Dialog` / `Drawer`  | as before, plus a settable `headingLevel`                                                                                                          | Passing (F14 closed); **F15 open** |
| `Tabs`               | Roving tabindex, arrows + Home/End, `aria-selected`, `aria-controls`, underline as well as colour                                                  | Passing                            |
| `Disclosure`         | Native `<details>/<summary>`, custom marker, 44px summary                                                                                          | Passing                            |
| `Tooltip`            | `role="tooltip"`, `aria-describedby`, shown on focus as well as hover, document-level Escape while open, hover bridge across the 8px offset        | Passing (B5 closed)                |
| `DataTable`          | as before, plus `role="region"` + `tabindex="0"` + `aria-labelledby` the caption                                                                   | Passing (B6 closed)                |
| `Skeleton`           | Reserves both dimensions; VisuallyHidden label; no live role unless `live` is set                                                                  | Passing (B4 closed)                |
| `ProgressBar`        | as before, plus a visible readout, a required `bandLabel` beside a band glyph, a 3:1 track outline, and both strings in `aria-valuetext`           | Passing (B2, B3, B7 closed)        |
| `Callout`            | Required visible title, per-severity icon shape, four tones and never a fifth                                                                      | Passing                            |
| `Toast`              | `role="alert"` only for `urgent`; `role="status"` otherwise; named dismiss control; no auto-dismiss; the severity fill now actually renders        | Passing (F7 closed)                |
| `AdSlot`             | Reserved dimensions, visible "Advertisement" label, `role="group"` rather than a landmark, dropped from print                                      | Passing (F13 closed)               |
| `VisuallyHidden`     | Clipped, not `display: none`; stays in the accessibility tree                                                                                      | Passing                            |

**Live-region inventory, re-checked 2026-09-11.** The complete set of live regions the design system
can create is now: `Toast` (`role="alert"` for `urgent`, `role="status"` otherwise) and `Skeleton`
**only when a caller opts in** with `live`. The default Skeleton render contains no `role="status"`,
no `aria-live` and no `role="alert"`, asserted by test in both directions. Nothing else in the
package declares `aria-live`, `role="status"`, `role="alert"`, `aria-atomic` or `aria-relevant`.
`aria-busy` is documented as the composing pattern's job and is set by no primitive — a Phase 10
review item, not a Phase 9 one.

---

## 8. Mark legibility — decision

**The question put to this review:** the full mark's floor is 24 px and `favicon.svg` is the legible
16 px reduction. The builder asked the reviewer to confirm or overturn that line.

**Decision: confirmed, both parts.** The reduction is legible at 16 px and it is the same mark.

**Method.** Not by eye. I read the raw pixels of the evidence renders in
`design/evidence/s2-mark/`, took the modal colour as the plate, classified every pixel by its
measured contrast against that plate, and ran an 8-connected component analysis over the pixels at
≥ 3:1 — the SC 1.4.11 floor for a non-text graphic. A mark is legible at a size when its elements
resolve into the intended number of separate shapes at or above that floor.

| Render                | Ink px ≥ 3:1 | Px between 1.5:1 and 3:1 |                            Separate shapes ≥ 3:1 |                 Peak |
| --------------------- | -----------: | -----------------------: | -----------------------------------------------: | -------------------: |
| `favicon-16.png`      |           35 |                        5 |    route stroke 24px + advance dot 7px, detached | 17.93:1 (dot 9.52:1) |
| `favicon-16-grey.png` |           35 |                        7 |                 same two shapes, same separation | 18.09:1 (dot 9.11:1) |
| `mark-16-light.png`   |           20 |                        8 |                                     **2**, not 3 |              16.71:1 |
| `mark-16-dark.png`    |           21 |                        8 |                                     **2**, not 3 |              16.64:1 |
| `mark-24-light.png`   |           42 |                       16 | **3** — route line 18px, radar arc 18px, dot 6px | 18.10:1 (dot 5.52:1) |

The three-element mark does not resolve into three elements at 16 px: only 20 pixels clear 3:1 and a
further 8 fall into the antialiasing band below it, where the 2.0-unit arc (1.33 device px) loses
most of its contrast to partial coverage. At 24 px it resolves cleanly into three shapes with the
advance dot at 5.52:1. The builder's own account of this is accurate, and the remedy — a reduction
rather than a thickened arc — is the right one: thickening the arc would break the "arc thinner than
the route line" relationship the mark is built on, and thickening it _only_ at small sizes would mean
two hand-drawn marks.

**Is the reduction the same mark?** Yes. `favicon.svg` carries the identical route-line path
(`M8.9 14.3C10.7 11.62 12.97 9.42 15.7 7.7`) and the identical advance-dot circle
(`cx=19.59 cy=5.25 r=1.7`) from `mark.svg`, under a single `translate(-6.49,-.25) scale(1.28)`, with
the arc dropped. It is one geometry at two crops, generated by
`scripts/assets/build-assets.mjs`, not a second drawing.

**Greyscale.** `favicon-16-grey.png` has the same 35 ink pixels, the same two shapes and the same
separation as the colour render. The advance dot is identified by being a detached round shape at a
distance from the stroke end, not by being blue. That is the property `DIRECTIVE.md §7` requires.

**Icon-stroke contrast, re-measured by me** (floor 3:1 for a non-text graphic, SC 1.4.11):

| Ink                                                                           | Surfaces                                                  |     Ratio range | Result                                                          |
| ----------------------------------------------------------------------------- | --------------------------------------------------------- | --------------: | --------------------------------------------------------------- |
| Arc + route line, `currentColor` = `--text-primary`                           | four light surfaces                                       |   15.21 – 18.93 | Passing                                                         |
| Arc + route line, `currentColor` = `--text-primary`                           | four dark surfaces                                        |   15.08 – 18.98 | Passing                                                         |
| Advance dot fallback `#087fbd`                                                | all four light + all four dark + the `#07111f` icon plate | **3.52 – 4.48** | Passing                                                         |
| Advance dot with the dark accent `#31c5ff` applied on a **light** surface     | light                                                     |     1.59 – 1.98 | Would fail — must never be set globally                         |
| Advance dot with the light accent `#076ca1` applied on a **dark** surface     | dark                                                      |     2.73 – 3.44 | Would fail on `--surface-elevated` — must never be set globally |
| Raster icon set: `#f8fbff` strokes and a `#31c5ff` dot on the `#07111f` plate | fixed, theme-independent                                  |    18.24 / 9.52 | Passing                                                         |

The fallback is the only value in the sky ramp clearing 3:1 on every surface in both themes, which is
the right choice for a file that may render with no CSS context at all. See F23 for the guard that
must accompany `--brand-mark-accent` when someone finally defines it.

**Re-review, 2026-09-11.** `visual-asset-director` regenerated the evidence tables with the token
layer's truncating arithmetic (F21). I re-ran the pixel analysis on the current renders and re-took
every contrast measurement in the table above: the PNGs are byte-identical, the mark's drawing is
byte-identical (only its comment block changed), and every corrected figure now matches my own
independent measurement to the second decimal — 15.08, 4.48, 4.09, 9.90 / 9.04 / 7.87,
5.72 / 5.51 / 5.20, 1.80, 2.73. **The decision above is unchanged and did not need re-taking.**

**Logotype.** `logotype.svg` renders "DelayPilot" as an outlined path with
`role="img"` + `<title>DelayPilot</title>`, so the accessible name matches the visible text exactly.
SC 1.4.5 Images of Text (AA) exempts logotypes, and SC 1.1.1 is satisfied by the title. Passing.

---

## 9. Motif text equivalents — inventory

Rule: every graphic is either documented decorative and hidden, or it carries `role="img"` with an
accessible name **and** a real text equivalent carrying the same data. There is no third option, and
"decorative" is a claim that has to be true.

| File                                                                                                                        | Attributes                                                                    | Carries data?                                                                                                                                  | Text equivalent                                                                                                                                                          | Verdict                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `apps/web/public/brand/motifs/radar-arc.svg`                                                                                | `aria-hidden="true"`, `focusable="false"`, no role, no `<title>`, no `<desc>` | No — three static range rings and a sweep; no ticks, no bearings, no lettering                                                                 | None required                                                                                                                                                            | **Correct**                                                                                   |
| `apps/web/public/brand/motifs/route-arcs.svg`                                                                               | same                                                                          | No — three arcs and three dots, no endpoints named                                                                                             | None required                                                                                                                                                            | **Correct**                                                                                   |
| `apps/web/public/brand/motifs/grid.svg`                                                                                     | same                                                                          | No — a tiled rule pattern                                                                                                                      | None required                                                                                                                                                            | **Correct**                                                                                   |
| `apps/web/public/brand/motifs/route-globe.svg`                                                                              | same                                                                          | No — a bare sphere, a graticule and three arcs between arbitrary round-number anchors; no coastlines, borders, city dots, IATA codes or labels | **Page copy must carry "Illustrative route lines — not live traffic."** (ADR 0003 rule 6), as a visible `<figcaption>` or equivalent, never inside the `aria-hidden` SVG | **Correct in the file; the caption is an open Phase 10 obligation on `frontend-ui-engineer`** |
| `apps/web/public/brand/mark.svg`, `mark-mono.svg`, `logotype.svg`, `logotype-mono.svg`, `apps/web/public/icons/favicon.svg` | `role="img"` + `<title>DelayPilot</title>` + `aria-labelledby`                | Brand identity, not data                                                                                                                       | Accessible name "DelayPilot"                                                                                                                                             | **Correct**                                                                                   |

`scripts/assets/MOTIFS.md §2` states the decorative decision explicitly and adds the right rule for
the future: a shape that must carry meaning becomes a _different file_ with `role="img"`, a `<title>`,
a `<desc>` and an adjacent text equivalent — never a re-labelled decorative motif. I endorse that.

**No canvas exists anywhere in the repository**, which is the requirement, not a coincidence: a
canvas-only visualization has no accessible fallback and `DIRECTIVE.md §7` forbids it outright.

**Standing requirement for Phase 10, recorded here so it is not rediscovered.** The connection
cockpit's transfer diagram needs, alongside the graphic, a text equivalent listing every component
of `T = T_deplane + T_walk + T_security + T_immigration + T_bag + T_mobility + T_uncertainty` with
its minutes and derivation class, plus `W` and `S = W − T`. No primitive in this package can produce
that today, and none should — it is a pattern. Owner: `frontend-ui-engineer`.

---

## 10. Manual test matrix

`Passing` / `Failing` / `Not run` / `Blocked (external)` per `AGENTS.md §6`. No cell is left blank; a
blank cell is an untested cell pretending to be a tested one.

### 10.1 Phase 9 scope — executed in this review

| Check                                                                     | Result                                 | How                                                                                                             |
| ------------------------------------------------------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Contrast, every rendered pair, light theme                                | **Passing** — 101 pairs, 0 below floor | Independent re-measurement from `tokens.css`, re-run 2026-09-11 (§4)                                            |
| Contrast, every rendered pair, dark theme                                 | **Passing** — 101 pairs, 0 below floor | as above                                                                                                        |
| Theme parity — `[data-theme]` vs media query                              | **Passing**                            | 49/49 declarations identical in both directions                                                                 |
| Decorative exemptions justified                                           | **Passing** — all 12 accepted          | §4.2. The first-pass rejection of `--surface-sunken` is discharged: the pair was split and the reason narrowed. |
| Focus ring measured against both adjacent colours                         | **Passing**                            | §5. F12 closed, so no value in the focus system is now below 3:1.                                               |
| Focus selector coverage and override audit                                | **Passing**                            | §5                                                                                                              |
| Reduced motion collapses durations, transforms, view transitions          | **Passing**                            | §6                                                                                                              |
| Reduced motion preserves the state change                                 | **Passing**                            | §6                                                                                                              |
| No keyframe, no loop, no animated layout property                         | **Passing**                            | §6                                                                                                              |
| ADR 0003 token ceilings (24px / 12s / 180ms)                              | **Passing**                            | §6                                                                                                              |
| Status never by colour alone                                              | **Passing** in both channels           | §3, §7. B7 closed the last gap: the ProgressBar band is now visible text plus a glyph, and it is announced.     |
| Provenance: six labels, visible text, never icon-only                     | **Passing**                            | §3, §7                                                                                                          |
| `Demo` unmistakable from `Live`                                           | **Passing** (F11 on the hatch)         | §3                                                                                                              |
| `Heuristic risk band` not styled as a probability                         | **Passing**                            | §3                                                                                                              |
| ProgressBar is a meter, not a gauge                                       | **Passing**                            | §7                                                                                                              |
| Primitive roles, names and states, from rendered markup                   | **Passing**                            | §7, re-rendered 2026-09-11 after each remediation                                                               |
| Live-region inventory                                                     | **Passing**                            | §7. B4 closed; the only live regions left are Toast and an explicitly opted-in Skeleton.                        |
| Dialog/Drawer focus in, trapped, restored; Escape; `aria-modal`; labelled | **Passing** (F15 on inertness)         | §7                                                                                                              |
| DataTable `<th scope>`, `<caption>`, tabular numerals                     | **Passing**                            | §7                                                                                                              |
| Mark legible at 16 px, both themes, greyscale                             | **Passing**                            | §8                                                                                                              |
| Mark icon-stroke contrast ≥ 3:1 both themes                               | **Passing**                            | §8                                                                                                              |
| Motif text equivalents / decorative claims                                | **Passing**                            | §9                                                                                                              |
| No canvas-only visualization                                              | **Passing**                            | §9                                                                                                              |

### 10.2 Phase 12 scope — Not run, with the reason

Every cell below is `Not run`. The reason is the same for all of them and it is not a scheduling
excuse: **no browser and no assistive technology exist in this environment**, and `pnpm test:a11y` is
a deliberate exit-1 stub until Phase 12 (§11). A route-level result cannot be inferred from a token
measurement, and this role does not certify a route it has not loaded.

| Check                                                                                                                                                                                 | Result  | Why not, and what will satisfy it                                                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| axe `wcag2a` `wcag2aa` `wcag21aa` `wcag22aa` on every `§18.1` public route, both themes                                                                                               | Not run | The routes do not exist yet — `pnpm build` emits 3 pages. Phase 10 builds them; the runner is `qa-test-architect`'s.                                     |
| axe on every `§18.2` private route, both themes                                                                                                                                       | Not run | Routes do not exist.                                                                                                                                     |
| axe across the `§17` state fixtures, including `provider unavailable` and `already missed`                                                                                            | Not run | Fixtures do not exist; `packages/contracts` is Phase 2.                                                                                                  |
| Keyboard-only completion of the 20 `§22.6` journeys, with the exact key sequence recorded                                                                                             | Not run | No routes, no browser. `pnpm test:e2e` is a stub.                                                                                                        |
| Skip link reaches `main`                                                                                                                                                              | Not run | `.skip-link` exists in `tokens.css` and is correctly `:focus`-triggered; whether it lands on `main` is a layout fact.                                    |
| Combobox keyboard contract: arrows move, Enter commits, Escape closes, no trap                                                                                                        | Not run | The primitive ships no key handling (F16); there is nothing to test until the caller supplies it.                                                        |
| Screen-reader pass — VoiceOver + Safari                                                                                                                                               | Not run | Not installed and not installable here.                                                                                                                  |
| Screen-reader pass — NVDA + Firefox                                                                                                                                                   | Not run | as above                                                                                                                                                 |
| Announced segment order: airline, flight number, origin/destination, scheduled time with airport code and zone, current time with code and zone, status, delay, provenance, freshness | Not run | No segment component exists. `AGENTS.md §3.3` makes a time without its zone a defect; that is a Phase 10 review item.                                    |
| DOM order equals travel order; no `order`, `dense`, `row-reverse` or absolute positioning decoupling visual from DOM order                                                            | Not run | No itinerary component exists. The cockpit grid in `primitives.css` is source-ordered and single-column below 1024px, which is the right starting point. |
| Landmarks: one `banner`, one `main`, one `contentinfo`; `nav` uniquely labelled                                                                                                       | Not run | Layouts are `frontend-ui-engineer`'s, Phase 10. F13 is a known future violation.                                                                         |
| Heading structure: one `h1`, no skipped levels, `§18.5` order reproduced by a heading-list jump                                                                                       | Not run | No cockpit exists. F14 is a known future violation.                                                                                                      |
| Error summary on submit: rendered at the top, focus moved to it, each entry linked to its field                                                                                       | Not run | No form flow exists. `Field` supplies the per-field half correctly.                                                                                      |
| SC 3.3.7 Redundant Entry across the itinerary builder and checkout                                                                                                                    | Not run | Flows do not exist.                                                                                                                                      |
| SC 3.2.6 Consistent Help                                                                                                                                                              | Not run | No support affordance exists.                                                                                                                            |
| SC 3.3.8 Accessible Authentication, including the Turnstile alternative                                                                                                               | Not run | Auth is Phase 7; passwordless is compliant in principle, the challenge is the risk.                                                                      |
| 200 % browser zoom at 375 and 1440                                                                                                                                                    | Not run | Needs a browser. The system is rem-based with no text container locked to a height, which is the precondition.                                           |
| SC 1.4.10 Reflow at 320 CSS px                                                                                                                                                        | Not run | as above. F20 is a latent risk in the legacy layer.                                                                                                      |
| SC 1.4.12 Text Spacing overrides (1.5× line height, 2× paragraph, 0.12em letter, 0.16em word)                                                                                         | Not run | as above. Shipped `--line-height-body` is 1.55, already above the 1.5 the SC applies.                                                                    |
| SC 1.4.13 dismissible / hoverable / persistent, in a browser                                                                                                                          | Not run | Determined by code inspection to fail — B5. A browser pass will confirm the fix.                                                                         |
| Touch targets measured on real renders: checklist checkboxes, segment chevrons, alert toggles, ad dismiss, sticky bottom bar                                                          | Not run | Only the primitives' declared minimums could be checked (§3). The composed patterns do not exist.                                                        |
| SC 2.4.11 Focus Not Obscured against sticky headers and the mobile bottom bar                                                                                                         | Not run | No sticky element exists yet.                                                                                                                            |
| Ad iframe `title`, "Advertisement" association, no focus trap                                                                                                                         | Not run | No ad unit is wired. F13 is the structural finding available today.                                                                                      |
| Consent banner: keyboard reachable, no focus trap, does not obscure focused content                                                                                                   | Not run | No banner exists.                                                                                                                                        |
| Lighthouse accessibility 100, public and app                                                                                                                                          | Not run | `pnpm quality` cannot complete; five of its steps are stubs (§11).                                                                                       |

---

## 11. Commands run

All executed in this session on branch `claude/intelligent-knuth-d3s8za`. The re-review column is the
run against the remediated tree at `63005a3`. `AGENTS.md §6` vocabulary.

| Command                                                       | First pass (`159ef48`)                                                                   | Re-review (`63005a3`)                                                                                                                                                                                                                                                                                                                                       |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`                                                   | **Passing** — 4 files, 353 tests                                                         | **Passing** — 4 files, **379 tests**                                                                                                                                                                                                                                                                                                                        |
| contrast suite summary                                        | `reports 94 pairs x 2 themes with zero unmeasured`                                       | `reports 103 pairs x 2 themes with zero unmeasured`                                                                                                                                                                                                                                                                                                         |
| `pnpm --filter @delaypilot/ui tokens:build`                   | not run                                                                                  | **Passing** — `103 registered pairs x 2 themes = 206 measurements, 0 failing, 0 unmeasured`; `Tightest light: --status-watch-border on --surface-sunken at 3.12:1`; `Tightest dark: --text-disabled on --surface-elevated at 3.30:1`. Re-running it produced no working-tree drift, so the committed `tokens.css` and `CONTRAST.md` are the generated ones. |
| `node scripts/validate-contrast.mjs`                          | **Passing** — 44 pairs, tightest 4.55:1                                                  | **Passing** — identical output                                                                                                                                                                                                                                                                                                                              |
| `node scripts/assets/verify-assets.mjs`                       | **Passing** — `171/171 checks passed.`                                                   | **Passing** — `174/174 checks passed.`                                                                                                                                                                                                                                                                                                                      |
| `pnpm lint`                                                   | **Passing**                                                                              | **Passing**                                                                                                                                                                                                                                                                                                                                                 |
| `pnpm typecheck`                                              | **Passing**                                                                              | **Passing**                                                                                                                                                                                                                                                                                                                                                 |
| `pnpm format:check`                                           | **Passing**                                                                              | **Passing**                                                                                                                                                                                                                                                                                                                                                 |
| `pnpm build`                                                  | **Passing**                                                                              | **Passing**                                                                                                                                                                                                                                                                                                                                                 |
| My re-measurement script (scratchpad, outside the repository) | **13 of 194 measurements below floor**, all in the 12 pairs the registry did not contain | **`pairs measured: 101 … measurements: 202 … failures: 0`** — and re-deriving the pair list from the new `primitives.css` produced nothing the registry does not hold                                                                                                                                                                                       |
| My render harness (`react-dom/server`, scratchpad)            | used to confirm B1–B6                                                                    | re-run; confirmed the ProgressBar readout, the default Skeleton with no live role, the `aria-labelledby` Switch, the `role="group"` AdSlot, the `newTab` Link, the `role="region"` DataTable, and a combobox option that is both selected and active                                                                                                        |
| B7 re-verification (`react-dom/server`, scratchpad)           | n/a                                                                                      | **Passing** — three fixture states rendered; `aria-valuetext` = `18 of 45 minutes, Watch` / `44 of 45 minutes, Critical` / `Unknown, Unknown`, and both strings still survive an `aria-*` strip. Tokens untouched: my own re-measurement returns an identical `101 pairs … 202 measurements … failures: 0`, and `tokens:build` left the tree clean.         |
| My pixel analysis of the mark evidence                        | 2 shapes at 16 px, 3 at 24 px, favicon 2 detached shapes                                 | re-run on the current renders: **identical**. The evidence PNGs and the mark geometry are byte-identical; only comments changed. §8 stands.                                                                                                                                                                                                                 |
| `pnpm test:a11y`                                              | **Failing (deliberate stub, exit 1)**                                                    | **Failing (deliberate stub, exit 1)** — `pnpm test:a11y is not implemented yet. Owner: accessibility-lead, DIRECTIVE.md Phase 12.` A stub that fails is correct; a stub that passes would be a lie.                                                                                                                                                         |
| `pnpm test:e2e`, `pnpm quality`                               | **Not run** — stubs                                                                      | **Not run** — unchanged                                                                                                                                                                                                                                                                                                                                     |
| `pnpm preview` + manual keyboard / SR / zoom passes           | **Not run** — no browser, no AT                                                          | **Not run** — unchanged                                                                                                                                                                                                                                                                                                                                     |

**Files changed by this review: one** — `docs/ACCESSIBILITY.md`. Zero product files, in either pass.
Every measurement script, render harness and pixel analysis was written to the session scratchpad,
outside the repository.

Artefacts reviewed, by content hash. The mark and favicon are unchanged between the two passes,
which is why the §8 decision did not need re-taking; the four that changed were re-read in full.

```
first pass (159ef48)                              re-review (63005a3)
ae119596…  apps/web/src/styles/tokens.css         536eca28…  changed: two component tokens, .chip wrap, motion delays
b7f28e3a…  packages/ui/src/primitives/…/*.css     27672f98…  changed: B1, B2, B5, F7, F10, F11, F12, tabs target
5061d7c1…  packages/ui/src/tokens/pairs.ts        75044228…  changed: nine registered pairs, two exemption reasons
54d3a9dd…  apps/web/public/brand/mark.svg         16f510ff…  comment block only; drawing byte-identical
451cbf96…  apps/web/public/icons/favicon.svg      451cbf96…  unchanged
```

---

## 12. The axe assertion spec for Phase 12

Specified here by `accessibility-lead`; implemented and owned by `qa-test-architect`. Recorded now so
the runner is not designed twice.

**Rule tags.** `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`. The `best-practice` tag runs as a
separate, reported-but-non-blocking pass — F13 and F14 live there and are still worth fixing.

**Threshold.** Zero violations at any impact level. Not "zero serious". There is no allowance for
`minor`, and no rule may be disabled without a finding in this document naming the rule, the reason
and the compensating manual test.

**Themes.** Every route runs twice: `prefers-color-scheme: light` and `dark`. A pair that passes on
one theme and fails on the other is a failing pair, and the design system is authored as two
first-class palettes rather than one inversion, so both must be exercised.

**Routes.** Every `§18.1` public route and every `§18.2` private route, enumerated in the
`accessibility-lead` charter. A route family is not covered by a sibling: `/passenger-rights/us/` is
not evidence for `/passenger-rights/eu/`.

**State fixtures.** Each `§17` state, on the surface that owns it: `loading`, `empty`, `unknown`,
`stale`, `cached`, `demo`, `provider unavailable`, `partial data`, `error`, `offline`, `already
missed`, `rights cannot determine`, `future rule not active`. A defect that exists only in `provider
unavailable` is still a defect, and those are exactly the states a traveler hits on a bad day.

**What axe cannot be asked to prove**, and therefore what the manual matrix in §10 must keep
carrying: focus order, reading order, meaningful live-region use, accessible-name quality, keyboard
traps in a custom combobox, whether a time carries its airport code and zone, and whether the
announced itinerary makes sense to a person standing at a gate.

---

## 13. The accessibility statement page — contract

A public accessibility statement is required at Phase 11 and is not written yet. This is the contract
for whoever builds it, so it cannot be filled with a claim nobody measured.

**Route.** `/accessibility/`, linked from the footer of every public page, alongside the
`DIRECTIVE.md §35` independence disclaimer.

**Owner.** Page shell `frontend-ui-engineer`; prose `ux-copy-steward`; every factual claim in it must
come from this document and must be reviewed by `accessibility-lead` before publication.

**Required contents.**

1. The standard and level claimed — WCAG 2.2 Level AA — and the date the claim was last verified.
2. The conformance status in plain words: fully conformant, partially conformant, or not conformant.
   §1 being green is a **Phase 9** result and is not the answer to this question. Until the Phase 12
   route-level, keyboard and screen-reader passes in §10.2 have actually been run, the only honest
   word is **partially conformant**, with the known issues listed. A green design-system gate is not
   a conformant product.
3. The known-issues list, derived from §1 and §2 of this document: what is affected, which success
   criterion, and when it is expected to be fixed. No issue may be omitted because it is embarrassing.
4. The environments tested — browser and screen-reader names _with versions_, from §10.
5. A feedback route: an email address or form that reaches a person, with a stated response time.
   It must be reachable without JavaScript and without completing a CAPTCHA.
6. The assessment method: self-assessment, and by whom.
7. No claim that the site "is accessible" or "meets all standards" in the absence of a passing
   audit. That is the accessibility form of the overclaim rule in `AGENTS.md §1.3`, and it is just as
   expensive: a traveler who trusts an inaccurate statement and cannot complete a booking-critical
   task has been misled.

---

## 14. Reproducing this review

Nothing here requires trusting this document.

1. `pnpm test` — re-measures all 103 registered pairs in both themes (379 tests).
   1a. `pnpm --filter @delaypilot/ui tokens:build` — regenerates `tokens.css` and `CONTRAST.md` and
   prints the measurement summary. It must leave the working tree clean; if it does not, the
   committed stylesheet is not the generated one.
2. `node scripts/validate-contrast.mjs` — re-measures the 44 compatibility-alias pairs from the
   shipped stylesheet.
3. `node scripts/assets/verify-assets.mjs` — re-asserts every asset colour against the token it came
   from, and the mark's geometry constraints.
4. For the review-added pairs: read the hexes out of `apps/web/src/styles/tokens.css`, apply WCAG 2.2
   relative luminance and `(L1 + 0.05) / (L2 + 0.05)`, truncate to two decimals, and compare against
   §4.1. Every input is in the repository.
5. For the mark: the evidence renders in `design/evidence/s2-mark/` are regenerated byte-identically
   by `node scripts/assets/build-assets.mjs --evidence`.

---

## 15. Revision history

| Date       | Phase                                   | Verdict                      | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | --------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-11 | Phase 9 (visual-overhaul session S2)    | **BLOCKED — 6 blockers**     | First revision. Tokens, contrast, focus, reduced motion, primitive semantics, mark legibility, motif inventory. Route-level, keyboard, screen-reader, zoom and Lighthouse results are Phase 12 and are recorded as Not run.                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-09-11 | Phase 9 re-review, tree `63005a3`       | **BLOCKED — 1 blocker (B7)** | B1–B6 verified closed and B7 raised: the fix for B3 put the band word inside a `role="progressbar"`, whose children are presentational, so `bandLabel` reaches the eye and not the accessibility tree (SC 1.3.1). Thirteen of the seventeen findings closed; F15, F22 and F23 remain with their original owners. Contrast re-measured: 101 unique rendered pairs, 202 measurements, zero below floor. Mark decision unchanged — the artwork is byte-identical. Phase 12 cells still Not run, for the same reason.                                                                                        |
| 2026-09-11 | Phase 9 B7 re-review, tree at `9dd1f75` | **GREEN**                    | B7 closed: `aria-valuetext` carries the reading and the band, verified from three rendered fixture states, with the visible readout intact. The `aria-describedby` alternative I had offered is recorded as rejected, correctly — it would have forced either a doubled announcement or a screen-reader-computed percentage, which is a published-precision defect. No token changed, so the contrast result is unchanged. F24 raised (copy, `ux-copy-steward`). Phase 9 has no open blocker; F15, F22, F23 and F24 remain with their owners for Phases 10–11, and every Phase 12 cell is still Not run. |
