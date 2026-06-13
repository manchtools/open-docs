import { describe, it, expect } from 'vitest';
import { mdEscapeText, mdEscapeUrl } from './md-escape';

describe('mdEscapeText (link label)', () => {
	it('backslash-escapes the brackets that would close a label early', () => {
		expect(mdEscapeText('Arrays[]: a [tricky] title')).toBe('Arrays\\[\\]: a \\[tricky\\] title');
	});
	it('escapes a literal backslash', () => {
		expect(mdEscapeText('a\\b')).toBe('a\\\\b');
	});
	it('leaves ordinary text alone', () => {
		expect(mdEscapeText('Getting started')).toBe('Getting started');
	});
});

describe('mdEscapeUrl (link target)', () => {
	it('percent-encodes parens, spaces, and angle brackets', () => {
		expect(mdEscapeUrl('https://x/a (b) <c>')).toBe('https://x/a%20%28b%29%20%3Cc%3E');
	});
	it('preserves the structural URL characters', () => {
		expect(mdEscapeUrl('https://x.example/guides/intro')).toBe('https://x.example/guides/intro');
	});
});
