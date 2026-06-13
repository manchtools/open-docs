---
title: Environment variables
label: Environment
---

# Environment variables

Every variable is read at runtime when the container starts (only
`BASE_PATH` is compiled in). In Docker, set them with `-e` on
`docker run`; from source, set them in your shell or a `.env` file.

## Site chrome

<!-- docref: begin src=src/lib/server/site.ts#siteConfig:c0130420 -->
| Variable | Default | Effect |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Brand text in the top bar. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Subtitle next to the brand. Empty hides it. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Logo path under `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Browser title and `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _generic blurb_ | Default meta and `og:description`. |
| `PUBLIC_SITE_URL` | _(empty)_ | Full base URL, e.g. `https://docs.example.com`. **Set it on every production deploy:** enables canonical URLs, `sitemap.xml`, `robots.txt`, `llms.txt`, and absolute links in the blog **Atom feeds**; left empty, all of those stay relative and the server warns at start. See [SEO & AI search](/customizing/seo). |
| `PUBLIC_REPO_URL` | _(empty)_ | Shows a GitHub link in nav + footer when set. |
<!-- docref: end -->

The mobile browser `theme-color` (the chrome tint) isn't set here. It
follows your `--primary` token automatically, in both light and dark
mode. See [Theming](/customizing/theming).

## Default language

<!-- docref: begin src=src/lib/server/store-instance.ts#@default-lang:f15bbd57 -->
| Variable | Default | Effect |
|---|---|---|
| `PUBLIC_DEFAULT_LANG` | `en` | Default language for unprefixed URLs. See [Multi-language](/authoring/multi-language). |
<!-- docref: end -->

## Content tokens

<!-- docref: begin src=scripts/tokens.js#buildTokenMap:27895886 -->
| Variable | Effect |
|---|---|
| `PUBLIC_TOKEN_<NAME>` | Exposes `{{<NAME>}}` as a placeholder in prose, substituted when the content is parsed at start. See [Content tokens](/customizing/content-tokens). |
<!-- docref: end -->

## Deployment

<!-- docref: begin src=svelte.config.js#@base-path:7d3ca0de -->
| Variable | Default | Effect |
|---|---|---|
| `BASE_PATH` | _(empty)_ | Sub-path deploy prefix, e.g. `/docs`. The one build-time setting — changing it rebuilds the app shell at start. |
<!-- docref: end -->

<!-- docref: begin src=scripts/docker-entrypoint.sh#@port:c28baa83 -->
| Variable | Default | Effect |
|---|---|---|
| `PORT` | `3000` | Port the server listens on (container). |
<!-- docref: end -->

## Container mounts

These only apply to the Docker image and point the entrypoint at
alternate source directories. Most users never change them.

<!-- docref: begin src=src/lib/server/store-instance.ts#contentDir:9be957b8 -->
| Variable | Default | Effect |
|---|---|---|
| `OPEN_DOCS_CONTENT` | `/content` | Directory copied into `src/content/`. |
<!-- docref: end -->

<!-- docref: begin src=src/lib/server/store-instance.ts#@static-dir:14dedbae -->
| Variable | Default | Effect |
|---|---|---|
| `OPEN_DOCS_STATIC` | `/static` | Directory merged into `static/`. |
<!-- docref: end -->

{% callout type="info" title="PUBLIC_ is not a secret prefix" %}
`PUBLIC_*` values are delivered to the browser and visible to
anyone viewing the site. Never put secrets in them.
{% /callout %}
