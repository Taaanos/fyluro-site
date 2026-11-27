+++
title = "Troubleshooting"
description = "Resolve Fyluro macOS sandbox permissions, card detection, read-only NTFS drives, disk space warnings, and SHA-256 verification errors."
weight = 6
+++

## Card detection and folder access

### Card does not appear automatically

Fyluro runs in the macOS App Sandbox and does not scan `/Volumes` on launch. Click **Choose…** (or **Change…**) or drag the card folder onto the window.

### Source must be a readable folder

Select the source folder again. If the error persists, open **System Settings > Privacy & Security > Files & Folders** and grant Fyluro access to removable volumes.

### Destination must be a writable folder

NTFS drives are read-only on macOS. Format the drive as APFS or exFAT, or choose another destination.

## Disk space and interrupted imports

### Not enough free space

Fyluro needs the media size plus small overhead. Free space or pick another destination. Clicking **Import Anyway** starts the run, which stops with an error if the drive fills up.

### Drive disconnected or full during import

**Import Needs Attention** names the failed phase and file. Reconnect the drive or free space, click **Back to Setup**, and import again.

### Stop Import is slow

Stopping during the initial scan waits for the scan to finish. Stopping during copy or verify is fast.

## Verification and file placement

### Read-back verification failed: hash mismatch

The staged copy did not match the source file. Fyluro added no files to your library, and the receipt names the failed file. Try another card reader, cable, or port, then import again. If it persists, the card or file may be damaged.

### Photos appear in the wrong month

Fyluro uses file capture dates, which reflect the camera clock. For scanned film, use [Film Mode](/docs/film-mode/).
