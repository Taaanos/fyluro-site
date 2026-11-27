+++
title = "Film Mode"
description = "Record camera, film stock, and capture month for scanned film rolls."
weight = 3
+++

A scan of film carries the metadata of the device that digitized it.
Film Mode records the camera and the film that you shot on. It also files the photos under the month that you shot them.

1. Click **Film Mode…** in the bottom bar. The **Film Mode** sheet opens.
2. Choose the month, enter the year and enter the camera. Fill in the other fields if you want to.
3. Click **Apply**.

**Month and year shot** (four-digit year, 1826 or later) and **Camera** are required. Enter the camera that exposed the film, not the scanner.
**Apply** stays dimmed until they are valid. The text under the form tells you what is missing.
These fields are optional: **Lens**, **Film stock**, **ISO**, **Shot at**, **Development notes**, **Scanner or camera**, **Creator** and **Copyright**.
Use **Shot at** for a pushed or pulled roll.

After **Apply**, a banner above **Import** shows the record.
For example: `Film Mode — shot on Pentax K1000 · Kodak Gold 200 · Sep 1998`. Click **Edit…** to change it. Click **Turn Off** to turn Film Mode off. **Cancel** on a new roll leaves Film Mode off.
The sheet fills the fields from your last roll. It never fills the month, the year, **Shot at** or **Development notes**.

## What Film Mode changes

- **Folder.** Every photo goes under the month and year that you entered, in a folder for the camera that you entered, for example `1998/199809/pentax-k1000/Photos`.
- **Metadata.** Fyluro writes the date, the camera and your other fields into the library copy of each JPEG, TIFF, HEIC and PNG photo.
- **RAW files.** Fyluro cannot write metadata into RAW files. They keep their metadata and still go in the correct folder. **Import Complete** shows how many RAW files kept it.
- **Photos only.** Videos and audio do not change.
- **Your card.** The files and the file dates on the card do not change.
- **Creator and Copyright.** If you leave them blank, the photo keeps the value from its source file.

Fyluro writes the metadata after it verifies the copy. It does not verify the file again after the write.
For this reason, a second import of the same file is not a duplicate. Fyluro keeps both files, and the new file gets a suffix.

Film Mode applies to every photo in the import. Import one roll at a time.
Film Mode is off when you open Fyluro, and it turns off when you click **Import Another Card**.
