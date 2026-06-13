<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import { t } from '$lib/ui-strings';
	import type { NavNode } from '$lib/nav-core';
	import type { SiteConfig } from '$lib/site';

	// Landing-page hero, rendered at `/` (default language) and at the bare
	// language path `/<lang>`. The card grid comes from the language's nav
	// (already localized by the layout load) so it stays in sync with the
	// sidebar; brand text comes from the runtime site config.
	let { lang }: { lang: string } = $props();

	const site = $derived(page.data.site as SiteConfig);
	const nav = $derived((page.data.nav as NavNode[]) ?? []);

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
		nav
			.filter((g) => g.title && (g.items?.length ?? 0) > 0)
			.map((g) => {
				const pages = countPages(g.items);
				return {
					title: g.title,
					description: `${pages} ${t(lang, pages === 1 ? 'page' : 'pages')}`,
					href: firstHref(g.items) ?? '/',
					icon: g.icon
				};
			})
	);

	// A section icon (from its index.md `icon:` frontmatter) can be an
	// emoji, an inline `<svg>…</svg>`, or a path under static/. Classify it
	// so the card renders the right element; no icon falls back to the
	// default book glyph. Inline SVG is author-controlled and rendered via
	// {@html}, so it is validated fail-closed at content ingestion against a
	// strict safe-presentation allow-list (see server/svg-icon.ts) — only an
	// already-validated icon ever reaches this render.
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
			{site.brandTagline || 'Documentation'}
		</p>
		<h1 class="text-4xl font-bold tracking-tight md:text-5xl">
			{site.siteTitle}
		</h1>
		<p class="mt-6 text-lg leading-relaxed text-muted-foreground">
			{site.siteDescription}
		</p>
		{#if groupCards.length > 0}
			<div class="mt-8 flex flex-wrap gap-3">
				<Button href={base + groupCards[0].href}>
					{t(lang, 'getStarted')}
					<ArrowRight class="ml-2 size-4" />
				</Button>
				{#if site.repoUrl}
					<Button variant="outline" href={site.repoUrl}>{t(lang, 'viewSource')}</Button>
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
