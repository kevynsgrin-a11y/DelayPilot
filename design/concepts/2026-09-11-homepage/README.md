# Homepage concept boards — 2026-09-11

**Reference only. Nothing here ships, and no code is ported from it.**

Canvas: <https://claude.ai/code/artifact/54ab732a-5efd-4a9b-9693-60dfb9d60083>

Produced this session at the repository owner's request as S0 of the visual-overhaul insertion
sequence. Placed by `visual-asset-director` (`design/**`, `docs/agents/ROSTER.md §3`).

---

## 1. What these are

Two directions for the public homepage, each rendered at two breakpoints in both themes:

| direction | idea |
| --- | --- |
| **Radar** | The operations-desk scope as the hero: concentric range rings and a slow sweep behind the lookup form. |
| **Route Globe** | An orthographic wireframe globe as the hero, with illustrative great-circle arcs. |

| file | what it is |
| --- | --- |
| `radar.html` | Self-contained page, Radar direction. Opens offline; has a light/dark toggle. |
| `route-globe.html` | Self-contained page, Route Globe direction. Same. |
| `png/radar-desktop-1440-{light,dark}.png` | Full-page render, 1440 × 4292 |
| `png/radar-mobile-375-{light,dark}.png` | Full-page render, 375 × 7606 |
| `png/route-globe-desktop-1440-{light,dark}.png` | Full-page render, 1440 × 4292 |
| `png/route-globe-mobile-375-{light,dark}.png` | Full-page render, 375 × 7606 |

The two HTML files are self-contained: no network requests, no external stylesheet, no CDN, no
analytics. The Geist subsets are embedded as `data:font/woff2` URIs, which is why they are 70 KB
and 100 KB rather than a few KB.

The eight PNGs were re-encoded as indexed PNG (`sharp`, `palette: true, quality: 90,
compressionLevel: 9, effort: 10`): 5,168,646 → 1,798,631 bytes, 65.2% smaller. Quality was checked
before accepting the size, not assumed — RMSE against the originals is 0.82–1.23 per channel, and
the two hardest regions (the faint wireframe globe over a radial gradient, and the densest text
band) were cropped and compared side by side with no visible difference. Lossless re-encoding was
measured too and saved only 2.6%, which is not worth 5 MB in the repository.

## 2. Status

These are **drawings of an idea, not a specification and not an implementation**.

- Nothing here is ported to code. The shipped design system is `packages/ui/src/tokens/`
  (`brand-design-director`); the shipped artwork is `apps/web/public/brand/mark.svg` and its
  derivations (`visual-asset-director`). Neither was generated from these boards.
- `design/**` is excluded from lint, formatting, the build and the served output. No file in this
  folder has a URL.
- `design/v0-preview/` is a different and older reference and is untouched by this.
- Treat any layout, copy or component here as a proposal that still has to pass the normal gates —
  contrast measured in both themes, `pnpm test:a11y`, the performance budgets, and review.

## 3. The hard rules these boards honour

They were drawn against the constitution rather than being cleaned up afterwards, and the claims
below were re-checked against the two HTML files before this folder was written:

- **Only synthetic identifiers.** `Demo Airline`, `DEMO 101`, `DEMO 202`. No real carrier, no real
  flight number, no real airport code presented as a live lookup (`DIRECTIVE §28`).
- **No fabricated operational value.** No gate, no terminal, no delay in minutes, no probability,
  no percentage anywhere, no price, no rating, no user count, no accuracy figure, no statistic of
  any kind (`AGENTS.md §1.1`). Where a value would go and is not known, the boards show `—` with
  the `Demo` or `Unavailable` label; there are 13 such em-dash placeholders on each board. The only
  numerals in visible text are the demo itinerary's own clock times (`07:45`, `08:30`, `10:20`,
  `11:05`, `11:40`, `14:55`) on panels that carry the demo label.
- **Every data panel is labelled.** `Demo data — not a live flight.` appears on each of them, and
  the provenance vocabulary is used verbatim: `Live`, `Cached`, `Stale`, `Demo`, `Unavailable`,
  `Heuristic risk band` (`AGENTS.md §1.2`).
- **No legal overclaim.** Rights language is `may apply` only. None of "you are owed", "guaranteed
  compensation", "legally entitled" or "approved claim" appears (`AGENTS.md §1.3`).
- **No affiliation.** No airline, airport, regulator or data-provider logo, wordmark, livery, seal
  or trade dress. The independence disclaimer from `DIRECTIVE §35` is in the footer of both boards
  (`AGENTS.md §1.4`).
- **No PNR.** The lookup explicitly states that DelayPilot never asks for a booking reference
  (`AGENTS.md §2`).
- **No carousel, no gauge, no speedometer, no percentage** — the three shapes that imply precision
  the connection engine does not have, plus the one motion pattern the accessibility floor bars
  outright (`DIRECTIVE §18.5`, `§7`).
- **All art is inline SVG.** 23 `<svg>` elements per board, zero `<img>`, zero `<canvas>`, zero
  photography — so nothing here depends on a stock licence and nothing invents a livery or a
  registration.

## 4. Tokens and type

The boards use the `DIRECTIVE §7` seed palette exactly — `#050b16` `#07111f` `#0b1728` `#13243a`
`#f8fbff` `#eef5fb` `#31c5ff` `#087fbd` `#168f6a` `#d99014` `#d9485f` `#738197` — and Geist at 400
and 600, the two weights the product self-hosts.

They predate the measured semantic layer in `packages/ui/src/tokens/`, so some pairs here are the
raw seeds rather than the AA-corrected values that actually ship. That is expected of a concept
board and is one of the things implementation has to fix, not copy.

The embedded Geist subsets were verified in this session by decoding the data URIs and reading each
font's name table: `Geist Regular` (9,748 bytes) and `Geist SemiBold` (10,056 bytes), both carrying
`Copyright 2024 The Geist Project Authors`. They are tighter subsets than the shipped webfont, so
their hashes differ, but they are the same font under the same licence — SIL OFL 1.1, recorded in
`scripts/assets/asset-licenses.json` along with the licence text committed at
`apps/web/public/fonts/LICENSE-Geist.txt`.
