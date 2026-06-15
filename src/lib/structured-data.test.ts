import { describe, it, expect } from 'vitest';
import { buildJsonLd, serializeJsonLd, jsonLdScript, type StructuredDataInput } from './structured-data';

// Contract for Schema.org / JSON-LD structured data. Two halves:
//   - buildJsonLd: the @graph shape per page type (Organization + WebSite
//     everywhere, BlogPosting on a dated post), all URLs absolute, and only
//     when an origin (PUBLIC_SITE_URL) is configured — a relative @id is
//     worse than none, exactly like the canonical/OG handling.
//   - serializeJsonLd / jsonLdScript: XSS-safe embedding. The block is
//     printed verbatim into a <script>, so author text (title, author,
//     description) MUST NOT be able to break out of the element. This is the
//     reason JSON-LD was previously left out; the escaping is the point.

const BASE: StructuredDataInput = {
	siteUrl: 'https://docs.example.com',
	brandName: 'Acme Docs',
	siteTitle: 'Acme Documentation',
	siteDescription: 'Everything about Acme.',
	logoSrc: '/favicon.svg',
	canonical: 'https://docs.example.com/blog/launch',
	title: 'The launch post',
	description: 'How we launched.',
	type: 'article',
	lang: 'en',
	published: '2026-06-01',
	authorName: 'Ada Lovelace',
	image: 'https://docs.example.com/covers/launch.png'
};
const node = (g: ReturnType<typeof buildJsonLd>, t: string) =>
	(g as { '@graph': Array<Record<string, unknown>> })['@graph'].find((n) => n['@type'] === t);

describe('buildJsonLd — graph shape', () => {
	it('returns null without an origin (no structured data beats relative @ids)', () => {
		expect(buildJsonLd({ ...BASE, siteUrl: '', canonical: undefined, image: undefined })).toBeNull();
	});

	it('always emits Organization + WebSite tied by @id', () => {
		const g = buildJsonLd({ ...BASE, type: 'website', title: undefined, published: undefined })!;
		expect(g['@context']).toBe('https://schema.org');
		const org = node(g, 'Organization')!;
		const site = node(g, 'WebSite')!;
		expect(org['@id']).toBe('https://docs.example.com/#organization');
		expect(org.name).toBe('Acme Docs');
		expect(org.url).toBe('https://docs.example.com');
		expect(org.logo).toBe('https://docs.example.com/favicon.svg');
		expect(site['@id']).toBe('https://docs.example.com/#website');
		expect(site.name).toBe('Acme Documentation');
		expect(site.publisher).toEqual({ '@id': 'https://docs.example.com/#organization' });
		expect(node(g, 'BlogPosting')).toBeUndefined();
	});

	it('adds a BlogPosting for a dated post, linked to the site and publisher', () => {
		const g = buildJsonLd(BASE)!;
		const post = node(g, 'BlogPosting')!;
		expect(post.headline).toBe('The launch post');
		expect(post.description).toBe('How we launched.');
		expect(post.datePublished).toBe('2026-06-01');
		expect(post.dateModified).toBe('2026-06-01');
		expect(post.author).toEqual({ '@type': 'Person', name: 'Ada Lovelace' });
		expect(post.image).toBe('https://docs.example.com/covers/launch.png');
		expect(post.url).toBe('https://docs.example.com/blog/launch');
		expect(post.inLanguage).toBe('en');
		expect(post.mainEntityOfPage).toEqual({ '@type': 'WebPage', '@id': 'https://docs.example.com/blog/launch' });
		expect(post.isPartOf).toEqual({ '@id': 'https://docs.example.com/#website' });
		expect(post.publisher).toEqual({ '@id': 'https://docs.example.com/#organization' });
	});

	it('does NOT make a dateless page (a docs page) a BlogPosting', () => {
		const g = buildJsonLd({ ...BASE, published: undefined, authorName: undefined })!;
		expect(node(g, 'BlogPosting')).toBeUndefined();
		expect(node(g, 'WebSite')).toBeTruthy();
	});

	it('omits the author when the post has none', () => {
		const g = buildJsonLd({ ...BASE, authorName: undefined })!;
		expect(node(g, 'BlogPosting')!.author).toBeUndefined();
	});

	it('emits only absolute URLs everywhere', () => {
		const g = buildJsonLd(BASE)!;
		const urls: string[] = [];
		JSON.stringify(g, (k, v) => {
			if ((k === '@id' || k === 'url' || k === 'logo' || k === 'image') && typeof v === 'string') urls.push(v);
			return v;
		});
		expect(urls.length).toBeGreaterThan(0);
		for (const u of urls) expect(u.startsWith('https://docs.example.com'), u).toBe(true);
	});
});

describe('serializeJsonLd — XSS-safe embedding', () => {
	it('neutralises a </script> breakout in author-supplied text', () => {
		const out = serializeJsonLd({ name: '</script><img src=x onerror=alert(1)>' });
		// No raw closing tag or markup may survive into the <script> body.
		expect(out).not.toContain('</script');
		expect(out).not.toContain('<img');
		expect(out).toContain('\\u003c'); // the '<' became an escape
	});

	it('escapes <, >, & and the JS line separators U+2028/U+2029', () => {
		const out = serializeJsonLd({ a: '<', b: '>', c: '&', d: '\u2028', e: '\u2029' });
		expect(out).toContain('\\u003c');
		expect(out).toContain('\\u003e');
		expect(out).toContain('\\u0026');
		expect(out).toContain('\\u2028');
		expect(out).toContain('\\u2029');
		expect(out).not.toMatch(/[<>&\u2028\u2029]/); // none survive literally
	});

	it('preserves the data — escaping is reversible by a JSON parser', () => {
		const evil = 'A & B </script> <b>"x"</b>';
		const parsed = JSON.parse(serializeJsonLd({ name: evil }));
		expect(parsed.name).toBe(evil); // a JSON parser reads < back as '<'
	});
});

describe('jsonLdScript — the head element', () => {
	it('wraps the graph in an application/ld+json script', () => {
		const s = jsonLdScript(BASE)!;
		expect(s.startsWith('<script type="application/ld+json">')).toBe(true);
		expect(s.endsWith('</script>')).toBe(true);
	});

	it('returns null without an origin', () => {
		expect(jsonLdScript({ ...BASE, siteUrl: '', canonical: undefined, image: undefined })).toBeNull();
	});

	it('a hostile title cannot break out of the script, yet parses back verbatim', () => {
		const s = jsonLdScript({ ...BASE, title: '</script><script>alert(1)</script>' })!;
		// Exactly one opening and one closing tag — no injected element.
		expect(s.match(/<script/g)?.length).toBe(1);
		expect(s.match(/<\/script>/g)?.length).toBe(1);
		const inner = s.slice('<script type="application/ld+json">'.length, -'</script>'.length);
		const graph = JSON.parse(inner) as { '@graph': Array<Record<string, unknown>> };
		const post = graph['@graph'].find((n) => n['@type'] === 'BlogPosting')!;
		expect(post.headline).toBe('</script><script>alert(1)</script>');
	});
});
