# Motif library

Documentation for the four decorative SVGs in `apps/web/public/brand/motifs/`.

Owner: `visual-asset-director` (`docs/agents/ROSTER.md §3`, `apps/web/public/brand/**` and
`scripts/assets/**`).
Consumers: `frontend-ui-engineer` (markup, CSS, motion), `brand-design-director` (the custom
properties these read).

**This file lives in `scripts/assets/`, not beside the SVGs it documents.** Everything under
`apps/web/public/` is copied verbatim into `apps/web/dist/` and served: a Markdown file there would
be a public URL and an indexable page that is not a page. Internal documentation does not ship.
`node scripts/assets/verify-assets.mjs` asserts that `apps/web/public/brand/` contains nothing but
SVG, so this cannot drift back.

Four decorative motifs. All four are **original drawn geometry**: no coastline, no border, no
country outline, no airport or airline code, no label, and no airline, airport, regulator or
data-provider mark, seal, roundel or trade dress (`AGENTS.md §1.4`). None of them encodes a datum,
so none of them can be stale, wrong, or a claim (`AGENTS.md §1.1`).

---

## 1. Where these may appear, and where they may not

Everything here is permitted **only** under `docs/decisions/0003-marketing-motion-allowance.md`
rule 2b, and only on the pre-rendered public marketing routes of `DIRECTIVE §18.1`:

- **Never** inside a data-bearing component — trip cockpit, segment card, connection cockpit,
  rights card, action checklist, evidence packet, lookup result states, provenance chips, status
  pills.
- **Never** on a `§18.2` private route, an error page, a maintenance page or the status page.
- **At most two** ambient motifs per route.
- Cycle **≤ 12 s**, low amplitude, paused off-screen, animating `opacity` and `transform` only.
- Under `prefers-reduced-motion: reduce` every motif renders the **single static frame that ships
  in the file**. Each file is authored so that frame is already correct with no CSS at all.
- Never behind body text in a way that changes a contrast pair that was measured without it.

No motion is baked into any file here. Motion is `frontend-ui-engineer`'s, in CSS, under ADR 0003.

## 2. Accessibility

Every motif carries `aria-hidden="true"` and `focusable="false"` and is **decorative**: it has no
`role="img"`, no `<title>` and no `<desc>`, because it has no meaning to convey. That is the
deliberate choice, not an omission — naming a decorative texture in the accessibility tree adds
noise to a screen reader for zero information.

The one thing that must exist in **visible page copy**, not here, is the globe's caption; see §3.4.

If a future surface needs one of these shapes to carry meaning — a route diagram in a methodology
page, say — it is a **different file** with `role="img"`, a `<title>`, a `<desc>` and an adjacent
text equivalent. Do not re-label a decorative motif; file a handoff to `visual-asset-director`.

## 3. The files

### 3.1 `apps/web/public/brand/motifs/radar-arc.svg` — decorative radar scope

|                 |                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| viewBox         | `0 0 240 240` (intrinsic 240 × 240)                                                                                                                 |
| ids             | `#rings` (three concentric range rings, r 40 / 72 / 104, static), `#sweep` (the rotating element: one radius line plus a 55° trailing arc at r 104) |
| colour          | `--motif-line` → `currentColor`; opacity via `--motif-ring-opacity` (0.22) and `--motif-sweep-opacity` (0.5)                                        |
| static frame    | sweep at 0°, pointing right                                                                                                                         |
| text equivalent | none — decorative                                                                                                                                   |

CSS hook. `transform-box` defaults to `view-box` for SVG elements, so `transform-origin: 50% 50%`
resolves to (120, 120), the scope centre.

```css
@media (prefers-reduced-motion: no-preference) {
  #sweep {
    transform-origin: 50% 50%;
    animation: dp-radar-sweep 12s linear infinite;
  }
}
@keyframes dp-radar-sweep {
  to {
    transform: rotate(360deg);
  }
}
```

