import { getStore } from '$lib/server/store-instance';
import { siteConfig } from '$lib/server/site';

// XML sitemap over every servable path in every language, derived from
// the runtime store. Absolute <loc>s need PUBLIC_SITE_URL; without it the
// locations are path-only.
export function GET() {
	const origin = siteConfig().siteUrl;
	const locs = getStore().listPaths();

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		locs.map((p) => `\t<url><loc>${origin}${p}</loc></url>`).join('\n') +
		`\n</urlset>\n`;

	return new Response(body, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
}
