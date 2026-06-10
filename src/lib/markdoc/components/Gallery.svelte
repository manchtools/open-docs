<script lang="ts">
	// {% gallery %} ![a](/img/a.png) ![b](/img/b.png) … {% /gallery %}
	//
	// Responsive image grid. Children are plain Markdown images; the grid
	// styles them uniformly and the existing lightbox makes each one
	// click-to-zoom (it targets images inside <main> automatically).
	let { children }: { children?: import('svelte').Snippet } = $props();
</script>

<div class="od-gallery not-prose my-8 grid grid-cols-2 gap-3 md:grid-cols-3">
	{@render children?.()}
</div>

<style>
	/* Markdoc wraps the images in <p>s; flatten them so every image is a
	   grid cell. Fully :global — the children arrive via a snippet. */
	:global(.od-gallery p) {
		display: contents;
	}
	:global(.od-gallery img) {
		margin: 0;
		aspect-ratio: 4 / 3;
		width: 100%;
		border-radius: 0.5rem;
		border: 1px solid var(--border);
		object-fit: cover;
	}
</style>
