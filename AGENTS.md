# open-docs — authoring guide for AI agents

You are about to write or edit documentation for a site built with
**open-docs**. Read this file instead of the README or the source — it
contains everything needed to produce correct content. Copy this file
into the repo that holds your `content/` directory so future agents have
it too.

open-docs is a generic, container-shipped docs site: you bring a folder
of Markdown (or Markdoc) files, it derives the navigation, search,
theming, and chrome. **You author content files. You do not configure a
framework, edit routes, or touch build config.**

---

## TL;DR — the rules you'll otherwise get wrong

- **Nav is the folder tree.** No nav file exists or should be created.
  Order comes from `NN-` filename prefixes and frontmatter, nothing else.
- **`/` is a generated hero, not a file.** Don't expect a root
  `index.md` to render at `/`. Lead each section with a real page.
- **Headings are auto-anchored.** Ids, the table of contents, and the
  hover copy-link are added for you. **Never** add manual ids, `{% #id %}`,
  or HTML `<a name>` anchors. Write exactly one `#` H1 per page.
- **Keep an inline span on one line.** Don't let `**bold**`, `_em_`,
  `[text](url)`, or `` `code` `` straddle a source line break — the
  Markdoc parser rejects markers split across a newline.
- **Validation runs at startup.** A dead internal link, an unknown
  tag/attribute, or a missing screenshot file *fails* the boot with a
  file:line listing (and shows in `bun run dev`). There is no silent
  fallback — if it serves, the links and tags are valid.
- **Only invent nothing.** Use the tags listed below verbatim. A tag's
  attributes are the props of the component behind it; unknown attributes
  fail validation.

---

## Files, folders, routes

Content lives in `src/content/` (from source) or whatever is mounted at
`/content` (Docker). Routes, sidebar, and search are derived from it.

- **Files become pages.** `reference/api.md` → `/reference/api`.
- **First-level folders become sidebar groups.** Files inside are that
  group's items. Nest up to **3 levels** deep; groups are collapsible.
- **Filenames become URLs, kebab-cased**, with the `NN-` prefix stripped:
  `01-quick-start.md` → `/…/quick-start`.
- **`index.md` is a section's landing page**, served at the folder URL
  (`reference/index.md` → `/reference`).
- **Only `.md` / `.markdoc` files become pages.** Anything else (drafts,
  `.txt`, notes) is ignored, so working files can sit alongside docs.

### Ordering & titles

Prefix files/folders with `NN-` (`NN_` / `NN.` also work) to set order;
the number is stripped from URL and title. Frontmatter overrides the
filename:

```markdown
---
title: Installing the command-line tool   # full title (sidebar + prev/next + search weight)
label: Install                             # short sidebar label (alias: sidebar_label)
order: 2                                    # overrides the NN- prefix
description: Install the CLI on macOS…     # meta description + llms.txt (else first paragraph)
icon: "🚀"                                  # section index.md only: hero-card icon (emoji, inline <svg>, or /static path)
---
```

Common pattern: `NN-` prefixes on **folders** to order groups, files sort
by their own prefixes, reach for `label` only when a title is too long for
the sidebar.

**Meta pages.** A page with `meta: true` in its frontmatter is kept out of
the sidebar and prev/next and listed in the **footer** instead — for legal
pages such as an imprint or privacy policy that some regions require.

### Translations (multi-language)

Translate a page by adding a language suffix to its filename, after any
`NN-` prefix and before the extension: `01-intro-de.md` is the German
`01-intro.md`. Use ISO 639-1 codes (`de`, `fr`, `ja`, …). Rules:

- The **default language is unprefixed** (`/intro`); other languages get a
  `/<lang>` prefix (`/de/intro`). The default is `en`, overridable with
  `PUBLIC_DEFAULT_LANG`.
- The set of pages is the **default language's** files. A page you don't
  translate **falls back** to the default content at the same slug, so
  every page exists in every language.
- Keep a translation's slug identical to the original (only the language
  suffix differs) so they pair up. Translate the frontmatter `title` /
  `description` too. Internal links inside a translated page should point
  at the same-language URLs (`/de/…`) — and anchor fragments must use the
  TRANSLATED heading's slug (a German "## Abschnitts-Icons" anchors as
  `#abschnitts-icons`, not the English `#section-icons`).

### Blog sections

A section whose `index.md` sets `blog: true` is a blog: its pages are
POSTS and require `date: YYYY-MM-DD` in frontmatter (startup validation
fails otherwise). Posts sort newest-first by date; `NN-` prefixes don't
order them. Optional post keys: `author` (display name or site-absolute
path to a page in the section's `authors/` folder; those are profile
pages, not posts), `tags` (comma-separated), `cover` (image under
`static/`, becomes hero + social image), `draft: true` (dev only). The
section index gets a generated listing; don't hand-write one. Blocks
made for posts (usable anywhere): `{% hero %}`, `{% avatar %}` (overlaps
a directly preceding hero by half its image), `{% quote %}`,
`{% gallery %}`.

### Links

