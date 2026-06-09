<script lang="ts">
	import { page } from '$app/state';
	import { hrefFor } from '$lib/i18n';
	import type { SiteConfig } from '$lib/site';

	// Per-page document head: title, meta description, canonical, Open Graph,
	// Twitter card, and (when multilingual) hreflang alternates. One
	// component owns all of it so there are no duplicate tags (app.html
	// intentionally carries none of these). The landing page passes no
	// title/description and falls back to siteConfig.
	//
	// JSON-LD is deliberately omitted: the production CSP emits a per-page
	// nonce, which makes the browser ignore 'unsafe-inline', so an inline
	// <script type="application/ld+json"> injected here (without that nonce)
	// would be blocked. Canonical + Open Graph + sitemap.xml + llms.txt
	// cover search-engine and AI-crawler needs without it.
	type Props = {
		/** Page title without the brand suffix. Omit on the landing page. */
		title?: string;
		/** Meta description. Falls back to siteConfig.siteDescription. */
		description?: string;
		/** Public route path, e.g. '/guides/intro' or '/'. */
		path?: string;
		type?: 'website' | 'article';
		/** Current language (for hreflang). */
		lang?: string;
		/** Language-agnostic slug (for hreflang alternates). '' is the landing. */
		slug?: string;
	};
	let { title, description, path = '/', type = 'article', slug }: Props = $props();

	// Runtime site config + language facts from the layout load.
	const siteConfig = $derived(page.data.site as SiteConfig);
	const languages = $derived((page.data.languages as string[]) ?? ['en']);
	const defaultLang = $derived((page.data.defaultLang as string) ?? 'en');
	const i18nActive = $derived((page.data.i18nActive as boolean) ?? false);
	const localizedHref = (l: string, s: string) => hrefFor(l, s, defaultLang, i18nActive);

	const fullTitle = $derived(
		title && title !== siteConfig.siteTitle
			? `${title} · ${siteConfig.brandName}`
			: siteConfig.siteTitle
	);
	const desc = $derived(description || siteConfig.siteDescription);
	// Absolute canonical/og:url when an origin is configured; otherwise
	// omitted (a relative canonical is worse than none). siteUrl is the
	// full docs base URL (include any deployment subpath in it) — we
	// deliberately don't prepend $app/paths `base`, which is a per-page
	// relative string ('..') under SvelteKit's default paths.relative.
	const canonical = $derived(
		siteConfig.siteUrl ? siteConfig.siteUrl + (path === '/' ? '' : path) : undefined
	);

	// hreflang alternates: one per language plus x-default, pointing at the
	// same slug in each. Needs an absolute origin and >1 language. Every
	// slug exists in every language (translated or default-fallback), so
	// every alternate resolves.
	const alternates = $derived(
		i18nActive && siteConfig.siteUrl && slug != null
			? languages.map((l) => ({ lang: l, href: siteConfig.siteUrl + localizedHref(l, slug) }))
			: []
	);
	const xDefault = $derived(
		i18nActive && siteConfig.siteUrl && slug != null
			? siteConfig.siteUrl + localizedHref(defaultLang, slug)
			: undefined
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={desc} />
	{#if canonical}<link rel="canonical" href={canonical} />{/if}

	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={desc} />
	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={siteConfig.brandName} />
	{#if canonical}<meta property="og:url" content={canonical} />{/if}
	<!-- Social-card image. Absolute URL (needs siteUrl); points at the
	     operator's optional static/og.png. Omitted without a site URL —
	     a relative og:image doesn't work for off-site scrapers. -->
	{#if siteConfig.siteUrl}<meta property="og:image" content={`${siteConfig.siteUrl}/og.png`} />{/if}

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={desc} />
	{#if siteConfig.siteUrl}<meta name="twitter:image" content={`${siteConfig.siteUrl}/og.png`} />{/if}

	<!-- hreflang alternates (multilingual sites with a configured origin). -->
	{#each alternates as a (a.lang)}
		<link rel="alternate" hreflang={a.lang} href={a.href} />
	{/each}
	{#if xDefault}<link rel="alternate" hreflang="x-default" href={xDefault} />{/if}
</svelte:head>
