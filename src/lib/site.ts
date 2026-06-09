// Site-chrome configuration type. In 0.4.0 the values are read from the
// environment AT RUNTIME on the server (see $lib/server/site.ts) and reach
// the client through the root layout's `load` — so rebranding a container
// needs no rebuild at all. Components consume `page.data.site`.

export type SiteConfig = {
	/** Brand name shown in the top nav and page titles. */
	brandName: string;
	/** Eyebrow under the brand name. Empty string hides it. */
	brandTagline: string;
	/** Path (relative to /static) of the brand logo. */
	logoSrc: string;
	/** Page title for the landing page; other routes use "<page> · <brand>". */
	siteTitle: string;
	/** Default meta description. */
	siteDescription: string;
	/** Repository URL for the GitHub links. Empty hides them. */
	repoUrl: string;
	/** Absolute site origin for canonical/OG/sitemap links. Empty omits them. */
	siteUrl: string;
};
