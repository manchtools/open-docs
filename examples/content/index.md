---
title: Welcome
---

# Welcome to open-docs

You're seeing this page because no `/content` mount was provided to
the container, so open-docs fell back to the bundled example.

## Bring your own content

Drop your markdown files into a directory and mount it at `/content`:

```sh
docker run --rm -p 3000:3000 \
  -v ./my-docs:/content:ro \
  -e PUBLIC_BRAND_NAME="My Project" \
  ghcr.io/manchtools/open-docs:latest
```

## File layout

```
my-docs/
  index.md                  # landing page (or introduction.md)
  theme.css                 # optional custom styling
  01-get-started/
    01-install.md
    02-quickstart.md
  reference/
    api.md
```

The sidebar is built entirely from this folder tree — no nav file to
maintain. Top-level files become top-of-sidebar entries; subdirectories
become sidebar groups; filenames are kebab-cased into path segments.

Control order without an external file: prefix a file or folder with
`01-`, `02-` (stripped from the URL and title), or set `title:`,
`label:`, and `order:` in a page's frontmatter.

## Custom theme

Drop a `theme.css` next to your markdown to restyle the site — override
the CSS design tokens (`--primary`, `--background`, `--radius`, …) or
target classes directly. It loads after the defaults so your rules win.

## Tokens in markdown

Any environment variable starting with `PUBLIC_TOKEN_` is exposed to
markdown as a `{{NAME}}` placeholder. Set
`PUBLIC_TOKEN_API_URL=https://api.example.com` and reference it in
prose as `{{API_URL}}`.

## Next steps

See the [open-docs README](https://github.com/manchtools/open-docs)
for the full configuration reference.