Internal links are **absolute site paths** with no `.md` and no `NN-`
prefix: `[Quick start](/getting-started/quick-start)`. The base path
(`BASE_PATH`) is applied automatically; never hardcode it. Relative
editor-style links (`./other.md#section`, `../intro.md`) also resolve,
for markdown brought from elsewhere — prefer absolute paths when
writing new content.

---

## Markdown

Standard CommonMark + GitHub tables and task lists. On top of that:

- **Headings (`##`+)** get anchor ids, feed the TOC, and show a copy-link
  on hover — automatically.
- **Links** to external URLs open in a new tab with safe `rel`.
- **Code fences** are syntax-highlighted (Shiki) with a copy button.
- **Images:** `![alt](…)` renders through the screenshot frame (plain
  variant) whether the src is relative to the file, under `static/`, or
  a web URL; files next to the markdown are served in place. Use
  `{% screenshot %}` (below) for the framed look, captions, or dark
  variants.
- **Footnotes:** `[^1]` works (GFM style). **Task lists** render as
  checkboxes. **HTML comments** are stripped; **inline HTML is never
  rendered**; **bare URLs stay plain text** (links are explicit).

When an example needs to *show* a Markdoc tag or a code fence literally,
put it inside a code fence. If the example itself contains a ```` ``` ````
fence, wrap it in a **four-backtick** fence so the inner fence survives.

---

## Blocks (Markdoc tags)

Use these exactly. Block tags wrap content with `{% tag %}…{% /tag %}`;
self-closing tags end `/%}`.

### callout — admonition
```markdown
{% callout type="info" title="Optional title" %}
Body Markdown.
{% /callout %}
```
`type`: `info` (default), `warn`, `danger`, `success`.

### tabs / tab
````markdown
{% tabs labels="macOS, Linux" initial="macOS" %}
  {% tab label="macOS" %} … {% /tab %}
  {% tab label="Linux" %} … {% /tab %}
{% /tabs %}
````
`tabs labels` lists every tab in order (**required**); `initial` is
optional. Each `tab label` must match a name in `labels`.

### steps / step — numbered procedure
````markdown
{% steps %}
  {% step title="Install" %} … {% /step %}
  {% step title="Run" %} … {% /step %}
{% /steps %}
````
`title` optional; numbering is automatic.

### cards / card — overview grid (great on a section `index.md`)
````markdown
{% cards %}
  {% card title="Theming" href="/customizing/theming" icon="🎨" %}
  Restyle everything with your own theme.css.
  {% /card %}
{% /cards %}
````
`card`: `title`, optional `href` (internal path or external URL), optional
`icon` (emoji, inline `<svg>`, or a `/static` path).

### accordions / accordion — collapsible Q&A
````markdown
{% accordions %}
  {% accordion title="Does it need a server?" %} No. {% /accordion %}
{% /accordions %}
````
`accordions exclusive` (default `true`) opens one at a time; `false` allows
several. `accordion` also works standalone.

### badge — inline pill
```markdown
{% badge variant="warning" %}Beta{% /badge %}
```
`variant`: `default`, `info`, `success`, `warning`, `danger`.

### filetree — directory tree from a nested list
```markdown
{% filetree %}
- src/
  - app.ts
{% /filetree %}
```
Folders vs files are auto-detected.

### embed — responsive video
```markdown
{% embed src="https://youtu.be/ID" title="Demo" /%}
```
YouTube/Vimeo URLs are normalised; the CSP allow-list is derived for you.

### screenshot
```markdown
{% screenshot src="ui.png" alt="The UI" caption="…" dark="ui-dark.png" variant="frame" width="720px" /%}
```
`src` (under `static/screenshots/`) and `alt` required; `caption`, `dark`,
`variant` (`frame`|`flat`), `width` optional. The `frame` window controls
match the reader's own OS (macOS / Windows / Linux) automatically.

### code — add a filename header to a fence
Markdoc drops the fence's `info` string, so a filename rides on a wrapper:
````markdown
{% code title="app.ts" %}
```ts
const x = 1;
```
{% /code %}
````

### columns / column — side-by-side layout
````markdown
{% columns %}
  {% column %} … {% /column %}
  {% column %} … {% /column %}
{% /columns %}
````
Lays cells side by side on wider screens (**at most three across**) and
stacks them to one column on mobile. Put any blocks inside a `{% column %}`
(callouts, images, prose).

### grid — responsive grid
````markdown
{% grid cols=3 %}
  {% column %} … {% /column %}
  {% column span=2 %} a wider cell {% /column %}
{% /grid %}
````
`cols` sets the column count on wider screens (1–3, default 2); cells stack
to one column on mobile. A `column` can set `span` (a number) to cover
several columns. Same `{% column %}` cell as `{% columns %}`.

### boost — push a passage in search (rare)
```markdown
{% boost weight=8 %}
A key definition you want to rank above ordinary prose.
{% /boost %}
```
Renders unchanged; only weights the passage in the index. Body is weight
`1`, headings are `10`/`5`/`3`; `weight` defaults to `5`. Use only when the
heading weights aren't enough.

### Code enhancements (plain fences, no tag)
- ```` ```mermaid ```` fences render as themed diagrams.
- Line notations as trailing comments:
  `// [!code highlight]`, `// [!code ++]` (added, green with a `+` gutter),
  `// [!code --]` (removed, red with a `-` gutter).
