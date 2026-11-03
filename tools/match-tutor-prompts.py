#!/usr/bin/env python3
"""Rank possible CD 43 prompt spans against the Sektion 3 cards.

This produces review candidates, not publishable cuts. Human verification is
required because ASR can confuse the tutor with the student or skip words.
Usage: python tools/match-tutor-prompts.py TRANSCRIPT_DIR OUTPUT_JSON
"""

import json
import re
import sys
import unicodedata
from pathlib import Path

from rapidfuzz import fuzz


ROOT = Path(__file__).resolve().parents[1]
CARDS = ROOT / 'src/data/willkommen-vaughan-11/sektion-3.json'
LESSONS = {
    '01': (1, 15), '03': (16, 38), '04': (39, 53),
    '07': (54, 67), '08': (68, 82), '09': (83, 100),
    '13': (101, 101), '02': (102, 102), '05': (103, 111),
}


def normalize(text):
    text = unicodedata.normalize('NFD', text.casefold())
    text = ''.join(ch for ch in text if unicodedata.category(ch) != 'Mn')
    return re.sub(r'[^a-z0-9]+', ' ', text).strip()


def candidates(card, words):
    target = normalize(re.sub(r'\([^)]*\)', '', card['front']))
    length = len(target.split())
    found = []
    for size in range(max(2, length - 2), length + 5):
        for index in range(len(words) - size + 1):
            chunk = words[index:index + size]
            if chunk[-1]['end'] - chunk[0]['start'] > max(12, length * 1.2):
                continue
            heard = normalize(' '.join(word['text'] for word in chunk))
            if not heard:
                continue
            score = max(fuzz.ratio(target, heard), fuzz.token_sort_ratio(target, heard) * 0.94)
            if score < 52:
                continue
            found.append({
                'score': round(score, 1),
                'start': round(chunk[0]['start'], 2),
                'end': round(chunk[-1]['end'], 2),
                'heard': ' '.join(word['text'] for word in chunk).strip()
            })
    found.sort(key=lambda item: -item['score'])
    selected = []
    for match in found:
        if any(abs(match['start'] - prior['start']) < 1 for prior in selected):
            continue
        selected.append(match)
        if len(selected) == 5:
            break
    return selected


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    transcript_dir = Path(sys.argv[1])
    output = Path(sys.argv[2])
    cards = json.loads(CARDS.read_text(encoding='utf-8'))['cards']
    results = []
    for track, (first, last) in LESSONS.items():
        path = transcript_dir / f'{track}.json'
        if not path.is_file():
            print(f'Skipping {track}: no transcript yet', file=sys.stderr)
            continue
        segments = json.loads(path.read_text(encoding='utf-8'))
        words = []
        for segment in segments:
            if segment['words']:
                words.extend(segment['words'])
                continue
            tokens = segment['text'].split()
            duration = segment['end'] - segment['start']
            words.extend({
                'start': segment['start'] + duration * index / len(tokens),
                'end': segment['start'] + duration * (index + 1) / len(tokens),
                'text': token
            } for index, token in enumerate(tokens))
        for number in range(first, last + 1):
            card = next(card for card in cards if card['id'] == f's3-t{number:03d}')
            results.append({
                'track': track,
                'cardId': card['id'],
                'front': card['front'],
                'candidates': candidates(card, words)
            })
    output.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'{len(results)} cards ranked → {output}')


if __name__ == '__main__':
    main()
