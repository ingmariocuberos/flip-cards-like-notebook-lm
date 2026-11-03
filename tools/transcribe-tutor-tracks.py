#!/usr/bin/env python3
"""Create timestamped local draft transcripts for CD 43 (not bundled).

Requires faster-whisper. Usage:
  python tools/transcribe-tutor-tracks.py MODEL_DIR CD_DIR OUTPUT_DIR 01 03 04
"""

import json
import sys
from pathlib import Path

from faster_whisper import WhisperModel


def main():
    if len(sys.argv) < 5:
        raise SystemExit(__doc__)
    model_dir, cd_dir, output_dir = map(Path, sys.argv[1:4])
    output_dir.mkdir(parents=True, exist_ok=True)
    model = WhisperModel(str(model_dir), device='cpu', compute_type='int8', cpu_threads=2)
    for number in sys.argv[4:]:
        source = cd_dir / f'{number} Track{number}.mp3'
        if not source.is_file():
            raise FileNotFoundError(source)
        print(f'Transcribing {source.name}', flush=True)
        segments, _ = model.transcribe(
            str(source), language='es', beam_size=1, vad_filter=True,
            word_timestamps=False, condition_on_previous_text=False
        )
        transcript = [
            {
                'start': round(segment.start, 2),
                'end': round(segment.end, 2),
                'text': segment.text.strip(),
                'words': [
                    {'start': round(word.start, 2), 'end': round(word.end, 2), 'text': word.word}
                    for word in (segment.words or [])
                ]
            }
            for segment in segments
        ]
        target = output_dir / f'{number}.json'
        target.write_text(json.dumps(transcript, ensure_ascii=False, indent=2), encoding='utf-8')
        print(f'{number}: {len(transcript)} segments → {target}', flush=True)


if __name__ == '__main__':
    main()
