# DelayPilot accessibility conformance

**Owner:** `accessibility-lead`. This is the only file this agent writes; every defect below is a
finding filed against another agent's path, never a patch (`AGENTS.md §3.5`).

**Standard:** WCAG 2.2 Level AA (`DIRECTIVE.md §7` accessibility floor). Two DelayPilot rules are
stricter than WCAG and are applied throughout: the 3:1 large-text allowance of SC 1.4.3 is never
used, and the touch-target floor is 44 × 44 px, not the 24 × 24 px of SC 2.5.8 (`DIRECTIVE.md §18.7`).

**Reviewed:** 2026-09-11 (Phase 9, three passes) and 2026-09-12 (Phase 10, two passes).
**Branch:** `claude/intelligent-knuth-d3s8za`. **This revision describes the product tree at
`692ad3f`**, which is head `9692818` less the build-plan commit.

| Pass                               | Phase | Tree      | Verdict                                                           |
| ---------------------------------- | ----- | --------- | ----------------------------------------------------------------- |
| First                              | 9     | `159ef48` | BLOCKED — 6 blockers, 17 findings                                 |
| Re-review after remediation        | 9     | `63005a3` | BLOCKED — 1 blocker (B7, created by the fix for B3); B1–B6 closed |
| B7 re-review                       | 9     | `9dd1f75` | GREEN                                                             |
| Visual-overhaul session S3, routes | 10    | `d35f69c` | BLOCKED — 2 blockers (B8, B9), 14 findings (F25–F38)              |
| Re-review after the S3 fix loop    | 10    | `692ad3f` | **GREEN** — B8 and B9 closed by measurement; F39–F42 raised       |

**The current verdict is §15.15.** §15.1–§15.14 are the record of the first Phase 10 pass and are
left as written, so the two blockers can still be read as they were filed; §15.15 says what happened
to every one of them. Sections 1–14 are the Phase 9 record, except §10.2 (the manual matrix, carrying
the results Phase 10 measured, re-measured at the re-review) and §13 (the accessibility-statement
contract, carrying both readings of the statement). Where §1 says "Phase 12" for a route-level check,
read §15: those checks were brought forward and run.

The Phase 9 passes read the artefacts from the working tree; they were committed during the first
pass as `4491ab6` (design system), `0977dc9` (mark and asset pipeline) and `159ef48` (concept
boards), merged at `2053e95`, byte-identical before and after. `brand-design-director` then closed
the six blockers and thirteen findings in `363bce7`, `visual-asset-director` closed one in
`63005a3`, and B7 was closed in `9dd1f75`. Every claim made by those agents about their own fixes
was re-verified here from the code, from rendered markup and by re-measuring the ratios; none was
accepted on the strength of a report. The same rule governed the Phase 10 pass: every claim in the
`frontend-ui-engineer` handoff was re-run rather than believed, and two of them did not survive it.

**Scope of the Phase 9 revision (§1–§9, §11, §12, §14): DIRECTIVE.md Phase 9 only** — design
tokens, measured contrast, the focus system, reduced motion, the accessible semantics of the
`@delaypilot/ui` primitives as rendered markup, the brand mark's legibility, and the motif
text-equivalent inventory. **Scope of the Phase 10 revision (§15, §10.2, §13.1): the twenty served
routes of visual-overhaul session S3 plus the two conditional routes** — route-level axe in both
themes and both motion preferences, keyboard operation, focus visibility measured from rendered
pixels, reduced motion, reflow and zoom, touch targets, screen-reader semantics read from the
built markup, and the accessibility statement. No screen reader was run; §15.7 says so plainly and
§10.2 records those cells as `Not run` with the reason.

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

### 10.2 Route, keyboard, zoom and screen-reader scope — measured 2026-09-12

The 2026-09-11 revision recorded every cell below as `Not run`, with one reason: no browser and no
assistive technology existed in that environment. A browser exists now. Each cell therefore carries
the result this Phase 10 pass measured on the twenty served S3 routes (plus the two conditional
routes, built with `PUBLIC_CONTACT_EMAIL` set in a scratch build that was discarded). The cells that
are still `Not run` are the ones that need a screen reader or a surface that does not exist yet, and
each says which.

| Check                                                                                           | Result                                                                     | Evidence                                                                                                                                                           |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| axe `wcag2a` `wcag2aa` `wcag21a` `wcag21aa` `wcag22aa`, every served `§18.1` route, both themes | **Passing** — 0 violations in 80 runs, twice                               | §15.3, re-run §15.15                                                                                                                                               |
| axe on the two conditional routes, both themes                                                  | **Passing** — 0 violations in 8 runs, twice                                | §15.3, re-run §15.15                                                                                                                                               |
| axe with `prefers-reduced-motion: reduce`, every route, both themes                             | **Passing** — included in the 88 runs                                      | §15.3                                                                                                                                                              |
| axe on every `§18.2` private route                                                              | Not run                                                                    | No `§18.2` route exists in this build; they are Phases 5–8.                                                                                                        |
| axe across the `§17` state fixtures rendered by S3                                              | **Passing** — 17 states reached, 0 violations                              | §15.3. The states S3 does not render are listed there with the phase that adds them.                                                                               |
| Keyboard-only completion of the S3 journeys, with the key sequence recorded                     | **Passing** — 6 journeys                                                   | §15.6                                                                                                                                                              |
| Keyboard-only completion of the 20 `§22.6` journeys                                             | Not run                                                                    | Fourteen of the twenty need routes or a provider that do not exist yet. The six reachable ones are in §15.6.                                                       |
| Skip link reaches `main`                                                                        | **Passing**                                                                | §15.6. Measured at 375 and 1440: first tab stop, becomes visible, `#main`, next Tab lands inside `main`. F33 is a hardening request, not a failure.                |
| Combobox keyboard contract: arrows move, Enter commits, Escape closes, no trap                  | Not run                                                                    | The airline listbox has no options (Phase 3 reference data), so it never opens. No trap: measured, §15.6.                                                          |
| Screen-reader pass — VoiceOver + Safari                                                         | Not run                                                                    | Not installed and not installable here. §15.7 reads the accessibility tree instead and says what that cannot replace.                                              |
| Screen-reader pass — NVDA + Firefox                                                             | Not run                                                                    | as above                                                                                                                                                           |
| Announced segment order, with airport code and zone on every time                               | **Passing**                                                                | §15.7                                                                                                                                                              |
| DOM order equals travel order; no `order`, `dense`, `row-reverse` or absolute decoupling        | **Passing**                                                                | §15.7                                                                                                                                                              |
| Landmarks: one `banner`, one `main`, one `contentinfo`; `nav` uniquely labelled                 | **Passing**                                                                | §15.7                                                                                                                                                              |
| Landmark names unique within a page                                                             | **Passing** — F26 closed at the re-review                                  | §15.15. 0 `landmark-unique` results in 88 runs.                                                                                                                    |
| Heading structure: one `h1`, no skipped levels                                                  | **Passing** — 20 of 20 pages                                               | §15.7                                                                                                                                                              |
| `§18.5` cockpit order reproduced by a heading-list jump                                         | **Passing** — 14 of 14 at the re-review                                    | §15.15. F25 closed.                                                                                                                                                |
| Error summary on submit: rendered at the top, focus moved to it, each entry linked to its field | **Passing**                                                                | §15.6                                                                                                                                                              |
| `aria-invalid` and `aria-describedby` set per invalid field                                     | **Passing**                                                                | §15.6                                                                                                                                                              |
| SC 3.3.7 Redundant Entry                                                                        | Not run                                                                    | No multi-step flow and no checkout exists.                                                                                                                         |
| SC 3.2.6 Consistent Help                                                                        | **Passing** in the conditional build                                       | `/contact/` is reachable from the footer of every page and sits in the same place on each. Without `PUBLIC_CONTACT_EMAIL` no support affordance is emitted at all. |
| SC 3.3.8 Accessible Authentication                                                              | Not run                                                                    | Auth is Phase 7. No challenge and no login exists.                                                                                                                 |
| 200 % browser zoom at 375 and 1440                                                              | **Passing**                                                                | §15.10                                                                                                                                                             |
| SC 1.4.10 Reflow at 320 CSS px                                                                  | **Passing** — 20 of 20 exact at the re-review                              | §15.15. B8 and F31's reflow half closed.                                                                                                                           |
| SC 1.4.12 Text Spacing overrides                                                                | **Passing** at 1440, 375 and 320 at the re-review                          | §15.15                                                                                                                                                             |
| SC 1.4.13 dismissible / hoverable / persistent                                                  | Not applicable                                                             | No tooltip, no hover card and no `title` attribute is rendered on any served route. Measured, §15.7.                                                               |
| Touch targets at 375: every non-inline target ≥ 44 × 44 px                                      | **Passing** on the 20 served routes; **Failing** on the 2 conditional ones | §15.15. 0 below floor on the served routes; the feedback address is 196 × 23 — F41.                                                                                |
| SC 2.5.8 at 1440, including the spacing exception                                               | **Passing** — measured                                                     | §15.10                                                                                                                                                             |
| SC 2.4.11 Focus Not Obscured                                                                    | **Passing**                                                                | §15.6. No sticky or fixed element exists on any served route; measured, not assumed.                                                                               |
| Focus indicator measured from rendered pixels against both neighbours, both themes              | **Passing** — tightest 3.52:1                                              | §15.6                                                                                                                                                              |
| Contrast unchanged under the ambient motifs                                                     | **Passing**, with F35                                                      | §15.9                                                                                                                                                              |
| Reduced motion collapses every permitted item (ADR 0003 rule 4)                                 | **Passing**                                                                | §15.8                                                                                                                                                              |
| Ad iframe `title`, "Advertisement" association, no focus trap                                   | Not applicable                                                             | No ad unit and no iframe is rendered on any served route. Measured, §15.7.                                                                                         |
| Consent banner: keyboard reachable, no focus trap, does not obscure focused content             | Not applicable                                                             | No banner exists.                                                                                                                                                  |
| Dialog: focus in, trapped, restored, Escape, `aria-modal`, background inert                     | **Passing** on the one shipped modal                                       | §15.6. F15 is closed on every shipped surface and stays open against the two unrendered primitives.                                                                |
| Lighthouse accessibility 100, public and app                                                    | Not run                                                                    | `pnpm quality` exits non-zero at `pnpm test:workers`, which is a deliberate Phase 12 stub, before any Lighthouse step. §15.12.                                     |

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

**Executed 2026-09-12**, ahead of Phase 12, against the twenty served S3 routes. The runner was
written for this review and lives in the session scratchpad, outside the repository; `qa-test-architect`
still owns the CI implementation. Parameters actually used: axe-core 4.13.0, Chromium 1194 through
Playwright, viewport 1440 × 900, tags `wcag2a` `wcag2aa` `wcag21a` `wcag21aa` `wcag22aa`, and the
matrix `{light, dark} × {no-preference, reduce}` — four runs per route rather than two, because ADR
0003 rule 4 makes reduced motion a state the page can be wrong in. axe was served from a same-origin
URL through request interception rather than injected inline, so the page's real
`script-src 'self'` policy stayed enforced for the whole run; injecting it inline disables the CSP
under test and the first attempt failed loudly, which is the behaviour to keep. Results: §15.3, and
the identical re-run against the fix loop in §15.15.

**Five regression assertions beyond axe**, specified here because each one is a defect axe returned
clean on, and each has now been fixed once. `qa-test-architect` owns the implementation.

1. `document.scrollingElement.scrollWidth === window.innerWidth` at a 320 px viewport, on every
   route. B8 was two routes scrolling sideways with zero axe violations.
2. Every `role="progressbar"` on every route: `aria-label`, the first clause of `aria-valuetext`,
   and the band word are three different strings (`docs/VOICE.md §9.1`). B9 and F27 were both this
   rule, in different slots.
3. Every `<table>` in prose is inside an element with `role="region"`, `tabindex="0"` and a resolving
   `aria-labelledby`; every `<th>` carries a `scope`. F31.
4. No `aria-busy` attribute survives on a page that is not loading, and no `aria-live` attribute
   exists on a served route at all. F28, and the live-region rule in §15.7.
5. No element's accessible name ends with the word its own `<dt>` uses as a label — the
   "Delayed Status" shape. F29, and F39 which is the same defect one component over.

---

## 13. The accessibility statement page — contract

A public accessibility statement is required at Phase 11 and is not written yet. This is the contract
for whoever builds it, so it cannot be filled with a claim nobody measured.

