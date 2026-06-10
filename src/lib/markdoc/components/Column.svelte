<script lang="ts">
	// A cell for {% columns %} and {% grid %}. In a flex {% columns %} it's
	// a column that bases at a third (so 2 fill 50/50, 3 fill in thirds, a
	// 4th wraps — i.e. at most three across); in a {% grid %} it's a grid
	// cell that can span N tracks via `span`. The flex sizing is ignored
	// inside a grid and the column span is ignored inside flex, so the same
	// cell works in both. Everything that arranges cells is sm-only so they
	// stack full-width on mobile — crucially the span too: an unconditional
	// `grid-column: span 2` on a mobile `grid-cols-1` grid would spill into
	// an implicit second track and leave the non-spanning cells half-width.
	// min-w-0 keeps wide content (tables, code) from blowing the cell out —
	// it scrolls within instead.
	// `span` defaults to '' so the Markdoc preprocessor treats it as
	// optional (it marks any prop without a default as required).
	import { setContext } from 'svelte';
	import { MDOC_CELL } from './cell-context';

	// docref: begin props
	let { span = '', children }: { span?: string; children?: import('svelte').Snippet } = $props();
	// docref: end props
	// Map span → a responsive col-span class (sm+ only). Literal strings so
	// Tailwind's scanner generates them. Cells are at most three across.
	const spanClass = $derived(
		({ '2': 'sm:col-span-2', '3': 'sm:col-span-3' } as Record<string, string>)[String(span)] ?? ''
	);

	// Tell the paragraph node override (Paragraph.svelte) it's inside a cell,
	// so a cell's block content (e.g. a callout) is rendered bare instead of
	// being wrapped in an invalid <div>-in-<p>. See Paragraph.svelte.
	setContext(MDOC_CELL, true);
</script>

<div
	class={`mdoc-cell flex min-w-0 flex-col gap-4 sm:grow sm:shrink-0 sm:basis-[calc((100%_-_2rem)/3)] ${spanClass}`}
>
	{@render children?.()}
</div>

<style>
	/* The paragraph override renders a cell's block content bare (no <p>
	   wrapper), so the real block (callout, image, …) is a direct flex child
	   here. Zero its own vertical margins — the flex `gap` above owns the
	   spacing, so a single block sits flush and multiple blocks are evenly
	   spaced. Fully-:global() because the children arrive via a snippet (not
	   in this component's template), so a scoped `.mdoc-cell > *` rule would
	   be pruned; the `!important` wins over the blocks' Tailwind margins
	   regardless of layer/source-order ties. */
	:global(.mdoc-cell > *) {
		margin-top: 0 !important;
		margin-bottom: 0 !important;
	}
</style>
