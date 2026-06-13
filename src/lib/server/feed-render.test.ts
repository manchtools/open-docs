import { describe, it, expect } from 'vitest';
import { renderFeedHtml, type FeedRenderContext } from './feed-render';

// Contract for the feed render profile — the second render target that walks
// the Markdoc AST and emits clean, reader-facing HTML for feed readers and
// HTML→Markdown importers. The page's UI chrome (heading copy-link anchors +
// Lucide <svg>, data-pagefind-* weights, the <article> wrapper, lightbox/JS
// hooks, window chrome) is added by the SVELTE COMPONENTS, never present in
// the AST — so this renderer must (a) emit semantic body HTML only, (b)
// degrade interactive blocks to static equivalents, and (c) make every URL
// absolute against PUBLIC_SITE_URL (+ BASE_PATH). These tests drive synthetic
// AST nodes shaped exactly like the real transform output.

const SITE: FeedRenderContext = { siteUrl: 'https://docs.example.com', basePath: '' };
const r = (node: unknown, ctx: FeedRenderContext = SITE) => renderFeedHtml(node as never, ctx);
const tag = (name: string, attributes: Record<string, unknown>, children?: unknown) => ({
	$$mdtype: 'Tag',
	name,
	attributes,
	children
});

describe('headings — plain, no anchor/icon chrome', () => {
	it('renders an h-level with its id and text, and nothing else', () => {
		const out = r(tag('Heading', { level: 2, id: 'install' }, ['Install ', 'guide']));
		expect(out).toBe('<h2 id="install">Install guide</h2>');
		// The page would add a copy-link <a> with a Lucide <svg> and a
		// data-pagefind-weight — none of that may appear.
		expect(out).not.toContain('<svg');
		expect(out).not.toContain('data-pagefind');
		expect(out).not.toContain('Copy link');
		expect(out).not.toContain('group/anchor');
	});

	it('clamps the level into h1–h6', () => {
		expect(r(tag('Heading', { level: 9 }, ['x']))).toBe('<h6>x</h6>');
		expect(r(tag('Heading', { level: 0 }, ['x']))).toBe('<h1>x</h1>');
	});

	it('trims the trailing space the source heading left where the anchor sat', () => {
		// e.g. "# v0.6.1" yields a heading whose text is "v0.6.1 ".
		expect(r(tag('Heading', { level: 2, id: 'v061' }, ['v0.6.1 ']))).toBe('<h2 id="v061">v0.6.1</h2>');
	});
});

describe('leading top-level <h1> is dropped (it duplicates the entry <title>)', () => {
	it('drops the first body block when it is an h1, keeping the rest', () => {
		const out = r(
			tag('article', {}, [
				tag('Heading', { level: 1, id: 't' }, ['v0.6.1']),
				tag('Paragraph', {}, ['Body.'])
			])
		);
		expect(out).toBe('<p>Body.</p>');
		expect(out).not.toContain('<h1');
	});

	it('keeps deeper headings — only the leading h1 goes', () => {
		const out = r(
			tag('article', {}, [
				tag('Heading', { level: 1 }, ['Title']),
				tag('Paragraph', {}, ['Intro.']),
				tag('Heading', { level: 2, id: 's' }, ['Section'])
			])
		);
		expect(out).toBe('<p>Intro.</p><h2 id="s">Section</h2>');
	});

	it('does not drop a leading heading that is not level 1', () => {
		const out = r(tag('article', {}, [tag('Heading', { level: 2 }, ['Sub']), tag('Paragraph', {}, ['x'])]));
		expect(out).toBe('<h2>Sub</h2><p>x</p>');
	});

	it('does not drop an h1 that is not the leading block', () => {
		const out = r(tag('article', {}, [tag('Paragraph', {}, ['Lead.']), tag('Heading', { level: 1 }, ['H'])]));
		expect(out).toBe('<p>Lead.</p><h1>H</h1>');
	});
});

describe('document wrapper is dropped', () => {
	it('emits only the body, never the outer <article>', () => {
		const out = r(tag('article', {}, [tag('Paragraph', {}, ['hi'])]));
		expect(out).toBe('<p>hi</p>');
		expect(out).not.toContain('<article');
	});
});

