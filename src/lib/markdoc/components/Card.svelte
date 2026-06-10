<script lang="ts">
	import { base } from '$app/paths';
	import { Card, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';

	// {% card title="..." href="..." icon="..." %} description {% /card %}
	//
	// A card tile, built on shadcn-svelte's Card so content cards match the
	// homepage hero exactly. Optional `href` makes it a link (internal paths
	// are base-resolved, external open in a new tab); `icon` mirrors section
	// icons — emoji, inline <svg>, or a path under static/.
	// href/icon defaults keep those attributes OPTIONAL in the derived
	// Markdoc schema, per the reference docs; `title` stays required.
	// docref: begin props
	let {
		title,
		href = undefined,
		icon = undefined,
		children
	}: {
		title?: string;
		href?: string;
		icon?: string;
		children?: import('svelte').Snippet;
	} = $props();
	// docref: end props

	const isExternal = $derived(!!href && !href.startsWith('/'));
	const resolved = $derived(href ? (href.startsWith('/') ? base + href : href) : undefined);

	function iconKind(i?: string): 'svg' | 'img' | 'emoji' | 'none' {
		const t = i?.trim();
		if (!t) return 'none';
		if (t.startsWith('<svg')) return 'svg';
		if (t.startsWith('/') || t.startsWith('http')) return 'img';
		return 'emoji';
	}
</script>

{#snippet inner()}
	<Card class="h-full transition-colors group-hover:ring-primary/40">
		<CardHeader>
			{#if icon}
				{#if iconKind(icon) === 'svg'}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<span class="block size-6 text-primary [&>svg]:size-6">{@html icon}</span>
				{:else if iconKind(icon) === 'img'}
					<img src={icon?.startsWith('/') ? base + icon : icon} alt="" class="size-6 object-contain" />
				{:else}
					<span class="text-2xl leading-none" aria-hidden="true">{icon}</span>
				{/if}
			{/if}
			{#if title}<CardTitle class="mt-2 text-base">{title}</CardTitle>{/if}
			<CardDescription class="[&>:first-child]:mt-0 [&>:last-child]:mb-0">
				{@render children?.()}
			</CardDescription>
		</CardHeader>
	</Card>
{/snippet}

{#if resolved}
	<a
		href={resolved}
		target={isExternal ? '_blank' : undefined}
		rel={isExternal ? 'noopener noreferrer' : undefined}
		class="group block text-foreground no-underline transition-transform hover:-translate-y-0.5"
	>
		{@render inner()}
	</a>
{:else}
	{@render inner()}
{/if}
