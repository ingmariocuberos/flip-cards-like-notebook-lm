#!/usr/bin/env python3
"""Generate a two-speaker conversation locally with Coqui XTTS-v2."""

import argparse
import json
import time
from pathlib import Path

import numpy as np
import soundfile as sf
from TTS.api import TTS


MODEL_NAME = 'tts_models/multilingual/multi-dataset/xtts_v2'
PREFERRED_SPEAKERS = ('Ana Florence', 'Andrew Chipper')


def parse_args():
  parser = argparse.ArgumentParser()
  parser.add_argument('resource', type=Path, help='Conversation resource JSON')
  parser.add_argument('output', type=Path, help='Destination WAV file')
  parser.add_argument('--speaker-a', help='XTTS speaker for the first character')
  parser.add_argument('--speaker-b', help='XTTS speaker for the second character')
  parser.add_argument('--max-turns', type=int, help='Generate only the first N turns')
  return parser.parse_args()


def load_turns(resource_path):
  with resource_path.open(encoding='utf-8') as resource_file:
    resource = json.load(resource_file)

  sektionen = resource.get('sektionen', [])
  conversation = next(
    (sektion for sektion in sektionen if sektion.get('sektionId') == 'conversation'),
    None,
  )
  if not conversation or not conversation.get('turns'):
    raise ValueError(f'No conversation turns found in {resource_path}')
  return conversation['turns']


def choose_speakers(available, requested_a, requested_b):
  if len(available) < 2:
    raise ValueError('XTTS-v2 did not expose at least two built-in speakers')

  speaker_a = requested_a or (
    PREFERRED_SPEAKERS[0] if PREFERRED_SPEAKERS[0] in available else available[0]
  )
  speaker_b = requested_b or (
    PREFERRED_SPEAKERS[1] if PREFERRED_SPEAKERS[1] in available else available[1]
  )
  missing = [speaker for speaker in (speaker_a, speaker_b) if speaker not in available]
  if missing:
    raise ValueError(
      f'Unknown speaker(s): {", ".join(missing)}. '
      f'Available speakers: {", ".join(available)}'
    )
  if speaker_a == speaker_b:
    raise ValueError('The two conversation speakers must use different XTTS voices')
  return speaker_a, speaker_b


def pause_duration(text):
  if text.rstrip().endswith('!'):
    return 0.42
  if text.rstrip().endswith('?'):
    return 0.38
  return 0.30


def main():
  args = parse_args()
  all_turns = load_turns(args.resource)
  character_names = list(dict.fromkeys(turn['speaker'] for turn in all_turns))
  if len(character_names) != 2:
    raise ValueError('The conversation must contain exactly two characters')

  turns = all_turns
  if args.max_turns:
    turns = turns[:args.max_turns]

  started_at = time.monotonic()
  print('Loading XTTS-v2 on CPU...', flush=True)
  tts = TTS(MODEL_NAME).to('cpu')
  available_speakers = list(tts.speakers or [])
  speaker_a, speaker_b = choose_speakers(
    available_speakers,
    args.speaker_a,
    args.speaker_b,
  )

  voices = {
    character_names[0]: speaker_a,
    character_names[1]: speaker_b,
  }
  sample_rate = tts.synthesizer.output_sample_rate
  segments = []

  print(f'Voices: {character_names[0]}={speaker_a}; {character_names[1]}={speaker_b}')
  for index, turn in enumerate(turns, start=1):
    turn_started_at = time.monotonic()
    audio = tts.tts(
      text=turn['de'],
      speaker=voices[turn['speaker']],
      language='de',
      split_sentences=False,
    )
    segments.append(np.asarray(audio, dtype=np.float32))
    segments.append(np.zeros(int(sample_rate * pause_duration(turn['de'])), dtype=np.float32))
    elapsed = time.monotonic() - turn_started_at
    print(f'[{index}/{len(turns)}] {turn["speaker"]}: {elapsed:.1f}s', flush=True)

  conversation = np.concatenate(segments)
  peak = float(np.max(np.abs(conversation)))
  if peak > 0:
    conversation *= min(0.95 / peak, 1.0)

  args.output.parent.mkdir(parents=True, exist_ok=True)
  sf.write(args.output, conversation, sample_rate, subtype='PCM_16')
  duration = len(conversation) / sample_rate
  elapsed = time.monotonic() - started_at
  print(f'Wrote {args.output} ({duration:.1f}s audio in {elapsed:.1f}s)')


if __name__ == '__main__':
  main()
