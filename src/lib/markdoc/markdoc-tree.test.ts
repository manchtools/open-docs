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
