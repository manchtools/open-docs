#!/bin/sh
# Container entrypoint. Copies the operator's mounted content +
# static assets into the source tree, runs the SvelteKit build, then
# starts the Bun server.
#
# Build at container start (not image build) so the same image can
# serve any docset — bring-your-own-content. The cost is ~30-60s
# startup; the alternative would be a per-docset image build, which
# defeats the point of a generic container.
#
# Mounts the entrypoint expects (all optional — sane defaults exist):
#   /content   → /app/src/content
#   /static    → /app/static    (merged; not overwritten if empty)
#
# Env vars consulted at build time are documented in the Dockerfile.

set -eu

CONTENT_SRC="${OPEN_DOCS_CONTENT:-/content}"
STATIC_SRC="${OPEN_DOCS_STATIC:-/static}"

if [ -d "$CONTENT_SRC" ] && [ -n "$(ls -A "$CONTENT_SRC" 2>/dev/null || true)" ]; then
    echo "[open-docs] copying content from $CONTENT_SRC → src/content"
    rm -rf /app/src/content
    mkdir -p /app/src/content
    cp -r "$CONTENT_SRC/." /app/src/content/
else
    echo "[open-docs] no content mounted at $CONTENT_SRC — serving the bundled open-docs documentation"
fi

if [ -d "$STATIC_SRC" ] && [ -n "$(ls -A "$STATIC_SRC" 2>/dev/null || true)" ]; then
    echo "[open-docs] merging static assets from $STATIC_SRC → static/"
    mkdir -p /app/static
    cp -r "$STATIC_SRC/." /app/static/
fi

# Empty src/content makes Vite's import.meta.glob match nothing,
# which fails the build with an unfriendly error. Plant a stub so the
# operator sees the "drop your markdown here" page instead.
if [ ! -d /app/src/content ] || [ -z "$(ls -A /app/src/content 2>/dev/null || true)" ]; then
    mkdir -p /app/src/content
    cat > /app/src/content/index.md <<'EOF'
---
title: Welcome
---

# Welcome to open-docs

Mount your markdown directory at `/content` to get started.

```
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  ghcr.io/manchtools/open-docs:latest
```
EOF
fi

cd /app
echo "[open-docs] building site"
bun run build

echo "[open-docs] starting server on port ${PORT:-3000}"
exec bun /app/build/index.js
