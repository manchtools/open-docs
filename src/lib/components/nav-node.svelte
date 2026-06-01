<script lang="ts">
	import { page } from '$app/state';
	import { base } from '$app/paths';
	import { cn } from '$lib/utils';
	import { subtreeHasHref, type NavNode } from '$lib/nav';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Self from './nav-node.svelte';

	// One node in the sidebar tree, used below a top-level section heading.
	// A page renders as a link; a sub-section renders as a shadcn-svelte
	// Collapsible (bits-ui) — smooth height animation + a11y — recursing via
	// a self-import for its children.

	type Props = { node: NavNode; depth: number };
	const { node, depth }: Props = $props();

	const pathname = $derived(page.url.pathname.replace(base, '') || '/');
	const isPage = $derived(!!node.href && !node.items);

	// Open when the active page lives inside, until the reader toggles it by
	// hand — then their choice sticks. Controlled, so it also opens the
	// active branch on first paint (SSR) without a reactivity trap.
	let userToggled = $state<boolean | null>(null);
	const containsActive = $derived(!!node.items && subtreeHasHref(node.items, pathname));
	const open = $derived(userToggled ?? containsActive);
</script>

{#if isPage}
	<li>
		<a
			href={`${base}${node.href ?? ''}`}
			data-active={pathname === node.href}
			class={cn(
				'block rounded-md px-2 py-1.5 transition-colors',
				pathname === node.href
					? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
					: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
			)}
		>
			{node.label ?? node.title}
		</a>
	</li>
{:else}
	<li>
		<Collapsible.Root {open} onOpenChange={(v) => (userToggled = v)}>
			<Collapsible.Trigger
				class="flex w-full items-center gap-1 rounded-md px-2 py-1.5 text-left font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
			>
				<ChevronRight
					class={cn(
						'size-3.5 shrink-0 text-muted-foreground transition-transform',
						open && 'rotate-90'
					)}
				/>
				<span class="min-w-0 flex-1 truncate">{node.label ?? node.title}</span>
			</Collapsible.Trigger>
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
