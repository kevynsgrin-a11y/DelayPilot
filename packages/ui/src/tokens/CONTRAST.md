# Measured contrast — DelayPilot design tokens

GENERATED FILE, DO NOT EDIT BY HAND. Source: `packages/ui/src/tokens/pairs.ts`.
Regenerate with `pnpm --filter @delaypilot/ui tokens:build`; `pnpm test` re-measures every row.

Method: WCAG 2.2 relative luminance from sRGB, ratio `(L1 + 0.05) / (L2 + 0.05)`, computed in
`packages/ui/src/tokens/contrast.ts`. Ratios are truncated, never rounded up, so a 4.499 can never
print as `4.50` beside a 4.5 floor. Every pair is measured in BOTH themes: a pair that passes on
ink and fails on cloud is a failing pair.

Two departures from the WCAG minimum, both stricter than required:

1. The 3:1 large-text allowance (SC 1.4.3, text at or above 24px, or 19px bold) is never used.
   Every text token clears 4.5:1 on every surface it renders on, at every size.
2. Inactive controls are exempt from SC 1.4.3 entirely. They are registered here anyway and held
   to 3:1, so "disabled" can never become "invisible".

Colour is never the only signal. Each of the four status tones also ships a distinct icon shape and
a required text label, and each of the six provenance chips carries its `AGENTS.md` 1.2 label as
visible text (`Live`, `Cached`, `Stale`, `Demo`, `Unavailable`, `Heuristic risk band`).

## Summary

103 registered pairs, measured in 2 themes: 206 measurements,
0 failing, 0 unmeasured.

| Theme | Measurements | Tightest | Tightest pair                                 | Its floor |
| ----- | ------------ | -------- | --------------------------------------------- | --------- |
| light | 103          | 3.12:1   | `--status-watch-border` on `--surface-sunken` | 3:1       |
| dark  | 103          | 3.30:1   | `--text-disabled` on `--surface-elevated`     | 3:1       |

## Text — WCAG 2.2 SC 1.4.3, floor 4.5:1

| Foreground             | Background             | Light values       | Light   | Dark values        | Dark    | Result |
| ---------------------- | ---------------------- | ------------------ | ------- | ------------------ | ------- | ------ |
| `--text-primary`       | `--surface-base`       | #07111f on #eef5fb | 17.21:1 | #f8fbff on #050b16 | 18.98:1 | pass   |
| `--text-primary`       | `--surface-card`       | #07111f on #ffffff | 18.93:1 | #f8fbff on #0b1728 | 17.33:1 | pass   |
| `--text-primary`       | `--surface-elevated`   | #07111f on #f8fbff | 18.24:1 | #f8fbff on #13243a | 15.08:1 | pass   |
| `--text-primary`       | `--surface-sunken`     | #07111f on #dce8f2 | 15.21:1 | #f8fbff on #07111f | 18.24:1 | pass   |
| `--text-secondary`     | `--surface-base`       | #58687b on #eef5fb | 5.18:1  | #7a8da1 on #050b16 | 5.77:1  | pass   |
| `--text-secondary`     | `--surface-card`       | #58687b on #ffffff | 5.70:1  | #7a8da1 on #0b1728 | 5.26:1  | pass   |
| `--text-secondary`     | `--surface-elevated`   | #58687b on #f8fbff | 5.49:1  | #7a8da1 on #13243a | 4.58:1  | pass   |
| `--text-secondary`     | `--surface-sunken`     | #58687b on #dce8f2 | 4.58:1  | #7a8da1 on #07111f | 5.54:1  | pass   |
| `--text-accent`        | `--surface-base`       | #076ca1 on #eef5fb | 5.20:1  | #31c5ff on #050b16 | 9.90:1  | pass   |
| `--text-accent`        | `--surface-card`       | #076ca1 on #ffffff | 5.72:1  | #31c5ff on #0b1728 | 9.04:1  | pass   |
| `--text-accent`        | `--surface-elevated`   | #076ca1 on #f8fbff | 5.51:1  | #31c5ff on #13243a | 7.87:1  | pass   |
| `--text-accent`        | `--surface-sunken`     | #076ca1 on #dce8f2 | 4.59:1  | #31c5ff on #07111f | 9.52:1  | pass   |
| `--text-inverse`       | `--surface-inverse`    | #f8fbff on #0b1728 | 17.33:1 | #07111f on #eef5fb | 17.21:1 | pass   |
| `--text-on-accent`     | `--accent-bg`          | #ffffff on #076ca1 | 5.72:1  | #050b16 on #31c5ff | 9.90:1  | pass   |
| `--text-on-accent`     | `--accent-bg-hover`    | #ffffff on #066293 | 6.61:1  | #050b16 on #55cfff | 11.02:1 | pass   |
| `--text-on-accent`     | `--accent-bg-active`   | #ffffff on #065781 | 7.81:1  | #050b16 on #0ba8ea | 7.32:1  | pass   |
| `--text-primary`       | `--accent-subtle-bg`   | #07111f on #e5f4fd | 16.85:1 | #f8fbff on #062438 | 15.36:1 | pass   |
| `--text-accent`        | `--accent-subtle-bg`   | #076ca1 on #e5f4fd | 5.09:1  | #31c5ff on #062438 | 8.01:1  | pass   |
| `--text-primary`       | `--border-hairline`    | #07111f on #dce8f2 | 15.21:1 | #f8fbff on #13243a | 15.08:1 | pass   |
| `--text-secondary`     | `--border-hairline`    | #58687b on #dce8f2 | 4.58:1  | #7a8da1 on #13243a | 4.58:1  | pass   |
| `--status-safe-fg`     | `--status-safe-bg`     | #127456 on #e6f2f3 | 5.01:1  | #189d74 on #082023 | 4.92:1  | pass   |
| `--text-primary`       | `--status-safe-bg`     | #07111f on #e6f2f3 | 16.55:1 | #f8fbff on #082023 | 16.30:1 | pass   |
| `--text-secondary`     | `--status-safe-bg`     | #58687b on #e6f2f3 | 4.98:1  | #7a8da1 on #082023 | 4.95:1  | pass   |
| `--status-safe-fg`     | `--surface-base`       | #127456 on #eef5fb | 5.21:1  | #189d74 on #050b16 | 5.73:1  | pass   |
| `--status-safe-fg`     | `--surface-card`       | #127456 on #ffffff | 5.74:1  | #189d74 on #0b1728 | 5.23:1  | pass   |
| `--status-safe-fg`     | `--surface-elevated`   | #127456 on #f8fbff | 5.53:1  | #189d74 on #13243a | 4.55:1  | pass   |
| `--status-safe-fg`     | `--surface-sunken`     | #127456 on #dce8f2 | 4.61:1  | #189d74 on #07111f | 5.51:1  | pass   |
| `--status-watch-fg`    | `--status-watch-bg`    | #8d5d0d on #f6f2ec | 5.08:1  | #d99014 on #272016 | 6.09:1  | pass   |
| `--text-primary`       | `--status-watch-bg`    | #07111f on #f6f2ec | 16.97:1 | #f8fbff on #272016 | 15.51:1 | pass   |
| `--text-secondary`     | `--status-watch-bg`    | #58687b on #f6f2ec | 5.11:1  | #7a8da1 on #272016 | 4.71:1  | pass   |
| `--status-watch-fg`    | `--surface-base`       | #8d5d0d on #eef5fb | 5.15:1  | #d99014 on #050b16 | 7.45:1  | pass   |
| `--status-watch-fg`    | `--surface-card`       | #8d5d0d on #ffffff | 5.66:1  | #d99014 on #0b1728 | 6.80:1  | pass   |
| `--status-watch-fg`    | `--surface-elevated`   | #8d5d0d on #f8fbff | 5.46:1  | #d99014 on #13243a | 5.92:1  | pass   |
| `--status-watch-fg`    | `--surface-sunken`     | #8d5d0d on #dce8f2 | 4.55:1  | #d99014 on #07111f | 7.16:1  | pass   |
| `--status-critical-fg` | `--status-critical-bg` | #c32841 on #f6edf2 | 4.94:1  | #de6275 on #271522 | 5.02:1  | pass   |
| `--text-primary`       | `--status-critical-bg` | #07111f on #f6edf2 | 16.51:1 | #f8fbff on #271522 | 16.63:1 | pass   |
| `--text-secondary`     | `--status-critical-bg` | #58687b on #f6edf2 | 4.97:1  | #7a8da1 on #271522 | 5.05:1  | pass   |
| `--status-critical-fg` | `--surface-base`       | #c32841 on #eef5fb | 5.15:1  | #de6275 on #050b16 | 5.73:1  | pass   |
| `--status-critical-fg` | `--surface-card`       | #c32841 on #ffffff | 5.67:1  | #de6275 on #0b1728 | 5.23:1  | pass   |
| `--status-critical-fg` | `--surface-elevated`   | #c32841 on #f8fbff | 5.46:1  | #de6275 on #13243a | 4.55:1  | pass   |
| `--status-critical-fg` | `--surface-sunken`     | #c32841 on #dce8f2 | 4.55:1  | #de6275 on #07111f | 5.50:1  | pass   |
| `--status-unknown-fg`  | `--status-unknown-bg`  | #5b677b on #edf1f7 | 5.04:1  | #7f8ba0 on #171e2b | 4.85:1  | pass   |
| `--text-primary`       | `--status-unknown-bg`  | #07111f on #edf1f7 | 16.70:1 | #f8fbff on #171e2b | 16.09:1 | pass   |
| `--text-secondary`     | `--status-unknown-bg`  | #58687b on #edf1f7 | 5.03:1  | #7a8da1 on #171e2b | 4.89:1  | pass   |
| `--status-unknown-fg`  | `--surface-base`       | #5b677b on #eef5fb | 5.20:1  | #7f8ba0 on #050b16 | 5.72:1  | pass   |
| `--status-unknown-fg`  | `--surface-card`       | #5b677b on #ffffff | 5.72:1  | #7f8ba0 on #0b1728 | 5.22:1  | pass   |
| `--status-unknown-fg`  | `--surface-elevated`   | #5b677b on #f8fbff | 5.51:1  | #7f8ba0 on #13243a | 4.55:1  | pass   |
| `--status-unknown-fg`  | `--surface-sunken`     | #5b677b on #dce8f2 | 4.59:1  | #7f8ba0 on #07111f | 5.50:1  | pass   |

