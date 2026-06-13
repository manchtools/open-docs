import { describe, it, expect } from 'vitest';
import { joinAbsUrl } from './url';

// Contract: compose origin + base + site-root path into one absolute URL,
// preserving the documented fallback (relative URL) when the origin is unset.
describe('joinAbsUrl', () => {
	it('joins origin, base, and path into an absolute URL', () => {
		expect(joinAbsUrl('https://docs.example.com', '/docs', '/blog/post')).toBe(
			'https://docs.example.com/docs/blog/post'
		);
	});

	it('with no base, joins origin + path', () => {
		expect(joinAbsUrl('https://docs.example.com', '', '/blog/post')).toBe(
			'https://docs.example.com/blog/post'
		);
	});

	it('with no origin, yields a base-correct relative URL (the unset-PUBLIC_SITE_URL fallback)', () => {
		expect(joinAbsUrl('', '/docs', '/blog/post')).toBe('/docs/blog/post');
		expect(joinAbsUrl('', '', '/blog/post')).toBe('/blog/post');
	});
});
