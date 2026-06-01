<script lang="ts">
	// {% embed src="https://youtu.be/..." title="..." /%}
	//
	// Responsive 16:9 iframe. YouTube/Vimeo watch URLs are normalised to
	// their privacy-friendly embed form by the shared helper — which
	// svelte.config.js also uses to derive the CSP `frame-src` from the
	// embeds in your content, so allowed hosts stay in sync automatically.
	import { toEmbedSrc } from '$lib/embed';

	let { src, title = 'Embedded content' }: { src: string; title?: string } = $props();

	const resolved = $derived(toEmbedSrc(src));
</script>

<div class="not-prose my-6 aspect-video overflow-hidden rounded-lg border border-border bg-muted/30">
	<iframe
		{title}
		src={resolved}
		class="size-full"
		loading="lazy"
		allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
		referrerpolicy="strict-origin-when-cross-origin"
		allowfullscreen
	></iframe>
</div>
