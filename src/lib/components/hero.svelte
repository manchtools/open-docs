<script lang="ts">
	import { base } from '$app/paths';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import { siteConfig } from '$lib/config';
	import { navByLang, type NavNode } from '$lib/nav';

	// Landing-page hero, rendered at `/` (default language) and at the bare
	// language path `/<lang>` for each other language. The card grid is
	// built from the language's nav so it stays in sync with the sidebar
	// and uses translated section titles. Brand text comes from siteConfig
	// (site-level, not per-language).
	let { lang }: { lang: string } = $props();

	function countPages(nodes: NavNode[] = []): number {
		return nodes.reduce((n, x) => n + (x.href ? 1 : 0) + countPages(x.items), 0);
	}
	function firstHref(nodes: NavNode[] = []): string | undefined {
		for (const x of nodes) {
			if (x.href) return x.href;
			const nested = firstHref(x.items);
			if (nested) return nested;
		}
		return undefined;
	}

	const groupCards = $derived(
		navByLang(lang)
			.filter((g) => g.title && (g.items?.length ?? 0) > 0)
			.map((g) => {
				const pages = countPages(g.items);
				return {
					title: g.title,
					description: `${pages} ${pages === 1 ? 'page' : 'pages'}`,
					href: firstHref(g.items) ?? '/',
					icon: g.icon
				};
			})
	);

	// A section icon (from its index.md `icon:` frontmatter) can be an
	// emoji, an inline `<svg>…</svg>`, or a path under static/. Classify it
	// so the card renders the right element; no icon falls back to the
	// default book glyph. Inline SVG is author-controlled, so rendering it
	// raw is fine.
	function iconKind(icon?: string): 'svg' | 'img' | 'emoji' | 'none' {
		const t = icon?.trim();
		if (!t) return 'none';
		if (t.startsWith('<svg')) return 'svg';
		if (t.startsWith('/') || t.startsWith('http')) return 'img';
		return 'emoji';
	}
</script>

<div class="px-6 py-12 lg:py-16 xl:px-12">
	<section class="max-w-3xl">
		<p class="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
			{siteConfig.brandTagline || 'Documentation'}
		</p>
		<h1 class="text-4xl font-bold tracking-tight md:text-5xl">
			{siteConfig.siteTitle}
		</h1>
		<p class="mt-6 text-lg leading-relaxed text-muted-foreground">
			{siteConfig.siteDescription}
		</p>
		{#if groupCards.length > 0}
			<div class="mt-8 flex flex-wrap gap-3">
				<Button href={base + groupCards[0].href}>
					Get started
					<ArrowRight class="ml-2 size-4" />
				</Button>
				{#if siteConfig.repoUrl}
					<Button variant="outline" href={siteConfig.repoUrl}>View source</Button>
				{/if}
			</div>
		{/if}
	</section>

	{#if groupCards.length > 0}
		<section class="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each groupCards as g (g.href)}
				<a href={base + g.href} class="block transition-transform hover:-translate-y-0.5">
					<Card class="h-full">
						<CardHeader>
							{#if iconKind(g.icon) === 'svg'}
								<!-- eslint-disable-next-line svelte/no-at-html-tags -->
								<span class="block size-6 text-primary [&>svg]:size-6">{@html g.icon}</span>
							{:else if iconKind(g.icon) === 'img'}
								<img
									src={g.icon?.startsWith('/') ? base + g.icon : g.icon}
									alt=""
									class="size-6 object-contain"
								/>
							{:else if iconKind(g.icon) === 'emoji'}
								<span class="text-2xl leading-none" aria-hidden="true">{g.icon}</span>
							{:else}
								<BookOpen class="size-6 text-primary" />
							{/if}
							<CardTitle class="mt-2 text-base">{g.title}</CardTitle>
							<CardDescription>{g.description}</CardDescription>
						</CardHeader>
					</Card>
				</a>
			{/each}
		</section>
	{/if}
</div>
