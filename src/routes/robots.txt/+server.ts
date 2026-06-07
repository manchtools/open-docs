import { siteConfig } from '$lib/config';

// Prerendered robots.txt. Allows all crawlers and points them at the
// sitemap when an absolute origin (PUBLIC_SITE_URL) is configured.
export const prerender = true;

export function GET() {
	const lines = ['User-agent: *', 'Allow: /'];
	if (siteConfig.siteUrl) {
		lines.push('', `Sitemap: ${siteConfig.siteUrl}/sitemap.xml`);
	}
	return new Response(lines.join('\n') + '\n', {
		headers: { 'content-type': 'text/plain; charset=utf-8' }
	});
}
