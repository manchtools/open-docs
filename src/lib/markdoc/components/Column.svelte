<script lang="ts">
	// A cell for {% columns %} and {% grid %}. In a flex {% columns %} it's
	// a column that bases at a third (so 2 fill 50/50, 3 fill in thirds, a
	// 4th wraps — i.e. at most three across); in a {% grid %} it's a grid
	// cell that can span N tracks via `span`. The flex sizing is ignored
	// inside a grid and the grid-column span is ignored inside flex, so the
	// same cell works in both. The flex props are sm-only so columns stack
	// cleanly on mobile. min-w-0 keeps wide content (tables, code) from
	// blowing the column out — it scrolls within instead.
	// `span` defaults to '' so the Markdoc preprocessor treats it as
	// optional (it marks any prop without a default as required).
	let { span = '', children }: { span?: string; children?: import('svelte').Snippet } = $props();
	const style = $derived(span ? `grid-column: span ${span} / span ${span};` : undefined);
</script>

<div
	class="min-w-0 sm:grow sm:shrink-0 sm:basis-[calc((100%_-_2rem)/3)] [&>:first-child]:mt-0 [&>:last-child]:mb-0"
	{style}
>
	{@render children?.()}
</div>
