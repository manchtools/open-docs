// Multi-language support. A content file may carry a trailing language
// suffix on its filename — `01-introduction-de.md` is the German version
// of `01-introduction.md`. Files with no suffix belong to the default
// language. The set of languages is *discovered* from the suffixes at
// build time (a compile-time list), so authors just drop in
// `name-<lang>.md` files; there is no separate config to maintain.
//
// When more than one language exists, the **default language stays
// unprefixed** (`/getting-started/intro`) and other languages are
// prefixed (`/de/getting-started/intro`). So any URL without a language
// prefix is inherently the default language — existing links keep
// working and there's no root redirect. A page not translated into a
// language falls back to the default-language content at the same slug,
// so no language ever shows a broken link.
//
// With no suffixed files the site is single-language and URLs are
// unprefixed exactly as before — i18n adds zero overhead until used.
//
// The functions below come in two layers: pure cores that take the
// language config as arguments (so they're unit-testable in isolation —
// see i18n.test.ts) and thin wrappers bound to the languages discovered
// from the content tree at build time.

import { cleanSlug, stripPrefix } from './slug';

// ISO 639-1 codes we recognise as language suffixes. Restricting to real
// codes keeps an ordinary 2-letter filename ending (`setup-ci`) from
// being mistaken for a language. Extend if you need a code not listed.
export const ISO_639_1 = new Set([
	'aa','ab','af','ak','am','ar','as','ay','az','be','bg','bm','bn','bo','br','bs',
	'ca','cs','cy','da','de','dv','dz','ee','el','en','eo','es','et','eu','fa','fi',
	'fo','fr','fy','ga','gd','gl','gu','ha','he','hi','hr','ht','hu','hy','id','ig',
	'is','it','ja','jv','ka','kk','km','kn','ko','ku','ky','la','lb','lo','lt','lv',
	'mg','mi','mk','ml','mn','mr','ms','mt','my','nb','ne','nl','nn','no','oc','or',
	'pa','pl','ps','pt','qu','rm','ro','ru','rw','sa','sd','si','sk','sl','sn','so',
	'sq','sr','sv','sw','ta','te','tg','th','ti','tk','tl','tr','tt','ug','uk','ur',
	'uz','vi','wo','xh','yi','yo','zh','zu'
]);

// ---------------------------------------------------------------------------
// Pure cores (take the language config explicitly; no module state).
// ---------------------------------------------------------------------------

/**
 * Language of a content file path. The suffix lives on the file segment,
 * after any `NN-` order prefix and before the extension
 * (`01-introduction-de.md` → `de`). No recognised suffix ⇒ the default.
 */
export function langOfPath(path: string, fallback: string): string {
	const rel = path.replace(/^\/src\/content\//, '').replace(/\.(md|markdoc)$/, '');
	const last = rel.split('/').pop() ?? '';
	const rest = stripPrefix(last).rest; // strip the NN- order prefix first
	const m = /-([a-z]{2})$/.exec(rest);
	return m && ISO_639_1.has(m[1]) ? m[1] : fallback;
}

/**
 * A content file path → its language and language-agnostic slug. The slug
 * is what you'd get with no i18n (`getting-started/introduction`); the
 * language suffix is stripped from the filename before slugging.
 */
export function slugLang(path: string, fallback: string): { lang: string; slug: string } {
	const lang = langOfPath(path, fallback);
	const delanged =
		lang === fallback ? path : path.replace(new RegExp(`-${lang}(\\.(?:md|markdoc))$`), '$1');
	return { lang, slug: cleanSlug(delanged) };
}

/** Discover every language present in a set of paths, default first, the
 *  rest alphabetical. */
export function pickLanguages(paths: string[], fallback: string): string[] {
	const found = new Set<string>();
	for (const p of paths) found.add(langOfPath(p, fallback));
	return [fallback, ...[...found].filter((l) => l !== fallback).sort()];
}

/** Public URL for a language + language-agnostic slug. The default
 *  language is unprefixed; others get a `/<lang>` prefix. */
export function hrefFor(lang: string, slug: string, fallback: string, active: boolean): string {
	const prefix = active && lang !== fallback ? `/${lang}` : '';
	return slug ? `${prefix}/${slug}` : prefix || '/';
}

/**
 * Split a request slug (the `[...slug]` param) into language + slug. Only
 * a *non-default* language that actually exists is treated as a prefix;
 * everything else (unprefixed URLs, a folder that happens to be two
 * letters) is the default language.
 */
export function splitRequest(
	requestSlug: string,
	languages: string[],
	fallback: string
): { lang: string; slug: string } {
	if (languages.length > 1) {
		const [first, ...rest] = requestSlug.split('/');
		if (first !== fallback && languages.includes(first)) {
			return { lang: first, slug: rest.join('/') };
		}
	}
	return { lang: fallback, slug: requestSlug };
}

/** Swap the language of a public path, preserving the page. */
export function switchTo(
	currentPath: string,
	lang: string,
	languages: string[],
	fallback: string
): string {
	const clean = currentPath.replace(/^\//, '');
	if (languages.length <= 1) return '/' + clean;
	const { slug } = splitRequest(clean, languages, fallback);
	return hrefFor(lang, slug, fallback, languages.length > 1);
}

/** Display name for a language code, in its own language. Intentionally
 *  kept exactly as `Intl.DisplayNames` returns it, respecting each
 *  language's own orthography ("English", "Deutsch", but "español",
 *  "français"). Falls back to the upper-cased code. */
export function langName(code: string): string {
	try {
		return new Intl.DisplayNames([code], { type: 'language' }).of(code) ?? code.toUpperCase();
	} catch {
		return code.toUpperCase();
	}
}

// ---------------------------------------------------------------------------
// Build-time bindings (discovered from the content tree).
// ---------------------------------------------------------------------------

/** Operator-set default language (the one suffix-less files belong to). */
export const defaultLang = (
	(import.meta.env.PUBLIC_DEFAULT_LANG as string | undefined) || 'en'
)
	.trim()
	.toLowerCase();

// All content paths (keys only) — used purely to discover the languages.
const allPaths = Object.keys(import.meta.glob('/src/content/**/*.{md,markdoc}'));

/** Every language present, default first, the rest alphabetical. */
export const languages: string[] = pickLanguages(allPaths, defaultLang);

/** True when there's more than one language — turns on URL prefixing. */
export const i18nActive = languages.length > 1;

/** Path → { lang, language-agnostic slug }, bound to the default language. */
export const parsePath = (path: string) => slugLang(path, defaultLang);

/** Public URL for a language + slug, bound to the discovered languages. */
export const localizedHref = (lang: string, slug: string) =>
	hrefFor(lang, slug, defaultLang, i18nActive);

/** Split a `[...slug]` request param into { lang, slug }. */
export const splitRequestSlug = (requestSlug: string) =>
	splitRequest(requestSlug, languages, defaultLang);

/** Swap the language of a public path, preserving the page. */
export const switchLangPath = (currentPath: string, lang: string) =>
	switchTo(currentPath, lang, languages, defaultLang);
