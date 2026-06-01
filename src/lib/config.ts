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

	/** Theme accent color hex used for the theme-color meta tag. */
	themeColor: import.meta.env.PUBLIC_THEME_COLOR ?? '#6366F1'
} as const;

export type SiteConfig = typeof siteConfig;