describe('links — resolved and absolute', () => {
	it('makes a site-root href absolute (the store already resolved ./x.md → /x)', () => {
		const out = r(tag('Link', { href: '/getting-started/usage' }, ['Usage']));
		expect(out).toBe('<a href="https://docs.example.com/getting-started/usage">Usage</a>');
	});
	it('prefixes BASE_PATH as well', () => {
		const out = r(tag('Link', { href: '/guides/x' }, ['x']), { siteUrl: 'https://docs.example.com', basePath: '/docs' });
		expect(out).toContain('href="https://docs.example.com/docs/guides/x"');
	});
	it('leaves external, mailto and in-page anchors untouched', () => {
		expect(r(tag('Link', { href: 'https://other.com/p' }, ['o']))).toContain('href="https://other.com/p"');
		expect(r(tag('Link', { href: 'mailto:a@b.c' }, ['m']))).toContain('href="mailto:a@b.c"');
		expect(r(tag('Link', { href: '#section' }, ['s']))).toContain('href="#section"');
	});
	it('keeps URLs relative when PUBLIC_SITE_URL is unset', () => {
		const out = r(tag('Link', { href: '/a/b' }, ['x']), { siteUrl: '', basePath: '' });
		expect(out).toBe('<a href="/a/b">x</a>');
	});
});

describe('images — static, absolute, alt preserved, no window chrome', () => {
	it('screenshot bare name resolves under /screenshots/ and absolute', () => {
		const out = r(tag('Screenshot', { src: 'dashboard.png', alt: 'Dash', variant: 'frame' }));
		expect(out).toBe('<figure><img src="https://docs.example.com/screenshots/dashboard.png" alt="Dash" /></figure>');
		// No faux-browser frame, traffic lights, picture/source, or lazy hooks.
		expect(out).not.toContain('<picture');
		expect(out).not.toContain('traffic');
	});
	it('screenshot rooted path passes through (only origin prepended)', () => {
		const out = r(tag('Screenshot', { src: '/screenshots/exists.png', alt: 'x' }));
		expect(out).toContain('src="https://docs.example.com/screenshots/exists.png"');
	});
	it('hero/avatar bare name is ROOT-relative, not under /screenshots/', () => {
		// Regression: an author-page avatar `avatar: screenshots/x.png` must not
		// become /screenshots/screenshots/x.png.
		expect(r(tag('Hero', { src: 'cover.png', alt: 'c', title: 'T' }))).toContain(
			'src="https://docs.example.com/cover.png"'
		);
		const av = r(tag('Avatar', { src: 'screenshots/ada.png', name: 'Ada', description: 'Bio' }));
		expect(av).toContain('src="https://docs.example.com/screenshots/ada.png"');
		expect(av).not.toContain('screenshots/screenshots');
	});
	it('hero drops the title overlay, keeps a plain <img alt>', () => {
		const out = r(tag('Hero', { src: '/c.png', alt: 'Cover', title: 'Big news', subtitle: 'sub' }));
		expect(out).toBe('<figure><img src="https://docs.example.com/c.png" alt="Cover" /></figure>');
		expect(out).not.toContain('Big news');
	});
	it('web image URLs pass through unchanged', () => {
		expect(r(tag('Screenshot', { src: 'https://cdn.example/x.png', alt: 'a' }))).toContain(
			'src="https://cdn.example/x.png"'
		);
	});
});

describe('gallery — plain figures, no lightbox', () => {
	it('flattens to a sequence of <figure>, dropping the grid/JS wrapper', () => {
		const out = r(
			tag('Gallery', {}, [
				tag('Screenshot', { src: '/one.png', alt: 'one', variant: 'flat', implicit: true }),
				tag('Screenshot', { src: '/two.png', alt: 'two', variant: 'flat', implicit: true })
			])
		);
		expect((out.match(/<figure>/g) ?? []).length).toBe(2);
		expect(out).toContain('alt="one"');
		expect(out).toContain('alt="two"');
		expect(out).not.toContain('od-gallery');
		expect(out).not.toContain('class=');
	});
});

describe('quote — blockquote with optional cite', () => {
	it('renders a blockquote and a linked cite', () => {
		const out = r(
			tag('Quote', { by: 'Ada Lovelace', cite: 'https://example.com' }, [tag('Paragraph', {}, ['The engine.'])])
		);
		expect(out).toBe(
			'<blockquote><p>The engine.</p><cite><a href="https://example.com">Ada Lovelace</a></cite></blockquote>'
		);
	});
	it('omits cite when no attribution is given', () => {
		const out = r(tag('Quote', {}, [tag('Paragraph', {}, ['x'])]));
		expect(out).toBe('<blockquote><p>x</p></blockquote>');
	});
});

