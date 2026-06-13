import { describe, it, expect } from 'vitest';
import { createContentStore } from './content-store';
import { buildAtomFeed, warmFeeds, getFeed } from './feed';

const FIXTURE = {
	contentDir: 'src/lib/server/__fixtures__/content',
	defaultLang: 'en',
	staticDirs: ['src/lib/server/__fixtures__/static-ok']
};

// Contract for the Atom feed builder. A blog section's feed must be
// syndication-ready: importers like dev.to/Forem and Medium read the post
// BODY (content → summary → description) and use an entry's <link> as the
// canonical_url, so a feed that ships only a one-line <summary> and
// relative ids imports a stub pointing nowhere. This suite pins:
//   - every entry carries the FULL rendered post HTML in <content
//     type="html"> (not just the summary),
//   - with PUBLIC_SITE_URL set every id/link/self is an absolute URL,
//     language-prefixed for per-language feeds and BASE_PATH-aware,
//   - with PUBLIC_SITE_URL unset the output stays relative (current
//     behaviour) — the warning lives at boot, not here,
//   - drafts never leak, and the output is valid, escaped Atom 1.0.

const store = createContentStore({ ...FIXTURE });

const SITE = 'https://example.com';

function feed(
	overrides: Partial<Parameters<typeof buildAtomFeed>[0]> = {}
): string {
	const xml = buildAtomFeed({
		store,
		siteTitle: 'open-docs',
		lang: 'en',
		section: 'blog',
		siteUrl: SITE,
		basePath: '',
		...overrides
	});
	expect(xml, 'expected a feed for the blog section').toBeTruthy();
	return xml as string;
}

describe('buildAtomFeed — section gating', () => {
	it('returns null for a slug that is not a blog section', () => {
		expect(
			buildAtomFeed({
				store,
				siteTitle: 'open-docs',
				lang: 'en',
				section: 'getting-started',
				siteUrl: SITE,
				basePath: ''
			})
		).toBeNull();
	});

	it('builds a feed for a real blog section', () => {
		expect(buildAtomFeed({
			store,
			siteTitle: 'open-docs',
			lang: 'en',
			section: 'blog',
			siteUrl: SITE,
			basePath: ''
		})).toBeTruthy();
	});
});

describe('buildAtomFeed — valid Atom 1.0 envelope', () => {
	it('declares the Atom namespace and the required feed-level elements', () => {
		const out = feed();
		expect(out).toContain('<?xml version="1.0" encoding="utf-8"?>');
		expect(out).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
		expect(out).toMatch(/<title>open-docs — Blog<\/title>/);
		expect(out).toMatch(/<id>[^<]+<\/id>/);
		// RFC3339 timestamp on the feed.
		expect(out).toMatch(/<updated>\d{4}-\d{2}-\d{2}T00:00:00Z<\/updated>/);
	});

	it('carries a feed-level <author> so the feed is valid even when an entry omits its author', () => {
		// Atom 1.0: a feed must have an author unless EVERY entry does. Author
		// is optional frontmatter, so the feed-level author is mandatory.
		const out = feed();
		const head = out.slice(0, out.indexOf('<entry>'));
		expect(head).toMatch(/<author>\s*<name>open-docs<\/name>\s*<\/author>/);
	});

	it('delivers the body in a CDATA type="html" content element (not xhtml)', () => {
		const out = feed();
		// type=html + CDATA is lenient: a stray tag can't break the whole feed,
		// and it's what dev.to expects. xhtml would require well-formed XML.
		expect(out).toContain('<content type="html"><![CDATA[');
		expect(out).toContain(']]></content>');
		expect(out).not.toContain('type="xhtml"');
	});

	it('gives every entry both <published> and <updated> in RFC3339', () => {
		const out = feed();
		for (const e of out.split('<entry>').slice(1)) {
			expect(e).toMatch(/<published>\d{4}-\d{2}-\d{2}T00:00:00Z<\/published>/);
			expect(e).toMatch(/<updated>\d{4}-\d{2}-\d{2}T00:00:00Z<\/updated>/);
		}
	});
});

