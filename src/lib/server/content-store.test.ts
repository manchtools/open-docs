import { describe, it, expect } from 'vitest';
import { createContentStore } from './content-store';

// Contract for the runtime content store — the 0.4.0 replacement for the
// import.meta.glob pipeline. From a directory of Markdown it derives the
// same structures the site used at 0.3.x: languages, per-language nav
// trees, page metadata, meta/legal pages, and (new) per-page Markdoc
// render trees. Boot validation fails closed on author errors the old
// build would have caught: unknown tags, missing required attributes,
// dead internal links.

const DIR = 'src/lib/server/__fixtures__/content';
const store = createContentStore({
	contentDir: DIR,
	defaultLang: 'en',
	staticDirs: ['src/lib/server/__fixtures__/static-ok']
});

describe('language discovery & content', () => {
	it('discovers languages from -lang suffixes, default first', () => {
		expect(store.languages).toEqual(['en', 'de']);
	});

	it('serves a translated page with its own tree and title', () => {
		const de = store.getPage('de', 'getting-started/install');
		expect(de?.title).toBe('Installation');
		expect(de?.description).toBe('Installieren mit Bedacht.');
		expect(JSON.stringify(de?.tree)).toContain('Installieren Sie');
	});

	it('falls back to the default language for untranslated pages', () => {
		const de = store.getPage('de', 'getting-started/usage');
		const en = store.getPage('en', 'getting-started/usage');
		expect(de).toBeTruthy();
		expect(de?.tree).toEqual(en?.tree);
	});

	it('returns null for an unknown slug (route 404s)', () => {
		expect(store.getPage('en', 'no/such/page')).toBeNull();
	});

	it('produces plain JSON-serializable trees (load/devalue-safe)', () => {
		const page = store.getPage('en', 'getting-started/install');
		// structuredClone throws on class instances — the tree must be POJOs.
		expect(() => structuredClone(page?.tree)).not.toThrow();
		const round = JSON.parse(JSON.stringify(page?.tree));
		expect(round).toEqual(page?.tree);
	});

	it('annotates headings with ids in the tree (TOC contract)', () => {
		const page = store.getPage('en', 'getting-started/install');
		const json = JSON.stringify(page?.tree);
		expect(json).toContain('"second-section"');
	});
});

describe('navigation', () => {
	it('builds the default nav: section heading links to its index, no duplicate entry', () => {
		const groups = store.navByLang('en');
		const gs = groups.find((g) => g.title === 'Getting Started');
		expect(gs?.href).toBe('/getting-started');
		expect(gs?.items?.map((i) => i.title)).toEqual(['Install Guide', 'Usage']);
		expect(gs?.icon).toBe('🚀');
	});

	it('localizes the nav for other languages: prefixed hrefs, translated titles', () => {
		const groups = store.navByLang('de');
		const gs = groups.find((g) => g.title === 'Getting Started');
		expect(gs?.href).toBe('/de/getting-started');
		expect(gs?.items?.[0].title).toBe('Installation');
		expect(gs?.items?.[0].href).toBe('/de/getting-started/install');
	});

	it('keeps meta pages out of the nav and prev/next but lists them for the footer', () => {
		const flat = store.flatNavFor('en');
		expect(flat.some((i) => i.href === '/legal')).toBe(false);
		expect(store.metaPagesFor('en')).toEqual([{ title: 'Imprint', href: '/legal', label: undefined }]);
		expect(store.metaPagesFor('de')[0].href).toBe('/de/legal');
	});

	it('enumerates every servable path for warm pass / sitemap, all languages', () => {
		const paths = store.listPaths();
		for (const p of [
			'/',
			'/de',
			'/getting-started',
			'/getting-started/install',
			'/de/getting-started/install',
			'/de/getting-started/usage',
			'/legal',
			'/de/legal'
		]) {
			expect(paths, p).toContain(p);
		}
	});
});

describe('boot validation (fail closed, like the old build)', () => {
	it('accepts the good fixture tree', () => {
		expect(store.errors).toEqual([]);
	});

	it('rejects an unknown tag', () => {
		const bad = createContentStore({
			contentDir: 'src/lib/server/__fixtures__/content-bad',
			defaultLang: 'en'
		});
		const messages = bad.errors.map((e) => `${e.file} ${e.message}`).join('\n');
		expect(messages).toMatch(/bogus/i);
	});

	it('rejects a missing required attribute', () => {
		const bad = createContentStore({
			contentDir: 'src/lib/server/__fixtures__/content-bad',
			defaultLang: 'en'
		});
		const messages = bad.errors.map((e) => e.message).join('\n');
		expect(messages).toMatch(/labels/i);
	});

	it('rejects a dead internal link in the default language', () => {
		const bad = createContentStore({
			contentDir: 'src/lib/server/__fixtures__/content-deadlink',
			defaultLang: 'en'
		});
		const messages = bad.errors.map((e) => e.message).join('\n');
		expect(messages).toMatch(/\/nowhere\/at-all/);
	});
});

