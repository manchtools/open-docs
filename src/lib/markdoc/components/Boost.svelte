<script lang="ts">
	// {% boost weight=5 %} … {% /boost %}
	//
	// Pushes the wrapped content harder in search by tagging it with a
	// Pagefind weight. Plain body text is weight 1 and headings are 10/5/3,
	// so a `weight` of 5 makes a passage count like a subheading. The
	// content renders completely unchanged — this is an invisible search
	// hint, for the rare case where the global ranking and heading weights
	// aren't enough to surface a key definition or summary.
	//
	// `display: contents` (the `contents` class) keeps the wrapper out of
	// the layout; Pagefind reads the weight from the static HTML regardless.
	// docref: begin props
	let { weight = 5, children }: { weight?: number; children?: import('svelte').Snippet } = $props();
	// docref: end props
</script>

<div class="contents" data-pagefind-weight={weight}>
	{@render children?.()}
</div>
