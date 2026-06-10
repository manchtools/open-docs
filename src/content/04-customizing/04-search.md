---
title: Search
---

# Search

Every open-docs site ships with **full-text search**, powered by
[Pagefind](https://pagefind.app). The index is built from your pages
shortly after the server starts; pages serve immediately and search
comes online moments later. It is served as static files, so there is no
search server and it keeps working offline. Open it from the box in the top bar, or with
**⌘K / Ctrl&nbsp;K**.

## What gets indexed

Only the **body of each page** is indexed. The chrome around it is left
out so it does not pollute results:

- the sidebar, top bar, and footer;
- the **prev / next** links, which repeat the neighbouring pages'
  titles;
- the on-page table of contents;
- the "Rendering diagram…" placeholder for Mermaid blocks.

## How results are ranked

open-docs tunes Pagefind for documentation by default; there is
nothing to configure:

- **Headings outrank body text.** A term in a page title or heading
  counts more than the same word in a paragraph, so the most relevant
  page surfaces first (titles weigh most, then `##`, then `###`).
- **Exact matches are favoured.** Matches closer to what you typed rank
  above fuzzy or partial ones, since documentation searches are usually
  precise.
- **Long pages aren't penalised.** A thorough page does not lose to a
  stub that happens to mention the term once.

If you fork open-docs, these knobs live in
`src/lib/components/search.svelte`.

## Pushing a passage higher

When the heading weights aren't enough, for example a key definition
sitting in the middle of a long page, wrap it in a `{% boost %}` block to
weight it more heavily in the index. It renders unchanged and only
affects search.

```markdown
{% boost weight=8 %}
The container indexes your content at start, so one image serves any docset.
{% /boost %}
```

See the [Markdoc tags reference](/reference/markdoc-tags) for the weight
scale.
