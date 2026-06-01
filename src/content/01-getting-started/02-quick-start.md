---
title: Quick start
---

# Quick start

Get a docs site running in under a minute.

{% tabs labels="Docker, From source" initial="Docker" %}
{% tab label="Docker" %}

Mount a directory of Markdown at `/content` and open the port:

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -e PUBLIC_BRAND_NAME="My Project" \
  -e PUBLIC_SITE_TITLE="My Project Docs" \
  ghcr.io/manchtools/open-docs:latest
```

Visit `http://localhost:3000`. The container builds the site at start
with your content baked in, then serves it. Run with **no** mount and
you get these docs as a live demo.

{% /tab %}
{% tab label="From source" %}

```sh
bun install
PUBLIC_BRAND_NAME="My Project" bun run dev
```

Drop your `.md` / `.markdoc` files into `src/content/`. The dev server
hot-reloads on save.

{% /tab %}
{% /tabs %}

{% callout type="info" title="No content? No problem." %}
With nothing mounted, the container serves the open-docs documentation
itself, so you can click around a real site before writing a single
page.
{% /callout %}

## The 30-second version

{% steps %}
{% step title="Add content" %}
Make a folder with a Markdown file or two.
{% /step %}
{% step title="Point open-docs at it" %}
Mount it at `/content` (Docker) or drop it in `src/content/` (from source).
{% /step %}
{% step title="Open the site" %}
The sidebar, search index, and routes are all generated for you.
{% /step %}
{% /steps %}

## Where to go next

{% cards %}
{% card title="Content layout" href="/getting-started/content-layout" icon="🗂️" %}
How files map to pages and the sidebar.
{% /card %}
{% card title="Authoring" href="/authoring" icon="✍️" %}
Markdown, callouts, tabs, code, and diagrams.
{% /card %}
{% card title="Deploying with Docker" href="/deploying/docker" icon="🐳" %}
Mounts, environment, and production notes.
{% /card %}
{% /cards %}
