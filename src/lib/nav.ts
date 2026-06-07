// Sidebar structure — derived entirely from the content folder tree.
// There is no nav override file; the filesystem is the single source of
// truth. We walk src/content/** and build a nested tree from it:
//
//   - Top-level files become top-of-sidebar entries (ungrouped).
//   - Each first-level subdirectory becomes a sidebar section (a heading
//     in the sidebar); files inside it become that section's pages.
//   - Subdirectories nest as collapsible sub-sections, up to three
//     levels deep (level 1 = a top folder, level 3 = a folder three
//     deep). Anything deeper flattens into the third-level section — the
//     URL keeps its full path, but the sidebar stops nesting.
//   - A folder's `index.md` is that section's landing page; the section
//     heading itself links to it (there is no separate "Overview" entry).
//
// Titles default to the filename, kebab/snake-case converted to
// "Sentence case". Order defaults to alphabetical. Both are overridable
// without an external nav file:
//
//   1. Numeric filename/dir prefixes. `01-`, `02_`, `03.` on a file or
//      directory set sort position and are stripped from the URL and
//      title. `01-guides/02-advanced/01-caching.md` → section "Guides" >
//      sub-section "Advanced" > page "Caching", URL
//      `/guides/advanced/caching`.
//
//   2. Per-page frontmatter, which wins over the filename:
//        ---
//        title: Installing the CLI   # full page title / prev-next label
//        label: Install              # short sidebar label (alias: sidebar_label)
//        order: 2                    # sort position among its siblings
//        ---
//
// The catch-all [...slug] route validates paths against the filesystem
// at request time, so the nav being briefly out of sync with content
// surfaces as a 404 rather than a broken render.

import { cleanSlug, stripPrefix, titleFromSegment } from './slug';

/** A leaf link in the sidebar / prev-next list. */
export type NavItem = {
	title: string;
	href: string;
	/** Optional short label for the sidebar — defaults to title. */
	label?: string;
};

/**
 * A node in the sidebar tree. A node is either a *page* (has `href`, no
 * `items`) or a *section* (has `items`, no `href`). The top-level array
 * may also contain a single empty-title section holding the ungrouped
 * root pages.
 */
export type NavNode = {
	title: string;
	label?: string;
	href?: string;
	items?: NavNode[];
	/** Section icon for the landing-page card — an emoji, an inline
	 *  `<svg>…</svg>`, or a path under `static/` (e.g. `/icons/x.svg`).
	 *  Set from the section `index.md`'s `icon:` frontmatter. */
	icon?: string;
};

// How many directory levels deep the sidebar nests sections. Level 1 is
// a top-level folder; level 3 is a folder three deep. Files nested
// deeper than this flatten into the deepest section.
const MAX_SECTION_DEPTH = 3;

// Raw markdown sources, loaded eagerly at build time so we can read each
// file's frontmatter for titles/labels/order. `?raw` short-circuits
// Vite's markdoc/svelte transform and hands us the source text.
const sources = import.meta.glob<string>('/src/content/**/*.{md,markdoc}', {
	eager: true,
	query: '?raw',
	import: 'default'
});

// Minimal frontmatter reader: pulls top-level scalar keys out of a
// leading `--- … ---` block. We only consume `title`, `label`
// (alias `sidebar_label`) and `order`, all scalars, so a full YAML
// parser would be overkill. Nested/complex YAML is ignored for nav.
function frontmatter(raw: string): Record<string, string> {
	const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
	if (!m) return {};
	const out: Record<string, string> = {};
	for (const line of m[1].split(/\r?\n/)) {
		const kv = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line);
		if (!kv) continue;
		let value = kv[2].trim();
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}
		out[kv[1].toLowerCase()] = value;
	}
	return out;
}

// Resolve a sort position: explicit frontmatter `order:` wins, then the
// filename's numeric prefix, then `null` (sorts last, alphabetically).
function orderOf(fm: Record<string, string>, segment: string): number | null {
	if (fm.order != null && fm.order !== '') {
		const n = Number(fm.order);
		if (Number.isFinite(n)) return n;
	}
	return stripPrefix(segment).order;
}

const FALLBACK = Number.POSITIVE_INFINITY;

