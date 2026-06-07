import type { PageLoad } from './$types';
import { listSlugs, loadContent } from '$lib/content';
import { pageMetaFor } from '$lib/nav';
import { splitRequestSlug, localizedHref } from '$lib/i18n';

// Pre-render every slug we know about (every page in every language — see
// content.ts listSlugs). Adding a new .md under src/content/ extends this
// automatically; so does adding a `-<lang>` translation.
export const entries = () => {
	return listSlugs().map((slug) => ({ slug }));
};

export const load: PageLoad = async ({ params }) => {
	const { lang, slug } = splitRequestSlug(params.slug);
	const href = localizedHref(lang, slug);

	// A bare language path ('/de') is that language's landing page — render
	// the hero, same as '/' does for the default language.
	if (slug === '') {
		return { isHome: true, lang, currentHref: href, seo: { path: href, lang, slug } };
	}

	const mod = await loadContent(lang, slug);
	const meta = pageMetaFor(lang, slug);
	return {
		isHome: false,
		component: mod.default,
		lang,
		currentHref: href,
		// Per-page document head (title/description/canonical/OG/hreflang).
		seo: { title: meta.title, description: meta.description, path: href, lang, slug }
	};
};
