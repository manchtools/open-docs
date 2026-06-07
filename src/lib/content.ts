import { error } from '@sveltejs/kit';
import { parsePath, defaultLang, languages } from './i18n';

// Content loader. svelte-markdoc-preprocess turns every .md / .markdoc
// file under src/content/** into a Svelte component, but the file-system
// mapping ("which language + slug → which import") has to live somewhere
// the [...slug] route can consult at request time.
//
// Vite's import.meta.glob (lazy) gives us a path → loader map at build
// time. We bucket it by language using parsePath() (src/lib/i18n.ts),
// which strips the `-<lang>` filename suffix:
//   - src/content/01-intro.md           → en, slug ""
//   - src/content/01-intro-de.md        → de, slug ""
//   - src/content/guides/02-setup-de.md → de, slug "guides/setup"
//
// A page that isn't translated into a language falls back to the
// default-language file at the same slug, so no language ever 404s on a
// page that exists in the default. The site is single-language (and
// unprefixed) until the first `-<lang>` file appears — see i18n.ts.

type MdLoader = () => Promise<{ default: unknown }>;

const modules = import.meta.glob<{ default: unknown }>('/src/content/**/*.{md,markdoc}');

// language → (language-agnostic slug → loader)
const byLang: Record<string, Record<string, MdLoader>> = {};
for (const [path, loader] of Object.entries(modules)) {
	const { lang, slug } = parsePath(path);
	(byLang[lang] ??= {})[slug] = loader;
}

/**
 * Every URL slug to pre-render (the `[...slug]` param). The set of pages
 * is defined by the default language; each non-default language mirrors it
 * (translated where a file exists, falling back to the default otherwise),
 * so each one is prefixed with `<lang>/`. The empty slug is the landing
 * page: at the default language it's served by the root route (`/`), so
 * it's excluded here; for other languages it becomes the bare `<lang>`
 * path (`/de`).
 */
export function listSlugs(): string[] {
	const defaultSlugs = Object.keys(byLang[defaultLang] ?? {});
	const out: string[] = defaultSlugs.filter((s) => s !== '');
	for (const lang of languages) {
		if (lang === defaultLang) continue;
		// Each non-default language gets a bare-language home ('/de'), which
		// renders the hero — even when there's no empty-slug content file (the
		// default home is the generated hero at '/', not a Markdown page).
		out.push(lang);
		for (const s of defaultSlugs) if (s) out.push(`${lang}/${s}`);
	}
	return out;
}

/**
 * Load the component for a language + language-agnostic slug, falling back
 * to the default-language file when the page isn't translated.
 */
export async function loadContent(lang: string, slug: string): Promise<{ default: unknown }> {
	const loader = byLang[lang]?.[slug] ?? byLang[defaultLang]?.[slug];
	if (!loader) {
		throw error(404, `No content for ${slug || '/'}`);
	}
	return loader();
}