**Route.** `/accessibility/`, linked from the footer of every public page, alongside the
`DIRECTIVE.md §3.4` independence disclaimer. (The 2026-09-11 revision cited `§35` for that
disclaimer. That was wrong: `§3.4` is the section `AGENTS.md §1.4` points at, and it is corrected
here rather than left to be copied into the page.)

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

### 13.1 Review of the statement as drafted — 2026-09-12

`ux-copy-steward` has written the prose (`apps/web/src/lib/copy/pages.ts`, `pages.accessibility`) and
`frontend-ui-engineer` the shell (`apps/web/src/pages/accessibility/`). Both are emitted only when
`PUBLIC_CONTACT_EMAIL` is set, so nothing is published today. I built the page with that variable set
to a review-only value, read the rendered result, and checked every factual claim against this
document.

**The shape is right and the tone is right.** All seven required contents are present, in their own
headed sections, with one `h1` and no skipped levels. "Partially conformant" is the honest word and
it is given in plain language with a reason. The `noClaim` sentence — "This statement does not say
that DelayPilot is accessible, or that it meets every standard" — is exactly §13.7 and is better
written than the contract that asked for it. The known-issues list gives each finding an id, an
affected surface, a criterion and an expected fix. The method section names self-assessment and the
independence of the reviewer. axe reports zero violations on the page in all four run combinations.

**It may not publish as written.** Every sentence below states something that this review has now
made untrue, or that was never measured. This is the ordinary consequence of a statement written
before the review it describes; it is listed sentence by sentence so nothing has to be guessed.

| #   | Field                   | The sentence as drafted                                                                                                                                                                  | Why it must change                                                                                                                                                                                                                                                  |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `lastVerified`          | `2026-09-11`                                                                                                                                                                             | The most recent review is 2026-09-12 (§15). A date that is one day stale is a small thing; a date that points at a review with a narrower scope than the one that has happened is a statement about coverage, and it understates it.                                |
| 2   | `lastVerifiedBody`      | "It covers the design system: the color tokens, the focus system, reduced motion, and the accessible semantics of the shared components."                                                | No longer the scope. §15 covers twenty-two routes, keyboard operation, focus measured from pixels, zoom, reflow, text spacing and touch targets.                                                                                                                    |
| 3   | `statusBody`            | "The route-level checks, the keyboard passes, and the screen-reader passes have not been run, so no stronger word would be true."                                                        | Two-thirds false. Route-level checks and keyboard passes have been run. Only the screen-reader passes have not. "Partially conformant" remains the right word, for a better reason: two AA failures are open (B8, B9), and that is what the sentence should say.    |
| 4   | `notTestedBody`         | "Automated checks on each route, keyboard-only passes of the main journeys, screen-reader passes, browser zoom, reflow at a narrow width, and text-spacing overrides have not been run." | Five of the six have been run. Only the screen-reader pass has not. Leaving this sentence up would understate the product to a reader who is deciding whether to trust it.                                                                                          |
| 5   | `environmentsIntro`     | "The checks that have been run were run without a browser"                                                                                                                               | False. Chromium 1194 through Playwright ran every route-level check. Add Chromium and axe-core 4.13.0 to the `environments` list with their versions, as §13.4 requires.                                                                                            |
| 6   | `environmentsNotTested` | "No browser and no screen reader has been used."                                                                                                                                         | Half false. Keep the screen-reader half exactly as written — "no Safari with VoiceOver result here, no Firefox with NVDA result, and none is implied by anything above" states the limit precisely and must survive the edit.                                       |
| 7   | `standardBody`          | "the minimum touch target is larger than the guideline floor"                                                                                                                            | True at 375 px, where every non-inline target measures ≥ 44 × 44. Not true at 1440 px, where five guide-card title links measure 343 × 23 and pass SC 2.5.8 only through its spacing exception (§15.10). Scope the sentence to the mobile layout, or fix the links. |
| 8   | `knownIssues` F22       | listed as open                                                                                                                                                                           | Closed. Measured in a `PUBLIC_SITE_URL` build: `og:image:alt` is "DelayPilot — Stay ahead of flight disruptions." and `twitter:card` is `summary_large_image`, on 20 of 20 pages (§15.2). Remove it, or move it to a closed list.                                   |
| 9   | `knownIssues` F15       | "Content behind an open dialog is not made inert … a pointer or a stylus can still reach it."                                                                                            | Not true of anything a reader of this site can open. The only modal shipped is the native `<dialog>` in the header, and `showModal()` makes the background inert at the platform level — measured (§15.6). Scope it to the unreleased primitives or drop it.        |
| 10  | `knownIssues`           | four entries                                                                                                                                                                             | Incomplete. B8, B9 and F25–F38 are open against served routes and belong here, with their criteria, before the page publishes.                                                                                                                                      |
| 11  | `feedbackNoJavaScript`  | "This page and the address below work without JavaScript and without solving a puzzle."                                                                                                  | The address is rendered **above** that sentence, not below it. On a page whose argument is that it does not round anything up, a wrong spatial reference is the wrong kind of error to ship.                                                                        |
| 12  | (missing)               | —                                                                                                                                                                                        | §13.5 requires a stated response time in the feedback section. "We aim to reply within five working days" exists only on `/contact/`, and `/accessibility/` neither states it nor links there. Add the response time, or link to `/contact/` in words.              |

Owner of 1–11: `ux-copy-steward` (`apps/web/src/lib/copy/pages.ts`). Owner of 12: `ux-copy-steward`
for the string, `frontend-ui-engineer` for the link if that is the route chosen. Owner of the
address-ordering half of 11: `frontend-ui-engineer` (`apps/web/src/pages/accessibility/`), if the fix
is to move the address rather than reword the sentence.

**Re-review required.** The statement is a factual claim about this document, so it does not publish
on the copy owner's say-so: send the revised prose back here and I will check it against §15 again.

### 13.2 Re-read of the revised statement — 2026-09-12, second pass

`ux-copy-steward` revised `pages.accessibility` and `frontend-ui-engineer` reordered the feedback
section. I rebuilt both conditional routes with `PUBLIC_CONTACT_EMAIL=review@example.invalid` — a
scratch value, never committed, in a scratch `outDir` — and read the rendered page against the twelve
rows above, one at a time.

**All twelve are addressed.** Row by row: `lastVerified` is `2026-09-12` (1); the scope sentence now
names routes, states, keyboard, focus, zoom, reflow, text spacing and targets (2); the status
sentence says two AA failures are open and that route-level and keyboard passes have run while the
screen-reader pass has not (3, 4); the environments section names Chromium 1194, axe-core 4.13.0,
Node 22.22.2, Vitest 4.1.10 and React DOM 19.3.0 with versions (5) and keeps the screen-reader
sentence — "There is no Safari with VoiceOver result here, no Firefox with NVDA result, and none is
implied by anything above" — intact, with "One browser engine was used, not several" added, which is
a limit I had not asked for and should have (6); the target sentence is scoped to the mobile layout
and names the spacing exception on wider ones (7); F22 is gone (8); F15 is scoped to the two
unreleased primitives and says the shipped drawer's inertness was measured (9); the known-issues list
carries B8, B9, F15, F23 and F25–F38 (10); the no-JavaScript sentence reads "This page and the email
address on it work without JavaScript and without solving a puzzle." and renders **above** the
address, so nothing points the wrong way (11); and "We aim to reply within five working days."
renders on the page (12). **F36 and F37 close.**

**And it is now out of date in the other direction, which is F40.** This re-review closed B8, B9 and
eleven of the fourteen findings, so a page that lists them as open overstates what is wrong, and the
sentence "Two Level AA failures are open on routes you can reach right now" is no longer true. That
is not a drafting error; it is the lag a conformance statement always has against the review it
describes, and it is exactly why §13 says the page does not publish on the copy owner's say-so.
Nothing false is published today: neither route is emitted unless `PUBLIC_CONTACT_EMAIL` is set, and
it is not set in the gate build. What F40 needs is in §15.15.

**One measurement the page failed.** The feedback address is a 196 × 23 px link at 375 px — F41.

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

## 15. Phase 10 review — S3 routes

> **VERDICT OF THE FIRST PASS: BLOCKED.** Two blockers, B8 and B9, both AA failures on served
> routes. Fourteen findings, F25–F38, none of them blocking. F22 and F24 are closed by measurement;
> F15 is closed on every surface this release actually ships; F17 and F23 are unchanged and
> unexercised.
>
> **This verdict has been superseded. §15.15 is the current one, and it is GREEN.** Everything from
> here to §15.14 is left exactly as it was filed, so the blockers can be read as they were written
> and the fix can be checked against the wording it was given.

This is not a conditional pass and it is not a near miss. B8 makes two routes scroll sideways at the
width a reader using 400 % zoom gets, and B9 tells a screen-reader user that a meter measures
something it does not measure. Both are small fixes. Neither is small in effect.

Everything else held up. Eighty-eight axe runs across twenty-two routes in both themes and both
motion preferences returned zero violations at any impact level. Every interactive element on every
route is reachable and operable from the keyboard, with a focus indicator I measured from rendered
pixels rather than from a token, at 3.52:1 or better against both of its neighbours in both themes.
Reduced motion collapses every permitted item to a static frame. Every time carries its airport code
and its zone. The connection cockpit publishes the whole of `T` — all seven terms, including the four
that do not apply — beside `W` and `S`, as a real table. Nothing is announced that should be silent:
there is not one `aria-live` region on any served route, and the lookup moves focus instead.

### 15.1 What was reviewed

The twenty routes served by the S3 build, plus the two that are emitted only when
`PUBLIC_CONTACT_EMAIL` is set:

`/` · `/flight-status/` · `/delay-risk/` · `/connection-risk/` · `/passenger-rights/` · `/guides/` ·
the five guide articles · `/methodology/` · `/data-sources/` · `/about/` · `/privacy/` · `/terms/` ·
`/editorial-policy/` · `/advertising-policy/` · `/affiliate-disclosure/` · `/404.html`; conditionally
`/accessibility/` and `/contact/`.

Not reviewed, because they do not exist in this build: every `DIRECTIVE.md §18.2` private route,
`/pricing/`, `/status/`, and the `airlines` / `airports` / `routes` families. A route family is never
certified by a sibling, and a route that is not built is not certified at all (`AGENTS.md §6`).

`§17` states reached and exercised: `initial`, `searching`, `no match`, `invalid flight`,
`multiple matches`, `provider unavailable`, `rate limited`, `stale`, `partial data`,
`conflicting providers`, `demo`, `empty`, `unknown`, `billing not configured`, and the connection
states `protected`, `self-transfer` and `insufficient data`. States that need a contract, a provider
or a trip — `already missed`, `offline`, `error boundary`, `maintenance`, `consent required`,
`ad blocked`, everything under Trip, Billing beyond not-configured, and Notifications — are not
reachable and are not claimed.

**Environment.** Node 22.22.2, Chromium 1194 through Playwright, axe-core 4.13.0, the built `dist`
served by a static server that applies the real `apps/web/public/_headers` policy, so every run was
held to `default-src 'self'; script-src 'self'; style-src 'self'` with no `unsafe-inline`. No screen
reader: none is installed here and none is installable. Every harness was written to the session
scratchpad, outside the repository.

**The tree under review is the committed tree `d35f69c`, and it is not the working tree.** Other
agents were editing in this workspace while the review ran: `git status` went from one modified file
at the start to forty-five at the end, among them `apps/web/src/lib/copy/pages.ts` (modified after my
last build) and `apps/web/src/lib/copy/bands.ts`. Every measurement in this section is of the build
of `d35f69c`, verified by the `dist` hash above. I re-read the two copy files afterwards to check
whether their changes touched anything I had just reviewed: `pages.ts` adds 38 lines to a source
docblock and does not touch `pages.accessibility`, so §13.1 stands as written; `bands.ts` moves a
minutes helper and does not change any string that reaches a meter, so F24's closure — which was
verified from the built HTML, not from the source — stands. **Nothing else in those forty-five files
is reviewed here.** A route whose copy or markup changes after this pass needs the pass again.

**Two scratch builds were made and discarded.** One with `PUBLIC_SITE_URL=https://example.invalid`
to check F22, one with `PUBLIC_CONTACT_EMAIL=review@example.invalid` to reach the two conditional
routes. Neither value was committed. `apps/web/dist` was rebuilt from the committed tree afterwards
and the md5 of the md5s of all its files is identical to the one taken before the scratch builds
(`f54c6cfb03c5a2e0ab60d2a9902ee1d6`), so the tree under review is the tree that was reviewed.

### 15.2 Status of the four carried findings, and of B8–B9

Statuses in this table are as of the first pass. B8 and B9 have since been closed by measurement and
the carried findings re-checked; §15.15 carries the current status of every one of them.

