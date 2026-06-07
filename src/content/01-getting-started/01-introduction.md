---
title: Introduction
---

# open-docs

{% boost weight=8 %}
**open-docs** is a container-shippable documentation site.
Drop your Markdown (or [Markdoc](https://markdoc.dev/)) files into a
directory, point a container at it, and you have a searchable,
dark-mode-friendly, syntax-highlighted docs site with no build step to
configure and no framework to learn.
{% /boost %}

The site you are reading right now *is* open-docs rendering its own
documentation. Everything here ships inside the default container
image, so a fresh `docker run` with no content mounted lands on these
pages.

## Why it exists

Most documentation generators are a dependency you add to a repository
and build yourself. open-docs is the opposite: a
**generic image you mount content into**. The same published image
serves any docset. You provide the Markdown; the image provides the
theme, rendering, and search.

That makes it a good fit when you want to:

- Stand up docs for a project without adding a toolchain to its repo.
- Run an internal handbook or knowledge base from a folder of Markdown.
- Keep content and presentation cleanly separated.

## What you get

- **Folder-derived navigation.** The sidebar is built from your
  directory tree, so there is no nav file to keep in sync. See
  [Navigation](/navigation/folder-derived-nav).
- **Full-text search**, prebuilt at deploy time with
  [Pagefind](https://pagefind.app) and tuned for docs. See
  [Search](/customizing/search).
- **Light / dark mode** with a toggle in the top bar.
- **Syntax highlighting** via [Shiki](https://shiki.style) and
  **diagrams** via [Mermaid](https://mermaid.js.org). See
  [Code & diagrams](/authoring/blocks/media/code-and-diagrams).
- **Theming** from a single `theme.css` you drop next to your
  content. See [Theming](/customizing/theming).
- **Rebranding by environment variable** (name, logo, colors, repo
  link) so one image serves many sites. See
  [Configuration](/customizing/configuration).
- **Content blocks** (callouts, tabs, screenshots) on top of
  plain Markdown. See [Callouts & tabs](/authoring/blocks/callouts-and-tabs).

## Next steps

Head to the [Quick start](/getting-started/quick-start) to get a site
running in under a minute, then read
[Content layout](/getting-started/content-layout) to learn how your
files become pages.
