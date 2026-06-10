---
title: Markdoc tags
label: Markdoc tags
---

# Markdoc tags

<!-- docref: begin src=src/lib/markdoc/tags.svelte sha=7c5c0d6c -->
A reference for the custom blocks layered on top of Markdown, plus the
enhanced Markdown elements. For usage with examples, see
[Authoring](/authoring).
<!-- docref: end -->

## Custom tags

### callout

<!-- docref: begin src=src/lib/markdoc/components/Callout.svelte#@props sha=04ebd609 -->
```markdown
{% callout type="info" title="Optional title" %}
Body Markdown.
{% /callout %}
```

| Attribute | Values | Default |
|---|---|---|
| `type` | `info`, `warn`, `danger`, `success` | `info` |
| `title` | string | _(none)_ |
<!-- docref: end -->

### tabs / tab

<!-- docref: begin src=src/lib/markdoc/components/Tabs.svelte#@props,src/lib/markdoc/components/Tab.svelte#@props sha=17c65a4f,0ce05808 -->
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
<!-- docref: end -->

### screenshot

<!-- docref: begin src=src/lib/markdoc/components/Screenshot.svelte#@props sha=f0667444 -->
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

Plain Markdown `![]()` images render through this component too, in the
`flat` variant.
<!-- docref: end -->

### steps / step

<!-- docref: begin src=src/lib/markdoc/components/Steps.svelte#@props,src/lib/markdoc/components/Step.svelte#@props sha=26850e43,ed2ce0a8 -->
````markdown
{% steps %}
  {% step title="First" %} … {% /step %}
  {% step title="Second" %} … {% /step %}
{% /steps %}
````

`step` takes an optional `title`. Numbering is automatic.
<!-- docref: end -->

### cards / card

<!-- docref: begin src=src/lib/markdoc/components/Cards.svelte#@props,src/lib/markdoc/components/Card.svelte#@props sha=26850e43,c82718eb -->
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
<!-- docref: end -->

### accordions / accordion

<!-- docref: begin src=src/lib/markdoc/components/AccordionGroup.svelte#@props,src/lib/markdoc/components/Accordion.svelte#@props sha=84cfb144,ed2ce0a8 -->
````markdown
{% accordions %}
  {% accordion title="Question?" %} answer {% /accordion %}
{% /accordions %}
````

| Tag | Attribute | Notes |
|---|---|---|
| `accordion` | `title` | The summary text. Native `<details>`. |
| `accordions` | `exclusive` | Group wrapper; `true` (default) opens one at a time, `false` allows several. Optional; `accordion` also works standalone. |
<!-- docref: end -->

### badge

<!-- docref: begin src=src/lib/markdoc/components/Badge.svelte#@props sha=69aebe45 -->
```markdown
{% badge variant="warning" %}Beta{% /badge %}
```

Inline pill. `variant`: `default`, `info`, `success`, `warning`, `danger`.
<!-- docref: end -->

### filetree

<!-- docref: begin src=src/lib/markdoc/components/FileTree.svelte#@props sha=26850e43 -->
```markdown
{% filetree %}
- folder/
  - file.md
{% /filetree %}
```

Styles a nested Markdown list as a directory tree (folders vs files are
auto-detected).
<!-- docref: end -->

### embed

<!-- docref: begin src=src/lib/markdoc/components/Embed.svelte#@props sha=36691986 -->
```markdown
{% embed src="https://youtu.be/ID" title="…" /%}
```

Responsive video iframe. YouTube/Vimeo URLs are normalised, and the CSP
iframe allow-list is derived from your embeds automatically.
<!-- docref: end -->

### code

<!-- docref: begin src=src/lib/markdoc/components/Code.svelte#@props sha=ed2ce0a8 -->
````markdown
{% code title="app.ts" %}
```ts
const x = 1;
```
{% /code %}
````

Adds a filename header to a fenced code block (Markdoc drops fence meta,
so the filename rides on this wrapper).
<!-- docref: end -->

### boost

<!-- docref: begin src=src/lib/markdoc/components/Boost.svelte#@props sha=b07730c2 -->
```markdown
{% boost weight=8 %}
This passage is pushed harder in the search index.
{% /boost %}
```

