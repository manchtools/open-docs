---
title: Blogging
description: Turn any section into a blog with blog: true. Dated posts, a generated listing, authors, tags, and an Atom feed, alongside your docs.
---

# Blogging

Any section can be a blog. Set `blog: true` on the section's `index.md`
and its pages become **posts**: sorted newest-first by date, listed
automatically on the section page, with Newer/Older navigation, tag
pages, and an Atom feed. Docs and blogs live side by side in one
content tree; the [changelog](/changelog) on this site is one.

```markdown
---
blog: true        # in blog/index.md
---
```

## Posts

<!-- docref: begin src=src/lib/server/content-store.ts#@post-frontmatter-contract:bf9c57f0 -->
A post is a normal Markdown page with a date:

```markdown
---
title: The launch post
date: 2026-06-01
author: /blog/authors/ada
tags: release, open-source
description: How we launched, and what comes next.
---
```

| Key | Required | Effect |
|---|---|---|
| `date` | yes | `YYYY-MM-DD`. Sort key and displayed date (localized). A missing or malformed date fails validation at startup. |
| `author` | no | A display name, or a site-absolute path to an [author page](#authors-are-pages). |
| `tags` | no | Comma-separated. Shown as chips and collected into `/<section>/tags/<tag>` pages. |
| `cover` | no | Image under `static/`. Renders as a full-width hero on the post, a thumbnail in the listing, and the post's social-card image. Posts that start with a `{% hero %}` block don't need it; the hero's image is used. |
| `draft` | no | `true` serves the post in dev only; production excludes it everywhere. |

Filenames are free-form (`launch-post.md` → `/blog/launch-post`); the
date lives only in frontmatter. Posts use their own Newer/Older
navigation and never mix into the docs prev/next chain.
<!-- docref: end -->

## The listing

<!-- docref: begin src=src/lib/server/content-store.ts#@post-frontmatter-contract:bf9c57f0 -->
The section's `index.md` renders its own prose first, then the
generated post list: cover, localized date, reading time, author,
description, and tags. Reading time is the post's word count at 200
words per minute, rounded, minimum one minute.
<!-- docref: end -->

## Authors are pages

<!-- docref: begin src=src/lib/server/content-store.ts#@post-frontmatter-contract:bf9c57f0 -->
Put authors in an `authors/` folder inside the blog section. Pages there
are profile pages, not posts (no date needed, never listed):

```markdown
---
title: Ada Lovelace        # blog/authors/ada.md
avatar: authors/ada.png    # under static/
---

Builds manchtools.
```

A post's `author: /blog/authors/ada` takes the name from that page's
`title`, the image from `avatar:`, and links the byline to the page. A
path that doesn't resolve fails validation. A plain
`author: Ada Lovelace` works too: no page, no avatar, zero setup.

The same reference works in the `{% avatar %}` block, so an author is
stated once and reused everywhere:

```markdown
{% avatar author="/blog/authors/ada" /%}
```

Name, image, bio (the page's first paragraph), and the link all come
from the author page; any attribute you set explicitly wins. In short:
`author:` frontmatter is *metadata* (listing, byline, feed), the
`{% avatar %}` block is the *visual card*, and both can point at the
same page.
<!-- docref: end -->

## Hero & avatar blocks

<!-- docref: begin src=src/lib/markdoc/components/Avatar.svelte#@props:2d0e6d15 -->
Two blocks made for blogs, usable anywhere:

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="Big news" subtitle="Optional" /%}
{% avatar src="/authors/ada.png" name="Ada Lovelace" description="Builds manchtools." /%}
```

Live, with the bundled demo images:

{% hero src="/screenshots/open-docs-home.png" alt="Demo cover" title="Big news" subtitle="The avatar below overlaps by half" /%}
{% avatar src="/screenshots/open-docs-home-dark.png" name="Ada Lovelace" description="Builds manchtools." /%}

Placed directly after a hero, the avatar's image **overlaps the hero**
by half its height, the classic cover-photo header. Both
render normally on their own. A post with `cover:` gets the hero
automatically.
<!-- docref: end -->

## Quote & gallery

```markdown
{% quote by="Ada Lovelace" cite="https://example.com" %}
The engine weaves algebraic patterns.
{% /quote %}

{% gallery %}
![first](/screenshots/a.png)
![second](/screenshots/b.png)
{% /gallery %}
```

Gallery images arrange in a responsive grid and enlarge in the lightbox
like every image.

## Feeds

<!-- docref: begin src=src/lib/server/feed.ts#buildAtomFeed:2ed9f5ab -->
Every blog section serves an Atom feed at `/<section>/feed.xml`
(per language too: `/de/blog/feed.xml`). Each entry carries the
**full article** in `<content type="html">` next to the short `<summary>`,
so dev.to/Forem, Medium, and feed readers import the whole post rather
than a one-line stub.

The body is rendered from the same Markdoc source the page uses, through a
separate **feed profile** rather than scraped from the page HTML. Headings
are plain text, the copy-link icons and `data-pagefind` weights are gone,
and the outer layout wrapper is dropped. Blocks that need JavaScript fall
back to static markup: galleries become plain figures, a hero, avatar, or
screenshot becomes a plain `<img>`, and a mermaid diagram becomes its
source in a code block.

Set `PUBLIC_SITE_URL` so every feed and entry `id`, the `rel="self"` link,
and each entry link is **absolute**, body images included; language
prefixes and `BASE_PATH` are handled. dev.to reads an entry's link as its
`canonical_url`, and many readers reject relative ids. Without
`PUBLIC_SITE_URL` the feed still serves, but its links stay relative and
the server logs a warning at startup.

Blog pages advertise the feed with a `<link rel="alternate">`, and the
blog index's `h1` carries a copy-feed-URL button next to the usual
copy-page-link button.
<!-- docref: end -->

{% callout type="info" title="Multiple blogs per site" %}
`blog: true` is per-section: a docs site can carry a blog, a changelog,
and an advisories feed at the same time, each independent.
{% /callout %}
