import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import MarkdocTree, { type TreeNode } from './MarkdocTree.svelte';
import { createContentStore } from '../server/content-store';

// SSR parity smoke tests: render the fixture store's trees through the
// REAL components (the same registries the 0.3.x build compiled against)
// and assert the rendered HTML carries the structures the rest of the
// system depends on — heading ids (TOC + anchors), the prose containers,
// callout markup, link hrefs, fence content. This is the contract that
// "content as data" renders the same page the old pipeline did.

const store = createContentStore({
	contentDir: 'src/lib/server/__fixtures__/content',
	defaultLang: 'en'
});

function html(lang: string, slug: string): string {
	const page = store.getPage(lang, slug);
	expect(page, `${lang}/${slug}`).toBeTruthy();
	return render(MarkdocTree, { props: { node: page!.tree as TreeNode } }).body;
}

describe('MarkdocTree SSR', () => {
	it('renders the document as an article with heading ids', () => {
		const out = html('en', 'getting-started/install');
		expect(out).toContain('<article');
		expect(out).toMatch(/<h1[^>]*id="install-guide"/);
		expect(out).toMatch(/<h2[^>]*id="second-section"/);
	});

	it('renders registry tags as their components (callout structure)', () => {
		const out = html('en', 'getting-started/install');
		expect(out).toContain('role="alert"');
		expect(out).toContain('No title here');
	});

	it('renders links through the Link component with the right href', () => {
		const out = html('en', 'getting-started/install');
		expect(out).toMatch(/<a[^>]*href="\/getting-started\/usage"/);
	});

	it('renders fences with their code content intact', () => {
		const out = html('en', 'getting-started/usage');
		expect(out).toContain('# not a heading');
	});

	it('renders plain markdown (emphasis, paragraphs) as HTML elements', () => {
		const out = html('en', '');
		expect(out).toContain('<p>');
		expect(out).toContain('The landing page body.');
	});

	it('renders the translated tree for translated pages', () => {
		const out = html('de', 'getting-started/install');
		expect(out).toContain('Installieren Sie mit Bedacht');
		expect(out).not.toContain('Install with care');
	});
});

describe('hero + avatar blocks', () => {
	it('renders hero and avatar as adjacent siblings (overlap pairing contract)', () => {
		const out = html('en', 'blog/first-post');
		// hero with image + title overlay
		expect(out).toMatch(/od-hero[^>]*>/);
		expect(out).toMatch(/<img[^>]*src="\/screenshots\/exists\.png"/);
		// avatar with the ringed image the adjacency CSS targets
		expect(out).toMatch(/od-avatar[^"]*"/);
		expect(out).toMatch(/od-avatar-img/);
		expect(out).toContain('Builds manchtools.');
		// adjacency: the avatar block follows the hero block directly
		const heroIdx = out.indexOf('od-hero');
		const avatarIdx = out.indexOf('od-avatar');
		expect(heroIdx).toBeGreaterThan(-1);
		expect(avatarIdx).toBeGreaterThan(heroIdx);
	});

	it('avatar renders standalone without an image', () => {
		// name without src — no <img>, still a card
		const tree = {
			name: 'Avatar',
			attributes: { name: 'Solo Author', description: 'No picture.' },
			children: []
		};
		const out = render(MarkdocTree, { props: { node: tree as never } }).body;
		expect(out).toContain('Solo Author');
		expect(out).toContain('No picture.');
		expect(out).not.toContain('od-avatar-img');
	});
});

describe('quote + gallery blocks', () => {
	it('renders a pull-quote with linked attribution', () => {
		const out = html('en', 'blog/second-post');
		expect(out).toContain('od-quote');
		expect(out).toContain('The engine weaves algebraic patterns.');
		expect(out).toMatch(/<a[^>]*href="https:\/\/example\.com"[^>]*>Ada Lovelace<\/a>/);
	});

	it('renders a gallery grid with the child images', () => {
		const out = html('en', 'blog/second-post');
		expect(out).toContain('od-gallery');
		expect((out.match(/<img[^>]*alt="(one|two)"/g) ?? []).length).toBe(2);
	});
});

describe('avatar referencing an author page', () => {
	it('resolves name/avatar/bio from the page', () => {
		const out = html('en', 'blog/second-post');
		expect(out).toContain('Jane Doe');
		expect(out).toMatch(/<img src="\/screenshots\/exists\.png"[^>]*od-avatar-img/);
		expect(out).toMatch(/<a href="\/blog\/authors\/jane"[^>]*>Jane Doe/);
		expect(out).toContain('Writes the second posts.');
	});
});

describe('GFM task lists', () => {
	it('renders checkboxes for [ ] and [x] items, plain items untouched', () => {
		const out = html('en', 'getting-started/usage');
		expect((out.match(/type="checkbox"/g) ?? []).length).toBe(2);
		expect(out).toMatch(/checked[^>]*>[\s\S]{0,200}done task/);
		expect(out).not.toContain('[ ]');
		expect(out).not.toContain('[x]');
		expect(out).toContain('plain item');
	});
});

describe('footnotes + comment stripping (rendered)', () => {
	it('renders sup reference, end list with backlink, and no comments', () => {
		const out = html('en', 'getting-started/install');
		expect(out).toMatch(/<sup[^>]*od-fnref[\s\S]*?href="#fn-src"[^>]*id="fnref-src"/);
		expect(out).toMatch(/<li id="fn-src"[\s\S]*?manual[\s\S]*?href="#fnref-src"/);
		expect(out).not.toContain('hide me');
	});
});
