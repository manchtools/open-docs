# open-docs

A reusable, container-shippable documentation site. Drop your markdown
(or [Markdoc](https://markdoc.dev/)) files into a directory, point the
container at it, and you have a searchable, dark-mode-friendly,
syntax-highlighted docs site.

Built with SvelteKit 2 + Svelte 5, Tailwind CSS 4,
[shadcn-svelte](https://shadcn-svelte.com), Markdoc, Shiki, and
[Pagefind](https://pagefind.app) for static search.

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

```
src/content/
  introduction.md            ← landing page (also: index.md)
  get-started/
    install.md
    quickstart.md
  reference/
    api.md
    cli.md
  nav.json                   ← optional, see below
```

- Top-level files become top-of-sidebar entries.
- Subdirectories become sidebar groups.
- Filenames are kebab-cased and become path segments
  (`get-started/install.md` → `/get-started/install`).
- Either `src/content/nav.json` controls sidebar order explicitly, or
  the sidebar auto-builds from the filesystem (alphabetical).

### `nav.json` (optional, recommended for non-trivial docsets)

```json
[
  {
    "title": "Get started",
    "items": [
      { "title": "Introduction", "href": "/" },
      { "title": "Install",      "href": "/get-started/install" }
    ]
  },
  {
    "title": "Reference",
    "items": [
      { "title": "API", "href": "/reference/api" },
      { "title": "CLI", "href": "/reference/cli" }
    ]
  }
]
```

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

`src/app.css` ships with the standard shadcn token set; override the
CSS variables in your own copy to rebrand. Light / dark mode is
wired via [mode-watcher](https://github.com/svecosystem/mode-watcher);
the theme toggle is in the top nav.

Deeper theming (component slot overrides, layout changes) is left as
future work — for now, fork the repo or mount a custom `app.css`.

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
