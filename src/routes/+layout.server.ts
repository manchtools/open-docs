import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { base } from '$app/paths';
import { env } from '$env/dynamic/private';
import type { LayoutServerLoad } from './$types';
import { getStore } from '$lib/server/store-instance';
import { splitRequest } from '$lib/i18n';
import { siteConfig } from '$lib/server/site';

// Single source of chrome data for every page. The language resolves from
// the URL (default language unprefixed — see $lib/i18n); the nav,
// meta/legal pages, prev-next list, and site branding are derived
// server-side per language and delivered through `load`, so the client
// bundle carries no content and rebranding needs no rebuild.
export const load: LayoutServerLoad = ({ url }) => {
	const store = getStore();
	const path = url.pathname.slice(base.length).replace(/^\//, '');
	const { lang } = splitRequest(path, store.languages, store.defaultLang);

	// An operator theme.css rides with the content (mounted or bundled);
	// when present the layout injects a <link> to /theme.css.
	const contentDir = env.OPEN_DOCS_CONTENT && existsSync(env.OPEN_DOCS_CONTENT)
		? env.OPEN_DOCS_CONTENT
		: 'src/content';
	const hasTheme = existsSync(join(contentDir, 'theme.css'));

	return {
		lang,
		languages: store.languages,
		defaultLang: store.defaultLang,
		i18nActive: store.i18nActive,
		nav: store.navByLang(lang),
		flatNav: store.flatNavFor(lang),
		metaPages: store.metaPagesFor(lang),
		site: siteConfig(),
		hasTheme
	};
};
