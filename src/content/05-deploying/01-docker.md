---
title: Deploying with Docker
label: Docker
---

# Deploying with Docker

The recommended way to run open-docs is the published container. One
generic image serves any docset — you provide the content at run time.

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -v ./static:/static:ro \
  -e PUBLIC_BRAND_NAME="My Project" \
  -e PUBLIC_SITE_TITLE="My Project Docs" \
  -e PUBLIC_REPO_URL="https://github.com/me/my-project" \
  ghcr.io/manchtools/open-docs:latest
```

Visit `http://localhost:3000`.

## Mounts

| Mount | Maps to | Holds |
|---|---|---|
| `/content` | `src/content/` | Your `.md` / `.markdoc` files and optional `theme.css`. |
| `/static` | `static/` | Favicons, `og.png`, screenshots. Merged over the defaults. |

Both mounts are optional. The content mount can be read-only (`:ro`);
the entrypoint copies it into the image tree before building.

{% callout type="info" title="Run with nothing mounted" %}
With no `/content` mount, the image serves the open-docs documentation
itself — a live demo you can click through before adding your own
content.
{% /callout %}

## How a build happens

The image defers the site build to **container start**, so the same
published image works for any content:

```mermaid
flowchart LR
  A[Container starts] --> B[Copy /content and /static in]
  B --> C[bun run build]
  C --> D[Pagefind indexes the pages]
  D --> E[Serve on :3000]
```

The cost is a short build at startup; the benefit is one generic,
tiny published image instead of a per-docset image.

## Sub-path deploys

To host under a sub-path (for example `https://example.com/docs`), set
`BASE_PATH`:

```sh
-e BASE_PATH=/docs
```

All internal links, assets, and the search index are generated against
that prefix.

## Environment

Every `PUBLIC_*` variable is baked into the build. See
[Configuration](/customizing/configuration) for site chrome and
[Environment variables](/reference/environment-variables) for the
complete list.
