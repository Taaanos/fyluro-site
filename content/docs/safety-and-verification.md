+++
title = "Safety & Verification"
description = "The rules Fyluro follows on every import, how verification works, and what to check before erasing a card."
weight = 4
+++

## How Fyluro keeps your files safe

Fyluro follows these rules on every import. No setting turns them off.

1. **Your card does not change.** Fyluro only reads the card. It never writes, renames or deletes a file on it.
2. **Your library is never overwritten.** A new file with the same name gets a suffix.
3. **Every file goes to staging first.** A file enters your library only after it passes verification.
4. **Verification always runs.** You cannot turn it off or skip it.
5. **Your metadata does not change.** Fyluro does not rewrite photo or video metadata. The exception is [Film Mode](/docs/film-mode/).
6. **A receipt is always written.** If Fyluro cannot write it in the destination, it writes it in a temporary folder on your Mac. If it cannot write it anywhere, the import does not start.
7. **A failed import keeps its evidence.** Fyluro keeps the receipt and the staging folder.
8. **File dates stay.** Fyluro keeps the modified date of each file.
9. **Fyluro writes only in safe places.** It writes the staging folder, the receipts and the new library files in the destination. It writes a receipt in a temporary folder on your Mac only if the destination fails. It deletes only its own staging folder, after a successful import.

Fyluro calculates a SHA-256 hash of each file while it copies the file to staging.
Then it reads the staged file again and compares the hash and the size.
Fyluro copies and verifies all files before the first file moves into your library. One failure stops the import before any file moves.
Fyluro does not read a file again after it moves into your library.

### What verification catches and what it does not

Fyluro bypasses the macOS memory cache, flushes the drive write cache, and reads each staged file back from the destination drive.

- **What this catches:** transfer errors, faulty cables or card readers, controller bugs, and immediate write corruption on bad sectors.
- **What this does not catch:** long-term bitrot. Bitrot is silent data degradation that happens months or years after a valid write (for example, flash charge loss or magnetic decay).

Fyluro checks each file once, during the import. It does not monitor or repair files after the import ends.
Each NDJSON receipt stores the SHA-256 hash of every copied file.
To protect against long-term bitrot, keep backups on more than one drive, or store your archive on a checksumming filesystem such as ZFS.

## Before you erase a card

Fyluro never erases a card. You decide when to do it. Before you erase the card:

1. Look for **Import Complete**. Do not erase the card after **Import Needs Attention** or **Import Stopped**.
2. Look for **Import Completed with Warnings** and the orange box (`N files could not be imported`). Those files are not in your library.
3. Read the notices that **Scan Preview** showed. Fyluro skips unreadable files, symbolic links and large files of an unknown type. These files stay on the card only.
4. Open the receipt. Look for **VERIFIED** and for **Errors** with the count 0.
5. Open a few files in your library and look at them.
