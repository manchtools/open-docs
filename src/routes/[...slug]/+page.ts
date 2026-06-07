import type { PageLoad } from './$types';
import { listSlugs, loadContent } from '$lib/content';
import { pageMeta } from '$lib/nav';

// Pre-render every content slug we know about. `entries` returns the
// list of `params` SvelteKit should crawl during the build. Adding a
// new .md under src/content/ automatically extends this list — no
// manual registration step.
export const entries = () => {
	return listSlugs().map((slug) => ({ slug }));
};

export const load: PageLoad = async ({ params }) => {
	const slug = params.slug;
	const mod = await loadContent(slug);
	const meta = pageMeta[slug];
	return {
		component: mod.default,
		currentHref: '/' + slug,
		// Per-page document head (title/description/canonical/OG). The title
		// and description come from the page's frontmatter, with the
		// description falling back to its first paragraph (see pageMeta).
		seo: {
			title: meta?.title,
			description: meta?.description,
			path: '/' + slug
		}
	};
};