| #   | Status                                                                            | Verified how                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F15 | **Closed on every shipped surface**; stays open against the unrendered primitives | The one modal in the build is the header's native `<dialog>` opened with `showModal()`. Measured with the drawer open at 375: `:modal` true, `document.elementFromPoint` at the far corner of the viewport returns the dialog rather than the page behind it, `html` computes `overflow: hidden`, forty consecutive Tab presses produced nine stops and every one was inside the drawer, Escape closed it and returned focus to "Open menu" with `aria-expanded` back to `false`. `packages/ui/src/primitives/Dialog.tsx` and `Drawer.tsx` still lack `inert` and are rendered on no route — `dp-overlay` appears zero times in the built HTML — so the finding survives against them and cannot be hit by a reader. |
| F17 | **Not reproducible in S3**; stays open                                            | Zero `target="_blank"` and zero off-site `href` in any of the twenty-two built pages, so no link opens a new tab and there is nothing for the string to announce. `nav.newTab` = `opens in a new tab` exists and is asserted by `copy.test.ts:961`. Re-check at the phase that adds official-source links.                                                                                                                                                                                                                                                                                                                                                                                                           |
| F22 | **Closed 2026-09-12**                                                             | Built with `PUBLIC_SITE_URL` set. `og:image:alt` = `DelayPilot — Stay ahead of flight disruptions.` and `twitter:image:alt` the same, `twitter:card` = `summary_large_image`, on 20 of 20 pages. With the variable unset the image tags are omitted entirely and the card falls back to `summary`, which is the correct degradation: no image, no alt needed.                                                                                                                                                                                                                                                                                                                                                        |
| F23 | **Open by decision; fallback confirmed**                                          | `--brand-mark-accent` is declared nowhere — not in `tokens.css`, not in the built stylesheet — so the advance dot renders its literal fallback `#087fbd` in both themes. I re-measured it against the header surface it sits on: **3.52:1 light** (`#dce8f2`) and **4.31:1 dark** (`#07111f`). No success criterion applies to a logotype, so nothing is failing; the guard stands as written. If `frontend-ui-engineer` ever declares the property it must be per theme and registered in `pairs.ts`.                                                                                                                                                                                                               |
| F24 | **Closed 2026-09-12**                                                             | The string `Unknown, Unknown` appears zero times in the built HTML of all twenty-two pages. The unknown meter on `/connection-risk/` announces `aria-valuetext="Slack unknown, Unknown"` with `aria-valuenow` correctly omitted. `bands.ts` now states the rule as a rule — no `valueText` may equal its `bandLabel` — and `copy.test.ts` locks it across every band and every null combination, so it cannot come back by accident. See F27 for the one place the same class of stutter reappeared against the accessible _name_ instead of the band.                                                                                                                                                               |
| B8  | Open at the first pass; **closed 2026-09-12**                                     | Filed in §15.4, closed in §15.15                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| B9  | Open at the first pass; **closed 2026-09-12**                                     | Filed in §15.4, closed in §15.15                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

### 15.3 axe — 88 runs, zero violations

Run per §12: axe-core 4.13.0, tags `wcag2a` `wcag2aa` `wcag21a` `wcag21aa` `wcag22aa`, 1440 × 900,
each route four times — `{light, dark} × {no-preference, reduce}`.

```
axe-core 4.13.0 | runs: 80 | WCAG A/AA violations: 0 | incomplete: 20 | best-practice: 4 | console errors: 0
axe-core 4.13.0 | runs:  8 | WCAG A/AA violations: 0 | incomplete:  0 | best-practice: 0 | console errors: 0
```

The second line is the two conditional routes. Eighty-eight runs, **zero violations at any impact
level**, zero CSP refusals and zero page errors with the real served policy in force.

**The 20 incomplete results are all one rule and they are resolved, not waived.** Every one is
`color-contrast` with the message "Element's background color could not be determined because it is
overlapped by another element", on `/` (up to 63 nodes), `/flight-status/` (10), `/connection-risk/`
(6), `/methodology/` (2) and `/data-sources/` (1). The overlapping element is the ambient motif layer
at `z-index: -1`, which axe cannot see through. Waiving an `incomplete` because it is inconvenient is
how a contrast failure ships, so I measured the same question directly from rendered pixels instead:
§15.9 diffs each motif region with the motif painted and with it hidden, restricted to text bounding
boxes, and reports the one text run that is actually affected and by how much. Result: no measured
pair falls below floor in either theme.

**Best practice, reported and not blocking.** One rule, four runs, on `/connection-risk/`:
`landmark-unique`, two nodes, "The landmark must have a unique aria-label, aria-labelledby, or title
to make landmarks distinguishable". That is F26 and it is a real navigation problem even though axe
files it below the line. Every other route returned zero best-practice violations, including the
homepage with its fifteen-section cockpit — F13 and F14, the two best-practice findings predicted by
the Phase 9 review, do not occur, because `AdSlot` and `Dialog` are rendered nowhere.

### 15.4 The blockers

#### B8 — Two routes need horizontal scrolling at 320 CSS px

|        |                                                                                                       |
| ------ | ----------------------------------------------------------------------------------------------------- |
| Files  | `apps/web/src/layouts/app.css:1204` (`.dpx-cockpit`) and `:1381` (`.dpp-segment, .dpp-connection, …`) |
| Routes | `/` and `/connection-risk/`                                                                           |
| SC     | 1.4.10 Reflow (AA)                                                                                    |
| Owner  | `frontend-ui-engineer`                                                                                |

**Observed.** At a 320 CSS px viewport — what a reader gets at 400 % zoom on a 1280 px screen, which
is the width SC 1.4.10 names — the document scrolls sideways:

| Route               | viewport | `document.scrollWidth` | overflow |
| ------------------- | -------- | ---------------------- | -------- |
| `/`                 | 320      | 357                    | 37 px    |
| `/connection-risk/` | 320      | 376                    | 56 px    |
| `/connection-risk/` | 375      | 376                    | 1 px     |

The content pushed off-screen is ordinary text, not a data table: the demonstration banner, the
cockpit section titles, and the definition rows that carry the travel date, the traveler count and
the monitoring state. A reader at 400 % zoom has to scroll right to finish a sentence and left to
start the next one.

**Root cause, measured rather than guessed.** Walking the tree from `<body>` and comparing each
child's right edge against its parent's content box puts the overflow at exactly one place:

```
INTRODUCED AT: SECTION.dp-card.dp-card--raised (w=341) inside DIV.dpx-cockpit (content right=304, w=288)
INTRODUCED AT: DIV.dpp-connection__components (w=307) inside SECTION.dp-card (content right=288, w=256)
```

`.dpx-cockpit` and `.dpp-connection` are both `display: grid`. A grid item's automatic minimum size is
its content-based minimum, and cloning each child into a `width: min-content` probe shows one item
that cannot shrink: the connection card, min-content **341 px** on `/` where 288 px is available, and
inside it `.dpp-connection__components`, min-content **307 px** where 256 px is available. Every other
child measures between 62 px and 207 px and would fit.

The intrinsic width comes from the transfer-component `<table>`, min-content 395 px on `/`. `.dp-table`
is a scroll container (`packages/ui/src/primitives/primitives.css:992`, `overflow-x: auto`), and a
scroll container's automatic minimum size **is** zero — but only when it is itself the flex or grid
item. Here it is a block inside the plain, unstyled `div.dpp-connection__components`, so the
intrinsic width propagates straight through to the grid item and the column grows to fit it.

**Required.** Give the grid items a zero automatic minimum so the scroll container can do the job it
was built for: `min-inline-size: 0` on `.dpp-connection__components` and on the grid items of
`.dpx-cockpit` and the `.dpp-*` rule set at `app.css:1381`. Re-verify by measurement, not by eye:
`document.scrollingElement.scrollWidth` must equal `window.innerWidth` at a 320 px viewport on `/`
and `/connection-risk/`, and the component table must then scroll inside its own `role="region"` box,
which is already keyboard reachable (Phase 9 B6).

**Not in scope of this blocker but the same root cause:** the 1 px overflow on `/connection-risk/` at
375 px, and the amplified failure under the SC 1.4.12 text-spacing overrides (§15.10). Fixing B8
fixes all three.

#### B9 — The `/delay-risk/` band meter is announced as a connection-slack measurement

|         |                                                                                    |
| ------- | ---------------------------------------------------------------------------------- |
| File    | `apps/web/src/pages/delay-risk.astro:64` (`label={cockpit.connection.meterLabel}`) |
| Strings | `apps/web/src/lib/copy/cockpit.ts:173`                                             |
| SC      | 2.4.6 Headings and Labels (AA); 1.3.1 Info and Relationships (A)                   |
| Owner   | `frontend-ui-engineer` for the prop, `ux-copy-steward` for the string it needs     |

**Observed.** `/delay-risk/` is the page that explains why the product answers with a band rather than
a number, and it renders a `BandMeter` to show the band scale. From the built HTML:

```
role="progressbar"
aria-label="Connection slack against the required transfer time"
aria-valuemin="0" aria-valuemax="100"
aria-valuetext="Conditions are changing. Review the factors and keep alerts on., Watch"
```

The meter on this page shows neither connection slack nor a required transfer time. There is no
connection on the page at all. `BandMeter` passes `label` to `ProgressBar`'s `aria-label` and renders
it nowhere visible (`packages/ui/src/patterns/BandMeter.tsx:84`), so a sighted reader sees an unnamed
band scale and a reader using a screen reader is told, with no way to check, that it measures the
slack on a transfer. That asymmetry is the whole reason this role exists.

The `valuetext` compounds it: a full sentence, then a full stop, then a comma, then the band —
"Conditions are changing. Review the factors and keep alerts on., Watch". `DemoCockpit`'s own
docblock already identified that shape as announcing badly and avoided it on the homepage; the same
avoidance did not reach this page.

**Required.** A label that names what this meter shows — the risk band on a five-stop scale — as a
new string in `apps/web/src/lib/copy/`, and `delay-risk.astro` passing it instead of
`cockpit.connection.meterLabel`. A reading that is a reading and not a paragraph, distinct from the
band word per the F24 rule in `bands.ts`. While the string is being written: `cockpit.connection.meterLabel`
itself still says "slack" while the meter it names fills required-of-available (`bands.ts` says so at
length), so it is worth re-reading in the same pass.

### 15.5 Findings F25–F38

None of these blocks the gate. Each is a real defect with a named owner. **This table is the record
of the first pass; §15.15 walks all fourteen and says what happened to each.**

