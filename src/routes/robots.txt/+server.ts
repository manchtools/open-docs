import { siteConfig } from '$lib/server/site';

// robots.txt: allow all crawlers; point them at the sitemap when an
// absolute origin (PUBLIC_SITE_URL) is configured.
export function GET() {
	const { siteUrl } = siteConfig();
	const lines = ['User-agent: *', 'Allow: /'];
	if (siteUrl) lines.push('', `Sitemap: ${siteUrl}/sitemap.xml`);
	return new Response(lines.join('\n') + '\n', {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
}
