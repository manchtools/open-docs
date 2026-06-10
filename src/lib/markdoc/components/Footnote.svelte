<script lang="ts">
	// One footnote definition at the end of the page; emitted by the
	// footnote source pass from a GFM `[^id]: text` line.
	let { id, n, children }: { id: string; n: number; children?: import('svelte').Snippet } =
		$props();
</script>

<li id={`fn-${id}`} value={n} class="text-sm text-muted-foreground">
	{@render children?.()}
	<a href={`#fnref-${id}`} class="no-underline" aria-label="↩">↩</a>
</li>
