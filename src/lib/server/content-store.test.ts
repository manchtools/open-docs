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
const store = createContentStore({ contentDir: DIR, defaultLang: 'en' });

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
