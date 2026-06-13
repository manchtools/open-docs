import { describe, it, expect } from 'vitest';
import { looksLikeInlineSvg, validateSvgIcon } from './svg-icon';

// Contract: an inline-SVG icon is rendered verbatim via {@html}, so the boot
// must accept ONLY a plain presentational SVG and reject every script /
// external-load / handler vector. The "wrong" inputs are sourced from known
// SVG-XSS vectors, not from the validator's own allow-list.

describe('looksLikeInlineSvg', () => {
	it('detects an inline svg, ignoring leading space and case', () => {
		expect(looksLikeInlineSvg('  <SVG viewBox="0 0 1 1"></SVG>')).toBe(true);
	});
	it('is false for emoji, image paths, and empty', () => {
		expect(looksLikeInlineSvg('🚀')).toBe(false);
		expect(looksLikeInlineSvg('/static/icon.svg')).toBe(false);
		expect(looksLikeInlineSvg('https://x/i.svg')).toBe(false);
		expect(looksLikeInlineSvg(undefined)).toBe(false);
	});
});

describe('validateSvgIcon — accepts plain presentational SVG', () => {
	it('accepts a realistic Lucide-style icon', () => {
		const icon =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
			'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
			'<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
		expect(validateSvgIcon(icon)).toBeNull();
	});

	it('accepts a gradient-filled icon with title/desc', () => {
		const icon =
			'<svg viewBox="0 0 10 10"><title>Star</title><defs>' +
			'<linearGradient id="g"><stop offset="0%" stop-color="#f00"/></linearGradient></defs>' +
			'<circle cx="5" cy="5" r="4" fill="url(#g)"/></svg>';
		expect(validateSvgIcon(icon)).toBeNull();
	});
});

describe('validateSvgIcon — rejects script / handler / load vectors', () => {
	const vectors: Record<string, string> = {
		'inline onload handler': '<svg onload="alert(1)" viewBox="0 0 1 1"></svg>',
		'script element': '<svg><script>alert(1)</script></svg>',
		'foreignObject': '<svg><foreignObject><img src="x" onerror="alert(1)"></foreignObject></svg>',
		'nested image with onerror': '<svg><image href="x" onerror="alert(1)"/></svg>',
		'SMIL animate onbegin': '<svg><animate onbegin="alert(1)" attributeName="x" dur="1s"/></svg>',
		'set element': '<svg><set attributeName="onload" to="alert(1)"/></svg>',
		'anchor with javascript href': '<svg><a href="javascript:alert(1)"><circle r="1"/></a></svg>',
		'xlink:href on use': '<svg><use xlink:href="data:image/svg+xml,..."/></svg>',
		'event handler on a path': '<svg><path d="M0 0" onclick="alert(1)"/></svg>',
		'style element': '<svg><style>* { background: url(http://evil/x) }</style></svg>',
		'style attribute': '<svg><rect style="background:url(http://evil)"/></svg>',
		'external url() in clip-path': '<svg><path d="M0 0" clip-path="url(http://evil/x#c)"/></svg>',
		'entity-encoded payload': '<svg>&#60;script&#62;alert(1)&#60;/script&#62;</svg>',
		'html comment smuggling': '<svg><!-- <script>alert(1)</script> --></svg>',
		'stray angle bracket': '<svg><path d="M0 0"/> < <circle r="1"/></svg>'
	};

	for (const [name, payload] of Object.entries(vectors)) {
		it(`rejects: ${name}`, () => {
			expect(validateSvgIcon(payload), name).not.toBeNull();
		});
	}

	it('rejects something that is not an svg at all', () => {
		expect(validateSvgIcon('<div>nope</div>')).not.toBeNull();
	});

	it('rejects an oversize blob', () => {
		expect(validateSvgIcon('<svg>' + 'a'.repeat(20000) + '</svg>')).not.toBeNull();
	});
});
