---
label: Overview
icon: "✍️"
---

# Authoring

open-docs renders standard Markdown, plus a few extras layered on top
via [Markdoc](https://markdoc.dev/): callouts, tabs, screenshots,
syntax-highlighted code, and Mermaid diagrams.

You never have to use the extras. A plain `.md` file with headings,
lists, links, and code fences renders on its own. Reach for
the custom blocks when prose alone is not enough.

## In this section

{% cards %}
{% card title="Markdown & frontmatter" href="/authoring/markdown-and-frontmatter" icon="📝" %}
The basics, and the frontmatter keys that control the sidebar.
{% /card %}
{% card title="Existing markdown" href="/authoring/bring-existing-markdown" icon="📦" %}
GitHub/VSCode conventions hold: relative links, README.md, footnotes.
{% /card %}
{% card title="Blocks" href="/authoring/blocks" icon="🧱" %}
The content blocks: callouts, tabs, steps, cards, and more.
{% /card %}
{% card title="Blogging" href="/authoring/blogging" icon="📰" %}
Dated posts, listings, authors, tags, and feeds, per section.
{% /card %}
{% card title="Multi-language" href="/authoring/multi-language" icon="🌐" %}
Translate pages with a filename suffix; the default language stays unprefixed.
{% /card %}
{% /cards %}

{% callout type="info" title="This page is also a live demo" %}
The **Blocks** entry in the sidebar is a collapsible sub-section, and
**Media** nested inside it goes one level deeper, so the navigation
you see here exercises open-docs's
[folder-derived nesting](/navigation/folder-derived-nav#nesting), up to
three levels, with the branch for the page you're on opened
automatically.
{% /callout %}