Where these render:

- `--text-primary` on `--surface-base` — Body copy, headings, table cells, control labels.
- `--text-primary` on `--surface-card` — Body copy, headings, table cells, control labels.
- `--text-primary` on `--surface-elevated` — Body copy, headings, table cells, control labels.
- `--text-primary` on `--surface-sunken` — Body copy, headings, table cells, control labels.
- `--text-secondary` on `--surface-base` — Supporting copy and freshness strings ("Updated 6 minutes ago from …"). Also the Cached chip label on --surface-sunken.
- `--text-secondary` on `--surface-card` — Supporting copy and freshness strings ("Updated 6 minutes ago from …"). Also the Cached chip label on --surface-sunken.
- `--text-secondary` on `--surface-elevated` — Supporting copy and freshness strings ("Updated 6 minutes ago from …"). Also the Cached chip label on --surface-sunken.
- `--text-secondary` on `--surface-sunken` — Supporting copy and freshness strings ("Updated 6 minutes ago from …"). Also the Cached chip label on --surface-sunken.
- `--text-accent` on `--surface-base` — Links and accent-coloured text.
- `--text-accent` on `--surface-card` — Links and accent-coloured text.
- `--text-accent` on `--surface-elevated` — Links and accent-coloured text.
- `--text-accent` on `--surface-sunken` — Links and accent-coloured text.
- `--text-inverse` on `--surface-inverse` — Tooltip text.
- `--text-on-accent` on `--accent-bg` — Primary button label, in all three interaction states.
- `--text-on-accent` on `--accent-bg-hover` — Primary button label, in all three interaction states.
- `--text-on-accent` on `--accent-bg-active` — Primary button label, in all three interaction states.
- `--text-primary` on `--accent-subtle-bg` — Text on a selected row, active tab panel or accent callout.
- `--text-accent` on `--accent-subtle-bg` — Link inside an accent callout.
- `--text-primary` on `--border-hairline` — Demo chip label where a hatch stripe falls under a glyph (--chip-demo-hatch).
- `--text-secondary` on `--border-hairline` — Demo chip freshness string where a hatch stripe falls under a glyph.
- `--status-safe-fg` on `--status-safe-bg` — StatusPill "safe" label and glyph on its own fill.
- `--text-primary` on `--status-safe-bg` — Callout body text on the safe fill.
- `--text-secondary` on `--status-safe-bg` — Callout supporting text on the safe fill.
- `--status-safe-fg` on `--surface-base` — Inline safe status text and glyph on a bare surface; also the safe ProgressBar band fill on --surface-sunken.
- `--status-safe-fg` on `--surface-card` — Inline safe status text and glyph on a bare surface; also the safe ProgressBar band fill on --surface-sunken.
- `--status-safe-fg` on `--surface-elevated` — Inline safe status text and glyph on a bare surface; also the safe ProgressBar band fill on --surface-sunken.
- `--status-safe-fg` on `--surface-sunken` — Inline safe status text and glyph on a bare surface; also the safe ProgressBar band fill on --surface-sunken.
- `--status-watch-fg` on `--status-watch-bg` — StatusPill "watch" label and glyph on its own fill.
- `--text-primary` on `--status-watch-bg` — Callout body text on the watch fill.
- `--text-secondary` on `--status-watch-bg` — Callout supporting text on the watch fill.
- `--status-watch-fg` on `--surface-base` — Inline watch status text and glyph on a bare surface; also the watch ProgressBar band fill on --surface-sunken.
- `--status-watch-fg` on `--surface-card` — Inline watch status text and glyph on a bare surface; also the watch ProgressBar band fill on --surface-sunken.
- `--status-watch-fg` on `--surface-elevated` — Inline watch status text and glyph on a bare surface; also the watch ProgressBar band fill on --surface-sunken.
- `--status-watch-fg` on `--surface-sunken` — Inline watch status text and glyph on a bare surface; also the watch ProgressBar band fill on --surface-sunken.
- `--status-critical-fg` on `--status-critical-bg` — StatusPill "critical" label and glyph on its own fill.
- `--text-primary` on `--status-critical-bg` — Callout body text on the critical fill.
- `--text-secondary` on `--status-critical-bg` — Callout supporting text on the critical fill.
- `--status-critical-fg` on `--surface-base` — Inline critical status text and glyph on a bare surface; also the critical ProgressBar band fill on --surface-sunken.
- `--status-critical-fg` on `--surface-card` — Inline critical status text and glyph on a bare surface; also the critical ProgressBar band fill on --surface-sunken.
- `--status-critical-fg` on `--surface-elevated` — Inline critical status text and glyph on a bare surface; also the critical ProgressBar band fill on --surface-sunken.
- `--status-critical-fg` on `--surface-sunken` — Inline critical status text and glyph on a bare surface; also the critical ProgressBar band fill on --surface-sunken.
- `--status-unknown-fg` on `--status-unknown-bg` — StatusPill "unknown" label and glyph on its own fill.
- `--text-primary` on `--status-unknown-bg` — Callout body text on the unknown fill.
- `--text-secondary` on `--status-unknown-bg` — Callout supporting text on the unknown fill.
- `--status-unknown-fg` on `--surface-base` — Inline unknown status text and glyph on a bare surface; also the unknown ProgressBar band fill on --surface-sunken.
- `--status-unknown-fg` on `--surface-card` — Inline unknown status text and glyph on a bare surface; also the unknown ProgressBar band fill on --surface-sunken.
- `--status-unknown-fg` on `--surface-elevated` — Inline unknown status text and glyph on a bare surface; also the unknown ProgressBar band fill on --surface-sunken.
- `--status-unknown-fg` on `--surface-sunken` — Inline unknown status text and glyph on a bare surface; also the unknown ProgressBar band fill on --surface-sunken.

