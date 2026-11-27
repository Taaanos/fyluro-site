+++
title = "Film Mode"
description = "Tag scanned film rolls on macOS with original camera, lens, film stock, ISO, and capture month in embedded EXIF metadata and dated folders."
weight = 3
+++

Scanned film carries the metadata of the scanner or digitizing camera. Film Mode writes your film camera, stock, and shoot month onto imported photos.

## Configure Film Mode

1. Click **Film Mode…** in the bottom bar.
2. Enter **Month and year shot** and **Camera**.
3. Fill in any optional fields, then click **Apply**.

An active banner above **Import** confirms the roll, for example: `Film Mode — shot on Pentax K1000 · Kodak Gold 200 · Sep 1998`.

| Field | Required | Notes |
| --- | --- | --- |
| **Month and year shot** | Yes | Four-digit year (`1826` or later). Sets the destination date folder. Cleared between rolls. |
| **Camera** | Yes | Camera that exposed the film. Sets the camera folder. Remembered across rolls. |
| **Lens, Film stock, ISO, Scanner or camera** | No | Remembered from your last roll. |
| **Shot at** | No | Effective ISO for pushed or pulled film. Cleared between rolls. |
| **Development notes** | No | Lab or processing notes. Cleared between rolls. |
| **Creator, Copyright** | No | Leave blank to keep source values. Remembered from your last roll. |

## What Film Mode changes

- **Folder placement:** Every imported photo goes under your entered month, year, and camera (for example, `1998/199809/pentax-k1000/Photos`).
- **Embedded metadata:** Fyluro writes your fields into the library copy of JPEG, TIFF, HEIC, and PNG photos.
- **Videos and audio:** Videos and audio files do not change.
- **Source card:** Original files and filesystem dates never change.

## Limitations

> **Important:** Review these limits before importing scanned film:
>
> - **One roll per import:** Film Mode applies to every photo in the run. Import one roll at a time.
> - **RAW files:** Fyluro places RAW files in the Film Mode folder but does not rewrite their embedded EXIF. **Import Complete** shows how many RAW files kept original EXIF.
> - **No re-hash after metadata write:** Fyluro verifies the staged copy first, then writes Film Mode metadata before moving the file to your library.
> - **No duplicate match on re-import:** Because the library copy's bytes change, re-importing the same file keeps both files with a `-1` suffix.
> - **Auto-reset:** Film Mode starts off on app launch and turns off when you click **Import Another Card**.
