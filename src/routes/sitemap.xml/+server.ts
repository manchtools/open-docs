import { siteConfig } from '$lib/config';
import { flatNav, metaPages } from '$lib/nav';

// Prerendered XML sitemap: the landing page plus every routed content page
// and `meta: true` legal page. Absolute <loc>s need siteConfig.siteUrl
// (PUBLIC_SITE_URL); without it the locations are path-only.
export const prerender = true;

export function GET() {
	const origin = siteConfig.siteUrl;
	const hrefs = ['/', ...flatNav.map((n) => n.href), ...metaPages.map((m) => m.href)];
	const seen = new Set<string>();
	const locs = hrefs.filter((h) => h && !seen.has(h) && seen.add(h));

	const body =
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		locs.map((h) => `\t<url><loc>${origin}${h === '/' ? '/' : h}</loc></url>`).join('\n') +
		`\n</urlset>\n`;

	return new Response(body, {
		headers: { 'content-type': 'application/xml; charset=utf-8' }
	});
}
