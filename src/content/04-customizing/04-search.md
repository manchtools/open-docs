---
title: Search
---

# Search

Every open-docs site ships with **full-text search**, powered by
[Pagefind](https://pagefind.app). The index is built from your pages at
deploy time and served as static files — there's no search server, and it
keeps working offline. Open it from the box in the top bar, or with
**⌘K / Ctrl&nbsp;K**.

## What gets indexed

Only the **body of each page** is indexed. The chrome around it is left
out on purpose, so it doesn't pollute results:

- the sidebar, top bar, and footer;
- the **prev / next** links (they just repeat the neighbouring pages'
  titles);
- the on-page table of contents;
- the "Rendering diagram…" placeholder for Mermaid blocks.

## How results are ranked

open-docs tunes Pagefind for documentation out of the box — there's
nothing to configure:

- **Headings outrank body text.** A term in a page title or heading
  counts far more than the same word buried in a paragraph, so the most
  relevant page surfaces first (titles weigh most, then `##`, then `###`).
- **Exact matches win.** Matches closer to what you typed are favoured
  over fuzzy or partial ones — documentation searches are usually precise.
- **Long pages aren't penalised.** A thorough page won't lose to a stub
  that happens to mention the term once.

If you fork open-docs, these knobs live in
`src/lib/components/search.svelte`.

## Pushing a passage higher

When the heading weights aren't enough — a key definition sits in the
middle of a long page, say — wrap it in a `{% boost %}` block to weight it
more heavily in the index. It renders unchanged; it only affects search.

```markdown
{% boost weight=8 %}
The container builds the site at start, so one image serves any docset.
{% /boost %}
```

See the [Markdoc tags reference](/reference/markdoc-tags) for the weight
scale.
