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
import { warmFeeds, getFeed } from '$lib/server/feed';

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
	const store = getStore();
	const site = siteConfig();
	// Feeds are static after the boot scan, like everything else in
	// open-docs — render them once here, off the request path, and serve the
	// cached XML thereafter.
	const built = warmFeeds({ store, siteTitle: site.siteTitle, siteUrl: site.siteUrl, basePath: base });
	if (built > 0) console.log(`[open-docs] built ${built} Atom feed(s)`);
	// Full content ships always; absolute links need the site origin. Warn
	// once at boot when it's missing so the operator knows the feeds import
	// as relative stubs on dev.to/Medium until PUBLIC_SITE_URL is set.
	if (!site.siteUrl) {
		console.warn(
			'[open-docs] PUBLIC_SITE_URL is not set — Atom feeds emit relative URLs and are not syndication-ready (dev.to, Medium, and many feed readers need absolute links). Set PUBLIC_SITE_URL=https://your.site to enable.'
		);
	}
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
	'.avif': 'image/avif',
	'.mp4': 'video/mp4',
	'.webm': 'video/webm',
	'.pdf': 'application/pdf',
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
// one per `blog: true` section. The XML is built once at startup (warmFeeds
// in init) and served from the store-keyed cache; this only resolves the
// language/section from the path. getFeed returns null for a non-blog
// section — a 404 here, falling through to the router.
function atomFeed(pathname: string): Response | null {
	if (!pathname.endsWith('/feed.xml')) return null;
	const store = getStore();
	const trimmed = pathname.slice(base.length).replace(/^\//, '').replace(/\/feed\.xml$/, '');
	const { lang, slug: section } = splitRequest(trimmed, store.languages, store.defaultLang);
	const site = siteConfig();
	const body = getFeed(
		{ store, siteTitle: site.siteTitle, siteUrl: site.siteUrl, basePath: base },
		lang,
		section
	);
	if (body === null) return null;
	return new Response(body, {
		headers: { 'content-type': 'application/atom+xml; charset=utf-8' }
	});
}

// Assets co-located with the content (images referenced relatively from
// markdown, served in place — a copied docs folder brings its images).
// Extension-allowlisted and traversal-guarded; markdown itself is never
// served raw.
const ASSET_EXT = /\.(png|jpe?g|gif|webp|avif|svg|ico|mp4|webm|pdf|txt)$/i;
function contentAsset(pathname: string): Response | null {
	const rel = decodeURIComponent(pathname.slice(base.length).replace(/^\//, ''));
	if (!ASSET_EXT.test(rel) || rel.includes('\0')) return null;
	const dir =
		env.OPEN_DOCS_CONTENT && existsSync(env.OPEN_DOCS_CONTENT)
			? env.OPEN_DOCS_CONTENT
			: 'src/content';
	const root = resolvePath(dir);
	const target = resolvePath(join(root, rel));
	if (!target.startsWith(root + sep)) return null;
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

export const handle: Handle = async ({ event, resolve }) => {
	const assetHit = baseStatic(event.url.pathname);
	if (assetHit) return assetHit;
	const contentHit = contentAsset(event.url.pathname);
	if (contentHit) return contentHit;
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
