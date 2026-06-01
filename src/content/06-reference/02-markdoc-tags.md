---
title: Markdoc tags
label: Markdoc tags
---

# Markdoc tags

A reference for the custom blocks layered on top of Markdown, plus the
enhanced Markdown elements. For usage with examples, see
[Authoring](/authoring).

## Custom tags

### callout

```markdown
{% callout type="info" title="Optional title" %}
Body Markdown.
{% /callout %}
```

| Attribute | Values | Default |
|---|---|---|
| `type` | `info`, `warn`, `danger`, `success` | `info` |
| `title` | string | _(none)_ |

### tabs / tab

````markdown
{% tabs labels="One, Two" initial="One" %}
  {% tab label="One" %} … {% /tab %}
  {% tab label="Two" %} … {% /tab %}
{% /tabs %}
````

| Tag | Attribute | Notes |
|---|---|---|
| `tabs` | `labels` | Comma-separated list of every tab, in order. Required. |
| `tabs` | `initial` | Tab open on load. Defaults to the first. |
| `tab` | `label` | Must match a name in the parent's `labels`. Required. |

### screenshot

```markdown
{% screenshot src="ui.png" alt="The UI" caption="…" dark="ui-dark.png"
   variant="frame" width="720px" /%}
```

| Attribute | Required | Notes |
|---|---|---|
| `src` | yes | File under `static/screenshots/`. |
| `alt` | yes | Accessible description. |
| `caption` | no | Caption text. |
| `dark` | no | Alternate image for dark mode. |
| `variant` | no | `frame` (default) or `flat`. |
| `width` | no | Max width, e.g. `720px`. |

### steps / step

````markdown
{% steps %}
  {% step title="First" %} … {% /step %}
  {% step title="Second" %} … {% /step %}
{% /steps %}
````

`step` takes an optional `title`. Numbering is automatic.

### cards / card

````markdown
{% cards %}
  {% card title="…" href="/path" icon="🚀" %} description {% /card %}
{% /cards %}
````

| Tag | Attribute | Notes |
|---|---|---|
| `card` | `title` | Card heading. |
| `card` | `href` | Optional link (internal path or external URL). |
| `card` | `icon` | Emoji, inline `<svg>`, or a path under `static/`. |

### accordions / accordion

````markdown
{% accordions %}
  {% accordion title="Question?" %} answer {% /accordion %}
{% /accordions %}
````

| Tag | Attribute | Notes |
|---|---|---|
| `accordion` | `title` | The summary text. Native `<details>`. |
| `accordions` | `exclusive` | Group wrapper; `true` (default) opens one at a time, `false` allows several. Optional — `accordion` also works standalone. |

### badge

```markdown
{% badge variant="warning" %}Beta{% /badge %}
```

Inline pill. `variant`: `default`, `info`, `success`, `warning`, `danger`.

### filetree

```markdown
{% filetree %}
- folder/
  - file.md
{% /filetree %}
```

Styles a nested Markdown list as a directory tree (folders vs files are
auto-detected).

### embed

```markdown
{% embed src="https://youtu.be/ID" title="…" /%}
```

Responsive video iframe. YouTube/Vimeo URLs are normalised, and the CSP
iframe allow-list is derived from your embeds automatically.

### code

````markdown
{% code title="app.ts" %}
```ts
const x = 1;
```
{% /code %}
````

Adds a filename header to a fenced code block (Markdoc drops fence meta,
so the filename rides on this wrapper).

## Enhanced Markdown

These need no special syntax — plain Markdown gets the behavior
automatically:

| Element | Behavior |
|---|---|
| Headings (`##`+) | Get anchor ids, feed the table of contents, and show a copy-link icon on hover. |
| Links | External links open in a new tab with safe `rel` attributes. |
| Code fences | Syntax-highlighted (Shiki) with a copy button; `// [!code highlight]` / `++` / `--` comments add line-highlighting and diffs. |
| `mermaid` fences | Rendered as themed diagrams. |

{% callout type="info" title="Attributes mirror component props" %}
Each tag's attributes are the props of the Svelte component behind it,
so the two never drift apart. Adding a prop to a component makes it a
valid attribute automatically.
{% /callout %}
