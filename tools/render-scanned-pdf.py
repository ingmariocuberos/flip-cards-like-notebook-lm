"""Render a scanned PDF into PNG pages for tools/ocr-scanned-pages.swift."""

import argparse
from pathlib import Path

import fitz


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('pdf', type=Path)
    parser.add_argument('--scale', type=float, default=2.0)
    args = parser.parse_args()

    output = args.pdf.with_name(f'{args.pdf.stem}__pngs')
    output.mkdir(parents=True, exist_ok=True)
    document = fitz.open(args.pdf)
    for number, page in enumerate(document, 1):
        page.get_pixmap(matrix=fitz.Matrix(args.scale, args.scale), alpha=False).save(
            output / f'{number:03}.png'
        )
    print(f'Rendered {len(document)} pages in {output}')


if __name__ == '__main__':
    main()
