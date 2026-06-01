---
title: Ordering & titles
---

# Ordering & titles

Plain alphabetical order rarely matches reading order — "Advanced"
should not come before "Install". open-docs gives you two ways to take
control, both derived from the content itself. No external nav file is
involved.

## Number prefixes

Prefix a file or folder with `NN-` (also `NN_` or `NN.`). The number
sets sort position and is **stripped** from the URL and the title.

```
content/
  01-get-started/
    01-install.md       → /get-started/install   (sorts 1st)
    02-configure.md     → /get-started/configure  (sorts 2nd)
  02-reference/         → group "Reference" (sorts after "Get started")
```

So `01-get-started/02-install.md` produces the URL
`/get-started/install`, the title "Install", and sorts second within a
group that itself sorts first. Prefixes work on folders too, which is
how you order the **groups**.

## Frontmatter

For finer control, set keys in a page's frontmatter. Frontmatter wins
over the filename.

```markdown
---
title: Installing the command-line tool
label: Install
order: 2
---
```

| Key | Effect |
|---|---|
| `title` | Full title (sidebar + prev/next). |
| `label` | Short sidebar label when the title is long. Alias `sidebar_label`. |
| `order` | Sort position; overrides a number prefix. |

## Mixing the two

A common, tidy pattern: use number prefixes on **folders** to order the
groups, and let files sort by their own prefixes — reaching for
frontmatter `label` only when a title is too long for the sidebar.

{% callout type="success" title="This site does exactly that" %}
Every group you see in the sidebar is a `NN-`prefixed folder, and the
"Authoring → Overview" entry is an `index.md` with `label: Overview`.
{% /callout %}
