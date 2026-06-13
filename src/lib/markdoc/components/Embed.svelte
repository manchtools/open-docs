<script lang="ts">
	// {% embed src="https://youtu.be/..." title="..." /%}
	//
	// Responsive 16:9 iframe. YouTube/Vimeo watch URLs are normalised to
	// their privacy-friendly embed form by the shared helper — which
	// svelte.config.js also uses to derive the CSP `frame-src` from the
	// embeds in your content, so allowed hosts stay in sync automatically.
	import { toEmbedSrc } from '$lib/embed';
	import { safeHref } from '$lib/safe-url';

	// docref: begin props
	let { src, title = 'Embedded content' }: { src: string; title?: string } = $props();
	// docref: end props

	// '' when the URL isn't a safe http(s) embed (toEmbedSrc rejects other
	// schemes) — we then render a plain link instead of a live iframe.
	const resolved = $derived(toEmbedSrc(src));
	// Fallback link target: only when the src is itself a safe scheme (a
	// rejected embed could be `javascript:` — never make that clickable).
	const fallbackHref = $derived(safeHref(src));
</script>

{#if resolved}
	<div
		class="not-prose my-6 aspect-video overflow-hidden rounded-lg border border-border bg-muted/30"
	>
		<iframe
			{title}
			src={resolved}
			class="size-full"
			loading="lazy"
			sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
			allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
			referrerpolicy="strict-origin-when-cross-origin"
			allowfullscreen
		></iframe>
	</div>
{:else}
	<!-- Non-embeddable src (not an http(s) URL): a link, never a live frame —
	     and only when the src itself is a safe scheme, else just the title. -->
	<p class="my-6">
		{#if fallbackHref}
			<a
				href={fallbackHref}
				class="font-medium text-primary underline underline-offset-4 hover:text-primary/80"
				target="_blank"
				rel="noopener noreferrer nofollow">{title}</a
			>
		{:else}
			{title}
		{/if}
	</p>
{/if}
