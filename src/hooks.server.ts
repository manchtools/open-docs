import type { Handle } from '@sveltejs/kit';
import { base } from '$app/paths';
import { splitRequestSlug } from '$lib/i18n';

// Sets the per-page `<html lang>` and the standard defensive response
// headers. CSP is wired via svelte.config.js kit.csp so SvelteKit can emit
// a nonce in production; these headers cover what SvelteKit's csp config
// doesn't.
//
// Svelte 5.48 has no `<svelte:html>`, and a client-only effect would leave
// the *prerendered* HTML at the default language — which Pagefind reads at
// index time to segment search by language. So we set `<html lang>` in the
// SSR/prerender output here, derived from the URL (default language is
// unprefixed; see $lib/i18n). app.html ships `<html lang="en">`; we rewrite
// that first occurrence to the route's language.
export const handle: Handle = async ({ event, resolve }) => {
	const path = event.url.pathname.slice(base.length).replace(/^\//, '');
	const { lang } = splitRequestSlug(path);

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('lang="en"', `lang="${lang}"`)
	});

	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

	return response;
};
