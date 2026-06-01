// Shared slug / ordering helpers. Both the content loader
// (src/lib/content.ts) and the sidebar builder (src/lib/nav.ts) derive
// their view of the filesystem from these functions, so URLs and the
// nav always agree. Keep the two consumers in lock-step by routing all
// path → slug conversion through here.
//
// Ordering convention: a leading `NN-` (or `NN_`, `NN.`) on any path
// segment is an ordering hint. It controls sort position and is then
// stripped from the public URL and the derived title. So:
//
//   src/content/01-get-started/02-install.md
//     → slug  "get-started/install"   (prefixes gone)
//     → group "Get started" sorts at 1, item "Install" sorts at 2
//
// Frontmatter (`order:`) takes precedence over the filename prefix when
// both are present — see src/lib/nav.ts.

/** Matches a leading numeric ordering prefix: `01-`, `2_`, `03.`, … */
const PREFIX = /^(\d+)[-_.]\s*/;

/**
 * Split a path segment into its ordering number (if any) and the
 * remaining text. `stripPrefix('02-install')` → `{ order: 2, rest:
 * 'install' }`; `stripPrefix('install')` → `{ order: null, rest:
 * 'install' }`.
 */
export function stripPrefix(segment: string): { order: number | null; rest: string } {
	const m = PREFIX.exec(segment);
	if (!m) return { order: null, rest: segment };
	return { order: Number(m[1]), rest: segment.slice(m[0].length) };
}

/**
 * Convert a `/src/content/**` file path to its canonical public slug.
 * Numeric prefixes are stripped from every segment, the extension and
 * any trailing `/index` are dropped, and the landing files (`index`,
 * `introduction`) collapse to the empty slug.
 *
 *   '/src/content/index.md'                 → ''
 *   '/src/content/introduction.md'          → ''
 *   '/src/content/01-get-started/02-foo.md' → 'get-started/foo'
 *   '/src/content/reference/index.md'       → 'reference'
 */
export function cleanSlug(path: string): string {
	const rel = path.replace(/^\/src\/content\//, '').replace(/\.(md|markdoc)$/, '');
	let slug = rel
		.split('/')
		.map((seg) => stripPrefix(seg).rest)
		.join('/');
	// Drop a trailing `index` segment: `foo/index` → `foo`, `index` → ''.
	slug = slug.replace(/(^|\/)index$/i, '$1').replace(/\/$/, '');
	// A top-level `introduction` is also the landing page.
	if (slug === 'introduction') slug = '';
	return slug;
}

/** kebab/snake-cased segment → "Sentence case" title. */
export function titleFromSegment(segment: string): string {
	const rest = stripPrefix(segment).rest;
	if (!rest || rest === 'index') return 'Introduction';
	return rest.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
