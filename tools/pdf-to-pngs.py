#!/usr/bin/env python3
"""
Render PDF pages to PNG images so Claude's Read tool can view them
(when the PDF is image-based / scanned and lacks a text layer).

Each output PNG is named with its source page number:

    <basename>__p<NNN>.png

Usage:
    python3 tools/pdf-to-pngs.py <source.pdf> --pages <range> [--dpi 150] [--out-dir DIR]

Examples:
    python3 tools/pdf-to-pngs.py book.pdf --pages 1-10
    python3 tools/pdf-to-pngs.py book.pdf --pages 5,7,12-15 --dpi 200

Defaults:
    --dpi      150  (good balance between legibility and file size)
    --out-dir  <basename>__pngs/  alongside the source
"""

import argparse
import sys
from pathlib import Path

import fitz  # PyMuPDF


def parse_page_spec(spec: str, total_pages: int) -> list[int]:
    """Parse '1-10,15,20-22' into a sorted list of 1-based page numbers."""
    pages: set[int] = set()
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-", 1)
            start, end = int(a), int(b)
            if start < 1 or end > total_pages or start > end:
                raise ValueError(
                    f"invalid range '{part}' (document has {total_pages} pages)"
                )
            pages.update(range(start, end + 1))
        else:
            p = int(part)
            if p < 1 or p > total_pages:
                raise ValueError(
                    f"invalid page '{part}' (document has {total_pages} pages)"
                )
            pages.add(p)
    return sorted(pages)


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("source", type=Path)
    parser.add_argument(
        "--pages",
        required=True,
        help="Page spec: '1-10', '5,7,12-15', etc. 1-based, inclusive.",
    )
    parser.add_argument("--dpi", type=int, default=150)
    parser.add_argument("--out-dir", type=Path, default=None)
    args = parser.parse_args()

    if not args.source.exists():
        print(f"error: source file not found: {args.source}", file=sys.stderr)
        return 1

    doc = fitz.open(str(args.source))
    total_pages = doc.page_count
    try:
        page_nums = parse_page_spec(args.pages, total_pages)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1

    out_dir = args.out_dir or args.source.parent / f"{args.source.stem}__pngs"
    out_dir.mkdir(parents=True, exist_ok=True)

    width = max(3, len(str(total_pages)))
    zoom = args.dpi / 72.0  # PDF default is 72 dpi
    matrix = fitz.Matrix(zoom, zoom)

    print(f"Rendering {len(page_nums)} pages from {args.source.name} @ {args.dpi} dpi → {out_dir}/")
    for page_num in page_nums:
        page = doc.load_page(page_num - 1)
        pix = page.get_pixmap(matrix=matrix, alpha=False)
        out_path = out_dir / f"{args.source.stem}__p{page_num:0{width}d}.png"
        pix.save(str(out_path))
        size_kb = out_path.stat().st_size / 1024
        print(f"  ✓ {out_path.name}  ({size_kb:.0f} KB)")

    doc.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
