---
title: More blocks
---

# More blocks

## Accordion

Collapsible disclosure for FAQs and optional detail, with animation
and keyboard support. Wrap several in `{% accordions %}`
to make a group where opening one closes the others, like tabs. That is
the default; add `exclusive=false` to let several stay open at once.

{% accordions %}
{% accordion title="Does open-docs need a database?" %}
No. Pages render straight from your Markdown; there is nothing to install or manage.
{% /accordion %}
{% accordion title="Can I self-host it?" %}
Yes. Run the container anywhere, or build from source and run the
bundled server.
{% /accordion %}
{% accordion title="Does it support nested folders?" %}
Up to three levels deep. See
[folder-derived navigation](/navigation/folder-derived-nav).
{% /accordion %}
{% /accordions %}

```markdown
{% accordions %}
{% accordion title="Your question?" %}
The answer, in Markdown.
{% /accordion %}
{% accordion title="Another question?" %}
Opening this one closes the first.
{% /accordion %}
{% /accordions %}
```

## Badge

Small inline status pills for headings and list items.

- Stable feature
- Realtime sync {% badge variant="success" %}New{% /badge %}
- Webhooks {% badge variant="warning" %}Beta{% /badge %}
- XML export {% badge variant="danger" %}Deprecated{% /badge %}

```markdown
Webhooks {% badge variant="warning" %}Beta{% /badge %}
```

Variants: `default`, `info`, `success`, `warning`, `danger`.

## File tree

Render a directory tree from a nested list. Folders (items that
nest a list) and files are detected for you, with no special markup.

{% filetree %}
- content/
  - index.md
  - getting-started/
    - introduction.md
    - quick-start.md
  - theme.css
- static/
  - favicon.svg
{% /filetree %}

````markdown
{% filetree %}
- content/
  - index.md
  - getting-started/
    - quick-start.md
{% /filetree %}
````

## Embed

Drop in a video. YouTube and Vimeo links are normalised to their
privacy-friendly embed form automatically.

{% embed src="https://youtu.be/aqz-KE-bpKQ" title="Big Buck Bunny" /%}

```markdown
{% embed src="https://youtu.be/VIDEO_ID" title="A short clip" /%}
```

The CSP iframe allow-list is derived automatically from the
`{% embed %}` blocks in your content (including URLs supplied through a
`{{TOKEN}}`), so there is nothing to configure.

## Columns

Lay content out side by side. Columns are capped at three across and
stack on mobile: two fill 50/50, three fill in thirds, a fourth wraps.

{% columns %}
{% column %}
{% callout type="info" title="Left" %}First column of content.{% /callout %}
{% /column %}
{% column %}
{% callout type="success" title="Right" %}Second column.{% /callout %}
{% /column %}
{% /columns %}

````markdown
{% columns %}
  {% column %} … {% /column %}
  {% column %} … {% /column %}
{% /columns %}
````

## Grid

For layouts beyond a single column, a responsive grid. `cols` (1–3,
default 2) sets the column count on larger screens; cells stack on
mobile. A cell can span tracks with `{% column span=2 %}`.

{% grid cols=3 %}
{% column %}
{% callout type="info" title="a" %}One cell.{% /callout %}
{% /column %}
{% column span=2 %}
{% callout type="success" title="b — spans 2" %}A wider cell.{% /callout %}
{% /column %}
{% /grid %}

````markdown
{% grid cols=3 %}
  {% column %} … {% /column %}
  {% column span=2 %} a wider cell {% /column %}
{% /grid %}
````

## Task lists

Not a tag: plain GFM syntax renders as checkboxes.

```markdown
- [x] write the docs
- [ ] translate them
- [ ] ship the release
```

- [x] write the docs
- [ ] translate them
- [ ] ship the release
