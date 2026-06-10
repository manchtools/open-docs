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

## The listing

The section's `index.md` renders its own prose first, then the
generated post list: cover, localized date, reading time, author,
description, and tags. Reading time is the post's word count at 200
words per minute, rounded, minimum one minute.

## Authors are pages

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

## Hero & avatar blocks

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

Every blog section serves an Atom feed at `/<section>/feed.xml`
(per language too: `/de/blog/feed.xml`). Set `PUBLIC_SITE_URL` so
entries carry absolute links. Blog pages advertise the feed with a
`<link rel="alternate">`, and the blog index's `h1` carries a
copy-feed-URL button next to the usual copy-page-link button.

{% callout type="info" title="Multiple blogs per site" %}
`blog: true` is per-section: a docs site can carry a blog, a changelog,
and an advisories feed at the same time, each independent.
{% /callout %}
