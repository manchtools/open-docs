// Client-safe navigation types + helpers, shared by the sidebar components
// (browser) and the server content store. No content data lives here — in
// 0.4.0 the data is derived at runtime on the server and arrives in the
// client via `load`.

/** A leaf link in the sidebar / prev-next list. */
export type NavItem = {
	title: string;
	href: string;
	/** Optional short label for the sidebar — defaults to title. */
	label?: string;
};

/**
 * A node in the sidebar tree. A node is either a *page* (has `href`, no
 * `items`) or a *section* (has `items`, and `href` when it has an index
 * page). The top-level array may also contain a single empty-title section
 * holding the ungrouped root pages.
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

/** Does any page in this subtree match `href`? Used to auto-open the
 *  active branch of a collapsible section. */
export function subtreeHasHref(items: NavNode[], href: string): boolean {
	for (const n of items) {
		if (n.href === href) return true;
		if (n.items && subtreeHasHref(n.items, href)) return true;
	}
	return false;
}
