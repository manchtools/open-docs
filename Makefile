.PHONY: dev build preview check check-watch install clean docker

# All PUBLIC_* env vars are baked into the build by Vite. They cover
# both site chrome (PUBLIC_BRAND_NAME, PUBLIC_SITE_TITLE, …) and the
# content token system (PUBLIC_TOKEN_*). Anything you set in the
# shell, in a .env file, or on the make command line gets forwarded
# to the bun subprocess. See README.md for the full list.
export

# Install dependencies. Bun is the package manager; npm + package-lock
# work too but slower.
install:
	bun install

# Development server with hot-reload on .md / .markdoc changes. Any
# PUBLIC_TOKEN_* variable resolves `{{NAME}}` in markdown at
# preprocess time. Changing env values mid-session needs a restart —
# the preprocessor caches per source file.
dev:
	bun run dev

# Production build. Pipeline:
#   1. vite build — compiles the app shell (content-independent; pages
#      render at runtime from the content store)
#   2. search is indexed at server start by scripts/index-search.ts, not
#      match SvelteKit's clean routes (drops .html, /index → /).
build:
	bun run build

# Preview the production build via the bun adapter's server (not
# vite preview — that one doesn't serve build/client/pagefind).
preview:
	bun run preview

# Type check via svelte-check.
check:
	bun run check

check-watch:
	bun run check:watch

# Build the container image. The image bundles build tooling and
# defers the SvelteKit build to container start so one image can
# serve any docset. See Dockerfile for the env contract.
docker:
	docker build -t open-docs:dev .

clean:
	rm -rf node_modules build .svelte-kit
