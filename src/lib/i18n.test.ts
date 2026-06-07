import { describe, it, expect } from 'vitest';
import { langOfPath, slugLang, pickLanguages, hrefFor, splitRequest, switchTo } from './i18n';

// These exercise the pure i18n cores against the design contract, not the
// build-time bindings. The model: a `-<lang>` filename suffix marks a
// translation; the default language is UNPREFIXED; only a non-default
// language that actually exists is a URL prefix; untranslated pages fall
// back to the default at the same slug (so every slug exists in every
// language — see content.ts).

const C = '/src/content/';

describe('langOfPath', () => {
	it('treats a suffix-less file as the default language', () => {
		expect(langOfPath(`${C}01-introduction.md`, 'en')).toBe('en');
		expect(langOfPath(`${C}getting-started/02-quick-start.md`, 'en')).toBe('en');
	});

	it('reads the -<lang> suffix after the NN- order prefix', () => {
		expect(langOfPath(`${C}01-introduction-de.md`, 'en')).toBe('de');
		expect(langOfPath(`${C}getting-started/02-quick-start-de.md`, 'en')).toBe('de');
		expect(langOfPath(`${C}reference/api.markdoc`, 'en')).toBe('en');
	});

	it('rejects a 2-letter ending that is not a real ISO 639-1 code', () => {
		// `ci` is not a language; the file is default-language "setup-ci".
		expect(langOfPath(`${C}setup-ci.md`, 'en')).toBe('en');
		// `ts` is not preceded by a hyphen, so it is not a suffix at all.
		expect(langOfPath(`${C}callouts.md`, 'en')).toBe('en');
	});

	it('honours a non-English default language', () => {
		expect(langOfPath(`${C}einleitung.md`, 'de')).toBe('de');
		expect(langOfPath(`${C}einleitung-en.md`, 'de')).toBe('en');
	});
});

describe('slugLang', () => {
	it('strips the language suffix so a translation shares its default slug', () => {
		const en = slugLang(`${C}01-getting-started/03-content-layout.md`, 'en');
		const de = slugLang(`${C}01-getting-started/03-content-layout-de.md`, 'en');
		expect(en).toEqual({ lang: 'en', slug: 'getting-started/content-layout' });
		expect(de).toEqual({ lang: 'de', slug: 'getting-started/content-layout' });
		expect(de.slug).toBe(en.slug);
	});

	it('collapses landing + index files to the empty slug, per language', () => {
		expect(slugLang(`${C}01-introduction-de.md`, 'en')).toEqual({ lang: 'de', slug: '' });
		expect(slugLang(`${C}reference/index-de.md`, 'en')).toEqual({ lang: 'de', slug: 'reference' });
	});
});

describe('pickLanguages', () => {
	it('lists the default first, then the rest alphabetically', () => {
		const paths = [`${C}intro.md`, `${C}intro-fr.md`, `${C}intro-de.md`, `${C}a/b-de.md`];
		expect(pickLanguages(paths, 'en')).toEqual(['en', 'de', 'fr']);
	});

	it('is single-language when no suffixes are present', () => {
		expect(pickLanguages([`${C}a.md`, `${C}b/c.md`], 'en')).toEqual(['en']);
	});

	it('always includes the default even if every file is translated', () => {
		expect(pickLanguages([`${C}a-de.md`], 'en')).toEqual(['en', 'de']);
	});
});

describe('hrefFor', () => {
	it('leaves the default language unprefixed', () => {
		expect(hrefFor('en', 'foo/bar', 'en', true)).toBe('/foo/bar');
		expect(hrefFor('en', '', 'en', true)).toBe('/');
	});

	it('prefixes non-default languages', () => {
		expect(hrefFor('de', 'foo/bar', 'en', true)).toBe('/de/foo/bar');
		expect(hrefFor('de', '', 'en', true)).toBe('/de');
	});

	it('never prefixes when i18n is inactive', () => {
		expect(hrefFor('en', 'foo', 'en', false)).toBe('/foo');
	});
});

describe('splitRequest', () => {
	const langs = ['en', 'de'];

	it('reads an unprefixed path as the default language', () => {
		expect(splitRequest('foo/bar', langs, 'en')).toEqual({ lang: 'en', slug: 'foo/bar' });
	});

	it('peels a non-default language prefix', () => {
		expect(splitRequest('de/foo/bar', langs, 'en')).toEqual({ lang: 'de', slug: 'foo/bar' });
		expect(splitRequest('de', langs, 'en')).toEqual({ lang: 'de', slug: '' });
	});

	it('never treats the default language as a prefix', () => {
		// A page literally named `en` stays a slug; default is implicit.
		expect(splitRequest('en/foo', langs, 'en')).toEqual({ lang: 'en', slug: 'en/foo' });
	});

	it('treats an unknown or absent language as part of the slug', () => {
		expect(splitRequest('fr/foo', langs, 'en')).toEqual({ lang: 'en', slug: 'fr/foo' });
		// Single-language site: `de` is an ordinary page, not a prefix.
		expect(splitRequest('de', ['en'], 'en')).toEqual({ lang: 'en', slug: 'de' });
	});
});

describe('switchTo', () => {
	const langs = ['en', 'de'];

	it('moves a page from the default language to another and back', () => {
		expect(switchTo('/foo/bar', 'de', langs, 'en')).toBe('/de/foo/bar');
		expect(switchTo('/de/foo/bar', 'en', langs, 'en')).toBe('/foo/bar');
	});

	it('handles the landing page', () => {
		expect(switchTo('/', 'de', langs, 'en')).toBe('/de');
		expect(switchTo('/de', 'en', langs, 'en')).toBe('/');
	});

	it('is a no-op to the same language and on single-language sites', () => {
		expect(switchTo('/de/foo', 'de', langs, 'en')).toBe('/de/foo');
		expect(switchTo('/foo', 'en', ['en'], 'en')).toBe('/foo');
	});
});