## Inactive control text — exempt from SC 1.4.3, held to 3:1 anyway

| Foreground        | Background           | Light values       | Light  | Dark values        | Dark   | Result |
| ----------------- | -------------------- | ------------------ | ------ | ------------------ | ------ | ------ |
| `--text-disabled` | `--surface-base`     | #62758a on #eef5fb | 4.30:1 | #62758a on #050b16 | 4.15:1 | pass   |
| `--text-disabled` | `--surface-card`     | #62758a on #ffffff | 4.73:1 | #62758a on #0b1728 | 3.79:1 | pass   |
| `--text-disabled` | `--surface-elevated` | #62758a on #f8fbff | 4.56:1 | #62758a on #13243a | 3.30:1 | pass   |
| `--text-disabled` | `--surface-sunken`   | #62758a on #dce8f2 | 3.80:1 | #62758a on #07111f | 3.99:1 | pass   |

Where these render:

- `--text-disabled` on `--surface-base` — Label of a control that is present but not currently operable.
- `--text-disabled` on `--surface-card` — Label of a control that is present but not currently operable.
- `--text-disabled` on `--surface-elevated` — Label of a control that is present but not currently operable.
- `--text-disabled` on `--surface-sunken` — Label of a control that is present but not currently operable.

## Component boundaries — SC 1.4.11, floor 3:1

