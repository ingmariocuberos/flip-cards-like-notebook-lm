#!/usr/bin/env python3
"""Locate XTTS turn boundaries in the published conversation audio files."""

import json
import subprocess
import tempfile
import wave
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
RESOURCES = ROOT / 'src' / 'resources'
OUTPUT = ROOT / 'src' / 'audioCues.json'
WINDOW_SECONDS = 0.01
MIN_PAUSE_SECONDS = 0.5
SILENCE_PEAK = 10
PADDING_SECONDS = 0.12


def find_pauses(audio_path, wav_path):
  subprocess.run(
    ['afconvert', str(audio_path), '-o', str(wav_path), '-f', 'WAVE', '-d', 'LEI16'],
    check=True,
    capture_output=True,
  )

  with wave.open(str(wav_path)) as audio:
    rate = audio.getframerate()
    channels = audio.getnchannels()
    samples = np.frombuffer(audio.readframes(audio.getnframes()), dtype=np.int16)

  window = round(rate * WINDOW_SECONDS) * channels
  count = len(samples) // window
  peaks = np.max(np.abs(samples[:count * window].reshape(count, window).astype(np.int32)), axis=1)
  silent = peaks < SILENCE_PEAK
  starts = np.where(silent & ~np.r_[False, silent[:-1]])[0]
  ends = np.where(silent & ~np.r_[silent[1:], False])[0] + 1
  minimum = round(MIN_PAUSE_SECONDS / WINDOW_SECONDS)
  return [
    (start * WINDOW_SECONDS, end * WINDOW_SECONDS)
    for start, end in zip(starts, ends)
    if end - start >= minimum
  ]


def main():
  cues_by_book = {}
  with tempfile.TemporaryDirectory(prefix='conversation-cues-') as temporary:
    wav_path = Path(temporary) / 'decoded.wav'

    for resource_path in sorted(RESOURCES.glob('buch-*.json')):
      resource = json.loads(resource_path.read_text(encoding='utf-8'))
      conversation = next(
        item for item in resource['sektionen'] if item['sektionId'] == 'conversation'
      )
      audio_path = ROOT / 'public' / conversation['audioSrc'].lstrip('/')
      pauses = find_pauses(audio_path, wav_path)
      turns = conversation['turns']
      if len(pauses) != len(turns):
        raise ValueError(
          f'{resource_path.name}: {len(pauses)} pauses for {len(turns)} turns'
        )

      cues = []
      for index, (pause_start, _) in enumerate(pauses):
        start = 0 if index == 0 else max(0, pauses[index - 1][1] - PADDING_SECONDS)
        end = pause_start + PADDING_SECONDS
        if start >= end:
          raise ValueError(f'{resource_path.name}: invalid cue for turn {index}')
        cues.append([round(start, 2), round(end, 2)])
      cues_by_book[resource['bookId']] = cues

  lines = [
    f'  {json.dumps(book_id)}: {json.dumps(cues, separators=(",", ":"))}'
    for book_id, cues in sorted(cues_by_book.items())
  ]
  OUTPUT.write_text('{\n' + ',\n'.join(lines) + '\n}\n', encoding='utf-8')
  print(f'Wrote {OUTPUT} ({len(cues_by_book)} conversations)')


if __name__ == '__main__':
  main()
