import Foundation
import Vision

guard CommandLine.arguments.count == 2 else {
  fputs("Usage: swift tools/ocr-scanned-pages.swift <png-directory>\n", stderr)
  exit(1)
}

let directory = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let pages = try FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil)
  .filter { $0.pathExtension.lowercased() == "png" }
  .sorted { $0.lastPathComponent < $1.lastPathComponent }

for page in pages {
  let request = VNRecognizeTextRequest()
  request.recognitionLevel = .accurate
  request.usesLanguageCorrection = true
  request.recognitionLanguages = ["es-ES", "en-US"]
  try VNImageRequestHandler(url: page).perform([request])
  let lines = (request.results ?? []).sorted { first, second in
    if abs(first.boundingBox.midY - second.boundingBox.midY) > 0.008 {
      return first.boundingBox.midY > second.boundingBox.midY
    }
    return first.boundingBox.minX < second.boundingBox.minX
  }
  print("=== PAGE \(page.deletingPathExtension().lastPathComponent) ===")
  for line in lines {
    if let text = line.topCandidates(1).first?.string { print(text) }
  }
  print("")
}
