---
title: Environment variables
label: Environment
---

# Environment variables

Every variable is read at build time. In Docker, set them with `-e` on
`docker run`; from source, set them in your shell or a `.env` file.

## Site chrome

| Variable | Default | Effect |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Brand text in the top bar. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Subtitle next to the brand. Empty hides it. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Logo path under `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Browser title and `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _generic blurb_ | Meta and `og:description`. |
| `PUBLIC_REPO_URL` | _(empty)_ | Shows a GitHub link in nav + footer when set. |
| `PUBLIC_THEME_COLOR` | `#6366F1` | `<meta name="theme-color">`. |

## Content tokens

| Variable | Effect |
|---|---|
| `PUBLIC_TOKEN_<NAME>` | Exposes `{{<NAME>}}` as a build-time placeholder in prose. See [Content tokens](/customizing/content-tokens). |

## Deployment

| Variable | Default | Effect |
|---|---|---|
| `BASE_PATH` | _(empty)_ | Sub-path deploy prefix, e.g. `/docs`. |
| `PORT` | `3000` | Port the server listens on (container). |

## Container mounts

These only apply to the Docker image and point the entrypoint at
alternate source directories — most users never change them.

| Variable | Default | Effect |
|---|---|---|
| `OPEN_DOCS_CONTENT` | `/content` | Directory copied into `src/content/`. |
| `OPEN_DOCS_STATIC` | `/static` | Directory merged into `static/`. |

{% callout type="info" title="PUBLIC_ is not a secret prefix" %}
`PUBLIC_*` values are compiled into the client bundle and visible to
anyone viewing the site. Never put secrets in them.
{% /callout %}
