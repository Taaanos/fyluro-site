+++
title = "Import Workflow"
description = "Understand the main window, scan preview, import phases, outcomes, and receipts."
weight = 1
+++

## The main window

| Before you choose a source | After Scan Preview finishes |
| --- | --- |
| <img src="/tool/docs/window-empty.png" width="380" alt="The Fyluro main window before a source is selected. It shows Choose source, the saved Archive destination with free space, the No Source Selected prompt, the Film Mode button, and a dimmed Import button."> | <img src="/tool/docs/main-window.png" width="380" alt="The Fyluro main window after scanning a card. It shows Source and Destination, Scan Preview with 89 photos, 11 videos, 11 sidecars, dates, Camera Inventory for ILCE-7CM2, Film Mode, and the active Import button."> |

### Source

- **Choose… or Change…** Choose a folder in the dialog. Click **Use Source**.
- **Drag and drop.** Drag a folder from Finder onto the window. Fyluro rejects single-file drops.

Fyluro stays idle on launch until you choose a source folder.
The source can be any folder. Fyluro reads all subfolders.

### Destination

Click **Choose…** or **Change…**, pick a folder, and click **Use Destination**.
Fyluro saves a security-scoped bookmark for the destination folder across restarts.
After you update `Fyluro.app`, pick the destination folder once again because ad-hoc signing changes the app signature.
The row shows the free space.

The destination must be writable. The source and the destination must be different folders, with no nesting.

### Scan Preview

The scan only reads files. It copies nothing.
It shows the counts of photos, videos and audio, the number of cameras, the total size and the date range.
When sidecars are present, a note below the counts shows `Includes N sidecars` (`Includes 1 sidecar` for one file).
If Fyluro finds no supported media, it shows **No Supported Media Found** and keeps **Import** dimmed.

**Camera Inventory** has one row for each camera folder that Fyluro will make, with a file count.
`Unknown camera` is for files that have no camera information (they go in `unknown-camera`). `audio` is for audio files.

Read the notices under the counts:

