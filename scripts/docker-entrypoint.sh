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
# docref: begin port
PORT="${PORT:-3000}"
# docref: end port

if [ -d "$CONTENT_SRC" ] && [ -n "$(ls -A "$CONTENT_SRC" 2>/dev/null || true)" ]; then
    echo "[open-docs] serving content from $CONTENT_SRC"
    export OPEN_DOCS_CONTENT="$CONTENT_SRC"
elif grep -qs " $CONTENT_SRC " /proc/self/mounts; then
    # Something IS mounted there but it's empty — almost always a host
    # path typo: `docker run -v ./pathh:/content` silently creates the
    # missing host directory as empty. Say so, loudly.
    echo "[open-docs] WARNING: $CONTENT_SRC is mounted but EMPTY."
    echo "[open-docs]   If you used -v <hostpath>:$CONTENT_SRC, check that <hostpath> exists —"
    echo "[open-docs]   Docker creates missing host paths as empty directories."
    echo "[open-docs]   Serving the bundled open-docs documentation instead."
    unset OPEN_DOCS_CONTENT || true
else
    echo "[open-docs] serving the bundled open-docs documentation (mount your Markdown at $CONTENT_SRC to serve your own)"
    unset OPEN_DOCS_CONTENT || true
fi

# BASE_PATH is compiled into the shell; a sub-path deploy still needs a
# shell rebuild. Everything else is runtime. This MUST run before the
# static merge below — the rebuild regenerates build/client and would
# wipe merged operator assets.
if [ -n "${BASE_PATH:-}" ]; then
    echo "[open-docs] BASE_PATH=$BASE_PATH requires a shell rebuild (~1.5 GB)…"
    (cd /app && bun run build)
fi

if [ -d "$STATIC_SRC" ] && [ -n "$(ls -A "$STATIC_SRC" 2>/dev/null || true)" ]; then
    echo "[open-docs] merging static assets from $STATIC_SRC → build/client/"
    cp -r "$STATIC_SRC/." /app/build/client/
    # Evict stale precompressed variants of every overridden file. The
    # image build precompressed the BUNDLED statics (favicon.svg.br/.gz,
    # …); the adapter prefers those for any client that sends
    # Accept-Encoding — i.e. every browser — so a stale sibling would
    # shadow the operator's override (plain curl shows the new file,
    # browsers silently get the old one).
    (cd "$STATIC_SRC" && find . -type f ! -name '*.br' ! -name '*.gz' -print) |
        while IFS= read -r f; do
            rm -f "/app/build/client/${f#./}.br" "/app/build/client/${f#./}.gz"
        done
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
