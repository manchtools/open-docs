<script lang="ts">
	// {% filetree %} <a nested markdown list> {% /filetree %}
	//
	// Styles a normal nested Markdown list as a directory tree. No data
	// format to learn: an item that contains a nested list is shown as a
	// folder, a leaf as a file — detected purely with the CSS `:has()`
	// selector, so there's no per-item markup to author.
	// docref: begin props
	let { children }: { children?: import('svelte').Snippet } = $props();
	// docref: end props
</script>

<div class="filetree not-prose my-6 rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-sm">
	{@render children?.()}
</div>

<style>
	.filetree :global(ul) {
		margin: 0;
		padding-left: 1.1rem;
		list-style: none;
	}
	.filetree > :global(ul) {
		padding-left: 0;
	}
	.filetree :global(ul ul) {
		border-left: 1px solid var(--border);
	}
	.filetree :global(li) {
		padding: 0.12rem 0;
	}
	/* Folder vs file glyph, chosen by whether the item nests a list. */
	.filetree :global(li)::before {
		margin-right: 0.45rem;
	}
	.filetree :global(li:has(> ul))::before {
		content: '📁';
	}
	.filetree :global(li:not(:has(> ul)))::before {
		content: '📄';
	}
</style>
