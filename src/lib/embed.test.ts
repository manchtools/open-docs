import { describe, it, expect } from 'vitest';
import { toEmbedSrc } from './embed';

// Contract: {% embed src %} becomes an <iframe src>. The normaliser must
// rewrite YouTube/Vimeo to their privacy embed form AND refuse any URL whose
// scheme is not http(s) — a javascript:/data:/etc. URL in an iframe src is a
// stored-XSS sink. A rejected URL returns '' so the component renders a
// fallback instead of a live frame.

describe('toEmbedSrc — provider normalisation', () => {
	it('normalises a YouTube watch URL to the nocookie embed', () => {
		expect(toEmbedSrc('https://www.youtube.com/watch?v=abc123')).toBe(
			'https://www.youtube-nocookie.com/embed/abc123'
		);
	});
	it('normalises a youtu.be short URL', () => {
		expect(toEmbedSrc('https://youtu.be/abc123')).toBe(
			'https://www.youtube-nocookie.com/embed/abc123'
		);
	});
	it('normalises a Vimeo URL', () => {
		expect(toEmbedSrc('https://vimeo.com/12345')).toBe('https://player.vimeo.com/video/12345');
	});
	it('passes a generic https URL through unchanged', () => {
		expect(toEmbedSrc('https://example.com/embed/x')).toBe('https://example.com/embed/x');
	});
});

describe('toEmbedSrc — rejects non-http(s) schemes (XSS sink)', () => {
	for (const bad of [
		'javascript:alert(1)',
		'data:text/html,<script>alert(1)</script>',
		'vbscript:msgbox(1)',
		'  javascript:alert(1)',
		'JAVASCRIPT:alert(1)',
		'file:///etc/passwd'
	]) {
		it(`returns '' for ${JSON.stringify(bad)}`, () => {
			expect(toEmbedSrc(bad)).toBe('');
		});
	}

	it("returns '' for an unparseable value rather than echoing it", () => {
		expect(toEmbedSrc('not a url')).toBe('');
	});
});