// Mutable build-tree node. `children` empty ⇒ it's a leaf page.
type BuildNode = {
	title: string;
	label?: string;
	href?: string;
	order: number;
	icon?: string;
	children: Map<string, BuildNode>;
};

const isSection = (n: BuildNode): boolean => n.children.size > 0;

function byOrderThenTitle(a: BuildNode, b: BuildNode): number {
	if (a.order !== b.order) return a.order < b.order ? -1 : 1;
	return a.title.localeCompare(b.title);
}

// Meta pages (frontmatter `meta: true`): legal/imprint pages that get a
// route but are kept out of the sidebar + prev/next and shown in the
// footer instead. Collected during the tree walk below.
const metaRaw: { title: string; href: string; label?: string; order: number }[] = [];

function buildTree(): NavNode[] {
	const root: BuildNode = { title: '', order: FALLBACK, children: new Map() };

	for (const [path, raw] of Object.entries(sources)) {
		const fm = frontmatter(raw);
		const slug = cleanSlug(path);
		const href = '/' + slug;

		const rawSegments = path
			.replace(/^\/src\/content\//, '')
			.replace(/\.(md|markdoc)$/, '')
			.split('/');
		const fileSegment = rawSegments[rawSegments.length - 1];
		const dirSegments = rawSegments.slice(0, -1);
		const isIndex = stripPrefix(fileSegment).rest.toLowerCase() === 'index';
		const label = fm.label ?? fm.sidebar_label;

		// Meta pages opt out of the nav (and prev/next) and surface in the
		// footer — for the legal/imprint page a region may require.
		if (fm.meta?.toLowerCase() === 'true') {
			metaRaw.push({
				title: fm.title ?? titleFromSegment(fileSegment),
				href,
				label,
				order: orderOf(fm, fileSegment) ?? FALLBACK
			});
			continue;
		}

		// Landing page (root index.md / introduction.md): ungrouped, and
		// pinned to the very top of the sidebar.
		if (slug === '') {
			root.children.set('pg:__landing__', {
				title: fm.title ?? 'Introduction',
				href: '/',
				label,
				order: orderOf(fm, fileSegment) ?? Number.NEGATIVE_INFINITY,
				children: new Map()
			});
			continue;
		}

		// Walk (creating as needed) the section path, capped at
		// MAX_SECTION_DEPTH so the tree never nests deeper than intended.
		let parent = root;
		for (const rawDir of dirSegments.slice(0, MAX_SECTION_DEPTH)) {
			const { rest, order } = stripPrefix(rawDir);
			const key = 'sec:' + rest;
			let section = parent.children.get(key);
			if (!section) {
				section = { title: titleFromSegment(rawDir), order: order ?? FALLBACK, children: new Map() };
				parent.children.set(key, section);
			} else if (order != null) {
				section.order = order;
			}
			parent = section;
		}

		// A section's index.md may set the section's landing-card icon.
		if (isIndex && fm.icon && parent !== root) parent.icon = fm.icon;

		// Add the page to the deepest section (or to the root). A section
		// index defaults to the "Overview" title and leads its section.
		const pageKey = 'pg:' + stripPrefix(fileSegment).rest;
		parent.children.set(pageKey, {
			title: fm.title ?? (isIndex ? 'Overview' : titleFromSegment(fileSegment)),
			href,
			label,
			order: orderOf(fm, fileSegment) ?? (isIndex ? Number.NEGATIVE_INFINITY : FALLBACK),
			children: new Map()
		});
	}

	return toNodes(root, true);
}

function toNavNode(n: BuildNode): NavNode {
	if (!isSection(n)) return { title: n.title, label: n.label, href: n.href };
	// A section's index.md *is* the section: the heading links straight to
	// it (a clickable section title) instead of the index showing up as a
	// separate "Overview" child. So the title you see and the page it leads
	// to are one entry, not two.
	const indexHref = n.children.get('pg:index')?.href;
	const items = toNodes(n).filter((c) => c.items || c.href !== indexHref);
	return { title: n.title, label: n.label, icon: n.icon, href: indexHref, items };
}

// Convert a section's children to NavNode[]. At the top level we keep
// the established layout — ungrouped pages collected into a leading
// empty-title group, then the sections. At deeper levels, pages and
// sub-sections interleave by order under their parent heading.
function toNodes(section: BuildNode, top = false): NavNode[] {
	const children = [...section.children.values()];
	if (!top) {
		children.sort(byOrderThenTitle);
		return children.map(toNavNode);
	}
	const pages = children.filter((c) => !isSection(c)).sort(byOrderThenTitle);
	const sections = children.filter(isSection).sort(byOrderThenTitle);
	const out: NavNode[] = [];
	if (pages.length > 0) out.push({ title: '', items: pages.map(toNavNode) });
	for (const s of sections) out.push(toNavNode(s));
	return out;
}

export const nav: NavNode[] = buildTree();

// Footer/legal pages (frontmatter `meta: true`), sorted like the nav.
export const metaPages: NavItem[] = metaRaw
	.sort((a, b) => (a.order !== b.order ? a.order - b.order : a.title.localeCompare(b.title)))
	.map(({ title, href, label }) => ({ title, href, label }));

// First prose paragraph of a file, cleaned of Markdown/Markdoc syntax and
// trimmed to ~155 chars — a meta-description fallback when frontmatter has
// no `description:`. Skips the frontmatter, headings, block tags, lists,
// tables, blockquotes, and fenced code.
function firstParagraph(raw: string): string | undefined {
	const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
	let para = '';
	let inFence = false;
	for (const line of body.split(/\r?\n/)) {
		const t = line.trim();
		if (t.startsWith('```')) {
			inFence = !inFence;
			continue;
		}
		if (inFence) continue;
		if (!t) {
			if (para) break;
			continue;
		}
		if (t.startsWith('#') || t.startsWith('{%') || t.startsWith('|') || t.startsWith('>')) continue;
		if (/^([-*+]|\d+\.)\s/.test(t)) continue;
		para += (para ? ' ' : '') + t;
	}
	const clean = para
		.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
		.replace(/\{%[^%]*%\}/g, '')
		.replace(/[`*_~]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (!clean) return undefined;
	return clean.length > 155 ? clean.slice(0, 152).replace(/\s+\S*$/, '') + '…' : clean;
}

/**
 * Per-page SEO metadata (title + description) keyed by clean slug. Consumed
 * by the [...slug] route's <Seo> head, sitemap.xml, and llms.txt. Covers
 * every routed page including `meta: true` legal pages; the landing page
 * ('') is excluded — it uses siteConfig. Description prefers frontmatter
 * `description:`, falling back to the first prose paragraph.
 */
export const pageMeta: Record<string, { title: string; description?: string }> = (() => {
	const out: Record<string, { title: string; description?: string }> = {};
	for (const [path, raw] of Object.entries(sources)) {
		const slug = cleanSlug(path);
		if (slug === '') continue;
		const fm = frontmatter(raw);
		const segments = path
			.replace(/^\/src\/content\//, '')
			.replace(/\.(md|markdoc)$/, '')
			.split('/');
		const file = segments[segments.length - 1];
		const isIndex = stripPrefix(file).rest.toLowerCase() === 'index';
		const titleSeg = isIndex ? (segments[segments.length - 2] ?? file) : file;
		out[slug] = {
			title: fm.title ?? titleFromSegment(titleSeg),
			description: fm.description || firstParagraph(raw)
		};
	}
	return out;
})();

// Depth-first flatten of the tree, in sidebar order, for prev/next
// navigation at the bottom of each page. Sections contribute no link
// themselves; only their leaf pages do.
function flatten(nodes: NavNode[]): NavItem[] {
	const out: NavItem[] = [];
	for (const n of nodes) {
		if (n.href) out.push({ title: n.title, href: n.href, label: n.label });
		if (n.items) out.push(...flatten(n.items));
	}
	return out;
}

export const flatNav: NavItem[] = flatten(nav);

/** Does any page in this subtree match `href`? Used to auto-open the
 *  active branch of a collapsible section. */
export function subtreeHasHref(items: NavNode[], href: string): boolean {
	for (const n of items) {
		if (n.href === href) return true;
		if (n.items && subtreeHasHref(n.items, href)) return true;
	}
	return false;
}
