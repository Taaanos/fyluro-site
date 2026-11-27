+++
title = "Fyluro"
description = "Copy photos, videos, audio, and sidecars from camera cards on macOS. Read-back SHA-256 verification, dated folders, receipts, and Film Mode."

[extra]
seo_title = "Fyluro — Verified Media Ingest for macOS"

[extra.hero]
headline = "Media ingest for macOS."
subheadline = "Copy photos, videos, audio, and sidecars from camera cards to your library in an organized, verified flow."
meta = "macOS app and CLI"
primary_cta_label = "Download on GitHub Releases"
primary_cta_url = "https://github.com/taaanos/fyluro/releases"
homebrew_command = "brew install --cask taaanos/tap/fyluro"

[extra.hero_carousel]
label = "Fyluro app screenshots"

[[extra.hero_carousel.slides]]
src = "/tool/screenshots/01-ready.png"
caption = "Choose source"
alt = "Fyluro app window ready to select a memory card or folder and copy to the Archive destination"
width = 1344
height = 1094

[[extra.hero_carousel.slides]]
src = "/tool/screenshots/02-scan-preview.png"
caption = "Scan preview"
alt = "Fyluro scan preview showing 89 photos, 11 videos, 11 sidecars, and one detected ILCE-7CM2 camera before import"
width = 1344
height = 1074

[[extra.hero_carousel.slides]]
src = "/tool/screenshots/03-importing.png"
caption = "Live import"
alt = "Fyluro copying 9 of 111 items to staging with a live copy throughput chart"
width = 1344
height = 1118

[[extra.hero_carousel.slides]]
src = "/tool/screenshots/04-import-complete.png"
caption = "Import complete"
alt = "Fyluro import complete window confirming all 111 files are verified in the library with copy and verify speed charts"
width = 1344
height = 1352

[extra.guarantees]
title = "Built for peace of mind"

[[extra.guarantees.items]]
title = "Your source card stays untouched"
body = "Fyluro never modifies, renames, or deletes files on your camera card."
link_url = "/docs/safety-and-verification/"
link_label = "Read all 10 safety rules →"

[[extra.guarantees.items]]
title = "Your library is never overwritten"
body = "Identical files are skipped as duplicates. Name collisions with different content get a sequence suffix (-1, -2)."
link_url = "/docs/library-and-files/#duplicates-and-name-collisions"
link_label = "Library & file rules →"

[[extra.guarantees.items]]
title = "Verified before it enters your library"
body = "Fyluro copies every file to a temporary staging folder first. Each file passes a read-back checksum check before it moves into your library."
link_url = "/docs/safety-and-verification/#how-verification-works"
link_label = "How verification works →"

[[extra.guarantees.items]]
title = "Metadata and dates stay intact"
body = "Embedded EXIF, video metadata, and filesystem dates stay unchanged."
link_url = "/docs/film-mode/"
link_label = "Film Mode for scanned film →"

[[extra.guarantees.items]]
title = "Every run leaves a receipt"
body = "Every session writes an append-only receipt and a PDF summary. If a run stops early, staged files and the receipt stay on disk for inspection."
link_url = "/docs/import-workflow/#inspect-the-receipt"
link_label = "Inspect receipt format →"

[extra.how_it_works]
title = "How Fyluro works"

[[extra.how_it_works.steps]]
title = "Scan and plan"
body = "Select a source card and a destination drive. Fyluro scans photos, videos, audio, and sidecars, detects cameras, and plans every destination path before writing."

[[extra.how_it_works.steps]]
title = "Copy to staging"
body = "Fyluro copies each file to a staging folder while computing its checksum."

[[extra.how_it_works.steps]]
title = "Verify from disk"
body = "Fyluro reads every staged file back from disk and compares its checksum and size against the source. Any mismatch stops the run before any file enters your library."

[[extra.how_it_works.steps]]
title = "Commit and write receipt"
body = "Fyluro moves verified files into your chosen folder structure (such as date, camera, and media type) without overwriting existing files. It writes a receipt with the run summary."

[extra.footer]
note = "Fyluro — OSS media ingest for macOS."
+++
