# open-docs

> **Writing docs with an AI agent?** Point it at
> [`AGENTS.md`](AGENTS.md) — a self-contained spec of the content model,
> every Markdoc tag, and the gotchas, so it can author correct pages
> without reading this README or the source.

A reusable, container-shippable documentation site. Drop your markdown
(or [Markdoc](https://markdoc.dev/)) files into a directory, point the
container at it, and you have a searchable, dark-mode-friendly,
syntax-highlighted docs site.

Built with SvelteKit 2 + Svelte 5, Tailwind CSS 4,
[shadcn-svelte](https://shadcn-svelte.com), Markdoc, Shiki, and
[Pagefind](https://pagefind.app) for static search.

## Documentation

open-docs ships its own documentation as content. Run the container
with **nothing mounted** (or `make dev`) and the site you get *is* the
full docs — a live, clickable demo. The source for those pages lives in
[`src/content/`](./src/content/); mount your own `/content` to replace
them.

## Quick start

### Docker (recommended)

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  -v ./static:/static:ro \
  -e PUBLIC_BRAND_NAME="My Project" \
  -e PUBLIC_SITE_TITLE="My Project Docs" \
  -e PUBLIC_REPO_URL=https://github.com/me/my-project \
  ghcr.io/manchtools/open-docs:latest
```

Visit `http://localhost:3000`. The container builds the site at start
with your content baked in, then serves it.

### From source

```sh
bun install
PUBLIC_BRAND_NAME="My Project" bun run dev
```

Drop your `.md` / `.markdoc` files into `src/content/`. The dev server
hot-reloads on save.

## Content layout

The sidebar is derived **entirely from the folder structure** — there
is no nav config file to maintain.

```
src/content/
  introduction.md              ← landing page (also: index.md)
  01-get-started/
    01-install.md
    02-quickstart.md
  02-reference/
    api.md
    cli.md
  theme.css                    ← optional, custom styling (see Theming)
```

- Top-level files become top-of-sidebar entries.
- First-level subdirectories become sidebar groups; the files inside
  them become that group's items.
- Subfolders nest as collapsible sub-sections, up to three levels deep;
  anything deeper flattens into the third level.
- Filenames are kebab-cased and become path segments
  (`get-started/install.md` → `/get-started/install`).

### Ordering & titles

By default items sort alphabetically and titles come from the filename.
Two override mechanisms — both still derived from the content, no
external nav file:

1. **Numeric prefixes.** A leading `01-`, `02_`, `03.` on a file *or*
   directory sets its sort position and is stripped from the URL and
   the title. `01-get-started/02-install.md` →
   group "Get started" (sorts 1st), item "Install" (sorts 2nd),
   URL `/get-started/install`.

2. **Frontmatter** (wins over the filename):

   ```markdown
   ---
   title: Installing the CLI   # full page heading / browser title
   label: Install              # short sidebar label (alias: sidebar_label)
   order: 2                    # sort position within its group
   ---
   ```

Mix freely — e.g. order the directories with `NN-` prefixes and set a
shorter `label:` per page in frontmatter.

## Configuration

All configuration is environment variables — read at build time, baked
into the bundle. Set them on the `docker run` command, in a `.env`
file, or in your shell.

### Site chrome

| Variable | Default | Effect |
|---|---|---|
| `PUBLIC_BRAND_NAME` | `open-docs` | Top-nav brand text |
| `PUBLIC_BRAND_TAGLINE` | `docs` | Subtitle next to the brand |
| `PUBLIC_LOGO_SRC` | `/favicon.svg` | Path under `static/` |
| `PUBLIC_SITE_TITLE` | `open-docs` | `<title>` + `og:title` |
| `PUBLIC_SITE_DESCRIPTION` | _generic blurb_ | Meta description |
| `PUBLIC_REPO_URL` | _(empty)_ | If set, shows GitHub link in nav + footer |
| `PUBLIC_THEME_COLOR` | `#6366F1` | `<meta name="theme-color">` |
| `BASE_PATH` | _(empty)_ | Sub-path deploy, e.g. `/docs` |

### Content tokens

Any env var starting with `PUBLIC_TOKEN_` is exposed to markdown as a
`{{NAME}}` placeholder. For example, `PUBLIC_TOKEN_API_URL=https://api.example.com`
makes `{{API_URL}}` resolve to that value at build time.

```markdown
Send requests to {{API_URL}}/v1/widgets.
```

This is pure string substitution, applied during preprocessing — no
AST work, so it can't break Markdoc syntax as long as the substituted
value doesn't contain Markdoc-significant characters.

## Static assets

Drop favicons, OpenGraph images, and screenshots into `static/`:

```
static/
  favicon.svg          ← required
  favicon-16.png
  favicon-32.png
  apple-touch-icon.png
  og.png               ← social-card image
  screenshots/...
```

In Docker, mount your `static/` directory at `/static`. It's merged
into the image's `static/` rather than replacing it, so the defaults
keep working if you only override a subset.

## Theming

Drop a **`theme.css`** into your content root (the same directory you
mount at `/content`) and open-docs loads it automatically — after its
own stylesheet, so your rules always win. No fork, no rebuild of the
image.

```
my-docs/
  index.md
  theme.css        ← your overrides
  get-started/...
```

Two layers are overridable:

- **Design tokens** — the shadcn CSS custom properties (`--primary`,
  `--background`, `--sidebar`, `--radius`, `--font-sans`, …). Change a
  few and the whole site re-themes coherently in both light and dark
  mode. This is the recommended path.
- **Component classes** — target any class the site renders
  (`.prose`, the sidebar links, the top nav) for structural tweaks the
  tokens don't reach.

Copy [`theme.example.css`](./theme.example.css) to `theme.css` as a
starting point. It's plain CSS — light/dark is handled by the `.dark`
class that [mode-watcher](https://github.com/svecosystem/mode-watcher)
toggles on `<html>` (the theme toggle lives in the top nav).

In Docker, the file rides along with your content mount; nothing extra
to configure:

```sh
docker run --rm -p 3000:3000 \
  -v ./content:/content:ro \
  ghcr.io/manchtools/open-docs:latest
# where ./content/theme.css holds your overrides
```

## Building locally

```sh
make install    # bun install
make dev        # vite dev (hot reload)
make check      # svelte-check type check
make build      # production build → ./build/
make preview    # bun serve ./build/
make docker     # docker build -t open-docs:dev .
```

## License

[MIT](./LICENSE)
