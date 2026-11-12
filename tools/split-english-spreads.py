"""Split landscape scans containing two book pages into separate PNGs.

Usage: python3 tools/split-english-spreads.py 'sources/english/Libro 32__pngs' 6 44
Output page numbers are 2 * PDF page - 1 (left) and 2 * PDF page (right).
"""

import sys
from pathlib import Path

from PIL import Image


def main():
    if len(sys.argv) != 4:
        raise SystemExit(__doc__)
    source = Path(sys.argv[1])
    first, last = map(int, sys.argv[2:])
    output = source.with_name(source.name.replace('__pngs', '__halves'))
    output.mkdir(exist_ok=True)

    for page in range(first, last + 1):
        with Image.open(source / f'{page:03}.png') as image:
            width, height = image.size
            for index, (left, right) in enumerate(((0, width // 2), (width // 2, width))):
                image.crop((left, 0, right, height)).save(output / f'{2 * page - 1 + index:03}.png')

    print(f'Split {last - first + 1} spreads into {output}')


if __name__ == '__main__':
    main()