| Foreground                 | Background           | Light values       | Light  | Dark values        | Dark   | Result |
| -------------------------- | -------------------- | ------------------ | ------ | ------------------ | ------ | ------ |
| `--border-interactive`     | `--surface-base`     | #62758a on #eef5fb | 4.30:1 | #62758a on #050b16 | 4.15:1 | pass   |
| `--border-interactive`     | `--surface-card`     | #62758a on #ffffff | 4.73:1 | #62758a on #0b1728 | 3.79:1 | pass   |
| `--border-interactive`     | `--surface-elevated` | #62758a on #f8fbff | 4.56:1 | #62758a on #13243a | 3.30:1 | pass   |
| `--border-interactive`     | `--surface-sunken`   | #62758a on #dce8f2 | 3.80:1 | #62758a on #07111f | 3.99:1 | pass   |
| `--border-accent`          | `--surface-base`     | #087fbd on #eef5fb | 3.99:1 | #31c5ff on #050b16 | 9.90:1 | pass   |
| `--border-accent`          | `--surface-card`     | #087fbd on #ffffff | 4.39:1 | #31c5ff on #0b1728 | 9.04:1 | pass   |
| `--border-accent`          | `--surface-elevated` | #087fbd on #f8fbff | 4.23:1 | #31c5ff on #13243a | 7.87:1 | pass   |
| `--border-accent`          | `--surface-sunken`   | #087fbd on #dce8f2 | 3.52:1 | #31c5ff on #07111f | 9.52:1 | pass   |
| `--border-accent`          | `--accent-subtle-bg` | #087fbd on #e5f4fd | 3.90:1 | #31c5ff on #062438 | 8.01:1 | pass   |
| `--accent-bg`              | `--surface-base`     | #076ca1 on #eef5fb | 5.20:1 | #31c5ff on #050b16 | 9.90:1 | pass   |
| `--accent-bg`              | `--surface-card`     | #076ca1 on #ffffff | 5.72:1 | #31c5ff on #0b1728 | 9.04:1 | pass   |
| `--accent-bg`              | `--surface-elevated` | #076ca1 on #f8fbff | 5.51:1 | #31c5ff on #13243a | 7.87:1 | pass   |
| `--accent-bg`              | `--surface-sunken`   | #076ca1 on #dce8f2 | 4.59:1 | #31c5ff on #07111f | 9.52:1 | pass   |
| `--accent-bg`              | `--accent-subtle-bg` | #076ca1 on #e5f4fd | 5.09:1 | #31c5ff on #062438 | 8.01:1 | pass   |
| `--status-safe-border`     | `--surface-base`     | #168f6a on #eef5fb | 3.69:1 | #168f6a on #050b16 | 4.85:1 | pass   |
| `--status-safe-border`     | `--surface-card`     | #168f6a on #ffffff | 4.06:1 | #168f6a on #0b1728 | 4.42:1 | pass   |
| `--status-safe-border`     | `--surface-elevated` | #168f6a on #f8fbff | 3.91:1 | #168f6a on #13243a | 3.85:1 | pass   |
| `--status-safe-border`     | `--surface-sunken`   | #168f6a on #dce8f2 | 3.26:1 | #168f6a on #07111f | 4.66:1 | pass   |
| `--status-watch-border`    | `--surface-base`     | #b07510 on #eef5fb | 3.53:1 | #d99014 on #050b16 | 7.45:1 | pass   |
| `--status-watch-border`    | `--surface-card`     | #b07510 on #ffffff | 3.89:1 | #d99014 on #0b1728 | 6.80:1 | pass   |
| `--status-watch-border`    | `--surface-elevated` | #b07510 on #f8fbff | 3.74:1 | #d99014 on #13243a | 5.92:1 | pass   |
| `--status-watch-border`    | `--surface-sunken`   | #b07510 on #dce8f2 | 3.12:1 | #d99014 on #07111f | 7.16:1 | pass   |
| `--status-critical-border` | `--surface-base`     | #d9485f on #eef5fb | 3.78:1 | #d9485f on #050b16 | 4.73:1 | pass   |
| `--status-critical-border` | `--surface-card`     | #d9485f on #ffffff | 4.16:1 | #d9485f on #0b1728 | 4.31:1 | pass   |
| `--status-critical-border` | `--surface-elevated` | #d9485f on #f8fbff | 4.01:1 | #d9485f on #13243a | 3.75:1 | pass   |
| `--status-critical-border` | `--surface-sunken`   | #d9485f on #dce8f2 | 3.34:1 | #d9485f on #07111f | 4.54:1 | pass   |
| `--status-unknown-border`  | `--surface-base`     | #738197 on #eef5fb | 3.59:1 | #738197 on #050b16 | 4.98:1 | pass   |
| `--status-unknown-border`  | `--surface-card`     | #738197 on #ffffff | 3.95:1 | #738197 on #0b1728 | 4.55:1 | pass   |
| `--status-unknown-border`  | `--surface-elevated` | #738197 on #f8fbff | 3.80:1 | #738197 on #13243a | 3.96:1 | pass   |
| `--status-unknown-border`  | `--surface-sunken`   | #738197 on #dce8f2 | 3.17:1 | #738197 on #07111f | 4.79:1 | pass   |

Where these render:

- `--border-interactive` on `--surface-base` — Input, select, checkbox, radio, switch track and secondary button boundary. Also --progress-track-border, the 1px outline that makes the UNFILLED part of a meter perceivable (without it a 40% and a 90% reading are two bars with nothing to be different from), the Cached chip boundary, and the minimum weight for a route-diagram stroke.
- `--border-interactive` on `--surface-card` — Input, select, checkbox, radio, switch track and secondary button boundary. Also --progress-track-border, the 1px outline that makes the UNFILLED part of a meter perceivable (without it a 40% and a 90% reading are two bars with nothing to be different from), the Cached chip boundary, and the minimum weight for a route-diagram stroke.
- `--border-interactive` on `--surface-elevated` — Input, select, checkbox, radio, switch track and secondary button boundary. Also --progress-track-border, the 1px outline that makes the UNFILLED part of a meter perceivable (without it a 40% and a 90% reading are two bars with nothing to be different from), the Cached chip boundary, and the minimum weight for a route-diagram stroke.
- `--border-interactive` on `--surface-sunken` — Input, select, checkbox, radio, switch track and secondary button boundary. Also --progress-track-border, the 1px outline that makes the UNFILLED part of a meter perceivable (without it a 40% and a 90% reading are two bars with nothing to be different from), the Cached chip boundary, and the minimum weight for a route-diagram stroke.
- `--border-accent` on `--surface-base` — Selected tab underline, accent-outlined control boundary, and the 2px inline-start bar marking the SELECTED combobox option against the listbox fill.
- `--border-accent` on `--surface-card` — Selected tab underline, accent-outlined control boundary, and the 2px inline-start bar marking the SELECTED combobox option against the listbox fill.
- `--border-accent` on `--surface-elevated` — Selected tab underline, accent-outlined control boundary, and the 2px inline-start bar marking the SELECTED combobox option against the listbox fill.
- `--border-accent` on `--surface-sunken` — Selected tab underline, accent-outlined control boundary, and the 2px inline-start bar marking the SELECTED combobox option against the listbox fill.
- `--border-accent` on `--accent-subtle-bg` — The 2px inline-start bar marking the selected combobox option, measured against the tint of the row it sits on rather than against the listbox fill.
- `--accent-bg` on `--surface-base` — A filled accent component against the surface behind it: the primary Button, the checked Checkbox box, the checked Switch track, and the inverted ACTIVE combobox option — the aria-activedescendant target, whose only visual marker this is.
- `--accent-bg` on `--surface-card` — A filled accent component against the surface behind it: the primary Button, the checked Checkbox box, the checked Switch track, and the inverted ACTIVE combobox option — the aria-activedescendant target, whose only visual marker this is.
- `--accent-bg` on `--surface-elevated` — A filled accent component against the surface behind it: the primary Button, the checked Checkbox box, the checked Switch track, and the inverted ACTIVE combobox option — the aria-activedescendant target, whose only visual marker this is.
- `--accent-bg` on `--surface-sunken` — A filled accent component against the surface behind it: the primary Button, the checked Checkbox box, the checked Switch track, and the inverted ACTIVE combobox option — the aria-activedescendant target, whose only visual marker this is.
- `--accent-bg` on `--accent-subtle-bg` — The active combobox option against a SELECTED one immediately above or below it. The two states are different rows and must not read as one: the option Enter commits is inverted, the committed value is tinted.
- `--status-safe-border` on `--surface-base` — StatusPill "safe" boundary on a bare surface.
- `--status-safe-border` on `--surface-card` — StatusPill "safe" boundary on a bare surface.
- `--status-safe-border` on `--surface-elevated` — StatusPill "safe" boundary on a bare surface.
- `--status-safe-border` on `--surface-sunken` — StatusPill "safe" boundary on a bare surface.
- `--status-watch-border` on `--surface-base` — StatusPill "watch" boundary on a bare surface.
- `--status-watch-border` on `--surface-card` — StatusPill "watch" boundary on a bare surface.
- `--status-watch-border` on `--surface-elevated` — StatusPill "watch" boundary on a bare surface.
- `--status-watch-border` on `--surface-sunken` — StatusPill "watch" boundary on a bare surface.
- `--status-critical-border` on `--surface-base` — StatusPill "critical" boundary on a bare surface.
- `--status-critical-border` on `--surface-card` — StatusPill "critical" boundary on a bare surface.
- `--status-critical-border` on `--surface-elevated` — StatusPill "critical" boundary on a bare surface.
- `--status-critical-border` on `--surface-sunken` — StatusPill "critical" boundary on a bare surface.
- `--status-unknown-border` on `--surface-base` — StatusPill "unknown" boundary on a bare surface.
- `--status-unknown-border` on `--surface-card` — StatusPill "unknown" boundary on a bare surface.
- `--status-unknown-border` on `--surface-elevated` — StatusPill "unknown" boundary on a bare surface.
- `--status-unknown-border` on `--surface-sunken` — StatusPill "unknown" boundary on a bare surface.

