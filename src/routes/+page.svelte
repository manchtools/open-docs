<script lang="ts">
	import { base } from '$app/paths';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import { siteConfig } from '$lib/config';
	import { nav } from '$lib/nav';

	// Landing page. If the operator authored `src/content/index.md`
	// (or `introduction.md`) we let the [...slug] route render that;
	// this hero only renders for first-time visitors when no
	// landing-markdown exists yet.
	//
	// The card grid below is built from the first item of each nav
	// group, so it stays in sync with the sidebar without a second
	// hand-curated list.
	const groupCards = nav
		.filter((g) => g.title && g.items.length > 0)
		.map((g) => ({
			title: g.title,
			description: `${g.items.length} ${g.items.length === 1 ? 'page' : 'pages'}`,
			href: g.items[0].href
		}));
</script>

<svelte:head>
	<title>{siteConfig.siteTitle}</title>
</svelte:head>

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
							<BookOpen class="size-6 text-primary" />
							<CardTitle class="mt-2 text-base">{g.title}</CardTitle>
							<CardDescription>{g.description}</CardDescription>
						</CardHeader>
					</Card>
				</a>
			{/each}
		</section>
	{/if}
</div>
