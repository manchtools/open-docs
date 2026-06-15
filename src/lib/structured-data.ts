// Schema.org / JSON-LD structured data for the document head.
//
// A pure core (no DOM, no $app state) so it unit-tests in isolation; the SEO
// component binds it to the page. It emits a single `@graph` per page:
//   - Organization + WebSite on every page (site identity; Google dedupes by
//     @id), and
//   - a BlogPosting on a dated post (rich article results: headline, author,
//     date, image).
//
// Only when PUBLIC_SITE_URL is set — every node is keyed by an absolute @id,
// and a relative @id is worse than none (the same rule the canonical link and
// og:image already follow).
//
// SECURITY: the serialized graph is printed verbatim into a
// `<script type="application/ld+json">`, so author-supplied text (title,
// description, author name) could otherwise break out with `</script>`. This
// is exactly why JSON-LD was previously left out. serializeJsonLd escapes
// `<`, `>`, `&` (and the JS line separators U+2028/U+2029) to their `\uXXXX`
// forms, which a JSON parser reads back unchanged — so the markup is inert in
// HTML but the data is preserved. `type="application/ld+json"` is a
// non-executable data block, not subject to `script-src`, so it needs no CSP
// nonce.

export type StructuredDataInput = {
	/** Absolute site origin (PUBLIC_SITE_URL, any deploy sub-path included).
	 *  Empty → no structured data is emitted. */
	siteUrl: string;
	brandName: string;
	siteTitle: string;
	siteDescription: string;
	/** Logo path (e.g. `/favicon.svg`) or an absolute URL. */
	logoSrc: string;
	/** Absolute canonical URL of this page (undefined without an origin). */
	canonical: string | undefined;
	/** Raw page title (no brand suffix); undefined on the landing page. */
	title: string | undefined;
	/** Resolved meta description. */
	description: string;
	type: 'website' | 'article';
	lang: string;
	/** Blog-post publish date (`YYYY-MM-DD`); its presence marks a post. */
	published?: string;
	/** Blog-post author display name. */
	authorName?: string;
	/** Absolute social/cover image URL (undefined without an origin). */
	image?: string;
};

const absLogo = (siteUrl: string, logoSrc: string): string =>
	/^[a-z][a-z0-9+.-]*:/i.test(logoSrc) ? logoSrc : siteUrl + (logoSrc.startsWith('/') ? logoSrc : '/' + logoSrc);

/** Build the JSON-LD `@graph` object for a page, or null when no origin. */
export function buildJsonLd(input: StructuredDataInput): Record<string, unknown> | null {
	if (!input.siteUrl) return null;
	const orgId = `${input.siteUrl}/#organization`;
	const siteId = `${input.siteUrl}/#website`;

	const organization = {
		'@type': 'Organization',
		'@id': orgId,
		name: input.brandName,
		url: input.siteUrl,
		logo: absLogo(input.siteUrl, input.logoSrc)
	};
	const website = {
		'@type': 'WebSite',
		'@id': siteId,
		name: input.siteTitle,
		url: input.siteUrl,
		description: input.siteDescription,
		inLanguage: input.lang,
		publisher: { '@id': orgId }
	};

	const graph: Array<Record<string, unknown>> = [organization, website];

	// A BlogPosting needs a publish date — a dateless docs page is not an
	// article. `canonical` is always set alongside a non-empty siteUrl.
	if (input.type === 'article' && input.published) {
		const url = input.canonical ?? input.siteUrl;
		const post: Record<string, unknown> = {
			'@type': 'BlogPosting',
			'@id': `${url}#article`,
			headline: input.title ?? input.siteTitle,
			description: input.description,
			datePublished: input.published,
			dateModified: input.published,
			inLanguage: input.lang,
			url,
			mainEntityOfPage: { '@type': 'WebPage', '@id': url },
			isPartOf: { '@id': siteId },
			publisher: { '@id': orgId }
		};
		if (input.authorName) post.author = { '@type': 'Person', name: input.authorName };
		if (input.image) post.image = input.image;
		graph.push(post);
	}

	return { '@context': 'https://schema.org', '@graph': graph };
}

/** Serialize a JSON-LD object for safe embedding in an HTML `<script>`:
 *  JSON, with the HTML-significant characters and JS line separators escaped
 *  to `\uXXXX` (inert in HTML, lossless to a JSON parser). */
export const serializeJsonLd = (obj: unknown): string =>
	JSON.stringify(obj).replace(
		/[<>&\u2028\u2029]/g,
		(c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')
	);

/** The full `<script type="application/ld+json">…</script>` for a page, or
 *  null when there is no origin to anchor absolute @ids. */
export function jsonLdScript(input: StructuredDataInput): string | null {
	const graph = buildJsonLd(input);
	return graph ? `<script type="application/ld+json">${serializeJsonLd(graph)}</script>` : null;
}