describe('buildAtomFeed — full content, not a stub', () => {
	it('gives every entry a <content type="html"> alongside its <summary>', () => {
		const out = feed();
		const entries = out.split('<entry>').slice(1);
		expect(entries.length).toBe(2); // two published posts; the draft is excluded
		for (const e of entries) {
			expect(e).toContain('<content type="html">');
			expect(e).toContain('<summary>');
		}
	});

	it('puts the WHOLE rendered body in <content>, beyond the one-line summary', () => {
		const out = feed();
		const second = entryFor(out, '/blog/second-post');
		const summary = section(second, '<summary>', '</summary>');
		const content = section(second, '<content type="html">', '</content>');
		// The summary is the short excerpt (first paragraph); the body has
		// far more — the pull-quote text is in the content but not the summary.
		expect(summary).toContain('Newer than the first');
		expect(summary).not.toContain('algebraic patterns');
		expect(content).toContain('algebraic patterns');
		expect(content.length).toBeGreaterThan(summary.length);
	});

	it('renders the body as raw, reader-facing HTML — paragraphs, quote, images', () => {
		const out = feed();
		const content = section(entryFor(out, '/blog/second-post'), '<content type="html">', '</content>');
		expect(content).toContain('<p>Newer than the first.</p>');
		expect(content).toContain('<blockquote>');
		expect(content).toContain('algebraic patterns');
		// The gallery degraded to a plain sequence of <figure><img>.
		expect((content.match(/<figure><img/g) ?? []).length).toBeGreaterThanOrEqual(2);
	});

	it('drops the leading <h1> so it does not duplicate the entry <title>', () => {
		const out = feed();
		for (const slug of ['/blog/first-post', '/blog/second-post']) {
			const content = section(entryFor(out, slug), '<content type="html">', '</content>');
			// These fixtures open with their title as an h1; it must be gone.
			expect(content, slug).not.toContain('<h1');
			// …and the body now starts at the first real paragraph.
			expect(content, slug).toContain('<![CDATA[<p>');
		}
	});

	it('emits NO UI/build chrome — no svg, no data-pagefind, no copy-link anchor, no <article> wrapper', () => {
		const out = feed();
		for (const slug of ['/blog/first-post', '/blog/second-post']) {
			const content = section(entryFor(out, slug), '<content type="html">', '</content>');
			expect(content, slug).not.toContain('<svg');
			expect(content, slug).not.toContain('data-pagefind');
			expect(content, slug).not.toContain('Copy link');
			expect(content, slug).not.toContain('group/anchor');
			expect(content, slug).not.toContain('<article');
		}
	});

	it('renders a fenced code block as raw <pre><code class="language-…">', () => {
		const out = feed();
		const content = section(entryFor(out, '/blog/first-post'), '<content type="html">', '</content>');
		expect(content).toContain('<pre><code class="language-ts">');
		expect(content).toContain('export const answer = 42');
	});
});

describe('buildAtomFeed — absolute URLs when PUBLIC_SITE_URL is set', () => {
	it('makes the feed id, self link and alternate link absolute', () => {
		const out = feed();
		expect(out).toContain(`<id>${SITE}/blog</id>`);
		expect(out).toContain(`<link rel="self" href="${SITE}/blog/feed.xml"/>`);
		expect(out).toContain(`<link href="${SITE}/blog"/>`);
	});

	it("makes each entry's id and link the absolute permalink", () => {
		const out = feed();
		expect(out).toContain(`<id>${SITE}/blog/second-post</id>`);
		expect(out).toContain(`<link href="${SITE}/blog/second-post"/>`);
		expect(out).toContain(`<id>${SITE}/blog/first-post</id>`);
		expect(out).toContain(`<link href="${SITE}/blog/first-post"/>`);
	});

	it('emits absolute image src in the body so images resolve off-site', () => {
		const out = feed();
		const content = section(entryFor(out, '/blog/first-post'), '<content type="html">', '</content>');
		// The hero/avatar images are root-relative in the page; in the feed they
		// must carry the origin or dev.to fetches them from its own domain.
		expect(content).toContain(`src="${SITE}/screenshots/exists.png"`);
		expect(content).not.toContain('src="/screenshots');
	});

	it('prefixes BASE_PATH on the structural feed URLs', () => {
		const out = feed({ basePath: '/docs' });
		expect(out).toContain(`<id>${SITE}/docs/blog</id>`);
		expect(out).toContain(`<link rel="self" href="${SITE}/docs/blog/feed.xml"/>`);
		expect(out).toContain(`<id>${SITE}/docs/blog/first-post</id>`);
	});
});

describe('buildAtomFeed — per-language feeds', () => {
	it('uses absolute, language-prefixed URLs for a non-default language', () => {
		const out = feed({ lang: 'de' });
		expect(out).toContain(`<id>${SITE}/de/blog</id>`);
		expect(out).toContain(`<link rel="self" href="${SITE}/de/blog/feed.xml"/>`);
		expect(out).toContain(`<id>${SITE}/de/blog/second-post</id>`);
		expect(out).toContain(`<link href="${SITE}/de/blog/first-post"/>`);
	});
});

describe('buildAtomFeed — author mapping', () => {
	it('emits a per-entry <author><name> from the post (literal or author-page)', () => {
		const out = feed();
		// first-post: literal `author: Paul`.
		expect(entryFor(out, '/blog/first-post')).toMatch(
			/<author>\s*<name>Paul<\/name>\s*<\/author>/
		);
		// second-post: `author: /blog/authors/jane` → the author page's title.
		expect(entryFor(out, '/blog/second-post')).toMatch(
			/<author>\s*<name>Jane Doe<\/name>\s*<\/author>/
		);
	});
});

