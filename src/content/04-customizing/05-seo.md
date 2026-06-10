---
title: SEO & AI search
description: How open-docs makes the generated site discoverable by search engines and readable by AI tools — per-page metadata, sitemap.xml, robots.txt, and llms.txt.
---

# SEO & AI search

Every page is rendered on the server, so search engines and AI
crawlers get the full content without running JavaScript. On top of that,
open-docs generates per-page metadata and the standard discovery files.

## Set your site URL

Set `PUBLIC_SITE_URL` to the full base URL where the docs are served, with
no trailing slash:

```sh
-e PUBLIC_SITE_URL="https://docs.example.com"
```

This is the one value the discovery files need. With it set, each page gets
an absolute canonical URL, `sitemap.xml` and `robots.txt` reference real
addresses, and `llms.txt` links resolve. If it is left empty, the site
still works and the files are still generated, but canonical and `og:url`
tags are omitted and the sitemap falls back to path-only links.

If the docs live under a sub-path (for example `https://example.com/docs`),
include that sub-path in `PUBLIC_SITE_URL`.

## Per-page metadata

Each page emits its own `<title>`, `<meta name="description">`, canonical
link, and Open Graph / Twitter card tags. The values come from the page's
frontmatter:

```markdown
---
title: Installing the CLI
description: Install the command-line tool on macOS, Linux, and Windows.
---
```

- **Title** is the page `title`. The browser tab and `og:title` show
  `<page title> · <brand name>`; the landing page uses the site title on
  its own.
- **Description** is the frontmatter `description`. If you omit it,
  open-docs falls back to the page's first paragraph, so every page has a
  usable description even without one written by hand.

`brandName`, the site title, and the default description come from the
[configuration](/customizing/configuration) environment variables.

## Blog posts and feeds

Posts in a [blog section](/authoring/blogging) carry extra metadata:
`article:published_time` and `article:author` tags from the post's
frontmatter, and the post's `cover` image as the social-card image. The
section's Atom feed is advertised on its pages via
`<link rel="alternate">`, so feed readers discover it automatically.

## sitemap.xml

`/sitemap.xml` lists the landing page and every content and legal page. It
is rebuilt from the same folder tree the navigation uses, so adding a
Markdown file adds it to the sitemap with no extra step.

## robots.txt

`/robots.txt` allows all crawlers and points them at the sitemap (when
`PUBLIC_SITE_URL` is set). Replace it by dropping your own `robots.txt`
into the site's static assets.

## llms.txt

`/llms.txt` is an [llms.txt](https://llmstxt.org) index for AI assistants
and crawlers: the site title, a one-line summary, then every page grouped
by section with its description and link. It gives a model the whole map of
your docs in one small, link-first file. Like the sitemap, it is generated
from your content, so it never drifts out of date.
