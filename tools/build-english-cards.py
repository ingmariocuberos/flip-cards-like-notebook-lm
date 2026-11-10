"""Build one English book from a reviewed tab-separated card source.

Usage: python3 tools/build-english-cards.py tools/english-cards/book-02.tsv
Each row: level (1/2/3), PDF page, Spanish prompt, English answer.
"""

import csv
import json
import re
import sys
from pathlib import Path

LEVELS = {
    1: ('basico', 'Nivel básico'),
    2: ('intermedio', 'Nivel intermedio'),
    3: ('avanzado', 'Nivel avanzado'),
}


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    source = Path(sys.argv[1])
    match = re.fullmatch(r'book-(\d{2})\.tsv', source.name)
    if not match:
        raise SystemExit('Source must be named book-NN.tsv')
    number = int(match.group(1))
    book_id = f'vaughan-intensive-english-{number:02}'
    root = Path(__file__).resolve().parents[1]
    output = root / 'src' / 'data' / book_id
    output.mkdir(parents=True, exist_ok=True)

    cards_by_level = {level: [] for level in LEVELS}
    seen_by_level = {level: set() for level in LEVELS}
    with source.open(newline='', encoding='utf-8') as handle:
        for row_number, row in enumerate(csv.reader(handle, delimiter='\t'), 1):
            if not row or row[0].startswith('#'):
                continue
            if len(row) != 4:
                raise ValueError(f'{source}:{row_number}: expected four columns')
            level, page, front, back = row
            level, page = int(level), int(page)
            if level not in LEVELS or page < 1 or not front.strip() or not back.strip():
                raise ValueError(f'{source}:{row_number}: invalid level, page or text')
            if front in seen_by_level[level]:
                raise ValueError(f'{source}:{row_number}: duplicate prompt: {front}')
            seen_by_level[level].add(front)
            cards_by_level[level].append({
                'id': f's{level}-{len(cards_by_level[level]) + 1:03}',
                'front': front.strip(),
                'back': back.strip(),
                'sourcePage': page,
            })

    if any(not cards for cards in cards_by_level.values()):
        raise ValueError(f'{source}: all three levels need cards')
    for level, cards in cards_by_level.items():
        slug, title = LEVELS[level]
        data = {
            'bookId': book_id,
            'bookTitle': f'Vaughan Intensive English — Libro {number}',
            'language': 'en',
            'sektionId': f'nivel-{slug}',
            'sektionTitle': title,
            'order': level,
            'cards': cards,
        }
        path = output / f'nivel-{level}.json'
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(f'{path}: {len(cards)} cards')


if __name__ == '__main__':
    main()
