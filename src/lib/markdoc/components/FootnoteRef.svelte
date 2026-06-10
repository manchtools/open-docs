<script lang="ts">
	// Inline footnote reference, emitted by the footnote source pass (see
	// src/lib/server/markdown.ts) — authors write GFM `[^id]`.
	let { n, id }: { n: number; id: string } = $props();
</script>

<sup class="od-fnref"
	><a href={`#fn-${id}`} id={`fnref-${id}`} class="no-underline">[{n}]</a></sup
>
