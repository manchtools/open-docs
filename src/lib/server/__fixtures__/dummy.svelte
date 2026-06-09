<script lang="ts">
	// Test fixture component for markdoc-schema tests.
	let { children }: { children?: import('svelte').Snippet } = $props();
</script>

{@render children?.()}
