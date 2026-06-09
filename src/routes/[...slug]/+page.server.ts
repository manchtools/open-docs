import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getStore } from '$lib/server/store-instance';
import { splitRequest } from '$lib/i18n';

// Content routes, rendered at request time from the runtime store. The
// language peels off the path (default language unprefixed); a bare
// language path ('/de') is that language's landing page (the hero); any
// other slug resolves to a page tree, falling back to the default
// language for untranslated pages. Unknown slugs 404.
export const load: PageServerLoad = ({ params }) => {
	const store = getStore();
	const { lang, slug } = splitRequest(params.slug, store.languages, store.defaultLang);
	const href = store.localizedHref(lang, slug);

	if (slug === '') {
		return { isHome: true as const, lang, currentHref: href, seo: { path: href, lang, slug } };
	}

	const page = store.getPage(lang, slug);
	if (!page) throw error(404, `No content for ${slug}`);

	return {
		isHome: false as const,
		tree: page.tree,
		lang,
		currentHref: href,
		seo: { title: page.title, description: page.description, path: href, lang, slug }
	};
};