| #   | File                                                                                                   | SC / rule                                    | Observed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Required                                                                                                                                                                                                                                                       | Owner                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| F25 | `packages/ui/src/primitives/Callout.tsx:44`; call sites in `apps/web/src/components/DemoCockpit.astro` | 1.3.1 Info and Relationships (A)             | `Callout` renders its `title` as `<p class="dp-callout__title">`. Two of the fifteen `§18.5` cockpit sections are `Callout`s — "Weather and airspace" and the upgrade prompt — so a heading-list jump reproduces 12 of the 14 section headings `cockpit.ts` declares, and skips exactly the two panels that say a thing is unavailable.                                                                                                                                                                                   | Give `Callout` an optional heading level (defaulting to the current `<p>`, so nothing else changes) and have `StateBlock` forward it; pass level 3 from the cockpit. The copy layer already declares both as headings.                                         | `brand-design-director` (primitive), `frontend-ui-engineer` (call sites)                       |
| F26 | `apps/web/src/pages/connection-risk.astro`; `packages/ui/src/patterns/ConnectionCockpit.tsx`           | axe `landmark-unique` (best practice); 1.3.1 | `/connection-risk/` renders three cockpits. Each is a `region` named "Connection" and each contains a `region` named "Every component of the required transfer time". A landmark list therefore offers six entries under two names, and nothing distinguishes the protected case from the self-transfer case from the insufficient-data case.                                                                                                                                                                             | Give each instance a distinct heading and a distinct table caption — the topology is already the distinguishing fact. Three identically named landmarks are also how the same page will read once a real trip has two connections.                             | `frontend-ui-engineer`, with `ux-copy-steward` for the per-instance strings                    |
| F27 | `apps/web/src/lib/copy/cockpit.ts` (`assessment.bandLabel`), used twice in `DemoCockpit.astro:214-215` | accessible-name quality                      | The homepage assessment meter has `aria-label="Risk band"` and `aria-valuetext="Risk band, Disrupted"`, so it announces "Risk band … Risk band, Disrupted". The F24 rule stops `valueText` colliding with `bandLabel`; this is the same stutter one field over, against the accessible name.                                                                                                                                                                                                                              | A reading that is not the control's own name. The panel already carries the `§27` sentence above it, so the meter needs only the band and whatever qualifies it.                                                                                               | `ux-copy-steward`                                                                              |
| F28 | `apps/web/src/pages/flight-status.astro`; `packages/ui/src/patterns/StateBlock.tsx:96`                 | 4.1.2 Name, Role, Value (A)                  | `/flight-status/` illustrates the `searching` state with a live `LoadingBlock`, so the page permanently exposes `role="group" aria-label="Track a flight" aria-busy="true"` while nothing is loading. Assistive technology that honours `aria-busy` may defer or skip the whole illustrated block.                                                                                                                                                                                                                        | An illustration variant that keeps the visible skeleton and the message and drops `aria-busy`, or the same block rendered without the attribute on this page. A state that is not true must not be in the accessibility tree.                                  | `frontend-ui-engineer`                                                                         |
| F29 | `packages/ui/src/patterns/SegmentCard.tsx:99`                                                          | accessible-name quality                      | The card passes `detail={copy.statusLabel}` into `StatusPill`, whose `detail` prop is documented as "a duration or a count". Every segment pill therefore reads "Delayed Status", "Canceled Status" — the field's label rendered where its value belongs, on the one control a traveler reads first.                                                                                                                                                                                                                      | Pass a real detail or nothing. The `<dt>Status</dt>` row already labels the value elsewhere on the card.                                                                                                                                                       | `frontend-ui-engineer`                                                                         |
| F30 | `apps/web/src/demo/itinerary.ts:130`                                                                   | 1.3.1 Info and Relationships (A)             | The shared `operationalDetail` pairs the label "Status" with the demonstration caption, so the disclosure announces "Status: Every airline, flight number, and airport here is invented…". The cancelled segment pairs the same label with a real status sentence, so the same label means two things on one page.                                                                                                                                                                                                        | Give the demonstration caption its own label, or render it outside the definition list. A `<dt>`/`<dd>` pair is a programmatic assertion that the value is the thing the label names.                                                                          | `frontend-ui-engineer`                                                                         |
| F31 | `apps/web/src/layouts/app.css:1869` (`.prose table`)                                                   | 1.3.1 (A); 1.4.10 (AA); Phase 9 B6           | The rights-status table on `/passenger-rights/` has no `<caption>`, no `scope` on its `<th>`, a first column of `<td>` where the status name is the row header, and no scroll container — so it contributes 18 px of page-level horizontal scroll at 320 CSS px and, unlike every `DataTable`, cannot be scrolled from the keyboard.                                                                                                                                                                                      | Wrap prose tables in the `role="region"` / `tabindex="0"` / `aria-labelledby` scroll container the `DataTable` primitive already uses, and give the table a caption, `scope` on its headers and a row-header column.                                           | `frontend-ui-engineer` (renderer), notify `content-editorial-lead` if the fix lands in content |
| F32 | `apps/web/src/components/LookupForm.astro:55`                                                          | hardening (2.4.3, 4.1.2)                     | The error summary is a `<div hidden tabindex="-1">` with no role and no accessible name. Focus moves to it correctly and the visible outline is drawn, but what a screen reader says on arrival is left to the browser's heuristics rather than stated.                                                                                                                                                                                                                                                                   | `role="group"` (or `region`) plus `aria-labelledby` pointing at the callout title, so arriving announces the summary by name. The rest of the flow is right and should not change.                                                                             | `frontend-ui-engineer`                                                                         |
| F33 | `apps/web/src/layouts/BaseLayout.astro:159`                                                            | hardening (2.4.1 Bypass Blocks)              | `<main class="dpx-main" id="main">` has no `tabindex="-1"`. In Chromium the skip link works fully — measured at 375 and 1440: the hash is set, the page scrolls, and the next Tab lands on the first control inside `main`. Without `tabindex="-1"` the landmark itself never takes focus, which some browser and screen-reader pairs handle less well.                                                                                                                                                                   | `tabindex="-1"` on `<main>`. One attribute, and it removes the dependence on a browser behaviour I can verify in exactly one browser.                                                                                                                          | `frontend-ui-engineer`                                                                         |
| F34 | `packages/ui/src/primitives/Callout.tsx:23`, `Toast.tsx:18`                                            | non-colour cue integrity                     | Both map severity `info` to the `status-unknown` glyph, so an informational notice wears the mark whose meaning in this product is the specific one of "insufficient fresh information". `Callout`'s own docblock claims "Every severity carries its own icon shape"; today it does not. A neutral `info` glyph now exists at `Icon.tsx:96` and is used by nothing.                                                                                                                                                       | Rewire both to `info`. This is my answer to the question `brand-design-director` raised, and the reasoning is in §15.11. `severityToStatusTone` may keep mapping `info` to the neutral tone — the four-tone rule is sound; it is the shape that has to differ. | `brand-design-director`                                                                        |
| F35 | `apps/web/src/layouts/app.css:701` (`.dpx-motif--grid`, `inset-inline: 45% 0`)                         | ADR 0003 rule 2b                             | At ≥ 1024 px the grid motif's left edge reaches into the hero's text column and paints behind the last run of one line — "Track a flight, understand connection risk". Measured by diffing the region with the motif painted and hidden: 40 background pixels in light, 26 in dark. The pair moves from **4.58:1 to 4.53:1** (light) and **5.54:1 to 5.46:1** (dark). Both stay above the 4.5:1 floor, so no SC fails; rule 2b says "never behind body text in a way that changes a measured pair", and 0.05 is a change. | Pull `inset-inline` in, or cap `.dpx-hero__support`'s `max-inline-size`, so no glyph sits over the grid. Whichever is chosen, the margin is currently 0.03 — worth closing before a copy edit lengthens the line.                                              | `frontend-ui-engineer`                                                                         |
| F36 | `apps/web/src/lib/copy/pages.ts` (`pages.accessibility`)                                               | §13 contract; `AGENTS.md §1.3`               | Eleven sentences in the accessibility statement state something this review has made untrue, and one required element is missing. Listed one by one in §13.1.                                                                                                                                                                                                                                                                                                                                                             | Revise per §13.1 and send it back here. A statement about conformance is a factual claim about this document and does not publish on the copy owner's say-so.                                                                                                  | `ux-copy-steward`                                                                              |
| F37 | `apps/web/src/pages/accessibility/`                                                                    | §13.5                                        | The feedback section renders the address and then the sentence "This page and the address below work without JavaScript…", so "below" points upwards; and the page states no response time and does not link to `/contact/`, which is where the five-working-day line lives.                                                                                                                                                                                                                                              | Move the address below the sentence or reword it, and state the response time on the page or link to it in words.                                                                                                                                              | `frontend-ui-engineer` for the order, `ux-copy-steward` for the string                         |
| F38 | `apps/web/src/components/InlineSvg.astro`; `apps/web/public/brand/motifs/route-globe.svg`              | markup hygiene                               | The inlined globe emits `<svg aria-hidden="true" focusable="false" … aria-hidden="true" focusable="false">` — both attributes twice, because the source file already carries what the inliner adds. Parsers keep the first and drop the rest, so nothing is wrong today; a duplicate attribute is a parse error that a future validator will report as one.                                                                                                                                                               | Strip the attributes the inliner is about to add, or stop adding ones the source already has.                                                                                                                                                                  | `frontend-ui-engineer`, with `visual-asset-director` for the source file                       |

### 15.6 Keyboard operation

Every walk below was driven by real key presses, from the first Tab, with the accessible name, the
bounding box, the computed focus indicator and an occlusion test captured at each stop.

**Homepage, 1440 px, light.** 47 stops, then focus left the document — no trap, no cycle. Order:
skip link → brand → Product disclosure → Passenger rights disclosure → Guides → Methodology → About
→ theme radio group (one stop, roving, as a radio group should be) → hero's two calls to action →
the five lookup fields → submit → demo shortcut → the demo cockpit's disclosures and both table
regions → link strip → five guide cards → thirteen footer links. DOM order matched visual order at
every stop: the hero's buttons at y=350 precede the lookup at y=366, and the lookup's five fields run
left-to-right, top-to-bottom in the order they are laid out.

**Homepage, 375 px.** 42 stops, no trap. The header nav is `display: none` and does not appear in the
sequence — it is not merely hidden from view — and its place is taken by the "Open menu" button.

**The drawer.** Tab ×3 → Enter opens it. `:modal` true, focus lands on "Close menu" inside the
dialog, `aria-expanded="true"` on the invoker, `html` computes `overflow: hidden`. Forty consecutive
Tab presses never reached a control outside the dialog. `document.elementFromPoint(20, 690)` returns
the dialog, not the page behind it. Escape closed it, `aria-expanded` returned to `false`, and focus
returned to "Open menu". This is F15 closed on the shipped surface, and it is closed by choosing a
platform modal over a hand-written trap, which is the right way to close it.

**The disclosures.** Enter opens (`aria-expanded="true"`, panel unhidden), Escape closes and returns
focus to the trigger it was opened from, and moving focus out of the group closes it behind you.
Segment and evidence disclosures are native `<details>`/`<summary>`.

**The theme control.** Two `<fieldset>` groups with distinct `name` attributes — `dp-theme-header`
and `dp-theme-drawer` — exposed as `group "Theme"`, with exactly one in the accessibility tree at any
width because the other is inside `display: none` or a closed `<dialog>`. Native radios, so arrow
keys, the roving tab stop and the "2 of 3" announcement come from the platform. The 1 × 1 clipped
input keeps the ring: it is redrawn on the visible pill through `:has()`, and I measured it there.

**The lookup, keyboard only, both paths.** Invalid submit: the summary appears at the top of the
form, focus moves to it, it carries the title "Check these details before searching" and three links
whose targets all resolve, each field gets `aria-invalid="true"` and an `aria-describedby` that
carries its hint **and** its error, and Tab-then-Enter on the first link moves focus to the airline
field. Valid submit: the `searching` region is shown with `aria-busy="true"`, then the
provider-unavailable result is shown and **focus moves to it** — there is no `aria-live` region on
the page at all, and there should not be. Both optional fields were left untouched by the validator.

**Focus indicator, measured from rendered pixels.** Not from tokens. For each surface I focused the
control by keyboard, screenshotted the region and scanned a column of pixels up through the ring:

| Surface                        | light: outer / ring / halo        | ratio vs outer | vs halo | dark: outer / ring / halo         | vs outer | vs halo |
| ------------------------------ | --------------------------------- | -------------: | ------: | --------------------------------- | -------: | ------: |
| skip link, on the header       | `#dce8f2` / `#087fbd` / `#ffffff` |         3.52:1 |  4.39:1 | `#07111f` / `#31c5ff` / `#050b16` |   9.52:1 |  9.90:1 |
| brand link, on the header      | `#dce8f2` / `#087fbd` / `#ffffff` |         3.52:1 |  4.39:1 | `#07111f` / `#31c5ff` / `#050b16` |   9.52:1 |  9.90:1 |
| nav disclosure, on the header  | `#dce8f2` / `#087fbd` / `#ffffff` |         3.52:1 |  4.39:1 | `#07111f` / `#31c5ff` / `#050b16` |   9.52:1 |  9.90:1 |
| theme pill (ring via `:has()`) | `#dce8f2` / `#087fbd` / `#dce8f2` |         3.52:1 |  3.52:1 | `#07111f` / `#31c5ff` / `#07111f` |   9.52:1 |  9.52:1 |
| hero primary button, on base   | `#dce8f2` / `#087fbd` / `#ffffff` |         3.52:1 |  4.39:1 | `#07111f` / `#31c5ff` / `#050b16` |   9.52:1 |  9.90:1 |
| combobox input, on a card      | `#ffffff` / `#087fbd` / `#ffffff` |         4.39:1 |  4.39:1 | `#0b1728` / `#31c5ff` / `#050b16` |   9.04:1 |  9.90:1 |
| submit button, on a card       | `#ffffff` / `#087fbd` / `#ffffff` |         4.39:1 |  4.39:1 | `#0b1728` / `#31c5ff` / `#050b16` |   9.04:1 |  9.90:1 |
| disclosure summary, on a card  | `#ffffff` / `#087fbd` / `#ffffff` |         4.39:1 |  4.39:1 | `#0b1728` / `#31c5ff` / `#050b16` |   9.04:1 |  9.90:1 |
| table scroll region, on a card | `#ffffff` / `#087fbd` / `#ffffff` |         4.39:1 |  4.39:1 | `#0b1728` / `#31c5ff` / `#050b16` |   9.04:1 |  9.90:1 |
| footer link, on the footer     | `#dce8f2` / `#087fbd` / `#ffffff` |         3.52:1 |  4.39:1 | `#07111f` / `#31c5ff` / `#050b16` |   9.52:1 |  9.90:1 |
| link-strip link, on elevated   | `#eef5fb` / `#087fbd` / `#ffffff` |         3.99:1 |  4.39:1 | `#050b16` / `#31c5ff` / `#050b16` |   9.90:1 |  9.90:1 |