Invisible search-ranking hint. Renders the content unchanged but
weights it in Pagefind. Body text is weight `1` and headings are `10`/`5`/`3`,
so `weight` (default `5`) lifts a key passage above ordinary prose. Use it
only when the built-in heading weights aren't enough to surface something.
<!-- docref: end -->

### columns / column

<!-- docref: begin src=src/lib/markdoc/components/Columns.svelte#@props,src/lib/markdoc/components/Column.svelte#@props sha=26850e43,671be0b5 -->
Side-by-side columns that stack on mobile, capped at three across; a
fourth wraps to the next row. Two columns fill 50/50, three fill in thirds.

````markdown
{% columns %}
  {% column %} … {% /column %}
  {% column %} … {% /column %}
{% /columns %}
````
<!-- docref: end -->

### grid

<!-- docref: begin src=src/lib/markdoc/components/Grid.svelte#@props,src/lib/markdoc/components/Column.svelte#@props sha=7451a1f3,671be0b5 -->
A responsive grid for laying content out in shapes other than a single
top-to-bottom column. `cols` (1–3, default 2) sets the track count on
larger screens; cells stack to one column on mobile. A cell can span
tracks with `{% column span=2 %}`.

````markdown
{% grid cols=3 %}
  {% column %} … {% /column %}
  {% column span=2 %} a wider cell {% /column %}
{% /grid %}
````
<!-- docref: end -->

### hero

<!-- docref: begin src=src/lib/markdoc/components/Hero.svelte#@props sha=35a1e113 -->
A full-width image header with an optional title overlay. Pulls flush to
the top when it is the first block. A blog post's `cover:` frontmatter
renders one automatically.

```markdown
{% hero src="/screenshots/cover.png" alt="…" title="…" subtitle="…" /%}
```
<!-- docref: end -->

### avatar

<!-- docref: begin src=src/lib/markdoc/components/Avatar.svelte#@props sha=2d0e6d15 -->
An author card: round image, name, optional bio and link. Directly after
a `hero`, the image overlaps the hero's bottom edge by half its height.

```markdown
{% avatar src="/authors/ada.png" name="Ada" description="…" url="…" /%}
```
<!-- docref: end -->

### quote

<!-- docref: begin src=src/lib/markdoc/components/Quote.svelte#@props sha=df46ce79 -->
A pull-quote with an optional attribution (linked when `cite` is set).

```markdown
{% quote by="Ada Lovelace" cite="https://…" %}Body.{% /quote %}
```
<!-- docref: end -->

### gallery

<!-- docref: begin src=src/lib/markdoc/components/Gallery.svelte#@props sha=26850e43 -->
A responsive image grid; each image enlarges in the lightbox.

```markdown
{% gallery %}
![a](/img/a.png)
![b](/img/b.png)
{% /gallery %}
```
<!-- docref: end -->

## Enhanced Markdown

<!-- docref: begin src=src/lib/markdoc/nodes.svelte sha=52c58f22 -->
These need no special syntax. Plain Markdown gets the behavior
automatically:

| Element | Behavior |
|---|---|
| Headings | Get anchor ids and feed the table of contents; every `h1` has a copy-page-link button, and the copy buttons are faintly visible at rest, stronger on hover. |
| Links | External links open in a new tab with safe `rel` attributes. |
| Relative links (`./x.md`) | Resolved against the file, so editor-style links keep working. |
| Images (`![]()`) | Rendered via the screenshot component (flat variant); content-relative files are served, and the lightbox pages through them as a carousel. |
| Task lists (`- [ ]`) | Rendered as checkboxes. |
| Footnotes (`[^1]`) | Numbered superscript links with their definitions collected at the end of the page. |
| Code fences | Syntax-highlighted (Shiki) with a copy button; `// [!code highlight]` / `++` / `--` comments add line-highlighting and diffs. |
| `mermaid` fences | Rendered as themed diagrams. |

Inline HTML never renders, and bare URLs stay plain text.

{% callout type="info" title="Attributes mirror component props" %}
Each tag's attributes are the props of the Svelte component behind it,
so the two never drift apart. Adding a prop to a component makes it a
valid attribute automatically.
{% /callout %}
<!-- docref: end -->