This is a radar scope, **not a compass rose**: no cardinal ticks, no star, no bearing ring, no
lettering. Keep it that way.

### 3.2 `apps/web/public/brand/motifs/route-arcs.svg` — decorative route fan

|                 |                                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------- |
| viewBox         | `0 0 480 240` (intrinsic 480 × 240)                                                             |
| ids             | `#route-1`, `#route-2`, `#route-3`, `#hub`                                                      |
| classes         | `.packet` — three dots, one per route                                                           |
| colour          | `--motif-line` and `--motif-accent` → `currentColor`; opacity via `--motif-line-opacity` (0.34) |
| static frame    | each packet authored at t ≈ 0.55 along its own route                                            |
| text equivalent | none — decorative                                                                               |

Path data, verbatim, for `offset-path: path('…')` where `url(#id)` is not usable:

```
#route-1  M28 196C150 118 286 82 452 62
#route-2  M28 196C158 174 296 148 452 116
#route-3  M28 196C140 212 296 210 452 180
```

**The packet contract.** Each `.packet` is authored _at a point on its own route_, so the no-CSS
and reduced-motion frame is already correct and nothing sits in the corner. A rule that enables
travel must therefore zero the geometry properties **in the same rule**, or the authored position
and the motion offset compose and the dot lands off the line:

```css
@media (prefers-reduced-motion: no-preference) {
  .packet {
    cx: 0;
    cy: 0;
    offset-rotate: 0deg;
    animation: dp-packet 12s linear infinite;
  }
  .packet:nth-of-type(1) {
    offset-path: url(#route-1);
  }
  .packet:nth-of-type(2) {
    offset-path: url(#route-2);
    animation-delay: -4s;
  }
  .packet:nth-of-type(3) {
    offset-path: url(#route-3);
    animation-delay: -8s;
  }
}
@keyframes dp-packet {
  from {
    offset-distance: 0%;
  }
  to {
    offset-distance: 100%;
  }
}
```

If `cx` / `cy` as CSS properties, or `offset-path: url()`, are unavailable in a target browser,
the packet simply stays at its authored static position and does not travel. That is a graceful
degradation, not a defect, and it is why the static positions are authored rather than left at the
origin. Verify the degradation in the browsers you support before shipping the rule.

The arcs are drawn geometry, not a projection: they are not a map, they encode no city pair, they
carry no airport code, and they are not live traffic.

### 3.3 `apps/web/public/brand/motifs/grid.svg` — decorative operations-desk grid

|                 |                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| viewBox         | `0 0 240 240` (intrinsic 240 × 240)                                                                                |
| ids             | `#grid-tile` (a 24-unit `patternUnits="userSpaceOnUse"` pattern), `#grid-major` (the 120-unit emphasis lines)      |
| colour          | `--motif-line` → `currentColor`; opacity via `--motif-grid-opacity` (0.14) and `--motif-grid-major-opacity` (0.26) |
| motion          | **none, ever.** A grid that moves while someone reads is the exact failure ADR 0003 guards against.                |
| text equivalent | none — decorative                                                                                                  |

The tile is seamless because each tile draws only its top and left edge, so adjacent tiles never
double a line. Fill any rect at any size:

```html
<rect width="100%" height="100%" fill="url(#grid-tile)" />
```

Put it behind empty surface, not behind prose.

### 3.4 `apps/web/public/brand/motifs/route-globe.svg` — decorative orthographic wireframe globe

**Generated.** Do not hand-edit; run `node scripts/assets/build-globe.mjs`.

