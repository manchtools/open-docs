import { error } from '@sveltejs/kit';
import { cleanSlug } from './slug';

// Content loader. svelte-markdoc-preprocess turns every .md / .markdoc
// file under src/content/** into a Svelte component, but the file
// system mapping ("which slug → which import") has to live somewhere
// the [...slug] route can consult at request time.
//
// We use Vite's import.meta.glob with `eager: false + import: 'default'`
// to produce a slug → lazy-loader map at build time. The route awaits
// the loader and renders the resulting component.
//
// Slugs are computed by cleanSlug() (src/lib/slug.ts), the same helper
// the sidebar uses, so the URL we serve always matches the nav link.
// Numeric ordering prefixes are stripped from the public path:
//   - src/content/introduction.md             →  ""        (landing)
//   - src/content/01-get-started/02-install.md →  "get-started/install"
//   - src/content/reference/index.md           →  "reference" (group index)
//
// Anything outside src/content/ is invisible to the docs site — keep
// drafts in a separate directory or behind a `.draft.md` extension.

type MdLoader = () => Promise<{ default: unknown }>;

const modules = import.meta.glob<{ default: unknown }>('/src/content/**/*.{md,markdoc}');

// Build the slug map once at module init.
const slugMap: Record<string, MdLoader> = {};
for (const [path, loader] of Object.entries(modules)) {
	slugMap[cleanSlug(path)] = loader;
}

export function listSlugs(): string[] {
	return Object.keys(slugMap);
}

export async function loadContent(slug: string): Promise<{ default: unknown }> {
	// cleanSlug already collapsed `foo/index` → `foo`, so a single
	// lookup covers both plain pages and group-index pages.
	const loader = slugMap[slug];
	if (!loader) {
		throw error(404, `No content for ${slug || '/'}`);
	}
	return loader();
}
