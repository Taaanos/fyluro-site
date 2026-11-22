+++
title = "Fyluro"
description = "Verified media ingest for macOS."

[extra.hero]
headline = "Verified media ingest for macOS."
subheadline = "Copy photos, videos, audio, and sidecars from camera cards to your library in an organized, verified flow. After copying finishes, Fyluro reads each file back from disk and compares it against the source checksum. After every run, it writes a receipt with the summary and every action taken."
meta = "Open-source macOS app and CLI."
primary_cta_label = "Download on GitHub Releases"
primary_cta_url = "https://github.com/taaanos/fyluro/releases"
homebrew_command = "brew install --cask taaanos/tap/fyluro"

[extra.problem]
title = "Why card offload is still a chore"

[[extra.problem.items]]
title = "Manual sorting after every shoot"
body = "Copying files off a card is only half the job. You still have to sort photos, videos, audio, and sidecars into date and camera folders by hand."

[[extra.problem.items]]
title = "Spot-checking for peace of mind"
body = "After a manual copy, many people open random files just to feel sure the transfer worked. You should not have to guess before you format a card."

[[extra.problem.items]]
title = "Messy retries and unclear results"
body = "If a copy stops halfway or you insert the same card twice, you have to figure out what landed, what is a duplicate, and what was missed."

[extra.how_it_works]
title = "How Fyluro works"

[[extra.how_it_works.steps]]
title = "Scan and plan"
body = "Select a source card and a destination drive. Fyluro scans photos, videos, audio, and sidecars, detects cameras, and previews every destination path before it writes a byte."

[[extra.how_it_works.steps]]
title = "Copy to staging"
body = "Fyluro copies each file to a staging folder while computing its SHA-256 checksum. It writes gently to protect drive health and flushes data to disk when copying ends."

[[extra.how_it_works.steps]]
title = "Verify from disk"
body = "Fyluro reads every staged file back from disk and compares its checksum and size against the source. Any mismatch stops the run before any file enters your library."

[[extra.how_it_works.steps]]
title = "Commit and write receipt"
body = "Fyluro moves verified files into your chosen folder structure (such as date, camera, and media type) without overwriting existing files. It writes a receipt with the run summary and every action taken."

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
body = "Embedded EXIF, video metadata, and filesystem dates stay unchanged. Optional Film Mode for digitized film is off by default."

[[extra.guarantees.items]]
title = "Every run leaves a receipt"
body = "Every session writes an append-only receipt (with an optional PDF summary). If a run stops or cancels, staging files and the receipt stay on disk for inspection."

[[extra.guarantees.items]]
title = "Kind to your drives"
body = "Fyluro writes only to staging, receipts, and new library folders. It detects your drive type to avoid unnecessary disk wear and heavy seeks."

[extra.footer]
note = "Fyluro — Open-source media ingest for macOS."
docs_label = "Docs (Coming soon)"
+++
