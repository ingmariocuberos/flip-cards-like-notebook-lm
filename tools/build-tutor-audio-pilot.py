#!/usr/bin/env python3
"""Extract the manually checked tutor prompts for the local Buch 11 pilot.

Requires PyAV and numpy. The source CD and exported clips are not redistributed.
Usage: python tools/build-tutor-audio-pilot.py '/path/to/cd 43 mp3'
"""

import json
import sys
from fractions import Fraction
from pathlib import Path

import av
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
PILOT = ROOT / 'src/tutorAudioPilot.json'
SAMPLE_RATE = 44100


def read_audio(source):
    with av.open(str(source)) as container:
        stream = container.streams.audio[0]
        if stream.rate != SAMPLE_RATE:
            raise ValueError(f'Expected {SAMPLE_RATE} Hz, got {stream.rate} Hz')
        chunks = [frame.to_ndarray().astype(np.float32).mean(axis=0)
                  for frame in container.decode(audio=0)]
    return np.concatenate(chunks)


def export_clip(samples, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    with av.open(str(target), mode='w', format='mp4') as output:
        stream = output.add_stream('aac', rate=SAMPLE_RATE, layout='mono')
        stream.bit_rate = 64000
        for offset in range(0, len(samples), 1024):
            block = samples[offset:offset + 1024].reshape(1, -1)
            frame = av.AudioFrame.from_ndarray(block, format='fltp', layout='mono')
            frame.sample_rate = SAMPLE_RATE
            frame.pts = offset
            frame.time_base = Fraction(1, SAMPLE_RATE)
            for packet in stream.encode(frame):
                output.mux(packet)
        for packet in stream.encode():
            output.mux(packet)


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    cd_dir = Path(sys.argv[1])
    if not cd_dir.is_dir():
        raise SystemExit(f'Missing CD directory: {cd_dir}')
    pilot = json.loads(PILOT.read_text(encoding='utf-8'))
    tracks = sorted({item['track'] for item in pilot['items']})
    if len({item['cardId'] for item in pilot['items']}) != len(pilot['items']):
        raise ValueError('Duplicate cardId in pilot')
    for track in tracks:
        source = cd_dir / f'{track} Track{track}.mp3'
        if not source.is_file():
            raise FileNotFoundError(source)
        audio = read_audio(source)
        for item in (item for item in pilot['items'] if item['track'] == track):
            ranges = item.get('segments') or [item]
            slices = []
            previous_end = -1
            for part in ranges:
                start = round(part['start'] * SAMPLE_RATE)
                end = round(part['end'] * SAMPLE_RATE)
                if not 0 <= start < end <= len(audio) or start < previous_end:
                    raise ValueError(f'Invalid range for {item["cardId"]}')
                if slices:
                    slices.append(np.zeros(round(0.22 * SAMPLE_RATE), dtype=np.float32))
                slices.append(audio[start:end])
                previous_end = end
            target = ROOT / 'public' / item['audioSrc'].lstrip('/')
            export_clip(np.concatenate(slices), target)
            print(f'{item["cardId"]}: {track} {len(ranges)} segment(s) → {target}')


if __name__ == '__main__':
    main()
