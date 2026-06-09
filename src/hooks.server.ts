import type { Handle } from '@sveltejs/kit';
import { base } from '$app/paths';
import { env } from '$env/dynamic/private';
import { existsSync } from 'node:fs';
import { getStore } from '$lib/server/store-instance';
import { splitRequest } from '$lib/i18n';
import { deriveFrameSrc } from '../scripts/derive-frame-src.js';

// Sets the per-page `<html lang>`, the CSP frame-src for {% embed %}
// hosts, and the standard defensive response headers.
//
// `<html lang>` must be in the server-rendered HTML — Pagefind reads it at
// index time to segment search by language, and crawlers use it for
// hreflang sanity. app.html ships `lang="en"`; we rewrite the first
// occurrence to the route's language.
//
// frame-src is derived from the {% embed %} blocks in the *runtime*
// content (token-resolved), computed once per content generation and
// appended to the CSP header kit.csp emitted — the build-time config
// can't know the mounted content's embed hosts.
let frameSrcCache: { key: string; hosts: string[] } | null = null;
function frameSrc(): string[] {
	const dir =
		env.OPEN_DOCS_CONTENT && existsSync(env.OPEN_DOCS_CONTENT)
			? env.OPEN_DOCS_CONTENT
			: 'src/content';
	if (frameSrcCache?.key !== dir) {
		frameSrcCache = { key: dir, hosts: deriveFrameSrc(dir) };
	}
	return frameSrcCache.hosts;
}

// Build the content store eagerly when the server starts, so validation
// errors abort the boot (container exits non-zero) instead of turning
// every request into a 500 — the runtime equivalent of a failed build.
export const init = () => {
	getStore();
};

export const handle: Handle = async ({ event, resolve }) => {
	const store = getStore();
	const path = event.url.pathname.slice(base.length).replace(/^\//, '');
	const { lang } = splitRequest(path, store.languages, store.defaultLang);

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('lang="en"', `lang="${lang}"`)
	});

	const csp = response.headers.get('content-security-policy');
	const hosts = frameSrc();
	if (csp && hosts.length > 0 && !csp.includes('frame-src')) {
		response.headers.set('content-security-policy', `${csp}; frame-src ${hosts.join(' ')}`);
	}

	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

	return response;
};
