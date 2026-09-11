#!/usr/bin/env python3
"""Convert the two fixed DelayPilot brand strings from Geist outlines into path data.

Owner: visual-asset-director (docs/agents/ROSTER.md §3, `scripts/assets/**`).

WHY THIS EXISTS
---------------
`apps/web/public/brand/logotype.svg` and `apps/web/public/og/default-1200x630.png` must render
the wordmark identically everywhere: in a browser that has not loaded the webfont yet, in
`sharp`/librsvg (which does not see our self-hosted font at all), in an email client, and on a
printed evidence packet. An SVG `<text>` element cannot promise that -- it resolves against
whatever font the renderer happens to have. So the wordmark ships as outlines, and this script is
the only place those outlines are produced.

It is committed; the font it reads is not. The Geist package (SIL OFL 1.1, recorded in
`scripts/assets/asset-licenses.json`) is fetched into a scratchpad when the wordmark needs
regenerating. The committed artifact is `scripts/assets/wordmark.json`, which `build-assets.mjs`
consumes. The JSON records the sha256 of every font file it was derived from, so "which outlines
are these?" has an answer that does not depend on anyone's memory.

DETERMINISM
-----------
Same font files in, byte-identical JSON out: glyphs are resolved through `cmap`, the `liga`
feature is applied (so the `fl` in "flight" matches what a browser renders), kerning is read from
the GPOS `kern` feature, and outlines are emitted through a y-flip transform whose only non-unit
term is an integer pen position, so every coordinate stays an integer.

COORDINATE SPACE
----------------
Paths are emitted in em units with y pointing DOWN and the baseline at y = 0 -- the same
orientation as SVG user space. A cap-height glyph therefore spans y = -710 .. 0 at
unitsPerEm = 1000. `build-assets.mjs` applies one uniform scale and one translation, so the
shipped SVG carries no transform attribute and no stroke geometry elsewhere in the file is
affected by it.

USAGE
-----
    python3 scripts/assets/wordmark-paths.py --font-dir <dir containing Geist-*.ttf>
    python3 scripts/assets/wordmark-paths.py --font-dir <dir> --check   # verify, write nothing

`--check` exits non-zero if the regenerated JSON differs from the committed one.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

from fontTools.misc.transform import Transform
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

REPO_ROOT = Path(__file__).resolve().parents[2]
OUTPUT = REPO_ROOT / "scripts" / "assets" / "wordmark.json"

# The two fixed strings. Both are brand copy from DIRECTIVE.md §7 (the product name and the
# promise line). Neither contains, and neither may ever contain, a flight number, gate, time,
# statistic or any other operational value (AGENTS.md §1.1, DIRECTIVE.md §28).
STRINGS = {
    "wordmark": {
        "text": "DelayPilot",
        "file": "Geist-SemiBold.ttf",
        "cssWeight": 600,
    },
    "tagline": {
        "text": "Stay ahead of flight disruptions.",
        "file": "Geist-Regular.ttf",
        "cssWeight": 400,
    },
}


def sha256_of(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_ligatures(font: TTFont) -> tuple[dict[tuple[str, str], str], list[tuple[str, ...]]]:
    """Ligature substitutions reachable through the `liga` feature.

    Browsers apply `liga` by default, so skipping it would make the outlined tagline differ from
    the same string set in live text. Two-component ligatures are returned as a pair map; longer
    ones are returned separately so `shape()` can refuse rather than quietly mis-set a string.
    """
    if "GSUB" not in font:
        return {}, []
    gsub = font["GSUB"].table
    lookup_indices: set[int] = set()
    for record in gsub.FeatureList.FeatureRecord:
        if record.FeatureTag == "liga":
            lookup_indices.update(record.Feature.LookupListIndex)

    pairs: dict[tuple[str, str], str] = {}
    longer: list[tuple[str, ...]] = []
    for index in sorted(lookup_indices):
        lookup = gsub.LookupList.Lookup[index]
        for subtable in lookup.SubTable:
            table = subtable.ExtSubTable if lookup.LookupType == 7 else subtable
            for first, ligatures in getattr(table, "ligatures", {}).items():
                for ligature in ligatures:
                    components = tuple(ligature.Component)
                    if len(components) == 1:
                        pairs.setdefault((first, components[0]), ligature.LigGlyph)
                    else:
                        longer.append((first, *components))
    return pairs, longer


class Kerning:
    """GPOS `kern` XAdvance adjustments, queried one pair at a time.

    Pairs are resolved lazily rather than materialised, because PairPos format 2 class 0 means
    "every glyph not otherwise classified" -- expanding it would mean walking the whole font to
    answer a question about ten glyphs. PairPos formats 1 and 2, including LookupType 9
    extensions, are handled; any other subtable shape is skipped, which can only ever leave a
    pair slightly looser, never produce a wrong glyph.
    """

    def __init__(self, font: TTFont) -> None:
        self.subtables: list[object] = []
        if "GPOS" not in font:
            return
        gpos = font["GPOS"].table
        lookup_indices: set[int] = set()
        for record in gpos.FeatureList.FeatureRecord:
            if record.FeatureTag == "kern":
                lookup_indices.update(record.Feature.LookupListIndex)
        for index in sorted(lookup_indices):
            lookup = gpos.LookupList.Lookup[index]
            for subtable in lookup.SubTable:
                table = subtable.ExtSubTable if lookup.LookupType == 9 else subtable
                if getattr(table, "Format", None) in (1, 2):
                    self.subtables.append(table)

    def value(self, first: str, second: str) -> int:
        for table in self.subtables:
            coverage = table.Coverage.glyphs
            if first not in coverage:
                continue
            if table.Format == 1:
                pair_set = table.PairSet[coverage.index(first)]
                for pair in pair_set.PairValueRecord:
                    if pair.SecondGlyph == second:
                        return int(getattr(pair.Value1, "XAdvance", 0) or 0)
            else:
                class1 = table.ClassDef1.classDefs.get(first, 0)
                class2 = table.ClassDef2.classDefs.get(second, 0)
                try:
                    record = table.Class1Record[class1].Class2Record[class2]
                except IndexError:
                    continue
                value = int(getattr(record.Value1, "XAdvance", 0) or 0)
                if value:
                    return value
        return 0


def shape(text: str, font: TTFont) -> list[dict[str, object]]:
    """Map a string to positioned glyph records: cmap, then `liga`, then `kern`."""
    cmap = font.getBestCmap()
    names: list[str] = []
    for char in text:
        code = ord(char)
        if code not in cmap:
            raise SystemExit(f"font has no glyph for U+{code:04X} ({char!r})")
        names.append(cmap[code])

    pairs, longer = read_ligatures(font)
    for sequence in longer:
        for start in range(len(names) - len(sequence) + 1):
            if tuple(names[start : start + len(sequence)]) == sequence:
                raise SystemExit(
                    f"string {text!r} hits a {len(sequence)}-component ligature {sequence}; "
                    "extend shape() before regenerating"
                )

    shaped: list[str] = []
    index = 0
    while index < len(names):
        if index + 1 < len(names) and (names[index], names[index + 1]) in pairs:
            shaped.append(pairs[(names[index], names[index + 1])])
            index += 2
        else:
            shaped.append(names[index])
            index += 1

    kerning = Kerning(font)
    hmtx = font["hmtx"]
    glyph_set = font.getGlyphSet()

    records: list[dict[str, object]] = []
    bounds = BoundsPen(glyph_set)
    pen_x = 0
    for position, name in enumerate(shaped):
        advance = int(hmtx[name][0])
        kern = kerning.value(name, shaped[position + 1]) if position + 1 < len(shaped) else 0
        placement = Transform(1, 0, 0, -1, pen_x, 0)
        pen = SVGPathPen(glyph_set)
        # Flip y and place the glyph at the pen position in one transform, so the emitted
        # coordinates are final integers rather than something a later pass has to move.
        glyph_set[name].draw(TransformPen(pen, placement))
        # Exact outline bounds, curve extrema included, in the same y-down space. `build-assets.mjs`
        # centres the wordmark and asserts clear space against these, so an approximation from
        # control points (which overstates) would quietly bias every layout that uses it.
        glyph_set[name].draw(TransformPen(bounds, placement))
        records.append(
            {
                "glyph": name,
                "x": pen_x,
                "advance": advance,
                "kern": kern,
                "path": pen.getCommands(),
            }
        )
        pen_x += advance + kern
    return records, bounds.bounds


def build(font_dir: Path) -> dict[str, object]:
    result: dict[str, object] = {
        "$generator": "scripts/assets/wordmark-paths.py",
        "$comment": (
            "Generated file -- do not hand-edit. Outlines derived from Geist (SIL OFL 1.1); "
            "see scripts/assets/asset-licenses.json. Coordinates are em units, y-down, "
            "baseline at y=0. Regenerate with: python3 scripts/assets/wordmark-paths.py "
            "--font-dir <geist>/dist/fonts/geist-sans"
        ),
        "unitsPerEm": 0,
        "strings": {},
    }
    strings: dict[str, object] = {}

    for key, spec in STRINGS.items():
        path = font_dir / str(spec["file"])
        if not path.is_file():
            raise SystemExit(f"missing font file: {path}")
        font = TTFont(path)
        upem = int(font["head"].unitsPerEm)
        if result["unitsPerEm"] == 0:
            result["unitsPerEm"] = upem
        elif result["unitsPerEm"] != upem:
            raise SystemExit("font files disagree on unitsPerEm")

        glyphs, bounds = shape(str(spec["text"]), font)
        last = glyphs[-1]
        strings[key] = {
            "text": spec["text"],
            "cssWeight": spec["cssWeight"],
            "source": {
                "family": font["name"].getDebugName(16) or font["name"].getDebugName(1),
                "subfamily": font["name"].getDebugName(17) or font["name"].getDebugName(2),
                "version": font["name"].getDebugName(5),
                "file": spec["file"],
                "sha256": sha256_of(path),
            },
            "metrics": {
                "capHeight": int(font["OS/2"].sCapHeight),
                "xHeight": int(font["OS/2"].sxHeight),
                "ascender": int(font["hhea"].ascent),
                "descender": int(font["hhea"].descent),
                "advanceWidth": int(last["x"]) + int(last["advance"]),
            },
            "bounds": {
                "xMin": round(bounds[0], 3),
                "yMin": round(bounds[1], 3),
                "xMax": round(bounds[2], 3),
                "yMax": round(bounds[3], 3),
            },
            "glyphs": glyphs,
            "path": "".join(str(record["path"]) for record in glyphs),
        }
        font.close()

    result["strings"] = strings
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description="Outline the fixed DelayPilot brand strings.")
    parser.add_argument(
        "--font-dir",
        required=True,
        help="Directory holding Geist-SemiBold.ttf and Geist-Regular.ttf (from `npm pack geist`).",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Compare with the committed JSON and write nothing.",
    )
    args = parser.parse_args()

    data = build(Path(args.font_dir))
    serialized = json.dumps(data, indent=2, ensure_ascii=True) + "\n"

    if args.check:
        if not OUTPUT.is_file():
            print(f"FAIL {OUTPUT} does not exist", file=sys.stderr)
            return 1
        if OUTPUT.read_text(encoding="utf-8") != serialized:
            print(f"FAIL {OUTPUT} is out of date with the source font", file=sys.stderr)
            return 1
        print(f"OK {OUTPUT} matches the source font")
        return 0

    OUTPUT.write_text(serialized, encoding="utf-8")
    print(f"wrote {OUTPUT.relative_to(REPO_ROOT)} ({len(serialized)} bytes)")
    for key, value in data["strings"].items():
        metrics = value["metrics"]
        print(f"  {key}: {value['text']!r} -> {len(value['glyphs'])} glyphs, advance {metrics['advanceWidth']}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
