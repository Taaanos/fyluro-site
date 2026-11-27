#!/usr/bin/env sh
# Generates public/llms-full.txt from static/llms.txt and content/docs/*.md.
# Portable POSIX sh + awk so local macOS and Cloudflare Workers Linux builds match.
set -eu

OUT_FILE="${1:-public/llms-full.txt}"
DOCS_DIR="content/docs"
BASE_URL=$(awk -F'"' '/^base_url[[:space:]]*=/ { print $2; exit }' config.toml)
BASE_URL="${BASE_URL%/}"

mkdir -p "$(dirname "$OUT_FILE")"

emit_doc() {
  file="$1"
  slug="$2"

  title=$(awk -F'"' '
    /^\+\+\+$/ { fence++; next }
    fence == 1 && /^title[[:space:]]*=/ { print $2; exit }
  ' "$file")

  if [ -z "$slug" ]; then
    url="${BASE_URL}/docs/"
  else
    url="${BASE_URL}/docs/${slug}/"
  fi

  printf '\n---\n\n'
  printf '# %s\n\n' "$title"
  printf 'Source: %s\n\n' "$url"

  # Strip TOML front matter and image-only HTML blocks while preserving all Markdown.
  awk '
    /^\+\+\+$/ { fence++; next }
    fence < 2 { next }
    /^[[:space:]]*<img / { next }
    /^[[:space:]]*<\/?(details|summary|div|figure|figcaption)([[:space:]>]|$)/ { next }
    { print }
  ' "$file" | awk '
    # Collapse runs of more than one blank line.
    /^[[:space:]]*$/ {
      blank++
      if (blank == 1 && seen_content) print ""
      next
    }
    {
      blank = 0
      seen_content = 1
      print
    }
  '
}

{
  if [ -f static/llms.txt ]; then
    cat static/llms.txt
  fi

  if [ -f "${DOCS_DIR}/_index.md" ]; then
    emit_doc "${DOCS_DIR}/_index.md" ""
  fi

  # Collect non-index docs sorted by front-matter weight.
  for f in "${DOCS_DIR}"/*.md; do
    [ -f "$f" ] || continue
    base=$(basename "$f")
    [ "$base" = "_index.md" ] && continue
    weight=$(awk -F'=' '
      /^\+\+\+$/ { fence++; next }
      fence == 1 && /^weight[[:space:]]*=/ {
        gsub(/[[:space:]]/, "", $2)
        print $2
        exit
      }
    ' "$f")
    printf '%06d\t%s\n' "${weight:-999999}" "$f"
  done | sort -n | while IFS="$(printf '\t')" read -r _ filepath; do
    slug=$(basename "$filepath" .md)
    emit_doc "$filepath" "$slug"
  done
} > "$OUT_FILE"
