+++
title = "Quick Start & Install"
description = "Install Fyluro on macOS and run your first verified media import."
template = "shared/docs-section.html"
page_template = "shared/docs-page.html"
sort_by = "weight"
+++

Fyluro copies photos, videos and audio from a camera card to your drive.
It verifies each copy, files each item in a dated folder, and writes a receipt.

## Quick start

1. Put the card in your Mac.
2. Open Fyluro.
3. Click **Choose…** on **Source** and **Destination** to select your folders.
4. Wait for **Scan Preview** to show the counts.
5. Click **Import**.
6. Wait for **Import Complete**.
7. Click **Show in Finder** to see your files.

Fyluro does not change or erase your card. Read [Before you erase a card](/docs/safety-and-verification/#before-you-erase-a-card) first.

## Install

Fyluro needs a Mac with Apple silicon and macOS 13 (Ventura) or later.

Install with Homebrew:

```bash
brew install --cask taaanos/tap/fyluro
```

The Homebrew cask removes the macOS quarantine mark automatically.

Or install manually from [GitHub Releases](https://github.com/taaanos/fyluro/releases) with `Fyluro-<version>-macos-arm64.zip` and its `.sha256` file.

For manual downloads, verify the archive before you open the app:

```bash
shasum -a 256 -c Fyluro-<version>-macos-arm64.zip.sha256
gh attestation verify Fyluro-<version>-macos-arm64.zip --owner Taaanos
```

1. Download `Fyluro-<version>-macos-arm64.zip` and unpack it.
2. Drag `Fyluro.app` into the **Applications** folder.
3. Open `Fyluro.app`. macOS shows a message that it cannot verify the app. Close the message.
4. Open **System Settings**, then **Privacy & Security**. Scroll down to **Security**.
5. Click **Open Anyway** next to the message about Fyluro. Enter your password if macOS asks.
6. Open `Fyluro.app` again. Click **Open** if macOS asks.

For manual downloads, macOS blocks the first open because Fyluro has no Apple Developer ID signature.
You do these steps one time only.

Fyluro runs inside the macOS App Sandbox. Selecting a folder in the **Choose** dialog grants file access for that folder.
