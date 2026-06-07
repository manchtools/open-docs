// Single source of truth for everything an operator might want to
// rebrand / configure when running open-docs. Every value here is
// pulled in by the layout, top-nav, page-title, and svelte.config.js.
//
// All fields are overridable at build time via env vars (read in
// svelte.config.js / vite.config.ts) so a container image can be
// rebranded without editing source. The defaults here are what ship
// when no env is set.

export const siteConfig = {
	/** Brand name shown in the top nav and page titles. */
	brandName: import.meta.env.PUBLIC_BRAND_NAME ?? 'open-docs',

	/**
	 * Eyebrow under the brand name in the top-nav. e.g. "docs",
	 * "handbook", "reference". Empty string hides it.
	 */
	brandTagline: import.meta.env.PUBLIC_BRAND_TAGLINE ?? 'docs',

	/** Path (relative to /static) of the brand logo. */
	logoSrc: import.meta.env.PUBLIC_LOGO_SRC ?? '/favicon.svg',

	/**
	 * Page title shown in the browser tab on the landing page.
	 * Other routes use "<page title> · <brandName>".
	 */
	siteTitle: import.meta.env.PUBLIC_SITE_TITLE ?? 'open-docs',

	/** Meta description for og:description and the <meta name="description">. */
	siteDescription:
		import.meta.env.PUBLIC_SITE_DESCRIPTION ??
		'Documentation site built with open-docs.',

	/**
	 * Repository URL the "Edit on GitHub" footer link points at.
	 * Set to empty string to hide the link.
	 */
	repoUrl: import.meta.env.PUBLIC_REPO_URL ?? '',

	/**
	 * Absolute site origin, e.g. `https://docs.example.com` (no trailing
	 * slash). Powers canonical URLs, Open Graph `og:url`, `sitemap.xml`,
	 * `robots.txt`, and the `llms.txt` AI index. Leave empty to omit
	 * absolute URLs (canonical and og:url are then skipped; the sitemap
	 * and llms.txt still build but with path-only, non-absolute links).
	 */
	siteUrl: (import.meta.env.PUBLIC_SITE_URL ?? '').replace(/\/+$/, '')
} as const;

export type SiteConfig = typeof siteConfig;