## Glyphs and dots — SC 1.4.11, floor 3:1

| Foreground                 | Background             | Light values       | Light  | Dark values        | Dark   | Result |
| -------------------------- | ---------------------- | ------------------ | ------ | ------------------ | ------ | ------ |
| `--status-safe-border`     | `--status-safe-bg`     | #168f6a on #e6f2f3 | 3.55:1 | #168f6a on #082023 | 4.16:1 | pass   |
| `--status-watch-border`    | `--status-watch-bg`    | #b07510 on #f6f2ec | 3.48:1 | #d99014 on #272016 | 6.09:1 | pass   |
| `--status-critical-border` | `--status-critical-bg` | #d9485f on #f6edf2 | 3.63:1 | #d9485f on #271522 | 4.14:1 | pass   |
| `--status-unknown-border`  | `--status-unknown-bg`  | #738197 on #edf1f7 | 3.48:1 | #738197 on #171e2b | 4.22:1 | pass   |

Where these render:

- `--status-safe-border` on `--status-safe-bg` — StatusPill "safe" dot and icon stroke on its own fill.
- `--status-watch-border` on `--status-watch-bg` — StatusPill "watch" dot and icon stroke on its own fill.
- `--status-critical-border` on `--status-critical-bg` — StatusPill "critical" dot and icon stroke on its own fill.
- `--status-unknown-border` on `--status-unknown-bg` — StatusPill "unknown" dot and icon stroke on its own fill.

## Focus indicator — SC 2.4.11 / 2.4.13, floor 3:1 against both adjacent colours

| Foreground     | Background           | Light values       | Light  | Dark values        | Dark   | Result |
| -------------- | -------------------- | ------------------ | ------ | ------------------ | ------ | ------ |
| `--focus-ring` | `--surface-base`     | #087fbd on #eef5fb | 3.99:1 | #31c5ff on #050b16 | 9.90:1 | pass   |
| `--focus-ring` | `--surface-card`     | #087fbd on #ffffff | 4.39:1 | #31c5ff on #0b1728 | 9.04:1 | pass   |
| `--focus-ring` | `--surface-elevated` | #087fbd on #f8fbff | 4.23:1 | #31c5ff on #13243a | 7.87:1 | pass   |
| `--focus-ring` | `--surface-sunken`   | #087fbd on #dce8f2 | 3.52:1 | #31c5ff on #07111f | 9.52:1 | pass   |
| `--focus-ring` | `--focus-ring-halo`  | #087fbd on #ffffff | 4.39:1 | #31c5ff on #050b16 | 9.90:1 | pass   |

Where these render:

- `--focus-ring` on `--surface-base` — The outer adjacent colour of the 2px focus ring: whatever surface the control sits on.
- `--focus-ring` on `--surface-card` — The outer adjacent colour of the 2px focus ring: whatever surface the control sits on.
- `--focus-ring` on `--surface-elevated` — The outer adjacent colour of the 2px focus ring: whatever surface the control sits on.
- `--focus-ring` on `--surface-sunken` — The outer adjacent colour of the 2px focus ring: whatever surface the control sits on.
- `--focus-ring` on `--focus-ring-halo` — The inner adjacent colour of the focus ring. The halo fills the 2px offset gap, which is what keeps the ring legible when the control itself is an accent or status fill — the ring is never measured against a fill because it never touches one.

## Decorative — no floor applies, measured and recorded with the reason

