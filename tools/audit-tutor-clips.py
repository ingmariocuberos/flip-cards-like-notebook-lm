#!/usr/bin/env python3
"""Transcribe exported tutor clips for a second, independent cut review.

Usage: python tools/audit-tutor-clips.py MODEL_DIR OUTPUT_JSON
The result is evidence for review, not proof of speaker identity.
"""

import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel


ROOT = Path(__file__).resolve().parents[1]


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    model = WhisperModel(sys.argv[1], device='cpu', compute_type='int8', cpu_threads=2)
    pilot = json.loads((ROOT / 'src/tutorAudioPilot.json').read_text(encoding='utf-8'))
    report = []
    for item in pilot['items']:
        source = ROOT / 'public' / item['audioSrc'].lstrip('/')
        if not source.is_file():
            raise FileNotFoundError(source)
        segments, _ = model.transcribe(
            str(source), language='es', beam_size=1,
            condition_on_previous_text=False
        )
        result = {
            'cardId': item['cardId'], 'track': item['track'],
            'transcript': ' '.join(segment.text.strip() for segment in segments)
        }
        report.append(result)
        print(f"{result['cardId']}: {result['transcript']}", flush=True)
    Path(sys.argv[2]).write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')


if __name__ == '__main__':
    main()
