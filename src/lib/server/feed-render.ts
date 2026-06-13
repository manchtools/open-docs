// Feed render profile — a second render target for the SAME Markdoc AST the
// page renders from. It walks the transformed render tree (the JSON node
// tree produced by Markdoc.transform and stored on every page) and emits
// clean, self-contained, reader-facing HTML for feed readers and
// HTML→Markdown importers (dev.to/Forem, Medium).
//
// Why render from the AST rather than scrape the page HTML: the page's UI
// chrome — heading copy-link anchors and their inline Lucide <svg>s,
// `data-pagefind-*` weights, the outer layout <article>, lightbox/zoom JS
// hooks, window chrome on screenshots — is added by the SVELTE COMPONENTS at
// render time. None of it lives in the AST. So a renderer that walks the AST
// produces clean body HTML by construction, with no string-stripping.
//
// Interactive / JS-dependent blocks degrade to static equivalents (feed
// readers run no JS): galleries become a plain sequence of <figure>, hero /
// avatar / screenshot become a plain <img> with alt (no browser chrome),
// quotes become <blockquote><cite>, mermaid fences become a labelled code
// block (open-docs renders mermaid client-side, so no prerendered SVG
// exists — the source is the honest static fallback).
//
// Every URL is made absolute against PUBLIC_SITE_URL (+ BASE_PATH). Internal
// links arrive already resolved to site-absolute permalinks (the content
// store resolves ./x.md / ../y.md#frag at tree-build time), so this only
// prepends the origin; when PUBLIC_SITE_URL is unset the output stays
// relative (the boot path warns it is not syndication-ready).

import type { RenderableTreeNode } from '@markdoc/markdoc';

export type FeedRenderContext = {
	/** Absolute origin from PUBLIC_SITE_URL, no trailing slash, '' if unset. */
	siteUrl: string;
	/** BASE_PATH (leading slash or ''), no trailing slash. */
	basePath: string;
};

// HTML void elements — emitted self-closed, never given a content body.
const VOID = new Set(['img', 'br', 'hr', 'input', 'source', 'col', 'wbr']);

// The only attributes carried through to passthrough HTML elements. Anything
// else — class, style, `data-*` (incl. data-pagefind-*), `on*`, aria hooks —
// is UI/build chrome and is dropped.
const KEEP_ATTR = new Set([
	'href', 'src', 'alt', 'title', 'id', 'colspan', 'rowspan', 'start',
	'type', 'checked', 'disabled', 'datetime', 'cite', 'value', 'lang'
]);

// Layout/wrapper components with no semantic feed equivalent: render their
// children, drop the wrapper. (Tabs/Steps/Cards/etc. are visual scaffolding;
// their content is what the reader wants.)
const UNWRAP = new Set([
	'Tabs', 'Tab', 'Steps', 'Step', 'Cards', 'Card', 'Accordions', 'Accordion',
	'FileTree', 'Boost', 'Columns', 'Column', 'Grid'
]);

