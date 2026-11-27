#!/usr/bin/env sh
set -eu

ZOLA_VERSION="${ZOLA_VERSION:-0.23.6}"
ARCHIVE="zola-v${ZOLA_VERSION}-x86_64-unknown-linux-gnu.tar.gz"
URL="https://github.com/getzola/zola/releases/download/v${ZOLA_VERSION}/${ARCHIVE}"

if [ "$(uname -s)" = "Linux" ]; then
  curl -fsSL "$URL" -o "/tmp/${ARCHIVE}"
  tar -xzf "/tmp/${ARCHIVE}" -C /tmp
  /tmp/zola build
else
  zola build
fi

sh scripts/build-llms-full.sh public/llms-full.txt
