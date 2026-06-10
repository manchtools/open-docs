---
title: Blog blocks
label: Blog blocks
description: Hero images, author avatars, pull-quotes, and image galleries — made for posts, usable on any page.
---

# Blog blocks

Four blocks that came with [blog mode](/authoring/blogging). They work
on any page; on posts some of them also appear automatically.

## Hero

A full-width image, optionally with a title overlay:

```markdown
{% hero src="/screenshots/open-docs-home.png" alt="The landing page" title="Big news" subtitle="Optional line below" /%}
```

{% hero src="/screenshots/open-docs-home.png" alt="The landing page" title="Big news" subtitle="Optional line below" /%}

As the first block on a page it pulls flush to the top. A post that
starts with a hero needs no `cover:` frontmatter — the listing and
social-card image are derived from it.

## Avatar

An author card. Directly after a hero, the image overlaps it by half —
the classic cover-photo header:

```markdown
{% hero src="/screenshots/open-docs-home.png" alt="Cover" /%}
{% avatar src="/screenshots/open-docs-home-dark.png" name="Paul Dotterer" description="Builds manchtools." /%}
```

{% hero src="/screenshots/open-docs-home.png" alt="Cover" /%}
{% avatar src="/screenshots/open-docs-home-dark.png" name="Paul Dotterer" description="Builds manchtools." /%}

Standalone it renders with normal spacing. On posts, the byline under
the title uses the same component, fed by the `author:` frontmatter.

## Quote

```markdown
{% quote by="Ada Lovelace" cite="https://en.wikipedia.org/wiki/Ada_Lovelace" %}
The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.
{% /quote %}
```

{% quote by="Ada Lovelace" cite="https://en.wikipedia.org/wiki/Ada_Lovelace" %}
The Analytical Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.
{% /quote %}

## Gallery

Plain Markdown images inside the tag arrange as a grid; each image
opens in the lightbox, where the arrow buttons (or ← / →) move through
every image on the page:

```markdown
{% gallery %}
![Light](/screenshots/open-docs-home.png)
![Dark](/screenshots/open-docs-home-dark.png)
![German](/screenshots/open-docs-home-de.png)
{% /gallery %}
```

{% gallery %}
![Light](/screenshots/open-docs-home.png)
![Dark](/screenshots/open-docs-home-dark.png)
![German](/screenshots/open-docs-home-de.png)
{% /gallery %}
