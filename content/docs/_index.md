+++
title = "Quickstart"
description = "Install Fyluro on Apple silicon macOS via Homebrew or GitHub Releases, verify downloads, and run your first verified media import."
template = "shared/docs-section.html"
page_template = "shared/docs-page.html"
sort_by = "weight"
+++

Fyluro copies photos, videos, audio, and sidecars from a memory card to your library. It verifies every copy by read-back checksum, files items by date and camera, and writes a receipt.

## Install

Requires Apple silicon and macOS 13 (Ventura) or later.

### Homebrew (recommended)

```bash
brew install --cask taaanos/tap/fyluro
```

The Homebrew cask removes the macOS quarantine mark automatically.

### Manual download

Download `Fyluro-<version>-macos-arm64.zip` and its `.sha256` file from [GitHub Releases](https://github.com/taaanos/fyluro/releases).

Before you unpack the archive, verify the checksum and GitHub attestation:

```bash
shasum -a 256 -c Fyluro-<version>-macos-arm64.zip.sha256
gh attestation verify Fyluro-<version>-macos-arm64.zip --owner Taaanos
```

1. Unpack `Fyluro-<version>-macos-arm64.zip` and drag `Fyluro.app` to **Applications**.
2. Open `Fyluro.app` once, then close the macOS warning dialog.
3. Open **System Settings > Privacy & Security > Security** and click **Open Anyway**.
4. Open `Fyluro.app` again and click **Open**.

> **Note:** Manual downloads require this one-time approval because Fyluro has no Apple Developer ID signature.

## Run your first import

1. Connect your memory card and open Fyluro.
2. Click **Choose…** on **Source** and **Destination** to select your card and library folder.
3. Review **Scan Preview**, then click **Import**.
4. Wait for **Import Complete**, then click **Show in Finder** to inspect your files.

> **Caution:** Fyluro never changes or erases your card. Review [Before you erase a card](/docs/safety-and-verification/#before-you-erase-a-card) before you format it.
