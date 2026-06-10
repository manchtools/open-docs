import { describe, it, expect } from 'vitest';
import { applyHeadingAnchors } from './markdown';

// Contract for the heading-anchor pass (the runtime port of the old
// svelte.config preprocessor). It annotates ATX headings with Markdoc
// `{% #id %}` annotations so the TOC and anchor links work:
//   - GitHub-style slugs from the *visible* heading text
//   - deduped per document
//   - fenced code (``` and ~~~, incl. longer-fence nesting) is untouched
//   - author-pinned `{% ... %}` annotations are never overwritten
//   - diacritics ASCII-fold; fully non-Latin headings get a stable hash id
//   - the id is always a non-empty ASCII identifier (never breaks a build)

const anchor = (line: string) => /\{% #([^ %]+) %\}/.exec(line)?.[1];

describe('applyHeadingAnchors', () => {
	it('annotates headings with github-style slugs', () => {
		const out = applyHeadingAnchors('# Quick start\n\n## The 30-second version\n');
		const lines = out.split('\n');
		expect(anchor(lines[0])).toBe('quick-start');
		expect(anchor(lines[2])).toBe('the-30-second-version');
	});

	it('dedupes repeated headings within one document', () => {
		const out = applyHeadingAnchors('## Setup\n\n## Setup\n');
		const ids = out.split('\n').map(anchor).filter(Boolean);
		expect(ids).toEqual(['setup', 'setup-1']);
	});

	it('slugs the visible words, stripping inline markdown', () => {
		const out = applyHeadingAnchors('## Using `bun run` with **flags** and [links](/x)\n');
		expect(anchor(out)).toBe('using-bun-run-with-flags-and-links');
	});

	it('drops ATX closing hashes from the emitted heading', () => {
		const out = applyHeadingAnchors('## Title ##\n');
		expect(out).toContain('## Title {% #title %}');
		expect(out).not.toContain('Title ##');
	});

	it('never touches fenced code, including ~~~ and nested longer fences', () => {
		const src = [
			'```',
			'# not a heading',
			'```',
			'~~~',
			'## also code',
			'~~~',
			'````md',
			'```',
			'# still inside the four-fence',
			'```',
			'````',
			'## Real heading'
		].join('\n');
		const out = applyHeadingAnchors(src);
		expect(out).toContain('# not a heading');
		expect(anchor(out.split('\n')[1])).toBeUndefined();
		expect(out).toContain('# still inside the four-fence');
		expect(out).toContain('## Real heading {% #real-heading %}');
	});

	it('leaves author-pinned ids alone', () => {
		const src = '## My section {% #my-pinned-id %}\n';
		expect(applyHeadingAnchors(src)).toBe(src);
	});

	it('ASCII-folds diacritics so the id is a valid identifier', () => {
		expect(anchor(applyHeadingAnchors('## Nächste Schritte\n'))).toBe('nachste-schritte');
		expect(anchor(applyHeadingAnchors('## Référence\n'))).toBe('reference');
		expect(anchor(applyHeadingAnchors('## Größe\n'))).toBe('grosse');
	});

	it('falls back to a stable ASCII hash for fully non-Latin headings', () => {
		const ru = anchor(applyHeadingAnchors('## Введение\n'));
		expect(ru).toMatch(/^h[a-z0-9]+$/);
		// stable: same input → same id
		expect(anchor(applyHeadingAnchors('## Введение\n'))).toBe(ru);
		// and a different heading gets a different id
		expect(anchor(applyHeadingAnchors('## 概要\n'))).not.toBe(ru);
	});

	it('dedupes even hash-fallback ids', () => {
		const out = applyHeadingAnchors('## Введение\n\n## Введение\n');
		const ids = out.split('\n').map(anchor).filter(Boolean);
		expect(ids).toHaveLength(2);
		expect(new Set(ids).size).toBe(2);
	});

	it('returns the input unchanged when there is nothing to annotate', () => {
		const src = 'Just prose.\n\n- a list\n';
		expect(applyHeadingAnchors(src)).toBe(src);
	});
});

import { applyFootnotes, stripHtmlComments } from './markdown';

describe('stripHtmlComments', () => {
	it('removes single-line and multi-line comments outside fences', () => {
		const out = stripHtmlComments('a <!-- note -->b\n<!-- multi\nline -->\nc\n');
		expect(out).not.toContain('note');
		expect(out).not.toContain('multi');
		expect(out).toContain('a b');
		expect(out).toContain('c');
	});

	it('leaves comments inside code fences alone', () => {
		const src = '```html\n<!-- keep me -->\n```\n';
		expect(stripHtmlComments(src)).toBe(src);
	});

	it('returns input unchanged when there is nothing to strip', () => {
		const src = 'plain text\n';
		expect(stripHtmlComments(src)).toBe(src);
	});
});

describe('applyFootnotes', () => {
	it('turns references into footnoteref tags and definitions into a footnotes block', () => {
		const out = applyFootnotes('Fact[^a] and more[^b].\n\n[^a]: First note.\n[^b]: Second *note*.\n');
		expect(out).toContain('{% footnoteref n=1 id="a" /%}');
		expect(out).toContain('{% footnoteref n=2 id="b" /%}');
		expect(out).not.toMatch(/^\[\^a\]:/m);
		expect(out).toContain('{% footnotes %}');
		expect(out).toContain('{% footnote id="a" n=1 %}First note.{% /footnote %}');
		expect(out).toContain('Second *note*.');
	});

	it('numbers by first reference order, not definition order', () => {
		const out = applyFootnotes('See[^z] then[^y].\n\n[^y]: Y.\n[^z]: Z.\n');
		expect(out).toContain('{% footnoteref n=1 id="z" /%}');
		expect(out).toContain('{% footnoteref n=2 id="y" /%}');
	});

	it('ignores fenced content and undefined references', () => {
		const src = '```\n[^a] not a ref\n```\n\nReal[^a] and broken[^nope].\n\n[^a]: Note.\n';
		const out = applyFootnotes(src);
		expect(out).toContain('[^a] not a ref');
		expect(out).toContain('broken[^nope]');
		expect(out).toContain('{% footnoteref n=1 id="a" /%}');
	});

	it('returns input unchanged without footnotes', () => {
		const src = 'No notes here.\n';
		expect(applyFootnotes(src)).toBe(src);
	});
});