Tightest measured pair: **3.52:1**, against the 3:1 floor of SC 1.4.11. The ring is 2 px at a 2 px
offset with the gap filled, on every stop of every walk, in both themes — 0 stops with
`outline-style: none` and no compensating indicator across six route walks. The one `outline: none`
in the codebase (`primitives.css:704`) moves the ring to the visible box two rules later; it is not a
removal.

**SC 2.4.11 Focus Not Obscured.** Passing, and passing for a structural reason: there is no
`position: sticky` and no `position: fixed` element on any served route except `.dp-overlay`, which is
rendered nowhere. The occlusion test at every stop of every walk returned nothing obscured except the
1 × 1 clipped radio input, whose indicator is drawn on the pill covering it.

**Journeys completed keyboard only** (six of the `§22.6` twenty are reachable in S3; the other
fourteen need routes or a provider that do not exist): skip to main content; open a nav disclosure
and reach a destination; open the mobile drawer, change theme, close it and return; submit the lookup
with nothing filled in and repair the first error from the summary; submit a valid lookup and read the
provider-unavailable result; open a segment's operational detail and read the transfer-component
table from inside its scroll region.

### 15.7 Screen-reader semantics, read from the accessibility tree

**Said plainly first: no screen reader was run.** What follows is the Chrome accessibility tree and
the built markup, which is what a screen reader is given, not what it says. It catches a missing
name, a wrong role, a broken order; it cannot catch how a sentence lands on someone standing at a
gate. The VoiceOver and NVDA cells in §10.2 stay `Not run`.

**Landmarks and headings.** All twenty pages: exactly one `<h1>`, exactly one `<main>`, exactly one
`<footer>`, no skipped heading level anywhere. The nested `<header>` elements inside cards are scoped
to sectioning content and are not `banner` landmarks — axe's duplicate-banner rule is silent on all
twenty. Two `nav`s, "Primary" and "Footer", and the drawer's second "Primary" is inside a closed
`<dialog>` and out of the tree. One landmark-name collision, F26.

**The `§18.5` cockpit order.** The heading list on `/` reproduces the required reading path, in order:
the trip title → Overall status → Route → Segments → Latest change → Next step → Delay and
cancellation assessment → Connection → Passenger rights → Action checklist → Evidence → Alerts →
Sources and freshness. Weather and airspace, and the upgrade prompt, are missing from that list — they
are `Callout`s and their titles are paragraphs. That is F25, and it is the whole gap: 12 of 14.

**A segment announces in the right order, with the right facts.** From the built markup of the stale
inbound card: airline and flight number as the heading; status pill "Delayed"; route "DM1 Demo Origin
→ DM2 Demo Hub" with the arrow `aria-hidden`; then `Departs · Scheduled` "08:20", a visually hidden
"Airport and time zone", "DM1", "Pacific Daylight Time", "America/Los_Angeles", "Sat 14 Mar"; then
`Departs · Estimated` with "Estimated" attached to the time itself; then Delay "Estimated delay 47
minutes"; Gate "The gate has not been published yet."; Terminal likewise; Source; Confidence; then the
provenance chip "Stale" with "Updated 96 minutes ago from Demonstration fixture." **Every displayed
time carries its airport code and its zone** (`AGENTS.md §3.3`) — I checked every time on every route,
not a sample. No blank, no dash, no zero stands in for a missing value.

**Itinerary order is travel order.** One `<ol>`, three `<li>`, DOM order DM1 → DM2 → DM3. At 1440 the
list becomes `grid-auto-flow: column` — not `dense` — and renders at x=200, x=551, x=901 on one row,
left to right, in source order. There is no `order`, no `row-reverse`, no `grid-auto-flow: dense` and
no absolute positioning anywhere in the stylesheet that could decouple the two.

**Provenance and status never depend on colour.** 45 provenance chips across the build, every one
with a glyph **and** a text label; the six label strings are exactly `Live`, `Cached`, `Demo`,
`Heuristic risk band`, `Stale`, `Unavailable` — the `AGENTS.md §1.2` six, no synonym and no seventh.
39 status pills, every one with a glyph and a text label. Zero icon-only instances of either. The four
status silhouettes are distinct shapes — circle-and-check, triangle, octagon-and-cross,
rounded-square-and-query — so they survive greyscale; the fifth shape, `info`, exists and is not yet
wired (F34).

**The graphics have text equivalents, and there is no canvas anywhere.** `<canvas>` appears zero times
in the build. The connection cockpit publishes the whole decomposition as a captioned `<table>` with
`scope` on every header: Leave the aircraft 12 minutes (Estimated), Walk between gates 14 (Airport-derived),
Security re-screening 8 (Airport-derived), Border control "Not required on this transfer"
(Airport-derived), Reclaim and recheck a bag "Not required on this transfer" (Policy-derived),
Mobility assistance "Not required on this transfer" (Policy-derived), Uncertainty buffer 10
(Estimated) — all seven terms of `T`, including the four that contribute nothing, beside Available
time 51 minutes, Required transfer time 44 minutes and Slack 7 minutes. 12 + 14 + 8 + 10 = 44, and the
table says so. The band meter carries a named stop list with a visually hidden "Current band" marker.
The two ambient motifs and the route globe are `aria-hidden` decorations that carry no data; the globe
sits in a `<figure>` whose visible `<figcaption>` says "Illustrative route lines — not live traffic.",
which is the right call — there is no data to put in a text equivalent, and the sentence a reader needs
is visible to everyone.

**Live regions.** Zero. No `aria-live`, no `role="status"`, no `role="alert"` on any served route.
Nothing here changes without a user acting, so nothing should announce, and the one state transition
that exists moves focus instead. This is the correct answer and it is worth recording as one, because
the cheap version of this page would have wrapped the lookup result in a polite region and called it
accessible.

**Tables.** The transfer-component breakdown and the status-change chronology are real `<table>`s with
`<caption>` and `scope` on every header cell — 6 `scope="col"` and 11 `scope="row"` on `/`. The
receipts and airline-message tables are not rendered: the demonstration passes empty arrays, so they
are not certified here. The one content table on `/passenger-rights/` is F31.

**Uppercase subheadings.** The DOM text is sentence case ("What may apply") and the uppercase is CSS
`text-transform`, which is the correct implementation. Chrome's tree reports the transformed string;
screen readers take the name from the API. No finding.

**No hover-only content, no ads, no iframes, no `title` attributes** on any served route — measured,
so SC 1.4.13 and the ad rules are Not applicable rather than assumed.

### 15.8 Reduced motion — ADR 0003 rule 4

ADR 0003 names `accessibility-lead` as the reviewer of rule 4, so this is measured from computed
styles and the Web Animations API, not from a screenshot.

With `prefers-reduced-motion: no-preference` on `/`: `--motion-reveal` `.24s`,
`--motion-reveal-distance` `16px`, `--motion-ambient-cycle` `12s`, `--motion-view-transition` `.18s`;
`document.getAnimations()` reports **4 running** — the radar sweep, the route packets and the globe
draw-in — each at or under the 12 s ceiling, and the globe's at `iteration-count: 1`.

With `prefers-reduced-motion: reduce`, same page, same measurement:

```
tokens: reveal 1ms, reveal-distance 0px, ambient-cycle 0s, view-transition 1ms
document.getAnimations(): 0 running of 0 total
.dpx-reveal            (7 nodes): animationName=none, opacity=1, transform=none
.dpx-chronology__step  (5 nodes): animationName=none, opacity=1, transform=none
.dpx-motif--radar #sweep (1):     animationName=none, opacity=1, transform=none
.dpx-motif--routes .packet (3):   animationName=none, opacity=1, transform=none
.dpx-globe #routes path (3):      animationName=none, opacity=1, transform=none
```

Rule 4 item by item: reveals are instant (and their un-animated DOM is already the final state —
every `.dpx-reveal` computes `opacity: 1` in **both** modes, because the animation only exists inside
`@supports (animation-timeline: view())`, so a browser without scroll timelines shows finished
content rather than a blank waiting to fade); both motifs render a single static frame; the
chronology shows the complete list — five `<li>`s, `opacity: 1`, `display: list-item`, 112 px each, in
both modes; view transitions are off by `@view-transition { navigation: none }` inside the reduce
block, declared in the stylesheet rather than delegated to a router. **Rule 4: met.** The state change
itself is never removed, because there is no state change in any of these — they are decoration, and
the data-bearing components carry no motion at all, which is rule 1.

`pnpm test:a11y` runs axe under `reduce` on every route as part of the 88: a defect that exists only
in the reduced-motion frame is still a defect. There were none.

### 15.9 Contrast under the ambient motifs

ADR 0003 rule 2b: a motif may never sit behind body text "in a way that changes a measured pair". The
motifs are `z-index: -1` and axe cannot see through them (§15.3), so I measured it directly: for each
motif layer, screenshot the region with the layer painted and again with it hidden, diff the two, and
restrict the diff to the bounding boxes of text runs. Pixels that are not pure background in the
hidden render are glyph antialiasing and are excluded — including them puts a glyph edge into the
result and produces a frightening number that means nothing.

| Layer                | 1440 light                                   | 1440 dark                                |
| -------------------- | -------------------------------------------- | ---------------------------------------- |
| `.dpx-motif--grid`   | 1 text run affected, 40 background px        | 1 text run affected, 26 background px    |
| `.dpx-motif--radar`  | 11 text runs in region, **0 px changed**     | 11 text runs in region, **0 px changed** |
| `.dpx-motif--routes` | 0 text runs in region                        | 0 text runs in region                    |
| `.dpx-globe`         | 1 text run in region (the caption), **0 px** | 1 text run in region, **0 px**           |

The one affected run is the hero's support line, "Track a flight, understand connection risk":

| Theme | text colour | clean background | painted range       | clean ratio | worst painted ratio |
| ----- | ----------- | ---------------- | ------------------- | ----------: | ------------------: |
| light | `#58687b`   | `#dce8f2`        | `#dae7f1`–`#dbe7f1` |      4.58:1 |          **4.53:1** |
| dark  | `#7a8da1`   | `#07111f`        | `#081220`–`#081321` |      5.54:1 |          **5.46:1** |

**No measured pair falls below floor in either theme**, so nothing here fails SC 1.4.3 and no Phase 9
measurement is invalidated. The pair does move, which is what rule 2b's wording forbids, and the light
margin is now 0.03 above the floor — F35. Below 1024 px the whole motif layer is `display: none`
rather than faded, which is the right call and is why there is nothing to measure at 375.

### 15.10 Reflow, zoom, text spacing, targets

| Condition                                  | Result                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 200 % zoom, 720 CSS px viewport, 16 routes | **Passing** — `scrollWidth == innerWidth` on all 16, zero overflowing elements, zero clipped containers                                                                                                                                                                                                                   |
| Text size 200 % (root font 32 px) at 1440  | **Passing** — no text clipped anywhere. The hero's `overflow: clip` trims its own decorative motif; I enumerated every text rect inside the hero against its clip box and found none outside it                                                                                                                           |
| 320 CSS px (400 % of 1280), 16 routes      | **Failing on 3** — `/` 37 px, `/connection-risk/` 56 px (B8), `/passenger-rights/` 18 px (F31). The other 13 are exact                                                                                                                                                                                                    |
| 375 CSS px, 16 routes                      | **Passing on 15**; `/connection-risk/` overflows by 1 px, same root cause as B8                                                                                                                                                                                                                                           |
| SC 1.4.12 text-spacing overrides at 1440   | **Passing** — 16 of 16, zero clipping, zero content lost                                                                                                                                                                                                                                                                  |
| SC 1.4.12 text-spacing overrides at 375    | **Failing on 2** — `/` 25 px and `/connection-risk/` 51 px of horizontal scroll; the same grid minimum as B8, amplified                                                                                                                                                                                                   |
| Touch targets at 375                       | **Passing** — 323 targets across 16 routes, 22 of them inline links inside sentences (SC 2.5.8 inline exception); of the remaining 301, **0 below 44 × 44**. Drawer links measure 319 × 44; the theme pills' hit area is the 44 × 44 `.dpx-theme__option`, not the 1 × 1 input                                            |
| SC 2.5.8 at 1440                           | **Passing** — five guide-card title links measure 343 × 23 and similar. They pass through the spacing exception, measured: the nearest other target is 138 px away and a 24 px circle needs 24 px. Note that the product's own 44 × 44 floor is a `§18.7` **mobile** rule, and at 375 those same links measure 45 px tall |