describe('callout — semantic blockquote, no role/class chrome', () => {
	it('keeps the title and body, drops the alert styling', () => {
		const out = r(tag('Callout', { type: 'warn', title: 'Heads up' }, [tag('Paragraph', {}, ['Be careful.'])]));
		expect(out).toBe('<blockquote><p><strong>Heads up</strong></p><p>Be careful.</p></blockquote>');
		expect(out).not.toContain('role="alert"');
		expect(out).not.toContain('class=');
	});
});

describe('code fences — static, mermaid degraded', () => {
	it('renders a fenced block with its language class and escaped content', () => {
		const out = r(tag('Fence', { content: 'const x = 1 < 2;\n', language: 'ts' }));
		expect(out).toBe('<pre><code class="language-ts">const x = 1 &lt; 2;\n</code></pre>');
	});
	it('degrades a mermaid diagram to its source as a static code block (no JS placeholder)', () => {
		const out = r(tag('Fence', { content: 'graph TD; A-->B;\n', language: 'mermaid' }));
		expect(out).toBe('<pre><code class="language-mermaid">graph TD; A--&gt;B;\n</code></pre>');
		expect(out).not.toContain('mermaid-pending');
		expect(out).not.toContain('<svg');
	});
});

describe('tables', () => {
	it('maps the table component parts to native table HTML', () => {
		const out = r(
			tag('Table', {}, [
				tag('Thead', {}, [tag('Tr', {}, [tag('Th', {}, ['H'])])]),
				tag('Tbody', {}, [tag('Tr', {}, [tag('Td', {}, ['C'])])])
			])
		);
		expect(out).toBe('<table><thead><tr><th>H</th></tr></thead><tbody><tr><td>C</td></tr></tbody></table>');
	});
});

describe('attribute hygiene on passthrough elements', () => {
	it('drops class/style/data-* but keeps semantic attributes', () => {
		const out = r(
			tag('ul', { class: 'od-list', 'data-pagefind-weight': '3' }, [
				tag('li', { class: 'od-task', id: 'keep' }, ['item'])
			])
		);
		expect(out).toBe('<ul><li id="keep">item</li></ul>');
		expect(out).not.toContain('data-pagefind');
		expect(out).not.toContain('class=');
	});
	it('renders a disabled task checkbox as a self-closed void element', () => {
		const out = r(tag('input', { type: 'checkbox', disabled: true, checked: true }));
		expect(out).toBe('<input type="checkbox" disabled checked />');
	});
});

describe('layout/unknown components unwrap to their content', () => {
	it('drops Columns/Column/Steps wrappers, keeps the content', () => {
		const out = r(tag('Columns', {}, [tag('Column', {}, [tag('Paragraph', {}, ['a'])]), tag('Column', {}, [tag('Paragraph', {}, ['b'])])]));
		expect(out).toBe('<p>a</p><p>b</p>');
	});
	it('unwraps an unmapped component rather than emitting an invalid tag', () => {
		const out = r(tag('SomeFutureBlock', { foo: 'bar' }, ['inner']));
		expect(out).toBe('inner');
		expect(out).not.toContain('SomeFutureBlock');
		expect(out).not.toContain('somefutureblock');
	});
});

describe('embeds degrade to a link', () => {
	it('renders an iframe embed as a link to the source (feeds run no JS)', () => {
		const out = r(tag('Embed', { src: 'https://youtu.be/abc' }));
		expect(out).toBe('<p><a href="https://youtu.be/abc">https://youtu.be/abc</a></p>');
	});
});

describe('text and attribute escaping', () => {
	it('HTML-escapes text content so it stays valid HTML inside the feed', () => {
		expect(r(tag('Paragraph', {}, ['a < b && c > d']))).toBe('<p>a &lt; b &amp;&amp; c &gt; d</p>');
	});
	it('escapes attribute values', () => {
		expect(r(tag('Link', { href: '/p?a=1&b="2"' }, ['x']))).toContain(
			'href="https://docs.example.com/p?a=1&amp;b=&quot;2&quot;"'
		);
	});
});
