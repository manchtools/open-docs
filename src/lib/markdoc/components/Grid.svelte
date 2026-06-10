<script lang="ts">
	// {% grid cols=3 %} {% column %} … {% /column %} … {% /grid %}
	// A responsive CSS grid for laying content out in shapes other than a
	// single top-to-bottom column. `cols` (1–3, default 2) sets the track
	// count on sm+ screens; it collapses to a single column on mobile.
	// Capped at three across to match {% columns %}. Cells are <Column>; a
	// cell can span tracks with {% column span=2 %}.
	// docref: begin props
	let { cols = '2', children }: { cols?: string; children?: import('svelte').Snippet } = $props();
	// docref: end props

	// Clamp to 1–3; literal class strings so Tailwind's scanner emits them.
	const n = $derived(Math.min(3, Math.max(1, parseInt(cols, 10) || 2)));
	const colsClass = $derived(['', 'sm:grid-cols-1', 'sm:grid-cols-2', 'sm:grid-cols-3'][n]);
</script>

<div class={`my-6 grid grid-cols-1 gap-4 ${colsClass}`}>
	{@render children?.()}
</div>
