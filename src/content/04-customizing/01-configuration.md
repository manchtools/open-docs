---
title: Configuration
---

# Configuration

All configuration is done with **environment variables**, read at build
time and baked into the site. Set them on the `docker run` command, in
a `.env` file, or in your shell. None of this requires editing source.

## Site chrome

| Variable | Default | Effect |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Brand text in the top bar. |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Small subtitle next to the brand. Empty hides it. |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Logo path under `static/`. |
| `PUBLIC_SITE_TITLE` | `open-docs` | Browser tab title and `og:title`. |
| `PUBLIC_SITE_DESCRIPTION` | _generic blurb_ | Meta + `og:description`. |
| `PUBLIC_REPO_URL` | _(empty)_ | If set, shows a GitHub link in the nav and footer. |
| `PUBLIC_THEME_COLOR` | `#6366F1` | `<meta name="theme-color">`. |

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -e PUBLIC_BRAND_NAME="Acme" \
  -e PUBLIC_BRAND_TAGLINE="handbook" \
  -e PUBLIC_SITE_TITLE="Acme Handbook" \
  -e PUBLIC_REPO_URL="https://github.com/acme/handbook" \
  ghcr.io/manchtools/open-docs:latest
```

For the full list, including deploy-time variables, see
[Environment variables](/reference/environment-variables).

## Static assets

Favicons, social-card images, and screenshots live under `static/`:

{% filetree %}
- static/
  - favicon.svg — used as the default logo
  - favicon-16.png
  - favicon-32.png
  - apple-touch-icon.png
  - og.png — social-card image
  - screenshots/
    - dashboard.png
{% /filetree %}

Only `favicon.svg` is required; the PNG fallbacks and `og.png` are
optional and skipped if absent. In Docker, mount your `static/`
directory at `/static`. It is **merged** into the image's defaults
rather than replacing them, so overriding one file leaves the rest in
place.

## Theming and tokens

- To restyle the site, add a `theme.css`. See
  [Theming](/customizing/theming).
- To inject build-time values into prose, use content tokens. See
  [Content tokens](/customizing/content-tokens).
