import type { Handle } from '@sveltejs/kit';

// Sets the standard defensive response headers. CSP is wired via
// svelte.config.js kit.csp so SvelteKit can emit a nonce in production;
// these headers cover what SvelteKit's csp config doesn't.
//
// (Per-page title/description/Open Graph now come from the <Seo>
// component, so there are no longer any app.html placeholders to
// substitute here.)
export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

	return response;
};