The overrides applied for 1.4.12 were the SC's own: line-height 1.5, letter-spacing 0.12em,
word-spacing 0.16em, paragraph spacing 2em, injected through `CSSStyleSheet`/`adoptedStyleSheets`
because the served `style-src 'self'` refuses an inline `<style>` — which is itself worth knowing: a
reader's own user stylesheet is unaffected by CSP, but a bookmarklet-based test would have failed
here for the wrong reason.

### 15.11 The `info` glyph — decision

`brand-design-director` added a neutral `info` glyph (`Icon.tsx:96`) and asked whether `Callout` and
`Toast` should be rewired to it. **Yes. Rewire both.** F34.

Three reasons, in the order they matter:

1. **`status-unknown` has a specific meaning in this product** and it is not "here is some
   information". It is the `AGENTS.md §1.1` designed state: we do not have enough fresh information.
   Today an informational callout wears that mark, so the shape that is supposed to mean "we do not
   know" also appears on a note that knows exactly what it is saying. On the homepage the upgrade
   prompt carries it, and nothing about billing not being configured is unknown.
2. **`Callout`'s own docblock is currently false.** It says "Every severity carries its own icon
   shape, so the severity survives greyscale". Four severities, three shapes.
3. **The non-colour strategy rests on shape.** `severityToStatusTone` maps `info` to the neutral tone
   deliberately — four tones, never a fifth colour — and that is right. But once colour is shared, the
   glyph is the only channel left, and it is shared too.

Not a blocker, for one reason: `Callout` and `Toast` both require a visible `title`, so no information
is lost today. Three `dp-callout--info` instances render in the build and each is named in words.

### 15.12 Commands run

All executed in this session on branch `claude/intelligent-knuth-d3s8za` at `d35f69c`. `AGENTS.md §6`
vocabulary.

