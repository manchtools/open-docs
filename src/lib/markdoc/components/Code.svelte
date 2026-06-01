<script lang="ts">
	// {% code title="app.ts" %} ```ts … ``` {% /code %}
	//
	// Markdoc drops a fence's meta string (it keeps only the language), so
	// a filename header can't ride on the fence itself. This thin wrapper
	// supplies one: it renders a title bar and flattens the inner code
	// block's own border/radius/margin so the two read as a single unit.
	let { title, children }: { title?: string; children?: import('svelte').Snippet } = $props();
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
	<div class="[&_.shiki]:rounded-none [&_pre]:my-0 [&_pre]:rounded-none [&_pre]:border-0">
		{@render children?.()}
	</div>
</div>
