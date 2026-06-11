---
title: Ordering & titles
---

# Ordering & titles

Alphabetical order rarely matches reading order: "Advanced" would come
before "Install". open-docs gives you two ways to set the order, both
derived from the content itself. No external nav file is involved.

## Number prefixes

<!-- docref: begin src=src/lib/slug.ts#stripPrefix:b2742e12,src/lib/slug.ts#cleanSlug:9c51ef45,src/lib/slug.ts#titleFromSegment:d11d1ecd -->
Prefix a file or folder with `NN-` (also `NN_` or `NN.`). The number
sets sort position and is **stripped** from the URL and the title.
<!-- docref: end -->

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

Sections marked `blog: true` are the exception: their posts sort by
`date`, newest first, and are paged with Newer/Older links. See
[Blogging](/authoring/blogging).

## Frontmatter

<!-- docref: begin src=src/lib/server/content-store.ts#orderOf:1c460e59,src/lib/server/content-store.ts#metaTitle:0ac7aeab -->
For finer control, set keys in a page's frontmatter. Frontmatter wins
over the filename.
<!-- docref: end -->

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
| `meta` | `true` keeps the page out of the sidebar and prev/next and lists it in the footer instead, for a legal/imprint page some regions require. |

## Mixing the two

A common pattern: use number prefixes on **folders** to order the
groups, and let files sort by their own prefixes. Reach for frontmatter
`label` only when a title is too long for the sidebar.

{% callout type="success" title="This site does exactly that" %}
Every group you see in the sidebar is a `NN-`prefixed folder, and each
group **heading is the link to that section's `index.md`**. Click
"Authoring" to land on its overview page.
{% /callout %}
