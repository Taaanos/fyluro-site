+++
title = "Fyluro"
description = "Media ingest for macOS."

[extra.hero]
headline = "Media ingest for macOS."
subheadline = "Copy photos, videos, audio, and sidecars from camera cards to your library in an organized, verified flow."
meta = "macOS app and CLI"
primary_cta_label = "Download on GitHub Releases"
primary_cta_url = "https://github.com/taaanos/fyluro/releases"
homebrew_command = "brew install --cask taaanos/tap/fyluro"

[extra.problem]
title = "Card offload is a chore"

[[extra.problem.items]]
title = "Manual sorting after every offload"
body = "Copying files off a card is only half the job. You still have to sort photos, videos, audio, and sidecars into your organization structure by hand."

[[extra.problem.items]]
title = "Random checking for peace of mind"
body = "After a manual copy, many people open random files just to feel sure the transfer worked. You should not have to guess before you format a card."

[[extra.problem.items]]
title = "Messy retries and unclear results"
body = "If a copy stops halfway or you offload the same card twice, you have to figure out what is a duplicate and what was missed."

[extra.how_it_works]
title = "How Fyluro works"

[[extra.how_it_works.steps]]
title = "Scan and plan"
body = "Select a source card and a destination drive. Fyluro scans photos, videos, audio, and sidecars, detects cameras, and plans every destination path before writing."

[[extra.how_it_works.steps]]
title = "Copy to staging"
body = "Fyluro copies each file to a staging folder while computing its SHA-256 checksum."

[[extra.how_it_works.steps]]
title = "Verify from disk"
body = "Fyluro reads every staged file back from disk and compares its checksum and size against the source. Any mismatch stops the run before any file enters your library."

[[extra.how_it_works.steps]]
title = "Commit and write receipt"
body = "Fyluro moves verified files into your chosen folder structure (such as date, camera, and media type) without overwriting existing files. It writes a receipt with the run summary."

[extra.guarantees]
title = "Built for peace of mind"

[[extra.guarantees.items]]
title = "Your source card stays untouched"
body = "Fyluro never modifies, renames, or deletes files on your camera card."

[[extra.guarantees.items]]
title = "Your library is never overwritten"
body = "Identical files are skipped as duplicates. Name collisions with different content get a sequence suffix (-1, -2)."

[[extra.guarantees.items]]
title = "Staged and verified before commit"
body = "Every file lands in staging first and passes a read-back SHA-256 check before it moves into your library."

[[extra.guarantees.items]]
title = "Metadata and dates stay intact"
body = "Embedded EXIF, video metadata, and filesystem dates stay unchanged."

[[extra.guarantees.items]]
title = "Every run leaves a receipt"
body = "Every session writes an append-only receipt and a PDF summary. If a run stops or cancels, staging files and the receipt stay on disk for inspection."

[extra.footer]
note = "Fyluro — OSS media ingest for macOS."
docs_label = "Docs (Coming soon)"
+++
