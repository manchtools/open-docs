#!/bin/sh
# Container entrypoint — 0.4.0 runtime content pipeline.
#
# Content is DATA now: the server parses the mounted Markdown at boot
# (seconds, ~200 MB) and renders pages at request time. There is no
# content build, so mounting different docs, rebranding via PUBLIC_*, or
# adding a theme.css needs no Vite run and works on small hosts.
#
#   /content   → read in place (OPEN_DOCS_CONTENT); bundled docs otherwise
#   /static    → merged into the served assets at start (plain file copy)
#   PUBLIC_*   → read at runtime by the server; no rebuild
#   BASE_PATH  → the ONE remaining build-time setting (SvelteKit's base
#                is compile-time); setting it rebuilds the app shell at
#                start, which needs ~1.5 GB — prefer baking an image.
#
# Search: a boot pass renders every page and writes the Pagefind index a
# few seconds after the server is up (scripts/index-search.ts).

set -eu

CONTENT_SRC="${OPEN_DOCS_CONTENT:-/content}"
STATIC_SRC="${OPEN_DOCS_STATIC:-/static}"
PORT="${PORT:-3000}"

if [ -d "$CONTENT_SRC" ] && [ -n "$(ls -A "$CONTENT_SRC" 2>/dev/null || true)" ]; then
    echo "[open-docs] serving content from $CONTENT_SRC"
    export OPEN_DOCS_CONTENT="$CONTENT_SRC"
else
    echo "[open-docs] no content mounted at $CONTENT_SRC — serving the bundled open-docs documentation"
    unset OPEN_DOCS_CONTENT || true
fi

if [ -d "$STATIC_SRC" ] && [ -n "$(ls -A "$STATIC_SRC" 2>/dev/null || true)" ]; then
    echo "[open-docs] merging static assets from $STATIC_SRC → build/client/"
    cp -r "$STATIC_SRC/." /app/build/client/
fi

# BASE_PATH is compiled into the shell; a sub-path deploy still needs a
# shell rebuild. Everything else is runtime.
if [ -n "${BASE_PATH:-}" ]; then
    echo "[open-docs] BASE_PATH=$BASE_PATH requires a shell rebuild (~1.5 GB)…"
    (cd /app && bun run build)
fi

cd /app
echo "[open-docs] starting server on port $PORT"
bun build/index.js &
SERVER_PID=$!

# Index search once the server answers; non-fatal if it fails (the search
# dialog then shows its "index not found" notice instead of results).
(
    bun scripts/index-search.ts "http://localhost:$PORT" || \
        echo "[open-docs] search indexing failed — continuing without search"
) &

trap 'kill $SERVER_PID 2>/dev/null || true' TERM INT
wait $SERVER_PID
