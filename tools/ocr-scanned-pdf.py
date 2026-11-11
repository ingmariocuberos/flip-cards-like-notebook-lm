"""OCR rendered PDF pages with Apple Vision using up to four workers."""

import argparse
import re
import subprocess
import tempfile
import time
from pathlib import Path


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('pages', type=Path, help='Directory produced by render-scanned-pdf.py')
    parser.add_argument('--workers', type=int, default=4)
    parser.add_argument('--select', help='Comma-separated PDF page numbers or ranges, e.g. 4-19,32-47')
    args = parser.parse_args()

    pages = sorted(args.pages.glob('*.png'))
    if args.select:
        selected = set()
        for part in args.select.split(','):
            bounds = part.split('-', 1)
            first = int(bounds[0])
            last = int(bounds[1]) if len(bounds) == 2 else first
            if first < 1 or last < first:
                parser.error(f'Invalid page range: {part}')
            selected.update(range(first, last + 1))
        pages = [page for page in pages if int(page.stem) in selected]
        if len(pages) != len(selected):
            parser.error('Selected pages are missing from the rendered directory')
    if not pages:
        raise SystemExit('No PNG pages found')
    output = args.pages.with_name(args.pages.name.removesuffix('__pngs') + '.ocr.txt')
    script = Path(__file__).with_name('ocr-scanned-pages.swift')

    with tempfile.TemporaryDirectory(prefix='english-ocr-') as directory:
        temporary = Path(directory)
        binary = temporary / 'ocr-pages'
        subprocess.run(['swiftc', str(script), '-o', str(binary)], check=True)
        workers = max(1, min(args.workers, len(pages)))
        groups = [pages[index::workers] for index in range(workers)]
        processes = []
        for index, group in enumerate(groups):
            folder = temporary / f'group-{index}'
            folder.mkdir()
            for page in group:
                (folder / page.name).symlink_to(page.resolve())
            part = temporary / f'group-{index}.txt'
            handle = part.open('w')
            process = subprocess.Popen([str(binary), str(folder)], stdout=handle)
            processes.append((process, handle, part))

        while any(process.poll() is None for process, _, _ in processes):
            time.sleep(15)
            count = sum(part.read_bytes().count(b'=== PAGE') for _, _, part in processes)
            print(f'OCR: {count}/{len(pages)} pages', flush=True)

        recognized = {}
        for process, handle, part in processes:
            handle.close()
            if process.returncode:
                raise SystemExit(f'OCR worker failed: {process.returncode}')
            text = part.read_text()
            matches = list(re.finditer(r'^=== PAGE (\d{3}) ===\n', text, re.M))
            for index, match in enumerate(matches):
                end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
                recognized[int(match.group(1))] = text[match.end():end].strip()

    expected = [int(page.stem) for page in pages]
    if sorted(recognized) != expected:
        raise SystemExit('OCR output is missing pages')
    output.write_text(''.join(f'=== PAGE {page:03} ===\n{recognized[page]}\n\n' for page in expected))
    print(f'OCR complete: {len(pages)} pages in {output}')


if __name__ == '__main__':
    main()
