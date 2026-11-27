+++
title = "CLI Reference"
description = "Run the Fyluro ingest engine from the terminal for scripts and automation."
weight = 5
+++

The app is the main product. The `fyluro` CLI runs the same ingest engine for scripts and terminal use, and can offer fewer options than the app.

## Basic usage

```bash
fyluro --source /Volumes/SD --dest /Volumes/Media --dry-run
```

If you build from source in the `fyluro` repository, run it with `swift run fyluro`.

## Options

| Option | Purpose |
| --- | --- |
| `--source <path>` | Source folder. If you omit it, Fyluro looks for a card in `/Volumes`. |
| `--dest <path>` | Destination library. If you omit it, Fyluro reuses the last destination that has Fyluro receipts. |
| `--dry-run` | Scan and plan only. Fyluro writes no library files. |
| `--pdf` | Write a PDF summary next to the receipt. |
| `--json` | Print the final summary as JSON. |
| `--verbose` | Print diagnostic logs. |
| `--max-parallel-copies <n>` | Number of files to copy in parallel (default 1). |
| `--detect-timeout-seconds <n>` | Seconds to wait for a card when you omit `--source` (default 60, `0` waits without end). |
| `--pick-source`, `--pick-dest` | Show a folder picker. |

## Exit codes

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

The code from `2` to `7` shows the phase that failed.

## Camera Labels in the CLI

The CLI always reads your Camera Labels file. The app has a setting for this feature. It is experimental and off by default.
