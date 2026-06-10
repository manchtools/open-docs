---
title: Bring existing markdown
label: Existing markdown
description: What works when you point open-docs at markdown written for GitHub or VSCode, and the deliberate limits.
---

# Bring existing markdown

A folder of markdown written for GitHub, VSCode, or another generator
renders without rewriting. The conventions those tools rely on hold:

<!-- docref: begin src=src/lib/server/markdown.ts sha=097d96d1 -->
- **Relative links.** `[setup](./guides/setup.md)`, `../intro.md`, and
  `other.md#section` resolve against the linking file, exactly as your
  editor follows them. The `.md` ending and any `01-` prefixes map
  through the normal URL rules. Site-absolute paths
  (`/guides/setup`) keep working unchanged.
- **`README.md` is the folder page.** When a folder has no `index.md`,
  its `README.md` takes that role.
- **Images next to your markdown.** `![diagram](./images/arch.png)`
  renders in place and the file is served from your content folder; no
  move to `static/` needed. Every markdown image, whether relative,
  absolute, or a web URL, displays through the screenshot frame in its
  plain variant.
- **Task lists.** `- [ ]` and `- [x]` render as checkboxes.
- **Footnotes.** `[^1]` references become numbered superscript links
  with the definitions listed at the end of the page.
- **Tables, strikethrough, code fences, blockquotes** work as standard
  markdown; fences get syntax highlighting and a copy button.

Everything else comes along automatically: navigation from the folder
tree, search, heading anchors and the table of contents, SEO files, and
dark mode.
<!-- docref: end -->

## Deliberate limits

Two things stay off by design, not by omission:

{% callout type="info" title="HTML is never rendered" %}
open-docs renders markdown, not HTML. Inline tags like `<details>` show
up as the text you typed. To display markup as an example, put it in a
code fence. There is no allow-list and no exception; this keeps the
strict security policy intact.
{% /callout %}

{% callout type="info" title="Bare URLs stay text" %}
`https://example.com` pasted as plain text is not turned into a link.
Making something clickable is the author's call: write
`[example](https://example.com)` or `<https://example.com>`.
{% /callout %}

<!-- docref: begin src=src/lib/server/markdown.ts#stripHtmlComments sha=41367d9c -->
Setext headings (underlined with `===` or `---`) don't receive anchor
ids; use `#` headings. HTML comments (`<!-- … -->`) are stripped so
review notes never reach readers.
<!-- docref: end -->