describe('screenshot asset validation', () => {
	// The docs promise: a {% screenshot %} pointing at a missing image
	// fails validation (it used to fail the prerender). The store checks
	// src/dark against the static dirs.
	it('rejects a screenshot whose file is missing, accepts one that exists', () => {
		const s = createContentStore({
			contentDir: 'src/lib/server/__fixtures__/content-badshot',
			defaultLang: 'en',
			staticDirs: ['src/lib/server/__fixtures__/static-ok']
		});
		const messages = s.errors.map((e) => e.message).join('\n');
		expect(messages).toMatch(/missing\.png/);
		expect(messages).not.toMatch(/exists\.png/);
	});
});

describe('blog mode (per-section opt-in)', () => {
	// Contract (docs/proposals/0.5.0-blog-mode.md): a section whose index
	// sets `blog: true` becomes chronological. `date: YYYY-MM-DD` is the
	// sort key (newest first, ties by title); drafts serve only when
	// includeDrafts; posts carry derived meta (date, author, tags, cover,
	// reading time); posts leave the docs prev/next chain and get a
	// chronological Newer/Older chain of their own.

	it('sorts posts newest-first in the nav, ignoring filename order', () => {
		const blog = store.navByLang('en').find((g) => g.title === 'Blog');
		expect(blog?.href).toBe('/blog');
		expect(blog?.items?.map((i) => i.title)).toEqual(['Second Post', 'First Post']);
	});

	it('excludes drafts from production: nav, paths, and lookup', () => {
		const blog = store.navByLang('en').find((g) => g.title === 'Blog');
		expect(blog?.items?.some((i) => i.title === 'Secret Draft')).toBe(false);
		expect(store.listPaths()).not.toContain('/blog/secret-draft');
		expect(store.getPage('en', 'blog/secret-draft')).toBeNull();
	});

	it('includes drafts when includeDrafts is set (dev)', () => {
		const dev = createContentStore({ contentDir: DIR, defaultLang: 'en', includeDrafts: true });
		expect(dev.getPage('en', 'blog/secret-draft')).toBeTruthy();
		const blog = dev.navByLang('en').find((g) => g.title === 'Blog');
		expect(blog?.items?.map((i) => i.title)).toEqual([
			'Second Post',
			'Secret Draft',
			'First Post'
		]);
	});

	it('derives post meta: date, author, tags, cover, reading time', () => {
		const page = store.getPage('en', 'blog/first-post');
		expect(page?.post).toMatchObject({
			date: '2026-01-02',
			author: 'Paul',
			tags: ['release', 'security'],
			cover: 'screenshots/exists.png',
			section: 'blog'
		});
		expect(page?.post?.readingTimeMin).toBeGreaterThanOrEqual(1);
		// docs pages have no post meta
		expect(store.getPage('en', 'getting-started/install')?.post).toBeUndefined();
	});

	it('lists posts for the section index, newest first', () => {
		const posts = store.postsFor('en', 'blog');
		expect(posts.map((p) => p.title)).toEqual(['Second Post', 'First Post']);
		expect(posts[1].href).toBe('/blog/first-post');
		expect(posts[1].date).toBe('2026-01-02');
	});

	it('keeps posts out of the docs prev/next chain but chains them chronologically', () => {
		const flat = store.flatNavFor('en');
		expect(flat.some((i) => i.href === '/blog/first-post')).toBe(false);
		expect(flat.some((i) => i.href === '/blog')).toBe(true); // index stays
		// chrono: newer/older around the OLDEST post
		const chrono = store.chronoFor('en', 'blog/first-post');
		expect(chrono?.older).toBeNull();
		expect(chrono?.newer?.href).toBe('/blog/second-post');
		// and around the newest
		const newest = store.chronoFor('en', 'blog/second-post');
		expect(newest?.newer).toBeNull();
		expect(newest?.older?.href).toBe('/blog/first-post');
		// docs pages have no chrono chain
		expect(store.chronoFor('en', 'getting-started/install')).toBeNull();
	});

	it('rejects posts with a missing or malformed date (fail closed)', () => {
		const bad = createContentStore({
			contentDir: 'src/lib/server/__fixtures__/content-badblog',
			defaultLang: 'en'
		});
		const messages = bad.errors.map((e) => `${e.file} ${e.message}`).join('\n');
		expect(messages).toMatch(/no-date\.md.*date/i);
		expect(messages).toMatch(/bad-date\.md.*date/i);
	});

	it('rejects a post cover that does not exist under static/', () => {
		// first-post's cover exists in the fixture staticDirs — the good
		// store already proves acceptance (errors === []). Now the negative:
		const bad = createContentStore({
			contentDir: DIR,
			defaultLang: 'en',
			staticDirs: ['src/lib/server/__fixtures__/static-missing-everything']
		});
		expect(bad.errors.map((e) => e.message).join('\n')).toMatch(/cover/i);
	});
});

