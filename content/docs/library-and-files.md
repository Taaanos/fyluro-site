+++
title = "Library, Settings & Files"
description = "Folder structure, duplicates, sidecars, capture dates, app settings, and supported file types."
weight = 2
+++

## Where your files go

The default layout:

```text
<Destination>/
  2026/
    202603/
      iphone-15-pro/
        Photos/IMG_0001.HEIC
        Videos/IMG_0002.MOV
      audio/
        recording.m4a
  _ingest_receipts/
  _ingest_staging/      (only after a failed or stopped import)
```

Audio has no camera folder. You can change the date folders, the camera folder and the `RAW` / `Non-RAW` split in [Settings](#settings).

**Camera folders.** Fyluro makes the name from the camera model in the file metadata.
The name has lowercase letters, numbers and dashes only. For example, `iPhone 15 Pro` becomes `iphone-15-pro`.
A file without camera information goes in `unknown-camera`.
Some cameras write a code, for example `ac006`. The folder then has that code. See [Camera Labels (experimental)](#camera-labels-experimental).

**File names.** Fyluro keeps the file name. A suffix is the only change.

### Duplicates and renames

Fyluro never overwrites a file in your library. When a file with the same folder and name exists:

- **Same content.** The file is a duplicate. Fyluro does not copy it again.
- **Different content.** Fyluro keeps both files. It adds `-1`, `-2` and so on to the new name, before the extension.

Fyluro finds a duplicate only in the folder where the file would go.
If you change the folder layout, Fyluro copies a card that you already imported again, to the new folders.

### Sidecars

A sidecar is a companion file, for example an `.XMP` or a `.THM` file.
Fyluro copies and verifies it with its photo or video, and puts it in the same folder.
A `.WAV` file with the same name as a video in the same folder is a sidecar of that video. Other `.WAV` files are audio.

### Dates

Fyluro reads the capture date in this order:

- **Photos:** the date in the photo metadata, then the modified date of the file on the card.
- **Videos:** the creation date in the video, then the date in a sidecar, then the modified date of the file.
- **Audio:** the creation date in the audio file, then the modified date of the file.

A date without a time zone uses the time zone of your Mac. A wrong camera clock gives a wrong folder date.
Fyluro uses `_unsorted` in place of the year and month only when it finds no date at all. This is rare.

Fyluro keeps the modified date of each file. It keeps the created date when the destination drive allows it.

## Settings

Click **Fyluro** in the menu bar, then **Settings…**. You can also press Command-comma.

### Library

| Setting | Default | What it does |
| --- | --- | --- |
| **Date folders** | `2026/202603` | Other choices are `2026/03` and `2026`. |
| **Group by camera** | On | Puts files in a folder for each camera. |
| **Split photos into RAW / Non-RAW** | Off | Puts photos in a `RAW` folder or a `Non-RAW` folder. |

**Preview** shows sample paths for your choices. Click **Apply** to save them for the next import.
**Reset to Default** sets the options back to the defaults. Click **Apply** to save them.
A running import keeps the settings that it started with.

Choose a layout before your first import, and keep it. Old folders stay as they are when you change it.

### Camera Labels (experimental)

Camera Labels gives a name to a camera code, so the folder reads `osmoaction6` and not `ac006`.
This feature is experimental. It is off by default. Use it at your own risk.

1. Turn on **Use camera labels (experimental)**.
2. In **On the Current Card**, type a name next to a camera code. Press Return.
3. To add a camera that is not on the card, type its code and a name in **Your Labels**. Click **Add**.

- Fyluro saves each name at once. The trash icon removes a label.
- Two codes can have the same name. They then share one folder. Fyluro shows `Same folder as …`.
- A new label applies to the next import. Existing folders stay as they are.
- The app stores labels inside its sandbox container at `~/Library/Containers/com.thanosam.fyluro/Data/Library/Application Support/Fyluro/CameraCatalog.json`.
- When the switch is off, Fyluro ignores the labels. It does not delete them.

## Supported files

Fyluro reads the file type from the end of the file name, without case.

| Kind | File types |
| --- | --- |
| Photos | JPG, JPEG, PNG, TIF, TIFF, HEIC, HEIF, GIF, BMP, JXL |
| RAW photos | DNG, CR2, CR3, CRW, NEF, NRW, ARW, SR2, SRF, ORF, ORI, RAF, RW2, SRW, PEF, X3F, IIQ, GPR, MRW, 3FR, FFF, MOS, MEF, DCR, KDC, K25, ERF, RWL |
| Videos | MOV, MP4, M4V, AVI, MPG, MPEG, MTS, M2TS, MXF, 3GP, 3G2, LRV, MKV, INSV, R3D, BRAW, CRM, ARI, CINE, TS, WEBM |
| Audio | WAV, MP3, M4A, AAC, CAF, AIF, AIFF |
| Sidecars | THM, XMP, AAE, XML, SRT, CPI, NKSC, DOP, PP3, JSON, and WAV next to a video with the same name |

Fyluro imports a sidecar only when it belongs to a photo or a video.

Fyluro skips these items:

- Hidden files and folders (names that start with a dot).
- `System Volume Information`, `$RECYCLE.BIN` and `__MACOSX`.
- Symbolic links. Fyluro never follows them.
- Files of a type that is not in the table.

**Scan Preview** shows a notice for a large file of an unknown type. A large file is 64 MiB or more.
The notice shows only for files in `DCIM`, `PRIVATE`, `AVCHD`, `MP_ROOT`, `MISC`, `MOVIE` or `VIDEO`. It helps you find media from a new camera.
