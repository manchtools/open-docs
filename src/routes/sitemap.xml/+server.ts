import { getStore } from '$lib/server/store-instance';
import { siteConfig } from '$lib/server/site';
import { renderSitemap } from '$lib/server/sitemap';

// XML sitemap over every servable path in every language, derived from the
// runtime store. Absolute <loc>s need PUBLIC_SITE_URL; without it the
// locations are path-only. Values are XML-escaped in renderSitemap so an
// author tag slug or a stray origin character can't break the document.
export function GET() {
	const origin = siteConfig().siteUrl;
	const body = renderSitemap(origin, getStore().listPaths());

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			// Static after boot (like the store); revalidate so a content
			// reload is picked up. Matches theme.css / pagefind.
			'cache-control': 'no-cache'
		}
	});
}
