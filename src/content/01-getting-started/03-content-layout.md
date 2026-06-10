---
title: Content layout
---

# Content layout

Everything the site shows comes from one directory of Markdown. In
Docker that directory is whatever you mount at `/content`; from source
it is `src/content/`. The rest (routes, sidebar, search) is derived
from it.

## A typical tree

{% filetree %}
- content/
  - theme.css — optional custom styling
  - 01-getting-started/
    - 01-introduction.md
    - 02-quick-start.md
  - 02-reference/
    - index.md — the section's landing page
    - api.md
{% /filetree %}

This produces:

- A **sidebar** with two groups, "Getting started" and "Reference".
- Routes at `/getting-started/introduction`, `/getting-started/quick-start`,
  `/reference` (the section index), and `/reference/api`.
- A **search index** covering every page.

## The rules

- **Files become pages.** `reference/api.md` →  `/reference/api`.
- **First-level folders become sidebar groups.** Files inside them
  become that group's items.
- **Filenames become URLs**, kebab-cased: `quick-start.md` →
  `/…/quick-start`.
- **A folder's `index.md`** is that section's landing page, served at
  the folder's URL (`reference/index.md` → `/reference`). A `README.md`
  works the same way when there is no `index.md`.
- **Leading number prefixes** like `01-` set order and are stripped
  from the URL and title. See
  [Ordering & titles](/navigation/ordering-and-titles).

{% callout type="info" title="The landing page" %}
The site's home page (`/`) is a generated hero that lists your sections
as cards; it is not a Markdown file. Put your first real page inside a
group, as this site does with
[Introduction](/getting-started/introduction).
{% /callout %}

## What is ignored

Only `.md` and `.markdoc` files under the content directory become
pages. A `theme.css` is picked up for [styling](/customizing/theming).
Non-markdown files that your pages reference (images and the like) are
served from the content folder; unreferenced working files (drafts,
notes, `.txt` files) stay invisible, so you can keep them alongside
your docs.

Images can live right next to your markdown and be linked the way your
editor expects (`![diagram](./images/arch.png)`); they are served from
the content folder. See
[Existing markdown](/authoring/bring-existing-markdown). The `static/`
directory remains for shared assets like favicons.
