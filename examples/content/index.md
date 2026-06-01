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
  get-started/
    install.md
    quickstart.md
  reference/
    api.md
  nav.json                  # optional sidebar ordering
```

Top-level files become top-of-sidebar entries. Subdirectories become
sidebar groups. Filenames are kebab-cased and become path segments.

## Tokens in markdown

Any environment variable starting with `PUBLIC_TOKEN_` is exposed to
markdown as a `{{NAME}}` placeholder. Set
`PUBLIC_TOKEN_API_URL=https://api.example.com` and reference it in
prose as `{{API_URL}}`.

## Next steps

See the [open-docs README](https://github.com/manchtools/open-docs)
for the full configuration reference.
