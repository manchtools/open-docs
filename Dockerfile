# open-docs container — bring-your-own-content docs server.
#
# Two stages:
#   1. `deps`   — installs node_modules once; cached unless package.json
#                 or bun.lock changes.
#   2. runtime  — copies the source tree + node_modules, then defers
#                 the actual `bun run build` step to container start so
#                 the user's mounted content/static assets are baked in.
#
# Usage:
#   docker run --rm -p 3000:3000 \
#     -v ./content:/content:ro \
#     -v ./static:/static:ro \
#     -e PUBLIC_BRAND_NAME="My Project" \
#     -e PUBLIC_SITE_TITLE="My Project Docs" \
#     -e PUBLIC_REPO_URL=https://github.com/me/my-project \
#     ghcr.io/manchtools/open-docs:latest
#
# `/content` → src/content (your .md / .markdoc files + optional
#                          nav.json). Read-only mount is fine; the
#                          entrypoint copies it into the image tree.
# `/static`  → static/      (favicons, og.png, screenshots, etc.).
#
# Environment variables (all PUBLIC_* are baked into the build):
#   PUBLIC_BRAND_NAME           Sidebar / top-nav brand text
#   PUBLIC_BRAND_TAGLINE        Subtitle next to the brand
#   PUBLIC_LOGO_SRC             /favicon.svg by default
#   PUBLIC_SITE_TITLE           <title> + og:title
#   PUBLIC_SITE_DESCRIPTION     meta description + og:description
#   PUBLIC_REPO_URL             If set, shows a GitHub link in the nav
#   PUBLIC_THEME_COLOR          Hex; populates <meta name="theme-color">
#   PUBLIC_TOKEN_*              Any token usable as `{{NAME}}` in .md.
#                               PUBLIC_TOKEN_WEB_UI_URL → `{{WEB_UI_URL}}`
#   BASE_PATH                   Sub-path deploy, e.g. `/docs`
#
# Build at image-publish time (not container-start):
#   docker build -t my-docs --build-arg BAKE_CONTENT=1 \
#     -v ./content:/build-content ...
# (left as future work; the current default is build-at-start, which
#  keeps the image generic and the published artifact tiny.)

FROM oven/bun:alpine AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --no-frozen-lockfile

FROM oven/bun:alpine
WORKDIR /app

# Source tree + the already-installed node_modules. Anything under
# /app/src/content and /app/static gets overwritten by the entrypoint
# at container start with whatever the operator mounted in.
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Default no-op content so a `docker run` with no mounts still boots
# and prints a useful "drop your markdown here" page.
RUN mkdir -p /content && \
    if [ ! -f /app/examples/content/welcome.md ]; then \
      echo "# open-docs\n\nMount your markdown at /content to begin." \
        > /content/welcome.md; \
    else \
      cp -r /app/examples/content/. /content/; \
    fi

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