describe('authors as pages + tags', () => {
	it('resolves an author page path into name, avatar, and link', () => {
		const post = store.getPage('en', 'blog/second-post')?.post;
		expect(post?.author).toBe('Jane Doe');
		expect(post?.authorAvatar).toBe('screenshots/exists.png');
		expect(post?.authorHref).toBe('/blog/authors/jane');
	});

	it('keeps a literal author as a plain display name', () => {
		const post = store.getPage('en', 'blog/first-post')?.post;
		expect(post?.author).toBe('Paul');
		expect(post?.authorHref).toBeUndefined();
	});

	it('author pages are not posts: no date needed, absent from the listing', () => {
		expect(store.postsFor('en', 'blog').some((p) => p.title === 'Jane Doe')).toBe(false);
		expect(store.getPage('en', 'blog/authors/jane')).toBeTruthy();
	});

	it('rejects an author path that resolves to no page (fail closed)', () => {
		const bad = createContentStore({
			contentDir: 'src/lib/server/__fixtures__/content-badauthor',
			defaultLang: 'en'
		});
		expect(bad.errors.map((e) => e.message).join('\n')).toMatch(/author.*ghost/i);
	});

	it('exposes tag pages as servable paths and filters posts by tag', () => {
		expect(store.listPaths()).toContain('/blog/tags/release');
		expect(store.listPaths()).toContain('/blog/tags/security');
		const tagged = store.postsByTag('en', 'blog', 'release');
		expect(tagged.map((p) => p.title)).toEqual(['First Post']);
		expect(store.postsByTag('en', 'blog', 'nope')).toEqual([]);
	});
});

describe('multiple blog sections + same-date ties', () => {
	it('a second blog section is fully independent', () => {
		expect(store.isBlogSection('news')).toBe(true);
		expect(store.postsFor('en', 'news')).toHaveLength(2);
		expect(store.postsFor('en', 'blog').some((p) => p.title.includes('tie'))).toBe(false);
	});

	it('same-date posts tie-break by title DESCENDING (newest-feeling first)', () => {
		// Changelogs date-tie often (several releases a day); descending
		// titles put v0.4.0 above v0.3.3.
		expect(store.postsFor('en', 'news').map((p) => p.title)).toEqual(['Beta tie', 'Alpha tie']);
		const nav = store.navByLang('en').find((g) => g.title === 'News');
		expect(nav?.items?.map((i) => i.title)).toEqual(['Beta tie', 'Alpha tie']);
	});
});

describe('cover derived from a body hero', () => {
	it('a post without cover: frontmatter takes its cover from the first {% hero %}', () => {
		// first-post has a body hero (src /screenshots/exists.png) and no cover:
		const post = store.getPage('en', 'blog/first-post')?.post;
		expect(post?.cover).toBe('screenshots/exists.png');
		expect(post?.coverFromBody).toBe(true);
	});

	it('frontmatter cover: wins and is not marked as body-derived', () => {
		// give second-post nothing — it has neither → no cover at all
		const none = store.getPage('en', 'blog/second-post')?.post;
		expect(none?.cover).toBeUndefined();
	});
});

describe('plain-markdown compatibility (0.6 M1)', () => {
	const plain = createContentStore({
		contentDir: 'src/lib/server/__fixtures__/content-plain',
		defaultLang: 'en'
	});

	it('README.md acts as the folder index', () => {
		// root README.md → landing slug '' (like index.md)
		expect(plain.errors).toEqual([]);
		expect(plain.getPage('en', '')).toBeTruthy();
	});

	it('resolves relative .md links against the linking file', () => {
		const home = JSON.stringify(plain.getPage('en', '')?.tree);
		expect(home).toContain('"/guides/setup"');
		expect(home).toContain('"/guides/setup#install"');
		expect(home).not.toContain('setup.md');
		const setup = JSON.stringify(plain.getPage('en', 'guides/setup')?.tree);
		expect(setup).toContain('"/"'); // ../README.md → landing
	});

	it('resolves relative image srcs and renders them as Screenshot tags', () => {
		const setup = JSON.stringify(plain.getPage('en', 'guides/setup')?.tree);
		expect(setup).toContain('Screenshot');
		expect(setup).toContain('/guides/images/pic.png');
		expect(setup).not.toContain('./images/pic.png');
	});
});
