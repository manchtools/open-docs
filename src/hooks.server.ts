import type { Handle } from '@sveltejs/kit';
import { siteConfig } from '$lib/config';

// Substitutes `%open-docs.<key>%` placeholders in app.html from
// siteConfig, plus sets the standard defensive headers. CSP is
// wired via svelte.config.js kit.csp so SvelteKit can emit a nonce
// in production; these headers cover what SvelteKit's csp config
// doesn't.
//
// The placeholder substitution is the same mechanism SvelteKit
// already uses for %sveltekit.head% and %sveltekit.body% — we hook
// transformPageChunk to swap our extra keys in.
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => {
			return html
				.replaceAll('%open-docs.siteTitle%', escapeHtml(siteConfig.siteTitle))
				.replaceAll('%open-docs.siteDescription%', escapeHtml(siteConfig.siteDescription))
				.replaceAll('%open-docs.themeColor%', escapeHtml(siteConfig.themeColor));
		}
	});

	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

	return response;
};

function escapeHtml(v: string): string {
	return v
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}
