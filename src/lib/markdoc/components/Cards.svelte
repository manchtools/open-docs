<script lang="ts">
	// {% cards %} {% card title="..." href="..." icon="..." %} … {% /card %} … {% /cards %}
	// Responsive card grid for link/overview tiles.
	// docref: begin props
	let { children }: { children?: import('svelte').Snippet } = $props();
	// docref: end props
</script>

<div class="my-6 grid gap-4 sm:grid-cols-2">
	{@render children?.()}
</div>
