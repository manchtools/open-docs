<script lang="ts">
	import { page } from '$app/state';
	import { hrefFor } from '$lib/i18n';
	import { jsonLdScript } from '$lib/structured-data';
	import type { SiteConfig } from '$lib/site';

	// Per-page document head: title, meta description, canonical, Open Graph,
	// Twitter card, JSON-LD (Schema.org), and (when multilingual) hreflang
	// alternates. One component owns all of it so there are no duplicate tags
	// (app.html intentionally carries none of these). The landing page passes
	// no title/description and falls back to siteConfig.
	//
	// JSON-LD ships as an `application/ld+json` data block (built and
	// XSS-escaped in $lib/structured-data, emitted only when PUBLIC_SITE_URL
	// gives absolute @ids). A data block is never executed, so `script-src`
	// and the CSP nonce don't apply to it — the escaping is what keeps author
	// text from breaking out of the <script>.
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
		/** Blog posts: ISO publish date → article:published_time. */
		published?: string;
		/** Blog posts: author display name → article:author. */
		authorName?: string;
		/** Page-specific social image (path under static/), e.g. a post cover. */
		image?: string;
	};
	let {
		title,
		description,
		path = '/',
		type = 'article',
		lang,
		slug,
		published = undefined,
		authorName = undefined,
		image = undefined
	}: Props = $props();

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

	// Social-card image (og:image + twitter:image): the page-specific `image`
	// rooted under the site origin, else the operator's default og.png. Needs
	// an absolute origin — a relative social image doesn't work off-site.
	const socialImage = $derived(
		siteConfig.siteUrl
			? `${siteConfig.siteUrl}/${image ? image.replace(/^\//, '') : 'og.png'}`
			: undefined
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

	// JSON-LD (Schema.org): Organization + WebSite always, plus a BlogPosting
	// on a dated post. Built and XSS-escaped in the pure core; null (nothing
	// emitted) when there is no origin to anchor absolute @ids.
	const jsonLd = $derived(
		jsonLdScript({
			siteUrl: siteConfig.siteUrl,
			brandName: siteConfig.brandName,
			siteTitle: siteConfig.siteTitle,
			siteDescription: siteConfig.siteDescription,
			logoSrc: siteConfig.logoSrc,
			canonical,
			title,
			description: desc,
			type,
			lang: lang ?? defaultLang,
			published,
			authorName,
			image: socialImage
		})
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
	{#if socialImage}
		<meta property="og:image" content={socialImage} />
	{/if}
	{#if published}<meta property="article:published_time" content={published} />{/if}
	{#if authorName}<meta property="article:author" content={authorName} />{/if}

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={desc} />
	{#if socialImage}
		<meta name="twitter:image" content={socialImage} />
	{/if}

	<!-- hreflang alternates (multilingual sites with a configured origin). -->
	{#each alternates as a (a.lang)}
		<link rel="alternate" hreflang={a.lang} href={a.href} />
	{/each}
	{#if xDefault}<link rel="alternate" hreflang="x-default" href={xDefault} />{/if}

	<!-- JSON-LD structured data. The string is a fully-formed, XSS-escaped
	     <script type="application/ld+json"> from $lib/structured-data; @html
	     emits it verbatim (escaping done at the source, not by Svelte). -->
	{#if jsonLd}{@html jsonLd}{/if}
</svelte:head>
