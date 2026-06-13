import { getStore } from '$lib/server/store-instance';
import { siteConfig } from '$lib/server/site';
import { mdEscapeText, mdEscapeUrl } from '$lib/server/md-escape';
import type { NavNode } from '$lib/nav-core';

// llms.txt (https://llmstxt.org): a compact, link-first index of the docs
// for AI assistants — title, one-line summary, then every page grouped by
// section with its description. Derived from the runtime store, so it can
// never drift from the content.
function leaves(nodes: NavNode[]): { title: string; href: string }[] {
	const out: { title: string; href: string }[] = [];
	for (const n of nodes) {
		if (n.href) out.push({ title: n.title, href: n.href });
		if (n.items) out.push(...leaves(n.items));
	}
	return out;
}

export function GET() {
	const store = getStore();
	const site = siteConfig();
	const origin = site.siteUrl;
	const url = (href: string) => `${origin}${href === '/' ? '/' : href}`;
	const line = (p: { title: string; href: string }) => {
		const d = store.pageMetaFor(store.defaultLang, p.href.replace(/^\//, '')).description;
		// Escape so a title/description bracket or a parenthesised slug can't
		// break out of the `[label](url)` link syntax.
		return `- [${mdEscapeText(p.title)}](${mdEscapeUrl(url(p.href))})${d ? `: ${mdEscapeText(d)}` : ''}`;
	};

	let out = `# ${site.siteTitle}\n\n> ${site.siteDescription}\n`;
	for (const group of store.navByLang(store.defaultLang)) {
		const items = group.href
			? [{ title: group.title, href: group.href }, ...leaves(group.items ?? [])]
			: leaves(group.items ?? []);
		const filtered = items.filter((i) => i.href !== '/');
		if (!filtered.length) continue;
		out += `\n## ${group.title || 'Pages'}\n\n${filtered.map(line).join('\n')}\n`;
	}
	const meta = store.metaPagesFor(store.defaultLang);
	if (meta.length) out += `\n## Other\n\n${meta.map(line).join('\n')}\n`;

	return new Response(out, {
		headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-cache' }
	});
}
