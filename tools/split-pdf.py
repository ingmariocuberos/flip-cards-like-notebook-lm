#!/usr/bin/env python3
"""
Split a large PDF into smaller chunks so Claude's Read tool (max 100 MB per
file) can read them. Each chunk is named with its original page range:

    <basename>__pages-001-250.pdf
    <basename>__pages-251-500.pdf
    ...

Usage:
    python3 tools/split-pdf.py <source.pdf> [--pages-per-chunk N] [--out-dir DIR]

Defaults:
    --pages-per-chunk  250
    --out-dir          alongside the source PDF, in a "<basename>__chunks/" folder
"""

import argparse
import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter


def split_pdf(source: Path, pages_per_chunk: int, out_dir: Path) -> list[Path]:
    reader = PdfReader(str(source))
    total_pages = len(reader.pages)
    out_dir.mkdir(parents=True, exist_ok=True)
    width = max(3, len(str(total_pages)))
    chunks: list[Path] = []

    for start in range(0, total_pages, pages_per_chunk):
        end = min(start + pages_per_chunk, total_pages)
        first_page = start + 1
        last_page = end
        writer = PdfWriter()
        for i in range(start, end):
            writer.add_page(reader.pages[i])
        chunk_name = (
            f"{source.stem}__pages-"
            f"{first_page:0{width}d}-{last_page:0{width}d}.pdf"
        )
        chunk_path = out_dir / chunk_name
        with open(chunk_path, "wb") as fh:
            writer.write(fh)
        chunks.append(chunk_path)
        size_mb = chunk_path.stat().st_size / (1024 * 1024)
        print(f"  ✓ {chunk_path.name}  ({size_mb:.1f} MB, {end - start} pages)")

    return chunks


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("source", type=Path, help="Path to the source PDF")
    parser.add_argument("--pages-per-chunk", type=int, default=250)
    parser.add_argument("--out-dir", type=Path, default=None)
    args = parser.parse_args()

    if not args.source.exists():
        print(f"error: source file not found: {args.source}", file=sys.stderr)
        return 1
    if args.pages_per_chunk <= 0:
        print("error: --pages-per-chunk must be > 0", file=sys.stderr)
        return 1

    out_dir = args.out_dir or args.source.parent / f"{args.source.stem}__chunks"
    print(f"Splitting {args.source.name} → {out_dir}/")
    chunks = split_pdf(args.source, args.pages_per_chunk, out_dir)
    print(f"\nDone. {len(chunks)} chunks written.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
