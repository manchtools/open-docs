import type { Handle } from '@sveltejs/kit';
import { base } from '$app/paths';
import { env } from '$env/dynamic/private';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { Readable } from 'node:stream';
import { join, resolve as resolvePath, sep } from 'node:path';
import { getStore } from '$lib/server/store-instance';
import { splitRequest } from '$lib/i18n';
import { deriveFrameSrc } from '../scripts/derive-frame-src.js';
import { siteConfig } from '$lib/server/site';

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

// Static assets under BASE_PATH. The adapter serves build/client at the
// ROOT only, but pages reference assets under the base (SvelteKit's
// relative URLs resolve to /docs/favicon.svg etc.), so those requests
// fall through to the router. Serve them from disk here — request-time,
// traversal-guarded, and zero-cost when no base is configured. (A
// build/client/<base> self-symlink was tried instead and crashes the
// adapter's startup file walker with infinite recursion.)
const CLIENT_ROOT = resolvePath('build/client');
const MIME: Record<string, string> = {
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.ico': 'image/x-icon',
	'.webp': 'image/webp',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.gif': 'image/gif',
	'.css': 'text/css; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.mjs': 'text/javascript; charset=utf-8',
	'.json': 'application/json',
	'.wasm': 'application/wasm',
	'.woff2': 'font/woff2',
	'.txt': 'text/plain; charset=utf-8',
	'.xml': 'application/xml; charset=utf-8'
};

function baseStatic(pathname: string): Response | null {
	if (!base || !pathname.startsWith(base + '/')) return null;
	const rel = decodeURIComponent(pathname.slice(base.length + 1));
	// Page routes have no file extension — skip the stat for them.
	if (!rel.includes('.') || rel.includes('\0')) return null;
	const target = resolvePath(join(CLIENT_ROOT, rel));
	if (!target.startsWith(CLIENT_ROOT + sep)) return null;
	try {
		if (!statSync(target).isFile()) return null;
	} catch {
		return null;
	}
	const ext = target.slice(target.lastIndexOf('.'));
	return new Response(Readable.toWeb(createReadStream(target)) as ReadableStream, {
		headers: { 'content-type': MIME[ext] ?? 'application/octet-stream' }
	});
}

// Atom feeds: /<section>/feed.xml (language-prefixed variants included),
// one per `blog: true` section, generated from the store like sitemap.xml.
function atomFeed(pathname: string): Response | null {
	if (!pathname.endsWith('/feed.xml')) return null;
	const store = getStore();
	const trimmed = pathname.slice(base.length).replace(/^\//, '').replace(/\/feed\.xml$/, '');
	const { lang, slug: section } = splitRequest(trimmed, store.languages, store.defaultLang);
	if (!store.isBlogSection(section)) return null;
	const site = siteConfig();
	const posts = store.postsFor(lang, section);
	const xml = (v: string) =>
		v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	const url = (p: string) => `${site.siteUrl}${p}`;
	const sectionTitle = store.pageMetaFor(lang, section).title || section;
	const updated = posts[0] ? `${posts[0].date}T00:00:00Z` : '1970-01-01T00:00:00Z';
	const body = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>${xml(site.siteTitle)} — ${xml(sectionTitle)}</title>
	<id>${xml(url(store.localizedHref(lang, section)))}</id>
	<link rel="self" href="${xml(url(store.localizedHref(lang, section) + '/feed.xml'))}"/>
	<link href="${xml(url(store.localizedHref(lang, section)))}"/>
	<updated>${updated}</updated>
${posts
	.map(
		(p) => `	<entry>
		<title>${xml(p.title)}</title>
		<id>${xml(url(p.href))}</id>
		<link href="${xml(url(p.href))}"/>
		<updated>${p.date}T00:00:00Z</updated>
		${p.description ? `<summary>${xml(p.description)}</summary>` : ''}
		${p.author ? `<author><name>${xml(p.author)}</name></author>` : ''}
	</entry>`
	)
	.join('\n')}
</feed>
`;
	return new Response(body, {
		headers: { 'content-type': 'application/atom+xml; charset=utf-8' }
	});
}

export const handle: Handle = async ({ event, resolve }) => {
	const assetHit = baseStatic(event.url.pathname);
	if (assetHit) return assetHit;
	const feed = atomFeed(event.url.pathname);
	if (feed) return feed;

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
