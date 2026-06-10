<script lang="ts">
	// {% code title="app.ts" %} ```ts … ``` {% /code %}
	//
	// Markdoc drops a fence's meta string (it keeps only the language), so
	// a filename header can't ride on the fence itself. This thin wrapper
	// supplies one: it renders a title bar and flattens the inner code
	// block's own border/radius/margin so the two read as a single unit.
	// docref: begin props
	let { title, children }: { title?: string; children?: import('svelte').Snippet } = $props();
	// docref: end props
</script>

<!-- The inner code block self-styles its padding/background (see
     CodeBlock.svelte), so `not-prose` here is safe — it just keeps the
     filename bar out of prose. We flatten the code block's own
     radius/margin so it merges cleanly under the bar. -->
<div class="not-prose my-6 overflow-hidden rounded-lg border border-border">
	{#if title}
		<div
			class="border-b border-border bg-muted/60 px-4 py-2 font-mono text-xs text-muted-foreground"
		>
			{title}
		</div>
	{/if}
	<div class="mdoc-code-title">
		{@render children?.()}
	</div>
</div>

<style>
	/* The inner code block self-styles its radius/margin/border in
	   CodeBlock.svelte with unlayered component rules that out-rank Tailwind
	   utilities (unlayered beats @layer), so the earlier `[&_pre]:rounded-none`
	   utilities lost and the code kept its rounded top — a notch under the
	   bar. Flatten it here so the code merges seamlessly under the filename
	   bar. Fully-:global() because the <pre> arrives via a snippet (not in
	   this component's template) and a scoped rule would be pruned. */
	:global(.mdoc-code-title pre) {
		margin: 0 !important;
		border: 0 !important;
		border-radius: 0 !important;
	}
</style>
