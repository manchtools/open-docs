---
title: Steps & cards
---

# Steps & cards

## Steps

Walk a reader through an ordered procedure. The numbers are generated
automatically, so you can reorder freely.

{% steps %}
{% step title="Install dependencies" %}
Grab everything with your package manager of choice.

```sh
bun install
```
{% /step %}
{% step title="Add a page" %}
Drop a Markdown file into your content folder. The route and sidebar
entry appear on their own.
{% /step %}
{% step title="Run it" %}
Start the dev server and open `http://localhost:3000`.
{% /step %}
{% /steps %}

````markdown
{% steps %}
{% step title="Install dependencies" %}
Body Markdown, including code blocks.
{% /step %}
{% step title="Run it" %} … {% /step %}
{% /steps %}
````

## Cards

Link tiles for overviews and landing pages. Each `card` takes an
optional `title`, `href`, and `icon` (an emoji, an inline `<svg>`, or a
path under `static/`).

{% cards %}
{% card title="Quick start" href="/getting-started/quick-start" icon="🚀" %}
Get a running site in under a minute.
{% /card %}
{% card title="Theming" href="/customizing/theming" icon="🎨" %}
Drop in a `theme.css` to restyle everything.
{% /card %}
{% card title="Markdoc" href="https://markdoc.dev" icon="🧩" %}
The tag system these blocks are built on.
{% /card %}
{% card title="Nesting" href="/navigation/folder-derived-nav" icon="🗂️" %}
Folders become collapsible sidebar sections.
{% /card %}
{% /cards %}

````markdown
{% cards %}
{% card title="Quick start" href="/getting-started/quick-start" icon="🚀" %}
Get a running site in under a minute.
{% /card %}
{% /cards %}
````
