import { describe, it, expect } from 'vitest';
import { renderSitemap } from './sitemap';

// Contract: every <loc> is XML-escaped so an author-supplied tag/slug or a
// misconfigured origin can neither break the document nor inject new entries.
describe('renderSitemap', () => {
	it('emits a well-formed urlset for ordinary paths', () => {
		const xml = renderSitemap('https://x.example', ['/', '/guides/intro']);
		expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
		expect(xml).toContain('<loc>https://x.example/</loc>');
		expect(xml).toContain('<loc>https://x.example/guides/intro</loc>');
	});

	it('XML-escapes & < > in a path (author-controlled tag slug)', () => {
		const xml = renderSitemap('https://x.example', ['/blog/tags/a&b<c>d']);
		expect(xml).toContain('<loc>https://x.example/blog/tags/a&amp;b&lt;c&gt;d</loc>');
		// the raw, structure-breaking characters never appear inside a loc value
		expect(xml).not.toContain('a&b<c>d');
	});

	it('prevents element injection via a crafted path', () => {
		const xml = renderSitemap('https://x.example', ['/x</loc></url><url><loc>https://evil']);
		expect(xml).not.toContain('<loc>https://evil');
		expect(xml).toContain('&lt;/loc&gt;&lt;/url&gt;&lt;url&gt;&lt;loc&gt;');
	});

	it('escapes the origin too', () => {
		const xml = renderSitemap('https://x.example/a&b', ['/p']);
		expect(xml).toContain('<loc>https://x.example/a&amp;b/p</loc>');
	});
});
