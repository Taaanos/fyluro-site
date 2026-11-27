+++
title = "Import Workflow"
description = "Select a camera card and destination, review Scan Preview, track the six verified import phases, and inspect PDF and NDJSON receipts."
weight = 1
+++

Fyluro stays idle on launch until you select a source folder, then scans, verifies, and commits your media.

## Select source and destination

<img src="/tool/docs/main-window.png" width="520" alt="The Fyluro main window after scanning a card. It shows Source and Destination, Scan Preview with 89 photos, 11 videos, 11 sidecars, dates, Camera Inventory for ILCE-7CM2, Film Mode, and the active Import button.">

- **Source:** Click **Choose…** (or **Change…**) or drag a folder from Finder onto the window. Fyluro rejects single-file drops and reads all subfolders.
- **Destination:** Click **Choose…** (or **Change…**) and select a writable folder outside the source. Fyluro remembers your destination across restarts with a security-scoped bookmark.

> **Note:** After you update `Fyluro.app`, select your destination folder again. Ad-hoc signing changes the app signature and clears the saved bookmark.

## Review Scan Preview

The scan only reads files and copies nothing. **Scan Preview** shows media and sidecar counts, camera count, total size, date range, and **Camera Inventory**.

See [Folder structure](/docs/library-and-files/#folder-structure) for `unknown-camera` and `audio` folder rules. If Fyluro finds no supported media, **Import** stays dimmed.

| Notice | Meaning |
| --- | --- |
| `N files couldn't be read and will be skipped.` | Unreadable files are skipped and stay only on the card. |
| `N files will be skipped (large or unsupported files).` | Skips symbolic links and unknown files of 64 MiB or more in camera folders. |
| `N items will be placed in _unsorted because capture date metadata is missing.` | Files with no capture date go in `_unsorted`. See [Capture dates](/docs/library-and-files/#capture-dates). |

<details>
<summary>Example: unreadable files notice</summary>
<img src="/tool/docs/scan-unreadable-files.png" width="460" alt="Scan Preview showing 4 photos, 4 videos, 1 audio file, a red notice that 2 files could not be read and will be skipped, and Camera Inventory with audio and Unknown camera rows.">
</details>

Click **Import** or press Return when both folders are valid.

## Track import phases

<img src="/tool/docs/import-progress.png" width="460" alt="The Fyluro window during an import. It shows 9 of 111 items copied, the progress bar, time remaining and transfer rate, the expanded Activity speed chart, the Creating verified copy phase, and the Stop Import button.">

Fyluro runs six phases in a fixed order:

| Phase | Action |
| --- | --- |
| `Scanning source media` | Reads the source folder and lists supported files. |
| `Planning destination layout` | Computes the destination path for each file. |
| `Creating verified copy` | Copies each file to staging while computing its SHA-256 hash. |
| `Verifying copied files` | Reads each staged file back from disk and compares its hash and size. |
| `Saving files to library` | Moves verified files into your library folders. |
| `Finalizing receipt` | Writes the final receipt and PDF summary. |

> **Caution:** Keep your card and destination drive connected until the import finishes.

Click **Stop Import** to cancel at the next safe point. Fyluro deletes nothing, and committed files stay in your library.

## Import outcomes

### Import Complete

<img src="/tool/docs/import-complete.png" width="460" alt="The Import Complete window. It shows a green check mark between Source and Destination, 111 items imported, the counts grid, View Receipt, the Activity copy and verify chart, Import Another Card, and Show in Finder.">

- **Added to library:** Counts every new file added, including sidecars.
- **Already in library:** Counts duplicate files that were skipped. Re-importing the same card shows **Already in Library**.
- **Renamed:** Shown only when greater than `0`. See [Duplicates and name collisions](/docs/library-and-files/#duplicates-and-name-collisions).

Click **Show in Finder** to open the new media folders.

### Import Completed with Warnings

<img src="/tool/docs/import-warnings.png" width="460" alt="The Import Completed with Warnings window. It shows an orange exclamation badge, 8 items imported with 1 duplicate and 1 rename, View Receipt, the Activity chart, and an orange box listing 2 files that could not be imported.">

Valid files entered your library, but some files failed to read or copy. The orange box lists each failed file and its reason.

> **Caution:** Failed files remain only on the card.

### Import Needs Attention and Import Stopped

<img src="/tool/docs/import-stopped.png" width="460" alt="The Import Stopped window. It shows a gray stop icon, Transfer stopped by user, Show Staging and View Receipt buttons, the Activity chart, and bottom buttons Open Destination, Import Another Card, and Back to Setup.">

**Import Needs Attention** stops on an error and names the cause. **Import Stopped** confirms a manual stop.

Your card stays unchanged, and committed files stay in your library. Fyluro keeps the receipt and staging folder (`_ingest_staging/<session>`) for inspection.

Delete old staging folders in Finder when you no longer need them. To retry, fix the cause, click **Back to Setup**, and click **Import**.

## Inspect the receipt

<div class="docs-figure-grid">
  <figure>
    <img src="/tool/docs/receipt-summary.png" alt="Page 1 of the Fyluro Transfer Receipt PDF. It shows the VERIFIED badge, run metadata, At a Glance counts for 111 items, and Capture Inventory.">
    <figcaption>Page 1: Summary, counts, and capture inventory.</figcaption>
  </figure>
  <figure>
    <img src="/tool/docs/receipt-appendix.png" alt="Page 2 of the Fyluro Transfer Receipt PDF. It shows the Destination Folders table for Photos Non-RAW, Photos RAW, and Videos, and the NDJSON receipt path.">
    <figcaption>Page 2: Destination folders and NDJSON receipt path.</figcaption>
  </figure>
</div>

Each import writes two files in `<Destination>/_ingest_receipts/`:

- `<session>.summary.pdf`: Human-readable summary selected by **View Receipt**. Shows status (**VERIFIED** or **FAILED**), paths, layout, Film Mode record, counts, renamed files, camera inventory, and errors.
- `<session>.ndjson`: Append-only event log with one JSON event per line, including SHA-256 hashes.

> **Important:** **VERIFIED** means every copied file passed read-back verification. It does not mean Fyluro copied every file on the card. Check **Errors** and **Needs a look** for skipped or unreadable files.