| Foreground           | Background           | Light values       | Light  | Dark values        | Dark   | Result |
| -------------------- | -------------------- | ------------------ | ------ | ------------------ | ------ | ------ |
| `--border-hairline`  | `--surface-base`     | #dce8f2 on #eef5fb | 1.13:1 | #13243a on #050b16 | 1.25:1 | exempt |
| `--border-hairline`  | `--surface-card`     | #dce8f2 on #ffffff | 1.24:1 | #13243a on #0b1728 | 1.14:1 | exempt |
| `--border-hairline`  | `--surface-elevated` | #dce8f2 on #f8fbff | 1.19:1 | #13243a on #13243a | 1.00:1 | exempt |
| `--border-emphasis`  | `--surface-base`     | #c3d4e2 on #eef5fb | 1.37:1 | #34465a on #050b16 | 2.03:1 | exempt |
| `--border-emphasis`  | `--surface-card`     | #c3d4e2 on #ffffff | 1.51:1 | #34465a on #0b1728 | 1.85:1 | exempt |
| `--border-emphasis`  | `--surface-elevated` | #c3d4e2 on #f8fbff | 1.46:1 | #34465a on #13243a | 1.61:1 | exempt |
| `--border-emphasis`  | `--surface-sunken`   | #c3d4e2 on #dce8f2 | 1.21:1 | #34465a on #07111f | 1.95:1 | exempt |
| `--surface-sunken`   | `--surface-card`     | #dce8f2 on #ffffff | 1.24:1 | #07111f on #0b1728 | 1.05:1 | exempt |
| `--accent-subtle-bg` | `--surface-base`     | #e5f4fd on #eef5fb | 1.02:1 | #062438 on #050b16 | 1.23:1 | exempt |
| `--accent-subtle-bg` | `--surface-card`     | #e5f4fd on #ffffff | 1.12:1 | #062438 on #0b1728 | 1.12:1 | exempt |
| `--accent-subtle-bg` | `--surface-elevated` | #e5f4fd on #f8fbff | 1.08:1 | #062438 on #13243a | 1.01:1 | exempt |
| `--surface-card`     | `--surface-base`     | #ffffff on #eef5fb | 1.10:1 | #0b1728 on #050b16 | 1.09:1 | exempt |

Where these render:

- `--border-hairline` on `--surface-base` — Hairline between non-interactive regions: card edge, section rule, list divider. Exempt: WCAG 2.2 SC 1.4.11 applies to boundaries required to identify a component. These separate static regions that are already distinguished by their fill, and no information depends on seeing them. Interactive boundaries use --border-interactive, which is held to 3:1. On --surface-elevated in dark the two tokens resolve to the SAME ink step (1.00:1), which is deliberate — elevation in dark mode is read from surface tint, not from an edge — so any card, table or disclosure nested inside a dialog or drawer takes --border-emphasis instead (primitives.css, "nested elevation").
- `--border-hairline` on `--surface-card` — Hairline between non-interactive regions: card edge, section rule, list divider. Exempt: WCAG 2.2 SC 1.4.11 applies to boundaries required to identify a component. These separate static regions that are already distinguished by their fill, and no information depends on seeing them. Interactive boundaries use --border-interactive, which is held to 3:1. On --surface-elevated in dark the two tokens resolve to the SAME ink step (1.00:1), which is deliberate — elevation in dark mode is read from surface tint, not from an edge — so any card, table or disclosure nested inside a dialog or drawer takes --border-emphasis instead (primitives.css, "nested elevation").
- `--border-hairline` on `--surface-elevated` — Hairline between non-interactive regions: card edge, section rule, list divider. Exempt: WCAG 2.2 SC 1.4.11 applies to boundaries required to identify a component. These separate static regions that are already distinguished by their fill, and no information depends on seeing them. Interactive boundaries use --border-interactive, which is held to 3:1. On --surface-elevated in dark the two tokens resolve to the SAME ink step (1.00:1), which is deliberate — elevation in dark mode is read from surface tint, not from an edge — so any card, table or disclosure nested inside a dialog or drawer takes --border-emphasis instead (primitives.css, "nested elevation").
- `--border-emphasis` on `--surface-base` — Deliberate rule: table header underline, footer rule, drawer edge. Exempt: A heavier hairline. Still decorative: no control is identified by it. A route-diagram stroke or any graphical object that carries meaning must use --border-interactive or --border-accent instead.
- `--border-emphasis` on `--surface-card` — Deliberate rule: table header underline, footer rule, drawer edge. Exempt: A heavier hairline. Still decorative: no control is identified by it. A route-diagram stroke or any graphical object that carries meaning must use --border-interactive or --border-accent instead.
- `--border-emphasis` on `--surface-elevated` — Deliberate rule: table header underline, footer rule, drawer edge. Exempt: A heavier hairline. Still decorative: no control is identified by it. A route-diagram stroke or any graphical object that carries meaning must use --border-interactive or --border-accent instead.
- `--border-emphasis` on `--surface-sunken` — Deliberate rule: table header underline, footer rule, drawer edge. Exempt: A heavier hairline. Still decorative: no control is identified by it. A route-diagram stroke or any graphical object that carries meaning must use --border-interactive or --border-accent instead.
- `--surface-sunken` on `--surface-card` — The Skeleton block (--skeleton-bg) reserving the final dimensions of content that has not arrived. Nothing else. The ProgressBar track no longer uses this pair: its fill is transparent and its scale is carried by --progress-track-border, a measured 3:1 boundary. Exempt: A skeleton carries no information — its accessible name is a VisuallyHidden "Loading" string, and it is never the only route to the content. This reason reaches the skeleton and nothing else: a pair cannot be exempt in one component and load-bearing in another (ACCESSIBILITY.md B2). The Switch OFF track shares the fill but is identified by its --border-interactive boundary, measured above.
- `--accent-subtle-bg` on `--surface-base` — Accent tint: the selected combobox row, the ghost button hover fill, the accent Badge fill. Exempt: Reinforcement, never the indicator. The selected combobox row is identified by aria-selected and by a 2px --border-accent bar (3.90:1 on this tint, 3.52:1 or better on every surface); the accent Badge by its --border-accent boundary; a hover fill identifies nothing, since the control is already identified by its label and boundary when the pointer is elsewhere. The ACTIVE combobox option deliberately does NOT use this tint — it inverts to --accent-bg, which is measured as a boundary above.
- `--accent-subtle-bg` on `--surface-card` — Accent tint: the selected combobox row, the ghost button hover fill, the accent Badge fill. Exempt: Reinforcement, never the indicator. The selected combobox row is identified by aria-selected and by a 2px --border-accent bar (3.90:1 on this tint, 3.52:1 or better on every surface); the accent Badge by its --border-accent boundary; a hover fill identifies nothing, since the control is already identified by its label and boundary when the pointer is elsewhere. The ACTIVE combobox option deliberately does NOT use this tint — it inverts to --accent-bg, which is measured as a boundary above.
- `--accent-subtle-bg` on `--surface-elevated` — Accent tint: the selected combobox row, the ghost button hover fill, the accent Badge fill. Exempt: Reinforcement, never the indicator. The selected combobox row is identified by aria-selected and by a 2px --border-accent bar (3.90:1 on this tint, 3.52:1 or better on every surface); the accent Badge by its --border-accent boundary; a hover fill identifies nothing, since the control is already identified by its label and boundary when the pointer is elsewhere. The ACTIVE combobox option deliberately does NOT use this tint — it inverts to --accent-bg, which is measured as a boundary above.
- `--surface-card` on `--surface-base` — Card fill against the page. Exempt: Elevation, not identification. The card also carries --border-hairline, and nothing about the card is conveyed by the fill difference alone.

