<script lang="ts">
	// {% columns %} {% column %} … {% /column %} {% column %} … {% /column %} {% /columns %}
	// Side-by-side equal-width columns that stack on small screens, capped
	// at three across — a 4th wraps to the next row (use {% grid %} for
	// denser / spanning layouts). The cells are <Column>, which basis at a
	// third so 2 columns fill 50/50, 3 fill in thirds, and 4+ wrap.
	let { children }: { children?: import('svelte').Snippet } = $props();
</script>

<div class="my-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
	{@render children?.()}
</div>
