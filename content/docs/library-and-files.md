+++
title = "Library & File Rules"
description = "Destination folder layout, library settings, duplicates, capture dates, sidecars, camera labels, and supported file types."
weight = 2
+++

Fyluro files media by capture date, camera, and type without overwriting existing files in your library.

## Folder structure

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

- **Camera folders:** Fyluro builds folder names from file metadata using lowercase letters, numbers, and dashes (`iPhone 15 Pro` becomes `iphone-15-pro`). Files without camera metadata go in `unknown-camera`. Raw device codes (such as `ac006`) stay as-is unless mapped in [Camera labels](#camera-labels-experimental).
- **Audio:** Audio files go into `<date>/audio/` with no camera subfolder.
- **Missing dates:** Files without a capture date go into `_unsorted/`.
- **Filenames:** Source filenames stay unchanged except for collision suffixes.

## Library settings

Open **Fyluro > Settings…** (or press `⌘,`) to configure the library layout.

| Setting | Default | Behavior |
| --- | --- | --- |
| **Date folders** | `2026/202603` | Choose `2026/202603`, `2026/03`, or `2026`. |
| **Group by camera** | On | Creates one subfolder per camera. |
| **Split photos into RAW / Non-RAW** | Off | Splits photos into `RAW` and `Non-RAW` folders. |

> **Note:** Choose your layout before your first import. Changing settings never moves existing files or affects a running import. Re-importing a card after a layout change copies files into the new paths.

## Duplicates and name collisions

Fyluro never overwrites an existing file. It checks for an existing filename only in the target destination folder:

- **Same content (matching SHA-256):** Fyluro skips the file as a duplicate and does not copy it again.
- **Different content:** Fyluro keeps both files and adds `-1`, `-2`, and so on before the extension.

## Capture dates

| Media type | Date priority |
| --- | --- |
| **Photos** | 1. Film Mode (if enabled), 2. EXIF `DateTimeOriginal`, 3. EXIF `CreateDate`, 4. File modified date |
| **Videos** | 1. Container `creation_time`, 2. Matched sidecar date, 3. File modified date |
| **Audio** | 1. Container `creation_time`, 2. File modified date |

Dates without a time zone use your Mac's local time zone. A wrong camera clock produces a wrong folder date.

Fyluro preserves each file's modified date and, when the destination filesystem supports it, its created date.

## Sidecars

Sidecars (such as `.XMP`, `.THM`, or Sony `M01.XML`) pair with a photo or video in the same folder by basename. Fyluro copies, verifies, and places each sidecar next to its parent file.

A `.WAV` file with the same basename as a video in the same folder imports as that video's sidecar. Other `.WAV` files import as standalone audio.

## Camera labels (experimental)

Camera labels map raw device codes (such as `ac006`) to readable folder names (such as `osmoaction6`).

> **Caution:** This feature is experimental and off by default. New labels apply only to future imports; existing folders do not move.

1. Open **Fyluro > Settings…** and turn on **Use camera labels (experimental)**.
2. In **On the Current Card**, enter a name next to a code and press Return.
3. To map an offline camera, enter its code and name in **Your Labels** and click **Add**.

- Two codes with the same name share one folder (`Same folder as …`).
- Labels save immediately to `~/Library/Containers/com.thanosam.fyluro/Data/Library/Application Support/Fyluro/CameraCatalog.json`.
- Turning the switch off ignores labels without deleting them.

## Supported file types

Fyluro classifies files by trailing extension (case-insensitive):

| Kind | File types |
| --- | --- |
| Photos | JPG, JPEG, PNG, TIF, TIFF, HEIC, HEIF, GIF, BMP, JXL |
| RAW photos | DNG, CR2, CR3, CRW, NEF, NRW, ARW, SR2, SRF, ORF, ORI, RAF, RW2, SRW, PEF, X3F, IIQ, GPR, MRW, 3FR, FFF, MOS, MEF, DCR, KDC, K25, ERF, RWL |
| Videos | MOV, MP4, M4V, AVI, MPG, MPEG, MTS, M2TS, MXF, 3GP, 3G2, LRV, MKV, INSV, R3D, BRAW, CRM, ARI, CINE, TS, WEBM |
| Audio | WAV, MP3, M4A, AAC, CAF, AIF, AIFF |
| Sidecars | THM, XMP, AAE, XML, SRT, CPI, NKSC, DOP, PP3, JSON, and paired WAV |

### Skipped items

- Hidden files and folders (names starting with `.`).
- System folders (`System Volume Information`, `$RECYCLE.BIN`, `__MACOSX`).
- Symbolic links (never followed).
- Unmatched sidecars without a parent photo or video.
- Unlisted extensions. **Scan Preview** flags unlisted files of 64 MiB or more in camera media folders (`DCIM`, `PRIVATE`, `AVCHD`, `MP_ROOT`, `MISC`, `MOVIE`, `VIDEO`).
