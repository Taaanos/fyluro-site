+++
title = "Troubleshooting"
description = "Resolve common card detection, permissions, disk space, and verification issues."
weight = 6
+++

**Fyluro does not show my card automatically.** Fyluro runs in the macOS App Sandbox and does not scan `/Volumes` on launch. Click **Choose…** (or **Change…**) to select the card, or drag the card folder onto the window.

**Source must be a readable folder.** Choose the folder again.
If the problem stays, open **System Settings**, then **Privacy & Security**, then **Files & Folders**. Make sure that Fyluro can use removable volumes.

**Destination must be a writable folder.** A drive in the NTFS format is read-only on a Mac. Use APFS or exFAT, or choose another folder.

**Source and destination must be different folders with no nesting.** Choose a destination that is not the source folder and not inside it.

**Not enough free space.** Fyluro needs the size of the media plus a small extra amount.
Free some space, or choose another destination. The red notice under **Destination** has an **Import Anyway** button.
If you click it, the import starts. It stops with an error if the drive becomes full.

**A drive disconnected or became full during the import.** The **Import Needs Attention** screen names the phase and the file.
Connect the drive again, or free some space. Then import again.

**Read-back verification failed: hash mismatch.** The copy is not the same as the original. The receipt shows the file name. Fyluro added no file to your library.
Try a different card reader, cable or port. Then import again. If the problem stays, the card or the file can be damaged.

**Photos are in the wrong month.** Fyluro uses the date in the file, and the camera clock can be wrong. For film scans, use [Film Mode](/docs/film-mode/).

**Stop Import is slow.** A stop during the first scan waits for the scan to end. A stop during the copy is fast.

<details>
<summary>See examples of setup error banners</summary>

| Unreadable source | Read-only destination |
| --- | --- |
| <img src="/tool/docs/error-unreadable-source.png" width="380" alt="Scan Preview showing a red banner that says Source must be a readable folder."> | <img src="/tool/docs/error-readonly-destination.png" width="380" alt="Route panel showing a red banner that says Destination must be a writable folder."> |

| Not enough free space | Nested folders |
| --- | --- |
| <img src="/tool/docs/error-low-space.png" width="380" alt="Route panel showing a red banner that says Not enough free space on TINY_DEST, with an Import Anyway button."> | <img src="/tool/docs/error-nested-folders.png" width="380" alt="Route panel showing a red banner that says Source and destination must be different folders with no nesting."> |

</details>
