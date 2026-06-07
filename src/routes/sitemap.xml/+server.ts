import { siteConfig } from '$lib/config';
import { listSlugs } from '$lib/content';

// Prerendered XML sitemap: the landing page plus every routed page in every
// language (listSlugs already enumerates each language's slugs, translated
// or default-fallback). Absolute <loc>s need siteConfig.siteUrl
// (PUBLIC_SITE_URL); without it the locations are path-only.
export const prerender = true;

export function GET() {
	const origin = siteConfig.siteUrl;
	const paths = ['/', ...listSlugs().map((s) => '/' + s)];
	const seen = new Set<string>();
	const locs = paths.filter((p) => !seen.has(p) && seen.add(p));

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		locs.map((p) => `\t<url><loc>${origin}${p}</loc></url>`).join('\n') +
		`\n</urlset>\n`;

	return new Response(body, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
}