const esc = (s: string): string =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s: string): string => esc(s).replace(/"/g, '&quot;');

export function renderFeedHtml(tree: RenderableTreeNode, ctx: FeedRenderContext): string {
	const scheme = (u: string) => /^[a-z][a-z0-9+.-]*:/i.test(u) || u.startsWith('//');
	const root = (path: string) => `${ctx.siteUrl}${ctx.basePath}${path}`;

	// A site-root path becomes `${origin}${base}${path}`; schemes, anchors and
	// protocol-relative URLs pass through. Relative-but-not-rooted refs are
	// left as-is (the store already rooted internal links/images).
	const absLink = (href: string): string => {
		if (!href) return '';
		if (scheme(href) || href.startsWith('#')) return href;
		return href.startsWith('/') ? root(href) : href;
	};
	// {% screenshot %} src rule (matches Screenshot.svelte): a bare name is a
	// /screenshots/ asset; a rooted path or web URL passes through.
	const absScreenshot = (src: string): string => {
		if (!src) return '';
		if (scheme(src)) return src;
		return root(src.startsWith('/') ? src : `/screenshots/${src}`);
	};
	// {% hero %} / {% avatar %} src rule (matches those components): a bare
	// name is root-relative, NOT under /screenshots/.
	const absAsset = (src: string): string => {
		if (!src) return '';
		if (scheme(src)) return src;
		return root(src.startsWith('/') ? src : `/${src}`);
	};

	const figure = (src: string, alt: string, caption?: string): string =>
		src
			? `<figure><img src="${escAttr(src)}" alt="${escAttr(alt)}" />${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`
			: '';

	const attrStr = (a: Record<string, unknown>): string => {
		let out = '';
		for (const [k, v] of Object.entries(a)) {
			if (!KEEP_ATTR.has(k) || v == null || v === false) continue;
			if (k === 'href') { out += ` href="${escAttr(absLink(String(v)))}"`; continue; }
			if (k === 'src') { out += ` src="${escAttr(absAsset(String(v)))}"`; continue; }
			if (v === true) { out += ` ${k}`; continue; }
			out += ` ${k}="${escAttr(String(v))}"`;
		}
		return out;
	};

	const str = (v: unknown): string => (v == null ? '' : String(v));

	const render = (n: RenderableTreeNode | RenderableTreeNode[]): string => {
		if (n == null || typeof n === 'boolean') return '';
		if (Array.isArray(n)) return n.map(render).join('');
		if (typeof n === 'string') return esc(n);
		if (typeof n === 'number') return esc(String(n));
		if (typeof n !== 'object' || !('name' in n)) return '';
		const node = n as { name: string; attributes?: Record<string, unknown>; children?: RenderableTreeNode[] };
		const name = node.name;
		const a = node.attributes ?? {};
		const kids = node.children ?? [];

		switch (name) {
			// --- markdown nodes (component-named in the tree) -----------------
			case 'Heading': {
				// Plain heading: NO copy-link anchor, NO inline icon (those are
				// component chrome, absent from the AST). The id stays so intra-
				// article fragment links still resolve. Trim: the source heading
				// carries a trailing space where the anchor link used to sit.
				const lvl = Math.min(6, Math.max(1, Number(a.level) || 1));
				const id = a.id ? ` id="${escAttr(str(a.id))}"` : '';
				return `<h${lvl}${id}>${render(kids).trim()}</h${lvl}>`;
			}
			case 'Paragraph':
				return `<p>${render(kids)}</p>`;
			case 'Link':
				return `<a href="${escAttr(absLink(str(a.href)))}">${render(kids)}</a>`;
			case 'Fence':
			case 'CodeBlock': {
				// Mermaid included: client-rendered on the page, so the static
				// feed gets the labelled source as a code block.
				const lang = str(a.language);
				const cls = lang ? ` class="language-${escAttr(lang)}"` : '';
				return `<pre><code${cls}>${esc(str(a.content))}</code></pre>`;
			}
			case 'Table': return `<table>${render(kids)}</table>`;
			case 'Thead': return `<thead>${render(kids)}</thead>`;
			case 'Tbody': return `<tbody>${render(kids)}</tbody>`;
			case 'Tr': return `<tr>${render(kids)}</tr>`;
			case 'Th': return `<th>${render(kids)}</th>`;
			case 'Td': return `<td>${render(kids)}</td>`;

			// --- blog blocks → static reader-facing equivalents ---------------
			case 'Screenshot':
				return figure(absScreenshot(str(a.src)), str(a.alt), a.caption ? str(a.caption) : undefined);
			case 'Hero':
				// Plain image, drop the window chrome / title overlay.
				return figure(absAsset(str(a.src)), str(a.alt) || str(a.title));
			case 'Avatar': {
				const img = a.src ? `<img src="${escAttr(absAsset(str(a.src)))}" alt="${escAttr(str(a.name))}" />` : '';
				const nm = a.name
					? a.url
						? `<a href="${escAttr(absLink(str(a.url)))}">${esc(str(a.name))}</a>`
						: `<strong>${esc(str(a.name))}</strong>`
					: '';
				const desc = a.description ? ` — ${esc(str(a.description))}` : '';
				return img || nm ? `<p>${img}${nm}${desc}</p>` : '';
			}
			case 'Quote': {
				const cite = a.by
					? `<cite>${a.cite ? `<a href="${escAttr(absLink(str(a.cite)))}">${esc(str(a.by))}</a>` : esc(str(a.by))}</cite>`
					: '';
				return `<blockquote>${render(kids)}${cite}</blockquote>`;
			}
			case 'Gallery':
				// Plain sequence of figures, no lightbox/grid.
				return render(kids);
			case 'Callout':
				return `<blockquote>${a.title ? `<p><strong>${esc(str(a.title))}</strong></p>` : ''}${render(kids)}</blockquote>`;
			case 'Embed': {
				// No iframes in feeds — degrade to a link to the source.
				const u = str(a.src) || str(a.url);
				return u ? `<p><a href="${escAttr(absLink(u))}">${esc(u)}</a></p>` : '';
			}
			case 'Code':
				return `<code>${render(kids)}</code>`;
			case 'Badge':
				return `<strong>${render(kids)}</strong>`;
			case 'FootnoteRef': {
				const id = escAttr(str(a.id));
				return `<sup id="fnref-${id}"><a href="#fn-${id}">${esc(str(a.n))}</a></sup>`;
			}
			case 'Footnotes':
				return `<section class="footnotes"><ol>${render(kids)}</ol></section>`;
			case 'Footnote':
				return `<li id="fn-${escAttr(str(a.id))}">${render(kids)}</li>`;

			// --- the document wrapper: drop it, emit only the body ------------
			case 'article':
				return render(kids);
		}

		if (UNWRAP.has(name)) return render(kids);

		// Passthrough for plain HTML elements (ul, ol, li, strong, em,
		// blockquote, code, hr, br, input, sup, sub, del, …) with chrome
		// attributes stripped.
		if (/^[a-z]/.test(name)) {
			if (VOID.has(name)) return `<${name}${attrStr(a)} />`;
			return `<${name}${attrStr(a)}>${render(kids)}</${name}>`;
		}

		// Any other component (capitalised, not mapped above): unwrap to its
		// content rather than emit an invalid custom-element tag.
		return render(kids);
	};

	// The entry <title> already carries the article's headline, so a leading
	// top-level <h1> in the body renders as a doubled headline in dev.to and
	// most readers. Drop it (only the first body block, only when it's an h1).
	const stripLeadingH1 = (nodes: RenderableTreeNode[]): RenderableTreeNode[] => {
		const out = nodes.slice();
		for (let i = 0; i < out.length; i++) {
			const n = out[i];
			if (n == null || (typeof n === 'string' && n.trim() === '')) continue;
			if (
				typeof n === 'object' &&
				!Array.isArray(n) &&
				(n as { name?: string }).name === 'Heading' &&
				Number((n as { attributes?: { level?: unknown } }).attributes?.level) === 1
			) {
				out.splice(i, 1);
			}
			break; // only the first real block is the candidate title
		}
		return out;
	};

	let start: RenderableTreeNode | RenderableTreeNode[] = tree;
	if (start && typeof start === 'object' && !Array.isArray(start) && (start as { name?: string }).name === 'article') {
		const doc = start as { children?: RenderableTreeNode[] };
		start = { ...doc, children: stripLeadingH1(doc.children ?? []) } as RenderableTreeNode;
	} else if (Array.isArray(start)) {
		start = stripLeadingH1(start);
	}
	return render(start);
}
