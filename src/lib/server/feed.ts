// Atom 1.0 feed builder for blog sections. A pure core (it takes the
// resolved site URL and base path as arguments, no module/runtime state)
// so it unit-tests in isolation; hooks.server.ts binds it to the request.
//
// Syndication is the whole point: dev.to/Forem, Medium and standard feed
// readers import the post BODY (they read content → summary → description)
// and treat an entry's <link> as the canonical_url. So every entry carries
// the full article body in <content type="html"> — rendered through the
// dedicated FEED PROFILE (see feed-render.ts), which walks the same Markdoc
// AST the page uses and emits clean, reader-facing HTML with no UI chrome —
// and, when PUBLIC_SITE_URL is set, every id/link/self is an absolute URL
// (relative ids and body URLs are fragile across origins). With
// PUBLIC_SITE_URL unset the output stays relative; the boot path warns that
// the feeds are not syndication-ready.

import type { ContentStore } from './content-store';
import { renderFeedHtml } from './feed-render';

export type FeedOptions = {
	store: ContentStore;
	/** The site/brand title — the feed-level <title> prefix and author. */
	siteTitle: string;
	/** Language of this feed (default language is unprefixed). */
	lang: string;
	/** The blog section slug (must be a `blog: true` section). */
	section: string;
	/** Absolute origin from PUBLIC_SITE_URL, no trailing slash, '' if unset. */
	siteUrl: string;
	/** BASE_PATH (leading slash or ''), no trailing slash. */
	basePath: string;
};

// XML text escaping for element text (title, summary, author, etc.). The
// feed-profile body is NOT escaped this way — it goes inside a CDATA section
// (see cdata) so its HTML is delivered verbatim to the importer.
const escapeXml = (v: string): string =>
	v
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');

// Wrap HTML in a CDATA section, splitting any literal `]]>` so it can't close
// the section early (the one sequence CDATA can't contain).
const cdata = (html: string): string => `<![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

export function buildAtomFeed(opts: FeedOptions): string | null {
	const { store, siteTitle, lang, section, siteUrl, basePath } = opts;
	if (!store.isBlogSection(section)) return null;

	// Structural URLs (feed/entry id, link, self): origin + base + path.
	// `siteUrl` is '' when PUBLIC_SITE_URL is unset, leaving a base-correct
	// relative URL — the documented fallback.
	const abs = (path: string): string => `${siteUrl}${basePath}${path}`;
	const sectionHref = store.localizedHref(lang, section);
	const sectionTitle = store.pageMetaFor(lang, section).title || section;
	const posts = store.postsFor(lang, section);
	const updated = posts[0] ? `${posts[0].date}T00:00:00Z` : '1970-01-01T00:00:00Z';

	const entries = posts
		.map((p) => {
			// Full article body, rendered through the feed profile from the same
			// Markdoc AST the page uses — clean reader HTML, no UI chrome. One
			// post's render failure must not take the whole feed down: log it and
			// fall through to summary-only.
			let body = '';
			const tree = store.getPage(lang, p.slug)?.tree;
			if (tree) {
				try {
					body = renderFeedHtml(tree, { siteUrl, basePath });
				} catch (err) {
					console.error(`[open-docs] feed: failed to render content for ${p.slug}: ${String(err)}`);
				}
			}
			const permalink = abs(p.href);
			const stamp = `${p.date}T00:00:00Z`;
			return `	<entry>
		<title>${escapeXml(p.title)}</title>
		<id>${escapeXml(permalink)}</id>
		<link href="${escapeXml(permalink)}"/>
		<published>${stamp}</published>
		<updated>${stamp}</updated>${
			p.description ? `\n\t\t<summary>${escapeXml(p.description)}</summary>` : ''
		}${p.author ? `\n\t\t<author><name>${escapeXml(p.author)}</name></author>` : ''}${
			// Omit <content> entirely on a render miss so importers fall back to
			// the summary rather than importing an empty body.
			body ? `\n\t\t<content type="html">${cdata(body)}</content>` : ''
		}
	</entry>`;
		})
		.join('\n');

	// The feed-level <author> keeps the feed valid even when an entry omits
	// its author (Atom 1.0 requires a feed author unless EVERY entry has one;
	// `author:` frontmatter is optional).
	return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
	<title>${escapeXml(siteTitle)} — ${escapeXml(sectionTitle)}</title>
	<id>${escapeXml(abs(sectionHref))}</id>
	<link rel="self" href="${escapeXml(abs(sectionHref + '/feed.xml'))}"/>
	<link href="${escapeXml(abs(sectionHref))}"/>
	<updated>${updated}</updated>
	<author><name>${escapeXml(siteTitle)}</name></author>
${entries}
</feed>
`;
}

// ---------------------------------------------------------------------------
// Startup cache
// ---------------------------------------------------------------------------
// Content is static after the boot scan — the whole point of open-docs — so
// the feeds are too. We render every blog section's feed (all languages)
// ONCE and serve the cached XML, instead of rendering post trees on every
// request. The cache is keyed to the store instance: production builds the
// store once (so the feeds are built once and reused forever); dev swaps in
// a fresh store when content changes (a new identity rebuilds the feeds), so
// authoring still hot-reloads.

export type FeedRuntime = {
	store: ContentStore;
	/** The site/brand title — the feed <title> prefix and author. */
	siteTitle: string;
	/** Absolute origin from PUBLIC_SITE_URL, no trailing slash, '' if unset. */
	siteUrl: string;
	/** BASE_PATH (leading slash or ''), no trailing slash. */
	basePath: string;
};

let cache: { store: ContentStore; feeds: Map<string, string> } | null = null;
const feedKey = (lang: string, section: string) => `${lang} ${section}`;

function buildFeedMap(rt: FeedRuntime): Map<string, string> {
	const feeds = new Map<string, string>();
	for (const section of rt.store.blogSections()) {
		for (const lang of rt.store.languages) {
			const xml = buildAtomFeed({
				store: rt.store,
				siteTitle: rt.siteTitle,
				lang,
				section,
				siteUrl: rt.siteUrl,
				basePath: rt.basePath
			});
			if (xml) feeds.set(feedKey(lang, section), xml);
		}
	}
	return feeds;
}

/** Precompute and cache every blog feed for the current store. Call once at
 *  server start so the rendering happens off the request path. Returns the
 *  number of feeds built. */
export function warmFeeds(rt: FeedRuntime): number {
	cache = { store: rt.store, feeds: buildFeedMap(rt) };
	return cache.feeds.size;
}

/** The cached Atom XML for a section feed, or null when the slug is not a
 *  blog section. Rebuilds the cache when the store instance changes (a dev
 *  content reload) or when a request beats warmFeeds(), so it never serves
 *  stale or missing XML. */
export function getFeed(rt: FeedRuntime, lang: string, section: string): string | null {
	if (cache?.store !== rt.store) cache = { store: rt.store, feeds: buildFeedMap(rt) };
	return cache.feeds.get(feedKey(lang, section)) ?? null;
}
