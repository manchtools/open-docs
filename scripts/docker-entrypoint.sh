#!/bin/sh
# Container entrypoint.
#
# The image ships with the default documentation ALREADY BUILT at
# image-build time (see the Dockerfile's `RUN bun run build`). So a plain
# `docker run` — no mounts, no env overrides — serves that pre-built site
# immediately, with almost no memory: the heavy bundling (Vite, just under
# 2 GB at peak) already happened on the build host, not here.
#
# We only (re)build at container start when the operator actually
# customizes the site:
#   /content   → src/content   (your .md / .markdoc + optional theme.css)
#   /static    → static/       (merged; favicons, og.png, screenshots, …)
#   PUBLIC_* / BASE_PATH env    (compiled into the build)
#
# To avoid a runtime build on a low-memory host, bake your content into a
# custom image instead — see the Dockerfile header. Mount paths are
# overridable via OPEN_DOCS_CONTENT / OPEN_DOCS_STATIC.

set -eu

CONTENT_SRC="${OPEN_DOCS_CONTENT:-/content}"
STATIC_SRC="${OPEN_DOCS_STATIC:-/static}"

need_build=0
reason=""
mark() {
    reason="${reason:+$reason, }$1"
    need_build=1
}

if [ -d "$CONTENT_SRC" ] && [ -n "$(ls -A "$CONTENT_SRC" 2>/dev/null || true)" ]; then
    echo "[open-docs] copying content from $CONTENT_SRC → src/content"
    rm -rf /app/src/content
    mkdir -p /app/src/content
    cp -r "$CONTENT_SRC/." /app/src/content/
    mark "mounted content"
fi

if [ -d "$STATIC_SRC" ] && [ -n "$(ls -A "$STATIC_SRC" 2>/dev/null || true)" ]; then
    echo "[open-docs] merging static assets from $STATIC_SRC → static/"
    mkdir -p /app/static
    cp -r "$STATIC_SRC/." /app/static/
    mark "mounted static"
fi

# PUBLIC_* and BASE_PATH are compiled into the build, so changing them from
# the baked-in defaults requires a rebuild.
if env | grep -qE '^(PUBLIC_|BASE_PATH=)'; then
    mark "custom env"
fi

# Safety net: build if the pre-built site is somehow absent.
if [ ! -f /app/build/index.js ]; then
    mark "no pre-built site"
fi

if [ "$need_build" -eq 1 ]; then
    # An empty src/content makes Vite's import.meta.glob match nothing and
    # fails the build; plant a stub so the operator sees a "drop your
    # markdown here" page instead of an error.
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
    echo "[open-docs] building site ($reason)…"
    bun run build
else
    echo "[open-docs] serving the pre-built default documentation (no rebuild needed)"
fi

echo "[open-docs] starting server on port ${PORT:-3000}"
exec bun /app/build/index.js
