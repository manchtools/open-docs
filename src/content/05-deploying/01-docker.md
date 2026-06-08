---
title: Deploying with Docker
label: Docker
---

# Deploying with Docker

The recommended way to run open-docs is the published container. One
generic image serves any docset; you provide the content at run time.

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
itself, a live demo you can click through before adding your own
content.
{% /callout %}

## How a build happens

The image ships with the default documentation **already built**, so a
plain `docker run` (no mounts, no env overrides) serves it immediately and
uses almost no memory. It only rebuilds at container start when you
customize — mount content or static, or set `PUBLIC_*` / `BASE_PATH`:

```mermaid
flowchart LR
  A[Container starts] --> B{Customized?}
  B -- no --> S[Serve the pre-built site]
  B -- yes --> C[Copy /content + /static in]
  C --> D[bun run build]
  D --> E[Pagefind indexes the pages]
  E --> S
```

The build is the heavy step — it bundles Vite, Mermaid, and Shiki and peaks
around 2 GB of memory, regardless of how many pages you have. Running it
once at image-build keeps a plain `docker run` light.

To serve **custom** docs on a low-memory host, bake them into a small image
on your build machine instead of rebuilding at container start:

```dockerfile
FROM ghcr.io/manchtools/open-docs:latest
COPY ./content/ /app/src/content/
RUN bun run build
```

Run that image with no `/content` mount and it serves your pre-built site,
no build (and no 2 GB) at runtime.

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
