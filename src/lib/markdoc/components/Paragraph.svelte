<script lang="ts">
	import { getContext } from 'svelte';
	import { MDOC_CELL } from './cell-context';

	// Override for Markdoc's built-in `paragraph` node. Normally renders a
	// plain <p> (the default). But inside a {% column %}/{% grid %} cell,
	// Markdoc still wraps a cell's block-level tag content (e.g. a callout,
	// which renders a <div>) in a paragraph. A <div> inside a <p> is invalid
	// HTML: SvelteKit emits node_invalid_placement_ssr errors, the browser
	// repairs it into stray empty <p> siblings (wasted vertical space), and
	// hydration can mismatch. So in a cell we render the content bare — the
	// block then sits directly in the flex cell and spacing is owned by the
	// cell's `gap` (see Column.svelte). Everywhere else: a normal <p>.
	let { children }: { children?: import('svelte').Snippet } = $props();
	const inCell = getContext(MDOC_CELL) === true;
</script>

{#if inCell}
	{@render children?.()}
{:else}
	<p>{@render children?.()}</p>
{/if}
