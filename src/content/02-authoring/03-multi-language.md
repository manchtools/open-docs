---
title: Multi-language
description: Translate pages by adding a language suffix to the filename. The default language stays unprefixed; others get a /<lang> URL, with fallback to the default.
---

# Multi-language

Translate a page by adding a language suffix to its filename. The German
version of `01-introduction.md` is `01-introduction-de.md`. That is the
whole setup — the languages are discovered from the suffixes at build time,
so there is no language config file to maintain.

This page itself has a German version
([Inhaltsstruktur](/de/getting-started/content-layout) is one too), so the
language switcher in the top bar is live on this site.

## URLs

The **default language stays unprefixed** and every other language gets a
`/<lang>` prefix:

| File | URL |
|---|---|
| `getting-started/intro.md` | `/getting-started/intro` |
| `getting-started/intro-de.md` | `/de/getting-started/intro` |

So existing links keep working, and a single-language site has no prefixes
at all. The site stays single-language (and unprefixed) until the first
`-<lang>` file appears.

## Default language

The default language is `en`. Change it with `PUBLIC_DEFAULT_LANG`:

```sh
-e PUBLIC_DEFAULT_LANG="de"
```

The default language is the one suffix-less files belong to, and the one
served at the unprefixed URLs.

## Fallback

The set of pages is defined by the default language. A page that isn't
translated into a language falls back to the default content at the same
slug, so no language ever shows a broken link. You can translate as few or
as many pages as you like and fill in the rest over time.

## What you get

- A **language switcher** in the top bar (shown only when more than one
  language exists). It keeps you on the same page when you switch.
- A **localized sidebar and prev/next** — translated titles where a
  translation exists, default titles otherwise.
- **Localized interface chrome.** The labels open-docs ships — the "On
  this page" heading, prev/next, the search prompt, the footer — are
  translated into dozens of languages, falling back to English for any
  label a language hasn't covered.
- **Per-language search.** The search index is segmented by language, so
  searching from a `/de` page returns German results.
- **`hreflang` alternates** and a multi-language `sitemap.xml`, so search
  engines serve the right language. Set `PUBLIC_SITE_URL` for these — see
  [SEO & AI search](/customizing/seo).

## Example

```text
content/
  01-getting-started/
    01-intro.md         → /getting-started/intro      (default, e.g. en)
    01-intro-de.md      → /de/getting-started/intro    (German)
    02-install.md       → /getting-started/install     (en only; /de falls back)
```

The language suffix sits after any `NN-` order prefix and before the
extension. Use [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes)
codes (`de`, `fr`, `ja`, …); a two-letter ending that isn't a real code
(like `setup-ci.md`) is treated as an ordinary filename, not a language.

{% callout type="info" title="What stays in the default language" %}
Almost everything localizes: page content, navigation, and the interface
chrome. The exception is your **brand title and description** — they come
from `PUBLIC_SITE_TITLE` and `PUBLIC_SITE_DESCRIPTION`, which are the same
across every language.
{% /callout %}
