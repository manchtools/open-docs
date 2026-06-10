<script lang="ts" module>
	// Recursive renderer for a (plain-JSON) Markdoc render tree — the 0.4.0
	// replacement for compiling each page into its own Svelte module. The
	// component map is built from the SAME registries the old pipeline used
	// (tags.svelte / nodes.svelte): a Tag whose name matches a registry
	// export renders that component (attributes → props, children → the
	// implicit snippet); anything else renders as a plain HTML element via
	// <svelte:element>. Strings/numbers are text; null/undefined render
	// nothing. Works in SSR and in the client, so hydration and
	// interactivity (tabs, accordions, copy buttons) behave exactly as
	// before.
	import type { Component } from 'svelte';
	import * as Tags from './tags.svelte';
	import * as Nodes from './nodes.svelte';

	const components: Record<string, Component> = Object.fromEntries(
		[...Object.entries(Tags), ...Object.entries(Nodes)].filter(([k]) => k !== 'default')
	) as Record<string, Component>;

	export type TreeNode =
		| string
		| number
		| boolean
		| null
		| undefined
		| TreeNode[]
		| { name: string; attributes?: Record<string, unknown>; children?: TreeNode[] };
</script>

<script lang="ts">
	import Self from './MarkdocTree.svelte';

	let { node }: { node: TreeNode } = $props();
</script>

{#if Array.isArray(node)}
	{#each node as child, i (i)}
		<Self node={child} />
	{/each}
{:else if typeof node === 'string' || typeof node === 'number'}
	{node}
{:else if node && typeof node === 'object' && 'name' in node}
	{#if components[node.name]}
		{@const Tag = components[node.name]}
		{#if node.children?.length}
			<Tag {...node.attributes}>
				<Self node={node.children} />
			</Tag>
		{:else}
			<Tag {...node.attributes} />
		{/if}
	{:else if node.children?.length}
		<svelte:element this={node.name} {...node.attributes}>
			<Self node={node.children} />
		</svelte:element>
	{:else}
		<!-- childless elements render self-closed: void elements (input,
		     hr, br) may not carry a content template at all -->
		<svelte:element this={node.name} {...node.attributes} />
	{/if}
{/if}
