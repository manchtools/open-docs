---
title: From source
---

# From source

For local authoring or self-hosting without Docker, run open-docs
directly. [Bun](https://bun.sh) is the package manager and runtime.

## Develop

```sh
bun install
bun run dev
```

Put your `.md` / `.markdoc` files in `src/content/` and the dev server
hot-reloads on save. Set any `PUBLIC_*` variable inline to preview
branding:

```sh
PUBLIC_BRAND_NAME="My Project" bun run dev
```

## Build and preview

```sh
bun run build      # production build → ./build/
bun run preview    # serve the built site
```

The build pre-renders every page to static HTML, then runs
[Pagefind](https://pagefind.app) over the output to produce the search
index.

## Make targets

A `Makefile` wraps the common commands:

| Command | Does |
|---|---|
| `make install` | Install dependencies. |
| `make dev` | Dev server with hot reload. |
| `make check` | Type-check with `svelte-check`. |
| `make build` | Production build into `./build/`. |
| `make preview` | Serve the production build. |
| `make docker` | Build the container image locally. |

## Hosting the output

The build produces a static site plus a small Bun server. Because the
HTML is pre-rendered, it also hosts on static/CDN platforms: point your
host at the build output and serve it like any static site.
