<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { cn } from '$lib/utils';
	import { subtreeHasHref, type NavNode } from '$lib/nav';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Self from './nav-node.svelte';

	// One node in the sidebar tree, used below a top-level section heading.
	// Three shapes:
	//   - a page: a plain link;
	//   - a sub-section *with* an index.md (has both href and items): a
	//     chevron that toggles + a label that links to the index page;
	//   - a sub-section *without* an index (items only): the whole row
	//     toggles, as before.
	// Sub-sections are shadcn-svelte Collapsibles (bits-ui) — height
	// animation + a11y — recursing via a self-import for their children.

	type Props = { node: NavNode; depth: number };
	const { node, depth }: Props = $props();

	const pathname = $derived(page.url.pathname.replace(base, '') || '/');
	const isPage = $derived(!!node.href && !node.items);

	// Open when the active page is this section's own index, or lives inside
	// it — until the reader toggles by hand, then their choice sticks.
	let userToggled = $state<boolean | null>(null);
	const containsActive = $derived(
		node.href === pathname || (!!node.items && subtreeHasHref(node.items, pathname))
	);
	const open = $derived(userToggled ?? containsActive);

	function linkClass(active: boolean): string {
		return cn(
			'block rounded-md px-2 py-1.5 transition-colors',
			active
				? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
				: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
		);
	}
</script>

{#if isPage}
	<li>
		<a
			href={`${base}${node.href ?? ''}`}
			data-active={pathname === node.href}
			class={linkClass(pathname === node.href)}
		>
			{node.label ?? node.title}
		</a>
	</li>
{:else}
	<li>
		<Collapsible.Root {open} onOpenChange={(v) => (userToggled = v)}>
			<div class="flex w-full items-center">
				<Collapsible.Trigger
					aria-label="Toggle section"
					class="flex size-7 shrink-0 items-center justify-center rounded-md text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
				>
					<ChevronRight
						class={cn(
							'size-3.5 text-muted-foreground transition-transform',
							open && 'rotate-90'
						)}
					/>
				</Collapsible.Trigger>
				{#if node.href}
					<a
						href={`${base}${node.href}`}
						data-active={pathname === node.href}
						class={cn('min-w-0 flex-1 truncate font-medium', linkClass(pathname === node.href))}
					>
						{node.label ?? node.title}
					</a>
				{:else}
					<Collapsible.Trigger
						class="min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-left font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
					>
						{node.label ?? node.title}
					</Collapsible.Trigger>
				{/if}
			</div>
			<Collapsible.Content
				class="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
			>
				<ul class="ml-3 mt-0.5 space-y-0.5 border-l border-sidebar-border pl-2">
					{#each node.items ?? [] as child (child.href ?? child.title)}
						<Self node={child} depth={depth + 1} />
					{/each}
				</ul>
			</Collapsible.Content>
		</Collapsible.Root>
	</li>
{/if}
