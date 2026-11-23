(function () {
  var STATES = {
    preflight: {
      title: "Preflight",
      pill: "Entry gate",
      kind: "gate",
      summary:
        "Checks that source and destination do not overlap and opens the receipt file before the session starts.",
      happens:
        "Resolves paths to reject nested or equal source and destination folders. Locks the path strategy and run settings at session start.",
      writes:
        "Zero writes if rejected. Opens the append-only NDJSON receipt in destination receipts (or local temp fallback) on start.",
      failure:
        "If folders overlap or no receipt sink can open, the run stops before session start with zero changes on disk.",
      invariants: [
        "I-6 Receipt always written",
        "I-9 Allowed write paths only",
        "I-10 Path strategy locked",
      ],
    },
    scan: {
      title: "1. Scan",
      pill: "Main pipeline",
      kind: "main",
      summary:
        "Reads the source card read-only to classify media, pair sidecars, and detect cameras across the full card.",
      happens:
        "Classifies photos, videos, audio, and sidecars. Ignores hidden entries and skips symlinks. Logs unreadable single files and continues.",
      writes:
        "Receipt events only (SCAN_SUMMARY, CAMERA_LABEL_DETECTED). Source card files are never modified, renamed, or deleted.",
      failure:
        "If the source root is unreadable, the session aborts and keeps the receipt. No staging or library files are created.",
      invariants: ["I-1 Source card read-only", "I-6 Receipt always written"],
    },
    plan: {
      title: "2. Plan",
      pill: "Main pipeline",
      kind: "main",
      summary:
        "Computes destination paths and checks existing library files before Fyluro writes any media bytes.",
      happens:
        "Builds final paths by date, optional camera label, media type, and RAW split. Marks identical-hash duplicates and -1, -2 conflict renames.",
      writes:
        "Receipt events only (PLAN_COMPUTED). No staging folders or library files are created in this phase.",
      failure:
        "In dry-run mode, the session stops here and writes only the receipt. Any plan error aborts and keeps the receipt.",
      invariants: [
        "I-2 Library never overwritten",
        "I-10 Path strategy locked",
      ],
    },
    copy: {
      title: "3. Copy",
      pill: "Main pipeline",
      kind: "main",
      summary:
        "Streams all planned files into staging while computing checksums, then flushes the drive write cache.",
      happens:
        "Checks free space first. Copies each file to a hidden .tmp name with F_NOCACHE, renames to staging, then runs one F_FULLFSYNC / fsync barrier.",
      writes:
        "Writes to _ingest_staging/<SessionID>/ and logs FILE_COPIED in the receipt. Final library folders stay untouched.",
      failure:
        "Stops on the first copy error, disk-full error, or cancel. Already-copied files remain in staging with the receipt.",
      invariants: [
        "I-1 Source card read-only",
        "I-3 Fixed staging order",
        "I-5 Mandatory verification",
        "I-7 Keep evidence on failure",
      ],
    },
    verify: {
      title: "4. Verify",
      pill: "Main pipeline",
      kind: "main",
      summary:
        "Re-reads every staged file back from disk (bypassing OS page cache) and checks both checksum and byte size.",
      happens:
        "Opens each staged file with F_NOCACHE so bytes come from storage media, not RAM. Every file must pass before the first commit starts.",
      writes:
        "Receipt events only (FILE_VERIFY_STARTED, FILE_VERIFIED). Cannot be disabled or skipped by any setting or cache.",
      failure:
        "Any hash mismatch, read error, or cancel stops the run before Commit. Zero files enter the library; staging and receipt stay.",
      invariants: [
        "I-3 Fixed staging order",
        "I-5 Mandatory verification",
        "I-7 Keep evidence on failure",
      ],
    },
    commit: {
      title: "5. Commit",
      pill: "Main pipeline",
      kind: "main",
      summary:
        "Moves verified files one at a time from staging into final library paths without overwriting existing files.",
      happens:
        "Re-checks live library paths at commit time. Skips duplicates, adds -1 / -2 suffixes on collisions, and preserves metadata and timestamps.",
      writes:
        "Creates final library files and folders. Logs FILE_COMMITTED, DUPLICATE_SKIPPED, or CONFLICT_RENAMED in the receipt.",
      failure:
        "Stops immediately on error or cancel. Already-committed files stay in the library; remaining files stay in staging.",
      invariants: [
        "I-2 Library never overwritten",
        "I-4 Metadata preserved",
        "I-8 Filesystem dates preserved",
        "I-9 Allowed write paths only",
      ],
    },
    finalize: {
      title: "6. Finalize",
      pill: "VERIFIED",
      kind: "verified",
      summary:
        "Removes the session staging folder after a completed run and flushes the final receipt summary to disk.",
      happens:
        "Deletes _ingest_staging/<SessionID> (and _ingest_staging if empty). Writes SUMMARY and SESSION_FINISHED with VERIFIED status.",
      writes:
        "Flushes the final receipt (F_FULLFSYNC / fsync) and optional PDF summary. Removes only staging files created by this session.",
      failure:
        "If staging cleanup fails, Fyluro logs an error in the receipt while session status remains completed and library files stay safe.",
      invariants: [
        "I-6 Receipt always written",
        "I-9 Allowed write paths only",
      ],
    },
    "dry-run": {
      title: "Dry Run",
      pill: "Preview exit",
      kind: "branch",
      summary:
        "Stops after Scan and Plan so you can preview paths, duplicates, and conflicts without writing media files.",
      happens:
        "Marks copy, verify, and commit events as not executed. Ends with status DRY RUN (scan+plan) and is never labeled VERIFIED.",
      writes:
        "Writes only the NDJSON receipt (and optional PDF summary). Creates zero staging folders and zero library files.",
      failure:
        "Nothing is cleaned up because no staging folder exists. Run a normal ingest when ready to copy and verify.",
      invariants: [
        "I-1 Source card read-only",
        "I-6 Receipt always written",
        "I-9 Allowed write paths only",
      ],
    },
    rejected: {
      title: "Rejected",
      pill: "Preflight stop",
      kind: "abort",
      summary:
        "Stops before a session begins when source and destination overlap or no receipt sink can be opened.",
      happens:
        "Rejects equal folders, destination inside source, or source inside destination. Also stops if neither receipt sink can open.",
      writes:
        "Zero writes anywhere. No receipt file, no staging folder, and no library folder is created.",
      failure:
        "Pick separate, non-nested source and destination folders (or fix destination permissions) and start a new run.",
      invariants: ["I-6 Receipt always written", "I-9 Allowed write paths only"],
    },
    "aborted-pre": {
      title: "Aborted (Library Untouched)",
      pill: "Pre-commit stop",
      kind: "abort",
      summary:
        "Stops before Commit on an unreadable source root, copy failure, verify mismatch, or user cancel.",
      happens:
        "Because all files copy and verify before the first commit starts, zero files enter your final library.",
      writes:
        "Keeps any copied files in _ingest_staging/<SessionID> and flushes the receipt with the failed phase and reason.",
      failure:
        "Inspect the receipt and staging folder. Re-running starts a fresh session that copies and verifies everything again.",
      invariants: [
        "I-3 Fixed staging order",
        "I-5 Mandatory verification",
        "I-7 Keep evidence on failure",
      ],
    },
    "aborted-commit": {
      title: "Aborted (Partial Commit)",
      pill: "Commit stop",
      kind: "abort",
      summary:
        "Stops immediately if a commit error or cancel occurs while moving verified files into the library.",
      happens:
        "Commits run one file at a time. Already-committed files stay in your library; remaining files stay in staging.",
      writes:
        "Never overwrites existing files during recovery. Flushes the receipt recording both committed and remaining staged files.",
      failure:
        "Inspect the receipt. A fresh rerun detects already-committed files as duplicates and safely ingests the rest.",
      invariants: [
        "I-2 Library never overwritten",
        "I-6 Receipt always written",
        "I-7 Keep evidence on failure",
      ],
    },
  };

  var root = document.querySelector("[data-state-machine]");
  if (!root) return;

  var nodes = root.querySelectorAll(".sm-node[data-state]");
  var edges = root.querySelectorAll(".sm-edge");
  var edgeLabels = root.querySelectorAll(".sm-edge-label[data-edge-label]");

  var titleEl = root.querySelector("[data-sm-title]");
  var pillEl = root.querySelector("[data-sm-pill]");
  var summaryEl = root.querySelector("[data-sm-summary]");
  var happensEl = root.querySelector("[data-sm-happens]");
  var writesEl = root.querySelector("[data-sm-writes]");
  var failureEl = root.querySelector("[data-sm-failure]");
  var invariantsEl = root.querySelector("[data-sm-invariants]");

  function selectState(stateId) {
    var info = STATES[stateId];
    if (!info) return;

    nodes.forEach(function (node) {
      var active = node.getAttribute("data-state") === stateId;
      node.classList.toggle("is-active", active);
      node.setAttribute("aria-pressed", active ? "true" : "false");
    });

    edges.forEach(function (edge) {
      var from = edge.getAttribute("data-from");
      var to = edge.getAttribute("data-to");
      var connected = from === stateId || to === stateId;
      edge.classList.toggle("is-highlighted", connected);

      if (connected) {
        var isAbort = edge.classList.contains("sm-edge-abort");
        edge.setAttribute(
          "marker-end",
          isAbort ? "url(#sm-arrow-abort)" : "url(#sm-arrow-accent)"
        );
      } else {
        edge.setAttribute("marker-end", "url(#sm-arrow-default)");
      }
    });

    edgeLabels.forEach(function (label) {
      var pair = (label.getAttribute("data-edge-label") || "").split(":");
      var connected = pair[0] === stateId || pair[1] === stateId;
      label.classList.toggle("is-highlighted", connected);
    });

    if (titleEl) titleEl.textContent = info.title;
    if (pillEl) {
      pillEl.textContent = info.pill;
      pillEl.setAttribute("data-sm-kind", info.kind);
    }
    if (summaryEl) summaryEl.textContent = info.summary;
    if (happensEl) happensEl.textContent = info.happens;
    if (writesEl) writesEl.textContent = info.writes;
    if (failureEl) failureEl.textContent = info.failure;

    if (invariantsEl) {
      invariantsEl.textContent = "";
      info.invariants.forEach(function (inv) {
        var chip = document.createElement("span");
        chip.className = "sm-inv-chip";
        chip.textContent = inv;
        invariantsEl.appendChild(chip);
      });
    }
  }

  nodes.forEach(function (node) {
    var stateId = node.getAttribute("data-state");
    node.addEventListener("click", function () {
      selectState(stateId);
    });
    node.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        selectState(stateId);
      }
    });
  });

  selectState("preflight");
})();