- Images and Mermaid diagrams enlarge in a lightbox when clicked — no
  markup needed.

---

## Search

Full-text search (Pagefind) is indexed automatically at start and needs no setup.
Page bodies are indexed; chrome (sidebar, prev/next, TOC) is excluded.
Headings outrank body text, so a descriptive H1 and clear `##` headings
are the main lever. Reach for `{% boost %}` only as a last resort.

---

## Theming & config (operator-facing — you rarely touch these)

- **Theming:** a `theme.css` dropped next to the content overrides the CSS
  design tokens (colors, fonts, radius). No source edits.
- **Branding by env var** (read at runtime — no rebuild): `PUBLIC_BRAND_NAME`,
  `PUBLIC_BRAND_TAGLINE`, `PUBLIC_LOGO_SRC`, `PUBLIC_SITE_TITLE`,
  `PUBLIC_SITE_DESCRIPTION`, `PUBLIC_REPO_URL`, plus `BASE_PATH` and
  `PORT`. `PUBLIC_*` is **not** secret — it's compiled into the client
  bundle. (The mobile `theme-color` follows the `--primary` token, so
  there's no env flag for it.)
- **Content tokens:** `PUBLIC_TOKEN_<NAME>` exposes `{{<NAME>}}` as a
  build-time placeholder you can drop into prose.
- **SEO & AI search:** every page gets its own `<title>`, meta
  description (frontmatter `description`, else its first paragraph),
  canonical, and Open Graph tags. The site also generates `/sitemap.xml`,
  `/robots.txt`, and a `/llms.txt` index for AI crawlers. Set
  `PUBLIC_SITE_URL` (the full base URL) to enable absolute/canonical
  links.

---

## Best practices

- **Lead every group with a real page**; use a section `index.md` as a
  landing page with a `{% cards %}` overview when the group is large.
- **One concept per page.** The H1 is the page title and the strongest
  search signal — make it descriptive, not cute.
- **Match the block to the job:** procedures → `{% steps %}`; overviews →
  `{% cards %}`; asides/warnings → `{% callout %}`; FAQs → `{% accordions %}`;
  trees → `{% filetree %}`; long identifiers/filenames → inline `` `code` ``.
- **Generate reference material, don't hand-write it.** Tables that mirror
  code (config flags, CLI options, API fields) drift the moment the code
  changes. Produce that Markdown from your source of truth in your pipeline
  and drop the file in — open-docs renders Markdown; it does not introspect
  your code.
- **Validate before shipping:** start the site (`bun run dev`, or boot
  the container) — it fails on broken links, unknown tags, bad
  attributes, and missing screenshot files, listing every error with
  file and line. If it serves, the content is structurally sound.

### Don't

- Don't create or edit a nav/sidebar file — there isn't one.
- Don't add manual heading ids or anchors.
- Don't put real content in a root `index.md` expecting it at `/`.
- Don't hardcode the base path in links.
- Don't invent tags or attributes; stick to the list above.

## Keeping docs anchored to code (docref)

Parts of this site's docs are pinned to the code with
[docref](https://github.com/manchtools/open-docref): every Markdoc component's
prop table is a claim against that component's `@props` region, and a few
behavioural notes are claims against `src/lib/**`. If you change anchored code —
a component's props, `content-store`, `i18n`, `nav`, the markdoc/server
internals — keep the docs honest in the same change. Run the docref tool (a
released `docref`, or the sibling build at
`../open-docref/packages/cli/dist/docref.js`):

1. `docref affected --since <merge-base> --json` — the docs your change endangers.
2. For each affected doc:
   - **snippets** — `docref refresh <doc>` (mechanical, always safe).
   - **claims** — read the prose; if your change made it untrue, fix it, then
     `docref approve <doc>`. Never approve without reading.
3. `docref check` must be green.

<!-- docref: begin src=open-docref:packages/core/src/ops.ts#exitCode:926bfd35 -->
`docref check` exits `1` when a reference is stale and `2` when one is broken,
so leaving drift unaddressed turns the gate red.
<!-- docref: end -->

### Anchors

A reference names a symbol directly (`file.ts#name`) or a marked region.
Component props and a few code spans carry `docref: begin <name>` / `end`
markers, pointed at with `file#@name`.

<!-- docref: begin src=open-docref:packages/core/src/ops.ts#findUnusedAnchors:9e39e6cb,open-docref:packages/core/src/ops.ts#exitCode:926bfd35 -->
A marker that no doc references is reported as an **unused anchor** and fails
`docref check` (unless `[anchors] allow-unused = true`): reference it from a
doc, or delete the marker pair. `docref anchors` lists every marker and its
references.
<!-- docref: end -->
