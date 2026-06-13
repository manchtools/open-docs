<script lang="ts">
	import { safeHref } from '$lib/safe-url';

	// {% quote by="Ada Lovelace" cite="https://…" %}body{% /quote %}
	//
	// Pull-quote: large italic body with a primary accent bar and an
	// optional attribution line (linked when `cite` is a URL).
	// docref: begin props
	let {
		by = undefined,
		cite = undefined,
		children
	}: {
		by?: string;
		cite?: string;
		children?: import('svelte').Snippet;
	} = $props();
	// docref: end props

	// Gate the citation link: an unsafe scheme yields undefined → the name
	// renders unlinked rather than as a clickable javascript: citation.
	const citeHref = $derived(safeHref(cite));
</script>

<figure class="od-quote not-prose my-8 border-l-4 border-primary pl-5">
	<blockquote class="text-lg font-medium italic leading-relaxed text-foreground/90">
		{@render children?.()}
	</blockquote>
	{#if by}
		<figcaption class="mt-2 text-sm text-muted-foreground">
			—
			{#if citeHref}
				<a href={citeHref} class="underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer">{by}</a>
			{:else}{by}{/if}
		</figcaption>
	{/if}
</figure>
