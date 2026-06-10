<script lang="ts">
	// End-of-page footnote list, emitted by the footnote source pass.
	let { children }: { children?: import('svelte').Snippet } = $props();
</script>

<section class="od-footnotes not-prose mt-10 border-t border-border pt-4" data-pagefind-ignore>
	<ol class="ml-5 list-decimal space-y-1">
		{@render children?.()}
	</ol>
</section>

<style>
	/* The pass wraps each definition's text in a paragraph; keep it inline
	   with the backlink. Fully :global — children arrive via snippets. */
	:global(.od-footnotes li > p) {
		display: inline;
	}
</style>