## Primitive ramp

The only literal colours in the system. A semantic token names a step here; nothing else may.

| Token                  | Hex     | Origin           | Derivation and role                                                                                                                                                  |
| ---------------------- | ------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--color-ink-1000`     | #050b16 | DIRECTIVE 7 seed | Dark page background; light-on-accent text.                                                                                                                          |
| `--color-ink-950`      | #07111f | DIRECTIVE 7 seed | Light-theme body text; dark inset surface.                                                                                                                           |
| `--color-ink-900`      | #0b1728 | DIRECTIVE 7 seed | Dark card surface; light-theme inverse surface.                                                                                                                      |
| `--color-ink-800`      | #13243a | DIRECTIVE 7 seed | Dark elevated surface and dark hairline.                                                                                                                             |
| `--color-cloud-0`      | #ffffff | extension        | Extension. Pure white: the light card surface and the light focus-ring halo. No §7 seed is white, and a card must read as lifted off cloud-100.                      |
| `--color-cloud-50`     | #f8fbff | DIRECTIVE 7 seed | Light elevated surface; dark-theme body text.                                                                                                                        |
| `--color-cloud-100`    | #eef5fb | DIRECTIVE 7 seed | Light page background; dark inverse surface.                                                                                                                         |
| `--color-cloud-200`    | #dce8f2 | DIRECTIVE 7 seed | Light inset surface and light hairline.                                                                                                                              |
| `--color-cloud-300`    | #c3d4e2 | extension        | Extension. Light emphasis divider: cloud-200 is 1.13:1 on the page and disappears where a rule must be read as deliberate.                                           |
| `--color-slate-300`    | #7a8da1 | extension        | Extension. slate-500 lightened until 4.55:1 on ink-800, the hardest dark surface; measures 4.59:1. Dark secondary text.                                              |
| `--color-slate-500`    | #62758a | DIRECTIVE 7 seed | Control boundary in BOTH themes (4.31:1 light / 3.30:1 dark, floor 3:1) and disabled text.                                                                           |
| `--color-slate-600`    | #58687b | extension        | Extension. slate-500 darkened until 4.55:1 on cloud-200, the hardest light surface; measures 4.58:1. Light secondary text.                                           |
| `--color-slate-700`    | #34465a | DIRECTIVE 7 seed | Dark emphasis divider.                                                                                                                                               |
| `--color-sky-50`       | #e5f4fd | extension        | Extension. sRGB mix of sky-500 8% over cloud-50. Light selected/subtle accent fill.                                                                                  |
| `--color-sky-300`      | #55cfff | extension        | Extension. sRGB mix of sky-400 82% over cloud-50. Dark accent hover fill; ink-1000 on it measures 11.03:1.                                                           |
| `--color-sky-400`      | #31c5ff | DIRECTIVE 7 seed | Dark accent text, fill, border and focus ring (7.87:1 on ink-800).                                                                                                   |
| `--color-sky-500`      | #0ba8ea | DIRECTIVE 7 seed | Dark accent pressed fill; ink-1000 on it measures 7.32:1.                                                                                                            |
| `--color-sky-600`      | #087fbd | DIRECTIVE 7 seed | Light accent border and focus ring (3.53:1 on cloud-200, floor 3:1). NOT usable for light text: 3.53:1 there.                                                        |
| `--color-sky-700`      | #076ca1 | extension        | Extension. sky-600 darkened until 4.55:1 on cloud-200; measures 4.60:1. Light accent text and light accent fill (white on it: 5.72:1).                               |
| `--color-sky-800`      | #066293 | extension        | Extension. sky-700 darkened to 6.6:1 against white. Light accent hover fill.                                                                                         |
| `--color-sky-900`      | #065781 | extension        | Extension. sky-700 darkened to 7.8:1 against white. Light accent pressed fill.                                                                                       |
| `--color-sky-950`      | #062438 | extension        | Extension. sRGB mix of sky-500 16% over ink-1000. Dark selected/subtle accent fill.                                                                                  |
| `--color-safe-50`      | #e6f2f3 | extension        | Extension. sRGB mix of safe-500 8% over cloud-50. Light safe chip fill.                                                                                              |
| `--color-safe-400`     | #189d74 | extension        | Extension. safe-500 lightened until 4.55:1 on ink-800; measures 4.56:1. Dark safe text and glyph.                                                                    |
| `--color-safe-500`     | #168f6a | DIRECTIVE 7 seed | Safe boundary and dot in BOTH themes (3.26:1 light / 3.86:1 dark, floor 3:1).                                                                                        |
| `--color-safe-700`     | #127456 | extension        | Extension. safe-500 darkened until 4.55:1 on cloud-200; measures 4.61:1. Light safe text and glyph.                                                                  |
| `--color-safe-950`     | #082023 | extension        | Extension. sRGB mix of safe-500 16% over ink-1000. Dark safe chip fill.                                                                                              |
| `--color-watch-50`     | #f6f2ec | extension        | Extension. sRGB mix of watch-500 8% over cloud-50. Light watch chip fill.                                                                                            |
| `--color-watch-500`    | #d99014 | DIRECTIVE 7 seed | Dark watch text, boundary and dot (5.93:1 on ink-800). On light surfaces it measures 2.12:1 and is never used there.                                                 |
| `--color-watch-600`    | #b07510 | extension        | Extension. watch-500 darkened until 3.12:1 on cloud-200; measures 3.12:1. Light watch boundary and dot — the seed cannot clear even the 3:1 non-text floor on light. |
| `--color-watch-700`    | #8d5d0d | extension        | Extension. watch-500 darkened until 4.55:1 on cloud-200; measures 4.55:1. Light watch text and glyph.                                                                |
| `--color-watch-950`    | #272016 | extension        | Extension. sRGB mix of watch-500 16% over ink-1000. Dark watch chip fill — a saturated amber fill glares on ink.                                                     |
| `--color-critical-50`  | #f6edf2 | extension        | Extension. sRGB mix of critical-500 8% over cloud-50. Light critical chip fill.                                                                                      |
| `--color-critical-400` | #de6275 | extension        | Extension. critical-500 lightened until 4.55:1 on ink-800; measures 4.56:1. Dark critical text and glyph.                                                            |
| `--color-critical-500` | #d9485f | DIRECTIVE 7 seed | Critical boundary and dot in BOTH themes (3.35:1 light / 3.76:1 dark, floor 3:1).                                                                                    |
| `--color-critical-700` | #c32841 | extension        | Extension. critical-500 darkened until 4.55:1 on cloud-200; measures 4.56:1. Light critical text and glyph.                                                          |
| `--color-critical-950` | #271522 | extension        | Extension. sRGB mix of critical-500 16% over ink-1000. Dark critical chip fill.                                                                                      |
| `--color-unknown-50`   | #edf1f7 | extension        | Extension. sRGB mix of unknown-500 8% over cloud-50. Light unknown chip fill.                                                                                        |
| `--color-unknown-400`  | #7f8ba0 | extension        | Extension. unknown-500 lightened until 4.55:1 on ink-800; measures 4.55:1. Dark unknown text and glyph.                                                              |
| `--color-unknown-500`  | #738197 | DIRECTIVE 7 seed | Unknown boundary and dot in BOTH themes (3.17:1 light / 3.96:1 dark, floor 3:1).                                                                                     |
| `--color-unknown-700`  | #5b677b | extension        | Extension. unknown-500 darkened until 4.55:1 on cloud-200; measures 4.59:1. Light unknown text and glyph.                                                            |
| `--color-unknown-950`  | #171e2b | extension        | Extension. sRGB mix of unknown-500 16% over ink-1000. Dark unknown chip fill.                                                                                        |

## Semantic layer

33 semantic colour tokens and 33 component
tokens. Component tokens are aliases onto this layer and are therefore covered by the measurements
above; no component token introduces a colour of its own.

| Token                      | Light ramp             | Light   | Dark ramp              | Dark    |
| -------------------------- | ---------------------- | ------- | ---------------------- | ------- |
| `--surface-base`           | `--color-cloud-100`    | #eef5fb | `--color-ink-1000`     | #050b16 |
| `--surface-card`           | `--color-cloud-0`      | #ffffff | `--color-ink-900`      | #0b1728 |
| `--surface-elevated`       | `--color-cloud-50`     | #f8fbff | `--color-ink-800`      | #13243a |
| `--surface-sunken`         | `--color-cloud-200`    | #dce8f2 | `--color-ink-950`      | #07111f |
| `--surface-inverse`        | `--color-ink-900`      | #0b1728 | `--color-cloud-100`    | #eef5fb |
| `--text-primary`           | `--color-ink-950`      | #07111f | `--color-cloud-50`     | #f8fbff |
| `--text-secondary`         | `--color-slate-600`    | #58687b | `--color-slate-300`    | #7a8da1 |
| `--text-disabled`          | `--color-slate-500`    | #62758a | `--color-slate-500`    | #62758a |
| `--text-inverse`           | `--color-cloud-50`     | #f8fbff | `--color-ink-950`      | #07111f |
| `--text-on-accent`         | `--color-cloud-0`      | #ffffff | `--color-ink-1000`     | #050b16 |
| `--text-accent`            | `--color-sky-700`      | #076ca1 | `--color-sky-400`      | #31c5ff |
| `--border-hairline`        | `--color-cloud-200`    | #dce8f2 | `--color-ink-800`      | #13243a |
| `--border-emphasis`        | `--color-cloud-300`    | #c3d4e2 | `--color-slate-700`    | #34465a |
| `--border-interactive`     | `--color-slate-500`    | #62758a | `--color-slate-500`    | #62758a |
| `--border-accent`          | `--color-sky-600`      | #087fbd | `--color-sky-400`      | #31c5ff |
| `--focus-ring`             | `--color-sky-600`      | #087fbd | `--color-sky-400`      | #31c5ff |
| `--focus-ring-halo`        | `--color-cloud-0`      | #ffffff | `--color-ink-1000`     | #050b16 |
| `--accent-bg`              | `--color-sky-700`      | #076ca1 | `--color-sky-400`      | #31c5ff |
| `--accent-bg-hover`        | `--color-sky-800`      | #066293 | `--color-sky-300`      | #55cfff |
| `--accent-bg-active`       | `--color-sky-900`      | #065781 | `--color-sky-500`      | #0ba8ea |
| `--accent-subtle-bg`       | `--color-sky-50`       | #e5f4fd | `--color-sky-950`      | #062438 |
| `--status-safe-fg`         | `--color-safe-700`     | #127456 | `--color-safe-400`     | #189d74 |
| `--status-safe-bg`         | `--color-safe-50`      | #e6f2f3 | `--color-safe-950`     | #082023 |
| `--status-safe-border`     | `--color-safe-500`     | #168f6a | `--color-safe-500`     | #168f6a |
| `--status-watch-fg`        | `--color-watch-700`    | #8d5d0d | `--color-watch-500`    | #d99014 |
| `--status-watch-bg`        | `--color-watch-50`     | #f6f2ec | `--color-watch-950`    | #272016 |
| `--status-watch-border`    | `--color-watch-600`    | #b07510 | `--color-watch-500`    | #d99014 |
| `--status-critical-fg`     | `--color-critical-700` | #c32841 | `--color-critical-400` | #de6275 |
| `--status-critical-bg`     | `--color-critical-50`  | #f6edf2 | `--color-critical-950` | #271522 |
| `--status-critical-border` | `--color-critical-500` | #d9485f | `--color-critical-500` | #d9485f |
| `--status-unknown-fg`      | `--color-unknown-700`  | #5b677b | `--color-unknown-400`  | #7f8ba0 |
| `--status-unknown-bg`      | `--color-unknown-50`   | #edf1f7 | `--color-unknown-950`  | #171e2b |
| `--status-unknown-border`  | `--color-unknown-500`  | #738197 | `--color-unknown-500`  | #738197 |