| Command                                              | Result                                                                                                                                                                                                                                                                                                                            |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm --filter @delaypilot/web build`                | **Passing** — `20 page(s) built`, `verify-dist: 20 page(s) and 4 chunk(s) checked, 0 findings`                                                                                                                                                                                                                                    |
| `pnpm lint`                                          | **Passing** — eslint clean; `forbidden-phrases: 253 files scanned …, 0 hit(s) in 0 file(s)`                                                                                                                                                                                                                                       |
| `pnpm lint:copy`                                     | **Passing** — `0 hit(s) in 0 file(s)`                                                                                                                                                                                                                                                                                             |
| `pnpm typecheck`                                     | **Passing** — `66 files … 0 errors, 0 warnings, 0 hints`                                                                                                                                                                                                                                                                          |
| `pnpm test`                                          | **Passing** — `Test Files 14 passed (14)`, `Tests 692 passed (692)`                                                                                                                                                                                                                                                               |
| `pnpm test:a11y`                                     | **Failing (deliberate stub, exit 1)** — `pnpm test:a11y is not implemented yet. Owner: accessibility-lead, DIRECTIVE.md Phase 12.` A stub that fails is correct. The spec it will implement is §12, and §12 now records the parameters I actually ran, so `qa-test-architect` is not designing it from scratch.                   |
| `pnpm quality`                                       | **Failing** — reaches `pnpm format:check`, `lint`, `typecheck`, `test`, `build` and `seo:verify` (all passing; `verify-sitemap: 20 page(s) … 13 indexable`) and then exits non-zero at `pnpm test:workers`, a Phase 12 stub. No Lighthouse step is reached, so **Lighthouse accessibility 100 is Not run** and cannot be claimed. |
| axe sweep, 20 routes × 2 themes × 2 motion prefs     | **Passing** — `runs: 80 \| WCAG A/AA violations: 0 \| incomplete: 20 \| best-practice: 4 \| console errors: 0`                                                                                                                                                                                                                    |
| axe sweep, 2 conditional routes × 2 × 2              | **Passing** — `runs: 8 \| WCAG A/AA violations: 0 \| incomplete: 0 \| best-practice: 0 \| console errors: 0`                                                                                                                                                                                                                      |
| Keyboard walks (5 route/theme/width combinations)    | **Passing** — no trap, no missing indicator, no obscured control                                                                                                                                                                                                                                                                  |
| Focus-ring pixel measurement, 11 surfaces × 2 themes | **Passing** — tightest 3.52:1                                                                                                                                                                                                                                                                                                     |
| Reduced-motion computed-style measurement            | **Passing** — 0 running animations under `reduce`                                                                                                                                                                                                                                                                                 |
| Motif-behind-text pixel diff, 4 layers × 2 themes    | **Passing** with F35 — worst painted pair 4.53:1 light, 5.46:1 dark                                                                                                                                                                                                                                                               |
| Reflow / zoom / text-spacing / target sweeps         | **Failing** where §15.10 says so, **Passing** elsewhere                                                                                                                                                                                                                                                                           |
| Scratch build `PUBLIC_SITE_URL=…`                    | **Passing** — F22 confirmed closed; discarded, `dist` restored byte-identical                                                                                                                                                                                                                                                     |
| Scratch build `PUBLIC_CONTACT_EMAIL=…`               | **Passing** — `22 page(s) … 0 findings`; the two conditional routes reviewed; discarded, `dist` restored byte-identical                                                                                                                                                                                                           |
| `npx prettier --check docs/ACCESSIBILITY.md`         | **Passing**                                                                                                                                                                                                                                                                                                                       |

**Files changed by this review: one** — `docs/ACCESSIBILITY.md`. Zero product files, in this pass and
in all three Phase 9 passes. Every harness was written to the session scratchpad.

### 15.13 Handoffs

- **`frontend-ui-engineer`** — B8 (the grid minimum, `app.css`), B9 (the meter's `label` prop), F25
  call sites, F26, F28, F29, F30, F31, F32, F33, F35, F37 ordering, F38.
- **`brand-design-director`** — F25 (a heading level on `Callout`), F34 (rewire `info` to its own
  glyph in `Callout` and `Toast`).
- **`ux-copy-steward`** — B9's new meter label, F26's per-instance strings, F27, F36 (the eleven
  statement sentences and the missing response time in §13.1), F37 wording.
- **`qa-test-architect`** — lock §12 into CI with the parameters §12 now records: 88 runs, four per
  route, both themes and both motion preferences, zero violations at any impact, plus a
  `document.scrollingElement.scrollWidth === innerWidth` assertion at a 320 px viewport on `/` and
  `/connection-risk/` so B8 cannot come back silently.
- **`release-auditor`** — the verdict is BLOCKED. B8 and B9 are unresolved AA failures on served
  routes and are critical accessibility defects for the rubric. F25–F38 are open and tracked.
- **`trust-compliance-officer`** — nothing this pass. No ad slot, no iframe and no consent banner is
  rendered on any served route, so there is no placement to review and no ad-adjacent barrier.

### 15.14 What would make this GREEN

Fix B8 and B9, then re-run: the 88-run axe sweep, the 320 px reflow measurement on `/` and
`/connection-risk/`, and the `/delay-risk/` accessible name read back from the built HTML. Nothing
else needs re-reviewing. I will not accept a report that they are fixed; send the tree.

### 15.15 Re-review after the fix loop — 2026-09-12, tree `692ad3f`

> **VERDICT: GREEN.** B8 and B9 are closed, each verified by the measurement the blocker named rather
> than by the report that they were fixed. Eleven of the fourteen findings are closed, one is closed
> on the three items its owner could fix and re-owned for the fourth, two are open by decision. Four
> new findings are raised — F39, F40, F41, F42 — and none of them blocks: one is a route that is not
> served, one is a statement that is not published, and two are name-quality defects where the word a
> reader needs is present and a redundant one sits beside it.

Nothing was accepted on report. Every claim in the three handoffs was re-run, and two of them came
back different from what was claimed: F31 delivered three of its four items rather than four, and the
"Status" defect F29 named turns out to exist in a second component that the first pass missed.

**The tree under review is the tree that was sent, and I proved it rather than assumed it.** I built
the committed tree into a scratch `outDir` and compared it to the `apps/web/dist` I was given:
**all 20 HTML files and all 4 `_astro` assets are byte-identical**, the only difference being the
unreferenced React client chunk that `prune-dist.mjs` removes from a real build. I then ran
`node apps/web/scripts/verify-dist.mjs` against that `dist` myself — `20 page(s) and 4 chunk(s)
checked, 0 findings` — so the gate build's own guard is a result I executed, not one I was told.

**The working tree was clean while every measurement was taken, and it is not clean now.** All the
builds, sweeps and walks below ran between 23:10 and 23:30; between 23:31 and 23:34 six files changed
under me — `apps/web/src/lib/copy/{demo,home,lookup,pages}.ts`, `copy.test.ts` and `docs/VOICE.md`,
all `ux-copy-steward`'s — from a copy re-check running in parallel. **This verdict is on the
committed tree `692ad3f` and covers none of that work.** Two of those edits change strings that
render on `/`: the flight-number example under the lookup field, and the guides intro. Neither
touches a role, an accessible name, a landmark or a meter, and `pages.accessibility` is not in any of
the hunks, so F40 stands exactly as filed — but the rule from §15.1 applies unchanged: **a route
whose copy changes after this pass needs the pass again**, and those strings have not had it.

#### The two blockers

| #      | Verdict                | Fix, at file:line                                                                                                                                                                                                     | What I measured                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------ | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B8** | **Closed** — SC 1.4.10 | `apps/web/src/layouts/app.css:1258` (`.dpx-cockpit > *`), `:1453` (`.dpp-actions > *, .dpp-evidence > *, .dpp-alerts > *, .dpp-freshness > *`), `:1465` (`.dpp-connection__components`), `:1975` (`.dpx-prose-table`) | **20 of 20 routes exact at a 320 px viewport**: `document.scrollWidth == innerWidth == 320`, zero overflowing elements, zero clipped containers. `/` was 357 and `/connection-risk/` 376. Also exact at 375, and exact at both widths under the SC 1.4.12 overrides, where `/` was 25 px over and `/connection-risk/` 51 px.                                                                                                                                                      |
| **B9** | **Closed** — SC 2.4.6  | `apps/web/src/pages/delay-risk.astro`, `apps/web/src/lib/copy/cockpit.ts`                                                                                                                                             | Read back from the built HTML of `/delay-risk/`: `aria-label="Delay and cancellation assessment"`, `aria-valuetext="Risk band, Watch"`, no `aria-valuenow` claimed. The connection meter is now `aria-label="Required transfer time within the available connection window"` with `aria-valuetext="44 of 51 minutes, Watch"` — the label names what the bar fills, which is what `bands.ts` said it always did. Confirmed in Chrome's accessibility tree, not only in the markup. |

**B8's root cause is contained, not hidden, and I checked which.** Cloning each grid child into a
`width: min-content` probe at 320: the connection card's own minimum has fallen from **341 px to
195 px** against 288 px available, and every other child measures between 34 and 195. The table's
intrinsic 307 px is still there — it now stops at `.dpp-connection__components`, which is where the
zero minimum was added, and the `.dp-table` scroll container absorbs it. So the table scrolls
instead of the page, which is the outcome the blocker asked for. I then checked that the container
is genuinely operable rather than merely focusable: focus it, press ArrowRight, and `scrollLeft`
goes 0 → 40 → 53 = `scrollWidth - clientWidth` on `/`, and 0 → 36 = its maximum on
`/passenger-rights/`, while `window.scrollX` stays 0. Phase 9's B6 holds at 320 px.

**On B9's three slots.** `docs/VOICE.md §9.1` now states the rule as name ≠ reading ≠ band. Read from
the built pages: the homepage assessment meter is `"Delay and cancellation assessment"` /
`"Risk band"` / `"Disrupted"`; `/delay-risk/` is the same with `"Watch"`; the connection meters are
`"Required transfer time within the available connection window"` / `"44 of 51 minutes"` / `"Watch"`,
`"69 of 51 minutes"` / `"At risk"`, and `"Slack unknown"` / `"Unknown"` with `aria-valuenow` correctly
absent. Three slots, three registers, no collision in any state. **I considered and did not file** the
one register mismatch left: the unknown instance is named for required-in-available and reads "Slack
unknown". The visible readout says exactly the same words, so a screen-reader user and a sighted
reader are told the same thing, and that symmetry is the test that matters here.

#### F25–F38, one at a time

| #   | Verdict                                              | Evidence, measured at this tree                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F25 | **Closed**                                           | Both cockpit `Callout`s render `<h3 class="dp-callout__title">` — "Weather and airspace" and "Trip Pass". The heading list on `/` now reproduces **14 of 14 `§18.5` sections in `§18.5` order**, with the upgrade prompt last: trip title → Overall status → Route → Segments → Latest change → Next step → Delay and cancellation assessment → Connection → Weather and airspace → Passenger rights → Action checklist → Evidence → Alerts → Sources and freshness → Trip Pass. Zero skipped heading levels on all 22 pages. |
| F26 | **Closed**                                           | Three distinct captions on `/connection-risk/` — "…on one protected itinerary", "…on separate tickets", "…when the reservation is unknown" — and three distinct region names, confirmed as three distinct keyboard stops. **0 `landmark-unique` results in all 88 axe runs**, against 4 before. Zero duplicate region names on any of the 22 pages.                                                                                                                                                                           |
| F27 | **Closed**                                           | `aria-label="Risk band"` is gone; the homepage meter announces "Delay and cancellation assessment, Risk band, Disrupted". The stutter closed as a consequence of B9's name, which is the right way for it to close.                                                                                                                                                                                                                                                                                                           |
| F28 | **Closed**                                           | `aria-busy` appears **zero times** in the built `/flight-status/`, and the accessibility tree shows `group "Track a flight"` with no `busy` property. The skeleton, the reserved box and the message are all still there. The one `aria-busy="true"` left in the build is inside `<div data-dp-state="searching" hidden>` on `/`, which is the real state and is out of the tree until a search runs — correct, not a residue.                                                                                                |
| F29 | **Closed on `SegmentCard`; see F39**                 | Segment pills now read "Delayed", "Canceled", "Scheduled", "Status unknown". The identical misuse survives in `ItineraryTimeline`, which the first pass did not reach; that is F39 and it is mine to have missed, not a regression.                                                                                                                                                                                                                                                                                           |
| F30 | **Closed**                                           | The `<dt>Status</dt>` row now pairs with a real status sentence on every card — "No status has been reported for this segment yet." on the unknown segment — and the demonstration caption is out of the definition list. Every `<dl>` on `/` dumped and read pair by pair; no label means two things.                                                                                                                                                                                                                        |
| F31 | **Closed on three of four; the caption is re-owned** | Both prose tables are now `<div class="dp-table dpx-prose-table" tabindex="0" role="region" aria-labelledby="…">` named by the preceding heading ("The five statuses", "The six labels"), with `scope="col"` on the head row and `scope="row"` on the first column — **0 `<th>` without a scope anywhere in the build**. `/passenger-rights/` is exact at 320 and the region scrolls from the keyboard. **No `<caption>`**: see below.                                                                                        |
| F32 | **Closed**                                           | `<div class="dpx-errors" hidden tabindex="-1" role="group" aria-labelledby="lookup-errors-title">` with `id="lookup-errors-title"` on the `Callout` title, which resolves.                                                                                                                                                                                                                                                                                                                                                    |
| F33 | **Closed**                                           | `<main class="dpx-main" id="main" tabindex="-1">` on **22 of 22 pages**.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| F34 | **Closed**                                           | `SEVERITY_ICON.info` is `'info'` in both `Callout.tsx` and `Toast.tsx`. Four severities, four shapes; `severityToStatusTone` still maps `info` to the neutral tone, which was the right half to keep.                                                                                                                                                                                                                                                                                                                         |
| F35 | **Closed**                                           | Re-measured by the same pixel diff, both themes: `.dpx-motif--grid` covers 30 text rects on `/` and changes **0 pixels** behind any of them; radar, routes and globe also 0. The hero support pair measures **4.58:1 light and 5.54:1 dark** painted, which is its clean value, because nothing is painted over it. (Brand reported 5.55 for the dark pair; the difference is rounding against this document's truncation rule.)                                                                                              |
| F36 | **Closed**                                           | All twelve §13.1 rows addressed. Read sentence by sentence in §13.2. Superseded by F40, which is a different problem with the same file.                                                                                                                                                                                                                                                                                                                                                                                      |
| F37 | **Closed**                                           | The no-JavaScript sentence renders above the address and is direction-free; "We aim to reply within five working days." renders on the page. §13.2.                                                                                                                                                                                                                                                                                                                                                                           |
| F38 | **Closed**                                           | **7,507 tags parsed across the 20 built pages: zero with a duplicate attribute name.**                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| F15 | Unchanged — closed on every shipped surface          | Re-measured: the drawer is `:modal`, `html` computes `overflow: hidden`, the background hit test returns the dialog, every tab stop while open is inside it, Escape closes and returns focus to "Open menu" with `aria-expanded="false"`. The two primitives still render on no route.                                                                                                                                                                                                                                        |
| F17 | Unchanged — not reproducible                         | Still zero `target="_blank"` and zero off-site `href` in the build.                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| F23 | Unchanged — open by decision                         | No token changed in the fix loop: `git diff` over `packages/ui/src/tokens/**` and `apps/web/src/styles/**` is empty, so the Phase 9 contrast registry is untouched and `--brand-mark-accent` is still undeclared.                                                                                                                                                                                                                                                                                                             |

**On F31's missing `<caption>`, and why the finding does not stay open against the renderer.** The
region is named by the heading immediately above it, so a reader entering it hears "The five
statuses, region" before "table, 2 columns, 6 rows". The context a caption would have carried is
carried, SC 1.3.1 is satisfied, and the reflow and keyboard halves of the finding are fixed. The
caption text does not exist in the Markdown source and inventing one is a content decision, not a
rendering one, so the remaining item is re-owned to `content-editorial-lead` — one line of prose per
table in `apps/web/src/content/**`, after which the plugin can emit it.

#### Four new findings

| #   | File · line                                                                                                               | SC / rule               | Observed                                                                                                                                                                                                                                                                                                                                                                                                                                            | Required                                                                                                                                                                                                                                                                                                                          | Owner                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| F39 | `packages/ui/src/patterns/ItineraryTimeline.tsx:74`; call site `apps/web/src/components/DemoCockpit.astro:142` and `:149` | accessible-name quality | The route diagram's per-leg pill is passed `detail={leg.statusLabel}`, and `leg.statusLabel` is `cockpit.segment.status` — the literal word "Status" (`apps/web/src/lib/copy/cockpit.ts:84`). Both legs on `/` therefore render and announce "**Watch Status**" and "**Disrupted Status**": the field's label where its value belongs, visible as well as announced, and "Watch Status" reads as an instruction. Present at `d35f69c`; I missed it. | Pass a real detail or none, exactly as `SegmentCard` now does. If the leg wants a second word it is the flight's status word, not the name of the field.                                                                                                                                                                          | `frontend-ui-engineer`                                                               |
| F40 | `apps/web/src/lib/copy/pages.ts` (`pages.accessibility`)                                                                  | §13 contract            | The statement's known-issues list carries B8, B9 and eleven findings that this re-review has closed, and states "Two Level AA failures are open on routes you can reach right now". Neither route is emitted in the gate build, so nothing false is published — but the page cannot publish as written.                                                                                                                                             | Remove B8, B9, F25–F38 except F39–F42 and the F31 caption; keep F15, F23 and F17's owner; change the status paragraph to say that no AA failure is open on a served route and that the screen-reader pass is still outstanding; set `lastVerified` to the date of the pass that supports it. Then send it back here (§13, §13.2). | `ux-copy-steward`                                                                    |
| F41 | `apps/web/src/pages/accessibility/[...path].astro`, `apps/web/src/pages/contact/[...path].astro`                          | `DIRECTIVE.md §18.7`    | The feedback address is a bare `mailto:` link measuring **196 × 23 px at 375**, the only target below the product's 44 × 44 floor anywhere in the 22 pages. SC 2.5.8 passes through the spacing exception and I measured it — the nearest other target is 240 px away — so no criterion fails. The affordance a person uses **after hitting a barrier** should not be the smallest control on the site.                                             | Give the address the 44 px target every other control has, on both routes.                                                                                                                                                                                                                                                        | `frontend-ui-engineer`, with `brand-design-director` if the fix lands in a primitive |
| F42 | `packages/ui/src/patterns/StateBlock.tsx:156`                                                                             | announcement quality    | `LoadingBlock` renders the message as a visible `<p>` **and** passes it to `Skeleton`'s required `label`, which renders it again inside `.dp-visually-hidden`. Chrome's accessibility tree for `/flight-status/`: `group "Track a flight"` → `paragraph` → `StaticText "Looking up this flight."` → `StaticText "Looking up this flight."`. Every loading state in the product says its sentence twice.                                             | The bones carry no information — `aria-hidden` them, or make `Skeleton`'s `label` optional for the case where the region already renders the sentence. One announcement per load.                                                                                                                                                 | `frontend-ui-engineer`, with `brand-design-director` if `Skeleton`'s prop changes    |

#### The Callout heading-size decision — my view, as asked

`brand-design-director` kept `.dp-callout__title` at `font-size: inherit` and body line-height for
every level (`packages/ui/src/primitives/primitives.css:1277`), so `headingLevel` changes the
document outline and nothing visual. The reasoning given was that the level is structural, the tinted
container already carries the visual weight, and sizing the upgrade prompt like the rights card would
give a commercial prompt the type scale of rights content.

**Accept, and the third reason is the strongest one.** No success criterion requires a heading to be
visually larger; SC 1.3.1 runs the other way, and what it asks is that structure conveyed visually be
available programmatically. Here the visual channel already says "this is a named panel" through the
bordered, tinted box, the glyph and the semibold title, and the programmatic channel now says the
same thing plus its level. The two agree. Type scale is the one place `AGENTS.md §4` is enforced by
eye rather than by rule — "utility and official rights information always precede any commercial
suggestion" is about order, and giving "Trip Pass" the same headline size as "Passenger rights" would
undercut it in a channel the ordering rule does not reach.

One condition, and it is already met. Decoupling size from level removes the visual cue that would
otherwise catch a caller passing a level that does not fit the surrounding order. axe's
`heading-order` rule is the substitute, it runs on all 88 runs, and it is clean on all 22 pages —
so it must stay in the CI tag set, which §12 requires.

#### What else I re-ran, because the pages changed under the fixes

Forty-five product files moved between the two passes, so I did not re-check only the three things
§15.14 asked for.

| Re-run                                                                                                                                   | Result at `692ad3f`                                                                                                                                                                                                                                                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| axe, 20 routes × {light, dark} × {no-preference, reduce}                                                                                 | **Passing** — `axe-core 4.13.0 \| runs: 80 \| WCAG A/AA violations: 0 \| incomplete: 20 \| best-practice: 0 \| console errors: 0`. Best-practice was 4 before; F26 took it to zero.                                                                                                                                                                                      |
| axe, the 2 conditional routes × 2 × 2                                                                                                    | **Passing** — `runs: 8 \| WCAG A/AA violations: 0 \| incomplete: 0 \| best-practice: 0 \| console errors: 0`                                                                                                                                                                                                                                                             |
| The 20 `incomplete` results                                                                                                              | Same rule and same cause as §15.3 — `color-contrast` "overlapped by another element", the `z-index: -1` motif layer. Resolved by the pixel diff above, which now reports zero changed pixels rather than 40.                                                                                                                                                             |
| Reflow at 320, all 20 routes                                                                                                             | **Passing** — 20 of 20 exact, 0 overflowing elements, 0 clipped containers                                                                                                                                                                                                                                                                                               |
| Reflow at 375, all 20 routes                                                                                                             | **Passing** — 20 of 20 exact                                                                                                                                                                                                                                                                                                                                             |
| SC 1.4.12 overrides at 320, 375 and 1440                                                                                                 | **Passing** — 20 of 20 at each width. At 1440 the only boxes outside the viewport are the `aria-hidden` motif layer and the hero's own `overflow: clip` trimming it; walking every text run inside every clipping container on four routes in three modes found **one** clipped run, the 1 × 1 visually-hidden `<legend>Theme</legend>`, which is the technique working. |
| 200 % text size (root 32 px) at a 720 px viewport                                                                                        | **Passing** — 20 of 20, no clipping                                                                                                                                                                                                                                                                                                                                      |
| Touch targets at 375, 20 routes                                                                                                          | **Passing** — 0 below 44 × 44 and 0 below 24 × 24 among non-inline targets. Drawer open: 8 links and a close button, all ≥ 44, none below. Theme pills measure 57 × 44 and 44 × 44 at 1024 and 1440, taken from the `<label>` that is the real target rather than the 1 × 1 input.                                                                                       |
| Keyboard walks — `/` at 1440 light and 375 dark, `/connection-risk/` at 375, `/passenger-rights/` at 320, `/flight-status/` at 1440 dark | **Passing** — 44 stops on `/`, 26 on `/flight-status/`; **0 stops without a focus indicator, 0 obscured, 0 traps**, focus leaves the document at the end of every walk. The four `/flight-status/` disclosures and the three `/connection-risk/` table regions are each separately reachable.                                                                            |
| Focus indicator from rendered pixels, 12 surfaces × 2 themes                                                                             | **Passing** — 2 px ring; tightest **3.52:1 light** and **9.04:1 dark** against the outer neighbour, 4.39:1 and 9.9:1 against the inner. The new prose-table region carries it at 3.99:1 / 9.9:1.                                                                                                                                                                         |
| Reduced motion, computed styles and Web Animations API                                                                                   | **Passing** — 4 running animations under `no-preference`, **0 of 0 under `reduce`**; reveals, chronology, both motifs and the globe all static, every `.dpx-reveal` at `opacity: 1` in both modes, chronology complete at 5 × 112 px.                                                                                                                                    |
| Structure across all 22 pages                                                                                                            | **Passing** — one `<h1>` each, **0 skipped heading levels**, one `<main tabindex="-1">`, one `contentinfo`, **0 duplicate element ids**, **0 duplicate region names**.                                                                                                                                                                                                   |
| Live regions                                                                                                                             | **Zero.** No `aria-live`, no `role="alert"`, no `role="status"` on any of the 22 pages. The seven `role="note"` elements are the `§26` disclaimers and the new confidence note — static, not announced.                                                                                                                                                                  |
| Provenance vocabulary                                                                                                                    | **Passing** — 52 chips carrying exactly the `AGENTS.md §1.2` six: `Demo` 28, `Heuristic risk band` 10, `Unavailable` 6, `Stale` 4, `Live` 2, `Cached` 2. No synonym, no seventh, none icon-only.                                                                                                                                                                         |
| Graphics                                                                                                                                 | **Passing** — `<canvas>` zero times. 247 SVGs: 227 `aria-hidden="true"`, 20 `role="img"` and every one of those is the logotype named "DelayPilot" through a resolving `aria-labelledby`. **Zero SVGs with neither.**                                                                                                                                                    |
| Times                                                                                                                                    | **Passing** — every time on every card carries its airport code, its abbreviation and its IANA zone: "08:20 · DM1 · Pacific Daylight Time · America/Los_Angeles · Sat 14 Mar" (`AGENTS.md §3.3`).                                                                                                                                                                        |
| Ads, iframes, `title` attributes, new tabs                                                                                               | **Not applicable, measured** — zero of each across the 22 pages.                                                                                                                                                                                                                                                                                                         |
| `verify-dist` against the given `dist`                                                                                                   | **Passing** — `20 page(s) and 4 chunk(s) checked, 0 findings`, run by me                                                                                                                                                                                                                                                                                                 |

**One thing I looked at and did not file as a WCAG defect.** The four alert rows on `/` each carry a
`Demo` chip and "Updated 4 minutes ago from Demonstration fixture." but the "Demo data — not a live
flight." sentence appears after them rather than before, in the alert-settings panel below. Provenance
is announced as text on every row, which is what my charter asks, so there is nothing failing here —
but whether a `Demo` label may reach a reader ahead of its sentence is an `AGENTS.md §1.2` question
and it belongs to `trust-compliance-officer` and `ux-copy-steward`, not to me. Recorded so that it is
not lost. 26 demo sentences against 28 demo chips across the build; the other gap is the provenance
legend, which explains the label rather than labelling a datum, and is right as it is.

#### Commands run — re-review

Executed in this session, on branch `claude/intelligent-knuth-d3s8za`, head `9692818`, product tree
`692ad3f`. `AGENTS.md §6` vocabulary.

| Command                                                                                | Result                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm exec astro build --outDir <scratch>` (no env)                                    | **Passing** — `20 page(s) built`; output byte-identical to the given `apps/web/dist` for all 20 pages and all 4 assets                                                                                                                      |
| `PUBLIC_CONTACT_EMAIL=review@example.invalid pnpm exec astro build --outDir <scratch>` | **Passing** — `22 page(s) built`. A scratch address, never a real one, never committed, never inside the repository                                                                                                                         |
| `node apps/web/scripts/verify-dist.mjs`                                                | **Passing** — `verify-dist: 20 page(s) and 4 chunk(s) checked, 0 findings.`                                                                                                                                                                 |
| axe sweep, 20 routes × 2 themes × 2 motion preferences                                 | **Passing** — `runs: 80 \| WCAG A/AA violations: 0 \| incomplete: 20 \| best-practice: 0 \| console errors: 0`                                                                                                                              |
| axe sweep, 2 conditional routes × 2 × 2                                                | **Passing** — `runs: 8 \| WCAG A/AA violations: 0 \| incomplete: 0 \| best-practice: 0 \| console errors: 0`                                                                                                                                |
| Reflow / text-spacing / zoom sweeps, 20 routes × 6 conditions                          | **Passing** — every condition, every route                                                                                                                                                                                                  |
| Keyboard walks, 5 route/width/theme combinations                                       | **Passing** — no trap, no missing indicator, no obscured control                                                                                                                                                                            |
| Focus-ring pixel measurement, 12 surfaces × 2 themes                                   | **Passing** — tightest 3.52:1                                                                                                                                                                                                               |
| Motif-behind-text pixel diff, 5 layers × 2 themes                                      | **Passing** — 0 changed pixels behind any text run                                                                                                                                                                                          |
| Reduced-motion measurement                                                             | **Passing** — 0 running animations under `reduce`                                                                                                                                                                                           |
| Drawer / dialog measurement at 375                                                     | **Passing** — modal, inert background, contained focus, Escape restores                                                                                                                                                                     |
| Touch-target sweep, 22 routes at 375                                                   | **Passing** on the 20 served; **Failing** on the 2 conditional (F41)                                                                                                                                                                        |
| `pnpm exec prettier --check docs/ACCESSIBILITY.md`                                     | **Passing**                                                                                                                                                                                                                                 |
| `pnpm lint:copy`                                                                       | **Passing** — `0 hit(s) in 0 file(s)`                                                                                                                                                                                                       |
| `pnpm test:a11y`                                                                       | **Failing (deliberate stub, exit 1)** — unchanged. The spec it will implement is §12, which now also carries five non-axe regression assertions.                                                                                            |
| `pnpm quality`                                                                         | **Not run** in this pass. It was Failing at the first pass for a reason that has not changed — `pnpm test:workers` is a Phase 12 stub and exits before any Lighthouse step — so **Lighthouse accessibility 100 is still Not run**.          |
| `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`                               | **Not run** by me in this pass. They belong to the build agents' gate, the working tree had to stay clean and untouched, and `astro sync` inside `pnpm lint` writes into the tree. The orchestrator's gate build is what I verified, above. |

**Files changed by this review: one** — `docs/ACCESSIBILITY.md`. Zero product files, in this pass and
in all four passes before it. Every harness was written to the session scratchpad, outside the
repository; both scratch builds went to a scratch `outDir` and `apps/web/dist` was never rebuilt in
place.

#### Handoffs — re-review

- **`frontend-ui-engineer`** — F39 (`ItineraryTimeline.tsx:74` and the two `DemoCockpit.astro` call
  sites), F41 (the feedback address on both conditional routes), F42 (`StateBlock.tsx:156`).
- **`ux-copy-steward`** — F40, the statement's known-issues list and status paragraph, per §13.2.
  It comes back here before the page publishes.
- **`content-editorial-lead`** — a `<caption>` line for the two prose tables in
  `apps/web/src/content/**` (the last item of F31). The renderer is ready for it.
- **`brand-design-director`** — nothing open. F34 and F25's primitive are closed, the heading-size
  decision is accepted above, and no token moved, so the Phase 9 contrast result stands unchanged.
- **`qa-test-architect`** — §12 as it now reads: 88 runs, four per route, both themes and both motion
  preferences, zero violations at any impact, plus the five regression assertions §12 lists. Each of
  the five is a defect axe returned clean on.
- **`trust-compliance-officer`** — the alert-row `Demo` chips noted above. Not a WCAG finding; an
  `AGENTS.md §1.2` judgement that is yours.
- **`release-auditor`** — **the verdict is GREEN.** No unresolved AA failure exists on any served
  route. Four findings are open and none is a critical accessibility defect. One release condition,
  and it is a condition on a route that is not built rather than on this verdict: `/accessibility/`
  and `/contact/` are emitted only when `PUBLIC_CONTACT_EMAIL` is set, and F40 and F41 must close
  before that happens in a production build.
- **Still outstanding for Phase 12, unchanged and not claimable here:** the screen-reader passes
  (VoiceOver + Safari, NVDA + Firefox), the `§18.2` private routes, `/pricing/`, `/status/` and the
  `airlines` / `airports` / `routes` families, the 14 unreachable `§22.6` journeys, and Lighthouse.

---

## 16. Revision history

| Date       | Phase                                                    | Verdict                                                  | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-09-11 | Phase 9 (visual-overhaul session S2)                     | **BLOCKED — 6 blockers**                                 | First revision. Tokens, contrast, focus, reduced motion, primitive semantics, mark legibility, motif inventory. Route-level, keyboard, screen-reader, zoom and Lighthouse results are Phase 12 and are recorded as Not run.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-09-11 | Phase 9 re-review, tree `63005a3`                        | **BLOCKED — 1 blocker (B7)**                             | B1–B6 verified closed and B7 raised: the fix for B3 put the band word inside a `role="progressbar"`, whose children are presentational, so `bandLabel` reaches the eye and not the accessibility tree (SC 1.3.1). Thirteen of the seventeen findings closed; F15, F22 and F23 remain with their original owners. Contrast re-measured: 101 unique rendered pairs, 202 measurements, zero below floor. Mark decision unchanged — the artwork is byte-identical. Phase 12 cells still Not run, for the same reason.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-09-11 | Phase 9 B7 re-review, tree at `9dd1f75`                  | **GREEN**                                                | B7 closed: `aria-valuetext` carries the reading and the band, verified from three rendered fixture states, with the visible readout intact. The `aria-describedby` alternative I had offered is recorded as rejected, correctly — it would have forced either a doubled announcement or a screen-reader-computed percentage, which is a published-precision defect. No token changed, so the contrast result is unchanged. F24 raised (copy, `ux-copy-steward`). Phase 9 has no open blocker; F15, F22, F23 and F24 remain with their owners for Phases 10–11, and every Phase 12 cell is still Not run.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-09-12 | Phase 10 (visual-overhaul session S3), tree `d35f69c`    | **BLOCKED — 2 blockers (B8, B9), 14 findings (F25–F38)** | Route-level review of the twenty served S3 routes plus `/accessibility/` and `/contact/` from a scratch build. 88 axe runs, both themes and both motion preferences, zero violations. Keyboard walks, focus measured from rendered pixels, reduced motion measured from computed styles (ADR 0003 rule 4), reflow and zoom, touch targets, motif-behind-text pixel diff, and the accessibility statement reviewed sentence by sentence (§13.1). B8: SC 1.4.10 Reflow fails at 320 CSS px on `/` and `/connection-risk/`. B9: the `/delay-risk/` band meter is announced as a connection-slack measurement (SC 2.4.6). F22 and F24 closed by measurement; F15 closed on every shipped surface. §10.2 moved from `Not run` to measured results; §13 citation `§35` corrected to `§3.4`.                                                                                                                                                                                                                                                                                    |
| 2026-09-12 | Phase 10 re-review after the S3 fix loop, tree `692ad3f` | **GREEN**                                                | B8 and B9 closed, each by the measurement the blocker named: reflow exact at 320 on 20 of 20 routes, and the `/delay-risk/` meter read back from the built HTML as `aria-label="Delay and cancellation assessment"` with `aria-valuetext="Risk band, Watch"`. Eleven of the fourteen findings closed; F31 closed on three of four items with the `<caption>` re-owned to `content-editorial-lead`; F17 and F23 unchanged. 88 axe runs again, zero violations and now zero best-practice. Four new findings: F39 the same "Status" detail one component over in `ItineraryTimeline`, F40 the accessibility statement now listing closed issues as open, F41 the 196 × 23 px feedback address, F42 the loading message announced twice. None blocks. The given `apps/web/dist` was proved byte-identical to a fresh build of the committed tree before anything was measured on it. §13.2 re-reads the statement against all twelve §13.1 rows. The Callout heading-size decision is accepted, with axe's `heading-order` named as the guard that replaces the visual cue. |
