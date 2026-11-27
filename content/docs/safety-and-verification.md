+++
title = "Safety & Verification"
description = "Non-negotiable safety rules, read-back verification mechanics, and pre-erasure checks."
weight = 4
+++

Fyluro enforces ten non-negotiable safety rules on every import, with no setting to weaken or disable them.

## Integrity guarantees

1. **Source card stays untouched.** Fyluro only reads the card and never writes, renames, or deletes source files.
2. **Library is never overwritten.** Existing library files stay intact; name collisions get a `-1`, `-2` suffix.
3. **Every file goes through staging.** A file moves to your library only after passing verification.
4. **Verification always runs.** No setting, cache, or ledger can skip or weaken verification.
5. **Embedded metadata stays intact.** Fyluro never rewrites media bytes (only exception: [Film Mode](/docs/film-mode/)).
6. **Every run writes a receipt.** If the destination fails, Fyluro writes the receipt to a local temporary folder. If neither opens, the import does not start.
7. **Failed runs keep evidence.** On error or cancel, Fyluro preserves the receipt and staging folder.
8. **File dates stay intact.** Fyluro preserves each file's modified date and, where supported, created date.
9. **Writes stay in allowed folders.** Fyluro writes only to staging, receipts, and new library folders. On success, it deletes only its own staging folder.
10. **Settings lock at run start.** Layout changes apply to the next import, never the active run.

## How verification works

1. **Copy and hash:** Fyluro copies each file to `_ingest_staging/<session>` with `F_NOCACHE` and computes its SHA-256 hash.
2. **Flush drive cache:** After all files copy, Fyluro flushes the destination drive write cache (`F_FULLFSYNC`, or `fsync` if unsupported).
3. **Read back and verify:** Fyluro reads each staged file back with `F_NOCACHE` and compares its hash and size.

Any mismatch stops the run before any file moves to your library.

### What verification catches

- **Catches:** Transfer errors, faulty cables or card readers, controller bugs, and immediate write corruption on bad sectors.
- **Does not catch:** Long-term bitrot (silent data decay months or years after writing). Fyluro checks each file once during import and does not re-read committed files.

Each `.ndjson` receipt stores the SHA-256 hash of every copied file. To protect against bitrot, keep backups on multiple drives or use a checksumming filesystem such as ZFS.

## Before you erase a card

> **Caution:** Confirm every item below before you format a card.

1. Confirm the window shows **Import Complete** (not **Import Needs Attention** or **Import Stopped**).
2. If you see **Import Completed with Warnings**, review the orange list. Those files stay only on the card.
3. Check **Scan Preview** skip notices for unreadable files, symbolic links, or large unknown files.
4. Open the PDF receipt and confirm **VERIFIED** with `0` errors.
5. Open a few imported files in your library to spot-check them.
