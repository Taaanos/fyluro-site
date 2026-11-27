+++
title = "CLI Reference"
description = "Install and run the fyluro command-line tool for scripts and terminal workflows."
weight = 5
+++

The macOS app is the primary interface. The `fyluro` CLI runs the same verified ingest engine for terminal workflows and scripts.

## Install

```bash
brew install taaanos/tap/fyluro
```

You can also run the bundled binary inside the app (`/Applications/Fyluro.app/Contents/MacOS/fyluro`) or run `swift run fyluro` from a source checkout.

## Usage

```bash
# Scan and plan only (writes a receipt, no library files)
fyluro --source /Volumes/SD --dest /Volumes/Media --dry-run

# Run a verified import with a PDF summary and JSON output
fyluro --source /Volumes/SD --dest /Volumes/Media --pdf --json
```

## Options

| Option | Default | Description |
| --- | --- | --- |
| `--source <path>` | Auto-detect in `/Volumes` | Source folder path. |
| `--dest <path>` | Last remembered destination | Destination library path. |
| `--dry-run` | Off | Scan and plan only. Writes a receipt and no library files. |
| `--pdf` | Off | Write a `.summary.pdf` next to the NDJSON receipt. |
| `--json` | Off | Print the final summary as JSON to stdout. |
| `--verbose` | Off | Print diagnostic logs. |
| `--max-parallel-copies <n>` | `1` | Parallel copy workers. Keep `1` for rotational HDDs. |
| `--detect-timeout-seconds <n>` | `60` | Seconds to wait for a card when `--source` is omitted (`0` waits indefinitely). |
| `--pick-source` | Off | Open a folder picker when `--source` is omitted. |
| `--pick-dest` | Off | Open a folder picker when `--dest` is omitted. |

## Exit codes

Exit codes `2` through `7` identify the pipeline phase that failed:

| Code | Meaning |
| --- | --- |
| `0` | Success |
| `1` | Other failure |
| `2` | Verify phase failed |
| `3` | Scan phase failed |
| `4` | Plan phase failed |
| `5` | Copy phase failed |
| `6` | Commit phase failed |
| `7` | Finalize phase failed |

## Differences from the app

- **App-only features:** Film Mode and the Settings window exist only in the macOS app.
- **Camera labels:** The CLI always reads `CameraCatalog.json` when present (no experimental toggle).
- **PDF summary:** The app always writes a PDF summary; the CLI writes one only with `--pdf`.
