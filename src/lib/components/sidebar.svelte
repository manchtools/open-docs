<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { cn } from '$lib/utils';
	import { nav } from '$lib/nav';
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import NavNode from './nav-node.svelte';

	// Sidebar — left-side navigation, built from the nav tree in
	// $lib/nav. This component owns the top level: each first-level
	// section is a prominent uppercase eyebrow heading, with its pages
	// (and any collapsible sub-sections) indented beneath a faint
	// vertical guide line, so it's immediately clear which entries are
	// section headings and which are pages. The recursive NavNode
	// component handles everything below a heading — pages and the
	// collapsible sub-sections at levels 2 and 3.
	//
	// The empty-title top node, if present, holds ungrouped root pages
	// and renders flush, with no heading or guide.

	const pathname = $derived(page.url.pathname.replace(base, '') || '/');

	// Auto-scroll the active link into view when the route changes. The
	// active branch is expanded by NavNode, so its link is in the DOM by
	// the time this runs. `block: 'nearest'` only scrolls when the entry
	// is actually out of view, so visible ones aren't re-positioned.
	let navEl = $state<HTMLElement | null>(null);
	$effect(() => {
		pathname;
		if (!navEl) return;
		const active = navEl.querySelector<HTMLElement>('[data-active="true"]');
		active?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
	});
</script>

<ScrollArea class="h-full py-6 pr-2">
	<nav bind:this={navEl} class="space-y-6 px-4 text-sm">
		{#each nav as group (group.title)}
			<div>
				{#if group.title}
					{#if group.href}
						<a
							href={`${base}${group.href}`}
							data-active={pathname === group.href}
							class={cn(
								'mb-2 block rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors',
								pathname === group.href
									? 'bg-sidebar-accent text-sidebar-accent-foreground'
									: 'text-foreground hover:bg-sidebar-accent/50'
							)}
						>
							{group.title}
						</a>
					{:else}
						<h3
							class="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-foreground"
						>
							{group.title}
						</h3>
					{/if}
					<ul class="ml-2 space-y-0.5 border-l border-sidebar-border pl-2">
						{#each group.items ?? [] as child (child.href ?? child.title)}
							<NavNode node={child} depth={1} />
						{/each}
					</ul>
				{:else}
					<ul class="space-y-0.5">
						{#each group.items ?? [] as child (child.href ?? child.title)}
							<NavNode node={child} depth={1} />
						{/each}
					</ul>
				{/if}
			</div>
		{/each}
	</nav>
</ScrollArea>
