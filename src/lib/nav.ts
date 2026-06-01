// Sidebar structure. Two modes:
//
//   1. Explicit (preferred for any non-trivial docset). Drop a
//      `nav.json` next to your content (at src/content/nav.json)
//      with the shape:
//        [
//          { "title": "Get started", "items": [
//              { "title": "Introduction", "href": "/" },
//              { "title": "Install",      "href": "/install" }
//          ]},
//          ...
//        ]
//
//   2. Auto. If no nav.json is found we walk src/content/** and
//      build groups from top-level directories, with files inside
//      sorted alphabetically. Titles are derived from filenames by
//      converting `kebab-case` to "Sentence case". A top-level
//      `introduction.md` (or `index.md`) becomes the implicit
//      landing page at `/`.
//
// The catch-all [...slug] route validates paths against the
// filesystem at request time, so the nav being slightly out of sync
// with content surfaces as a 404 rather than a broken render.

export type NavItem = {
	title: string;
	href: string;
	/** Optional short label for the sidebar — defaults to title. */
	label?: string;
};

export type NavGroup = {
	title: string;
	items: NavItem[];
};

// Vite resolves both at build-time. The JSON glob is eager so we can
// branch on its presence synchronously.
const navOverrides = import.meta.glob<{ default: NavGroup[] }>(
	'/src/content/nav.json',
	{ eager: true }
);

const contentFiles = import.meta.glob('/src/content/**/*.{md,markdoc}');

function titleFromSlug(slug: string): string {
	const tail = slug.split('/').pop() ?? slug;
	if (!tail || tail === 'index') return 'Introduction';
	return tail
		.replace(/[-_]/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

function autoBuildNav(): NavGroup[] {
	const byGroup = new Map<string, NavItem[]>();
	const topLevel: NavItem[] = [];

	for (const path of Object.keys(contentFiles)) {
		const slug = path
			.replace(/^\/src\/content\//, '')
			.replace(/\.(md|markdoc)$/, '')
			.replace(/\/index$/, '');

		if (!slug || slug === 'introduction') {
			topLevel.push({ title: 'Introduction', href: '/' });
			continue;
		}

		const parts = slug.split('/');
		if (parts.length === 1) {
			topLevel.push({ title: titleFromSlug(slug), href: '/' + slug });
			continue;
		}

		const groupKey = parts[0];
		const groupTitle = titleFromSlug(groupKey);
		const item: NavItem = { title: titleFromSlug(slug), href: '/' + slug };

		const existing = byGroup.get(groupTitle) ?? [];
		existing.push(item);
		byGroup.set(groupTitle, existing);
	}

	const groups: NavGroup[] = [];
	if (topLevel.length > 0) {
		groups.push({ title: '', items: topLevel.sort((a, b) => a.href.localeCompare(b.href)) });
	}
	for (const [title, items] of [...byGroup.entries()].sort(([a], [b]) => a.localeCompare(b))) {
		items.sort((a, b) => a.href.localeCompare(b.href));
		groups.push({ title, items });
	}
	return groups;
}

const override = Object.values(navOverrides)[0]?.default;
export const nav: NavGroup[] = override ?? autoBuildNav();

// Flat list, in nav order, for prev/next navigation at the bottom of
// each page. The catch-all route uses this to compute the
// surrounding pages without re-walking the nav tree per-request.
export const flatNav: NavItem[] = nav.flatMap((g) => g.items);