describe('buildAtomFeed — relative output when PUBLIC_SITE_URL is unset', () => {
	it('keeps ids/links relative and does not fabricate a domain', () => {
		const out = feed({ siteUrl: '' });
		expect(out).toContain('<id>/blog</id>');
		expect(out).toContain('<link rel="self" href="/blog/feed.xml"/>');
		expect(out).toContain('<link href="/blog"/>');
		expect(out).toContain('<id>/blog/second-post</id>');
		// No origin is invented onto the site's own structural URLs. (An
		// author's external link in the body — e.g. a quote citation — is
		// theirs and stays; we only assert no fabricated absolute permalink.)
		expect(out).not.toMatch(/<id>https?:\/\//);
		expect(out).not.toMatch(/<link[^>]*href="https?:\/\/[^"]*\/blog/);
	});

	it('leaves body URLs root-relative (no origin to resolve against)', () => {
		const out = feed({ siteUrl: '' });
		const content = section(entryFor(out, '/blog/first-post'), '<content type="html">', '</content>');
		expect(content).toContain('/screenshots/exists.png');
		expect(content).not.toContain('https://');
	});

	it('still includes BASE_PATH so the relative URLs are site-root correct', () => {
		const out = feed({ siteUrl: '', basePath: '/docs' });
		expect(out).toContain('<id>/docs/blog</id>');
		expect(out).toContain('<link rel="self" href="/docs/blog/feed.xml"/>');
	});
});

describe('buildAtomFeed — drafts never syndicate', () => {
	it('excludes draft posts from the feed', () => {
		const out = feed();
		expect(out).not.toContain('Secret Draft');
		expect(out).not.toContain('/blog/secret-draft');
	});
});

describe('feed cache — built once at startup, keyed to the store', () => {
	const rt = { store, siteTitle: 'open-docs', siteUrl: SITE, basePath: '' };

	it('warmFeeds builds one feed per blog section per language', () => {
		const built = warmFeeds(rt);
		expect(built).toBe(store.blogSections().length * store.languages.length);
		expect(built).toBeGreaterThan(0);
	});

	it('getFeed serves exactly what the pure builder produces (parity, from cache)', () => {
		warmFeeds(rt);
		const direct = buildAtomFeed({
			store,
			siteTitle: 'open-docs',
			lang: 'en',
			section: 'blog',
			siteUrl: SITE,
			basePath: ''
		});
		expect(getFeed(rt, 'en', 'blog')).toBe(direct);
	});

	it('getFeed returns null for a non-blog section', () => {
		warmFeeds(rt);
		expect(getFeed(rt, 'en', 'getting-started')).toBeNull();
	});

	it('builds on demand when a request beats warmFeeds (unseen store)', () => {
		// A fresh store the cache has never been warmed for: getFeed must still
		// return a correct, full feed rather than null.
		const fresh = createContentStore({ ...FIXTURE });
		const out = getFeed(
			{ store: fresh, siteTitle: 'open-docs', siteUrl: SITE, basePath: '' },
			'en',
			'blog'
		);
		expect(out).toContain('<content type="html">');
		expect(out).toContain(`<id>${SITE}/blog/second-post</id>`);
	});

	it('rebuilds when the store instance changes (dev reload), never serving stale content', () => {
		// Warm against the production store — drafts excluded.
		warmFeeds(rt);
		expect(getFeed(rt, 'en', 'blog')).not.toContain('Secret Draft');
		// A different store instance (here: one that includes drafts) is a new
		// identity, so the cache must rebuild and reflect it — not hand back
		// the warmed map.
		const draftStore = createContentStore({ ...FIXTURE, includeDrafts: true });
		const out = getFeed(
			{ store: draftStore, siteTitle: 'open-docs', siteUrl: SITE, basePath: '' },
			'en',
			'blog'
		);
		expect(out).toContain('Secret Draft');
		// And switching back to the original store rebuilds again — no draft.
		expect(getFeed(rt, 'en', 'blog')).not.toContain('Secret Draft');
	});
});

// --- helpers ---------------------------------------------------------------

// The substring of `s` between the first `open` and the following `close`.
function section(s: string, open: string, close: string): string {
	const a = s.indexOf(open);
	expect(a, `expected ${open}`).toBeGreaterThan(-1);
	const b = s.indexOf(close, a + open.length);
	expect(b, `expected ${close} after ${open}`).toBeGreaterThan(-1);
	return s.slice(a + open.length, b);
}

// The <entry> block whose <link> targets a permalink ending in `suffix`.
function entryFor(out: string, suffix: string): string {
	for (const block of out.split('<entry>').slice(1)) {
		const entry = block.slice(0, block.indexOf('</entry>'));
		if (entry.includes(`${suffix}"`) || entry.includes(`${suffix}<`)) return entry;
	}
	throw new Error(`no entry for ${suffix}`);
}