| Notice | Meaning |
| --- | --- |
| `N files couldn't be read and will be skipped.` | Fyluro cannot read these files. They are not imported. |
| `N files will be skipped (large or unsupported files).` | Fyluro skips symbolic links. It also skips large files of an unknown type. |
| `N items will be placed in _unsorted because capture date metadata is missing.` | Fyluro found no date for these files. See [Dates](/docs/library-and-files/#dates). |

<details>
<summary>See examples: empty folder and unreadable files</summary>

| No supported media | Unreadable files notice |
| --- | --- |
| <img src="/tool/docs/error-empty-source.png" width="380" alt="The Fyluro window showing No Supported Media Found for a folder with no supported photos, videos, or audio."> | <img src="/tool/docs/scan-unreadable-files.png" width="380" alt="Scan Preview showing 4 photos, 4 videos, 1 audio file, a red notice that 2 files could not be read and will be skipped, and Camera Inventory with audio and Unknown camera rows."> |

</details>

**Import** stays dimmed until the scan ends and both folders are valid. Press Return to start the import.

## During an import

<img src="/tool/docs/import-progress.png" width="460" alt="The Fyluro window during an import. It shows 9 of 111 items copied, the progress bar, time remaining and transfer rate, the expanded Activity speed chart, the Creating verified copy phase, and the Stop Import button.">

The bottom left corner shows the phase:

| Phase | What Fyluro does |
| --- | --- |
| Scanning source media | Reads the source and lists the files. |
| Planning destination layout | Decides the folder for each file. |
| Creating verified copy | Copies each file to a staging folder on the destination. |
| Verifying copied files | Reads each copy back and compares it with the original. |
| Saving files to library | Moves the verified files into your library. |
| Finalizing receipt | Writes the receipt and the PDF summary. |

Click **Activity** to show or hide the live copy and verify speed chart.

Keep the card and the destination drive connected until the import ends.

Click **Stop Import** to stop. Fyluro stops at the next safe point. It deletes nothing.
Files that it already added to the library stay there. A stop during the first scan waits for the scan to end.

## After an import

### Import Complete

<img src="/tool/docs/import-complete.png" width="460" alt="The Import Complete window. It shows a green check mark between Source and Destination, 111 items imported, the counts grid, View Receipt, the Activity copy and verify chart, Import Another Card, and Show in Finder.">

- **Added to library** counts every file that Fyluro added. It includes sidecar files, so it can be more than Photos + Videos + Audio. When sidecars are present, a note below the counts shows `Includes N sidecars`.
- **Already in library** counts files that were already there. Fyluro did not copy them again.
- **Renamed** shows only when it is more than 0. See [Duplicates and renames](/docs/library-and-files/#duplicates-and-renames).
- If you import a card again, the headline says **Already in Library**. This is normal.

| Button | What it does |
| --- | --- |
| **Show in Finder** | Opens the new `Photos` and `Videos` folders that this import made. |
| **View Receipt** | Selects the receipt in Finder. |
| **Import Another Card** | Resets the window for the next card. Film Mode turns off. |
| **Source arrow button** | Reveals the source folder in Finder (next to the source name). |

### Import Completed with Warnings

<img src="/tool/docs/import-warnings.png" width="460" alt="The Import Completed with Warnings window. It shows an orange exclamation badge, 8 items imported with 1 duplicate and 1 rename, View Receipt, the Activity chart, and an orange box listing 2 files that could not be imported.">

Fyluro shows **Import Completed with Warnings** when valid files entered your library, but some files could not be read or copied.
An orange box (`N files could not be imported`) lists each failed file and its reason.
These files are not in your library. They stay on the card.

### Import Needs Attention and Import Stopped

<img src="/tool/docs/import-stopped.png" width="460" alt="The Import Stopped window. It shows a gray stop icon, Transfer stopped by user, Show Staging and View Receipt buttons, the Activity chart, and bottom buttons Open Destination, Import Another Card, and Back to Setup.">

**Import Needs Attention** means that the import did not finish. The message tells you why.
**Import Stopped** shows after you click **Stop Import**. It is not an error.
Both screens have **Show Staging** (shown when a staging folder exists) and **View Receipt** in the summary card.
The bottom bar shows **Open Destination**, **Import Another Card**, and **Back to Setup**.

After a failure or a stop:

- Your card is not changed.
- Files that Fyluro already added to the library stay there.
- Fyluro keeps the receipt and the staging folder `_ingest_staging/<session>` in the destination. It never removes an old one. Delete it in Finder when you no longer need it.

To try again, fix the cause. Click **Back to Setup**, then **Import**.
Fyluro copies and verifies all files again. Files that are already in your library show as **Already in library**.

### The receipt

| Page 1: Summary and inventory | Page 2: Destination folders |
| --- | --- |
| <img src="/tool/docs/receipt-summary.png" width="380" alt="Page 1 of the Fyluro Transfer Receipt PDF. It shows the VERIFIED badge, run metadata, At a Glance counts for 111 items, and Capture Inventory."> | <img src="/tool/docs/receipt-appendix.png" width="380" alt="Page 2 of the Fyluro Transfer Receipt PDF. It shows the Destination Folders table for Photos Non-RAW, Photos RAW, and Videos, and the NDJSON receipt path."> |

Each import writes two files in `_ingest_receipts` in the destination:

- `<session>.summary.pdf` is the summary for people. **View Receipt** selects it.
- `<session>.ndjson` is the full event log, one JSON event on each line.

The PDF shows the status (**VERIFIED** or **FAILED**), the source, the destination and the folder layout.
It also shows:

- The Film Mode record, if you used Film Mode.
- The counts (**At a Glance**) and the errors (**Needs a look**).
- Each renamed file, with its name on the card and its name in the library.
- The camera inventory and the number of files in each library folder.

**VERIFIED** means that every file that Fyluro copied passed verification.
It does not mean that Fyluro copied every file on the card. Fyluro skips some files. Read **Errors** and **Needs a look** to see them.
