import { siteConfig } from '$lib/config';
import { nav, metaPages, pageMeta, type NavNode } from '$lib/nav';

// Prerendered llms.txt (https://llmstxt.org): a compact, link-first index
// of the docs for AI assistants and crawlers. An H1 title, a one-line
// blockquote summary, then one section per top-level nav group listing each
// page as `- [title](url): description`. Built from the same nav tree and
// frontmatter the site itself uses, so it never drifts from the content.
export const prerender = true;

function leaves(nodes: NavNode[]): { title: string; href: string }[] {
	const out: { title: string; href: string }[] = [];
	for (const n of nodes) {
		if (n.href) out.push({ title: n.title, href: n.href });
		if (n.items) out.push(...leaves(n.items));
	}
	return out;
}

export function GET() {
	const origin = siteConfig.siteUrl;
	const url = (href: string) => `${origin}${href === '/' ? '/' : href}`;
	const line = (p: { title: string; href: string }) => {
		const d = pageMeta[p.href.replace(/^\//, '')]?.description;
		return `- [${p.title}](${url(p.href)})${d ? `: ${d}` : ''}`;
	};

	let out = `# ${siteConfig.siteTitle}\n\n> ${siteConfig.siteDescription}\n`;
	for (const group of nav) {
		const items = group.href
			? [{ title: group.title, href: group.href }, ...leaves(group.items ?? [])]
			: leaves(group.items ?? []);
		const filtered = items.filter((i) => i.href !== '/'); // landing is implied by the title
		if (!filtered.length) continue;
		out += `\n## ${group.title || 'Pages'}\n\n${filtered.map(line).join('\n')}\n`;
	}
	if (metaPages.length) {
		out += `\n## Other\n\n${metaPages.map(line).join('\n')}\n`;
	}

	return new Response(out, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
}