|                 |                                                                                                                                                               |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| viewBox         | `0 0 480 480` (intrinsic 480 × 480)                                                                                                                           |
| ids             | `#limb` (the horizon circle, r 200), `#graticule` (10° meridians and parallels, back hemisphere culled), `#routes` containing `#globe-route-1..3`             |
| colour          | `--motif-line` and `--motif-accent` → `currentColor`; opacity via `--motif-limb-opacity` (0.4), `--motif-grid-opacity` (0.18), `--motif-route-opacity` (0.75) |
| projection      | orthographic, centred 25° lat / −20° lon, sampled every 4°                                                                                                    |
| static frame    | the whole globe, arcs fully drawn                                                                                                                             |
| text equivalent | none — decorative                                                                                                                                             |

ADR 0003 rule 6 adopts **Option A** — this build-time SVG, CSS-animated. Option B, the `cobe` WebGL
globe, **is not adopted** and needs its own ADR, a measured chunk size and owner approval.

**Required caption.** ADR 0003 rule 6 requires the page that embeds this to carry, in visible page
copy, exactly:

> Illustrative route lines — not live traffic.

The caption is not optional and it does not live in the SVG, because a caption inside an
`aria-hidden` decorative graphic is a caption nobody reads. It is a visible `<figcaption>` or
equivalent, owned by `frontend-ui-engineer`.

Permitted motion is an arc draw-in, once, on entry:

```css
@media (prefers-reduced-motion: no-preference) {
  #routes path {
    stroke-dasharray: var(--dp-globe-arc-length, 700);
    stroke-dashoffset: var(--dp-globe-arc-length, 700);
    animation: dp-globe-draw 3.2s ease-out forwards;
  }
}
@keyframes dp-globe-draw {
  to {
    stroke-dashoffset: 0;
  }
}
```

There are **no coastlines, no country outlines, no borders, no city dots, no airport or airline
codes and no labels**, and there never will be. That is deliberate: an outline of a coast is a
claim about territory, a dot on a coast is a claim about an airport, and a line between two dots is
a claim about a route someone operates. The three arcs run between arbitrary round-number anchors
on a bare sphere — `[10, −60] → [48, 10]`, `[−15, −35] → [35, 40]`, `[40, −75] → [5, 25]` in
degrees latitude/longitude — and mean nothing.

## 4. Custom properties these read

Set by `brand-design-director` in the token layer, or locally by the consuming component. Every
one has a literal fallback, so each file renders correctly with no CSS at all.

| property                     | fallback                       | used by                     |
| ---------------------------- | ------------------------------ | --------------------------- |
| `--motif-line`               | `currentColor`                 | all four                    |
| `--motif-accent`             | `currentColor`                 | `route-arcs`, `route-globe` |
| `--motif-ring-opacity`       | `0.22`                         | `radar-arc`                 |
| `--motif-sweep-opacity`      | `0.5`                          | `radar-arc`                 |
| `--motif-line-opacity`       | `0.34`                         | `route-arcs`                |
| `--motif-grid-opacity`       | `0.14` (grid) / `0.18` (globe) | `grid`, `route-globe`       |
| `--motif-grid-major-opacity` | `0.26`                         | `grid`                      |
| `--motif-limb-opacity`       | `0.4`                          | `route-globe`               |
| `--motif-route-opacity`      | `0.75`                         | `route-globe`               |

Opacity is how "faint" is achieved here, and it is safe **only** because these carry no
information. Anything that does carry information — an icon stroke, a diagram line, a status shape
— uses full-strength measured colour and clears 3:1 in both themes. Do not copy this pattern into
a component.

## 5. How to use them

Inline the SVG (Astro `set:html`, or paste it) rather than `<img src>`: `currentColor` and the
custom properties above only resolve for inline SVG, and an `<img>` would cost a separate request
on a route whose budget is LCP < 2.5 s p75.

If one must be an `<img>` — it should not need to be — give it explicit `width` and `height` from
the table above, `loading="lazy"`, `decoding="async"` and `alt=""`.

Budgets and byte sizes for all four are in `scripts/assets/asset-manifest.mjs` and are asserted by
`node scripts/assets/verify-assets.mjs`, which is also what `pnpm test` runs.
