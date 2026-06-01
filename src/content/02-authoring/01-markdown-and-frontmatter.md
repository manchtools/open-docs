---
title: Markdown & frontmatter
label: Markdown
---

# Markdown & frontmatter

Write pages in plain Markdown. Standard elements all work:

- **Headings** (`#` … `######`) — each gets an anchor id and feeds the
  on-page table of contents on the right.
- **Lists**, ordered and unordered, with nesting.
- **Links** — internal (`/getting-started/quick-start`) and external.
  External links automatically open in a new tab with safe `rel`
  attributes.
- **Emphasis**, `inline code`, blockquotes, tables, and horizontal
  rules.

## Headings and the table of contents

The first `#` heading is the page title shown at the top of the
content. `##` and `###` headings populate the table of contents in the
right rail and become linkable anchors, so you can deep-link to a
section.

## Frontmatter

An optional YAML block at the very top of a file controls how the page
appears in the **sidebar**:

```markdown
---
title: Installing the CLI
label: Install
order: 2
---

# Installing the CLI
```

| Key | Effect |
|---|---|
| `title` | Full title used for the sidebar and prev/next links. |
| `label` | Shorter sidebar label, when the title is long. Alias: `sidebar_label`. |
| `order` | Sort position within the group. Overrides any filename number prefix. |

A section's `index.md` understands one more key, `icon`, which sets
that section's icon on the home-page card — see
[Section icons](/navigation/folder-derived-nav#section-icons).

Frontmatter is optional — without it, the title is derived from the
filename and pages sort alphabetically (or by their number prefix). See
[Ordering & titles](/navigation/ordering-and-titles) for the full
ordering model.

{% callout type="warn" title="Keep frontmatter scalar" %}
Only simple `key: value` lines are read for navigation. Nested or list
YAML values are ignored for sidebar purposes.
{% /callout %}
