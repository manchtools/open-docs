import { describe, it, expect } from 'vitest';
import { escapeXmlText, escapeXmlAttr } from './escape';

// Contract: these are the ONE escaping pair used for every hand-built XML
// surface (feed, feed-render, sitemap). They must neutralise the characters
// that would otherwise let author/operator-supplied text break out of an
// element or attribute and inject new XML structure.

describe('escapeXmlText (element text)', () => {
	it('escapes the structural characters that break element text', () => {
		expect(escapeXmlText('a & b < c > d')).toBe('a &amp; b &lt; c &gt; d');
	});

	it('neutralises a tag-injection attempt in author text', () => {
		// A crafted title/slug must not be able to open a real element.
		expect(escapeXmlText('</loc></url><url><loc>evil')).toBe(
			'&lt;/loc&gt;&lt;/url&gt;&lt;url&gt;&lt;loc&gt;evil'
		);
	});

	it('escapes ampersand FIRST so it does not double-encode the entities it makes', () => {
		expect(escapeXmlText('<')).toBe('&lt;');
		expect(escapeXmlText('&lt;')).toBe('&amp;lt;');
	});

	it('leaves a double quote alone in text context', () => {
		expect(escapeXmlText('say "hi"')).toBe('say "hi"');
	});

	it('passes ordinary text through untouched', () => {
		expect(escapeXmlText('https://example.com/getting-started')).toBe(
			'https://example.com/getting-started'
		);
	});
});

describe('escapeXmlAttr (double-quoted attribute)', () => {
	it('escapes the quote that would close the attribute, plus the text set', () => {
		expect(escapeXmlAttr('x" onload="alert(1)')).toBe('x&quot; onload=&quot;alert(1)');
		expect(escapeXmlAttr('a & <b>')).toBe('a &amp; &lt;b&gt;');
	});

	it('is a strict superset of the text escaper', () => {
		const sample = 'A & B < C > D " E';
		// every entity the text escaper produces is still present, plus &quot;
		expect(escapeXmlAttr(sample)).toBe(escapeXmlText(sample).replace(/"/g, '&quot;'));
	});
});
