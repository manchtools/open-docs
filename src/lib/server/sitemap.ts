import { escapeXmlText } from './escape';

// Pure sitemap renderer (bound to the store/origin by the route). The <loc>
// values are origin + a servable path; paths include tag-listing slugs built
// from author `tags:` frontmatter (tagSlug only lowercases + dashes spaces),
// so `& < >` can reach here and MUST be XML-escaped or they break the
// document / inject structure. Mirrors feed.ts, which escapes the same way.
export function renderSitemap(origin: string, paths: string[]): string {
	return (
		`<?xml version="1.0" encoding="UTF-8"?>\n` +
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
		paths.map((p) => `\t<url><loc>${escapeXmlText(origin + p)}</loc></url>`).join('\n') +
		`\n</urlset>\n`
	);
}
